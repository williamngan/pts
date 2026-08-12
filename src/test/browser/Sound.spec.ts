import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Sound } from "../../Play";
import { Group } from "../../Pt";

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
  starts: number[] = [];
  stopped = 0;

  start(time = 0) {
    this.starts.push(time);
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

  createMediaElementSource() {
    return new FakeNode();
  }

  createMediaStreamSource() {
    return new FakeNode();
  }

  decodeAudioData(_data: ArrayBuffer, success: (buffer: AudioBuffer) => void) {
    success({ duration: 4 } as AudioBuffer);
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
  duration = 10;
  currentTime = 2;
  readyState = 4;
  played = 0;
  paused = 0;

  play() {
    this.played++;
    return Promise.resolve();
  }

  pause() {
    this.paused++;
  }
}

beforeEach(() => {
  vi.stubGlobal("AudioContext", FakeAudioContext);
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

  it("generates, controls, analyzes, maps, connects, and resets a tone", () => {
    const sound = Sound.generate("sine", 440);
    expect(sound.type).toBe("gen");
    expect(sound.ctx).toBeInstanceOf(FakeAudioContext);
    expect(sound.node).toBeInstanceOf(FakeOscillator);
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
  });

  it("creates custom oscillators and exposes empty domains without analysis", () => {
    const wave = {} as PeriodicWave;
    const custom = Sound.generate("custom", wave);
    expect((custom.node as unknown as FakeOscillator).wave).toBe(wave);
    expect(custom.timeDomain()).toHaveLength(0);
    expect(custom.freqDomain()).toHaveLength(0);

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
    expect(from.frequency).toBe(0);
    from.frequency = 999;
  });
});

describe("Sound file and buffer sources", () => {
  it("loads media elements, tracks progress/end/error, and plays from an offset", async () => {
    const media = new FakeMedia();
    const promise = Sound.load(
      media as unknown as HTMLMediaElement,
      "use-credentials",
    );
    media.dispatchEvent(new Event("canplaythrough"));
    const sound = await promise;

    expect(sound.source).toBe(media);
    expect(sound.playable).toBe(true);
    expect(sound.progress).toBe(0.2);
    expect(media.autoplay).toBe(false);
    expect(media.crossOrigin).toBe("use-credentials");
    sound.start(3);
    expect(media.played).toBe(1);
    expect(media.currentTime).toBe(3);
    sound.stop();
    expect(media.paused).toBe(1);
    media.dispatchEvent(new Event("ended"));
    expect(sound.playing).toBe(false);

    const broken = new FakeMedia();
    const rejection = Sound.load(broken as unknown as HTMLMediaElement);
    broken.dispatchEvent(new Event("error"));
    await expect(rejection).rejects.toBe("Error loading sound");
  });

  it("creates, reuses, starts, and stops an audio buffer", () => {
    const sound = new Sound("file");
    const buffer = { duration: 10 } as AudioBuffer;
    sound.buffer = buffer;
    expect(sound.buffer).toBe(buffer);
    (sound as any).createBuffer(buffer);
    expect(sound.playable).toBe(true);
    sound.start(1);
    expect(sound.playing).toBe(true);
    expect(sound.progress).toBe(-0.1);
    sound.stop();
    expect(sound.playing).toBe(false);
    (sound as any).createBuffer(undefined);
    expect((sound.node as unknown as FakeBufferSource).buffer).toBe(buffer);
    (sound.node as unknown as FakeBufferSource).onended();
    expect(sound.playing).toBe(false);
  });

  it("loads and decodes an XMLHttpRequest buffer", async () => {
    class FakeRequest {
      responseType = "";
      response = new ArrayBuffer(2);
      onload: () => void;
      open = vi.fn();
      send = () => this.onload();
    }
    vi.stubGlobal("XMLHttpRequest", FakeRequest);
    const sound = await Sound.loadAsBuffer("/audio.bin");
    expect(sound.buffer.duration).toBe(4);
    expect(sound.node).toBeInstanceOf(FakeBufferSource);
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
    sound.start().stop();
    expect(track.stop).toHaveBeenCalledOnce();
  });

  it("returns null when microphone access fails", async () => {
    vi.stubGlobal("navigator", {
      mediaDevices: {
        getUserMedia: vi.fn().mockRejectedValue(new Error("no")),
      },
    });
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(
      Sound.input({ audio: { echoCancellation: true } }),
    ).resolves.toBeNull();
    expect(error).toHaveBeenCalledWith("Cannot get audio from input device.");
  });
});
