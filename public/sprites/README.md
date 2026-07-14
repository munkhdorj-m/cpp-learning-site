# Robot Programmer sprite pack

The `/robot` game uses Phaser to render the maze. By default it draws everything procedurally and works fine without any image files. To upgrade to real pixel art, drop these files into this folder.

## File slots the game looks for

| File path | Used for | Recommended size |
|-----------|----------|------------------|
| `/sprites/grass.png` | Walkable grass tile | 64×64 (or 16×16, will scale) |
| `/sprites/target.png` | Tile the robot must light up | 64×64 |
| `/sprites/hero.png` | The robot character | 64×64 |
| `/sprites/tree.png` | Decorative tree in border corners | 64×64 |
| `/sprites/border.png` | Decorative stone tile around the maze | 64×64 |

The Phaser scene loads each file at startup. **Missing files automatically fall back to the procedural graphics** — you can install just one or two, no need for the full set.

## Recommended source: Kenney Tiny Town (free, CC0)

Kenney releases professional-quality game art under a public-domain license — totally free, no attribution required.

1. Go to <https://kenney.nl/assets/tiny-town>
2. Click **Download (3.6 MB)**
3. Unzip the archive
4. Inside `Tiles/Default/`, you'll find dozens of 16×16 PNGs named like `tile_0000.png`, `tile_0001.png`, etc.
5. Copy and rename the ones below into this `public/sprites/` folder:

| Slot | Suggested Tiny Town file |
|------|--------------------------|
| `grass.png` | `tile_0000.png` or `tile_0001.png` (plain grass) |
| `target.png` | `tile_0006.png` (the diamond-like sparkle tile) |
| `hero.png` | Pick anything from `Characters/` — `character_0000.png` is the white knight |
| `tree.png` | `tile_0030.png` (tree) |
| `border.png` | `tile_0044.png` (stone/path) |

The numbers vary slightly per release — just pick visually-matching tiles, names don't matter once they're renamed.

## Other free packs that work

Any 16×16 or 32×32 PNG with a transparent background works. Some alternatives:

- **Kenney 1-Bit Pack** — single-color minimalist look
- **Kenney Roguelike Caves** — darker dungeon feel
- **Kenney Tiny Dungeon** — has multi-frame animated characters

For animated characters (walking sprite sheets), wait for the next phase of the game — the engine currently uses static hero images.

## Permissions reminder

Kenney's CC0 license means you can use, modify, and redistribute these assets in any project (commercial or otherwise) without giving credit. A "thanks Kenney" link in your About page is appreciated but not required.

Do **not** use Code.org's, Angry Birds', Frozen's, or any other proprietary characters — those are copyrighted.
