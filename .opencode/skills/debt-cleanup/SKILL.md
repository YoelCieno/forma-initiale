---
name: debt-cleanup
description: >
  Triggered by "clean up", "fix debt", "improve quality", "technical debt"
  requests after task completion. Scans for known debt patterns — WA attr
  reflection mismatches, hybridJS render timing, missing exports, stale decls,
  config drift, uncommitted files — and fixes them. Always runs verification
  gate (tsc + test + build) after each fix pass.
---

# Debt Cleanup Skill

## When to Activate

Activate AFTER any task that produces:
- New `fe-*` wrapper component in `packages/ui/components/`
- Modified `packages/ui/package.json` exports
- Renamed/removed `.vue` pages or components
- Changed test files
- Modified workspace configs (`tsconfig.json`, `eslintrc`, `vitest.config`)
- Changed imports between packages (domain → infra → ui → apps)

Also activate when user says "clean up", "fix debt", or "improve quality".

Once opencode is restarted, the `/fix` slash command dispatches to the
debt-cleanup agent directly.

## Debt Patterns (Ordered by Likelihood)

### 1. WA Attribute Reflection Mismatch (HIGH)

**Problem:** `wa-*` elements often do NOT reflect certain properties to
attributes. Tests using `getAttribute()` for these return `null`.

**Props that DON'T reflect to attrs:**
- `disabled`, `loading`, `pill` (WA booleans)
- `label` (a11y, string — no attr reflection)
- `src` (URL, string — no attr reflection)
- `swapOpacity` (boolean — no attr reflection)
- `autoWidth` (boolean — reflected as `auto-width` kebab attr)

**Fix:** Use `Reflect.get()` to access JS properties dynamically without
typecasting the element:

```typescript
// ❌ WRONG (fails at runtime — WA doesn't reflect to attr)
expect(waButton?.getAttribute('disabled')).toBe('')

// ✅ CORRECT — Reflect.get avoids element type cast entirely
expect(Reflect.get(waButton, 'disabled')).toBe(true)
```

No interface needed. `Reflect.get()` works on any object and avoids
both `as ElementType` and `any` patterns.

### 2. hybridJS Render Timing (HIGH)

**Problem:** hybridJS uses `deferred.then()` microtask for initial render.
Lit (used by WA) needs an additional microtask for property→attr reflection.

**Fix:** Property changes need TWO `await Promise.resolve()` calls:

```typescript
el.variant = 'brand'
await Promise.resolve()  // hybridJS re-render
await Promise.resolve()  // Lit/Wa attribute reflection
```

For boolean props, set back to false also needs two resolves:

```typescript
el.disabled = true
await Promise.resolve()
await Promise.resolve()
el.disabled = false
await Promise.resolve()
await Promise.resolve()
const waButton = el.shadowRoot?.querySelector('wa-button')
expect(Reflect.get(waButton, 'disabled')).toBe(false)
```

### 3. Missing Package Export (HIGH)

**Problem:** New `fe-*` component created but not registered in
`packages/ui/package.json` `exports` map. Apps can't import it.

**Fix:** Add entry to `packages/ui/package.json`:

```json
"./fe-<name>": "./components/fe-<name>.ts"
```

### 4. Stale Auto-import Declarations (MEDIUM)

**Problem:** Vue auto-import plugin generates `components.d.ts` and
`auto-imports.d.ts`. Adding/removing components or composables doesn't
regenerate these. Type errors or stale references appear.

**Fix:** Rebuild auto-imports:

```bash
cd apps/web-vue && npx unplugin-vue-components --force
```

Or run vite build (auto-imports regenerate during build):

```bash
cd apps/web-vue && bun run build
```

Or manually update `apps/web-vue/src/components.d.ts` and
`apps/web-vue/src/auto-imports.d.ts` to match current component set.

### 5. File Rename Without Cleanup (MEDIUM)

**Problem:** Renaming a page/component leaves behind:
- Old `.spec.ts` referencing old import path
- Old import references in other files
- Outdated auto-import declarations
- Router entries with stale component paths

**Fix checklist:**
- [ ] Delete old file if no longer needed
- [ ] Update ALL test files that import the old path
- [ ] Update router if path changed
- [ ] Rebuild auto-imports (see pattern 4)
- [ ] Search for remaining stale references:
  ```bash
  grep -r "old-name\|OldName" apps/web-vue/src --include="*.ts" --include="*.vue"
  ```

### 6. Config Drift (MEDIUM)

**Problem:** Adding packages/files that need config updates.

**Checklist:**
- [ ] `tsconfig.json` `include` array for new source dirs
- [ ] `turbo.json` outputs for new build artifacts
- [ ] `package.json` workspace entry if new package
- [ ] `.eslintrc.cjs` for new package
- [ ] `vitest.config.ts` if new test patterns
- [ ] `.env.example` for new env vars

### 7. Shared CSS Vars Not Consolidated (LOW)

**Problem:** Hardcoded colors/spacing/typography in components instead of
using `--wa-*` CSS custom properties from the design system.

**Fix:** Reference `--wa-*` vars from `apps/*/src/styles/tokens/base.css`.
Never hardcode literal color/spacing/typography values.

### 8. Untracked New Files (LOW)

**Problem:** New `.ts`, `.vue`, `.spec.ts` files not yet staged.

**Fix:**
```bash
git status --short | grep '^??'  # find untracked
```

## Verification Gate

After ALL fixes, run:

```bash
# 1. Tests
cd packages/ui && bun run test   # if fe-* components changed
cd apps/web-vue && bun run test  # if Vue app changed
cd packages/infra && bun run test # if infra changed

# or run all:
cd /data/sites/build-systems/forma-initiale && bun run test

# 2. Type-check
cd /data/sites/build-systems/forma-initiale && bun x tsc -p packages/ui/tsconfig.json --noEmit

# 3. Build
cd /data/sites/build-systems/forma-initiale && bun run build

# 4. Lint
cd /data/sites/build-systems/forma-initiale && bun run lint
```

Any failure → fix and re-verify.

## Human Test (MANDATORY)

After all automated verification passes, run a manual visual check:

1. Start dev server: `cd apps/web-vue && bun run dev`
2. Navigate to routes that use changed components
3. Verify:
   - Component renders visually (no blank/frozen)
   - WA theme styling applied (not raw unstyled WC)
   - Interactions work (click, hover, focus)
   - Console has no errors
   - No hardcoded colors (use `--wa-*` vars)
4. Report any visual or interaction bugs found

### Human Test Checklist

```
[ ] Dev server starts without errors
[ ] Changed components appear styled (theme loaded)
[ ] Interactions behave as expected
[ ] Browser console has 0 errors
[ ] No hardcoded color/spacing values (DS vars only)
[ ] Responsive layout works
```
