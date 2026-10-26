/**
 * Helper dan Svelte Action untuk Pengurusan Fokus Dialog Modal (WCAG 2.2 AA / APG Modal Dialog)
 *
 * Mengendalikan:
 * 1. Focus trap (Tab / Shift+Tab terkurung di dalam modal)
 * 2. Return focus ke elemen pencetus asal apabila ditutup
 * 3. Menutup modal dengan kekunci Escape
 * 4. Kunci skrol latar belakang
 */

export interface ModalTrapOptions {
	enabled: boolean;
	onClose: () => void;
	initialFocusSelector?: string;
	returnFocusTo?: HTMLElement | null;
}

const FOCUSABLE_SELECTOR = [
	'a[href]',
	'area[href]',
	'input:not([disabled]):not([type="hidden"])',
	'select:not([disabled])',
	'textarea:not([disabled])',
	'button:not([disabled])',
	'iframe',
	'object',
	'embed',
	'[contenteditable]',
	'[tabindex]:not([tabindex="-1"])'
].join(',');

export function trapFocus(node: HTMLElement, options: ModalTrapOptions) {
	let triggerElement: HTMLElement | null = null;
	let prevOverflow = '';

	function getFocusableElements(): HTMLElement[] {
		const nodes = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
		return nodes.filter((el) => {
			return !el.hasAttribute('disabled') && el.offsetParent !== null;
		});
	}

	function isInert(el: HTMLElement): boolean {
		return Boolean(el.closest('[inert]'));
	}

	function activate() {
		if (typeof document === 'undefined') return;
		// Pencetus eksplisit diutamakan: apabila HUD menjadi `inert`, pelayar
		// memindahkan fokus ke body sebelum action ini berjalan.
		const active = document.activeElement as HTMLElement | null;
		triggerElement = options.returnFocusTo ?? (active && active !== document.body ? active : null);

		prevOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';

		// Tetapkan fokus awal
		requestAnimationFrame(() => {
			if (!options.enabled) return;
			if (options.initialFocusSelector) {
				const target = node.querySelector<HTMLElement>(options.initialFocusSelector);
				if (target) {
					target.focus();
					return;
				}
			}
			const focusables = getFocusableElements();
			if (focusables.length > 0) {
				focusables[0].focus();
			} else {
				node.focus();
			}
		});
	}

	function deactivate() {
		if (typeof document === 'undefined') return;
		document.body.style.overflow = prevOverflow;
		const target = triggerElement;
		triggerElement = null;
		if (!target || typeof target.focus !== 'function') return;
		// Tunggu sehingga Svelte selesai membuang `inert` pada HUD sebelum fokus dipulangkan.
		requestAnimationFrame(() => {
			if (!target.isConnected || isInert(target)) return;
			target.focus();
		});
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!options.enabled) return;

		if (e.key === 'Escape') {
			e.preventDefault();
			e.stopPropagation();
			options.onClose();
			return;
		}

		if (e.key === 'Tab') {
			const focusables = getFocusableElements();
			if (focusables.length === 0) {
				e.preventDefault();
				return;
			}
			const first = focusables[0];
			const last = focusables[focusables.length - 1];

			if (e.shiftKey) {
				if (document.activeElement === first || !node.contains(document.activeElement)) {
					e.preventDefault();
					last.focus();
				}
			} else {
				if (document.activeElement === last || !node.contains(document.activeElement)) {
					e.preventDefault();
					first.focus();
				}
			}
		}
	}

	node.addEventListener('keydown', handleKeydown);

	if (options.enabled) {
		activate();
	}

	return {
		update(newOptions: ModalTrapOptions) {
			const wasEnabled = options.enabled;
			options = newOptions;

			if (!wasEnabled && options.enabled) {
				activate();
			} else if (wasEnabled && !options.enabled) {
				deactivate();
			}
		},
		destroy() {
			node.removeEventListener('keydown', handleKeydown);
			if (options.enabled) {
				deactivate();
			}
		}
	};
}
