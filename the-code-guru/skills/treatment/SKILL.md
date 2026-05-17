---
name: treatment
description: Execute exactly one user-requested prescription item, loop, and phase, then write a treatment artifact with validation evidence.
---

# The Code Guru Treatment

Use this skill when the user asks to perform a specific action from a prescription artifact, such as one loop's `transform` or one loop's `eliminate`.

## Input

The user must identify exactly one prescription artifact, item, loop, and phase.

Examples:

```text
artifact presc-20260517-001 smell-001 loop 0 transform_and_coexist 수행
artifact presc-20260517-001 smell-001 loop 0 eliminate 수행
```

## Output

Write a Markdown artifact to:

```text
docs/code-guru/treatment/<artifact_id>.md
```

## References

- `../../references/artifact-schemas.md`
- `../../references/strangler-fig-workflow.md`
- `../../references/subagent-coordination.md`

## Required Workflow

1. Locate the prescription artifact.
2. Parse exactly one target item, loop, and phase.
3. Verify that the requested phase exists in the prescription artifact.
4. Inspect current workspace state.
5. Identify baseline validation commands from existing project scripts, tests, or documented commands.
6. Execute only the requested phase.
7. Preserve the prescribed strangler fig ordering.
8. Run relevant validation.
9. Write the treatment artifact.
10. Suggest the next allowed action without executing it.

## Transform Phase Rule

When the requested phase is `transform`, execute only `transform_and_coexist`.

Required order:

```text
transform_and_coexist:
  1. design_strangler_fig_facade_or_indirection_layer
  2. insert_facade_or_indirection_layer
  3. add_new_structure_behind_facade
  4. route_selected_behavior_through_facade
  5. verify_old_and_new_structures_coexist
```

Stop after coexistence validation. Do not eliminate old code.

## Eliminate Phase Rule

When the requested phase is `eliminate`, execute only the eliminate phase for the selected loop.

Required order:

```text
eliminate:
  1. confirm_new_structure_handles_target_behavior
  2. remove_old_structure
  3. verify_no_behavior_regression
  4. remove_or_collapse_facade_if_no_longer_needed
  5. verify_final_simplified_structure
```

Remove the old structure before removing or collapsing the facade. If the facade is retained as a permanent boundary, record the reason.

Invariant: remove_old_structure before removing or collapsing the facade.

## Treatment Artifact Sections

Use this structure:

```markdown
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
```

## Subagent Policy

Subagents are disabled by default during treatment. Use a subagent only when the user explicitly allows delegated work, the delegated write set is disjoint, and the coordinator can review the result before claiming completion.

## Prohibitions

- Do not execute more than one phase.
- Do not proceed from transform to eliminate automatically.
- Do not proceed to the next loop automatically.
- Do not broaden scope beyond the requested artifact item, loop, and phase.
- Do not bypass the facade or indirection boundary.
- Do not claim completion without validation evidence or a recorded validation limitation.

## Failure Handling

If any step fails, stop and write the treatment artifact with:

- failed step,
- observed error,
- partial changes,
- rollback guidance,
- whether prescription revision is needed,
- next user decision required.

Do not attempt a larger automatic refactoring to recover.

## Final Response

After writing the artifact, report:

```markdown
Treatment artifact: <path>
Executed phase: transform_and_coexist | eliminate
Validation: passed | failed | limited
Facade status: inserted | retained | collapsed | removed
Next allowed action: <one command or none>
```
