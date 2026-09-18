import { describe, expect, it } from 'vitest';
import { Rectangle, Spritesheet, Texture, TextureSource } from 'pixi.js';
import type { BitmapFont } from 'pixi.js';
import { readFileSync } from 'node:fs';
import type { AtlasData } from '../src/assets/assets';
import { LegacyClip } from '../src/render/LegacyClip';
import { LegacyScore } from '../src/render/LegacyScore';
import { GameView } from '../src/render/GameView';
import { GameModel } from '../src/game/model';
import { seededRandom } from '../src/game/spawn';

const data = JSON.parse(readFileSync('public/assets/game.json', 'utf8')) as AtlasData;
function texture(width: number, height: number): Texture {
  return new Texture({ source: new TextureSource({ width, height }), frame: new Rectangle(0, 0, width, height) });
}
describe('source-compatible presentation', () => {
  it('keeps the initial quad and strict animation boundaries across a loop', () => {
    const sheet = new Spritesheet(texture(4096, 4096), data as never);
    const clip = new LegacyClip(sheet, data, 'cat00', 20).center();
    expect([clip.logicalWidth, clip.logicalHeight, clip.x, clip.y]).toEqual([167, 106, -83, -53]);
    for (let i = 0; i < 3; i++) clip.advance(1 / 60);
    expect(clip.currentFrame).toBe(0); clip.advance(1 / 60); expect(clip.currentFrame).toBe(1);
    for (let i = 4; i < 63; i++) clip.advance(1 / 60);
    expect(clip.currentFrame).toBe(20); clip.advance(1 / 60); expect(clip.currentFrame).toBe(0);
    const source = clip.texture.source; clip.destroy(); expect(source.destroyed).toBe(false);
  });
  it('preserves negative glyph offsets, kerning and source wrapping', () => {
    const font = { lineHeight: 59, chars: {
      '4': { xOffset: -3, yOffset: 1, xAdvance: 24, texture: texture(34, 51), kerning: {} },
      '1': { xOffset: -3, yOffset: 1, xAdvance: 18, texture: texture(28, 51), kerning: { '4': -1 } },
    } } as unknown as BitmapFont;
    const score = new LegacyScore(font, 100); score.setScore(414141);
    expect(score.children.map((child) => [child.x, child.y])).toEqual([[-3, 1], [20, 1], [38, 1], [61, 1]]);
    score.setScore(1); expect(score.children).toHaveLength(1); score.destroy({ children: true });
  });
});

it('recycles run displays without destroying shared atlas resources', async () => {
  const atlas = texture(4096, 4096);
  const game = new Spritesheet(atlas, data as never); await game.parse();
  const font = { lineHeight: 29, chars: { '0': { xOffset: -1, yOffset: 1, xAdvance: 13, texture: texture(19, 27), kerning: {} } } } as unknown as BitmapFont;
  const view = new GameView({ game, data, font24: font, font48: font, particle: texture(16, 16), resultStar: texture(150, 150) });
  for (let run = 0; run < 5; run++) {
    const model = new GameModel(seededRandom(run)); model.spawnDelay = 1_000_000;
    for (let tick = 0; tick < 600; tick++) { model.step(); view.sync(model); view.advance(); }
    expect(view.children.length).toBeLessThan(100);
    view.clearRun(); expect(view.children).toHaveLength(3);
    expect(atlas.source.destroyed).toBe(false);
  }
  view.destroy({ children: true }); expect(atlas.source.destroyed).toBe(false);
});
