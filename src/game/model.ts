// Behavioral port of legacy/src/screens/InGame.as and its objects.
// Legacy derivative licensing applies; see LICENSE.md. Timing/order quirks are intentional.
import { ACCELERATION, CAT, HEIGHT, OBSTACLE_SIZE, WIDTH } from './config';
import { intersects, quadBounds } from './geometry';
import { aimPlayer, createPlayer, movePlayer, takeOff } from './player';
import { generateSpawn, moveObstacle } from './spawn';
import type { Random, Spawned, SpawnState } from './spawn';

export interface Obstacle extends Spawned { id: number; bornTick: number; age: number }
export interface Rainbow { id: number; x: number; y: number; alpha: number }
export interface BackgroundStar { id: number; x: number; y: number; scale: number; bornTick: number; age: number }
export interface Particle { id: number; x: number; y: number; scale: number; rotation: number; speedX: number; speedY: number; spin: number }
export type Cue = 'takeOff' | 'damage' | 'collect' | 'death';

export class GameModel {
  player = createPlayer();
  phase: 'entry' | 'flying' | 'over' = 'entry';
  hp = 100;
  score = 0;
  speed = 10;
  turbo = false;
  crashed = false;
  crashTicks = 0;
  tick = 0;
  spawnDelay = 100;
  elapsed = 0;
  readyToSpawn = false;
  started = false;
  hit = false;
  collect = false;
  spawnState: SpawnState = { minY: 800, maxY: 0, redAvailable: true };
  obstacles: Obstacle[] = [];
  rainbow: Rainbow[] = [];
  background: BackgroundStar[] = [];
  particles: Particle[] = [];
  cues: Cue[] = [];
  private nextId = 0;
  private rainbowStarted = false;
  private bgDelay: number;

  constructor(private readonly random: Random = Math.random) {
    this.bgDelay = 20 + Math.round(random() * 30);
  }

  get isOver(): boolean { return this.phase === 'over'; }

  aim(y: number): void { aimPlayer(this.player, y); }

  step(): void {
    this.cues.length = 0;
    if (this.phase === 'over') return;
    this.tick++;
    if (this.phase === 'entry') {
      if (takeOff(this.player)) {
        this.phase = 'flying'; this.readyToSpawn = true; this.cues.push('takeOff');
      }
      return;
    }
    movePlayer(this.player);
    this.updateRainbow();
    this.checkObstacles();
    if (this.isOver) return;
    this.createObstacles();
    this.updateParticles();
    this.updateBackground();
    if (this.speed < 20) this.speed += ACCELERATION;
    if (this.speed >= 20 && !this.turbo) {
      this.speed = 20; this.turbo = true; this.cues.push('takeOff');
    }
    if (this.crashed && ++this.crashTicks === 63) {
      this.crashTicks = 0; this.crashed = false;
    }
    // Stage listener snapshot: new objects do not move on their creation tick.
    // These listeners run AFTER InGame, so they see its new speed and Turbo flag.
    for (const obstacle of this.obstacles) {
      if (obstacle.bornTick < this.tick) moveObstacle(obstacle, this.speed, this.turbo, this.player);
      obstacle.age++;
    }
    for (const star of this.background) {
      if (star.bornTick < this.tick) star.x -= Math.round(86 * star.scale * this.speed * 0.01);
      star.age++;
    }
  }

  private checkObstacles(): void {
    if (this.hit) {
      this.speed = 10; this.hit = false;
      if (this.turbo) {
        this.hp = Math.max(1, this.hp - 10); this.turbo = false; this.crashed = true;
      } else if (this.hp > 20) {
        this.hp -= 20; this.crashed = true;
      } else {
        this.phase = 'over'; this.cues.push('death');
        this.obstacles.length = this.rainbow.length = this.particles.length = this.background.length = 0;
        return;
      }
    }
    if (this.collect) {
      this.collect = false; this.hp = Math.min(100, this.hp + 1); this.score++;
    }
    if (!this.obstacles.length) return;
    this.readyToSpawn = true;
    const catBounds = quadBounds(this.player.x, this.player.y, CAT.width, CAT.height, this.player.rotation);
    for (let index = 0; index < this.obstacles.length; index++) {
      const obstacle = this.obstacles[index]!;
      const size = OBSTACLE_SIZE[obstacle.type];
      if (obstacle.x + size.spawnWidth * this.speed * 0.1 > WIDTH) this.readyToSpawn = false;
      if (!this.hit && this.started && intersects(catBounds, quadBounds(obstacle.x, obstacle.y, size.width, size.height))) {
        if (obstacle.type === 3) {
          this.createParticles(obstacle);
          this.collect = true; this.cues.push('collect');
          this.obstacles.splice(index, 1);
          if (this.spawnDelay > 60) this.spawnDelay--;
          else if (this.spawnDelay > 40) this.spawnDelay -= 0.5;
          else if (this.spawnDelay > 20) this.spawnDelay -= 0.25;
        } else if (!this.crashed) {
          this.hit = true; this.cues.push('damage'); this.obstacles.splice(index, 1);
        }
      }
      // Preserve the original forward-removal pass, including its skipped neighbor.
      if (obstacle.x < 0) this.obstacles.splice(index, 1);
    }
  }

  private createObstacles(): void {
    this.elapsed += Math.floor(this.speed * 0.1);
    if (this.elapsed < this.spawnDelay || !this.readyToSpawn) return;
    this.started = true;
    for (const data of generateSpawn(this.spawnState, this.turbo, this.random)) {
      this.obstacles.push({ ...data, id: ++this.nextId, bornTick: this.tick, age: 0 });
    }
    this.elapsed = 0;
  }

  private updateRainbow(): void {
    const catHeight = quadBounds(this.player.x, this.player.y, CAT.width, CAT.height, this.player.rotation).height;
    if (this.rainbowStarted) {
      this.rainbow.push({ id: ++this.nextId, x: Math.floor(this.player.x - this.player.x / 9.5), y: this.player.y - catHeight / 9.5, alpha: 1 });
    }
    this.rainbowStarted = true; // Source's initial segment is invisible.
    for (const segment of this.rainbow) { segment.x -= 5; segment.alpha = Math.ceil(this.hp / 10) / 10; }
    this.rainbow = this.rainbow.filter((segment) => segment.x >= 0);
  }

  private createParticles(obstacle: Obstacle): void {
    for (let count = 0; count < 5; count++) {
      this.particles.push({
        id: ++this.nextId,
        x: obstacle.x + this.random() * 40 - 20,
        y: obstacle.y - this.random() * 40,
        speedX: this.random() * 2 + 1,
        speedY: this.random() * 5,
        spin: this.random() * 15,
        scale: this.random() * 0.3 + 0.3,
        rotation: 0,
      });
    }
  }

  private updateParticles(): void {
    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i]!;
      particle.scale -= 0.03;
      particle.y -= particle.speedY; particle.speedY -= particle.speedY * 0.2;
      particle.x += particle.speedX; particle.speedX--;
      particle.rotation += particle.spin * Math.PI / 180; particle.spin *= 1.1;
      if (particle.scale <= 0.02) this.particles.splice(i, 1);
    }
  }

  private updateBackground(): void {
    for (let i = 0; i < this.background.length; i++) {
      if (this.background[i]!.x < 0) this.background.splice(i, 1);
    }
    if (--this.bgDelay > 0) return;
    // In AS3 y is drawn before ADDED_TO_STAGE creates art and draws its scale.
    const y = Math.round(this.random() * HEIGHT);
    const scale = 0.25 + this.random() * 0.75;
    this.background.push({ id: ++this.nextId, x: WIDTH, y, scale, bornTick: this.tick, age: 0 });
    this.bgDelay = 20 + Math.round(this.random() * 30);
  }
}
