import { describe, expect, it } from 'vitest';
import { FixedClock } from '../src/game/clock';
import { aimPlayer, createPlayer, movePlayer, takeOff } from '../src/game/player';
import { intersects, quadBounds } from '../src/game/geometry';

describe('source player fixtures', () => {
  it('reaches the original takeoff position and starts flying on tick 46', () => {
    const player = createPlayer();
    expect(player.y).toBe(402);
    for (let i = 0; i < 45; i++) expect(takeOff(player)).toBe(false);
    expect(player.x).toBeCloseTo(257.80937130071567, 10);
    expect(player.y).toBe(400);
    expect(takeOff(player)).toBe(true);
  });
  it('preserves hover target filtering and the closed-form smoothing trajectory', () => {
    const player = createPlayer(); player.y = 400;
    aimPlayer(player, 700);
    for (const invalid of [50, 750, -100, 900, NaN]) aimPlayer(player, invalid);
    expect(player.targetY).toBe(700);
    movePlayer(player);
    expect(player.y).toBe(415);
    expect(player.rotation).toBe(0);
    for (let i = 1; i < 20; i++) movePlayer(player);
    expect(player.y).toBeCloseTo(592.4542232774374, 10);
    for (let i = 20; i < 60; i++) movePlayer(player);
    expect(player.y).toBeCloseTo(686.1790603039144, 10);
    expect(player.rotation).toBeCloseTo((700 - player.y) / 3 * Math.PI / 180, 12);
  });
  it.each([60, 120, 144])('runs exactly 600 original steps in ten seconds at %s Hz', (hz) => {
    const clock = new FixedClock(); let steps = 0;
    for (let frame = 0; frame < hz * 10; frame++) clock.advance(1000 / hz, () => steps++);
    expect(steps).toBe(600);
  });
  it('bounds stalls and discards partial time on visibility suspension', () => {
    const clock = new FixedClock(); let steps = 0;
    clock.advance(60_000, () => steps++);
    expect(steps).toBe(15);
    clock.advance(8, () => steps++); clock.reset();
    clock.advance(9, () => steps++);
    expect(steps).toBe(15);
  });
  it('uses the untrimmed first quad, rounded centering, and strict intersection', () => {
    expect(quadBounds(258, 400, 167, 106)).toEqual({ x: 175, y: 347, width: 167, height: 106 });
    const rotated = quadBounds(0, 0, 167, 106, Math.PI / 2);
    expect(rotated.width).toBeCloseTo(106); expect(rotated.height).toBeCloseTo(167);
    const a = { x: 0, y: 0, width: 10, height: 10 };
    expect(intersects(a, { ...a, x: 10 })).toBe(false);
    expect(intersects(a, { ...a, x: 9.999 })).toBe(true);
  });
});
