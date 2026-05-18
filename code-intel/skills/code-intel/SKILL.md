---
name: code-intel
description: Prefer language-aware code intelligence for search, navigation, references, rename, rewrite previews, and diagnostics before text fallback.
---

# Code Intel

Use this skill for codebase questions involving declarations, patterns, API usage, symbols, definitions, references, rename, structural rewrites, diagnostics, or post-edit audits.

## Routing

1. Check `docs/code-intel/routing-profile.json` when present.
2. Prefer LSP tools for semantic navigation and diagnostics when available.
3. Prefer `ast_grep_search` for structural patterns when the adapter supports built-in AST search.
4. Use `rg`/`grep` fallback for strings, filenames, logs, generated files, unsupported languages, missing tools, or inconclusive code-intel output.
5. Report the route and fallback reason.

## Command policy

Use `ast-grep` for AST search. Do not use the Linux-conflicting shorthand command.
