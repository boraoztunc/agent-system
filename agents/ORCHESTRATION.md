# Agent System — Orchestration Spec

How the 7 agents work together across any project.

---

## Agent Roster

| Agent | Role | Edits Code? | Delegates? | Works Alone? |
|-------|------|:-----------:|:----------:|:------------:|
| **Coordinator** | Plans, delegates, verifies. Orchestrates multi-agent workflows. | No | Yes | No |
| **Developer** | Plans AND implements. Solo end-to-end agent. | Yes | No | Yes |
| **Implementor** | Executes a single task from a task note. Minimal scope. | Yes | No | No |
| **Verifier** | Evidence-based verification against acceptance criteria. | No | No | No |
| **UI Designer** | Builds accessible, design-system-consistent interfaces. | Yes | No | No |
| **PR Reviewer** | Reviews PR diffs for bugs, security, correctness. | No | Yes (to Implementor) | No |
| **PR Shepherd** | Shepherds a PR to merge-ready state (CI green, comments resolved). | No | Yes (to Implementor) | No |

---

## When to Use Which Agent

### Decision tree: Start here

```
Is this a PR that needs review or shepherding?
├── YES: reviewing code? → PR Reviewer
├── YES: getting to green/merge-ready? → PR Shepherd
└── NO: building/changing something
    ├── Small/focused task (1-3 files, one area)?
    │   └── Developer
    └── Large feature (4+ files, multiple areas, parallelizable)?
        └── Coordinator → delegates to Implementors / UI Designers
```

### Quick reference

| Scenario | Agent | Why |
|----------|-------|-----|
| Fix a single bug | Developer | Focused, no overhead |
| Add a small feature | Developer | Plans + implements, fast iteration |
| Build a multi-part feature | Coordinator | Parallel implementors, independent verification |
| Implement a UI component | UI Designer (under Coordinator) or Developer | UI Designer if accessibility/design-system compliance matters |
| Review a PR before merge | PR Reviewer | High-signal code review |
| PR has failing CI or open comments | PR Shepherd | Loops until green |
| Verify implementation against spec | Verifier | Evidence-driven, no bias |
| Quick iteration / follow-up fixes | Developer | Low ceremony, fast |

---

## Workflows

### 1. Solo Development (Developer)

The simplest workflow. One agent does everything.

```
User → Developer
         ├── 1. Understand requirements
         ├── 2. Write spec
         ├── 3. STOP → wait for approval
         ├── 4. Implement task by task
         ├── 5. Self-verify
         └── 6. Report results
```

**Best for:** Bug fixes, small features, refactors, quick iterations.

---

### 2. Team Development (Coordinator-led)

Parallel implementation with independent verification.

```
User → Coordinator
         ├── 1. Understand requirements
         ├── 2. Write spec with task breakdown
         ├── 3. STOP → wait for approval
         ├── 4. Delegate Wave 1 (parallel Implementors / UI Designers)
         ├── 5. END TURN → wait for wave completion
         ├── 6. Delegate Verifier → check wave results
         ├── 7. Fix issues? → delegate fix tasks
         ├── 8. Repeat for Wave 2, 3, ...
         ├── 9. Final verification
         └── 10. Report results
```

**Best for:** Multi-file features, when you want verification by a separate agent, when tasks naturally parallelize.

**Wave composition:**
- Wave tasks run in parallel — they MUST NOT touch the same files
- 2-4 tasks per wave is the sweet spot
- UI tasks + backend tasks often make good parallel waves

---

### 3. PR Review Pipeline

Code review followed by automated fix cycle.

```
User → PR Reviewer
         ├── 1. Read PR diff + context
         ├── 2. Review for bugs/security/correctness
         ├── 3. Post inline comments
         ├── 4. If issues found:
         │     ├── Delegate Implementor → fix issues
         │     └── Delegate Verifier → verify fixes
         └── 5. Report verdict
```

**Best for:** Pre-merge code review, catching bugs before human reviewers see the PR.

---

### 4. PR Shepherding Pipeline

Getting a PR from "open" to "merge-ready."

```
User → PR Shepherd
         ├── LOOP (up to 10 iterations):
         │     ├── ASSESS: CI status, review comments, mergeability
         │     ├── ACT: delegate fixes, rebase, re-trigger CI, reply to comments
         │     ├── WAIT: sleep ~60s
         │     └── RE-ASSESS
         ├── EXIT when: green CI + no unresolved comments + mergeable
         └── Report: "merge-ready" or "needs manual intervention"
```

**Best for:** After PR is created and needs to pass CI, address review feedback, stay up-to-date with trunk.

---

### 5. Full Feature Pipeline (end-to-end)

The complete lifecycle: plan → build → review → ship.

```
Phase 1: Build
  User → Coordinator
           ├── Spec + approval
           ├── Delegate Implementors (waves)
           ├── Delegate Verifiers (per wave)
           └── All waves complete + verified

Phase 2: Review
  Coordinator → PR Reviewer
                  ├── Review the PR
                  ├── Delegate fixes if needed
                  └── Verdict: approved or needs changes

Phase 3: Ship
  Coordinator → PR Shepherd
                  ├── Address remaining CI/review issues
                  ├── Loop until green
                  └── Report: merge-ready

Phase 4: Merge
  Coordinator or User → merge decision
```

This is the most thorough workflow. Use it for important features where you want full coverage.

---

## Communication Patterns

### How agents talk to each other

| From | To | Mechanism |
|------|----|-----------|
| Coordinator → Implementor | `delegate_task(taskNoteId)` or `create_agent(specialist="implementor")` |
| Coordinator → Verifier | `create_agent(specialist="verifier")` |
| Coordinator → UI Designer | `create_agent(specialist="ui-designer")` |
| Coordinator → PR Reviewer | `create_agent(specialist="pr-reviewer")` |
| Coordinator → PR Shepherd | `create_agent(specialist="pr-shepherd")` |
| PR Shepherd → Implementor | `create_agent(specialist="implementor")` |
| PR Reviewer → Implementor | `create_agent(specialist="implementor")` |
| Any child → Parent | `report_to_parent` (required on completion) |
| Implementor → Coordinator | Message via `send_message_to_agent` if blocked |
| Verifier → Implementor | Fix requests via `send_message_to_agent` |

### Information flows through notes, not messages

- **Spec note**: Source of truth for requirements, tasks, acceptance criteria
- **Task notes**: Individual work items with scope, inputs, definition of done
- **Agent conversations**: `read_agent_conversation` to check what others did (conflict avoidance)

---

## Universal Rules (all agents)

1. **Spec first** — No implementation without a written, approved spec (Developer and Coordinator both enforce this).
2. **Approval gate** — Always STOP and wait for user approval before executing.
3. **Task notes, not checkboxes** — Use `@@@task` blocks. Never `- [ ]` lists.
4. **Notes, not files** — Communication happens in workspace notes. Don't create .md files in the repo for collaboration.
5. **Minimal changes** — Do only what the task asks. No scope creep, no drive-by refactors.
6. **Follow existing patterns** — Match the project's conventions. Read before writing.
7. **Report on completion** — Every delegated agent calls `report_to_parent` with a concise summary.
8. **Conflict avoidance** — Implementors check `list_agents` / `read_agent_conversation` before touching files. If overlap detected, message the Coordinator.

---

## Setting Up in a New Project

1. Copy the `agents/` folder to your project root, or use the universal location at `~/.claude/agents/`
2. When starting work, pick the right entry point:
   - Quick task → spawn a **Developer**
   - Large feature → spawn a **Coordinator**
   - PR needs review → spawn a **PR Reviewer**
   - PR needs to get to green → spawn a **PR Shepherd**
3. The entry agent handles everything from there — it knows which specialists to delegate to

---

## Anti-patterns to Avoid

| Anti-pattern | Why it fails | Do this instead |
|-------------|-------------|-----------------|
| Coordinator implements code directly | It has no editing tools; instructions go ignored | Always delegate to Implementor or UI Designer |
| Developer delegates to sub-agents | Splits context, adds overhead for simple tasks | Developer works solo; use Coordinator if you need delegation |
| Skipping the spec/approval step | User gets surprised by changes they didn't want | Always spec → STOP → wait for approval |
| One giant wave with 8 tasks | File conflicts, merge hell | 2-4 tasks per wave, non-overlapping files |
| Verifier expanding scope | Blocks approval on things outside acceptance criteria | Verify only what's in the spec; suggest follow-ups separately |
| PR Shepherd merging the PR | Only the Coordinator or human should merge | Shepherd reports "merge-ready" and stops |
| Implementor refactoring nearby code | Scope creep, harder to review | Stick to the task note; ask Coordinator for a separate task |
