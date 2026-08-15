# Phase 4 — Angular Implementation

**Goal:** Create an Angular app (`apps/white-label-angular/`) that consumes `@repo/ui` fe-\* web components and follows the same hexagonal architecture as white-label-vue.

**Status:** 🔧 IN PROGRESS — research-first. Evaluate Angular CLI vs manual scaffold, Vite/Nx compatibility with turborepo, and `CUSTOM_ELEMENTS_SCHEMA`/`createCustomElement()` approach before scaffolding.

## Background

- `@repo/ui` components are framework-agnostic Web Components (`fe-*` tags) built with hybridJS
- Angular has first-class support for custom elements via `CUSTOM_ELEMENTS_SCHEMA` and `createCustomElement()`
- White-label-vue serves as the reference layer implementation (app factory, routing, styles, presenters)

## Tasks

### 4.1. Scaffold Angular app

- `apps/white-label-angular/` using Angular CLI or manual scaffold
- `package.json` with workspace deps: `@repo/domain`, `@repo/infra`, `@repo/presenters`, `@repo/ui`
- `tsconfig.json` — strict mode, Angular compiler config
- `angular.json` — build config
- Vite/Nx as build tool? Evaluate compatibility with turborepo

### 4.2. Implement Angular factory (parallel to `createWhiteLabelApp`)

- Angular equivalent of white-label-vue's factory pattern
- Bootstrap Angular app with WA styles (@repo/ui/styles + theme)
- Register `CUSTOM_ELEMENTS_SCHEMA` for fe-\* tags
- Set up routing (standalone API)

### 4.3. Create Angular base components

- Replicate white-label-vue page structure (Products, About, etc.) in Angular
- Use `fe-*` components in Angular templates
- Wire `@repo/presenters` for view model transforms
- Implement tenant override mechanism (service injection / module override)

### 4.4. Port existing pages

- ProductsPage, AboutPage, AppShell in Angular
- Connect to `@repo/infra` adapters (fetch-based)
- Implement metadata injection equivalent (Angular InjectionToken)

### 4.5. Build & verify

- `bun run build` — turborepo includes Angular app
- Verify routing, data flow, component rendering
- Run Angular-specific tests

### 4.6. Create fake-plants-angular tenant (optional)

- Tenant app consuming `white-label-angular` as layer
- Same brand override pattern (tokens.css)
- Angular DI for tenant-specific overrides

## ✅ Manual Confirmation

- [ ] Angular app builds and renders in browser
- [ ] All fe-\* components work in Angular templates
- [ ] Routing works (hash-based)
- [ ] Presenters wired and producing correct view models
- [ ] Tenant override mechanism functional
