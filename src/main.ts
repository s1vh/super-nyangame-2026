import { Application } from 'pixi.js';
import { loadCore, loadMenu } from './assets/assets';
import { AudioManager } from './audio/AudioManager';
import { FixedClock } from './game/clock';
import { GameModel } from './game/model';
import { GameView } from './render/GameView';
import { MenuView, ResultView } from './render/Screens';
import './style.css';

async function boot(): Promise<void> {
  const host = document.querySelector<HTMLElement>('#game')!;
  const status = document.querySelector<HTMLElement>('#status')!;
  const app = new Application();
  await app.init({ width: 1280, height: 800, background: '#110e20', preference: 'webgl', antialias: true });
  host.prepend(app.canvas);
  app.canvas.setAttribute('aria-label', 'Super NyanGame. Move the pointer vertically to fly and collect stars.');
  const clock = new FixedClock();
  let scene: 'menu' | 'game' | 'over' = 'menu';
  let model = new GameModel();
  let game: GameView | undefined;
  let result: ResultView | undefined;
  let loading: Promise<void> | undefined;
  let starting = false;
  let paused = document.hidden;
  let skipFrame = false;
  let qaPaused = false;
  let updateQa = (): void => undefined;
  const menuAssets = await loadMenu();
  const audio = new AudioManager();
  const menu = new MenuView(menuAssets, host, () => { void start(); });
  app.stage.addChild(menu);
  host.dataset.scene = scene;
  audio.setMusic('NyanWelcome');
  status.textContent = '';

  function placeButtons(): void {
    menu.button.place(app.canvas, scene === 'menu');
    result?.button.place(app.canvas, scene === 'over');
  }
  function resize(): void {
    const scale = Math.min(host.clientWidth / 1280, host.clientHeight / 800);
    app.canvas.style.width = `${1280 * scale}px`; app.canvas.style.height = `${800 * scale}px`;
    placeButtons();
  }
  new ResizeObserver(resize).observe(host); resize();

  function setScene(next: typeof scene): void {
    scene = next; host.dataset.scene = next;
    menu.visible = next === 'menu';
    if (game) game.visible = next === 'game';
    if (result) result.visible = next === 'over';
    placeButtons();
  }
  function prepare(): Promise<void> {
    loading ??= loadCore().then((assets) => {
      game = new GameView(assets); game.visible = false; app.stage.addChild(game);
      result = new ResultView(assets, host, () => {
        audio.unlock(); audio.effect('meow'); audio.setMusic('NyanWelcome');
        setScene('menu'); menu.button.element.focus({ preventScroll: true });
      });
      result.visible = false; app.stage.addChild(result); placeButtons();
    }).catch((error: unknown) => { loading = undefined; throw error; });
    return loading;
  }
  async function start(): Promise<void> {
    if (starting) return;
    starting = true; audio.unlock();
    if (!game) status.textContent = 'Loading game…';
    try {
      await prepare();
      audio.clearEffects(); audio.effect('start'); audio.setMusic('NyanLoop');
      model = new GameModel(); game!.clearRun(); game!.sync(model);
      clock.reset(); status.textContent = ''; setScene('game');
      menu.button.element.blur(); updateQa();
    } catch (error) {
      console.error(error); status.textContent = 'Game assets could not load. Check your connection and press START to retry.';
    } finally { starting = false; }
  }
  void prepare().catch((error: unknown) => console.warn('Game preloading failed; START will retry.', error));

  const aim = (event: PointerEvent): void => {
    if (scene !== 'game' || paused) return;
    const bounds = app.canvas.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right) return;
    model.aim((event.clientY - bounds.top) * 800 / bounds.height);
  };
  app.canvas.addEventListener('pointermove', aim);
  app.canvas.addEventListener('pointerdown', (event) => {
    audio.unlock(); aim(event);
    if (scene === 'game') app.canvas.setPointerCapture(event.pointerId);
  });
  host.addEventListener('pointerdown', () => audio.unlock());
  function step(): void {
    if (scene === 'game') {
      model.step(); game!.sync(model);
      if (model.phase === 'over') {
        audio.setMusic(); result!.setScore(model.score); setScene('over');
        result!.button.element.setAttribute('aria-label', `Score ${model.score}. Return to menu`);
        result!.button.element.focus({ preventScroll: true });
      }
      for (const cue of model.cues) audio.effect(cue);
    }
    game?.advance(); updateQa();
  }
  app.ticker.add((ticker) => {
    if (paused) return;
    if (skipFrame) { skipFrame = false; return; }
    if (!qaPaused) clock.advance(ticker.elapsedMS, step);
    if (scene === 'menu') menu.animate(Date.now());
    placeButtons();
  });
  const visibility = (): void => {
    paused = document.hidden; clock.reset(); skipFrame = true;
    audio.setHidden(paused);
    if (paused) app.stop(); else app.start();
  };
  document.addEventListener('visibilitychange', visibility);
  if (paused) app.stop();
  if (import.meta.env.DEV && new URLSearchParams(location.search).has('qa')) {
    const { installQa } = await import('./qa');
    updateQa = installQa({ host, model: () => model, start, step, pause: (value) => { qaPaused = value; clock.reset(); }, sync: () => { game?.sync(model); updateQa(); } });
  }
}

void boot().catch((error: unknown) => {
  console.error(error);
  const status = document.querySelector('#status')!;
  status.textContent = 'The game could not start. Check your connection and WebGL support. ';
  const retry = document.createElement('button'); retry.textContent = 'Retry'; retry.onclick = () => location.reload(); status.append(retry);
});
