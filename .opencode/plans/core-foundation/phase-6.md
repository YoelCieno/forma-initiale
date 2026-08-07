# Phase 6 — CSS `@layer` Cascade Strategy (Optional)

**Goal:** Move from implicit unlayered CSS cascade to explicit `@layer` control. Add `app` and `tenant` layers to the WA layer stack so that app/tenant styles have deterministic ordering without relying on unlayered-CSS-beats-layered-CSS behavior.

**Status:** ⏸️ OPTIONAL — deferred to end of roadmap. Only scheduled if CSS cascade conflicts arise in practice.

## Background

- WA declares 7 layers in `styles/layers.css` (wa-native → wa-utilities → wa-color-palette → wa-color-variant → wa-theme → wa-theme-dimension → wa-theme-overrides)
- Currently app/tenant styles are unlayered — they beat WA layered styles by CSS spec, but this is implicit and fragile (e.g. if WA ever adds more layers, or other libs introduce layers, ordering becomes unpredictable)
- Tenant override chains (WL var → tenant var → WA component) work via CSS custom properties, which don't care about layers — but direct style rules (e.g. `.card { padding: ... }`) need predictable layering

## Tasks

### 6.1. Declare app layer order

Add `@layer` declaration in `@repo/ui/styles` or white-label-vue:

```css
@layer app, tenant;
```

This must precede all other CSS. Position it after WA's layers.css import so the full layer stack is: wa-\*, app, tenant.

### 6.2. Wrap white-label styles in `@layer app`

- `apps/white-label-vue/src/styles/base.css` → `@layer app { ... }`
- Verify no regressions: unlayered styles that were previously highest precedence now live in `app` layer (still after WA, same effective position but explicit)

### 6.3. Wrap tenant styles in `@layer tenant`

- `apps/fake-plants-vue/src/styles/*` → `@layer tenant { ... }`
- Tenant overrides WL in layer order (tenant declared after app)
- Test with a concrete override case

### 6.4. Verify no cascade changes

- Build white-label-vue and fake-plants-vue
- Visually verify component rendering matches pre-@layer state
- Check that WA component styles aren't accidentally leaking through

### 6.5. Document @layer architecture

- Add layer diagram to `docs/integrations/layer-wiring.md`
- Explain layer order, var resolution (layer-independent), and tenant override flow

## ✅ Manual Confirmation

- [ ] WA layers.css declares wa-\* layers before app/tenant
- [ ] `@layer app` wraps WL styles, `@layer tenant` wraps tenant overrides
- [ ] Builds pass for all apps
- [ ] Visual regression: components render identically to pre-@layer state
- [ ] Docs updated with layer diagram

## Notes

- Phase 6 assumes no new visual design work — only structural CSS refactoring
- If WA adds/changes layers, the layer declaration may need updating
- `@layer` is well-supported in all modern browsers (2024+)
