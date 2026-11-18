import { Vector3 } from 'three';

/**
 * Muatkan semua penjuru kotak dalam frustum perspektif.
 * @param {import('three').Box3} bounds
 * @param {Vector3} direction Arah sasaran ke kamera.
 * @param {number} fov Darjah menegak.
 * @param {number} aspect
 * @param {number} [padding]
 * @param {number} [near]
 */
export function fitPerspectiveBounds(bounds, direction, fov, aspect, padding = 1.12, near = 0.1) {
  if (bounds.isEmpty() || !Number.isFinite(aspect) || aspect <= 0 || !Number.isFinite(fov) || fov <= 0 || fov >= 180 ||
      !Number.isFinite(padding) || padding < 1 || !Number.isFinite(near) || near <= 0 ||
      !Number.isFinite(direction.lengthSq()) || direction.lengthSq() === 0 ||
      ![...bounds.min, ...bounds.max].every(Number.isFinite)) {
    throw new RangeError('Invalid perspective bounds or camera parameters');
  }
  const target = bounds.getCenter(new Vector3());
  const back = direction.clone().normalize();
  const upAxis = Math.abs(back.y) > 0.999 ? new Vector3(0, 0, 1) : new Vector3(0, 1, 0);
  const right = new Vector3().crossVectors(upAxis, back).normalize();
  const up = new Vector3().crossVectors(back, right).normalize();
  const tanY = Math.tan(fov * Math.PI / 360);
  const tanX = tanY * aspect;
  let distance = near;
  let minDepth = Infinity;
  let maxDepth = -Infinity;
  for (const x of [bounds.min.x, bounds.max.x]) {
    for (const y of [bounds.min.y, bounds.max.y]) {
      for (const z of [bounds.min.z, bounds.max.z]) {
        const corner = new Vector3(x, y, z).sub(target);
        const depth = corner.dot(back);
        distance = Math.max(distance, depth + near * 2,
          depth + Math.abs(corner.dot(right)) * padding / tanX,
          depth + Math.abs(corner.dot(up)) * padding / tanY);
        minDepth = Math.min(minDepth, depth);
        maxDepth = Math.max(maxDepth, depth);
      }
    }
  }
  return { target, distance, near: Math.min(near, (distance - maxDepth) / 2),
    far: Math.max(near * 4, (distance - minDepth) * 1.2),
    position: target.clone().addScaledVector(back, distance) };
}
