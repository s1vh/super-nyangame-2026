import { assetUrl } from '../assets/assets';
const names = ['NyanWelcome', 'NyanLoop', 'collect', 'damage', 'death', 'meow', 'start', 'takeOff'] as const;
type SoundName = typeof names[number];
type MusicName = 'NyanWelcome' | 'NyanLoop';

export class AudioManager {
  private context?: AudioContext;
  private buffers = new Map<SoundName, AudioBuffer>();
  private loads = new Map<SoundName, Promise<void>>();
  private music?: AudioBufferSourceNode;
  private desired?: MusicName;
  private unlocked = false;
  private activation: Promise<void> = Promise.resolve();
  private effectGeneration = 0;
  private readonly effects = new Set<AudioBufferSourceNode>();
  readonly ready: Promise<void>;
  constructor() {
    let decoder: OfflineAudioContext;
    try { decoder = new OfflineAudioContext(2, 1, 44100); }
    catch { this.ready = Promise.resolve(); return; }
    for (const name of names) {
      this.loads.set(name, (async () => {
        try {
          const response = await fetch(assetUrl(`audio/${name}.mp3`));
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          this.buffers.set(name, await decoder.decodeAudioData(await response.arrayBuffer()));
          if (name === this.desired) this.startMusic();
        } catch (error) { console.warn(`Audio unavailable: ${name}`, error); }
      })());
    }
    this.ready = Promise.all(this.loads.values()).then(() => undefined);
  }
  unlock(): void {
    try {
      this.context ??= new AudioContext();
      this.unlocked = true;
      this.activation = this.context.resume().then(() => this.startMusic()).catch(() => undefined);
    } catch (error) { console.warn('Web Audio unavailable; continuing silently.', error); }
  }
  setMusic(name?: MusicName): void {
    this.desired = name;
    if (this.music) { this.music.onended = null; this.music.stop(); this.music.disconnect(); this.music = undefined; }
    this.startMusic();
  }
  private startMusic(): void {
    if (!this.context || !this.unlocked || this.context.state !== 'running' || this.music || !this.desired) return;
    const buffer = this.buffers.get(this.desired);
    if (!buffer) return;
    const source = this.context.createBufferSource(); source.buffer = buffer; source.loop = true;
    source.loopStart = this.desired === 'NyanWelcome' ? 2 : 0;
    const plays = this.desired === 'NyanWelcome' ? 1000 : 10000;
    source.connect(this.context.destination);
    source.start(0, source.loopStart, (buffer.duration - source.loopStart) * plays);
    source.onended = () => {
      source.disconnect();
      if (this.music === source) { this.music = undefined; this.desired = undefined; }
    };
    this.music = source;
  }
  effect(name: Exclude<SoundName, MusicName>): void {
    const generation = this.effectGeneration;
    void Promise.all([this.loads.get(name), this.activation]).then(() => {
      if (generation !== this.effectGeneration || !this.context || !this.unlocked || this.context.state !== 'running') return;
      const buffer = this.buffers.get(name);
      if (!buffer) return;
      const source = this.context.createBufferSource(); source.buffer = buffer;
      source.connect(this.context.destination); this.effects.add(source);
      source.onended = () => { source.disconnect(); this.effects.delete(source); };
      source.start();
    });
  }
  clearEffects(): void {
    this.effectGeneration++;
    for (const source of this.effects) { source.onended = null; source.stop(); source.disconnect(); }
    this.effects.clear();
  }
  setHidden(hidden: boolean): void {
    if (!this.context || !this.unlocked) return;
    void (hidden ? this.context.suspend() : this.context.resume()).then(() => this.startMusic()).catch(() => undefined);
  }
}
