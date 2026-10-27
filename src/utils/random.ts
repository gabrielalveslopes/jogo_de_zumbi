export type Rng = () => number;

/** PRNG determinístico (mulberry32). Retorna valores em [0, 1). */
export function createRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Sorteio ponderado. Retorna null se a lista for vazia ou sem peso positivo. */
export function weightedPick<T>(rng: Rng, items: readonly T[], weightOf: (item: T) => number): T | null {
  let total = 0;
  for (const item of items) total += Math.max(0, weightOf(item));
  if (total <= 0) return null;
  let r = rng() * total;
  let last: T | null = null;
  for (const item of items) {
    const w = Math.max(0, weightOf(item));
    if (w <= 0) continue;
    last = item;
    if (r < w) return item;
    r -= w;
  }
  return last;
}
