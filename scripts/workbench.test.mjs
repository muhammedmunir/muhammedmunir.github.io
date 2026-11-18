import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INITIAL_STATE,
  transition,
  outcome,
  MODULES,
  MAINTAINED_MODULES,
  BUILT_MODULES,
  HOMELAB_SPEC,
  GATEWAY_SPEC
} from '../src/lib/workbench/system-state.mjs';
import { JOURNEY_STEPS } from '../src/lib/workbench/journey-data.ts';

test('rangkaian terputus mengatasi identiti pemilik', () => {
  assert.equal(outcome({ ...INITIAL_STATE, identity: 'owner' }).code, 'offline');
});

test('sambungan sahaja tidak memberi akses', () => {
  assert.equal(outcome(transition(INITIAL_STATE, { type: 'connect' })).code, 'waiting');
});

test('pelawat disekat dan pemilik dibenarkan hanya ketika bersambung', () => {
  const connected = transition(INITIAL_STATE, { type: 'connect' });
  const visitor = transition(connected, { type: 'identity', value: 'visitor' });
  assert.equal(outcome(visitor).code, 'denied');
  const owner = transition(visitor, { type: 'identity', value: 'owner' });
  assert.equal(outcome(owner).code, 'allowed');
  assert.equal(outcome(transition(owner, { type: 'connect' })).code, 'offline');
});

test('token boleh dikeluarkan dan penutup tidak mengubah kebenaran', () => {
  const owner = { ...INITIAL_STATE, connected: true, identity: 'owner' };
  assert.equal(outcome(transition(owner, { type: 'open' })).code, 'allowed');
  assert.equal(transition(owner, { type: 'identity', value: 'owner' }).identity, null);
});

test('modul berputar, boleh dipilih terus, dan reset memulihkan keadaan tanpa mutasi', () => {
  assert.equal(transition(INITIAL_STATE, { type: 'module', delta: -1 }).module, MODULES.length - 1);
  assert.equal(transition(INITIAL_STATE, { type: 'select_module', index: 3 }).module, 3);
  assert.deepEqual(transition({ ...INITIAL_STATE, connected: true }, { type: 'reset' }), INITIAL_STATE);
  assert.equal(INITIAL_STATE.connected, false);
});

test('pemetaan TNB hanya ONBOARDX dan tiada projek internship rekaan', () => {
  assert.deepEqual(MODULES.filter(m => m.company.startsWith('TNB')).map(m => m.name), ['ONBOARDX']);
});

test('pengasingan kategori sistem disenggara YHCM (3) vs projek dibangunkan (5)', () => {
  assert.equal(MAINTAINED_MODULES.length, 3);
  assert.equal(BUILT_MODULES.length, 5);
  assert.equal(MODULES.length, 8);
  assert.deepEqual(
    MAINTAINED_MODULES.map(m => m.id),
    ['emesys', 'sutera', 'adims']
  );
  assert.deepEqual(
    BUILT_MODULES.map(m => m.id),
    ['onboardx', 'iwa001', 'infinity', '9router', 'babykick']
  );
  for (const m of MAINTAINED_MODULES) {
    assert.equal(m.category, 'maintained');
    assert.ok(m.code.startsWith('MAINT-'));
    assert.ok(m.role.includes('Full-Stack Developer'));
  }
  for (const m of BUILT_MODULES) {
    assert.equal(m.category, 'built');
    assert.ok(m.code.startsWith('BUILD-'));
  }
});

test('sistem kerajaan YHCM tidak mempunyai pautan repositori GitHub awam', () => {
  const yhcm = MODULES.filter(m => m.company.includes('YHCM'));
  assert.equal(yhcm.length, 3);
  for (const mod of yhcm) {
    assert.equal('repository' in mod, false);
    assert.equal(mod.accessType, 'restricted');
  }
});

test('modul mengekalkan identiti tanpa skrin dan metrik rekaan', () => {
  for (const mod of MODULES) {
    assert.ok(mod.id && mod.name.length > 0);
    assert.ok(mod.accent.startsWith('#'));
    assert.ok(Array.isArray(mod.stack) && mod.stack.length > 0);
    assert.equal('loginScreen' in mod, false);
    assert.equal('dashboardScreen' in mod, false);
  }
});

test('identiti tidak dikenali tidak memberikan akses', () => {
  assert.equal(outcome({ ...INITIAL_STATE, connected: true, identity: 'unknown' }).code, 'denied');
});

test('outcome menyokong dwibahasa ms dan en', () => {
  const offlineMs = outcome({ ...INITIAL_STATE, connected: false }, 'ms');
  const offlineEn = outcome({ ...INITIAL_STATE, connected: false }, 'en');
  assert.equal(offlineMs.title, 'Luar Talian');
  assert.equal(offlineEn.title, 'Offline');
  const allowedMs = outcome({ ...INITIAL_STATE, connected: true, identity: 'owner' }, 'ms');
  const allowedEn = outcome({ ...INITIAL_STATE, connected: true, identity: 'owner' }, 'en');
  assert.equal(allowedMs.title, 'Akses Pemilik Sah');
  assert.equal(allowedEn.title, 'Verified Owner Access');
});

test('perjalanan kronologi merangkumi 7 langkah pendidikan dan kerjaya dari 2017 hingga kini', () => {
  assert.equal(JOURNEY_STEPS.length, 7);
  assert.equal(JOURNEY_STEPS[0].id, 'edu-diploma');
  assert.equal(JOURNEY_STEPS[0].track, 'education');
  assert.equal(JOURNEY_STEPS[1].id, 'work-tnb-ict');
  assert.equal(JOURNEY_STEPS[1].track, 'career');
  assert.equal(JOURNEY_STEPS[2].id, 'edu-degree');
  assert.equal(JOURNEY_STEPS[2].track, 'education');
  assert.equal(JOURNEY_STEPS[6].id, 'work-yhcm');
  assert.equal(JOURNEY_STEPS[6].track, 'career');
  assert.equal(JOURNEY_STEPS[6].yearShort, '2026-Kini');
});

test('spesifikasi homelab dan gerbang keselamatan lengkap', () => {
  assert.ok(HOMELAB_SPEC.components.length >= 3);
  assert.ok(GATEWAY_SPEC.visitorNote.length > 20);
  assert.ok(GATEWAY_SPEC.ownerNote.length > 20);
});
