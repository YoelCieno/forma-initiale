# CSS Convention: BEM

All component styles in Vue SFCs follow **BEM** (Block Element Modifier) naming.

## Pattern

```
.block {}
.block__element {}
.block--modifier {}
```

## Rules

1. **Block** = component root class name (kebab-case): `.products-page`, `.button-demo`
2. **Element** = child of block, double underscore: `.products-page__card`, `.button-demo__heading`
3. **Modifier** = variant/state, double dash: `.block--active`, `.block--large`
4. **No nested element selectors** — always use explicit BEM class names
5. **Scoped styles** — always use `<style scoped>` for component isolation
6. **Global tokens** — use `var(--wa-*)` from `styles/tokens/` for theming values
7. **Not for fe-\* WC wrappers** — fe-\* components use WA shadow DOM, no custom CSS (unless adding internal structure)

## Why BEM + Scoped

- BEM provides naming consistency and prevents class collisions
- Vue scoped adds `data-v-xxx` attribute isolation
- Combined: self-documenting structure + framework-level protection
