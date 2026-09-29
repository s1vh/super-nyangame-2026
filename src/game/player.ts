// Ported from InGame.as; see LICENSE.md for derivative-code terms.
import { CAT, HEIGHT, WIDTH } from './config';
import { quadBounds } from './geometry';

export interface PlayerState { x: number; y: number; rotation: number; targetY: number }
export function createPlayer(): PlayerState {
  return { x: -WIDTH, y: HEIGHT / 2 + 2, rotation: 0, targetY: HEIGHT / 2 };
}
export function aimPlayer(player: PlayerState, y: number): void {
  if (Number.isFinite(y) && y > 50 && y < 750) player.targetY = y;
}
export function takeOff(player: PlayerState): boolean {
  if (player.x >= WIDTH / 5) return true;
  player.x += (WIDTH / 4 + 10 - player.x) / 15;
  player.y = HEIGHT / 2;
  return false;
}
export function movePlayer(player: PlayerState): void {
  player.y += (player.targetY - player.y) / 20;
  const error = player.targetY - player.y;
  const height = quadBounds(player.x, player.y, CAT.width, CAT.height, player.rotation).height;
  if (error < height / 2 && error > -height / 2) player.rotation = error / 3 * Math.PI / 180;
}
