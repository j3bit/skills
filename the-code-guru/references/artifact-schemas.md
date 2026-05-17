# The Code Guru Artifact Schemas

Artifacts are Markdown files with YAML frontmatter. They are the contracts between diagnosis, prescription, and treatment.

## Storage

```text
docs/code-guru/
  diagnosis/
  prescription/
  treatment/
```

## Common Frontmatter

```yaml
artifact_id: diag-20260517-001
artifact_type: diagnosis
target_repo: /path/to/repo
base_commit: abc1234
created_at: 2026-05-17T00:00:00+09:00
source_artifact_ids: []
requested_scope: .
observed_context_scope: .
language: "minimal metadata only"
framework: "minimal metadata only"
analysis_tools:
  - rg
subagent_coordination:
  used: false
```

## Diagnosis Item

````markdown
### smell-001 — Long Method

#### Evidence

- `src/foo.ts:120-210`

#### Diagnosis

Explain the observed smell.

#### Why This Is Harmful

Explain local maintainability, testability, coupling, duplication, or change-cost impact.

#### Dive Into Refactoring Basis

Name the related smell category and relevant refactoring techniques.

#### Local Context

Describe nearby code, callers, tests, architecture seams, and constraints.

#### Confidence / Uncertainty

Confidence: high | medium | low
Uncertainty: concrete unknowns or follow-up checks.

#### Suggested Prescription Direction

A short direction, not an implementation plan.
````

## Prescription Loop

```yaml
loop_id: loop-0
target_smell_id: smell-001
phase_order:
  transform_and_coexist:
    - design_strangler_fig_facade_or_indirection_layer
    - insert_facade_or_indirection_layer
    - add_new_structure_behind_facade
    - route_selected_behavior_through_facade
    - verify_old_and_new_structures_coexist
  eliminate:
    - confirm_new_structure_handles_target_behavior
    - remove_old_structure
    - verify_no_behavior_regression
    - remove_or_collapse_facade_if_no_longer_needed
    - verify_final_simplified_structure
facade_or_indirection:
  name: ExampleBoundary
  purpose: Isolate selected behavior while old and new structures coexist.
  boundary: callers use facade; old and new implementations live behind it.
  temporary_or_permanent: temporary
  removal_condition: old implementation fully removed and no independent boundary value remains.
```

## Treatment Result Sections

````markdown
## Requested Action

## Source Prescription

## Before State

## Changed Files

## Executed Phase

## Validation

## Remaining Coexistence State

## Facade Status

## Next Allowed Action

## Failure or Rollback Notes
````

## Stable ID Rules

- Diagnosis artifacts: `diag-YYYYMMDD-NNN`
- Diagnosis items: `smell-NNN`
- Prescription artifacts: `presc-YYYYMMDD-NNN`
- Prescription plan items: `plan-NNN`
- Loops: `loop-N`
- Treatment artifacts: `treat-YYYYMMDD-NNN`

## Scope Rule

Later artifacts must name their source artifacts. Treatment must resolve to exactly one source prescription item, loop, and phase.
