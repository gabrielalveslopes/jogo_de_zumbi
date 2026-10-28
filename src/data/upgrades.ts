import type { StatKey } from '../systems/PlayerStats';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface RarityInfo {
  label: string;
  weight: number; // peso de sorteio da raridade
  color: number;
  css: string;
}

export const RARITY_INFO: Record<Rarity, RarityInfo> = {
  common: { label: 'Comum', weight: 60, color: 0xb0b0b0, css: '#b0b0b0' },
  uncommon: { label: 'Incomum', weight: 25, color: 0x4aff7a, css: '#4aff7a' },
  rare: { label: 'Rara', weight: 10, color: 0x4aa3ff, css: '#4aa3ff' },
  epic: { label: 'Épica', weight: 4, color: 0xb04aff, css: '#b04aff' },
  legendary: { label: 'Lendária', weight: 1, color: 0xffb02e, css: '#ffb02e' },
};

export interface StatEffect {
  stat: StatKey;
  value: number; // somado ao atributo
}

export interface UpgradeDef {
  id: string;
  name: string;
  description: string;
  rarity: Rarity;
  weight: number; // peso relativo dentro da raridade
  maxStacks: number; // quantas vezes pode ser escolhida
  minLevel: number; // nível mínimo do jogador para aparecer
  effects: StatEffect[];
  /** Só aparece enquanto o atributo estiver até este valor (evita valores absurdos). */
  requires?: { stat: StatKey; atMost: number };
  /** Cura imediata (fração da vida máxima). */
  healFraction?: number;
}

export const UPGRADES: readonly UpgradeDef[] = [
  { id: 'damage', name: 'Munição reforçada', description: 'Dano +10%', rarity: 'common', weight: 10, maxStacks: 8, minLevel: 1,
    effects: [{ stat: 'damageMult', value: 0.1 }] },
  { id: 'fire-rate', name: 'Gatilho leve', description: 'Cadência +15%', rarity: 'common', weight: 10, maxStacks: 6, minLevel: 1,
    effects: [{ stat: 'fireRateMult', value: 0.15 }], requires: { stat: 'fireRateMult', atMost: 2.2 } },
  { id: 'range', name: 'Cano longo', description: 'Alcance +20%', rarity: 'common', weight: 8, maxStacks: 4, minLevel: 1,
    effects: [{ stat: 'rangeMult', value: 0.2 }] },
  { id: 'speed', name: 'Pés ligeiros', description: 'Velocidade de movimento +15%', rarity: 'common', weight: 8, maxStacks: 4, minLevel: 1,
    effects: [{ stat: 'speedMult', value: 0.15 }] },
  { id: 'magnet', name: 'Ímã de sucata', description: 'Raio de coleta +25%', rarity: 'common', weight: 8, maxStacks: 4, minLevel: 1,
    effects: [{ stat: 'pickupRadiusMult', value: 0.25 }] },
  { id: 'armor', name: 'Colete reforçado', description: 'Armadura +10', rarity: 'uncommon', weight: 10, maxStacks: 5, minLevel: 1,
    effects: [{ stat: 'armorBonus', value: 10 }] },
  { id: 'vitality', name: 'Vitalidade', description: 'Vida máxima +20% (e cura a diferença)', rarity: 'uncommon', weight: 10, maxStacks: 5, minLevel: 1,
    effects: [{ stat: 'maxHpMult', value: 0.2 }] },
  { id: 'crit', name: 'Olho treinado', description: 'Chance crítica +5%', rarity: 'uncommon', weight: 8, maxStacks: 6, minLevel: 1,
    effects: [{ stat: 'critChanceBonus', value: 0.05 }], requires: { stat: 'critChanceBonus', atMost: 0.25 } },
  { id: 'regen', name: 'Primeiros socorros', description: 'Regeneração +0,4 vida/s', rarity: 'uncommon', weight: 7, maxStacks: 4, minLevel: 2,
    effects: [{ stat: 'regenPerSec', value: 0.4 }] },
  { id: 'pierce', name: 'Munição perfurante', description: 'Tiros atravessam +1 inimigo', rarity: 'rare', weight: 10, maxStacks: 3, minLevel: 3,
    effects: [{ stat: 'extraPierce', value: 1 }] },
  { id: 'expansive', name: 'Munição expansiva', description: 'Dano +30%', rarity: 'rare', weight: 8, maxStacks: 3, minLevel: 3,
    effects: [{ stat: 'damageMult', value: 0.3 }] },
  { id: 'extra-shot', name: 'Carregador duplo', description: '+1 projétil por disparo', rarity: 'epic', weight: 10, maxStacks: 3, minLevel: 4,
    effects: [{ stat: 'extraProjectiles', value: 1 }] },
  { id: 'iron-body', name: 'Corpo fechado', description: 'Vida máxima +50% e armadura +15', rarity: 'epic', weight: 8, maxStacks: 2, minLevel: 5,
    effects: [{ stat: 'maxHpMult', value: 0.5 }, { stat: 'armorBonus', value: 15 }] },
  { id: 'last-stand', name: 'Último sobrevivente', description: 'Dano +25%, cadência +25%, velocidade +10%', rarity: 'legendary', weight: 10, maxStacks: 1, minLevel: 8,
    effects: [
      { stat: 'damageMult', value: 0.25 }, { stat: 'fireRateMult', value: 0.25 }, { stat: 'speedMult', value: 0.1 },
    ] },
];

/** Oferecida apenas quando nenhuma melhoria do conjunto principal é elegível. */
export const FALLBACK_UPGRADE: UpgradeDef = {
  id: 'fallback-heal', name: 'Ração de emergência', description: 'Recupera 30% da vida máxima',
  rarity: 'common', weight: 1, maxStacks: Number.MAX_SAFE_INTEGER, minLevel: 1, effects: [], healFraction: 0.3,
};

export function getUpgradeById(id: string): UpgradeDef | undefined {
  if (id === FALLBACK_UPGRADE.id) return FALLBACK_UPGRADE;
  return UPGRADES.find((u) => u.id === id);
}
