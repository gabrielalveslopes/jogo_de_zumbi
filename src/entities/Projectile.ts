import Phaser from 'phaser';
import { TEXTURE_KEYS } from '../game/constants';
import type { WeaponDef } from '../data/weapons';
import type { Enemy } from './Enemy';

export class Projectile {
  readonly image: Phaser.GameObjects.Image;
  readonly radius = 3;
  readonly damage: number;
  readonly critChance: number;
  readonly critMultiplier: number;
  /** Inimigos já atingidos (evita acertar o mesmo duas vezes ao perfurar). */
  readonly hit = new Set<Enemy>();
  pierceLeft: number;
  alive = true;
  private readonly vx: number;
  private readonly vy: number;
  private lifeSec: number;

  constructor(scene: Phaser.Scene, x: number, y: number, dirX: number, dirY: number, def: WeaponDef) {
    this.image = scene.add.image(x, y, TEXTURE_KEYS.Bullet);
    this.vx = dirX * def.projectileSpeed;
    this.vy = dirY * def.projectileSpeed;
    this.damage = def.damage;
    this.critChance = def.critChance;
    this.critMultiplier = def.critMultiplier;
    this.pierceLeft = def.pierce;
    this.lifeSec = (def.range * 1.25) / def.projectileSpeed;
    this.image.setRotation(Math.atan2(dirY, dirX)).setDepth(y + 1);
  }

  get x(): number { return this.image.x; }
  get y(): number { return this.image.y; }

  update(dt: number): void {
    this.image.x += this.vx * dt;
    this.image.y += this.vy * dt;
    this.image.setDepth(this.image.y + 1);
    this.lifeSec -= dt;
    if (this.lifeSec <= 0) this.alive = false;
  }

  destroy(): void {
    this.hit.clear();
    this.image.destroy();
  }
}
