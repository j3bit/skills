# Code Intel Project Direction

## North Star

`code-intel` exists to make language-aware code understanding the default path
for Codex coding work, while remaining useful in plain Codex setups without any
larger orchestration layer. The project should give agents IDE-like confidence:
structural search, symbol navigation, references, rename previews, rewrite
previews, and post-edit diagnostics should be easy to discover, safe to run, and
honest about their limits.

This is not a general agent harness. It should stay focused on the code
intelligence layer that improves how an agent reads, reasons about, and safely
changes repositories.

## Product Boundary

The plugin should remain standalone and behavior-first:

- **Standalone Codex plugin:** skills and MCP tools must work without assuming
  any specific orchestration runtime.
- **Optional acceleration:** hooks may provide short routing nudges, but they
  must not become correctness dependencies.
- **External tooling:** do not bundle `ast-grep`, language servers, or custom
  parser build chains in the core MVP path.
- **Graceful degradation:** missing AST or LSP support should produce explicit
  fallback reasons and keep `rg`/`grep` available.
- **Preview before mutation:** MCP tools that imply edits should return
  previews or candidates; file mutation stays in the normal Codex edit path.

## Core Capabilities

The project should keep the following capabilities first-class:

1. **Capability discovery** — identify repository languages, available
   `ast-grep`, LSP command candidates, and fallback status.
2. **Structural search** — use `ast_grep_search` for parseable AST patterns
   when the language is supported.
3. **Semantic navigation** — use LSP for definitions, references, symbols, and
   diagnostics only when the server interaction proves method readiness.
4. **Safe refactor previews** — expose rename and rewrite intent as preview
   flows before normal edits are applied.
5. **Post-change verification** — encourage diagnostics or structural/text
   audits after edits, especially after refactors.

## Development Principles

- Prefer real tool responses over cached profiles; generated routing profiles
  are hints, not authority.
- Keep fallback reporting visible in both tools and documentation.
- Treat `ast-grep` as the canonical executable name.
- Keep adapters declarative until a language requires deeper integration.
- Add fixtures before broadening behavior; every new route should have a
  validation case for success and degraded operation.
- Avoid coupling the plugin to one workflow style. Skills should remain useful
  as readable instructions even when hooks or MCP registration are unavailable.

## Roadmap Priorities

### 1. Reliability Before Breadth

Strengthen MCP framing, LSP lifecycle handling, path safety, timeout behavior,
and degraded responses before adding many languages. A small set of reliable
adapters is more valuable than a broad but unreliable registry.

### 2. Honest Preview Workflows

Improve replacement and rename previews so they clearly distinguish executable
edits from match-only candidates. Never imply that a replacement is safe to
apply unless the tool has proven the substituted output.

### 3. Better Repository Initialization

Make `init-code-intel` produce concise, durable reports that help future agents
choose the right route quickly: supported languages, known missing tools,
validated methods, and recommended fallback commands.

### 4. Language Adapter Expansion

Add languages through adapter contracts, fixtures, and validation gates. Each
adapter should document file extensions, AST support, LSP command candidates,
capabilities, and fallback behavior.

### 5. Refactor Guidance

Evolve `code-intel-refactor` into a practical workflow for mechanical changes:
baseline diagnostics, structural/semantic preview, normal edit application, and
post-change verification.

## Success Criteria

The project is on track when an agent can answer:

- Which code-intel route should I try first?
- Why is this language supported or degraded?
- Which tool response proves the result?
- If AST or LSP is unavailable, what fallback did I use and why?
- After an edit, what diagnostic or audit evidence confirms the change?

Future work should be judged by whether it makes those answers clearer, safer,
and easier to verify.
