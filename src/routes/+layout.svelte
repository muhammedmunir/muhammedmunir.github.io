<script lang="ts">
	import './layout.css';
	import { onMount, type Snippet } from 'svelte';
	import { initPreferences } from '$lib/workbench/preferences.svelte';
	onMount(() => {
		initPreferences();
		// Aplikasi berjaya dimuat: benarkan muat semula automatik sekali lagi selepas deploy akan datang (lihat app.html).
		try {
			sessionStorage.removeItem('chunk-reload');
		} catch {
			// Abaikan jika storan disekat
		}
	});
	let { children }: { children: Snippet } = $props();
</script>

{@render children()}
