/*! Pts.js is licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */

import { Pt, Group } from "./Pt";
import { Rectangle, Circle, Polygon } from "./Op";
import {
  type UIHandler,
  type UIActionEvent,
  type GroupLike,
  type PtLike,
  type PtLikeIterable,
} from "./Types";

/** A hit-test function for a UI shape: given the UI's group, a point, and the UI's states, return whether the point is within the shape. */
export type UIShapeTest = (
  group: Group,
  pt: PtLike,
  states: { [key: string]: any },
) => boolean;

function _withinSegment(
  a: PtLike,
  b: PtLike,
  pt: PtLike,
  threshold: number,
): boolean {
  if (threshold < 0) return false;
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const lengthSq = dx * dx + dy * dy;
  const t =
    lengthSq === 0
      ? 0
      : Math.max(
          0,
          Math.min(1, ((pt[0] - a[0]) * dx + (pt[1] - a[1]) * dy) / lengthSq),
        );
  const px = pt[0] - a[0] - t * dx;
  const py = pt[1] - a[1] - t * dy;
  return px * px + py * py <= threshold * threshold;
}

// Shape hit tests, keyed by shape name. Extensible via `UI.registerShape`.
const _shapeTests: { [key: string]: UIShapeTest } = {
  rectangle: (group, pt) => Rectangle.withinBound(group, pt),
  circle: (group, pt) => Circle.withinBound(group, pt),
  polygon: (group, pt) => Polygon.hasIntersectPoint(group, pt),
  line: (group, pt, states) => {
    const threshold = states.lineThreshold ?? 5;
    return (
      group.length >= 2 && _withinSegment(group[0], group[1], pt, threshold)
    );
  },
  polyline: (group, pt, states) => {
    const threshold = states.lineThreshold ?? 5;
    for (let i = 0, len = group.length - 1; i < len; i++) {
      if (_withinSegment(group[i], group[i + 1], pt, threshold)) return true;
    }
    return false;
  },
};

/**
 * **[Experimental]** A set of string constatns to represent different UI types, for use in [`UI`](#link) instances.
 */
export const UIShape = {
  rectangle: "rectangle",
  circle: "circle",
  polygon: "polygon",
  polyline: "polyline",
  line: "line",
};

/**
 * **[Experimental]** A set of string constants to represent different UI event types.
 */
export const UIPointerActions = {
  up: "up",
  down: "down",
  move: "move",
  drag: "drag",
  uidrag: "uidrag",
  drop: "drop",
  uidrop: "uidrop",
  over: "over",
  out: "out",
  enter: "enter",
  leave: "leave",
  click: "click",
  keydown: "keydown",
  keyup: "keyup",
  pointerdown: "pointerdown",
  pointerup: "pointerup",
  contextmenu: "contextmenu",
  all: "all",
} as const;

/** A known pointer, touch, or keyboard action dispatched by a Pts space. */
export type UIPointerAction =
  (typeof UIPointerActions)[keyof typeof UIPointerActions];

/**
 * **[Experimental]** An abstract class that represents an UI element. It wraps a [`Group`](#link) and supports UI event handling.
 * Extend this class to create custom UI elements.
 */
export class UI {
  private _abortCleanup: { [type: string]: Map<number, () => void> } = {};
  _group: Group;
  _shape: string;

  protected static _counter: number = 0;
  protected _id: string;
  protected _actions: { [type: string]: (UIHandler | null)[] };
  // built-in machinery (UIButton hover, UIDragger drag) registers here, so
  // public `off(type)` cannot remove it along with user handlers
  protected _sysActions: { [type: string]: (UIHandler | null)[] };
  protected _states: { [key: string]: any };

  protected _holds = new Map<number, string>();

  /**
   * Create an UI element. You may also create a new UI using one of the static helper like [`UI.fromRectangle`](#link) or [`UI.fromCircle`](#link).
   * @param group a Group or an Iterable<PtLike> that defines the UI's appearance
   * @param shape specifies the shape of the Group
   * @param states optional a state object keep track of custom states for this UI
   * @param id optional id string
   */
  constructor(
    group: PtLikeIterable,
    shape: string,
    states: { [key: string]: any } = {},
    id?: string,
  ) {
    this._group = Group.fromArray(group);
    this._shape = shape;
    this._id = id === undefined ? `ui_${UI._counter++}` : id;
    this._states = states;
    this._actions = {};
    this._sysActions = {};
  }

  /**
   * Register a custom shape hit test, or override a built-in one. The shape
   * name can then be used when constructing a UI.
   * @param shape shape name
   * @param fn a function `(group, pt, states) => boolean` that returns whether the point hits the shape
   */
  static registerShape(shape: string, fn: UIShapeTest): void {
    _shapeTests[shape] = fn;
  }

  /**
   * A static helper function to create a Rectangle UI.
   * @param group a Group or an Iterable<PtLike> with 2 Pt representing a rectangle
   * @param states optional a state object keep track of custom states for this UI
   * @param id optional id string
   */
  static fromRectangle(group: PtLikeIterable, states: {}, id?: string): UI {
    return new this(group, UIShape.rectangle, states, id);
  }

  /**
   * A static helper function to create a Circle UI.
   * @param group a Group or an Iterable<PtLike> with 2 Pt representing a circle
   * @param states optional a state object keep track of custom states for this UI
   * @param id optional id string
   */
  static fromCircle(group: PtLikeIterable, states: {}, id?: string): UI {
    return new this(group, UIShape.circle, states, id);
  }

  /**
   * A static helper function to create a Polygon UI.
   * @param group a Group or an Iterable<PtLike> representing a polygon
   * @param states optional a state object keep track of custom states for this UI
   * @param id optional id string
   */
  static fromPolygon(group: PtLikeIterable, states: {}, id?: string): UI {
    return new this(group, UIShape.polygon, states, id);
  }

  /**
   * A static helper function to create a new UI based on another UI.
   * @param ui base UI
   * @param states optional a state object keep track of custom states for this UI
   */
  static fromUI(ui: UI, states?: object, id?: string): UI {
    // copy the source states so the new UI doesn't share mutations
    return new this(ui.group, ui.shape, states || { ...ui._states }, id);
  }

  /**
   * An unique id of the UI.
   */
  get id(): string {
    return this._id;
  }
  set id(d: string) {
    this._id = d;
  }

  /**
   * A group of Pts that defines this UI's shape.
   */
  get group(): Group {
    return this._group;
  }
  set group(d: Group) {
    this._group = d;
  }

  /**
   * A string that describes this UI's shape.
   */
  get shape(): string {
    return this._shape;
  }
  set shape(d: string) {
    this._shape = d;
  }

  /**
   * Get and/or set a specific UI state.
   * @param key state's name
   * @param value optionally set a new value for this state.key
   * @returns If `value` is changed, return this instance. Otherwise, return the value of the specific key.
   */
  state(key: string, value?: any): any {
    if (!key) return null;
    if (value !== undefined) {
      this._states[key] = value;
      return this;
    }
    return this._states[key];
  }

  /**
   * Get a specific UI state. Unlike [`UI.state`](#link), this is a plain typed getter.
   * @param key state's name
   */
  getState<T = any>(key: string): T {
    return this._states[key];
  }

  /**
   * Set a specific UI state. Unlike [`UI.state`](#link), this can also store `undefined`.
   * @param key state's name
   * @param value the value to set
   */
  setState(key: string, value: any): this {
    this._states[key] = value;
    return this;
  }

  /**
   * Add an event handler. Remember this UI will also need to be tracked for events, via `UI.track` or [`MultiTouchSpace.track`](#link).
   * @param type event type, either one of [`UIPointerActions`](#link) or a custom type
   * @param fn a [`UIHandler`](#link) callback function: `fn( target:UI, pt:Pt, type:string, evt:MouseEvent )`
   * @param options optionally `{ once }` to remove the handler after its first call, and/or `{ signal }` with an [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) that removes it on abort (an already-aborted signal registers nothing)
   * @returns an id number that reference to this handler, for use in [`UI.off`](#link), or -1 if nothing was registered
   */
  on(
    type: UIPointerAction | (string & {}),
    fn: UIHandler,
    options?: { once?: boolean; signal?: AbortSignal },
  ): number {
    if (!fn) return -1;
    if (options?.signal?.aborted) return -1;
    if (!this._actions[type]) this._actions[type] = [];

    let handler = fn;
    let id = -1;
    if (options?.once) {
      handler = (t, p, ty, e) => {
        this.off(type, id);
        fn(t, p, ty, e);
      };
    }
    id = UI._addHandler(this._actions[type], handler);
    if (options?.signal) {
      const signal = options.signal;
      const abort = () => this.off(type, id);
      signal.addEventListener("abort", abort, { once: true });
      if (!this._abortCleanup[type]) this._abortCleanup[type] = new Map();
      this._abortCleanup[type].set(id, () =>
        signal.removeEventListener("abort", abort),
      );
    }
    return id;
  }

  /**
   * Remove an event handler.
   * @param type event type
   * @param which an ID number returned by [`UI.on`](#link). If this is not defined, all handlers in this type will be removed (built-in machinery like UIButton's click counting is unaffected). Note that after removal an id is stale — removing it twice may affect a handler that has since reused the slot.
   */
  off(type: UIPointerAction | (string & {}), which?: number): boolean {
    if (!this._actions[type]) return false;
    if (which === undefined) {
      this._abortCleanup[type]?.forEach((cleanup) => cleanup());
      delete this._abortCleanup[type];
      delete this._actions[type];
      return true;
    } else {
      this._abortCleanup[type]?.get(which)?.();
      this._abortCleanup[type]?.delete(which);
      return UI._removeHandler(this._actions[type], which);
    }
  }

  /**
   * Listen for UI events and trigger action handlers.
   * @param type an action type. Can be one of UIPointerActions or a custom one.
   * @param p a point to check
   * @param evt a MouseEvent emitted by the browser (See [MDN docs](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent))
   */
  listen(
    type: UIPointerAction | (string & {}),
    p: PtLike,
    evt: UIActionEvent,
  ): boolean {
    let fired = false;
    const userActions = this._actions[type];
    const sysActions = this._sysActions[type];

    if (userActions || sysActions) {
      if (this._within(p) || this._holdsType(type)) {
        if (sysActions) {
          UI._trigger(sysActions, this, p, type, evt);
          fired = true;
        }
        if (userActions) {
          UI._trigger(userActions, this, p, type, evt);
          fired = true;
        }
      }
    }

    // "all" handlers observe every event, regardless of position
    if (this._actions["all"]) {
      UI._trigger(this._actions["all"], this, p, type, evt);
      fired = true;
    }

    return fired;
  }

  /** Check whether an action type is currently held, without allocating. */
  private _holdsType(type: string): boolean {
    for (const held of this._holds.values()) {
      if (held === type) return true;
    }
    return false;
  }

  /** Register a built-in handler unaffected by public `off`. */
  protected _sysOn(type: string, fn: UIHandler): number {
    if (!this._sysActions[type]) this._sysActions[type] = [];
    return UI._addHandler(this._sysActions[type], fn);
  }

  /** Remove a built-in handler registered with `_sysOn`. */
  protected _sysOff(type: string, which: number): boolean {
    if (!this._sysActions[type]) return false;
    return UI._removeHandler(this._sysActions[type], which);
  }

  /**
   * Continue to keep track of an actions even if it's not within this UI. Useful for hover-leave and drag-outside.
   * @param type a string defined in [`UIPointerActions`](#link)
   */
  protected hold(type: string): number {
    let newKey = Math.max(0, ...Array.from(this._holds.keys())) + 1;
    this._holds.set(newKey, type);
    return newKey;
  }

  /**
   * Stop keeping track of this action
   * @param key an id returned by the [`UI.hold`](#link) function
   */
  protected unhold(key?: number): void {
    if (key !== undefined) {
      this._holds.delete(key);
    } else {
      this._holds.clear();
    }
  }

  /**
   * A static function to listen for a list of UIs. See also [`UI.listen`](#link).
   * @param uis an array of UI
   * @param type an action type. Can be one of `UIPointerActions` or a custom one.
   * @param p a point to check
   * @param evt a MouseEvent emitted by the browser (See [MDN docs](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent))
   */
  static track(uis: UI[], type: string, p: PtLike, evt: UIActionEvent): void {
    for (let i = 0, len = uis.length; i < len; i++) {
      uis[i].listen(type, p, evt);
    }
  }

  /**
   * Take a custom render function to render this UI.
   * @param fn a render function
   */
  render(fn: (group: Group, states: { [key: string]: any }) => void): void {
    fn(this._group, this._states);
  }

  /**
   * Returns a string representation of this UI
   */
  toString(): string {
    return `UI ${this.group.toString()}`;
  }

  /**
   * Check intersection using the hit test registered for this UI's shape.
   * @param p a point to check
   * @returns a boolean to indicate if the event should be triggered
   */
  protected _within(p: PtLike): boolean {
    const fn = _shapeTests[this._shape];
    if (!fn) return false;
    return fn(this._group, p, this._states);
  }

  /**
   * Static function to trigger an array of UIHandlers
   */
  protected static _trigger(
    fns: (UIHandler | null)[],
    target: UI,
    pt: PtLike,
    type: string,
    evt: UIActionEvent,
  ) {
    if (fns) {
      for (let i = 0, len = fns.length; i < len; i++) {
        if (fns[i]) fns[i]!(target, pt, type, evt);
      }
    }
  }

  /**
   * Static function to add a new handler to an array store of UIHandlers.
   */
  protected static _addHandler(
    fns: (UIHandler | null)[],
    fn: UIHandler,
  ): number {
    if (!fn) return -1;
    // reuse a removed slot so ids stay stable and the array doesn't grow
    // unboundedly when handlers are added and removed repeatedly
    for (let i = 0, len = fns.length; i < len; i++) {
      if (fns[i] === null) {
        fns[i] = fn;
        return i;
      }
    }
    fns.push(fn);
    return fns.length - 1;
  }

  /**
   * Static function to remove an existing handler from an array store of UIHandlers.
   * The slot is nulled (not spliced) so other handlers' ids remain valid.
   */
  protected static _removeHandler(
    fns: (UIHandler | null)[],
    index: number,
  ): boolean {
    if (index >= 0 && index < fns.length && fns[index]) {
      fns[index] = null;
      return true;
    }
    return false;
  }
}

/**
 * **[Experimental]** A simple button that extends [`UI`](#link) to track clicks and hovers.
 */
export class UIButton extends UI {
  private _hoverID: number = -1;

  /**
   * Create an UIButton. A button has 2 states, "clicks" (number) and "hover" (boolean), which you can access through [`UI.state`](#link) function. You may also create a new UIButton using one of the static helper like [`UI.fromRectangle`](#link) or [`UI.fromCircle`](#link).
   * @param group a Group or an Iterable<PtLike> that defines the UI's appearance
   * @param shape specifies the shape of the Group
   * @param states Optional default state object
   * @param id Optional id string
   */
  constructor(
    group: PtLikeIterable,
    shape: string,
    states: { [key: string]: any } = {},
    id?: string,
  ) {
    super(group, shape, states, id);

    if (states.hover === undefined) this._states["hover"] = false;
    if (states.clicks === undefined) this._states["clicks"] = 0;

    const UA = UIPointerActions;

    // listen for clicks when mouse up and increment clicks
    this._sysOn(UA.up, () => {
      this.state("clicks", this._states.clicks + 1);
    });

    // listen for move events and fire enter and leave events accordingly
    this._sysOn(
      UA.move,
      (target: UI, pt: PtLike, type: string, evt: UIActionEvent) => {
        let hover = this._within(pt);

        // hover on
        if (hover && !this._states.hover) {
          this.state("hover", true);

          // enter trigger
          UI._trigger(this._actions[UA.enter], this, pt, UA.enter, evt);

          // listen for hover off
          let _capID = this.hold(UA.move); // keep hold of second move
          this._hoverID = this._sysOn(
            UA.move,
            (t: UI, p: PtLike, ty: string, e: UIActionEvent) => {
              if (!this._within(p) && !this.state("dragging")) {
                this.state("hover", false);
                // leave trigger, with the current position and event
                UI._trigger(this._actions[UA.leave], this, p, UA.leave, e);
                this._sysOff(UA.move, this._hoverID); // remove second move listener
                this.unhold(_capID); // stop keeping hold of second move
              }
            },
          );
        }
      },
    );
  }

  /**
   * Add a new click handler. Remember this button will also need to be tracked for events via `UI.track`. If you want to track right clicks, you may also consider [`UIButton.onContextMenu`](#link).
   * @param fn a [`UIHandler`](#link) callback function: `fn( target:UI, pt:Pt, type:string, evt:MouseEvent )`
   * @returns an id number that refers to this handler, for use in [`UIButton.offClick`](#link) or [`UI.off`](#link).
   */
  onClick(fn: UIHandler): number {
    return this.on(UIPointerActions.up, fn);
  }

  /**
   * Remove an existing click handler
   * @param id an ID number returned by [`UIButton.onClick`](#link). If this is not defined, all handlers in this type will be removed.
   * @returns a boolean indicating whether the handler was removed successfully
   */
  offClick(id: number): boolean {
    return this.off(UIPointerActions.up, id);
  }

  /**
   * Add a new contextmenu handler. `contextmenu` is similar to right click, see the [MDN docs](https://developer.mozilla.org/en-US/docs/Web/API/Element/contextmenu_event). Remember this button will also need to be tracked for events via `UI.track`. Also note that you may need to use `event.preventDefault()` in the callback function to prevent other events from triggering.
   * @param fn a [`UIHandler`](#link) callback function: `fn( target:UI, pt:Pt, type:string, evt:MouseEvent )`
   * @returns an id number that refers to this handler, for use in [`UIButton.offContextMenu`](#link) or [`UI.off`](#link).
   */
  onContextMenu(fn: UIHandler): number {
    return this.on(UIPointerActions.contextmenu, fn);
  }

  /**
   * Remove an existing contextmenu handler
   * @param id an ID number returned by [`UIButton.onContextMenu`](#link). If this is not defined, all handlers in this type will be removed.
   * @returns a boolean indicating whether the handler was removed successfully
   */
  offContextMenu(id: number): boolean {
    return this.off(UIPointerActions.contextmenu, id);
  }

  /**
   * Add handlers for hover events. Remember this button will also need to be tracked for events via `UI.track`.
   * @param enter an optional [`UIHandler`](#link) function to handle when pointer enters hover. Eg, `fn( target:UI, pt:Pt, type:string, evt:MouseEvent )`
   * @param leave an optional [`UIHandler`](#link) function to handle when pointer exits hover. Eg, `fn( target:UI, pt:Pt, type:string, evt:MouseEvent )`
   * @returns id numbers that refer to enter/leave handlers, for use in [`UIButton.offHover`](#link) or [`UI.off`](#link).
   */
  onHover(enter?: UIHandler, leave?: UIHandler): (number | undefined)[] {
    let ids: (number | undefined)[] = [undefined, undefined];
    if (enter) ids[0] = this.on(UIPointerActions.enter, enter);
    if (leave) ids[1] = this.on(UIPointerActions.leave, leave);
    return ids;
  }

  /**
   * Remove handlers for hover events.
   * @param enterID an ID number returned by [`UI.onClick`](#link), or -1 to skip. If this is not defined, all handlers in this type will be removed.
   * @param leaveID an ID number returned by [`UI.onClick`](#link), or -1 to skip. If this is not defined, all handlers in this type will be removed.
   * @returns an array of booleans indicating whether the handlers were removed successfully
   */
  offHover(enterID?: number, leaveID?: number): boolean[] {
    let s = [false, false];
    if (enterID === undefined || enterID >= 0)
      s[0] = this.off(UIPointerActions.enter, enterID);
    if (leaveID === undefined || leaveID >= 0)
      s[1] = this.off(UIPointerActions.leave, leaveID);
    return s;
  }
}

/**
 * [Experimental] A draggable UI that provides handler such as [`UIDragger.onDrag`](#link) and [`UIDragger.onDrop`](#link).
 */
export class UIDragger extends UIButton {
  private _draggingID: number = -1;
  private _dragID: number = -1;
  private _moveHoldID: number = -1;
  private _dragHoldID: number = -1;
  private _dropHoldID: number = -1;
  private _upHoldID: number = -1;
  private _outHoldID: number = -1;
  private _lastMoveEvent: UIActionEvent | undefined;

  /**
   * Create a dragger which has all the states in UIButton, with additional "dragging" (a boolean indicating whether it's currently being dragged) and "offset" (a Pt representing the offset between this UI's position and the pointer's position when dragged) states. (See [`UI.state`](#link)) You may also create a new UIDragger using one of the static helper like [`UI.fromRectangle`](#link) or [`UI.fromCircle`](#link).
   * @param group a Group or an Iterable<PtLike> that defines the UI's appearance
   * @param shape specifies the shape of the Group
   * @param states Optional default state object
   * @param id Optional id string
   */
  constructor(
    group: PtLikeIterable,
    shape: string,
    states: { [key: string]: any } = {},
    id?: string,
  ) {
    super(group, shape, states, id);
    if (states.dragging === undefined) this._states["dragging"] = false;
    if (states.moved === undefined) this._states["moved"] = false;
    if (states.offset === undefined) this._states["offset"] = new Pt();

    const UA = UIPointerActions;

    /*
     * Note: drag/drop is implemented in Space.ts, uidrag/uidrop is
     * reimplemented here so that we can keep track of move events happening
     * outside of the UI element. E.g. when the mouse moves faster than the
     * UI refreshes.
     */

    // Handle pointer down and begin dragging
    this._sysOn(
      UA.down,
      (target: UI, pt: PtLike, type: string, evt: UIActionEvent) => {
        // begin listening for all events after dragging starts
        if (this._moveHoldID === -1) {
          this.state("dragging", true);
          this.state("offset", new Pt(pt).subtract(target.group[0]));
          this._moveHoldID = this.hold(UA.move); // keep hold of move
          this._dragHoldID = this.hold(UA.drag);
          this._outHoldID = this.hold(UA.out);
        }
        if (this._dropHoldID === -1) {
          this._dropHoldID = this.hold(UA.drop); // keep hold of drop (normal drag and drop)
        }
        if (this._upHoldID === -1) {
          this._upHoldID = this.hold(UA.up); // keep hold of up (cancel dragging if simple click)
        }
        if (this._draggingID === -1) {
          const drag = (t: UI, p: PtLike, ty: string, e: UIActionEvent) => {
            // Touch movement forwards both move and drag for the same event.
            const paired = ty === UA.drag && e === this._lastMoveEvent;
            this._lastMoveEvent = ty === UA.move ? e : undefined;
            if (paired) return;
            if (this.state("dragging")) {
              UI._trigger(this._actions[UA.uidrag], t, p, UA.uidrag, e);
              this.state("moved", true);
            }
          };
          this._draggingID = this._sysOn(UA.move, drag);
          this._dragID = this._sysOn(UA.drag, drag);
        }
      },
    );

    // Handle pointer drop or up and end dragging
    const endDrag = (
      target: UI,
      pt: PtLike,
      type: string,
      evt: UIActionEvent,
    ) => {
      this.state("dragging", false);
      // remove move listener
      this._sysOff(UA.move, this._draggingID);
      this._sysOff(UA.drag, this._dragID);
      this._draggingID = -1;
      this._dragID = -1;
      this._lastMoveEvent = undefined;
      // stop keeping hold of move
      this.unhold(this._moveHoldID);
      this._moveHoldID = -1;
      this.unhold(this._dragHoldID);
      this._dragHoldID = -1;
      this.unhold(this._outHoldID);
      this._outHoldID = -1;
      // stop keeping hold of drop
      this.unhold(this._dropHoldID);
      this._dropHoldID = -1;
      // stop keeping hold of up
      this.unhold(this._upHoldID);
      this._upHoldID = -1;
      // trigger event
      if (this.state("moved")) {
        UI._trigger(this._actions[UA.uidrop], target, pt, UA.uidrop, evt);
        this.state("moved", false);
      }
    };
    this._sysOn(UA.drop, endDrag);
    this._sysOn(UA.up, endDrag);
    this._sysOn(UA.out, endDrag);
  }

  /**
   * Add a new drag handler. Remember this button will also need to be tracked for events via `UI.track`.
   * @param fn a [`UIHandler`](#link) callback function: `fn( target:UI, pt:Pt, type:string, evt:MouseEvent )`. You can access the states "dragging" and "offset" (See [`UI.state`](#link)) in the callback.
   * @returns an id number that refers to this handler, for use in [`UIDragger.offDrag`](#link) or [`UI.off`](#link).
   */
  onDrag(fn: UIHandler): number {
    return this.on(UIPointerActions.uidrag, fn);
  }

  /**
   * Remove an existing drag handler
   * @param id an ID number returned by [`UIDragger.onDrag`](#link). If this is not defined, all handlers in this type will be removed.
   * @returns a boolean indicating whether the handler was removed successfully
   */
  offDrag(id: number): boolean {
    return this.off(UIPointerActions.uidrag, id);
  }

  /**
   * Add a new drop handler. Remember this button will also need to be tracked for events via `UI.track`.
   * @param fn a [`UIHandler`](#link) callback function: `fn( target:UI, pt:Pt, type:string, evt:MouseEvent )`
   * @returns an id number that refers to this handler, for use in [`UIDragger.offDrop`](#link) or [`UI.off`](#link).
   */
  onDrop(fn: UIHandler): number {
    return this.on(UIPointerActions.uidrop, fn);
  }

  /**
   * Remove an existing drop handler
   * @param id an ID number returned by [`UIDragger.onDrag`](#link). If this is not defined, all handlers in this type will be removed.
   * @returns a boolean indicating whether the handler was removed successfully
   */
  offDrop(id: number): boolean {
    return this.off(UIPointerActions.uidrop, id);
  }
}
