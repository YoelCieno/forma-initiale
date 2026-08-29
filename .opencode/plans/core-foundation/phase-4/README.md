# Phase 4 — Angular Implementation

## Deliverables

| #   | Deliverable                                    | Doc                                                        | Status                            |
| --- | ---------------------------------------------- | ---------------------------------------------------------- | --------------------------------- |
| 4.1 | Risks & mitigations register (R1–R11)          | [`4.1-risks-mitigations.md`](./4.1-risks-mitigations.md)   | ✅ COMPLETED (R1–R10 verified)     |
| 4.2 | Scaffold `apps/white-label-angular/` (Angular CLI 22) | [`4.2-scaffold.md`](./4.2-scaffold.md)               | ✅ COMPLETED                       |
| 4.3 | Angular factory (`createWhiteLabelApp` equivalent)    | [`4.3-factory.md`](./4.3-factory.md)                 | ✅ COMPLETED                       |
| 4.4 | Angular base components (fe-* compositing, CUSTOM_ELEMENTS_SCHEMA) | [`4.4-base-components.md`](./4.4-base-components.md) | 🔶 IN PROGRESS |
| 4.4.6 | Shared @repo/utils package (util unification) | [4.4-base-components.md](./4.4-base-components.md) | 🔶 PLANNED |
| 4.5 | Port pages (Products, Components, AppShell, metaMap)   | [`4.5-pages-port.md`](./4.5-pages-port.md)           | ⏳ PENDING                         |
| 4.6 | `fake-plants-angular` tenant (manual parity check)     | [`4.6-fake-plants-angular.md`](./4.6-fake-plants-angular.md) | ⏳ PENDING |
| 4.7 | `@repo/generator` Angular tenant generator             | [`4.7-generator-angular.md`](./4.7-generator-angular.md) | ⏳ PENDING                       |
| 4.8 | Build & verify + documentation                         | [`4.8-verify-docs.md`](./4.8-verify-docs.md)         | ⏳ PENDING                         |

## Cross-cutting

- Each deliverable ends with **Manual Confirmation** — human verifies before next starts
- Order is strict (4.1 → 4.2 → 4.3 → 4.4 → 4.5 → 4.6 → 4.7 → 4.8)
- App is zoneless (v22 default) + signals + OnPush; consume `fe-*` WCs via CUSTOM_ELEMENTS_SCHEMA
- Dev server requires `--prebundle=false` (dep-optimizer workaround) baked into dev script + angular.json serve.options
- Risk register (4.1) drives the smoke-test order; R1–R10 verified at scaffold + factory, R11 cadence ongoing
- `fake-plants-angular` (4.6) is NOT optional — manual parity check vs `fake-plants-vue` is required before building the generator (4.7)
