---
description: Clean up technical debt from the last task
agent: debt-cleanup
subtask: true
---

# /fix — Debt Cleanup

Clean up technical debt from the completed task: $ARGUMENTS

Scan for these issues and fix them:

1. **WA Attribute Reflection** — tests using `getAttribute()` for WA boolean/string props that don't reflect to attrs. Replace with `Reflect.get()`.
2. **hybridJS Render Timing** — missing `await Promise.resolve()` ×2 after property changes in tests.
3. **Missing Package Exports** — new `fe-*` components not in `packages/ui/package.json` exports.
4. **Stale Auto-imports** — `components.d.ts` out of sync after page/component renames.
5. **Config Drift** — new packages missing `tsconfig`, `eslintrc`, `vitest config`.
6. **Untracked Files** — new `.ts`, `.vue`, `.spec.ts` not staged.

After all fixes, run: test → tsc → build → lint. Then start dev server for human visual check.
