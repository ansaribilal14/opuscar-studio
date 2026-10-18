// regression.test.mjs — existing shared styles must be untouched and still render
// (task spec §13 M). Run from the library root:
//   node --test styles/code-title-cards/demo/tools/regression.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, statSync } from 'fs';

const here = dirname(fileURLToPath(import.meta.url));
const LIB = join(here, '..', '..', '..', '..');          // lemo-opuscar (library root)
const REPO = join(LIB, '..');                            // opuscar-studio (git repo root)

test('M: the shared engine is untouched by this style (git diff vs main is empty)', () => {
  const diff = execFileSync('git', ['-C', REPO, 'diff', 'main...HEAD', '--stat', '--', 'lemo-opuscar/core'], { encoding: 'utf8' });
  assert.equal(diff.trim(), '', 'no changes under lemo-opuscar/core');
  const dirty = execFileSync('git', ['-C', REPO, 'status', '--porcelain', '--', 'lemo-opuscar/core'], { encoding: 'utf8' });
  assert.equal(dirty.trim(), '', 'no uncommitted changes under lemo-opuscar/core');
});

test('M: an existing shared style still renders through the same shared tools', () => {
  // dark-keynote renders with only tracked files (its font loads are best-effort).
  const out = join(LIB, 'styles/dark-keynote/demo/out/regression-probe');
  execFileSync('node', ['core/render/still.mjs', 'styles/dark-keynote/demo', '10.0', '--out', out], { cwd: LIB, stdio: ['ignore', 'pipe', 'pipe'] });
  const f = join(out, 't_10.0.jpg');   // still.mjs names files after the timestamp string as passed
  assert.ok(existsSync(f) && statSync(f).size > 10_000, 'regression still rendered');
});
