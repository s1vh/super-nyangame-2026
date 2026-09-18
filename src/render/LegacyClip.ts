// Gameplay-derived presentation: legacy licensing applies; see LICENSE.md.
import { AnimatedSprite, Rectangle, Texture } from 'pixi.js';
import type { Spritesheet } from 'pixi.js';
import type { AtlasData, FrameData } from '../assets/assets';

export interface ClipGeometry { width: number; height: number; x: number; y: number }

export function frameGeometry(first: FrameData, current: FrameData): ClipGeometry {
  // Starling 1.x Image keeps its first quad. SubTexture translates vertices;
  // it does NOT scale the offsets when later frames declare different sizes.
  return {
    x: current.spriteSourceSize.x,
    y: current.spriteSourceSize.y,
    width: first.sourceSize.w + current.frame.w - current.sourceSize.w,
    height: first.sourceSize.h + current.frame.h - current.sourceSize.h,
  };
}

export class LegacyClip extends AnimatedSprite {
  readonly logicalWidth: number;
  readonly logicalHeight: number;
  private elapsed = 0;
  private readonly fps: number;

  constructor(sheet: Spritesheet, data: AtlasData, prefix: string, fps: number) {
    const names = data.animations[prefix];
    if (!names?.length) throw new Error(`Missing animation: ${prefix}`);
    const first = data.frames[names[0]!]!;
    const textures = names.map((name) => {
      const region = data.frames[name]!;
      const geometry = frameGeometry(first, region);
      return new Texture({
        source: sheet.textureSource,
        frame: new Rectangle(region.frame.x, region.frame.y, region.frame.w, region.frame.h),
        orig: new Rectangle(0, 0, first.sourceSize.w, first.sourceSize.h),
        trim: new Rectangle(geometry.x, geometry.y, geometry.width, geometry.height),
      });
    });
    super({ textures, autoUpdate: false });
    this.logicalWidth = first.sourceSize.w;
    this.logicalHeight = first.sourceSize.h;
    this.fps = fps;
    this.eventMode = 'none';
  }

  advance(seconds: number): void {
    this.elapsed += seconds;
    // Starling advances only AFTER a frame boundary (strict >), not at it.
    const frame = Math.max(0, Math.ceil(this.elapsed * this.fps - 1e-9) - 1) % this.totalFrames;
    this.gotoAndStop(frame);
  }

  center(): this {
    this.position.set(Math.ceil(-this.logicalWidth / 2), Math.ceil(-this.logicalHeight / 2));
    return this;
  }

  override destroy(): void {
    for (const texture of this.textures as Texture[]) texture.destroy(false);
    super.destroy();
  }
}
