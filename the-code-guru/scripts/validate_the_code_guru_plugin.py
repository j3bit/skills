#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

REQUIRED_FILES = [
    ".claude-plugin/plugin.json",
    "skills/refactor/SKILL.md",
    "skills/diagnosis/SKILL.md",
    "skills/prescription/SKILL.md",
    "skills/treatment/SKILL.md",
    "references/dive-into-refactoring-index.md",
    "references/artifact-schemas.md",
    "references/strangler-fig-workflow.md",
    "references/subagent-coordination.md",
    "fixtures/code-guru/sample-diagnosis.md",
    "fixtures/code-guru/sample-prescription.md",
    "fixtures/code-guru/sample-treatment.md",
]

REQUIRED_SKILL_TERMS = {
    "skills/refactor/SKILL.md": [
        "diagnosis artifact -> prescription artifact -> treatment artifact",
        "Route to Diagnosis",
        "Route to Prescription",
        "Route to Treatment",
    ],
    "skills/diagnosis/SKILL.md": [
        "Evidence Standard",
        "Confidence / Uncertainty",
        "Do not modify code",
    ],
    "skills/prescription/SKILL.md": [
        "design_strangler_fig_facade_or_indirection_layer",
        "remove_old_structure",
        "remove_or_collapse_facade",
    ],
    "skills/treatment/SKILL.md": [
        "Do not execute more than one phase",
        "design_strangler_fig_facade_or_indirection_layer",
        "Remove the old structure before removing or collapsing the facade",
    ],
}

REQUIRED_ARTIFACT_KEYS = [
    "artifact_id",
    "artifact_type",
    "target_repo",
    "base_commit",
    "created_at",
    "source_artifact_ids",
    "requested_scope",
    "observed_context_scope",
    "language",
    "framework",
    "analysis_tools",
    "subagent_coordination",
]

CANONICAL_LOOP_TERMS = [
    "design_strangler_fig_facade_or_indirection_layer",
    "insert_facade_or_indirection_layer",
    "add_new_structure_behind_facade",
    "route_selected_behavior_through_facade",
    "verify_old_and_new_structures_coexist",
    "confirm_new_structure_handles_target_behavior",
    "remove_old_structure",
    "verify_no_behavior_regression",
    "remove_or_collapse_facade_if_no_longer_needed",
    "verify_final_simplified_structure",
]

REFERENCE_SECTION_TERMS = {
    "references/subagent-coordination.md": [
        "## Artifact Recording",
        "subagent_coordination:",
        "## Plugin Skill Creation",
        "skill-creator",
    ],
    "references/strangler-fig-workflow.md": CANONICAL_LOOP_TERMS,
    "references/artifact-schemas.md": CANONICAL_LOOP_TERMS,
}


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def require_files() -> None:
    missing = [p for p in REQUIRED_FILES if not (ROOT / p).is_file()]
    if missing:
        raise AssertionError(f"missing required files: {missing}")


def require_plugin_json() -> None:
    data = json.loads(read(".claude-plugin/plugin.json"))
    if data["name"] != "the-code-guru":
        raise AssertionError("plugin name must be the-code-guru")
    expected = {"refactor", "diagnosis", "prescription", "treatment"}
    missing = [name for name in expected if not (ROOT / "skills" / name / "SKILL.md").is_file()]
    if missing:
        raise AssertionError(f"missing skill directories: {missing}")


def require_skill_terms() -> None:
    for path, terms in REQUIRED_SKILL_TERMS.items():
        text = read(path)
        missing = [term for term in terms if term not in text]
        if missing:
            raise AssertionError(f"{path} missing terms: {missing}")


def frontmatter(text: str) -> str:
    match = re.match(r"---\n(.*?)\n---\n", text, re.DOTALL)
    if not match:
        raise AssertionError("artifact missing YAML frontmatter fence")
    return match.group(1)


def require_artifact_keys(path: str, artifact_type: str) -> None:
    fm = frontmatter(read(path))
    missing = [key for key in REQUIRED_ARTIFACT_KEYS if f"{key}:" not in fm]
    if missing:
        raise AssertionError(f"{path} missing frontmatter keys: {missing}")
    if f"artifact_type: {artifact_type}" not in fm:
        raise AssertionError(f"{path} artifact_type must be {artifact_type}")


def require_reference_sections() -> None:
    for path, terms in REFERENCE_SECTION_TERMS.items():
        text = read(path)
        missing = [term for term in terms if term not in text]
        if missing:
            raise AssertionError(f"{path} missing required reference terms: {missing}")


def require_prescription_loop() -> None:
    text = read("fixtures/code-guru/sample-prescription.md")
    positions = []
    for term in CANONICAL_LOOP_TERMS:
        pos = text.find(term)
        if pos < 0:
            raise AssertionError(f"sample prescription missing {term}")
        positions.append(pos)
    if positions != sorted(positions):
        raise AssertionError("sample prescription loop terms are out of order")


def require_loop_vocabulary_consistency() -> None:
    checked_paths = [
        "references/artifact-schemas.md",
        "references/strangler-fig-workflow.md",
        "skills/prescription/SKILL.md",
        "skills/treatment/SKILL.md",
        "fixtures/code-guru/sample-prescription.md",
    ]
    forbidden_short_terms = [
        "design" + "_facade_or_indirection_layer",
        "verify" + "_coexistence",
        "confirm" + "_new_structure\n",
        "verify" + "_no_regression",
        "remove" + "_or_collapse_facade\n",
        "verify" + "_final_structure",
        "confirm_new_structure_handles_target_behavior" + "_handles_target_behavior",
        "remove_or_collapse_facade_if_no_longer_needed" + "_if_no_longer_needed",
    ]
    for path in checked_paths:
        text = read(path)
        missing = [term for term in CANONICAL_LOOP_TERMS if term not in text and path != "skills/treatment/SKILL.md"]
        if missing:
            raise AssertionError(f"{path} missing canonical loop terms: {missing}")
        forbidden = [term for term in forbidden_short_terms if term in text]
        if forbidden:
            raise AssertionError(f"{path} contains non-canonical loop terms: {forbidden}")


def require_treatment_single_action() -> None:
    text = read("fixtures/code-guru/sample-treatment.md")
    if "`transform_and_coexist` only" not in text:
        raise AssertionError("sample treatment must record transform only")
    if "Next Allowed Action" not in text:
        raise AssertionError("sample treatment must record next allowed action")


def main() -> int:
    require_files()
    require_plugin_json()
    require_skill_terms()
    require_reference_sections()
    require_loop_vocabulary_consistency()
    require_artifact_keys("fixtures/code-guru/sample-diagnosis.md", "diagnosis")
    require_artifact_keys("fixtures/code-guru/sample-prescription.md", "prescription")
    require_artifact_keys("fixtures/code-guru/sample-treatment.md", "treatment")
    require_prescription_loop()
    require_treatment_single_action()
    print("the-code-guru plugin validation passed")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except AssertionError as exc:
        print(f"validation failed: {exc}", file=sys.stderr)
        raise SystemExit(1)
