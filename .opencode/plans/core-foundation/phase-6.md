# Phase 6 — React Implementation

**Goal:** Create a React app (`apps/web-react/`) that consumes `@repo/ui` fe-\* web components and follows the same hexagonal architecture as white-label-vue and web-angular.

## Background

- `@repo/ui` components are framework-agnostic Web Components (`fe-*` tags) built with hybridJS
- React supports custom elements natively since React 19 (previously required `ref`/`eventListener` workarounds)
- White-label-vue serves as reference layer; Angular implementation (Phase 5) provides second reference

## Tasks

### 6.1. Scaffold React app

- `apps/web-react/` using Vite + React template
- `package.json` with workspace deps: `@repo/domain`, `@repo/infra`, `@repo/presenters`, `@repo/ui`
- `tsconfig.json` — strict mode
- Vite config with React plugin

### 6.2. Implement React factory

- React equivalent of `createWhiteLabelApp()`
- Bootstrap with WA styles (@repo/ui/styles + theme)
- Set up React Router (hash-based)
- Wrap WA custom elements (React 19+ handles CE natively, no wrapper needed)

### 6.3. Create React base components

- Replicate page structure using React components
- Use `fe-*` elements in JSX
- Wire `@repo/presenters` for view model transforms
- Implement tenant override mechanism (React Context / provider pattern)

### 6.4. Port existing pages

- ProductsPage, AboutPage, AppShell in React
- Connect to `@repo/infra` adapters
- Metadata injection via React Context

### 6.5. Build & verify

- `bun run build` — turborepo includes React app
- Verify routing, data flow, component rendering
- Run React-specific tests

### 6.6. Create fake-plants-react tenant (optional)

- Tenant app consuming `web-react` as layer
- Same brand override pattern
- React Context for tenant-specific overrides

## ✅ Manual Confirmation

- [ ] React app builds and renders in browser
- [ ] All fe-\* components work in React (native CE support in JSX)
- [ ] Routing works (hash-based)
- [ ] Presenters wired and producing correct view models
- [ ] Tenant override mechanism functional
