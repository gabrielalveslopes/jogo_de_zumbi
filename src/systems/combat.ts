import type { Rng } from '../utils/random';

export interface Positioned {
  x: number;
  y: number;
}

/** Dano após armadura (retorno decrescente). Sempre causa pelo menos 1. */
export function calculateDamage(raw: number, armor: number): number {
  const reduced = (raw * 100) / (100 + Math.max(0, armor));
  return Math.max(1, Math.round(reduced));
}

export function rollHit(
  base: number,
  critChance: number,
  critMultiplier: number,
  rng: Rng,
): { damage: number; crit: boolean } {
  const crit = rng() < critChance;
  return { damage: Math.max(1, Math.round(base * (crit ? critMultiplier : 1))), crit };
}

export function circlesOverlap(
  ax: number, ay: number, ar: number,
  bx: number, by: number, br: number,
): boolean {
  const dx = ax - bx;
  const dy = ay - by;
  const r = ar + br;
  return dx * dx + dy * dy <= r * r;
}

/** Alvo mais próximo dentro do alcance, ou null. */
export function findNearest<T extends Positioned>(
  items: readonly T[], x: number, y: number, range: number,
): T | null {
  let best: T | null = null;
  let bestSq = range * range;
  for (const item of items) {
    const dx = item.x - x;
    const dy = item.y - y;
    const d = dx * dx + dy * dy;
    if (d <= bestSq) {
      bestSq = d;
      best = item;
    }
  }
  return best;
}
