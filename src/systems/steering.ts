import type { Behavior } from '../data/enemies';
import { normalize, type Vec2 } from '../utils/math';

const LUNGE_CYCLE_SEC = 2.2;
const LUNGE_WINDUP_SEC = 1.5;

/**
 * Velocidade (px/s) de um inimigo dado o vetor até o alvo.
 * `age` = segundos de vida; `phase` = deslocamento aleatório por inimigo.
 */
export function computeVelocity(
  behavior: Behavior, speed: number, dx: number, dy: number, age: number, phase: number,
): Vec2 {
  const dir = normalize(dx, dy);
  if (dir.x === 0 && dir.y === 0) return { x: 0, y: 0 };

  switch (behavior) {
    case 'chase':
      return { x: dir.x * speed, y: dir.y * speed };

    case 'zigzag': {
      const lateral = Math.sin(age * 5 + phase) * 0.9;
      const v = normalize(dir.x - dir.y * lateral, dir.y + dir.x * lateral);
      return { x: v.x * speed, y: v.y * speed };
    }

    case 'lunge': {
      const inWindup = (age + phase) % LUNGE_CYCLE_SEC < LUNGE_WINDUP_SEC;
      const mult = inWindup ? 0.45 : 2.4;
      return { x: dir.x * speed * mult, y: dir.y * speed * mult };
    }
  }
}
