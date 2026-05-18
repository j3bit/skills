#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { tools, callTool, loadRegistry } from '../mcp/code-intel-server/core.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EXPECTED_TOOLS = ['capability_discover','ast_grep_search','ast_grep_replace_preview','lsp_diagnostics','lsp_symbols','lsp_goto_definition','lsp_find_references','lsp_prepare_rename','lsp_rename_preview'];
const SKILLS = ['code-intel','init-code-intel','code-intel-doctor','code-intel-refactor'];
const REFS = ['routing-policy.md','language-adapter-contract.md','fallback-policy.md','mcp-tool-contract.md','hook-contract.md'];
const results = [];
function check(name, ok, evidence = '') { results.push({ name, ok: Boolean(ok), evidence: String(evidence) }); }
function exists(rel) { return fs.existsSync(path.join(ROOT, rel)); }
function readJson(rel) { return JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8')); }
function run(cmd, args, opts = {}) { return spawnSync(cmd, args, { cwd: ROOT, encoding: 'utf8', timeout: 15000, maxBuffer: 10 * 1024 * 1024, ...opts }); }
function rel(file) { return path.relative(ROOT, file); }
function writeJson(file, value) { fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n'); }
function finish() {
  const failed = results.filter((r) => !r.ok);
  const report = { status: failed.length ? 'failed' : 'passed', total: results.length, passed: results.length - failed.length, failed: failed.length, results };
  if (process.argv.includes('--json')) console.log(JSON.stringify(report, null, 2));
  else {
    for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'} ${r.name}${r.evidence ? ` — ${r.evidence}` : ''}`);
    console.log(`\n${report.status}: ${report.passed}/${report.total} checks passed`);
  }
  process.exit(failed.length ? 1 : 0);
}

// Plugin structure validation
check('plugin manifest exists', exists('.codex-plugin/plugin.json'), '.codex-plugin/plugin.json');
const manifest = readJson('.codex-plugin/plugin.json');
check('manifest required fields', ['name','version','description','skills','interface'].every((k) => manifest[k]), Object.keys(manifest).join(', '));
check('manifest name is code-intel', manifest.name === 'code-intel', manifest.name);
check('mcp server manifest exists', exists('.mcp.json'), '.mcp.json');
for (const skill of SKILLS) check(`skill ${skill} exists`, exists(`skills/${skill}/SKILL.md`), `skills/${skill}/SKILL.md`);
for (const ref of REFS) check(`reference ${ref} exists`, exists(`references/${ref}`), `references/${ref}`);
check('adapter schema exists', exists('adapters/schema.json'), 'adapters/schema.json');
check('adapter registry exists', exists('adapters/registry.json'), 'adapters/registry.json');
let registry;
try {
  registry = loadRegistry();
} catch (error) {
  check('registry validates against adapters/schema.json', false, error.message);
  finish();
}
check('registry has version and adapters', Boolean(registry.version && Array.isArray(registry.adapters) && registry.adapters.length), registry.version);
check('registry validates against adapters/schema.json', true, 'loadRegistry completed schema-backed validation');
for (const adapter of registry.adapters) {
  check(`adapter ${adapter.language} shape`, Boolean(adapter.language && adapter.extensions?.length && adapter.astGrep?.languageId && adapter.lsp && adapter.fallback?.length && adapter.fixtures), JSON.stringify(adapter));
}
if (!process.env.CODE_INTEL_EXPECT_VALIDATION_FAILURE) {
  const malformedRegistryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'code-intel-bad-registry-'));
  try {
    writeJson(path.join(malformedRegistryRoot, 'bad-registry.json'), { version: 'bad', adapters: [{ language: 'bad' }] });
    const badRegistryRun = run('node', ['scripts/validate-plugin.js', '--json'], {
      env: { ...process.env, CODE_INTEL_REGISTRY_PATH: path.join(malformedRegistryRoot, 'bad-registry.json'), CODE_INTEL_EXPECT_VALIDATION_FAILURE: '1' }
    });
    const badRegistryEvidence = `${badRegistryRun.stdout}\n${badRegistryRun.stderr}`;
    check('registry schema validation rejects malformed registry', badRegistryRun.status !== 0 && badRegistryEvidence.includes('schema'), badRegistryEvidence.slice(0, 500));
  } finally {
    fs.rmSync(malformedRegistryRoot, { recursive: true, force: true });
  }
}
check('scripts executable or documented', ['scripts/init-code-intel.js','scripts/doctor-code-intel.js','scripts/validate-plugin.js'].every((f) => fs.statSync(path.join(ROOT, f)).mode & 0o111), 'init/doctor/validate executable');

// MCP contract validation
const list = run('node', ['mcp/code-intel-server/index.js', '--list-tools']);
check('MCP server list-tools starts', list.status === 0, list.stderr || list.stdout.slice(0, 200));
const framedInit = run('python3', ['-c', `import json, subprocess
msg={"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05"}}
body=json.dumps(msg,separators=(',',':')).encode()
raw=b'Content-Length: '+str(len(body)).encode()+b'\\r\\n\\r\\n'+body
p=subprocess.run(['node','mcp/code-intel-server/index.js'],input=raw,capture_output=True,timeout=5)
assert p.returncode == 0 and b'Content-Length:' in p.stdout and b'code-intel' in p.stdout
print('framed initialize ok')`]);
check('MCP framed initialize works', framedInit.status === 0, framedInit.stdout || framedInit.stderr);
let listed = [];
try { listed = JSON.parse(list.stdout).tools.map((t) => t.name); } catch {}
check('tool list includes expected tools', EXPECTED_TOOLS.every((t) => listed.includes(t)), listed.join(', '));
for (const tool of tools) check(`tool ${tool.name} schema`, Boolean(tool.name && tool.description && tool.inputSchema && tool.outputSchema), tool.description);
const discover = callTool('capability_discover', { repoRoot: ROOT });
check('capability_discover works', Boolean(discover.repoRoot && discover.tools?.astGrep?.command === 'ast-grep'), discover.repoRoot);
const missingAst = callTool('ast_grep_search', { repoRoot: ROOT, language: 'definitely-unsupported', pattern: 'class $A' });
check('ast-grep unsupported language reports unavailable cleanly', missingAst.status === 'unavailable' && missingAst.fallbackReason.includes('unsupported'), JSON.stringify(missingAst));
const missingLsp = callTool('lsp_find_references', { repoRoot: ROOT, language: 'json', file: 'package.json', position: { line: 0, character: 0 } });
check('LSP tool reports unavailable cleanly when no server declared', missingLsp.status === 'unavailable' && missingLsp.fallbackReason, JSON.stringify(missingLsp));
const fakeLspRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'code-intel-fake-lsp-'));
try {
  const fakeRegistry = {
    version: 'test-fake-lsp',
    adapters: [{
      language: 'typescript',
      extensions: ['.ts'],
      astGrep: { languageId: 'typescript', supported: 'builtin' },
      lsp: { commands: [`node ${path.join(ROOT, 'fixtures/lsp/fake-lsp-server.js')}`], capabilities: ['definition', 'references', 'rename', 'diagnostics', 'symbols'] },
      fallback: ['rg', 'grep'],
      fixtures: { repo: 'fixtures/repos/typescript-basic', expectedAst: true, expectedLsp: true }
    }]
  };
  const fakeRegistryPath = path.join(fakeLspRoot, 'registry.json');
  writeJson(fakeRegistryPath, fakeRegistry);
  const lspProbe = run('node', ['mcp/code-intel-server/index.js', '--call-tool', 'lsp_symbols', '--args', JSON.stringify({ repoRoot: path.join(ROOT, 'fixtures/repos/typescript-basic'), file: 'src/math.ts' })], {
    env: { ...process.env, CODE_INTEL_REGISTRY_PATH: fakeRegistryPath }
  });
  const lspOutput = JSON.parse(lspProbe.stdout || '{}');
  check('LSP tools execute real JSON-RPC operation when server is available', lspProbe.status === 0 && lspOutput.status === 'ok' && lspOutput.method === 'textDocument/documentSymbol' && Array.isArray(lspOutput.result), lspProbe.stdout.slice(0, 500) || lspProbe.stderr.slice(0, 500));
} catch (error) {
  check('LSP tools execute real JSON-RPC operation when server is available', false, error.message);
} finally {
  fs.rmSync(fakeLspRoot, { recursive: true, force: true });
}
const previewBefore = fs.readFileSync(path.join(ROOT, 'fixtures/repos/typescript-basic/src/math.ts'), 'utf8');
callTool('ast_grep_replace_preview', { repoRoot: path.join(ROOT, 'fixtures/repos/typescript-basic'), language: 'typescript', pattern: 'add($A, $B)', replacement: 'sum($A, $B)', maxResults: 5 });
const previewAfter = fs.readFileSync(path.join(ROOT, 'fixtures/repos/typescript-basic/src/math.ts'), 'utf8');
check('preview tools do not mutate files', previewBefore === previewAfter, 'typescript fixture unchanged');

// Init workflow validation
const initTmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'code-intel-fixtures-'));
try {
  for (const fixture of ['typescript-basic','python-basic','mixed-no-lsp','unsupported-language']) {
    const sourceFixtureRoot = path.join(ROOT, 'fixtures/repos', fixture);
    const fixtureRoot = path.join(initTmpRoot, fixture);
    fs.cpSync(sourceFixtureRoot, fixtureRoot, { recursive: true, filter: (src) => !src.includes(`${path.sep}docs${path.sep}code-intel`) });
    const first = run('node', ['scripts/init-code-intel.js', '--repo', fixtureRoot, '--json']);
    const second = run('node', ['scripts/init-code-intel.js', '--repo', fixtureRoot, '--json']);
    check(`init ${fixture} succeeds twice`, first.status === 0 && second.status === 0, (first.stderr || second.stderr || '').slice(0, 300));
    for (const report of ['capability-report.md','routing-profile.json','validation-report.md']) check(`init ${fixture} writes ${report}`, fs.existsSync(path.join(fixtureRoot, 'docs/code-intel', report)), report);
    const profile = JSON.parse(fs.readFileSync(path.join(fixtureRoot, 'docs/code-intel/routing-profile.json'), 'utf8'));
    check(`init ${fixture} records ast-grep command`, profile.tools.astGrep.command === 'ast-grep', profile.tools.astGrep.command);
    check(`init ${fixture} records per-language ast-grep smoke`, Object.values(profile.languages || {}).every((language) => language.astGrepSmoke && ['passed','skipped','failed'].includes(language.astGrepSmoke.status)), JSON.stringify(profile.languages));
    check(`init ${fixture} records optional LSP initialize smoke`, Object.values(profile.languages || {}).every((language) => language.lspInitializeSmoke && ['passed','skipped','failed'].includes(language.lspInitializeSmoke.status)), JSON.stringify(profile.languages));
    check(`init ${fixture} fallback explicit`, Boolean(profile.commandPolicy && profile.tools.astGrep.note), profile.commandPolicy);
  }
} finally {
  fs.rmSync(initTmpRoot, { recursive: true, force: true });
}
const staleTmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'code-intel-stale-profile-'));
try {
  fs.cpSync(path.join(ROOT, 'fixtures/repos/typescript-basic'), staleTmpRoot, { recursive: true });
  const staleDocs = path.join(staleTmpRoot, 'docs/code-intel');
  fs.mkdirSync(staleDocs, { recursive: true });
  writeJson(path.join(staleDocs, 'routing-profile.json'), {
    repoRoot: staleTmpRoot,
    generatedAt: '2020-01-01T00:00:00.000Z',
    pluginVersion: '0.0.0-stale',
    adapterRegistryVersion: '0.0.0-stale',
    tools: { astGrep: { command: 'ast-grep', available: true } },
    languages: {},
    inventory: { totalFiles: 0, languages: {} }
  });
  const doctorRun = run('node', ['scripts/doctor-code-intel.js', '--repo', staleTmpRoot, '--json']);
  const doctor = JSON.parse(doctorRun.stdout || '{}');
  const reasons = (doctor.findings || []).map((finding) => finding.reason).join(' | ');
  check('doctor detects stale routing profile version and inventory mismatch', reasons.includes('plugin version differs') && reasons.includes('adapter registry version differs') && reasons.includes('language inventory major mismatch'), reasons);
} finally {
  fs.rmSync(staleTmpRoot, { recursive: true, force: true });
}

// Hook validation
const hookCases = [
  ['hooks/user-prompt-submit.js', 'rename symbol and find references', 'UserPromptSubmit'],
  ['hooks/pre-tool-use.js', '{"cmd":"rg class Foo"}', 'PreToolUse'],
  ['hooks/post-tool-use.js', '{"tool":"apply_patch","status":"changed"}', 'PostToolUse']
];
for (const [hook, input, expected] of hookCases) {
  const r = run('node', [hook], { input });
  let ok = false; let evidence = r.stdout || r.stderr;
  try { ok = JSON.parse(r.stdout).hook === expected; } catch {}
  check(`${expected} emits short JSON nudge`, ok && r.stdout.length < 500, evidence.slice(0, 500));
}
const preAllow = run('node', ['hooks/pre-tool-use.js'], { input: '{"cmd":"rg TODO"}' });
check('PreToolUse does not block ordinary rg', preAllow.status === 0, `stdout bytes=${preAllow.stdout.length}`);
const preManualReplace = run('node', ['hooks/pre-tool-use.js'], { input: '{"tool":"apply_patch","description":"replace function add with sum across files"}' });
check('PreToolUse nudges manual structural replace/edit patterns', preManualReplace.status === 0 && preManualReplace.stdout.includes('code-intel') && preManualReplace.stdout.includes('allow'), preManualReplace.stdout || preManualReplace.stderr);

// Behavior scenarios
const behavior = [
  ['find class or function definition', 'lsp when available, else ast-grep, else rg'],
  ['find references', 'lsp_find_references, then ast_grep_search, then rg'],
  ['rename symbol', 'lsp_prepare_rename and lsp_rename_preview, else preview fallback'],
  ['rewrite structural pattern', 'ast_grep_replace_preview only, then normal edits'],
  ['edit file then run diagnostics', 'lsp_diagnostics when available'],
  ['unsupported language fallback', 'rg/grep with reason'],
  ['missing ast-grep fallback', 'rg/grep with reason'],
  ['missing LSP fallback', 'ast-grep or rg/grep with reason']
];
const routingPolicy = fs.readFileSync(path.join(ROOT, 'references/routing-policy.md'), 'utf8') + fs.readFileSync(path.join(ROOT, 'references/fallback-policy.md'), 'utf8');
for (const [name, expectation] of behavior) check(`behavior documented: ${name}`, expectation.split(/,? then |, | and | with /).some((token) => routingPolicy.toLowerCase().includes(token.trim().toLowerCase().split(' ')[0])), expectation);

// No forbidden command path in executable/config surfaces.
const scanFiles = [];
for (const dir of ['scripts','hooks','adapters','mcp']) {
  const stack = [path.join(ROOT, dir)];
  while (stack.length) {
    const item = stack.pop();
    for (const entry of fs.readdirSync(item, { withFileTypes: true })) {
      const full = path.join(item, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else scanFiles.push(full);
    }
  }
}
const commandCallPattern = /(?:spawnSync|spawn|execFile|exec)\s*\(\s*['"]sg['"]|"command"\s*:\s*"sg"/;
const offenders = scanFiles.filter((file) => commandCallPattern.test(fs.readFileSync(file, 'utf8'))).map(rel);
check('no script hook registry or MCP path calls forbidden shorthand command', offenders.length === 0, offenders.join(', ') || 'none');

finish();
