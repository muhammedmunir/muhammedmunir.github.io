import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Box3, PerspectiveCamera, Spherical, Vector3 } from 'three';
import { fitPerspectiveBounds } from '../src/lib/workbench/camera-fit.mjs';

const desk = new Box3(new Vector3(-5.85, 0, 0.5), new Vector3(6.75, 2.9, 5.95));
const hologram = new Box3(new Vector3(-2.86, 2.23, 0.95), new Vector3(2.42, 5.65, 1.19));
const activeDesk = desk.clone().union(hologram);
const aspects = [320 / 740, 390 / 844, 768 / 1024, 1024 / 768, 1440 / 900, 2560 / 1080];

function assertFit(bounds, direction, aspect, near = 0.1) {
  const fit = fitPerspectiveBounds(bounds, direction, 35, aspect, 1.12, near);
  const camera = new PerspectiveCamera(35, aspect, fit.near, fit.far);
  if (Math.abs(direction.clone().normalize().y) > 0.999) camera.up.set(0, 0, 1);
  camera.position.copy(fit.position);
  camera.lookAt(fit.target);
  camera.updateMatrixWorld(true);
  assert.ok(fit.near > 0 && fit.far > fit.near);
  for (const x of [bounds.min.x, bounds.max.x]) {
    for (const y of [bounds.min.y, bounds.max.y]) {
      for (const z of [bounds.min.z, bounds.max.z]) {
        const projected = new Vector3(x, y, z).project(camera);
        assert.ok(Math.abs(projected.x) <= 1 / 1.12 + 1e-9, `x clipped: ${projected.x}`);
        assert.ok(Math.abs(projected.y) <= 1 / 1.12 + 1e-9, `y clipped: ${projected.y}`);
        assert.ok(projected.z >= -1 && projected.z <= 1, `depth clipped: ${projected.z}`);
      }
    }
  }
  return fit;
}

for (const aspect of aspects) {
  test(`console, active hologram and screen fit at aspect ${aspect}`, () => {
    assertFit(desk, new Vector3(0, 5.85, 12.05), aspect);
    assertFit(activeDesk, new Vector3(0, 3.4, 12.05), aspect);
    assertFit(hologram, new Vector3(0, 0.04, 1), aspect);
  });
  test(`manual orbit envelope fits at aspect ${aspect}`, () => {
    for (const yaw of [-0.75, 0, 0.75]) {
      for (const pitch of [-0.28, 0.38]) {
        const orbit = new Spherical().setFromVector3(new Vector3(0, 3.4, 12.05));
        orbit.theta += yaw;
        orbit.phi = Math.min(Math.PI / 2 - 0.03, Math.max(0.25, orbit.phi + pitch));
        assertFit(activeDesk, new Vector3().setFromSpherical(orbit), aspect);
      }
    }
  });
}

test('near/far planes contain deep, tiny, translated and overhead bounds', () => {
  const deep = new Box3(new Vector3(-0.1, -0.1, -200), new Vector3(0.1, 0.1, 200));
  const tiny = new Box3(new Vector3(-0.001, -0.001, -0.001), new Vector3(0.001, 0.001, 0.001));
  assertFit(deep, new Vector3(0, 0, 1), 0.2, 2);
  assertFit(tiny, new Vector3(0, 0, 1), 4, 0.1);
  assertFit(activeDesk.clone().translate(new Vector3(800, -42, 1700)), new Vector3(1, 2, 4), 0.3);
  assertFit(activeDesk, new Vector3(0, 1, 0), 1);
});

test('portrait view retreats and active console includes full hologram', () => {
  const direction = new Vector3(0, 3.4, 12.05);
  const wide = assertFit(activeDesk, direction, 1.6);
  const narrow = assertFit(activeDesk, direction, 0.46);
  assert.ok(narrow.distance > wide.distance);
  assert.ok(activeDesk.max.y >= hologram.max.y);
});

test('invalid fitting inputs fail explicitly', () => {
  for (const aspect of [0, -1, NaN, Infinity]) {
    assert.throws(() => fitPerspectiveBounds(desk, new Vector3(0, 0, 1), 35, aspect), RangeError);
  }
  assert.throws(() => fitPerspectiveBounds(new Box3(), new Vector3(0, 0, 1), 35, 1), RangeError);
  assert.throws(() => fitPerspectiveBounds(desk, new Vector3(), 35, 1), RangeError);
  assert.throws(() => fitPerspectiveBounds(desk, new Vector3(0, 0, 1), 180, 1), RangeError);
});

test('paused beam is constant and idle rendering remains invalidatable', () => {
  const source = readFileSync(new URL('../src/lib/workbench/WorkbenchWorld.ts', import.meta.url), 'utf8');
  assert.match(source, /const beamPulse = snap \? 0 : Math\.sin\(now \* 0\.005\)/);
  assert.match(source, /snap && !this\.renderDirty && now - this\.lastRender < 250/);
  assert.match(source, /setPaused\(value: boolean\) \{\s*this\.renderDirty = true/);
  assert.match(source, /this\.consoleBounds\.clone\(\)\.union\(this\.screenBounds\)/);
});
