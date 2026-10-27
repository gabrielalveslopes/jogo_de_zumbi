import Phaser from 'phaser';
import { WEAPONS } from '../data/weapons';
import {
  COLORS, DEPTH_OVERLAY, FONT_FAMILY, GAME_HEIGHT, GAME_WIDTH, MAX_DELTA_MS,
  SCENE_KEYS, TEXTURE_KEYS, WORLD_SIZE,
} from '../game/constants';
import { announceScene } from '../game/EventBus';
import { Enemy } from '../entities/Enemy';
import { Player } from '../entities/Player';
import { Projectile } from '../entities/Projectile';
import { circlesOverlap, rollHit } from '../systems/combat';
import { getDifficulty } from '../systems/DifficultySystem';
import { SpawnSystem } from '../systems/SpawnSystem';
import { WeaponSystem, type FireEvent } from '../systems/WeaponSystem';
import { HUD } from '../ui/HUD';
import { clampDelta, normalize } from '../utils/math';
import { createRng, type Rng } from '../utils/random';

interface Keys {
  w: Phaser.Input.Keyboard.Key;
  a: Phaser.Input.Keyboard.Key;
  s: Phaser.Input.Keyboard.Key;
  d: Phaser.Input.Keyboard.Key;
  up: Phaser.Input.Keyboard.Key;
  left: Phaser.Input.Keyboard.Key;
  down: Phaser.Input.Keyboard.Key;
  right: Phaser.Input.Keyboard.Key;
  esc: Phaser.Input.Keyboard.Key;
  m: Phaser.Input.Keyboard.Key;
  f3: Phaser.Input.Keyboard.Key;
}

/** Fase 2: jogador, inimigos que perseguem, colisão/dano, arma automática, morte e reinício. */
export class GameScene extends Phaser.Scene {
  private player!: Player;
  private keys!: Keys;
  private rng!: Rng;
  private weapon!: WeaponSystem;
  private spawner!: SpawnSystem;
  private hud!: HUD;
  private pauseOverlay!: Phaser.GameObjects.Container;
  private enemies: Enemy[] = [];
  private projectiles: Projectile[] = [];
  private elapsed = 0; // segundos de simulação (não avança em pausa)
  private kills = 0;
  private paused = false;
  private dying = false;

  private readonly onFire = (e: FireEvent): void => {
    this.projectiles.push(new Projectile(this, e.x, e.y, e.dirX, e.dirY, this.weapon.def));
  };

  constructor() {
    super(SCENE_KEYS.Game);
  }

  create(): void {
    announceScene(SCENE_KEYS.Game);
    const kb = this.input.keyboard;
    if (!kb) throw new Error('Teclado indisponível neste ambiente.');

    // Estado zerado a cada (re)início: campos de classe só são inicializados uma vez.
    this.enemies = [];
    this.projectiles = [];
    this.elapsed = 0;
    this.kills = 0;
    this.paused = false;
    this.dying = false;
    this.rng = createRng(Math.floor(Math.random() * 0xffffffff));

    this.keys = {
      w: kb.addKey('W'), a: kb.addKey('A'), s: kb.addKey('S'), d: kb.addKey('D'),
      up: kb.addKey('UP'), left: kb.addKey('LEFT'), down: kb.addKey('DOWN'), right: kb.addKey('RIGHT'),
      esc: kb.addKey('ESC'), m: kb.addKey('M'), f3: kb.addKey('F3'),
    };

    this.add.tileSprite(0, 0, WORLD_SIZE, WORLD_SIZE, TEXTURE_KEYS.Floor).setOrigin(0);
    this.player = new Player(this, WORLD_SIZE / 2, WORLD_SIZE / 2);

    const cam = this.cameras.main;
    cam.setBounds(0, 0, WORLD_SIZE, WORLD_SIZE);
    cam.startFollow(this.player.image, true, 0.12, 0.12);
    cam.setRoundPixels(true);

    this.weapon = new WeaponSystem(WEAPONS.pistol);
    this.spawner = new SpawnSystem(this.rng, {
      worldSize: WORLD_SIZE, viewHalfW: GAME_WIDTH / 2, viewHalfH: GAME_HEIGHT / 2, margin: 40,
    });
    this.hud = new HUD(this);
    this.createPauseOverlay();
  }

  update(_time: number, deltaMs: number): void {
    if (Phaser.Input.Keyboard.JustDown(this.keys.f3)) this.hud.toggleDebug();
    if (this.dying) return;

    if (Phaser.Input.Keyboard.JustDown(this.keys.esc)) this.setPaused(!this.paused);
    if (this.paused) {
      if (Phaser.Input.Keyboard.JustDown(this.keys.m)) this.scene.start(SCENE_KEYS.MainMenu);
      return;
    }

    const dt = clampDelta(deltaMs, MAX_DELTA_MS) / 1000;
    this.elapsed += dt;
    const nowMs = this.elapsed * 1000;

    this.updatePlayer(dt, nowMs);
    this.updateSpawns(dt);
    this.updateEnemies(dt, nowMs);
    this.weapon.update(dt, this.player.x, this.player.y, this.enemies, this.onFire);
    this.updateProjectiles(dt, nowMs);
    this.applyContactDamage(nowMs);

    this.compact(this.enemies);
    this.compact(this.projectiles);

    this.hud.update(
      {
        hp: this.player.hp, maxHp: this.player.maxHp, timeSec: this.elapsed, kills: this.kills,
        enemies: this.enemies.length, projectiles: this.projectiles.length,
      },
      this.time.now,
    );

    if (this.player.dead) this.onPlayerDeath();
  }

  private updatePlayer(dt: number, nowMs: number): void {
    const k = this.keys;
    const ix = (k.d.isDown || k.right.isDown ? 1 : 0) - (k.a.isDown || k.left.isDown ? 1 : 0);
    const iy = (k.s.isDown || k.down.isDown ? 1 : 0) - (k.w.isDown || k.up.isDown ? 1 : 0);
    const dir = normalize(ix, iy);
    this.player.move(dir.x, dir.y, dt, WORLD_SIZE);
    this.player.updateVisual(nowMs);
  }

  private updateSpawns(dt: number): void {
    const requests = this.spawner.update(dt, this.elapsed, this.enemies.length, this.player.x, this.player.y);
    if (requests.length === 0) return;
    const diff = getDifficulty(this.elapsed);
    for (const r of requests) {
      this.enemies.push(new Enemy(this, r.def, r.x, r.y, diff.hpMultiplier, diff.damageMultiplier, this.rng));
    }
  }

  private updateEnemies(dt: number, nowMs: number): void {
    const px = this.player.x;
    const py = this.player.y;
    for (const e of this.enemies) e.update(dt, nowMs, px, py);
  }

  private updateProjectiles(dt: number, nowMs: number): void {
    for (const p of this.projectiles) {
      if (!p.alive) continue;
      p.update(dt);
      if (!p.alive) continue;

      for (const e of this.enemies) {
        if (!e.alive || p.hit.has(e)) continue;
        if (!circlesOverlap(p.x, p.y, p.radius, e.x, e.y, e.def.radius)) continue;

        const { damage } = rollHit(p.damage, p.critChance, p.critMultiplier, this.rng);
        p.hit.add(e);
        if (e.takeDamage(damage, nowMs)) {
          this.kills++;
          this.spawnBlood(e.x, e.y);
        }
        if (p.pierceLeft <= 0) {
          p.alive = false;
          break;
        }
        p.pierceLeft--;
      }
    }
  }

  private applyContactDamage(nowMs: number): void {
    const p = this.player;
    for (const e of this.enemies) {
      if (!e.alive) continue;
      if (!circlesOverlap(p.x, p.y, p.radius, e.x, e.y, e.def.radius)) continue;
      if (p.takeDamage(e.damage, nowMs) > 0) {
        this.cameras.main.shake(120, 0.004);
        break; // invulnerabilidade: só um golpe por janela
      }
    }
  }

  /** Remove entidades mortas in-place, sem criar arrays novos. */
  private compact<T extends { alive: boolean; destroy(): void }>(list: T[]): void {
    let w = 0;
    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      if (!item) continue;
      if (item.alive) list[w++] = item;
      else item.destroy();
    }
    list.length = w;
  }

  private spawnBlood(x: number, y: number): void {
    const splat = this.add.rectangle(x, y, 7, 4, COLORS.blood, 0.8).setDepth(0.5);
    this.tweens.add({ targets: splat, alpha: 0, duration: 700, onComplete: () => splat.destroy() });
  }

  private onPlayerDeath(): void {
    this.dying = true;
    this.player.image.setAlpha(1).setTint(COLORS.blood);
    this.cameras.main.shake(300, 0.008);
    const timeSec = this.elapsed;
    const kills = this.kills;
    this.time.delayedCall(700, () => this.scene.start(SCENE_KEYS.GameOver, { timeSec, kills }));
  }

  private createPauseOverlay(): void {
    const bg = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.6).setOrigin(0);
    const title = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 12, 'PAUSADO', {
        fontFamily: FONT_FAMILY, fontSize: '24px', color: COLORS.textAccent,
      })
      .setOrigin(0.5);
    const hint = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 16, 'ESC: continuar  •  M: menu principal', {
        fontFamily: FONT_FAMILY, fontSize: '11px', color: COLORS.text,
      })
      .setOrigin(0.5);
    this.pauseOverlay = this.add
      .container(0, 0, [bg, title, hint])
      .setScrollFactor(0).setDepth(DEPTH_OVERLAY).setVisible(false);
  }

  private setPaused(value: boolean): void {
    this.paused = value;
    this.pauseOverlay.setVisible(value);
  }
}
