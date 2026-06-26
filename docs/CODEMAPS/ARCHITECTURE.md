# Architecture Map

> High-level system overview for forma-initiale — a Turborepo + bun monorepo following hexagonal (ports & adapters) architecture.

## System Layers

```
┌──────────────────────────────────────────────────────┐
│                   Apps (framework)                   │
│  ┌───────────────┐  ┌──────────────────────┐  ┌────────────────────────────┐
│  │white-label-vue│  │  fake-plants-vue     │  │  docs                      │
│  │  (Vue 3, Vite)│  │  (Vue 3, Vite+)      │  │  (Astro + Starlight)       │
│  └───────┬───────┘  └──────────┬───────────┘  └────────────────────────────┘
│          │                                           │
├──────────┼───────────────────────────────────────────┤
│          │        packages (framework-agnostic)      │
│  ┌───────┴───────┐  ┌───────────┐  ┌──────────────┐  │
│  │  @repo/ui     │  │@repo/infra│  │ @repo/domain │  │
│  │  (WC wrappers)│  │(adapters) │  │ (pure models)│  │
│  └───────┬───────┘  └─────┬─────┘  └─────┬────────┘  │
│          │                │              │           │
└──────────┼────────────────┼──────────────┼───────────┘
           │                │              │
           ▼                ▼             ▼
     WebAwesome 3.7    fetch/HTTP API    (no deps)
     (design system)
```

## Hexagonal Structure

```
Domain (pure TS)          Infra (adapters)          UI (agnostic)
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│  Product     │◄───────┤  getProducts  │         │  fe-button   │
│  (interface) │  type   │  (fetch impl)│         │  (hybridJS)  │
└──────────────┘         └──────────────┘         └──────┬───────┘
                                                         │
                    Apps (framework-specific)            │
                     ┌────────────────────┐              │
                     │  white-label-vue   │◄─────────────┘
                     │  ├─ App.vue        │  <fe-button>  
                     │  ├─ ProductsPage   │                
                     │  ├─ ComponentsPage │                
                     │  └─ useProducts    │                
                     │     (composable)   │                
                     └────────────────────┘                
                                                         
                                                     
                     ┌────────────────────┐                
                     │  fake-plants-vue   │                
                     │  ├─ App.vue        │                
                     │  ├─ ProductsPage   │                
                     │  └─ AboutPage      │                
                     └────────────────────┘                
                     ┌────────────────────┐                
                     │  docs              │                
                     │  ├─ Architecture   │                
                     │  ├─ Getting Started│                
                     │  └─ Configuration  │                
                     └────────────────────┘                
```

## Data Flow

```
User Action
    │
    ▼
Vue Component (ProductsPage.vue)
    │  uses fe-async-content for loading/error/content
    ▼
Composable (useProducts.ts)
    │  calls getProducts → pipe through presenter
    ▼
Infra Adapter (getProducts.adapter.ts)  ── fetch() ──► MSW (dev/test) or External API (prod)
    │
    ▼
Domain Model (Product interface)
    │
    ▼
Presenter (product.presenter.ts)
    │  Product → ProductView (enrich with framework name, logo, description)
    ▼
Vue Reactive State (ref<ProductView[]>)
    │
    ▼
Template renders (fe-async-content → fe-card × N with fe-icon, fe-rating)
```

## Dependency Graph

```
                     @repo/eslint-config
                     @repo/typescript-config
                            │
         ┌──────────────────┼──────────────────┐
         ▼                  ▼                 ▼
   @repo/domain      @repo/infra           @repo/ui
   (pure TS)         │  deps: domain       │  deps: hybrids, WA
         │           │                     │
         └──────┬────┘                     │
                ▼                          │
      @repo/presenters										 │
            │  deps: domain                │
            │															 │
            ▼															 │
      white-label-vue ◄────────────────────┘
            deps: domain, infra, presenters, ui, vue, vue-router
                │													 │
                ▼													 │
      fake-plants-vue ◄────────────────────┘
            deps: white-label-vue, domain, infra, presenters, ui
                │
                ▼
           docs
           deps: astro, starlight, sharp
```

## Key Architectural Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Monorepo tool | Turborepo 2.9 | Fast parallel builds, caching |
| Package manager | bun 1.3.13 | Speed, workspace-aware installs |
| Framework | Vue 3 (white-label-vue) | Standalone components, Composition API |
| App framework | Astro + Starlight (docs) | MDX content, integration-friendly |
| UI paradigm | HybridJS Web Components | Framework-agnostic, no runtime |
| Design system | WebAwesome 3.7 | Accessible, themed, WA-compatible |
| Ports/Adapters | Domain → Infra | Pure domain, swappable infra |
| Custom elements | `<fe-*>` wrapper → `<wa-*>` | Single definition in @repo/ui |
| State mgmt | Composables + ref/reactive + @vueuse/core | Vue native + useAsyncState for async |
| Presenter | Pure TS transform layer (domain model → view model) | Decouples API shape from template, enriches with UI metadata |
| Routing | vue-router (hash mode) | SPA hash-based routing |
| Type checking | tsc (noEmit) | Type-check only, Vite for bundling |
| Layer factory pattern | `createWhiteLabelApp()` + `defineWhiteLabelViteConfig()` | White-label-vue exports factories (app bootstrap, Vite config) for tenant apps to consume via workspace deps. Single source of truth for plugin setup, router, MSW bootstrap, auto-imports. |
| Testing | Vitest + jsdom + @vue/test-utils | Vite-native, fast |
| API mocking | MSW (Mock Service Worker) | Intercepts fetch in dev (SW) + test (Node). Single pattern for both environments |
| Linting | ESLint 8 (CJS config) | Stable, widely supported |
