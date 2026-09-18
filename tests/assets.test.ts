import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { frameGeometry } from '../src/render/LegacyClip';
import type { AtlasData } from '../src/assets/assets';

const game = JSON.parse(readFileSync('public/assets/game.json', 'utf8')) as AtlasData;
const menu = JSON.parse(readFileSync('public/assets/menu.json', 'utf8')) as AtlasData;

describe('historical assets', () => {
  it('converts the complete runtime atlas inventory and frame order', () => {
    expect(Object.keys(game.frames)).toHaveLength(131);
    expect(Object.keys(menu.frames)).toHaveLength(5);
    expect(Object.fromEntries(Object.entries(game.animations).map(([key, frames]) => [key, frames.length])))
      .toEqual({ cat00: 21, cat_hit00: 21, invader00: 21, destructor00: 21, star00: 15, token00: 27, backgroundStar: 3 });
    expect(game.animations.cat00?.[20]).toBe('cat0020');
  });

  it('keeps first-frame quad size while reproducing Starling vertex offsets', () => {
    expect(frameGeometry(game.frames.cat0000!, game.frames.cat0003!))
      .toEqual({ x: 0, y: 21, width: 167, height: 106 });
    expect(frameGeometry(game.frames.cat_hit0000!, game.frames.cat_hit0004!))
      .toEqual({ x: 42, y: 21, width: 113, height: 112 });
    expect(menu.frames.welcome_start?.sourceSize).toEqual({ w: 440, h: 108 });
    expect(menu.frames.welcome_start?.spriteSourceSize.x).toBe(97);
  });

  it('copies every shipped source image, font and audio file without modifying bytes', () => {
    const manifest = JSON.parse(readFileSync('public/assets/provenance.json', 'utf8')) as { source: string; target: string; sha256: string }[];
    expect(manifest).toHaveLength(16);
    for (const item of manifest) {
      const original = readFileSync(item.source);
      expect(readFileSync(`public/assets/${item.target}`).equals(original)).toBe(true);
      expect(createHash('sha256').update(original).digest('hex')).toBe(item.sha256);
    }
  });
});
