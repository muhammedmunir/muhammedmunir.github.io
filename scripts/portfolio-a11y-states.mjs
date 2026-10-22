// scripts/portfolio-a11y-states.mjs
// a11y-loop interaction states for the six-chapter /spatial portfolio.
//
// Run as a module (imported by a11y-loop):
//   node <a11y-loop>/src/cli.js audit http://127.0.0.1:4189/ \
//     --interact scripts/portfolio-a11y-states.mjs --json --out <report>
//
// Run as a script (resolves a11y-loop itself, audits all states, prints raw findings):
//   node scripts/portfolio-a11y-states.mjs
//
// Env: PORTFOLIO_URL (default http://127.0.0.1:4189/),
//      A11Y_LOOP_CLI (default cached npx a11y-loop cli.js)

import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const BASE_URL = (process.env.PORTFOLIO_URL || 'http://127.0.0.1:4189/').replace(/\/*$/, '/');
const DEFAULT_CLI =
	'C:/Users/KELUARGA AZMI/AppData/Local/npm-cache/_npx/f70ed744217c9448/node_modules/a11y-loop/src/cli.js';

async function waitReady(page) {
	await page.waitForSelector('.spatial[data-ready="true"]', { timeout: 20000 });
}

async function settleIntro(page) {
	await waitReady(page);
	await page.waitForFunction(
		() =>
			document.querySelector('.spatial')?.dataset.renderer === 'static-svg' ||
			window.__spatialDiagnostic?.intro === false,
		null,
		{
			timeout: 20000
		}
	);
}

async function goToChapter(page, chapter) {
	await settleIntro(page);
	await page.locator(`.chapter-nav button[data-chapter="${chapter}"]`).click();
	await page.waitForFunction(
		(expected) => document.querySelector('.spatial')?.dataset.chapter === expected,
		chapter,
		{ timeout: 10000 }
	);
	// Let the camera settle so contrast/motion checks see the final frame.
	await page.waitForTimeout(900);
}

async function openProjectDialog(page, chapter) {
	await goToChapter(page, chapter);
	await page.locator('.synopsis .primary').click();
	await page.waitForSelector('dialog.reader[open]');
	await page.waitForFunction(() => document.activeElement?.id === 'spatial-dialog-title');
}

async function ensureLang(page, target) {
	await waitReady(page);
	if ((await page.locator('html').getAttribute('lang')) !== target) {
		await page.locator('.header-actions button').first().click();
		await page.waitForFunction((expected) => document.documentElement.lang === expected, target, {
			timeout: 5000
		});
	}
}

export const states = {
	// All six chapters, default BM.
	'chapter-01-intro': async (page) => {
		await ensureLang(page, 'ms');
		await settleIntro(page);
	},
	'chapter-02-emesys': async (page) => {
		await ensureLang(page, 'ms');
		await goToChapter(page, 'emesys');
	},
	'chapter-03-onboardx': async (page) => {
		await ensureLang(page, 'ms');
		await goToChapter(page, 'onboardx');
	},
	'chapter-04-cv-bot': async (page) => {
		await ensureLang(page, 'ms');
		await goToChapter(page, 'cv_bot');
	},
	'chapter-05-background': async (page) => {
		await ensureLang(page, 'ms');
		await goToChapter(page, 'background');
	},
	'chapter-06-contact': async (page) => {
		await ensureLang(page, 'ms');
		await goToChapter(page, 'contact');
	},

	// English copy path.
	'language-en-background': async (page) => {
		await ensureLang(page, 'en');
		await goToChapter(page, 'background');
	},

	// Native dialogs.
	'dialog-project-emesys': async (page) => {
		await ensureLang(page, 'ms');
		await openProjectDialog(page, 'emesys');
	},
	'dialog-about': async (page) => {
		await ensureLang(page, 'ms');
		await goToChapter(page, 'background');
		await page.locator('.synopsis .primary').click();
		await page.waitForSelector('dialog.reader[open] .about-reader');
	},
	'dialog-contact': async (page) => {
		await ensureLang(page, 'ms');
		await page.locator('.header-actions .contact-action').click();
		await page.waitForSelector('dialog.reader[open] #contact-form');
	},
	'dialog-contact-error': async (page) => {
		await ensureLang(page, 'ms');
		await page.locator('.header-actions .contact-action').click();
		await page.waitForSelector('dialog.reader[open] #contact-form');
		await page.fill('#contact-name', '   ');
		await page.fill('#contact-email', 'qa@example.com');
		await page.fill('#contact-message', '   ');
		await page.locator('#contact-form button[type="submit"]').click();
		await page.waitForSelector('dialog.reader [role="alert"] p.error');
	},

	// Motion states.
	'paused-emesys': async (page) => {
		await ensureLang(page, 'ms');
		await goToChapter(page, 'emesys');
		const pause = page.locator('.playback button').first();
		if ((await pause.getAttribute('aria-pressed')) !== 'true') await pause.click();
		await page.waitForFunction(() => document.querySelector('.spatial')?.dataset.paused === 'true');
	},
	'reduced-background': async (page) => {
		await ensureLang(page, 'ms');
		await page.emulateMedia({ reducedMotion: 'reduce' });
		await page.waitForFunction(
			() => document.querySelector('.spatial')?.dataset.reducedMotion === 'true',
			null,
			{ timeout: 10000 }
		);
		await goToChapter(page, 'background');
	},
	'fallback-context-lost': async (page) => {
		await ensureLang(page, 'ms');
		await settleIntro(page);
		await page.evaluate(() => {
			const canvas = document.querySelector('.world canvas');
			const gl = canvas?.getContext('webgl2') || canvas?.getContext('webgl');
			gl?.getExtension('WEBGL_lose_context')?.loseContext();
		});
		await page.waitForSelector('.spatial[data-renderer="static-svg"]', { timeout: 10000 });
	}
};

// ---------------------------------------------------------------- runner

function resolveCli() {
	const candidates = [
		process.env.A11Y_LOOP_CLI,
		DEFAULT_CLI,
		join(process.cwd(), 'node_modules/a11y-loop/src/cli.js')
	].filter(Boolean);
	return candidates.find((candidate) => existsSync(candidate));
}

async function waitForHttp(url, timeoutMs = 60000) {
	const deadline = Date.now() + timeoutMs;
	let last = 'no attempt';
	while (Date.now() < deadline) {
		try {
			const response = await fetch(url, { signal: AbortSignal.timeout(3000) });
			if (response.ok) return;
			last = `HTTP ${response.status}`;
		} catch (error) {
			last = error.message;
		}
		await new Promise((resolve) => setTimeout(resolve, 500));
	}
	throw new Error(
		`Preview not reachable at ${url} within ${timeoutMs}ms (last: ${last}).\n` +
			`Repro: start a preview on 4189, then rerun "node scripts/portfolio-a11y-states.mjs".`
	);
}

function printFindings(label, findings) {
	console.log(`\n${label}: ${findings.length}`);
	for (const finding of findings) {
		const targets = (finding.nodes || finding.targets || [])
			.map((node) => (typeof node === 'string' ? node : node.target || node.html || ''))
			.filter(Boolean);
		console.log(
			`  - [${finding.impact || finding.level || 'n/a'}] ${finding.id || finding.rule || finding.fingerprint || 'finding'} :: ${
				finding.help || finding.message || finding.description || ''
			}`
		);
		if (targets.length > 0) console.log(`    targets: ${targets.slice(0, 6).join(' | ')}`);
		if (finding.wcag) console.log(`    wcag: ${JSON.stringify(finding.wcag)}`);
	}
}

async function run() {
	const cli = resolveCli();
	if (!cli) {
		console.error(
			'BLOCKED: a11y-loop CLI not found. Set A11Y_LOOP_CLI to a11y-loop/src/cli.js (no install attempted).'
		);
		process.exit(2);
	}
	await waitForHttp(BASE_URL);
	const outDir = mkdtempSync(join(tmpdir(), 'portfolio-a11y-'));
	const out = join(outDir, 'report.json');
	console.log(`a11y-loop: ${cli}\nTarget: ${BASE_URL}\nReport: ${out}\n`);

	const result = spawnSync(
		process.execPath,
		[
			cli,
			'audit',
			BASE_URL,
			'--interact',
			pathToFileURL(process.argv[1]).href,
			'--json',
			'--out',
			out
		],
		{ stdio: 'inherit', env: process.env }
	);
	if (!existsSync(out)) {
		console.error(`a11y-loop produced no report (exit ${result.status}).`);
		process.exit(result.status || 2);
	}
	const report = JSON.parse(readFileSync(out, 'utf8'));
	const findings = report.findings || report;
	printFindings('violations (raw)', findings.violations || []);
	printFindings('needsReview (raw, automation cannot judge)', findings.needsReview || []);
	printFindings('bestPractice (raw)', findings.bestPractice || []);
	if (Array.isArray(report.manualChecklist)) {
		console.log(`\nmanualChecklist: ${report.manualChecklist.length}`);
		for (const item of report.manualChecklist) {
			console.log(`  - ${item.sc ? `${item.sc} ` : ''}${item.title || item.text || item}`);
		}
	}
	console.log(`\nsummary: ${JSON.stringify(report.summary || {}, null, 2)}`);
	console.log(`\nRaw report: ${out}`);
	process.exit(result.status ?? 0);
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
	await run();
}
