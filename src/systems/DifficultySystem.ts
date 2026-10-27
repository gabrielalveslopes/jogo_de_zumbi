export interface Difficulty {
  spawnIntervalSec: number;
  batchSize: number;
  maxEnemies: number;
  hpMultiplier: number;
  damageMultiplier: number;
}

/** Curva de dificuldade configurável em função do tempo de partida (s). */
export const DIFFICULTY_CONFIG = {
  baseInterval: 1.5,
  intervalDecayPerSec: 0.006,
  minInterval: 0.6,
  batchEverySec: 60,
  maxEnemies: 150,
  hpGrowthPerSec: 1 / 180,
  damageGrowthPerSec: 1 / 300,
} as const;

export function getDifficulty(elapsedSec: number): Difficulty {
  const t = Math.max(0, elapsedSec);
  const c = DIFFICULTY_CONFIG;
  return {
    spawnIntervalSec: Math.max(c.minInterval, c.baseInterval - t * c.intervalDecayPerSec),
    batchSize: 1 + Math.floor(t / c.batchEverySec),
    maxEnemies: c.maxEnemies,
    hpMultiplier: 1 + t * c.hpGrowthPerSec,
    damageMultiplier: 1 + t * c.damageGrowthPerSec,
  };
}
