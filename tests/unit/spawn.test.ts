import { describe, expect, it } from 'vitest';
import { DIFFICULTY_CONFIG, getDifficulty } from '../../src/systems/DifficultySystem';
import { SpawnSystem, getSpawnPosition, type SpawnConfig } from '../../src/systems/SpawnSystem';
import { createRng } from '../../src/utils/random';

const cfg: SpawnConfig = { worldSize: 2048, viewHalfW: 320, viewHalfH: 180, margin: 40 };

describe('getSpawnPosition', () => {
  it('nunca surge dentro da área visível, nem perto dos cantos do mundo', () => {
    const rng = createRng(7);
    const players = [[1024, 1024], [30, 30], [2040, 2040], [30, 1000]] as const;
    for (const [px, py] of players) {
      for (let i = 0; i < 2000; i++) {
        const pos = getSpawnPosition(rng, px, py, cfg);
        if (!pos) continue;
        expect(Math.abs(pos.x - px) > cfg.viewHalfW || Math.abs(pos.y - py) > cfg.viewHalfH).toBe(true);
        expect(pos.x).toBeGreaterThanOrEqual(0);
        expect(pos.x).toBeLessThanOrEqual(cfg.worldSize);
        expect(pos.y).toBeGreaterThanOrEqual(0);
        expect(pos.y).toBeLessThanOrEqual(cfg.worldSize);
      }
    }
  });
});

describe('SpawnSystem', () => {
  it('no início só surgem caminhantes', () => {
    const sys = new SpawnSystem(createRng(1), cfg);
    const out = sys.update(2, 0, 0, 1024, 1024);
    expect(out.length).toBeGreaterThan(0);
    expect(out.every((r) => r.def.id === 'walker')).toBe(true);
  });

  it('respeita o limite de inimigos ativos', () => {
    const sys = new SpawnSystem(createRng(1), cfg);
    expect(sys.update(5, 300, DIFFICULTY_CONFIG.maxEnemies, 1024, 1024)).toEqual([]);
  });

  it('nunca ultrapassa o limite mesmo com lotes grandes', () => {
    const sys = new SpawnSystem(createRng(2), cfg);
    const out = sys.update(5, 600, DIFFICULTY_CONFIG.maxEnemies - 2, 1024, 1024);
    expect(out.length).toBeLessThanOrEqual(2);
  });

  it('libera novos tipos conforme o tempo passa', () => {
    const sys = new SpawnSystem(createRng(3), cfg);
    const ids = new Set<string>();
    for (let t = 0; t < 200; t += 0.5) {
      for (const r of sys.update(2, t, 0, 1024, 1024)) ids.add(r.def.id);
    }
    expect(ids.has('walker') && ids.has('runner') && ids.has('crawler') && ids.has('brute')).toBe(true);
  });

  it('é determinístico com a mesma semente', () => {
    const run = (): string[] => {
      const sys = new SpawnSystem(createRng(99), cfg);
      const out: string[] = [];
      for (let t = 0; t < 100; t += 1) {
        for (const r of sys.update(2, t, 0, 1024, 1024)) out.push(`${r.def.id}:${r.x.toFixed(2)}:${r.y.toFixed(2)}`);
      }
      return out;
    };
    expect(run()).toEqual(run());
  });
});

describe('getDifficulty', () => {
  it('cresce de forma monótona e respeita o intervalo mínimo', () => {
    let prev = getDifficulty(0);
    for (let t = 1; t <= 600; t++) {
      const d = getDifficulty(t);
      expect(d.spawnIntervalSec).toBeLessThanOrEqual(prev.spawnIntervalSec);
      expect(d.batchSize).toBeGreaterThanOrEqual(prev.batchSize);
      expect(d.hpMultiplier).toBeGreaterThan(prev.hpMultiplier);
      expect(d.spawnIntervalSec).toBeGreaterThanOrEqual(DIFFICULTY_CONFIG.minInterval);
      prev = d;
    }
  });
  it('tempo negativo é tratado como zero', () => {
    expect(getDifficulty(-10)).toEqual(getDifficulty(0));
  });
});
