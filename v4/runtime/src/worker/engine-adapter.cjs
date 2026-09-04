'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawn, spawnSync } = require('node:child_process');
const { makeId, validateDiagnosticReport } = require('../shared/contracts.cjs');
const { mapBounded } = require('./read-only-pool.cjs');
const { classifyEvidence } = require('./diagnostic-policy.cjs');

const utf8Decoder = new TextDecoder('utf-8', { fatal: true });
const gb18030Decoder = new TextDecoder('gb18030');
const utf16leDecoder = new TextDecoder('utf-16le');

/**
 * Windows PowerShell writes redirected console output in the active OEM/code
 * page. Decoding every chunk as UTF-8 turns Chinese evidence into "���". Try
 * UTF-8 first for modern scripts, then fall back to the Windows-compatible
 * GB18030 decoder while retaining BOM-aware UTF-16 output.
 */
function decodePowerShellLine(value) {
  const bytes = Buffer.isBuffer(value) ? value : Buffer.from(value || '');
  if (!bytes.length) return '';
  if (bytes[0] === 0xFF && bytes[1] === 0xFE) return utf16leDecoder.decode(bytes.subarray(2));
  const withoutUtf8Bom = bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF ? bytes.subarray(3) : bytes;
  try {
    return utf8Decoder.decode(withoutUtf8Bom);
  } catch {
    return gb18030Decoder.decode(withoutUtf8Bom);
  }
}

async function sha256(file) {
  const handle = await fs.open(file, 'r');
  const hash = crypto.createHash('sha256');
  try {
    for await (const chunk of handle.createReadStream()) hash.update(chunk);
  } finally {
    await handle.close().catch(() => {});
  }
  return hash.digest('hex').toUpperCase();
}

function isInside(root, candidate) {
  const relative = path.relative(root, candidate);
  return relative === '' || (!relative.startsWith('..' + path.sep) && relative !== '..' && !path.isAbsolute(relative));
}

async function loadCoreDiagnosisReport(sessionRoot, maxBytes = 1024 * 1024) {
  const canonicalSession = await fs.realpath(sessionRoot);
  const logsRoot = await fs.realpath(path.join(canonicalSession, 'Logs'));
  if (!isInside(canonicalSession, logsRoot)) throw new Error('Frozen diagnosis logs escaped the session root');
  const entries = await fs.readdir(logsRoot, { withFileTypes: true });
  const candidates = [];
  for (const entry of entries) {
    if (!entry.isFile() || !/^diagnosis-[a-zA-Z0-9-]+\.json$/.test(entry.name)) continue;
    const real = await fs.realpath(path.join(logsRoot, entry.name));
    if (!isInside(logsRoot, real)) continue;
    const stat = await fs.stat(real);
    if (stat.isFile() && stat.size > 0 && stat.size <= maxBytes) candidates.push({ real, mtimeMs: stat.mtimeMs });
  }
  candidates.sort((left, right) => right.mtimeMs - left.mtimeMs);
  if (!candidates.length) throw new Error('Frozen core did not produce a bounded diagnosis report');
  const handle = await fs.open(candidates[0].real, 'r');
  try {
    const buffer = Buffer.allocUnsafe(maxBytes + 1);
    const { bytesRead } = await handle.read(buffer, 0, buffer.length, 0);
    if (bytesRead < 1 || bytesRead > maxBytes) throw new Error('Frozen diagnosis report exceeded its size boundary');
    const text = buffer.subarray(0, bytesRead).toString('utf8').replace(/^\uFEFF/, '');
    const report = JSON.parse(text);
    if (report?.toolVersion !== '3.1.1' || report?.mode !== 'DiagnoseOnly' || !Array.isArray(report?.issues) || typeof report?.timestamp !== 'string') {
      throw new Error('Frozen diagnosis report contract is invalid');
    }
    return { report, path: candidates[0].real };
  } finally {
    await handle.close().catch(() => {});
  }
}

class EngineAdapter {
  constructor({ dataRoot, engineRoot, concurrency = 2, onEvent, onLog, registerChild, unregisterChild, realRepairEnabled = false, operationTimeoutMs = 30 * 60 * 1000 }) {
    this.dataRoot = dataRoot;
    this.engineRoot = engineRoot;
    this.concurrency = concurrency;
    this.onEvent = onEvent;
    this.onLog = onLog;
    this.registerChild = registerChild;
    this.unregisterChild = unregisterChild;
    this.realRepairEnabled = realRepairEnabled;
    this.operationTimeoutMs = operationTimeoutMs;
    this.active = null;
    this.currentReport = null;
    this.operations = new Map();
    this.onEvent = (event) => {
      this.recordOperationEvent(event);
      onEvent(event);
    };
  }

  recordOperationStart(operationId, kind, details = {}) {
    const now = new Date().toISOString();
    this.operations.set(operationId, {
      operationId,
      kind,
      state: 'running',
      actualProgress: 0,
      engineStageState: 'Idle',
      presentedStageState: kind === 'repair' ? 'Repairing' : 'Diagnosing',
      message: 'Operation accepted.',
      reason: 'accepted',
      startedAt: now,
      updatedAt: now,
      finishedAt: null,
      finalVerificationPassed: false,
      ...details
    });
    while (this.operations.size > 32) this.operations.delete(this.operations.keys().next().value);
  }

  recordOperationEvent(event) {
    const current = this.operations.get(event.operationId);
    if (!current) return;
    const terminal = ['Failed', 'Cancelled', 'ResultReady'].includes(event.kind);
    const reason = event.details?.reason || current.reason;
    const state = reason === 'timeout'
      ? 'timed-out'
      : reason === 'exit'
        ? 'exited'
        : event.kind === 'ResultReady'
      ? 'completed'
      : event.kind === 'Cancelled'
        ? 'cancelled'
        : event.kind === 'Failed' ? 'failed' : 'running';
    const updatedAt = new Date().toISOString();
    this.operations.set(event.operationId, {
      ...current,
      state,
      actualProgress: Math.max(current.actualProgress, Number(event.actualProgress) || 0),
      engineStageState: event.engineStageState || current.engineStageState,
      presentedStageState: event.presentedStageState || current.presentedStageState,
      message: event.message || current.message,
      reason,
      updatedAt,
      finishedAt: terminal ? updatedAt : null,
      finalVerificationPassed: Boolean(event.finalVerificationPassed)
    });
  }

  getOperationStatus(operationId) {
    if (typeof operationId !== 'string' || operationId.length < 8 || operationId.length > 128) {
      throw new TypeError('operationId must be a bounded string');
    }
    const status = this.operations.get(operationId);
    return status ? structuredClone(status) : null;
  }

  async verifySnapshot(signal) {
    const manifest = JSON.parse(await fs.readFile(path.join(this.engineRoot, 'SNAPSHOT.json'), 'utf8'));
    const checked = await mapBounded(manifest.files, this.concurrency, async (entry) => {
      const file = path.join(this.engineRoot, ...entry.path.split('/'));
      const actual = await sha256(file);
      if (actual !== entry.sha256) throw new Error(`Frozen snapshot hash mismatch: ${entry.path}`);
      return { path: entry.path, sha256: actual };
    }, signal);
    return { ...manifest, verifiedFiles: checked.length };
  }

  async prepareSession(operationId, signal) {
    const snapshot = await this.verifySnapshot(signal);
    const sessionRoot = path.join(this.dataRoot, 'engine-sessions', operationId);
    await fs.mkdir(sessionRoot, { recursive: true });
    await mapBounded(snapshot.files, this.concurrency, async (entry) => {
      const source = path.join(this.engineRoot, ...entry.path.split('/'));
      const target = path.join(sessionRoot, ...entry.path.split('/'));
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.copyFile(source, target);
    }, signal);
    const configRoot = path.join(sessionRoot, 'Config');
    await fs.mkdir(configRoot, { recursive: true });
    const backupRoot = path.join(this.dataRoot, 'backups');
    await fs.mkdir(backupRoot, { recursive: true });
    await fs.writeFile(path.join(configRoot, 'storage.ini'), `backup_root=${backupRoot}\r\n`, 'utf8');
    return { sessionRoot, snapshot };
  }

  async runDiagnosis() {
    if (this.active) throw new Error('An engine operation is already active');
    const operationId = makeId('diagnosis');
    const controller = new AbortController();
    this.active = { operationId, controller, child: null };
    this.recordOperationStart(operationId, 'diagnosis');
    this.currentReport = null;
    await fs.rm(path.join(this.dataRoot, 'reports', 'latest.json'), { force: true }).catch(() => {});
    try {
      this.onEvent({ operationId, kind: 'Stage', actualProgress: 2, engineStageState: 'PreparingSnapshot', presentedStageState: 'Diagnosing', message: 'Verifying frozen engine snapshot.' });
      const { sessionRoot, snapshot } = await this.prepareSession(operationId, controller.signal);
      this.onEvent({ operationId, kind: 'Stage', actualProgress: 15, engineStageState: 'ReadOnlyDiagnosis', presentedStageState: 'Diagnosing', message: 'Starting read-only diagnosis.' });
      const result = await this.runPowerShell(sessionRoot, 'DiagnoseOnly', operationId, controller.signal);
      if (result.exitCode !== 0) throw new Error(`Frozen diagnosis exited with code ${result.exitCode}`);
      const core = await loadCoreDiagnosisReport(sessionRoot);
      const issues = classifyEvidence([
        ...core.report.issues.map((issue) => String(issue)),
        ...result.stdout,
        ...result.stderr
      ]);
      const createdAt = new Date();
      const report = validateDiagnosticReport({
        schemaVersion: 1,
        reportId: makeId('report'),
        createdAt: createdAt.toISOString(),
        engineSnapshot: { version: snapshot.version, sourceCommit: snapshot.sourceCommit, manifestSha256: snapshot.manifestSha256 || null },
        issues,
        summary: { issueCount: issues.length, exitCode: result.exitCode, engineReportValidated: true, repairSuggestedCount: issues.filter((issue) => issue.suggestionMode === 'suggest-repair').length },
        rawReportPath: null,
        expiresAt: new Date(createdAt.getTime() + 30 * 60 * 1000).toISOString()
      });
      const reportsRoot = path.join(this.dataRoot, 'reports');
      await fs.mkdir(reportsRoot, { recursive: true });
      await fs.writeFile(path.join(reportsRoot, `${report.reportId}.json`), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
      await fs.writeFile(path.join(reportsRoot, 'latest.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
      this.currentReport = report;
      this.onEvent({ operationId, kind: 'ResultReady', actualProgress: 100, engineStageState: 'ResultReady', presentedStageState: 'ResultReady', message: 'Structured diagnosis report is ready.', finalVerificationPassed: true, details: { reportId: report.reportId } });
      return report;
    } catch (error) {
      const cancelled = controller.signal.aborted;
      this.onEvent({ operationId, kind: cancelled ? 'Cancelled' : 'Failed', actualProgress: 99, engineStageState: cancelled ? 'Cancelled' : 'Failed', presentedStageState: cancelled ? 'Cancelled' : 'Failed', message: cancelled ? 'Diagnosis cancelled.' : error.message, finalVerificationPassed: false });
      throw error;
    } finally {
      this.active = null;
    }
  }

  async getLatestReport() {
    return this.currentReport ? validateDiagnosticReport(this.currentReport) : null;
  }

  async startRepair(reportId) {
    if (!this.realRepairEnabled) throw new Error('Real repair is disabled for this build');
    if (this.active) throw new Error('An engine operation is already active');
    const report = this.currentReport ? validateDiagnosticReport(this.currentReport) : null;
    if (!report || report.reportId !== reportId) throw new Error('The selected diagnosis report is not current');
    if (Date.parse(report.expiresAt) <= Date.now()) throw new Error('The selected diagnosis report has expired');
    if (!report.issues.some((issue) => issue.suggestionMode === 'suggest-repair')) throw new Error('The report contains no approved repair suggestion');
    this.currentReport = null;
    const operationId = makeId('repair');
    const controller = new AbortController();
    this.active = { operationId, controller, child: null };
    this.recordOperationStart(operationId, 'repair', { reportId });
    void fs.rm(path.join(this.dataRoot, 'reports', 'latest.json'), { force: true }).catch(() => {});
    const operation = this.runRepair({ operationId, reportId, controller });
    operation.catch((error) => {
      this.onLog({ level: 'error', category: 'repair', message: error.message, operationId });
    });
    return { operationId, reportId, accepted: true };
  }

  async runRepair({ operationId, reportId, controller }) {
    const timeoutError = Object.assign(new Error('Repair operation timed out'), { code: 'WB_OPERATION_TIMEOUT' });
    const timeout = setTimeout(() => controller.abort(timeoutError), this.operationTimeoutMs);
    timeout.unref?.();
    try {
      const { sessionRoot } = await this.prepareSession(operationId, controller.signal);
      this.onEvent({ operationId, kind: 'Stage', actualProgress: 1, engineStageState: 'AwaitingFrozenCore', presentedStageState: 'Repairing', message: 'Starting the unchanged frozen repair sequence.' });
      const result = await this.runPowerShell(sessionRoot, 'RepairAndLaunch', operationId, controller.signal);
      if (controller.signal.aborted) throw controller.signal.reason || new Error('Repair operation was cancelled');
      const verified = result.exitCode === 0 && [...result.stdout, ...result.stderr].some((line) => /static verification passed|verification.*passed/i.test(line));
      if (!verified) {
        const error = new Error(result.exitCode === 0
          ? 'Frozen core did not provide final verification evidence'
          : `Frozen repair core exited with code ${result.exitCode}`);
        if (result.exitCode !== 0) error.code = 'WB_ENGINE_EXIT';
        throw error;
      }
      this.onEvent({ operationId, kind: 'ResultReady', actualProgress: 100, engineStageState: 'ResultReady', presentedStageState: 'ResultReady', message: 'Frozen repair core completed final verification.', finalVerificationPassed: true, details: { reportId } });
      return { operationId, reportId, finalVerificationPassed: true };
    } catch (error) {
      const timedOut = error?.code === 'WB_OPERATION_TIMEOUT' || controller.signal.reason?.code === 'WB_OPERATION_TIMEOUT';
      const cancelled = !timedOut && controller.signal.aborted;
      const reason = timedOut ? 'timeout' : cancelled ? 'cancelled' : error?.code === 'WB_ENGINE_EXIT' ? 'exit' : 'failure';
      this.onEvent({
        operationId,
        kind: cancelled ? 'Cancelled' : 'Failed',
        actualProgress: 99,
        engineStageState: timedOut ? 'TimedOut' : cancelled ? 'Cancelled' : 'Failed',
        presentedStageState: timedOut ? 'Failed' : cancelled ? 'Cancelled' : 'Failed',
        message: timedOut ? 'Repair timed out.' : cancelled ? 'Repair cancelled.' : error.message,
        finalVerificationPassed: false,
        details: { reportId, reason, exitCode: Number.isInteger(error?.exitCode) ? error.exitCode : null }
      });
      throw error;
    } finally {
      clearTimeout(timeout);
      this.active = null;
    }
  }

  cancel() {
    if (!this.active) return false;
    this.active.controller.abort(new Error('Operation cancelled'));
    return true;
  }

  runPowerShell(sessionRoot, mode, operationId, signal) {
    return new Promise((resolve, reject) => {
      const entry = path.join(sessionRoot, 'Invoke-WinBridge-Configured.ps1');
      const child = spawn('powershell.exe', ['-NoLogo', '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', entry, '-Mode', mode, '-NoPause'], {
        cwd: sessionRoot,
        windowsHide: true,
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: false
      });
      this.active.child = child;
      this.registerChild(child);
      const stdout = [];
      const stderr = [];
      let settled = false;

      const emitProgress = () => {
        const progress = Math.min(95, 20 + Math.floor((stdout.length + stderr.length) / 4));
        this.onEvent({ operationId, kind: 'Progress', actualProgress: progress, engineStageState: mode, presentedStageState: mode === 'DiagnoseOnly' ? 'Diagnosing' : 'Repairing', message: 'Frozen engine is running.' });
      };
      const createLineConsumer = (target, level) => {
        let pending = Buffer.alloc(0);
        const emitLine = (lineBytes) => {
          const line = decodePowerShellLine(lineBytes).replace(/^\uFEFF/, '');
          if (!line) return;
          target.push(line.slice(0, 8192));
          this.onLog({ level, category: 'engine', message: line, operationId });
        };
        const consume = (chunk) => {
          pending = Buffer.concat([pending, Buffer.from(chunk)]);
          let start = 0;
          for (let index = 0; index < pending.length; index += 1) {
            if (pending[index] !== 0x0A) continue;
            let lineBytes = pending.subarray(start, index);
            if (lineBytes[lineBytes.length - 1] === 0x0D) lineBytes = lineBytes.subarray(0, lineBytes.length - 1);
            emitLine(lineBytes);
            start = index + 1;
          }
          if (start > 0) pending = pending.subarray(start);
          emitProgress();
        };
        const flush = () => {
          if (pending.length) {
            emitLine(pending);
            pending = Buffer.alloc(0);
            emitProgress();
          }
        };
        return { consume, flush };
      };
      const stdoutConsumer = createLineConsumer(stdout, 'info');
      const stderrConsumer = createLineConsumer(stderr, 'warn');
      const heartbeat = setInterval(() => {
        if (!settled) emitProgress();
      }, 5000);
      heartbeat.unref?.();
      const cleanup = () => {
        clearInterval(heartbeat);
        signal.removeEventListener('abort', abort);
        this.unregisterChild(child);
      };
      child.stdout.on('data', stdoutConsumer.consume);
      child.stderr.on('data', stderrConsumer.consume);
      const abort = () => {
        if (!child.pid || child.exitCode !== null) return;
        if (process.platform === 'win32') {
          const result = spawnSync('taskkill.exe', ['/PID', String(child.pid), '/T', '/F'], {
            windowsHide: true,
            stdio: 'ignore',
            shell: false,
            timeout: 15000
          });
          if (result.error && child.exitCode === null) child.kill();
          return;
        }
        child.kill();
      };
      signal.addEventListener('abort', abort, { once: true });
      child.once('error', (error) => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(error);
      });
      child.once('exit', (code, exitSignal) => {
        if (settled) return;
        settled = true;
        stdoutConsumer.flush();
        stderrConsumer.flush();
        cleanup();
        if (signal.aborted) return reject(signal.reason || new Error('Operation cancelled'));
        resolve({ exitCode: code ?? -1, signal: exitSignal, stdout, stderr });
      });
    });
  }
}

module.exports = { EngineAdapter, sha256, loadCoreDiagnosisReport, decodePowerShellLine };
