---
feature_code: FEAT-005
service: sandbox-svc
repo: https://github.com/william22913/sandbox-svc-ui
branch: feat/FEAT-005-dev-favorites-summary-tooltip
spec_version: 1
testcase_version: 1
run_date: 2026-11-08
api_contract: docs/FEAT-005/api/openapi.yaml
api_contract_sha256: c4bf73b05c8478c4fd476e6ad34667b10b88b80ba11379c55961cfe9ce0b14e8
fe_pr: https://github.com/william22913/sandbox-svc-ui/pull/2
tested_commit: 937f313c6def913650e5311613745512bc71b276
---

# FEAT-005 — Favorites Summary and Badge Tooltip — FE test results

Execution record for the frontend half of FEAT-005, built against the
merged handoff in `docs/FEAT-005/` (spec v1, testcase v1) on the
sandbox-svc-ui repository. Every case below was run in this repository;
none is a design-time claim.

## 1. Result summary

| Area | Mode | Cases | PASS | N/A (backend scope) | FAIL |
|---|---|---|---|---|---|
| UI (TC-016 … TC-035) | mock | 20 | 20 | 0 | 0 |
| API (TC-001 … TC-015) | — | 15 | 0 | 15 | 0 |
| Real backend (`e2e/real-be.mjs`, §11) | real BE | 8 | 5 | 0 | 0 (1 MISMATCH, 1 BLOCKED, 1 NOTE) |

The 15 API cases assert the Go service's response bodies and are executed
by `/go-dev` in `sandbox-svc-code`, not here. What this repo proves about
them is the contract the UI consumes: the adapter paths, the nexcommon
envelope, and the defensive validation of `payload.total` /
`payload.discontinued` (see §3).

## 2. Environment and how it was run

| Item | Value |
|---|---|
| Node | 22.23.4 |
| Browser | Playwright 1.64.1 bundled Chromium (headless shell 1248) |
| App under test | `npm run build` output served by `vite preview` on `http://localhost:4173` |
| Backend, mock cases (§4) | none — every API call is intercepted with Playwright `page.route` |
| Backend, real-BE cases (§11) | the released sandbox-svc, `http://host.docker.internal:18080` (the host's `http://localhost:18080` from `api/base-url.json`) |
| Container note | Chromium's own sandbox cannot be set up here, so the smoke scripts launch with `--no-sandbox` |

Two modes are recorded here and never mixed:

- **mock** (§4): `GET /api/v1/favorites/count`, `GET /api/v1/favorites/summary`
  and the FEAT-001 paged list are fulfilled by `e2e/favorites-summary.mjs` with
  nexcommon envelopes; the summary mock can be flipped to a delayed, `500` or
  `401` response per scenario. These are UI-behaviour results against a
  contract that the script itself defines.
- **real BE** (§11): `e2e/real-be.mjs` calls the running service over HTTP and
  drives the built app with the real responses. These are contract results
  against the deployed build, and they are where the two findings below come
  from.

## 3. Contract the frontend consumes

| Contract | Source | Where it is asserted |
|---|---|---|
| `GET /v1/favorites/summary` → `payload.total`, `payload.discontinued` | `docs/FEAT-005/api/openapi.yaml` | `favoriteAdapter.test.js` (path, no input), `favoriteService.test.js` (mapping, rejection) |
| `GET /v1/favorites/count` → `payload.count` (FEAT-004 prerequisite) | FEAT-004 `architecture.md` on the docs base branch; not in this feature's openapi snapshot | `favoriteAdapter.test.js`, `favoriteService.test.js` |
| malformed payloads are failures, never zeros | spec REQ-016/REQ-017 | `favoriteService.test.js`: missing payload, non-integer, negative, `discontinued > total` |

`/v1` is the literal path because nginx strips only `/api`; the Vite dev proxy
now mirrors that with a `^/api` → `` rewrite.

## 4. UI cases (TC-016 … TC-035)

Scenario numbers refer to `e2e/favorites-summary.mjs`.

| Case | What it asserts | Result | Evidence | Mode |
|---|---|---|---|
| TC-016 | First hover of a visible badge issues one summary request and shows `5 favorites (1 discontinued)` | PASS | e2e#1 | mock |
| TC-017 | App load issues no summary request and shows no tooltip | PASS | e2e#1 | mock |
| TC-018 | `0 discontinued` keeps the literal template | PASS | e2e#7 | mock |
| TC-019 | One favorite renders `1 favorites (0 discontinued)` (literal plural) | PASS | e2e#8 | mock |
| TC-020 | Badge shows `99+`, tooltip prints the exact `150 favorites (3 discontinued)` | PASS | e2e#2 | mock |
| TC-021 | Tooltip total agrees with the badge count (`42`) it hangs off | PASS | e2e#10 | mock |
| TC-022 | A repeat hover does not refetch and still shows the held summary | PASS | e2e#11; `FavoriteCountProvider.test.jsx` "first hover only" | mock |
| TC-023 | Zero favorites: no badge, no hover target, no summary fetch | PASS | e2e#6 | mock |
| TC-024 | Badge hidden while the count is loading: no badge, no tooltip, no fetch | PASS | e2e#12 | mock |
| TC-025 | Badge hidden after a count error: no badge, no tooltip, no fetch | PASS | e2e#13 | mock |
| TC-026 | Anonymous visitor (count `401`) is sent to login; no badge, no fetch | PASS | e2e#14 | mock |
| TC-027 | While the summary loads: no tooltip, no spinner, badge unchanged; the tooltip appears when the response lands | PASS | e2e#3 | mock |
| TC-028 | Summary `500`: no tooltip, no error UI; a later hover retries and succeeds | PASS | e2e#4; `FavoriteCountProvider.test.jsx` "error then retry" | mock |
| TC-029 | A successful favorite refreshes the held summary, no stale values | PASS | e2e#6 | mock |
| TC-030 | A successful un-favorite refreshes the held summary, no stale values | PASS | e2e#15 | mock |
| TC-031 | A failed post-action refresh never shows the old values; a later hover succeeds | PASS | e2e#16 | mock |
| TC-032 | A summary that was never fetched stays first-hover-driven across an action | PASS | e2e#17; `FavoriteCountProvider.test.jsx` "never fetched" | mock |
| TC-033 | The tooltip is display-only: clicking the badge does nothing | PASS | e2e#1 | mock |
| TC-034 | All-discontinued favorites render equal counts (`3 favorites (3 discontinued)`) | PASS | e2e#9 | mock |
| TC-035 | Un-favoriting the last item hides the badge and suppresses the tooltip | PASS | e2e#18 | mock |

## 5. API cases (TC-001 … TC-015)

| Case | Result | Why |
|---|---|---|
| TC-001 … TC-008 (success bodies, boundaries 0/1/500/>99, mixed and all-discontinued partitions) | N/A | Asserted by `/go-dev` against the real service. The FE side only maps the envelope; that mapping is covered by `favoriteService.test.js` (12 cases) and `favoriteAdapter.test.js` (5 cases), and every display boundary (`0`, `1`, `99`, `100`, `150`, `M = 0`, `M = N`) has a UI or unit result above. |
| TC-009, TC-010 (401 for missing/expired session) | N/A | Service-side status. The FE inherits the global 401 interceptor (`client.js` → `redirectToLogin`); e2e#14 proves the UI path for a `401` on the badge-count call. |
| TC-011 … TC-014 (user isolation, ignored caller identifiers, request-time derivation) | N/A | Server-side guarantees with no FE surface; the FE sends no user identifier and no query parameters (`favoriteAdapter.test.js`). |
| TC-015 (unexpected `500` envelope) | N/A | Service-side body. The FE reaction to a failing summary is covered by e2e#4 and e2e#16. |

## 6. Component decisions

| Need | Chosen | Reasoning |
|---|---|---|
| Badge | `W_bdg_number_s` from `nexcomponent-ui/dist/AI/Badge/Badge` (FEAT-004 design) | House component; geometry (20px high, 29px min width, pill) applied with the documented inline `style` override |
| Tooltip | Ant Design 4.24 `Tooltip`, styled to the UIMap tokens | `nexcomponent-ui`'s `Tooltip` cannot be opened/closed programmatically (internal `isVisible`) and renders rich content (close icon, title/caption). The design handoff records AntD as the fallback |
| Hover tracking | The badge `<span>` owns `onMouseEnter`/`onMouseLeave` | AntD 4 discards its own hover event while `title` is undefined (`isNoTitle()`), so a title-less tooltip never fires `onOpenChange`; owning the hover keeps the "no tooltip until the summary is ready" rule working |
| State | `FavoriteCountProvider` (context) with `summaryStatus: idle \| loading \| ready \| error` and a request-id race guard | Keeps the first-hover rule, drops values before a post-action refetch, and keeps both hooks (`useFavoriteStar`, `useFavorites`) free of duplicated logic |

## 7. Design check

Design Read recorded before coding: *reading this as a dense enterprise
app-shell hover surface for signed-in operators, with a quiet Linear-style
language, leaning toward the house `nexcomponent-ui` badge plus Ant Design
tooltip styled to the UIMap tokens (`DESIGN_VARIANCE 2`, `MOTION_INTENSITY 1`,
`VISUAL_DENSITY 7`); the landing-page checks from taste-skill do not apply.*

States exercised in the browser: default, hovering (loading), ready, error,
zero/badge-hidden, `99+`, mobile (390×844), reduced motion (transitions
disabled by the global `prefers-reduced-motion: reduce` rule).

## 8. Design fidelity (measured in the browser)

Measured by `e2e/favorites-summary.mjs` scenario 1 on the built bundle.

| Token | Design (`DesignBrief.md` / UIMap) | Measured | Result |
|---|---|---|---|
| Badge height / min width | 20px / 29px | 20px / 29px | PASS |
| Badge background | `#D02F1A` | `rgb(208, 47, 26)` | PASS |
| Badge border | 1px `#FFFFFF` | `1px rgb(255, 255, 255)` | PASS |
| Badge shape | pill | `border-radius: 9999px` | PASS |
| Badge type | Roboto 10/500, line-height 11.72 | `10px` / `500` / `11.72px` | PASS |
| Tooltip surface | `#424242` | `rgb(66, 66, 66)` | PASS |
| Tooltip text | `#FFFFFF`, Roboto 12/400, line-height 14 | `rgb(255, 255, 255)` / `12px` / `400` / `14px` | PASS |
| Tooltip padding / height | 8px × 4px / 22px | `4px 8px` / 22px | PASS |
| Tooltip radius | 4px | `4px` | PASS |
| Tooltip shadow | `0 4px 8px rgba(0,0,0,0.10)` | `rgba(0, 0, 0, 0.1) 0px 4px 8px 0px` | PASS |
| Tooltip placement | below the badge, centred, arrow up | surface top `50px` vs badge bottom `46px`, centres `188.5` vs `188.5`, `.ant-tooltip-placement-bottom` | PASS |
| Max width | 280px | `max-width: 280px` (text hugs: 167px) | PASS |
| Arrow | 10×6 flat triangle | AntD draws a rotated rounded square clipped to ≈14×8 (22×22 box, 14.3px protrusion) | **Deviation** — same colour (`#424242`), placement and direction; the silhouette is AntD's, not the Figma triangle |
| Motion | 100ms fade | `transitionName="favorite-summary-fade"`, 100ms opacity ease-out | PASS |
| Tooltip visibility rule | only when ready and hovered | e2e#1, #3, #4, #12, #13, #14, #16, #18 | PASS |

The arrow is the one visual token that does not match Figma exactly. AntD 4
builds the arrow from a rotated square with a rounded corner and positions the
surface from a JS align offset, so a 10×6 triangle would need the arrow hidden
and re-drawn in CSS with a re-tuned align offset. It is recorded here rather
than silently approximated.

## 9. Verification commands and results

| Command | Result |
|---|---|
| `npm run lint` | PASS — no output |
| `npm test` | PASS — 5 files, 33 tests |
| `npm run build` | PASS — `dist/` built (pre-existing chunk-size warning only) |
| `node e2e/favorites-summary.mjs` | PASS — 20 scenarios (mock) |
| `node e2e/smoke.mjs` (FEAT-001 regression) | PASS — 7 scenarios |
| `node e2e/real-be.mjs` (released BE) | 5 PASS, 1 MISMATCH, 1 BLOCKED, 1 NOTE — see §11 |

Screenshots (in `e2e/artifacts/`):

- `feat-005-tooltip-desktop.png` — 1440×900, badge + open tooltip
- `feat-005-tooltip-closeup.png` — tooltip surface and arrow
- `feat-005-badge-closeup.png` — badge at `3`
- `feat-005-tooltip-capped.png` — `99+` badge with the exact `150 favorites (3 discontinued)`
- `feat-005-tooltip-mobile.png` — 390×844
- `feat-004-real-be-badge.png` — the app against the released BE: no badge (§11)

## 10. Deviations and disclosures

1. **FEAT-004 prerequisite (delivered here).** FEAT-005 hangs on FEAT-004's
   badge, and this tree had no badge, count call or `FavoriteCountProvider`
   (architecture.md deviation 3). The FEAT-004 design is already published on
   the docs base branch, so its badge and provider were implemented on this
   same branch from that design — `GET /v1/favorites/count`, `payload.count`,
   badge hidden at `0`/loading/error, `99+` cap — instead of inventing a second
   badge. No FEAT-005 contract was invented for it. **The sequence FEAT-004 →
   FEAT-005 is therefore collapsed into one PR in this repo; if FEAT-004's
   frontend lands separately, this badge/provider is the code to reconcile.**
2. **FEAT-004 count endpoint is not in FEAT-005's openapi snapshot.** It is
   taken from FEAT-004's `architecture.md` (`payload.count`), which is merged
   on the docs base branch.
3. **FEAT-001's adapters still call the wrong contract** (architecture.md
   deviation 6: `/favorites` without `/v1`, paged `data/page/page_size/total`
   instead of `payload.favorites`). FEAT-005's summary adapter uses `/v1` and
   the envelope; the existing FEAT-001 adapter and list mapping were left
   untouched, and the FEAT-001 smoke still passes against its own mock. This
   needs a separate reconciliation, not a silent workaround.
4. **API-level cases are not executed in this repo.** TC-001…TC-015 belong to
   the Go service; they are marked N/A here rather than passed.
5. **The badge is hover-only.** Keyboard users cannot reach the tooltip — the
   accepted limitation recorded in `DesignBrief.md`. The badge keeps its
   `aria-label` (`{{count}} favorit`) from FEAT-004.
6. **`e2e/smoke.mjs` launcher changed** from `channel: 'chrome'` to the
   bundled Chromium with `--no-sandbox`, so the FEAT-001 regression can run in
   this container. Test-harness only; no product behaviour changed.
7. **`GET /v1/favorites/count` does not exist on the released BE** (405, §11.1).
   FEAT-004's frontend is in this branch, its backend is not in the deployed
   build. Against this BE the badge never renders; nothing in the FE was
   changed to paper over it.
8. **The authenticated real-BE cases are blocked, not passed** (§11.1): the
   service's Redis has no seeded token and is not reachable from this
   container. `BE_TOKEN=… node e2e/real-be.mjs` completes them once the stack
   is seeded.

## 11. Real-backend pass

Run with the app on `npm run preview` (4173) and the released service on
`http://host.docker.internal:18080` — the host's `http://localhost:18080` from
`api/base-url.json`; inside this container `localhost` is not the host.

```
node e2e/real-be.mjs                 # anonymous cases + the app against the BE
BE_TOKEN=live-user-1-token node e2e/real-be.mjs   # once the BE's Redis is seeded
```

Mode is **real BE** for every case below: the script calls the service over
HTTP, and the browser case forwards the app's own FEAT-004/005 calls to it with
Playwright `route.fetch` — the same-origin proxy nginx provides in production.
Only the FEAT-001 list call is stubbed, so the page does not redirect to login
before the badge can render.

| Case | What it asserts | Observed | Result | Mode |
|---|---|---|---|---|
| RB-01 | `GET /v1/health` | `{"db":"UP","redis":"UP","status":"UP"}` | PASS | real BE |
| RB-02 | Anonymous summary returns the documented 401 envelope: `success:false`, `header.request_id`, `payload.code`, no `total`/`discontinued` | 401, `E-1-CMD-AUT-001`, `request_id` present | PASS | real BE |
| RB-03 | Invalid token (`live-unseeded-token`) gets the same envelope code | 401 `E-1-CMD-AUT-001` | PASS | real BE |
| RB-04 | Anonymous list gets the same 401 (FEAT-001 path parity) | 401 `E-1-CMD-AUT-001` | PASS | real BE |
| RB-05 | `GET /v1/favorites/count` — the route the badge calls | **405, empty body, no CORS headers** | **MISMATCH** | real BE |
| RB-06 | Authenticated summary body carries `payload.total`/`payload.discontinued` as non-negative integers with `discontinued <= total` | not obtainable: the seed token 401s | **BLOCKED** | real BE |
| RB-07 | CORS on the service | `allow-origin: *` with `allow-credentials: true` | NOTE | real BE |
| RB-08 | Built app against the real BE | count 405 → no badge, no summary request (`feat-004-real-be-badge.png`) | PASS | real BE |

### 11.1 The two findings

**The count endpoint is absent from the released BE.** `GET
/v1/favorites/count` answers `405` with an empty body and no CORS headers — it
never reaches the service's handler chain. The BE's main branch registers only
add, remove, list and summary (`endpoint/favorite_endpoint/favorite_endpoint.go`
in `sandbox-svc-code`), so FEAT-004's backend is not in the deployed build
while FEAT-005's summary route is (RB-02 proves that route exists and is
guarded). No frontend change was made for this: FEAT-004's published contract
is `GET /v1/favorites/count` → `payload.count`, and deriving a count from the
summary or the list would invent a second contract and break the first-hover
rule (it would issue a request on load). The fix is to deploy FEAT-004's
backend, or for the BE to drop the count route from the shared contract — a BE
/ deployment decision, not an FE one.

**The authenticated cases are blocked, and the reason is specific.** The
released stack answers 401 for the exact tokens its own verify environment
defines (`apiKeyUser1 = live-user-1-token`, `apiKeyUser3 = live-user-3-token`,
`postman/environment.verify.json`), so those keys were never written. nexcommon
resolves identity only by `redis.Get(<raw Authorization value>)` after an
optional JWT check and returns `ErrUnauthorized` on a miss
(`vendor/github.com/nexsoft-git/nexcommon/controller/user_access.go`) — there is
no bypass path. The service's Redis is the compose-internal `redis:7-alpine`
that `docker-compose.yml` deliberately does not publish, and this container has
no Docker access, so the seed cannot be installed from here. The Redis on the
host's 6379 is a different instance: the same three keys were written into DBs
0–3 there and the service still answered 401 (they were removed afterwards).
To unblock: start the BE with its verify overlay
(`docker compose -f docker-compose.yml -f docker-compose.verify.yml up -d`) or
run `tests/live/redis-seed.sh`'s three `SET`s against the service's Redis, then
`BE_TOKEN=live-user-1-token node e2e/real-be.mjs`.

### 11.2 What the real bodies prove about the contract

- **401 envelope — compared live.** The real body matches the openapi
  `Unauthorized` envelope and the BE's own Postman assertions for the anonymous
  and invalid-token requests (`success === false`, `payload.code ===
  'E-1-CMD-AUT-001'`, no `payload.total`/`discontinued`). The app never hands
  that body to `fetchFavoritesSummary`: `client.js` rejects on the status and
  redirects to login, which is the behaviour e2e#14 asserts in mock mode.
- **Success body — compared source-to-FE, not live.** The BE's DTO is
  `FavoriteSummaryResponse{ Total int64; Discontinued int64 }`
  (`dto/out/favorite.go`) with Postman assertions of exactly
  `{total: 5, discontinued: 1}` and `{total: 0, discontinued: 0}`; the openapi
  example is the same. Those are the two integer fields `fetchFavoritesSummary`
  reads, under the same `0 <= discontinued <= total` rule the service
  documents — no field-name, type or range drift. The live 200 body remains
  unverified for the reason in §11.1.
- **Display rules are FE-only.** The `99+` cap and the
  `N favorites (M discontinued)` literal appear in no API body; neither the
  live 401 nor the documented 200s can conflict with them.
- **Transport.** RB-07 shows `Access-Control-Allow-Origin: *` together with
  `Access-Control-Allow-Credentials: true`, a combination browsers refuse for
  credentialed requests, and the app's axios client sends credentials. The app
  therefore reaches the BE through a same-origin proxy (`/api`, stripped by
  nginx in production, mirrored by `VITE_PROXY_TARGET` in the dev server) —
  which is what the RB-08 browser case models.
