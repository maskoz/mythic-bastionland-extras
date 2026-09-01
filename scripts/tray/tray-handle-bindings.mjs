import { disableDungeonPainting, enableDungeonPainting } from "../dungeon/DungeonPainterSD.mjs";
import { adjustPoiScale, canRedoPoi, canUndoPoi, disablePainting, disablePreview, enablePainting, enablePreview, getActiveTileTab, getPoiMirror, getPoiScale, redoLastPoi, rotatePoiLeft, rotatePoiRight, setDecorMode, togglePoiMirror, undoLastPoi } from "../hex/HexPainterSD.mjs";
import { getActiveHexFogEffect, getAvailableHexFogEffects, isFogEffectsEnabled, isHexFogEnabled, setHexFogEffect, setHexFogEnabled } from "../hex/SDXHexFogSD.mjs";
import { toggleSoloMode } from "../hex/SoloHexMode.mjs";
import { cycleViewMode, setViewMode } from "./TraySD.mjs";

export const TrayHandleBindings = {
	_bindHandleButtons(elem) {
		// Toggle button
		elem.querySelector(".tray-handle-button-toggle")?.addEventListener("click", e => {
			e.preventDefault();
			e.stopPropagation();
			this.toggleExpanded();
		});

		// View cycle button
		elem.querySelector(".tray-handle-button-viewcycle")?.addEventListener("click", e => {
			e.preventDefault();
			e.stopPropagation();
			cycleViewMode();
		});

		// Drawing Tools Button
		elem.querySelector(".tray-handle-button-tool[data-action='sdx-drawing']")?.addEventListener("click", e => {
			e.preventDefault();
			e.stopPropagation();
			if (game.mbExtras?.drawingToolbar?.toggle) {
				game.mbExtras.drawingToolbar.toggle();
			}
		});

		// Maphub Launcher Button
		elem.querySelector(".tray-handle-button-tool[data-action='sdx-maphub-launcher']")?.addEventListener("click", async e => {
			e.preventDefault();
			e.stopPropagation();
			if (!game.user.isGM) return;
			const { MaphubLauncherApp } = await import("../MaphubLauncherApp.mjs");
			new MaphubLauncherApp().render(true);
		});

		// SDX Coords Toggle
		elem.querySelector(".tray-handle-button-tool[data-action='sdx-coords']")?.addEventListener("click", e => {
			e.preventDefault();
			e.stopPropagation();
			if (window.SDXCoordinates) {
				window.SDXCoordinates.toggle();
			}
		});

		// Hex Tooltip Toggle
		elem.querySelector(".tray-handle-button-tool[data-action='sdx-hex-tooltip']")?.addEventListener("click", e => {
			e.preventDefault();
			e.stopPropagation();
			if (!canvas?.grid?.isHexagonal) {
				ui.notifications.warn("Hex tooltips only work on hex-grid scenes.");
				return;
			}
			const active = window.SDXHexTooltip?.toggle();
			e.currentTarget.classList.toggle("active", !!active);
		});

		// Hex Fog Toggle
		elem.querySelector(".tray-handle-button-tool[data-action='sdx-hex-fog']")?.addEventListener("click", async e => {
			e.preventDefault();
			e.stopPropagation();
			if (!canvas?.grid?.isHexagonal) {
				ui.notifications.warn("Hex fog only works on hex-grid scenes.");
				return;
			}
			const btn = e.currentTarget;
			const sceneId = canvas.scene?.id;
			const currentlyEnabled = isHexFogEnabled(sceneId);
			await setHexFogEnabled(sceneId, !currentlyEnabled);
			btn.classList.toggle("active", !currentlyEnabled);
		});

		// Hex Fog Effects Context Menu
		elem.querySelector(".tray-handle-button-tool[data-action='sdx-hex-fog']")?.addEventListener("contextmenu", e => {
			e.preventDefault();
			e.stopPropagation();
			if (!game.user.isGM) return;
			if (!isFogEffectsEnabled()) return;
			if (!canvas?.grid?.isHexagonal || !isHexFogEnabled(canvas.scene?.id)) {
				ui.notifications.warn("Enable hex fog first.");
				return;
			}
			document.querySelector(".sdx-fog-effect-menu")?.remove();
			const sceneId = canvas.scene.id;
			const current = getActiveHexFogEffect(sceneId);
			const effects = getAvailableHexFogEffects();
			const menu = document.createElement("div");
			menu.className = "sdx-fog-effect-menu";
			const header = document.createElement("div");
			header.className = "sdx-fog-effect-menu-header";
			header.textContent = "Fog Effects";
			menu.appendChild(header);
			const noneItem = document.createElement("div");
			noneItem.className = `sdx-fog-effect-menu-item${!current ? " active" : ""}`;
			noneItem.innerHTML = "<i class=\"fa-solid fa-ban\"></i><span>None</span>";
			noneItem.addEventListener("click", () => { setHexFogEffect(sceneId, null); menu.remove(); });
			menu.appendChild(noneItem);
			for (const fx of effects) {
				const item = document.createElement("div");
				item.className = `sdx-fog-effect-menu-item${current === fx.name ? " active" : ""}`;
				item.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i><span>${fx.label}</span>`;
				item.addEventListener("click", () => { setHexFogEffect(sceneId, fx.name); menu.remove(); });
				menu.appendChild(item);
			}
			const rect = e.currentTarget.getBoundingClientRect();
			menu.style.cssText = `position:fixed;left:${rect.left}px;top:${rect.bottom + 4}px;z-index:10001`;
			document.body.appendChild(menu);
			const closeMenu = ev => {
				if (!menu.contains(ev.target)) { menu.remove(); document.removeEventListener("mousedown", closeMenu, true); }
			};
			setTimeout(() => document.addEventListener("mousedown", closeMenu, true), 0);
		});

		// Solo Hex Mode Toggle
		elem.querySelector(".tray-handle-button-tool[data-action='sdx-solo-mode']")?.addEventListener("click", e => {
			e.preventDefault();
			e.stopPropagation();
			const active = toggleSoloMode();
			e.currentTarget.classList.toggle("active", active);
		});

		// SDX Roller
		elem.querySelector(".tray-handle-button-tool[data-action='sdx-roller']")?.addEventListener("click", async e => {
			e.preventDefault();
			e.stopPropagation();
			const { SDXRollerApp } = await import("./SDXRollerApp.mjs");
			new SDXRollerApp().render(true);
		});

		// POI Undo
		elem.querySelector(".tray-handle-button-tool[data-action='poi-undo']")?.addEventListener("click", async e => {
			e.preventDefault();
			e.stopPropagation();
			await undoLastPoi();
			elem.querySelector(".poi-undo-btn")?.classList.toggle("disabled", !canUndoPoi());
			elem.querySelector(".poi-redo-btn")?.classList.toggle("disabled", !canRedoPoi());
		});

		// POI Redo
		elem.querySelector(".tray-handle-button-tool[data-action='poi-redo']")?.addEventListener("click", async e => {
			e.preventDefault();
			e.stopPropagation();
			await redoLastPoi();
			elem.querySelector(".poi-undo-btn")?.classList.toggle("disabled", !canUndoPoi());
			elem.querySelector(".poi-redo-btn")?.classList.toggle("disabled", !canRedoPoi());
		});

		// POI Scale
		elem.querySelector(".tray-handle-button-tool[data-action='poi-scale-down']")?.addEventListener("click", e => {
			e.preventDefault(); e.stopPropagation();
			adjustPoiScale(-0.1); this._updatePoiScaleDisplay();
		});
		elem.querySelector(".tray-handle-button-tool[data-action='poi-scale-up']")?.addEventListener("click", e => {
			e.preventDefault(); e.stopPropagation();
			adjustPoiScale(0.1); this._updatePoiScaleDisplay();
		});

		// POI Rotate
		elem.querySelector(".tray-handle-button-tool[data-action='poi-rotate-left']")?.addEventListener("click", e => {
			e.preventDefault(); e.stopPropagation(); rotatePoiLeft();
		});
		elem.querySelector(".tray-handle-button-tool[data-action='poi-rotate-right']")?.addEventListener("click", e => {
			e.preventDefault(); e.stopPropagation(); rotatePoiRight();
		});

		// POI Mirror
		elem.querySelector(".tray-handle-button-tool[data-action='poi-mirror']")?.addEventListener("click", e => {
			e.preventDefault(); e.stopPropagation();
			togglePoiMirror();
			e.currentTarget.classList.toggle("active", getPoiMirror());
		});

		// Tab buttons — switch between hexes / dungeons / decor / pins / notes
		elem.querySelectorAll(".tray-tab-button").forEach(btn => {
			btn.addEventListener("click", async e => {
				e.preventDefault();
				e.stopPropagation();
				const view = btn.dataset.view;
				if (view) {
					await setViewMode(view);
					if (view === "hexes" && this._isExpanded) {
						enablePainting();
						disableDungeonPainting();
						if (getActiveTileTab() === "symbols") enablePreview();
					}
					else if (view === "decor" && this._isExpanded) {
						setDecorMode(true);
						enablePainting();
						disableDungeonPainting();
						enablePreview();
					}
					else if (view === "dungeons" && this._isExpanded) {
						disablePainting();
						disablePreview();
						enableDungeonPainting();
					}
					else {
						disablePainting();
						disablePreview();
						disableDungeonPainting();
					}
					this._syncPoiSortPanel();
				}
			});
		});
	},

	_updatePoiScaleDisplay() {
		const elem = document.querySelector(".sdx-tray");
		if (!elem) return;
		const pct = Math.round(getPoiScale() * 100);
		elem.querySelectorAll(".poi-info-section .hex-custom-folder-hint").forEach(hint => {
			const icon = hint.querySelector("i");
			if (icon) {
				hint.textContent = "";
				hint.appendChild(icon);
				hint.append(` ${hint.closest(".decor-view") ? "Decor" : "POI"} paint on top · Scale: ${pct}%`);
			}
		});
	},
};
