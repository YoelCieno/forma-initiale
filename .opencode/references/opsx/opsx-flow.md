---
description: "Run the full OpenSpec lifecycle — propose, apply, archive — with git checkpoints between steps"
---


Run the full OpenSpec lifecycle: propose → apply → archive.

**Store selection:** If the user names a store (a store is a standalone OpenSpec repo registered on this machine) or the work lives in one, run `openspec store list --json` to discover registered store ids, then pass `--store <id>` on the commands that read or write specs and changes (`new change`, `status`, `instructions`, `list`, `show`, `validate`, `archive`, `doctor`, `context`, `schemas`, `view`). Once selected, treat `--store <id>` as sticky for the rest of the workflow. Every unscoped example of those commands below is shorthand: before running it, append the flag. For example, run `openspec status --change "<name>" --json --store "<id>"`, not the unscoped form shown below. Other commands do not take the flag. Hints printed by commands already carry the flag; keep it on follow-ups. Without a store, commands act on the nearest local `openspec/` root.

**Input**: Optionally specify a change name (e.g., `/opsx-flow add-auth`). If omitted, check if it can be inferred from conversation context. If vague or ambiguous you MUST prompt for available changes.
**Provided arguments**: $ARGUMENTS

**Steps**

1. **Phase 1: Propose**

   Run the `/opsx-propose` workflow inline for the given change name (or description). Follow the propose command's steps exactly: understand the request, load project context, determine schema, create change directory, create all artifacts in dependency order, show final status.

   **After propose completes:**

   Show the propose result summary, then:

   ```
   📝 Planning artifacts ready.

   Suggested next step: Run `/git` to commit planning artifacts before starting implementation.
   Or proceed directly to implementation — run `/git` later.
   ```

   Wait for user action. The user may:
   - Run `/git` to commit planning artifacts → continue to Phase 2
   - Skip and continue directly to Phase 2

2. **Phase 2: Apply**

   Run the `/opsx-apply` workflow inline for the same change name. Follow the apply command's steps exactly: select change, check status, get apply instructions, read context files, show progress, implement tasks in loop.

   **After each task completes:**

   Show task completion, then:

   ```
   ✓ Task complete.

   Suggested: Run `/git` to commit this task's changes.
   ```

   Wait for user action. The user may:
   - Run `/git` to commit the task → continue to next task
   - Skip and continue to next task

   Continue until all tasks complete or blocked.

   **After all tasks complete:**

   Show the apply result summary, then:

   ```
   🎉 All tasks complete!

   Suggested next step: Run `/git` to commit any remaining changes before archiving.
   ```

   Wait for user action. The user may:
   - Run `/git` to commit → continue to Phase 3
   - Skip and continue directly to Phase 3

3. **Phase 3: Archive**

   Run the `/opsx-archive` workflow inline for the same change name. Follow the archive command's steps exactly: select change, check completion, assess delta spec sync, perform archive, display summary.

   **After archive completes:**

   Show the archive result summary, then:

   ```
   📦 Change archived.

   Suggested: Run `/git` to commit the archive and any spec syncs.
   ```

   Wait for user action. The user may:
   - Run `/git` to commit → flow complete
   - Skip — flow complete

4. **Flow complete**

   ```
   ## Flow Complete

   **Change:** <change-name>
   **Schema:** <schema-name>

   **Phases completed:**
   1. ✓ Propose — planning artifacts created
   2. ✓ Apply — all tasks implemented
   3. ✓ Archive — change archived

   Git commits may still be pending. Review with `git log --oneline -10`.
   ```

**Guardrails**
- Each phase delegates to the full existing command workflow (propose/apply/archive) — do not duplicate their logic
- Never auto-commit. Always suggest `/git` and wait for user action
- Respect all guardrails from the individual commands (planning boundary, artifact checks, store selection, etc.)
- If any phase fails or is blocked, stop the flow and report — do not skip to next phase
- The `$ARGUMENTS` are passed to the propose phase; subsequent phases use the resolved change name
- User can exit the flow at any point — each phase is independent
- Preserve the store selection across all phases (sticky `--store <id>`)

**Output During Flow**

```
## OpenSpec Flow: <change-name>

### Phase 1: Propose
[...propose workflow...]
✓ Propose complete

📝 Planning artifacts ready.
Suggested: Run `/git` to commit planning artifacts.

### Phase 2: Apply
[...apply workflow...]
✓ Task 1/7 complete
Suggested: Run `/git` to commit.
[...user runs /git or skips...]
✓ Task 2/7 complete
Suggested: Run `/git` to commit.
[...]
✓ All tasks complete

🎉 All tasks complete!
Suggested: Run `/git` before archiving.

### Phase 3: Archive
[...archive workflow...]
✓ Archive complete

📦 Change archived.
Suggested: Run `/git` to commit.

## Flow Complete
[...summary...]
```
