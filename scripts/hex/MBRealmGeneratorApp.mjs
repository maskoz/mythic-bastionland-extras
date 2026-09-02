/**
 * Mythic Bastionland â€” In-Foundry Realm Generator
 *
 * Opens as an ApplicationV2 dialog. Click "New Realm" to generate, then
 * "Build Scene" to create a Foundry hex scene from the generated realm.
 */

import { generateRealm, pageRef } from "./MBRealmData.mjs";
import { buildMBRealmScene, buildMBRealmJournals } from "./MBRealmBuilder.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class MBRealmGeneratorApp extends HandlebarsApplicationMixin(ApplicationV2) {
	static DEFAULT_OPTIONS = {
		id:      "mb-realm-generator",
		tag:     "div",
		classes: ["mb-realm-generator-app"],
		position: { width: 640, height: 700 },
		window: {
			title:     "MB Realm Generator",
			icon:      "fas fa-castle",
			resizable: true,
			frame:     true,
		},
	};

	static PARTS = {
		main: {
			template: "modules/mythicbastionland-extras/templates/mb-realm-generator.hbs",
			scrollable: [".realm-body"],
		},
	};

	constructor(options = {}) {
		super(options);
		this._realm = generateRealm();
		this._building = false;
	}

	async _prepareContext(_options) {
		const r = this._realm;

		// Flatten landmarks into a single list for the template
		const landmarksList = [];
		const LANDMARK_LABELS = { dwellings: 'Dwelling', sanctums: 'Sanctum', monuments: 'Monument', hazards: 'Hazard', curses: 'Curse', ruins: 'Ruin' };
		for (const [type, lms] of Object.entries(r.landmarks)) {
			for (const lm of lms) {
				const rp = type === 'ruins' ? this._ruinPage(lm.description) : null;
				landmarksList.push({ icon: lm.icon, label: LANDMARK_LABELS[type], description: lm.description, hex: lm.hex, page: rp });
			}
		}

		// Enrich holdings for template
		const holdings = r.holdings.map(h => ({
			...h,
			rulerPage: pageRef(h.ruler),
			terrainLabel: h.character ? `${h.character} ${h.terrain}` : h.terrain,
		}));

		// Enrich myths for template
		const myths = r.myths.map(m => ({ ...m, page: pageRef(m.name) }));

		return {
			realmName:     r.name,
			holdings,
			myths,
			landmarksList,
			building:      this._building,
		};
	}

	_onRender(_context, _options) {
		super._onRender?.(_context, _options);
		const html = this.element;

		// Generate New Realm
		html.querySelector("[data-action='generate-new']")?.addEventListener("click", async e => {
			e.preventDefault();
			this._realm = generateRealm();
			await this.render({ force: true });
		});

		// Build Journals
		html.querySelector("[data-action='build-journals']")?.addEventListener("click", async e => {
			e.preventDefault();
			if (this._building) return;
			if (!game.user.isGM) { ui.notifications.warn("Only a GM can build journals."); return; }

			const journalName = html.querySelector(".mb-scene-name")?.value?.trim() || this._realm.name;
			const overwrite = html.querySelector(".mb-overwrite")?.checked ?? false;

			this._building = true;
			await this.render({ force: true });

			try {
				const result = await buildMBRealmJournals(this._realm, { journalName, overwrite });
				if (result?.realmJournal) {
					result.realmJournal.sheet.render(true);
					const n = result.mythEntries.length;
					ui.notifications.info(`MB Realm journals for "${journalName}" created (realm journal + ${n} myth journals).`);
				}
			}
			catch (err) {
				console.error("MB Realm Generator | journal build failed", err);
				ui.notifications.error("Failed to build realm journals. See console for details.");
			}
			finally {
				this._building = false;
				await this.render({ force: true });
			}
		});

		// Build Scene in Foundry
		html.querySelector("[data-action='build-scene']")?.addEventListener("click", async e => {
			e.preventDefault();
			if (this._building) return;
			if (!game.user.isGM) { ui.notifications.warn("Only a GM can build realm scenes."); return; }

			const sceneName = html.querySelector(".mb-scene-name")?.value?.trim() || this._realm.name;
			const overwrite = html.querySelector(".mb-overwrite")?.checked ?? false;

			this._building = true;
			await this.render({ force: true }); // show spinner

			try {
				await buildMBRealmScene(this._realm, { sceneName, overwrite });
				ui.notifications.info(`MB Realm "${sceneName}" built — scene, journals, and map notes ready.`);
			}
			catch (err) {
				console.error("MB Realm Generator | build failed", err);
				ui.notifications.error("Failed to build realm scene. See console for details.");
			}
			finally {
				this._building = false;
				await this.render({ force: true });
			}
		});
	}

	_ruinPage(desc) {
		const m = desc.match(/Echoes of (The .+)$/);
		return m ? pageRef(m[1]) : null;
	}
}
