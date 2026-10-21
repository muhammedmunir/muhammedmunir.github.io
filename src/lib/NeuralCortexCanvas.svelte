<script lang="ts">
	import { onMount } from 'svelte';
	import { lang } from '$lib/i18n';
	import * as THREE from 'three';

	let { active = 0 }: { active?: number } = $props();
	let canvas: HTMLCanvasElement;
	let host: HTMLDivElement;
	let ready = $state(false);
	let paused = $state(false);
	let reduced = $state(false);
	let setCameraTarget: ((index: number) => void) | undefined;

	$effect(() => {
		if (setCameraTarget) {
			setCameraTarget(active);
		}
	});

	onMount(() => {
		const media = window.matchMedia('(prefers-reduced-motion: reduce)');
		reduced = media.matches;

		let renderer: THREE.WebGLRenderer | null = null;
		let animId = 0;
		let visible = false;
		let destroyed = false;

		// 1. Scene, Camera, Renderer
		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
		camera.position.set(0, 0, 8.5);

		renderer = new THREE.WebGLRenderer({
			canvas,
			alpha: true,
			antialias: true,
			powerPreference: 'high-performance'
		});
		renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

		// Palette
		const palette = [
			new THREE.Color('#38bdf8'), // 0: Core Full-Stack (Cyan)
			new THREE.Color('#818cf8'), // 1: AI Vision (Indigo)
			new THREE.Color('#00f0ff'), // 2: Cloud Infra (Bright Cyan)
			new THREE.Color('#e2b857'), // 3: Cybersecurity (Gold)
			new THREE.Color('#34d399') // 4: Synaptic Bridge (Emerald)
		];

		// 2. 3D Node Topology (coordinates in 3D world space)
		const nodeDefs = [
			{ pos: new THREE.Vector3(-2.6, 1.2, 0.4), color: palette[0], size: 0.32, name: 'CORE-01' },
			{ pos: new THREE.Vector3(-1.1, 2.0, -0.6), color: palette[1], size: 0.28, name: 'AI-02' },
			{ pos: new THREE.Vector3(-2.2, -1.3, 0.6), color: palette[2], size: 0.3, name: 'INFRA-03' },
			{ pos: new THREE.Vector3(-0.7, -1.8, -0.4), color: palette[3], size: 0.28, name: 'SEC-04' },
			{ pos: new THREE.Vector3(1.8, 0.2, 0.5), color: palette[0], size: 0.42, name: 'CORTEX-HUB' },
			{ pos: new THREE.Vector3(3.2, 1.4, -0.3), color: palette[1], size: 0.3, name: 'NODE-A' },
			{ pos: new THREE.Vector3(3.4, -1.2, 0.3), color: palette[3], size: 0.3, name: 'NODE-B' }
		];

		const nodeGroup = new THREE.Group();
		scene.add(nodeGroup);

		interface NodeMesh {
			core: THREE.Mesh;
			halo: THREE.Mesh;
			ring: THREE.Mesh;
			baseScale: number;
			color: THREE.Color;
			targetPos: THREE.Vector3;
		}

		const nodeMeshes: NodeMesh[] = [];

		const sphereGeo = new THREE.IcosahedronGeometry(1, 2);
		const ringGeo = new THREE.TorusGeometry(1.4, 0.035, 8, 32);

		nodeDefs.forEach((def) => {
			// Inner glowing core
			const coreMat = new THREE.MeshBasicMaterial({
				color: def.color,
				wireframe: true,
				transparent: true,
				opacity: 0.85
			});
			const core = new THREE.Mesh(sphereGeo, coreMat);

			// Outer glowing membrane
			const haloMat = new THREE.MeshBasicMaterial({
				color: def.color,
				transparent: true,
				opacity: 0.25,
				blending: THREE.AdditiveBlending
			});
			const halo = new THREE.Mesh(sphereGeo, haloMat);
			halo.scale.setScalar(1.35);

			// Orbiting synaptic ring
			const ringMat = new THREE.MeshBasicMaterial({
				color: def.color,
				transparent: true,
				opacity: 0.6,
				blending: THREE.AdditiveBlending
			});
			const ring = new THREE.Mesh(ringGeo, ringMat);

			const nodeContainer = new THREE.Group();
			nodeContainer.position.copy(def.pos);
			nodeContainer.scale.setScalar(def.size);
			nodeContainer.add(core);
			nodeContainer.add(halo);
			nodeContainer.add(ring);
			nodeGroup.add(nodeContainer);

			nodeMeshes.push({
				core,
				halo,
				ring,
				baseScale: def.size,
				color: def.color,
				targetPos: def.pos
			});
		});

		// 3. 3D Neural Axons (Curves connecting nodes in 3D)
		const connections: [number, number, THREE.Vector3][] = [
			[0, 1, new THREE.Vector3(-1.8, 1.8, 0.2)],
			[0, 2, new THREE.Vector3(-2.6, -0.1, 0.8)],
			[1, 3, new THREE.Vector3(-1.0, 0.1, -0.7)],
			[2, 3, new THREE.Vector3(-1.4, -1.9, 0.3)],
			[0, 4, new THREE.Vector3(-0.3, 0.9, 0.8)],
			[1, 4, new THREE.Vector3(0.5, 1.3, -0.2)],
			[2, 4, new THREE.Vector3(-0.2, -0.6, 0.7)],
			[3, 4, new THREE.Vector3(0.7, -0.9, -0.1)],
			[4, 5, new THREE.Vector3(2.6, 0.9, 0.3)],
			[4, 6, new THREE.Vector3(2.7, -0.6, 0.6)],
			[5, 6, new THREE.Vector3(3.6, 0.1, -0.2)]
		];

		const axonCurves: THREE.QuadraticBezierCurve3[] = [];
		const axonGroup = new THREE.Group();
		scene.add(axonGroup);

		connections.forEach(([fromIdx, toIdx, ctrl]) => {
			const p0 = nodeDefs[fromIdx].pos;
			const p2 = nodeDefs[toIdx].pos;
			const curve = new THREE.QuadraticBezierCurve3(p0, ctrl, p2);
			axonCurves.push(curve);

			const pts = curve.getPoints(36);
			const geom = new THREE.BufferGeometry().setFromPoints(pts);
			const mat = new THREE.LineBasicMaterial({
				color: nodeDefs[fromIdx].color,
				transparent: true,
				opacity: 0.3,
				blending: THREE.AdditiveBlending
			});
			const line = new THREE.Line(geom, mat);
			axonGroup.add(line);
		});

		// 4. Traveling Action Potentials (3D Pulses)
		interface Pulse {
			curveIdx: number;
			progress: number;
			speed: number;
			mesh: THREE.Mesh;
		}

		const pulseGroup = new THREE.Group();
		scene.add(pulseGroup);

		const pulseGeo = new THREE.SphereGeometry(0.065, 8, 8);
		const pulseMat = new THREE.MeshBasicMaterial({
			color: 0xffffff,
			blending: THREE.AdditiveBlending
		});

		const pulses: Pulse[] = [];
		const pulseCount = 18;

		for (let i = 0; i < pulseCount; i++) {
			const curveIdx = i % axonCurves.length;
			const mesh = new THREE.Mesh(pulseGeo, pulseMat);
			pulseGroup.add(mesh);
			pulses.push({
				curveIdx,
				progress: Math.random(),
				speed: 0.18 + Math.random() * 0.22,
				mesh
			});
		}

		// 5. 3D Synaptic Starfield / Ambient Particle Cloud
		const particleCount = 650;
		const particleGeo = new THREE.BufferGeometry();
		const positions = new Float32Array(particleCount * 3);
		const colorsArr = new Float32Array(particleCount * 3);

		for (let i = 0; i < particleCount; i++) {
			positions[i * 3] = (Math.random() - 0.5) * 14;
			positions[i * 3 + 1] = (Math.random() - 0.5) * 9;
			positions[i * 3 + 2] = (Math.random() - 0.5) * 8 - 1;

			const c = palette[Math.floor(Math.random() * palette.length)];
			colorsArr[i * 3] = c.r;
			colorsArr[i * 3 + 1] = c.g;
			colorsArr[i * 3 + 2] = c.b;
		}

		particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
		particleGeo.setAttribute('color', new THREE.BufferAttribute(colorsArr, 3));

		// Soft circular particle texture generated via tiny canvas
		const pCanvas = document.createElement('canvas');
		pCanvas.width = 32;
		pCanvas.height = 32;
		const pCtx = pCanvas.getContext('2d');
		if (pCtx) {
			const grad = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
			grad.addColorStop(0, 'rgba(255,255,255,1)');
			grad.addColorStop(0.3, 'rgba(255,255,255,0.7)');
			grad.addColorStop(1, 'rgba(255,255,255,0)');
			pCtx.fillStyle = grad;
			pCtx.fillRect(0, 0, 32, 32);
		}
		const pTexture = new THREE.CanvasTexture(pCanvas);

		const particleMat = new THREE.PointsMaterial({
			size: 0.12,
			map: pTexture,
			vertexColors: true,
			transparent: true,
			opacity: 0.65,
			blending: THREE.AdditiveBlending,
			depthWrite: false
		});

		const particleField = new THREE.Points(particleGeo, particleMat);
		scene.add(particleField);

		// 6. Interactive Mouse Parallax & Camera Tracking
		let targetCameraX = 0;
		let targetCameraY = 0;
		let mouseNormX = 0;
		let mouseNormY = 0;

		const onMouseMove = (e: MouseEvent) => {
			if (reduced || paused) return;
			const rect = canvas.getBoundingClientRect();
			mouseNormX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
			mouseNormY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

			targetCameraX = mouseNormX * 0.7;
			targetCameraY = mouseNormY * 0.45;
		};

		window.addEventListener('mousemove', onMouseMove, { passive: true });

		// Camera focus shifts smoothly based on active domain
		setCameraTarget = (idx: number) => {
			if (idx >= 0 && idx < 4) {
				const n = nodeMeshes[idx];
				// Highlight target node
				nodeMeshes.forEach((m, i) => {
					const isTarget = i === idx;
					m.ring.scale.setScalar(isTarget ? 1.6 : 1.0);
					(m.core.material as THREE.MeshBasicMaterial).opacity = isTarget ? 1.0 : 0.75;
					(m.halo.material as THREE.MeshBasicMaterial).opacity = isTarget ? 0.5 : 0.2;
				});
			}
		};

		// 7. Resize handling
		const resize = () => {
			if (!canvas || !renderer) return;
			const w = host.clientWidth || window.innerWidth;
			const h = host.clientHeight || window.innerHeight;
			camera.aspect = w / h;
			camera.updateProjectionMatrix();
			renderer.setSize(w, h, false);
		};

		const ro = new ResizeObserver(resize);
		ro.observe(host);
		resize();

		// 8. Visibility & Intersection handling (100% battery efficient)
		const io = new IntersectionObserver(
			(entries) => {
				visible = entries.some((e) => e.isIntersecting);
				if (visible && !paused && !reduced) {
					startLoop();
				} else {
					cancelAnimationFrame(animId);
				}
			},
			{ threshold: 0.05 }
		);
		io.observe(canvas);

		const onVisibility = () => {
			if (document.hidden) {
				cancelAnimationFrame(animId);
			} else if (visible && !paused && !reduced) {
				startLoop();
			}
		};
		document.addEventListener('visibilitychange', onVisibility);

		// 9. Animation Loop
		let lastTime = performance.now();

		function renderFrame(now: number) {
			const dt = Math.min((now - lastTime) / 1000, 0.1);
			lastTime = now;

			// Camera smooth damping
			camera.position.x += (targetCameraX - camera.position.x) * 0.05;
			camera.position.y += (targetCameraY - camera.position.y) * 0.05;
			camera.lookAt(0, 0, 0);

			// Rotate particle field gently
			particleField.rotation.y += 0.0008;
			particleField.rotation.x += 0.0004;

			// Animate nodes & rings
			nodeMeshes.forEach((mesh, i) => {
				mesh.core.rotation.y += 0.012 * (i % 2 === 0 ? 1 : -1);
				mesh.core.rotation.x += 0.008;
				mesh.ring.rotation.x += 0.015;
				mesh.ring.rotation.z += 0.01;
			});

			// Move action potential pulses along 3D axons
			pulses.forEach((p) => {
				p.progress += p.speed * dt;
				if (p.progress >= 1) {
					p.progress = 0;
					p.curveIdx = (p.curveIdx + 1) % axonCurves.length;
				}
				const curve = axonCurves[p.curveIdx];
				const pos = curve.getPoint(p.progress);
				p.mesh.position.copy(pos);
			});

			if (renderer) {
				renderer.render(scene, camera);
			}
		}

		function loop(now: number) {
			renderFrame(now);
			if (visible && !paused && !reduced && !destroyed) {
				animId = requestAnimationFrame(loop);
			}
		}

		function startLoop() {
			cancelAnimationFrame(animId);
			lastTime = performance.now();
			animId = requestAnimationFrame(loop);
		}

		ready = true;
		startLoop();

		// Cleanup on unmount
		return () => {
			destroyed = true;
			cancelAnimationFrame(animId);
			ro.disconnect();
			io.disconnect();
			window.removeEventListener('mousemove', onMouseMove);
			document.removeEventListener('visibilitychange', onVisibility);

			scene.clear();
			sphereGeo.dispose();
			ringGeo.dispose();
			pulseGeo.dispose();
			pulseMat.dispose();
			particleGeo.dispose();
			particleMat.dispose();
			pTexture.dispose();
			renderer?.dispose();
		};
	});
</script>

<div class="cortex-host" bind:this={host} class:is-ready={ready}>
	<canvas bind:this={canvas} class="cortex-gl"></canvas>

	<!-- Ambient Bioluminescent Depth Halos -->
	<div class="ambient-glow cyan-halo" aria-hidden="true"></div>
	<div class="ambient-glow violet-halo" aria-hidden="true"></div>

	<!-- Accessible 3D Controls -->
	<div class="canvas-telemetry">
		<button
			type="button"
			class="cortex-ctrl-btn"
			aria-pressed={paused}
			onclick={() => {
				paused = !paused;
			}}
		>
			<span class="ctrl-indicator" class:active={!paused}></span>
			<span class="ctrl-text">
				{paused
					? $lang === 'ms'
						? '3D JEDA'
						: '3D PAUSED'
					: $lang === 'ms'
						? '3D REALTIME'
						: '3D REALTIME'}
			</span>
		</button>
	</div>
</div>

<style>
	.cortex-host {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		overflow: hidden;
		pointer-events: none;
		z-index: 1;
		opacity: 0;
		transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1);
	}
	.cortex-host.is-ready {
		opacity: 1;
	}

	.cortex-gl {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		display: block;
		pointer-events: auto;
	}

	/* Ambient Depth Lighting */
	.ambient-glow {
		position: absolute;
		border-radius: 50%;
		pointer-events: none;
		filter: blur(80px);
		opacity: 0.18;
		mix-blend-mode: screen;
		z-index: 0;
	}
	.cyan-halo {
		width: 480px;
		height: 480px;
		top: 10%;
		left: 15%;
		background: radial-gradient(circle, rgba(56, 189, 248, 0.4) 0%, transparent 70%);
	}
	.violet-halo {
		width: 540px;
		height: 540px;
		bottom: 12%;
		right: 15%;
		background: radial-gradient(circle, rgba(129, 140, 248, 0.35) 0%, transparent 70%);
	}

	/* Telemetry Toggle Button */
	.canvas-telemetry {
		position: absolute;
		bottom: 1.5rem;
		left: 2rem;
		z-index: 10;
		pointer-events: auto;
	}
	.cortex-ctrl-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.4rem 0.85rem;
		border-radius: 999px;
		background: rgba(12, 21, 38, 0.8);
		border: 1px solid rgba(148, 163, 184, 0.2);
		color: var(--text-muted);
		font-family: var(--font-mono);
		font-size: 0.68rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		cursor: pointer;
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
		transition: all 0.2s ease;
	}
	.cortex-ctrl-btn:hover {
		border-color: var(--cyan);
		color: var(--white);
		transform: translateY(-1px);
	}
	.cortex-ctrl-btn:focus-visible {
		outline: 2px solid var(--cyan);
		outline-offset: 2px;
	}
	.ctrl-indicator {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: #64748b;
		transition: all 0.25s ease;
	}
	.ctrl-indicator.active {
		background: var(--cyan);
		box-shadow: 0 0 8px var(--cyan);
	}

	@media (max-width: 768px) {
		.canvas-telemetry {
			bottom: 1rem;
			left: 1rem;
		}
	}
</style>
