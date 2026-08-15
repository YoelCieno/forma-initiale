---
name: tokens-css-import-project-specific
description: Use this pattern when handling recurring project specific workflows.
title: Project-Specific Convention Pattern
signature: 72c4b6204eec
version: 1.0.0
source: continuous-learning
category: project_specific
status: review-required
session_id: ses_1255de145ffefJvs0G4Vnbdly9
message_count: 64
tags: [project-conventions, consistency]
---

# Project-Specific Convention Pattern

## When to use

Use this pattern when handling recurring project specific workflows.

## Steps

1. Identify recurring project conventions applied during the session.
2. Translate each convention into a simple decision checklist.
3. Show one concrete example from this session.
4. List anti-patterns that should be rejected in future work.

## Examples

- **Current white-label-vue architecture:**
- | CSS override | CSS cascade: tenant `tokens.css` after white-label's → vars win | Just import order |

## Caveats

- Conventions evolve; revalidate periodically against source docs.
- Do not generalize project-specific rules to unrelated repositories.
