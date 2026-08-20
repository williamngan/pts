import { afterEach, describe, expect, it, vi } from "vitest";

import { CanvasSpace } from "../../Canvas";

const bounds = (width = 200, height = 100) =>
  ({
    x: 10,
    y: 20,
    top: 20,
    left: 10,
    right: 10 + width,
    bottom: 20 + height,
    width,
    height,
    toJSON: () => ({}),
  }) as DOMRect;

function host() {
  const element = document.createElement("div");
  element.id = `space-host-${Math.random().toString(36).slice(2)}`;
  element.getBoundingClientRect = () => bounds();
  document.body.appendChild(element);
  return element;
}

async function ready(space: CanvasSpace) {
  if (space.ready) return;
  await new Promise<void>((resolve) => {
    space.element.addEventListener("ready", () => resolve(), { once: true });
  });
}

const raf = () => new Promise((resolve) => requestAnimationFrame(resolve));

afterEach(() => {
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});

describe("Space animation loop", () => {
  it("keeps a single frame chain across repeated manual play calls", async () => {
    const space = new CanvasSpace(host()).setup({ retina: false });
    await ready(space);
    let frames = 0;
    space.add({ animate: () => frames++ });

    // manual calls with explicit timestamps each run one frame body...
    space.play(10);
    space.play(30);
    space.play(50);
    const manual = frames;
    expect(manual).toBeGreaterThan(0);

    // ...but must not stack parallel RAF chains: over N real frames the
    // counter advances about once per frame, not once per chain per frame
    const before = frames;
    const ticks = 5;
    for (let i = 0; i < ticks; i++) await raf();
    const growth = frames - before;
    expect(growth).toBeLessThanOrEqual(ticks + 2);

    // dispose silences the loop entirely
    space.dispose();
    const atDispose = frames;
    for (let i = 0; i < 3; i++) await raf();
    expect(frames).toBe(atDispose);
  });

  it("returns this from play and minFrameTime for chaining", async () => {
    const space = new CanvasSpace(host()).setup({ retina: false });
    await ready(space);
    expect(space.minFrameTime(0)).toBe(space);
    expect(space.play()).toBe(space);
    // calling play again while the loop is active must still chain
    expect(space.play()).toBe(space);
    space.dispose();
  });

  it("reports bounded frame times on first frame and across pause/resume", async () => {
    const space = new CanvasSpace(host()).setup({ retina: false });
    await ready(space);
    const ftimes: number[] = [];
    space.add({ animate: (_t, ft) => ftimes.push(ft) });

    // first frame at a large timestamp: ftime must not be the timestamp
    space.play(50000);
    expect(ftimes).toHaveLength(1);
    expect(ftimes[0]).toBe(0);

    space.play(50016);
    expect(ftimes[1]).toBeCloseTo(16, 5);

    // a long pause must not accumulate into the next resumed frame
    space.pause();
    space.play(50100);
    space.play(90000);
    space.resume();
    space.play(90016);
    const last = ftimes[ftimes.length - 1];
    expect(last).toBeLessThan(100);

    space.dispose();
  });
});

describe("MultiTouchSpace dispatch", () => {
  it("prevents default on non-passive touch but never on passive", async () => {
    const space = new CanvasSpace(host()).setup({ retina: false });
    await ready(space);
    space.play(10); // actions dispatch only while playing

    const dispatchTouch = (type: string) => {
      const evt = new TouchEvent(type, { cancelable: true });
      const spy = vi.spyOn(evt, "preventDefault");
      space.element.dispatchEvent(evt);
      return spy;
    };

    space.bindTouch(true, false);
    expect(dispatchTouch("touchstart").mock.calls.length).toBe(1);
    expect(dispatchTouch("touchmove").mock.calls.length).toBe(1);

    space.bindTouch(true, true); // rebind passive
    expect(dispatchTouch("touchstart").mock.calls.length).toBe(0);
    expect(dispatchTouch("touchmove").mock.calls.length).toBe(0);

    space.dispose();
  });

  it("tracks the pointer even with no players and passes keyboard flags", async () => {
    const space = new CanvasSpace(host()).setup({ retina: false });
    await ready(space);
    space.bindMouse();
    space.play(10);

    // no players: the pointer still tracks the event position
    space.element.dispatchEvent(
      new PointerEvent("pointermove", { clientX: 60, clientY: 80 }),
    );
    const p = space.pointer;
    expect(p.x).toBeCloseTo(60 - space.outerBound.x, 0);
    expect(p.y).toBeCloseTo(80 - space.outerBound.y, 0);
    expect(p.id).toBe("move");

    // keyboard actions receive shift/alt flags as x/y
    const actions: [string, number, number][] = [];
    space.add({
      animate: () => {},
      action: (type, x, y) => actions.push([type, x, y]),
    });
    space.bindKeyboard();
    document.dispatchEvent(new KeyboardEvent("keydown", { shiftKey: true }));
    document.dispatchEvent(new KeyboardEvent("keyup", { altKey: true }));
    expect(actions).toContainEqual(["keydown", 1, 0]);
    expect(actions).toContainEqual(["keyup", 0, 1]);

    space.dispose();
  });
});
