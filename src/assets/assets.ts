import { Assets, BitmapFont, Spritesheet, Texture } from 'pixi.js';

export interface FrameData {
  frame: { x: number; y: number; w: number; h: number };
  sourceSize: { w: number; h: number };
  spriteSourceSize: { x: number; y: number; w: number; h: number };
}
export interface AtlasData {
  frames: Record<string, FrameData>;
  animations: Record<string, string[]>;
}
export interface GameAssets {
  game: Spritesheet;
  data: AtlasData;
  resultStar: Texture;
  particle: Texture;
  font24: BitmapFont;
  font48: BitmapFont;
}

export const assetUrl = (path: string): string => `${import.meta.env.BASE_URL}assets/${path}`;

let corePromise: Promise<GameAssets> | undefined;

export async function loadMenu(): Promise<Spritesheet> {
  return Assets.load<Spritesheet>(assetUrl('menu.json'));
}

export function loadCore(): Promise<GameAssets> {
  corePromise ??= Promise.all([
    Assets.load<Spritesheet>(assetUrl('game.json')),
    Assets.load<Texture>(assetUrl('result-star.png')),
    Assets.load<Texture>(assetUrl('particle.png')),
    Assets.load<BitmapFont>(assetUrl('fonts/NyanImpact24.fnt')),
    Assets.load<BitmapFont>(assetUrl('fonts/NyanImpact48.fnt')),
  ]).then(([game, resultStar, particle, font24, font48]) => ({ game, data: game.data as unknown as AtlasData, resultStar, particle, font24, font48 }))
    .catch((error: unknown) => { corePromise = undefined; throw error; });
  return corePromise;
}
