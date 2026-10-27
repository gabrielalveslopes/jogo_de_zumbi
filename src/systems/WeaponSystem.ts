import type { WeaponDef } from '../data/weapons';
import { findNearest, type Positioned } from './combat';

export interface FireEvent {
  x: number;
  y: number;
  dirX: number;
  dirY: number;
}

/** Lógica de disparo automático (sem Phaser): mira no alvo mais próximo em alcance. */
export class WeaponSystem {
  private cooldown = 0;

  constructor(readonly def: WeaponDef) {}

  reset(): void {
    this.cooldown = 0;
  }

  update(
    dt: number, px: number, py: number,
    targets: readonly Positioned[], emit: (e: FireEvent) => void,
  ): void {
    this.cooldown -= dt;
    if (this.cooldown > 0) return;

    const target = findNearest(targets, px, py, this.def.range);
    if (!target) return; // permanece pronta para atirar assim que surgir um alvo

    this.cooldown = this.def.cooldownSec;
    const base = Math.atan2(target.y - py, target.x - px);
    const n = this.def.projectiles;
    for (let i = 0; i < n; i++) {
      const a = base + (i - (n - 1) / 2) * this.def.spreadRad;
      emit({ x: px, y: py, dirX: Math.cos(a), dirY: Math.sin(a) });
    }
  }
}
