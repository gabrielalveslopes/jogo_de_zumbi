import type { EnemyDef } from '../data/enemies';
import type { Rng } from '../utils/random';

export const MAX_PICKUPS = 250;
export const MEDKIT_HEAL_FRACTION = 0.25;

export function rollDrops(rng: Rng, def: EnemyDef): { xp: number; medkit: boolean } {
  return { xp: def.xp, medkit: rng() < def.medkitChance };
}

/** Tamanho visual da gema conforme o valor de XP. */
export function gemTier(value: number): 1 | 2 | 3 {
  return value >= 5 ? 3 : value >= 2 ? 2 : 1;
}
