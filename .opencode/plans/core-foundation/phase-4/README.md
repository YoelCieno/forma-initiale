# Phase 4 — Angular Implementation

## Deliverables

| #   | Deliverable                                      | Doc                                                        | Status                        |
| --- | ------------------------------------------------ | ---------------------------------------------------------- | ----------------------------- |
| 4.0 | Risks & mitigations register (R1–R11)            | [`4.1-risks-mitigations.md`](./4.1-risks-mitigations.md)   | 🔶 IN PROGRESS                |
| 4.1 | Scaffold Angular app (`apps/white-label-angular/`) via Angular CLI 22 | TBD                                                        | ⏳ PENDING                    |
| 4.2 | Implement Angular factory (parallel to `createWhiteLabelApp`)        | TBD                                                        | ⏳ PENDING                    |
| 4.3 | Create Angular base components (fe-* compositing)                    | TBD                                                        | ⏳ PENDING                    |
| 4.4 | Port existing pages (Products, About, AppShell)                      | TBD                                                        | ⏳ PENDING                    |
| 4.5 | Build & verify (turbo, routing, data flow, tests)                    | TBD                                                        | ⏳ PENDING                    |
| 4.6 | Create fake-plants-angular tenant (optional)                         | TBD                                                        | ⏳ PENDING                    |

## Cross-cutting

- Each deliverable ends with **Manual Confirmation** — human verifies before next starts
- Order is strict (4.0 risks → 4.1 scaffold → 4.2 factory → 4.3 components → 4.4 pages → 4.5 verify → 4.6 tenant)
- Risk register (4.0) drives the smoke-test order: R3 CSS → R1 ng test binding → R2 paths → `bun run build` → `bun run test`
- Naming: `white-label-angular` (matches `white-label-vue` layer convention), not `web-angular`
- App is zoneless (v22 default) + signals + OnPush; consume `fe-*` WCs via CUSTOM_ELEMENTS_SCHEMA