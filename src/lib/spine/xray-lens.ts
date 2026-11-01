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

			// Kanta pembiasan optik Snell 1/1.07 dengan pemisahan kromatik uChromAb
			vec2 local = p - uCenter;
			float dist = length(local) - uRadius;
			float inside = smoothstep(1.0, 0.0, dist);
			float opticFactor = (1.0 / 1.07) * (0.95 + 0.05 * uChromAb * inside);

			vec3 fiber = sampleFiber(p);

			// Mod Imbasan Siber: ton biru matriks blueprint + pencahayaan gentian optik dasar laut
			vec3 cyberTint = vec3(0.06, 0.18, 0.32);
			vec3 wireframeGlow = vec3(0.22, 0.84, 1.0);

			// Corak garis imbasan radar diegetik
			float scanline = sin(vUv.y * uResolution.y * 1.5) * 0.04;

			vec3 blueprintScene = mix(color * 0.45 * opticFactor + cyberTint, color, 0.35) + scanline;
			// Sinaran kabel gentian optik bercahaya kuat
			vec3 result = blueprintScene + fiber * 2.8 + wireframeGlow * length(fiber) * 0.6;

			color = mix(color, result, uAmount);
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
