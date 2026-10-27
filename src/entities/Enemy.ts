import Phaser from 'phaser';
import type { EnemyDef } from '../data/enemies';
import { computeVelocity } from '../systems/steering';
import type { Rng } from '../utils/random';

const FLASH_MS = 80;

export class Enemy {
  readonly image: Phaser.GameObjects.Image;
  readonly def: EnemyDef;
  hp: number;
  readonly damage: number;
  alive = true;
  private age = 0;
  private readonly phase: number;
  private flashUntil = 0;

  constructor(
    scene: Phaser.Scene, def: EnemyDef, x: number, y: number,
    hpMult: number, dmgMult: number, rng: Rng,
  ) {
    this.def = def;
    this.hp = Math.max(1, Math.round(def.maxHp * hpMult));
    this.damage = Math.max(1, Math.round(def.damage * dmgMult));
    this.phase = rng() * Math.PI * 2;
    this.image = scene.add.image(x, y, def.texture);
  }

  get x(): number { return this.image.x; }
  get y(): number { return this.image.y; }

  update(dt: number, nowMs: number, targetX: number, targetY: number): void {
    this.age += dt;
    const v = computeVelocity(
      this.def.behavior, this.def.speed,
      targetX - this.image.x, targetY - this.image.y, this.age, this.phase,
    );
    this.image.x += v.x * dt;
    this.image.y += v.y * dt;
    if (Math.abs(v.x) > 0.01) this.image.setFlipX(v.x < 0);
    this.image.setDepth(this.image.y);
    if (this.flashUntil > 0 && nowMs >= this.flashUntil) {
      this.image.clearTint();
      this.flashUntil = 0;
    }
  }

  /** Retorna true se este golpe matou o inimigo. */
  takeDamage(amount: number, nowMs: number): boolean {
    if (!this.alive) return false;
    this.hp -= amount;
    if (this.hp <= 0) {
      this.alive = false;
      return true;
    }
    this.flashUntil = nowMs + FLASH_MS;
    this.image.setTintFill(0xffffff);
    return false;
  }

  destroy(): void {
    this.image.destroy();
  }
}
