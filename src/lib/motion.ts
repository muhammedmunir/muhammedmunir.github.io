import { writable } from 'svelte/store';

// Shared user preference. Components must also honour live prefers-reduced-motion changes.
export const motionPaused = writable(false);
