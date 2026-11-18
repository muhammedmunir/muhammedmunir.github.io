import { resolve, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { access } from 'node:fs/promises';

// Gunakan enjin audit asal; hanya tambah kemajuan dan had masa.
const cliPath = process.argv[2];
if (!cliPath) {
  console.error('Usage: node scripts/item2-a11y-runner.mjs <a11y-loop/src/cli.js>');
  process.exit(2);
}
const sourceDirectory = dirname(resolve(cliPath));
const output = 'item2-a11y-verification.json';
try {
  await access(output);
  console.error(`${output} already exists; preserve it before another run.`);
  process.exit(2);
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
const { buildAuditReport, writeOutputFile } = await import(
  pathToFileURL(resolve(sourceDirectory, 'commands/audit.js')).href
);
const { serializeReport } = await import(
  pathToFileURL(resolve(sourceDirectory, 'lib/format/json.js')).href
);
const { ToolError } = await import(
  pathToFileURL(resolve(sourceDirectory, 'lib/axe-runner.js')).href
);
const { main } = await import(pathToFileURL(resolve(cliPath)).href);
const controller = new AbortController();
const started = Date.now();
const elapsed = () => `${Math.round((Date.now() - started) / 1000)}s`;
const timer = setTimeout(() => {
  controller.abort(new ToolError('Audit exceeded its 30-minute execution budget.'));
}, 30 * 60 * 1000);
try {
  console.log('Audit bermula: lima pass, hero-english, hero-console; tiada peraturan disekat.');
  const report = await buildAuditReport({
    target: { type: 'url', value: 'http://127.0.0.1:4176/' },
    flags: { interact: 'scripts/item2-a11y-states.mjs', bestPractice: true, headed: false },
    signal: controller.signal,
    onProgress: ({ kind, name, done, total }) => {
      console.log(`[${elapsed()}] ${done}/${total} ${kind}: ${name}`);
    }
  });
  await writeOutputFile(output, serializeReport(report));
  console.log(`[${elapsed()}] ${JSON.stringify(report.summary)}`);
  const diffExit = await main(['diff', '--before', 'item2-a11y-final.json', '--after', output]);
  process.exitCode = report.summary.violations > 0 ? 1 : diffExit;
} catch (error) {
  console.error(`[${elapsed()}] ${error.stack ?? error}`);
  process.exitCode = 2;
} finally {
  clearTimeout(timer);
}
