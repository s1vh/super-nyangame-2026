import { STEP_MS } from './config';

export class FixedClock {
  private accumulator = 0;
  advance(milliseconds: number, step: () => void): number {
    if (!Number.isFinite(milliseconds) || milliseconds <= 0) return 0;
    this.accumulator += Math.min(milliseconds, 250);
    let steps = 0;
    while (this.accumulator + 1e-7 >= STEP_MS) {
      this.accumulator -= STEP_MS;
      step();
      steps++;
    }
    this.accumulator = Math.max(0, this.accumulator);
    return steps;
  }
  reset(): void { this.accumulator = 0; }
}
