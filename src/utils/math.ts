export function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

export interface Vec2 {
  x: number;
  y: number;
}

/** Normaliza um vetor; retorna (0,0) para vetor nulo. Evita diagonais mais rápidas. */
export function normalize(x: number, y: number): Vec2 {
  const len = Math.hypot(x, y);
  return len === 0 ? { x: 0, y: 0 } : { x: x / len, y: y / len };
}

/** Limita o delta (ms) a [0, maxMs]; valores inválidos viram 0. */
export function clampDelta(deltaMs: number, maxMs: number): number {
  if (!Number.isFinite(deltaMs) || deltaMs < 0) return 0;
  return deltaMs > maxMs ? maxMs : deltaMs;
}
