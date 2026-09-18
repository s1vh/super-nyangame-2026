import { describe, expect, it } from 'vitest';
import { ACCELERATION } from '../src/game/config';
import { GameModel } from '../src/game/model';
import type { Obstacle } from '../src/game/model';
import { seededRandom } from '../src/game/spawn';

function flying(): GameModel {
  const model = new GameModel(seededRandom(123));
  for (let i = 0; i < 46; i++) model.step();
  model.spawnDelay = 1_000_000;
  model.started = true;
  return model;
}
function contact(model: GameModel, id: number, type: 1 | 2 | 3): Obstacle {
  return { id, type, x: model.player.x, y: model.player.y, bornTick: model.tick, age: 0 };
}

describe('ordered original game loop', () => {
  it('reaches Turbo on flying step 2020 and emits the takeoff cue', () => {
    const model = flying();
    for (let i = 0; i < 2019; i++) model.step();
    expect(model.turbo).toBe(false); expect(model.speed).toBeLessThan(20);
    model.step();
    expect(model.speed).toBe(20); expect(model.turbo).toBe(true);
    expect(model.cues).toContain('takeOff');
  });
  it('defers damage one step and protects for 63 ticks', () => {
    const model = flying(); model.speed = 18; model.obstacles.push(contact(model, 1, 1));
    model.step(); expect(model.hp).toBe(100); expect(model.hit).toBe(true);
    model.step(); expect(model.hp).toBe(80); expect(model.speed).toBeCloseTo(10 + ACCELERATION);
    expect(model.crashed).toBe(true); expect(model.crashTicks).toBe(1);
    for (let i = 0; i < 61; i++) model.step();
    expect(model.crashed).toBe(true);
    model.step(); expect(model.crashed).toBe(false);
  });
  it('blocks enemy hits during recovery but still allows collection', () => {
    const model = flying(); model.hp = 80; model.crashed = true;
    model.obstacles.push(contact(model, 1, 1), contact(model, 2, 3));
    model.step(); expect(model.hit).toBe(false); expect(model.collect).toBe(true);
    model.step(); expect(model.hp).toBe(81); expect(model.score).toBe(1);
  });
  it('retains boolean multi-collection and forward-splice skipping', () => {
    const model = flying(); model.hp = 70; model.spawnDelay = 100;
    model.obstacles.push(...[1, 2, 3].map((id) => contact(model, id, 3)));
    model.step();
    expect(model.score).toBe(0); expect(model.obstacles.map((o) => o.id)).toEqual([2]);
    expect(model.particles).toHaveLength(10); expect(model.spawnDelay).toBe(98);
    model.step(); expect(model.score).toBe(1); expect(model.hp).toBe(71);
    model.step(); expect(model.score).toBe(2); expect(model.hp).toBe(72);
  });
  it('keeps Turbo minimum HP and then permits a normal fatal hit', () => {
    const model = flying(); model.hp = 5; model.turbo = true; model.speed = 20; model.hit = true;
    model.step(); expect(model.hp).toBe(1); expect(model.turbo).toBe(false);
    expect(model.phase).toBe('flying');
    model.crashed = false; model.hit = true;
    model.step(); expect(model.phase).toBe('over'); expect(model.cues).toEqual(['death']);
    expect(model.obstacles).toHaveLength(0); expect(model.background).toHaveLength(0);
  });
  it('does not move an obstacle on its spawn tick', () => {
    const model = flying(); model.spawnDelay = 1;
    model.step(); const first = model.obstacles[0]!;
    const x = first.x; expect(first.age).toBe(1);
    model.spawnDelay = 1_000_000; model.step();
    expect(first.x).toBe(x - Math.round(model.speed));
  });
  it('resets all run state and bounds rainbow storage', () => {
    const old = flying(); for (let i = 0; i < 10_000; i++) old.step();
    expect(old.rainbow.length).toBeLessThanOrEqual(47);
    expect(old.background.length).toBeLessThan(70);
    const fresh = new GameModel(seededRandom(123));
    expect(fresh.hp).toBe(100); expect(fresh.score).toBe(0); expect(fresh.hit).toBe(false);
    expect(fresh.crashed).toBe(false); expect(fresh.spawnState.redAvailable).toBe(true);
    expect(fresh.obstacles).toHaveLength(0); expect(fresh.rainbow).toHaveLength(0);
  });
});
