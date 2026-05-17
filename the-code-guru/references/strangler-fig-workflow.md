# Strangler Fig Workflow

The Code Guru uses strangler fig refactoring loops to avoid high-risk rewrites.

Each loop has two phases:

```text
loop N:
  transform_and_coexist
  eliminate
```

## Transform and Coexist

The transform phase must establish a boundary before adding the new structure.

Required order:

```text
transform_and_coexist:
  1. design_strangler_fig_facade_or_indirection_layer
  2. insert_facade_or_indirection_layer
  3. add_new_structure_behind_facade
  4. route_selected_behavior_through_facade
  5. verify_old_and_new_structures_coexist
```

The facade or indirection layer makes the migration boundary explicit. It controls which behavior still goes to the old structure and which selected behavior can move to the new structure.

## Eliminate

The eliminate phase removes the old structure after coexistence has been verified.

Required order:

```text
eliminate:
  1. confirm_new_structure_handles_target_behavior
  2. remove_old_structure
  3. verify_no_behavior_regression
  4. remove_or_collapse_facade_if_no_longer_needed
  5. verify_final_simplified_structure
```

The old structure is removed before removing or collapsing the facade. If the facade becomes a useful permanent boundary, record the reason and keep it as a retained boundary.

## Treatment Boundary

Treatment executes only the requested item, loop, and phase. It never proceeds to the next phase or next loop without a new user request.
