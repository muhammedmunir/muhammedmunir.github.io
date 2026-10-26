import { getChipAction, type ExhibitAction, type ExhibitView } from './exhibit-navigation';
import type { Locale } from './spine-data';

export interface ExhibitPalette {
	background: string;
	surface: string;
	text: string;
	muted: string;
	accent: string;
	border: string;
	hover: string;
	onAccent: string;
	fontBody: string;
	fontMono: string;
	online?: string;
	halo?: string;
}

export interface ScreenHitRegion {
	id: string;
	x: number;
	y: number;
	width: number;
	height: number;
	label: string;
	action: ExhibitAction;
	disabled?: boolean;
}

export interface ExhibitScreenState {
	view: ExhibitView;
	locale: Locale;
	inspecting: boolean;
	canBack: boolean;
	/** Indeks papan dan halaman bermula pada sifar. */
	index: number;
	total: number;
	page: number;
	hoveredId: string | null;
	focusedId: string | null;
	pressedId: string | null;
	avatar?: CanvasImageSource | null;
}

export const EXHIBIT_MIN_WIDTH = 320;
export const EXHIBIT_MIN_HEIGHT = 240;
export const EXHIBIT_TOUCH_SIZE = 44;

interface TypeStyle {
	size: number;
	line: number;
	weight: number;
	family: 'fontBody' | 'fontMono';
	tone: 'text' | 'muted' | 'accent';
}

interface Control {
	id: string;
	label: string;
	lines: string[];
	action: ExhibitAction;
	width: number;
	height: number;
	marker: boolean;
	disabled?: boolean;
}

type FlowRow =
	| { kind: 'text'; text: string; style: TypeStyle; height: number }
	| { kind: 'controls'; controls: Control[]; height: number }
	| { kind: 'space'; height: number };

const GAP = 8;
const CONTROL_PADDING = 12;
const MARKER_WIDTH = 20;
const words = {
	ms: {
		back: 'Kembali',
		close: 'Tutup',
		board: 'Papan',
		page: 'Halaman',
		previous: 'Sebelumnya',
		next: 'Seterusnya',
		previousBoard: 'Papan sebelumnya',
		nextBoard: 'Papan seterusnya',
		previousPage: 'Halaman sebelumnya',
		nextPage: 'Halaman seterusnya',
		context: 'Konteks & teknologi',
		architecture: 'SENI BINA',
		links: 'Pautan & rekod',
		open: 'Buka papan'
	},
	en: {
		back: 'Back',
		close: 'Close',
		board: 'Board',
		page: 'Page',
		previous: 'Previous',
		next: 'Next',
		previousBoard: 'Previous board',
		nextBoard: 'Next board',
		previousPage: 'Previous page',
		nextPage: 'Next page',
		context: 'Context & technology',
		architecture: 'ARCHITECTURE',
		links: 'Links & records',
		open: 'Open board'
	}
} satisfies Record<Locale, Record<string, string>>;

function setType(ctx: CanvasRenderingContext2D, style: TypeStyle, palette: ExhibitPalette) {
	ctx.font = `${style.weight} ${style.size}px ${palette[style.family]}`;
	ctx.textAlign = 'left';
	ctx.textBaseline = 'top';
}

function paintText(
	ctx: CanvasRenderingContext2D,
	value: string,
	x: number,
	y: number,
	style: TypeStyle,
	palette: ExhibitPalette,
	color = palette[style.tone]
) {
	setType(ctx, style, palette);
	ctx.fillStyle = color;
	ctx.fillText(value, x, y + (style.line - style.size) / 2);
}

// Perkataan panjang (e-mel, URL) dipotong pada aksara, bukan dibuang.
function wrap(ctx: CanvasRenderingContext2D, value: string, width: number): string[] {
	const result: string[] = [];
	for (const paragraph of value.split('\n')) {
		if (!paragraph.trim()) {
			result.push('');
			continue;
		}
		let line = '';
		for (const word of paragraph.trim().split(/\s+/u)) {
			const candidate = line ? `${line} ${word}` : word;
			if (ctx.measureText(candidate).width <= width) {
				line = candidate;
				continue;
			}
			if (line) result.push(line);
			let remaining = Array.from(word);
			while (remaining.length && ctx.measureText(remaining.join('')).width > width) {
				let low = 1;
				let high = remaining.length;
				while (low < high) {
					const middle = Math.ceil((low + high) / 2);
					if (ctx.measureText(remaining.slice(0, middle).join('')).width <= width) low = middle;
					else high = middle - 1;
				}
				result.push(remaining.slice(0, low).join(''));
				remaining = remaining.slice(low);
			}
			line = remaining.join('');
		}
		if (line) result.push(line);
	}
	return result;
}

// Elipsis hanya untuk pratonton dan kod chrome, tidak untuk isi pemeriksaan.
function excerpt(ctx: CanvasRenderingContext2D, value: string, width: number): string {
	if (ctx.measureText(value).width <= width) return value;
	const characters = Array.from(value);
	while (characters.length && ctx.measureText(`${characters.join('')}…`).width > width) {
		characters.pop();
	}
	return `${characters.join('')}…`;
}

function addText(
	rows: FlowRow[],
	ctx: CanvasRenderingContext2D,
	value: string,
	width: number,
	style: TypeStyle,
	palette: ExhibitPalette
) {
	if (!value) return;
	setType(ctx, style, palette);
	for (const line of wrap(ctx, value, width)) {
		rows.push(
			line
				? { kind: 'text', text: line, style, height: style.line }
				: { kind: 'space', height: GAP }
		);
	}
}

function makeControls(
	ctx: CanvasRenderingContext2D,
	id: string,
	label: string,
	action: ExhibitAction,
	width: number,
	maxHeight: number,
	style: TypeStyle,
	palette: ExhibitPalette,
	fullWidth: boolean
): Control[] {
	setType(ctx, style, palette);
	const inset = CONTROL_PADDING * 2 + MARKER_WIDTH;
	const controlWidth = fullWidth
		? width
		: Math.min(
				width,
				Math.max(EXHIBIT_TOUCH_SIZE, Math.ceil(ctx.measureText(label).width + inset))
			);
	const lines = wrap(ctx, label, controlWidth - inset);
	const linesPerPart = Math.max(1, Math.floor((maxHeight - 16) / style.line));
	const controls: Control[] = [];
	for (let start = 0; start < lines.length; start += linesPerPart) {
		const part = lines.slice(start, start + linesPerPart);
		controls.push({
			id: lines.length > linesPerPart ? `${id}:part-${controls.length}` : id,
			label,
			lines: part,
			action,
			width: controlWidth,
			height: Math.max(EXHIBIT_TOUCH_SIZE, part.length * style.line + 16),
			marker: true
		});
	}
	return controls;
}

function paginate(rows: FlowRow[], height: number): FlowRow[][] {
	const pages: FlowRow[][] = [[]];
	let used = 0;
	for (const row of rows) {
		if (row.kind === 'space' && used === 0) continue;
		if (used + row.height > height) {
			if (row.kind === 'space') continue;
			pages.push([]);
			used = 0;
		}
		pages[pages.length - 1].push(row);
		used += row.height;
	}
	return pages;
}

function paintControl(
	ctx: CanvasRenderingContext2D,
	control: Control,
	x: number,
	y: number,
	state: ExhibitScreenState,
	style: TypeStyle,
	palette: ExhibitPalette,
	regions: ScreenHitRegion[]
) {
	const disabled = control.disabled === true;
	const pressed = !disabled && state.pressedId === control.id;
	const hovered = !disabled && state.hoveredId === control.id;
	const focused = !disabled && state.focusedId === control.id;
	ctx.fillStyle = pressed ? palette.accent : hovered ? palette.hover : palette.surface;
	ctx.fillRect(x, y, control.width, control.height);
	ctx.lineWidth = 1;
	ctx.strokeStyle = hovered ? palette.accent : palette.border;
	ctx.strokeRect(x + 0.5, y + 0.5, control.width - 1, control.height - 1);
	if (focused) {
		ctx.strokeStyle = palette.accent;
		ctx.lineWidth = 2;
		ctx.strokeRect(x + 3, y + 3, control.width - 6, control.height - 6);
	}
	const color = disabled ? palette.muted : pressed ? palette.onAccent : palette.text;
	const textY = y + (control.height - control.lines.length * style.line) / 2;
	setType(ctx, style, palette);
	control.lines.forEach((line, index) => {
		const textX = control.marker
			? x + CONTROL_PADDING
			: x + (control.width - ctx.measureText(line).width) / 2;
		paintText(ctx, line, textX, textY + index * style.line, style, palette, color);
	});
	if (control.marker) {
		paintText(
			ctx,
			'→',
			x + control.width - CONTROL_PADDING - 12,
			y + (control.height - style.line) / 2,
			style,
			palette,
			pressed ? palette.onAccent : palette.accent
		);
	}
	regions.push({
		id: control.id,
		x,
		y,
		width: control.width,
		height: control.height,
		label: control.label,
		action: control.action,
		disabled
	});
}

/** Rounded rectangle yang selamat untuk konteks 2D terhad (mock ujian, pelayar lama). */
function roundedRect(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	width: number,
	height: number,
	radius: number
) {
	const r = Math.max(0, Math.min(radius, width / 2, height / 2));
	if (typeof ctx.roundRect === 'function') {
		ctx.beginPath();
		ctx.roundRect(x, y, width, height, r);
		return;
	}
	if (typeof ctx.arc !== 'function') {
		// Konteks terhad (ujian): bina laluan segi empat mudah tanpa lengkok.
		if (typeof ctx.rect === 'function') {
			ctx.rect(x, y, width, height);
			return;
		}
		if (typeof ctx.moveTo === 'function' && typeof ctx.lineTo === 'function') {
			ctx.beginPath();
			ctx.moveTo(x, y);
			ctx.lineTo(x + width, y);
			ctx.lineTo(x + width, y + height);
			ctx.lineTo(x, y + height);
			ctx.closePath();
		}
		return;
	}
	ctx.beginPath();
	ctx.moveTo(x + r, y);
	ctx.lineTo(x + width - r, y);
	ctx.arc(x + width - r, y + r, r, -Math.PI / 2, 0);
	ctx.lineTo(x + width, y + height - r);
	ctx.arc(x + width - r, y + height - r, r, 0, Math.PI / 2);
	ctx.lineTo(x + r, y + height);
	ctx.arc(x + r, y + height - r, r, Math.PI / 2, Math.PI);
	ctx.lineTo(x, y + r);
	ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5);
	ctx.closePath();
}

/** Papan pameran sentiasa memaparkan butiran penuh yang boleh dibaca tanpa klik. */
function preview(
	ctx: CanvasRenderingContext2D,
	state: ExhibitScreenState,
	palette: ExhibitPalette,
	x: number,
	width: number,
	height: number,
	padding: number,
	body: TypeStyle,
	title: TypeStyle,
	meta: TypeStyle
) {
	const labels = words[state.locale];
	const ruleY = padding + meta.line + 10;
	const hintY = height - padding - EXHIBIT_TOUCH_SIZE;
	const roomBelowRule = hintY - ruleY - 20;
	const avatarSize =
		state.avatar && roomBelowRule >= 100 && width >= 340
			? Math.min(68, Math.max(44, Math.round(Math.min(width * 0.12, height * 0.16))))
			: 0;

	setType(ctx, meta, palette);
	paintText(ctx, excerpt(ctx, state.view.code, width * 0.62), x, padding, meta, palette);
	const counter = `${state.total ? Math.min(state.total, Math.max(1, state.index + 1)) : 0} / ${state.total}`;
	const counterWidth = ctx.measureText(counter).width;
	paintText(ctx, counter, x + width - counterWidth, padding, meta, palette);
	// ONLINE merujuk monitor pameran tempatan, bukan status pelayan projek.
	if (width >= 440) {
		const statusX = x + width - counterWidth - ctx.measureText('ONLINE').width - 40;
		ctx.fillStyle = palette.online ?? palette.accent;
		ctx.beginPath();
		ctx.arc(statusX - 12, padding + meta.line / 2, 3, 0, Math.PI * 2);
		ctx.fill();
		paintText(ctx, 'ONLINE', statusX, padding, meta, palette, palette.online ?? palette.accent);
	}

	ctx.fillStyle = palette.border;
	ctx.fillRect(x, ruleY, width, 1);
	ctx.fillStyle = palette.accent;
	ctx.fillRect(x, ruleY, Math.min(width, Math.round(width * 0.18)), 2);

	const avatarY = ruleY + 14;
	if (avatarSize > 0 && state.avatar) {
		paintAvatar(ctx, state.avatar, x + width - avatarSize, avatarY, avatarSize, palette);
	}

	const chipStyle: TypeStyle = { ...meta, size: 13, tone: 'text' };
	const chipHeight = chipStyle.line + 12;
	const chipRows: Array<Array<{ label: string; width: number }>> = [];
	if (height >= 460 && state.view.tech.length) {
		setType(ctx, chipStyle, palette);
		let row: Array<{ label: string; width: number }> = [];
		let used = 0;
		for (const chip of state.view.tech) {
			const label = excerpt(ctx, chip, width - 24);
			const chipWidth = ctx.measureText(label).width + 24;
			if (used + chipWidth > width && row.length) {
				chipRows.push(row);
				row = [];
				used = 0;
			}
			row.push({ label, width: chipWidth });
			used += chipWidth + GAP;
		}
		if (row.length) chipRows.push(row);
		chipRows.splice(height >= 700 ? 3 : 2);
	}
	const detailsTop = chipRows.length
		? hintY - GAP * 3 - (meta.line + 12) - chipRows.length * (chipHeight + GAP)
		: hintY - GAP;
	let cursorY = ruleY + 18;
	const titleWidth = avatarSize > 0 ? width - avatarSize - 16 : width;

	// Tajuk penuh diutamakan; cip mempunyai ruang sendiri tanpa ditolak ringkasan.
	setType(ctx, title, palette);
	const titleLines = wrap(ctx, state.view.title[state.locale], titleWidth);
	const titleRoom = detailsTop - cursorY;
	const maxTitleLines = Math.max(1, Math.floor(titleRoom / title.line));
	const titleCount = Math.min(maxTitleLines, titleLines.length);
	for (let index = 0; index < titleCount; index++) {
		const isLast = index === titleCount - 1 && titleLines.length > titleCount;
		paintText(
			ctx,
			isLast
				? excerpt(ctx, `${titleLines[index]} ${titleLines[index + 1]}`, titleWidth)
				: titleLines[index],
			x,
			cursorY,
			title,
			palette
		);
		cursorY += title.line;
	}
	cursorY += 6;

	// Subtajuk: konteks CV (syarikat, tempoh, lokasi).
	const subtitle = state.view.subtitle[state.locale];
	if (subtitle && cursorY + meta.line * 2 < detailsTop) {
		const subStyle: TypeStyle = { ...body, size: Math.max(12, body.size - 4), tone: 'accent' };
		setType(ctx, subStyle, palette);
		const subLines = wrap(ctx, subtitle, titleWidth);
		const subMax = Math.min(2, Math.floor((detailsTop - cursorY - GAP) / subStyle.line));
		for (let index = 0; index < Math.min(subMax, subLines.length); index++) {
			paintText(ctx, subLines[index], x, cursorY, subStyle, palette);
			cursorY += subStyle.line;
		}
		cursorY += 8;
	}

	// Pastikan ringkasan bermula di bawah avatar sekiranya tajuk/subtajuk lebih pendek daripada avatar.
	if (avatarSize > 0) {
		cursorY = Math.max(cursorY, avatarY + avatarSize + 12);
	}

	// Ringkasan: diisi mengikut ruang yang tinggal, bukan tetap 3 baris.
	setType(ctx, body, palette);
	const summaryLines = wrap(ctx, state.view.summary[state.locale].replace(/\s+/gu, ' '), width);
	const summaryRoom = detailsTop - cursorY - GAP * 2;
	const summaryCount = Math.max(
		0,
		Math.min(summaryLines.length, Math.floor(summaryRoom / body.line))
	);
	for (let index = 0; index < summaryCount; index++) {
		const isLast = index === summaryCount - 1 && summaryLines.length > summaryCount;
		paintText(
			ctx,
			isLast
				? excerpt(ctx, `${summaryLines[index]} ${summaryLines[index + 1]}`, width)
				: summaryLines[index],
			x,
			cursorY,
			{ ...body, tone: 'muted' },
			palette
		);
		cursorY += body.line;
	}

	// Lencana seksyen menggunakan timbunan teknologi sebenar, tanpa dakwaan seni bina rekaan.
	if (chipRows.length) {
		setType(ctx, meta, palette);
		const badgeWidth = ctx.measureText(labels.architecture).width + 24;
		roundedRect(ctx, x, detailsTop, badgeWidth, meta.line + 12, 4);
		ctx.fillStyle = palette.surface;
		ctx.fill();
		ctx.strokeStyle = palette.accent;
		ctx.lineWidth = 1;
		ctx.stroke();
		paintText(ctx, labels.architecture, x + 12, detailsTop + 6, meta, palette, palette.accent);
		let chipY = detailsTop + meta.line + 20;
		for (const row of chipRows) {
			let chipX = x;
			for (const chip of row) {
				roundedRect(ctx, chipX + 0.5, chipY + 0.5, chip.width - 1, chipHeight - 1, chipHeight / 2);
				ctx.fillStyle = palette.surface;
				ctx.fill();
				ctx.strokeStyle = palette.border;
				ctx.lineWidth = 1;
				ctx.stroke();
				paintText(ctx, chip.label, chipX + 12, chipY + 6, chipStyle, palette);
				chipX += chip.width + GAP;
			}
			chipY += chipHeight + GAP;
		}
	}

	// Bar tindakan bawah: satu-satunya gesaan, bukan blok penuh yang bersaing dengan tajuk.
	roundedRect(ctx, x, hintY, width, EXHIBIT_TOUCH_SIZE, 6);
	ctx.fillStyle = palette.surface;
	ctx.fill();
	ctx.strokeStyle = palette.accent;
	ctx.lineWidth = 1;
	ctx.stroke();
	paintText(
		ctx,
		`${labels.open} →`,
		x + CONTROL_PADDING,
		hintY + (EXHIBIT_TOUCH_SIZE - body.line) / 2,
		{ ...body, tone: 'accent' },
		palette
	);
	const zoomHint = state.locale === 'ms' ? 'Klik untuk zoom' : 'Click to zoom';
	setType(ctx, meta, palette);
	if (ctx.measureText(zoomHint).width < width * 0.6) {
		paintText(
			ctx,
			zoomHint,
			x + width - CONTROL_PADDING - ctx.measureText(zoomHint).width,
			hintY + (EXHIBIT_TOUCH_SIZE - meta.line) / 2,
			meta,
			palette
		);
	}
}

/** Potret profil dilukis sebagai sebahagian daripada kanvas supaya ia tidak hilang pada setiap lukisan semula. */
function paintAvatar(
	ctx: CanvasRenderingContext2D,
	source: CanvasImageSource,
	x: number,
	y: number,
	size: number,
	palette: ExhibitPalette
) {
	if (typeof ctx.drawImage !== 'function') return;
	ctx.save();
	if (typeof ctx.beginPath === 'function' && typeof ctx.arc === 'function') {
		ctx.beginPath();
		ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
		if (typeof ctx.clip === 'function') ctx.clip();
	}
	ctx.drawImage(source, x, y, size, size);
	ctx.restore();
	if (typeof ctx.beginPath === 'function' && typeof ctx.arc === 'function') {
		const haloColor = palette.halo ?? '#38bdf8';
		const cx = x + size / 2;
		const cy = y + size / 2;
		ctx.save();
		ctx.strokeStyle = haloColor;
		ctx.globalAlpha = 0.32;
		ctx.lineWidth = Math.max(4, Math.round(size * 0.08));
		ctx.beginPath();
		ctx.arc(cx, cy, size / 2 + 1, 0, Math.PI * 2);
		ctx.stroke();
		ctx.globalAlpha = 1;
		ctx.lineWidth = Math.max(2, Math.round(size * 0.035));
		ctx.beginPath();
		ctx.arc(cx, cy, size / 2 - 1, 0, Math.PI * 2);
		ctx.stroke();
		ctx.restore();
	}
}

/** Canvas.width/height ialah piksel logik; penskalaan DPR diurus oleh pemanggil. */
export function drawExhibitScreen(
	canvas: HTMLCanvasElement,
	state: ExhibitScreenState,
	palette: ExhibitPalette
): { regions: ScreenHitRegion[]; page: number; pageCount: number } {
	const { width, height } = canvas;
	if (
		!Number.isFinite(width) ||
		!Number.isFinite(height) ||
		width < EXHIBIT_MIN_WIDTH ||
		height < EXHIBIT_MIN_HEIGHT
	) {
		throw new RangeError('Kanvas papan memerlukan sekurang-kurangnya 320 × 240 piksel logik.');
	}
	const ctx = canvas.getContext('2d');
	if (!ctx) return { regions: [], page: 0, pageCount: 1 };
	const labels = words[state.locale];
	const padding = height < 400 || width < 600 ? 16 : Math.min(32, Math.round(width / 32));
	const contentWidth = Math.min(960, width - padding * 2);
	const left = (width - contentWidth) / 2;
	const bodySize = height < 360 ? 16 : Math.min(20, Math.round(16 + (width - 320) / 220));
	const body: TypeStyle = {
		size: bodySize,
		line: Math.ceil(bodySize * 1.5),
		weight: 400,
		family: 'fontBody',
		tone: 'text'
	};
	const titleSize = height < 360 ? 20 : Math.round(bodySize * 1.6);
	const title: TypeStyle = {
		...body,
		size: titleSize,
		line: Math.ceil(titleSize * 1.3),
		weight: 600
	};
	const meta: TypeStyle = { size: 12, line: 18, weight: 500, family: 'fontMono', tone: 'muted' };
	const button: TypeStyle = {
		size: width < 600 ? 14 : 15,
		line: 20,
		weight: 500,
		family: 'fontBody',
		tone: 'text'
	};
	const regions: ScreenHitRegion[] = [];
	ctx.save();
	try {
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.globalAlpha = 1;
		ctx.clearRect(0, 0, width, height);
		ctx.fillStyle = palette.background;
		ctx.fillRect(0, 0, width, height);
		// Jalur aksen & bingkai HUD: monitor kekal tajam pada semua sudut kamera.
		ctx.fillStyle = palette.accent;
		ctx.fillRect(0, 0, width, Math.max(3, Math.round(height * 0.006)));
		ctx.strokeStyle = palette.border;
		ctx.lineWidth = 1;
		ctx.strokeRect(2.5, 2.5, width - 5, height - 5);
		if (!state.inspecting) {
			preview(ctx, state, palette, left, contentWidth, height, padding, body, title, meta);
			return { regions: [], page: 0, pageCount: 1 };
		}

		const contentTop = padding + EXHIBIT_TOUCH_SIZE + 16;
		const footerButtonsY = height - padding - EXHIBIT_TOUCH_SIZE;
		const footerLabelY = footerButtonsY - GAP - meta.line;
		const contentBottom = footerLabelY - 16;
		const contentHeight = contentBottom - contentTop;
		const avatarSize =
			state.avatar && contentHeight >= 200 && contentWidth >= 460
				? Math.min(96, Math.max(56, Math.round(Math.min(contentWidth * 0.12, contentHeight * 0.2))))
				: 0;
		const rows: FlowRow[] = [];
		const headerWidth = avatarSize > 0 ? contentWidth - avatarSize - GAP * 2 : contentWidth;
		addText(rows, ctx, state.view.title[state.locale], headerWidth, title, palette);
		rows.push({ kind: 'space', height: GAP });
		addText(
			rows,
			ctx,
			state.view.subtitle[state.locale],
			headerWidth,
			{ ...body, size: bodySize - 1, tone: 'muted' },
			palette
		);
		// Elak ringkasan melimpah ke bawah avatar: tajuk/subtajuk yang pendek diberi ruang tambahan.
		const headerHeight = rows.reduce((total, row) => total + row.height, 0);
		rows.push({
			kind: 'space',
			height: avatarSize > headerHeight ? avatarSize - headerHeight + 16 : 16
		});
		addText(rows, ctx, state.view.summary[state.locale], contentWidth, body, palette);
		if (state.view.tech.length) {
			rows.push({ kind: 'space', height: 16 });
			addText(rows, ctx, labels.context, contentWidth, meta, palette);
			rows.push({ kind: 'space', height: GAP });
			let chipRow: Control[] = [];
			let chipRowWidth = 0;
			const flushChips = () => {
				if (!chipRow.length) return;
				rows.push({
					kind: 'controls',
					controls: chipRow,
					height: Math.max(...chipRow.map((chip) => chip.height))
				});
				rows.push({ kind: 'space', height: GAP });
				chipRow = [];
				chipRowWidth = 0;
			};
			state.view.tech.forEach((chip, index) => {
				const action = getChipAction(state.view, chip);
				if (!action) {
					flushChips();
					// Maklumat pasif: teks biasa, tanpa kotak butang atau kawasan klik.
					addText(rows, ctx, chip, contentWidth, { ...body, tone: 'muted' }, palette);
					rows.push({ kind: 'space', height: GAP });
					return;
				}
				const controls = makeControls(
					ctx,
					`chip:${index}`,
					chip,
					action,
					contentWidth,
					contentHeight,
					button,
					palette,
					false
				);
				for (const control of controls) {
					if (chipRowWidth + (chipRow.length ? GAP : 0) + control.width > contentWidth)
						flushChips();
					chipRowWidth += (chipRow.length ? GAP : 0) + control.width;
					chipRow.push(control);
				}
			});
			flushChips();
		}
		if (state.view.actions.length) {
			rows.push({ kind: 'space', height: 16 });
			addText(rows, ctx, labels.links, contentWidth, meta, palette);
			rows.push({ kind: 'space', height: GAP });
			for (const item of state.view.actions) {
				for (const control of makeControls(
					ctx,
					`action:${item.id}`,
					item.label[state.locale],
					item.action,
					contentWidth,
					contentHeight,
					button,
					palette,
					true
				)) {
					rows.push({ kind: 'controls', controls: [control], height: control.height });
					rows.push({ kind: 'space', height: GAP });
				}
			}
		}
		const pages = paginate(rows, contentHeight);
		const page = Number.isFinite(state.page)
			? Math.max(0, Math.min(pages.length - 1, Math.floor(state.page)))
			: 0;
		// Potret hanya pada halaman pertama: di bawah bar chrome, sejajar tajuk, tidak menyentuh butang Tutup.
		if (page === 0 && avatarSize > 0 && state.avatar) {
			paintAvatar(
				ctx,
				state.avatar,
				left + contentWidth - avatarSize,
				contentTop,
				avatarSize,
				palette
			);
		}
		let y = contentTop;
		for (const row of pages[page]) {
			if (row.kind === 'text') paintText(ctx, row.text, left, y, row.style, palette);
			if (row.kind === 'controls') {
				let x = left;
				for (const control of row.controls) {
					paintControl(ctx, control, x, y, state, button, palette, regions);
					x += control.width + GAP;
				}
			}
			y += row.height;
		}

		const chrome = (
			id: string,
			label: string,
			display: string,
			action: ExhibitAction,
			x: number,
			y: number,
			width: number,
			disabled = false
		) => {
			paintControl(
				ctx,
				{
					id,
					label,
					lines: [display],
					action,
					width,
					height: EXHIBIT_TOUCH_SIZE,
					marker: false,
					disabled
				},
				x,
				y,
				state,
				button,
				palette,
				regions
			);
		};
		setType(ctx, button, palette);
		const backWidth = Math.max(
			80,
			Math.ceil(ctx.measureText(labels.back).width + CONTROL_PADDING * 2)
		);
		const closeWidth = Math.max(
			80,
			Math.ceil(ctx.measureText(labels.close).width + CONTROL_PADDING * 2)
		);
		chrome(
			'back',
			labels.back,
			labels.back,
			{ kind: 'back' },
			left,
			padding,
			backWidth,
			!state.canBack
		);
		chrome(
			'close',
			labels.close,
			labels.close,
			{ kind: 'close' },
			left + contentWidth - closeWidth,
			padding,
			closeWidth
		);
		setType(ctx, meta, palette);
		const codeWidth = contentWidth - backWidth - closeWidth - GAP * 2;
		const code = excerpt(ctx, state.view.code, codeWidth);
		paintText(
			ctx,
			code,
			left + backWidth + GAP + (codeWidth - ctx.measureText(code).width) / 2,
			padding + (EXHIBIT_TOUCH_SIZE - meta.line) / 2,
			meta,
			palette
		);

		ctx.fillStyle = palette.border;
		ctx.fillRect(left, footerLabelY - GAP, contentWidth, 1);
		const groupWidth = (contentWidth - 16) / 2;
		const controlWidth = (groupWidth - GAP) / 2;
		const total = Number.isFinite(state.total) ? Math.max(0, Math.floor(state.total)) : 0;
		const index = Number.isFinite(state.index)
			? Math.max(0, Math.min(Math.max(0, total - 1), Math.floor(state.index)))
			: 0;
		const groups = [
			{
				x: left,
				label: `${labels.board} ${total ? index + 1 : 0}/${total}`,
				previousId: 'previous',
				nextId: 'next',
				previousLabel: labels.previousBoard,
				nextLabel: labels.nextBoard,
				previous: { kind: 'previous' } as ExhibitAction,
				next: { kind: 'next' } as ExhibitAction,
				atStart: index === 0,
				atEnd: total <= 1 || index >= total - 1
			},
			{
				x: left + groupWidth + 16,
				label: `${labels.page} ${page + 1}/${pages.length}`,
				previousId: 'page-previous',
				nextId: 'page-next',
				previousLabel: labels.previousPage,
				nextLabel: labels.nextPage,
				previous: { kind: 'page', delta: -1 } as ExhibitAction,
				next: { kind: 'page', delta: 1 } as ExhibitAction,
				atStart: page === 0,
				atEnd: page === pages.length - 1
			}
		];
		for (const group of groups) {
			setType(ctx, meta, palette);
			paintText(
				ctx,
				group.label,
				group.x + (groupWidth - ctx.measureText(group.label).width) / 2,
				footerLabelY,
				meta,
				palette
			);
			setType(ctx, button, palette);
			const previousText = `← ${labels.previous}`;
			const nextText = `${labels.next} →`;
			chrome(
				group.previousId,
				group.previousLabel,
				ctx.measureText(previousText).width <= controlWidth - CONTROL_PADDING * 2
					? previousText
					: '←',
				group.previous,
				group.x,
				footerButtonsY,
				controlWidth,
				group.atStart
			);
			chrome(
				group.nextId,
				group.nextLabel,
				ctx.measureText(nextText).width <= controlWidth - CONTROL_PADDING * 2 ? nextText : '→',
				group.next,
				group.x + controlWidth + GAP,
				footerButtonsY,
				controlWidth,
				group.atEnd
			);
		}
		return { regions, page, pageCount: pages.length };
	} finally {
		ctx.restore();
	}
}

/** Sempadan kanan/bawah terbuka; kawalan dilumpuhkan tidak menerima klik. */
export function hitTestScreen(
	regions: ScreenHitRegion[],
	x: number,
	y: number
): ScreenHitRegion | null {
	if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
	for (let index = regions.length - 1; index >= 0; index--) {
		const region = regions[index];
		if (
			x >= region.x &&
			y >= region.y &&
			x < region.x + region.width &&
			y < region.y + region.height
		) {
			return region.disabled ? null : region;
		}
	}
	return null;
}

/** FOV menegak dalam darjah; fill ialah pecahan maksimum kedua-dua paksi viewport. */
export function getInspectDistance(
	width: number,
	height: number,
	aspect: number,
	fov: number,
	fill = 0.9
): number {
	if (
		![width, height, aspect, fov, fill].every(Number.isFinite) ||
		width <= 0 ||
		height <= 0 ||
		aspect <= 0 ||
		fov <= 0 ||
		fov >= 180 ||
		fill <= 0 ||
		fill > 1
	) {
		throw new RangeError('Dimensi, nisbah aspek dan FOV mesti sah; fill mesti dalam julat (0, 1].');
	}
	const distance = Math.max(height, width / aspect) / (2 * Math.tan((fov * Math.PI) / 360) * fill);
	if (!Number.isFinite(distance)) throw new RangeError('Jarak pemeriksaan melebihi julat nombor.');
	return distance;
}
