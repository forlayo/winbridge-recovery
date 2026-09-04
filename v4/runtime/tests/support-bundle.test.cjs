'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { createSupportBundle, MAX_BUNDLE_BYTES, redactString, sanitize } = require('../src/worker/support-bundle.cjs');

const projectRoot = path.resolve(__dirname, '..');
const testRoot = path.join(projectRoot, '.test-artifacts', 'support-bundle');

test.after(async () => {
  await fs.rm(testRoot, { recursive: true, force: true });
});

test('support bundle is explicit, bounded, and redacts personal evidence', async () => {
  const dataRoot = path.join(testRoot, 'redaction');
  await fs.mkdir(path.join(dataRoot, 'logs'), { recursive: true });
  await fs.mkdir(path.join(dataRoot, 'reports'), { recursive: true });
  await fs.writeFile(path.join(dataRoot, 'logs', 'runtime.log'), `${JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'error',
    message: 'Access denied C:\\\\Users\\alice\\secret\\auth.json token=abc123 alice@example.com',
    path: 'C:\\\\Users\\alice\\secret\\runtime.log',
  })}\n`, 'utf8');
  await fs.writeFile(path.join(dataRoot, 'reports', 'latest.json'), JSON.stringify({
    schemaVersion: 1,
    reportId: 'report-support-bundle-0001',
    rawReportPath: 'C:\\\\Users\\alice\\report.json',
    issues: [{ category: 'plugin-cache-drift', evidence: ['C:\\\\Users\\alice\\.codex\\plugins'] }],
  }), 'utf8');

  const result = await createSupportBundle({
    dataRoot,
    appInfo: { version: '4.0.0', userToken: 'should-not-appear' },
    operationStatus: { operationId: 'operation-support-0001', state: 'failed', path: 'C:\\\\Users\\alice' },
    engineSnapshot: { version: '4.0.0', verifiedFiles: 9 },
  });
  assert.equal(result.redacted, true);
  assert.ok(result.bytes <= MAX_BUNDLE_BYTES);
  const output = await fs.readFile(result.path, 'utf8');
  assert.doesNotMatch(output, /alice|abc123|alice@example\.com|auth\.json|should-not-appear/i);
  assert.match(output, /<redacted|<path>|redacted-field/);
  assert.match(output, /"schemaVersion": 1/);
});

test('support bundle helpers redact secrets and cap nested data', () => {
  assert.equal(redactString('Authorization: Bearer abc123 C:\\Users\\alice\\x'), 'Authorization: Bearer <redacted> <path>');
  assert.equal(sanitize({ password: 'secret', path: 'C:\\Users\\alice\\x' }).password, '<redacted-field>');
  assert.equal(sanitize({ path: 'C:\\Users\\alice\\x' }).path, '<redacted-path>');
});
