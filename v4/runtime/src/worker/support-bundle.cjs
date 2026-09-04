'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');

const MAX_BUNDLE_BYTES = 2 * 1024 * 1024;
const MAX_LOG_BYTES = 512 * 1024;
const MAX_LOG_ENTRIES = 160;
const MAX_OBJECT_KEYS = 48;
const MAX_ARRAY_ITEMS = 160;
const MAX_STRING_LENGTH = 8192;

const SECRET_KEY_PATTERN = /token|cookie|password|secret|credential|private.?key|authorization|auth(?:entication|orization)?/i;
const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const WINDOWS_PATH_PATTERN = /(?:[A-Za-z]:\\|\\\\)[^\"'<>`\r\n]+/g;
const USER_PATH_PATTERN = /%USERPROFILE%(?:\\[^\"'<>`\r\n]*)?/gi;
const POSIX_USER_PATH_PATTERN = /(?:\/Users\/|\/home\/)[^\s\"'<>`]+/gi;

function redactString(value) {
  let text = String(value ?? '');
  text = text.replace(/Bearer\s+[A-Za-z0-9._~+/=-]+/gi, 'Bearer <redacted>');
  text = text.replace(/((?:token|api[_ -]?key|cookie|password|secret|authorization)\s*[:=]\s*)(?!Bearer\b)([^\s,;]+)/gi, '$1<redacted>');
  text = text.replace(EMAIL_PATTERN, '<redacted-email>');
  text = text.replace(USER_PATH_PATTERN, '<user-path>');
  text = text.replace(WINDOWS_PATH_PATTERN, '<path>');
  text = text.replace(POSIX_USER_PATH_PATTERN, '<path>');
  text = text.replace(/\bauth\.json\b/gi, '<redacted-auth-file>');
  return text.length > MAX_STRING_LENGTH ? `${text.slice(0, MAX_STRING_LENGTH)}…` : text;
}

function sanitize(value, key = '', depth = 0) {
  if (SECRET_KEY_PATTERN.test(key)) return '<redacted-field>';
  if (depth > 5) return '[truncated]';
  if (value === null || value === undefined) return value;
  if (typeof value === 'string') return redactString(value);
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (Array.isArray(value)) return value.slice(0, MAX_ARRAY_ITEMS).map((entry) => sanitize(entry, '', depth + 1));
  if (typeof value !== 'object') return String(value);
  const result = {};
  for (const [childKey, childValue] of Object.entries(value).slice(0, MAX_OBJECT_KEYS)) {
    if (SECRET_KEY_PATTERN.test(childKey)) {
      result[childKey] = '<redacted-field>';
      continue;
    }
    if (/^(?:raw)?path$/i.test(childKey) || /directory|filename/i.test(childKey)) {
      result[childKey] = '<redacted-path>';
      continue;
    }
    result[childKey] = sanitize(childValue, childKey, depth + 1);
  }
  return result;
}

async function readTail(file, maximumBytes = MAX_LOG_BYTES) {
  try {
    const stat = await fs.stat(file);
    if (!stat.isFile()) return '';
    const handle = await fs.open(file, 'r');
    try {
      const length = Math.min(stat.size, maximumBytes);
      const start = Math.max(0, stat.size - length);
      const buffer = Buffer.alloc(length);
      const { bytesRead } = await handle.read(buffer, 0, buffer.length, start);
      return buffer.subarray(0, bytesRead).toString('utf8');
    } finally {
      await handle.close().catch(() => {});
    }
  } catch {
    return '';
  }
}

async function readJson(file, maximumBytes = MAX_BUNDLE_BYTES) {
  const text = await readTail(file, maximumBytes);
  if (!text) return null;
  try { return JSON.parse(text.replace(/^.*?\{/s, '{')); } catch { return null; }
}

async function collectLogs(dataRoot) {
  const text = await readTail(path.join(dataRoot, 'logs', 'runtime.log'));
  if (!text) return [];
  return text.split(/\r?\n/).filter(Boolean).slice(-MAX_LOG_ENTRIES).map((line) => {
    try { return sanitize(JSON.parse(line)); } catch { return { message: redactString(line) }; }
  });
}

function trimToBundleLimit(bundle) {
  let text = `${JSON.stringify(bundle, null, 2)}\n`;
  if (Buffer.byteLength(text, 'utf8') <= MAX_BUNDLE_BYTES) return text;
  bundle.logs = bundle.logs.slice(-40);
  bundle.notice = `${bundle.notice} 日志已进一步裁剪以保持大小上限。`;
  text = `${JSON.stringify(bundle, null, 2)}\n`;
  if (Buffer.byteLength(text, 'utf8') <= MAX_BUNDLE_BYTES) return text;
  bundle.logs = [];
  bundle.notice = `${bundle.notice} 日志因大小限制未纳入；请使用应用日志目录中的完整文件。`;
  text = `${JSON.stringify(bundle, null, 2)}\n`;
  if (Buffer.byteLength(text, 'utf8') > MAX_BUNDLE_BYTES) throw new Error('Support bundle metadata exceeds its size boundary');
  return text;
}

async function createSupportBundle({ dataRoot, appInfo = null, report = null, operationStatus = null, engineSnapshot = null } = {}) {
  if (typeof dataRoot !== 'string' || !dataRoot) throw new TypeError('dataRoot is required');
  const reportValue = report || await readJson(path.join(dataRoot, 'reports', 'latest.json'));
  const logs = await collectLogs(dataRoot);
  const bundle = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    redacted: true,
    notice: '本支持包仅包含有界结构化诊断摘要与脱敏日志；不会包含账号、令牌、Cookie、认证文件或官方插件 payload。',
    application: sanitize(appInfo),
    report: sanitize(reportValue),
    operation: sanitize(operationStatus),
    engineSnapshot: sanitize(engineSnapshot),
    logs,
    limits: { maxBundleBytes: MAX_BUNDLE_BYTES, maxLogBytes: MAX_LOG_BYTES, maxLogEntries: MAX_LOG_ENTRIES },
  };
  const text = trimToBundleLimit(bundle);
  const supportRoot = path.join(dataRoot, 'support-bundles');
  await fs.mkdir(supportRoot, { recursive: true });
  const fileName = `support-${Date.now()}-${crypto.randomUUID().slice(0, 8)}.json`;
  const file = path.join(supportRoot, fileName);
  const temporary = `${file}.${process.pid}.tmp`;
  await fs.writeFile(temporary, text, { encoding: 'utf8', flag: 'wx' });
  try { await fs.rename(temporary, file); } catch (error) {
    await fs.rm(temporary, { force: true }).catch(() => {});
    throw error;
  }
  return { path: file, fileName, bytes: Buffer.byteLength(text, 'utf8'), redacted: true, schemaVersion: 1 };
}

module.exports = {
  MAX_BUNDLE_BYTES,
  MAX_LOG_BYTES,
  MAX_LOG_ENTRIES,
  redactString,
  sanitize,
  createSupportBundle,
};
