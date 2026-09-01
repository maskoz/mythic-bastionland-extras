/**
 * Mythic Bastionland Extras — composition root.
 *
 * Map-making tools for Mythic Bastionland:
 *   - Hex painter, hex fog, hex coordinates, hex tooltip
 *   - Dungeon generator, dungeon painter, biome editor
 *   - Journal pins, placeable notes, narration
 *   - Drawing tools, tile flatten, wall context menu
 *   - Theatre of the Mind (ToM) scenes
 *   - Scene export / import
 *   - Maphub map generators
 */

// ── Canvas / drawing ──────────────────────────────────────────────────────────
import { initCarouselDrag } from "./canvas/carousel-drag.mjs";
import { registerTileFlattenHooks } from "./canvas/TileFlattenSD.mjs";
import { WallContextMenuSD } from "./canvas/WallContextMenuSD.mjs";
import { sdxDrawingTool } from "./canvas/SDXDrawingTool.mjs";
import { sdxDrawingToolbar } from "./canvas/SDXDrawingToolbar.mjs";

// ── Hex tools ─────────────────────────────────────────────────────────────────
import { initSDXCoords } from "./hex/SDXCoordsSD.mjs";
import { initHexTooltip } from "./hex/HexTooltipSD.mjs";
import { initHexFog } from "./hex/SDXHexFogSD.mjs";
import { patchHexTilePositionClamp } from "./hex/hex-tile-clamp.mjs";
import { generateHexMap, clearGeneratedTiles } from "./hex/HexGeneratorSD.mjs";
import { buildHexcrawl, buildHexcrawlFromFile } from "./hex/HexcrawlBuilderSD.mjs";
import { buildHexDungeonScene } from "./hex/HexDungeonBridgeSD.mjs";

// ── Dungeon tools ─────────────────────────────────────────────────────────────
import { generateDungeon, getGeneratorSettings, setGeneratorSettings, generateRandomSeed, generateLayout, generateMixedLayout } from "./dungeon/DungeonGeneratorSD.mjs";
import { generateCaveLayout, buildCaveLoops, traceBoundaryLoops } from "./dungeon/DungeonCaveSD.mjs";
import { assignBiomes, buildCellFloorMap, getBiomeDefs, getCustomBiomes, setCustomBiome, removeCustomBiome, resetCustomBiomes, getEnabledBiomeKeys, getDisabledBiomes, setBiomeEnabled, registerDungeonBiomeSettings } from "./dungeon/DungeonBiomesSD.mjs";
import { openBiomeEditor, registerBiomeEditorDelegation } from "./dungeon/BiomeEditorSD.mjs";
import { getSceneLevelContext, applySceneLevelData, getDungeonBackground, registerDungeonPainterSettings } from "./dungeon/DungeonPainterSD.mjs";
import { placeChangeLevelRegion, placeDungeonSurface, placeDungeonDecor } from "./dungeon/DungeonRegionsSD.mjs";
import { registerDungeonMultiLevelHooks } from "./dungeon/DungeonMultiLevelSD.mjs";

// ── Journal / pins ────────────────────────────────────────────────────────────
import { initJournalPins } from "./journal/JournalPinsSD.mjs";
import { registerPinListHooks } from "./journal/PinListApp.mjs";
import { registerJournalUIHooks } from "./journal/journal-ui.mjs";
import { initJournalNarration } from "./journal/JournalNarrationSD.mjs";
import { initPlaceableNotes } from "./journal/PlaceableNotesSD.mjs";
import { registerDisplayNpcEnricher } from "./journal/DisplayNpc.mjs";
import { registerDisplayTableEnricher } from "./journal/DisplayTable.mjs";
import { registerDisplayItemEnricher } from "./journal/DisplayItem.mjs";
import { initEasyReferenceMenu } from "./journal/easy-reference/EasyReferenceMenu.mjs";

// ── Scene export / import ─────────────────────────────────────────────────────
import { SceneExporter } from "./scene/SceneExporter.mjs";
import { SceneImporter } from "./scene/SceneImporter.mjs";

// ── Maphub ────────────────────────────────────────────────────────────────────
import { registerMaphubHooks } from "./MaphubSD.mjs";

// ── Tray ──────────────────────────────────────────────────────────────────────
import { initTray } from "./tray/TraySD.mjs";

// ── Theatre of the Mind ───────────────────────────────────────────────────────
import { TomSD } from "./tom/TomSD.mjs";

// ── Settings / feature gates ──────────────────────────────────────────────────
import { registerSettings, setupSettingsOrganization } from "./settings/module-settings.mjs";
import { registerFeatureManagerSettings } from "./settings/FeatureManagerApp.mjs";
import { FEATURE_IDS, isFeatureEnabled } from "./settings/feature-gates.mjs";

// ── Shared ────────────────────────────────────────────────────────────────────
import { registerAppV2HeaderBridge } from "./shared/appv2-header-bridge.mjs";
import { migrateWebpAssetPaths, sweepWorldCompendiums } from "./shared/WebpMigrationSD.mjs";

// ─────────────────────────────────────────────────────────────────────────────

const MODULE_ID = "mythicbastionland-extras";
const featureEnabled = featureId => isFeatureEnabled(featureId);
const anyFeatureEnabled = (...featureIds) => featureIds.some(featureEnabled);

// ── init phase ────────────────────────────────────────────────────────────────
Hooks.once("init", registerFeatureManagerSettings);

Hooks.once("init", () => {
	// Settings must be registered first — everything below may read them
	registerSettings();
	setupSettingsOrganization();

	// Carousel drag for hex tile carousels
	initCarouselDrag();

	// Journal & pins
	if (featureEnabled(FEATURE_IDS.JOURNAL_NARRATION)) initJournalNarration();
	if (featureEnabled(FEATURE_IDS.JOURNAL_PINS)) {
		initJournalPins();
		registerPinListHooks();
	}
	if (featureEnabled(FEATURE_IDS.PLACEABLE_NOTES)) initPlaceableNotes();

	// Hex tools
	if (featureEnabled(FEATURE_IDS.COORDINATES)) initSDXCoords();
	if (featureEnabled(FEATURE_IDS.HEX_TOOLTIP)) initHexTooltip();
	if (featureEnabled(FEATURE_IDS.HEX_FOG)) initHexFog();
	if (featureEnabled(FEATURE_IDS.HEX_PAINTER)) patchHexTilePositionClamp();

	// Dungeon & map
	if (featureEnabled(FEATURE_IDS.DUNGEON_PAINTER)) registerDungeonMultiLevelHooks();
	if (featureEnabled(FEATURE_IDS.MAP_GENERATORS)) registerMaphubHooks();

	// Canvas tools
	if (featureEnabled(FEATURE_IDS.TILE_FLATTEN)) registerTileFlattenHooks();
	if (featureEnabled(FEATURE_IDS.WALL_CONTEXT_MENU)) WallContextMenuSD.initialize();
	if (featureEnabled(FEATURE_IDS.TOM_SCENES)) TomSD.initialize();

	// GSAP for journal pins / drawing tools
	try {
		if (
			anyFeatureEnabled(FEATURE_IDS.JOURNAL_PINS, FEATURE_IDS.DRAWING_TOOLS)
			&& typeof gsap !== "undefined"
			&& typeof PixiPlugin !== "undefined"
		) {
			gsap.registerPlugin(PixiPlugin);
		}
	}
	catch (err) {
		console.error(`${MODULE_ID} | Failed to register GSAP PixiPlugin:`, err);
	}

	// Drawing tools initialise on ready (need canvas)
	if (featureEnabled(FEATURE_IDS.DRAWING_TOOLS)) {
		Hooks.once("ready", () => {
			game.mbExtras = game.mbExtras || {};
			game.mbExtras.drawingTool = sdxDrawingTool;
			game.mbExtras.drawingToolbar = sdxDrawingToolbar;
			sdxDrawingTool.initialize();
		});
	}

	// Dungeon painter settings
	if (featureEnabled(FEATURE_IDS.DUNGEON_PAINTER)) {
		registerDungeonPainterSettings();
		registerDungeonBiomeSettings();
		registerBiomeEditorDelegation();
	}

	// Journal enrichers
	if (featureEnabled(FEATURE_IDS.DISPLAY_CARDS)) {
		registerDisplayNpcEnricher();
		registerDisplayTableEnricher();
		registerDisplayItemEnricher();
	}
	if (featureEnabled(FEATURE_IDS.EASY_REFERENCE)) initEasyReferenceMenu();

	// Journal sidebar chrome
	if (anyFeatureEnabled(FEATURE_IDS.JOURNAL_PINS, FEATURE_IDS.HEX_TOOLTIP, FEATURE_IDS.JOURNAL_NARRATION)) {
		registerJournalUIHooks();
	}
});

// ── ready phase ───────────────────────────────────────────────────────────────
Hooks.once("ready", async () => {
	// Initialize the SDX tray (hex painter, dungeon painter, pin list, etc.)
	initTray();

	// Migrate any old .png/.jpg asset paths to .webp (safe to run always)
	try {
		await migrateWebpAssetPaths();
	}
	catch (e) {
		console.error(`${MODULE_ID} | webp asset migration threw:`, e);
	}
	sweepWorldCompendiums().catch(e =>
		console.error(`${MODULE_ID} | world compendium webp sweep failed:`, e)
	);

	// Expose public API for external scripts / MCP automation
	game.modules.get(MODULE_ID).api = {
		hex: {
			generateHexMap, clearGeneratedTiles,
			buildHexcrawl, buildHexcrawlFromFile,
			buildHexDungeonScene,
		},
		dungeon: {
			generateDungeon, generateCaveLayout,
			assignBiomes, getBiomeDefs,
			getCustomBiomes, setCustomBiome, removeCustomBiome, resetCustomBiomes,
			getEnabledBiomeKeys, getDisabledBiomes, setBiomeEnabled,
			getSceneLevelContext, applySceneLevelData, getDungeonBackground,
			placeChangeLevelRegion, placeDungeonSurface, placeDungeonDecor,
			openBiomeEditor,
			generateLayout, generateMixedLayout,
			generateRandomSeed, getGeneratorSettings, setGeneratorSettings,
			buildCaveLoops, traceBoundaryLoops,
		},
		scene: { SceneExporter, SceneImporter },
	};
});
