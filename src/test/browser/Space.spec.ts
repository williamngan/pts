import { afterEach, describe, expect, it, vi } from "vitest";

import { CanvasSpace } from "../../Canvas";
import { SVGSpace } from "../../Svg";
import { UIButton, UIDragger } from "../../UI";

function host() {
  const element = document.createElement("div");
  element.id = `space-host-${Math.random().toString(36).slice(2)}`;
  element.style.cssText =
    "position:absolute;left:10px;top:20px;width:200px;height:100px";
  document.body.appendChild(element);
  return element;
}

async function ready(space: CanvasSpace | SVGSpace) {
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
  it("keeps scheduling when the first real RAF timestamp is zero", async () => {
    const space = new CanvasSpace(host()).setup({ retina: false });
    await ready(space);
    let frame!: FrameRequestCallback;
    const request = vi
      .spyOn(window, "requestAnimationFrame")
      .mockImplementation((callback) => {
        frame = callback;
        return 1;
      });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
    const elapsed: number[] = [];
    space.add((_time, delta) => {
      elapsed.push(delta);
      space.play();
    });
    space.play();
    frame(0);
    expect(request).toHaveBeenCalledTimes(2);
    frame(16);
    expect(elapsed).toEqual([0, 0, 16]);
    space.dispose();
  });

  it("initializes elapsed time from the first real RAF after default play()", async () => {
    const space = new CanvasSpace(host()).setup({ retina: false });
    await ready(space);
    let frame!: FrameRequestCallback;
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      frame = callback;
      return 1;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
    const elapsed: number[] = [];
    space.add((_time, delta) => elapsed.push(delta));
    space.play();
    frame(50000);
    frame(50016);
    expect(elapsed).toEqual([0, 0, 16]);
    space.dispose();
  });

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
  it.each([
    { name: "Canvas", SpaceType: CanvasSpace },
    { name: "SVG", SpaceType: SVGSpace },
  ])(
    "uses current element coordinates after layout, scroll, and scale changes ($name)",
    async ({ SpaceType }) => {
      const container = document.createElement("div");
      container.style.cssText =
        "position:absolute;left:10px;top:20px;width:200px;height:100px";
      document.body.appendChild(container);
      const space = new SpaceType(container).setup({ resize: false });
      await ready(space);
      // Deliberately bind to an overlay whose position differs from the space.
      const overlay = document.createElement("div");
      document.body.appendChild(overlay);
      space.bindMouse(true, overlay).bindTouch(true, false, overlay).play(10);
      const action = vi.fn();
      space.add({ animate: () => {}, action });
      const move = () => {
        const rect = space.element.getBoundingClientRect();
        const clientX = rect.left + (20 * rect.width) / space.width;
        const clientY = rect.top + (30 * rect.height) / space.height;
        overlay.dispatchEvent(
          new PointerEvent("pointermove", { clientX, clientY }),
        );
        expect(Array.from(space.pointer)).toEqual([20, 30]);
        expect(action).toHaveBeenLastCalledWith(
          "move",
          20,
          30,
          expect.any(PointerEvent),
        );
        const touch = new Touch({
          identifier: 1,
          target: overlay,
          clientX,
          clientY,
          pageX: clientX + window.scrollX,
          pageY: clientY + window.scrollY,
        });
        const event = new TouchEvent("touchmove", {
          touches: [touch],
          changedTouches: [touch],
          targetTouches: [touch],
        });
        for (const list of [
          "touches",
          "changedTouches",
          "targetTouches",
        ] as const) {
          expect(
            space.touchesToPoints(event, list).map((p) => Array.from(p)),
          ).toEqual([[20, 30]]);
        }
        overlay.dispatchEvent(event);
        expect(Array.from(space.pointer)).toEqual([20, 30]);
      };
      try {
        move();
        container.style.top = "170px"; // no size change or resize callback
        move();
        container.style.transformOrigin = "top left";
        container.style.transform = "translate(30px, 40px) scale(2, 1.5)";
        move();
        document.body.style.minHeight = "3000px";
        window.scrollTo(0, 100);
        expect(window.scrollY).toBe(100);
        move();
        container.style.position = "fixed";
        move();
      } finally {
        space.dispose();
        window.scrollTo(0, 0);
        document.body.style.minHeight = "";
      }
    },
  );

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
    expect(p.x).toBeCloseTo(60 - space.outerBound.x!, 0);
    expect(p.y).toBeCloseTo(80 - space.outerBound.y!, 0);
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

describe("Space UI tracking", () => {
  it("can track again after removing all players without retaining old UIs", async () => {
    const space = new CanvasSpace(host());
    await ready(space);
    space.bindKeyboard().play(10);
    const first = UIButton.fromRectangle(
      [
        [0, 0],
        [50, 50],
      ],
      {},
    );
    const second = UIButton.fromRectangle(
      [
        [0, 0],
        [50, 50],
      ],
      {},
    );
    const firstAction = vi.fn();
    const secondAction = vi.fn();
    first.on("keydown", firstAction);
    second.on("keydown", secondAction);
    const send = () => document.dispatchEvent(new KeyboardEvent("keydown"));
    space.track(first);
    send();
    space.removeAll();
    space.track(second);
    send();
    expect(firstAction).toHaveBeenCalledOnce();
    expect(secondAction).toHaveBeenCalledOnce();
    space.removeAll().track(second);
    send();
    expect(secondAction).toHaveBeenCalledTimes(2);
    space.dispose();
  });

  it("ends an active drag when its dragger is untracked", async () => {
    const space = new CanvasSpace(host()).setup({ retina: false });
    await ready(space);
    space.bindMouse();
    space.play(10);
    const dragger = UIDragger.fromRectangle(
      [
        [0, 0],
        [50, 50],
      ],
      {},
    ) as UIDragger;
    const dropped = vi.fn();
    dragger.onDrop(dropped);
    space.track(dragger);
    // the host sits at (10, 20): client (40, 45) is space (30, 25)
    space.element.dispatchEvent(
      new PointerEvent("pointerdown", { clientX: 40, clientY: 45 }),
    );
    space.element.dispatchEvent(
      new PointerEvent("pointermove", { clientX: 45, clientY: 50 }),
    );
    expect(dragger.state("dragging")).toBe(true);

    space.untrack(dragger);
    expect(dragger.state("dragging")).toBe(false);
    expect(dropped).toHaveBeenCalledOnce();

    // re-tracking does not resume the old drag on the first move
    const moved = vi.fn();
    dragger.onDrag(moved);
    space.track(dragger);
    space.element.dispatchEvent(
      new PointerEvent("pointermove", { clientX: 50, clientY: 55 }),
    );
    expect(moved).not.toHaveBeenCalled();
    space.dispose();
  });

  it("stops a period after the frame it was requested on", async () => {
    const space = new CanvasSpace(host()).setup({ retina: false });
    await ready(space);
    let frames = 0;
    space.add(() => {
      frames++;
    });
    // frame timestamps are absolute; a 120 ms period must still mean 120 ms
    space.playOnce(120);
    await new Promise((resolve) => setTimeout(resolve, 60));
    expect(space.isPlaying).toBe(true);
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(space.isPlaying).toBe(false);
    expect(frames).toBeGreaterThan(2);

    // stop(0) still ends after the next frame
    const before = frames;
    space.replay();
    space.stop();
    await raf();
    await raf();
    await raf();
    expect(space.isPlaying).toBe(false);
    expect(frames - before).toBeLessThanOrEqual(2);
    space.dispose();
  });

  it("tracks UIs through space.track without manual wiring", async () => {
    const space = new CanvasSpace(host()).setup({ retina: false });
    await ready(space);
    space.bindMouse();
    space.play(10);

    const button = UIButton.fromRectangle(
      [
        [0, 0],
        [50, 50],
      ],
      {},
    ) as UIButton;
    space.track(button);

    const inside = new PointerEvent("pointermove", {
      clientX: 30,
      clientY: 40,
    });
    space.element.dispatchEvent(inside);
    expect(button.state("hover")).toBe(true);

    space.untrack(button);
    space.element.dispatchEvent(
      new PointerEvent("pointermove", { clientX: 500, clientY: 500 }),
    );
    expect(button.state("hover")).toBe(true); // no longer receiving events

    space.dispose();
  });
});
