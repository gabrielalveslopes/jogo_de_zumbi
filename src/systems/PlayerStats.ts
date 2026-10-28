import type { WeaponDef } from '../data/weapons';

/** Atributos modificáveis por melhorias. Multiplicadores começam em 1; bônus em 0. */
export interface PlayerStats {
  damageMult: number;
  fireRateMult: number;
  extraProjectiles: number;
  rangeMult: number;
  speedMult: number;
  maxHpMult: number;
  armorBonus: number;
  critChanceBonus: number;
  pickupRadiusMult: number;
  regenPerSec: number;
  extraPierce: number;
}

export type StatKey = keyof PlayerStats;

export function createBaseStats(): PlayerStats {
  return {
    damageMult: 1, fireRateMult: 1, extraProjectiles: 0, rangeMult: 1, speedMult: 1, maxHpMult: 1,
    armorBonus: 0, critChanceBonus: 0, pickupRadiusMult: 1, regenPerSec: 0, extraPierce: 0,
  };
}

/** Atributos efetivos da arma = definição-base + bônus do jogador. */
export function deriveWeapon(base: WeaponDef, s: PlayerStats): WeaponDef {
  return {
    ...base,
    damage: base.damage * s.damageMult,
    cooldownSec: base.cooldownSec / Math.max(0.1, s.fireRateMult),
    range: base.range * s.rangeMult,
    projectiles: base.projectiles + s.extraProjectiles,
    pierce: base.pierce + s.extraPierce,
    critChance: Math.min(1, Math.max(0, base.critChance + s.critChanceBonus)),
  };
}
