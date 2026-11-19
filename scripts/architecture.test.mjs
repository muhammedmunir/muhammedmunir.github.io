import test from 'node:test';
import assert from 'node:assert/strict';
import { MODULES } from '../src/lib/workbench/system-state.mjs';
import { classify, buildArchitecture } from '../src/lib/content/architecture.mjs';

test('setiap item stack dalam SEMUA MODULES diklasifikasikan', () => {
  const failures = [];
  for (const module of MODULES) {
    for (const item of module.stack) {
      if (classify(item) === 'unknown') {
        failures.push({ module: module.id, item });
      }
    }
  }
  assert.equal(failures.length, 0, `Item stack tidak diklasifikasikan: ${JSON.stringify(failures)}`);
});

test('setiap modul menghasilkan sekurang-kurangnya 2 lapisan dan 1 nod', () => {
  for (const module of MODULES) {
    const arch = buildArchitecture(module);
    assert.ok(arch.layers.length >= 2, `Modul ${module.id}: lapisan < 2`);
    assert.ok(arch.nodes.length >= 1, `Modul ${module.id}: nod < 1`);
  }
});

test('modul restricted menghasilkan restricted === true', () => {
  for (const module of MODULES) {
    const arch = buildArchitecture(module);
    const expected = module.accessType === 'restricted';
    assert.equal(arch.restricted, expected, `Modul ${module.id}: restricted sepatutnya ${expected}`);
  }
});

test('label setiap nod sama tepat dengan item dalam stack asal (tiada teks direka)', () => {
  for (const module of MODULES) {
    const arch = buildArchitecture(module);
    for (const node of arch.nodes) {
      assert.ok(module.stack.includes(node.label), `Modul ${module.id}: nod "${node.label}" tidak dalam stack asal`);
    }
  }
});

test('flows hanya menghubungkan lapisan yang wujud', () => {
  for (const module of MODULES) {
    const arch = buildArchitecture(module);
    const presentLayers = new Set(arch.layers.map(l => l.id));
    for (const flow of arch.flows) {
      assert.ok(presentLayers.has(flow.from), `Modul ${module.id}: flow from "${flow.from}" tidak wujud`);
      assert.ok(presentLayers.has(flow.to), `Modul ${module.id}: flow to "${flow.to}" tidak wujud`);
    }
  }
});