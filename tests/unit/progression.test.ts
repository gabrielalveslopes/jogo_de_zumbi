import { describe, expect, it } from 'vitest';
import { ENEMY_LIST } from '../../src/data/enemies';
import { FALLBACK_UPGRADE, RARITY_INFO, UPGRADES, getUpgradeById } from '../../src/data/upgrades';
import { WEAPONS } from '../../src/data/weapons';
import { ExperienceSystem, MAX_LEVEL, xpToNextLevel } from '../../src/systems/ExperienceSystem';
import { gemTier, rollDrops } from '../../src/systems/LootSystem';
import { createBaseStats, deriveWeapon } from '../../src/systems/PlayerStats';
import { applyUpgrade, isEligible, rollChoices } from '../../src/systems/UpgradeSystem';
import { createRng } from '../../src/utils/random';

describe('ExperienceSystem', () => {
  it('a curva de XP é estritamente crescente', () => {
    for (let l = 1; l < 98; l++) expect(xpToNextLevel(l + 1)).toBeGreaterThan(xpToNextLevel(l));
    expect(xpToNextLevel(1)).toBe(5);
  });

  it('sobe de nível ao atingir o XP necessário e guarda o excedente', () => {
    const xp = new ExperienceSystem();
    expect(xp.addXp(4)).toBe(0);
    expect(xp.level).toBe(1);
    expect(xp.addXp(3)).toBe(1); // 7 total: 5 para o nv 2, sobra 2
    expect(xp.level).toBe(2);
    expect(xp.xp).toBe(2);
  });

  it('pode subir vários níveis de uma vez', () => {
    const xp = new ExperienceSystem();
    const gained = xp.addXp(1000);
    expect(gained).toBeGreaterThan(1);
    expect(xp.level).toBe(1 + gained);
    expect(xp.xp).toBeLessThan(xp.xpToNext);
  });

  it('ignora valores inválidos', () => {
    const xp = new ExperienceSystem();
    expect(xp.addXp(-5)).toBe(0);
    expect(xp.addXp(NaN)).toBe(0);
    expect(xp.addXp(Infinity)).toBe(0);
    expect(xp.level).toBe(1);
    expect(xp.xp).toBe(0);
  });

  it('respeita o nível máximo', () => {
    const xp = new ExperienceSystem();
    xp.addXp(1e9);
    expect(xp.level).toBe(MAX_LEVEL);
    expect(xp.addXp(100)).toBe(0);
    expect(xp.level).toBe(MAX_LEVEL);
  });
});

describe('deriveWeapon', () => {
  const base = WEAPONS.pistol;

  it('com atributos-base não altera a arma', () => {
    expect(deriveWeapon(base, createBaseStats())).toEqual(base);
  });

  it('aplica bônus de dano, cadência, alcance, projéteis e perfuração', () => {
    const s = createBaseStats();
    s.damageMult = 1.5;
    s.fireRateMult = 2;
    s.rangeMult = 1.2;
    s.extraProjectiles = 2;
    s.extraPierce = 1;
    const w = deriveWeapon(base, s);
    expect(w.damage).toBeCloseTo(base.damage * 1.5);
    expect(w.cooldownSec).toBeCloseTo(base.cooldownSec / 2);
    expect(w.range).toBeCloseTo(base.range * 1.2);
    expect(w.projectiles).toBe(base.projectiles + 2);
    expect(w.pierce).toBe(base.pierce + 1);
  });

  it('chance crítica fica limitada a 100%', () => {
    const s = createBaseStats();
    s.critChanceBonus = 5;
    expect(deriveWeapon(base, s).critChance).toBe(1);
  });

  it('não modifica a definição original', () => {
    const copy = { ...base };
    const s = createBaseStats();
    s.damageMult = 3;
    deriveWeapon(base, s);
    expect(base).toEqual(copy);
  });
});

describe('dados de melhorias', () => {
  const statKeys = Object.keys(createBaseStats());

  it('ids únicos e atributos válidos', () => {
    const ids = UPGRADES.map((u) => u.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const u of UPGRADES) {
      expect(u.name.length).toBeGreaterThan(0);
      expect(u.description.length).toBeGreaterThan(0);
      expect(u.weight).toBeGreaterThan(0);
      expect(u.maxStacks).toBeGreaterThanOrEqual(1);
      expect(u.minLevel).toBeGreaterThanOrEqual(1);
      expect(u.effects.length).toBeGreaterThan(0);
      expect(RARITY_INFO[u.rarity]).toBeDefined();
      for (const e of u.effects) {
        expect(statKeys).toContain(e.stat);
        expect(Number.isFinite(e.value)).toBe(true);
        expect(e.value).not.toBe(0);
      }
      if (u.requires) expect(statKeys).toContain(u.requires.stat);
    }
  });

  it('todas as cinco raridades existem no conjunto', () => {
    const rarities = new Set(UPGRADES.map((u) => u.rarity));
    expect(rarities.size).toBe(5);
  });

  it('a melhoria de emergência não está no conjunto principal', () => {
    expect(UPGRADES.some((u) => u.id === FALLBACK_UPGRADE.id)).toBe(false);
    expect(getUpgradeById(FALLBACK_UPGRADE.id)).toBe(FALLBACK_UPGRADE);
    expect(getUpgradeById('nao-existe')).toBeUndefined();
  });
});

describe('UpgradeSystem', () => {
  const ctx = (level: number, counts: Record<string, number> = {}, stats = createBaseStats()) => ({ level, counts, stats });

  it('oferece três opções distintas', () => {
    const rng = createRng(1);
    for (let i = 0; i < 200; i++) {
      const choices = rollChoices(rng, ctx(10));
      expect(choices).toHaveLength(3);
      expect(new Set(choices.map((c) => c.id)).size).toBe(3);
    }
  });

  it('respeita o nível mínimo', () => {
    const rng = createRng(2);
    for (let i = 0; i < 200; i++) {
      for (const c of rollChoices(rng, ctx(1))) expect(c.minLevel).toBeLessThanOrEqual(1);
    }
  });

  it('não oferece melhorias que atingiram o limite de acúmulos', () => {
    const counts: Record<string, number> = {};
    for (const u of UPGRADES) counts[u.id] = u.maxStacks;
    counts['damage'] = 0;
    const choices = rollChoices(createRng(3), ctx(50, counts));
    expect(choices.map((c) => c.id)).toEqual(['damage']);
  });

  it('usa a melhoria de emergência quando nada é elegível', () => {
    const counts: Record<string, number> = {};
    for (const u of UPGRADES) counts[u.id] = u.maxStacks;
    expect(rollChoices(createRng(4), ctx(50, counts))).toEqual([FALLBACK_UPGRADE]);
  });

  it('respeita requisitos de atributo (ex.: cadência já muito alta)', () => {
    const stats = createBaseStats();
    stats.fireRateMult = 3;
    const rng = createRng(5);
    for (let i = 0; i < 200; i++) {
      expect(rollChoices(rng, ctx(50, {}, stats)).some((c) => c.id === 'fire-rate')).toBe(false);
    }
    const fireRate = UPGRADES.find((u) => u.id === 'fire-rate');
    expect(fireRate && isEligible(fireRate, ctx(50, {}, stats))).toBe(false);
  });

  it('é determinístico com a mesma semente', () => {
    const ids = (seed: number): string[] => rollChoices(createRng(seed), ctx(10)).map((c) => c.id);
    expect(ids(42)).toEqual(ids(42));
  });

  it('applyUpgrade soma os efeitos aos atributos', () => {
    const stats = createBaseStats();
    const dmg = UPGRADES.find((u) => u.id === 'damage');
    expect(dmg).toBeDefined();
    if (dmg) applyUpgrade(stats, dmg);
    expect(stats.damageMult).toBeCloseTo(1.1);
    const last = UPGRADES.find((u) => u.id === 'last-stand');
    if (last) applyUpgrade(stats, last);
    expect(stats.damageMult).toBeCloseTo(1.35);
    expect(stats.fireRateMult).toBeCloseTo(1.25);
  });

  it('simulação de 60 níveis nunca excede limites nem gera ofertas inválidas', () => {
    const rng = createRng(77);
    const stats = createBaseStats();
    const counts: Record<string, number> = {};
    for (let level = 2; level <= 61; level++) {
      const choices = rollChoices(rng, { level, counts, stats });
      expect(choices.length).toBeGreaterThanOrEqual(1);
      expect(choices.length).toBeLessThanOrEqual(3);
      const pick = choices[Math.floor(rng() * choices.length)];
      expect(pick).toBeDefined();
      if (!pick) continue;
      if (pick.id !== FALLBACK_UPGRADE.id) {
        expect(isEligible(pick, { level, counts, stats })).toBe(true);
        counts[pick.id] = (counts[pick.id] ?? 0) + 1;
        applyUpgrade(stats, pick);
      }
    }
    for (const u of UPGRADES) expect(counts[u.id] ?? 0).toBeLessThanOrEqual(u.maxStacks);
    expect(stats.extraProjectiles).toBeLessThanOrEqual(3);
  });
});

describe('LootSystem', () => {
  it('chance de kit médico por inimigo', () => {
    const def = ENEMY_LIST[0];
    expect(def).toBeDefined();
    if (!def) return;
    expect(rollDrops(() => 0, def)).toEqual({ xp: def.xp, medkit: true });
    expect(rollDrops(() => 0.999, def)).toEqual({ xp: def.xp, medkit: false });
  });

  it('chances de kit médico estão entre 0 e 1', () => {
    for (const e of ENEMY_LIST) {
      expect(e.medkitChance).toBeGreaterThanOrEqual(0);
      expect(e.medkitChance).toBeLessThanOrEqual(1);
    }
  });

  it('classifica gemas por valor', () => {
    expect(gemTier(1)).toBe(1);
    expect(gemTier(2)).toBe(2);
    expect(gemTier(4)).toBe(2);
    expect(gemTier(5)).toBe(3);
    expect(gemTier(8)).toBe(3);
  });
});
