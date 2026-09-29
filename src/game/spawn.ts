// Direct behavioral port of InGame.obstacleCreate; legacy license, see LICENSE.md.
import { HEIGHT, WIDTH } from './config';
import type { ObstacleType } from './config';

export type Random = () => number;
export interface SpawnState { minY: number; maxY: number; redAvailable: boolean }
export interface Spawned { type: ObstacleType; x: number; y: number }

export function generateSpawn(state: SpawnState, turbo: boolean, random: Random): Spawned[] {
  const roll = 1 + Math.round(random() * 9);
  const starRow = roll >= 5 && roll <= 7;
  const count = starRow ? 1 + Math.round(random() * 4) : 1;
  const height = starRow ? 150 : 200;
  const sampleY = (): number => height / 2 + Math.round(random() * (HEIGHT - height));
  const blocked = (y: number): boolean => state.minY - height / 2 < y && y < state.maxY + height / 2;
  let y = sampleY();
  if (starRow) {
    if (blocked(y)) y = sampleY(); // The original while contains an immediate break.
    const row: Spawned[] = [];
    for (let i = 1; i <= count; i++) {
      const x = WIDTH + 150 + i * 75;
      if (turbo) {
        row.push({ type: 3, x, y: y + 75 }, { type: 3, x, y: y - 75 });
      } else row.push({ type: 3, x, y });
    }
    const lastY = row[row.length - 1]!.y;
    state.minY = lastY - 75; state.maxY = lastY + 75; state.redAvailable = true;
    return row;
  }
  // The source rejection sampler is preserved for ordinary draws. A bounded
  // fallback prevents an adversarial/constant test RNG from freezing the page.
  let retries = 0;
  while (blocked(y) && retries++ < 1024) y = sampleY();
  if (blocked(y)) y = !blocked(height / 2) ? height / 2 : HEIGHT - height / 2;

  const redRoll = roll >= 8;
  const substituted = redRoll && !state.redAvailable;
  const type: ObstacleType = redRoll && state.redAvailable ? 2 : 1;
  const padding = substituted ? height : height / 2;
  state.minY = y - padding; state.maxY = y + padding;
  state.redAvailable = type !== 2;
  // Art is absent until ADDED_TO_STAGE: obstacle.width is zero in the red branch.
  return [{ type, x: redRoll ? WIDTH : WIDTH + 200, y }];
}

export function moveObstacle(obstacle: Spawned, speed: number, turbo: boolean, cat: { x: number; y: number }): void {
  obstacle.x -= Math.round(speed);
  if (obstacle.type === 2) obstacle.y += Math.cos(obstacle.x * 0.005) * 10;
  if (obstacle.type === 3 && turbo) {
    obstacle.x -= Math.round(speed / (1 + Math.abs(obstacle.x - cat.x) * 0.005));
    if (obstacle.y < cat.y) obstacle.y += Math.round(5 / (1 + (cat.y - obstacle.y) * 0.005));
    // Intentionally a second if: overshooting can cause a second adjustment.
    if (obstacle.y > cat.y) obstacle.y -= Math.round(5 / (1 + (obstacle.y - cat.y) * 0.005));
  }
}

export function seededRandom(seed: number): Random {
  return () => {
    seed |= 0; seed = seed + 0x6d2b79f5 | 0;
    let value = Math.imul(seed ^ seed >>> 15, 1 | seed);
    value ^= value + Math.imul(value ^ value >>> 7, 61 | value);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}
