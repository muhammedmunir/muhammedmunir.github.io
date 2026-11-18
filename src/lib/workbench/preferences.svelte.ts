export type ThemeMode = 'light' | 'dark';
export type LocaleMode = 'ms' | 'en';

let currentTheme = $state<ThemeMode>('dark');
let currentLocale = $state<LocaleMode>('ms');
let initialized = false;

function applyThemeToDom(theme: ThemeMode) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.style.colorScheme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute('content', theme === 'dark' ? '#0a0f1a' : '#eceff3');
  }
}

function applyLocaleToDom(locale: LocaleMode) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('lang', locale);
}

export function initPreferences() {
  if (typeof window === 'undefined' || initialized) return;
  initialized = true;

  try {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
      currentTheme = savedTheme;
    } else {
      const domTheme = document.documentElement.getAttribute('data-theme');
      if (domTheme === 'dark' || domTheme === 'light') {
        currentTheme = domTheme;
      }
    }
  } catch {
    // Abaikan jika localStorage disekat
  }

  try {
    const savedLocale = localStorage.getItem('locale');
    if (savedLocale === 'ms' || savedLocale === 'en') {
      currentLocale = savedLocale;
    }
  } catch {
    // Abaikan jika localStorage disekat
  }

  applyThemeToDom(currentTheme);
  applyLocaleToDom(currentLocale);
}

export function getTheme(): ThemeMode {
  return currentTheme;
}

export function setTheme(theme: ThemeMode) {
  currentTheme = theme;
  applyThemeToDom(theme);
  try {
    localStorage.setItem('theme', theme);
  } catch {
    // Abaikan jika localStorage disekat
  }
}

export function toggleTheme(): ThemeMode {
  const next: ThemeMode = currentTheme === 'dark' ? 'light' : 'dark';
  setTheme(next);
  return next;
}

export function getLocale(): LocaleMode {
  return currentLocale;
}

export function setLocale(locale: LocaleMode) {
  currentLocale = locale;
  applyLocaleToDom(locale);
  try {
    localStorage.setItem('locale', locale);
  } catch {
    // Abaikan jika localStorage disekat
  }
}

export function toggleLocale(): LocaleMode {
  const next: LocaleMode = currentLocale === 'ms' ? 'en' : 'ms';
  setLocale(next);
  return next;
}
