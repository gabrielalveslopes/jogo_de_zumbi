import { describe, expect, it } from 'vitest';
import { calculateDamage, circlesOverlap, findNearest, rollHit } from '../../src/systems/combat';
import { WeaponSystem, type FireEvent } from '../../src/systems/WeaponSystem';
import type { WeaponDef } from '../../src/data/weapons';

describe('calculateDamage', () => {
  it('sem armadura mantém o dano', () => expect(calculateDamage(10, 0)).toBe(10));
  it('armadura 100 reduz pela metade', () => expect(calculateDamage(10, 100)).toBe(5));
  it('nunca causa menos de 1', () => expect(calculateDamage(1, 1000)).toBe(1));
  it('armadura negativa é tratada como zero', () => expect(calculateDamage(10, -50)).toBe(10));
});

describe('rollHit', () => {
  it('crítico quando o sorteio fica abaixo da chance', () => {
    expect(rollHit(10, 0.5, 1.5, () => 0)).toEqual({ damage: 15, crit: true });
  });
  it('sem crítico quando o sorteio é alto', () => {
    expect(rollHit(10, 0.5, 1.5, () => 0.99)).toEqual({ damage: 10, crit: false });
  });
  it('chance 0 nunca critica', () => {
    expect(rollHit(10, 0, 2, () => 0).crit).toBe(false);
  });
});

describe('circlesOverlap', () => {
  it('detecta toque e sobreposição', () => {
    expect(circlesOverlap(0, 0, 5, 10, 0, 5)).toBe(true);
    expect(circlesOverlap(0, 0, 5, 3, 0, 5)).toBe(true);
  });
  it('separados não colidem', () => expect(circlesOverlap(0, 0, 5, 11, 0, 5)).toBe(false));
});

describe('findNearest', () => {
  const items = [{ x: 50, y: 0 }, { x: 10, y: 0 }, { x: 500, y: 0 }];
  it('escolhe o mais próximo dentro do alcance', () => {
    expect(findNearest(items, 0, 0, 100)).toEqual({ x: 10, y: 0 });
  });
  it('retorna null sem alvo em alcance ou lista vazia', () => {
    expect(findNearest(items, 1000, 1000, 100)).toBeNull();
    expect(findNearest([], 0, 0, 100)).toBeNull();
  });
});

describe('WeaponSystem', () => {
  const def: WeaponDef = {
    id: 'pistol', name: 'Teste', damage: 10, cooldownSec: 0.5, range: 100, projectileSpeed: 300,
    projectiles: 1, spreadRad: 0.2, pierce: 0, critChance: 0, critMultiplier: 1,
  };

  it('não atira sem alvos nem fora do alcance', () => {
    const ws = new WeaponSystem(def);
    const events: FireEvent[] = [];
    ws.update(0.016, 0, 0, [], (e) => events.push(e));
    ws.update(0.016, 0, 0, [{ x: 150, y: 0 }], (e) => events.push(e));
    expect(events).toHaveLength(0);
  });

  it('atira no alvo e respeita a recarga', () => {
    const ws = new WeaponSystem(def);
    const events: FireEvent[] = [];
    const targets = [{ x: 50, y: 0 }];
    ws.update(0.016, 0, 0, targets, (e) => events.push(e));
    expect(events).toHaveLength(1);
    expect(events[0]?.dirX).toBeCloseTo(1, 5);
    ws.update(0.1, 0, 0, targets, (e) => events.push(e));
    expect(events).toHaveLength(1);
    ws.update(0.45, 0, 0, targets, (e) => events.push(e));
    expect(events).toHaveLength(2);
  });

  it('dispara vários projéteis em leque simétrico', () => {
    const ws = new WeaponSystem({ ...def, projectiles: 3 });
    const events: FireEvent[] = [];
    ws.update(0.016, 0, 0, [{ x: 50, y: 0 }], (e) => events.push(e));
    expect(events).toHaveLength(3);
    expect(events[1]?.dirY).toBeCloseTo(0, 5);
    expect(events[0]?.dirY).toBeCloseTo(-(events[2]?.dirY ?? 0), 5);
  });
});
