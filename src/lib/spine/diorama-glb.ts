import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

/**
 * `diorama-glb.ts` — Pemuat GLB malas (asan tidak-menyekat) Sesi 2.
 *
 * Dunia 3D muncul serta-merta dengan siluet prosedural (lihat `diorama-props.ts`);
 * aset GLB CC BY 4.0 ditukar masuk secara seragam (normalize skala) apabila selesai
 * dimuatkan. Sifar ralat berlaku → proksi prosedural kekal berfungsi (senyap).
 */

export interface GlbLoadSpec {
	path: string;
	targetHeight: number;
	hotspotId: string;
	stationIndex: number;
	onReady: (object: THREE.Group) => void;
	onError?: () => void;
}

interface GlbHandle {
	object: THREE.Group;
	dispose: () => void;
}

export class DioramaGlbLoader {
	private loader: GLTFLoader | null = null;
	private handles: GlbHandle[] = [];

	private ensureLoader(): GLTFLoader {
		if (!this.loader) {
			const loader = new GLTFLoader();
			// Semua GLB Dioramas dimampatkan dengan EXT_meshopt_compression.
			loader.setMeshoptDecoder(MeshoptDecoder);
			this.loader = loader;
		}
		return this.loader;
	}

	/** Muat malas; no-op secara senyap dalam persekitaran tanpa tetingkap/fetch (SSR / ujian node). */
	public load(spec: GlbLoadSpec): void {
		if (typeof window === 'undefined' || typeof fetch === 'undefined') return;
		const loader = this.ensureLoader();
		loader.load(
			spec.path,
			(gltf) => {
				try {
					const scene = gltf.scene;
					scene.traverse((obj) => {
						obj.userData.hotspotId = spec.hotspotId;
						obj.userData.stationIndex = spec.stationIndex;
						const mesh = obj as THREE.Mesh;
						if (mesh.isMesh === true) {
							mesh.castShadow = true;
							mesh.receiveShadow = true;
						}
					});

					// Normalisasi skala seragam: tinggi bingkai dibilang petakan ke targetHeight,
					// kemudian pusatkan pada asal dan selaras tapak pada y=0 untuk duduk atas pedestal.
					const size = new THREE.Vector3();
					const before = new THREE.Box3().setFromObject(scene);
					const height = Math.max(0.001, before.getSize(size).y);
					const scale = spec.targetHeight / height;
					scene.scale.setScalar(scale);

					const after = new THREE.Box3().setFromObject(scene);
					const center = after.getCenter(new THREE.Vector3());
					// Selaraskan tapak model tepat di atas gelang clampRing pedestal (y = 0.285m)
					scene.position.set(-center.x, -after.min.y + 0.285, -center.z);

					this.handles.push(this.makeHandle(scene));
					spec.onReady(scene);
				} catch {
					spec.onError?.();
				}
			},
			undefined,
			() => spec.onError?.()
		);
	}

	private makeHandle(object: THREE.Group): GlbHandle {
		return {
			object,
			dispose: () => {
				const textures = new Set<THREE.Texture>();
				object.traverse((obj) => {
					const mesh = obj as THREE.Mesh;
					if (mesh.geometry) mesh.geometry.dispose();
					const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
					const mats = Array.isArray(material) ? material : material ? [material] : [];
					for (const mat of mats) {
						const std = mat as THREE.MeshStandardMaterial;
						for (const key of [
							'map',
							'normalMap',
							'roughnessMap',
							'metalnessMap',
							'emissiveMap',
							'aoMap',
							'alphaMap'
						] as const) {
							const tex = std[key] as THREE.Texture | null | undefined;
							if (tex) textures.add(tex);
						}
						mat.dispose();
					}
				});
				for (const tex of textures) tex.dispose();
			}
		};
	}

	public dispose(): void {
		for (const handle of this.handles) handle.dispose();
		this.handles = [];
		this.loader = null;
	}
}
