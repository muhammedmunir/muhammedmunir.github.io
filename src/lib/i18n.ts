import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Lang = 'ms' | 'en';

// Validate saved lang — must be 'ms' or 'en', otherwise default to 'ms'
function getSavedLang(): Lang {
  if (!browser) return 'ms';
  const saved = localStorage.getItem('lang');
  return saved === 'ms' || saved === 'en' ? saved : 'ms';
}

export const lang = writable<Lang>(getSavedLang());

// Persist to localStorage
lang.subscribe((val) => {
  if (browser) localStorage.setItem('lang', val);
});

export function toggleLang() {
  lang.update((l) => (l === 'ms' ? 'en' : 'ms'));
}
