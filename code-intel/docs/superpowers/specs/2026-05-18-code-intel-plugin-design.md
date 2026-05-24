# `code-intel` Plugin Design

Date: 2026-05-18
Status: approved design, pending implementation plan

## Goal

Create a standalone Codex plugin named `code-intel` that helps Codex use
language-aware code intelligence before falling back to text search.

The plugin should work whether or not the user is running OMX. When OMX or a
compatible hook surface is present, the plugin may add soft routing nudges. When
hooks are unavailable, the plugin must still be useful through its skills and
MCP server.

The benchmark model is `oh-my-openagent`: expose AST search and LSP operations
as first-class tools, guide agent behavior through skills, and add optional
hooks/workflows that make the right tool path easy to choose.

## Non-Goals

- Do not bundle `ast-grep` or language servers in the MVP.
- Do not install dependencies automatically.
- Do not call `sg`; this command name is preoccupied on Linux. Use the
  `ast-grep` executable only.
- Do not ship custom parser build flows in the MVP.
- Do not implement language-specific deep adapters beyond the generic registry
  contract in the MVP.
- Do not let MCP tools directly mutate repository files in the MVP.
- Do not block `rg` or `grep`; fallback is valid when code-intel support is
  unavailable, partial, or inconclusive.

## Scope

The MVP follows Approach C: a full workflow plugin.

It includes:

- a standalone Codex plugin repository,
- code-intel skills,
- an embedded MCP server,
- optional soft hooks,
- a language adapter registry,
- project initialization and doctor workflows,
- capability and validation reports,
- plugin and fixture validation scripts.

The MVP is behavior-first rather than dependency-management-first. Its success
criterion is that Codex has a clear, repeatable route for structural search,
symbol navigation, references, rename previews, rewrite previews, and
post-change diagnostics, with explicit fallback reasons when language-aware
support is missing.

## Architecture

The plugin has four layers.

```text
code-intel/
  .codex-plugin/plugin.json

  skills/
    code-intel/SKILL.md
    init-code-intel/SKILL.md
    code-intel-doctor/SKILL.md
    code-intel-refactor/SKILL.md

  mcp/
    code-intel-server/

  hooks/
    user-prompt-submit.*
    pre-tool-use.*
    post-tool-use.*

  adapters/
    registry.json
    schema.json
    examples/

  references/
    routing-policy.md
    language-adapter-contract.md
    fallback-policy.md
    mcp-tool-contract.md
    hook-contract.md

  scripts/
    init-code-intel.*
    doctor-code-intel.*
    validate-plugin.*

  fixtures/
    repos/
      typescript-basic/
      python-basic/
      mixed-no-lsp/
      unsupported-language/
```

### Layer 1: MCP Capability Layer

The MCP server provides the actual code intelligence tools. It must be usable by
Codex without OMX and by any other harness that can attach an MCP server.

Initial tools:

- `capability_discover`
- `ast_grep_search`
- `ast_grep_replace_preview`
- `lsp_diagnostics`
- `lsp_symbols`
- `lsp_goto_definition`
- `lsp_find_references`
- `lsp_prepare_rename`
- `lsp_rename_preview`

Mutation-oriented tools are preview-only in the MVP. They return proposed
workspace edits or patch candidates. Codex applies changes through its normal
file editing path, then runs diagnostics or audits.

### Layer 2: Skill Behavior Layer

Skills teach the agent when to prefer code-intel.

- `code-intel`: everyday routing rules for search, navigation, references,
  rename, rewrite, and diagnostics.
- `init-code-intel`: project capability discovery and report generation.
- `code-intel-doctor`: troubleshooting missing tools, stale profiles, LSP
  failures, and fallback behavior.
- `code-intel-refactor`: code-intel gated refactoring workflow with diagnostics
  and audit gates.

Each skill must work independently. `code-intel` is the common entry point; the
other skills are explicit workflows.

### Layer 3: Optional Hook Layer

Hooks accelerate correct behavior but are not correctness dependencies.

- `UserPromptSubmit` detects structural search, definition, references, rename,
  diagnostics, and rewrite intent, then injects a short routing reminder.
- `PreToolUse` notices structural use of `rg`, `grep`, or manual replace and
  adds a soft nudge to try code-intel first if supported.
- `PostToolUse` reminds the agent to run diagnostics or structural audits after
  code edits when code-intel support is available.

Hooks must not block user work. They must be short, deterministic, and safe when
no routing profile exists.

### Layer 4: Adapter and Reporting Layer

The adapter registry makes language support extensible without hard-coding all
languages in tool logic.

Each adapter declares:

- language id,
- file extensions,
- ast-grep language id,
- whether ast-grep support is built in,
- LSP command candidates,
- supported LSP capabilities,
- fallback policy,
- smoke-test fixture expectations.

Example shape:

```json
{
  "language": "typescript",
  "extensions": [".ts", ".tsx"],
  "astGrep": {
    "languageId": "typescript",
    "supported": "builtin"
  },
  "lsp": {
    "commands": ["typescript-language-server --stdio"],
    "capabilities": ["definition", "references", "rename", "diagnostics"]
  },
  "fallback": ["rg", "grep"]
}
```

Project reports live under:

```text
docs/code-intel/
  capability-report.md
  routing-profile.json
  validation-report.md
```

Reports are durable evidence for later agent turns. They should record which
languages and tools are available, which capabilities are degraded, and why
fallback was used.

## Data Flow

### Project Initialization

`init-code-intel` runs project discovery and writes reports.

```text
repo root detect
  -> language inventory
  -> adapter registry match
  -> ast-grep binary detect using ast-grep only
  -> ast-grep smoke per supported language
  -> LSP command detect
  -> optional LSP initialize smoke
  -> write capability-report.md
  -> write routing-profile.json
  -> write validation-report.md
```

`routing-profile.json` is a cache and routing input, not an authority that can
override live failure evidence. If the profile is stale or missing, the plugin
uses live detection for the current task and suggests refreshing the profile.

Example profile fragment:

```json
{
  "repoRoot": "/path/to/repo",
  "generatedAt": "2026-05-18T00:00:00+09:00",
  "tools": {
    "astGrep": {
      "command": "ast-grep",
      "available": true,
      "note": "Do not use sg alias."
    }
  },
  "languages": {
    "typescript": {
      "astGrep": "available",
      "lsp": "missing",
      "fallback": ["rg", "grep"]
    }
  }
}
```

### Everyday Structural Search

For structural requests such as finding declarations, patterns, call sites, or
API usage:

```text
intent classified as structural/code-intel task
  -> load routing-profile if present
  -> if ast-grep supported for language:
       ast_grep_search
     else:
       rg/grep fallback with reason
  -> if result incomplete:
       rg supplement allowed
```

`rg` remains valid, especially for string search, logs, filenames, generated
files, unsupported languages, or confirmation after AST search.

### Symbol Navigation

For definitions, references, and symbols:

```text
file + symbol/task intent
  -> detect language
  -> if LSP available:
       lsp_goto_definition / lsp_find_references / lsp_symbols
     else if ast-grep can approximate:
       ast_grep_search
     else:
       rg/grep fallback
```

LSP absence degrades capability. It does not fail the overall task.

### Rename and Rewrite

Rename and structural rewrite are preview-first.

```text
rename intent
  -> lsp_prepare_rename if available
  -> lsp_rename_preview if available
  -> otherwise ast_grep_replace_preview if structurally expressible
  -> otherwise no automatic rewrite; suggest manual edit path + rg audit
```

Codex applies approved changes through ordinary file editing. The plugin then
supports diagnostics and audit checks.

### Post-Edit Validation

After edits:

```text
changed files detected
  -> map changed files to languages
  -> if LSP diagnostics available:
       lsp_diagnostics
  -> if structural rewrite happened:
       ast_grep_search audit
  -> if no code-intel support:
       rg/grep audit commands suggested or run by Codex
```

## Error Handling and Fallback Policy

### Missing `ast-grep`

If `ast-grep` is not found:

```text
ast-grep unavailable
  -> mark structural AST search unavailable
  -> keep LSP tools if available
  -> allow rg/grep fallback
  -> report install hint, but do not install automatically
```

The report must say:

```text
Fallback reason: ast-grep executable was not found on PATH.
Command policy: this plugin does not call sg.
```

### Missing LSP Server

If an LSP command is missing:

```text
LSP command missing
  -> mark LSP features unavailable for that language
  -> keep ast-grep structural search if available
  -> fallback to ast-grep or rg/grep depending on task
```

Capabilities are tracked independently. A language may support AST search while
definition, references, rename, or diagnostics remain unavailable.

### Stale Routing Profile

A profile is stale when:

- repo root differs,
- adapter registry version differs,
- plugin version differs,
- profile timestamp predates a material plugin upgrade,
- cheap language inventory checks show a major mismatch.

On stale profiles, use live detection for the current turn and suggest
refreshing with `init-code-intel`.

### Runtime Failures

LSP failures should capture:

- command,
- stderr summary,
- LSP method,
- language,
- degraded capability,
- fallback used.

ast-grep failures should capture:

- executable name, always `ast-grep`,
- language id,
- pattern or rule summary,
- stderr summary,
- fallback used.

Invalid ast-grep patterns should lead to pattern revision or `rg` fallback, not
automatic use of `sg`.

### User-Facing Failure Shape

Agent reports should be concise and explicit:

```text
code-intel tried LSP references for TypeScript, but no LSP server was detected.
It fell back to ast-grep for structural matches, then rg for text-level
confirmation.
```

Fallback should be visible because it changes confidence.

## Testing and Validation

### Plugin Structure Validation

`validate-plugin` checks:

- `.codex-plugin/plugin.json` exists,
- plugin manifest has name, version, description, skills, and interface,
- all four skill entrypoints exist,
- adapter schema exists,
- registry validates against the schema,
- references exist,
- scripts are executable or documented.

### MCP Contract Validation

MCP validation checks:

- server starts,
- tool list includes expected tools,
- every tool has stable name, description, input schema, and output schema,
- `capability_discover` works without ast-grep or LSP,
- ast-grep tools report unavailable cleanly when `ast-grep` is missing,
- LSP tools report unavailable cleanly when no server exists,
- preview tools do not mutate files.

### ast-grep Validation

When `ast-grep` is on PATH:

- detect `ast-grep --version`,
- run a tiny built-in-language parse/search smoke,
- return structured results with file, range, match, language, and confidence,
- report unsupported languages cleanly,
- verify no script, hook, or registry path calls `sg`.

### LSP Validation

When an LSP server command is detected:

- start the server with stdio,
- send initialize,
- open a sample file,
- request diagnostics, symbols, references, or rename when supported,
- shut down cleanly,
- record failure reason if command missing or initialize fails.

### Init Workflow Validation

Fixture repos:

```text
fixtures/repos/typescript-basic/
fixtures/repos/python-basic/
fixtures/repos/mixed-no-lsp/
fixtures/repos/unsupported-language/
```

Expected checks:

- `docs/code-intel/capability-report.md` written,
- `docs/code-intel/routing-profile.json` written,
- `docs/code-intel/validation-report.md` written,
- profile records ast-grep command as `ast-grep`, not `sg`,
- fallback status is explicit,
- running init twice is idempotent.

### Hook Validation

Hooks are optional and should be tested as pure input/output scripts where
possible.

Expected checks:

- `UserPromptSubmit` injects context for rename, references, diagnostics, and
  structural search prompts,
- `PreToolUse` soft-nudges structural `rg` or `grep` usage,
- `PreToolUse` does not block `rg` or `grep`,
- `PostToolUse` suggests diagnostics or audit after edits,
- hook output remains short,
- hooks work when `routing-profile.json` is missing.

### Behavior Validation

Scenario tests should verify routing, not just tool availability.

Scenarios:

- find class or function definition,
- find references,
- rename symbol,
- rewrite structural pattern,
- edit file then run diagnostics,
- unsupported language fallback,
- missing ast-grep fallback,
- missing LSP fallback.

Example expected route:

```text
Task: find references for symbol in TypeScript file
Expected:
  1. try lsp_find_references if LSP available
  2. otherwise try ast_grep_search if structurally possible
  3. otherwise rg fallback
  4. report route used
```

## Acceptance Criteria

- The plugin can be installed and discovered as a Codex plugin.
- The MCP server can be attached independently of OMX.
- The everyday skill tells Codex when to use code-intel and when fallback is
  valid.
- The init workflow writes capability, routing, and validation reports.
- The doctor workflow explains missing tools and degraded capabilities.
- Hook scripts provide soft nudges only.
- No MVP path calls `sg`.
- Missing `ast-grep` or missing LSP servers degrade gracefully.
- Preview tools do not mutate files.
- Fixture validation covers supported, partial, and unsupported language cases.

## Open Implementation Decisions

These should be resolved in the implementation plan, not in this design:

- Whether the MCP server is implemented in TypeScript or Python.
- Exact Codex plugin manifest shape after scaffold generation.
- Exact hook runtime API shape for non-OMX Codex surfaces.
- Which built-in ast-grep languages appear in the initial registry.
- Whether LSP sessions are long-lived per repo or short-lived per request in
  the first implementation.

## Sources

- `oh-my-openagent` README:
  <https://github.com/code-yeongyu/oh-my-openagent/blob/dev/README.md>
- `oh-my-openagent` feature reference:
  <https://raw.githubusercontent.com/code-yeongyu/oh-my-openagent/refs/heads/dev/docs/reference/features.md>
