import { resolve, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { access } from 'node:fs/promises';

const [cliPath, output, before] = process.argv.slice(2);
if (!cliPath || !output) {
  console.error('Usage: node scripts/item3-a11y-runner.mjs <cli.js> <output.json> [before.json]');
  process.exit(2);
}
try {
  await access(output);
  console.error(`${output} already exists; preserve existing evidence.`);
  process.exit(2);
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
const source = dirname(resolve(cliPath));
const load = file => import(pathToFileURL(resolve(source, file)).href);
const { buildAuditReport, writeOutputFile } = await load('commands/audit.js');
const { serializeReport } = await load('lib/format/json.js');
const { ToolError } = await load('lib/axe-runner.js');
const controller = new AbortController();
const started = Date.now();
const elapsed = () => `${Math.round((Date.now() - started) / 1000)}s`;
const timer = setTimeout(() => controller.abort(new ToolError('Audit exceeded its 45-minute execution budget.')), 45 * 60 * 1000);
try {
  console.log('Item 3: lima pass dan lima keadaan interaksi; tiada peraturan disekat.');
  const report = await buildAuditReport({
    target: { type: 'url', value: 'http://127.0.0.1:4176/' },
    flags: { interact: 'scripts/item3-a11y-states.mjs', bestPractice: true, headed: false },
    signal: controller.signal,
    onProgress: ({ kind, name, done, total }) => console.log(`[${elapsed()}] ${done}/${total} ${kind}: ${name}`)
  });
  await writeOutputFile(output, serializeReport(report));
  console.log(`[${elapsed()}] ${JSON.stringify(report.summary)}`);
  if (before) {
    const { main } = await load('cli.js');
    process.exitCode = await main(['diff', '--before', before, '--after', output]);
  }
  if (report.summary.violations > 0) process.exitCode = 1;
} catch (error) {
  console.error(`[${elapsed()}] ${error.stack ?? error}`);
  process.exitCode = 2;
} finally {
  clearTimeout(timer);
}
