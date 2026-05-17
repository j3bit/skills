---
artifact_id: presc-20260517-001
artifact_type: prescription
target_repo: /tmp/sample-repo
base_commit: non-git-worktree
created_at: 2026-05-17T00:00:00+09:00
source_artifact_ids:
  - diag-20260517-001
requested_scope: src/order_processor.py
observed_context_scope: src/order_processor.py, tests/test_order_processor.py
language: Python
framework: minimal metadata only
analysis_tools:
  - rg
subagent_coordination:
  used: false
---

# Prescription: Sample Order Processor

### plan-001 — Introduce Order Processing Boundary

#### Source Diagnosis Items

- smell-001

#### Local Context Recheck

`process_order` is the existing caller-facing entrypoint. Tests use it directly.

#### Refactoring Basis

Long Method can be addressed through Extract Method and Introduce Parameter Object, but this prescription first creates a strangler fig facade so old and new paths can coexist.

#### Risk and Blast Radius

The public function name must remain available during transform. Tests should continue calling `process_order` until an eliminate phase removes old internals.

#### Strangler Fig Loops

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
  name: OrderProcessingFacade
  purpose: Keep the existing process_order entrypoint while routing selected behavior to extracted collaborators.
  boundary: callers use process_order; old logic and new collaborators live behind OrderProcessingFacade.
  temporary_or_permanent: temporary
  removal_condition: old inline validation and notification logic have been removed and tests pass through the new collaborators.
```

#### Validation Strategy

Run the existing order processor tests after transform and after eliminate.

#### Rollback Strategy

Revert changed files for the selected phase and restore `process_order` to the previous direct implementation.

#### User-Controlled Treatment Commands

- `artifact presc-20260517-001 smell-001 loop 0 transform_and_coexist 수행`
- `artifact presc-20260517-001 smell-001 loop 0 eliminate 수행`
