import { describe, expect, it } from 'vitest';
import { generateSpawn, moveObstacle } from '../src/game/spawn';
import type { SpawnState } from '../src/game/spawn';

const state = (): SpawnState => ({ minY: 800, maxY: 0, redAvailable: true });
const draws = (...values: number[]): (() => number) => () => {
  const next = values.shift(); if (next === undefined) throw new Error('Unexpected random draw'); return next;
};

describe('original spawn and movement rules', () => {
  it('retains weighted roll boundaries and zero-width red spawn origin', () => {
    expect(generateSpawn(state(), false, draws(0, 0.5))).toEqual([{ type: 1, x: 1480, y: 400 }]);
    expect(generateSpawn(state(), false, draws(1, 0.5))).toEqual([{ type: 2, x: 1280, y: 400 }]);
    const consecutive = { minY: 0, maxY: 0, redAvailable: false };
    expect(generateSpawn(consecutive, false, draws(0.99, 0.5))).toEqual([{ type: 1, x: 1280, y: 400 }]);
    expect(consecutive).toEqual({ minY: 200, maxY: 600, redAvailable: true });
  });
  it('makes exact star rows and Turbo pairs using spawn width, not sprite width', () => {
    expect(generateSpawn(state(), false, draws(0.5, 0.5, 0.5))).toEqual([
      { type: 3, x: 1505, y: 400 }, { type: 3, x: 1580, y: 400 }, { type: 3, x: 1655, y: 400 },
    ]);
    const band = state();
    expect(generateSpawn(band, true, draws(0.5, 0, 0.5))).toEqual([
      { type: 3, x: 1505, y: 475 }, { type: 3, x: 1505, y: 325 },
    ]);
    expect(band).toEqual({ minY: 250, maxY: 400, redAvailable: true });
  });
  it('retries enemy overlap but only retries stars once', () => {
    const band = { minY: 300, maxY: 500, redAvailable: true };
    expect(generateSpawn({ ...band }, false, draws(0, 0.5, 0.4, 0))).toEqual([{ type: 1, x: 1480, y: 100 }]);
    expect(generateSpawn({ ...band }, false, draws(0.5, 0, 0.5, 0.5))).toEqual([{ type: 3, x: 1505, y: 400 }]);
  });
  it('integrates the red cosine after moving x', () => {
    const red = { type: 2 as const, x: 1280, y: 400 };
    moveObstacle(red, 10.49, false, { x: 258, y: 400 });
    expect(red.x).toBe(1270);
    expect(red.y).toBeCloseTo(400 + Math.cos(6.35) * 10, 12);
  });
  it('keeps sequential Turbo attraction tests, including vertical overshoot', () => {
    const star = { type: 3 as const, x: 500, y: 399 };
    moveObstacle(star, 20, true, { x: 258, y: 400 });
    expect(star.x).toBe(471);
    expect(star.y).toBe(399);
  });
});
