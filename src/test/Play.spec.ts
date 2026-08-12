import { describe, expect, it, vi } from "vitest";
import { Tempo } from "../Play";

class TestTempo extends Tempo {
  createID(listener) {
    return this._createID(listener);
  }
}

describe("Tempo", () => {
  it("converts between beats per minute and milliseconds", () => {
    const tempo = new Tempo(120);
    expect(tempo.bpm).toBe(120);
    expect(tempo.ms).toBe(500);
    tempo.bpm = 60;
    expect(tempo.ms).toBe(1000);
    tempo.ms = 400;
    expect(tempo.bpm).toBe(150);
    expect(tempo.ms).toBe(400);
    expect(Tempo.fromBeat(250).bpm).toBe(240);
  });

  it("runs start listeners at each fixed beat period", () => {
    const tempo = new Tempo(120);
    const start = vi.fn();
    const response = tempo.every(2);
    expect(response.start(start, 0, "start")).toBe(response);

    tempo.track(0);
    tempo.track(500);
    expect(start).not.toHaveBeenCalled();
    tempo.track(1001);
    expect(start).toHaveBeenLastCalledWith(1);
    tempo.track(2001);
    expect(start).toHaveBeenLastCalledWith(2);
    expect(start).toHaveBeenCalledTimes(2);

    tempo.stop("start");
    tempo.track(4000);
    expect(start).toHaveBeenCalledTimes(2);
    tempo.stop("missing");
  });

  it("cycles beat arrays and reports continuous progress", () => {
    const tempo = new Tempo(60);
    const progress = vi.fn();
    tempo.every([1, 2]).progress(progress, 100, "rhythm");

    tempo.track(0);
    expect(progress).toHaveBeenLastCalledWith(0, 0.101, 100, false);
    tempo.track(901);
    expect(progress).toHaveBeenLastCalledWith(1, 0.001, 1001, true);
    tempo.track(1900);
    expect(progress).toHaveBeenLastCalledWith(1, 0.5, 2000, false);
    tempo.track(2901);
    expect(progress).toHaveBeenLastCalledWith(3, 0.0005, 3001, true);
  });

  it("assigns generated or object-provided listener names", () => {
    const tempo = new Tempo(60);
    const first = vi.fn();
    const second = vi.fn();
    tempo.every(1).start(first);
    tempo.every(1).start(second);
    tempo.track(1001);
    expect(first).toHaveBeenCalledOnce();
    expect(second).toHaveBeenCalledOnce();
    const testTempo = new TestTempo(60);
    expect(testTempo.createID({ name: "named" })).toBe("named");
    expect(testTempo.createID({})).toBe("_b0");
  });

  it("removes listeners whose callback signals completion", () => {
    const tempo = new Tempo(60);
    const once = vi.fn(() => true);
    tempo.every(1).start(once, 0, "once");
    tempo.track(1001);
    tempo.track(2001);
    expect(once).toHaveBeenCalledOnce();
  });

  it("implements the Space player interface", () => {
    const tempo = new Tempo(60);
    const callback = vi.fn();
    tempo.every(1).progress(callback);
    tempo.animate(500, 16);
    expect(callback).toHaveBeenCalledOnce();
    expect(tempo.resize(null)).toBeUndefined();
    expect(tempo.action("move", 1, 2, null)).toBeUndefined();
  });
});
