/**
 * Mythic Bastionland — Realm Generation Tables and Algorithms
 *
 * Pure JS, no Foundry API. Ported from the standalone HTML realm generator.
 * Call generateRealm(cols, rows) to get a fully-populated realm object.
 */

// ── TABLES ───────────────────────────────────────────────────────────────────

export const LAND_CHAR  = ['Barren','Dry','Grey','Sparse','Sharp','Teeming','Still','Soft','Overgrown','Vivid','Sodden','Lush'];
export const LAND_SCAPE = ['Marsh','Heath','Crags','Peaks','Forest','Valley','Hills','Meadow','Bog','Lakes','Glades','Plain'];

export const KNIGHTS = [
	['The True Knight','The Snare Knight','The Tourney Knight','The Bloody Knight','The Moss Knight','The War Knight','The Willow Knight','The Gilded Knight','The Saddle Knight','The Riddle Knight','The Talon Knight','The Barbed Knight'],
	['The Trail Knight','The Amber Knight','The Horde Knight','The Emerald Knight','The Chain Knight','The Banner Knight','The Pigeon Knight','The Shield Knight','The Whip Knight','The Seal Knight','The Horn Knight','The Dove Knight'],
	['The Story Knight','The Turtle Knight','The Key Knight','The Moat Knight','The Boulder Knight','The Tankard Knight','The Owl Knight','The Hooded Knight','The Lance Knight','The Questing Knight','The Ring Knight','The Forge Knight'],
	['The Rune Knight','The Gallows Knight','The Tome Knight','The Meteor Knight','The Gazer Knight','The Mule Knight','The Halo Knight','The Iron Knight','The Mirror Knight','The Dusk Knight','The Coin Knight','The Mock Knight'],
	['The Mask Knight','The Bone Knight','The Salt Knight','The Violet Knight','The Cosmic Knight','The Temple Knight','The Fox Knight','The Gull Knight','The Magpie Knight','The Reliquary Knight','The Vulture Knight','The Free Knight'],
	['The Silk Knight','The Tiger Knight','The Leaf Knight','The Glass Knight','The Hive Knight','The Ghoul Knight','The Weaver Knight','The Thunder Knight','The Dust Knight','The Fanged Knight','The Pearl Knight','The Rat Knight'],
];

export const MYTHS = [
	['The Plague','The Wall','The Shadow','The River','The Wyvern','The Goblin','The Forest','The Child','The Order','The Dead','The Underworld','The Wurm'],
	['The Pack','The Eye','The Blade','The Legion','The Imp','The Troll','The Demon','The Sea','The Elf','The Axe','The Dwarf','The Tower'],
	['The Chariot','The Desert','The Mountain','The Star','The Sun','The Moon','The Lion','The Wheel','The Cudgel','The Lizard','The Ogre','The Spider'],
	['The Coven','The Lich','The Wight','The Spectre','The Wraith','The Beast','The Judge','The Crown','The Boar','The Eagle','The Bat','The Toad'],
	['The Colossus','The Fortress','The Citadel','The Catacomb','The Hound','The Glade','The Tournament','The Bull','The Hydra','The Spire','The Sprite','The Hole'],
	['The Mist','The Gargoyle','The Changeling','The Inferno','The Harp','The Tree','The Pool','The Elephant','The Snail','The Cave','The Apparatus','The Rock'],
];

export const T = {
	HOLDING: [['Dark','Ruined','Hostile','Ancient','Ornate','Wild','Pristine','Fortified','Unfinished','Welcoming','Proud','Bright'],['Turrets','Tower','Wall','Battlements','Citadel','Gate','Spire','Dome','Beacons','Bridge','Pillars','Moat']],
	BAILEY:  [['Filthy','Abandoned','Joyous','Sophisticated','Industrious','Humble','Majestic','Hallowed','Rustic','Solemn','Bustling','Immaculate'],['Marketplace','Forge','Library','Fountain','Temple','Forum','Tomb','Garden','Hall','Workshops','Arena','Garrison']],
	KEEP:    [['Hearth','Throne','Musicians','Pool','Advisers','Servants','Shrine','Table','Reliquary','Cauldron','Chandelier','Guards'],['Antlers','Silver','Heraldry','Bones','Flowers','Scripture','Jewels','Wreaths','Candles','Fur','Tapestries','Shields']],
	WOE:     [['Secretive','Violent','Looming','Sudden','Ongoing','Prophesised','Mysterious','Sanctioned','Unseen','Vast','Escalating','Concealed'],['Disease','Famine','Raids','Invasion','Abduction','Storm','Fire','Revolt','Exodus','Beast','Killing','Theft']],
	DRAMA:   [['Betrayal','Jealousy','Rivalry','Infidelity','Coup','Ambition','Redemption','Revelation','Wrath','Greed','Banishment','Manipulation'],['Brawl','Poison','Oath','Feast','Letters','Disguise','Inheritance','Assassin','Family','Alcohol','Blackmail','Gold']],
	DESIRE:  [['Escape','Wealth','Status','Knowledge','Mastery','Heirloom','Marriage','Truth','Travel','Power','Security','Forgiveness'],['Freedom','Love','Legacy','Recovery','Revenge','Duty','Fear','Guilt','Recognition','Defiance','Curiosity','Hatred']],
	APPEAR:  [['Delicate','Short','Robust','Hard','Haggard','Cold','Warm','Youthful','Soft','Sickly','Tall','Rough'],['Armoured','Tattered','Vibrant','Crude','Eclectic','Traditional','Comfortable','Gaudy','Drab','Decorated','Functional','Elegant']],
	REL:     [['Adoring','Reluctant','Secret','Estranged','Hateful','Distant','Harmonious','Intimate','Recent','Sworn','Tumultuous','Resentful'],['Kin','Friend','Lover','Spouse','Supporter','Ally','Rival','Successor','Mentor','Peer','Enemy','Guardian']],
	TASK:    [['Investigate','Capture','Destroy','Transport','Retrieve','Mend','Break','Guard','Aid','Salvage','Conceal','Hunt'],['Knight','Seer','Vassals','Livestock','Monument','Gold','Ruin','Animals','Dwelling','Holding','Bridge','Warband']],
	PERS:    [['Cautious','Spiritual','Intellectual','Ambitious','Serene','Righteous','Empathetic','Unstable','Prying','Melancholic','Cynical','Rash'],['Botany','History','Music','Gambling','Animals','Art','Cookery','Craft','Fishing','Fashion','Hunting','Stories']],
	FEATURE: [['Buried','Colourful','Adorned','Spiked','Split','Entombed','Reflective','Veiled','Hot','Drowned','Desecrated','Isolated'],['Brook','Seat','Pit','Cave','Monolith','Mound','Cairn','Pond','Waterfall','Spring','Arch','Henge']],
	WONDER:  [['Pleasure','Secrets','Prophecy','Healing','Desire','Memory','Death','Strength','Temptation','Pain','Regret','Time'],['Light','Flames','Stones','Beasts','Sparks','Trails','Mist','Colours','Plants','Wind','Water','Shadows']],
};

const COMMONER_TYPES = ['Intolerant Herder','Argumentative Sage','Weary Merchant','Bold Warden','Pious Keeper','Proud Smith','Suspicious Elder','Devout Pilgrim','Rough Miller','Wandering Bard'];
const COMMONER_NAMES = ['Aldric','Maren','Oswin','Blyth','Edric','Sera','Thane','Wynn','Gorin','Lira','Holt','Vera','Croft','Nessa','Brand'];
const SEERS = ['The Winged Seer','The Blind Seer','The Salt Seer','The Marsh Seer','The Stone Seer','The Iron Seer','The Root Seer','The Bone Seer','The Flame Seer','The Tide Seer','The Star Seer','The Moss Seer'];
const HOLDING_NAMES = ['The Roost','The Barrow','The Pale','The Warren','The Fold','Ashgate','Stonewatch','The Cradle','The Reach','Duskwall','Ironmere','The Hold','Brightwater','The Mere','Coldfen','The Spire','Thorngate','Millcroft','Redcliff','Graymoor','Saltwick','The Crossing','Old Anvil','The Brow','Dunholt','Fallowhaven','Moorgate','The Nave'];
const REALM_WORDS = [
	['Grey','Dark','High','Old','Cold','Wild','Fair','Long','Deep','Black','White','Iron','Fell','Mist','Still'],
	['moor','march','vale','wood','heath','fell','reach','hold','waste','mere','fen','cliff','shore','pass','crest'],
];

// ── RULEBOOK PAGE REFERENCES ─────────────────────────────────────────────────

const KNIGHT_LIST = KNIGHTS.flat();
const MYTH_LIST   = MYTHS.flat();

export function pageRef(name) {
	let i = KNIGHT_LIST.indexOf(name);
	if (i >= 0) return 28 + 2 * i;
	i = MYTH_LIST.indexOf(name);
	if (i >= 0) return 29 + 2 * i;
	return null;
}

// ── RANDOM UTILITIES ─────────────────────────────────────────────────────────

const d    = n => Math.floor(Math.random() * n) + 1;
const pick = a => a[Math.floor(Math.random() * a.length)];
const roll = t => t[0][d(12) - 1] + ' ' + t[1][d(12) - 1];

const rollKnight = () => KNIGHTS[d(6) - 1][d(12) - 1];
const rollMyth   = () => MYTHS[d(6) - 1][d(12) - 1];

// ── HEX GRID HELPERS (flat-top, odd-q offset) ────────────────────────────────

function idx(col, row, cols) { return row * cols + col; }

function neighbors(col, row, cols, rows) {
	const dirs = col % 2 === 0
		? [[1, -1], [1, 0], [0, 1], [-1, 0], [-1, -1], [0, -1]]
		: [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [0, -1]];
	return dirs
		.map(([dc, dr]) => [col + dc, row + dr])
		.filter(([c, r]) => c >= 0 && c < cols && r >= 0 && r < rows);
}

function hexDist(c1, r1, c2, r2) {
	const x1 = c1, z1 = r1 - (c1 - (c1 & 1)) / 2, y1 = -x1 - z1;
	const x2 = c2, z2 = r2 - (c2 - (c2 & 1)) / 2, y2 = -x2 - z2;
	return Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2), Math.abs(z1 - z2));
}

// ── TERRAIN GENERATION ───────────────────────────────────────────────────────

function buildTerrain(hexes, cols, rows) {
	const total = cols * rows;
	const TARGET = Math.floor(total * 0.67);
	let land = 0;

	while (land < TARGET) {
		const unset = hexes.filter(h => !h.terrain);
		if (!unset.length) break;
		const char  = LAND_CHAR[d(12) - 1];
		const scape = LAND_SCAPE[d(12) - 1];
		const size  = Math.min(d(12), TARGET - land, unset.length);
		const adj   = unset.filter(h =>
			neighbors(h.col, h.row, cols, rows).some(([nc, nr]) => hexes[idx(nc, nr, cols)].terrain)
		);
		const seed  = (land === 0 || Math.random() < 0.3 || !adj.length) ? pick(unset) : pick(adj);

		const cluster = new Set([idx(seed.col, seed.row, cols)]);
		const front   = neighbors(seed.col, seed.row, cols, rows)
			.filter(([nc, nr]) => !hexes[idx(nc, nr, cols)].terrain);

		while (cluster.size < size && front.length) {
			const fi = Math.floor(Math.random() * front.length);
			const [nc, nr] = front.splice(fi, 1)[0];
			const ni = idx(nc, nr, cols);
			if (cluster.has(ni) || hexes[ni].terrain) continue;
			cluster.add(ni);
			neighbors(nc, nr, cols, rows)
				.filter(([nnc, nnr]) => !hexes[idx(nnc, nnr, cols)].terrain && !cluster.has(idx(nnc, nnr, cols)))
				.forEach(p => front.push(p));
		}

		for (const hi of cluster) {
			if (!hexes[hi].terrain) {
				hexes[hi].terrain   = scape;
				hexes[hi].character = char;
				land++;
			}
		}
	}
}

// ── RIVER ────────────────────────────────────────────────────────────────────

const isWater = h => !h.terrain || h.terrain === 'Lakes';

const FLOW_BONUS = { Valley: 3, Meadow: 2, Plain: 2, Heath: 2, Bog: 3, Marsh: 3,
	Forest: 0, Glades: 0, Hills: -2, Crags: -2, Peaks: -3 };

function waterBodySize(hexes, start, cols, rows, cap = 3) {
	const seen = new Set([idx(start.col, start.row, cols)]);
	const queue = [start];
	while (queue.length && seen.size < cap) {
		const cur = queue.pop();
		for (const [nc, nr] of neighbors(cur.col, cur.row, cols, rows)) {
			const k = idx(nc, nr, cols);
			const h = hexes[k];
			if (h && isWater(h) && !seen.has(k)) { seen.add(k); queue.push(h); }
		}
	}
	return seen.size;
}

function traceRiver(hexes, start, cols, rows) {
	let cur = start;
	const path = [cur];
	const seen = new Set([idx(cur.col, cur.row, cols)]);
	let mouth = null;
	for (let step = 0; step < 24; step++) {
		const nbrs = neighbors(cur.col, cur.row, cols, rows).filter(([nc, nr]) => !seen.has(idx(nc, nr, cols)));
		if (!nbrs.length) break;
		const scored = nbrs.map(([nc, nr]) => {
			const h = hexes[idx(nc, nr, cols)];
			return { h, s: nr * 2 + (Math.random() - 0.5) * 3 + (isWater(h) ? 6 : (FLOW_BONUS[h.terrain] ?? 0)) };
		});
		scored.sort((a, b) => b.s - a.s);
		const next = scored[0].h;
		seen.add(idx(next.col, next.row, cols));
		if (isWater(next)) { mouth = next; break; }
		path.push(next);
		cur = next;
	}
	return { path, mouth };
}

function buildRiver(hexes, realm, cols, rows) {
	const source = tier => hexes.filter(h => tier.includes(h.terrain));
	const starts = [source(['Peaks', 'Crags']), source(['Hills']), hexes.filter(h => h.terrain && h.row < Math.floor(rows / 3))]
		.find(s => s.length);
	if (!starts) return;

	let best = [];
	for (let attempt = 0; attempt < 40; attempt++) {
		const { path, mouth } = traceRiver(hexes, pick(starts), cols, rows);
		if (mouth && path.length >= 3 && waterBodySize(hexes, mouth, cols, rows) >= 3) { best = path; break; }
		if (mouth && path.length > best.length) best = path;
	}
	best.forEach(h => { h.river = true; });
	realm.riverPath = best;
}

// ── BARRIERS ─────────────────────────────────────────────────────────────────

function buildBarriers(hexes) {
	const land  = hexes.filter(h => h.terrain);
	const count = Math.round(land.length / 6);
	const pref  = land.filter(h => ['Crags', 'Peaks', 'Hills'].includes(h.terrain));
	const pool  = (pref.length >= count / 2 ? [...pref, ...land.filter(h => !pref.includes(h))] : land)
		.sort(() => Math.random() - 0.5);
	pool.slice(0, count).forEach(h => { h.barrier = true; });
}

// ── HOLDINGS ─────────────────────────────────────────────────────────────────

function buildHoldings(hexes, realm, cols, rows) {
	const land = hexes.filter(h => h.terrain && !h.content && !isWater(h) && h.row > 0);
	const usedNames = new Set();
	let picked = [];

	for (const minD of [5, 4, 3, 2]) {
		const shuf = land.slice().sort(() => Math.random() - 0.5);
		picked = [];
		for (const h of shuf) {
			if (picked.length >= 4) break;
			if (picked.every(p => hexDist(h.col, h.row, p.col, p.row) >= minD)) picked.push(h);
		}
		if (picked.length === 4) break;
	}

	const labels = ['A', 'B', 'C', 'D'];
	picked.forEach((hex, i) => {
		const isKnight = (i === 0 || Math.random() > 0.35);
		const ruler     = isKnight ? rollKnight() : pick(COMMONER_TYPES);
		const rulerName = isKnight ? null : pick(COMMONER_NAMES);
		let name;
		do { name = pick(HOLDING_NAMES); } while (usedNames.has(name));
		usedNames.add(name);

		const h = {
			label: labels[i],
			hex: { col: hex.col, row: hex.row },
			seat: i === 0,
			ruler, rulerName, name,
			terrain: hex.terrain,
			character: hex.character,
			exterior: roll(T.HOLDING),
			bailey:   roll(T.BAILEY),
			keep:     roll(T.KEEP),
			woe:      roll(T.WOE),
			drama:    roll(T.DRAMA),
			desire:   roll(T.DESIRE),
			appearance: roll(T.APPEAR),
			personality: roll(T.PERS),
			quest:    roll(T.TASK),
			rels:     [],
		};
		realm.holdings.push(h);
		hex.content = { type: 'holding', data: h };
	});

	if (realm.holdings.length >= 2) {
		realm.holdings[1].rels.push({ to: realm.holdings[0].label, name: realm.holdings[0].ruler, rel: roll(T.REL) });
	}
	if (realm.holdings.length >= 3) {
		realm.holdings[2].rels.push({ to: realm.holdings[1].label, name: realm.holdings[1].ruler, rel: roll(T.REL) });
	}
}

// ── MYTHS ────────────────────────────────────────────────────────────────────

function buildMyths(hexes, realm, cols, rows) {
	const used     = new Set();
	const holdHexes = realm.holdings.map(h => h.hex);
	const remote   = hexes
		.filter(h => h.terrain && !h.content && !isWater(h) && h.row > 0 && holdHexes.every(hh => hexDist(h.col, h.row, hh.col, hh.row) >= 3))
		.sort(() => Math.random() - 0.5);
	const fallback = hexes.filter(h => h.terrain && !h.content && !isWater(h) && h.row > 0).sort(() => Math.random() - 0.5);

	for (let i = 0; i < 6; i++) {
		const hex = remote[i] || fallback[i];
		if (!hex) continue;
		let name, tries = 0;
		do { name = rollMyth(); tries++; } while (used.has(name) && tries < 30);
		used.add(name);
		const myth = { number: i + 1, name, hex: { col: hex.col, row: hex.row }, terrain: hex.terrain, character: hex.character };
		realm.myths.push(myth);
		hex.content = { type: 'myth', data: myth };
	}
}

// ── LANDMARKS ────────────────────────────────────────────────────────────────

function buildLandmarks(hexes, realm) {
	const types = [
		{ key: 'dwellings', icon: '♥', gen: () => pick(['Hidden cave','Lakeside hermit hut','Woodland homestead','Cliffside refuge','Marsh cottage','River keeper\'s post','Ruined farmstead (occupied)','Shepherd\'s camp']) },
		{ key: 'sanctums',  icon: '☽', gen: () => pick(SEERS) + ' — ' + roll(T.FEATURE) },
		{ key: 'monuments', icon: '◆', gen: () => roll(T.WONDER) + ' monument' },
		{ key: 'hazards',   icon: '!', gen: () => pick(['Sinking ground','Flash floods','Rockfall','Toxic vapours','Slippery rocks','Choking thorns','Blinding fog','Unstable ice','Quicksand','Biting insects']) },
		{ key: 'curses',    icon: '☠', gen: () => pick(['Haunting lights','Disorienting mist','Whispered fears','Spiralling paths','False horizons','Eerie silence','Time distortion','Mirrored landscape','Forgetting fog']) },
		{ key: 'ruins',     icon: '†', gen: () => 'Echoes of ' + pick(MYTHS.flat()) },
	];

	types.forEach(t => { realm.landmarks[t.key] = []; });

	const avail = hexes.filter(h => h.terrain && !h.content && !isWater(h) && h.row > 0).sort(() => Math.random() - 0.5);
	let ai = 0;
	for (const t of types) {
		for (let i = 0; i < 3 && ai < avail.length; i++, ai++) {
			const hex = avail[ai];
			const lm = { icon: t.icon, description: t.gen(), hex: { col: hex.col, row: hex.row }, terrain: hex.terrain };
			realm.landmarks[t.key].push(lm);
			hex.content = { type: 'landmark', subtype: t.key, data: lm };
		}
	}
}

// ── PUBLIC API ────────────────────────────────────────────────────────────────

/**
 * Generate a complete Mythic Bastionland realm.
 * @param {number} [cols=12]
 * @param {number} [rows=12]
 * @returns {object} realm data object
 */
export function generateRealm(cols = 12, rows = 12) {
	const hexes = Array.from({ length: rows * cols }, (_, i) => ({
		col: i % cols,
		row: Math.floor(i / cols),
		terrain: null,
		character: null,
		content: null,
		barrier: false,
		river: false,
	}));

	const realm = {
		name: `The ${pick(REALM_WORDS[0])}${pick(REALM_WORDS[1])}`,
		cols, rows,
		hexes,
		holdings: [],
		myths: [],
		landmarks: {},
		riverPath: [],
	};

	buildTerrain(hexes, cols, rows);
	buildRiver(hexes, realm, cols, rows);
	buildBarriers(hexes);
	buildHoldings(hexes, realm, cols, rows);
	buildMyths(hexes, realm, cols, rows);
	buildLandmarks(hexes, realm);

	return realm;
}
