<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { theme } from '$lib/theme';
	import { playBlip } from '$lib/sound';
	import * as THREE from 'three';

	let container = $state<HTMLDivElement | null>(null);
	let isDragging = $state(false);
	let isHovered = $state(false);
	let isLoaded = $state(false);

	onMount(() => {
		if (!browser || !container) return;

		let width = container.clientWidth;
		let height = container.clientHeight;

		// 1. Scene, Camera, Renderer
		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
		camera.position.set(0, 0, 8.2);

		const renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: true,
			powerPreference: 'high-performance'
		});
		renderer.setSize(width, height);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.toneMapping = THREE.ACESFilmicToneMapping;
		renderer.toneMappingExposure = 1.15;
		container.appendChild(renderer.domElement);

		// 2. Sculptural Geometries & Group
		const masterGroup = new THREE.Group();
		scene.add(masterGroup);

		// Central Core Sphere
		const coreGeo = new THREE.SphereGeometry(1.15, 64, 64);
		const coreMat = new THREE.MeshStandardMaterial({
			roughness: 0.18,
			metalness: 0.85
		});
		const coreMesh = new THREE.Mesh(coreGeo, coreMat);
		masterGroup.add(coreMesh);

		// Inner Gyro Torus Ring
		const innerTorusGeo = new THREE.TorusGeometry(2.1, 0.09, 32, 100);
		const innerTorusMat = new THREE.MeshStandardMaterial({
			roughness: 0.3,
			metalness: 0.4
		});
		const innerTorusMesh = new THREE.Mesh(innerTorusGeo, innerTorusMat);
		innerTorusMesh.rotation.x = Math.PI / 3;
		masterGroup.add(innerTorusMesh);

		// Outer Gyro Torus Ring
		const outerTorusGeo = new THREE.TorusGeometry(2.7, 0.065, 32, 120);
		const outerTorusMat = new THREE.MeshStandardMaterial({
			roughness: 0.25,
			metalness: 0.7
		});
		const outerTorusMesh = new THREE.Mesh(outerTorusGeo, outerTorusMat);
		outerTorusMesh.rotation.y = Math.PI / 4;
		outerTorusMesh.rotation.x = -Math.PI / 6;
		masterGroup.add(outerTorusMesh);

		// Orbital Satellites (Tiny geometric accents)
		const satelliteGroup = new THREE.Group();
		masterGroup.add(satelliteGroup);

		const satGeo = new THREE.IcosahedronGeometry(0.18, 0);
		const satMat = new THREE.MeshStandardMaterial({
			roughness: 0.2,
			metalness: 0.9
		});

		const satellites: THREE.Mesh[] = [];
		const satCount = 4;
		for (let i = 0; i < satCount; i++) {
			const sat = new THREE.Mesh(satGeo, satMat);
			const angle = (i / satCount) * Math.PI * 2;
			const radius = 3.25;
			sat.position.set(Math.cos(angle) * radius, Math.sin(angle) * 0.7, Math.sin(angle) * radius);
			satelliteGroup.add(sat);
			satellites.push(sat);
		}

		// 3. Lighting Setup
		const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
		scene.add(ambientLight);

		const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
		keyLight.position.set(5, 6, 6);
		scene.add(keyLight);

		const rimLight = new THREE.DirectionalLight(0xe59057, 2.0);
		rimLight.position.set(-6, -4, -4);
		scene.add(rimLight);

		const accentLight = new THREE.PointLight(0x38bdf8, 2.0, 15);
		accentLight.position.set(0, 4, 3);
		scene.add(accentLight);

		// 4. Update Theme Materials Function
		function applyThemeColors(currentTheme: string) {
			const isDark = currentTheme === 'dark';

			if (isDark) {
				// Dark Theme (Obsidian & Glowing Copper)
				coreMat.color.setHex(0xe59057);
				coreMat.emissive.setHex(0xd97736);
				coreMat.emissiveIntensity = 0.45;
				coreMat.roughness = 0.15;
				coreMat.metalness = 0.88;

				innerTorusMat.color.setHex(0x1c2028);
				innerTorusMat.roughness = 0.22;
				innerTorusMat.metalness = 0.85;

				outerTorusMat.color.setHex(0xe59057);
				outerTorusMat.roughness = 0.28;
				outerTorusMat.metalness = 0.92;

				satMat.color.setHex(0x38bdf8);
				satMat.emissive.setHex(0x0284c7);
				satMat.emissiveIntensity = 0.6;

				ambientLight.color.setHex(0x1a202c);
				ambientLight.intensity = 1.6;
				keyLight.color.setHex(0xffedd5);
				keyLight.intensity = 2.8;
				rimLight.color.setHex(0xe59057);
				rimLight.intensity = 2.4;
				accentLight.intensity = 2.2;
			} else {
				// Light Theme (Warm Alabaster & Bisque Ceramic)
				coreMat.color.setHex(0xd97e4e);
				coreMat.emissive.setHex(0x000000);
				coreMat.emissiveIntensity = 0;
				coreMat.roughness = 0.22;
				coreMat.metalness = 0.78;

				innerTorusMat.color.setHex(0xf3efe8);
				innerTorusMat.roughness = 0.35;
				innerTorusMat.metalness = 0.08;

				outerTorusMat.color.setHex(0x8a929d);
				outerTorusMat.roughness = 0.32;
				outerTorusMat.metalness = 0.65;

				satMat.color.setHex(0x27272a);
				satMat.emissive.setHex(0x000000);
				satMat.emissiveIntensity = 0;

				ambientLight.color.setHex(0xfffbf5);
				ambientLight.intensity = 2.0;
				keyLight.color.setHex(0xfff7ed);
				keyLight.intensity = 2.6;
				rimLight.color.setHex(0xd97736);
				rimLight.intensity = 1.4;
				accentLight.intensity = 0.8;
			}
		}

		// Subscribe to theme store
		const unsubscribeTheme = theme.subscribe((val) => {
			applyThemeColors(val);
		});

		// 5. Physics, Mouse Tracking & Drag-to-Spin Interaction
		let targetRotX = 0;
		let targetRotY = 0;
		let currentRotX = 0;
		let currentRotY = 0;

		let dragVelX = 0;
		let dragVelY = 0;
		let prevPointerX = 0;
		let prevPointerY = 0;

		let pulseScale = 1;
		let isUserInteracting = false;
		let isVisible = true;
		let animationFrameId: number | null = null;

		// Reduced motion check
		const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		const onPointerMove = (e: PointerEvent) => {
			const rect = container?.getBoundingClientRect();
			if (!rect) return;

			const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
			const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

			if (isUserInteracting) {
				const deltaX = e.clientX - prevPointerX;
				const deltaY = e.clientY - prevPointerY;
				dragVelY = deltaX * 0.006;
				dragVelX = deltaY * 0.006;
				targetRotY += dragVelY;
				targetRotX += dragVelX;
				prevPointerX = e.clientX;
				prevPointerY = e.clientY;
			} else {
				// Gentle parallax tilt
				targetRotY = x * 0.45;
				targetRotX = -y * 0.35;
			}
		};

		const onPointerDown = (e: PointerEvent) => {
			isUserInteracting = true;
			isDragging = true;
			prevPointerX = e.clientX;
			prevPointerY = e.clientY;
			pulseScale = 0.94; // Tactile compression
			playBlip(780, 0.04);
		};

		const onPointerUp = () => {
			isUserInteracting = false;
			isDragging = false;
			pulseScale = 1.05; // Spring recoil
		};

		const onPointerEnter = () => {
			isHovered = true;
		};

		const onPointerLeave = () => {
			isHovered = false;
			isUserInteracting = false;
			isDragging = false;
		};

		const domEl = renderer.domElement;
		domEl.addEventListener('pointermove', onPointerMove);
		domEl.addEventListener('pointerdown', onPointerDown);
		window.addEventListener('pointerup', onPointerUp);
		domEl.addEventListener('pointerenter', onPointerEnter);
		domEl.addEventListener('pointerleave', onPointerLeave);

		// 6. Intersection Observer (Zero GPU usage when scrolled out)
		const observer = new IntersectionObserver(
			(entries) => {
				isVisible = entries[0]?.isIntersecting ?? false;
				if (isVisible && !animationFrameId) {
					lastTime = performance.now();
					renderLoop(lastTime);
				}
			},
			{ threshold: 0.05 }
		);
		observer.observe(container);

		// Page visibility listener
		const handleVisibilityChange = () => {
			if (document.hidden) {
				isVisible = false;
				if (animationFrameId) {
					cancelAnimationFrame(animationFrameId);
					animationFrameId = null;
				}
			} else {
				isVisible = true;
				lastTime = performance.now();
				if (!animationFrameId) renderLoop(lastTime);
			}
		};
		document.addEventListener('visibilitychange', handleVisibilityChange);

		// 7. Render Loop
		let lastTime = performance.now();
		let clock = 0;

		const renderLoop = (now: number) => {
			if (!isVisible) {
				animationFrameId = null;
				return;
			}

			const delta = Math.min((now - lastTime) / 1000, 0.1);
			lastTime = now;
			clock += delta;

			// Kinetic rotational flow
			if (!prefersReducedMotion) {
				innerTorusMesh.rotation.z += delta * 0.45;
				outerTorusMesh.rotation.y += delta * 0.3;
				outerTorusMesh.rotation.z -= delta * 0.2;
				satelliteGroup.rotation.y += delta * 0.55;

				// Gentle breathing float
				masterGroup.position.y = Math.sin(clock * 1.5) * 0.12;

				// Core pulse decay
				pulseScale += (1.0 - pulseScale) * 0.08;
				coreMesh.scale.setScalar(pulseScale);

				// Drag inertia friction damping
				if (!isUserInteracting) {
					dragVelX *= 0.94;
					dragVelY *= 0.94;
					targetRotX += dragVelX;
					targetRotY += dragVelY;
				}

				// Smooth lerp orientation toward target
				currentRotX += (targetRotX - currentRotX) * 0.08;
				currentRotY += (targetRotY - currentRotY) * 0.08;

				masterGroup.rotation.x = currentRotX;
				masterGroup.rotation.y = currentRotY + clock * 0.15;
			}

			renderer.render(scene, camera);
			animationFrameId = requestAnimationFrame(renderLoop);
		};

		// 8. Resize Handler
		const handleResize = () => {
			if (!container) return;
			width = container.clientWidth;
			height = container.clientHeight;
			camera.aspect = width / height;
			camera.updateProjectionMatrix();
			renderer.setSize(width, height);
		};
		window.addEventListener('resize', handleResize);

		// Start loop
		isLoaded = true;
		animationFrameId = requestAnimationFrame(renderLoop);

		// Cleanup on unmount
		return () => {
			if (animationFrameId) cancelAnimationFrame(animationFrameId);
			unsubscribeTheme();
			observer.disconnect();
			document.removeEventListener('visibilitychange', handleVisibilityChange);
			window.removeEventListener('resize', handleResize);
			window.removeEventListener('pointerup', onPointerUp);

			domEl.removeEventListener('pointermove', onPointerMove);
			domEl.removeEventListener('pointerdown', onPointerDown);
			domEl.removeEventListener('pointerenter', onPointerEnter);
			domEl.removeEventListener('pointerleave', onPointerLeave);

			coreGeo.dispose();
			coreMat.dispose();
			innerTorusGeo.dispose();
			innerTorusMat.dispose();
			outerTorusGeo.dispose();
			outerTorusMat.dispose();
			satGeo.dispose();
			satMat.dispose();

			renderer.dispose();
			if (container?.contains(domEl)) {
				container.removeChild(domEl);
			}
		};
	});
</script>

<div
	class="sculpture-container"
	bind:this={container}
	class:grabbing={isDragging}
	role="img"
	aria-label="Interactive 3D Kinetic Sculpture: Drag or move mouse to interact"
>
	<!-- Tactile Hint Overlay -->
	<div class="sculpture-hint" class:fade={isHovered || isDragging}>
		<span class="hint-dot"></span>
		<span class="hint-text">Drag or tilt to explore 3D</span>
	</div>

	<!-- Loading Fallback -->
	{#if !isLoaded}
		<div class="sculpture-skeleton" aria-hidden="true">
			<div class="skeleton-ring"></div>
		</div>
	{/if}
</div>

<style>
	.sculpture-container {
		position: relative;
		width: 100%;
		height: 100%;
		min-height: 420px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: grab;
		touch-action: none;
		user-select: none;
	}

	.sculpture-container.grabbing {
		cursor: grabbing;
	}

	:global(.sculpture-container canvas) {
		display: block;
		width: 100% !important;
		height: 100% !important;
		outline: none;
	}

	/* Micro-Hint */
	.sculpture-hint {
		position: absolute;
		bottom: 1.25rem;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.4rem 0.85rem;
		border-radius: 9999px;
		background: var(--surface);
		border: 1px solid var(--surface-border);
		box-shadow: var(--shadow-sm);
		font-size: 0.74rem;
		font-weight: 600;
		color: var(--ink-secondary);
		pointer-events: none;
		transition: opacity 0.3s ease, transform 0.3s ease;
		backdrop-filter: blur(8px);
	}

	.sculpture-hint.fade {
		opacity: 0.2;
		transform: scale(0.95);
	}

	.hint-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--accent);
	}

	/* Loading Skeleton */
	.sculpture-skeleton {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		pointer-events: none;
	}

	.skeleton-ring {
		width: 180px;
		height: 180px;
		border-radius: 50%;
		border: 2px dashed var(--surface-border);
		animation: spin-skeleton 12s linear infinite;
	}

	@keyframes spin-skeleton {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
</style>
