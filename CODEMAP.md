# Salt Route Corp — Complete Codebase Map

> Single-file reference for AI to understand the entire codebase in one read. Updated July 2026.

---

## 1. Project Overview

Luxury boutique property-rental and consulting platform based in Nepal. Connects property owners with guests, handles bookings, reviews, inquiries, email campaigns, AI insights.

- **Domain:** `saltroutecorp.com` | **Currency:** NPR | **Region:** Nepal
- **Brand:** Salt Route Group — "Tailored Stays & Consulting · Nepal"

### Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, React 19) |
| Language | TypeScript 5 |
| Database | PostgreSQL via Prisma 7 (`@prisma/adapter-pg`) |
| Auth | NextAuth v5 beta — Credentials + Google OAuth |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Animations | Framer Motion 12, Lenis, Lottie |
| Charts | Recharts 3 |
| Forms | React Hook Form + Zod 4 |
| Email | Nodemailer (SMTP), React Email templates |
| Queue | BullMQ + Redis (ioredis) |
| Media | Cloudinary, ffmpeg.wasm (in-browser video compression) |
| Maps | Leaflet |
| AI | Groq (primary) / OpenRouter (fallback) |
| Testing | Vitest (unit), Playwright (e2e) |
| Pkg Manager | pnpm |

### Scripts

`pnpm dev` | `pnpm build` | `pnpm start` | `pnpm test` | `pnpm test:e2e` | `pnpm db:seed` | `pnpm db:push` | `pnpm db:studio` | `pnpm email` (dev email server :3001) | `pnpm worker`

### Path Alias

`@/*` → project root

---

## 2. Database Schema (Prisma)

**File:** `prisma/schema.prisma`

### Enums

`Role` (GUEST, OWNER, ADMIN) | `UserStatus` (ACTIVE, SUSPENDED) | `PropertyStatus` (DRAFT, PENDING, ACTIVE, ARCHIVED) | `BookingStatus` (PENDING, CONFIRMED, CANCELLED, COMPLETED, NO_SHOW, CHECKED_IN) | `InquiryStatus` (NEW, IN_PROGRESS, RESPONDED, CLOSED) | `InvitationStatus` (PENDING, ACCEPTED, EXPIRED, REVOKED) | `NotificationType` (BOOKING, INQUIRY, REVIEW, SYSTEM) | `InquirySource` (PUBLIC_CONTACT, GUEST_MESSAGE, OWNER_REQUEST, ADMIN_DIRECT) | `InquirySender` (GUEST, OWNER, ADMIN, SYSTEM) | `ReviewStatus` (PENDING, PUBLISHED, HIDDEN) | `CampaignStatus` (DRAFT, QUEUED, SENDING, PAUSED, COMPLETED, FAILED) | `CampaignRecipientStatus` (PENDING, SENT, FAILED, BOUNCED, OPENED) | `AuditAction` (CREATE, UPDATE, DELETE, LOGIN, LOGOUT, PASSWORD_CHANGE, ROLE_CHANGE, BOOKING_*, PROPERTY_*, INVITATION_*, BULK_*, CAMPAIGN_SEND, EXPORT)

### Models

- **User** — Roles: GUEST/OWNER/ADMIN. 2FA (TOTP), email verification, status. Relations: bookings, properties, reviews, inquiries, notifications, wishlists, campaigns, audit logs, invitations.
- **Account** — OAuth provider accounts.
- **Session** — NextAuth sessions (JWT strategy used).
- **VerificationToken** — Email verification & password reset tokens.
- **Property** — title, slug, description, highlights, location, pricePerNight, maxGuests, bedrooms, bathrooms, amenities, rules, services, whatToExpect, tagline, story, neighborhood, hostNote, stayDetails (JSON), gettingHere (JSON), featureIcons (JSON), totalUnits, checkIn/checkOut times, status, featured. Owner = User(OWNER). Has roomTypes, sections, images, reviews, bookings, blockedDates, wishlists.
- **RoomType** — Room class within property. Own pricePerNight, maxGuests, totalUnits, amenities, images. Active flag.
- **PropertySection** — Editorial content sections (title, subtitle, body, image, order).
- **PropertyImage** — Cloudinary images (url, publicId, alt, order, isPrimary, isBanner).
- **Booking** — checkIn, checkOut, guests, units, totalPrice, status, notes, cancellationReason, bookingCode (`SLT-YYYY-NNNN`), timestamps (cancelled/checkedIn/checkedOut/confirmed/noShow), roomTypeId (nullable), holdExpiresAt (30-min hold). Linked to guest, property, roomType, review.
- **BlockedDate** — Date blocks on property or room type. Unique (propertyId, roomTypeId, date).
- **Review** — rating (1-5), comment, reply, status, bookingId (unique). Has review images.
- **ReviewImage** — Cloudinary images on reviews.
- **Wishlist** — User saved properties. Unique (userId, propertyId).
- **Invitation** — Admin-invited users (OWNER/ADMIN). Token-based, expiring.
- **Inquiry** — Contact/messaging. name, email, phone, subject, message, status, source, ownerId, read timestamps, lastMessageAt/By.
- **InquiryMessage** — Messages in inquiry thread. Sender: GUEST/OWNER/ADMIN/SYSTEM.
- **Notification** — In-app notifications. type, title, body, href, readAt, metadata (JSON).
- **AuditLog** — action, entity, entityId, details (JSON), ipAddress, userId.
- **Campaign** — Email campaign. name, subject, body, template, status, segment (JSON), counts, scheduledAt.
- **CampaignRecipient** — Per-recipient tracking. status, sentAt, openedAt, failedAt.
- **PropertyFeature** — Global feature registry with icon keys.

### Migrations

`20260424114051_init` | `20260425110000_operational_flows`

---

## 3. Authentication & Authorization

### Files

- `auth.ts` — NextAuth v5 config. Exports `handlers`, `auth`, `signIn`, `signOut`. Providers: Credentials (bcryptjs) + Google OAuth. JWT session. Secure cookies in production.
- `auth.config.ts` — Pages (`/login`), authorized callback (route protection), JWT/session callbacks.
- `types/next-auth.d.ts` — Type augmentation (session user: id, role, image).
- `lib/auth-utils.ts` — Client-side: `fetchSessionRole()`, `getSafeCallback()`, `getDestination()` (role-based redirect).
- `lib/totp.ts` — TOTP 2FA (pure crypto, no external dep). `generateTOTPSecret()`, `verifyTOTP()`, `keyuri()`.
- `app/(auth)/actions.ts` — Server actions: `loginAction`, `signupAction`, `forgotPasswordAction`, `resetPasswordAction`.

### Route Protection

- `/admin/*` → ADMIN only
- `/owner/*` → OWNER or ADMIN
- `/account/*` → Authenticated
- `/login`, `/signup` → Redirect authed users to role dashboard

### Security

- **Rate limiting** — Redis sliding window (`lib/rate-limit.ts`). Login: 50/15min, Signup: 50/hr, Bookings: 10/hr, Inquiries: 15/hr, Reviews: 3/day.
- **Honeypot** — Hidden `website` field (`lib/security/honeypot.ts`).
- **Pwned password** — HIBP k-anonymity API (`lib/security/pwned.ts`).
- **Ownership** — `lib/security/ownership.ts`: `assertBookingAccess`, `assertPropertyAccess`, `assertReviewAccess`, `assertAdmin`.
- **Headers** — HSTS, X-Frame-Options:DENY, nosniff, Referrer-Policy, Permissions-Policy (in `next.config.ts`). COOP/COEP on `/admin/*` for ffmpeg.wasm.
- **Error responses** — `lib/security/error-response.ts`.

---

## 4. Application Routes (App Router)

### `(public)` — Public pages

| Route | Description |
|---|---|
| `/` | Homepage (hero, properties, visual journey, journal teaser) |
| `/about` | About page |
| `/services` | Services page |
| `/properties` | Property listing with search/filter |
| `/properties/[slug]` | Property detail page (brochure layout) |
| `/booking-request` | Booking request page |
| `/contact` | Contact form |
| `/faq` | FAQ |
| `/for-owners` | Owner onboarding |
| `/journal` | Journal/blog index |
| `/journal/[slug]` | Journal article |
| `/visual-journey` | Visual Journey long-form page |
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |
| `/refund-policy` | Refund policy |

Layout: `app/(public)/layout.tsx` — Nav, Footer, page transitions.

### `(auth)` — Auth pages

| Route | Description |
|---|---|
| `/login` | Login form |
| `/signup` | Signup form |
| `/forgot-password` | Forgot password |
| `/reset-password` | Reset password |
| `/verify-email` | Email verification |
| `/invite` | Invitation acceptance |

Server actions: `app/(auth)/actions.ts`

### `(guest)` — Guest account

| Route | Description |
|---|---|
| `/account` | Guest dashboard (bookings, stats) |
| `/account/bookings` | Booking history |
| `/account/bookings/[id]` | Booking detail |
| `/account/profile` | Profile editing |
| `/account/reviews` | Review management |
| `/account/messages` | Inquiry messages |
| `/account/notifications` | Notifications |
| `/account/wishlist` | Saved properties |

### `admin` — Admin panel

| Route | Description |
|---|---|
| `/admin/dashboard` | KPIs, charts, AI insights |
| `/admin/properties` | Property table |
| `/admin/properties/new` | Create property |
| `/admin/properties/[id]` | Property detail/edit |
| `/admin/properties/[id]/edit` | Edit form |
| `/admin/properties/[id]/images` | Image management |
| `/admin/properties/[id]/rooms` | Room type management |
| `/admin/properties/[id]/sections` | Content sections |
| `/admin/properties/[id]/calendar` | Availability calendar |
| `/admin/bookings` | Booking table |
| `/admin/bookings/new` | Manual booking |
| `/admin/bookings/[id]` | Booking detail/status |
| `/admin/users` | User table |
| `/admin/users/new` | Create user |
| `/admin/users/[id]` | User detail/edit |
| `/admin/reviews` | Review moderation |
| `/admin/reviews/[id]` | Review detail |
| `/admin/inquiries` | Inquiry management |
| `/admin/inquiries/[id]` | Inquiry thread |
| `/admin/campaigns` | Email campaigns |
| `/admin/campaigns/new` | Create campaign |
| `/admin/campaigns/[id]` | Campaign detail |
| `/admin/invitations` | Invitation management |
| `/admin/owners` | Owner management |
| `/admin/settings` | Site settings |
| `/admin/settings/amenities` | Amenities |
| `/admin/settings/features` | Features |
| `/admin/settings/homepage` | Homepage config |
| `/admin/settings/email-templates` | Email templates |
| `/admin/settings/cities` | Cities |
| `/admin/profile` | Admin profile |
| `/admin/profile/2fa` | 2FA setup |
| `/admin/profile/change-password` | Password change |
| `/admin/profile/sessions` | Active sessions |
| `/admin/audit` | Audit log viewer |
| `/admin/logs` | System logs |
| `/admin/backups` | DB backups |
| `/admin/reports` | Reports |
| `/admin/messages` | Messages |
| `/admin/notifications` | Notifications |

Admin server actions: `properties/actions.ts`, `properties/bulk-actions.ts`, `bookings/bulk-actions.ts`, `users/actions.ts`, `users/bulk-actions.ts`, `reviews/bulk-actions.ts`, `inquiries/bulk-actions.ts`, `campaigns/actions.ts`, `settings/actions.ts`, `settings/data-actions.ts`

### `owner` — Owner panel

| Route | Description |
|---|---|
| `/owner/dashboard` | Owner dashboard |
| `/owner/properties` | Owner's properties |
| `/owner/properties/[id]` | Property detail (owner view) |
| `/owner/bookings` | Owner's bookings |
| `/owner/messages` | Messages |
| `/owner/notifications` | Notifications |
| `/owner/profile` | Profile |
| `/owner/reports` | Reports |
| `/owner/request-edit` | Request property edit |

### `api` — API Routes

| Route | Description |
|---|---|
| `POST /api/bookings` | Create booking (auth, rate-limited) |
| `GET /api/bookings/[id]` | Booking detail |
| `POST /api/inquiries` | Submit inquiry (public, rate-limited) |
| `POST /api/reviews` | Submit review (auth, rate-limited) |
| `GET /api/properties/[id]` | Property data |
| `POST /api/properties/map-coords` | Map coordinates |
| `POST /api/wishlist/[propertyId]` | Toggle wishlist (auth) |
| `POST /api/upload/signature` | Cloudinary upload signature (auth) |
| `POST /api/upload/direct` | Direct upload |
| `GET /api/auth/[...nextauth]` | NextAuth handler |
| `GET /api/admin/events` | SSE real-time admin events |
| `GET /api/admin/export` | Data export (admin) |
| `POST /api/admin/ai/chat` | AI chat (admin) |
| `POST /api/admin/ai/insights` | AI insights (admin) |
| `POST /api/admin/ai/suggest` | AI field suggestions (admin) |
| `POST /api/admin/ai/property-compose` | AI property copywriting (admin) |
| `POST /api/ai/concierge` | Public AI concierge |
| `GET /api/cron/checkin-reminder` | Cron: check-in reminder emails |

---

## 5. Library (`lib/`)

### Core Infrastructure

| File | Purpose |
|---|---|
| `lib/db.ts` | Prisma client singleton. `PrismaPg` adapter with `pg.Pool`. |
| `lib/redis.ts` | Redis singleton (ioredis). Rate limiting, cache, pub/sub, queue. |
| `lib/site.config.ts` | Site config: name, contact, social, currency, email subjects, rate limits, pagination, cache TTL. All env-overridable. |
| `lib/utils.ts` | `cn()` — Tailwind class merge (clsx + tailwind-merge). |
| `lib/serialize.ts` | `serializeForClient()` — Prisma Decimal → number for client components. |
| `lib/currency.ts` | `formatNpr()` — NPR currency formatting. |
| `lib/pagination.ts` | `parsePage()`, `getPagination()`. Default 25/page. |
| `lib/cloudinary.ts` | Cloudinary config + `generateUploadSignature()`. |
| `lib/audit.ts` | `createAuditLog()` — fire-and-forget audit entries. `getClientIp()`. |
| `lib/notifications.ts` | `notifyUser()`, `notifyUsers()`, `notifyRole()`, `notifyAdmins()`, `getAdminEmails()`, `getUnreadNotificationCount()`, `markAllNotificationsRead()`. |
| `lib/inquiries.ts` | Unread tracking: `isInquiryUnreadForAdmin/Guest/Owner()`, `normalizeInquiryMessages()`. |
| `lib/auth-actions.ts` | Auth action re-exports. |

### Booking System

| File | Purpose |
|---|---|
| `lib/booking-service.ts` | **Core booking creation.** Transactional with Postgres advisory lock (`pg_advisory_xact_lock`). Price computed with Prisma.Decimal. 30-min hold for pending. Serializable isolation. |
| `lib/room-availability.ts` | **Availability engine.** `assertStayAvailable()` — quantity-aware, night-based `[checkIn, checkOut)`. `getUnavailablePropertyIds()` — for search filtering. |
| `lib/booking-lifecycle.ts` | **Status machine.** Role-based transitions (ADMIN vs OWNER). `BOOKING_STATUS_LABELS`, `getAllowedBookingTransitions()`, `assertBookingTransition()`, `canReviewBooking()`. |
| `lib/booking-dates.ts` | `toUtcDay()`, `toLocalDay()`, `toDateOnlyString()`, `eachNightDay()`, `nightsBetween()`. Timezone-safe. |
| `lib/booking-code.ts` | `generateBookingCode()` — `SLT-YYYY-NNNN`. |
| `lib/booking-hold-expiry.ts` | `expireStalePendingBookings()` — auto-cancel past 30-min hold. |
| `lib/booking-admin-guards.ts` | `assertRoomTypeCapacityCanShrink()`, `assertPropertyCapacityCanShrink()`, `assertBlockedRangeHasNoActiveBookings()`. |
| `lib/availability-client.ts` | Client-side availability math (mirrors server). Used by booking calendar + form. |
| `lib/room-type-suggestions.ts` | Property type + room category autocomplete suggestions. |

### AI

| File | Purpose |
|---|---|
| `lib/ai/groq.ts` | LLM client. Groq primary, OpenRouter fallback. `groqChat()`, `groqJson()`, `isGroqConfigured()`. OpenAI-compatible API. |
| `lib/ai/insights.ts` | `generateInsights()` — Gathers platform metrics, asks AI for 3-4 actionable insights. |
| `lib/ai/property-ai.ts` | `suggestField()` — AI copywriting for property fields. `assignFeatureIcons()` — AI icon assignment with keyword fallback. |

### Admin

| File | Purpose |
|---|---|
| `lib/admin/analytics.ts` | `bookingsByDay()`, `revenueByMonth()`, `topProperties()`, `kpiStats()`. Redis-cached (5min TTL). |
| `lib/admin/query.ts` | `parseAdminQuery()` — parses search/sort/filter/page params. `buildPagination()`, `buildDateFilter()`. |
| `lib/admin/segments.ts` | `segmentToWhere()` — Campaign audience segment builder. `segmentLabel()`. |

### Email

| File | Purpose |
|---|---|
| `lib/email/transporter.ts` | Nodemailer transporter (lazy proxy). `sendEmail()`, `sendEmailToMany()`, `verifyConnection()`. SMTP config from env. |

### Queue / Background Jobs

| File | Purpose |
|---|---|
| `lib/queue/index.ts` | `getEmailQueue()` — BullMQ queue for email campaigns. 3 retries, exponential backoff. |
| `lib/queue/connection.ts` | BullMQ Redis connection. |
| `lib/queue/worker.ts` | Worker process for email campaign sending. |
| `scripts/worker.ts` | Entry point for background worker process. |

### Realtime

| File | Purpose |
|---|---|
| `lib/realtime/publisher.ts` | `publishAdminEvent()` — Redis pub/sub on `admin:events` channel. Event types: booking/inquiry/review changes, notifications, stats updates. |

### Media

| File | Purpose |
|---|---|
| `lib/property-media.ts` | `isVideoUrl()`, `getImageMedia()`, `getPrimaryImageUrl()`, `getBannerImageUrl()`. |
| `lib/video-compress.ts` | ffmpeg.wasm client-side video compression. Requires cross-origin isolation (SharedArrayBuffer). |
| `lib/feature-icons.tsx` | Icon registry (100+ lucide icons) for property features/amenities. `ICON_KEYS`, `ICON_REGISTRY`, `iconKeyForText()`. |

### Content (Static)

| File | Purpose |
|---|---|
| `lib/journal.ts` | Journal articles (static content). `JournalArticle` type, `journalArticles` array. |
| `lib/visual-journey-tiles.ts` | Visual Journey tiles (13 tiles with cover, gallery, narrative, bullets, CTA). Unsplash/Pexels images. |
| `lib/animations/srg.json` | Lottie animation data. |

### Security

| File | Purpose |
|---|---|
| `lib/security/index.ts` | Re-exports. |
| `lib/security/ownership.ts` | `assertBookingAccess`, `assertPropertyAccess`, `assertReviewAccess`, `assertAdmin`. |
| `lib/security/honeypot.ts` | `isHoneypotTriggered()`, `honeypotFieldProps`. |
| `lib/security/pwned.ts` | `isPasswordPwned()` — HIBP API. |
| `lib/security/error-response.ts` | `safeErrorResponse()` — standardized API error responses. |

---

## 6. Validations (Zod Schemas)

**File:** `lib/validations/index.ts`

| Schema | Fields |
|---|---|
| `signupSchema` | name, email, phone, password (min 8, upper+lower+number), confirmPassword |
| `loginSchema` | email, password |
| `forgotPasswordSchema` | email |
| `resetPasswordSchema` | token, password, confirmPassword |
| `inquirySchema` | name, email, phone?, subject, message |
| `bookingSchema` | propertyId, roomTypeId?, units?, checkIn, checkOut, guests, phone?, notes? |
| `cancelBookingSchema` | bookingId, reason |
| `propertySchema` | title, description, highlights?, location, address?, pricePerNight, maxGuests, bedrooms, bathrooms, amenities?, rules? |
| `reviewSchema` | bookingId, rating (1-5), comment, images? |
| `reviewReplySchema` | reviewId, reply |
| `invitationSchema` | email, role (OWNER/ADMIN) |
| `profileSchema` | name, phone? |
| `changePasswordSchema` | currentPassword, newPassword, confirmNewPassword |

All schemas export corresponding `*Input` types.

---

## 7. Components

### `components/ui/` — shadcn/ui Primitives

`alert`, `avatar`, `badge`, `button`, `calendar`, `card`, `checkbox`, `dialog`, `dropdown-menu`, `form`, `input`, `label`, `lottie-animation`, `number-input`, `popover`, `select`, `separator`, `sheet`, `skeleton`, `sonner`, `switch`, `table`, `tabs`, `textarea`

Custom UI: `luxury-arrow`, `luxury-button`, `luxury-link`, `luxury-link-with-arrow`

### `components/public/` — Public Site Components

| File | Purpose |
|---|---|
| `HomeClient.tsx` | Homepage client (hero, properties, visual journey, journal) |
| `Nav.tsx` | Public navigation bar |
| `Footer.tsx` | Site footer |
| `PropertiesClient.tsx` | Property listing page client (search, filter, map) |
| `PropertyDetailClient.tsx` | Property detail page client |
| `PropertyGallery.tsx` | Property image gallery with lightbox |
| `PropertyMap.tsx` / `PropertyMapInner.tsx` | Leaflet map for property |
| `PropertyDetailMap.tsx` / `PropertyDetailMapInner.tsx` | Detail page map |
| `PropertyReviewForm.tsx` | Review submission form |
| `ReviewImageGallery.tsx` | Review image gallery |
| `AiConcierge.tsx` | AI concierge chat widget |
| `DeferredConcierge.tsx` | Lazy-loaded AI concierge |
| `ServicesClient.tsx` | Services page client |
| `VisualJourney.tsx` | Visual Journey horizontal scroller + modal |
| `LanguageSwitcher.tsx` | Google Translate widget switcher |
| `SiteLoader.tsx` | Loading screen |
| `RouteLoader.tsx` | Route transition loader |
| `NavProgress.tsx` | Navigation progress bar |
| `PageTransition.tsx` | Framer Motion page transitions |
| `motion.tsx` | Shared motion components |
| `LocationCombobox.tsx` | Location search combobox |
| `FacebookAvatar.tsx` | Facebook avatar component |
| `LegalShell.tsx` | Legal page layout shell |
| `SessionProvider.tsx` | NextAuth SessionProvider wrapper |

### `components/public/property/` — Property Brochure Components

| File | Purpose |
|---|---|
| `BrochureHero.tsx` | Property hero section |
| `BrochureFullGallery.tsx` | Full gallery |
| `BrochureOverviewStrip.tsx` | Overview strip |
| `BrochureStory.tsx` | Story section |
| `BrochureSections.tsx` | Editorial content sections |
| `BrochureRooms.tsx` | Room types display |
| `BrochureFacilities.tsx` | Facilities/amenities |
| `BrochureLocation.tsx` | Location section |
| `BrochureReviews.tsx` | Reviews section |
| `BrochureReservation.tsx` | Reservation/booking widget |
| `BrochureBookingBar.tsx` | Sticky booking bar |
| `BrochurePhotoBand.tsx` | Photo band |
| `BrochureVideoBand.tsx` | Video band |
| `RoomGalleryLightbox.tsx` | Room gallery lightbox |
| `primitives.tsx` | Shared brochure primitives |
| `types.ts` | Brochure type definitions |

### `components/booking/` — Booking Components

| File | Purpose |
|---|---|
| `BookingPageClient.tsx` | Booking page client (date selection, room selection, form) |
| `booking-calendar.tsx` | Calendar date picker with availability |
| `booking-request-form.tsx` | Booking request form (guests, notes, contact) |

### `components/admin/` — Admin Components

| File | Purpose |
|---|---|
| `admin-shell.tsx` | Admin layout shell (sidebar + content) |
| `sidebar-nav.tsx` | Admin sidebar navigation |
| `command-palette.tsx` | Admin command palette (cmdk) |
| `data-table.tsx` | Generic data table |
| `server-data-table.tsx` | Server-side data table with sorting/filtering |
| `dashboard-tables.tsx` | Dashboard table components |
| `stat-card.tsx` | KPI stat card |
| `live-stat-card.tsx` | Real-time stat card |
| `live-counter.tsx` | Real-time counter |
| `live-provider.tsx` | SSE provider for real-time admin data |
| `bulk-action-bar.tsx` | Bulk action toolbar |
| `date-range-picker.tsx` | Date range picker |
| `media-uploader.tsx` | Cloudinary media uploader (images + video) |
| `location-picker.tsx` | Map location picker |
| `preview-iframe.tsx` | Property preview iframe |
| `property-ai-assistant.tsx` | AI property form assistant |
| `property-form-preview.tsx` | Property form preview |
| `ai-insights.tsx` | AI insights panel |
| `ai-suggest-button.tsx` | AI suggest button for fields |
| `toast-listener.tsx` | Toast notification listener |

### `components/admin/charts/` — Chart Components

`bookings-bar.tsx`, `revenue-line.tsx`, `top-properties-bar.tsx`, `mini-bars.tsx`, `sparkline.tsx`

### `components/owner/` — Owner Components

| File | Purpose |
|---|---|
| `owner-shell.tsx` | Owner layout shell |
| `OwnerSidebarNav.tsx` | Owner sidebar navigation |
| `OwnerReplyForm.tsx` | Review reply form |

### `components/guest/` — Guest Components

| File | Purpose |
|---|---|
| `guest-account-shell.tsx` | Guest account layout shell |

### `components/shared/` — Shared Components

| File | Purpose |
|---|---|
| `SmoothScrollProvider.tsx` | Lenis smooth scroll provider |
| `notification-list.tsx` | Notification list component |
| `pagination-controls.tsx` | Pagination UI controls |

---

## 8. Email Templates

**Directory:** `emails/`

All templates use React Email (`@react-email/components`). Rendered with `@react-email/render` to HTML before sending via Nodemailer.

| Template | Purpose |
|---|---|
| `EmailLayout.tsx` | Base email layout (header, footer, styling) |
| `BookingReceived.tsx` | Guest: booking request received |
| `BookingConfirmed.tsx` | Guest: booking confirmed |
| `BookingRejected.tsx` | Guest: booking rejected |
| `BookingCheckinReminder.tsx` | Guest: check-in reminder (cron) |
| `BookingThankYou.tsx` | Guest: post-stay thank you |
| `NewBookingAdminAlert.tsx` | Admin: new booking notification |
| `OwnerNewBooking.tsx` | Owner: new booking notification |
| `InquiryReceivedAuto.tsx` | Guest: inquiry auto-reply |
| `NewInquiryAdminAlert.tsx` | Admin: new inquiry notification |
| `NewReviewAdminAlert.tsx` | Admin: new review notification |
| `InvitationEmail.tsx` | Invitee: platform invitation |
| `VerifyEmail.tsx` | User: email verification |
| `ResetPassword.tsx` | User: password reset |
| `CampaignEmail.tsx` | Campaign: bulk email template |

---

## 9. Booking Flow (End-to-End)

1. **Guest selects dates** on property page → `booking-calendar.tsx` shows availability (client-side `availability-client.ts`).
2. **Guest submits booking form** → `POST /api/bookings` → validates with `bookingSchema` → calls `createBooking()`.
3. **`createBooking()`** (`lib/booking-service.ts`):
   - Acquires Postgres advisory lock on (propertyId, roomTypeId)
   - Expires stale pending bookings
   - Loads property + room type data
   - Validates capacity (maxGuests × units)
   - Checks availability via `assertStayAvailable()`
   - Computes price: `pricePerNight × nights × units` (Prisma.Decimal)
   - Generates booking code (`SLT-YYYY-NNNN`)
   - Creates booking with 30-min hold (`holdExpiresAt`)
   - Sends emails (guest confirmation + admin alert + owner notification)
   - Publishes realtime event
   - Creates audit log
4. **Admin/Owner manages booking** → status transitions via `booking-lifecycle.ts` state machine:
   - PENDING → CONFIRMED / CANCELLED (admin)
   - CONFIRMED → CHECKED_IN / CANCELLED / NO_SHOW (admin)
   - CONFIRMED → CHECKED_IN / NO_SHOW (owner)
   - CHECKED_IN → COMPLETED / NO_SHOW
5. **Post-stay** → Guest can review if `canReviewBooking()` (status=COMPLETED + checkedOutAt set).

### Capacity Model

- Properties without room types: capacity = `property.totalUnits`
- Properties with room types: capacity per class = `roomType.totalUnits`
- Night-based `[checkIn, checkOut)` — checkout day is NOT occupied (same-day turnover)
- Blocked dates: whole-property blocks always apply; class blocks apply to that class only

---

## 10. Environment Variables

Required env vars (all in `.env`):

```
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
NEXTAUTH_URL=https://saltroutecorp.com
NEXTAUTH_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
SMTP_HOST=...
SMTP_PORT=465
SMTP_USER=...
SMTP_PASSWORD=...
SMTP_FROM="Salt Route Corp" <connect@saltroutecorp.com>
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
GROQ_API_KEY=...          # AI (primary)
OPENROUTER_API_KEY=...     # AI (fallback)
```

Optional overrides: `SITE_NAME`, `SITE_TAGLINE`, `INFO_EMAIL`, `ADMIN_EMAIL`, `CONTACT_PHONE`, `SOCIAL_*`, `CURRENCY_*`, `RATE_LIMIT_*`, `GROQ_MODEL`, `OPENROUTER_MODEL`

---

## 11. Testing

### Unit Tests (Vitest)

**Config:** `vitest.config.ts` | **Dir:** `__tests__/`

| File | Coverage |
|---|---|
| `booking-logic.test.ts` | Booking lifecycle, status transitions, date math |
| `booking-availability.regression.test.ts` | Availability engine regression tests |
| `validations.test.ts` | All Zod schema validations |
| `security.test.ts` | Security utilities (honeypot, ownership, etc.) |

### E2E Tests (Playwright)

**Config:** `playwright.config.ts` | **Dir:** `e2e/`

| File | Coverage |
|---|---|
| `app.spec.ts` | Application e2e flow |

---

## 12. Scripts

**Directory:** `scripts/`

| File | Purpose |
|---|---|
| `seed.ts` | Database seeding |
| `worker.ts` | Background worker entry point (email campaigns) |
| `generate-emails.ts` | Generate email template previews |
| `cleanup-database.ts` | Database cleanup utility |
| `publish-reviews.ts` | Bulk publish pending reviews |
| `transfer-ownership.ts` | Transfer property ownership |
| `list-users.ts` / `list-users-v2.ts` | List users utility |
| `list-properties-owners.ts` | List properties and owners |
| `debug-admin-email.ts` | Debug admin email delivery |
| `debug-user-properties.ts` | Debug user property assignments |
| `test-email.ts` | Test email sending |

---

## 13. Key Configuration Files

| File | Purpose |
|---|---|
| `next.config.ts` | Next.js config: image optimization (Cloudinary, Unsplash, Pexels), security headers, COOP/COEP for admin, package import optimization |
| `tsconfig.json` | TypeScript config. Path alias `@/*` → root. Excludes `node_modules`, `skills`, `scratch` |
| `prisma.config.ts` | Prisma config |
| `postcss.config.mjs` | PostCSS config (Tailwind) |
| `components.json` | shadcn/ui config |
| `eslint.config.mjs` | ESLint config (next) |
| `playwright.config.ts` | Playwright e2e config |
| `vitest.config.ts` | Vitest unit test config |
| `pnpm-workspace.yaml` | pnpm workspace config |
| `proxy.ts` | Proxy configuration |

---

## 14. Architecture Patterns

- **Server Actions** — Used for mutations (auth, admin CRUD). Always validated with Zod, rate-limited, audit-logged.
- **API Routes** — Used for public-facing mutations (bookings, inquiries, reviews) and integrations (upload, AI, SSE).
- **Server Components by default** — Client components marked with `"use client"`. Data fetched server-side, serialized via `serializeForClient()`.
- **Transactional booking** — Postgres advisory locks + serializable isolation prevent double-booking.
- **Redis everywhere** — Rate limiting, analytics cache, pub/sub realtime, BullMQ queue.
- **Lazy initialization** — Prisma, Redis, BullMQ queue all use global singletons with lazy init to avoid connection issues in serverless.
- **Fire-and-forget** — Audit logs, admin notifications, some emails don't block the main request.
- **AI with fallback** — Groq primary, OpenRouter fallback. All AI calls are server-only (`"server-only"` import).
- **Feature icons** — AI assigns icon keys at property save time; keyword fallback ensures every feature gets an icon.
