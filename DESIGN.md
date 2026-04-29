---
name: Salt Route Consulting
description: Luxury boutique property stays and consulting platform — warmth and precision on a historic route.
colors:
  deep-navy: "#1B3A5C"
  navy-mid: "#2A4F7A"
  navy-dark: "#102943"
  owner-dark: "#0C1F33"
  warm-gold: "#C9A96E"
  gold-light: "#DBCBAA"
  gold-deep: "#A88B4A"
  cream: "#FFFDF8"
  sand: "#FBF9F4"
  sand-mid: "#F0EBE0"
  bone: "#F9F7F2"
  beige: "#F5F1E8"
  muted-navy: "#1B3A5C90"
  border-ghost: "#1B3A5C15"
  destructive: "#B84040"
typography:
  display:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "clamp(2.5rem, 6vw, 5.5rem)"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)"
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: "0"
  title:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 300
    lineHeight: 1.8
    letterSpacing: "0"
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "0.4em"
rounded:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
  3xl: "64px"
components:
  button-primary:
    backgroundColor: "{colors.deep-navy}"
    textColor: "{colors.cream}"
    rounded: "{rounded.sm}"
    padding: "12px 32px"
  button-primary-hover:
    backgroundColor: "{colors.navy-mid}"
    textColor: "{colors.cream}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.deep-navy}"
    rounded: "{rounded.sm}"
    padding: "12px 32px"
  button-ghost-hover:
    backgroundColor: "{colors.beige}"
    textColor: "{colors.deep-navy}"
  button-gold:
    backgroundColor: "{colors.warm-gold}"
    textColor: "{colors.cream}"
    rounded: "{rounded.sm}"
    padding: "12px 32px"
  input-default:
    backgroundColor: "{colors.bone}"
    textColor: "{colors.deep-navy}"
    rounded: "{rounded.sm}"
    padding: "10px 14px"
  card-surface:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.deep-navy}"
    rounded: "{rounded.md}"
    padding: "24px"
  card-surface-hover:
    backgroundColor: "{colors.bone}"
    textColor: "{colors.deep-navy}"
---

# Design System: Salt Route Consulting

## 1. Overview

**Creative North Star: "The Salt Route Itself"**

The ancient salt trading routes of the Himalayas connected cultures through contrast — dark mountain passes opening into warm valleys, precision of the merchant's ledger alongside the richness of what was traded. This design system lives in that same tension. Deep navy and warm gold are not decoration; they are the two truths of the brand: reliable authority and generous warmth. Old-world serif display type sits alongside a sharp, modern sans-serif. The interface earns attention through proportion, not ornament.

This is not a travel booking platform that looks like every other OTA. It is a consulting and hospitality product for people who have already decided they want something rare. The design system's job is to confirm that decision at every interaction. Tonal layering replaces shadows — depth is conveyed by surfaces sitting inside other surfaces, never by decoration floating above them. Every screen has exactly one visual center of gravity.

This system rejects: Booking.com's deal-hunting urgency and cluttered orange hierarchy; SAP-style enterprise density with no breathing room; gray-on-gray SaaS anonymity; and glassmorphism's decorative blur-and-transparency habit. If it looks like it could be any product in any category, it has failed.

**Key Characteristics:**
- Warmth and authority coexist — never one without the other
- Tonal depth, not shadow depth — surfaces layer, not float
- Playfair Display for presence; Inter for clarity
- Gold is used at a ratio of less than 10% of any screen surface
- Responsive at every breakpoint without losing the premium register

## 2. Colors: The Salt Route Palette

Two primary materials — deep Himalayan navy and warm trade-route gold — with a full tonal range of cream neutrals that reads as paper, not plastic.

### Primary
- **Deep Himalayan Navy** (`#1B3A5C`): The load-bearing color. Used for all body text, primary navigation, filled primary buttons, and the admin sidebar icon tray. This is the brand's confident ground note.
- **Navy Mid** (`#2A4F7A`): Interactive state of Deep Navy. Hover backgrounds on sidebar items, secondary filled elements, active tab backgrounds in the dark (owner) shell.
- **Night Pass** (`#102943`): The dark-end anchor. Used as the owner portal's main content background and the darkest surface in any dark-themed component.
- **Owner Dark** (`#0C1F33`): Owner sidebar background only. The deepest tone in the palette, reserved for the navigation container.

### Secondary
- **Warm Trade Gold** (`#C9A96E`): The accent. Luxury button fill, active state indicators, the `.gold-rule` divider, owner sidebar right-edge highlight. **The Gold Rule:** gold appears on fewer than 10% of any given screen surface. Its rarity is the signal.
- **Gold Light** (`#DBCBAA`): Gold at reduced intensity. Used for light-theme chip borders, secondary gold accents, and subtle warm tints on hover states.
- **Gold Deep** (`#A88B4A`): The pressed or active state for gold elements. Used for the `button-gold` active/pressed state.

### Neutral
- **Cream** (`#FFFDF8`): The primary surface. Background for cards, popovers, modals, and the guest portal main canvas. Off-white tinted toward gold — never pure white.
- **Sand** (`#FBF9F4`): The page canvas background for guest and public portals. One tone darker than cream; the difference signals that cards float above the page, not beside it.
- **Sand Mid** (`#F0EBE0`): The secondary surface step — muted backgrounds, table row alternation, section separators.
- **Bone** (`#F9F7F2`): Input field fill. Slightly warmer than cream, creates gentle contrast against card surfaces without introducing a visible border.
- **Beige** (`#F5F1E8`): Ghost button hover, muted chip fills, table header backgrounds.
- **Border Ghost** (`#1B3A5C` at 8% opacity): The default border color. Subtle directional mark, never a feature. One weight only.
- **Destructive** (`#B84040`): Error states, destructive action confirmations. Used in text and icon form only — never as a filled background larger than a badge.

### Named Rules
**The Gold Rule.** Warm Trade Gold appears on fewer than 10% of any given screen. One active indicator, one divider, one button per view. Use it more and it becomes beige.

**The No Pure White Rule.** Every surface uses a tinted neutral. `#FFFDF8`, `#FBF9F4`, `#F9F7F2`. Never `#ffffff`. The warmth is the brand.

## 3. Typography

**Display Font:** Playfair Display (fallback: Georgia, serif)
**Body Font:** Inter (fallback: system-ui, sans-serif)

**Character:** Playfair Display carries the prestige of hand-set editorial type — generous contrast, bracketed serifs, designed for large sizes. Inter is clean, neutral, and highly legible at small sizes. Together they create the brand's defining tension: old-world warmth in the headings, modern precision in the UI.

### Hierarchy
- **Display** (400 weight, clamp(2.5rem → 5.5rem), line-height 1.05, tracking -0.01em): Page-level hero headings only. One per page, maximum. The guest portal welcome greeting and property detail hero title.
- **Headline** (400 weight, clamp(1.75rem → 2.5rem), line-height 1.15): Section headings within a page. Admin dashboard section titles, owner portal property names, guest account section headers.
- **Title** (Inter 600, 1.125rem, line-height 1.3): UI container headings. Card titles, modal headers, sidebar section labels. The boundary between editorial and functional type.
- **Body** (Inter 300, 1rem, line-height 1.8): All paragraph text. Capped at 70ch. Light weight — the generous line-height compensates. Never use body weight below 300 in running text.
- **Label** (Inter 500, 0.75rem, letter-spacing 0.4em, uppercase): Category labels, portal section subtitles, table column headers, badge text. Uppercase is reserved for this role alone.

### Named Rules
**The One Serif Rule.** Playfair Display appears in headings (Display and Headline roles) and nowhere else. UI labels, button copy, form fields, navigation items — all Inter. Never mix Playfair into body copy.

**The Uppercase Ceiling.** Uppercase letter-spacing (`tracking-[0.4em]`) is reserved for Label-role type only. Buttons, headings, and body text are sentence case or title case. One uppercase role per system.

## 4. Elevation

This system uses tonal layering exclusively. No box-shadows anywhere in the base design. Depth is created by nesting lighter surfaces inside darker backgrounds — cream cards on sand pages, bone inputs inside cream cards. The eye reads the relative lightness as proximity.

The owner shell is an inversion: darker surfaces layer on top of darker backgrounds, with the deepest tone (`#0C1F33`) at the navigation layer and progressively lighter navy (`#102943`, `#1B3A5C`) as content rises toward the foreground.

### Shadow Vocabulary
None at rest. No ambient shadows, no card lifts, no drop shadows on navigation elements.

For **interactive feedback only**, a single focus ring is permitted: `0 0 0 3px rgba(201,169,110,0.5)` — gold tint, not shadow. This applies to focused inputs and buttons and is the sole elevation exception.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest. Focus ring (gold, 3px) appears only on keyboard-focused interactive elements. No shadow appears in response to hover. If you need to signal interactivity, change the background color — not the shadow.

## 5. Components

### Buttons
Warm and approachable — gently filled, rounded, satisfying transitions. Not thin-bordered, not flat-ghost-only.

- **Shape:** Gently rounded (8px). Not pill-shaped, not sharp.
- **Primary (navy fill):** Deep Navy background (`#1B3A5C`), Cream text. 12px vertical / 32px horizontal padding. Hover: Navy Mid (`#2A4F7A`). Uppercase tracking-[0.2em] for luxury variants, sentence case for action buttons.
- **Gold (accent fill):** Warm Trade Gold background. Cream text. Same padding. Use sparingly — maximum one gold button per view. Pressed: Gold Deep.
- **Ghost:** Transparent background, Deep Navy text, Border Ghost border (1px). Hover: Beige fill. The secondary action button.
- **Destructive:** `#B84040` at 10% opacity background, `#B84040` text. No filled destructive buttons except in confirmation dialogs.
- **Transition:** `background-color 200ms ease-out`. Nothing else. No scale, no shadow, no translate.

### Inputs / Fields
- **Style:** Bone fill (`#F9F7F2`), no visible border at rest. Border Ghost (1px) appears on focus. Radius 8px. Padding 10px horizontal, 10px vertical. Height 40px (default).
- **Focus:** Border shifts to Warm Trade Gold. Gold focus ring appears (`box-shadow: 0 0 0 3px rgba(201,169,110,0.5)`).
- **Error:** Border and ring shift to Destructive (`#B84040`). Error message in Destructive color below the field.
- **Disabled:** 50% opacity. No border, no background change. The reduced opacity signals unavailability without a separate color.

### Cards / Containers
Surfaces, not boxes. Cards layer tonally, not structurally.

- **Corner Style:** 12px radius — noticeably but not aggressively rounded.
- **Guest portal cards:** Cream (`#FFFDF8`) on Sand (`#FBF9F4`) background. No border at rest; Border Ghost (1px) added on hover.
- **Admin cards:** White on slate-50 background. 1px `ring-foreground/10` always visible.
- **Owner portal cards:** `#1B3A5C` surface on `#102943` background. No border.
- **Internal Padding:** 24px all sides (default). 16px for compact/sidebar cards.
- **Nested cards are prohibited.** Never place a card component inside another card component.

### Navigation (Admin Sidebar)
Clean white panel, slate-50 border-right. Icon tray compact at 56px when collapsed, full-width nav labels at 224px when expanded.

- **Inactive items:** Navy/70 icon and label, no background.
- **Hover:** Slate-50 background, Navy icon and label.
- **Active:** Gold left-accent stripe replaced by Deep Navy background fill and White text. (Note: any left-stripe colored accent wider than 1px is banned in cards and alerts — sidebar active items are the sole exception due to navigation convention, using a background fill, not a border stripe.)
- **Section dividers:** 1px slate-200 line.

### Navigation (Owner Sidebar)
Dark luxury panel at 280px. Owner-Dark (`#0C1F33`) background, gold accent detail on right edge at 1px.

- **Logo area:** Playfair Display brand name, Gold color.
- **Inactive items:** Sand/85 text, no background.
- **Hover:** Navy Mid background (`#2A4F7A` at 30% opacity), Sand text.
- **Active:** Navy Mid background, Gold text, gold left accent line (1px — navigation convention only).

### Guest Account Navigation
Horizontal sticky header on mobile/tablet, sidebar on desktop. Cream/translucent background with backdrop blur. Tab navigation with icon + label.

- **Active tab:** Gold bottom border (2px), Deep Navy text.
- **Inactive tab:** Muted Navy text, no border.

### The Gold Rule Divider (Signature Component)
A 48px × 1px horizontal rule in Warm Trade Gold at 50% opacity (`rgba(201, 169, 110, 0.5)`). Used to mark section transitions in the public and guest portal views. Never used in admin or form contexts. It is a pacing device, not decoration.

## 6. Do's and Don'ts

### Do:
- **Do** use Playfair Display exclusively for Display and Headline roles. Inter for everything else.
- **Do** tint every background surface toward gold. `#FFFDF8`, `#FBF9F4`, `#F9F7F2`, `#F5F1E8`. Never pure `#ffffff`.
- **Do** use tonal layering to create depth. Lighter cream on slightly darker sand. Confirm depth by comparing hex values, not by adding shadows.
- **Do** use Warm Trade Gold (`#C9A96E`) on fewer than 10% of any given screen. Reserve it for the single most important accent per view.
- **Do** cap body line length at 65-75ch. Generous line-height (1.8) compensates for Inter Light weight.
- **Do** use Border Ghost (`#1B3A5C` at 8%) for any border that is structural (not decorative). One weight, one opacity.
- **Do** treat mobile as first-class. Sidebar collapses to a bottom drawer, tables become stacked cards, font scale tightens at sm breakpoint.
- **Do** use font-light (300) for body copy and font-semibold (600) for UI labels and titles — the contrast is the hierarchy.
- **Do** write action button copy in sentence case. Reserve uppercase for Label-role type only.

### Don't:
- **Don't** use Booking.com-style urgency patterns: countdown timers, red "X rooms left" badges, bright orange CTAs, price-first hierarchy.
- **Don't** build enterprise-density layouts (SAP / Salesforce style): modal-stacked workflows, dense table forms with 20+ columns visible, toolbars with 15 icon buttons, no whitespace.
- **Don't** use gray-on-gray neutral palettes that could belong to any SaaS product. If removing the logo makes it unidentifiable, the design has failed.
- **Don't** use glassmorphism or decorative blur: frosted cards, purple/pink gradients, backdrop-filter as an ambient style.
- **Don't** use `border-left` or `border-right` wider than 1px as a colored accent stripe on cards, alerts, or list items. Use background tints instead.
- **Don't** use `background-clip: text` with gradient fills for decorative text.
- **Don't** put a card inside a card. Nested cards are always wrong.
- **Don't** use pure `#000000` or `#ffffff` anywhere. Tint every neutral.
- **Don't** use box-shadows for ambient depth. Tonal surface layering is the elevation method. The only permitted shadow is the gold focus ring.
- **Don't** add a second uppercase style. The label role (`tracking-[0.4em]`, uppercase) is the only uppercase in the system. Buttons and headings are sentence case.
- **Don't** use Playfair Display below 1.5rem. At small sizes it loses the quality that justifies its use.
