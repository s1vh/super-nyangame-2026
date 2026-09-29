// Development-only visible controls for repeatable browser checks; excluded from production.
import type { GameModel } from './game/model';
interface QaControls {
  host: HTMLElement; model: () => GameModel; start: () => Promise<void>; step: () => void;
  pause: (value: boolean) => void; sync: () => void;
}
export function installQa(control: QaControls): () => void {
  const panel = document.createElement('aside'); panel.id = 'qa'; panel.setAttribute('aria-label', 'Development checks');
  const output = document.createElement('output');
  const button = (name: string, action: () => void): void => {
    const element = document.createElement('button'); element.textContent = name; element.onclick = action; panel.append(element);
  };
  button('Pause simulation', () => control.pause(true));
  button('Resume simulation', () => control.pause(false));
  button('Step 60 ticks', () => { for (let i = 0; i < 60; i++) control.step(); });
  button('New run', () => { void control.start(); });
  button('Hit', () => { control.model().hit = true; control.step(); });
  button('Low health', () => { control.model().hp = 20; control.sync(); });
  button('Turbo', () => { const model = control.model(); model.speed = 20; model.turbo = true; control.sync(); });
  button('Star contact', () => {
    const model = control.model(); model.started = true;
    model.obstacles.push({ id: -1, type: 3, x: model.player.x, y: model.player.y, bornTick: model.tick, age: 0 });
    control.step(); control.step();
  });
  button('Finish run', () => { const model = control.model(); model.hp = 20; model.turbo = false; model.hit = true; control.step(); });
  panel.append(output); control.host.append(panel);
  return () => {
    const model = control.model();
    output.textContent = `tick=${model.tick} phase=${model.phase} hp=${model.hp} score=${model.score} speed=${model.speed.toFixed(4)} turbo=${model.turbo} crashed=${model.crashed} y=${model.player.y.toFixed(3)} objects=${model.obstacles.length + model.rainbow.length + model.background.length + model.particles.length}`;
  };
}
