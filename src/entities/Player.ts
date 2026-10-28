import Phaser from 'phaser';
import { PICKUP_BASE_RADIUS, PLAYER_BASE_HP, PLAYER_SPEED, TEXTURE_KEYS } from '../game/constants';
import { calculateDamage } from '../systems/combat';
import type { PlayerStats } from '../systems/PlayerStats';
import { clamp } from '../utils/math';

export class Player {
  readonly image: Phaser.GameObjects.Image;
  readonly radius = 6;
  maxHp = PLAYER_BASE_HP;
  hp = PLAYER_BASE_HP;
  armor = 0;
  speed = PLAYER_SPEED;
  pickupRadius = PICKUP_BASE_RADIUS;
  readonly invulnMs = 700;
  private invulnUntil = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.image = scene.add.image(x, y, TEXTURE_KEYS.Player);
  }

  get x(): number { return this.image.x; }
  get y(): number { return this.image.y; }
  get dead(): boolean { return this.hp <= 0; }

  move(dirX: number, dirY: number, dt: number, worldSize: number): void {
    this.image.x = clamp(this.image.x + dirX * this.speed * dt, 8, worldSize - 8);
    this.image.y = clamp(this.image.y + dirY * this.speed * dt, 8, worldSize - 8);
    if (dirX !== 0) this.image.setFlipX(dirX < 0);
    this.image.setDepth(this.image.y);
  }

  /** Aplica dano respeitando invulnerabilidade. Retorna o dano efetivo (0 se ignorado). */
  takeDamage(raw: number, nowMs: number): number {
    if (this.dead || nowMs < this.invulnUntil) return 0;
    const dealt = calculateDamage(raw, this.armor);
    this.hp = Math.max(0, this.hp - dealt);
    this.invulnUntil = nowMs + this.invulnMs;
    return dealt;
  }

  /** Recalcula atributos derivados. Aumento de vida máxima também cura a diferença. */
  applyStats(stats: PlayerStats): void {
    const oldMax = this.maxHp;
    this.maxHp = Math.round(PLAYER_BASE_HP * stats.maxHpMult);
    this.hp = Math.min(this.maxHp, this.hp + Math.max(0, this.maxHp - oldMax));
    this.armor = stats.armorBonus;
    this.speed = PLAYER_SPEED * stats.speedMult;
    this.pickupRadius = PICKUP_BASE_RADIUS * stats.pickupRadiusMult;
  }

  heal(amount: number): void {
    if (this.dead || !(amount > 0)) return;
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  updateVisual(nowMs: number): void {
    const blinking = nowMs < this.invulnUntil && !this.dead;
    this.image.setAlpha(blinking && Math.floor(nowMs / 80) % 2 === 0 ? 0.4 : 1);
  }
}
