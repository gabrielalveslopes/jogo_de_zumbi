import { ENEMY_LIST, type EnemyDef } from '../data/enemies';
import { clamp, type Vec2 } from '../utils/math';
import { weightedPick, type Rng } from '../utils/random';
import { getDifficulty } from './DifficultySystem';

export interface SpawnRequest {
  def: EnemyDef;
  x: number;
  y: number;
}

export interface SpawnConfig {
  worldSize: number;
  viewHalfW: number;
  viewHalfH: number;
  margin: number;
}

/**
 * Posição de surgimento logo fora da área visível, dentro do mundo.
 * Retorna null se não achar posição válida (ex.: jogador encurralado no canto).
 */
export function getSpawnPosition(rng: Rng, px: number, py: number, cfg: SpawnConfig): Vec2 | null {
  const w = cfg.viewHalfW + cfg.margin;
  const h = cfg.viewHalfH + cfg.margin;
  for (let attempt = 0; attempt < 8; attempt++) {
    const edge = Math.floor(rng() * 4);
    let x: number;
    let y: number;
    if (edge === 0) { x = px + (rng() * 2 - 1) * w; y = py - h; }
    else if (edge === 1) { x = px + (rng() * 2 - 1) * w; y = py + h; }
    else if (edge === 2) { x = px - w; y = py + (rng() * 2 - 1) * h; }
    else { x = px + w; y = py + (rng() * 2 - 1) * h; }
    x = clamp(x, 0, cfg.worldSize);
    y = clamp(y, 0, cfg.worldSize);
    if (Math.abs(x - px) > cfg.viewHalfW || Math.abs(y - py) > cfg.viewHalfH) return { x, y };
  }
  return null;
}

export class SpawnSystem {
  private acc = 0;

  constructor(
    private readonly rng: Rng,
    private readonly cfg: SpawnConfig,
  ) {}

  reset(): void {
    this.acc = 0;
  }

  /**
   * Avança o temporizador e devolve os spawns do frame.
   * Respeita o limite de inimigos ativos: acima dele, nada é criado.
   */
  update(dt: number, elapsedSec: number, activeCount: number, px: number, py: number): SpawnRequest[] {
    const diff = getDifficulty(elapsedSec);
    this.acc += dt;
    if (this.acc < diff.spawnIntervalSec) return [];
    this.acc = 0; // sem acúmulo: um delta grande não gera rajada

    const count = Math.min(diff.batchSize, diff.maxEnemies - activeCount);
    if (count <= 0) return [];

    const eligible = ENEMY_LIST.filter((e) => e.minTimeSec <= elapsedSec);
    const out: SpawnRequest[] = [];
    for (let i = 0; i < count; i++) {
      const def = weightedPick(this.rng, eligible, (e) => e.spawnWeight);
      if (!def) break;
      const pos = getSpawnPosition(this.rng, px, py, this.cfg);
      if (pos) out.push({ def, x: pos.x, y: pos.y });
    }
    return out;
  }
}
