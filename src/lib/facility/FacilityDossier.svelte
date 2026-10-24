<script lang="ts">
	import { lang } from '$lib/i18n';
	import { CHAMBERS, CAREER, CONTACT, type ChamberId } from './chambers';
	import FacilityIcon from './FacilityIcon.svelte';

	let { chamberId, selected, onSelect, onClose }: { chamberId: ChamberId; selected: number; onSelect: (detail: number) => void; onClose: () => void } = $props();
	const chamber = $derived(CHAMBERS[chamberId]);
	const detail = $derived(chamber.details[selected] ?? chamber.details[0]);
</script>

<div class="dossier">
	<header class="dossier-header">
		<div><span class="kicker">{$lang === 'ms' ? 'CATATAN LAPANGAN' : 'FIELD NOTES'} / {chamber.code}</span><h2 id="dossier-title">{chamber.name[$lang]}</h2></div>
		<button type="button" class="close" onclick={onClose} aria-label={$lang === 'ms' ? 'Tutup catatan' : 'Close field notes'}><FacilityIcon name="close" size={20} /></button>
	</header>
	<p class="context">{chamber.summary[$lang]}</p>
	<div class="detail-layout">
		<div class="detail-choices" role="group" aria-label={$lang === 'ms' ? 'Pilih topik' : 'Choose a topic'}>
			{#each chamber.details as entry, i}
				<button type="button" class:chosen={selected === i} aria-pressed={selected === i} data-testid="detail-option" onclick={() => onSelect(i)}><span>0{i + 1}</span><span>{entry.title[$lang]}<small>{entry.technology}</small></span><span aria-hidden="true">↗</span></button>
			{/each}
		</div>
		<article class="detail-body">
			<span class="technology">{detail.technology}</span>
			<h3>{detail.title[$lang]}</h3>
			<p>{detail.body[$lang]}</p>
			{#if chamberId === 4}<p class="disclaimer">{$lang === 'ms' ? 'Visual 3D ini ialah ilustrasi penerangan. Ia tidak menjalankan OpenCV, SIFT, OCR atau inferens AI di dalam pelayar, dan tidak menggunakan kamera anda.' : 'The 3D scene is an explanatory illustration. It does not run OpenCV, SIFT, OCR or AI inference in your browser, and does not use your camera.'}</p>{/if}
			{#if chamberId === 2}<p class="disclaimer">{$lang === 'ms' ? 'Lapisan ini mengelompokkan teknologi yang disenaraikan untuk penerangan, bukan menunjukkan topologi deployment sebenar atau data organisasi.' : 'These layers group documented technologies for explanation; they are not an actual deployment topology or organisational data.'}</p>{/if}
			{#if chamberId === 1}<p class="disclaimer">{$lang === 'ms' ? 'CCNAv7 merujuk kepada pembelajaran melalui Cisco Networking Academy, bukan dakwaan pensijilan profesional CCNA.' : 'CCNAv7 refers to Cisco Networking Academy coursework, not a claim of professional CCNA certification.'}</p>{/if}
		</article>
	</div>
	{#if chamberId === 0 || chamberId === 5}
		<section class="career" aria-labelledby="career-title"><h3 id="career-title">{$lang === 'ms' ? 'Jejak pengalaman' : 'Experience trail'}</h3>
			<ol>{#each CAREER as role}<li><span class="period">{role.period}</span><div><h4>{role.organisation}</h4><span class="role">{role.role[$lang]}</span><p>{role.summary[$lang]}</p></div></li>{/each}</ol>
		</section>
	{/if}
	{#if chamberId === 5}
		<div class="channels"><a href={`mailto:${CONTACT.email}`}><FacilityIcon name="mail" />{CONTACT.email}</a><a href={CONTACT.github} target="_blank" rel="noopener noreferrer">GitHub<FacilityIcon name="external" /></a><a href={CONTACT.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn<FacilityIcon name="external" /></a><a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp<FacilityIcon name="external" /></a></div>
	{/if}
	<footer>{$lang === 'ms' ? 'Ruang maya. Pengalaman dan projek sebenar.' : 'Imagined spaces. Real work and projects.'}</footer>
</div>

<style>
	.dossier { padding: clamp(20px, 4vw, 40px); }
	.dossier-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; }
	.kicker { font: 9px var(--f-mono); letter-spacing: 0.1em; color: var(--f-accent); }
	h2 { color: var(--f-ink); font-size: clamp(26px, 4vw, 36px); line-height: 1.15; margin-top: 12px; }
	.close { min-width: 44px; min-height: 44px; display: grid; place-items: center; border: 1px solid var(--f-line); border-radius: 50%; }
	.close:hover { background: var(--f-hover); }
	.context { margin-top: 20px; color: var(--f-muted); font-size: 13px; line-height: 1.8; max-width: 68ch; }
	.detail-layout { display: grid; grid-template-columns: minmax(190px, 0.8fr) minmax(0, 1.2fr); border-block: 1px solid var(--f-line); margin-top: 28px; }
	.detail-choices { border-right: 1px solid var(--f-line); padding-block: 12px; }
	.detail-choices button { width: 100%; display: flex; align-items: center; gap: 12px; padding: 16px; text-align: left; border-left: 2px solid transparent; font-size: 12px; min-height: 64px; }
	.detail-choices button:hover { background: var(--f-hover); }
	.detail-choices button.chosen { background: var(--f-active); border-left-color: var(--f-accent); }
	.detail-choices button > span:first-child { color: var(--f-muted); font: 10px var(--f-mono); font-variant-numeric: tabular-nums; }
	.detail-choices button > span:last-child { margin-left: auto; color: var(--f-accent); }
	small { color: var(--f-muted); font: 9px/1.7 var(--f-mono); display: block; margin-top: 4px; }
	.detail-body { padding: 28px; }
	.technology { font: 10px var(--f-mono); color: var(--f-accent); }
	h3 { color: var(--f-ink); font-size: 21px; line-height: 1.3; margin-block: 12px; }
	.detail-body p { font-size: 13px; color: var(--f-muted); line-height: 1.9; }
	.detail-body .disclaimer { font-size: 11px; margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--f-line); }
	.career { margin-top: 32px; }
	.career > h3 { font-size: 18px; }
	ol { list-style: none; padding: 0; }
	li { display: grid; grid-template-columns: 140px 1fr; gap: 24px; padding-block: 20px; border-bottom: 1px solid var(--f-line); }
	.period { color: var(--f-accent); font: 10px/1.8 var(--f-mono); font-variant-numeric: tabular-nums; }
	h4 { font-size: 14px; letter-spacing: 0; color: var(--f-ink); }
	.role { font-size: 11px; color: var(--f-muted); }
	li p { font-size: 12px; line-height: 1.8; color: var(--f-muted); margin-top: 8px; }
	.channels { display: flex; flex-wrap: wrap; gap: 12px 20px; margin-top: 24px; }
	.channels a { display: inline-flex; align-items: center; gap: 8px; min-height: 44px; font-size: 12px; overflow-wrap: anywhere; }
	.channels a:hover { color: var(--f-accent); }
	footer { color: var(--f-muted); font: 9px/1.6 var(--f-mono); padding-top: 24px; }
	@media (max-width: 600px) { .detail-layout { grid-template-columns: 1fr; } .detail-choices { border-right: 0; border-bottom: 1px solid var(--f-line); } .detail-choices button { min-height: 60px; padding: 12px; } .detail-body { padding: 20px 0; } li { grid-template-columns: 1fr; gap: 8px; } .dossier-header { gap: 12px; } }
</style>
