/**
 * Deck-scoped focus & interaction helpers (owner: adaptive-03-executor).
 *
 * These utilities exist so the Synaptic Pitch Deck dialog can:
 *  - keep keyboard navigation scoped to visible, enabled controls,
 *  - avoid hijacking keystrokes aimed at form fields or rich-text editors,
 *  - move roving focus between chapter controls (mini-map / chapter rail),
 *  - own and restore page scroll-lock safely.
 *
 * They are deliberately dependency-free and side-effect free (except for the
 * explicit lock helpers) so they can be unit-checked in isolation.
 */

const TEXT_ENTRY_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT', 'OPTION']);

/** True when the event originated from a control that must keep its own keys. */
export function isTextEntryTarget(target: EventTarget | null): boolean {
	if (!(target instanceof HTMLElement)) return false;
	if (TEXT_ENTRY_TAGS.has(target.tagName) || target.closest('summary, details')) return true;
	return target.isContentEditable;
}

/** Modal launchers share this gate; custom modal semantics are included for integrations. */
export function hasOpenModal(except?: HTMLElement): boolean {
	if (typeof document === 'undefined') return false;
	return Array.from(
		document.querySelectorAll<HTMLElement>(':modal, [role="dialog"][aria-modal="true"]')
	).some((node) => node !== except && !node.hidden && getComputedStyle(node).display !== 'none');
}

function isFocusableVisible(el: HTMLElement): boolean {
	if (el.hasAttribute('disabled')) return false;
	if (el.getAttribute('aria-hidden') === 'true') return false;
	if (el.closest('[hidden]')) return false;
	if (el.offsetParent === null && getComputedStyle(el).position !== 'fixed') return false;
	return true;
}

/**
 * Find the controls inside a chapter, in reading order, skipping decorative or
 * disabled nodes and respecting Svelte `inert` containers.
 */
export function collectControls(root: ParentNode | null | undefined): HTMLElement[] {
	if (!root) return [];
	const selector = 'button, [href], summary, [tabindex]:not([tabindex="-1"])';
	const found = Array.from(root.querySelectorAll<HTMLElement>(selector));
	return found.filter((el) => isFocusableVisible(el) && !el.closest('[inert]'));
}

/** Controls belonging to the first `<summary>` currently open in this chapter. */
export function collectOpenDetailControls(root: ParentNode | null | undefined): HTMLElement[] {
	if (!root) return [];
	const open = root.querySelector('details[open]');
	if (!open) return [];
	return collectControls(open);
}

/** True when the node still belongs to the document (guards removed refs). */
export function isConnected(node: Node | null | undefined): node is HTMLElement {
	return !!node && node.isConnected;
}

/** True when the root node contains the active element (incl. the node itself). */
export function containsActiveElement(root: HTMLElement | null | undefined): boolean {
	if (!root || typeof document === 'undefined') return false;
	const active = document.activeElement;
	return !!active && (active === root || root.contains(active));
}

/** Smallest next index in `direction` starting from `from` (wraps by default). */
export function steppedIndex(from: number, direction: 1 | -1, length: number, wrap = true): number {
	if (length <= 0) return -1;
	if (from < 0 || from >= length) return direction === 1 ? 0 : length - 1;
	const next = from + direction;
	if (next < 0) return wrap ? length - 1 : 0;
	if (next >= length) return wrap ? 0 : length - 1;
	return next;
}

let lockDepth = 0;
let lockedOverflow = '';
let lockedPaddingRight = '';
let appliedOverflow = '';
let appliedPaddingRight = '';

function lockTarget(): HTMLElement | null {
	return typeof document === 'undefined' ? null : document.body;
}

/**
 * Take ownership of page scroll while a modal is open. Reference-counted so two
 * overlapping dialogs cannot restore scroll while one is still open.
 */
export function acquireScrollLock(): void {
	if (typeof document === 'undefined') return;
	if (lockDepth === 0) {
		const body = lockTarget();
		if (!body) return;
		lockedOverflow = body.style.overflow;
		lockedPaddingRight = body.style.paddingRight;
		const gap = window.innerWidth - document.documentElement.clientWidth;
		body.style.overflow = 'hidden';
		appliedOverflow = body.style.overflow;
		if (gap > 0) {
			body.style.paddingRight = `${gap}px`;
			appliedPaddingRight = body.style.paddingRight;
		} else {
			appliedPaddingRight = '';
		}
	}
	lockDepth++;
}

/**
 * Release the lock, restoring the exact previous inline values.
 *
 * Restoration is conditional: if another owner (for example the page that
 * mounts this dialog) changed the same inline style while we held the lock, its
 * value wins. That keeps us from re-locking the page after close when the host
 * page clears `body.overflow` itself.
 */
export function releaseScrollLock(): void {
	if (typeof document === 'undefined') return;
	if (lockDepth === 0) return;
	lockDepth--;
	if (lockDepth > 0) return;
	const body = lockTarget();
	if (body) {
		if (body.style.overflow === appliedOverflow) body.style.overflow = lockedOverflow;
		if (appliedPaddingRight && body.style.paddingRight === appliedPaddingRight) {
			body.style.paddingRight = lockedPaddingRight;
		}
	}
	lockedOverflow = '';
	lockedPaddingRight = '';
	appliedOverflow = '';
	appliedPaddingRight = '';
}

/** Independently scrolling reading regions need keyboard focus, not widget roles. */
export function keyboardScrollRegion(node: HTMLElement) {
	const previous = node.getAttribute('tabindex');
	node.tabIndex = 0;
	return {
		destroy() {
			if (previous === null) node.removeAttribute('tabindex');
			else node.setAttribute('tabindex', previous);
		}
	};
}
