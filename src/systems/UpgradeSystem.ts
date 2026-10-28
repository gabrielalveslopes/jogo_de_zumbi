import {
  FALLBACK_UPGRADE, RARITY_INFO, UPGRADES, type UpgradeDef,
} from '../data/upgrades';
import { weightedPick, type Rng } from '../utils/random';
import type { PlayerStats } from './PlayerStats';

export interface UpgradeContext {
  level: number;
  counts: Readonly<Record<string, number>>;
  stats: PlayerStats;
}

/** Regras que impedem ofertas inválidas, repetidas além do limite ou fora de contexto. */
export function isEligible(def: UpgradeDef, ctx: UpgradeContext): boolean {
  if (ctx.level < def.minLevel) return false;
  if ((ctx.counts[def.id] ?? 0) >= def.maxStacks) return false;
  if (def.requires && ctx.stats[def.requires.stat] > def.requires.atMost) return false;
  return true;
}

/**
 * Sorteia até `count` melhorias distintas, ponderadas pela raridade.
 * Se nenhuma for elegível, oferece a melhoria de emergência.
 */
export function rollChoices(
  rng: Rng, ctx: UpgradeContext, count = 3, pool: readonly UpgradeDef[] = UPGRADES,
): UpgradeDef[] {
  const remaining = pool.filter((d) => isEligible(d, ctx));
  const picks: UpgradeDef[] = [];
  while (picks.length < count && remaining.length > 0) {
    const pick = weightedPick(rng, remaining, (d) => RARITY_INFO[d.rarity].weight * d.weight);
    if (!pick) break;
    picks.push(pick);
    remaining.splice(remaining.indexOf(pick), 1);
  }
  return picks.length > 0 ? picks : [FALLBACK_UPGRADE];
}

/** Aplica os efeitos da melhoria aos atributos (a cura é tratada pela cena). */
export function applyUpgrade(stats: PlayerStats, def: UpgradeDef): void {
  for (const e of def.effects) stats[e.stat] += e.value;
}
