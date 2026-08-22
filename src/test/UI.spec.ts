import { describe, expect, it, vi } from "vitest";

import { Group, Pt } from "../Pt";
import {
  UI,
  UIButton,
  UIDragger,
  UIPointerActions as Action,
  UIShape,
} from "../UI";

const evt = {} as MouseEvent;
const rect = () => [
  [0, 0],
  [10, 10],
];

describe("UI", () => {
  it("constructs every supported shape and copies another UI", () => {
    const rectangle = UI.fromRectangle(rect(), { selected: true }, "rect");
    const circle = UI.fromCircle(
      [
        [5, 5],
        [4, 4],
      ],
      {},
      "circle",
    );
    const polygon = UI.fromPolygon(
      [
        [0, 0],
        [10, 0],
        [0, 10],
      ],
      {},
      "polygon",
    );
    const copy = UI.fromUI(rectangle, undefined, "copy");

    expect([rectangle.shape, circle.shape, polygon.shape]).toEqual([
      UIShape.rectangle,
      UIShape.circle,
      UIShape.polygon,
    ]);
    expect([
      rectangle.listen("hit", [5, 5], evt),
      copy.state("selected"),
    ]).toEqual([false, true]);
    expect(circle.group).toBeInstanceOf(Group);
  });

  it("exposes mutable identity, group, shape, state, rendering, and text", () => {
    const ui = UI.fromRectangle(rect(), {}, "first");
    const next = new Group(new Pt(1, 1), new Pt(2, 2));
    ui.id = "next";
    ui.group = next;
    ui.shape = UIShape.circle;

    expect(ui.id).toBe("next");
    expect(ui.group).toBe(next);
    expect(ui.shape).toBe(UIShape.circle);
    expect(ui.state("")).toBeNull();
    expect(ui.state("enabled", false)).toBe(ui);
    expect(ui.state("enabled")).toBe(false);
    const render = vi.fn();
    ui.render(render);
    expect(render).toHaveBeenCalledWith(next, { enabled: false });
    expect(ui.toString()).toContain("UI ");
  });

  it("registers, triggers, holds, tracks, and removes handlers", () => {
    const ui = UI.fromRectangle(rect(), {});
    const hit = vi.fn();
    const all = vi.fn();
    const hitID = ui.on(Action.move, hit);
    ui.on(Action.all, all);

    expect(ui.listen(Action.move, [5, 5], evt)).toBe(true);
    expect(hit).toHaveBeenCalledOnce();
    expect(ui.listen(Action.move, [20, 20], evt)).toBe(true);
    // "all" observes every event: the within move and the outside move
    expect(all).toHaveBeenCalledTimes(2);

    UI.track([ui], Action.move, [2, 2], evt);
    expect(hit).toHaveBeenCalledTimes(2);
    expect(ui.off(Action.move, 99)).toBe(false);
    expect(ui.off("missing")).toBe(false);
    expect(ui.off(Action.move, hitID)).toBe(true);
    expect(ui.off(Action.all)).toBe(true);
    expect(ui.listen(Action.move, [2, 2], evt)).toBe(true);
    expect(ui.on(Action.up, undefined!)).toBe(-1);
  });

  it("rejects points for unregistered shapes", () => {
    const ui = new UI(rect(), "unregistered-shape");
    const fn = vi.fn();
    ui.on(Action.down, fn);
    expect(ui.listen(Action.down, [1, 1], evt)).toBe(false);
    expect(fn).not.toHaveBeenCalled();
  });
});

describe("UIButton", () => {
  it("counts clicks and dispatches click/context-menu helpers", () => {
    const button = UIButton.fromRectangle(rect(), {}) as UIButton;
    const click = vi.fn();
    const context = vi.fn();
    const clickID = button.onClick(click);
    const contextID = button.onContextMenu(context);

    button.listen(Action.up, [5, 5], evt);
    button.listen(Action.contextmenu, [5, 5], evt);
    expect(button.state("clicks")).toBe(1);
    expect(click).toHaveBeenCalledOnce();
    expect(context).toHaveBeenCalledOnce();
    expect(button.offClick(clickID)).toBe(true);
    expect(button.offContextMenu(contextID)).toBe(true);
  });

  it("fires hover enter and leave while tracking movement outside", () => {
    const button = UIButton.fromRectangle(rect(), {}) as UIButton;
    const enter = vi.fn();
    const leave = vi.fn();
    const ids = button.onHover(enter, leave);

    button.listen(Action.move, [5, 5], evt);
    expect(button.state("hover")).toBe(true);
    expect(enter).toHaveBeenCalledOnce();
    button.listen(Action.move, [20, 20], evt);
    expect(button.state("hover")).toBe(false);
    expect(leave).toHaveBeenCalledOnce();
    expect(button.offHover(ids[0], ids[1])).toEqual([true, true]);
    expect(button.offHover(-1, -1)).toEqual([false, false]);
  });
});

describe("UIDragger", () => {
  it("tracks a drag outside its bounds and emits drag/drop events", () => {
    const dragger = UIDragger.fromRectangle(rect(), {}) as UIDragger;
    const drag = vi.fn();
    const drop = vi.fn();
    const dragID = dragger.onDrag(drag);
    const dropID = dragger.onDrop(drop);

    dragger.listen(Action.down, [2, 3], evt);
    expect(dragger.state("dragging")).toBe(true);
    expect(Array.from(dragger.state("offset"))).toEqual([2, 3]);
    dragger.listen(Action.move, [20, 30], evt);
    expect(drag).toHaveBeenCalledOnce();
    expect(dragger.state("moved")).toBe(true);
    dragger.listen(Action.drop, [20, 30], evt);
    expect(drop).toHaveBeenCalledOnce();
    expect(dragger.state("dragging")).toBe(false);
    expect(dragger.state("moved")).toBe(false);
    expect(dragger.offDrag(dragID)).toBe(true);
    expect(dragger.offDrop(dropID)).toBe(true);
  });

  it("ends cleanly on a simple pointer-up or pointer-out", () => {
    const dragger = UIDragger.fromRectangle(rect(), {}) as UIDragger;
    dragger.listen(Action.down, [1, 1], evt);
    dragger.listen(Action.up, [1, 1], evt);
    expect(dragger.state("dragging")).toBe(false);

    dragger.listen(Action.down, [1, 1], evt);
    dragger.listen(Action.out, [1, 1], evt);
    expect(dragger.state("dragging")).toBe(false);
  });
});

describe("UI correctness pins", () => {
  it("keeps handler ids stable across removals", () => {
    const u = UI.fromRectangle(rect(), {});
    const calls: string[] = [];
    const idA = u.on("move", () => calls.push("A"));
    const idB = u.on("move", () => calls.push("B"));
    expect(u.off("move", idA)).toBe(true);
    expect(u.off("move", idB)).toBe(true);
    u.listen("move", new Pt(5, 5), evt);
    expect(calls).toEqual([]);

    // re-registering after removals still dispatches
    u.on("move", () => calls.push("C"));
    u.listen("move", new Pt(5, 5), evt);
    expect(calls).toEqual(["C"]);
  });

  it("fires 'all' handlers for every event, standalone or alongside types", () => {
    const u = UI.fromRectangle(rect(), {});
    const seen: string[] = [];
    u.on("all", (t, p, type) => seen.push(`all:${type}`));
    u.listen("move", new Pt(5, 5), evt);
    u.listen("down", new Pt(500, 500), evt); // outside, still reported
    expect(seen).toEqual(["all:move", "all:down"]);

    u.on("move", () => seen.push("move"));
    u.listen("move", new Pt(5, 5), evt);
    // type handlers first, then the "all" observers
    expect(seen.slice(2)).toEqual(["move", "all:move"]);
  });

  it("delivers the current position to hover leave handlers", () => {
    const b = UIButton.fromRectangle(rect(), {}) as UIButton;
    const positions: { enter?: number[]; leave?: number[] } = {};
    b.onHover(
      (t, pt) => (positions.enter = [pt[0], pt[1]]),
      (t, pt) => (positions.leave = [pt[0], pt[1]]),
    );
    b.listen("move", new Pt(2, 3), evt);
    b.listen("move", new Pt(500, 600), evt);
    expect(positions.enter).toEqual([2, 3]);
    expect(positions.leave).toEqual([500, 600]);
    expect(b.state("hover")).toBe(false);
  });

  it("renders a readable toString", () => {
    const u = UI.fromRectangle(rect(), {}, "pin-id");
    expect(u.toString()).not.toContain("{");
    expect(u.toString()).toContain("UI");
  });

  it("isolates states in fromUI copies", () => {
    const base = UI.fromRectangle(rect(), { n: 1 });
    const copy = UI.fromUI(base);
    copy.state("n", 99);
    expect(base.state("n")).toBe(1);
    expect(copy.state("n")).toBe(99);
  });

  it("runs a full drag scenario through listen()", () => {
    const d = UIDragger.fromRectangle(rect(), {}) as UIDragger;
    let drags = 0;
    let drops = 0;
    d.onDrag(() => drags++);
    d.onDrop(() => drops++);

    // click without moving: no uidrop
    d.listen("down", new Pt(5, 5), evt);
    d.listen("up", new Pt(5, 5), evt);
    expect(drops).toBe(0);
    expect(d.state("dragging")).toBe(false);

    // drag inside, outside (held), then drop
    d.listen("down", new Pt(5, 5), evt);
    expect(d.state("dragging")).toBe(true);
    d.listen("move", new Pt(8, 8), evt);
    d.listen("move", new Pt(300, 300), evt); // outside but held
    expect(drags).toBe(2);
    d.listen("drop", new Pt(300, 300), evt);
    expect(drops).toBe(1);
    expect(d.state("dragging")).toBe(false);
    expect(d.state("moved")).toBe(false);
  });
});

describe("UI API modernization", () => {
  it("supports once and AbortSignal options on handlers", () => {
    const u = UI.fromRectangle(rect(), {});
    let onceCount = 0;
    u.on("move", () => onceCount++, { once: true });
    u.listen("move", new Pt(5, 5), evt);
    u.listen("move", new Pt(5, 5), evt);
    expect(onceCount).toBe(1);

    const ac = new AbortController();
    let signaled = 0;
    u.on("move", () => signaled++, { signal: ac.signal });
    u.listen("move", new Pt(5, 5), evt);
    ac.abort();
    u.listen("move", new Pt(5, 5), evt);
    expect(signaled).toBe(1);

    // an already-aborted signal registers nothing
    const dead = new AbortController();
    dead.abort();
    let never = 0;
    u.on("move", () => never++, { signal: dead.signal });
    u.listen("move", new Pt(5, 5), evt);
    expect(never).toBe(0);
  });

  it("hit-tests line and polyline shapes and supports custom shapes", () => {
    const line = new UI(
      [
        [0, 0],
        [100, 0],
      ],
      UIShape.line,
    );
    let hits = 0;
    line.on("move", () => hits++);
    line.listen("move", new Pt(50, 3), evt); // within default threshold 5
    line.listen("move", new Pt(50, 30), evt); // beyond
    expect(hits).toBe(1);

    const poly = new UI(
      [
        [0, 0],
        [100, 0],
        [100, 100],
      ],
      UIShape.polyline,
      { lineThreshold: 10 },
    );
    let polyHits = 0;
    poly.on("move", () => polyHits++);
    poly.listen("move", new Pt(100, 50), evt); // near second segment
    poly.listen("move", new Pt(50, 50), evt); // far from both
    expect(polyHits).toBe(1);

    UI.registerShape("everywhere", () => true);
    const custom = new UI([[0, 0]], "everywhere");
    let customHits = 0;
    custom.on("move", () => customHits++);
    custom.listen("move", new Pt(9999, 9999), evt);
    expect(customHits).toBe(1);
  });

  it("keeps built-in machinery when a type's handlers are cleared", () => {
    const b = UIButton.fromRectangle(rect(), {}) as UIButton;
    b.onClick(() => {});
    b.off("up"); // clears user click handlers
    b.listen("up", new Pt(5, 5), evt);
    // the internal click counter still works
    expect(b.state("clicks")).toBe(1);

    const d = UIDragger.fromRectangle(rect(), {}) as UIDragger;
    d.off("down");
    d.off("up");
    d.listen("down", new Pt(5, 5), evt);
    expect(d.state("dragging")).toBe(true);
    d.listen("up", new Pt(5, 5), evt);
    expect(d.state("dragging")).toBe(false);
  });

  it("provides typed getState and setState", () => {
    const u = UI.fromRectangle(rect(), { n: 1 });
    expect(u.getState<number>("n")).toBe(1);
    expect(u.setState("n", 2)).toBe(u);
    expect(u.getState<number>("n")).toBe(2);
    u.setState("maybe", undefined);
    expect(u.getState("maybe")).toBeUndefined();
  });
});
