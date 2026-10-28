export const MAX_LEVEL = 99;

/** XP necessário para passar do nível `level` para o seguinte. */
export function xpToNextLevel(level: number): number {
  const l = Math.max(1, Math.floor(level)) - 1;
  return Math.round(5 + 4 * l + 0.6 * l * l);
}

export class ExperienceSystem {
  level = 1;
  xp = 0;

  get xpToNext(): number {
    return xpToNextLevel(this.level);
  }

  reset(): void {
    this.level = 1;
    this.xp = 0;
  }

  /** Soma XP e devolve quantos níveis foram ganhos (pode ser mais de um). */
  addXp(amount: number): number {
    if (!Number.isFinite(amount) || amount <= 0 || this.level >= MAX_LEVEL) return 0;
    this.xp += amount;
    let gained = 0;
    while (this.level < MAX_LEVEL && this.xp >= this.xpToNext) {
      this.xp -= this.xpToNext;
      this.level++;
      gained++;
    }
    if (this.level >= MAX_LEVEL) this.xp = 0;
    return gained;
  }
}
