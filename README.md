# agent-system

7 specialized AI agents that plan, implement, verify, review, and ship code together.

Built for multi-agent AI coding environments. Each agent has a clear role, hard rules it follows, and knows how to work with the others.

## Quick start

```bash
# Install to your project
npx agent-system init

# Or install globally (available in all projects)
npx agent-system init --global
```

This copies the agent instruction files to `./agents/` (or `~/.claude/agents/` with `--global`). Point your AI coding tool at them.

## The agents

| Agent | Role | Writes code? |
|-------|------|:------------:|
| **Coordinator** | Plans, delegates to specialists, verifies results. Orchestrates parallel work. | No |
| **Developer** | Plans AND implements. Solo end-to-end agent for focused tasks. | Yes |
| **Implementor** | Executes a single task from a task note. Minimal scope, no freelancing. | Yes |
| **Verifier** | Evidence-based verification against acceptance criteria. No vibes. | No |
| **UI Designer** | Builds accessible, design-system-consistent interfaces. | Yes |
| **PR Reviewer** | Reviews diffs for bugs, security, correctness. High signal, low noise. | No |
| **PR Shepherd** | Loops until a PR is merge-ready: green CI, resolved comments, clean state. | No |

## When to use which

```
Is this a PR that needs work?
├── Reviewing code? → PR Reviewer
├── Getting to green? → PR Shepherd
└── Building something?
    ├── Focused task (1-3 files)? → Developer
    └── Large feature (4+ files, parallelizable)? → Coordinator
```

| Situation | Agent | Why |
|-----------|-------|-----|
| Fix a bug | Developer | One agent, full context, fast |
| Add a small feature | Developer | Plans + implements, quick iteration |
| Build a multi-part feature | Coordinator | Parallel implementors, separate verification |
| UI component with a11y requirements | UI Designer | Design system + accessibility expertise |
| Code review before merge | PR Reviewer | Catches real bugs, skips nitpicks |
| PR has failing CI or open comments | PR Shepherd | Loops until green |
| Check work against spec | Verifier | Evidence-driven, no bias |

## How they work together

### Solo workflow (Developer)

One agent handles everything:

```
You → Developer
       ├── Spec → wait for approval
       ├── Implement task by task
       ├── Self-verify
       └── Report
```

### Team workflow (Coordinator)

Parallel implementation with independent verification:

```
You → Coordinator
       ├── Spec → wait for approval
       ├── Wave 1: [Implementor A] [Implementor B] [UI Designer C]  ← parallel
       │            ↓
       │          Verifier
       ├── Wave 2: [Implementor D] [Implementor E]  ← parallel
       │            ↓
       │          Verifier
       └── Final verification
```

### Full pipeline (plan → build → review → ship)

```
Coordinator → Implementors (waves) → Verifier → PR Reviewer → PR Shepherd → You merge
```

## Core design principles

**Spec first, always.** No agent writes code without a written, approved plan. The approval gate is non-negotiable.

**Separation of concerns.** No single agent plans, implements, AND verifies. The agent that writes the code is never the agent that checks it.

**Minimal changes.** Every agent does only what its task asks. No scope creep, no drive-by refactors, no "while I'm here" improvements.

**Evidence over vibes.** The Verifier doesn't check if code "looks good." It checks each acceptance criterion with concrete evidence — test output, file diffs, observed behavior.

**Parallel by default.** The Coordinator splits work into waves of 2-4 non-overlapping tasks that run simultaneously. Sequential when tasks share files, parallel when they don't.

## Customizing

Each agent is a standalone markdown file. You can:

- **Edit any agent** to match your workflow or conventions
- **Remove agents** you don't need (the Implementor and Developer work independently)
- **Add new agents** following the same pattern (role, hard rules, workflow, completion)

The agents reference tool functions like `delegate_task`, `create_agent`, `report_to_parent`, etc. These map to your platform's multi-agent capabilities. Adapt the tool names to match your environment.

## What's in each file

```
agents/
├── Coordinator.md    # Orchestrator — plans, delegates, never codes
├── Developer.md      # Solo agent — plans AND implements
├── Implementor.md    # Worker — executes one task, reports back
├── Verifier.md       # QA — evidence-based acceptance testing
├── UI Designer.md    # Frontend specialist — a11y, design systems
├── PR Reviewer.md    # Code reviewer — bugs and security only
├── PR Shepherd.md    # PR ops — CI, comments, merge readiness
└── ORCHESTRATION.md  # How all agents work together (the spec)
```

`ORCHESTRATION.md` is the reference doc — it covers all workflows, communication patterns, decision trees, and anti-patterns.

## CLI

```bash
npx agent-system init              # Copy to ./agents/
npx agent-system init --global     # Copy to ~/.claude/agents/
npx agent-system init --force      # Overwrite existing files
npx agent-system list              # Show available agents
npx agent-system help              # Show help
```

## License

MIT
