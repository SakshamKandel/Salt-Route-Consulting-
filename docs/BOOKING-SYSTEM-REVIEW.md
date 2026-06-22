# Booking & Room Management — Expert Review

**Scope:** Booking system, room inventory, room categories (room types), and the booking lifecycle.
**Reviewed:** 2026-06-22
**Stack:** Next.js 16 (App Router) · Prisma · PostgreSQL (Neon)
**Reviewer perspective:** Hotel/PMS (Property Management System) architecture & booking-engine correctness.

---

## 1. Verdict

The **read-side** logic is genuinely well thought-out — it is quantity-aware (sums booked units per day vs `totalUnits`), server-authoritative on price, shares one availability engine across the guest and admin paths, and releases inventory implicitly by excluding terminal statuses.

**However, as a real hotel system it is not yet safe to operate on, because the integrity layer is incomplete:**

- **Double-booking is genuinely possible** — there is no row locking, no serializable isolation, and no database-level overlap constraint, so two concurrent requests for the last unit both pass the check and both insert.
- The **manual (admin) booking path is worse** — it checks availability and creates the booking as two separate, non-transactional statements.
- **Bulk admin actions bypass the state machine**, letting a cancelled booking be resurrected back into inventory.
- **Checkout day is treated as occupied**, silently killing same-day turnover (the most common booking pattern).
- Two divergent night-count formulas price the same stay differently across entry points, money math is done in floating point, and there is **no payment, rate-plan, timezone, or discrete-room model at all.**

> **Bottom line:** The bones are good and the math is mostly correct, but concurrency, state-machine enforcement, and turnover semantics must be fixed before this can run a property without overselling.

---

## 2. How the system works today

### 2.1 Inventory model — counts, not rooms
Inventory is an **integer counter**, not a set of identifiable rooms.

- `Property.totalUnits` (`schema.prisma:105`) and `RoomType.totalUnits` (`schema.prisma:133`) are plain capacity counters.
- There is **no `Room`/`Unit` entity** — a 30-room hotel is just `totalUnits = 30`. You cannot assign a guest to "Room 204", track housekeeping (clean / dirty / out-of-order), or close a single unit for maintenance.
- `Booking.units` (`schema.prisma:194`) is how many of the bucket a booking consumes. Inventory is **never physically decremented** — remaining capacity is recomputed at read time.

### 2.2 Room categories (`RoomType`)
- `RoomType` (`schema.prisma:128-154`) is the category: `name`, `classType`, `totalUnits`, `pricePerNight`, `maxGuests`, `bedrooms`, `bathrooms`, `active`, `order`.
- `RoomType.active` soft-disables a category, but availability/booking queries filter `active: true` — so **deactivating a category that has live bookings silently removes it from the capacity math.**

### 2.3 Bookings & the optional room type
- `Booking` references a `Property` (required), an **optional** `RoomType` (`roomTypeId String?`), a `units` count, `checkIn`/`checkOut`, and a denormalized `totalPrice Decimal(10,2)`.
- A `NULL` `roomTypeId` means a **whole-property** booking against `Property.totalUnits`. If the property has any active room type, `roomTypeId` is required (`route.ts:78-80`).
- ⚠️ **Cross-contamination:** a class-less booking is counted against **every** class at once (`room-availability.ts:75-78`) — one whole-property booking consumes a unit from class A *and* class B simultaneously.

### 2.4 Availability algorithm
- Dates normalized to UTC midnight; overlap is **inclusive on both ends** (`coversDay`, `room-availability.ts:21-23`) — a 10→14 stay "occupies 10, 11, 12, 13 and 14". **This treats the checkout day as an occupied night** (non-standard).
- Per-day capacity check: `taken (sum of overlapping units) + want > totalUnits → reject` (`room-availability.ts:87-108`).
- `ACTIVE_BOOKING_STATUSES = [PENDING, CONFIRMED, CHECKED_IN]` (`booking-lifecycle.ts:3`). **PENDING holds inventory**, with no expiry.
- A 36-hour buffer (`BUFFER_MS`) papers over historical timestamp inconsistencies.

### 2.5 Pricing
- Single nightly `Decimal(10,2)` on Property and RoomType. **No rate plans, seasonality, day-of-week, length-of-stay, taxes, fees, deposits, or payment records.**
- `totalPrice` recomputed server-side (good — client totals never trusted), but in **JS floating point** before landing in `Decimal` (`route.ts:101-102`), and the two paths use **different night formulas** (`Math.round` public vs `Math.ceil` manual).

### 2.6 Dates / timezone
- `checkIn`/`checkOut`/`BlockedDate.date` are bare `DateTime`, not `DATE`. Two incompatible midnight conventions historically coexisted (Nepal local vs UTC); rounding-to-nearest-midnight hacks compensate. There is **no property timezone**; `checkInTime`/`checkOutTime` are free-text and unused in any math.

### 2.7 Blocked dates
- `BlockedDate` is **one row per calendar day** per `(property, optional roomType)` with `@@unique([propertyId, roomTypeId, date])` (`schema.prisma:233`). Blocking a range loops day-by-day.

### 2.8 Lifecycle / state machine
- Statuses: `PENDING → CONFIRMED → CHECKED_IN → COMPLETED`, plus `CANCELLED` / `NO_SHOW`.
- A real state machine (`assertBookingTransition`) governs the **primary single-booking** mutation path, with per-status timestamps + audit logs. **But the bulk-action and cancel-API paths bypass it** (see risks below).

---

## 3. What genuinely works well ✅

1. **`totalPrice` is always recomputed server-side** from DB prices; client totals are never trusted — eliminates price tampering.
2. **Quantity-aware inventory** — per-day unit summation correctly supports N identical rooms per class.
3. **One shared availability engine** (`assertStayAvailable`) for guest *and* manual bookings — they can't silently diverge.
4. **Inventory release can't drift** — availability simply never reads `CANCELLED/COMPLETED/NO_SHOW`; no counter to forget to decrement.
5. **A real state machine** blocks double-cancel, re-confirm-after-terminal, and complete-before-check-in on the main path.
6. **Per-status timestamps** + typed **audit logs** with actor on the main mutation path.
7. **Review eligibility** (COMPLETED + checked-out) enforced server-side in both API and action, with a unique-per-booking guard.
8. **Sensible indexing** (`checkIn/checkOut`, `status/createdAt`, `roomTypeId`, `propertyId`) and money typed `Decimal(10,2)` at rest.
9. **Booking creation is** auth-gated, rate-limited, honeypot-protected, audit-logged; Zod enforces past-date rejection, checkout > checkin, and guest/unit bounds.

---

## 4. Critical risks 🔴 (fix before real concurrent traffic)

| # | Risk | Evidence | Fix |
|---|------|----------|-----|
| 1 | **Double-booking race on the last unit (guest path)** | `api/bookings/route.ts:51` — `$transaction` at default READ COMMITTED, no `FOR UPDATE`, no exclusion constraint. Two txns read the same `taken` count, both pass, both insert. | Advisory lock `pg_advisory_xact_lock(hashtext(key))` on `(propertyId, roomTypeId)` at the top of the txn; or a per-day inventory ledger with `SELECT … FOR UPDATE`; or a Postgres `EXCLUDE` constraint (btree_gist) over `(propertyId, roomTypeId, daterange)`. Set Serializable + retry as a backstop. |
| 2 | **Manual admin booking has no transaction (TOCTOU)** | `admin/bookings/new/actions.ts:71` checks, `:92` creates — two separate statements, no `$transaction`. | Wrap check + create in one transaction with the same locking. Unify both write paths behind one `createBooking()` helper. |
| 3 | **PENDING holds inventory forever** | `ACTIVE_BOOKING_STATUSES` includes `PENDING` (`booking-lifecycle.ts:3`); nothing expires stale holds. | Add `holdExpiresAt` + a sweeper (or lazy read-time expiry) that auto-cancels PENDING past TTL (~30–60 min online). |
| 4 | **Bulk status update bypasses the state machine** | `admin/bookings/bulk-actions.ts:30` — `updateMany` with no `assertBookingTransition`, no per-row status read. CANCELLED → CONFIRMED re-claims sold dates. | Route bulk ops through `assertBookingTransition` + timestamp helper per booking, in a transaction; re-run availability when returning to an inventory-holding status; emit per-booking audit. |
| 5 | **Cancel API route diverges** | `api/bookings/[id]/cancel/route.ts` — no transition check, ADMIN skips the guard, sets `CANCELLED` **without** `cancelledAt`. | Funnel through the same lifecycle helper so `cancelledAt` is always stamped and terminal-state cancels are rejected. |
| 6 | **Checkout day counted as occupied — no same-day turnover** | `coversDay` inclusive both ends (`room-availability.ts:21-22`). Guest checking in on the 14th when another checks out on the 14th is falsely rejected. | Use night-based `[checkIn, checkOut)` — iterate `… outDay-1`, `coversDay = from <= day && day < to`. Align with `nightsBetween`. Apply in client math too. |
| 7 | **Money math in floating point** | `route.ts:101-102` & `actions.ts:68` compute in JS float, then store to `Decimal(10,2)`; two different nights formulas. | Do all money math with `Prisma.Decimal` end-to-end; round at the boundary; one shared nights formula. |

---

## 5. Prioritized improvements

| Improvement | Effort | Impact | Category |
|---|:--:|:--:|---|
| Unify guest + manual creation behind one transactional, locked `createBooking()` | M | High | integrity |
| Per-day inventory ledger (or `EXCLUDE` constraint) as the capacity source of truth | L | High | inventory |
| Fix overlap to night-based `[checkIn, checkOut)` (server + client) | S | High | availability |
| PENDING hold expiry (`holdExpiresAt` + sweeper) | M | High | lifecycle |
| Route ALL status changes (single, bulk, cancel API) through the state machine | M | High | lifecycle |
| Resolve optional `roomTypeId` ambiguity / class-less cross-contamination | M | Med | data-model |
| Property timezone + `DATE`-typed stay dates | M | Med | integrity |
| Decimal-safe pricing pipeline + single nights formula | S | Med | pricing |
| Payment/deposit/refund model tied to lifecycle | L | High | data-model |
| Guard destructive admin edits (shrinking `totalUnits`, blocking booked dates) | S | Med | admin-ux |
| Enforce `maxGuests` on manual path + booking-amendment (amend) flow | M | Med | admin-ux |
| Server-side min/max-stay + max-advance-booking + idempotency key on create | S | Med | integrity |
| Discrete `Room`/`Unit` entity (per-room status, partial closures) | L | Med | inventory |
| Wire `reorderRoomTypesAction` to UI; scope blocked-date deletes; archive (not hide) booked classes | S | Low | admin-ux |
| Date/time awareness on check-in/check-out transitions | S | Low | lifecycle |

---

## 6. Missing HMS capabilities

1. **Atomic inventory-reservation layer** (advisory locks / serializable / per-day ledger / `EXCLUDE` constraint) — the single non-negotiable correctness primitive of any booking engine.
2. **Rate plans** — seasonality, day-of-week, length-of-stay pricing.
3. **Taxes, service/cleaning fees, deposits, and a payment/transaction/refund ledger.**
4. **Cancellation-policy engine** (free-until-date, partial refunds, non-refundable rates) + no-show charging.
5. **Discrete rooms** with housekeeping status and specific-room assignment.
6. **Restrictions** — min/max stay, closed-to-arrival/departure, stop-sell.
7. **Property timezone** with `DATE`-typed stay dates.
8. **Booking amendment/modification** flow (change dates/guests/class without cancel-and-rebook).
9. **Automatic lifecycle transitions** + reservation hold expiry (auto no-show, auto checkout).
10. **Channel/OTA mapping, idempotency, multi-currency.**

---

## 7. Phased roadmap

### Phase 1 — Must-fix integrity *(ship before taking real concurrent traffic)*
1. Add mutual exclusion to booking creation — one transactional `createBooking()` with a `pg_advisory_xact_lock` on `(propertyId, roomTypeId)` (or Serializable + retry). Fixes risks **#1 and #2** at once.
2. Switch overlap to night-based `[checkIn, checkOut)` in server **and** client math (risk **#6**, off-by-one).
3. Route every status mutation (single, bulk, cancel API) through `assertBookingTransition` + timestamp helper (risks **#4, #5**).
4. PENDING hold expiry (risk **#3**).
5. Decimal-safe money math with one shared nights formula (risk **#7**).
6. Guard destructive admin edits; enforce `maxGuests` + min/max-stay + idempotency server-side.

### Phase 2 — Core HMS capabilities
- Property timezone + `DATE`-typed dates (retire the dual-midnight hack + 36h buffer).
- Make `roomTypeId` required (synthetic "whole property" type); remove class-less cross-contamination.
- Payment/deposit/refund ledger + cancellation-policy engine (incl. no-show charging).
- Discrete `Room`/`Unit` entity with housekeeping; give `BlockedDate` a quantity for partial closures.
- Booking-amendment flow + automatic lifecycle transitions.

### Phase 3 — Advanced / revenue
- Rate plans (seasonal, day-of-week, LOS); taxes/fees; multi-currency.
- Restrictions (CTA/CTD/stop-sell, min/max-stay calendars); overbooking allowance + waitlist + yield tooling.
- Channel/OTA mapping with idempotency keys.
- A canonical availability/inventory ledger replacing read-time scans, for scale.

---

## 8. Recommended immediate next steps

Start with **Phase 1, items 1 and 3** — the oversell race and the state-machine bypasses are the only items here that can directly cost money and damage guest trust. They are **S/M effort** and unlock "can take real bookings without overselling."
