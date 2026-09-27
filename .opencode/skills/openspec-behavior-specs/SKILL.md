---
name: openspec-behavior-specs
description: Use when creating implementation plans, phase files, or spec documents that need behavior specifications. Adds RFC 2119 requirements (SHALL/MUST/SHOULD) and GIVEN/WHEN/THEN scenario format to phase files. Auto-triggers on planning tasks, plan creation, spec writing, or when user says "add behavior specs", "write specs", "GIVEN/WHEN/THEN", "RFC 2119", or "OpenSpec".
---

# OpenSpec Behavior Specs

Grafts OpenSpec behavior specification patterns onto existing plan structure. Every phase file gets formal requirements with testable scenarios.

Source/s: [OpenSpec GitHub](https://github.com/Fission-AI/OpenSpec), [Concepts](https://raw.githubusercontent.com/Fission-AI/OpenSpec/main/docs/concepts.md), [Workflows](https://raw.githubusercontent.com/Fission-AI/OpenSpec/main/docs/workflows.md), [Existing Projects](https://raw.githubusercontent.com/Fission-AI/OpenSpec/main/docs/existing-projects.md)

## When to Use

- Creating new phase files → add `## Behavior Specs` section
- Modifying existing work → add `## Delta` section (ADDED/MODIFIED/REMOVED)
- Writing implementation plans → enforce spec-first approach
- Reviewing plans → verify behavior specs exist and are testable

## Phase File Template

Every phase file MUST follow this structure:

```markdown
# N.M. [Phase Title]

**Status:** [emoji] [STATUS]
**Goal:** [1-2 sentence summary]

## Sources
[Source table — existing pattern, keep as-is]

## Behavior Specs
[RFC 2119 requirements + GIVEN/WHEN/THEN scenarios — NEW]

## Delta
[ADDED/MODIFIED/REMOVED — only if modifying existing work]

## Tasks
[Existing task checklist — unchanged]

## Validation Checks
[Existing validation — unchanged]

## Manual Confirmation
[Human sign-off — unchanged]
```

## Behavior Specs Format

### RFC 2119 Keywords

Use these keywords precisely per RFC 2119:

| Keyword | Meaning | When to use |
|---------|---------|-------------|
| SHALL | Absolute requirement | Non-negotiable behavior, breaking if absent |
| MUST | Synonym for SHALL | Alternative phrasing for emphasis |
| SHOULD | Recommended, possible exceptions | Best practice, allows documented exceptions |
| MAY | Optional | Nice-to-have, not required for correctness |

### Scenario Structure

```markdown
## Behavior Specs

### Requirement: [Descriptive Name]
The system SHALL/MUST/SHOULD [behavior description].

#### Scenario: [Scenario Name]
- GIVEN [precondition / context]
- WHEN [action / trigger]
- THEN [expected outcome]
- AND [additional outcome — optional]
```

### Rules

1. **One requirement per concept** — don't bundle unrelated behaviors
2. **Each requirement → 1+ scenarios** — scenarios make requirements testable
3. **GIVEN = context** — what's true before the action
4. **WHEN = action** — the trigger or user interaction
5. **THEN = outcome** — verifiable result
6. **AND = additional outcomes** — extend THEN for multi-part results
7. **No implementation details** — specs describe WHAT, not HOW
8. **Testable** — each scenario should map to a future test case

## Delta Format (Conditional)

Only include when the phase MODIFIES existing work (not purely additive).

```markdown
## Delta

### ADDED Requirements
#### Requirement: [Name]
##### Scenario: [Name]
- GIVEN [context]
- WHEN [action]
- THEN [outcome]

### MODIFIED Requirements
#### Requirement: [Name] (MODIFIED from [phase])
##### Scenario: [Name]
- GIVEN [context]
- WHEN [action]
- THEN [outcome]

### REMOVED Requirements
#### Requirement: [Name]
- **Reason:** [Why removed]
- **Migration:** [What replaces it, if anything]
```

## Retroactive Application

When adding behavior specs to existing completed phases:

1. Read the phase file thoroughly
2. Extract implicit requirements from tasks and validation checks
3. Write scenarios that would have caught bugs during implementation
4. Insert `## Behavior Specs` BEFORE `## Tasks`
5. Keep all existing content — pure addition, no removal

## Reference Implementation

See `.opencode/plans/core-foundation/phase-4/4.5.0-behavior-specs-delta.md` for a complete example with:
- Behavior specs for Angular components, zoneless detection, theme integration, factory pattern
- Delta section for pages port (ADDED + MODIFIED requirements)
- Integration with existing task checklists

## Planner Integration

When creating plans, the planner MUST:

1. Include `## Behavior Specs` in every phase file
2. Add `## Delta` when phase modifies existing work
3. Ensure each scenario is testable (maps to future test case)
4. Use RFC 2119 keywords precisely
5. Reference this skill for format questions
