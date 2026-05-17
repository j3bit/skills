---
name: refactor
description: Route codebase refactoring requests into artifact-gated diagnosis, prescription, or treatment workflows grounded in Dive Into Refactoring.
---

# The Code Guru Refactor Router

Use this skill when the user asks for codebase refactoring help and the request may involve code smell diagnosis, refactoring planning, or executing a specific refactoring step.

## Operating Principle

The Code Guru is artifact-gated:

```text
diagnosis artifact -> prescription artifact -> treatment artifact
```

Do not jump directly from a broad refactoring request to code mutation. Route the user to the narrowest correct workflow.

## References

- `../../references/dive-into-refactoring-index.md`
- `../../references/artifact-schemas.md`
- `../../references/strangler-fig-workflow.md`
- `../../references/subagent-coordination.md`

## Routing Rules

### Route to Diagnosis

Use `diagnosis` when the user asks to:

- find code smells,
- review maintainability,
- explain why code is bad,
- inspect a file, directory, diff, or repository for refactoring opportunities,
- produce a diagnosis artifact.

Diagnosis writes `docs/code-guru/diagnosis/<artifact_id>.md` and does not modify code.

### Route to Prescription

Use `prescription` when the user provides or references a diagnosis artifact and asks to:

- create a refactoring plan,
- prescribe a safe sequence,
- design a strangler fig migration,
- decide which refactorings to apply.

Prescription writes `docs/code-guru/prescription/<artifact_id>.md` and does not modify code.

### Route to Treatment

Use `treatment` when the user requests a specific artifact item, loop, and phase, such as:

```text
artifact presc-20260517-001 smell-001 loop 0 transform_and_coexist 수행
artifact presc-20260517-001 smell-001 loop 0 eliminate 수행
```

Treatment executes exactly one requested phase and writes `docs/code-guru/treatment/<artifact_id>.md`.

## Ambiguity Handling

If the request lacks enough information to route safely:

1. Ask for the missing artifact or scope.
2. Do not modify code.
3. Do not invent a prescription without a diagnosis artifact.
4. Do not execute treatment without exactly one artifact item, loop, and phase.

## Safety Rules

- Do not perform code changes in this router skill.
- Do not proceed from diagnosis to prescription automatically.
- Do not proceed from prescription to treatment automatically.
- Do not proceed from transform to eliminate automatically.
- Do not broaden treatment beyond the requested artifact boundary.
- Keep language assumptions minimal and record language/framework only as metadata.

## Subagent Use

Subagents are optional read-only scouts for large codebases. The coordinator must perform initial inventory first and owns final artifacts. Treatment uses no subagents unless the user explicitly allows delegated work and the write sets are disjoint.

## Expected Response Shape

When routing, respond with:

```markdown
I will use `<sub-skill>` because <reason>.
Input needed: <scope or artifact>
Output artifact: <expected path>
Safety boundary: <what will not happen automatically>
```
