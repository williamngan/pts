import { expect, it, vi } from "vitest";
import { MultiTouchSpace } from "../Space";
import { CanvasForm } from "../Canvas";
import { Bound, Pt } from "../Pt";

class HeadlessSpace extends MultiTouchSpace {
  constructor() {
    super();
    this._canvas = new EventTarget();
    this._isReady = this._playing = true;
    this.bound = new Bound(new Pt(10, 20), new Pt(110, 120));
  }
  resize(bound: Bound) {
    this.bound = bound;
    return this;
  }
  clear() {
    return this;
  }
  getForm() {
    return new CanvasForm();
  }
  dispatch(event: Event) {
    this._canvas.dispatchEvent(event);
  }
  unbind() {
    this._unbindAll();
  }
}

it("binds and dispatches input without DOM globals", () => {
  const space = new HeadlessSpace();
  const action = vi.fn();
  space.add({ animate() {}, action });
  space
    .bindMouse()
    .bindKeyboard()
    .bindDoc("unused", () => {});
  for (const type of ["pointerdown", "pointermove", "pointerup"])
    space.dispatch(
      Object.assign(new Event(type), {
        clientX: 15,
        clientY: 30,
        pointerId: 1,
      }),
    );
  expect(action).toHaveBeenCalledWith("drag", 5, 10, expect.any(Event));
  space.dispatch(
    Object.assign(new Event("keydown"), { shiftKey: true, altKey: false }),
  );
  expect(action).toHaveBeenCalledWith("keydown", 1, 0, expect.any(Event));
  space.unbind();
});
