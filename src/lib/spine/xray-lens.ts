import * as THREE from 'three';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

/**
 * `xray-lens.ts` — Pas komposit kanta X-Ray Kaca Cair (Sesi 3, Tunggak C).
 *
 * Didaratkan daripada matematik `C:\Project\Liquid-Glass\lensOptics.ts` tetapi
 * ditekan kepada satu pas skrin penuh supaya lautan GLSL tidak dilukis dua kali.
 * Di dalam bulatan kanta, piksel dileraikan ke pusat yang sedikit dibesarkan
 * (1/1.07) dan, pada birai, saluran RGB dipecah secara kromatik ikut bengkokan
 * `bend = radius * (edge^2)` — pembiasan cembung gaya Snell's Law. Lapisan
 * gentian optik bawah pulau dibaca daripada `tFiber` (render berasingan) dan
 * dikompositkan secara aditif hanya di dalam bulatan, jadi X-Ray tidak bocor
 * ke luar lensa. `uChromAb = 0` (prefers-reduced-motion) menanggalkan herotan
 * tetapi mengekalkan pendedahan hologram statik.
 */

export interface XRayLensBindings {
	pass: ShaderPass;
	uniforms: {
		uResolution: THREE.IUniform<THREE.Vector2>;
		uCenter: THREE.IUniform<THREE.Vector2>;
		uRadius: THREE.IUniform<number>;
		uAmount: THREE.IUniform<number>;
		uChromAb: THREE.IUniform<number>;
		tFiber: THREE.IUniform<THREE.Texture | null>;
	};
}

const XRAY_LENS_SHADER = {
	name: 'XRayLiquidGlassLens',
	uniforms: {
		tDiffuse: { value: null as THREE.Texture | null },
		tFiber: { value: null as THREE.Texture | null },
		uResolution: { value: new THREE.Vector2(1, 1) },
		uCenter: { value: new THREE.Vector2(0.5, 0.5) },
		uRadius: { value: 1 },
		uAmount: { value: 0 },
		uChromAb: { value: 1 }
	},
	vertexShader: /* glsl */ `
		varying vec2 vUv;
		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
		}
	`,
	fragmentShader: /* glsl */ `
		uniform sampler2D tDiffuse;
		uniform sampler2D tFiber;
		uniform vec2 uResolution;
		uniform vec2 uCenter;
		uniform float uRadius;
		uniform float uAmount;
		uniform float uChromAb;
		varying vec2 vUv;

		vec3 sampleScene(vec2 px) {
			return texture2D(tDiffuse, clamp(px / uResolution, vec2(0.0), vec2(1.0))).rgb;
		}
		vec3 sampleFiber(vec2 px) {
			return texture2D(tFiber, clamp(px / uResolution, vec2(0.0), vec2(1.0))).rgb;
		}

		void main() {
			vec2 p = vUv * uResolution;
			vec3 color = sampleScene(p);
			if (uAmount < 0.001) {
				gl_FragColor = vec4(color, 1.0);
				return;
			}

			vec2 local = p - uCenter;
			float dist = length(local) - uRadius;
			float inside = smoothstep(1.0, 0.0, dist);
			if (inside <= 0.0) {
				gl_FragColor = vec4(color, 1.0);
				return;
			}

			vec2 normal = local / max(length(local), 1e-4);
			// 0 di birai, 1 di pusat: kedalaman kubah cecair.
			float depth = max(-dist, 0.0);
			float bevel = max(uRadius * 0.75, 1e-4);
			float t = clamp(depth / bevel, 0.0, 1.0);
			float edge = 1.0 - t;
			// Bengkokan memuncak di birai; sifar sepenuhnya dalam mod statik.
			float bend = uRadius * 0.62 * edge * edge * uChromAb;
			vec2 ray = uCenter + local * (1.0 / 1.07) + normal * bend;

			float split = bend * 0.1;
			vec3 glass;
			if (split > 1e-4) {
				glass = vec3(
					sampleScene(ray - normal * split).r,
					sampleScene(ray - normal * split * 0.35).g * 0.5 +
						sampleScene(ray + normal * split * 0.35).g * 0.5,
					sampleScene(ray + normal * split).b
				);
			} else {
				glass = sampleScene(ray);
			}

			vec3 fiber = sampleFiber(ray);

			// Fresnel: pusat jernih, pantulan berkumpul di birai.
			float fresnel = pow(1.0 - t, 3.0);
			vec3 hologram = vec3(0.28, 0.82, 0.95);
			glass = mix(glass, hologram, 0.10 + 0.10 * fresnel);

			vec3 result = glass + fiber * (1.15 + 0.55 * fresnel);
			float rim = exp(-pow((depth - 0.7) / 0.6, 2.0));
			result += vec3(0.6, 0.85, 1.0) * rim * 0.28;

			color = mix(color, result, inside * uAmount);
			gl_FragColor = vec4(color, 1.0);
		}
	`
};

export function createXRayLensPass(resolution: THREE.Vector2): XRayLensBindings {
	const pass = new ShaderPass(XRAY_LENS_SHADER);
	const uniforms = pass.uniforms as unknown as XRayLensBindings['uniforms'];
	uniforms.uResolution.value.copy(resolution);
	// Kantas kursor mula di tengah skrin; nisbah jejari diselaraskan oleh dunia.
	uniforms.uCenter.value.copy(resolution).multiplyScalar(0.5);
	uniforms.uRadius.value = Math.min(resolution.x, resolution.y) * 0.3;
	return { pass, uniforms };
}
