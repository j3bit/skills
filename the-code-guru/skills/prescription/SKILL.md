---
name: prescription
description: Convert a diagnosis artifact into a strangler-fig refactoring plan with facade-first transform loops and controlled eliminate phases.
---

# The Code Guru Prescription

Use this skill when the user provides a diagnosis artifact and asks for a refactoring plan, prescription, migration strategy, or strangler fig sequence.

## Input

A diagnosis artifact path or artifact ID from:

```text
docs/code-guru/diagnosis/<artifact_id>.md
```

## Output

Write a Markdown artifact to:

```text
docs/code-guru/prescription/<artifact_id>.md
```

## References

- `../../references/dive-into-refactoring-index.md`
- `../../references/artifact-schemas.md`
- `../../references/strangler-fig-workflow.md`
- `../../references/subagent-coordination.md`

## Required Workflow

1. Locate and read the diagnosis artifact.
2. Verify that the artifact has stable smell IDs and evidence sections.
3. Record the diagnosis artifact ID in `source_artifact_ids`.
4. Re-check surrounding codebase context before planning.
5. Identify public APIs, entrypoints, tests, architecture seams, data contracts, and externally observable behavior touched by the plan.
6. Select candidate refactoring techniques from the reference catalog.
7. Prioritize items by maintainability risk, change leverage, and safety.
8. Create one or more strangler fig loops for each planned item.
9. Write the prescription artifact.

## Strangler Fig Loop Contract

Every plan item must use loops with two phases:

```text
loop N:
  transform_and_coexist
  eliminate
```

### Transform and Coexist

This phase must not directly replace old code. It must first create a transition boundary.

Required order:

```text
transform_and_coexist:
  1. design_strangler_fig_facade_or_indirection_layer
  2. insert_facade_or_indirection_layer
  3. add_new_structure_behind_facade
  4. route_selected_behavior_through_facade
  5. verify_old_and_new_structures_coexist
```

### Eliminate

This phase removes the old structure after coexistence has been verified.

Required order:

```text
eliminate:
  1. confirm_new_structure_handles_target_behavior
  2. remove_old_structure
  3. verify_no_behavior_regression
  4. remove_or_collapse_facade_if_no_longer_needed
  5. verify_final_simplified_structure
```

The facade is removed or collapsed after the old structure is removed. If the facade is retained as a permanent boundary, record the reason.

## Loop Metadata Template

Use this shape inside each plan item:

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
  name: <boundary name>
  purpose: <why this boundary controls the migration>
  boundary: <callers and old/new structures separated by this layer>
  temporary_or_permanent: temporary | permanent_candidate
  removal_condition: <condition that permits removal or collapse>
```

## Prescription Item Sections

Use this structure:

```markdown
### plan-001 — <Short Plan Name>

#### Source Diagnosis Items

- smell-001

#### Local Context Recheck

#### Refactoring Basis

#### Risk and Blast Radius

#### Strangler Fig Loops

#### Validation Strategy

#### Rollback Strategy

#### User-Controlled Treatment Commands

- `artifact <prescription-id> smell-001 loop 0 transform_and_coexist 수행`
- `artifact <prescription-id> smell-001 loop 0 eliminate 수행`
```

## Subagent Policy

Subagents may be used for bounded impact analysis only. Useful questions include existing abstraction search, public API blast radius, affected tests, entrypoints, data contracts, and coexistence constraints. The coordinator designs the final loops.

## Prohibitions

- Do not modify code.
- Do not create a plan that skips the facade or indirection boundary.
- Do not create an eliminate phase that removes the facade before the old structure.
- Do not produce treatment instructions that execute multiple phases at once.
- Do not overfit the plan to a specific language when local evidence does not justify it.

## Final Response

After writing the artifact, report:

```markdown
Prescription artifact: <path>
Source diagnosis: <artifact_id>
Plan item count: <number>
Loop count: <number>
Next allowed treatment command: <one command>
```
