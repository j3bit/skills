---
name: diagnosis
description: Diagnose code smells in a requested scope, explain why they are harmful, and write a structured Markdown diagnosis artifact.
---

# The Code Guru Diagnosis

Use this skill when the user asks to find code smells, explain bad code, inspect maintainability risk, or create a diagnosis artifact.

## Output

Write a Markdown artifact to:

```text
docs/code-guru/diagnosis/<artifact_id>.md
```

The artifact must use YAML frontmatter and stable smell IDs.

## References

- `../../references/dive-into-refactoring-index.md`
- `../../references/artifact-schemas.md`
- `../../references/subagent-coordination.md`

## Required Workflow

1. Determine `requested_scope` from the user request.
2. If no scope is provided, inventory the repository and focus on high-risk areas.
3. Record `observed_context_scope` separately from `requested_scope`.
4. Identify major languages, framework hints, entrypoints, tests, and architectural seams as metadata only.
5. Decide whether large-codebase read-only scouts are needed after the initial inventory.
6. Inspect code evidence using available read-only tools such as `rg`, file reads, tests discovery, and AST tools when already available.
7. For each confirmed smell, connect the finding to the closest Dive Into Refactoring smell category or technique.
8. Explain why the issue is harmful in this local codebase.
9. Record confidence and uncertainty.
10. Write the diagnosis artifact.

## Evidence Standard

Every confirmed smell item must include concrete evidence:

```markdown
- `path/to/file.ext:120-210`
```

If line numbers cannot be established, state the exact symbol, file, and search evidence used. Do not present unsupported suspicion as a confirmed smell.

## Artifact Frontmatter

Use this shape:

```yaml
artifact_id: diag-YYYYMMDD-NNN
artifact_type: diagnosis
target_repo: /absolute/path/to/repo
base_commit: <git commit hash or non-git-worktree>
created_at: <ISO-8601 timestamp>
source_artifact_ids: []
requested_scope: <user-requested scope>
observed_context_scope: <scope actually inspected>
language: <minimal metadata>
framework: <minimal metadata>
analysis_tools:
  - rg
subagent_coordination:
  used: false
```

## Diagnosis Item Template

Use this exact section structure for each finding:

```markdown
### smell-001 — <Smell Name>

#### Evidence

- `<path>:<line-range>`

#### Diagnosis

<Explain what is observed.>

#### Why This Is Harmful

<Explain local maintainability, testability, coupling, duplication, or change-cost impact.>

#### Dive Into Refactoring Basis

<Smell category and related techniques.>

#### Local Context

<Nearby callers, tests, public APIs, architecture seams, or constraints.>

#### Confidence / Uncertainty

Confidence: high | medium | low
Uncertainty: <specific unknowns and follow-up checks>

#### Suggested Prescription Direction

<Short direction only. Do not write a full plan here.>
```

## Suggested Smell Mapping

Start with this index, then verify against local code evidence:

- Long Method, Large Class, Primitive Obsession, Long Parameter List, Data Clumps.
- Switch Statements, Temporary Field, Refused Bequest, Alternative Classes with Different Interfaces.
- Divergent Change, Shotgun Surgery, Parallel Inheritance Hierarchies.
- Comments, Duplicate Code, Lazy Class, Data Class, Dead Code, Speculative Generality.
- Feature Envy, Inappropriate Intimacy, Message Chains, Middle Man.
- Incomplete Library Class.

## Subagent Policy

Subagents are read-only scouts. Use them only after the coordinator performs an initial inventory. Ask scouts for bounded evidence reports, not conclusions. The coordinator writes the final artifact.

## Prohibitions

- Do not modify code.
- Do not write a prescription plan in the diagnosis artifact.
- Do not treat language or framework metadata as a reason to force Java-specific patterns.
- Do not include a smell without local evidence.
- Do not proceed to treatment.

## Final Response

After writing the artifact, report:

```markdown
Diagnosis artifact: <path>
Confirmed smell count: <number>
Needs-follow-up count: <number>
Subagents used: yes | no
Next step: run prescription on <artifact_id>
```
