import type { EngineStore } from './state';

/** Native document position is the navigation input; wheel, touch and history remain browser-owned. */
export function connectNavigation(root: HTMLElement, store: EngineStore) {
	const media = matchMedia('(prefers-reduced-motion: reduce)');
	const update = () => {
		const top = root.getBoundingClientRect().top + window.scrollY;
		const travel = Math.max(1, root.offsetHeight - innerHeight);
		store.setProgress((scrollY - top) / travel);
	};
	const preference = () => {
		store.setReduced(media.matches);
		update();
	};
	const observer = new ResizeObserver(update);
	observer.observe(root);
	window.addEventListener('scroll', update, { passive: true });
	window.addEventListener('resize', update, { passive: true });
	window.addEventListener('pageshow', update);
	window.addEventListener('hashchange', update);
	media.addEventListener('change', preference);
	preference();
	return () => {
		observer.disconnect();
		window.removeEventListener('scroll', update);
		window.removeEventListener('resize', update);
		window.removeEventListener('pageshow', update);
		window.removeEventListener('hashchange', update);
		media.removeEventListener('change', preference);
	};
}
