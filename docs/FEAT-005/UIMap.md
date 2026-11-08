---
feature_code: FEAT-005
service: sandbox-svc
version: 1
status: complete
spec_version: 1
figma_files:
  - url: https://www.figma.com/design/CNORy5Y7vLealwt9G4yniZ/Micro-Interaction--Website--v1.0.0
    file_key: CNORy5Y7vLealwt9G4yniZ
    last_modified: 2026-04-09T07:29:17Z
completeness:
  scope_confirmed: covered
  requirement_mapping: covered
  page_inventory: covered
  navigation: covered
  content_and_fields: covered
  states: covered
  interactions: covered
  motion: covered
  responsive: covered
  design_tokens: covered
  components: covered
  assets: covered
open_questions: []
derived_confirmed: 2026-11-08
pr_history: []
pr_url: https://github.com/william22913/sandbox-docs/pull/27
last_updated: 2026-11-08
---

# UI Map - FEAT-005

FEAT-005 adds one hover surface to the existing FEAT-004 header badge: the
text `N favorites (M discontinued)`, backed by `GET /v1/favorites/summary`
and fetched on first hover. It adds no page, no route and no navigation.
Requirements live in `spec.md` (v1); this document records the screen those
requirements imply.

The Figma file is a component and micro-interaction library, not a FEAT-005
screen. On the designer's instruction this pass reuses the closest existing
styling: the tooltip follows the file's Small Tooltip pattern
(`w_tltips_up_s`, placed below its anchor) and the badge stays exactly
FEAT-004's `w_bdg_number_s`. Every adapted detail is tagged `derived` and is
also listed in Open design gaps.

## Figma sources

| File | URL | Version / last modified | Role | Pages / frames used |
|---|---|---|---|---|
| Micro Interaction (Website) v1.0.0 | https://www.figma.com/design/CNORy5Y7vLealwt9G4yniZ/Micro-Interaction--Website--v1.0.0 | v2340357895799579884, modified 2026-04-09T07:29:17Z | Pattern library. No FEAT-005-specific frame. The designer asked for the closest existing tooltip, badge and hover styling, so the Specs and Interactions sections are read as patterns | 📐 Specs: `Tooltip` [544:163373](https://www.figma.com/design/CNORy5Y7vLealwt9G4yniZ/Micro-Interaction--Website--v1.0.0?node-id=544-163373), `Badge` [1730:18418](https://www.figma.com/design/CNORy5Y7vLealwt9G4yniZ/Micro-Interaction--Website--v1.0.0?node-id=1730-18418); ❖ Interactions: `Interaction - Tooltip` [5620:80131](https://www.figma.com/design/CNORy5Y7vLealwt9G4yniZ/Micro-Interaction--Website--v1.0.0?node-id=5620-80131), `Interaction - Web Tooltip` [982:40295](https://www.figma.com/design/CNORy5Y7vLealwt9G4yniZ/Micro-Interaction--Website--v1.0.0?node-id=982-40295); pattern instance `Web Badge` [3965:42609](https://www.figma.com/design/CNORy5Y7vLealwt9G4yniZ/Micro-Interaction--Website--v1.0.0?node-id=3965-42609) |

## Requirement mapping

`Frame link` is only for a frame that really shows the feature. This feature
has no drawn frame, so every row is built from a followed pattern and the
frame lives in `Follows`.

| REQ | Requirement | Page | Frame name | Frame link | Follows | Source | Notes |
|---|---|---|---|---|---|---|---|
| REQ-001 | The client calls `GET /v1/favorites/summary` on first hover | Shared app shell | `Tooltip` (pattern) | - | [544:163373](https://www.figma.com/design/CNORy5Y7vLealwt9G4yniZ/Micro-Interaction--Website--v1.0.0?node-id=544-163373) | derived | Fetch is triggered by hovering the visible badge, not on app load (REQ-007); the request has no input |
| REQ-005 | Hovering the visible badge shows `N favorites (M discontinued)` with exact integers | Shared app shell | `Tooltip` (pattern) | - | [544:163373](https://www.figma.com/design/CNORy5Y7vLealwt9G4yniZ/Micro-Interaction--Website--v1.0.0?node-id=544-163373) | figma, derived | Copy is spec-mandated; surface, type and arrow follow `w_tltips_up_s`. The badge's `99+` cap never applies to N |
| REQ-006 | The tooltip is shown only while the FEAT-004 badge is visible | Shared app shell | `Tooltip` (pattern) | - | [544:163373](https://www.figma.com/design/CNORy5Y7vLealwt9G4yniZ/Micro-Interaction--Website--v1.0.0?node-id=544-163373) | derived | When the badge is hidden there is no hover target and no fetch |
| REQ-007 | First-hover fetch; an already-fetched summary refreshes after favorite/un-favorite | Shared app shell | `Tooltip` (pattern) | - | [544:163373](https://www.figma.com/design/CNORy5Y7vLealwt9G4yniZ/Micro-Interaction--Website--v1.0.0?node-id=544-163373) | derived | No fetch on app load. A never-fetched summary stays first-hover-driven |
| REQ-008 | Loading or failed summary shows no tooltip; the badge is unaffected; later success shows it | Shared app shell | `Tooltip` (pattern) | - | [544:163373](https://www.figma.com/design/CNORy5Y7vLealwt9G4yniZ/Micro-Interaction--Website--v1.0.0?node-id=544-163373) | derived | No spinner, error icon or toast |
| REQ-012 | Zero favorites is a valid `{0,0}` response and shows nothing | Shared app shell | `Web Badge` (pattern) | - | - | derived | The FEAT-004 badge is a component specimen, not a screen: `Web Badge` (3965:42609). FEAT-004 hides it at 0, so there is no hover target and no tooltip |
| REQ-014 | When every favorite is discontinued, N and M are equal | Shared app shell | `Tooltip` (pattern) | - | [544:163373](https://www.figma.com/design/CNORy5Y7vLealwt9G4yniZ/Micro-Interaction--Website--v1.0.0?node-id=544-163373) | derived | Same template, for example `3 favorites (3 discontinued)` |
| REQ-015 | Hovering where a hidden badge would be shows nothing and fetches nothing | Shared app shell | `Web Badge` (pattern) | - | - | derived | The FEAT-004 badge is a component specimen, not a screen: `Web Badge` (3965:42609). The empty slot is not a hover target |
| REQ-016 | Loading or failure shows no tooltip, spinner, error icon or toast; the badge is unchanged | Shared app shell | `Tooltip` (pattern) | - | [544:163373](https://www.figma.com/design/CNORy5Y7vLealwt9G4yniZ/Micro-Interaction--Website--v1.0.0?node-id=544-163373) | derived | The unchanged FEAT-004 badge is the only visible element in these states |
| REQ-017 | A `500` is treated like any summary error | Shared app shell | `Tooltip` (pattern) | - | [544:163373](https://www.figma.com/design/CNORy5Y7vLealwt9G4yniZ/Micro-Interaction--Website--v1.0.0?node-id=544-163373) | derived | No tooltip; the badge is unchanged; a later hover may retry |
| REQ-018 | A pre-action summary is never shown again after favorite/un-favorite | Shared app shell | `Tooltip` (pattern) | - | [544:163373](https://www.figma.com/design/CNORy5Y7vLealwt9G4yniZ/Micro-Interaction--Website--v1.0.0?node-id=544-163373) | derived | Old values are dropped at once; no tooltip until the refresh succeeds |
| REQ-021 | The FEAT-004 badge is unchanged | Shared app shell | `Web Badge` (pattern) | - | - | figma | The FEAT-004 badge is a component specimen, not a screen: `Web Badge` (3965:42609). Count source, exact-count/`99+` format, visibility and refresh behaviour are untouched. The badge only gains a hover target |
| REQ-023 | The same successful action refreshes an already-fetched summary | Shared app shell | `Tooltip` (pattern) | - | [544:163373](https://www.figma.com/design/CNORy5Y7vLealwt9G4yniZ/Micro-Interaction--Website--v1.0.0?node-id=544-163373) | derived | Shares the FEAT-004 trigger; no new timer or listener |
| REQ-027 | Hover shows exact N and M even at `99+`; a hidden badge shows nothing | Shared app shell | `Tooltip` (pattern) | - | [544:163373](https://www.figma.com/design/CNORy5Y7vLealwt9G4yniZ/Micro-Interaction--Website--v1.0.0?node-id=544-163373) | derived | Acceptance of REQ-005, REQ-006 and REQ-015 |
| REQ-028 | Loading, failed or `500` shows no tooltip and the badge is unchanged | Shared app shell | `Tooltip` (pattern) | - | [544:163373](https://www.figma.com/design/CNORy5Y7vLealwt9G4yniZ/Micro-Interaction--Website--v1.0.0?node-id=544-163373) | derived | Acceptance of REQ-008, REQ-016 and REQ-017 |
| REQ-029 | The next tooltip after an action reflects the new values | Shared app shell | `Tooltip` (pattern) | - | [544:163373](https://www.figma.com/design/CNORy5Y7vLealwt9G4yniZ/Micro-Interaction--Website--v1.0.0?node-id=544-163373) | derived | Acceptance of REQ-007, REQ-018 and REQ-023 |

### Requirements without UI

| REQ | Reason |
|---|---|
| REQ-002 | Response shape. It surfaces only through the two tooltip values; no independent UI |
| REQ-003 | Counting rule for `total`. It surfaces only through N |
| REQ-004 | Counting rule for `discontinued`. It surfaces only through M |
| REQ-009 | Response validation (non-negative integers, `0 <= M <= N`). Backend only |
| REQ-010 | Ownership scoping from the auth context. Backend only; its only UI consequence is that a user never sees another user's numbers |
| REQ-011 | No request input can influence the counts. Backend only |
| REQ-013 | `401` for anonymous callers. Anonymous visitors never render the badge or tooltip (FEAT-004), so there is no new UI state |
| REQ-019 | Dependency on FEAT-001's `favorite_items` and discontinued status. No UI |
| REQ-020 | Dependency on FEAT-001's row-ownership rule. No UI |
| REQ-022 | Dependency on the shared auth middleware. No UI |
| REQ-024 | Backend acceptance criterion; it verifies REQ-001 to REQ-004, REQ-009, REQ-012 and REQ-014 |
| REQ-025 | Backend acceptance criterion for `401` |
| REQ-026 | Backend acceptance criterion for cross-user isolation |

### Frames without a requirement

| Frame | What it is | Decision |
|---|---|---|
| `Interaction - Web Tooltip - Example` (982:40296) | A table page used to demonstrate tooltip placement on row actions | Not used. Only the Small tooltip specimens in the same section are read for styling |
| Medium and Large tooltip variants (`w_tltips_up_m`, `w_tltips_up_l`; 550:17401, 550:17418) | Larger tooltips with an icon and close affordance | Not used. The summary is a one-line text tooltip with no action |
| Other `Badge` variants in the Badge spec (1730:18418): Android, avatar badge, notification | Other badge contexts and sizes | Not used. The feature keeps FEAT-004's desktop `w_bdg_number_s` |
| `Interaction - Badge Notification` (6766:128515) | A timed badge notification demo | Not used. This feature adds no badge motion and no notification |

## Pages

### Shared app shell

The only surface is the existing signed-in app shell, on every route that
renders the FEAT-004 badge: `/favorites`, `/catalog`, `/catalog/:itemId` and
the index redirect. `/login` is outside the shell, so an anonymous visitor
never renders the badge or the tooltip. There is no new page, route, menu
entry, header control or settings toggle.

Frame used: `Tooltip` [544:163373](https://www.figma.com/design/CNORy5Y7vLealwt9G4yniZ/Micro-Interaction--Website--v1.0.0?node-id=544-163373) (Small, Up pattern). The FEAT-004 badge is a component specimen, not a screen; it is linked in Components and is unchanged.

#### Screen spec

| Part | Action | Detail | Source | REQ |
|---|---|---|---|---|
| Shared app shell chrome | Keep | Existing top nav, brand row and page content. No new page, route, menu entry, header control or settings toggle | figma | REQ-021 |
| FEAT-004 badge | Keep | `Web Badge` (`w_bdg_number_s`): 20px high, minimum 29px wide, pill radius 9999, `#D02F1A` fill, 1px `#FFFFFF` inner stroke, white Roboto 10/500 at line-height 11.72, 6px horizontal and 4px vertical padding. Exact count 1 to 99, `99+` at 100 or more, hidden at 0, while the count loads, on count error, and when anonymous. Not redrawn by this feature | figma | REQ-006, REQ-012, REQ-021 |
| Badge hover target | Add | The badge's existing `<span>` is the hover target: no wrapper button, no focus stop, no click handler, no visible hover restyle. Pointer enter on the badge starts the summary fetch when the summary is not ready | derived | REQ-001, REQ-005, REQ-007 |
| Summary tooltip | Add | The file's Small Tooltip, State=Up (`w_tltips_up_s`): a `#424242` surface, 4px radius, 8px horizontal and 4px vertical padding, 22px high, Roboto 12/400 at line-height 14.06, white text, a 10x6 arrow above the surface, shadow `0 4px 8px rgba(0, 0, 0, 0.10)`. Placed below the badge, centred on it, 8px below the badge's bottom edge, arrow pointing up at the badge. Hugs its text, max-width 280px, one line preferred, exact integers never truncated | figma, derived | REQ-005, REQ-027 |
| Tooltip text | Add | Literal `N favorites (M discontinued)`, where N is `payload.total` and M is `payload.discontinued`, both exact base-10 integers. `(0 discontinued)` when none; `(N discontinued)` when all; a count of 100 or more prints in full inside the tooltip. No pluralization, localization, item titles, ids, icons, links or close control | derived | REQ-005, REQ-014, REQ-027 |
| Arrow | Add | 10x6, same `#424242`, no stroke. Points up at the badge because the tooltip sits below the anchor | figma | REQ-005 |
| Medium and Large tooltip variants | Remove | Their icon and close affordance are not part of this feature; only the Small text tooltip is used | derived | REQ-005 |
| Click-through | Remove | No click handler, link or navigation from the badge or the tooltip (spec Non-Goals) | derived | - |
| Loading state | Add | While the summary is loading, show no tooltip, spinner, skeleton, icon or toast. The badge keeps its FEAT-004 count | derived | REQ-008, REQ-016, REQ-028 |
| Error state | Add | After a failed, `500` or malformed summary fetch, show no tooltip; the badge is unchanged. The next hover may retry, and the tooltip stays hidden during the retry | derived | REQ-008, REQ-016, REQ-017, REQ-028 |
| Hidden-badge state | Add | When the badge is hidden, the header area where it would sit is not a hover target: no tooltip, no fetch | derived | REQ-006, REQ-012, REQ-015, REQ-027 |
| Post-action state | Add | After a successful favorite or un-favorite, drop the fetched summary immediately and show no tooltip until the refresh succeeds. If the refresh fails, keep showing no tooltip rather than the old values | derived | REQ-007, REQ-018, REQ-023, REQ-029 |
| Tooltip motion | Add | Fade in and out over 100ms ease-out, no slide or scale. Instant under `prefers-reduced-motion: reduce`. The spec does not require animation; if the designer prefers none, remove it without affecting any REQ | figma, derived | - |
| Empty state | Remove | The badge is hidden at zero favorites (FEAT-004), so there is no empty tooltip, no `0 favorites` state and no placeholder | derived | REQ-012 |

#### States

| State | Trigger | Treatment | Source | REQ |
|---|---|---|---|---|
| Idle, never fetched | Badge visible, pointer not over it | Badge only; no tooltip; no request yet | derived | REQ-007 |
| First hover, fetching | Pointer enters a visible badge while the summary is not ready | Request starts; the tooltip stays hidden; no loading UI; the badge is unchanged | derived | REQ-001, REQ-007, REQ-008 |
| Ready, hovered | Summary ready, pointer over the badge | Tooltip shown with exact N and M; the badge is unchanged | figma, derived | REQ-005 |
| Ready, not hovered | Pointer leaves | Tooltip hidden; the summary is kept in component state, not persisted | derived | REQ-007 |
| Error | Fetch failed, `500`, non-200 or malformed payload | No tooltip; the badge is unchanged; the next hover may retry | derived | REQ-008, REQ-016, REQ-017 |
| Badge hidden | Count 0, count loading, count error, or anonymous | No hover target; no tooltip; no summary fetch | derived | REQ-006, REQ-012, REQ-015 |
| Invalidated by action | Successful favorite or un-favorite | Old summary dropped; no tooltip until the refresh succeeds | derived | REQ-018, REQ-023, REQ-029 |
| All discontinued | `total` equals `discontinued` | `N favorites (N discontinued)` | derived | REQ-014 |
| Badge capped | `total` is 100 or more | Badge shows `99+`; the tooltip still prints the exact N and M | derived | REQ-005, REQ-027 |
| No permission | - | Not applicable: this surface is part of the signed-in shell, and the endpoint is auth-only with no per-user permission beyond ownership | - | REQ-013 |

#### Content and fields

| Field | Type | Required | Rule | Source | REQ |
|---|---|---|---|---|---|
| Badge count (trigger) | Display-only number | Yes, if visible | FEAT-004 count: 1 to 99 exact, `99+` at 100 or more, hidden otherwise | figma | REQ-006, REQ-012, REQ-021 |
| Tooltip text | One line of text | Yes | Literal `N favorites (M discontinued)`; exact integers; never truncated | derived | REQ-005, REQ-027 |
| N | Integer | Yes | `payload.total`, 0 or more, includes discontinued rows | derived | REQ-003 |
| M | Integer | Yes | `payload.discontinued`, `0 <= M <= N` | derived | REQ-004 |
| Input fields | None | - | The request accepts no input and the tooltip has no control | - | REQ-009, REQ-011 |

#### Responsive

| Breakpoint | Placement | Width | Notes | Source |
|---|---|---|---|---|
| 1280px and up | Below the badge, centred, 8px gap | Hugs text, max 280px | If the badge is within 16px of the viewport edge, shift the tooltip horizontally to stay 16px inside; keep the arrow over the badge (Ant Design `autoAdjustOverflow`) | derived |
| 1024px to 1279px | Same | Same | The shell layout is unchanged | derived |
| Below 1024px | Same anchor; flip above the badge if there is less than 8px plus tooltip height below it | `min(280px, calc(100vw - 32px))` | 16px viewport margins; the arrow follows the placement | derived |
| Touch, no hover | Not shown | - | No tap or long-press trigger; the spec is hover-only. The badge stays display-only | derived |

## Navigation

No navigation is added. The tooltip is display-only and the feature adds no
route, link or page.

| From | Trigger | To | Source |
|---|---|---|---|
| Any signed-in route | Pointer enters the visible badge | Same screen; the tooltip appears; no route change | derived |
| Any signed-in route | Pointer leaves the badge or tooltip | Same screen; the tooltip hides | derived |
| Any signed-in route | Click on the badge or tooltip | Nothing; there is no handler | derived |
| Any signed-in route | Pointer over the empty slot where a hidden badge would sit | Nothing; no fetch | derived |

## Interactions and motion

| ID | Trigger | Behaviour | Source | REQ |
|---|---|---|---|---|
| INT-001 | Pointer enters a visible badge with the summary never fetched | Start `GET /v1/favorites/summary`; keep the tooltip hidden until the summary is ready | derived | REQ-001, REQ-007 |
| INT-002 | The summary becomes ready while the pointer is still over the badge | Show the tooltip; no extra action needed | derived | REQ-005, REQ-008 |
| INT-003 | Pointer leaves the badge and tooltip | Hide the tooltip; keep the fetched summary in component state | derived | REQ-007 |
| INT-004 | Pointer enters after a failed fetch | Retry the fetch; no tooltip during the retry | derived | REQ-008, REQ-017 |
| INT-005 | Successful favorite or un-favorite | Invalidate the summary and refetch on the same trigger as the badge; no tooltip until the refetch succeeds | derived | REQ-007, REQ-018, REQ-023 |
| INT-006 | The badge hides while the tooltip is open | Hide the tooltip immediately; no fetch while the badge is hidden | derived | REQ-006, REQ-015 |
| INT-007 | Click, focus or keyboard activation | Nothing: the badge is not focusable and the tooltip has no interactive content. Keyboard users cannot open it (accepted gap, see Open design gaps) | derived | - |

| ID | Trigger | Element | Effect | Duration | Easing | Frame | Source |
|---|---|---|---|---|---|---|---|
| MO-001 | INT-002, tooltip shown | Summary tooltip | Opacity 0 to 1; no movement | 100ms | ease-out | `Interaction - Tooltip` [5620:80131](https://www.figma.com/design/CNORy5Y7vLealwt9G4yniZ/Micro-Interaction--Website--v1.0.0?node-id=5620-80131) | figma, derived |
| MO-002 | INT-003 or INT-006, tooltip hidden | Summary tooltip | Opacity 1 to 0 | 100ms | ease-out | `Interaction - Tooltip` [5620:80131](https://www.figma.com/design/CNORy5Y7vLealwt9G4yniZ/Micro-Interaction--Website--v1.0.0?node-id=5620-80131) | figma, derived |
| MO-003 | `prefers-reduced-motion: reduce` | Summary tooltip | No transition; instant show and hide | 0ms | - | - | derived |
| MO-004 | Any | Badge | No motion: no pulse, bounce or count animation | - | - | - | derived |

The file's `Interaction - Tooltip` uses a 100ms EASE_OUT smart-animate between
states. The spec says no animation is required, so 100ms is the ceiling:
MO-001 and MO-002 are the smallest motion that matches the file, and
MO-003 removes it entirely for reduced motion.

## Design tokens

Design read: a small, quiet hover summary attached to an existing enterprise
app-shell badge, built from the house component library rather than a new
visual language. Dials: `DESIGN_VARIANCE 2`, `MOTION_INTENSITY 1`,
`VISUAL_DENSITY 7`. Landing-page checks (hero, marquee, logo wall, bento) do
not apply.

References used: `taste-skill` sections 0, 1, 4.5, 8, 9 and 14, and
`DESIGN.md` for `linear.app` as the closest reference (dense enterprise data
UI, hairline borders, one restrained accent), the same pick as FEAT-001.
Figma values win over the reference.

### Colour

| Token | Value | Used for | Source |
|---|---|---|---|
| Neutral/Secondary (Figma variable) | `#424242` | Tooltip surface and arrow | figma |
| Neutral/White 2 | `#FFFFFF` | Tooltip text, badge count, badge stroke | figma |
| Badge fill | `#D02F1A` | FEAT-004 badge, unchanged | figma |
| Shadow | `rgba(0, 0, 0, 0.10)` | Tooltip surface and arrow drop shadow | figma |
| Existing accent | `#13A1DC` | Not used by this feature; recorded so no new accent is introduced | figma |
| Existing shell text | `#1D1D1D`, `#424242` | Unchanged shell | figma |

### Typography

| Token | Font | Size / weight | Line height | Used for | Source |
|---|---|---|---|---|---|
| Tooltip | Roboto | 12 / 400 | 14.06 (use 14) | Tooltip text | figma |
| Badge count | Roboto | 10 / 500 | 11.72 (use 12) | Badge text | figma |
| Shell | Existing | Existing | Existing | Unchanged | figma |

### Spacing, radius and elevation

| Token | Value | Used for | Source |
|---|---|---|---|
| Tooltip padding | 8px horizontal, 4px vertical | Around the text | figma |
| Tooltip radius | 4px | Surface corners | figma |
| Tooltip height | 22px surface plus 6px arrow, 28px total | Small tooltip | figma |
| Arrow | 10x6px | Pointer to the badge | figma |
| Shadow | `0 4px 8px rgba(0, 0, 0, 0.10)` | Tooltip surface and arrow | figma |
| Offset to badge | 8px | Gap between the badge bottom and the arrow tip | derived |
| Max width | 280px | Tooltip | derived |
| Edge clearance | 16px | Viewport margin when shifting | derived |
| Spacing base | 4px | The 4, 8 and 16 values above | figma |
| Badge shape | 20px high, minimum 29px wide, 9999 radius, 1px stroke | FEAT-004 badge | figma |
| Badge padding | 6px horizontal, 4px vertical | FEAT-004 badge | figma |
| Radius scale | 4px small, 8px to 12px medium, 9999 pill | Only 4px and 9999 are used here | figma |

## Components

| Component | Figma `Code` and variants | nexcomponent export (import path) | Resolution status | States | Used on | Note |
|---|---|---|---|---|---|---|
| Web Tooltips, Small, Up | `w_tltips_up_s`; Size=Small, State=Up | `Tooltip` (`nexcomponent-ui`) | family-candidate | Default, Hover | Shared app shell | No exact `w_tltips_up_s` export. The generic `Tooltip` is the candidate. AppFlow records Ant Design `Tooltip` for the build, so use the house `Tooltip` if it supports the dark small surface and top arrow, otherwise AntD styled to the tokens above. No `button`, `tag`, `caption` or `hyperLink` content |
| Web Tooltips, Small, Down | `w_tltips_down_s`; Size=Small, State=Down | `Tooltip` (`nexcomponent-ui`) | family-candidate | Default, Hover | Not used | Mirror of the chosen pattern; not used because the badge has room below it |
| Web Tooltips, Medium and Large | `w_tltips_up_m`, `w_tltips_up_l` | - | - | - | Not used | Icon and close variants; out of scope |
| Web Badge | `w_bdg_number_s`; Type=Number, Size=Small | `W_bdg_number_s` (`nexcomponent-ui/dist/AI/Badge/Badge`) | exact | Default | Shared app shell, FEAT-004 and unchanged | The count badge. This feature only wraps it as a hover target |
| Arrow | Part of `w_tltips_up_s` | Part of `Tooltip` | - | - | Shared app shell | Not a separate asset |
| Hover wrapper | None in the file | The badge's existing `<span>` | compose | - | Shared app shell | No new button or component; pointer handlers on the existing element |
| Ant Design Tooltip | None in the file, implementation fallback | `Tooltip` (`antd`) | fallback | Default, Hover | Shared app shell | The component AppFlow records; style its overlay to the tokens above and keep its default overflow handling |

## Assets

| Asset | Location in Figma | Format | Note |
|---|---|---|---|
| Tooltip surface and arrow | `Tooltip` section (544:163373), `w_tltips_up_s` | CSS and SVG | Drawn by the tooltip component; no separate export |
| Badge | `Web Badge` (3965:42609) | CSS and SVG | FEAT-004 badge, unchanged |
| Fonts | Roboto 400/500 | webfont | Already loaded by the application |
| Icons and illustrations | None | - | None needed: the tooltip is text plus an arrow |
| Images | None | - | No image asset |

## Open design gaps

| Gap | Owner | Status |
|---|---|---|
| No FEAT-005-specific frame in the file; the Tooltip and Badge frames are generic patterns | designer | Accepted: reuse `w_tltips_up_s` and `w_bdg_number_s`; no new frame requested |
| No mobile or touch frame | designer | Accepted: hover-only per spec, so the tooltip is not shown on touch. A touch trigger would be a new spec item |
| Tooltip placement below the badge, 8px offset, 280px max width, 16px edge clearance | designer | Derived; confirm in the batched review |
| 100ms ease-out fade | designer | Derived from the file's `Interaction - Tooltip`; the spec does not require motion. Confirm or drop |
| Keyboard users cannot reach the tooltip | designer and spec owner | Accepted for this pass: the FEAT-004 badge is a non-focusable display element and the spec allows hover only. Making the information keyboard-reachable needs a spec change (focusable trigger or a static text equivalent), which belongs in `/document-preparation` |
| The tooltip text is fixed English with no pluralization | - | No gap: REQ-005 and the Non-Goals require the literal template |
| The badge is FEAT-004's and is not redrawn | - | No gap: REQ-021 keeps it unchanged |
| The house `Tooltip` export may not match `w_tltips_up_s` exactly | frontend | Implementation note: Ant Design `Tooltip` is the recorded fallback; match the token table |
| Preview sample | frontend | The review page shows the Tooltip pattern specimen, not a drawn badge plus tooltip, because the file has no FEAT-005 frame. The screen spec and token tables above are the build target |

## Review feedback

No review feedback yet.
