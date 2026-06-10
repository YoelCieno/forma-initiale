# ADR: Design Patterns and Principles

- **Status:** Accepted
- **Date:** 2026-06-08
- **Deciders:** [team]
- **Tags:** architecture, design-patterns, principles

## 1. Context

As the forma-initiale monorepo grows across multiple packages (`domain`, `infra`, `ui`) and apps (`web-vue`, `docs`), consistent design decisions become harder to maintain without an explicit reference. This ADR formalises the principles already emerging in the codebase and establishes a shared vocabulary for:

- **Consistent decision-making** — contributors have a known framework to resolve design tradeoffs.
- **Onboarding** — new contributors learn the project's design philosophy from a single document.
- **Code review alignment** — reviewers reference documented principles rather than subjective preference.
- **Pattern drift prevention** — as the codebase scales, a written standard anchors architecture against entropy.

## 2. Decision

We adopt the following **5 principles** as the design philosophy for all code in the forma-initiale monorepo. Every module, component, function, and configuration should be evaluable against these principles.

## 3. Principles

### KISSME — Keep It Simple, Stupid (Maintainable Experience)

The classic KISS principle — simplicity as a core design goal. "ME" expands to a Maintainable Experience: the simplest solution that works and is easy to maintain.

- Avoid premature abstraction, over-engineering, and unnecessary indirection layers.
- A CSS-only solution beats a JS solution when both work equally well.
- Plain exported functions are preferred over classes when a class adds no meaningful encapsulation or lifecycle.
- "Simple" does not mean "naïve" — it means the solution with the lowest total cost of ownership.

### SINE — Simple Is Not Easy

Simplicity is not the same as easiness. Creating something truly simple often requires more effort than building a complex solution full of unnecessary abstractions. Achieving simplicity is hard work.

- Resist the urge to over-engineer — a simple solution that works is harder to design but cheaper to maintain.
- Simplicity is measured in cognitive load for the reader, not in effort for the writer.
- When faced with a choice between a simple fix and an elaborate abstraction, choose the simple fix first. Extract only when patterns repeat.

### POLA — Principle of Least Astonishment

Code behaves as a reasonable developer familiar with the project and its ecosystem would expect.

- Follow established conventions from upstream libraries: Web Awesome attribute semantics, hybridJS descriptor patterns, Vue naming conventions.
- Naming reflects behaviour without surprises: `disabled` on an `fe-*` component means the same thing as `disabled` on the underlying `wa-*` component.
- Slot names follow Vue convention (`slot="loading"`, `slot="error"`, `slot="default"`).
- If a reader would be surprised by a behaviour, the design is wrong — not the reader.

### SoC + CQS — Separation of Concerns + Command-Query Separation

Layers are separated by concern, and within each layer commands are separated from queries.

- **Layer separation:** `domain` (pure TS types and ports) → `infra` (adapters implementing ports) → `ui` (agnostic web component wrappers) → `apps` (framework-specific compositions).
- **Command-Query Separation:** Functions either mutate state (commands) or return data (queries), never both.
- Presenters transform domain models into view models; components render view models; composables orchestrate the flow.
- Templates contain no business logic — only bindings and directives.

### CBD — Component-Based Design

The UI is built from composable, reusable, self-contained components.

- Every `fe-*` component follows the same architecture: hybridJS `define()` descriptor + `html` tagged template literal + `shadow: true`.
- The `packages/ui` layer is framework-agnostic — no Vue, React, or Angular imports.
- Components are self-contained: props in, render out, no external state dependencies.
- Framework apps (Vue, future Angular/React) consume `fe-*` elements as native custom elements.

## 4. Consequences

### Positive

- **Consistent architecture** across all packages and apps — same principles guide a domain model, an infra adapter, and a UI component.
- **Easier code reviews** — reviewers check against a known checklist instead of relying on taste alone.
- **New component template** — every new `fe-*` component has a clear structural template to follow.
- **Framework swap path** — the agnostic `ui` layer means switching from Vue to React (or adding a new framework app) does not require rewriting components.

### Negative

- **Tradeoffs between principles** are sometimes necessary. For example, strictly following CBD might suggest factoring a small repeated DOM fragment into a new component, while KISSME might argue an inline `v-if` is simpler. These must be resolved case by case and documented.
- **Tension between KISSME and CBD** surfaces regularly: a simple if-chain in a parent component often looks "simpler" than extracting a dedicated child component. The rule of thumb is: if the logic is used in more than one place or carries distinct semantic meaning, extract it.

## 5. Application Examples

> This section grows as the codebase evolves. Each entry links a concrete artefact to the principle it exemplifies.

### KISSME Examples

- **`fe-card` disabled attribute:** Pure CSS approach — `opacity` + `pointer-events` on the host element. No subclassing WA, no complex JS interception. One CSS property change, zero new logic.
- **`fe-async-content` states:** Simple if-else chain for `loading` / `error` / `default`. No state machine library, no Vue `<Suspense>` coupling, no complex orchestration.

### SINE Examples

- **`fe-async-content`:** Single responsibility — manage async UI states (loading/error/success). Does not fetch data, does not handle retries, does not manage business logic.
- **`fe-card`:** Pure display component. Renders a card container with named slots. No data fetching, no business logic, no state management.

### POLA Examples

- **`disabled` on `fe-card`:** Follows the same convention as `fe-button` and the underlying WA component's `disabled` attribute. Developers familiar with WA know exactly what to expect.
- **`fe-async-content` named slots:** Uses `slot="loading"`, `slot="error"` — follows Vue's standard named slot convention. Consumers recognise the pattern immediately.

### SoC + CQS Examples

- **Presenter layer:** API response (`Product` from domain) → presenter transforms → view model (`ProductView`). Components only ever see view models.
- **`useProducts` composable:** Orchestrates data fetching via `@repo/infra` and presentation via a product presenter. The Vue component only renders — no fetch, no transform, no business logic.
- **Domain models:** Pure TS types and interfaces with zero framework dependencies. No Vue reactivity, no decorators, no ORM annotations.

### CBD Examples

- **All `fe-*` components** share the same pattern: hybridJS `define()` + `html` tagged template + `shadow: true`. Consistent structure across `fe-button`, `fe-card`, `fe-icon`, `fe-rating`, `fe-async-content`.
- **`fe-*` wrappers insulate apps** from WA library changes. Apps never import `wa-*` directly — only through `@repo/ui`. A WA version bump or swap affects only `packages/ui`.
- **Components testable in isolation:** Each `fe-*` component can be mounted in isolation with `@vue/test-utils` and mock data for tests.

## 6. References

- [`docs/decisions/api-mocking-strategy.md`](../decisions/api-mocking-strategy.md) — references KISSME-SINE in handler design.
- [`docs/CODEMAPS/ARCHITECTURE.md`](../CODEMAPS/ARCHITECTURE.md) — hexagonal layer diagram and dependency graph.
- [`AGENTS.md`](../../AGENTS.md) — architecture direction and package layout overview.
- [Web Awesome Agent Skill](../../.opencode/references/webawesome/SKILL.md) — upstream component API conventions that inform POLA.
