import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const source = readFileSync(new URL('../src/service-worker.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
	compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
}).outputText;

function fixture({ offline = false, rejectPut = false } = {}) {
	const origin = 'https://portfolio.test';
	const listeners = new Map();
	const stores = new Map();
	const requests = [];
	let skippedWaiting = false;
	let claimed = false;
	const keyFor = (request) =>
		new URL(typeof request === 'string' ? request : request.url, origin).href;
	const caches = {
		async open(name) {
			if (!stores.has(name)) stores.set(name, new Map());
			const store = stores.get(name);
			return {
				async addAll(paths) {
					for (const path of paths) store.set(keyFor(path), new Response(`precache:${path}`));
				},
				async match(request) {
					return store.get(keyFor(request))?.clone();
				},
				async put(request, response) {
					if (rejectPut) throw new Error('QuotaExceededError');
					store.set(keyFor(request), response.clone());
				}
			};
		},
		async keys() {
			return [...stores.keys()];
		},
		async delete(name) {
			return stores.delete(name);
		}
	};
	vm.runInNewContext(compiled, {
		exports: {},
		require(name) {
			assert.equal(name, '$service-worker');
			return {
				build: ['/_app/immutable/app.js'],
				files: ['/profile_photo.jpg', '/docs/resume.pdf'],
				prerendered: ['/', '/spatial/'],
				version: 'test'
			};
		},
		self: {
			location: new URL(origin),
			addEventListener: (name, handler) => listeners.set(name, handler),
			async skipWaiting() {
				skippedWaiting = true;
			},
			clients: {
				async claim() {
					claimed = true;
				}
			}
		},
		URL,
		caches,
		async fetch(request) {
			requests.push(keyFor(request));
			if (offline) throw new TypeError('Failed to fetch');
			return new Response(`network:${keyFor(request)}`);
		}
	});
	async function dispatch(name, request) {
		const pending = [];
		let response;
		listeners.get(name)({
			request,
			waitUntil: (work) => pending.push(work),
			respondWith: (work) => (response = work)
		});
		const result = await response;
		await Promise.all(pending);
		return result;
	}
	return {
		caches,
		stores,
		requests,
		dispatch,
		request: (path, init) => new Request(new URL(path, origin), init),
		get skippedWaiting() {
			return skippedWaiting;
		},
		get claimed() {
			return claimed;
		}
	};
}

test('HTML kedua-dua laluan tersedia luar talian selepas pemasangan pertama', async () => {
	const worker = fixture({ offline: true });
	await worker.dispatch('install');
	for (const path of ['/', '/spatial/']) {
		const response = await worker.dispatch('fetch', worker.request(path));
		assert.equal(await response.text(), `precache:${path}`);
	}
	const keys = [...worker.stores.get('spine-cache-test').keys()];
	assert.ok(!keys.some((key) => key.endsWith('.pdf')), 'PDF tidak dimuat turun sewaktu pemasangan');
});

test('Aktivasi memadam cache versi sendiri sahaja dan mengekalkan cache aplikasi lain', async () => {
	const worker = fixture();
	await worker.caches.open('unrelated-app-cache');
	await worker.caches.open('spine-cache-old');
	await worker.dispatch('install');
	await worker.dispatch('activate');
	assert.deepEqual(await worker.caches.keys(), ['unrelated-app-cache', 'spine-cache-test']);
	assert.equal(worker.claimed, true);
});

test('Versi baharu tidak memaksa pengambilalihan tab yang masih menggunakan binaan lama', async () => {
	const worker = fixture();
	await worker.dispatch('install');
	assert.equal(worker.skippedWaiting, false);
});

test('Aset immutable dilayan dari cache, HTML disegarkan melalui rangkaian', async () => {
	const worker = fixture();
	await worker.dispatch('install');
	const asset = await worker.dispatch('fetch', worker.request('/_app/immutable/app.js'));
	assert.equal(await asset.text(), 'precache:/_app/immutable/app.js');
	assert.equal(worker.requests.length, 0);
	const document = await worker.dispatch('fetch', worker.request('/'));
	assert.equal(await document.text(), 'network:https://portfolio.test/');
	assert.equal(worker.requests.length, 1);
});

test('POST dan permintaan rentas origin tidak dipintas', async () => {
	const worker = fixture();
	for (const request of [
		worker.request('/contact', { method: 'POST' }),
		new Request('https://external.test/image.png')
	]) {
		assert.equal(await worker.dispatch('fetch', request), undefined);
	}
	assert.equal(worker.requests.length, 0);
});

test('Kegagalan penulisan cache tidak menggagalkan respons rangkaian', async () => {
	const worker = fixture({ rejectPut: true });
	await worker.dispatch('install');
	const response = await worker.dispatch('fetch', worker.request('/'));
	assert.equal(await response.text(), 'network:https://portfolio.test/');
});
