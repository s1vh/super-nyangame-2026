// Source bitmap-font placement, including negative offsets and 100px wrapping.
// Legacy derivative licensing applies; see LICENSE.md.
import { Container, Sprite } from 'pixi.js';
import type { BitmapFont } from 'pixi.js';

export class LegacyScore extends Container {
  private value = '';
  constructor(private readonly font: BitmapFont, private readonly boxHeight: number) { super(); }
  setScore(score: number): void {
    const text = String(score);
    if (this.value === text) return;
    this.value = text;
    this.removeChildren().forEach((child) => child.destroy());
    let x = 0, y = 0, previous = '';
    for (const letter of text) {
      const char = this.font.chars[letter];
      if (!char?.texture) continue;
      x += char.kerning[previous] ?? 0;
      if (x + char.xOffset + char.texture.width > 100) {
        x = 0; y += this.font.lineHeight; previous = '';
      }
      if (y + this.font.lineHeight > this.boxHeight) break;
      const glyph = new Sprite(char.texture);
      glyph.position.set(x + char.xOffset, y + char.yOffset);
      this.addChild(glyph);
      x += char.xAdvance; previous = letter;
    }
  }
}
