import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Sound } from "../../Play";
import { Group, Pt } from "../../Pt";

class FakeNode {
  connections: unknown[] = [];
  disconnects: unknown[] = [];

  connect(node: unknown) {
    this.connections.push(node);
    return node;
  }

  disconnect(node?: unknown) {
    this.disconnects.push(node);
  }
}

class FakeGain extends FakeNode {
  gain = { value: 1 };
}

class FakeOscillator extends FakeNode {
  frequency = { value: 0 };
  type: OscillatorType = "sine";
  started = 0;
  stopped = 0;
  wave: PeriodicWave;

  setPeriodicWave(wave: PeriodicWave) {
    this.wave = wave;
  }

  start() {
    this.started++;
  }

  stop() {
    this.stopped++;
  }
}

class FakeBufferSource extends FakeNode {
  buffer: AudioBuffer;
  onended: () => void;
  starts: [number, number][] = [];
  stopped = 0;

  start(when = 0, offset = 0) {
    this.starts.push([when, offset]);
  }

  stop() {
    this.stopped++;
  }
}

class FakeAnalyser extends FakeNode {
  private _fftSize = 8;
  minDecibels = 0;
  maxDecibels = 0;
  smoothingTimeConstant = 0;

  get fftSize() {
    return this._fftSize;
  }

  set fftSize(value: number) {
    this._fftSize = value;
  }

  get frequencyBinCount() {
    return this._fftSize / 2;
  }

  getByteTimeDomainData(data: Uint8Array) {
    data.fill(128);
  }

  getByteFrequencyData(data: Uint8Array) {
    data.forEach((_, index) => (data[index] = index * 10));
  }
}

class FakeAudioContext {
  state = "running";
  currentTime = 5;
  sampleRate = 48_000;
  destination = new FakeNode();
  createdOscillators: FakeOscillator[] = [];
  createdBuffers: FakeBufferSource[] = [];
  createdGains: FakeGain[] = [];
  resumed = 0;

  createOscillator() {
    const oscillator = new FakeOscillator();
    this.createdOscillators.push(oscillator);
    return oscillator;
  }

  createAnalyser() {
    return new FakeAnalyser();
  }

  createBufferSource() {
    const source = new FakeBufferSource();
    this.createdBuffers.push(source);
    return source;
  }

  createGain() {
    const gain = new FakeGain();
    this.createdGains.push(gain);
    return gain;
  }

  createMediaElementSource() {
    return new FakeNode();
  }

  createMediaStreamSource() {
    return new FakeNode();
  }

  decodeAudioData(_data: ArrayBuffer): Promise<AudioBuffer> {
    return Promise.resolve({ duration: 4 } as AudioBuffer);
  }

  resume() {
    this.resumed++;
    this.state = "running";
    return Promise.resolve();
  }
}

class FakeMedia extends EventTarget {
  autoplay = true;
  crossOrigin = "";
  src = "";
  duration = 10;
  currentTime = 2;
  readyState = 4;
  played = 0;
  paused = 0;
  loads = 0;

  play() {
    this.played++;
    return Promise.resolve();
  }

  pause() {
    this.paused++;
  }

  load() {
    this.loads++;
  }
}

class FakeAudio extends FakeMedia {
  static created: FakeAudio[] = [];
  readyState = 0; // a fresh element has loaded nothing yet

  constructor(src?: string) {
    super();
    if (src !== undefined) this.src = src;
    FakeAudio.created.push(this);
  }
}

const okFetch = () =>
  vi.fn().mockResolvedValue({
    ok: true,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(2)),
  });

beforeEach(() => {
  vi.stubGlobal("AudioContext", FakeAudioContext);
  (Sound as any)._sharedContext = undefined; // never reuse a stale fake context
  FakeAudio.created.length = 0;
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("Sound construction and generated audio", () => {
  it("reports browsers without Web Audio support", () => {
    vi.stubGlobal("AudioContext", undefined);
    expect(() => new Sound("gen")).toThrow(/doesn't support Web Audio/);
  });

  it("shares one AudioContext across instances by default", () => {
    const a = Sound.generate("sine", 100);
    const b = Sound.generate("sine", 200);
    expect(a.ctx).toBe(b.ctx);
    const own = new FakeAudioContext();
    const c = new Sound("gen", own as unknown as AudioContext);
    expect(c.ctx).toBe(own);
  });

  it("generates, controls, analyzes, maps, connects, and resets a tone", () => {
    const sound = Sound.generate("sine", 440);
    expect(sound.type).toBe("gen");
    expect(sound.ctx).toBeInstanceOf(FakeAudioContext);
    expect(sound.node).toBeInstanceOf(FakeOscillator);
    expect(sound.playable).toBe(true);
    expect(sound.progress).toBe(0);
    expect(sound.binSize).toBe(0);
    expect(sound.frequency).toBe(440);
    expect(sound.sampleRate).toBe(48_000);
    sound.frequency = 220;
    expect(sound.frequency).toBe(220);

    const extra = new FakeNode();
    const output = new FakeNode();
    expect(sound.connect(extra as unknown as AudioNode)).toBe(sound);
    expect(sound.setOutputNode(output as unknown as AudioNode)).toBe(sound);
    expect(sound.outputNode).toBe(output);
    sound.removeOutputNode();
    expect(sound.outputNode).toBeNull();

    sound.analyze(4, -80, -20, 0.5);
    expect(sound.binSize).toBe(4);
    expect(Array.from(sound.timeDomain())).toEqual([128, 128, 128, 128]);
    expect(Array.from(sound.freqDomain())).toEqual([0, 10, 20, 30]);
    expect(sound.timeDomainTo([40, 20], [5, 10], [1, 1])).toBeInstanceOf(Group);
    expect(sound.freqDomainTo([40, 20])).toHaveLength(4);

    sound.start();
    expect(sound.playing).toBe(true);
    sound.toggle();
    expect(sound.playing).toBe(false);
    sound.toggle();
    expect(sound.playing).toBe(true);
    sound.reset();
    expect(sound.playing).toBe(false);
    sound.reset(); // reset when already stopped is a no-op
  });

  it("controls volume through a gain node before and during playback", () => {
    const sound = Sound.generate("sine", 440);
    sound.volume = 0.5; // before the gain node exists
    expect(sound.volume).toBe(0.5);
    sound.start();
    const ctx = sound.ctx as unknown as FakeAudioContext;
    expect(ctx.createdGains).toHaveLength(1);
    const gain = ctx.createdGains[0];
    expect(gain.gain.value).toBe(0.5);
    expect(gain.connections).toContain(ctx.destination);
    expect((sound.node as unknown as FakeNode).connections).toContain(gain);
    sound.volume = 2; // amplification allowed
    expect(gain.gain.value).toBe(2);
    sound.volume = -1; // negative clamps to 0
    expect(sound.volume).toBe(0);
    sound.stop();
    expect((sound.node as unknown as FakeNode).disconnects).toContain(gain);
  });

  it("restores custom waves and connected chains when restarting", () => {
    const wave = {} as PeriodicWave;
    const custom = Sound.generate("custom", wave);
    expect((custom.node as unknown as FakeOscillator).wave).toBe(wave);
    expect(custom.timeDomain()).toHaveLength(0);
    expect(custom.freqDomain()).toHaveLength(0);

    const filter = new FakeNode();
    custom.connect(filter as unknown as AudioNode);
    custom.analyze(4);
    custom.start().stop();
    custom.start(); // restart rebuilds the oscillator
    const osc = custom.node as unknown as FakeOscillator;
    expect(osc.wave).toBe(wave); // the wave survives the rebuild
    expect(osc.connections).toContain(filter); // so does the filter chain
    expect(osc.connections.some((n) => n instanceof FakeAnalyser)).toBe(true);
  });

  it("reuses a provided output group without allocating new Pts", () => {
    const sound = Sound.generate("sine", 440).analyze(4);
    const out = sound.freqDomainTo([40, 20]);
    expect(out).toHaveLength(4);
    const pts = [...out];

    const again = sound.freqDomainTo([40, 20], [0, 0], [0, 0], out);
    expect(again).toBe(out);
    again.forEach((p, i) => {
      expect(p).toBe(pts[i]); // same Pt instances, mutated in place
      expect(p[1]).toBeCloseTo((20 * i * 10) / 255, 5); // values still correct
    });

    // trimming shrinks the reused group
    const trimmed = sound.freqDomainTo([40, 20], [0, 0], [1, 1], out);
    expect(trimmed).toBe(out);
    expect(out).toHaveLength(2);

    // growing back allocates only the missing Pts, and replaces unusable ones
    (out as any)[0] = new Pt([7]); // a 1-dimensional Pt cannot be reused
    const grown = sound.timeDomainTo([40, 20], [0, 0], [0, 0], out);
    expect(grown).toHaveLength(4);
    expect(grown[0].length).toBeGreaterThanOrEqual(2);
    expect(grown[1]).toBe(pts[1]); // surviving Pt reused
  });

  it("replaces the analyzer when analyze is called again", () => {
    const sound = Sound.generate("sine", 440);
    sound.analyze(4);
    const first = sound.analyzer.node;
    sound.analyze(8);
    expect(sound.analyzer.node).not.toBe(first);
    expect(sound.binSize).toBe(8);
    expect((sound.node as unknown as FakeNode).disconnects).toContain(first);
  });

  it("resumes a suspended AudioContext on start", () => {
    const sound = Sound.generate("sine", 440);
    const ctx = sound.ctx as unknown as FakeAudioContext;
    ctx.state = "suspended";
    sound.start();
    expect(ctx.resumed).toBe(1);
    expect(sound.playing).toBe(true);
  });

  it("connects and disconnects externally managed node types on start/stop", () => {
    const node = new FakeNode();
    const context = new FakeAudioContext();
    const sound = Sound.from(
      node as unknown as AudioNode,
      context as unknown as AudioContext,
      "external" as any,
    );
    expect(sound.stream).toBeUndefined();
    expect(sound.frequency).toBe(0);
    sound.frequency = 999; // ignored for non-generated sounds
    sound.start();
    expect(sound.playing).toBe(true);
    expect(node.connections).toContain(context.createdGains[0]);
    sound.stop();
    expect(sound.playing).toBe(false);
    expect(node.disconnects).toContain(context.createdGains[0]);
  });

  it("passes a stream through Sound.from", () => {
    const node = new FakeNode();
    const context = new FakeAudioContext();
    const stream = { id: "stream" } as unknown as MediaStream;
    const from = Sound.from(
      node as unknown as AudioNode,
      context as unknown as AudioContext,
      "input",
      stream,
    );
    expect(from.node).toBe(node);
    expect(from.ctx).toBe(context);
    expect(from.stream).toBe(stream);
  });

  it("disposes nodes and references without closing the context", () => {
    const sound = Sound.generate("sine", 440).analyze(4);
    const output = new FakeNode();
    sound.setOutputNode(output as unknown as AudioNode);
    sound.start();
    const ctx = sound.ctx;
    const gain = (sound.ctx as unknown as FakeAudioContext).createdGains[0];
    sound.dispose();
    expect(sound.playing).toBe(false);
    expect(sound.analyzer).toBeUndefined();
    expect(output.disconnects.length).toBeGreaterThan(0);
    expect(gain.disconnects.length).toBeGreaterThan(0);
    expect(sound.ctx).toBe(ctx); // context stays usable

    const bare = Sound.generate("sine", 440);
    bare.dispose(); // no analyzer, gain, or playback: still safe
    expect(bare.playing).toBe(false);
  });
});

describe("Sound file and buffer sources", () => {
  it("resolves immediately for an already-buffered element", async () => {
    const media = new FakeMedia();
    const sound = await Sound.load(
      media as unknown as HTMLMediaElement,
      "use-credentials",
    );

    expect(sound.source).toBe(media);
    expect(sound.playable).toBe(true);
    expect(sound.progress).toBe(0.2);
    expect(media.autoplay).toBe(false);
    expect(media.crossOrigin).toBe("use-credentials");
    expect(media.loads).toBe(0);

    sound.start(3); // seeks before playing
    expect(media.played).toBe(1);
    expect(media.currentTime).toBe(3);
    sound.stop();
    expect(media.paused).toBe(1);
    media.dispatchEvent(new Event("ended"));
    expect(sound.playing).toBe(false);
  });

  it("waits for canplaythrough on an unloaded element and rejects on error", async () => {
    const media = new FakeMedia();
    media.readyState = 0;
    const promise = Sound.load(media as unknown as HTMLMediaElement);
    expect(media.loads).toBe(1); // kicks off loading (eg, preload="none")
    media.readyState = 4;
    media.dispatchEvent(new Event("canplaythrough"));
    const sound = await promise;
    expect(sound.playable).toBe(true);

    const partial = new FakeMedia();
    partial.readyState = 2; // already loading: no extra load() call
    const pending = Sound.load(partial as unknown as HTMLMediaElement);
    expect(partial.loads).toBe(0);
    partial.dispatchEvent(new Event("canplaythrough"));
    await pending;

    const broken = new FakeMedia();
    broken.readyState = 0;
    const rejection = Sound.load(broken as unknown as HTMLMediaElement);
    broken.dispatchEvent(new Event("error"));
    await expect(rejection).rejects.toThrow(/Error loading sound/);
  });

  it("loads from a url string with CORS set before src", async () => {
    vi.stubGlobal("Audio", FakeAudio);
    const promise = Sound.load("/song.mp3");
    const media = FakeAudio.created[0];
    expect(media.src).toBe("/song.mp3");
    expect(media.crossOrigin).toBe("anonymous");
    expect(media.loads).toBe(1);
    media.dispatchEvent(new Event("canplaythrough"));
    const sound = await promise;
    expect(sound.source).toBe(media);
    const node = sound.node;
    media.dispatchEvent(new Event("canplaythrough")); // repeated ready event is inert
    expect(sound.node).toBe(node);
  });

  it("keeps media position on a default start and ignores stop when idle", async () => {
    const media = new FakeMedia();
    const sound = await Sound.load(media as unknown as HTMLMediaElement);

    sound.stop(); // never started: nothing happens
    expect((sound.node as unknown as FakeNode).disconnects).toHaveLength(0);
    expect(media.paused).toBe(0);

    sound.start();
    expect(media.played).toBe(1);
    expect(media.currentTime).toBe(2);
  });

  it("creates, starts, seeks, and stops an audio buffer", () => {
    const sound = new Sound("file");
    expect(sound.playable).toBe(false);
    expect(sound.progress).toBe(0);
    sound.reset(); // safe with no node

    const buffer = { duration: 10 } as AudioBuffer;
    sound.buffer = buffer;
    expect(sound.buffer).toBe(buffer);
    sound.createBuffer(buffer);
    expect(sound.playable).toBe(true);
    expect(sound.progress).toBe(0); // not started yet

    sound.start(1);
    const node = sound.node as unknown as FakeBufferSource;
    expect(node.starts).toEqual([[0, 1]]); // seek offset, not a delay
    expect(sound.playing).toBe(true);
    expect(sound.progress).toBe(0.1); // (currentTime 5 - timestamp 4) / duration 10
    sound.stop();
    expect(node.stopped).toBe(1);
    expect(sound.playing).toBe(false);

    sound.createBuffer(); // re-use existing buffer
    expect((sound.node as unknown as FakeBufferSource).buffer).toBe(buffer);
    (sound.node as unknown as FakeBufferSource).onended();
    expect(sound.playing).toBe(false);
  });

  it("re-creates a used buffer node on start so replay and toggle work", () => {
    const sound = new Sound("file");
    sound.createBuffer({ duration: 10 } as AudioBuffer);
    sound.analyze(4);
    const ctx = sound.ctx as unknown as FakeAudioContext;
    sound.start();
    expect(ctx.createdBuffers).toHaveLength(1);
    sound.stop();
    sound.toggle(); // restart re-creates the one-shot node
    expect(ctx.createdBuffers).toHaveLength(2);
    const replay = sound.node as unknown as FakeBufferSource;
    expect(replay.connections.some((n) => n instanceof FakeAnalyser)).toBe(
      true,
    );
    expect(sound.playing).toBe(true);
  });

  it("skips the buffer node stop once playback has run past its end", () => {
    const sound = new Sound("file");
    sound.createBuffer({ duration: 10 } as AudioBuffer);
    sound.start();
    (sound.ctx as unknown as FakeAudioContext).currentTime = 500;
    expect(sound.progress).toBe(1); // clamped
    sound.stop();
    expect(sound.playing).toBe(false);
    expect((sound.node as unknown as FakeBufferSource).stopped).toBe(0);
  });

  it("loads and decodes a buffer via fetch", async () => {
    vi.stubGlobal("fetch", okFetch());
    const sound = await Sound.loadAsBuffer("/audio.bin");
    expect(sound.buffer.duration).toBe(4);
    expect(sound.node).toBeInstanceOf(FakeBufferSource);
  });

  it("rejects when the sound file request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 404 }),
    );
    await expect(Sound.loadAsBuffer("/missing.bin")).rejects.toThrow(
      /Error loading sound.*404/,
    );
  });

  it("rejects when audio data cannot be decoded", async () => {
    class FailingContext extends FakeAudioContext {
      decodeAudioData(): Promise<AudioBuffer> {
        return Promise.reject(new Error("bad data"));
      }
    }
    vi.stubGlobal("AudioContext", FailingContext);
    (Sound as any)._sharedContext = undefined;
    vi.stubGlobal("fetch", okFetch());
    await expect(Sound.loadAsBuffer("/audio.bin")).rejects.toThrow(
      /Error decoding audio/,
    );
  });
});

describe("Sound input", () => {
  it("opens, plays, and stops microphone streams with default constraints", async () => {
    const track = { stop: vi.fn() };
    const stream = {
      getAudioTracks: () => [track],
    } as unknown as MediaStream;
    const getUserMedia = vi.fn().mockResolvedValue(stream);
    vi.stubGlobal("navigator", { mediaDevices: { getUserMedia } });

    const sound = await Sound.input();
    expect(getUserMedia).toHaveBeenCalledWith({ audio: true, video: false });
    expect(sound.type).toBe("input");
    expect(sound.stream).toBe(stream);
    expect(sound.playable).toBe(true);
    expect(sound.progress).toBe(0);
    sound.start().stop();
    expect(track.stop).toHaveBeenCalledOnce();
  });

  it("rejects when microphone access fails", async () => {
    vi.stubGlobal("navigator", {
      mediaDevices: {
        getUserMedia: vi.fn().mockRejectedValue(new Error("denied")),
      },
    });
    await expect(
      Sound.input({ audio: { echoCancellation: true } }),
    ).rejects.toThrow("denied");
  });
});
