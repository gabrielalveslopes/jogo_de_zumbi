import { TEXTURE_KEYS } from '../game/constants';

export type EnemyId = 'walker' | 'runner' | 'crawler' | 'brute';

/**
 * Comportamentos de movimento:
 * - chase: perseguição direta
 * - zigzag: aproxima-se oscilando lateralmente (difícil de acertar)
 * - lunge: avança devagar e então dispara uma investida rápida
 */
export type Behavior = 'chase' | 'zigzag' | 'lunge';

export interface EnemyDef {
  id: EnemyId;
  name: string;
  texture: string;
  maxHp: number;
  damage: number;
  speed: number; // px/s
  radius: number; // raio de colisão
  xp: number; // experiência concedida ao morrer
  medkitChance: number; // 0..1, chance de largar kit médico
  behavior: Behavior;
  spawnWeight: number;
  minTimeSec: number; // só surge após esse tempo de partida
}

export const ENEMIES: Record<EnemyId, EnemyDef> = {
  walker: {
    id: 'walker', name: 'Caminhante', texture: TEXTURE_KEYS.Zombie,
    maxHp: 20, damage: 8, speed: 28, radius: 6, xp: 1, medkitChance: 0.01,
    behavior: 'chase', spawnWeight: 10, minTimeSec: 0,
  },
  runner: {
    id: 'runner', name: 'Corredor', texture: TEXTURE_KEYS.Runner,
    maxHp: 12, damage: 6, speed: 40, radius: 5, xp: 2, medkitChance: 0.01,
    behavior: 'lunge', spawnWeight: 4, minTimeSec: 25,
  },
  crawler: {
    id: 'crawler', name: 'Rastejante', texture: TEXTURE_KEYS.Crawler,
    maxHp: 10, damage: 5, speed: 38, radius: 4, xp: 2, medkitChance: 0.01,
    behavior: 'zigzag', spawnWeight: 3, minTimeSec: 50,
  },
  brute: {
    id: 'brute', name: 'Bruto', texture: TEXTURE_KEYS.Brute,
    maxHp: 120, damage: 18, speed: 20, radius: 11, xp: 8, medkitChance: 0.12,
    behavior: 'chase', spawnWeight: 1.5, minTimeSec: 90,
  },
};

export const ENEMY_LIST: readonly EnemyDef[] = Object.values(ENEMIES);
