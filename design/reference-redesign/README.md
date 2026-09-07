# Salt Route reference redesign

The supplied Summit River Lodge screenshots guide the public website layout: image-led heroes, centered serif headings, spacious cream sections, two-column accommodation layouts, and a full-screen navigation curtain. Salt Route retains navy (#1B3A5C), gold (#C9A96E), cream (#FFFAF3), and the existing SRC logo.

The eight generated PNGs are early section references. `design-prompts.json` records their section prompts. The user's subsequent request for simplicity supersedes the generated contour patterns, ornamental lines, and extra borders. Generated logos and sample content are not production assets.

## Supplied photography

Originals remain untouched in `C:/Users/HELIOS/Downloads/Photos for the Saltroute`. The selected photographs are optimized as WebP files under `public/images/saltroute`. Source names and file sizes are recorded in `supplied-photo-sources.json`; `supplied-photo-sheet.jpg` records the visual review of all 13 originals.

| Source | Placement |
| --- | --- |
| Hike-32 | Homepage hero; itinerary and travel sections |
| Jitpur-84 | Homepage personal connection; Our Story community section |
| Breakfast-25 | Homepage experiences mosaic; Contact; owner hospitality sections |
| Breakfast-8 | Experiences hero |
| Tea Gardens-17 | Our Story and Contact heroes |
| Jitpur-30 | Our Story landscape and stewardship sections |
| Cabin House-3 | Our Story people section; cultural experiences |
| Bar House-27 | Our Story handcrafted details |
| Hike-19 | FAQ hero |
| Lucky Dairy-1 | Local food experiences |

Portrait alternatives were reviewed but not forced into unrelated content. Journal and Visual Journey imagery was left unchanged during the supplied-photo update. Actual property and room photography remains linked to its property; stock imagery is retained only for contexts missing suitable supplied photographs, such as a business planning workspace. Earlier property-derived photos are documented in `photo-sources.json`.

## Verification

- TypeScript check and changed-file ESLint passed.
- Existing unit suite: 62 tests passed across 6 files.
- Production build passed after the supplied-photo update; `build.log` records the result.
- Desktop and 390px mobile layouts checked in the browser; no horizontal overflow on tested public routes.
- Checked navigation open/close and Escape, native dialog focus behavior, property lightbox, room selection, collection pagination, and guestbook controls.
- Confirmed the menu backdrop is transparent while the navy panel translates vertically in both directions, so no blue popup precedes the curtain.
- Lighthouse was attempted against the development server; Chrome cleanup failed with Windows EPERM. The partial report is not a production score. It includes existing Google Translate accessibility and development-bundle performance findings.
- Whole-repository lint has existing failures outside the changed public frontend; changed-file lint is clean.

The local preview runs at http://localhost:3002. Authentication, portals, bookings, and property data services retain their existing behavior.
