/**
 * Mythic Bastionland — Realm → Foundry Scene Builder
 *
 * Converts a MB realm object (from MBRealmData.generateRealm) into the
 * hexcrawl dataset format consumed by HexcrawlBuilderSD.buildHexcrawl,
 * then fires that builder to create a Foundry scene.
 */

import { buildHexcrawl } from "./HexcrawlBuilderSD.mjs";
import { MB_MYTH_OMENS } from "./MBMythOmens.mjs";
import { pageRef } from "./MBRealmData.mjs";

const MODULE_ID = "mythicbastionland-extras";

// ── MB landscape → SDX biome key ─────────────────────────────────────────────

const MB_SCAPE_TO_BIOME = {
	'Marsh':  'swamp',
	'Heath':  'plains',
	'Crags':  'mountains',
	'Peaks':  'mountains',
	'Forest': 'forest',
	'Valley': 'forest',
	'Hills':  'hills',
	'Meadow': 'plains',
	'Bog':    'swamp',
	'Lakes':  'water',
	'Glades': 'forest',
	'Plain':  'plains',
};

// ── Colored terrain tiles (assets/Hexes/) ─────────────────────────────────────
// 572×500 — larger than one cell so edges overlap neighbors for a seamless look.

const COLORED_BIOME_TILES = {
	forest: {
		terrain: 'Forest',
		paths: [
			'assets/Hexes/Vegetation/Hex - Forest, mixed (lush).webp',
			'assets/Hexes/Vegetation/Hex - Forest, deciduous (lush).webp',
			'assets/Hexes/Vegetation/Hex - Forest, conifer (lush) 2.webp',
			'assets/Hexes/Vegetation/forest.webp',
		],
	},
	plains: {
		terrain: 'Plains',
		paths: [
			'assets/Hexes/Vegetation/Hex - Plains (lush) 1.webp',
			'assets/Hexes/Vegetation/Hex - Plains (lush) 2.webp',
			'assets/Hexes/Vegetation/Hex - Plains (lush) 3.webp',
			'assets/Hexes/Vegetation/Hex - Plains (lush) 4.webp',
			'assets/Hexes/Vegetation/Hex - Plains (lush) 5.webp',
		],
	},
	hills: {
		terrain: 'Hills',
		paths: [
			'assets/Hexes/Vegetation/Hex - Hills (lush) 1.webp',
			'assets/Hexes/Vegetation/Hex - Hills (lush) 2.webp',
			'assets/Hexes/Vegetation/Hex - Hills (lush) 3.webp',
			'assets/Hexes/Vegetation/Hex - Hills (lush) 4.webp',
			'assets/Hexes/Vegetation/Hex - Hills (lush) 5.webp',
		],
	},
	water: {
		terrain: 'Water',
		isWater: true,
		paths: [
			'assets/Hexes/Water/Hex - Base (ocean).webp',
			'assets/Hexes/Water/Hex - Water - Ocean (soft waves) 1.webp',
			'assets/Hexes/Water/Hex - Water - Ocean (soft waves) 2.webp',
			'assets/Hexes/Water/Hex - Water - Ocean (still water) 1.webp',
			'assets/Hexes/Water/Hex - Water - Ocean (still water) 2.webp',
			'assets/Hexes/Water/Hex - Water - Ocean (waves) 1.webp',
		],
	},
	swamp: {
		terrain: 'Swamp',
		paths: [
			'assets/Hexes/swamp/swamp2.webp',
			'assets/Hexes/swamp/swamp3.webp',
			'assets/Hexes/swamp/swamptrees.webp',
			'assets/Hexes/swamp/Hex - Water - Swamp (still water) 1.webp',
			'assets/Hexes/swamp/Hex - Water - Swamp (still water) 2.webp',
		],
	},
	mountains: {
		terrain: 'Mountains',
		paths: [
			'assets/Hexes/Mountains/Hex - Mountains, medium (lush).webp',
			'assets/Hexes/Mountains/Hex - Mountains, low (lush).webp',
			'assets/Hexes/Mountains/Hex - Mountains, peak (lush).webp',
			'assets/Hexes/Mountains/Hex - Mountains, foothills (lush).webp',
			'assets/Hexes/Mountains/greenmountain.webp',
			'assets/Hexes/Mountains/greenmountains2.webp',
		],
	},
};

const COLORED_TILE_W = 572;
const COLORED_TILE_H = 500;

// ── Icon asset paths (relative to module root) ────────────────────────────────

const ICON = {
	holdingSeat:    'assets/symbols/Buildings/Buildings - City with Wall (blue).webp',
	holding:        'assets/symbols/Buildings/Buildings - City with no Walls (blue).webp',
	myth:           'assets/symbols/Buildings/dark-tower.webp',
	dwelling:       'assets/symbols/Buildings/Buildings - Farmhouse (lush).webp',
	sanctum:        'assets/symbols/Buildings/Buildings - Monastery (blue).webp',
	monument:       'assets/symbols/Buildings/Structures - Standing Stone (stone).webp',
	hazard:         null,
	curse:          null,
	ruin:           'assets/symbols/Details/Structures - Ruins (stone).webp',
};

const LANDMARK_ICON = { dwellings: ICON.dwelling, sanctums: ICON.sanctum, monuments: ICON.monument, hazards: ICON.hazard, curses: ICON.curse, ruins: ICON.ruin };

// ── Hex number encoding (matches HexcrawlBuilderSD.hexNumToColRow) ────────────
// num = row * 100 + (col + 1)  because hexcrawl col is 1-indexed

function mbHexToNum(mbHex) {
	return mbHex.row * 100 + (mbHex.col + 1);
}

// ── Build hexcrawl dataset regions from realm hexes ───────────────────────────

function buildRegions(realm) {
	const biomeToNums = new Map();
	for (const h of realm.hexes) {
		if (!h.terrain) continue; // ocean hexes are the default (water)
		const biome = MB_SCAPE_TO_BIOME[h.terrain] ?? 'plains';
		const num   = mbHexToNum(h);
		if (!biomeToNums.has(biome)) biomeToNums.set(biome, []);
		biomeToNums.get(biome).push(num);
	}
	return Array.from(biomeToNums.entries()).map(([biome, hexNums]) => ({ biome, hexes: hexNums }));
}

// ── Build keyed hex entries (holdings, myths, landmarks) ──────────────────────

function holdingDesc(h) {
	const parts = [
		`Ruler: ${h.rulerName ? h.rulerName + ', ' : ''}${h.ruler}`,
		`Exterior: ${h.exterior}`,
		`Bailey: ${h.bailey}`,
		`Keep: ${h.keep}`,
		`Woe: ${h.woe}`,
		`Drama: ${h.drama}`,
		`Desire: ${h.desire}`,
		`Appearance: ${h.appearance}`,
		`Personality: ${h.personality}`,
		`Quest: ${h.quest}`,
	];
	if (h.rels.length) {
		h.rels.forEach(r => parts.push(`Relation to ${r.to} (${r.name}): ${r.rel}`));
	}
	return parts.join('\n');
}

function buildHexEntries(realm) {
	const entries = [];
	const hexAt = mbHex => realm.hexes[mbHex.row * realm.cols + mbHex.col];

	// Holdings
	for (const h of realm.holdings) {
		const srcHex = hexAt(h.hex);
		entries.push({
			num:     mbHexToNum(h.hex),
			name:    `${h.seat ? '★ Seat of Power — ' : ''}${h.name} [${h.label}]`,
			terrain: srcHex?.terrain ?? '',
			icon:    h.seat ? ICON.holdingSeat : ICON.holding,
			desc:    holdingDesc(h),
		});
	}

	// Myths
	for (const m of realm.myths) {
		const srcHex = hexAt(m.hex);
		entries.push({
			num:     mbHexToNum(m.hex),
			name:    `Myth ${m.number}: ${m.name}`,
			terrain: srcHex?.terrain ?? '',
			icon:    ICON.myth,
			desc:    `A Myth hex. Six Omens reveal themselves as Knights explore. The hex's terrain is shaped by the Myth.`,
		});
	}

	// Landmarks
	for (const [type, lms] of Object.entries(realm.landmarks)) {
		const icon = LANDMARK_ICON[type];
		for (const lm of lms) {
			const srcHex = hexAt(lm.hex);
			entries.push({
				num:     mbHexToNum(lm.hex),
				name:    lm.description,
				terrain: srcHex?.terrain ?? '',
				icon:    icon ?? undefined,
				desc:    lm.description,
			});
		}
	}

	return entries;
}

// ── Hex coordinate label (matches SDX overlay: A1 … L12) ─────────────────────

function hexCoordLabel(mbHex) {
	const letter = String.fromCharCode(65 + mbHex.col); // A-L
	return `${letter}${mbHex.row + 1}`;
}

// ── Shared label map ──────────────────────────────────────────────────────────

const LTYPE_LABEL = {
	dwellings: 'Dwellings', sanctums: 'Sanctums', monuments: 'Monuments',
	hazards: 'Hazards', curses: 'Curses', ruins: 'Ruins',
};

const LTYPE_SINGULAR = {
	dwellings: 'Dwelling', sanctums: 'Sanctum', monuments: 'Monument',
	hazards: 'Hazard', curses: 'Curse', ruins: 'Ruin',
};

// ── Myth journal page content ─────────────────────────────────────────────────

function mythPageContent(m) {
	const omens = MB_MYTH_OMENS[m.name] ?? [];
	const omenItems = omens.length
		? omens.map(text => `<li><p>${text}</p><p><em>GM notes:</em></p></li>`).join('')
		: '<li></li><li></li><li></li><li></li><li></li><li></li>';
	const pg = pageRef(m.name);
	const bookRef = pg ? `<p><em>Rulebook p.${pg}</em></p>` : '';
	return `<p><strong>Hex:</strong> ${hexCoordLabel(m.hex)}</p>${bookRef}`
		+ `<h2>Omens</h2><ol>${omenItems}</ol>`
		+ `<h2>GM Notes</h2><p></p>`;
}

// ── Individual myth journals ──────────────────────────────────────────────────

/**
 * Create one JournalEntry per myth, suitable for compendium storage.
 * Returns an array of { myth, journal } pairs in myth.number order.
 */
async function buildMythJournals(realm, opts = {}) {
	const entries = [];
	for (const m of realm.myths) {
		const name = `Myth ${m.number}: ${m.name}`;
		if (opts.overwrite) {
			const existing = game.journal.filter(j => j.name === name);
			if (existing.length) await JournalEntry.deleteDocuments(existing.map(j => j.id));
		}
		const [journal] = await JournalEntry.createDocuments([{
			name,
			folder: opts.folderId ?? null,
			pages: [{
				name: m.name,
				type: 'text',
				sort: 10000,
				text: { format: 1, content: mythPageContent(m) },
			}],
			flags: { [MODULE_ID]: { mbMythNumber: m.number } },
		}]);
		entries.push({ myth: m, journal });
	}
	return entries;
}

// ── Realm journal ─────────────────────────────────────────────────────────────

async function buildRealmJournalDoc(realm, mythEntries, opts = {}) {
	const journalName = opts.journalName || realm.name;

	if (opts.overwrite) {
		const existing = game.journal.filter(j => j.name === journalName);
		if (existing.length) await JournalEntry.deleteDocuments(existing.map(j => j.id));
	}

	const pages = [];
	let sort = 0;
	const S = () => (sort += 10000);

	// ── Overview (no h1 — Foundry shows page name as heading) ────────────────
	const holdingRows = realm.holdings.map(h =>
		`<tr><td><strong>${h.seat ? '★ ' : ''}${h.label}. ${h.name}</strong></td><td>${hexCoordLabel(h.hex)}</td><td>${h.rulerName ? h.rulerName + ', ' : ''}${h.ruler}</td></tr>`
	).join('');
	const mythLinkRows = mythEntries.map(({ myth, journal }) =>
		`<tr><td><strong>Myth ${myth.number}</strong></td><td>${hexCoordLabel(myth.hex)}</td><td>@UUID[JournalEntry.${journal.id}]{${myth.name}}</td></tr>`
	).join('');
	let landmarkSummary = '';
	for (const [type, lms] of Object.entries(realm.landmarks)) {
		if (!lms.length) continue;
		landmarkSummary += `<li>${LTYPE_LABEL[type] ?? type}: ${lms.length}</li>`;
	}

	pages.push({ name: 'Overview', type: 'text', sort: S(), text: { format: 1, content:
		`<h2>Holdings</h2><table><thead><tr><th>Holding</th><th>Hex</th><th>Ruler</th></tr></thead><tbody>${holdingRows}</tbody></table>`
		+ `<h2>Active Myths</h2><table><thead><tr><th></th><th>Hex</th><th>Myth</th></tr></thead><tbody>${mythLinkRows}</tbody></table>`
		+ `<h2>Landmarks</h2><ul>${landmarkSummary}</ul>`
	} });

	// ── Holdings ──────────────────────────────────────────────────────────────
	for (const h of realm.holdings) {
		const terrain = h.character ? `${h.character} ${h.terrain}` : h.terrain;
		const relsHtml = h.rels.length
			? `<h3>Relations</h3><ul>${h.rels.map(r => `<li><strong>Re ${r.to} (${r.name}):</strong> ${r.rel}</li>`).join('')}</ul>`
			: '';
		pages.push({ name: `${h.seat ? '★ ' : ''}${h.label}. ${h.name}`, type: 'text', sort: S(), text: { format: 1, content:
			`<p><strong>Hex:</strong> ${hexCoordLabel(h.hex)} &nbsp;|&nbsp; <strong>Terrain:</strong> ${terrain}</p>`
			+ `<table><tbody>`
			+ `<tr><th>Ruler</th><td>${h.rulerName ? h.rulerName + ', ' : ''}${h.ruler}</td></tr>`
			+ `<tr><th>Exterior</th><td>${h.exterior}</td></tr>`
			+ `<tr><th>Bailey</th><td>${h.bailey}</td></tr>`
			+ `<tr><th>Keep</th><td>${h.keep}</td></tr>`
			+ `<tr><th>Woe</th><td>${h.woe}</td></tr>`
			+ `<tr><th>Drama</th><td>${h.drama}</td></tr>`
			+ `<tr><th>Desire</th><td>${h.desire}</td></tr>`
			+ `<tr><th>Appearance</th><td>${h.appearance}</td></tr>`
			+ `<tr><th>Personality</th><td>${h.personality}</td></tr>`
			+ `<tr><th>Quest</th><td>${h.quest}</td></tr>`
			+ `</tbody></table>`
			+ relsHtml
		} });
	}

	// ── Active Myths — links to individual myth journals ──────────────────────
	const mythLinksContent = mythEntries.map(({ myth, journal }) =>
		`<p><strong>Myth ${myth.number} — Hex ${hexCoordLabel(myth.hex)}:</strong> @UUID[JournalEntry.${journal.id}]{${myth.name}}</p>`
	).join('\n');
	pages.push({ name: 'Active Myths', type: 'text', sort: S(), text: { format: 1, content: mythLinksContent } });

	// ── Landmarks — one page per location ─────────────────────────────────────
	for (const [type, lms] of Object.entries(realm.landmarks)) {
		if (!lms.length) continue;
		const singular = LTYPE_SINGULAR[type] ?? type;
		for (const lm of lms) {
			pages.push({ name: `${singular}: ${lm.description}`, type: 'text', sort: S(), text: { format: 1, content:
				`<p><strong>Hex:</strong> ${hexCoordLabel(lm.hex)}</p>`
				+ `<h2>GM Notes</h2><p></p>`
			} });
		}
	}

	// ── Barriers ──────────────────────────────────────────────────────────────
	const barrierHexes = realm.hexes
		.filter(h => h.barrier)
		.sort((a, b) => a.row - b.row || a.col - b.col);
	if (barrierHexes.length) {
		const barrierRows = barrierHexes
			.map(h => `<tr><td>${hexCoordLabel(h)}</td><td>${h.terrain ?? ''}</td></tr>`)
			.join('');
		pages.push({ name: 'Barriers', type: 'text', sort: S(), text: { format: 1, content:
			`<p>Barriers mark hexes where passage between adjacent hexes is blocked or severely hindered — steep crags, sheer cliffs, dense marsh, or similar impassable terrain. Color these hexes on the map to indicate restricted movement.</p>`
			+ `<table><thead><tr><th>Hex</th><th>Terrain</th></tr></thead><tbody>${barrierRows}</tbody></table>`
		} });
	}

	const [journal] = await JournalEntry.createDocuments([{ name: journalName, folder: opts.folderId ?? null, pages }]);
	return journal;
}

// ── Public journal builder ────────────────────────────────────────────────────

/**
 * Build the realm JournalEntry plus one JournalEntry per myth.
 * Returns { realmJournal, mythEntries: [{myth, journal}] }.
 */
export async function buildMBRealmJournals(realm, opts = {}) {
	if (!game.user?.isGM) { ui.notifications?.error("SDX | Only a GM can build journals."); return null; }
	const folderName = opts.journalName || realm.name;

	if (opts.overwrite) {
		const existingFolders = game.folders.filter(f => f.name === folderName && f.type === 'JournalEntry');
		if (existingFolders.length) {
			await Folder.deleteDocuments(existingFolders.map(f => f.id), { deleteContents: true });
		}
	}
	const [folder] = await Folder.createDocuments([{ name: folderName, type: 'JournalEntry' }]);

	const subOpts = { ...opts, folderId: folder.id, overwrite: false };
	const mythEntries = await buildMythJournals(realm, subOpts);
	const realmJournal = await buildRealmJournalDoc(realm, mythEntries, subOpts);
	return { realmJournal, mythEntries };
}

// ── Note pin placement ────────────────────────────────────────────────────────

const NOTE_ICON = {
	holdingSeat: 'icons/svg/castle.svg',
	holding:     'icons/svg/tower-flag.svg',
	myth:        'icons/svg/eye.svg',
	dwellings:   'icons/svg/house.svg',
	sanctums:    'icons/svg/temple.svg',
	monuments:   'icons/svg/obelisk.svg',
	hazards:     'icons/svg/hazard.svg',
	curses:      'icons/svg/skull.svg',
	ruins:       'icons/svg/ruins.svg',
};

async function buildMBRealmNotes(scene, realmJournal, realm, mythEntries) {
	const pageByName = new Map(realmJournal.pages.map(p => [p.name, p]));
	// myth number → individual myth journal
	const mythJournalByNum = new Map(mythEntries.map(({ myth, journal }) => [myth.number, journal]));

	const noteData = [];

	// ── Holdings ──────────────────────────────────────────────────────────────
	for (const h of realm.holdings) {
		const pageName = `${h.seat ? '★ ' : ''}${h.label}. ${h.name}`;
		const page = pageByName.get(pageName);
		const center = canvas.grid.getCenterPoint({ i: h.hex.row, j: h.hex.col });
		noteData.push({
			entryId:  realmJournal.id,
			pageId:   page?.id,
			x: Math.round(center.x),
			y: Math.round(center.y),
			texture:  { src: h.seat ? NOTE_ICON.holdingSeat : NOTE_ICON.holding },
			iconSize: 48,
			text:     h.name,
			fontSize: 24,
			textAnchor: CONST.TEXT_ANCHOR_POINTS.BOTTOM,
			flags: { [MODULE_ID]: { mbNote: 'holding' } },
		});
	}

	// ── Myths — link directly to each myth's own journal ─────────────────────
	for (const m of realm.myths) {
		const mythJournal = mythJournalByNum.get(m.number);
		if (!mythJournal) continue;
		const center = canvas.grid.getCenterPoint({ i: m.hex.row, j: m.hex.col });
		noteData.push({
			entryId:  mythJournal.id,
			pageId:   mythJournal.pages.contents[0]?.id,
			x: Math.round(center.x),
			y: Math.round(center.y),
			texture:  { src: NOTE_ICON.myth },
			iconSize: 40,
			text:     `Myth ${m.number}`,
			fontSize: 20,
			textAnchor: CONST.TEXT_ANCHOR_POINTS.BOTTOM,
			flags: { [MODULE_ID]: { mbNote: 'myth' } },
		});
	}

	// ── Landmarks — each pin links to its own page ────────────────────────────
	for (const [type, lms] of Object.entries(realm.landmarks)) {
		const singular = LTYPE_SINGULAR[type] ?? type;
		const icon = NOTE_ICON[type] ?? 'icons/svg/book.svg';
		for (const lm of lms) {
			const page = pageByName.get(`${singular}: ${lm.description}`);
			const center = canvas.grid.getCenterPoint({ i: lm.hex.row, j: lm.hex.col });
			noteData.push({
				entryId:  realmJournal.id,
				pageId:   page?.id,
				x: Math.round(center.x),
				y: Math.round(center.y),
				texture:  { src: icon },
				iconSize: 36,
				text:     lm.description,
				fontSize: 16,
				textAnchor: CONST.TEXT_ANCHOR_POINTS.BOTTOM,
				flags: { [MODULE_ID]: { mbNote: type } },
			});
		}
	}

	if (!noteData.length) return 0;
	await scene.createEmbeddedDocuments("Note", noteData);
	return noteData.length;
}

// ── Public scene builder ──────────────────────────────────────────────────────

/**
 * Build a Foundry hex scene from a generated MB realm, including journals and
 * clickable note pins for holdings, myths, and landmarks.
 * @param {object}  realm    From MBRealmData.generateRealm()
 * @param {object}  [opts]
 * @param {string}  [opts.sceneName]  Defaults to realm.name
 * @param {boolean} [opts.overwrite]  Delete any existing scene with the same name first
 * @returns {Promise<object|null>}    HexcrawlBuilderSD result summary
 */
export async function buildMBRealmScene(realm, opts = {}) {
	const name = opts.sceneName || realm.name;
	const overwrite = opts.overwrite ?? false;

	const dataset = {
		name,
		grid: { cols: realm.cols, rows: realm.rows + 1, distance: 6, units: 'mi' },
		terrain: { default: 'water', regions: buildRegions(realm) },
		biomeTiles:  COLORED_BIOME_TILES,
		terrainTile: { w: COLORED_TILE_W, h: COLORED_TILE_H },
		border: 1,
		hexes: buildHexEntries(realm),
	};

	const summary = await buildHexcrawl(dataset, { sceneName: name, overwrite });
	if (!summary) return null;

	const { realmJournal, mythEntries } = await buildMBRealmJournals(realm, { journalName: name, overwrite });

	if (realmJournal) {
		const scene = game.scenes.get(summary.sceneId);
		const noteCount = await buildMBRealmNotes(scene, realmJournal, realm, mythEntries);
		ui.notifications?.info(`SDX | MB Realm built: ${noteCount} map notes linked to journals.`);
	}

	return summary;
}
