<script lang="ts">
	let { name, size = 18 }: { name: string; size?: number } = $props();
</script>

<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
	{#if name === 'next'}<path d="m9 5 7 7-7 7M4 12h12" />
	{:else if name === 'previous'}<path d="m15 5-7 7 7 7M8 12h12" />
	{:else if name === 'sun'}<circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
	{:else if name === 'moon'}<path d="M20.5 14A8.5 8.5 0 0 1 10 3.5 8.5 8.5 0 1 0 20.5 14Z" />
	{:else if name === 'pause'}<path d="M8 5v14M16 5v14" />
	{:else if name === 'play'}<path d="m8 4 12 8-12 8Z" />
	{:else if name === 'sound'}<path d="m10 5-5 4H2v6h3l5 4ZM14 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14" />
	{:else if name === 'muted'}<path d="m10 5-5 4H2v6h3l5 4ZM16 9l6 6m0-6-6 6" />
	{:else if name === 'close'}<path d="m6 6 12 12M6 18 18 6" />
	{:else if name === 'book'}<path d="M12 5v15M3 4l9 2 9-2v15l-9 2-9-2Z" />
	{:else if name === 'cube'}<path d="m12 2 9 5v10l-9 5-9-5V7Zm0 10L3 7m9 5 9-5m-9 5v10" />
	{:else if name === 'mail'}<rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 6 9 7 9-7" />
	{:else if name === 'external'}<path d="M14 3h7v7m0-7L10 14M10 4H4v16h16v-6" />
	{:else if name === 'check'}<path d="m5 12 4 4L19 6" />
	{:else if name === 'copy'}<rect x="8" y="8" width="12" height="13" rx="2" /><path d="M15 8V3H3v13h5" />
	{:else}<circle cx="12" cy="12" r="9" /><path d="M12 11v6m0-10v.1" />{/if}
</svg>

<style>
	svg { display: inline-block; flex-shrink: 0; vertical-align: middle; max-width: 100%; }
</style>
