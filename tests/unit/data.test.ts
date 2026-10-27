import { describe, expect, it } from 'vitest';
import { ENEMIES, ENEMY_LIST } from '../../src/data/enemies';
import { WEAPONS } from '../../src/data/weapons';
import { computeVelocity } from '../../src/systems/steering';
import { formatTime } from '../../src/utils/format';
import { createRng, weightedPick } from '../../src/utils/random';

describe('dados de inimigos', () => {
  it('chaves coincidem com ids e todos os atributos são válidos', () => {
    expect(ENEMY_LIST.length).toBeGreaterThanOrEqual(4);
    for (const [key, def] of Object.entries(ENEMIES)) {
      expect(def.id).toBe(key);
      expect(def.maxHp).toBeGreaterThan(0);
      expect(def.damage).toBeGreaterThan(0);
      expect(def.speed).toBeGreaterThan(0);
      expect(def.radius).toBeGreaterThan(0);
      expect(def.spawnWeight).toBeGreaterThan(0);
      expect(def.minTimeSec).toBeGreaterThanOrEqual(0);
      expect(def.texture.length).toBeGreaterThan(0);
    }
  });
  it('existe inimigo disponível desde o início', () => {
    expect(ENEMY_LIST.some((e) => e.minTimeSec === 0)).toBe(true);
  });
  it('há comportamentos realmente diferentes', () => {
    expect(new Set(ENEMY_LIST.map((e) => e.behavior)).size).toBeGreaterThanOrEqual(3);
  });
});

describe('dados de armas', () => {
  it('atributos válidos', () => {
    for (const [key, w] of Object.entries(WEAPONS)) {
      expect(w.id).toBe(key);
      expect(w.damage).toBeGreaterThan(0);
      expect(w.cooldownSec).toBeGreaterThan(0);
      expect(w.range).toBeGreaterThan(0);
      expect(w.projectileSpeed).toBeGreaterThan(0);
      expect(w.projectiles).toBeGreaterThanOrEqual(1);
      expect(w.critChance).toBeGreaterThanOrEqual(0);
      expect(w.critChance).toBeLessThanOrEqual(1);
    }
  });
});

describe('computeVelocity', () => {
  const mag = (v: { x: number; y: number }): number => Math.hypot(v.x, v.y);

  it('chase vai direto ao alvo na velocidade do inimigo', () => {
    const v = computeVelocity('chase', 30, 10, 0, 0, 0);
    expect(v.x).toBeCloseTo(30, 5);
    expect(v.y).toBeCloseTo(0, 5);
  });
  it('sem distância não se move', () => {
    expect(computeVelocity('chase', 30, 0, 0, 0, 0)).toEqual({ x: 0, y: 0 });
  });
  it('zigzag mantém a velocidade, mas desvia lateralmente', () => {
    const straight = computeVelocity('zigzag', 40, 1, 0, 0, 0);
    const swerve = computeVelocity('zigzag', 40, 1, 0, Math.PI / 10, 0);
    expect(mag(straight)).toBeCloseTo(40, 5);
    expect(mag(swerve)).toBeCloseTo(40, 5);
    expect(Math.abs(straight.y)).toBeLessThan(1e-6);
    expect(Math.abs(swerve.y)).toBeGreaterThan(5);
  });
  it('lunge alterna preparação lenta e investida rápida', () => {
    expect(mag(computeVelocity('lunge', 40, 1, 0, 0, 0))).toBeCloseTo(40 * 0.45, 5);
    expect(mag(computeVelocity('lunge', 40, 1, 0, 1.6, 0))).toBeCloseTo(40 * 2.4, 5);
  });
});

describe('random', () => {
  it('mesma semente gera a mesma sequência, sempre em [0,1)', () => {
    const a = createRng(5);
    const b = createRng(5);
    for (let i = 0; i < 100; i++) {
      const x = a();
      expect(x).toBe(b());
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
    }
  });
  it('weightedPick ignora peso zero e lida com lista vazia', () => {
    const rng = createRng(1);
    for (let i = 0; i < 50; i++) {
      expect(weightedPick(rng, ['a', 'b'], (s) => (s === 'a' ? 0 : 1))).toBe('b');
    }
    expect(weightedPick(rng, [], () => 1)).toBeNull();
    expect(weightedPick(rng, ['a'], () => 0)).toBeNull();
  });
});

describe('formatTime', () => {
  it('formata mm:ss', () => {
    expect(formatTime(0)).toBe('00:00');
    expect(formatTime(65.9)).toBe('01:05');
    expect(formatTime(3600)).toBe('60:00');
  });
  it('valores inválidos viram 00:00', () => {
    expect(formatTime(-5)).toBe('00:00');
    expect(formatTime(NaN)).toBe('00:00');
  });
});
