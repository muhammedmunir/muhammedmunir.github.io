<script lang="ts">
	import type { Locale } from './spine-data';
	import {
		parseIntentText,
		fiberAttenuation,
		evaluateRlsGate,
		RLS_ROLES,
		type IntentParseResult,
		type FiberAttenuationResult,
		type RlsRole,
		type RlsGateResult
	} from './cyber-bench';

	export type BenchTool = 'tindak' | 'fiber' | 'sutera';

	interface Props {
		tool: BenchTool | null;
		locale: Locale;
		onFiberBrightness: (brightness: number) => void;
		onTindakParse: (channel: 'url' | 'phone' | 'payment') => void;
		onSuteraGate: (allowed: boolean) => void;
	}

	let { tool, locale, onFiberBrightness, onTindakParse, onSuteraGate }: Props = $props();

	// ---- Alat 1: TINDAK Share-Intent Parser ----
	let tindakText = $state('');

	const tindakResult = $derived<IntentParseResult>(parseIntentText(tindakText));

	function channelLabel(channel: 'url' | 'phone' | 'payment'): string {
		if (locale === 'ms') {
			return channel === 'url' ? 'URL' : channel === 'phone' ? 'Telefon' : 'Bayaran';
		}
		return channel === 'url' ? 'URL' : channel === 'phone' ? 'Phone' : 'Payment';
	}

	function onTindakInput() {
		const first = tindakResult.extractions[0]?.channel;
		if (first) onTindakParse(first);
	}

	// ---- Alat 2: Fiber-Optic Attenuation Lab ----
	let fiberKm = $state(40);
	let fiberWavelength = $state<1310 | 1550>(1550);
	let fiberSplices = $state(4);

	const fiberResult = $derived<FiberAttenuationResult>(
		fiberAttenuation({
			distanceKm: fiberKm,
			wavelengthNm: fiberWavelength,
			splices: fiberSplices
		})
	);

	$effect(() => {
		if (tool === 'fiber') onFiberBrightness(fiberResult.brightness);
	});

	// ---- Alat 3: Supabase RLS JWT Packet Gate ----
	let gateRole = $state<RlsRole>('anon');
	let gateOperation = $state<'select' | 'insert' | 'update' | 'delete'>('select');
	let gateRowOwner = $state('borrower-42');
	let gateJwtSub = $state('anon-visitor');

	let gateResult = $state<RlsGateResult | null>(null);

	function runGate() {
		gateResult = evaluateRlsGate({
			table: 'loan_applications',
			operation: gateOperation,
			role: gateRole,
			rowOwnerId: gateRowOwner,
			jwtSub: gateJwtSub
		});
		onSuteraGate(gateResult.allowed);
	}

	function roleLabel(role: RlsRole): string {
		return role;
	}
</script>

{#if tool}
	<section
		class="cyber-bench"
		aria-label={locale === 'ms' ? 'Meja uji kejuruteraan' : 'Engineering workbench'}
	>
		<header class="bench-bar">
			<span class="bench-code"
				>{tool === 'tindak' ? 'TINDAK·CI' : tool === 'fiber' ? 'TNB·FIBER' : 'IWA001·RLS'}</span
			>
			<span class="bench-live">
				{locale === 'ms' ? 'local-first · 0 data keluar' : 'local-first · 0 data egress'}
			</span>
		</header>

		{#if tool === 'tindak'}
			<h2 class="bench-title">
				{locale === 'ms' ? 'Live Share-Intent Parser' : 'Live Share-Intent Parser'}
			</h2>
			<p class="bench-hint">
				{locale === 'ms'
					? 'Tampal teks bercampur URL, telefon atau amaun RM — cip tindakan diekstrak di sini.'
					: 'Paste mixed text with a URL, phone or RM amount — action chips extract locally.'}
			</p>
			<textarea
				class="bench-input"
				bind:value={tindakText}
				oninput={onTindakInput}
				rows="3"
				placeholder={locale === 'ms'
					? 'cth: Bayar RM 1,250 ke https://shop.my dan hubungi 013-563 6124'
					: 'e.g. Pay RM 1,250 to https://shop.my and call 013-563 6124'}
			></textarea>
			<div class="bench-chips">
				{#each tindakResult.extractions as ex (ex.channel + ex.raw)}
					<span class="bench-chip" data-channel={ex.channel}>
						<strong>{channelLabel(ex.channel)}</strong>
						{ex.normalized}
					</span>
				{/each}
				{#if tindakResult.extractions.length === 0 && tindakText.length > 0}
					<span class="bench-chip bench-chip-empty">
						{locale === 'ms' ? 'Tiada cip dikesan' : 'No chip detected'}
					</span>
				{/if}
			</div>
		{:else if tool === 'fiber'}
			<h2 class="bench-title">
				{locale === 'ms' ? 'Fiber-Optic Attenuation Lab' : 'Fiber-Optic Attenuation Lab'}
			</h2>
			<p class="bench-hint">
				{locale === 'ms'
					? 'Laras jarak, panjang gelombang dan sambungan — redaman dB dikira masa nyata.'
					: 'Adjust distance, wavelength and splices — dB loss computes live.'}
			</p>

			<label class="bench-field">
				<span>
					{locale === 'ms' ? 'Jarak' : 'Distance'} · {fiberKm} km
				</span>
				<input type="range" min="1" max="120" bind:value={fiberKm} />
			</label>

			<label class="bench-field">
				<span>{locale === 'ms' ? 'Panjang gelombang' : 'Wavelength'}</span>
				<select bind:value={fiberWavelength}>
					<option value={1310}>1310 nm</option>
					<option value={1550}>1550 nm</option>
				</select>
			</label>

			<label class="bench-field">
				<span>
					{locale === 'ms' ? 'Sambungan' : 'Splices'} · {fiberSplices}
				</span>
				<input type="range" min="0" max="60" bind:value={fiberSplices} />
			</label>

			<div class="bench-readout">
				<span class="readout-db">{fiberResult.totalLossDb.toFixed(2)} dB</span>
				<span class="readout-sub">
					{locale === 'ms'
						? `Gentian ${fiberResult.fiberLossDb.toFixed(2)} · Sambungan ${fiberResult.spliceLossDb.toFixed(2)}`
						: `Fiber ${fiberResult.fiberLossDb.toFixed(2)} · Splices ${fiberResult.spliceLossDb.toFixed(2)}`}
				</span>
				<span class="readout-bright" style:width={`${(fiberResult.brightness * 100).toFixed(0)}%`}
				></span>
			</div>
		{:else}
			<h2 class="bench-title">
				{locale === 'ms' ? 'Supabase RLS JWT Packet Gate' : 'Supabase RLS JWT Packet Gate'}
			</h2>
			<p class="bench-hint">
				{locale === 'ms'
					? 'Simulasi polisi RLS IWA001 — pilih peranan dan hantar query ujian.'
					: 'Simulate IWA001 RLS policy — pick a role and fire a test query.'}
			</p>

			<label class="bench-field">
				<span>{locale === 'ms' ? 'Peranan token' : 'Token role'}</span>
				<select bind:value={gateRole}>
					{#each RLS_ROLES as role (role)}
						<option value={role}>{roleLabel(role)}</option>
					{/each}
				</select>
			</label>

			<label class="bench-field">
				<span>{locale === 'ms' ? 'Operasi' : 'Operation'}</span>
				<select bind:value={gateOperation}>
					<option value="select">select</option>
					<option value="insert">insert</option>
					<option value="update">update</option>
					<option value="delete">delete</option>
				</select>
			</label>

			<div class="bench-field bench-jwt">
				<span class="field-label">rowOwnerId</span>
				<input bind:value={gateRowOwner} />
				<span class="field-label">jwt.sub</span>
				<input bind:value={gateJwtSub} />
			</div>

			<button type="button" class="bench-run" onclick={runGate}>
				{locale === 'ms' ? 'Hantar Query' : 'Send Query'}
			</button>

			{#if gateResult}
				<div
					class="bench-verdict"
					class:verdict-pass={gateResult.allowed}
					class:verdict-block={!gateResult.allowed}
				>
					<strong
						>{gateResult.allowed
							? locale === 'ms'
								? 'LULUS'
								: 'PASS'
							: locale === 'ms'
								? 'TANGKIS'
								: 'BLOCK'}</strong
					>
					<span>{gateResult.reason}</span>
				</div>
			{/if}
		{/if}
	</section>
{/if}

<style>
	.cyber-bench {
		position: fixed;
		top: 6.75rem;
		left: 1.15rem;
		width: min(22rem, calc(100% - 2.3rem));
		max-height: calc(100vh - 9rem);
		overflow-y: auto;
		scrollbar-width: thin;
		padding: 0.9rem 1.05rem;
		border-radius: var(--radius-xl, 20px);
		background-color: var(--spatial-hud-bg, var(--surface));
		background-image: var(--glass-sheen);
		color: var(--spatial-hud-ink, var(--ink));
		border: 1px solid var(--spatial-hud-border, var(--surface-border));
		-webkit-backdrop-filter: var(--glass-filter);
		backdrop-filter: var(--glass-filter);
		box-shadow: var(--shadow-glass);
		z-index: 26;
	}

	.bench-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		margin-bottom: 0.35rem;
	}

	.bench-code {
		font-family: var(--font-mono, monospace);
		font-size: 0.68rem;
		letter-spacing: 0.08em;
		color: var(--spatial-accent, var(--accent));
	}

	.bench-live {
		font-family: var(--font-mono, monospace);
		font-size: 0.62rem;
		letter-spacing: 0.04em;
		color: var(--spatial-hud-muted, var(--ink-secondary));
	}

	.bench-title {
		margin: 0.1rem 0 0.2rem;
		font-size: 0.98rem;
		font-weight: 700;
		line-height: 1.25;
	}

	.bench-hint {
		margin: 0 0 0.6rem;
		font-size: 0.76rem;
		line-height: 1.45;
		color: var(--spatial-hud-muted, var(--ink-secondary));
	}

	.bench-input {
		width: 100%;
		box-sizing: border-box;
		resize: vertical;
		min-height: 4.5rem;
		padding: 0.5rem 0.65rem;
		border-radius: var(--radius-md, 10px);
		border: 1px solid var(--spatial-pill-border, var(--surface-border));
		background: rgba(255, 255, 255, 0.08);
		color: var(--spatial-hud-ink, var(--ink));
		font-size: 0.8rem;
		line-height: 1.45;
	}

	:root[data-theme='light'] .bench-input {
		background: rgba(20, 24, 32, 0.05);
	}

	.bench-input:focus-visible {
		outline: 2px solid var(--spatial-accent, var(--accent));
		outline-offset: 2px;
	}

	.bench-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		margin-top: 0.55rem;
	}

	.bench-chip {
		font-family: var(--font-mono, monospace);
		font-size: 0.7rem;
		padding: 0.22rem 0.58rem;
		border-radius: var(--radius-xs, 6px);
		background: rgba(255, 255, 255, 0.07);
		border: 1px solid rgba(255, 255, 255, 0.14);
	}

	:root[data-theme='light'] .bench-chip {
		background: rgba(20, 24, 32, 0.05);
		border: 1px solid rgba(20, 24, 32, 0.1);
	}

	.bench-chip[data-channel='url'] strong {
		color: #38bdf8;
	}
	.bench-chip[data-channel='phone'] strong {
		color: #2dd4bf;
	}
	.bench-chip[data-channel='payment'] strong {
		color: #fbbf24;
	}

	.bench-chip-empty {
		opacity: 0.7;
		border-style: dashed;
	}

	.bench-field {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		margin-top: 0.55rem;
		font-size: 0.76rem;
	}

	.bench-field input[type='range'] {
		accent-color: var(--spatial-accent, var(--accent));
	}

	.bench-field select,
	.bench-field input:not([type='range']) {
		padding: 0.4rem 0.55rem;
		border-radius: var(--radius-sm, 8px);
		border: 1px solid var(--spatial-pill-border, var(--surface-border));
		background: rgba(255, 255, 255, 0.08);
		color: var(--spatial-hud-ink, var(--ink));
		font-size: 0.78rem;
	}

	:root[data-theme='light'] .bench-field select,
	:root[data-theme='light'] .bench-field input:not([type='range']) {
		background: rgba(20, 24, 32, 0.05);
	}

	.bench-jwt {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 0.35rem 0.5rem;
		align-items: center;
	}

	.bench-jwt .field-label {
		font-family: var(--font-mono, monospace);
		font-size: 0.66rem;
		color: var(--spatial-hud-muted, var(--ink-secondary));
	}

	.bench-readout {
		margin-top: 0.7rem;
		padding: 0.6rem 0.7rem;
		border-radius: var(--radius-md, 10px);
		background: rgba(255, 255, 255, 0.06);
		border: 1px solid rgba(255, 255, 255, 0.1);
		position: relative;
		overflow: hidden;
	}

	:root[data-theme='light'] .bench-readout {
		background: rgba(20, 24, 32, 0.05);
	}

	.readout-db {
		display: block;
		font-family: var(--font-mono, monospace);
		font-size: 1.3rem;
		font-weight: 700;
		color: var(--spatial-accent, var(--accent));
	}

	.readout-sub {
		display: block;
		margin-top: 0.15rem;
		font-size: 0.7rem;
		color: var(--spatial-hud-muted, var(--ink-secondary));
	}

	.readout-bright {
		display: block;
		height: 3px;
		margin-top: 0.4rem;
		background: var(--spatial-accent, var(--accent));
		border-radius: 9999px;
	}

	.bench-run {
		margin-top: 0.7rem;
		width: 100%;
		min-height: var(--size-touch, 40px);
		border-radius: var(--radius-pill, 9999px);
		border: 1px solid transparent;
		background: var(--spatial-accent, var(--accent));
		color: var(--on-accent);
		font-weight: 700;
		font-size: 0.8rem;
		cursor: pointer;
	}

	.bench-run:hover {
		filter: brightness(1.08);
	}

	.bench-verdict {
		margin-top: 0.6rem;
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		padding: 0.55rem 0.7rem;
		border-radius: var(--radius-md, 10px);
		font-size: 0.76rem;
	}

	.bench-verdict strong {
		font-family: var(--font-mono, monospace);
		font-size: 0.82rem;
		letter-spacing: 0.06em;
	}

	.verdict-pass {
		background: rgba(34, 197, 94, 0.14);
		border: 1px solid rgba(34, 197, 94, 0.45);
		color: #22c55e;
	}

	.verdict-block {
		background: rgba(239, 68, 68, 0.14);
		border: 1px solid rgba(239, 68, 68, 0.45);
		color: #ef4444;
	}

	@media (max-width: 768px) {
		.cyber-bench {
			top: auto;
			left: 0.6rem;
			right: 0.6rem;
			bottom: calc(max(0.6rem, env(safe-area-inset-bottom)) + 4.6rem);
			width: auto;
			max-height: 42vh;
		}
	}
</style>
