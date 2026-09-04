'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { EngineAdapter, loadCoreDiagnosisReport, decodePowerShellLine } = require('../src/worker/engine-adapter.cjs');
const { makeIssue } = require('../src/worker/diagnostic-policy.cjs');

const projectRoot = path.resolve(__dirname, '..');
const testRoot = path.join(projectRoot, '.test-artifacts', 'engine-adapter');

test.after(async () => {
  const resolved = path.resolve(testRoot);
  assert.ok(resolved.startsWith(path.join(projectRoot, '.test-artifacts') + path.sep));
  await fs.rm(resolved, { recursive: true, force: true });
});

test('PowerShell output preserves UTF-8 and Windows Chinese code-page text', () => {
  assert.equal(decodePowerShellLine(Buffer.from('只读诊断已开始', 'utf8')), '只读诊断已开始');
  assert.equal(decodePowerShellLine(Buffer.from([0xD6, 0xD0, 0xCE, 0xC4])), '中文');
});

test('adapter verifies frozen hashes and prepares only an isolated session copy', async () => {
  const adapter = new EngineAdapter({
    dataRoot: testRoot,
    engineRoot: path.join(projectRoot, 'engine', 'integrated-4.0.0'),
    concurrency: 2,
    onEvent: () => {}, onLog: () => {}, registerChild: () => {}, unregisterChild: () => {}
  });
  const verified = await adapter.verifySnapshot();
  assert.equal(verified.version, '4.0.0');
  assert.equal(verified.coreVersion, '3.1.1');
  assert.equal(verified.verifiedFiles, 9);
  const prepared = await adapter.prepareSession('session-fixture-0001');
  const config = await fs.readFile(path.join(prepared.sessionRoot, 'Config', 'storage.ini'), 'utf8');
  assert.match(config, /backup_root=/);
  assert.ok(config.includes(path.join(testRoot, 'backups')));
  const copied = await fs.readFile(path.join(prepared.sessionRoot, 'Start-WinBridge-Recovery.ps1'), 'utf8');
  const frozen = await fs.readFile(path.join(projectRoot, 'engine', 'integrated-4.0.0', 'Start-WinBridge-Recovery.ps1'), 'utf8');
  assert.equal(copied, frozen);
});

test('real repair stays disabled by default', async () => {
  const adapter = new EngineAdapter({
    dataRoot: testRoot,
    engineRoot: path.join(projectRoot, 'engine', 'integrated-4.0.0'),
    onEvent: () => {}, onLog: () => {}, registerChild: () => {}, unregisterChild: () => {}
  });
  await assert.rejects(() => adapter.startRepair('report-fixture-00000001'), /disabled/);
});

function makeCurrentReport({ id, expiresAt, issues }) {
  const report = {
    schemaVersion: 1,
    reportId: id,
    createdAt: new Date().toISOString(),
    engineSnapshot: { version: '4.0.0' },
    issues,
    summary: { issueCount: issues.length },
    rawReportPath: null,
    expiresAt
  };
  return report;
}

test('enabled launch capability cannot bypass current report, expiry, or category gates', async () => {
  const gatedRoot = path.join(testRoot, 'packaged-gates');
  const adapter = new EngineAdapter({
    dataRoot: gatedRoot,
    engineRoot: path.join(projectRoot, 'engine', 'integrated-4.0.0'),
    realRepairEnabled: true,
    onEvent: () => {}, onLog: () => {}, registerChild: () => {}, unregisterChild: () => {}
  });
  const currentId = 'report-packaged-gate-0001';
  adapter.currentReport = makeCurrentReport({
    id: currentId,
    expiresAt: new Date(Date.now() + 60000).toISOString(),
    issues: [makeIssue('plugin-cache-drift', ['Synthetic drift'])]
  });
  await assert.rejects(() => adapter.startRepair('report-stale-id-000001'), /not current/);

  adapter.currentReport = makeCurrentReport({
    id: currentId,
    expiresAt: new Date(Date.now() - 60000).toISOString(),
    issues: [makeIssue('plugin-cache-drift', ['Synthetic drift'])]
  });
  await assert.rejects(() => adapter.startRepair(currentId), /expired/);

  adapter.currentReport = makeCurrentReport({
    id: currentId,
    expiresAt: new Date(Date.now() + 60000).toISOString(),
    issues: [makeIssue('browser-chrome-availability', ['Synthetic availability evidence'])]
  });
  await assert.rejects(() => adapter.startRepair(currentId), /no approved repair suggestion/);
});

test('repair acceptance returns an operation id before the long-running worker finishes', async () => {
  const gatedRoot = path.join(testRoot, 'async-repair');
  const events = [];
  const adapter = new EngineAdapter({
    dataRoot: gatedRoot,
    engineRoot: path.join(projectRoot, 'engine', 'integrated-4.0.0'),
    realRepairEnabled: true,
    onEvent: (event) => events.push(event),
    onLog: () => {},
    registerChild: () => {},
    unregisterChild: () => {}
  });
  const reportId = 'report-async-repair-0001';
  adapter.currentReport = makeCurrentReport({
    id: reportId,
    expiresAt: new Date(Date.now() + 60000).toISOString(),
    issues: [makeIssue('plugin-cache-drift', ['Synthetic drift'])]
  });
  adapter.prepareSession = async () => {
    await new Promise((resolve) => setTimeout(resolve, 80));
    return { sessionRoot: path.join(gatedRoot, 'engine-sessions', 'repair-fixture') };
  };
  adapter.runPowerShell = async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return { exitCode: 0, stdout: ['static verification passed'], stderr: [] };
  };

  const started = Date.now();
  const accepted = await adapter.startRepair(reportId);
  const acceptanceMs = Date.now() - started;
  assert.equal(accepted.accepted, true);
  assert.equal(accepted.reportId, reportId);
  assert.ok(acceptanceMs < 60, `repair acceptance blocked for ${acceptanceMs}ms`);
  assert.equal(adapter.getOperationStatus(accepted.operationId).state, 'running');

  for (let attempt = 0; attempt < 30 && adapter.getOperationStatus(accepted.operationId).state === 'running'; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  assert.equal(adapter.getOperationStatus(accepted.operationId).state, 'completed');
  assert.equal(events.at(-1).kind, 'ResultReady');
});

test('repair timeout and cancellation remain distinct terminal outcomes', async () => {
  const timeoutRoot = path.join(testRoot, 'repair-outcomes');
  const timeoutEvents = [];
  const adapter = new EngineAdapter({
    dataRoot: timeoutRoot,
    engineRoot: path.join(projectRoot, 'engine', 'integrated-4.0.0'),
    realRepairEnabled: true,
    operationTimeoutMs: 20,
    onEvent: (event) => timeoutEvents.push(event),
    onLog: () => {},
    registerChild: () => {},
    unregisterChild: () => {}
  });
  const timeoutReportId = 'report-repair-timeout-001';
  adapter.currentReport = makeCurrentReport({
    id: timeoutReportId,
    expiresAt: new Date(Date.now() + 60000).toISOString(),
    issues: [makeIssue('plugin-cache-drift', ['Synthetic drift'])]
  });
  adapter.prepareSession = async () => ({ sessionRoot: timeoutRoot });
  adapter.runPowerShell = async () => {
    await new Promise((resolve) => setTimeout(resolve, 80));
    return { exitCode: 0, stdout: ['static verification passed'], stderr: [] };
  };
  const timeoutAccepted = await adapter.startRepair(timeoutReportId);
  for (let attempt = 0; attempt < 30 && adapter.getOperationStatus(timeoutAccepted.operationId).state === 'running'; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  assert.equal(adapter.getOperationStatus(timeoutAccepted.operationId).state, 'timed-out');
  assert.equal(adapter.getOperationStatus(timeoutAccepted.operationId).reason, 'timeout');
  assert.equal(timeoutEvents.at(-1).kind, 'Failed');
  assert.equal(timeoutEvents.at(-1).details.reason, 'timeout');

  const cancelEvents = [];
  const cancelAdapter = new EngineAdapter({
    dataRoot: path.join(timeoutRoot, 'cancel'),
    engineRoot: path.join(projectRoot, 'engine', 'integrated-4.0.0'),
    realRepairEnabled: true,
    operationTimeoutMs: 1000,
    onEvent: (event) => cancelEvents.push(event),
    onLog: () => {},
    registerChild: () => {},
    unregisterChild: () => {}
  });
  const cancelReportId = 'report-repair-cancel-01';
  cancelAdapter.currentReport = makeCurrentReport({
    id: cancelReportId,
    expiresAt: new Date(Date.now() + 60000).toISOString(),
    issues: [makeIssue('plugin-cache-drift', ['Synthetic drift'])]
  });
  cancelAdapter.prepareSession = async () => ({ sessionRoot: timeoutRoot });
  cancelAdapter.runPowerShell = async (_sessionRoot, _mode, _operationId, signal) => new Promise((_resolve, reject) => {
    if (signal.aborted) return reject(signal.reason);
    signal.addEventListener('abort', () => reject(signal.reason), { once: true });
  });
  const cancelAccepted = await cancelAdapter.startRepair(cancelReportId);
  assert.equal(cancelAdapter.cancel(), true);
  for (let attempt = 0; attempt < 30 && cancelAdapter.getOperationStatus(cancelAccepted.operationId).state === 'running'; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  assert.equal(cancelAdapter.getOperationStatus(cancelAccepted.operationId).state, 'cancelled');
  assert.equal(cancelEvents.at(-1).kind, 'Cancelled');
  assert.equal(cancelEvents.at(-1).details.reason, 'cancelled');
});

test('only a bounded validated frozen DiagnoseOnly report is accepted', async () => {
  const session = path.join(testRoot, 'core-report');
  const logs = path.join(session, 'Logs');
  await fs.mkdir(logs, { recursive: true });
  await fs.writeFile(path.join(logs, 'diagnosis-fixture.json'), JSON.stringify({
    timestamp: new Date().toISOString(),
    toolVersion: '3.1.1',
    mode: 'DiagnoseOnly',
    issues: ['Synthetic plugin cache hash mismatch']
  }), 'utf8');
  const loaded = await loadCoreDiagnosisReport(session);
  assert.equal(loaded.report.mode, 'DiagnoseOnly');

  await fs.writeFile(path.join(logs, 'diagnosis-invalid.json'), JSON.stringify({
    timestamp: new Date().toISOString(), toolVersion: '4.0', mode: 'RepairAndLaunch', issues: []
  }), 'utf8');
  const future = new Date(Date.now() + 5000);
  await fs.utimes(path.join(logs, 'diagnosis-invalid.json'), future, future);
  await assert.rejects(() => loadCoreDiagnosisReport(session), /contract is invalid/);
});
