// Presentation port of the original display-list ordering. See LICENSE.md.
import { Container, Sprite } from 'pixi.js';
import type { GameAssets } from '../assets/assets';
import type { GameModel } from '../game/model';
import { LegacyClip } from './LegacyClip';
import { LegacyScore } from './LegacyScore';

export class GameView extends Container {
  private readonly cat = new Container();
  private readonly idle: LegacyClip;
  private readonly hit: LegacyClip;
  private readonly token: LegacyClip;
  private readonly score: LegacyScore;
  private readonly entities = new Map<number, Container>();

  constructor(private readonly assets: GameAssets) {
    super();
    this.eventMode = 'none';
    this.hit = this.clip('cat_hit00', 21).center();
    this.idle = this.clip('cat00', 20).center();
    this.cat.addChild(this.hit, this.idle);
    this.addChild(this.cat);
    this.score = new LegacyScore(assets.font24, 37);
    this.score.position.set(150, 20);
    this.token = this.clip('token00', 26);
    this.token.position.set(100, 10);
    this.addChild(this.token, this.score);
    this.score.setScore(0);
  }

  private clip(prefix: string, fps: number): LegacyClip {
    return new LegacyClip(this.assets.game, this.assets.data, prefix, fps);
  }

  clearRun(): void {
    for (const view of this.entities.values()) view.destroy({ children: true });
    this.entities.clear();
  }

  sync(model: GameModel): void {
    this.cat.position.set(model.player.x, model.player.y);
    this.cat.rotation = model.player.rotation;
    this.hit.visible = model.crashed;
    this.idle.visible = !model.crashed;
    this.score.setScore(model.score);
    const records = [
      ...model.rainbow.map((data) => ({ kind: 'rainbow' as const, data })),
      ...model.obstacles.map((data) => ({ kind: 'obstacle' as const, data })),
      ...model.particles.map((data) => ({ kind: 'particle' as const, data })),
      ...model.background.map((data) => ({ kind: 'background' as const, data })),
    ].sort((a, b) => a.data.id - b.data.id);
    const alive = new Set(records.map(({ data }) => data.id));
    for (const [id, view] of this.entities) {
      if (!alive.has(id)) { view.destroy({ children: true }); this.entities.delete(id); }
    }
    for (const record of records) {
      let view = this.entities.get(record.data.id);
      if (!view) {
        view = new Container();
        switch (record.kind) {
          case 'rainbow': view.addChild(new Sprite(this.assets.game.textures.RbSegment)); break;
          case 'obstacle': view.addChild(this.clip(['', 'invader00', 'destructor00', 'star00'][record.data.type]!, 20).center()); break;
          case 'background': {
            const art = this.clip('backgroundStar', 3).center();
            art.scale.set(record.data.scale); view.addChild(art); break;
          }
          case 'particle': {
            const art = new Sprite(this.assets.particle);
            art.position.set(art.width / 2, art.height / 2); view.addChild(art); break;
          }
        }
        if (record.kind === 'rainbow') this.addChildAt(view, 0);
        else if (record.kind === 'background') this.addChildAt(view, 1);
        else this.addChild(view);
        this.entities.set(record.data.id, view);
      }
      view.position.set(record.data.x, record.data.y);
      if (record.kind === 'rainbow') view.alpha = record.data.alpha;
      if (record.kind === 'particle') { view.scale.set(record.data.scale); view.rotation = record.data.rotation; }
    }
  }

  advance(): void {
    this.idle.advance(1 / 60); this.hit.advance(1 / 60); this.token.advance(1 / 60);
    if (this.visible) for (const view of this.entities.values()) {
      const art = view.children[0];
      if (art instanceof LegacyClip) art.advance(1 / 60);
    }
  }
}
