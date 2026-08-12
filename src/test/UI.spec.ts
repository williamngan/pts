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
    expect(all).toHaveBeenCalledOnce();

    UI.track([ui], Action.move, [2, 2], evt);
    expect(hit).toHaveBeenCalledTimes(2);
    expect(ui.off(Action.move, 99)).toBe(false);
    expect(ui.off("missing")).toBe(false);
    expect(ui.off(Action.move, hitID)).toBe(true);
    expect(ui.off(Action.all)).toBe(true);
    expect(ui.listen(Action.move, [2, 2], evt)).toBe(true);
    expect(ui.on(Action.up, undefined)).toBe(-1);
  });

  it("rejects points for unsupported shapes", () => {
    const ui = new UI(rect(), UIShape.line);
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
