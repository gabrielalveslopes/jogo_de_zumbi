import Phaser from 'phaser';
import { PLAYER_SPEED, TEXTURE_KEYS } from '../game/constants';
import { calculateDamage } from '../systems/combat';
import { clamp } from '../utils/math';

export class Player {
  readonly image: Phaser.GameObjects.Image;
  readonly radius = 6;
  maxHp = 100;
  hp = 100;
  armor = 0;
  speed = PLAYER_SPEED;
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

  updateVisual(nowMs: number): void {
    const blinking = nowMs < this.invulnUntil && !this.dead;
    this.image.setAlpha(blinking && Math.floor(nowMs / 80) % 2 === 0 ? 0.4 : 1);
  }
}
