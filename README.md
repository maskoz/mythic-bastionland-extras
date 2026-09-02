# Mythic Bastionland Extras

Procedural realm and hex map generation, dungeon tools, Theatre of the Mind scenes, and GM utilities for Mythic Bastionland in Foundry VTT.

Forked from [Shadowdark Extras by DmKal](https://github.com/DimitroffVodka/shadowdark-extras).

---

## Features

### Realm Generator
Generate a complete Mythic Bastionland realm with terrain, rivers, barriers, holdings, myths, and landmarks. The generator builds a painted Foundry hex scene and a matching journal in one click.

### Hex Map Tools
Paint biome tiles, show a coordinate overlay (A1-L12), record per-hex notes, and apply hex-level fog of war. All tools work on any HEXODDQ scene.

### Dungeon Generator
Generate multi-level dungeon and cave layouts with painted biome tiles, decor placement, and region marking. Build scene-ready dungeons without external tools.

### Theatre of the Mind
Create and manage Theatre of the Mind scenes for combat and exploration. Keep narrative play organized without a physical map.

### Map Generators
Launch village, dungeon, cave, city, and realm map generators (via Maphub) from Foundry and import the result into a scene.

### Journal Pins
Add custom styled pins to maps and link them to journal entries. Includes a pin list panel and placeable note tools.

### Drawing Tools
Extended canvas drawing shapes and a wall context menu for faster scene prep.

### Scene Export / Import
Save scenes as JSON and reload them. Useful for backing up hand-crafted maps or sharing scenes between worlds.

---

## Requirements

| | |
|---|---|
| **Foundry VTT** | Version 14 or later |
| **Game System** | [Mythic Bastionland](https://foundryvtt.com/packages/mythicbastionland) |
| **socketlib** | [foundryvtt.com/packages/socketlib](https://foundryvtt.com/packages/socketlib) |
| **lib-wrapper** | [foundryvtt.com/packages/lib-wrapper](https://foundryvtt.com/packages/lib-wrapper) |

---

## Installation

Install via the Foundry module browser by searching **Mythic Bastionland Extras**, or paste the manifest URL directly:

```
https://github.com/maskoz/mythic-bastionland-extras/releases/latest/download/module.json
```

Then enable the module in your Mythic Bastionland world under **Settings > Manage Modules**.

---

## Using the Realm Generator

The realm generator builds a complete Mythic Bastionland realm with terrain, river, barriers, holdings, myths, and landmarks. It then creates a Foundry hex scene and journal automatically.

1. Open the **SDX Tray** (the panel on the right side of the screen) and find the **MB Realm** tab, or run the generator from the macro console.
2. Click **Generate Realm** to create a new realm with randomised terrain and features.
3. Click **Build Scene** to paint the hex map. Choose **Overwrite** to replace an existing scene.
4. Click **Build Journal** to generate the realm journal. This creates one entry per holding, myth, and landmark, plus a Barriers page for the GM.

The journal includes hex coordinates for every location. Barrier hexes are listed by coordinate and terrain so GMs can tint them on the map.

---

## Hex Map Coordinates

The coordinate overlay labels columns **A-L** and rows **1-12**. Coordinates appear on each hex and in the left margin. Toggle the overlay in module settings. It works on any hex column scene.

Hover over any hex to see its terrain, notes, and content in the tooltip. Per-hex records are stored in the scene and persist between sessions.

---

## Credits

- **DmKal** - Original Shadowdark Extras module
- **maskoz** - Mythic Bastionland port and realm generator

All original tooling remains under its original licence.
