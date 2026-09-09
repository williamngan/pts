/*! Pts.js is licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */

import { Pt, Bound } from "./Pt";
import { type Form } from "./Form";
import { UI, UIPointerActions as UIA } from "./UI";
import {
  type ITimer,
  type ISpacePlayers,
  type IPlayer,
  type AnimateCallbackFn,
  type TouchPointsKey,
} from "./Types";

/**
 * Space is an abstract class that represents a general context for expressing Pts. It's extended through subclasses such as [`CanvasSpace`](#link) and [`SVGSpace`](#link). You can also create your own extension of Space.
 * See [Space guide](../guide/Space-0500.html) for details.
 */
export abstract class Space {
  id: string = "space";
  protected bound: Bound = new Bound();

  protected _time: ITimer = { prev: 0, diff: 0, end: -1, min: 0 };
  protected players: ISpacePlayers = {};
  protected playerCount = 0;
  protected _ctx: any;

  private _animID: number = -1;
  private _fromFrame = false;

  private _pause: boolean = false;
  private _refresh: boolean | undefined = undefined;
  private _renderFunc!: (context: any, self: Space) => null;

  protected _pointer: Pt = new Pt();

  protected _isReady = false;
  protected _playing = false;
  private _firstFrame = true;

  /**
   * Set whether the rendering should be repainted on each frame.
   * @param b a boolean value to set whether to repaint each frame
   */
  refresh(b: boolean): this {
    this._refresh = b;
    return this;
  }

  /**
   * Set a minimum frame time
   * @param ms at least this amount of milliseconds must have elapsed before frame advances
   */
  minFrameTime(ms: number = 0): this {
    this._time.min = ms;
    return this;
  }

  /**
   * Add an [`IPlayer`](#link) object or a [`AnimateCallbackFn`](#link) callback function to handle events in this Space. An IPlayer is an object with the following callback functions:
   * - required: `animate: fn( time, ftime, space )`
   * - optional: `start: fn(bound, space)`
   * - optional: `resize: fn( size, event )`
   * - optional: `action: fn( type, x, y, event )`
   * Subclasses of Space may define other callback functions.
   * @param p an [`IPlayer`](#link) object with animate function, or a callback function `fn(time, ftime)`.
   */
  add(p: IPlayer | AnimateCallbackFn): this {
    const player: IPlayer = typeof p == "function" ? { animate: p } : p;

    const k = this.playerCount++;
    const pid = player.animateID || this.id + k;

    this.players[pid] = player;
    player.animateID = pid;
    // resize callbacks receive the live bound (as they do on space resize);
    // treat it as read-only
    if (player.resize && this.bound.inited) player.resize(this.bound);

    // if _refresh is not set, set it to true
    if (this._refresh === undefined) this._refresh = true;

    return this;
  }

  /**
   * Remove a player from this Space.
   * @param player an IPlayer that has an `animateID` property
   */
  remove(player: IPlayer): this {
    delete this.players[player.animateID!];
    return this;
  }

  /**
   * Remove all players from this Space.
   */
  removeAll(): this {
    this.players = {};
    return this;
  }

  /**
   * Main play loop. This implements `window.requestAnimationFrame` and calls it recursively.
   * You may override this `play()` function to implement your own animation loop.
   * @param time current time
   */
  play(time = 0): this {
    // A real RAF can have timestamp 0 too. Consume its marker before invoking
    // players so a nested manual play() still cannot start a second loop.
    const fromFrame = this._fromFrame;
    this._fromFrame = false;
    // make sure only one play loop is active: an external play() while the
    // loop runs is a no-op...
    if (time === 0 && this._animID !== -1 && !fromFrame) {
      return this;
    }
    // ...and any other call (a frame callback, or a manual play(t)) replaces
    // the pending frame instead of stacking a parallel chain — cancelling an
    // already-fired frame id is a spec-defined no-op
    if (this._animID !== -1) cancelAnimationFrame(this._animID);
    this._animID = requestAnimationFrame((frameTime) => {
      this._fromFrame = true;
      try {
        this.play(frameTime);
      } finally {
        this._fromFrame = false;
      }
    });

    if (this._pause) {
      // track time while paused so resuming doesn't deliver the entire
      // pause duration as one frame's ftime
      this._time.prev = time;
      return this;
    }

    if (this._firstFrame) {
      // the first frame after a fresh start renders immediately with no
      // elapsed time — `time` is an arbitrary clock timestamp, not a delta
      // play() draws synchronously at synthetic time 0. Keep initialization
      // pending until RAF supplies its first real clock timestamp.
      this._firstFrame = time === 0 && !fromFrame;
      this._time.diff = 0;
      this._time.prev = time;
    } else {
      const diff = time - this._time.prev;
      // accumulate until the minimum frame time is reached
      if (diff < this._time.min) return this;
      this._time.diff = diff;
      this._time.prev = time;
    }

    try {
      this.playItems(time);
    } catch (err) {
      cancelAnimationFrame(this._animID);
      this._animID = -1;
      this._playing = false;
      this._firstFrame = true;
      throw err;
    }

    return this;
  }

  /**
   * Replay the animation after [`Space.stop`](#link). This resets the end-time counter.
   * You may also use [`Space.pause`](#link) and [`resume`](#link) for temporary pause.
   */
  replay() {
    this._time.end = -1;
    this.play();
  }

  /**
   * Main animate function. This calls all the items to perform.
   * @param time current time
   */
  protected playItems(time: number) {
    this._playing = true;

    // clear before draw if refresh is true
    if (this._refresh) this.clear();

    // animate all players
    if (this._isReady) {
      for (const k in this.players) {
        if (this.players[k].animate)
          this.players[k].animate(time, this._time.diff, this);
      }
    }

    // stop if time ended
    if (this._time.end >= 0 && time > this._time.end) {
      cancelAnimationFrame(this._animID);
      this._animID = -1;
      this._playing = false;
      this._firstFrame = true;
    }
  }

  /**
   * Pause the animation.
   * @param toggle a boolean value to set if this function call should be a toggle (between pause and resume)
   */
  pause(toggle = false): this {
    this._pause = toggle ? !this._pause : true;
    return this;
  }

  /**
   * Resume the pause animation.
   */
  resume(): this {
    this._pause = false;
    return this;
  }

  /**
   * Specify when the animation should stop: immediately, after a time period, or never stops.
   * @param t a value in millisecond to specify a time period to play before stopping, or `-1` to play forever, or `0` to end immediately. Default is 0 which will stop the animation immediately.
   */
  stop(t = 0): this {
    this._time.end = t;
    return this;
  }

  /**
   * Cancel the active animation frame immediately. Subclasses should call this
   * when they dispose browser resources instead of waiting for `stop()` to be
   * observed by the next frame.
   */
  protected _cancelAnimation(): this {
    if (this._animID !== -1) cancelAnimationFrame(this._animID);
    this._animID = -1;
    this._playing = false;
    this._firstFrame = true;
    return this;
  }

  /**
   * Play animation loop once. Optionally set a `duration` time to play for that specific duration.
   * @param duration a value in millisecond to specify a time period to play before stopping, or `-1` to play forever
   */
  playOnce(duration = 0): this {
    this.play();
    this.stop(duration);
    return this;
  }

  /**
   * Custom rendering.
   * @param context rendering context
   */
  protected render(context: any): this {
    if (this._renderFunc) this._renderFunc(context, this);
    return this;
  }

  /**
   * Set a custom rendering function `fn(graphics_context, canvas_space)` if needed.
   */
  set customRendering(f: (context: any, self: Space) => null) {
    this._renderFunc = f;
  }
  get customRendering(): (context: any, self: Space) => null {
    return this._renderFunc;
  }

  /**
   * Indicate whether the animation is playing.
   */
  get isPlaying(): boolean {
    return this._playing;
  }

  /**
   * The outer bounding box which includes its positions.
   */
  get outerBound(): Bound {
    return this.bound.clone();
  }

  /**
   * The inner bounding box of the space, excluding its positions.
   */
  public get innerBound(): Bound {
    return new Bound(Pt.make(this.size.length, 0), this.size.clone());
  }

  /**
   * The size of this space's bounding box.
   */
  get size(): Pt {
    return this.bound.size.clone();
  }

  /**
   * The center of this space's bounding box.
   */
  get center(): Pt {
    return this.size.divide(2);
  }

  /**
   * The width of this space's bounding box.
   */
  get width(): number {
    return this.bound.width;
  }

  /**
   * The height of this space's bounding box.
   */
  get height(): number {
    return this.bound.height;
  }

  /**
   * Resize the space. To be implemented in subclasses.
   * @param b a Bound representing the position and size of the space
   * @param evt event
   */
  abstract resize(b: Bound, evt?: Event | null): this;

  /**
   * clear all contents in the space. To be implemented in subclasses.
   */
  abstract clear(): this;

  /**
   * Get a default form for drawing in this space. To be implemented in subclasses.
   */
  abstract getForm(): Form;
}

/**
 * MultiTouchSpace is an abstract class that extends [`Space`](#link) to support user interactions via touch events.
 * It's extended through subclasses such as [`CanvasSpace`](#link) and [`SVGSpace`](#link).
 */
export abstract class MultiTouchSpace extends Space {
  // track mouse dragging
  protected _pressed = false;
  protected _dragged = false;

  protected _hasMouse = false;
  protected _hasTouch = false;
  protected _hasKeyboard = false;

  private _mouseTarget: Element | undefined;
  private _touchTarget: Element | undefined;
  private _keyboardTarget: EventTarget | undefined;
  private _touchPassive = false;

  private readonly _mouseDownBind = this._mouseDown.bind(
    this,
  ) as unknown as EventListener;
  private readonly _mouseUpBind = this._mouseUp.bind(
    this,
  ) as unknown as EventListener;
  private readonly _mouseOverBind = this._mouseOver.bind(
    this,
  ) as unknown as EventListener;
  private readonly _mouseOutBind = this._mouseOut.bind(
    this,
  ) as unknown as EventListener;
  private readonly _mouseMoveBind = this._mouseMove.bind(
    this,
  ) as unknown as EventListener;
  private readonly _mouseClickBind = this._mouseClick.bind(
    this,
  ) as unknown as EventListener;
  private readonly _contextMenuBind = this._contextMenu.bind(
    this,
  ) as unknown as EventListener;
  private readonly _touchStartBind = this._touchStart.bind(
    this,
  ) as unknown as EventListener;
  private readonly _touchMoveBind = this._touchMove.bind(
    this,
  ) as unknown as EventListener;
  private readonly _keyDownBind = this._keyDown.bind(
    this,
  ) as unknown as EventListener;
  private readonly _keyUpBind = this._keyUp.bind(
    this,
  ) as unknown as EventListener;

  // accept subclasses that implements addEventListener, removeEventListener, dispatchEvent
  protected _canvas!: EventTarget;

  /**
   * Get the mouse or touch pointer that stores the last action.
   */
  public get pointer(): Pt {
    const p = this._pointer.clone();
    p.id = this._pointer.id;
    return p;
  }

  /**
   * Bind event listener in canvas element. You can also use [`MultiTouchSpace.bindMouse`](#link) or [`MultiTouchSpace.bindTouch`](#link) to bind mouse or touch events conveniently.
   * @param evt an event string such as "mousedown"
   * @param callback callback function for this event
   * @param options options for [addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener).
   * @param customTarget an optional event target to use instead of the canvas element
   */
  bindCanvas(
    evt: string,
    callback: EventListener,
    options: any = {},
    customTarget?: Element,
  ) {
    const target = customTarget ? customTarget : this._canvas;
    target.addEventListener(evt, callback, options);
  }

  /**
   * Unbind a callback from the event listener.
   * @param evt an event string such as "mousedown"
   * @param callback callback function to unbind
   * @param options options for [removeEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener). This should match the options set in bindCanvas.
   * @param customTarget If customTarget is set in bindCanvas, you'll need to pass the same instance here to unbind
   */
  unbindCanvas(
    evt: string,
    callback: EventListener,
    options: any = {},
    customTarget?: Element,
  ) {
    const target = customTarget ? customTarget : this._canvas;
    target.removeEventListener(evt, callback, options);
  }

  bindDoc(evt: string, callback: EventListener, options: any = {}) {
    if (typeof document !== "undefined") {
      document.addEventListener(evt, callback, options);
    }
  }

  unbindDoc(evt: string, callback: EventListener, options: any = {}) {
    if (typeof document !== "undefined") {
      document.removeEventListener(evt, callback, options);
    }
  }

  /**
   * A convenient method to bind (or unbind) all mouse events in canvas element.
   * All [`IPlayer`](#link) objects added to this space that implement an `action` callback property will receive mouse event callbacks.
   * Mouse action names are defined by [`UIPointerActions`](#link), including "up", "down", "move", "drag", "drop", "over", "out", "click", "pointerdown", "pointerup", and "contextmenu".
   * @param bind a boolean value to bind mouse events if set to `true`. If `false`, all mouse events will be unbound. Default is true.
   * @param customTarget an optional event target to use instead of the canvas element
   * @see [`Space.add`](#link)
   */
  bindMouse(bind: boolean = true, customTarget?: Element): this {
    if (bind) {
      if (this._hasMouse) {
        if (this._mouseTarget === customTarget) return this;
        this.bindMouse(false);
      }

      this._mouseTarget = customTarget;
      this.bindCanvas("pointerdown", this._mouseDownBind, {}, customTarget);
      this.bindCanvas("pointerup", this._mouseUpBind, {}, customTarget);
      this.bindCanvas("pointerover", this._mouseOverBind, {}, customTarget);
      this.bindCanvas("pointerout", this._mouseOutBind, {}, customTarget);
      this.bindCanvas("pointercancel", this._mouseOutBind, {}, customTarget);
      this.bindCanvas("pointermove", this._mouseMoveBind, {}, customTarget);
      this.bindCanvas("click", this._mouseClickBind, {}, customTarget);
      this.bindCanvas("contextmenu", this._contextMenuBind, {}, customTarget);
      this._hasMouse = true;
    } else if (this._hasMouse) {
      const target = this._mouseTarget;
      this.unbindCanvas("pointerdown", this._mouseDownBind, {}, target);
      this.unbindCanvas("pointerup", this._mouseUpBind, {}, target);
      this.unbindCanvas("pointerover", this._mouseOverBind, {}, target);
      this.unbindCanvas("pointerout", this._mouseOutBind, {}, target);
      this.unbindCanvas("pointercancel", this._mouseOutBind, {}, target);
      this.unbindCanvas("pointermove", this._mouseMoveBind, {}, target);
      this.unbindCanvas("click", this._mouseClickBind, {}, target);
      this.unbindCanvas("contextmenu", this._contextMenuBind, {}, target);
      this._hasMouse = false;
      this._mouseTarget = undefined;
    }
    return this;
  }

  /**
   * A convenient method to bind (or unbind) all touch events in canvas element.
   * All [`IPlayer`](#link) objects added to this space that implement an `action` callback property will receive touch event callbacks.
   * Touch action names are defined by [`UIPointerActions`](#link), including "up", "down", "move", "drag", "drop", "over", and "out".
   * @param bind a boolean value to bind touch events if set to `true`. If `false`, all touch events will be unbound. Default is true.
   * @param passive a boolean value to set passive mode, ie, it won't block scrolling. Default is false.
   * @param customTarget an optional event target to use instead of the canvas element
   * @see [`Space.add`](#link)
   */
  bindTouch(
    bind: boolean = true,
    passive: boolean = false,
    customTarget?: Element,
  ): this {
    if (bind) {
      if (this._hasTouch) {
        if (
          this._touchTarget === customTarget &&
          this._touchPassive === passive
        )
          return this;
        this.bindTouch(false);
      }

      this._touchTarget = customTarget;
      this._touchPassive = passive;
      this.bindCanvas(
        "touchstart",
        this._touchStartBind,
        { passive: passive },
        customTarget,
      );
      this.bindCanvas("touchend", this._mouseUpBind, {}, customTarget);
      this.bindCanvas(
        "touchmove",
        this._touchMoveBind,
        { passive: passive },
        customTarget,
      );
      this.bindCanvas("touchcancel", this._mouseOutBind, {}, customTarget);
      this._hasTouch = true;
    } else if (this._hasTouch) {
      const target = this._touchTarget;
      const options = { passive: this._touchPassive };
      this.unbindCanvas("touchstart", this._touchStartBind, options, target);
      this.unbindCanvas("touchend", this._mouseUpBind, {}, target);
      this.unbindCanvas("touchmove", this._touchMoveBind, options, target);
      this.unbindCanvas("touchcancel", this._mouseOutBind, {}, target);
      this._hasTouch = false;
      this._touchTarget = undefined;
    }
    return this;
  }

  /**
   * Bind or unbind keyboard events. Events are attached to `document` by
   * default, or to `customTarget` when one is provided.
   */
  bindKeyboard(bind: boolean = true, customTarget?: EventTarget): this {
    if (bind) {
      const target = customTarget || document;
      if (this._hasKeyboard) {
        if (this._keyboardTarget === target) return this;
        this.bindKeyboard(false);
      }

      target.addEventListener("keydown", this._keyDownBind, {});
      target.addEventListener("keyup", this._keyUpBind, {});
      this._keyboardTarget = target;
      this._hasKeyboard = true;
    } else if (this._hasKeyboard) {
      this._keyboardTarget!.removeEventListener(
        "keydown",
        this._keyDownBind,
        {},
      );
      this._keyboardTarget!.removeEventListener("keyup", this._keyUpBind, {});
      this._keyboardTarget = undefined;
      this._hasKeyboard = false;
    }
    return this;
  }

  /** Unbind all pointer, touch, and keyboard listeners owned by this space. */
  protected _unbindAll(): this {
    this.bindMouse(false);
    this.bindTouch(false);
    this.bindKeyboard(false);
    return this;
  }

  private _trackedUIs: UI[] = [];
  private _uiPlayer: IPlayer | null = null;

  /** Remove all players and the UI registrations forwarded by them. */
  removeAll(): this {
    this.untrack();
    this._uiPlayer = null;
    return super.removeAll();
  }

  /**
   * Track one or more [`UI`](#link) elements: every pointer, touch, and keyboard
   * action dispatched by this space is forwarded to them via [`UI.track`](#link),
   * so no manual `action` wiring is needed. Remember to also bind the events,
   * eg via [`MultiTouchSpace.bindMouse`](#link). Keyboard actions are forwarded
   * too (their x/y carry the shift/alt flags, as the space dispatches them).
   * @param uis a UI, or an array of UIs
   */
  track(uis: UI | UI[]): this {
    const list = Array.isArray(uis) ? uis : [uis];
    for (let i = 0, len = list.length; i < len; i++) {
      if (this._trackedUIs.indexOf(list[i]) < 0) this._trackedUIs.push(list[i]);
    }
    if (!this._uiPlayer) {
      this._uiPlayer = {
        animate: () => {},
        action: (type: string, px: number, py: number, evt: Event) => {
          UI.track(this._trackedUIs, type, new Pt(px, py), evt as MouseEvent);
        },
      };
      this.add(this._uiPlayer);
    }
    return this;
  }

  /**
   * Stop tracking one or more [`UI`](#link) elements added via [`MultiTouchSpace.track`](#link).
   * @param uis a UI or an array of UIs to remove from tracking, or omit to stop tracking all
   */
  untrack(uis?: UI | UI[]): this {
    if (uis === undefined) {
      this._trackedUIs.length = 0;
      return this;
    }
    const list = Array.isArray(uis) ? uis : [uis];
    for (let i = 0, len = list.length; i < len; i++) {
      const at = this._trackedUIs.indexOf(list[i]);
      if (at >= 0) this._trackedUIs.splice(at, 1);
    }
    return this;
  }

  // Input is relative to the rendered element, not a cached container position
  // or the event target (which may be an overlay). Read once per event.
  private _inputTransform(): [number, number, number, number] {
    if (typeof Element !== "undefined" && this._canvas instanceof Element) {
      const rect = this._canvas.getBoundingClientRect();
      return [
        rect.left,
        rect.top,
        rect.width ? this.width / rect.width : 1,
        rect.height ? this.height / rect.height : 1,
      ];
    }
    // Non-DOM subclasses may supply their own EventTarget and explicit bounds.
    return [
      this.bound.topLeft.x -
        (typeof window === "undefined" ? 0 : window.scrollX),
      this.bound.topLeft.y -
        (typeof window === "undefined" ? 0 : window.scrollY),
      1,
      1,
    ];
  }

  /**
   * A convenient method to convert the touch points in a touch event to an array of Pts.
   * @param evt a touch event which contains touches, changedTouches, and targetTouches list
   * @param which a string to select a touches list: "touches", "changedTouches", or "targetTouches". Default is "touches"
   * @return an array of Pt, whose origin position (0,0) is offset to the top-left of this space
   */
  touchesToPoints(evt: TouchEvent, which: TouchPointsKey = "touches"): Pt[] {
    if (!evt || !evt[which]) return [];
    const ts = [];
    const [left, top, scaleX, scaleY] = this._inputTransform();
    for (let i = 0; i < evt[which].length; i++) {
      const t = evt[which].item(i)!;
      ts.push(new Pt((t.clientX - left) * scaleX, (t.clientY - top) * scaleY));
    }
    return ts;
  }

  /**
   * Go through all the added [`IPlayer`](#link) objects and call its `action` callback function.
   * @param type a [`UIPointerActions`](#link) constant or custom action string
   * @param evt mouse or touch event
   * @see [`Space.add`](#link)
   */
  protected _mouseAction(
    type: string,
    evt: MouseEvent | TouchEvent | PointerEvent,
  ) {
    if (!this.isPlaying) return;

    // compute the event position once — not per player, and independent of
    // whether any player is registered (the pointer must track regardless)
    const [left, top, scaleX, scaleY] = this._inputTransform();
    let px = 0,
      py = 0;

    if (evt instanceof MouseEvent) {
      px = (evt.clientX - left) * scaleX;
      py = (evt.clientY - top) * scaleY;
    } else {
      const touch =
        evt.changedTouches && evt.changedTouches.length > 0
          ? evt.changedTouches.item(0)
          : null;
      if (touch) {
        px = (touch.clientX - left) * scaleX;
        py = (touch.clientY - top) * scaleY;
      }
    }

    if (type) {
      this._pointer.to(px, py);
      this._pointer.id = type;
    }

    for (const k in this.players) {
      if (this.players.hasOwnProperty(k)) {
        const v = this.players[k];
        if (v.action) v.action(type, px, py, evt);
      }
    }
  }

  // Ignore the duplicate pointer stream only when this event also reaches our
  // touch listener. Mouse and touch bindings may use separate custom targets.
  private _isTouchHandled(evt: PointerEvent | TouchEvent): boolean {
    return (
      "pointerType" in evt &&
      evt.pointerType === "touch" &&
      this._hasTouch &&
      evt.composedPath().includes(this._touchTarget || this._canvas)
    );
  }

  /**
   * MouseDown handler.
   * @param evt
   */
  protected _mouseDown(evt: PointerEvent) {
    if (this._isTouchHandled(evt)) return false;
    this._mouseAction(UIA.down, evt);
    this._mouseAction(UIA.pointerdown, evt);
    this._pressed = true;
    if (evt.target instanceof Element) {
      evt.target.setPointerCapture(evt.pointerId);
    }
    return false;
  }

  /**
   * MouseUp handler.
   * @param evt
   */
  protected _mouseUp(evt: PointerEvent | TouchEvent) {
    if (this._isTouchHandled(evt)) return false;
    this._mouseAction(UIA.pointerup, evt);
    if (this._dragged) {
      this._mouseAction(UIA.drop, evt);
    } else {
      this._mouseAction(UIA.up, evt);
    }
    this._pressed = false;
    this._dragged = false;
    if (
      evt instanceof PointerEvent &&
      evt.target instanceof Element &&
      evt.target.hasPointerCapture(evt.pointerId)
    ) {
      evt.target.releasePointerCapture(evt.pointerId);
    }
    return false;
  }

  /**
   * MouseMove handler.
   * @param evt
   */
  protected _mouseMove(evt: PointerEvent) {
    if (this._isTouchHandled(evt)) return false;
    if (this._pressed) {
      this._dragged = true;
      this._mouseAction(UIA.drag, evt);
    } else {
      this._mouseAction(UIA.move, evt);
    }
    return false;
  }

  /**
   * MouseOver handler.
   * @param evt
   */
  protected _mouseOver(evt: PointerEvent) {
    if (this._isTouchHandled(evt)) return false;
    this._mouseAction(UIA.over, evt);
    return false;
  }

  /**
   * MouseOut handler.
   * @param evt
   */
  protected _mouseOut(evt: PointerEvent | TouchEvent) {
    if (this._isTouchHandled(evt)) return false;
    this._mouseAction(UIA.out, evt);
    if (this._dragged) this._mouseAction(UIA.drop, evt);
    this._pressed = false;
    this._dragged = false;
    return false;
  }

  /**
   * MouseClick handler.
   * @param evt
   */
  protected _mouseClick(evt: MouseEvent | TouchEvent) {
    this._mouseAction(UIA.click, evt);
    this._pressed = false;
    this._dragged = false;
    return false;
  }

  /**
   * ContextMenu handler.
   * @param evt
   */
  protected _contextMenu(evt: MouseEvent) {
    this._mouseAction(UIA.contextmenu, evt);
    return false;
  }

  /**
   * TouchMove handler.
   * @param evt
   */
  protected _touchMove(evt: TouchEvent) {
    this._mouseAction(UIA.move, evt);
    if (this._pressed) {
      this._dragged = true;
      this._mouseAction(UIA.drag, evt);
    }
    // preventDefault is ignored (and logs an error) inside passive listeners
    if (!this._touchPassive) evt.preventDefault();
    return false;
  }

  /**
   * TouchStart handler.
   * @param evt
   */
  protected _touchStart(evt: TouchEvent) {
    this._mouseAction(UIA.down, evt);
    this._pressed = true;
    if (!this._touchPassive) evt.preventDefault();
    return false;
  }

  protected _keyDown(evt: KeyboardEvent) {
    this._keyboardAction(UIA.keydown, evt);
    return false;
  }

  protected _keyUp(evt: KeyboardEvent) {
    this._keyboardAction(UIA.keyup, evt);
    return false;
  }

  protected _keyboardAction(type: string, evt: KeyboardEvent) {
    if (!this.isPlaying) return;
    for (const k in this.players) {
      if (this.players.hasOwnProperty(k)) {
        const v = this.players[k];
        if (v.action)
          v.action(type, evt.shiftKey ? 1 : 0, evt.altKey ? 1 : 0, evt);
      }
    }
  }
}
