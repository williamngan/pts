import { describe, expect, it, vi } from "vitest";
import { Sound, Tempo } from "../Play";

describe("Sound in a non-browser environment", () => {
  it("reports missing Web Audio support when there is no window", () => {
    expect(() => new Sound("gen")).toThrow(/doesn't support Web Audio/);
  });
});

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
    tempo.ms = 450; // ms is preserved exactly; bpm may be fractional
    expect(tempo.ms).toBe(450);
    expect(tempo.bpm).toBeCloseTo(133.333, 3);
    expect(Tempo.fromBeat(250).bpm).toBe(240);
  });

  it("runs start listeners at the first tick and each fixed beat period", () => {
    const tempo = new Tempo(120);
    const start = vi.fn();
    const response = tempo.every(2);
    expect(response.start(start, 0, "start")).toBe(response);

    tempo.track(0);
    expect(start).toHaveBeenLastCalledWith(0);
    tempo.track(500);
    expect(start).toHaveBeenCalledTimes(1);
    tempo.track(1001);
    expect(start).toHaveBeenLastCalledWith(1);
    tempo.track(2001);
    expect(start).toHaveBeenLastCalledWith(2);
    expect(start).toHaveBeenCalledTimes(3);

    tempo.stop("start");
    tempo.track(4000);
    expect(start).toHaveBeenCalledTimes(3);
    tempo.stop("missing");
  });

  it("cycles beat arrays with monotonic counts and continuous progress", () => {
    const tempo = new Tempo(60);
    const progress = vi.fn();
    tempo.every([1, 2]).progress(progress, 100, "rhythm");

    tempo.track(0);
    expect(progress).toHaveBeenLastCalledWith(0, 0.1, 100, true);
    tempo.track(901);
    expect(progress).toHaveBeenLastCalledWith(1, 0.001, 1001, true);
    tempo.track(1900);
    expect(progress).toHaveBeenLastCalledWith(1, 0.5, 2000, false);
    tempo.track(2901);
    expect(progress).toHaveBeenLastCalledWith(2, 0.0005, 3001, true);
  });

  it("assigns generated listener names", () => {
    const tempo = new Tempo(60);
    const first = vi.fn();
    const second = vi.fn();
    tempo.every(1).start(first);
    tempo.every(1).start(second);
    tempo.track(0);
    expect(first).toHaveBeenCalledOnce();
    expect(second).toHaveBeenCalledOnce();
  });

  it("removes listeners whose callback signals completion", () => {
    const tempo = new Tempo(60);
    const once = vi.fn(() => true);
    tempo.every(1).start(once, 0, "once");
    tempo.track(1001);
    tempo.track(2001);
    expect(once).toHaveBeenCalledOnce();
  });

  it("defaults the count for hand-built listeners that omit it", () => {
    const tempo = new Tempo(60);
    const fresh = vi.fn();
    const midway = vi.fn();
    (tempo as any)._listeners["fresh"] = {
      name: "fresh",
      beats: 1,
      period: 1,
      index: 0,
      offset: 0,
      duration: -1,
      continuous: false,
      fn: fresh,
    };
    (tempo as any)._listeners["midway"] = {
      name: "midway",
      beats: 1,
      period: 1,
      index: 0,
      offset: 0,
      duration: 0,
      continuous: false,
      fn: midway,
    };
    tempo.track(1001);
    expect(fresh).toHaveBeenLastCalledWith(0); // first tick, not NaN
    expect(midway).toHaveBeenLastCalledWith(1); // rollover from omitted count
  });

  it("skips inherited keys in the listener map", () => {
    const tempo = new Tempo(60);
    const own = vi.fn();
    const ghost = vi.fn();
    tempo.every(1).start(own, 0, "own");
    const listeners = (tempo as any)._listeners;
    (tempo as any)._listeners = Object.assign(
      Object.create({
        ghost: {
          name: "ghost",
          beats: 1,
          period: 1,
          index: 0,
          offset: 0,
          duration: -1,
          count: 0,
          continuous: false,
          fn: ghost,
        },
      }),
      listeners,
    );
    tempo.track(1001);
    expect(own).toHaveBeenCalledOnce();
    expect(ghost).not.toHaveBeenCalled();
  });

  it("implements the Space player interface", () => {
    const tempo = new Tempo(60);
    const callback = vi.fn();
    tempo.every(1).progress(callback);
    tempo.animate(500, 16);
    expect(callback).toHaveBeenCalledOnce();
    expect(tempo.resize(null!)).toBeUndefined();
    expect(tempo.action("move", 1, 2, null!)).toBeUndefined();
  });
});
