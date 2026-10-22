<script lang="ts">
	import { CHAPTER_STAGE } from './contract';
	import type { ChapterId, Stage } from './contract';
	let { stage = 0, chapter }: { stage?: Stage; chapter?: ChapterId } = $props();
	const frame = $derived(chapter ? CHAPTER_STAGE[chapter] : stage);
	const opened = $derived(frame === 1 || frame === 2 || frame === 6);
</script>

<svg
	class:inside={frame === 2}
	data-stage={frame}
	viewBox="0 0 1200 900"
	width="1200"
	height="900"
	aria-hidden="true"
	focusable="false"
>
	<defs>
		<linearGradient id="metal" x1="0" y1="0" x2="1" y2="1"
			><stop stop-color="#707b7d" /><stop offset=".45" stop-color="#242d31" /><stop
				offset="1"
				stop-color="#111719"
			/></linearGradient
		>
		<linearGradient id="copper" x1="0" y1="0" x2="1" y2="0"
			><stop stop-color="#66412d" /><stop offset=".5" stop-color="#ce9870" /><stop
				offset="1"
				stop-color="#82563c"
			/></linearGradient
		>
		<radialGradient id="room"
			><stop stop-color="#746b53" /><stop offset="1" stop-color="#101719" /></radialGradient
		>
	</defs>
	<rect width="1200" height="900" fill="#121619" />
	<path d="M0 790 600 510 1200 790V900H0Z" fill="#1b2224" />
	<g
		transform={frame === 3
			? 'translate(120 60) scale(.8) rotate(-8 600 450)'
			: frame === 4 || frame === 5
				? 'translate(30 190) scale(.52)'
				: frame === 6
					? 'translate(50 20) scale(.85)'
					: undefined}
	>
		<path
			d="M370 160 830 160 960 290 960 670 830 800 370 800 240 670 240 290Z"
			fill="url(#room)"
			stroke="#a37753"
			stroke-width="10"
		/>
		{#each [0, 1, 2, 3, 4, 5] as rib}
			<path
				d="M370 160 830 160 960 290 960 670 830 800 370 800 240 670 240 290Z"
				fill="none"
				stroke={rib % 2 ? '#a48c71' : '#667276'}
				stroke-width="13"
				transform="translate({600 * rib * 0.105 + (frame === 6 ? rib * 28 : 0)} {470 * rib * 0.105 +
					(frame === 6 ? (rib % 2) * 55 : 0)}) scale({1 - rib * 0.105})"
			/>
		{/each}
		<rect
			x="530"
			y="365"
			width="140"
			height="220"
			rx="12"
			fill="url(#metal)"
			stroke="#c49068"
			stroke-width="6"
		/>
		{#each [0, 1, 2, 3] as i}<path
				d="M550 {390 + i * 48}h100"
				stroke="#e9d7b3"
				stroke-width="10"
			/>{/each}
		{#each [-1, 1] as side}
			<g transform="translate({opened ? side * 310 : 0} 0)">
				<path
					d={side === -1
						? 'M250 170 555 170 590 205V765L555 800H250L205 755V215Z'
						: 'M645 170 950 170 995 215V755L950 800H645L610 765V205Z'}
					fill="url(#metal)"
					stroke="#839093"
					stroke-width="3"
				/>
				{#each [0, 1, 2, 3, 4, 5, 6] as i}<path
						d="M{side === -1 ? 235 + i * 48 : 640 + i * 48} 200v570"
						stroke="url(#copper)"
						stroke-width="12"
					/>{/each}
				<path d="M{side === -1 ? 580 : 620} 215v530" stroke="#f5dfb5" stroke-width="5" />
			</g>
		{/each}
	</g>
	{#if frame === 4}
		<g stroke="#89979b" stroke-width="4">
			<path d="M480 785h630l-45 38H445Z" fill="url(#metal)" />
			{#each [0, 1, 2] as leaf}
				<g transform="translate({510 + leaf * 152} {280 - leaf * 52}) skewY({-12 + leaf * 8})">
					<rect width="205" height="420" rx="12" fill="url(#metal)" />
					<rect x="18" y="20" width="169" height="374" rx="5" fill="#889395" />
					<path d="M30 65h140" stroke="url(#copper)" stroke-width="16" />
					{#each [0, 1, 2, 3, 4] as row}
						<path
							d="M35 {112 + row * 48}h{row === 4 ? 78 : 130}"
							stroke="#fff0ce"
							stroke-width="6"
						/>
					{/each}
					<path d="M3 20v380" stroke="url(#copper)" stroke-width="10" />
				</g>
			{/each}
		</g>
	{:else if frame === 5}
		<g transform="translate(820 450)">
			<path d="M-210 305h420l45 30h-510Z" fill="url(#metal)" />
			<circle r="250" fill="url(#metal)" stroke="#889395" stroke-width="24" />
			<circle r="208" fill="#101719" stroke="url(#copper)" stroke-width="13" />
			<circle r="143" fill="url(#room)" stroke="#889395" stroke-width="5" />
			{#each [0, 1, 2, 3, 4, 5, 6, 7] as blade}
				<path
					d="M-36-205 50-198 89-98 12-113Z"
					fill={blade % 2 ? 'url(#metal)' : 'url(#copper)'}
					stroke="#89979b"
					stroke-width="2"
					transform="rotate({blade * 45 + 22})"
				/>
			{/each}
			<path d="M0 0 135-135" stroke="#fff0ce" stroke-width="5" />
			<circle r="10" fill="#fff0ce" />
		</g>
	{:else if frame === 6}
		<g fill="none" stroke="url(#copper)" stroke-width="9">
			<path d="m210 115 260 45m-290 40 260 45m-250 45 260 45" />
			<path d="m850 650 230 70m-250 0 230 70" />
		</g>
	{/if}
</svg>

<style>
	svg {
		display: block;
		width: 100%;
		height: 100%;
		max-width: 100%;
		object-fit: cover;
	}
	.inside {
		transform: scale(1.3);
	}
</style>
