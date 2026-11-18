<script lang="ts">
	import './layout.css';
	import { onMount, type Snippet } from 'svelte';
	import { initPreferences } from '$lib/workbench/preferences.svelte';
	onMount(initPreferences);
	let { children }: { children: Snippet } = $props();
</script>

{@render children()}
