# Salt Route — Public Site Luxury Relayout Plan

> **Status:** Planning complete · Ready for implementation
> **Scope:** Public marketing + booking site ONLY. Admin / owner / guest portals are frozen.
> **Prepared by:** Design-research team (Aman/Cheval Blanc/Six Senses · Banyan Tree/Rosewood/Four Seasons · motion) + engineering, architecture-safety, and media-delivery audits of the live codebase.
> **Golden rule for every decision below:** _slower, larger, and less than your instinct._ When it feels **slightly** too slow and **slightly** too sparse, it is right.

---

## 0. The Problem, In One Paragraph

The site is built from **seven layout archetypes recycled across twelve pages**, almost all variations of "a centered stack on a full-width band." Every section shares the same width (`max-w-screen-xl`), the same vertical rhythm (`py-24/28/32`), the same eyebrow → H2 → paragraph hierarchy, and the same 48px gold-hairline ornament. The type scale collapses to a narrow band — `text-[9px]` labels and `text-5xl` headings with **nothing in between**. Imagery is used at one size with no editorial cropping, overlap, or scale play.

**It does not feel empty because content is missing. It feels empty because nothing is ever big, dense, asymmetric, or surprising.** Luxury is not more decoration — it is **proportion, rhythm, contrast, and restraint**. That is what this plan installs.

**Quantified evidence (from the audit):**

| Recycled archetype | Where it appears | Count |
| --- | --- | --- |
| 2-col image+text "story" spread | Home ×2, About ×2, For-Owners, Brochure Sections(n), Brochure Rooms, Visual-Journey ×13 | **20+** |
| Centered dark image hero | Home, About, Services, Contact, For-Owners, Properties, Visual-Journey (+ FAQ/Legal light variants) | **~9** |
| Sticky column + numbered `01/02/03` list | Home, Services, For-Owners | **3** |
| Gold-icon-over-centered-label grid | FeatureStrip, Facilities, StayDetails — **all on one property page** | **3 on 1 page** |
| Dark centered final CTA | Home, Visual-Journey, Services, For-Owners | **~4** |
| Centered italic pull-quote band | About, Services ×2 | **3** |
| Horizontal snap carousel | Home "Collection", Home VisualJourney | **2 on homepage** |

---

## 1. Non-Negotiable Constraints (Guardrails)

These are hard boundaries. Every change is validated against them.

### 1.1 Brand is frozen — we change composition, not identity
- **Palette frozen:** navy `#1B3A5C`, gold `#C9A96E`, cream `#FFFDF8`, plus the sand/beige/bone neutrals in `globals.css`. No new colors, no gradients (except subtle image scrims).
- **Copy/content frozen:** we relocate, re-scale, and re-compose existing words — we do not rewrite them. The whole thesis: _luxury comes from **content placement**, not new content._
- **Typography intent:** Playfair (serif display) + Niramit (body) + Allura (cursive accent). Uppercase letter-spacing **capped at ≤0.3em**; micro-labels floored at `text-[10px]`; body `leading` ~1.7.

### 1.2 Portals are untouchable
- `app/admin/**`, `app/owner/**`, `app/(guest)/account/**`, `app/(auth)/**` and all `components/admin/*`, `components/owner/*` — **do not edit.**
- Auth/routing is enforced in each portal `layout.tsx` (there is **no middleware.ts**). Never touched.

### 1.3 Logic is preserved — presentation only
- No changes to Prisma queries, `auth()`, serialization, `generateMetadata`, `dynamic`/`revalidate` flags in any `page.tsx`.
- No changes to API routes, `fetch()` targets, form field `name` attributes, honeypots, or localStorage draft keys.
- Public writes hit REST routes to preserve: `POST /api/inquiries`, `POST /api/bookings`, `GET /api/properties/[id]/availability`, `POST /api/reviews`, `POST /api/ai/concierge`.

### 1.4 Shared-surface DANGER ZONES (touch by markup/variant only, verify after)
| File / module | Shared with | Rule |
| --- | --- | --- |
| `PropertyDetailClient.tsx` + `components/public/property/Brochure*` + `primitives.tsx` + `types.ts` | **Admin live preview** (`components/admin/property-form-preview.tsx`) | Relayout markup freely, but **keep the `usePreview()` gate** (preview disables motion + `pointer-events`) and **do not change the `PropertyDetail` / `SectionData` data contracts**. Spot-check the admin "Live Page Preview" after each block. |
| `components/public/Footer.tsx` | Guest account layout | Restyle only; re-check `/account`. |
| `components/public/ReviewImageGallery.tsx` | Guest reviews page | Restyle only. |
| `components/ui/*` (button, input, label, textarea, form, select, alert, badge, number-input, dropdown-menu) | Admin + owner | Restyle via **variants**, never change prop APIs. |
| `lib/property-media.ts` | Public + admin + owner | Add fields (e.g. `blurDataURL?`) **only additively**; never change existing exported signatures or `PropertyMediaLike`. |
| `app/layout.tsx` (root) | All areas | Edit **fonts/metadata only** — nothing structural. Font changes are global (affect portals). |

---

## 2. The Design Doctrine (Five Principles)

Everything downstream is an application of these.

### P1 — Frame the void
Empty space reads as **unfinished** when it is undifferentiated and unanchored; it reads as **intentional** when it is *framed*. Every large empty field gets exactly one anchor: an eyebrow label, a 1px hairline rule, an off-center image edge cutting into it, or a single tightly-set serif line. Aman/Cheval Blanc never leave a naked white rectangle. **The fix for "empty" is almost never "add more stuff" — it is "anchor and shape the emptiness."**

### P2 — Alternating rhythm (the direct cure for "every section looks the same")
Down every page, **rotate section silhouettes so no two adjacent sections share all three of: width (full-bleed ↔ contained), alignment (left ↔ right ↔ center), and density (image-dominant ↔ type-dominant ↔ near-empty).** Target cadence: `A → B → C → B → D → A`, and **never place two "B" (contained editorial split) blocks back-to-back.** Insert one **text-free full-bleed image/video "breath" band every ~2–3 content sections.**

### P3 — Asymmetry over symmetry
Kill 50/50. Move to **58/42 or 62/38** splits, image bleeding to the viewport edge on its side, the type block vertically centered opposite. **Alternate the anchor side each recurrence** so the eye zig-zags. Use 12-col offsets (`col-start-2`, `md:col-start-8`), staggered baselines (`mt-16`/`mt-32`), a
nd captions parked in the wide margin.

### P4 — Restraint is the luxury
No drop shadows. No card chrome/borders around content — images and type float on the background; when division is needed use a **1px hairline** (`border-black/10`). `rounded-none` (max `2px`). The **photography and the type ARE the decoration.** One high-weight CTA per page maximum; everything else is a tracked-uppercase text link with a hairline underline.

### P5 — Motion: slow, few, silent
Long durations (600–1200ms), tiny travel (8–24px), heavy decelerating eases, **fired once**, 1–2 focal events per viewport. If a first-time visitor *consciously notices* an animation, it is too much. They should only feel the page is "calm and well-made."

---

## 3. The Design System (single source of truth)

**Rule:** stop re-inlining styles per page. Route everything through tokens + `primitives.tsx` so scale is centrally tunable. (The audit found `.grand-title`, `.luxury-*`, `--text-hero` already defined in `globals.css` but **unused** — we adopt them site-wide.)

### 3.1 Spacing scale (8px base — only jump on the scale)
`8 · 16 · 24 · 40 · 64 · 96 · 128 · 192`

| Token | Value | Use |
| --- | --- | --- |
| Section padding (desktop) | `py-32`→`py-48` (128–192px) | **~2× current** — the single biggest "intentional" upgrade |
| Section padding (mobile) | `py-20` (80px) | never below this |
| Page gutter | `px-6` mobile / `px-10`–`px-20` desktop | wide margins are themselves luxury |
| Prose measure | `max-w-[38–42rem]` (~60–75ch) | never full-width text |
| Container | `max-w-[80–90rem]` (1280–1440px) | imagery breaks OUT of this |
| Hero occupancy | `h-[92vh]`→`h-screen` | hero owns nearly the whole first screen |

### 3.2 Type ladder (the missing middle — install a real ladder, use extremes sparingly)
Serif display at weight **300–400** (light/regular reads luxurious; heavy reads loud).

| Role | Size | Tracking | Notes |
| --- | --- | --- | --- |
| **Display** (one hero moment/page) | `clamp(3.5rem, 8vw, 8rem)` | `-0.02em` | Playfair, weight 300–400 |
| **H1 / hero** | `clamp(2.75rem, 6vw, 5rem)` | `-0.02em` | |
| **H2 (section)** | `clamp(2rem, 4vw, 3.25rem)` | `-0.01em` | |
| **H3** | 22–26px | `-0.01em` | |
| **Lead / "breath" copy** | 20–24px, `leading-[1.6]` | 0 | the emotional voice |
| **Body** | 16–18px, `leading-[1.7–1.8]` | 0 | Niramit |
| **Eyebrow / overline** | `text-[11–13px]` uppercase | `0.2–0.28em` (≤0.3em) | THE anchor device |
| **Caption / micro** | `text-[10–12px]` | `0.15em` | floor at `text-[10px]` |

**Inverse-tracking law:** big type tightens (`-0.02em`), small type loosens (`0.2em+`). This one relationship carries most of the "editorial" feel. **Big OR tiny, rarely mid** — pair an oversized thin serif headline with a tiny wide-tracked eyebrow and little between.

### 3.3 Grid & composition
- 12-col grid; occupy asymmetric spans with offsets.
- Full-bleed breakout from a centered container:
  ```jsx
  <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen">…</div>
  ```
- Uneven columns (`grid-cols-[1.3fr_0.7fr]`), staggered vertical offsets, margin captions.

### 3.4 Ornament & CTA rules
- Retire the ubiquitous 48px gold hairline as the *only* section signal — keep it as one device among several, not the universal stamp.
- **Add a high-weight primary CTA** (the site currently has none — every CTA is a `text-[10px]` whisper). One filled/bordered primary per page for the true action (Reserve / Enquire); everything else = tracked-uppercase link + 1px left-grow underline.
- CTA verbs: **Reserve · Enquire · Discover · Plan Your Stay.** Never "Submit / Book Now!! / Learn More." For high-touch villas, lead with **Enquire** (concierge framing), Reserve secondary.

### 3.5 Imagery treatment
- Aspect ratios: heroes `16:9`/full-viewport; **portrait `3:4`/`4:5` for spotlight** (vertical crops are a strong luxury tell); `1:1` gallery tiles; `21:9` full-bleed bands.
- Alternate full-bleed (cinematic beats) with contained (editorial splits where white frames the image).
- Light scrims only where text sits on image (`bg-gradient-to-t from-black/40`); prefer text **beside** image over **on** it.
- One warm photographic grade across all images — **consistency is the luxury.**
- **Replace stock Unsplash on brand-critical pages** (Services, Properties hero) with owned property photography. The brand's taste is the product.

### 3.6 Motion tokens (drop into `globals.css` `@theme` + a JS `EASE` map)
```css
--ease-out-luxe:    cubic-bezier(0.22, 1, 0.36, 1);   /* default reveals & entrances */
--ease-out-soft:    cubic-bezier(0.16, 1, 0.3, 1);    /* hero text, large images */
--ease-in-out-luxe: cubic-bezier(0.77, 0, 0.175, 1);  /* clip-path curtains, page transitions */
--ease-standard:    cubic-bezier(0.4, 0, 0.2, 1);     /* hovers, small UI (≤300ms) */
--ease-out-quart:   cubic-bezier(0.25, 1, 0.5, 1);    /* underlines, arrows */
```
```ts
export const EASE = {
  outLuxe:[0.22,1,0.36,1], outSoft:[0.16,1,0.3,1],
  inOutLuxe:[0.77,0,0.175,1], standard:[0.4,0,0.2,1], outQuart:[0.25,1,0.5,1],
} as const;
```
**Avoid entirely:** springs with visible bounce, `backOut`/`anticipate` overshoot, `ease-in` alone. Overshoot reads as toy-like — wrong register.

---

## 4. Section Archetype Library (build these; rotate them)

The cure for repetition is a **richer vocabulary**, then disciplined alternation. Build these as reusable variants (extend `primitives.tsx`), replacing the single recycled spread.

1. **Cinematic hero** — 92–100vh, one image/video, Ken-Burns zoom, eyebrow (location) + light serif headline + one-sentence sub. Booking bar can dock here. _No paragraph in a hero, ever._
2. **Intro / mission "breath"** — contained, centered, lots of surrounding white, one 24–28px serif paragraph. Emptiness *is* the content.
3. **Editorial split (4 variants, rotate):** (a) offset image bleeding to edge; (b) asymmetric 4/8; (c) image-behind-text overlap with negative margin; (d) portrait spotlight + margin caption. Alternate image side each time.
4. **Full-bleed gallery band / triptych** — edge-to-edge, uneven columns, hairline or no gaps.
5. **Portrait spotlight** — one large `3:4` image + generous caption column.
6. **Big-number editorial stats** — oversized serif numerals, staggered columns (`md:col-start-8`), tiny uppercase labels. Not a symmetric row.
7. **Pull-quote** — near-empty section, oversized light serif quote in a huge field, tiny uppercase attribution. (Max one per page.)
8. **Numbered/indexed editorial list** — but give the recurring `01/02/03` at least **two structures** (vertical sticky list vs horizontal step-rail vs overlapping-card timeline) so it stops rhyming across pages.
9. **Horizontal snap-scroll rail** (rooms/experiences) — cards `snap-start w-[80vw] md:w-[38vw]`, next card peeking, hidden scrollbar. Use once per page max.
10. **Text-free "breath" image/video band** — the rhythm reset; insert every 2–3 sections.
11. **Quiet reservation/CTA band** — full-width muted tone, one serif line + one understated primary action. (Dark full-bleed bands already work on the site — lean on them more to break light monotony.)
12. **Amenities WITHOUT the icon grid** — prose-embedded facts, or need-based categories (Romance/Wellness/Adventure), or a captioned photo band. Retire the 3× identical gold-icon grids.

---

## 5. Motion & Interaction Spec

Stack is already installed: **framer-motion 12 + lenis 1.3** (Lenis is present but currently **unmounted/dead** — we wire it). No new deps.

### 5.1 Five reusable primitives (build in a shared motion module, all honor `useReducedMotion()`)
- **`<Reveal>`** — fade + `translateY(24px)→0`, 800ms, `--ease-out-luxe`, `once`, trigger ~15% in; groups stagger `80ms/child`. Default for everything.
- **`<RevealText>`** — line-masked heading: lines in `overflow:hidden`, inner `translateY(100%)→0`, 800ms, 80ms/line. H1/H2 only.
- **`<CurtainImage>`** — `clip-path: inset(0 0 100% 0)→inset(0)`, 1000ms `--ease-in-out-luxe`; inner `<img>` counter-scales `1.15→1.0` `--ease-out-soft`. **The single biggest "expensive" upgrade** the static site is missing.
- **`<ParallaxImage speed={0.1}>`** — `useScroll`→`useTransform` to `["-8%","8%"]`, wrapped in `useSpring`; parent `overflow:hidden`, image 120%. Auto-off on reduced-motion. **Keep intensity ≤10–15%** — more reads tacky.
- **`<KenBurns>`** — CSS keyframe `scale(1)→1.06` over 20s, `will-change:transform`. Freezes on reduced-motion.

### 5.2 Hero choreography (sequence under the ever-present slow zoom)
`t≈0` zoom starts → `200ms` eyebrow → `350ms` H1 line-mask (80ms/line) → `650ms` sub → `850ms` CTA. Each element `translateY(20–28px)+opacity`, 800ms `--ease-out-soft`.

### 5.3 Micro-interactions (CSS)
- **Link underline:** 1px `currentColor`, `scaleX(0)→1` from left on hover, 400ms `--ease-out-quart`.
- **Button:** fill-wipe pseudo `scaleX(0)→1` from left, 350ms `--ease-standard`, text crossfade — **no button scale-up**.
- **Image hover:** `scale(1)→1.04`, **700ms** `--ease-out-luxe` (slow+tiny = luxury; fast+big = e-commerce).
- **Arrow nudge:** `translateX(4–6px)`, 300ms. Never bounce.

### 5.4 Page transitions
Keyed `motion.main` on `pathname`, `AnimatePresence mode="wait"`, entrance `opacity+translateY(12px)`, **500ms**, exit ≤250ms. **Skip full-screen curtain overlays** — this is a booking site; navigation must never feel blocked. (A `PageTransition` component already exists — upgrade it, don't add a heavy cover.)

### 5.5 Smooth scroll (Lenis)
Mount one guarded `<SmoothScroll>` in the public layout: `lerp: 0.08`, `smoothWheel: true`, **`smoothTouch: false`**, **disabled on `prefers-reduced-motion`**. Drive parallax from Lenis's RAF so scroll-linked transforms stay in lockstep. Use `data-lenis-prevent` on modals/scrollable sub-regions.

### 5.6 Reduced-motion (currently respected NOWHERE — must ship globally)
CSS backstop in `globals.css`:
```css
@media (prefers-reduced-motion: reduce){
  *,*::before,*::after{animation-duration:.001ms!important;animation-iteration-count:1!important;
  transition-duration:.001ms!important;scroll-behavior:auto!important}
}
```
Plus `useReducedMotion()` to disable parallax/zoom/blur and swap video hero → poster. **Always render final state as default and animate _from_ it** so no content is ever invisible-forever if a reveal doesn't fire. Kill the current `AiConcierge` per-letter `filter: blur(12px)` animation (expensive; gate behind reduced-motion).

---

## 6. Media & Delivery Playbook

Foundation is already strong: `next/image` everywhere, AVIF-first config, `priority` on the right LCP images, maps code-split, `@ffmpeg` admin-only. Fill the gaps:

1. **Blur-up placeholders (the #1 perceived-perf upgrade — currently zero).**
   - Local `/public` art → **static imports** (`import hero from "@/public/hero.png"`): free `blurDataURL` + intrinsic dimensions.
   - Cloudinary/DB images → generate LQIP (`e_blur:1000,q_1,w_20`) and thread an **additive** `blurDataURL?` through `lib/property-media.ts` + `SafeImage`. Add a shared `<SmartImage>` wrapper so no one forgets `placeholder="blur"`.
2. **Next 16 note:** `priority` is deprecated in favor of `loading="eager" + fetchPriority="high"`. Standardize inside one `<HeroImage>` so it changes once.
3. **Video heroes:** layer a `next/image priority` **poster** behind the muted `<video>` (so the LCP frame gets `fetchPriority=high`); fade video in over 600–800ms on `canplay`. Below-fold bands (`BrochureVideoBand`): `preload="none"` + IntersectionObserver lazy-attach; poster only on reduced-motion / Save-Data.
4. **Fonts:** keep `next/font/google` (self-hosted, `display:swap`, latin subset). Wire **Niramit + Allura** here if adopting the brand-intent typography (see §9 Phase 0). Audit that every family is actually used above the fold; lazy/drop purely-decorative scripts. Never `<link>`/`@font-face`.
5. **Trim critical path:** `next/dynamic` the `SiteLoader` Lottie (off critical path; import the JSON once, shared with `AiConcierge`); `next/dynamic({ssr:false})` both floating widgets (`AiConcierge` + `WhatsAppFloat`) mounted after idle; pause idle `setInterval` animations when tab hidden.
6. **Animate only `transform`/`opacity`/`clip-path`.** Never `width/height/top/left/margin/background-color` on scroll.

### Budgets (mobile, 4G)
| Metric | Target | Lever |
| --- | --- | --- |
| LCP | ≤2.5s (aim 1.8s) | 1 priority hero w/ preload+`fetchPriority`; AVIF; no blocking font/JS ahead |
| CLS | <0.05 (aim ~0) | every image `fill` in aspect box (already done); size-adjust fonts |
| INP | <200ms | cut framer-motion where static; defer GT + concierge |
| TBT | <200ms | lazy floats; slim SiteLoader |
| Hero bytes | ≤~200KB AVIF | `c_limit,w_1920 + q_auto` |

---

## 7. Implementation Strategy

1. **Branch:** cut `feat/public-restyle` off `main`. (Prior uncommitted restyle is safely in backup branch `backup/work-2026-07-01`.)
2. **Freeze the boundary:** scope edits to `app/(public)`, `components/public`, `components/booking`, `components/ui/luxury-*`, `app/globals.css`. Exclude the §1.4 danger-zone files from bulk edits.
3. **Foundation first (no page yet):** finalize font wiring in `app/layout.tsx`; add motion/spacing/type tokens to `globals.css` (`@theme inline` + `@layer utilities`, **additive** — never edit the shadcn `:root` semantics); build the shared motion module (`<Reveal>`/`<RevealText>`/`<CurtainImage>`/`<ParallaxImage>`/`<KenBurns>`), the type-ladder classes, the `<SmartImage>`/`<HeroImage>` wrappers, the high-weight CTA variant, and the reduced-motion backstop; wire guarded Lenis.
4. **Page-by-page, safest → riskiest:**
   PURE pages first (privacy/terms/refund, services, about, visual-journey, success) to validate primitives → FAQ → LOGIC pages (home, properties, contact, for-owners, booking) editing **markup only** → **Brochure stack last**, one block at a time, verifying the admin live preview (`?preview=1`) after each.
5. **Keep green:** run `npx tsc --noEmit` and `npm run build` frequently. Because data contracts are frozen, type breakage should be near-zero.
6. **Verify portals untouched** after each batch: `/account` (uses public `Footer` + `ReviewImageGallery`) and admin property preview.

---

## 8. Phased Roadmap

- [ ] **Phase 0 — Decisions & branch.** Confirm typography (adopt Niramit/Allura vs keep current Inter/Dancing); cut `feat/public-restyle`.
- [ ] **Phase 1 — Foundation.** Tokens, type ladder, motion module + 5 primitives, `<SmartImage>`/`<HeroImage>`, CTA weight, reduced-motion backstop, guarded Lenis. _No visible page change yet; everything after builds on this._
- [ ] **Phase 2 — PURE pages.** Legal (shared template → add side rail/anchors), Services (kill 1 of 2 pull-quotes, replace stock, differentiate numbered list), About (rebuild the 4-module "Ethos" void), Visual-Journey (break the 13-in-a-row spreads), Booking-success (re-skin onto palette).
- [ ] **Phase 3 — FAQ.** Two-column (sticky category rail + accordion), add supporting imagery/contact block, tighten the cavernous padding.
- [ ] **Phase 4 — Home.** De-duplicate the two identical image+text spreads into distinct variants; real heading hierarchy (one display moment); decisive hero→story seam; one carousel becomes an editorial mosaic; primary CTA.
- [ ] **Phase 5 — LOGIC pages.** Properties (simplify cramped cards, owned imagery, restyle map band), Contact, For-Owners — markup only, handlers/field-names preserved.
- [ ] **Phase 6 — Brochure stack (highest value, most care).** Rotate section archetypes; merge the 3 icon grids; give Story/Sections/Reviews non-degenerate fallbacks (require a minimum image or collapse the band rather than show a thin text stub); alternating rhythm + breath bands; break the metronomic `py-28`. Verify preview after each block.
- [ ] **Phase 7 — Booking funnel.** Reconcile card/shadow language to the borderless hairline system; fix `text-[9px]` illegible calendar legend.
- [ ] **Phase 8 — QA & perf pass.** Reduced-motion, Lighthouse against §6 budgets, cross-device, portal regression check, `tsc`/`build` green.

---

## 9. Page-by-Page Redesign Brief

> Format: **current problem → target section sequence.** Content stays; composition changes.

### Home (`HomeClient.tsx`) — LOGIC (keep hero search → `/properties`)
The two image+text spreads (`:352` & `:460`) are the *same component inlined twice*; all four H2s are the identical `clamp(…,5.5rem)`; hero is only `80vh` with a soft dead seam.
**Target:** Cinematic hero `92vh` + Ken-Burns + docked search (decisive bottom edge) → mission "breath" → editorial split **variant A** (image-left, bleed) → full-bleed breath band → Collection rail → big-number provenance stats → **variant C** (overlap, dark) "Conscious Hospitality" → numbered journeys as **horizontal step-rail** (not the recycled sticky list) → VisualJourney as **editorial mosaic** (so the two carousels stop rhyming) → pull-quote → reviews (real hierarchy, drop single-letter avatars) → quiet invitation CTA with one primary button.

### About (`AboutPageClient.tsx`) — PURE
"The Ethos" is four visually identical blocks with `pt-12` voids and one image for four modules — the emptiest passage on the site.
**Target:** hero → mission split with drop-cap → **stats moved up** as a big-number band → "Ethos" rebuilt as **numbered editorial + paired imagery** (image every module or a portrait spotlight) → people split → single pull-quote close. Make the italic-gold-word hero treatment a repeated signature or drop it.

### Services (`services/page.tsx`) — PURE
Two centered italic pull-quotes within three screens; stock Unsplash on the brand-taste page; numbered list identical to Home/For-Owners.
**Target:** hero → keep **one** pull-quote → services as **need-based categories or captioned photo band** (not a 6-card grid) → replace stock with owned photography → consulting as a **distinct** step format → primary CTA.

### For-Owners (`ForOwnersClient.tsx`) — LOGIC (enquiry form fields preserved)
Third instance of sticky+numbered list; `100svh` hero holding one heading + two whispers.
**Target:** hero with real content anchor (stat or sub) → "Why" split → four-steps as **overlapping-card timeline** → portfolio rail → enquiry: keep glass form, restyle to hairline system, add primary submit weight.

### Contact (`contact/page.tsx`) — LOGIC (fields: name/email/subject/message)
Functional but plain; three repeated bordered-icon rows.
**Target:** hero → asymmetric info+form; contact rows as a **hairline-divided definition list**; add a location/imagery anchor to shape the whitespace.

### FAQ (`faq/page.tsx`) — PURE (keep accordion)
`pt-40 pb-20` + `py-32` around 5 one-line rows in `max-w-4xl` — the most literally-empty page.
**Target:** **two-column** — sticky category rail (left) + accordion (right); add a supporting image or "still have questions? Enquire" block; tighten padding.

### Legal — privacy / terms / refund — PURE (three structural clones)
Narrow single column, wide dead gutters, no navigation.
**Target:** shared template with a **sticky section-anchor rail** (left) + readable measure (right), running header; retire the boxed article border. One template, three pages.

### Visual-Journey (`VisualJourneyPage.tsx`) — PURE
13 consecutive identical alternating spreads.
**Target:** chapter into rhythm groups — intersperse full-bleed breath bands, a portrait spotlight, a stats/quote beat, and 2–3 spread **variants** so 13 tiles never repeat consecutively. Keep the sophisticated split-panel lightbox (`VisualJourney.tsx:127`) as a model.

### Properties listing (`PropertiesClient.tsx`) — LOGIC (filters/pagination/map preserved)
Cards are cramped (3-col micro-table + chips + chevron); stock hero.
**Target:** owned hero image; cards simplified to **image + name + location + one price line** (drop the micro-table); restyle the dark map band to the hairline system; keep `buildQuery`/pagination intact.

### Property Detail — Brochure stack — DANGER ZONE (preview + contracts)
Three identical icon grids (`FeatureStrip`/`Facilities`/`StayDetails`); two back-to-back alternating spreads (`Sections`→`Rooms`); metronomic `py-28`; every CTA a whisper; **degrades to long runs of thin centered text** when a property lacks images.
**Target render rhythm:** Hero (curtain/Ken-Burns) → docked booking bar → Story → **Sections rotated through spread variants** → full-bleed PhotoBand (raise the 3-image cap where available) → **Rooms as a horizontal rail** → **merge the three icon grids into one differentiated Facilities moment** → VideoBand (lazy) → StayDetails as editorial stats → Location → Reviews (real empty-state, not one italic line) → FullGallery (masonry, mixed ratios) → Reservation (primary CTA). **Non-degenerate fallbacks:** require a minimum image or collapse a band entirely rather than render a thin stub. **Keep every prop name, the `PropertyDetail`/`SectionData` shape, and the `usePreview()` motion/pointer gate.**

### Booking flow (`components/booking/*`) — LOGIC (availability + `/api/bookings`, draft, honeypot)
Uses cards/borders/`shadow-sm` — a language the brochure forbids; calendar legend `text-[9px]` near-illegible.
**Target:** reconcile to borderless hairline system; legible legend (`text-[11px]`, higher contrast); keep numbered steps, calendar logic, field names, redirects.

### Booking success (`booking-request/success/page.tsx`) — PURE
Off-palette `#E6E2DA` mono "folio" — disconnected from the brand.
**Target:** re-skin to navy/gold/cream + shared type while keeping the distinctive "confirmation folio" concept.

---

## 10. Component / Primitive Work (build once, reuse everywhere)

**Extend `components/public/property/primitives.tsx` (already the cleanest set — `SafeImage`, `RevealImage`, `FadeUp`, `Eyebrow`, `GoldRule`, `SectionHeading`, `Prose`):**
- Consolidate the 6+ locally-redeclared `FadeUp` copies into one shared `<Reveal>`.
- Add the type-ladder components/classes and the 4 editorial-split variants.
- Add `<CurtainImage>`, `<ParallaxImage>`, `<KenBurns>`, `<RevealText>` to one shared motion module; consolidate `ParallaxCard`/`ParallaxFigure`/`ImmersiveSection`.

**Adopt the unused `globals.css` utilities** (`.grand-title`, `.luxury-title/subtitle/body`, `.btn-luxury(-solid)`, `--text-hero`) as the single source of truth; add a **high-weight primary CTA** variant to `luxury-button.tsx` (keep its sliding-fill mechanics + API).

**Add** `<SmartImage>` (blur default) and `<HeroImage>` (Next-16 `fetchPriority` pattern) wrappers.

---

## 11. Risk Register & Acceptance

**Do NOT touch:** portal trees + components; `property-form-preview.tsx` + `previewMode`/`PreviewContext` contract; `types.ts` + `lib/property-media.ts` signatures; all `page.tsx` data-fetching; API routes, `fetch()` targets, form field `name`s; i18n (Google Translate mount + `LanguageSwitcher` + `.goog-*` CSS); Leaflet maps (client-only dynamic imports + `.src-popup` CSS); honeypots/localStorage drafts.

**Acceptance criteria per phase:**
- `npx tsc --noEmit` clean · `npm run build` succeeds.
- Admin "Live Page Preview" renders statically (motion off, `pointer-events:none`) after any Brochure change.
- `/account` (guest) unaffected (Footer + ReviewImageGallery).
- No two adjacent sections share width+alignment+density (P2).
- Every empty field has an anchor (P1). One primary CTA per page (P4).
- Reduced-motion delivers a complete, non-broken page; no invisible-forever content.
- §6 budgets met (LCP/CLS/INP/TBT).

---

## Appendix — Research Sources

**Quiet-luxury / restraint:** aman.com, nihi.com (direct), TYPZA minimalist-luxury, Mediaboom luxury-hotel design, DesignRush Cheval Blanc, BP&O Aman identity, Subframe editorial examples, Better Web Type rhythm.
**Content-rich luxury:** Belmond & Rosewood Hong Kong (live teardowns), DesignRush/Latterly/IT-Consultis Banyan Tree, Four Seasons/Ritz-Carlton conventions, Smashing Magazine editorial CSS-Grid, HomeRunner booking-flow UX.
**Motion:** Emil Kowalski (clip-path), Josh W. Comeau (scroll-driven), Motion/framer-motion easing & scroll docs, Codrops (clip-path/stagger reveals), Tobias Ahlin (underlines), Lenis (darkroom.engineering), Awwwards hospitality collection.
**Internal audits:** full read of `app/(public)/**`, `components/public/**`, `components/booking/**`, `components/ui/luxury-*`, `app/globals.css`, `next.config.ts`, `app/layout.tsx`, the `Brochure*` stack + `primitives.tsx`/`types.ts`, and `lib/property-media.ts`.
