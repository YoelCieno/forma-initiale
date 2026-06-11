# D. `@repo/generator` + Vue Tenant Pinion Generator

**Goal:** Create a reusable Pinion-based code generator that scaffolds tenant apps from the validated fake-plants-vue pattern.

## Sources

| Source file | Content |
|------------|---------|
| `package.json` (root) | Add devDep + npm script |
| `apps/fake-plants-vue/` | Reference implementation for generator output |
| `packages/generator/` | Utility package to create |
| `@featherscloud/pinion` | TS-native code generator library |

## Tasks

### D1. Install Pinion

- [ ] `bun add -d @featherscloud/pinion` at root

### D2. Create `packages/generator/`

- [ ] `packages/generator/package.json`:
  - `name: "@repo/generator"`, `type: "module"`
  - `exports: { "./*": "./src/*.ts" }`
  - No deps (uses Pinion from root)
- [ ] `packages/generator/tsconfig.json` — extends `base.json`
- [ ] `packages/generator/.eslintrc.cjs`

### D3. Create Vue tenant generator

- [ ] `packages/generator/generators/vue-tenant.tpl.ts`:
  - Prompt: `name` (tenant name, kebab-case)
  - Prompt: `description` (optional, for package.json)
  - Template: scaffold minimal tenant based on fake-plants-vue:
    - `package.json` with workspace dep on `@repo/white-label-vue`
    - `vite.config.ts` importing `layerConfig`
    - `tsconfig.json`
    - `index.html`
    - `src/main.ts` calling `createWhiteLabelApp()`
    - `src/overrides/components/` (empty)
    - `src/overrides/pages/` (empty)
    - `src/overrides/styles/tokens.css` (template with placeholder brand vars)
  - Input variable: `{{name}}`, `{{Name}}` (PascalCase), `{{description}}`
  - Output dir: `apps/tenant-{{name}}-vue/`

### D4. Add root npm script

- [ ] `package.json` scripts: `"generate:vue-tenant": "pinion packages/generator/generators/vue-tenant.tpl.ts"`

### D5. Test generator

- [ ] `bun run generate:vue-tenant` — run it
- [ ] Enter `test-tenant` as name
- [ ] Verify `apps/tenant-test-tenant-vue/` created with all files
- [ ] `cd apps/tenant-test-tenant-vue && bun install` (bun resolves workspace deps)
- [ ] `cd apps/tenant-test-tenant-vue && bun run build` — succeeds
- [ ] Delete test tenant after validation

## ✅ Manual Confirmation

- [ ] Human inspects generated tenant structure
- [ ] Human confirms: "Generator works, proceed to E"
