import { registerEasyReferenceSettings } from "../journal/easy-reference/EasyReferenceMenu.mjs";
import { registerPinStyleSettings } from "../journal/PinStyleEditorSD.mjs";
import { registerSDXCoordsSettings, registerSDXCoordsMenu } from "../hex/SDXCoordsSD.mjs";
import { SDXCoordsSettingsApp } from "../hex/SDXCoordsSettingsSD.mjs";
import { registerTraySettings } from "../tray/TraySD.mjs";
import { MODULE_ID } from "../shared/module-id.mjs";
import { registerDrawingSettings } from "./drawing-settings.mjs";
import { FEATURE_IDS, anyFeatureEnabled, isFeatureEnabled } from "./feature-gates.mjs";
export { setupSettingsOrganization } from "./settings-organization.mjs";

const owners = (...featureIds) => Object.freeze(featureIds);

/* eslint-disable quote-props, comma-dangle */
export const SETTING_OWNERS = Object.freeze({
	webpMigrationDone: null,
	webpPackSweepDone: null,
	"tray.enabled": owners(FEATURE_IDS.TRAY),
	enableFogEffects: owners(FEATURE_IDS.HEX_FOG),
	customDecorAssets: owners(FEATURE_IDS.DECOR_PAINTER),
	decorDungeondraftPacks: owners(FEATURE_IDS.DECOR_PAINTER),
	decorDungeondraftPacksMenu: owners(FEATURE_IDS.DECOR_PAINTER),
	enablePlaceableNotes: owners(FEATURE_IDS.PLACEABLE_NOTES),
	pixelPerfectPins: owners(FEATURE_IDS.JOURNAL_PINS),
	pixelPerfectPinsAlpha: owners(FEATURE_IDS.JOURNAL_PINS),
	...Object.fromEntries([
		"showNpcCards",
		"showItemCards",
		"showTables",
		"showChecks",
		"showDice",
	].map(category => [`easyRef_${category}`, owners(FEATURE_IDS.EASY_REFERENCE)])),
	pinStyleDefaults: owners(FEATURE_IDS.JOURNAL_PINS),
	pinStyleEditorMenu: owners(FEATURE_IDS.JOURNAL_PINS),
	sdxCoordsSettings: owners(FEATURE_IDS.COORDINATES),
	sdxCoordsMenu: owners(FEATURE_IDS.COORDINATES),
	"drawing.enablePlayerDrawing": owners(FEATURE_IDS.DRAWING_TOOLS),
	"drawing.timedEraseTimeout": owners(FEATURE_IDS.DRAWING_TOOLS),
	"drawing.hotkeyEnabled": owners(FEATURE_IDS.DRAWING_TOOLS),
	"drawing.blockWhenTyping": owners(FEATURE_IDS.DRAWING_TOOLS),
	"drawing.toolbar.drawingMode": owners(FEATURE_IDS.DRAWING_TOOLS),
	"drawing.toolbar.stampStyle": owners(FEATURE_IDS.DRAWING_TOOLS),
	"drawing.toolbar.symbolSize": owners(FEATURE_IDS.DRAWING_TOOLS),
	"drawing.toolbar.lineWidth": owners(FEATURE_IDS.DRAWING_TOOLS),
	"drawing.toolbar.lineStyle": owners(FEATURE_IDS.DRAWING_TOOLS),
	"drawing.toolbar.color": owners(FEATURE_IDS.DRAWING_TOOLS),
	"drawing.toolbar.timedEraseEnabled": owners(FEATURE_IDS.DRAWING_TOOLS),
	"drawing.toolbar.opacity": owners(FEATURE_IDS.DRAWING_TOOLS),
	"drawing.toolbar.position": owners(FEATURE_IDS.DRAWING_TOOLS),
});
/* eslint-enable quote-props, comma-dangle */

const settingOwnerEnabled = settingKey => {
	const featureIds = SETTING_OWNERS[settingKey];
	if (featureIds === undefined) throw new Error(`Unknown setting ownership: ${settingKey}`);
	return featureIds === null || anyFeatureEnabled(...featureIds);
};

export function registerSettings() {
	// Migration gates — always registered so migration code can read/write them
	game.settings.register(MODULE_ID, "webpMigrationDone", {
		scope: "world",
		config: false,
		default: false,
		type: Boolean,
	});

	game.settings.register(MODULE_ID, "webpPackSweepDone", {
		scope: "world",
		config: false,
		default: false,
		type: Boolean,
	});

	// ── HEX FOG ──────────────────────────────────────────────────────────────────

	if (settingOwnerEnabled("enableFogEffects")) game.settings.register(MODULE_ID, "enableFogEffects", {
		name: "Enable Fog Effects",
		hint: "Enable shader effects for hex fog (right-click the Hex Fog button to pick an effect). Disable to save performance.",
		scope: "world",
		config: true,
		default: false,
		type: Boolean,
	});

	// Tray + hex painter/fog/settlement settings (registered together by registerTraySettings)
	registerTraySettings();

	// ── DECOR PAINTER ─────────────────────────────────────────────────────────────

	if (settingOwnerEnabled("customDecorAssets")) game.settings.register(MODULE_ID, "customDecorAssets", {
		name: "Custom Decor Assets",
		scope: "world",
		config: false,
		type: Array,
		default: [],
	});

	if (settingOwnerEnabled("decorDungeondraftPacks")) game.settings.register(MODULE_ID, "decorDungeondraftPacks", {
		name: "Dungeondraft Decor Packs",
		scope: "world",
		config: false,
		type: Array,
		default: [],
	});

	if (settingOwnerEnabled("decorDungeondraftPacksMenu")) game.settings.registerMenu(MODULE_ID, "decorDungeondraftPacksMenu", {
		name: "Dungeondraft Decor Packs",
		label: "Manage Packs",
		hint: "Import, enable, or hide Dungeondraft object packs in the SDX Decor tray.",
		icon: "fas fa-cubes",
		type: class extends foundry.applications.api.ApplicationV2 {
			static DEFAULT_OPTIONS = { id: "sdx-ddpack-settings-menu-stub", window: { title: "" } };

			async render() {
				const { DDPackSettingsApp } = await import("../dungeon/DDPackSettingsAppSD.mjs");
				new DDPackSettingsApp().render(true);
				return this;
			}
		},
		restricted: true,
	});

	// ── PLACEABLE NOTES ───────────────────────────────────────────────────────────

	if (settingOwnerEnabled("enablePlaceableNotes")) game.settings.register(MODULE_ID, "enablePlaceableNotes", {
		name: "Enable Notes on placeables and Notes tab in tray",
		hint: "Adds a Notes button to configuration windows for Lights, Sounds, Tokens, Walls, and Tiles.",
		scope: "world",
		config: true,
		default: true,
		type: Boolean,
		requiresReload: true,
	});

	// ── JOURNAL PINS ──────────────────────────────────────────────────────────────

	if (settingOwnerEnabled("pixelPerfectPins")) game.settings.register(MODULE_ID, "pixelPerfectPins", {
		name: game.i18n.localize("SHADOWDARK_EXTRAS.settings.pixel_perfect_pins.name"),
		hint: game.i18n.localize("SHADOWDARK_EXTRAS.settings.pixel_perfect_pins.hint"),
		scope: "world",
		config: true,
		default: false,
		type: Boolean,
		requiresReload: false,
		onChange: () => {
			if (!isFeatureEnabled(FEATURE_IDS.JOURNAL_PINS)) return;
			if (canvas?.scene && window.JournalPinRenderer) {
				const pins = window.JournalPinManager?.list({ sceneId: canvas.scene.id }) || [];
				window.JournalPinRenderer.loadScenePins(canvas.scene.id, pins);
			}
		},
	});

	if (settingOwnerEnabled("pixelPerfectPinsAlpha")) game.settings.register(MODULE_ID, "pixelPerfectPinsAlpha", {
		name: game.i18n.localize("SHADOWDARK_EXTRAS.settings.pixel_perfect_pins_alpha.name"),
		hint: game.i18n.localize("SHADOWDARK_EXTRAS.settings.pixel_perfect_pins_alpha.hint"),
		scope: "world",
		config: true,
		default: 100,
		type: Number,
		range: { min: 0, max: 255, step: 1 },
		requiresReload: false,
		onChange: () => {
			if (!isFeatureEnabled(FEATURE_IDS.JOURNAL_PINS)) return;
			if (canvas?.scene && window.JournalPinRenderer) {
				const pins = window.JournalPinManager?.list({ sceneId: canvas.scene.id }) || [];
				window.JournalPinRenderer.loadScenePins(canvas.scene.id, pins);
			}
		},
	});

	if (settingOwnerEnabled("pinStyleDefaults")) registerPinStyleSettings();

	// ── EASY REFERENCE ────────────────────────────────────────────────────────────

	if (settingOwnerEnabled("easyRef_showNpcCards")) registerEasyReferenceSettings();

	// ── COORDINATES ───────────────────────────────────────────────────────────────

	if (settingOwnerEnabled("sdxCoordsSettings")) {
		registerSDXCoordsSettings();
		registerSDXCoordsMenu(SDXCoordsSettingsApp);
	}

	// ── DRAWING TOOLS ─────────────────────────────────────────────────────────────

	if (settingOwnerEnabled("drawing.enablePlayerDrawing")) registerDrawingSettings();
}
