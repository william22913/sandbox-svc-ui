# sandbox-svc-ui

React 18.2 + Vite 5 (JSX), Ant Design 4.24, and `nexcomponent-ui` 2.1.9
(vendored at `vendor/nexcomponent-ui-2.1.9.tgz`) as the house component
layer. Data flows adapter (`src/core/api/adapters`) → service
(`src/core/services`) → hook (`src/features/*/hooks`) → page. Tests are
vitest (jsdom) and Playwright smoke scripts under `e2e/`. Lint with
`npm run lint`, build with `npm run build`, test with `npm test`.

## Feature docs

- FEAT-005 — Favorites summary and badge tooltip: [`docs/FEAT-005/spec.md`](docs/FEAT-005/spec.md)
