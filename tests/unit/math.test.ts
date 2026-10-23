import { describe, expect, it } from 'vitest';
import { clamp, clampDelta, normalize } from '../../src/utils/math';

describe('clamp', () => {
  it('limita ao intervalo', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(11, 0, 10)).toBe(10);
  });
});

describe('normalize', () => {
  it('diagonal tem comprimento 1', () => {
    const v = normalize(1, 1);
    expect(Math.hypot(v.x, v.y)).toBeCloseTo(1, 10);
  });
  it('vetor nulo permanece nulo', () => {
    expect(normalize(0, 0)).toEqual({ x: 0, y: 0 });
  });
});

describe('clampDelta', () => {
  it('limita grandes deltas após pausa', () => {
    expect(clampDelta(5000, 50)).toBe(50);
  });
  it('mantém deltas normais', () => {
    expect(clampDelta(16, 50)).toBe(16);
  });
  it('trata valores inválidos', () => {
    expect(clampDelta(NaN, 50)).toBe(0);
    expect(clampDelta(-10, 50)).toBe(0);
    expect(clampDelta(Infinity, 50)).toBe(0);
  });
});
