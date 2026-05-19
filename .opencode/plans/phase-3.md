# Phase 3 — White-Label Extend Layer

**Status:** ❌ PENDING

**This is the MAIN and ESSENTIAL goal.**

## Goal
Architecture where a base app can be inherited and components/styles overridden — true white-label solution.

## Concept
- App "layers" (base → tenant → custom)
- Component inheritance: override specific SFCs without forking
- Style layering: CSS custom properties or DS token overrides per brand

## Research Questions
- How to structure extend layers in a Vue 3 monorepo?
- Can Turborepo's package graph model this? (base-ui → tenant-ui → app)
- Component inheritance: slots? named slots? render functions?
- Style override strategy: CSS vars? SCSS with DS tokens?
- Is there a known pattern for Vue 3 white-label?
- Look at: Nuxt layers, Vue 3 plugin systems, headless CMS patterns

## Tasks

- [ ] Research Vue 3 white-label / extend layer patterns
- [ ] Design layer architecture
- [ ] Prototype: base app + tenant override
- [ ] Document pattern for future teams
- [ ] Apply to `packages/ui/` and `apps/web-vue`

## Key Constraints

- One codebase, multiple brands
- Minimal duplication
- Type-safe overrides
- Build-time or runtime? (prefer build-time for perf)
