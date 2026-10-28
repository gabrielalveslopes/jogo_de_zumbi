import Phaser from 'phaser';
import { TEXTURE_KEYS } from '../game/constants';
import { gemTier } from '../systems/LootSystem';

export type PickupKind = 'xp' | 'medkit';

const MAGNET_ACCEL = 600;
const MAGNET_MAX_SPEED = 260;
const COLLECT_DIST = 6;
const MEDKIT_LIFETIME_SEC = 30;

export class Pickup {
  readonly image: Phaser.GameObjects.Image;
  readonly kind: PickupKind;
  /** xp: quantidade de XP. medkit: fração da vida máxima curada. */
  readonly value: number;
  alive = true;
  private attracted = false;
  private speed = 0;
  private lifeSec: number;

  constructor(scene: Phaser.Scene, kind: PickupKind, value: number, x: number, y: number) {
    this.kind = kind;
    this.value = value;
    this.lifeSec = kind === 'medkit' ? MEDKIT_LIFETIME_SEC : Infinity;
    const tier = gemTier(value);
    const texture = kind === 'medkit'
      ? TEXTURE_KEYS.Medkit
      : tier === 3 ? TEXTURE_KEYS.GemLarge : tier === 2 ? TEXTURE_KEYS.GemMedium : TEXTURE_KEYS.GemSmall;
    this.image = scene.add.image(x, y, texture).setDepth(y - 1);
  }

  /** Move em direção ao jogador quando dentro do raio. Retorna true se foi coletado. */
  update(dt: number, px: number, py: number, pickupRadius: number): boolean {
    this.lifeSec -= dt;
    if (this.lifeSec <= 0) {
      this.alive = false;
      return false;
    }
    const dx = px - this.image.x;
    const dy = py - this.image.y;
    const dist = Math.hypot(dx, dy);
    if (!this.attracted && dist <= pickupRadius) this.attracted = true;
    if (!this.attracted) return false;

    if (dist <= COLLECT_DIST) return true;
    this.speed = Math.min(MAGNET_MAX_SPEED, this.speed + MAGNET_ACCEL * dt);
    const step = Math.min(dist, this.speed * dt);
    this.image.x += (dx / dist) * step;
    this.image.y += (dy / dist) * step;
    this.image.setDepth(this.image.y - 1);
    return false;
  }

  destroy(): void {
    this.image.destroy();
  }
}
