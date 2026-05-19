# Phase 2 — AgnosticUI Wrappers

**Status:** ❌ PENDING

## Goal
Integrate AgnosticUI (unstyled, modern component library) as base UI layer, create project-specific wrappers.

## Context
- AgnosticUI: framework-agnostic (React, Vue, Svelte, Angular, etc.), unstyled, accessible
- Wrappers in `packages/ui/` will add project styles on top
- Goal: reuseable components without framework lock-in

## Tasks

- [ ] Research AgnosticUI Vue integration
- [ ] Create wrapper components in `packages/ui/`
- [ ] Style wrappers with DS tokens (when available)
- [ ] Test in `apps/web-vue`

## Decisions

| Decision | Choice |
|----------|--------|
| Base library | AgnosticUI (to be confirmed) |
