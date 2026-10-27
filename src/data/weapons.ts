export type WeaponId = 'pistol';

export interface WeaponDef {
  id: WeaponId;
  name: string;
  damage: number;
  cooldownSec: number;
  range: number;
  projectileSpeed: number;
  projectiles: number; // projéteis por disparo
  spreadRad: number; // abertura angular entre projéteis
  pierce: number; // inimigos extras atravessados
  critChance: number; // 0..1
  critMultiplier: number;
}

export const WEAPONS: Record<WeaponId, WeaponDef> = {
  pistol: {
    id: 'pistol', name: 'Pistola',
    damage: 10, cooldownSec: 0.4, range: 200, projectileSpeed: 300,
    projectiles: 1, spreadRad: 0.12, pierce: 0, critChance: 0.05, critMultiplier: 1.5,
  },
};
