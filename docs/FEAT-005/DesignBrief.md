---
feature_code: FEAT-005
service: sandbox-svc
spec_version: 1
source: UIMap.md
last_updated: 2026-11-08
---

# Design Brief - FEAT-005

## Overview

FEAT-005 adds a hover tooltip to the existing FEAT-004 favorites badge in the
signed-in app header. The tooltip reads `N favorites (M discontinued)`, with
the exact totals for the signed-in user, and appears only while the badge is
visible. There is one surface: the shared app shell, on every signed-in route
that already renders the badge. No page, route or navigation is added.

The design is a quiet extension of the existing shell, not a new visual
language. The badge is unchanged; the tooltip is the only new visual element.

## Brand Identity

The product is a dense, utilitarian enterprise application. The tooltip should
read as a small, precise system annotation attached to the badge, not as a
promotional or decorative layer. Keep it neutral, compact and low-motion.
The file's Small Tooltip pattern already expresses this: a dark compact
surface, one line of small text, and a single small arrow.

## Color Palette

| Token | Value | Use |
|---|---|---|
| Tooltip surface and arrow | `#424242` | The tooltip background and its 10x6 arrow |
| Tooltip text | `#FFFFFF` | The one line of tooltip copy |
| Badge fill | `#D02F1A` | FEAT-004 badge, unchanged |
| Badge text and stroke | `#FFFFFF` | Badge count and its 1px inner stroke |
| Tooltip shadow | `rgba(0, 0, 0, 0.10)` | `0 4px 8px` drop shadow under the surface and arrow |

No new accent colour is introduced. The existing app accent `#13A1DC` is not
part of this feature.

## Typography

| Element | Font | Size / weight | Line height |
|---|---|---|---|
| Tooltip text | Roboto | 12 / 400 | 14 |
| Badge count | Roboto | 10 / 500 | 12 |

The tooltip is one line of plain text. No icon, no link and no close control.
The exact template is `N favorites (M discontinued)`, including
`(0 discontinued)` and `(N discontinued)` when every favorite is
discontinued. Do not pluralize or truncate the numbers.

## Spacing and Shape

| Property | Value |
|---|---|
| Tooltip padding | 8px horizontal, 4px vertical |
| Tooltip surface height | 22px; 28px including the 6px arrow |
| Tooltip radius | 4px |
| Arrow | 10x6px, same `#424242`, no stroke |
| Gap below the badge | 8px from the badge bottom to the arrow tip |
| Tooltip placement | Below the badge, centred on it, arrow pointing up |
| Tooltip width | Hugs its text, max-width 280px |
| Edge clearance | 16px from the viewport edge; shift horizontally, keep the arrow over the badge |
| Badge shape | 20px high, minimum 29px wide, pill radius 9999, 1px white inner stroke |
| Badge padding | 6px horizontal, 4px vertical |

## Components

| Element | Source | Note |
|---|---|---|
| Tooltip | Figma `w_tltips_up_s` (`Tooltip` 544:163373), Small and Up | Use the generic `Tooltip` from `nexcomponent-ui` if it can render the dark small surface with a top arrow; otherwise use Ant Design `Tooltip` styled to these tokens, as AppFlow records |
| Badge | Figma `w_bdg_number_s` (`Web Badge` 3965:42609) | FEAT-004 badge, unchanged. It is only the hover target |
| Hover target | The badge's existing `<span>` | No new button or focusable control. No click handler and no hover restyle |

## States and Motion

| State | What the user sees |
|---|---|
| Badge visible, not hovered | The FEAT-004 badge only; no tooltip and no request yet |
| First hover, summary loading | The badge only; no tooltip, spinner, icon or toast |
| Summary ready, hovered | The tooltip with the exact `N favorites (M discontinued)` text |
| Summary failed or `500` | The badge only; no tooltip. The next hover may retry |
| Badge hidden, zero favorites, count loading, count error or anonymous | No hover target, no tooltip and no fetch |
| After a successful favorite or un-favorite | No tooltip until the refreshed summary succeeds; never the old values |
| Badge at 100 or more | The badge shows `99+`; the tooltip still prints the exact totals |

Motion is a 100ms ease-out fade in and out, with no slide or scale. Under
`prefers-reduced-motion: reduce` the tooltip appears and disappears instantly.
The spec does not require animation, so the fade may be dropped without
affecting any requirement. The badge itself never animates.

## Open design gaps

| Gap | Status |
|---|---|
| No FEAT-005-specific frame; the file's Tooltip and Badge frames are generic patterns | Accepted; reuse the Small Tooltip and the FEAT-004 badge |
| No mobile or touch frame | Accepted; the spec is hover-only, so touch shows no tooltip |
| Placement, 8px offset, 280px max width, 16px edge clearance | Derived; confirm in the batched review |
| 100ms ease-out fade | Derived from the file; confirm or drop |
| Keyboard users cannot reach the tooltip | Accepted for this pass; a focusable trigger or static text equivalent needs a spec change |
