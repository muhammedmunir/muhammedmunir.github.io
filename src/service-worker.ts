/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { build, files, prerendered, version } from '$service-worker';

const sw = self as unknown as ServiceWorkerGlobalScope;
const CACHE_PREFIX = 'spine-cache-';
const CACHE_NAME = `${CACHE_PREFIX}${version}`;
const PRECACHE_SET = new Set([...build, ...files.filter((file) => !file.endsWith('.pdf'))]);

// HTML mesti tersedia sebelum lawatan luar talian pertama; PDF kekal atas permintaan.
const PRECACHE_ASSETS = [...new Set([...PRECACHE_SET, ...prerendered])];

sw.addEventListener('install', (event) => {
	// Biarkan tab binaan lama selesai sebelum versi baharu mengambil alih.
	event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS)));
});

sw.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then(async (keys) => {
			for (const key of keys) {
				if (key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME) {
					await caches.delete(key);
				}
			}
			await sw.clients.claim();
		})
	);
});

sw.addEventListener('fetch', (event) => {
	if (event.request.method !== 'GET') return;

	const url = new URL(event.request.url);
	if (url.origin !== sw.location.origin) return;

	event.respondWith(
		(async () => {
			const cache = await caches.open(CACHE_NAME);

			// Aset precache (build immutable & imej/ikon statik) dilayan terus daripada cache
			if (PRECACHE_SET.has(url.pathname)) {
				const cached = await cache.match(url.pathname);
				if (cached) return cached;
			}

			// Untuk HTML dan dokumen PDF: cuba rangkaian dahulu dan simpan salinan dalam cache
			try {
				const response = await fetch(event.request);
				if (
					response.status === 200 &&
					!response.headers.get('cache-control')?.includes('no-store')
				) {
					event.waitUntil(
						cache.put(event.request, response.clone()).catch(() => {
							// Kuota cache tidak boleh menggagalkan respons rangkaian yang sah.
						})
					);
				}
				return response;
			} catch (error) {
				const cached = await cache.match(event.request);
				if (cached) return cached;
				throw error;
			}
		})()
	);
});
