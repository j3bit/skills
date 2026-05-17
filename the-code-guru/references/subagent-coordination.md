# Subagent Coordination for The Code Guru

Subagents are auxiliary. They extend observation capacity; they do not replace coordinator judgment.

## Normal Refactoring Workflow

- The coordinator performs the initial lightweight inventory directly.
- Subagents are read-only scouts.
- Subagents must not mutate files, commit, push, delete, rename, reformat, or create final artifacts.
- Subagents are most useful during diagnosis for independent bounded code areas.
- Subagents may be used during prescription only for bounded impact analysis.
- Subagents are disabled by default during treatment.
- Treatment may use a subagent only when the user explicitly permits delegated work, the write set is disjoint, and the coordinator reviews the result before completion.

## Scout Output

A read-only scout report should include:

- suspected smell or impact question,
- evidence files and line references,
- why this may be harmful,
- related Dive Into Refactoring smell or technique category,
- confidence,
- uncertainty,
- recommended follow-up.

## Coordinator Duties

The coordinator owns:

- the decision to use subagents,
- partitioning by natural architecture boundaries,
- final artifact contents,
- duplicate merging,
- unsupported finding removal,
- prioritization,
- confidence and uncertainty calibration,
- all treatment decisions.

## Artifact Recording

When subagents are used, include a coordination section:

```yaml
subagent_coordination:
  used: true
  mode: large-codebase-read-only-scouts
  coordinator_decision: "Used scouts after initial inventory found independent boundaries."
  subagent_count: 3
  partitions:
    - id: scout_core
      scope: core modules
      purpose: domain logic and abstraction smell scan
```

When subagents are not used, record:

```yaml
subagent_coordination:
  used: false
```

## Plugin Skill Creation

When implementing this plugin itself, workers may be delegated by skill file:

```text
subagent A -> refactor/SKILL.md
subagent B -> diagnosis/SKILL.md
subagent C -> prescription/SKILL.md
subagent D -> treatment/SKILL.md
```

Each worker must use the `skill-creator` skill, edit only its owned skill file or assigned reference snippet, and leave final consistency integration to the coordinator.

## Summary

Subagents are read-only observation helpers in normal refactoring workflows. They are skill-file authors only during plugin implementation, and even then final consistency review belongs to the coordinator.
