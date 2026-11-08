# sandbox-svc-ui

Frontend for FEAT-001 (Favorite Items) on `sandbox-svc`. React 18 + Vite (JSX),
`nexcomponent-ui` as the component layer, with Ant Design 4 for primitives the
library does not provide (icon buttons).

## Requirements

- Node 18+
- The feature docs in `sandbox-docs/sandbox-svc/feature/FEAT-001/`

## Setup

```bash
npm install
npm run dev      # http://localhost:5173, proxies /api to http://localhost:8080
npm run build
npm run lint
npm test
```

Override the API base URL with `VITE_API_BASE_URL`; override the dev proxy
target with `VITE_PROXY_TARGET`.

## Library dependency

`nexcomponent-ui` is a private Bitbucket package in the house environment. The
exact release (`2.1.9`, branch `release/v0.1.16`) is vendored at
`vendor/nexcomponent-ui-2.1.9.tgz` so `npm install` works without registry
credentials. Replace it with the normal registry dependency when this repo is
connected to the house package registry.

## Routes

| Route | Page |
|---|---|
| `/favorites` | My Favorites (REQ-002/003/004/009/010) |
| `/catalog` | Stand-in catalog listing (not part of this feature's API) |
| `/catalog/:itemId` | Item detail with the favorite star (REQ-001/003/006/007/011/012) |
| `/login` | Stand-in login page that carries the `redirect` return path |

## API contract used

- `GET /favorites?page=&page_size=` -> `{ data, page, page_size, total }`
- `POST /favorites` `{ item_id }`
- `DELETE /favorites/{item_id}`

401 on any route redirects to `/login?redirect=<current path>`; 422
`FAVORITES_LIMIT_REACHED` shows the inline cap error; 404 is treated as the
generic save error.
