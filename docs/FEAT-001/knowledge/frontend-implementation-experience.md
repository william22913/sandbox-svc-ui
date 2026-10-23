# FEAT-001 — Frontend Implementation Experience

| Field | Value |
|---|---|
| service | `sandbox-svc` |
| feature | `FEAT-001` |
| repo | https://github.com/william22913/sandbox-svc-ui |
| branch | `feature/FEAT-001` |
| written | 2026-10-23 |
| docs read | `spec.md` v4, `architecture.md` v3, `UIMap.md`, `DesignBrief.md`, `AppFlow.md`, `testcase.md` v3 |
| repo state at writing | greenfield — one `chore: initial commit`, no prior code |

This is a lessons-learned record for the first UI feature in this repo. It is
not a spec and not a substitute for `architecture.md`. Anything that needs a
decision is marked **ACTION**.

---

## 1. What was built

The favorites surface, REQ-009 through REQ-012, on a blank Vite + React 18 +
JSX repo:

- `src/core/api/axios/client.js` — shared axios instance, 401 interceptor
- `src/core/api/adapters/favoriteAdapter.js` — wire shape → view model
- `src/core/services/favoriteService.js` — `GET /favorites`, `POST`, `DELETE`
- `src/features/favorites/hooks/useFavorites.js` — paging + error state
- `src/features/favorites/hooks/useFavoriteStar.js` — optimistic toggle
- `src/features/favorites/pages/FavoritesPage.jsx` — table, paging, empty state
- `src/features/catalog/pages/*`, `src/features/auth/pages/LoginPage.jsx` — stand-ins (see §2)
- `src/helpers/redirectToLogin.js` — 401 → `/login?redirect=<path>`

Verified at commit `e6aee62`: lint clean, 12 unit tests pass, build succeeds,
7/7 Playwright smoke checks pass.

---

## 2. Documentation gaps that forced judgment calls

These are the things the docs do not answer. Each one was resolved with the
smallest stand-in that keeps the flow reachable, never by inventing a backend
contract.

### 2.1 No catalog or item-detail API

`UIMap.md` and `architecture.md` assume an item detail page exists and that the
empty-state button links to a catalog, but neither defines an endpoint for
either. `CatalogPage.jsx` is a clearly-marked fixture list; `ItemDetailPage.jsx`
renders router state and falls back to the route id.

**ACTION:** add the catalog list + item detail contracts to `architecture.md`,
or state explicitly that these live outside FEAT-001.

### 2.2 No "is this item favorited" read endpoint

The contract has `GET /favorites` (paged), `POST`, `DELETE` — nothing that
answers the question for a single item. The detail star therefore takes its
initial state from navigation state (`favorited: true` when arriving from the
favorites row) and defaults to `false` on a direct deep link.

**Consequence:** a user who bookmarks an item URL sees it as un-favorited until
they interact with it. This is a real, user-visible inaccuracy, not a cosmetic
one.

**ACTION:** add `GET /favorites/{item_id}` (or a `favorited` flag on the item
response) to `architecture.md`. Until then, deep links are wrong by design.

### 2.3 No auth or login contract

`REQ-006`/`REQ-012` require a redirect to login and a return to the original
path. The docs assume a shared auth layer that this feature does not own.
`LoginPage.jsx` is a stand-in: it validates and follows `redirect`, refuses
non-local redirect targets, and sets a local flag. The 401 → login mechanism
itself is real and tested; only session issuance is fake.

**ACTION:** document where the real login page lives, or confirm it stays out
of scope for FEAT-001.

### 2.4 `testcase.md` is one spec version behind

`VERSION.md` records `testcase_version: 3` against `spec_version: 4`, with no
cases for REQ-009–REQ-012. Accepted as out of scope for this pass, so the FE
checks were derived from spec and UI map directly rather than from test cases.
That is a weaker verification loop: the smoke suite tests what the implementer
thought the requirement meant.

**ACTION:** run `/testcase-generation` before the next feature touches this
surface.

### 2.5 The preflight failure was a stale clone, not a missing field

`/fe-dev` initially refused with "Preflight frontend repo/base branch is
missing or does not match architecture.md". The fields were present in the
remote — `architecture.md` at `main` declares `frontend_repo` and
`frontend_base_branch: main`. The check had been reading an older copy.

**Lesson:** pull the docs repo before concluding a doc field is missing.
`VERSION.md`'s `architecture_version: 3` note ("refreshed here with
`frontend_repo`/`frontend_base_branch`") is the tell.

---

## 3. `nexcomponent-ui` findings

The library is private (not on public npm), so the exact release tarball
`2.1.9` is vendored at `vendor/nexcomponent-ui-2.1.9.tgz` and referenced as
`"nexcomponent-ui": "file:vendor/nexcomponent-ui-2.1.9.tgz"`. This makes
`npm install` work offline and keeps Bitbucket credentials out of the repo.

**ACTION:** swap to the house registry package once one exists. The vendored
tarball is a stopgap, not a distribution strategy.

Four behaviours worth knowing before the next feature:

1. **`W_rtgatom_blstar_m` is a five-star `Rate`, not a single toggle star.**
   `UIMap.md`'s mapping is misleading. A one-star pressed/unpressed control
   needs Ant Design `StarFilled`/`StarOutlined` inside a button — the
   `antd-fallback` rung of the ladder, used deliberately.
2. **Pagination reads its own i18n instance**, separate from the app's.
   `src/app/AppProviders.jsx` imports `nexcomponent-ui/dist/config/i18nConfig`
   and injects `{ OF: 'dari' }` for the `id` bundle. Without that, the footer
   renders in English while the rest of the page is Indonesian.
3. **Importing from the main barrel pulls the whole library.** `Table`,
   `Pagination`, and `StatePage` alone produce an 8.46 MB bundle (2.27 MB
   gzip). Nothing else in the app is large. Deep imports or manual chunking
   are the fix when size becomes a problem.
4. **Sass `map-get` deprecation and `eval` warnings originate inside the
   library**, not in app code. They are not fixable from this repo.

---

## 4. Tooling and environment

- **Playwright browser revision mismatch.** The cache had revision 1234; the
  installed Playwright wanted 1248. The smoke suite runs `channel: 'chrome'`
  against system Chrome instead. Re-run `npx playwright install` when the
  network allows and drop the channel override.
- **The Docker image did not start on the first real run.** `proxy_pass
  http://sandbox-svc:8080/` is resolved when nginx loads its config, so the
  container exited with `host not found in upstream "sandbox-svc"` whenever the
  backend was not already running — a failure `vite preview` cannot reproduce,
  because preview serves the SPA without nginx. Fixed by resolving at request
  time (`resolver 127.0.0.11` + a variable + `rewrite`, since a variable in
  `proxy_pass` drops the original URI unless it is rewritten by hand).
  Keep the image in the verification loop; a green preview proves less than it
  looks like it does.
- **Verified running now:** `docker run -p 8081:80` serves `/`, `/favorites`,
  and `/catalog/123` as 200 via SPA fallback; assets 200; `/api/*` returns 502
  with no backend, which is the correct failure.
- **The `react-frontend-standards` skill was not in the plugin cache.** It was
  read from `D:\code\my-local-code\vendor\nexcraft\skills\react-frontend-standards`.
  If that path is not canonical, the standards applied here may drift from the
  team's current ones.

---

## 5. Patterns worth repeating

- **Adapter → service → hook → page.** The adapter owns the wire shape, the
  service owns HTTP, the hook owns state, the page owns layout. Every API
  change lands in one file.
- **Request-id guard on paging.** `useFavorites` ignores stale responses by
  tagging each request. This matters more than debounce here — there is no
  search input, so no debounce was added. Do not add one speculatively.
- **Optimistic toggle with rollback.** Flip the star, revert on failure, show
  the error inline where the control is. No toast — the requirement says so,
  and it is the better pattern anyway.
- **401 handled in the axios interceptor, not per call site.** One place,
  every request covered, and the current path is captured before navigation.

---

## 6. Deliberately deferred

Sorting, filtering, bulk actions, real catalog/auth services, Docker image
build, and bundle splitting. Each is either explicitly deferred by the docs or
gated on a contract that does not exist yet (§2). None were stubbed with a
half-built abstraction.
