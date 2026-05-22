---
title: Forma Initiale
description: Welcome to the Forma Initiale documentation
---

Welcome to **Forma Initiale** — a hexagonal-architecture monorepo built with Turborepo, bun, and Vue 3.

## Architecture

```
packages/
├── domain/    # Pure business models
├── infra/     # Adapters, HTTP clients, DTOs
└── ui/        # Framework-agnostic components
apps/
├── web-vue/   # Vue 3 application
└── docs/      # Documentation (you are here)
```

## Quick Start

```bash
bun install
bun run dev     # Start all apps
bun run build   # Build all apps
bun run lint    # Lint all packages
```
