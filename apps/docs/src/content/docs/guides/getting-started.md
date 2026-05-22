---
title: Getting Started
description: Get started with Forma Initiale development
---

## Prerequisites

- [mise](https://mise.jdx.dev) for tool version management
- bun (`mise use bun`)

## Setup

```bash
git clone <repo-url>
cd forma-initiale
mise use bun
bun install
```

## Development

Run all apps in parallel:

```bash
bun run dev
```

Or run a specific app:

```bash
cd apps/web-vue && bun run dev
```

## Build

```bash
bun run build
```

All apps build into their `dist/` directories.
