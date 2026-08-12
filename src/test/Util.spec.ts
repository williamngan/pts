import { afterEach, describe, expect, it, vi } from "vitest";
import { Group, Pt } from "../Pt";
import { Num } from "../Num";
import { Const, Util } from "../Util";

afterEach(() => {
  Util.warnLevel("mute");
});

describe("Const", () => {
  it("exposes consistent angle and direction constants", () => {
    expect(Const.deg_to_rad * 180).toBeCloseTo(Math.PI);
    expect(Const.rad_to_deg * Math.PI).toBeCloseTo(180);
    expect(Const.two_pi).toBeCloseTo(Math.PI * 2);
    expect(Const.xy).toBe("xy");
    expect(Const.top_right).toBe(3);
    expect(Const.gravity).toBe(9.81);
  });
});

describe("Util arguments and warnings", () => {
  it.each([
    [[], []],
    [
      [1, 2, 3],
      [1, 2, 3],
    ],
    [[[4, 5, 6]], [4, 5, 6]],
    [[new Float32Array([7, 8])], [7, 8]],
    [[{ x: 1, y: 2, z: 3, w: 4 }], [1, 2, 3, 4]],
    [[{ x: 1, z: 3 }], [1]],
  ])("normalizes %j", (input, expected) => {
    expect(Util.getArgs(input)).toEqual(expected);
  });

  it("supports mute, console warning, and thrown-error policies", () => {
    expect(Util.warnLevel()).toBe("mute");
    expect(Util.warn("quiet", 42)).toBe(42);

    const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(Util.warnLevel("warn")).toBe("warn");
    expect(Util.warn("visible", "fallback")).toBe("fallback");
    expect(warning).toHaveBeenCalledWith("visible");

    Util.warnLevel("error");
    expect(() => Util.warn("broken")).toThrow("broken");
  });

  it("keeps the deprecated random integer helper deterministic", () => {
    vi.spyOn(Num, "random").mockReturnValue(0.49);
    expect(Util.randomInt(10, 3)).toBe(7);
  });
});

describe("Util collection helpers", () => {
  it("splits arrays using size, stride, partial, and loop-back policies", () => {
    const values = [1, 2, 3, 4, 5, 6, 7];
    expect(Util.split(values, 2)).toEqual([
      [1, 2],
      [3, 4],
      [5, 6],
    ]);
    expect(Util.split(values, 3, 1)).toHaveLength(5);
    expect(Util.split(values, 2, 3, true)).toEqual([
      [1, 2],
      [4, 5],
      [7, 1],
    ]);
    expect(Util.split(values, 2, 3, false, false)).toEqual([
      [1, 2],
      [4, 5],
      [7],
    ]);
    expect(Util.split([], 2)).toEqual([]);
    expect(Util.split(values, 2, -1)).toEqual([]);
  });

  it("flattens, combines, and zips collections", () => {
    const flatGroup = Util.flatten([[new Pt(1, 2)], [new Pt(3, 4)]]);
    expect(flatGroup).toBeInstanceOf(Group);
    expect(flatGroup.map((point) => point.toArray())).toEqual([
      [1, 2],
      [3, 4],
    ]);
    expect(Util.flatten([[1, 2], [3]], false)).toEqual([1, 2, 3]);
    expect(Util.combine([1, 2], [10, 20], (a, b) => a + b)).toEqual([
      11, 21, 12, 22,
    ]);
    expect(
      Util.zip([
        [1, 2],
        [3, 4],
        [5, 6],
      ]),
    ).toEqual([
      [1, 3, 5],
      [2, 4, 6],
    ]);
  });

  it("steps and maps ranges with explicit starts and strides", () => {
    const callback = vi.fn();
    const next = Util.stepper(5, 1, 2, callback);
    expect([next(), next(), next(), next()]).toEqual([3, 1, 3, 1]);
    expect(callback).toHaveBeenCalledTimes(4);

    const values = Util.forRange((index) => index * 2, 7, 1, 2);
    expect(values[1]).toBe(2);
    expect(values[3]).toBe(6);
    expect(values[5]).toBe(10);
  });

  it("validates arrays and accepts arbitrary iterables", () => {
    const warning = vi.spyOn(Util, "warn").mockReturnValue(undefined);
    expect(Util.arrayCheck([new Pt()], 2)).toBe(false);
    expect(warning).toHaveBeenCalledOnce();
    expect(Util.arrayCheck(new Set([new Pt()]), 2)).toBe(true);
    expect(Util.iterToArray(new Set([1, 2]))).toEqual([1, 2]);
    const array = [1, 2];
    expect(Util.iterToArray(array)).toBe(array);
  });
});

describe("Util platform helpers", () => {
  class FakeRequest {
    static instance: FakeRequest;
    status = 200;
    responseText = "ok";
    onload?: () => void;
    onerror?: () => void;
    open = vi.fn();
    send = vi.fn();

    constructor() {
      FakeRequest.instance = this;
    }
  }

  it("reports successful, server-error, and network-error requests", () => {
    vi.stubGlobal("XMLHttpRequest", FakeRequest);
    const callback = vi.fn();
    Util.load("/data", callback);
    const request = FakeRequest.instance;
    expect(request.open).toHaveBeenCalledWith("GET", "/data", true);
    request.onload?.();
    expect(callback).toHaveBeenLastCalledWith("ok", true);

    request.status = 500;
    request.onload?.();
    expect(callback).toHaveBeenLastCalledWith(
      'Server error (500) when loading "/data"',
      false,
    );

    request.onerror?.();
    expect(callback).toHaveBeenLastCalledWith("Unknown network error", false);
  });

  it("calculates a rolling frame-time average", () => {
    const now = vi
      .spyOn(Date, "now")
      .mockReturnValueOnce(100)
      .mockReturnValueOnce(110)
      .mockReturnValueOnce(130)
      .mockReturnValueOnce(160);
    const measure = Util.performance(3);
    expect(measure()).toBe(10);
    expect(measure()).toBe(15);
    expect(measure()).toBe(25);
    expect(now).toHaveBeenCalledTimes(4);
  });

  it("detects common mobile agents", () => {
    vi.stubGlobal("navigator", { userAgent: "Mozilla Android" });
    expect(Util.isMobile()).toBe(true);
    vi.stubGlobal("navigator", { userAgent: "Desktop Firefox" });
    expect(Util.isMobile()).toBe(false);
  });

  it("creates crypto and time-based identifiers", () => {
    vi.stubGlobal("crypto", { randomUUID: () => "fixed-uuid" });
    expect(Util.uniqueId(true)).toBe("fixed-uuid");

    vi.spyOn(Date, "now").mockReturnValue(1234);
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    expect(Util.uniqueId()).toBe("yai");
  });
});
