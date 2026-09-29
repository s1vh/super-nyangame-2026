import { afterEach, describe, expect, it, vi } from 'vitest';
import { AudioManager } from '../src/audio/AudioManager';

const flush = async (): Promise<void> => { for (let i = 0; i < 12; i++) await Promise.resolve(); };
function audioHarness(fail = false) {
  const sources: { loop: boolean; loopStart: number; start: ReturnType<typeof vi.fn>; stop: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn> }[] = [];
  const context = { state: 'suspended', destination: {}, resume: vi.fn(async () => { context.state = 'running'; }), suspend: vi.fn(async () => { context.state = 'suspended'; }), createBufferSource: () => {
    const source = { loop: false, loopStart: 0, buffer: undefined, onended: null, connect: vi.fn(), start: vi.fn(), stop: vi.fn(), disconnect: vi.fn() }; sources.push(source); return source;
  } };
  vi.stubGlobal('AudioContext', class { constructor() { return context; } });
  vi.stubGlobal('OfflineAudioContext', class { async decodeAudioData() { return { duration: 60 }; } });
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: !fail, status: fail ? 404 : 200, arrayBuffer: async () => new ArrayBuffer(1) })));
  vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  return { sources, context };
}
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });
describe('browser audio lifecycle', () => {
  it('loads silently and starts the requested music only after activation', async () => {
    const { sources } = audioHarness(); const audio = new AudioManager(); audio.setMusic('NyanWelcome'); await audio.ready;
    expect(sources).toHaveLength(0); audio.unlock(); await flush();
    expect(sources).toHaveLength(1); expect(sources[0]!.loop).toBe(true); expect(sources[0]!.start).toHaveBeenCalledWith(0, 2, 58000);
  });
  it('retains the first click cue while activation and decoding complete', async () => {
    const { sources } = audioHarness(); const audio = new AudioManager(); audio.unlock(); audio.effect('start'); await audio.ready; await flush();
    expect(sources).toHaveLength(1); expect(sources[0]!.loop).toBe(false); expect(sources[0]!.start).toHaveBeenCalledOnce();
  });
  it('switches music without overlapping loops and suspends in the background', async () => {
    const { sources, context } = audioHarness(); const audio = new AudioManager(); await audio.ready; audio.unlock(); audio.setMusic('NyanWelcome'); await flush();
    audio.setMusic('NyanLoop'); expect(sources).toHaveLength(2); expect(sources[0]!.stop).toHaveBeenCalledOnce(); expect(sources[1]!.start).toHaveBeenCalledWith(0, 0, 600000);
    audio.setHidden(true); await flush(); expect(context.state).toBe('suspended');
    audio.setHidden(false); await flush(); expect(context.state).toBe('running'); expect(sources).toHaveLength(2);
    audio.setMusic(); expect(sources[1]!.stop).toHaveBeenCalledOnce();
  });
  it('cancels stale queued effects when a new run starts', async () => {
    const { sources } = audioHarness(); const audio = new AudioManager(); audio.unlock(); audio.effect('damage'); audio.clearEffects(); audio.effect('start'); await audio.ready; await flush();
    expect(sources).toHaveLength(1); audio.clearEffects(); expect(sources[0]!.disconnect).toHaveBeenCalledOnce();
  });
  it('degrades gracefully when audio assets fail', async () => {
    const { sources } = audioHarness(true); const audio = new AudioManager(); audio.unlock(); audio.setMusic('NyanLoop'); audio.effect('start'); await audio.ready; await flush(); expect(sources).toHaveLength(0);
  });
});
