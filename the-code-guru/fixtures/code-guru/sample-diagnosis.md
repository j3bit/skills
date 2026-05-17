---
artifact_id: diag-20260517-001
artifact_type: diagnosis
target_repo: /tmp/sample-repo
base_commit: non-git-worktree
created_at: 2026-05-17T00:00:00+09:00
source_artifact_ids: []
requested_scope: src/order_processor.py
observed_context_scope: src/order_processor.py, tests/test_order_processor.py
language: Python
framework: minimal metadata only
analysis_tools:
  - rg
subagent_coordination:
  used: false
---

# Diagnosis: Sample Order Processor

### smell-001 — Long Method

#### Evidence

- `src/order_processor.py:10-95`

#### Diagnosis

The sample `process_order` function mixes validation, discount calculation, persistence preparation, and notification selection in one method-shaped unit.

#### Why This Is Harmful

The function is difficult to test in focused pieces, hides policy duplication, and makes a change to notification behavior require understanding unrelated validation and discount logic.

#### Dive Into Refactoring Basis

Category: Bloaters / Long Method. Candidate techniques: Extract Method, Replace Temp with Query, Introduce Parameter Object.

#### Local Context

The existing tests call `process_order` directly, so the first prescription should preserve that entrypoint while creating a boundary behind it.

#### Confidence / Uncertainty

Confidence: high
Uncertainty: the sample fixture does not include production persistence or external notification clients.

#### Suggested Prescription Direction

Create a boundary around order processing behavior, then extract validation and notification policy behind that boundary.
