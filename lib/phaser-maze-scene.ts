// Phaser scene for the Robot Programmer maze.
// Uses Sprout Lands sprite assets (16×16 tiles, 48×48 character) if present,
// falls back to procedural graphics otherwise.

import Phaser from "phaser";

import type { Level, ThemeId } from "@/app/(app)/game/robot/levels";

export interface MazeView {
  robotX: number;
  robotY: number;
  /** 0=N, 1=E, 2=S, 3=W (matches our Direction type). */
  robotDir: number;
  litTiles: Set<string>;
}

interface ThemeColors {
  bgTop: number;
  bgBottom: number;
  tileTop: number;
  tileBottom: number;
  tileEdge: number;
  bladeDark: number;
  targetBase: number;
  targetRim: number;
  gem: number;
  glow: number;
  litTop: number;
  litBottom: number;
  borderTop: number;
  borderBottom: number;
  borderEdge: number;
  treeLeaf: number;
  treeLeafDark: number;
  treeTrunk: number;
}

const THEMES: Record<ThemeId, ThemeColors> = {
  jungle: {
    bgTop: 0x065f46,
    bgBottom: 0x064e3b,
    tileTop: 0x86d960,
    tileBottom: 0x3f9c2c,
    tileEdge: 0x2d6b1c,
    bladeDark: 0x1f4d12,
    targetBase: 0xfcd34d,
    targetRim: 0xf59e0b,
    gem: 0xfef3c7,
    glow: 0xfbbf24,
    litTop: 0xfde68a,
    litBottom: 0xf59e0b,
    borderTop: 0xcaa472,
    borderBottom: 0x8a6a3f,
    borderEdge: 0x5a4222,
    treeLeaf: 0x16a34a,
    treeLeafDark: 0x0f5f29,
    treeTrunk: 0x7c4a1c,
  },
  ice: {
    bgTop: 0x1e1b4b,
    bgBottom: 0x312e81,
    tileTop: 0xc7d2fe,
    tileBottom: 0x6366f1,
    tileEdge: 0x4338ca,
    bladeDark: 0x1e1b4b,
    targetBase: 0xa78bfa,
    targetRim: 0x7c3aed,
    gem: 0xe9d5ff,
    glow: 0xa855f7,
    litTop: 0xfef9c3,
    litBottom: 0xfbbf24,
    borderTop: 0x94a3b8,
    borderBottom: 0x475569,
    borderEdge: 0x1f2937,
    treeLeaf: 0x6366f1,
    treeLeafDark: 0x3730a3,
    treeTrunk: 0x4b5563,
  },
  space: {
    bgTop: 0x020617,
    bgBottom: 0x0f172a,
    tileTop: 0x475569,
    tileBottom: 0x1e293b,
    tileEdge: 0x0f172a,
    bladeDark: 0x020617,
    targetBase: 0xc084fc,
    targetRim: 0x9333ea,
    gem: 0x67e8f9,
    glow: 0x06b6d4,
    litTop: 0x67e8f9,
    litBottom: 0x0891b2,
    borderTop: 0x475569,
    borderBottom: 0x1e293b,
    borderEdge: 0x020617,
    treeLeaf: 0x06b6d4,
    treeLeafDark: 0x0e7490,
    treeTrunk: 0x334155,
  },
  lava: {
    bgTop: 0x4c0519,
    bgBottom: 0x7c2d12,
    tileTop: 0x9a3412,
    tileBottom: 0x7c2d12,
    tileEdge: 0x431407,
    bladeDark: 0x3f1d0e,
    targetBase: 0xfb923c,
    targetRim: 0xc2410c,
    gem: 0xfef3c7,
    glow: 0xfbbf24,
    litTop: 0xfef9c3,
    litBottom: 0xfbbf24,
    borderTop: 0xa16207,
    borderBottom: 0x713f12,
    borderEdge: 0x3f1d0e,
    treeLeaf: 0xdc2626,
    treeLeafDark: 0x7f1d1d,
    treeTrunk: 0x451a03,
  },
};

const TILE = 64;
const STEP_MS = 320;
const SPRITE_SCALE = 4; // 16×16 native → 64×64 game units
const CHAR_SCALE = 2; // 48×48 native → 96 game units (character pops nicely above tiles)
const EGG_SCALE = 2; // 16×16 native → 32 game units (about half a tile)

// Sprout Lands character spritesheet layout (4×4 of 48×48 frames).
// Standard layout: each row = direction × 4 walk-cycle frames.
const CHAR_ANIM = {
  down: { start: 0, end: 3 },
  up: { start: 4, end: 7 },
  left: { start: 8, end: 11 },
  right: { start: 12, end: 15 },
};

// Frame index in Grass.png (11×7 grid of 16×16) for a "full" grass tile.
// Sprout Lands' bitmask tilesets have the fully-surrounded centerpiece partway down.
const GRASS_FRAME = 17; // row 1, col 6 ish; if wrong, easy to change

interface SpriteAvailability {
  character: boolean;
  grass: boolean;
  egg: boolean;
  biome: boolean;
  hills: boolean;
}

export class MazeScene extends Phaser.Scene {
  private level!: Level;
  private themeId: ThemeId = "jungle";
  private litTiles: Set<string> = new Set();
  private tileObjects: Phaser.GameObjects.Container[][] = [];
  private hero: Phaser.GameObjects.Container | null = null;
  private heroSprite: Phaser.GameObjects.Sprite | null = null;
  private heroTween: Phaser.Tweens.Tween | null = null;
  private sprites: SpriteAvailability = {
    character: false,
    grass: false,
    egg: false,
    biome: false,
    hills: false,
  };
  private currentView: MazeView = {
    robotX: 0,
    robotY: 0,
    robotDir: 2, // start facing down for character sheet
    litTiles: new Set(),
  };
  private boundsW = 0;
  private boundsH = 0;

  constructor() {
    super({ key: "MazeScene" });
  }

  preload() {
    const slots: Array<{
      key: keyof SpriteAvailability;
      path: string;
      sheet?: { fw: number; fh: number };
    }> = [
      { key: "character", path: "/sprites/character.png", sheet: { fw: 48, fh: 48 } },
      { key: "grass", path: "/sprites/grass-tileset.png", sheet: { fw: 16, fh: 16 } },
      { key: "egg", path: "/sprites/egg.png" },
      { key: "biome", path: "/sprites/biome.png", sheet: { fw: 16, fh: 16 } },
      { key: "hills", path: "/sprites/hills-tileset.png", sheet: { fw: 16, fh: 16 } },
    ];

    this.load.on("loaderror", (file: { key: string }) => {
      const slot = slots.find((s) => s.key === file.key);
      if (slot) this.sprites[slot.key] = false;
    });

    for (const slot of slots) {
      this.sprites[slot.key] = true;
      if (slot.sheet) {
        this.load.spritesheet(slot.key, slot.path, {
          frameWidth: slot.sheet.fw,
          frameHeight: slot.sheet.fh,
        });
      } else {
        this.load.image(slot.key, slot.path);
      }
    }
  }

  create() {
    const data = (this.scene.settings.data as {
      level?: Level;
      themeId?: ThemeId;
      view?: MazeView;
    } | null) ?? null;
    if (data?.level) this.level = data.level;
    if (data?.themeId) this.themeId = data.themeId;
    if (data?.view) this.currentView = data.view;

    // Build character animations once
    if (this.sprites.character) {
      for (const [name, range] of Object.entries(CHAR_ANIM)) {
        const key = `char-walk-${name}`;
        if (!this.anims.exists(key)) {
          this.anims.create({
            key,
            frames: this.anims.generateFrameNumbers("character", range),
            frameRate: 8,
            repeat: -1,
          });
        }
        const idleKey = `char-idle-${name}`;
        if (!this.anims.exists(idleKey)) {
          this.anims.create({
            key: idleKey,
            frames: [{ key: "character", frame: range.start }],
            frameRate: 1,
          });
        }
      }
    }

    if (this.level) this.buildScene();
  }

  setLevel(level: Level, themeId: ThemeId, view: MazeView) {
    this.level = level;
    this.themeId = themeId;
    this.currentView = view;
    this.litTiles = new Set(view.litTiles);
    if (this.scene.isActive()) {
      this.buildScene();
    }
  }

  setView(view: MazeView) {
    if (!this.hero || !this.level) return;
    const prev = this.currentView;
    this.currentView = view;

    // Refresh lit tiles if changed
    let same = prev.litTiles.size === view.litTiles.size;
    if (same) {
      for (const k of view.litTiles)
        if (!prev.litTiles.has(k)) {
          same = false;
          break;
        }
    }
    if (!same) {
      this.litTiles = new Set(view.litTiles);
      this.refreshTileLits();
    }

    const [px, py] = this.gridToPixel(view.robotX, view.robotY);
    const isMoving =
      px !== this.hero.x || py !== this.hero.y || view.robotDir !== prev.robotDir;

    // Update character animation based on direction
    this.playCharacterAnim(view.robotDir, isMoving);

    if (this.heroTween) this.heroTween.stop();
    this.heroTween = this.tweens.add({
      targets: this.hero,
      x: px,
      y: py,
      duration: STEP_MS,
      ease: "Cubic.easeOut",
      onComplete: () => {
        // back to idle frame when motion stops
        this.playCharacterAnim(this.currentView.robotDir, false);
      },
    });
  }

  // ----------------------------------------------------------------------
  // Internal
  // ----------------------------------------------------------------------

  private playCharacterAnim(dir: number, walking: boolean) {
    if (!this.heroSprite || !this.sprites.character) return;
    const name = dirName(dir);
    const key = walking ? `char-walk-${name}` : `char-idle-${name}`;
    if (this.heroSprite.anims.currentAnim?.key !== key) {
      this.heroSprite.play(key, true);
    }
  }

  private buildScene() {
    for (const row of this.tileObjects) for (const t of row) t.destroy();
    this.tileObjects = [];
    if (this.hero) {
      this.hero.destroy();
      this.hero = null;
      this.heroSprite = null;
    }
    this.children.removeAll();

    const theme = THEMES[this.themeId];
    const cols = this.level.width;
    const rows = this.level.height;
    this.boundsW = (cols + 2) * TILE;
    this.boundsH = (rows + 2) * TILE;

    // Background gradient
    const bg = this.add.graphics();
    bg.fillStyle(theme.bgTop, 1);
    bg.fillRect(0, 0, this.boundsW, this.boundsH);
    bg.fillStyle(theme.bgBottom, 1);
    bg.fillRect(0, this.boundsH / 2, this.boundsW, this.boundsH / 2);

    // Border tiles
    for (let bx = -1; bx <= cols; bx++) {
      this.drawBorderTile(bx, -1, theme);
      this.drawBorderTile(bx, rows, theme);
    }
    for (let by = 0; by < rows; by++) {
      this.drawBorderTile(-1, by, theme);
      this.drawBorderTile(cols, by, theme);
    }

    // Corner trees
    const corners: Array<[number, number]> = [
      [-1, -1],
      [cols, -1],
      [-1, rows],
      [cols, rows],
    ];
    for (const [cx, cy] of corners) this.drawTree(cx, cy, theme);

    // Playable tiles — walls render differently from walkable
    for (let y = 0; y < rows; y++) {
      const row: Phaser.GameObjects.Container[] = [];
      for (let x = 0; x < cols; x++) {
        const isWall = this.level.walls.has(`${x},${y}`);
        row.push(
          isWall
            ? this.drawWallTile(x, y, theme)
            : this.drawTile(x, y, theme),
        );
      }
      this.tileObjects.push(row);
    }

    // Hero — depth 10 keeps it above any tile that gets rebuilt later
    this.hero = this.drawHero();
    this.hero.setDepth(10);
    const [hx, hy] = this.gridToPixel(
      this.currentView.robotX,
      this.currentView.robotY,
    );
    this.hero.setPosition(hx, hy);
    this.playCharacterAnim(this.currentView.robotDir, false);

    this.scale.setGameSize(this.boundsW, this.boundsH);
  }

  private gridToPixel(gx: number, gy: number): [number, number] {
    const rows = this.level.height;
    const px = (gx + 1) * TILE + TILE / 2;
    const py = (rows - gy) * TILE + TILE / 2 - TILE;
    return [px, py];
  }

  private drawTile(gx: number, gy: number, theme: ThemeColors) {
    const [px, py] = this.gridToPixel(gx, gy);
    const isTarget = this.level.targets.some((t) => t.x === gx && t.y === gy);
    const lit = this.litTiles.has(`${gx},${gy}`);
    const container = this.add.container(px, py);
    container.setData("isTarget", isTarget);
    container.setData("lit", lit);

    // Base grass — sprite if available, otherwise procedural
    if (this.sprites.grass) {
      const base = this.add.sprite(0, 0, "grass", GRASS_FRAME);
      base.setScale(SPRITE_SCALE);
      container.add(base);
    } else {
      this.drawGrassFallback(container, theme, gx, gy);
    }

    if (lit) {
      // Picked — show plain grass, nothing else. The "achievement" signal
      // is that the egg is gone.
    } else if (isTarget) {
      // Glow halo
      const glow = this.add.circle(0, 0, TILE / 2 - 8, theme.glow, 0.4);
      container.add(glow);
      this.tweens.add({
        targets: glow,
        alpha: 0.7,
        scale: 1.1,
        yoyo: true,
        repeat: -1,
        duration: 1100,
        ease: "Sine.easeInOut",
      });
      // Egg (Sprout Lands) or procedural gem
      if (this.sprites.egg) {
        const egg = this.add.image(0, -2, "egg");
        egg.setScale(EGG_SCALE);
        container.add(egg);
        container.setData("egg", egg);
        // Subtle bob on the egg
        this.tweens.add({
          targets: egg,
          y: -5,
          yoyo: true,
          repeat: -1,
          duration: 900,
          ease: "Sine.easeInOut",
        });
      } else {
        const ped = this.add.ellipse(0, 11, 28, 8, 0x000000, 0.25);
        container.add(ped);
        const base = this.add.circle(0, 0, 13, theme.targetRim);
        base.setStrokeStyle(1.5, theme.tileEdge);
        container.add(base);
        const gem = this.add.polygon(0, 0, "0 -8 7 0 0 8 -7 0", theme.gem, 1);
        gem.setStrokeStyle(1.2, theme.targetRim);
        container.add(gem);
        this.tweens.add({
          targets: gem,
          rotation: Math.PI * 2,
          duration: 4000,
          repeat: -1,
        });
      }
    }

    return container;
  }

  private drawGrassFallback(
    container: Phaser.GameObjects.Container,
    theme: ThemeColors,
    gx: number,
    gy: number,
  ) {
    const g = this.add.graphics();
    g.fillGradientStyle(
      theme.tileTop,
      theme.tileTop,
      theme.tileBottom,
      theme.tileBottom,
      1,
    );
    g.fillRoundedRect(-TILE / 2 + 2, -TILE / 2 + 2, TILE - 4, TILE - 4, 6);
    g.lineStyle(1.5, theme.tileEdge, 1);
    g.strokeRoundedRect(-TILE / 2 + 2, -TILE / 2 + 2, TILE - 4, TILE - 4, 6);
    g.fillStyle(0xffffff, 0.18);
    g.fillRoundedRect(-TILE / 2 + 4, -TILE / 2 + 3, TILE - 8, 5, 2.5);
    const seed = gx * 13 + gy * 7 + 1;
    g.lineStyle(1.4, theme.bladeDark, 0.7);
    this.drawGrassTuft(g, (seed * 7) % 40 - 20, (seed * 11) % 18 + 10);
    this.drawGrassTuft(g, (seed * 13) % 40 - 20, (seed * 17) % 18 + 10);
    container.add(g);
  }

  private drawGrassTuft(g: Phaser.GameObjects.Graphics, x: number, y: number) {
    g.beginPath();
    g.moveTo(x - 3, y + 3);
    g.lineTo(x - 1, y - 2);
    g.lineTo(x + 1, y + 3);
    g.lineTo(x + 3, y - 2);
    g.strokePath();
  }

  private drawWallTile(gx: number, gy: number, theme: ThemeColors) {
    const [px, py] = this.gridToPixel(gx, gy);
    const container = this.add.container(px, py);
    container.setData("wall", true);
    // Stone-style wall — distinct from the wooden border but visually heavier
    const g = this.add.graphics();
    g.fillGradientStyle(
      theme.borderTop,
      theme.borderTop,
      theme.borderBottom,
      theme.borderBottom,
      1,
    );
    g.fillRoundedRect(-TILE / 2 + 2, -TILE / 2 + 2, TILE - 4, TILE - 4, 6);
    g.lineStyle(2, theme.borderEdge);
    g.strokeRoundedRect(-TILE / 2 + 2, -TILE / 2 + 2, TILE - 4, TILE - 4, 6);
    // Highlight
    g.fillStyle(0xffffff, 0.12);
    g.fillRoundedRect(-TILE / 2 + 4, -TILE / 2 + 3, TILE - 8, 5, 2.5);
    // Diagonal hatch pattern to read clearly as "wall, not walkable"
    const seed = Math.abs(gx * 17 + gy * 11);
    g.lineStyle(1.2, theme.borderEdge, 0.55);
    for (let i = -1; i < 3; i++) {
      g.beginPath();
      const o = ((seed + i * 13) % 18) - 28 + i * 18;
      g.moveTo(o, -TILE / 2 + 4);
      g.lineTo(o + 18, TILE / 2 - 4);
      g.strokePath();
    }
    container.add(g);
    return container;
  }

  private drawBorderTile(gx: number, gy: number, theme: ThemeColors) {
    const rows = this.level.height;
    const px = (gx + 1) * TILE + TILE / 2;
    const py = (rows - gy) * TILE + TILE / 2 - TILE;
    const g = this.add.graphics();
    g.fillGradientStyle(
      theme.borderTop,
      theme.borderTop,
      theme.borderBottom,
      theme.borderBottom,
      1,
    );
    g.fillRoundedRect(px - TILE / 2 + 2, py - TILE / 2 + 2, TILE - 4, TILE - 4, 6);
    g.lineStyle(1.5, theme.borderEdge);
    g.strokeRoundedRect(px - TILE / 2 + 2, py - TILE / 2 + 2, TILE - 4, TILE - 4, 6);
    g.fillStyle(0xffffff, 0.1);
    g.fillRoundedRect(px - TILE / 2 + 4, py - TILE / 2 + 3, TILE - 8, 4, 2);
    const seed = Math.abs(gx * 7 + gy * 11);
    for (let i = 0; i < 3; i++) {
      const dx = ((seed * (i + 1) * 13) % 40) - 20;
      const dy = ((seed * (i + 1) * 17) % 40) - 20;
      g.fillStyle(theme.borderEdge, 0.35);
      g.fillCircle(px + dx, py + dy, 1.5 - i * 0.3);
    }
  }

  private drawTree(gx: number, gy: number, theme: ThemeColors) {
    const px = (gx + 1) * TILE + TILE / 2;
    const py = (this.level.height - gy) * TILE + TILE / 2 - TILE;
    const tree = this.add.container(px, py);

    const trunk = this.add.rectangle(0, 10, 8, 22, theme.treeTrunk);
    tree.add(trunk);
    const leafBack = this.add.circle(0, -8, 18, theme.treeLeafDark);
    tree.add(leafBack);
    const leafLeft = this.add.circle(-7, -14, 13, theme.treeLeaf);
    tree.add(leafLeft);
    const leafRight = this.add.circle(7, -14, 13, theme.treeLeaf);
    tree.add(leafRight);
    const leafTop = this.add.circle(0, -22, 11, theme.treeLeaf);
    tree.add(leafTop);

    this.tweens.add({
      targets: tree,
      rotation: 0.06,
      yoyo: true,
      repeat: -1,
      duration: 3500,
      ease: "Sine.easeInOut",
    });
  }

  private drawHero() {
    const hero = this.add.container(0, 0);

    if (this.sprites.character) {
      const sprite = this.add.sprite(0, -8, "character", 0);
      sprite.setScale(CHAR_SCALE);
      hero.add(sprite);
      this.heroSprite = sprite;

      // Shadow under the character
      const shadow = this.add.ellipse(0, 22, 30, 6, 0x000000, 0.3);
      shadow.setDepth(-1);
      hero.add(shadow);
      hero.bringToTop(sprite);
    } else {
      // Procedural robot fallback (kept from earlier version)
      const shadow = this.add.ellipse(0, 22, 36, 7, 0x000000, 0.25);
      hero.add(shadow);
      const treads = this.add.rectangle(0, 13, 44, 12, 0x1f1f33);
      hero.add(treads);
      const treadHi = this.add.rectangle(0, 9, 44, 4, 0x3b3b5e);
      hero.add(treadHi);
      for (const x of [-14, 0, 14]) {
        const hub = this.add.circle(x, 14, 3.5, 0x4b4b73);
        hub.setStrokeStyle(0.8, 0x1f1f33);
        hero.add(hub);
      }
      const body = this.add.graphics();
      body.fillGradientStyle(0xc4b5fd, 0xc4b5fd, 0x6d28d9, 0x6d28d9, 1);
      body.fillRoundedRect(-22, -22, 44, 36, 10);
      body.lineStyle(2, 0x4c1d95);
      body.strokeRoundedRect(-22, -22, 44, 36, 10);
      hero.add(body);
      const plate = this.add.rectangle(0, -8, 34, 18, 0x0f172a);
      plate.setStrokeStyle(1.2, 0x000000);
      hero.add(plate);
      hero.add(this.add.circle(-8, -8, 4, 0xffffff));
      hero.add(this.add.circle(8, -8, 4, 0xffffff));
      hero.add(this.add.circle(-7, -7, 2, 0x0f172a));
      hero.add(this.add.circle(9, -7, 2, 0x0f172a));
      const smile = this.add.graphics();
      smile.lineStyle(1.6, 0xffffff);
      smile.beginPath();
      smile.moveTo(-7, 0);
      smile.lineTo(-3, 3);
      smile.lineTo(3, 3);
      smile.lineTo(7, 0);
      smile.strokePath();
      hero.add(smile);
      const anten = this.add.rectangle(0, -28, 2, 12, 0x1f1f33);
      hero.add(anten);
      const antenBall = this.add.circle(0, -36, 4, 0xf59e0b);
      antenBall.setStrokeStyle(1, 0xb45309);
      hero.add(antenBall);
    }

    return hero;
  }

  private refreshTileLits() {
    if (!this.tileObjects.length) return;
    const theme = THEMES[this.themeId];
    for (let y = 0; y < this.level.height; y++) {
      for (let x = 0; x < this.level.width; x++) {
        const tile = this.tileObjects[y][x];
        const wasLit = !!tile.getData("lit");
        const isLit = this.litTiles.has(`${x},${y}`);
        if (wasLit === isLit) continue;

        const gx = x;
        const gy = y;
        if (!wasLit && isLit) {
          // Pickup animation: egg flies up + fades, then tile re-renders as plain grass
          const egg = tile.getData("egg") as
            | Phaser.GameObjects.Image
            | undefined;
          // Sparkle burst at the tile center
          this.spawnPickupSparkle(tile.x, tile.y);
          if (egg) {
            this.tweens.killTweensOf(egg);
            this.tweens.add({
              targets: egg,
              y: egg.y - 30,
              alpha: 0,
              scale: EGG_SCALE * 1.3,
              duration: 280,
              ease: "Back.easeIn",
              onComplete: () => {
                tile.destroy();
                this.tileObjects[gy][gx] = this.drawTile(gx, gy, theme);
              },
            });
          } else {
            tile.destroy();
            this.tileObjects[gy][gx] = this.drawTile(gx, gy, theme);
          }
        } else {
          tile.destroy();
          this.tileObjects[gy][gx] = this.drawTile(gx, gy, theme);
        }
      }
    }
  }

  private spawnPickupSparkle(x: number, y: number) {
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + Math.random() * 0.3;
      const dx = Math.cos(angle) * 24;
      const dy = Math.sin(angle) * 24;
      const sparkle = this.add.star(
        x,
        y,
        4,
        2,
        4,
        0xfde047,
      );
      sparkle.setScale(0.6);
      sparkle.setDepth(20); // above hero and tiles
      this.tweens.add({
        targets: sparkle,
        x: x + dx,
        y: y + dy - 6,
        alpha: 0,
        scale: 0.1,
        duration: 480,
        ease: "Cubic.easeOut",
        onComplete: () => sparkle.destroy(),
      });
    }
  }
}

function dirName(dir: number): "down" | "up" | "left" | "right" {
  // 0=N=up, 1=E=right, 2=S=down, 3=W=left
  if (dir === 0) return "up";
  if (dir === 1) return "right";
  if (dir === 2) return "down";
  return "left";
}
