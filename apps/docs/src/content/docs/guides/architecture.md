---
title: Architecture
description: Hexagonal architecture overview
---

## Hexagonal Architecture (Ports & Adapters)

The monorepo follows a package-per-layer hexagonal architecture:

### Layers

| Layer | Package | Responsibility | Dependencies |
|-------|---------|----------------|-------------|
| Domain | `@repo/domain` | Models, value objects, pure business rules | None |
| Infrastructure | `@repo/infra` | Adapters, HTTP clients, DTOs | domain |
| UI | `@repo/ui` | Framework-agnostic components | domain |
| App | `apps/web-vue` | Framework-specific UI, DI wiring | domain, infra, ui |

### Rules

- **Domain** never imports from infra, UI, or apps
- **Infra** implements domain ports
- **UI** is framework-agnostic (no Vue/React/Angular imports)
- **Apps** wire everything together
