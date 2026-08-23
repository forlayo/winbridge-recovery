'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { mapBounded } = require('../src/worker/read-only-pool.cjs');
const { BoundedLogBuffer } = require('../src/worker/log-buffer.cjs');

const projectRoot = path.resolve(__dirname, '..');

test('real repair has a dedicated long-running request timeout', () => {
  const source = fs.readFileSync(path.join(projectRoot, 'src', 'main', 'main.cjs'), 'utf8');
  assert.match(source, /const REPAIR_REQUEST_TIMEOUT_MS = 30 \* 60 \* 1000;/);
  assert.match(source, /manager\.request\('repair\.start', validateReportId\(reportId\), REPAIR_REQUEST_TIMEOUT_MS\)/);
});

test('opening GPT cancels the owned repair tree first', () => {
  const mainSource = fs.readFileSync(path.join(projectRoot, 'src', 'main', 'main.cjs'), 'utf8');
  const workerSource = fs.readFileSync(path.join(projectRoot, 'src', 'worker', 'engine-worker.cjs'), 'utf8');
  const adapterSource = fs.readFileSync(path.join(projectRoot, 'src', 'worker', 'engine-adapter.cjs'), 'utf8');
  assert.match(workerSource, /case 'gpt\.open':[\s\S]*adapter\.cancel\(\)[\s\S]*openInstalledGPT/);
  assert.match(adapterSource, /spawnSync\('taskkill\.exe', \['\/PID', String\(child\.pid\), '\/T', '\/F'\]/);
  assert.match(mainSource, /const result = await manager\.request\('gpt\.open'\);[\s\S]*setImmediate\(\(\) => app\.quit\(\)\);[\s\S]*launcherClosing: true/);
});

test('runtime UI advances plugin evidence live and keeps post-start verification in stage five', () => {
  const source = fs.readFileSync(path.join(projectRoot, '..', 'design-lab', 'src', 'components', 'RecoveryWindow.jsx'), 'utf8');
  const mockSource = fs.readFileSync(path.join(projectRoot, '..', 'design-lab', 'src', 'lib', 'runtimeBridgeMock.js'), 'utf8');
  assert.match(source, /AwaitingDecision: 3/);
  assert.match(source, /desktopStarted \? 4/);
  assert.match(source, /\\bDesktop started\\b/);
  assert.match(source, /updatePluginStatesFromLogs\(current, entries, phase\)/);
  assert.match(source, /flowState === "Repairing" \? "修复中"/);
  assert.doesNotMatch(source, /engineStageState → presentedStageState/);
  assert.match(mockSource, /Desktop started\. Waiting for two consecutive clean reconciliation checks/);
  assert.match(mockSource, /await wait\(2200\)/);
});

test('read-only pool respects its concurrency cap and preserves result order', async () => {
  let active = 0;
  let peak = 0;
  const result = await mapBounded([1, 2, 3, 4, 5, 6], 2, async (value) => {
    active += 1;
    peak = Math.max(peak, active);
    await new Promise((resolve) => setTimeout(resolve, 8));
    active -= 1;
    return value * 2;
  });
  assert.equal(peak, 2);
  assert.deepEqual(result, [2, 4, 6, 8, 10, 12]);
});

test('log buffer remains bounded and reports dropped entries under backpressure', () => {
  const batches = [];
  const buffer = new BoundedLogBuffer({ maxBytes: 320, batchSize: 16, flushIntervalMs: 10000, onBatch: (batch) => batches.push(batch) });
  for (let index = 0; index < 20; index += 1) {
    buffer.push({ level: 'info', category: 'fixture', message: `entry-${index}-${'x'.repeat(60)}` });
  }
  buffer.flush();
  assert.equal(batches.length, 1);
  assert.ok(batches[0].droppedBeforeBatch > 0);
  assert.ok(batches[0].entries.length < 20);
  buffer.close();
});
