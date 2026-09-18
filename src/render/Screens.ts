// Original layout and menu motion; legacy derivative licensing applies.
import { Container, Sprite } from 'pixi.js';
import type { Spritesheet, Texture } from 'pixi.js';
import type { GameAssets } from '../assets/assets';
import { LegacyScore } from './LegacyScore';

export class ImageButton extends Container {
  readonly logicalWidth: number;
  readonly logicalHeight: number;
  readonly element = document.createElement('button');
  private readonly art: Sprite;
  constructor(texture: Texture, label: string, host: HTMLElement, activate: () => void) {
    super();
    this.art = new Sprite(texture); this.addChild(this.art);
    this.logicalWidth = texture.orig.width; this.logicalHeight = texture.orig.height;
    this.element.className = 'image-button'; this.element.type = 'button';
    this.element.setAttribute('aria-label', label); host.append(this.element);
    const down = (): void => this.pressed(true);
    const up = (): void => this.pressed(false);
    this.element.addEventListener('pointerdown', down);
    for (const event of ['pointerup', 'pointercancel', 'pointerleave', 'blur']) this.element.addEventListener(event, up);
    this.element.addEventListener('keydown', (event) => { if (event.key === ' ' || event.key === 'Enter') down(); });
    this.element.addEventListener('keyup', up);
    this.element.addEventListener('click', () => { up(); activate(); });
  }
  private pressed(down: boolean): void {
    this.art.scale.set(down ? 0.9 : 1);
    this.art.position.set(down ? this.logicalWidth * 0.05 : 0, down ? this.logicalHeight * 0.05 : 0);
  }
  place(canvas: HTMLCanvasElement, visible: boolean): void {
    this.element.hidden = !visible;
    const bounds = canvas.getBoundingClientRect();
    const scale = bounds.width / 1280;
    Object.assign(this.element.style, { left: `${bounds.left + this.x * scale}px`, top: `${bounds.top + this.y * scale}px`, width: `${this.logicalWidth * scale}px`, height: `${this.logicalHeight * scale}px` });
  }
}

export class MenuView extends Container {
  readonly button: ImageButton;
  private readonly rainbow: Sprite;
  private readonly title: Sprite;
  private readonly subtitle: Sprite;
  private readonly left: Sprite;
  private readonly right: Sprite;
  constructor(sheet: Spritesheet, host: HTMLElement, play: () => void) {
    super();
    const sprite = (name: string, x: number, y: number): Sprite => {
      const art = new Sprite(sheet.textures[`welcome_${name}`]); art.position.set(x, y); this.addChild(art); return art;
    };
    this.rainbow = sprite('rainbow', 0, 0);
    this.title = sprite('title', 430, 20);
    this.subtitle = sprite('super', 390, 10);
    this.button = new ImageButton(sheet.textures.welcome_start!, 'Start game', host, play);
    this.button.position.set(430, 500); this.addChild(this.button);
    this.left = sprite('cat', 0, 200);
    this.right = sprite('cat', 1280, 200); this.right.scale.x = -1;
  }
  animate(time: number): void {
    this.button.y = 500 + Math.sin(time * 0.01) * 10;
    this.subtitle.scale.set(1 + Math.sin(time * 0.01) * 0.05);
    this.title.y = 20 + Math.cos(time * 0.002) * 20;
    this.left.x = Math.cos(time * 0.005) * 10 - 10;
    this.right.x = 1280 - Math.cos(time * 0.005) * 10 + 10;
    this.rainbow.scale.y = 1.1 + Math.cos(time * 0.002) * 0.05;
  }
}

export class ResultView extends Container {
  readonly button: ImageButton;
  private readonly score: LegacyScore;
  constructor(assets: GameAssets, host: HTMLElement, back: () => void) {
    super();
    this.score = new LegacyScore(assets.font48, 100);
    this.score.position.set(440 + assets.resultStar.width / 2 + 40, 355);
    this.addChild(this.score);
    this.button = new ImageButton(assets.resultStar, 'Return to menu', host, back);
    this.button.position.set(440, 300); this.addChild(this.button);
  }
  setScore(score: number): void { this.score.setScore(score); }
}
