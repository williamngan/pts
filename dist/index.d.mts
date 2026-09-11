/*! Copyright © 2017-present William Ngan and contributors.
Licensed under Apache 2.0 License.
See https://github.com/williamngan/pts for details. */
//#region src/UI.d.ts
/** A hit-test function for a UI shape: given the UI's group, a point, and the UI's states, return whether the point is within the shape. */
type UIShapeTest = (group: Group, pt: PtLike, states: {
  [key: string]: any;
}) => boolean;
/**
 * **[Experimental]** A set of string constatns to represent different UI types, for use in [`UI`](#link) instances.
 */
declare const UIShape: {
  rectangle: string;
  circle: string;
  polygon: string;
  polyline: string;
  line: string;
};
/**
 * **[Experimental]** A set of string constants to represent different UI event types.
 */
declare const UIPointerActions: {
  readonly up: "up";
  readonly down: "down";
  readonly move: "move";
  readonly drag: "drag";
  readonly uidrag: "uidrag";
  readonly drop: "drop";
  readonly uidrop: "uidrop";
  readonly over: "over";
  readonly out: "out";
  readonly enter: "enter";
  readonly leave: "leave";
  readonly click: "click";
  readonly keydown: "keydown";
  readonly keyup: "keyup";
  readonly pointerdown: "pointerdown";
  readonly pointerup: "pointerup";
  readonly contextmenu: "contextmenu";
  readonly all: "all";
};
/** A known pointer, touch, or keyboard action dispatched by a Pts space. */
type UIPointerAction = (typeof UIPointerActions)[keyof typeof UIPointerActions];
/**
 * **[Experimental]** An abstract class that represents an UI element. It wraps a [`Group`](#link) and supports UI event handling.
 * Extend this class to create custom UI elements.
 */
declare class UI {
  private _abortCleanup;
  _group: Group;
  _shape: string;
  protected static _counter: number;
  protected _id: string;
  protected _actions: {
    [type: string]: (UIHandler | null)[];
  };
  protected _sysActions: {
    [type: string]: (UIHandler | null)[];
  };
  protected _states: {
    [key: string]: any;
  };
  protected _holds: Map<number, string>;
  /**
   * Create an UI element. You may also create a new UI using one of the static helper like [`UI.fromRectangle`](#link) or [`UI.fromCircle`](#link).
   * @param group a Group or an Iterable<PtLike> that defines the UI's appearance
   * @param shape specifies the shape of the Group
   * @param states optional a state object keep track of custom states for this UI
   * @param id optional id string
   */
  constructor(group: PtLikeIterable, shape: string, states?: {
    [key: string]: any;
  }, id?: string);
  /**
   * Register a custom shape hit test, or override a built-in one. The shape
   * name can then be used when constructing a UI.
   * @param shape shape name
   * @param fn a function `(group, pt, states) => boolean` that returns whether the point hits the shape
   */
  static registerShape(shape: string, fn: UIShapeTest): void;
  /**
   * A static helper function to create a Rectangle UI.
   * @param group a Group or an Iterable<PtLike> with 2 Pt representing a rectangle
   * @param states optional a state object keep track of custom states for this UI
   * @param id optional id string
   */
  static fromRectangle(group: PtLikeIterable, states: {}, id?: string): UI;
  /**
   * A static helper function to create a Circle UI.
   * @param group a Group or an Iterable<PtLike> with 2 Pt representing a circle
   * @param states optional a state object keep track of custom states for this UI
   * @param id optional id string
   */
  static fromCircle(group: PtLikeIterable, states: {}, id?: string): UI;
  /**
   * A static helper function to create a Polygon UI.
   * @param group a Group or an Iterable<PtLike> representing a polygon
   * @param states optional a state object keep track of custom states for this UI
   * @param id optional id string
   */
  static fromPolygon(group: PtLikeIterable, states: {}, id?: string): UI;
  /**
   * A static helper function to create a new UI based on another UI.
   * @param ui base UI
   * @param states optional a state object keep track of custom states for this UI
   */
  static fromUI(ui: UI, states?: object, id?: string): UI;
  /**
   * An unique id of the UI.
   */
  get id(): string;
  set id(d: string);
  /**
   * A group of Pts that defines this UI's shape.
   */
  get group(): Group;
  set group(d: Group);
  /**
   * A string that describes this UI's shape.
   */
  get shape(): string;
  set shape(d: string);
  /**
   * Get and/or set a specific UI state.
   * @param key state's name
   * @param value optionally set a new value for this state.key
   * @returns If `value` is changed, return this instance. Otherwise, return the value of the specific key.
   */
  state(key: string, value?: any): any;
  /**
   * Get a specific UI state. Unlike [`UI.state`](#link), this is a plain typed getter.
   * @param key state's name
   */
  getState<T = any>(key: string): T;
  /**
   * Set a specific UI state. Unlike [`UI.state`](#link), this can also store `undefined`.
   * @param key state's name
   * @param value the value to set
   */
  setState(key: string, value: any): this;
  /**
   * Add an event handler. Remember this UI will also need to be tracked for events, via `UI.track` or [`MultiTouchSpace.track`](#link).
   * @param type event type, either one of [`UIPointerActions`](#link) or a custom type
   * @param fn a [`UIHandler`](#link) callback function: `fn( target:UI, pt:Pt, type:string, evt:MouseEvent )`
   * @param options optionally `{ once }` to remove the handler after its first call, and/or `{ signal }` with an [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) that removes it on abort (an already-aborted signal registers nothing)
   * @returns an id number that reference to this handler, for use in [`UI.off`](#link), or -1 if nothing was registered
   */
  on(type: UIPointerAction | (string & {}), fn: UIHandler, options?: {
    once?: boolean;
    signal?: AbortSignal;
  }): number;
  /**
   * Remove an event handler.
   * @param type event type
   * @param which an ID number returned by [`UI.on`](#link). If this is not defined, all handlers in this type will be removed (built-in machinery like UIButton's click counting is unaffected). Note that after removal an id is stale — removing it twice may affect a handler that has since reused the slot.
   */
  off(type: UIPointerAction | (string & {}), which?: number): boolean;
  /**
   * Listen for UI events and trigger action handlers.
   * @param type an action type. Can be one of UIPointerActions or a custom one.
   * @param p a point to check
   * @param evt a MouseEvent emitted by the browser (See [MDN docs](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent))
   */
  listen(type: UIPointerAction | (string & {}), p: PtLike, evt: UIActionEvent): boolean;
  /** Check whether an action type is currently held, without allocating. */
  private _holdsType;
  /** Register a built-in handler unaffected by public `off`. */
  protected _sysOn(type: string, fn: UIHandler): number;
  /** Remove a built-in handler registered with `_sysOn`. */
  protected _sysOff(type: string, which: number): boolean;
  /**
   * Continue to keep track of an actions even if it's not within this UI. Useful for hover-leave and drag-outside.
   * @param type a string defined in [`UIPointerActions`](#link)
   */
  protected hold(type: string): number;
  /**
   * Stop keeping track of this action
   * @param key an id returned by the [`UI.hold`](#link) function
   */
  protected unhold(key?: number): void;
  /**
   * A static function to listen for a list of UIs. See also [`UI.listen`](#link).
   * @param uis an array of UI
   * @param type an action type. Can be one of `UIPointerActions` or a custom one.
   * @param p a point to check
   * @param evt a MouseEvent emitted by the browser (See [MDN docs](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent))
   */
  static track(uis: UI[], type: string, p: PtLike, evt: UIActionEvent): void;
  /**
   * Take a custom render function to render this UI.
   * @param fn a render function
   */
  render(fn: (group: Group, states: {
    [key: string]: any;
  }) => void): void;
  /**
   * Returns a string representation of this UI
   */
  toString(): string;
  /**
   * Check intersection using the hit test registered for this UI's shape.
   * @param p a point to check
   * @returns a boolean to indicate if the event should be triggered
   */
  protected _within(p: PtLike): boolean;
  /**
   * Static function to trigger an array of UIHandlers
   */
  protected static _trigger(fns: (UIHandler | null)[], target: UI, pt: PtLike, type: string, evt: UIActionEvent): void;
  /**
   * Static function to add a new handler to an array store of UIHandlers.
   */
  protected static _addHandler(fns: (UIHandler | null)[], fn: UIHandler): number;
  /**
   * Static function to remove an existing handler from an array store of UIHandlers.
   * The slot is nulled (not spliced) so other handlers' ids remain valid.
   */
  protected static _removeHandler(fns: (UIHandler | null)[], index: number): boolean;
}
/**
 * **[Experimental]** A simple button that extends [`UI`](#link) to track clicks and hovers.
 */
declare class UIButton extends UI {
  private _hoverID;
  /**
   * Create an UIButton. A button has 2 states, "clicks" (number) and "hover" (boolean), which you can access through [`UI.state`](#link) function. You may also create a new UIButton using one of the static helper like [`UI.fromRectangle`](#link) or [`UI.fromCircle`](#link).
   * @param group a Group or an Iterable<PtLike> that defines the UI's appearance
   * @param shape specifies the shape of the Group
   * @param states Optional default state object
   * @param id Optional id string
   */
  constructor(group: PtLikeIterable, shape: string, states?: {
    [key: string]: any;
  }, id?: string);
  /**
   * Add a new click handler. Remember this button will also need to be tracked for events via `UI.track`. If you want to track right clicks, you may also consider [`UIButton.onContextMenu`](#link).
   * @param fn a [`UIHandler`](#link) callback function: `fn( target:UI, pt:Pt, type:string, evt:MouseEvent )`
   * @returns an id number that refers to this handler, for use in [`UIButton.offClick`](#link) or [`UI.off`](#link).
   */
  onClick(fn: UIHandler): number;
  /**
   * Remove an existing click handler
   * @param id an ID number returned by [`UIButton.onClick`](#link). If this is not defined, all handlers in this type will be removed.
   * @returns a boolean indicating whether the handler was removed successfully
   */
  offClick(id: number): boolean;
  /**
   * Add a new contextmenu handler. `contextmenu` is similar to right click, see the [MDN docs](https://developer.mozilla.org/en-US/docs/Web/API/Element/contextmenu_event). Remember this button will also need to be tracked for events via `UI.track`. Also note that you may need to use `event.preventDefault()` in the callback function to prevent other events from triggering.
   * @param fn a [`UIHandler`](#link) callback function: `fn( target:UI, pt:Pt, type:string, evt:MouseEvent )`
   * @returns an id number that refers to this handler, for use in [`UIButton.offContextMenu`](#link) or [`UI.off`](#link).
   */
  onContextMenu(fn: UIHandler): number;
  /**
   * Remove an existing contextmenu handler
   * @param id an ID number returned by [`UIButton.onContextMenu`](#link). If this is not defined, all handlers in this type will be removed.
   * @returns a boolean indicating whether the handler was removed successfully
   */
  offContextMenu(id: number): boolean;
  /**
   * Add handlers for hover events. Remember this button will also need to be tracked for events via `UI.track`.
   * @param enter an optional [`UIHandler`](#link) function to handle when pointer enters hover. Eg, `fn( target:UI, pt:Pt, type:string, evt:MouseEvent )`
   * @param leave an optional [`UIHandler`](#link) function to handle when pointer exits hover. Eg, `fn( target:UI, pt:Pt, type:string, evt:MouseEvent )`
   * @returns id numbers that refer to enter/leave handlers, for use in [`UIButton.offHover`](#link) or [`UI.off`](#link).
   */
  onHover(enter?: UIHandler, leave?: UIHandler): (number | undefined)[];
  /**
   * Remove handlers for hover events.
   * @param enterID an ID number returned by [`UI.onClick`](#link), or -1 to skip. If this is not defined, all handlers in this type will be removed.
   * @param leaveID an ID number returned by [`UI.onClick`](#link), or -1 to skip. If this is not defined, all handlers in this type will be removed.
   * @returns an array of booleans indicating whether the handlers were removed successfully
   */
  offHover(enterID?: number, leaveID?: number): boolean[];
}
/**
 * [Experimental] A draggable UI that provides handler such as [`UIDragger.onDrag`](#link) and [`UIDragger.onDrop`](#link).
 */
declare class UIDragger extends UIButton {
  private _draggingID;
  private _dragID;
  private _moveHoldID;
  private _dragHoldID;
  private _dropHoldID;
  private _upHoldID;
  private _outHoldID;
  private _lastMoveEvent;
  /**
   * Create a dragger which has all the states in UIButton, with additional "dragging" (a boolean indicating whether it's currently being dragged) and "offset" (a Pt representing the offset between this UI's position and the pointer's position when dragged) states. (See [`UI.state`](#link)) You may also create a new UIDragger using one of the static helper like [`UI.fromRectangle`](#link) or [`UI.fromCircle`](#link).
   * @param group a Group or an Iterable<PtLike> that defines the UI's appearance
   * @param shape specifies the shape of the Group
   * @param states Optional default state object
   * @param id Optional id string
   */
  constructor(group: PtLikeIterable, shape: string, states?: {
    [key: string]: any;
  }, id?: string);
  /**
   * Add a new drag handler. Remember this button will also need to be tracked for events via `UI.track`.
   * @param fn a [`UIHandler`](#link) callback function: `fn( target:UI, pt:Pt, type:string, evt:MouseEvent )`. You can access the states "dragging" and "offset" (See [`UI.state`](#link)) in the callback.
   * @returns an id number that refers to this handler, for use in [`UIDragger.offDrag`](#link) or [`UI.off`](#link).
   */
  onDrag(fn: UIHandler): number;
  /**
   * Remove an existing drag handler
   * @param id an ID number returned by [`UIDragger.onDrag`](#link). If this is not defined, all handlers in this type will be removed.
   * @returns a boolean indicating whether the handler was removed successfully
   */
  offDrag(id: number): boolean;
  /**
   * Add a new drop handler. Remember this button will also need to be tracked for events via `UI.track`.
   * @param fn a [`UIHandler`](#link) callback function: `fn( target:UI, pt:Pt, type:string, evt:MouseEvent )`
   * @returns an id number that refers to this handler, for use in [`UIDragger.offDrop`](#link) or [`UI.off`](#link).
   */
  onDrop(fn: UIHandler): number;
  /**
   * Remove an existing drop handler
   * @param id an ID number returned by [`UIDragger.onDrag`](#link). If this is not defined, all handlers in this type will be removed.
   * @returns a boolean indicating whether the handler was removed successfully
   */
  offDrop(id: number): boolean;
}
//#endregion
//#region src/Types.d.ts
/**
 * Typescript interface: IPt is an interface that represents an object with x, y, z, w properties.
 */
interface IPt {
  x?: number;
  y?: number;
  z?: number;
  w?: number;
}
/**
 * Typescript type: PtLike represents the data of a point. It can be either a Pt instance or an array of numbers.
 */
type PtLike = Pt | Float32Array | number[];
/**
 * Typescript type: GroupLike represents an array of Pt instances. It be a Group instance or an array of Pt. Unlike `PtIterable`, this type only allows arrays but not iterables.
 */
type GroupLike = Group | Pt[];
/**
 * Typescript type: PtIterable represents an iterable list of Pt instances. Unlike `PtLikeIterable`, this type only allows Pt instances but not numbers' arrays.
 * If you aren't sure what this type means, treat this as a [`Group`](#link) instance.
 */
type PtIterable = GroupLike | Pt[] | Iterable<Pt>;
/**
 * Typescript type: PtLikeIterable is the most flexible way to represent an iterable list of point data. For example, it can be a Group, an iterable of Pt instances, or an array of numbers' arrays.
 * If you aren't sure what this type means, treat this as a [`Group`](#link) instance.
 */
type PtLikeIterable = GroupLike | PtLike[] | Iterable<PtLike>;
/**
 * Typescript type: TextMeasure represents a function that returns the rendered width of a string of text, such as canvas context's `measureText` or an estimator created via [`Typography.textWidthEstimator`](#link).
 */
type TextMeasure = (text: string) => number;
/**
 * Typescript type: TextVerticalAlign represents the vertical alignment options accepted by [`CanvasForm.textBox`](#link) and [`CanvasForm.paragraphBox`](#link).
 */
type TextVerticalAlign = "top" | "start" | "middle" | "center" | "bottom" | "end";
/**
 * Typescript type: AnimateCallbackFn represents a callback function for animation. It accepts parameters to keep track of current time, current frame-time, and current space instance.
 */
type AnimateCallbackFn = (time: number, frameTime: number, currentSpace: Space) => void;
/**
 * Typescript type: UIActionEvent represents the DOM events a Space dispatches to players and UI handlers — pointer, mouse, touch, and keyboard.
 */
type UIActionEvent = MouseEvent | TouchEvent | PointerEvent | KeyboardEvent;
/**
 * Typescript interface: IPlayer is an interface that represents a "player" object that can be added into a Space.
 */
interface IPlayer {
  animateID?: string;
  animate?: AnimateCallbackFn;
  resize?(bound: Bound, evt?: Event | null): void;
  action?(type: string, px: number, py: number, evt: UIActionEvent): void;
  start?(bound: Bound, space: Space): void;
}
/**
 * Typescript interface: ISpacePlayers represents a map of IPlayer instances.
 */
interface ISpacePlayers {
  [key: string]: IPlayer;
}
/**
 *Typescript interface: ITimer represents a time-recording object.
 */
interface ITimer {
  prev: number;
  diff: number;
  end: number;
  min: number;
}
/**
 * Typescript type: TouchPointsKey represents a set of acceptable string keys for defining touch action.
 */
type TouchPointsKey = "touches" | "changedTouches" | "targetTouches";
/**
 * Typescript interface: MultiTouchElement represents an element that can handle touch events.
 */
interface MultiTouchElement {
  addEventListener(evt: string, callback: EventListenerOrEventListenerObject): void;
  removeEventListener(evt: string, callback: EventListenerOrEventListenerObject): void;
}
/**
 * Typescript type: Setup options for CanvasSpace. See [`CanvasSpace.setup()`](#link) function.
 */
type CanvasSpaceOptions = {
  bgcolor?: string;
  resize?: boolean;
  retina?: boolean;
  offscreen?: boolean;
  pixelDensity?: number;
};
/**
 * Typescript type: ColorType represents a defined set of string values such as "rgb" and "lab".
 */
type ColorType = "rgb" | "hsl" | "hsb" | "lab" | "lch" | "luv" | "xyz" | "oklab" | "oklch";
/**
 * Typescript type: DelaunayShape represents an object type that can store a Delaunay element. It has 3 indices (i, j, k) and two groups that represent a triangle and a circle.
 */
type DelaunayShape = {
  i: number;
  j: number;
  k: number;
  triangle: GroupLike;
  circle: Group;
};
/**
 * Typescript type: DelaunayMesh represents an object type that has an array of {key: shape} items, where each shape represents a DelaunayShape.
 * Note the unusual shape: it is an array indexed by point index, where each entry is a dictionary keyed by `"min-max"` neighbor-pair strings. This mirrors the mesh cache built by [`Delaunay.mesh`](#link) and is kept as-is for compatibility.
 */
type DelaunayMesh = {
  [key: string]: DelaunayShape;
}[];
/**
 * Typescript type: DOMFormContext represents the current context for an DOMForm.
 */
type DOMFormContext = {
  group: Element | null | undefined;
  groupID: string;
  groupCount: number;
  currentID: string;
  currentClass?: string;
  style: Record<string, string | number | boolean>;
};
/**
 * Typescript type: IntersectContext represents a type of an object that store the intersection info.
 */
type IntersectContext = {
  which: number;
  dist: number;
  normal: Pt;
  vertex: Pt;
  edge: Group;
  other?: unknown;
};
/**
 * Typescript type: UIHandler represents a callback function to handle UI actions.
 */
type UIHandler = (target: UI, pt: PtLike, type: UIPointerAction | (string & {}), evt: UIActionEvent) => void;
/**
 * Typescript type: WarningType specifies a level of warning for [`Util.warnLevel`](#link).
 */
type WarningType = "error" | "warn" | "mute";
/**
 * Typescript type: a callback function type used in `tempo.every(...).start( fn )`
 */
type ITempoStartFn = (count: number) => void | boolean;
/**
 * Typescript type: a callback function type used in `tempo.every(...).progress( fn )`
 */
type ITempoProgressFn = (count: number, t: number, ms: number, start: boolean) => void | boolean;
/**
 * Typescript type: ITempoListener represents a listener created by Tempo class
 */
type ITempoListener = {
  name?: string;
  beats?: number | number[];
  period?: number;
  duration?: number;
  offset?: number;
  continuous?: boolean;
  index?: number;
  count?: number;
  fn: ITempoStartFn | ITempoProgressFn;
};
/**
 * Typescript type: the return type of `tempo.every(...)`
 */
type ITempoResponses = {
  start: (fn: ITempoStartFn, offset?: number, name?: string) => ITempoResponses;
  progress: (fn: ITempoProgressFn, offset?: number, name?: string) => ITempoResponses;
};
/**
 * Typescript type: ISoundAnalyzer represents an object that stores the AnalyzerNode properties
 */
type ISoundAnalyzer = {
  node: AnalyserNode;
  size: number;
  data: Uint8Array;
};
/**
 * Typescript type: SoundType represents a type of sound input. It corresponds to Sound.type property.
 */
type SoundType = "file" | "gen" | "input";
/**
 * Typescript type: DefaultFormStyle represents a default object for visual styles such as fill, stroke, line width, and others.
 */
type DefaultFormStyle = {
  fillStyle?: string | CanvasGradient | CanvasPattern;
  strokeStyle?: string | CanvasGradient | CanvasPattern;
  lineWidth?: number;
  lineJoin?: CanvasLineJoin;
  lineCap?: CanvasLineCap;
  globalAlpha?: number;
};
/**
 * Typescript type: CanvasPatternRepetition represents the string options to specify pattern repetition
 */
type CanvasPatternRepetition = "repeat" | "repeat-x" | "repeat-y" | "no-repeat";
type RenderingContext2D = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
//#endregion
//#region src/Pt.d.ts
/**
 * Pt is a subclass of standard [`Float32Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float32Array) with additional properties and functions to support vector and geometric calculations.
 * See [Pt guide](../guide/Pt-0200.html) for details.
 */
declare class Pt extends Float32Array implements IPt, Iterable<number> {
  protected _id: string;
  /**
   * Create a Pt. If no parameter is provided, this will instantiate a Pt with 2 dimensions [0, 0].
   * Note that `new Pt(3)` will only instantiate Pt with length of 3 (ie, same as `new Float32Array(3)` ). If you need a Pt with 1 dimension of value 3, use `new Pt([3])`.
   * @example `new Pt()`, `new Pt(1,2,3,4,5)`, `new Pt([1,2])`, `new Pt({x:0, y:1})`, `new Pt(pt)`
   * @param args a list of numeric parameters, an array of numbers, or an object with {x,y,z,w} properties
   */
  constructor(...args: Array<number | number[] | IPt | Float32Array>);
  /**
   * Create an n-dimensional Pt with either default value or random values.
   * @param dimensions number of dimensions
   * @param defaultValue optional default value to fill the dimensions
   * @param randomize if `true`, randomize the value between 0 to default value
   */
  static make(dimensions: number, defaultValue?: number, randomize?: boolean): Pt;
  /**
   * ID string of this Pt
   */
  get id(): string;
  set id(s: string);
  /**
   * Value in the first dimensional of this Pt
   */
  get x(): number;
  set x(n: number);
  /**
   * Value in the second dimension of this Pt
   */
  get y(): number;
  set y(n: number);
  /**
   * Value in the third dimension of this Pt
   */
  get z(): number;
  set z(n: number);
  /**
   * Value in the forth dimension of this Pt
   */
  get w(): number;
  set w(n: number);
  /**
   * Clone this Pt and return it as a new Pt.
   */
  clone(): Pt;
  /**
   * Check if another Pt is equal to this Pt, within a threshold. Every dimension of this Pt must be matched: a shorter Pt, or one with a NaN dimension, is not equal (following IEEE semantics, NaN never equals NaN).
   * @param p another Pt to compare with
   * @param threshold a threshold value within which the two Pts are considered equal. Default is 0.000001.
   */
  equals(p: PtLike, threshold?: number): boolean;
  /**
   * Update the values of this Pt.
   * @param args can be either a list of numbers, an array, a Pt, or an object with {x,y,z,w} properties
   */
  to(...args: any[]): this;
  /**
   * Like [`Pt.to`](#link) but returns a new Pt.
   * @param args can be either a list of numbers, an array, a Pt, or an object with {x,y,z,w} properties
   */
  $to(...args: any[]): Pt;
  /**
   * Update the values of this Pt to point at a specific angle.
   * @param radian target angle in radian
   * @param magnitude Optional magnitude if known. If not provided, it'll calculate and use this Pt's magnitude.
   * @param anchorFromPt If `true`, add it from this Pt's current position. Default is `false` which update the position from origin (0,0). See also [`Geom.rotate2D`](#link) for rotating a point from another anchor point.
   */
  toAngle(radian: number, magnitude?: number, anchorFromPt?: boolean): this;
  /**
   * Create an operation using this Pt, passing this Pt into a custom function's first parameter. See the [Op guide](../guide/Op-0400.html) for details.
   * @param fn any function that takes a Pt as its first parameter
   * @example `let myOp = pt.op( fn ); let result = myOp( [1,2,3] );`
   * @returns a resulting function that takes other parameters required in `fn`
   */
  op(fn: (p1: PtLike, ...rest: any[]) => any): (...rest: any[]) => any;
  /**
   * This combines a series of operations into an array. See the [Op guide](../guide/Op-0400.html) for details.
   * @param fns an array of functions for `op`
   * @example `let myOps = pt.ops([fn1, fn2, fn3]); let results = myOps.map( (op) => op([1,2,3]) );`
   * @returns an array of resulting functions
   */
  ops(fns: ((p1: PtLike, ...rest: any[]) => any)[]): ((...rest: any[]) => any)[];
  /**
   * Take specific dimensional values from this Pt and create a new Pt.
   * @param axis a string such as "xy" (use Const.xy) or an array to specify indices
   */
  $take(axis: string | number[]): Pt;
  /**
   * Concatenate this Pt with addition dimensional values and return as a new Pt.
   * @param args can be either a list of numbers, an array, a Pt,  or an object with {x,y,z,w} properties
   */
  $concat(...args: any[]): Pt;
  /**
   * Add scalar or vector values to this Pt.
   * @param args can be either a list of numbers, an array, a Pt, or an object with {x,y,z,w} properties
   */
  add(...args: any[]): this;
  /**
   * Like [`Pt.add`](#link), but returns result as a new Pt.
   * @param args can be either a list of numbers, an array, a Pt, or an object with {x,y,z,w} properties
   */
  $add(...args: any[]): Pt;
  /**
   * Subtract scalar or vector values from this Pt.
   * @param args can be either a list of numbers, an array, a Pt, or an object with {x,y,z,w} properties
   */
  subtract(...args: any[]): this;
  /**
   * Like [`Pt.subtract`](#link), but returns result as a new Pt.
   * @param args can be either a list of numbers, an array, a Pt, or an object with {x,y,z,w} properties
   */
  $subtract(...args: any[]): Pt;
  /**
   * Multiply scalar or vector values (as element-wise) with this Pt.
   * @param args can be either a list of numbers, an array, a Pt, or an object with {x,y,z,w} properties
   */
  multiply(...args: any[]): this;
  /**
   * Like [`Pt.multiply`](#link), but returns result as a new Pt.
   * @param args can be either a list of numbers, an array, a Pt, or an object with {x,y,z,w} properties
   */
  $multiply(...args: any[]): Pt;
  /**
   * Divide this Pt over scalar or vector values (as element-wise).
   * @param args can be either a list of numbers, an array, a Pt, or an object with {x,y,z,w} properties
   */
  divide(...args: any[]): this;
  /**
   * Like [`Pt.divide`](#link), but returns result as a new Pt.
   * @param args can be either a list of numbers, an array, a Pt, or an object with {x,y,z,w} properties
   */
  $divide(...args: any[]): Pt;
  /**
   * Get the squared distance (magnitude) of this Pt from origin.
   */
  magnitudeSq(): number;
  /**
   * Get the distance (magnitude) of this Pt from origin.
   */
  magnitude(): number;
  /**
   * Convert to a unit vector, which is a normalized vector whose magnitude equals to 1.
   * @param magnitude Optional: if the magnitude is known, pass it as a parameter to avoid duplicate calculation.
   */
  unit(magnitude?: number | undefined): Pt;
  /**
   * Get a new unit vector from this Pt.
   */
  $unit(magnitude?: number | undefined): Pt;
  /**
   * Dot product of this Pt and another Pt.
   * @param args can be either a list of numbers, an array, a Pt, or an object with {x,y,z,w} properties
   */
  dot(...args: any[]): number;
  /**
   * 2D Cross product of this Pt and another Pt. Return results as a new Pt.
   * @param args can be either a list of numbers, an array, a Pt, or an object with {x,y,z,w} properties
   */
  $cross2D(...args: any[]): number;
  /**
   * 3D Cross product of this Pt and another Pt. Return results as a new Pt.
   * @param args can be either a list of numbers, an array, a Pt, or an object with {x,y,z,w} properties
   */
  $cross(...args: any[]): Pt;
  /**
   * Calculate the vector projection of another Pt onto this Pt — ie, the component of the other Pt along this Pt's direction. Note that this Pt must be non-zero.
   * @param args the other Pt, as either a list of numbers, an array, a Pt, or an object with {x,y,z,w} properties
   * @returns the projection vector as a Pt
   */
  $project(...args: any[]): Pt;
  /**
   * Calculate the scalar projection of another Pt onto this Pt — the signed length of the other Pt's component along this Pt's direction. Note that this Pt must be non-zero.
   * @param args the other Pt, as either a list of numbers, an array, a Pt, or an object with {x,y,z,w} properties
   */
  projectScalar(...args: any[]): number;
  /**
   * Absolute values for all values in this pt.
   */
  abs(): Pt;
  /**
   * Get a new Pt with absolute values of this Pt.
   */
  $abs(): Pt;
  /**
   * Floor values for all values in this Pt.
   */
  floor(): Pt;
  /**
   * Get a new Pt with floor values of this Pt.
   */
  $floor(): Pt;
  /**
   * Ceiling values for all values in this Pt.
   */
  ceil(): Pt;
  /**
   * Get a new Pt with ceiling values of this Pt.
   */
  $ceil(): Pt;
  /**
   * Rounded values for all values in this Pt.
   */
  round(): Pt;
  /**
   * Get a new Pt with rounded values of this Pt.
   */
  $round(): Pt;
  /**
   * Find the minimum value across all dimensions in this Pt.
   * @returns an object with `value` and `index` which returns the minimum value and its dimensional index
   */
  minValue(): {
    value: number;
    index: number;
  };
  /**
   * Find the maximum value across all dimensions in this Pt.
   * @returns an object with `value` and `index` which returns the maximum value and its dimensional index
   */
  maxValue(): {
    value: number;
    index: number;
  };
  /**
   * Get a new Pt that has the minimum dimensional values of this Pt and another Pt.
   * @param args can be either a list of numbers, an array, a Pt, or an object with {x,y,z,w} properties
   */
  $min(...args: any[]): Pt;
  /**
   * Get a new Pt that has the maximum dimensional values of this Pt and another Pt.
   * @param args can be either a list of numbers, an array, a Pt, or an object with {x,y,z,w} properties
   */
  $max(...args: any[]): Pt;
  /**
   * Get angle of this Pt from origin.
   * @param axis a string such as "xy" (use Const.xy) or an array to specify index for two dimensions
   */
  angle(axis?: string | number[]): number;
  /**
   * Get the signed angle between this and another Pt, normalized to [-π, π).
   * @param p the other Pt
   * @param axis a string such as "xy" (use Const.xy) or an array to specify index for two dimensions
   */
  angleBetween(p: Pt, axis?: string | number[]): number;
  /**
   * Scale this Pt from origin or from an anchor point.
   * @param scale scale ratio
   * @param anchor optional anchor point to scale from
   */
  scale(scale: number | number[] | PtLike, anchor?: PtLike): this;
  /**
   * Rotate this Pt from origin or from an anchor point in 2D.
   * @param angle rotate angle
   * @param anchor optional anchor point to scale from
   * @param axis optional string such as "yz" to specify a 2D plane
   */
  rotate2D(angle: number, anchor?: PtLike, axis?: string): this;
  /**
   * Shear this Pt from origin or from an anchor point in 2D.
   * @param scale shearing value which can be a number or an array of 2 numbers
   * @param anchor optional anchor point to scale from
   * @param axis optional string such as "yz" to specify a 2D plane
   */
  shear2D(scale: number | number[] | PtLike, anchor?: PtLike, axis?: string): this;
  /**
   * Reflect this Pt along a 2D line.
   * @param line a Group of 2 Pts that defines a line for reflection
   * @param axis optional axis such as "yz" to define a 2D plane of reflection
   */
  reflect2D(line: GroupLike, axis?: string): this;
  /**
   * A string representation of this Pt. Eg, "Pt(1, 2, 3)".
   */
  toString(): string;
  /**
   * Convert this Pt to a javascript Array.
   */
  toArray(): number[];
  /**
   * Convert this Pt to a Group as new Group([0,...], pt)
   */
  toGroup(): Group;
  /**
   * Convert this Pt to a Bound as new Group([0,...], pt)
   */
  toBound(): Bound;
}
/**
 * A Group is a subclass of standard javascript [`Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array). It should only contain Pt instances. You can think of it as an array of Float32Arrays.
 * See [Group guide](../guide/Group-0300.html) for details.
 */
declare class Group extends Array<Pt> {
  protected _id: string;
  /**
   * Create a Group by passing an array of [`Pt`](#link). You may also create a Group using [`Group.fromArray`](#link) or [`Group.fromPtArray`](#link).
   * @param args an array of Pts
   */
  constructor(...args: Pt[]);
  /**
   * ID string of this Group
   */
  get id(): string;
  set id(s: string);
  /**
   * The first Pt in this Group
   */
  get p1(): Pt;
  /**
   * The second Pt in this Group
   */
  get p2(): Pt;
  /**
   * The third Pt in this Group
   */
  get p3(): Pt;
  /**
   * The forth Pt in this Group
   */
  get p4(): Pt;
  /**
   * The last Pt in this Group
   */
  get q1(): Pt;
  /**
   * The second-last Pt in this Group
   */
  get q2(): Pt;
  /**
   * The third-last Pt in this Group
   */
  get q3(): Pt;
  /**
   * The forth-last Pt in this Group
   */
  get q4(): Pt;
  /**
   * Depp clone this group and its Pts.
   */
  clone(): Group;
  /**
   * Convert an array of numeric arrays into a Group.
   * @param list an Iterable<PtLike> such as an array or a generator (of PtLike numeric arrays)
   * @example `Group.fromArray( [[1,2], [3,4], [5,6]] )`
   */
  static fromArray(list: PtLikeIterable): Group;
  /**
   * Convert an Array/Iterable of Pt into a Group.
   * @param list an Iterable<Pt>
   */
  static fromPtArray(list: PtIterable): Group;
  /**
   * Split this Group into an array of sub-groups.
   * @param chunkSize number of items per sub-group
   * @param stride forward-steps after each sub-group
   * @param loopBack if `true`, always go through the array till the end and loop back to the beginning to complete the segments if needed
   */
  split(chunkSize: number, stride?: number, loopBack?: boolean): Group[];
  /**
   * Insert more Pt into this group.
   * @param pts a Group or an Iterable<Pt>
   * @param index the index position to insert into
   */
  insert(pts: PtIterable, index?: number): this;
  /**
   * Like Array's splice function, with support for negative index and a friendlier name.
   * @param index start index, which can be negative (where -1 is at index 0, -2 at index 1, etc)
   * @param count number of items to remove
   * @returns The items that are removed.
   */
  remove(index?: number, count?: number): Group;
  /**
   * Split this group into an array of sub-group segments.
   * @param pts_per_segment number of Pts in each segment
   * @param stride forward-step to take
   * @param loopBack if `true`, always go through the array till the end and loop back to the beginning to complete the segments if needed
   */
  segments(pts_per_segment?: number, stride?: number, loopBack?: boolean): Group[];
  /**
   * Get all the line segments (ie, edges in a graph) of this group.
   */
  lines(): Group[];
  /**
   * Find the centroid of this group's Pts, which is the average middle point.
   */
  centroid(): Pt;
  /**
   * Find the rectangular bounding box of this group's Pts.
   * @returns a Group of 2 Pts representing the top-left and bottom-right of the rectangle
   */
  boundingBox(): Group;
  /**
   * Anchor all the Pts in this Group using a target Pt as origin. (ie, subtract all Pt with the target anchor to get a relative position). All the Pts' values will be updated.
   * @param ptOrIndex a Pt, or a numeric index to target a specific Pt in this Group
   */
  anchorTo(ptOrIndex?: PtLike | number): void;
  /**
   * Anchor all the Pts in this Group by its absolute position from a target Pt. (ie, add all Pt with the target anchor to get an absolute position).  All the Pts' values will be updated.
   * @param ptOrIndex a Pt, or a numeric index to target a specific Pt in this Group
   */
  anchorFrom(ptOrIndex?: PtLike | number): void;
  /**
   * Create an operation using this Group, passing this Group into a custom function's first parameter.  See the [Op guide](../guide/Op-0400.html) for details.
   * @param fn any function that takes a Group as its first parameter
   * @example `let myOp = group.op( fn ); let result = myOp( [1,2,3] );`
   * @returns a resulting function that takes other parameters required in `fn`
   */
  op(fn: (g1: PtIterable, ...rest: any[]) => any): (...rest: any[]) => any;
  /**
   * This combines a series of operations into an array. See the [Op guide](../guide/Op-0400.html) for details.
   * @param fns an array of functions for `op`
   * @example `let myOps = pt.ops([fn1, fn2, fn3]); let results = myOps.map( (op) => op([1,2,3]) );`
   * @returns an array of resulting functions
   */
  ops(fns: ((g1: PtIterable, ...rest: any[]) => any)[]): ((...rest: any[]) => any)[];
  /**
   * Get an interpolated point on the line segments defined by this Group.
   * @param t a value between 0 to 1 usually
   */
  interpolate(t: number): Pt;
  /**
   * Move every Pt's position by a specific amount. Same as [`Group.add`](#link).
   * @param args can be either a list of numbers, an array, a Pt, or an object with {x,y,z,w} properties
   */
  moveBy(...args: any[]): this;
  /**
   * Move the first Pt in this group to a specific position, and move all the other Pts correspondingly.
   * @param args can be either a list of numbers, an array, a Pt, or an object with {x,y,z,w} properties
   */
  moveTo(...args: any[]): this;
  /**
   * Scale this group's Pts from an anchor point. Default anchor point is the first Pt in this group.
   * @param scale scale ratio
   * @param anchor optional anchor point to scale from
   */
  scale(scale: number | number[] | PtLike, anchor?: PtLike): this;
  /**
   * Rotate this group's Pt from an anchor point in 2D. Default anchor point is the first Pt in this group.
   * @param angle rotate angle
   * @param anchor optional anchor point to scale from
   * @param axis optional string such as "yz" to specify a 2D plane
   */
  rotate2D(angle: number, anchor?: PtLike, axis?: string): this;
  /**
   * Shear this group's Pt from an anchor point in 2D. Default anchor point is the first Pt in this group.
   * @param scale shearing value which can be a number or an array of 2 numbers
   * @param anchor optional anchor point to scale from
   * @param axis optional string such as "yz" to specify a 2D plane
   */
  shear2D(scale: number | number[] | PtLike, anchor?: PtLike, axis?: string): this;
  /**
   * Reflect this group's Pts along a 2D line. Default anchor point is the first Pt in this group.
   * @param line a Group or an Iterable<PtLike> with 2 Pt that defines a line for reflection
   * @param axis optional axis such as "yz" to define a 2D plane of reflection
   */
  reflect2D(line: PtLikeIterable, axis?: string): this;
  /**
   * Sort this group's Pts by values in a specific dimension.
   * @param dim dimensional index
   * @param desc if true, sort descending. Default is false (ascending)
   */
  sortByDimension(dim: number, desc?: boolean): this;
  /**
   * Update each Pt in this Group with an existing Pt function.
   * @param ptFn string name of an existing Pt function. Note that the function must return Pt.
   * @param args arguments for the function specified in ptFn
   */
  forEachPt(ptFn: string, ...args: any[]): this;
  /**
   * Apply a Vec operation to every Pt, parsing the arguments once for the whole
   * group rather than once per Pt.
   */
  protected _vecOp(fn: (a: PtLike, b: PtLike | number) => PtLike, args: any[]): this;
  /**
   * Add scalar or vector values to this group's Pts.
   * @param args can be either a list of numbers, an array, a Pt, or an object with {x,y,z,w} properties
   */
  add(...args: any[]): this;
  /**
   * Subtract scalar or vector values from this group's Pts.
   * @param args can be either a list of numbers, an array, a Pt, or an object with {x,y,z,w} properties
   */
  subtract(...args: any[]): this;
  /**
   * Multiply scalar or vector values (as element-wise) with this group's Pts.
   * @param args can be either a list of numbers, an array, a Pt, or an object with {x,y,z,w} properties
   */
  multiply(...args: any[]): this;
  /**
   * Divide this group's Pts over scalar or vector values (as element-wise).
   * @param args can be either a list of numbers, an array, a Pt, or an object with {x,y,z,w} properties
   */
  divide(...args: any[]): this;
  /**
   * Apply this group as a matrix and calculate matrix addition.
   * @param g a scalar number, an array of numeric arrays, or a group of Pt
   * @returns a new Group
   */
  $matrixAdd(g: GroupLike | number[][] | number): Group;
  /**
   * Apply this group as a matrix and calculate matrix multiplication.
   * @param g a scalar number, an array of numeric arrays, or a Group of K Pts, each with N dimensions (K-rows, N-columns) -- or if transposed is true, then N Pts with K dimensions
   * @param transposed (Only applicable if it's not elementwise multiplication) If true, then a and b's columns should match (ie, each Pt should have the same dimensions). Default is `false`.
   * @param elementwise if true, then the multiplication is done element-wise. Default is `false`.
   * @returns If not elementwise, this will return a new  Group with M Pt, each with N dimensions (M-rows, N-columns).
   */
  $matrixMultiply(g: GroupLike | number, transposed?: boolean, elementwise?: boolean): Group;
  /**
   * Zip one slice of an array of Pt. Imagine the Pts are organized in rows, then this function will take the values in a specific column.
   * @param index index to zip at
   * @param defaultValue a default value to fill if index out of bound. If not provided, it will throw an error instead.
   */
  zipSlice(index: number, defaultValue?: number | boolean): Pt;
  /**
   * Zip a group of Pt. eg, [[1,2],[3,4],[5,6]] => [[1,3,5],[2,4,6]].
   * @param defaultValue a default value to fill if index out of bound. If not provided, it will throw an error instead.
   * @param useLongest If true, find the longest list of values in a Pt and use its length for zipping. Default is false, which uses the first item's length for zipping.
   */
  $zip(defaultValue?: number | boolean | undefined, useLongest?: boolean): Group;
  /**
   * Get a Bound instance of this group
   */
  toBound(): Bound;
  /**
   * Get a string representation of this group.
   */
  toString(): string;
}
/**
 * Bound is a subclass of [`Group`](#link) that represents a rectangular boundary.
 * It includes some convenient accessors (eg, bottomRight, center) for bounding box calculations.
 */
declare class Bound extends Group implements IPt {
  protected _center: Pt;
  protected _size: Pt;
  protected _inited: boolean;
  /**
   * Create a Bound. This is similar to the Group constructor. You can also create a Bound via the static function [`Bound.fromGroup`](#link), or alternatively via the [Group.toBound](#link) function.
   * @param args a list of Pt as parameters
   * @see Bound.fromGroup
   */
  constructor(...args: Pt[]);
  /**
   * Create a Bound from a [`ClientRect`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect) object.
   * @param rect an object that has {top, left, bottom, right, width, height} properties
   * @returns a Bound object
   */
  static fromBoundingRect(rect: ClientRect): Bound;
  /**
   * Create a Bound from a Group or an array of Pts
   * @param g a Group or an Iterable<PtLike>
   */
  static fromGroup(g: PtLikeIterable): Bound;
  /**
   * Initiate the bound's properties.
   */
  protected init(): void;
  /**
   * Clone this bound and return a new one.
   */
  clone(): Bound;
  /**
   * Recalculte size and center.
   */
  protected _updateSize(): void;
  /**
   * Recalculate center.
   */
  protected _updateCenter(): void;
  /**
   * Recalculate based on top-left position and size.
   */
  protected _updatePosFromTop(): void;
  /**
   * Recalculate based on bottom-right position and size.
   */
  protected _updatePosFromBottom(): void;
  /**
   * Recalculate based on center position and size.
   */
  protected _updatePosFromCenter(): void;
  /**
   * Size of this Bound
   */
  get size(): Pt;
  set size(p: Pt);
  /**
   * Center position of this Bound
   */
  get center(): Pt;
  set center(p: Pt);
  /**
   * Top-left position of this Bound
   */
  get topLeft(): Pt;
  set topLeft(p: Pt);
  /**
   * Bottom-right position of this Bound
   */
  get bottomRight(): Pt;
  set bottomRight(p: Pt);
  /**
   * Width of this Bound
   */
  get width(): number;
  set width(w: number);
  /**
   * Height of this Bound
   */
  get height(): number;
  set height(h: number);
  /**
   * Depth of this Bound
   */
  get depth(): number;
  set depth(d: number);
  /**
   * First value of the Bound's top-left position
   */
  get x(): number | undefined;
  /**
   * Second value of the Bound's top-left position
   */
  get y(): number | undefined;
  /**
   * Third value of the Bound's top-left position
   */
  get z(): number | undefined;
  /**
   * Whether this Bound has been initiated
   */
  get inited(): boolean;
  /**
   * If the Bound's Pts are changed, call this function to update the Bound's properties.
   * It's simpler and preferable to change the Bound's properties (eg, topLeft, bottomRight) instead of updating the Bound's Pts.
   * Note that this recomputes from the current corner Pts in place; it does not replace them with fresh instances.
   */
  update(): this;
}
//#endregion
//#region src/Form.d.ts
/**
 * Form is an abstract class that represents a form that's used in a Space for expressions. Learn more about Space and Form in [this guide](../guide/Space-0500.html).
 */
declare abstract class Form {
  protected _ready: boolean;
  /**
   * get whether the Form has received the Space's rendering context.
   */
  get ready(): boolean;
}
/**
 * VisualForm is an abstract class that represents a form that can be used to express Pts visually.
 * For example, [`CanvasForm`](#link) is an implementation of VisualForm that draws on [`CanvasSpace`](#link) which represents a html canvas. Learn more about Space and Form in [this guide](../guide/Space-0500.html).
 */
declare abstract class VisualForm extends Form {
  protected _filled: boolean;
  protected _stroked: boolean;
  protected _font: Font;
  /**
   * Check whether this form currently has fill style.
   */
  get filled(): boolean;
  set filled(b: boolean);
  /**
   * Check whether this form currently has stroke style.
   */
  get stroked(): boolean;
  set stroked(b: boolean);
  /**
   * Get the current font in use in this form.
   */
  get currentFont(): Font;
  protected _multiple(groups: GroupLike[], shape: string, ...rest: unknown[]): this;
  /**
   * Abstract reset style
   */
  abstract reset(): this;
  /**
   * Set alpha (not implemented here  -- to be implemented in subclasses).
   * @param a alpha value between 0 and 1
   */
  alpha(a: number): this;
  /**
   * Set fill color (not implemented here  -- to be implemented in subclasses).
   * @param c fill color as string or `false` to specify transparent.
   */
  fill(c: string | boolean): this;
  /**
   * Set current fill style and remove stroke style. (not implemented here  -- to be implemented in subclasses).
   * @param c fill color as string or `false` to specify transparent.
   */
  fillOnly(c: string | boolean): this;
  /**
   * Set stroke style (not implemented here  -- to be implemented in subclasses).
   * @param c stroke color as string or `false` to specify transparent.
   * @param width Optional value (can be floating point) to set line width
   * @param linejoin Optional string to set line joint style. Can be "miter", "bevel", or "round".
   * @param linecap Optional string to set line cap style. Can be "butt", "round", or "square".
   */
  stroke(c: string | boolean, width?: number, linejoin?: string, linecap?: string): this;
  /**
   * Set stroke style and remove fill style. (not implemented here  -- to be implemented in subclasses).
   * @param c stroke color as string or `false` to specify transparent.
   * @param width Optional value (can be floating point) to set line width
   * @param linejoin Optional string to set line joint style. Can be "miter", "bevel", or "round".
   * @param linecap Optional string to set line cap style. Can be "butt", "round", or "square".
   */
  strokeOnly(c: string | boolean, width?: number, linejoin?: string, linecap?: string): this;
  /**
   * Draw a point (not implemented here  -- to be implemented in subclasses).
   * @param p a Pt object
   * @param radius radius of the point. Default is 5.
   * @param shape The shape of the point. Defaults to "square", but it can be "circle" or a custom shape function in your own implementation.
   * @example `form.point( p )`, `form.point( p, 10, "circle" )`
   */
  abstract point(p: PtLike, radius: number, shape: string): this;
  /**
   * Draw multiple points at once.
   * @param pts an array of Pt or an array of number arrays
   * @param radius radius of the point. Default is 5.
   * @param shape The shape of the point. Defaults to "square", but it can be "circle" or a custom shape function in your own implementation.
   */
  points(pts: GroupLike | number[][], radius: number, shape: string): this;
  /**
   * Draw a circle (not implemented here  -- to be implemented in subclasses).
   * @param pts usually a Group of 2 Pts, but it can also take an array of two numeric arrays [ [position], [size] ]
   * @see [`Circle.fromCenter`](#link)
   */
  abstract circle(pts: GroupLike | number[][]): this;
  /**
   * Draw multiple circles at once.
   * @param groups an array of Groups that defines multiple circles
   */
  circles(groups: GroupLike[]): this;
  /**
   * Draw multiple squares at once.
   * @param groups an array of Groups that defines multiple circles
   */
  squares(groups: GroupLike[]): this;
  /**
   * Draw an arc (not implemented here  -- to be implemented in subclasses).
   * @param pt center position
   * @param radius radius of the arc circle
   * @param startAngle start angle of the arc
   * @param endAngle end angle of the arc
   * @param cc an optional boolean value to specify if it should be drawn clockwise (`false`) or counter-clockwise (`true`). Default is clockwise.
   */
  abstract arc(pt: PtLike, radius: number, startAngle: number, endAngle: number, cc?: boolean): this;
  /**
   * Draw a line or polyline (not implemented here  -- to be implemented in subclasses).
   * @param pts a Group of multiple Pts, or an array of multiple numeric arrays
   */
  abstract line(pts: GroupLike | number[][]): this;
  /**
   * Draw multiple lines at once.
   * @param groups An array of Groups of Pts
   */
  lines(groups: GroupLike[]): this;
  /**
   * Draw a polygon (not implemented here  -- to be implemented in subclasses).
   * @param pts a Group of multiple Pts, or an array of multiple numeric arrays
   */
  abstract polygon(pts: GroupLike | number[][]): this;
  /**
   * Draw multiple polygons at once.
   * @param groups An array of Groups of Pts
   */
  polygons(groups: GroupLike[]): this;
  /**
   * Draw a rectangle (not implemented here  -- to be implemented in subclasses).
   * @param pts usually a Group of 2 Pts specifying the top-left and bottom-right positions. Alternatively it can be an array of numeric arrays.
   */
  abstract rect(pts: number[][] | Pt[]): this;
  /**
   * Draw multiple rectangles at once.
   * @param groups An array of Groups of Pts
   */
  rects(groups: GroupLike[]): this;
  /**
   * Draw text (not implemented here  -- to be implemented in subclasses).
   * @param pt a Pt or numeric array to specify the anchor point
   * @param txt text
   * @param maxWidth specify a maximum width per line
   */
  abstract text(pt: PtLike, txt: string, maxWidth?: number): this;
  /**
   * Set font style (not implemented here  -- to be implemented in subclasses).
   * @param sizeOrFont either a number to specify font-size, or a `Font` object to specify all font properties
   * @param weight Optional font-weight string such as "bold"
   * @param style Optional font-style string such as "italic"
   * @param lineHeight Optional line-height number suchas 1.5
   * @param family Optional font-family such as "Helvetica, sans-serif"
   * @see `Font` class
   * @example `form.font( myFont )`, `form.font(14, "bold")`
   */
  abstract font(sizeOrFont: number | Font, weight?: string, style?: string, lineHeight?: number, family?: string): this;
}
/**
 * Font class lets you create a specific font style with properties for its size and style. A font instance can be passed as parameter to set a form's font. For example, see [`CanvasForm.font`](#link).
 */
declare class Font {
  size: number;
  lineHeight: number;
  face: string;
  style: string;
  weight: string;
  /**
   * Create a font style.
   * @param size font size. Defaults is 12px.
   * @param face Optional font-family, use css-like string such as "Helvetica" or "Helvetica, sans-serif". Default is "sans-serif".
   * @param weight Optional font weight such as "bold". Default is "" (none).
   * @param style Optional font style such as "italic". Default is "" (none).
   * @param lineHeight Optional line height. Default is 1.5.
   * @example `new Font(12, "Frutiger, sans-serif", "bold", "underline", 1.5)`
   */
  constructor(size?: number, face?: string, weight?: string, style?: string, lineHeight?: number);
  /**
   * Get a string representing the font style, in css-like string such as "italic bold 12px/1.5 sans-serif".
   */
  get value(): string;
  /**
   * Get a string representing the font style, in css-like string such as "italic bold 12px/1.5 sans-serif".
   */
  toString(): string;
}
//#endregion
//#region src/Space.d.ts
/**
 * Space is an abstract class that represents a general context for expressing Pts. It's extended through subclasses such as [`CanvasSpace`](#link) and [`SVGSpace`](#link). You can also create your own extension of Space.
 * See [Space guide](../guide/Space-0500.html) for details.
 */
declare abstract class Space {
  id: string;
  protected bound: Bound;
  protected _time: ITimer;
  private _stopAfter;
  protected players: ISpacePlayers;
  protected playerCount: number;
  protected _ctx: any;
  private _animID;
  private _fromFrame;
  private _pause;
  private _refresh;
  private _renderFunc;
  protected _pointer: Pt;
  protected _isReady: boolean;
  protected _playing: boolean;
  private _firstFrame;
  /**
   * Set whether the rendering should be repainted on each frame.
   * @param b a boolean value to set whether to repaint each frame
   */
  refresh(b: boolean): this;
  /**
   * Set a minimum frame time
   * @param ms at least this amount of milliseconds must have elapsed before frame advances
   */
  minFrameTime(ms?: number): this;
  /**
   * Add an [`IPlayer`](#link) object or a [`AnimateCallbackFn`](#link) callback function to handle events in this Space. An IPlayer is an object with the following callback functions:
   * - required: `animate: fn( time, ftime, space )`
   * - optional: `start: fn(bound, space)`
   * - optional: `resize: fn( size, event )`
   * - optional: `action: fn( type, x, y, event )`
   * Subclasses of Space may define other callback functions.
   * @param p an [`IPlayer`](#link) object with animate function, or a callback function `fn(time, ftime)`.
   */
  add(p: IPlayer | AnimateCallbackFn): this;
  /**
   * Remove a player from this Space.
   * @param player an IPlayer that has an `animateID` property
   */
  remove(player: IPlayer): this;
  /**
   * Remove all players from this Space.
   */
  removeAll(): this;
  /**
   * Main play loop. This implements `window.requestAnimationFrame` and calls it recursively.
   * You may override this `play()` function to implement your own animation loop.
   * @param time current time
   */
  play(time?: number): this;
  /**
   * Replay the animation after [`Space.stop`](#link). This resets the end-time counter.
   * You may also use [`Space.pause`](#link) and [`resume`](#link) for temporary pause.
   */
  replay(): void;
  /**
   * Main animate function. This calls all the items to perform.
   * @param time current time
   */
  protected playItems(time: number): void;
  /**
   * Pause the animation.
   * @param toggle a boolean value to set if this function call should be a toggle (between pause and resume)
   */
  pause(toggle?: boolean): this;
  /**
   * Resume the pause animation.
   */
  resume(): this;
  /**
   * Specify when the animation should stop: immediately, after a time period, or never stops.
   * After stopping, use [`Space.replay`](#link) to play again.
   * @param t a value in millisecond to specify a time period to play before stopping, or `-1` to play forever, or `0` to end immediately. Default is 0 which will stop the animation immediately.
   */
  stop(t?: number): this;
  /**
   * Cancel the active animation frame immediately. Subclasses should call this
   * when they dispose browser resources instead of waiting for `stop()` to be
   * observed by the next frame.
   */
  protected _cancelAnimation(): this;
  /**
   * Play animation loop once. Optionally set a `duration` time to play for that specific duration.
   * @param duration a value in millisecond to specify a time period to play before stopping, or `-1` to play forever
   */
  playOnce(duration?: number): this;
  /**
   * Custom rendering.
   * @param context rendering context
   */
  protected render(context: any): this;
  /**
   * Set a custom rendering function `fn(graphics_context, canvas_space)` if needed.
   */
  set customRendering(f: (context: any, self: Space) => null);
  get customRendering(): (context: any, self: Space) => null;
  /**
   * Indicate whether the animation is playing.
   */
  get isPlaying(): boolean;
  /**
   * The outer bounding box which includes its positions.
   */
  get outerBound(): Bound;
  /**
   * The inner bounding box of the space, excluding its positions.
   */
  get innerBound(): Bound;
  /**
   * The size of this space's bounding box.
   */
  get size(): Pt;
  /**
   * The center of this space's bounding box.
   */
  get center(): Pt;
  /**
   * The width of this space's bounding box.
   */
  get width(): number;
  /**
   * The height of this space's bounding box.
   */
  get height(): number;
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
declare abstract class MultiTouchSpace extends Space {
  protected _pressed: boolean;
  protected _dragged: boolean;
  protected _hasMouse: boolean;
  protected _hasTouch: boolean;
  protected _hasKeyboard: boolean;
  private _mouseTarget;
  private _touchTarget;
  private _keyboardTarget;
  private _touchPassive;
  private readonly _mouseDownBind;
  private readonly _mouseUpBind;
  private readonly _mouseOverBind;
  private readonly _mouseOutBind;
  private readonly _mouseMoveBind;
  private readonly _mouseClickBind;
  private readonly _contextMenuBind;
  private readonly _touchStartBind;
  private readonly _touchMoveBind;
  private readonly _keyDownBind;
  private readonly _keyUpBind;
  protected _canvas: EventTarget;
  /**
   * Get the mouse or touch pointer that stores the last action.
   */
  get pointer(): Pt;
  /**
   * Bind event listener in canvas element. You can also use [`MultiTouchSpace.bindMouse`](#link) or [`MultiTouchSpace.bindTouch`](#link) to bind mouse or touch events conveniently.
   * @param evt an event string such as "mousedown"
   * @param callback callback function for this event
   * @param options options for [addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener).
   * @param customTarget an optional event target to use instead of the canvas element
   */
  bindCanvas(evt: string, callback: EventListener, options?: any, customTarget?: Element): void;
  /**
   * Unbind a callback from the event listener.
   * @param evt an event string such as "mousedown"
   * @param callback callback function to unbind
   * @param options options for [removeEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener). This should match the options set in bindCanvas.
   * @param customTarget If customTarget is set in bindCanvas, you'll need to pass the same instance here to unbind
   */
  unbindCanvas(evt: string, callback: EventListener, options?: any, customTarget?: Element): void;
  bindDoc(evt: string, callback: EventListener, options?: any): void;
  unbindDoc(evt: string, callback: EventListener, options?: any): void;
  /**
   * A convenient method to bind (or unbind) all mouse events in canvas element.
   * All [`IPlayer`](#link) objects added to this space that implement an `action` callback property will receive mouse event callbacks.
   * Mouse action names are defined by [`UIPointerActions`](#link), including "up", "down", "move", "drag", "drop", "over", "out", "click", "pointerdown", "pointerup", and "contextmenu".
   * @param bind a boolean value to bind mouse events if set to `true`. If `false`, all mouse events will be unbound. Default is true.
   * @param customTarget an optional event target to use instead of the canvas element
   * @see [`Space.add`](#link)
   */
  bindMouse(bind?: boolean, customTarget?: Element): this;
  /**
   * A convenient method to bind (or unbind) all touch events in canvas element.
   * All [`IPlayer`](#link) objects added to this space that implement an `action` callback property will receive touch event callbacks.
   * Touch action names are defined by [`UIPointerActions`](#link), including "up", "down", "move", "drag", "drop", "over", and "out".
   * @param bind a boolean value to bind touch events if set to `true`. If `false`, all touch events will be unbound. Default is true.
   * @param passive a boolean value to set passive mode, ie, it won't block scrolling. Default is false.
   * @param customTarget an optional event target to use instead of the canvas element
   * @see [`Space.add`](#link)
   */
  bindTouch(bind?: boolean, passive?: boolean, customTarget?: Element): this;
  /**
   * Bind or unbind keyboard events. Events are attached to `document` by
   * default, or to `customTarget` when one is provided.
   */
  bindKeyboard(bind?: boolean, customTarget?: EventTarget): this;
  /** Unbind all pointer, touch, and keyboard listeners owned by this space. */
  protected _unbindAll(): this;
  private _trackedUIs;
  private _uiPlayer;
  /** Remove all players and the UI registrations forwarded by them. */
  removeAll(): this;
  /**
   * Track one or more [`UI`](#link) elements: every pointer, touch, and keyboard
   * action dispatched by this space is forwarded to them via [`UI.track`](#link),
   * so no manual `action` wiring is needed. Remember to also bind the events,
   * eg via [`MultiTouchSpace.bindMouse`](#link). Keyboard actions are forwarded
   * too (their x/y carry the shift/alt flags, as the space dispatches them).
   * @param uis a UI, or an array of UIs
   */
  track(uis: UI | UI[]): this;
  /**
   * Stop tracking one or more [`UI`](#link) elements added via [`MultiTouchSpace.track`](#link).
   * @param uis a UI or an array of UIs to remove from tracking, or omit to stop tracking all
   */
  untrack(uis?: UI | UI[]): this;
  private _inputTransform;
  /**
   * A convenient method to convert the touch points in a touch event to an array of Pts.
   * @param evt a touch event which contains touches, changedTouches, and targetTouches list
   * @param which a string to select a touches list: "touches", "changedTouches", or "targetTouches". Default is "touches"
   * @return an array of Pt, whose origin position (0,0) is offset to the top-left of this space
   */
  touchesToPoints(evt: TouchEvent, which?: TouchPointsKey): Pt[];
  /**
   * Go through all the added [`IPlayer`](#link) objects and call its `action` callback function.
   * @param type a [`UIPointerActions`](#link) constant or custom action string
   * @param evt mouse or touch event
   * @see [`Space.add`](#link)
   */
  protected _mouseAction(type: string, evt: MouseEvent | TouchEvent | PointerEvent): void;
  private _isTouchHandled;
  /**
   * MouseDown handler.
   * @param evt
   */
  protected _mouseDown(evt: PointerEvent): boolean;
  /**
   * MouseUp handler.
   * @param evt
   */
  protected _mouseUp(evt: PointerEvent | TouchEvent): boolean;
  /**
   * MouseMove handler.
   * @param evt
   */
  protected _mouseMove(evt: PointerEvent): boolean;
  /**
   * MouseOver handler.
   * @param evt
   */
  protected _mouseOver(evt: PointerEvent): boolean;
  /**
   * MouseOut handler.
   * @param evt
   */
  protected _mouseOut(evt: PointerEvent | TouchEvent): boolean;
  /**
   * MouseClick handler.
   * @param evt
   */
  protected _mouseClick(evt: MouseEvent | TouchEvent): boolean;
  /**
   * ContextMenu handler.
   * @param evt
   */
  protected _contextMenu(evt: MouseEvent): boolean;
  /**
   * TouchMove handler.
   * @param evt
   */
  protected _touchMove(evt: TouchEvent): boolean;
  /**
   * TouchStart handler.
   * @param evt
   */
  protected _touchStart(evt: TouchEvent): boolean;
  protected _keyDown(evt: KeyboardEvent): boolean;
  protected _keyUp(evt: KeyboardEvent): boolean;
  protected _keyboardAction(type: string, evt: KeyboardEvent): void;
}
//#endregion
//#region src/LinearAlgebra.d.ts
/**
 * Vec provides various static functions for vector operations. It's not fully optimized but good enough to use.
 */
declare class Vec {
  /**
   * Add `b` to vector `a`. Unlike `multiply`/`divide`, a shorter `b` is tolerated: missing (or NaN) dimensions are treated as 0.
   * @returns vector `a`
   */
  static add(a: PtLike, b: PtLike | number): PtLike;
  /**
   * Subtract `b` from vector `a`. Unlike `multiply`/`divide`, a shorter `b` is tolerated: missing (or NaN) dimensions are treated as 0.
   * @returns vector `a`
   */
  static subtract(a: PtLike, b: PtLike | number): PtLike;
  /**
   * Multiply `b` with vector `a`.
   * @returns vector `a`
   */
  static multiply(a: PtLike, b: PtLike | number): PtLike;
  /**
   * Divide `a` over `b`.
   * @returns vector `a`
   */
  static divide(a: PtLike, b: PtLike | number): PtLike;
  /**
   * Dot product of `a` and `b`.
   */
  static dot(a: PtLike, b: PtLike): number;
  /**
   * 2D cross product of `a` and `b`.
   */
  static cross2D(a: PtLike, b: PtLike): number;
  /**
   * 3D Cross product of `a` and `b`.
   */
  static cross(a: PtLike, b: PtLike): Pt;
  /**
   * Magnitude of `a`.
   */
  static magnitude(a: PtLike): number;
  /**
   * Unit vector of `a`. If magnitude of `a` is already known, pass it in the second paramter to optimize calculation.
   */
  static unit(a: PtLike, magnitude?: number | undefined): PtLike;
  /**
   * Set `a` to its absolute value in each dimension.
   * @returns vector `a`
   */
  static abs(a: PtLike): PtLike;
  /**
   * Set `a` to its floor value in each dimension.
   * @returns vector `a`
   */
  static floor(a: PtLike): PtLike;
  /**
   * Set `a` to its ceiling value in each dimension.
   * @returns vector `a`
   */
  static ceil(a: PtLike): PtLike;
  /**
   * Set `a` to its rounded value in each dimension.
   * @returns vector `a`
   */
  static round(a: PtLike): PtLike;
  /**
   * Find the max value within a vector's dimensions.
   * @returns an object with `value` and `index` that specifies the max value and its corresponding dimension.
   */
  static max(a: PtLike): {
    value: number;
    index: number;
  };
  /**
   * Find the min value within a vector's dimensions.
   * @returns an object with `value` and `index` that specifies the min value and its corresponding dimension.
   */
  static min(a: PtLike): {
    value: number;
    index: number;
  };
  /**
   * Add up all the dimensions' values and returns a scalar of the sum.
   */
  static sum(a: PtLike): number;
  /**
   * Given a mapping function, update `a`'s value in each dimension.
   * @returns vector `a`
   */
  static map(a: PtLike, fn: (n: number, index: number, arr: PtLike) => number): PtLike;
}
/**
 * Mat provides various static functions for matrix operations as well as a convenient way to chain a 3x3 transformation matrix. It's not fully optimized but good enough to use.
 */
declare class Mat {
  protected _33: GroupLike;
  constructor();
  /**
   * Get the current value of its stored 3x3 matrix
   */
  get value(): GroupLike;
  /**
   * Convert the value of its stored 3x3 matrix to a 2D [`DOMMatrix`](https://developer.mozilla.org/en-US/docs/Web/API/DOMMatrix) instance
   */
  get domMatrix(): DOMMatrix;
  /**
   * Reset the internal 3x3 matrix to its identity
   */
  reset(): void;
  /**
   * Scale the internal 3x3 matrix. You can chain this function with other related functions.
   * @param val [x, y] scale factors
   * @param at Optional origin location to scale from.
   */
  scale2D(val: PtLike, at?: PtLike): this;
  /**
   * Scale the internal 3x3 matrix. You can chain this function with other related functions.
   * @param ang Angle of rotation
   * @param at Optional origin location to rotate from.
   */
  rotate2D(ang: number, at?: PtLike): this;
  /**
   * Translate the internal 3x3 matrix. You can chain this function with other related functions.
   * @param val [x, y] offset values
   */
  translate2D(val: PtLike): this;
  /**
   * Shear the internal 3x3 matrix. You can chain this function with other related functions.
   * @param val [x, y] shear factors (before tan() operation)
   * @param at Optional origin location to scale from.
   */
  shear2D(val: PtLike, at?: PtLike): this;
  /**
   * Matrix addition. Matrices should have the same rows and columns.
   * @param a a group of Pt
   * @param b a scalar number, an array of numeric arrays, or a group of Pt
   * @returns a new group with the same rows and columns as a and b
   */
  static add(a: GroupLike, b: GroupLike | number[][] | number): Group;
  /**
   * Matrix multiplication.
   * @param a a Group of M Pts, each with K dimensions (M-rows, K-columns)
   * @param b a scalar number, an array of numeric arrays, or a Group of K Pts, each with N dimensions (K-rows, N-columns) -- or if transposed is true, then N Pts with K dimensions
   * @param transposed (Only applicable if it's not elementwise multiplication) If true, then a and b's columns should match (ie, each Pt should have the same dimensions). Default is `false`.
   * @param elementwise if true, then the multiplication is done element-wise. Default is `false`.
   * @returns If not elementwise, this will return a new group with M Pt, each with N dimensions (M-rows, N-columns).
   */
  static multiply(a: GroupLike, b: GroupLike | number[][] | number, transposed?: boolean, elementwise?: boolean): Group;
  /**
   * Zip one slice of an array of Pts. For example, if the input `g` are organized in rows, then this function will take the values in a specific column.
   * @param g a group of Pt
   * @param index index to zip at
   * @param defaultValue a default value to fill if index out of bound. If not provided, it will throw an error instead.
   */
  static zipSlice(g: GroupLike | number[][], index: number, defaultValue?: number | boolean): Pt;
  /**
   * Zip a group of Pt. For example, `[[1,2],[3,4],[5,6]]` will become `[[1,3,5],[2,4,6]]`.
   * @param g a group of Pt
   * @param defaultValue a default value to fill if index out of bound. If not provided, it will throw an error instead.
   * @param useLongest If true, find the longest list of values in a Pt and use its length for zipping. Default is false, which uses the first item's length for zipping.
   */
  static zip(g: GroupLike | number[][], defaultValue?: number | boolean, useLongest?: boolean): Group;
  /**
   * Same as `zip` function.
   */
  static transpose(g: GroupLike | number[][], defaultValue?: number | boolean, useLongest?: boolean): Group;
  static toDOMMatrix(m: GroupLike | number[][]): number[];
  /**
   * Transform a 2D point given a 2x3 or 3x3 matrix.
   * @param pt a Pt to be transformed
   * @param m 2x3 or 3x3 matrix
   * @returns a new transformed Pt
   */
  static transform2D(pt: PtLike, m: GroupLike | number[][]): Pt;
  /**
   * Get a scale matrix for use in `transform2D`.
   */
  static scale2DMatrix(x: number, y: number): GroupLike;
  /**
   * Get a rotate matrix for use in `transform2D`.
   */
  static rotate2DMatrix(cosA: number, sinA: number): GroupLike;
  /**
   * Get a shear matrix for use in `transform2D`.
   */
  static shear2DMatrix(tanX: number, tanY: number): GroupLike;
  /**
   * Get a translate matrix for use in `transform2D`.
   */
  static translate2DMatrix(x: number, y: number): GroupLike;
  /**
   * Get a matrix to scale a point from an origin point. For use in `transform2D`.
   */
  static scaleAt2DMatrix(sx: number, sy: number, at: PtLike): GroupLike;
  /**
   * Get a matrix to rotate a point from an origin point. For use in `transform2D`.
   */
  static rotateAt2DMatrix(cosA: number, sinA: number, at: PtLike): GroupLike;
  /**
   * Get a matrix to shear a point from an origin point. For use in `transform2D`.
   */
  static shearAt2DMatrix(tanX: number, tanY: number, at: PtLike): GroupLike;
  /**
   * Get a matrix to reflect a point along a line. For use in `transform2D`.
   * @param p1 first end point to define the reflection line
   * @param p1 second end point to define the reflection line
   */
  static reflectAt2DMatrix(p1: PtLike, p2: PtLike): Pt[];
}
//#endregion
//#region src/Image.d.ts
/**
 * Options for creating an [`Img`](#link).
 */
type ImgOptions = {
  /** Specify if you want to manipulate pixels of this image. Default is `false`. */
  editable?: boolean;
  /** Set the `CanvasSpace` reference so the image's pixelScale matches the canvas. */
  space?: CanvasSpace;
  /** Enable loading cross-domain images. The image server must also allow it. */
  crossOrigin?: boolean;
  /** Set a specific pixel scale, overriding the space's. */
  pixelScale?: number;
};
/**
 * Img provides convenient functions to support image operations on HTML Canvas and [`CanvasSpace`](#link). Combine this with other Pts functions to experiment with visual forms that integrate bitmaps and vector graphics.
 */
declare class Img {
  protected _img: HTMLImageElement;
  protected _data: ImageData;
  protected _cv: HTMLCanvasElement;
  protected _ctx: RenderingContext2D;
  protected _scale: number;
  protected _loaded: boolean;
  protected _editable: boolean;
  protected _space: CanvasSpace | undefined;
  protected _patternCtx: RenderingContext2D;
  protected _objectUrl: string | null;
  private _pendingLoadReject;
  private _disposed;
  protected _dataDirty: boolean;
  /**
   * Create an Img
   * @param editable either an [`ImgOptions`](#link) object, or a boolean specifying if you want to manipulate pixels of this image. Default is `false`.
   * @param space Set the `CanvasSpace` reference. This is optional but will make sure the image's pixelScale match the canvas and set the context for creating pattern.
   * @param crossOrigin an optional parameter to enable loading cross-domain images if set to true. The image server's configuration must also be set correctly. For more, see [this documentation](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image).
   * @example `new Img(true, space)`, `new Img({ editable: true, pixelScale: 2 })`
   */
  constructor(editable?: boolean | ImgOptions, space?: CanvasSpace, crossOrigin?: boolean);
  /**
   * A static function to load an image, returning a Promise that resolves to the loaded Img.
   * A load failure rejects the Promise.
   * @param src an url of the image in same domain. Alternatively you can use a base64 string. To load from Blob, use `Img.fromBlob`.
   * @param editable either an [`ImgOptions`](#link) object, or a boolean specifying if you want to manipulate pixels of this image. Default is `false`.
   * @param space Set the `CanvasSpace` reference. This is optional but will make sure the image's pixelScale match the canvas and set the context for creating pattern.
   * @param ready An optional callback, invoked with the Img when loading succeeds
   * @example `const img = await Img.load("photo.jpg", true)`
   */
  static load(src: string, editable?: boolean | ImgOptions, space?: CanvasSpace, ready?: (img: Img) => void): Promise<Img>;
  /**
   * A static method to load an image using async/await.
   * @deprecated Use [`Img.load`](#link), which now returns a Promise.
   * @param src an url of the image in same domain. Alternatively you can use a base64 string. To load from Blob, use `Img.fromBlob`.
   * @param editable Specify if you want to manipulate pixels of this image. Default is `false`.
   * @param space Set the `CanvasSpace` reference. This is optional but will make sure the image's pixelScale match the canvas and set the context for creating pattern.
   */
  static loadAsync(src: string, editable?: boolean | ImgOptions, space?: CanvasSpace): Promise<Img>;
  /**
   * A static method to load an image pattern using async/await.
   * @param src an url of the image in same domain. Alternatively you can use a base64 string. To load from Blob, use `Img.fromBlob`.
   * @param space Set the `CanvasSpace` reference. This is optional but will make sure the image's pixelScale match the canvas and set the context for creating pattern.
   * @param repeat set how the pattern will repeat fills
   * @param editable Specify if you want to manipulate pixels of this image. Default is `false`.
   * @returns a `CanvasPattern` instance for use in `fill()`
   */
  static loadPattern(src: string, space: CanvasSpace, repeat?: CanvasPatternRepetition, editable?: boolean): Promise<CanvasPattern>;
  /**
   * Create an editable blank image
   * @param size of image
   * @param space Optionally set the `CanvasSpace` reference. This is optional but will make sure the image's pixelScale match the canvas and set the context for creating pattern.
   * @param scale Optionally set a specific pixel scale (density) of the image canvas.
   */
  static blank(size: PtLike, space?: CanvasSpace, scale?: number): Img;
  /**
   * Load an image.
   * @param src an url of the image in same domain. Alternatively you can use a base64 string. To load from Blob, use `Img.fromBlob`.
   * @returns a Promise that resolves to an Img
   */
  load(src: string): Promise<Img>;
  /**
   * Swap the underlying image's source and await its load — without the editable
   * pipeline. Shared by `load()` and `sync()` so both respect the supersede rule.
   */
  protected _loadImageSrc(src: string): Promise<void>;
  /** Refresh the cached `ImageData` from the current canvas. */
  protected _refreshData(): void;
  /** Materialize the cached `ImageData` lazily, on first read after a change. */
  protected _ensureData(): void;
  /**
   * Rescale the canvas and draw an image-source on it.
   * @param canvasScale rescale factor for the canvas
   * @param img an image source like Image, Canvas, or ImageBitmap.
   */
  protected _drawToScale(canvasScale: number | PtLike, img: HTMLImageElement | HTMLCanvasElement | ImageBitmap | OffscreenCanvas | HTMLVideoElement): void;
  /**
   * Initiate an editable canvas
   * @param width width of canvas
   * @param height height of canvas
   * @param canvasScale pixel scale
   */
  initCanvas(width: number, height: number, canvasScale?: number | PtLike): void;
  /**
   * Internal canvas setup without the pixel-data refresh — callers that draw
   * immediately afterwards refresh once after their draw instead.
   */
  protected _initCanvas(width: number, height: number, canvasScale?: number | PtLike): void;
  /**
   * Get an efficient, readonly bitmap of the current canvas.
   * @param size Optional size to crop
   * @returns a Promise that resolves to an ImageBitmap
   */
  bitmap(size?: PtLike): Promise<ImageBitmap>;
  /**
   * Create a canvas pattern for `fill()`
   * @param reptition set how the pattern should repeat-fill
   * @param dynamic If true, use this Img's internal canvas content as pattern fill. This enables the pattern to update dynamically.
   * @returns a `CanvasPattern` instance for use in `fill()`
   */
  pattern(reptition?: CanvasPatternRepetition, dynamic?: boolean): CanvasPattern;
  /**
   * Replace the image with the current canvas data. For example, you can use CanvasForm's static functions to draw on `this.ctx` and then update the current image.
   * To display the internal canvas, use `form.image( [0, 0], img.current )`.
   */
  sync(): Promise<Img>;
  /**
   * Get the RGBA values of a pixel in the image
   * @param p position of the pixel
   * @param rescale Specify if the pixel position should be scaled. Usually use rescale when tracking image and don't rescale when tracking canvas. You may also set a custom scale value.
   * @returns [R,G,B,A] values of the pixel at the specific position
   */
  pixel(p: PtLike, rescale?: boolean | number): Pt;
  /**
   * Set the RGBA values of a pixel in the cached `ImageData`. Call [`Img.updatePixels`](#link)
   * to write the changes onto the canvas.
   * @param p position of the pixel
   * @param rgba [R,G,B,A] values, 0-255
   * @param rescale Specify if the pixel position should be scaled, matching [`Img.pixel`](#link)
   */
  setPixel(p: PtLike, rgba: PtLike, rescale?: boolean | number): this;
  /**
   * Refresh the cached `ImageData` from the canvas — call this after drawing on the
   * canvas (eg, via [`Img.getForm`](#link)) before reading pixels.
   */
  loadPixels(): this;
  /**
   * Write the cached `ImageData` (eg, after [`Img.setPixel`](#link) calls) back onto
   * the canvas.
   */
  updatePixels(): this;
  /**
   * Given an ImaegData object and a position, return the RGBA pixel value at that position.
   * @param imgData an ImageData object
   * @param p a position on the image
   * @returns [R,G,B,A] values of the pixel at the specific position
   */
  static getPixel(imgData: ImageData, p: PtLike): Pt;
  /**
   * Resize the canvas image. The original image is unchanged until `sync()`.
   * @param sizeOrScale A PtLike array specifying either [x, y] scales or [x, y] sizes.
   * @param asScale If true, treat the first parameter as scales. Otherwise, treat it as specific sizes.
   */
  resize(sizeOrScale: PtLike, asScale?: boolean): this;
  /**
   * Crop an area of the image.
   * @param box bounding box
   */
  crop(box: Bound): ImageData;
  /**
   * Apply filters such as blur and grayscale to the canvas image. The original image is unchanged until `sync()`.
   * @param css a css filter string such as "blur(10px) contrast(200%)". See [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/filter#browser_compatibility) for a list of filter functions.
   */
  filter(css: string): this;
  /**
   * Dispose of the elements, data, and any object URL associated with this Img. Pending loads reject; the instance should not be reused.
   */
  dispose(): this;
  /**
   * Remove the elements and data associated with this Img.
   * @deprecated Use [`Img.dispose`](#link).
   */
  cleanup(): void;
  /**
   * Create a blob url that can be passed to `Img.load`
   * @param blob an image blob such as `new Blob([my_Uint8Array], {type: 'image/png'})`
   * @param editable Specify if you want to manipulate pixels of this image. Default is `false`.
   */
  static fromBlob(blob: Blob, editable?: boolean | ImgOptions, space?: CanvasSpace): Promise<Img>;
  /**
   * Convert ImageData object to a Blob, which you can then create an Img instance via [`Img.fromBlob`](#link). Note that the resulting image's dimensions will not account for pixel density.
   * @param data
   */
  static imageDataToBlob(data: ImageData): Promise<Blob>;
  /**
   * Export current canvas image as base64 string
   */
  toBase64(): string;
  /**
   * Export current canvas image as a blob
   */
  toBlob(): Promise<Blob>;
  /**
   * Get a CanvasForm for drawing on the internal canvas if this Img is editable
   */
  getForm(): CanvasForm | undefined;
  /**
   * Get current image source. If editable, this will return the canvas, otherwise it will return the original image.
   */
  get current(): CanvasImageSource;
  /**
   * Get the original image
   */
  get image(): HTMLImageElement;
  /**
   * Get the internal canvas
   */
  get canvas(): HTMLCanvasElement;
  /**
   * Get the internal canvas' ImageData
   */
  get data(): ImageData;
  /**
   * Get the internal canvas' context. You can use this to draw directly on canvas, or create a new [CanvasForm](#link) instance with it.
   */
  get ctx(): RenderingContext2D;
  /**
   * Get whether the image is loaded
   */
  get loaded(): boolean;
  /**
   * Get pixel density scale
   */
  get pixelScale(): number;
  /**
   * Get size of the original image
   */
  get imageSize(): Pt;
  /**
   * Get size of the canvas
   */
  get canvasSize(): Pt;
  /**
   * Get a Mat instance with a scale transform based on current `pixelScale`.
   * This can be useful for generating a domMatrix for transforming patterns consistently across different pixel-density screens.
   * @example `img.scaledMatrix.translate2d(...).rotate2D(...).domMatrix`
   */
  get scaledMatrix(): Mat;
}
//#endregion
//#region src/Canvas.d.ts
/**
 * CanvasSpace is an implementation of the abstract class [`Space`](#link). It represents a space for HTML Canvas.
 * Learn more about the concept of Space in [this guide](../guide/Space-0500.html).
 */
declare class CanvasSpace extends MultiTouchSpace {
  protected _canvas: HTMLCanvasElement;
  protected _container: Element;
  protected _pixelScale: number;
  protected _bgcolor: string;
  protected _ctx: CanvasRenderingContext2D;
  protected _offscreen: boolean;
  protected _offCanvas: HTMLCanvasElement;
  protected _offCtx: RenderingContext2D;
  protected _resizeObserver: ResizeObserver | undefined;
  protected _autoResize: boolean;
  protected _initialResize: boolean;
  private _readyObserver;
  private _readyTimer;
  private _disposed;
  private _ownsCanvas;
  private _ownsContainer;
  /**
   * Create a CanvasSpace which represents a HTML Canvas Space
   * @param elem Specify an element by its "id" attribute as string, or by the element object itself. An element can be an existing `<canvas>`, or a `<div>` container in which a new `<canvas>` will be created. If left empty, a `<div id="pt_container"><canvas id="pt" /></div>` will be added to DOM. Use css to customize its appearance if needed.
   * @param callback an optional callback `function(boundingBox, spaceElement)` to be called when canvas is appended and ready. Alternatively, a "ready" event will also be fired from the `<canvas>` element when it's appended, which can be traced with `spaceInstance.canvas.addEventListener("ready")`
   * @example `new CanvasSpace( "#myElementID" )`
   */
  constructor(elem?: string | Element | null, callback?: (bound: Bound, elem: EventTarget) => void);
  /**
   * Helper function to create a DOM element
   * @param elem element tag name
   * @param id element id attribute
   */
  protected _createElement(elem: string | undefined, id: string): HTMLElement;
  /**
   * Handle callbacks after element is mounted in DOM
   * @param callback
   */
  private _ready;
  /**
   * Set up various options for CanvasSpace. The `opt` parameter is an object with the following fields. This is usually set during instantiation, eg `new CanvasSpace(...).setup( { opt } )`
   * @param opt a [`CanvasSpaceOptions`](#link) object with optional settings, ie `{ bgcolor:string, resize:boolean, retina:boolean, offscreen:boolean, pixelDensity:number }`. Note that omitting `bgcolor` sets a transparent background (a long-standing behavior that differs from `DOMSpace.setup`, which keeps the current background when the option is absent).
   * @example `space.setup({ bgcolor: "#f00", retina: true, resize: true })`
   */
  setup(opt: CanvasSpaceOptions): this;
  /**
   * Set whether the canvas element should resize when its container is resized.
   * @param auto a boolean value indicating if auto size is set
   */
  set autoResize(auto: boolean);
  get autoResize(): boolean;
  /**
   * This overrides Space's `resize` function. It's used as a callback function for window's resize event and not usually called directly. You can keep track of resize events with `resize: (bound ,evt)` callback in your player objects.
   * @param b a Bound object to resize to
   * @param evt Optionally pass a resize event
   * @see Space.add
   */
  resize(b: Bound, evt?: Event | null): this;
  /**
   * Window resize handling
   * @param evt
   */
  protected _resizeHandler(evt: Event | null): void;
  /**
    * Set a background color for this canvas. Alternatively, you may use `clear()` function.
    @param bg background color as hex or rgba string
    */
  set background(bg: string);
  get background(): string;
  /**
   * `pixelScale` property returns a number that let you determine if the screen is "retina" (when value >= 2)
   */
  get pixelScale(): number;
  /**
   * Check if an offscreen canvas is created
   */
  get hasOffscreen(): boolean;
  /**
   * Get the rendering context of offscreen canvas (if created via `setup()`)
   */
  get offscreenCtx(): RenderingContext2D;
  /**
   * Get the offscreen canvas element
   */
  get offscreenCanvas(): HTMLCanvasElement;
  /**
   * Get a new `CanvasForm` for drawing
   * @see `CanvasForm`
   */
  getForm(): CanvasForm;
  /**
   * Get the html canvas element
   */
  get element(): HTMLCanvasElement;
  /**
   * Get the parent element that contains the canvas element
   */
  get parent(): Element;
  /**
   * A property to indicate if the Space is ready
   */
  get ready(): boolean;
  /**
   * Get the rendering context of canvas
   * @example `form.ctx.clip()`
   */
  get ctx(): CanvasRenderingContext2D;
  /**
   * Clear the canvas with its background color. Overrides Space's `clear` function.
   * @param bg Optionally specify a custom background color in hex or rgba string, or "transparent". If not defined, it will use its `bgcolor` property as background color to clear the canvas.
   */
  clear(bg?: string): this;
  /**
   * Similiar to `clear()` but clear the offscreen canvas instead
   * @param bg Optionally specify a custom background color in hex or rgba string, or "transparent". If not defined, it will use its `bgcolor` property as background color to clear the canvas.
   */
  clearOffscreen(bg?: string | null): this;
  /**
   * Main animation function.
   * @param time current time
   */
  protected playItems(time: number): void;
  /**
   * Dispose of browser resources held by this space and remove all players. Call this before unmounting the canvas.
   */
  dispose(): this;
  /**
   * Get a [`MediaRecorder`](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder) to record the current CanvasSpace. You can then call its `start()` function to start recording, and `stop()` to either download the video file or handle the blob data in the callback function you provided.
   * @param downloadOrCallback Either `true` to download the video, or provide a callback function to handle the Blob data, when recording is completed.
   * @param filetype video format. Default is "webm".
   * @param bitrate bitrate per second
   * @example `let rec = space.recorder(true); rec.start(); setTimeout( () => rec.stop(), 5000); // record 5s of video and download the file`
   */
  recorder(downloadOrCallback: boolean | ((blobURL: string) => {}), filetype?: string, bitrate?: number): MediaRecorder;
}
declare class CanvasForm<S extends MultiTouchSpace = CanvasSpace> extends VisualForm {
  protected _space: CanvasSpace;
  protected _ctx: RenderingContext2D;
  protected _estimateTextWidth: TextMeasure | undefined;
  protected _estimateMode: "sample" | "char" | undefined;
  private _styleCache;
  private _styleCacheCtx;
  /** Get the style cache shared by all forms drawing on this context. */
  protected _cacheForCtx(): Record<string, unknown>;
  /**
   * Forget the cached style values for a rendering context, so every
   * subsequent style write applies. Call this after anything that resets or
   * desyncs a context's state outside a form — most commonly assigning a
   * canvas's `width` or `height`, which resets the context to its defaults.
   * (Within a form, [`CanvasForm.reset`](#link) is the equivalent recovery.)
   * @param ctx the rendering context to forget
   */
  static resetStyleCache(ctx: RenderingContext2D | object): void;
  /**
   * Write a context style property only when it differs from the last value
   * written to this context. After setting style properties directly on
   * [`CanvasForm.ctx`](#link), call [`CanvasForm.reset`](#link) to resync.
   */
  protected _set(key: string, value: unknown): void;
  /**
   * store common styles so that they can be restored to canvas context when using multiple forms. See `reset()`.
   */
  protected _style: DefaultFormStyle;
  /**
   * Create a new CanvasForm. You may also use [`CanvasSpace.getForm()`](#link) to get the default form.
   * @param space an instance of CanvasSpace, or a rendering context. Passing a context is the
   * renderer extension point: any object implementing the context surface documented in
   * [`SVGContext2D`](#link) (the reference implementation) receives this form's full drawing
   * API — this is how SVG output works, and how custom renderers can be built.
   */
  constructor(space?: CanvasSpace | RenderingContext2D);
  /**
   * get the CanvasSpace instance that this form is associated with
   */
  get space(): S;
  /**
   * Get the rendering context of canvas to perform other canvas functions.
   * @example `form.ctx.clip()`
   */
  get ctx(): RenderingContext2D;
  /**
   * Toggle whether to draw on offscreen canvas (if offscreen is set in CanvasSpace)
   * @param off if `true`, draw on offscreen canvas instead of the visible canvas. Default is `true`
   * @param clear optionally provide a valid color string to fill a bg color. see CanvasSpace's `clearOffscreen` function.
   */
  useOffscreen(off?: boolean, clear?: boolean | string): this;
  /**
   * Render the offscreen canvas's content on the visible canvas
   * @param offset Optional offset on the top-left position when drawing on the visible canvas
   */
  renderOffscreen(offset?: PtLike): void;
  /**
   * Set current alpha value.
   * @example `form.alpha(0.6)`
   * @param a alpha value between 0 and 1
   */
  alpha(a: number): this;
  /**
   * Set current fill style. Provide a valid color string such as `"#FFF"` or `"rgba(255,0,100,0.5)"` or `false` to specify no fill color.
   * @example `form.fill("#F90")`, `form.fill("rgba(0,0,0,.5")`, `form.fill(false)`
   * @param c fill color which can be as color, gradient, or pattern. (See [canvas documentation](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillStyle))
   */
  fill(c: string | boolean | CanvasGradient | CanvasPattern): this;
  /**
   * Set current fill style and remove stroke style.
   * @param c fill color which can be as color, gradient, or pattern. (See [canvas documentation](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillStyle))
   */
  fillOnly(c: string | boolean | CanvasGradient | CanvasPattern): this;
  /**
   * Set current stroke style. Provide a valid color string or `false` to specify no stroke color.
   * @example `form.stroke("#F90")`, `form.stroke("rgba(0,0,0,.5")`, `form.stroke(false)`, `form.stroke("#000", 0.5, 'round', 'square')`
   * @param c stroke color which can be as color, gradient, or pattern. (See [canvas documentation](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/strokeStyle))
   * @param width Optional value (can be floating point) to set line width
   * @param linejoin Optional string to set line joint style. Can be "miter", "bevel", or "round".
   * @param linecap Optional string to set line cap style. Can be "butt", "round", or "square".
   */
  stroke(c: string | boolean | CanvasGradient | CanvasPattern, width?: number, linejoin?: CanvasLineJoin, linecap?: CanvasLineCap): this;
  /**
   * Set stroke style and remove fill style.
   * @param c stroke color which can be as color, gradient, or pattern. (See [canvas documentation](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/strokeStyle))
   * @param width Optional value (can be floating point) to set line width
   * @param linejoin Optional string to set line joint style. Can be "miter", "bevel", or "round".
   * @param linecap Optional string to set line cap style. Can be "butt", "round", or "square".
   */
  strokeOnly(c: string | boolean | CanvasGradient | CanvasPattern, width?: number, linejoin?: CanvasLineJoin, linecap?: CanvasLineCap): this;
  /**
   * A convenient function to apply fill and/or stroke after custom drawings using canvas context (eg, `form.ctx.ellipse(...)`).
   * You don't need to call this function if you're using Pts' drawing functions like `form.point` or `form.rect`
   * @param filled apply fill when set to `true`
   * @param stroked apply stroke when set to `true`
   * @param strokeWidth optionally set a stroke width
   * @example `form.ctx.beginPath(); form.ctx.ellipse(...); form.applyFillStroke();`
   */
  applyFillStroke(filled?: boolean | string, stroked?: boolean | string, strokeWidth?: number): this;
  /**
   * This function takes an array of gradient colors, and returns a function to define the areas of the gradient fill. See demo code in [CanvasForm.gradient](https://ptsjs.org/demo/?name=canvasform.textBox).
   * @param stops an array of gradient stops. This can be an array of colors `["#f00", "#0f0", ...]` for evenly distributed gradient, or an array of [stop, color] like `[[0.1, "#f00"], [0.7, "#0f0"]]`
   * @returns a function that takes 1 or 2 `Group` as parameters. Use a single `Group` to specify a rectangular area for linear gradient, or use 2 `Groups` to specify 2 `Circles` for radial gradient.
   * @example `c1 = Circle.fromCenter(...); grad = form.gradient(["#f00", "#00f"]); form.fill( grad( c1, c2 ) ).circle( c1 )`
   */
  gradient(stops: [number, string][] | string[]): (area1: GroupLike, area2?: GroupLike) => CanvasGradient;
  /**
   * Set composite operation (also known as blend mode). You can also call this function without parameters to get back to default 'source-over' mode. See [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation) for the full list of operations you can use.
   * @param mode a composite operation such as 'lighten', 'multiply', 'overlay', and 'color-burn'.
   */
  composite(mode?: GlobalCompositeOperation): this;
  /**
   * Create a clipping mask from the current path. See [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/clip) for details.
   */
  clip(): this;
  /**
   * Activate dashed stroke and set dash style. You can customize the segments and offset.
   * @example `form.dash()`, `form.dash([5, 10])`, `form.dash([5, 5], 5)`, `form.dash(false)`
   * @param segments Dash segments. Defaults to `true` which corresponds to `[5, 5]`. Pass `false` to deactivate dashes. (See [canvas documentation](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setLineDash))
   * @param offset Dash offset. Defaults to 0. (See [canvas documentation](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineDashOffset)
   */
  dash(segments?: PtLike | boolean, offset?: number): this;
  /**
   * Set the current font.
   * @param sizeOrFont either a number to specify font-size, or a `Font` object to specify all font properties
   * @param weight Optional font-weight string such as "bold"
   * @param style Optional font-style string such as "italic"
   * @param lineHeight Optional line-height number suchas 1.5
   * @param family Optional font-family such as "Helvetica, sans-serif"
   * @example `form.font( myFont )`, `form.font(14, "bold")`
   */
  font(sizeOrFont: number | Font, weight?: string, style?: string, lineHeight?: number, family?: string): this;
  /**
   * Set whether to use html canvas' [`measureText`](#link) function, or a faster but less accurate estimate.
   * @param estimate `false` to use ctx.measureText; `true` or `"sample"` to use a sampled-average estimator (fastest); `"char"` to use a per-character width cache (nearly as accurate as measureText for most texts, and much faster after warmup)
   */
  fontWidthEstimate(estimate?: boolean | "sample" | "char"): this;
  /**
   * Get the width of this text. It will return an actual measurement or an estimate based on [`fontWidthEstimate`](#link) setting. Default is an actual measurement using canvas context's measureText.
   * @param c a string of text contents
   */
  getTextWidth(c: string): number;
  /**
   * Truncate text to fit width.
   * @param str text to truncate
   * @param width width to fit
   * @param tail text to indicate overflow such as "...". Default is empty "".
   */
  protected _textTruncate(str: string, width: number, tail?: string, hint?: number): [string, number];
  /**
   * Align text within a rectangle box.
   * @param box a Group or an Iterable<PtLike> that defines a rectangular box
   * @param vertical a string that specifies the vertical alignment in the box: "top", "bottom", "middle", "start", "end"
   * @param offset Optional offset from the edge (like padding)
   * @param center Optional center position
   */
  protected _textAlign(box: PtLikeIterable, vertical: TextVerticalAlign, offset?: PtLike, center?: Pt): Pt | undefined;
  /**
   * Reset the rendering context's common styles to this form's styles. This supports using multiple forms on the same canvas context.
   */
  reset(): this;
  protected _paint(): void;
  /**
   * A static function to draw a point.
   * @param ctx canvas rendering context
   * @param p a Pt object
   * @param radius radius of the point. Default is 5.
   * @param shape The shape of the point. Defaults to "square", but it can be "circle" or a custom shape function in your own implementation.
   * @example `form.point( p )`, `form.point( p, 10, "circle" )`
   */
  static point(ctx: RenderingContext2D, p: PtLike, radius?: number, shape?: string): void;
  /**
   * Draws a point.
   * @param p a Pt object
   * @param radius radius of the point. Default is 5.
   * @param shape The shape of the point. Defaults to "square", but it can be "circle" or a custom shape function in your own implementation.
   * @example `form.point( p )`, `form.point( p, 10, "circle" )`
   */
  point(p: PtLike, radius?: number, shape?: string): this;
  /**
   * A static function to draw a circle.
   * @param ctx canvas rendering context
   * @param pt center position of the circle
   * @param radius radius of the circle
   */
  static circle(ctx: RenderingContext2D, pt: PtLike, radius?: number): void;
  /**
   * Draw a circle. See also [`Circle.fromCenter`](#link)
   * @param pts usually a Group or an Iterable<PtLike> with 2 Pt, but it can also take an array of two numeric arrays [ [position], [size] ]
   */
  circle(pts: PtLikeIterable): this;
  /**
   * A static function to draw an ellipse.
   * @param ctx canvas rendering context
   * @param pt center position
   * @param radius radius [x, y] of the ellipse
   * @param rotation rotation of the ellipse in radian. Default is 0.
   * @param startAngle start angle of the ellipse. Default is 0.
   * @param endAngle end angle of the ellipse. Default is 2 PI.
   * @param cc an optional boolean value to specify if it should be drawn clockwise (`false`) or counter-clockwise (`true`). Default is clockwise.
   */
  static ellipse(ctx: RenderingContext2D, pt: PtLike, radius: PtLike, rotation?: number, startAngle?: number, endAngle?: number, cc?: boolean): void;
  /**
   * Draw an ellipse.
   * @param pt center position
   * @param radius radius [x, y] of the ellipse
   * @param rotation rotation of the ellipse in radian. Default is 0.
   * @param startAngle start angle of the ellipse. Default is 0.
   * @param endAngle end angle of the ellipse. Default is 2 PI.
   * @param cc an optional boolean value to specify if it should be drawn clockwise (`false`) or counter-clockwise (`true`). Default is clockwise.
   */
  ellipse(pt: PtLike, radius: PtLike, rotation?: number, startAngle?: number, endAngle?: number, cc?: boolean): this;
  /**
   * A static function to draw an arc.
   * @param ctx canvas rendering context
   * @param pt center position
   * @param radius radius of the arc circle
   * @param startAngle start angle of the arc
   * @param endAngle end angle of the arc
   * @param cc an optional boolean value to specify if it should be drawn clockwise (`false`) or counter-clockwise (`true`). Default is clockwise.
   */
  static arc(ctx: RenderingContext2D, pt: PtLike, radius: number, startAngle: number, endAngle: number, cc?: boolean): void;
  /**
   * Draw an arc.
   * @param pt center position
   * @param radius radius of the arc circle
   * @param startAngle start angle of the arc
   * @param endAngle end angle of the arc
   * @param cc an optional boolean value to specify if it should be drawn clockwise (`false`) or counter-clockwise (`true`). Default is clockwise.
   */
  arc(pt: PtLike, radius: number, startAngle: number, endAngle: number, cc?: boolean): this;
  /**
   * A static function to draw a square.
   * @param ctx canvas rendering context
   * @param pt center position of the square
   * @param halfsize half size of the square
   */
  static square(ctx: RenderingContext2D, pt: PtLike, halfsize: number): void;
  /**
   * Draw a square, given a center and its half-size.
   * @param pt center Pt
   * @param halfsize half-size
   */
  square(pt: PtLike, halfsize: number): this;
  /**
   * A static function to draw a line or polyline.
   * @param ctx canvas rendering context
   * @param pts a Group or an Iterable<PtLike> representing a line
   */
  static line(ctx: RenderingContext2D, pts: PtLikeIterable): void;
  /**
   * Draw a line or polyline.
   * @param pts a Group or an Iterable<PtLike> representing a line
   */
  line(pts: PtLikeIterable): this;
  /**
   * A static function to draw a polygon.
   * @param ctx canvas rendering context
   * @param pts a Group or an Iterable<PtLike> representing a polygon
   */
  static polygon(ctx: RenderingContext2D, pts: PtLikeIterable): void;
  /**
   * Draw a polygon.
   * @param pts a Group or an Iterable<PtLike> representingg a polygon
   */
  polygon(pts: PtLikeIterable): this;
  /**
   * A static function to draw a rectangle.
   * @param ctx canvas rendering context
   * @param pts a Group or an Iterable<PtLike> with 2 Pt specifying the top-left and bottom-right positions.
   */
  static rect(ctx: RenderingContext2D, pts: PtLikeIterable): void;
  /**
   * Draw a rectangle.
   * @param pts a Group or an Iterable<PtLike> with 2 Pt specifying the top-left and bottom-right positions.
   */
  rect(pts: PtLikeIterable): this;
  /**
   * A static function to draw an image.
   * @param ctx canvas rendering context
   * @param img either an [Img](#link) instance or an [`CanvasImageSource`](https://developer.mozilla.org/en-US/docs/Web/API/CanvasImageSource) instance (eg the image from `<img>`, `<video>` or `<canvas>`)
   * @param ptOrRect a target area to place the image. Either a Pt or numeric array specifying a position, or a Group or an Iterable<PtLike> with 2 Pt (top-left, bottom-right) that specifies a bounding box for resizing. Default is (0,0) at top-left.
   * @param orig optionally a Group or an Iterable<PtLike> with 2 Pt (top-left, bottom-right) that specifies a cropping box in the original target.
   */
  static image(ctx: RenderingContext2D, ptOrRect: PtLike | PtLikeIterable, img: CanvasImageSource | Img, orig?: PtLikeIterable): void;
  /**
   * Draw an image.
   * @param img either an [Img](#link) instance or an [`CanvasImageSource`](https://developer.mozilla.org/en-US/docs/Web/API/CanvasImageSource) instance (eg the image from `<img>`, `<video>` or `<canvas>`)
   * @param ptOrRect a target area to place the image. Either a PtLike specifying a position, or a Group or an Iterable<PtLike> with 2 Pt (top-left position, bottom-right position) that specifies a bounding box. Default is (0,0) at top-left.
   * @param orig optionally a Group or an Iterable<PtLike> with 2 Pt (top-left position, bottom-right position) that specifies a cropping box  in the original target.
   */
  image(ptOrRect: PtLike | PtLikeIterable, img: CanvasImageSource | Img, orig?: PtLikeIterable): this;
  /**
   * A static function to draw ImageData on canvas
   * @param ctx canvas rendering context
   * @param ptOrRect a target area to place the image. Either a Pt or numeric array specifying a position, or a Group or an Iterable<PtLike> with 2 Pt (top-left, bottom-right) that places a region of the image data of that size at that position. Note that `putImageData` cannot resize: the rect clips, not scales. Default is (0,0) at top-left.
   * @param img an ImageData object
   */
  static imageData(ctx: RenderingContext2D, ptOrRect: PtLike | PtLikeIterable, img: ImageData): void;
  /**
   * Draw ImageData on canvas using ImageData
   * @param ptOrRect a target area to place the image. Either a Pt or numeric array specifying a position, or a Group or an Iterable<PtLike> with 2 Pt (top-left, bottom-right) that specifies a bounding box for resizing. Default is (0,0) at top-left.
   * @param img an ImageData object
   */
  imageData(ptOrRect: PtLike | PtLikeIterable, img: ImageData): this;
  /**
   * A static function to draw text.
   * @param ctx canvas rendering context
   * @param pt a Point object to specify the anchor point
   * @param txt a string of text to draw
   * @param maxWidth specify a maximum width per line
   */
  static text(ctx: RenderingContext2D, pt: PtLike, txt: string, maxWidth?: number): void;
  /**
   * Draw text on canvas.
   * @param pt a Pt or numeric array to specify the anchor point
   * @param txt text
   * @param maxWidth specify a maximum width per line
   */
  text(pt: PtLike, txt: string, maxWidth?: number): this;
  /**
   * Fit a single-line text in a rectangular box.
   * @param box a rectangle box defined by a Group or an Iterable<Pt>
   * @param txt string of text
   * @param tail text to indicate overflow such as "...". Default is empty "".
   * @param verticalAlign "top", "middle", or "bottom" to specify vertical alignment inside the box
   * @param overrideBaseline If `true`, use the corresponding baseline as verticalAlign. If `false`, use the current canvas context's textBaseline setting. Default is `true`.
   */
  textBox(box: PtIterable, txt: string, verticalAlign?: TextVerticalAlign, tail?: string, overrideBaseline?: boolean): this;
  /**
   * Fit multi-line text in a rectangular box. Note that this will also set canvas context's textBaseline to "top".
   * @param box a Group or an Iterable<PtLike> with 2 Pt that represents a bounding box
   * @param txt string of text
   * @param lineHeight line height as a ratio of font size. Default is 1.2.
   * @param verticalAlign "top", "middle", or "bottom" to specify vertical alignment inside the box
   * @param crop a boolean to specify whether to crop text when overflowing
   */
  paragraphBox(box: PtLikeIterable, txt: string, lineHeight?: number, verticalAlign?: TextVerticalAlign, crop?: boolean): this;
  /**
   * Set text alignment and baseline (eg, vertical-align).
   * @param alignment HTML canvas' textAlign option: "left", "right", "center", "start", or "end"
   * @param baseline HTML canvas' textBaseline option: "top", "hanging", "middle", "alphabetic", "ideographic", "bottom". For convenience, you can also use "center" (same as "middle"), and "baseline" (same as "alphabetic")
   */
  alignText(alignment?: CanvasTextAlign, baseline?: CanvasTextBaseline): this;
  /**
   * A convenient way to draw some text on canvas for logging or debugging. It'll be draw on the top-left of the canvas as an overlay.
   * @param txt text
   */
  log(txt: any): this;
}
//#endregion
//#region src/Create.d.ts
/**
 * The `Create` class helps you create structures from sets of points.
 */
declare class Create {
  /**
   * Create a set of random points inside a bounday.
   * @param bound the rectangular boundary
   * @param count number of random points to create
   * @param dimensions number of dimensions in each point
   */
  static distributeRandom(bound: Bound, count: number, dimensions?: number): Group;
  /**
   * Create a set of points that distribute evenly on a line. Similar to [`Line.subpoints`](#link) but includes the end points.
   * @param line a Group or an Iterable<Pt> representing a line
   * @param count number of points to create
   */
  static distributeLinear(line: PtIterable, count: number): Group;
  /**
   * Create an evenly distributed set of points (like a grid of points) inside a boundary.
   * @param bound the rectangular boundary
   * @param columns number of columns
   * @param rows number of rows
   * @param orientation a Pt or number array to specify where the point should be inside a cell. Default is [0.5, 0.5] which places the point in the middle.
   * @returns a Group of Pts
   */
  static gridPts(bound: Bound, columns: number, rows: number, orientation?: PtLike): Group;
  /**
   * Create a grid of cells inside a boundary, where each cell is defined by a group of 2 Pt.
   * @param bound the rectangular boundary
   * @param columns number of columns
   * @param rows number of rows
   * @returns an array of Groups, where each group represents a rectangular cell
   */
  static gridCells(bound: Bound, columns: number, rows: number): Group[];
  /**
   * Create a set of Pts around a circular path.
   * @param center circle center
   * @param radius circle radius
   * @param count number of Pts to create
   * @param angleOffset offset starting angle
   */
  static radialPts(center: PtLike, radius: number, count: number, angleOffset?: number): Group;
  /**
   * Given a group of Pts, return a new group of `Noise` Pts.
   * @param pts a Group or an Iterable<Pt>, in row-major order when treated as a grid
   * @param dx small increment value in x dimension
   * @param dy small increment value in y dimension
   * @param rows Optional row count to generate 2D noise
   * @param columns Optional column count (points per row) to generate 2D noise. When provided, each point's noise offset is (dx·column, dy·row) with row = floor(i/columns); when only `rows` is provided it is used as the points-per-row divisor instead.
   */
  static noisePts(pts: PtIterable, dx?: number, dy?: number, rows?: number, columns?: number): Group;
  /**
   * Create a Delaunay Group. Use the [`Delaunay.delaunay()`](#link) and [`Delaunay.voronoi()`](#link) functions in the returned group to generate tessellations.
   * @param pts a Group or an array of Pts
   * @returns an instance of the Delaunay class
   */
  static delaunay(pts: GroupLike): Delaunay;
}
/**
 * Noise is a subclass of Pt that generates Perlin noise. Current implementation supports basic 2D noise.
 * This implementation is based on this [gist](https://gist.github.com/banksean/304522).
 */
declare class Noise extends Pt {
  protected perm: number[];
  private _n;
  /**
   * Create a Noise Pt that can generate noise continuously. See a [Noise demo here](https://ptsjs.org/demo/?name=create.noisePts).
   * @param args a list of numeric parameters, an array of numbers, or an object with {x,y,z,w} properties
   */
  constructor(...args: any[]);
  /**
   * Set the initial dimensional values of the noise.
   * @param args a list of numeric parameters, an array of numbers, or an object with {x,y,z,w} properties
   * @example `noise.initNoise( 0.01, 0.1 )`
   */
  initNoise(...args: any[]): this;
  /**
   * Add a small increment to the noise values.
   * @param x step in x dimension
   * @param y step in y dimension
   */
  step(x?: number, y?: number): this;
  /**
   * Specify a seed for this Noise.
   * @param s seed value
   */
  seed(s: number): this;
  /**
   * Generate a 2D Perlin noise value.
   */
  noise2D(): number;
}
/**
 * Delaunay is a [`Group`](#link) of Pts that generates Delaunay and Voronoi tessellations.
 * Points are triangulated by incremental insertion in Hilbert-curve order with exact
 * orientation and in-circle tests, so grids, collinear runs, points on edges, and duplicate
 * points are handled without degenerate triangles.
 */
declare class Delaunay extends Group {
  private _mesh;
  private _meshBuilt;
  private _count;
  private _tri;
  private _shapes;
  /**
   * Generate Delaunay triangles. This function also caches the mesh that is used to generate Voronoi tessellation in `voronoi()`. See a [Delaunay demo here](https://ptsjs.org/demo/?name=create.delaunay).
   * @param triangleOnly if true, returns an array of triangles in Groups, otherwise return the whole DelaunayShape
   * @returns an array of Groups or an array of DelaunayShapes `{i, j, k, triangle, circle}` which records the indices of the vertices, and the calculated triangles and circumcircles
   */
  delaunay(triangleOnly?: boolean): GroupLike[] | DelaunayShape[];
  /**
   * The per-point mesh cache is keyed by neighbor-pair strings, which costs
   * more than the triangulation itself; build it the first time it is read.
   */
  private _ensureMesh;
  /**
   * Generate Voronoi cells. `delaunay()` must be called before calling this function. See a [Voronoi demo here](https://ptsjs.org/demo/?name=create.delaunay).
   * @param bound Optionally provide a rectangular bound (eg, `space.innerBound`) to clip the cells against, including the unbounded cells on the convex hull.
   * Without a bound, cells around sliver triangles can extend to enormous coordinates (circumcenters of
   * nearly-collinear points), which is technically correct but extremely slow to draw.
   * @returns an array of Groups, each of which represents a Voronoi cell. Unclipped cells share their vertex Pts with the cached mesh (see [`Delaunay.mesh`](#link)), so treat them as read-only or clone before mutating.
   */
  voronoi(bound?: PtIterable): Group[];
  /** Assemble unclipped Voronoi cells. */
  private _voronoiCells;
  /**
   * Get the cached mesh. The mesh is an array of objects, each of which representing the enclosing triangles around a Pt in this Delaunay group.
   * @return an array of objects that store a series of DelaunayShapes
   */
  mesh(): DelaunayMesh;
  /**
   * Given an index of a Pt in this Delaunay Group, returns its neighboring Pts in the network.
   * @param i index of a Pt
   * @param sort if true, sort the neighbors so that their edges will form a polygon
   * @returns an array of Pts
   */
  neighborPts(i: number, sort?: boolean): GroupLike;
  /**
   * Given an index of a Pt in this Delaunay Group, returns its neighboring DelaunayShapes.
   * @param i index of a Pt
   * @returns an array of DelaunayShapes `{i, j, k, triangle, circle}`
   */
  neighbors(i: number): DelaunayShape[];
  /**
   * Record a DelaunayShape in the mesh.
   * @param o DelaunayShape instance
   */
  protected _cache(o: DelaunayShape): void;
  /**
   * Get the initial "super triangle" that contains all the points in this set.
   * Not used by the current triangulation core; kept for subclass compatibility.
   * @returns a Group representing a triangle
   */
  protected _superTriangle(): Group;
  /**
   * Get a triangle from 3 points in a list of points
   * @param i index 1
   * @param j index 2
   * @param k index 3
   * @param pts a Group of Pts
   */
  protected _triangle(i: number, j: number, k: number, pts?: GroupLike): Group;
  /**
   * Get a circumcircle and triangle from 3 points in a list of points
   * @param i index 1
   * @param j index 2
   * @param k index 3
   * @param tri a Group representing a triangle, or `false` to create it from indices
   * @param pts a Group of Pts
   */
  protected _circum(i: number, j: number, k: number, tri: GroupLike | false, pts?: GroupLike): DelaunayShape;
  /**
   * Dedupe the edges array
   * @param edges
   */
  protected static _dedupe(edges: number[]): number[];
}
//#endregion
//#region src/Num.d.ts
/**
 * Num class provides static helper functions for basic numeric operations.
 */
declare class Num {
  static generator: any;
  /**
   * Check if two numbers are equal or almost equal within a threshold.
   * @param a number a
   * @param b number b
   * @param threshold threshold value that specifies the minimum difference within which the two numbers are considered equal
   */
  static equals(a: number, b: number, threshold?: number): boolean;
  /**
   * Calculate linear interpolation between 2 values.
   * @param a start value
   * @param b end value
   * @param t an interpolation value, usually between 0 to 1
   */
  static lerp(a: number, b: number, t: number): number;
  /**
   * Clamp values between min and max.
   * @param val value to clamp
   * @param min min value
   * @param max max value
   */
  static clamp(val: number, min: number, max: number): number;
  /**
   * Different from [`Num.clamp`](#link) in that the value out-of-bound will be "looped back" to the other end.
   * @param val value to bound
   * @param min min value
   * @param max max value
   * @example `boundValue(361, 0, 360)` will return 1
   */
  static boundValue(val: number, min: number, max: number): number;
  /**
   * Check if a value is within two other values
   * @param p value to check
   * @param a first bounding value
   * @param b second bounding value
   */
  static within(p: number, a: number, b: number): boolean;
  /**
   * Get a random number within a range.
   * @param a range value 1
   * @param b range value 2
   */
  static randomRange(a: number, b?: number): number;
  /**
   * Get a random Pt within the range defined by either 1 or 2 Pt
   * @param a the range if only one Pt is used, or the start of the range if two Pt were used
   * @param b optional Pt to define the end of the range
   */
  static randomPt(a: PtLike, b?: PtLike): Pt;
  /**
   * Normalize a value within a range.
   * @param n the value to normalize
   * @param a range value 1
   * @param b range value 1
   */
  static normalizeValue(n: number, a: number, b: number): number;
  /**
   * Sum a group of numeric arrays.
   * @param pts a Group or an Iterable<PtLike>
   * @returns a Pt of the dimensional sums
   */
  static sum(pts: PtLikeIterable): Pt;
  /**
   * Average a group of numeric arrays
   * @param pts a Group or an Iterable<PtLike>
   * @returns a Pt of averages
   */
  static average(pts: PtLikeIterable): Pt;
  /**
   * Given a value between 0 to 1, returns a value that cycles between 0 -> 1 -> 0 using the provided shaping method.
   * @param t a value between 0 to 1
   * @param method a shaping method. Default to [`Shaping.sineInOut`](#link).
   * @return a value between 0 to 1
   */
  static cycle(t: number, method?: (t: number) => number): number;
  /**
   * Map a value from one range to another.
   * @param n a value in the first range
   * @param currA first endpoint of the input range
   * @param currB second endpoint of the input range
   * @param targetA first endpoint of the output range
   * @param targetB second endpoint of the output range
   * @returns a remapped value in the second range
   */
  static mapToRange(n: number, currA: number, currB: number, targetA: number, targetB: number): number;
  /**
   * Seed the pseudorandom generator for reproducible [`Num.random`](#link) sequences.
   * The seed is hashed by its *effective* key: leading/trailing whitespace and embedded
   * control characters are stripped first, so seeds differing only in those collide.
   * An empty (or whitespace-only) seed yields a fixed default sequence. This generator
   * is deterministic and statistically strong, but not cryptographically secure.
   * @param seed seed string
   */
  static seed(seed: string): void;
  /**
   * Return a random number between 0 and 1. If a seed was set via [`Num.seed`](#link),
   * draws come from the seeded generator with 32-bit resolution (exact multiples of 2^-32);
   * otherwise it uses `Math.random`.
   * @returns a number between 0 and 1
   */
  static random(): number;
}
/**
 * Geom class provides static helper functions for basic geometric operations.
 */
declare class Geom {
  /**
   * Bound an angle between 0 to 360 degrees.
   * @param angle angle value
   */
  static boundAngle(angle: number): number;
  /**
   * Bound a radian between 0 to two PI.
   * @param radian radian value
   */
  static boundRadian(radian: number): number;
  /**
   * Convert an angle in degree to radian.
   * @param angle angle value
   */
  static toRadian(angle: number): number;
  /**
   * Convert an angle in radian to degree.
   * @param radian radian value
   */
  static toDegree(radian: number): number;
  /**
   * Get a bounding box for a set of Pts.
   * @param pts a Group or an Iterable<Pt>
   * @return a Group of two Pts, representing the top-left and bottom-right corners
   */
  static boundingBox(pts: PtIterable): Group;
  /**
   * Get a centroid (the average middle point) for a set of Pts.
   * @param pts a Group or an Iterable<PtLike>
   * @return a centroid Pt
   */
  static centroid(pts: PtLikeIterable): Pt;
  /**
   * Given an anchor Pt, rebase all Pts in this group either to or from this anchor base.
   * @param pts a Group or an Iterable<PtLike>
   * @param ptOrIndex an index for the Pt array, or an external Pt
   * @param direction a string either "to" (subtract all Pt with this anchor base), or "from" (add all Pt from this anchor base)
   */
  static anchor(pts: PtLikeIterable, ptOrIndex?: PtLike | number, direction?: "to" | "from"): void;
  /**
   * Get an interpolated (or extrapolated) value between two Pts. For linear interpolation between 2 scalar values, use [`Num.lerp`](#link).
   * @param a first Pt
   * @param b second Pt
   * @param t a value between 0 to 1 to interpolate, or any other value to extrapolate
   * @returns interpolated point as a new Pt
   */
  static interpolate(a: PtLike, b: PtLike, t?: number): Pt;
  /**
   * Find two Pts that are perpendicular to this Pt (2D only).
   * @param axis a string such as "xy" (use Const.xy) or an array to specify index for two dimensions
   * @returns an array of two Pt that are perpendicular to this Pt
   */
  static perpendicular(pt: PtLike, axis?: string | PtLike): Group;
  /**
   * Check if two Pts are perpendicular to each other (2D only).
   */
  static isPerpendicular(p1: PtLike, p2: PtLike): boolean;
  /**
   * Check if a Pt is within the rectangular boundary defined by two Pts.
   * @param pt the Pt to check
   * @param boundPt1 boundary Pt 1
   * @param boundPt2 boundary Pt 2
   */
  static withinBound(pt: PtLike, boundPt1: PtLike, boundPt2: PtLike): boolean;
  /**
   * Sort the Pts so that their edges will form a non-overlapping polygon. ([Reference](https://stackoverflow.com/questions/6989100/sort-points-in-clockwise-order))
   * @param pts a Group or an Iterable<Pt>
   */
  static sortEdges(pts: PtIterable): GroupLike;
  /**
   * Scale a Pt or a Group of Pts. You may also use [`Pt.scale`](#link) instance method.
   * @param ps either a single Pt, or a Group or an Iterable<Pt>
   * @param scale scale value
   * @param anchor optional anchor point to scale from
   */
  static scale(ps: Pt | PtIterable, scale: number | PtLike, anchor?: PtLike): Geom;
  /**
   * Rotate a Pt or a Group of Pts in 2D space. You may also use [`Pt.rotate2D`](#link) instance method.
   * @param ps either a single Pt, or a Group or an Iterable<Pt>
   * @param angle rotate angle
   * @param anchor optional anchor point to rotate from
   * @param axis optional axis such as "xy" (use Const.xy) to define a 2D plane, or a number array to specify indices
   */
  static rotate2D(ps: Pt | PtIterable, angle: number, anchor?: PtLike, axis?: string | PtLike): Geom;
  /**
   * Shear a Pt or a Group of Pts in 2D space. You may also use [`Pt.shear2D`](#link) instance method.
   * @param ps either a single Pt, or a Group or an Iterable<Pt>
   * @param scale shearing value which can be a number or an array of 2 numbers
   * @param anchor optional anchor point to shear from
   * @param axis optional axis such as "xy" (use Const.xy) to define a 2D plane, or a number array to specify indices
   */
  static shear2D(ps: Pt | PtIterable, scale: number | PtLike, anchor?: PtLike, axis?: string | PtLike): Geom;
  /**
   * Reflect a Pt or a Group of Pts along a 2D line. You may also use [`Pt.reflect2D`](#link) instance method.
   * @param ps either a single Pt, or a Group or an Iterable<Pt>
   * @param line a Group or an Iterable<PtLike> that defines a line for reflection
   * @param axis optional axis such as "xy" (use Const.xy) to define a 2D plane, or a number array to specify indices
   */
  static reflect2D(ps: Pt | PtIterable, line: PtLikeIterable, axis?: string | PtLike): Geom;
  /**
   * Generate a cosine lookup table.
   * @returns an object with a cosine tables (array of 360 values) and a function to get cosine given a radian input.
   */
  static cosTable(): {
    table: Float64Array<ArrayBuffer>;
    cos: (rad: number) => number;
  };
  /**
   * Generate a sine lookup table.
   * @returns an object with a sine tables (array of 360 values) and a function to get sine value given a radian input.
   */
  static sinTable(): {
    table: Float64Array<ArrayBuffer>;
    sin: (rad: number) => number;
  };
}
/**
 * Shaping provides shaping functions to interpolate a value. These are useful for easing and transitions.
 */
declare class Shaping {
  /**
   * Linear mapping.
   * @param t a value between 0 to 1
   * @param c the value to shape, default is 1
   */
  static linear(t: number, c?: number): number;
  /**
   * Quadratic in, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/).
   * @param t a value between 0 to 1
   * @param c the value to shape, default is 1
   */
  static quadraticIn(t: number, c?: number): number;
  /**
   * Quadratic out, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/).
   * @param t a value between 0 to 1
   * @param c the value to shape, default is 1
   */
  static quadraticOut(t: number, c?: number): number;
  /**
   * Quadratic in-out, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/).
   * @param t a value between 0 to 1
   * @param c the value to shape, default is 1
   */
  static quadraticInOut(t: number, c?: number): number;
  /**
   * Cubic in, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/).
   * @param t a value between 0 to 1
   * @param c the value to shape, default is 1
   */
  static cubicIn(t: number, c?: number): number;
  /**
   * Cubic out, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/).
   * @param t a value between 0 to 1
   * @param c the value to shape, default is 1
   */
  static cubicOut(t: number, c?: number): number;
  /**
   * Cubic in-out, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/).
   * @param t a value between 0 to 1
   * @param c the value to shape, default is 1
   */
  static cubicInOut(t: number, c?: number): number;
  /**
   * Exponential ease in, adapted from Golan Levin's [polynomial shapers](http://www.flong.com/texts/code/shapers_poly/).
   * @param t a value between 0 to 1
   * @param c the value to shape, default is 1
   * @param p a value between 0 to 1 to control the curve. Default is 0.25.
   */
  static exponentialIn(t: number, c?: number, p?: number): number;
  /**
   * Exponential ease out, adapted from Golan Levin's [polynomial shapers](http://www.flong.com/texts/code/shapers_poly/).
   * @param t a value between 0 to 1
   * @param c the value to shape, default is 1
   * @param p a value between 0 to 1 to control the curve. Default is 0.25.
   */
  static exponentialOut(t: number, c?: number, p?: number): number;
  /**
   * Sinuous in, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/).
   * @param t a value between 0 to 1
   * @param c the value to shape, default is 1
   */
  static sineIn(t: number, c?: number): number;
  /**
   * Sinuous out, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/).
   * @param t a value between 0 to 1
   * @param c the value to shape, default is 1
   */
  static sineOut(t: number, c?: number): number;
  /**
   * Sinuous in-out, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/).
   * @param t a value between 0 to 1
   * @param c the value to shape, default is 1
   */
  static sineInOut(t: number, c?: number): number;
  /**
   * A faster way to approximate cosine ease in-out using Blinn-Wyvill Approximation. Adapated from Golan Levin's [polynomial shaping](http://www.flong.com/texts/code/shapers_poly/).
   * @param t a value between 0 to 1
   * @param c the value to shape, default is 1
   */
  static cosineApprox(t: number, c?: number): number;
  /**
   * Circular in, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/).
   * @param t a value between 0 to 1
   * @param c the value to shape, default is 1
   */
  static circularIn(t: number, c?: number): number;
  /**
   * Circular out, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/).
   * @param t a value between 0 to 1
   * @param c the value to shape, default is 1
   */
  static circularOut(t: number, c?: number): number;
  /**
   * Circular in-out, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/).
   * @param t a value between 0 to 1
   * @param c the value to shape, default is 1
   */
  static circularInOut(t: number, c?: number): number;
  /**
   * Elastic in, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/).
   * @param t a value between 0 to 1
   * @param c the value to shape, default is 1
   * @param p elastic parmeter between 0 to 1. The lower the number, the more elastic it will be. Default is 0.7.
   */
  static elasticIn(t: number, c?: number, p?: number): number;
  /**
   * Elastic out, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/).
   * @param t a value between 0 to 1
   * @param c the value to shape, default is 1
   * @param p elastic parmeter between 0 to 1. The lower the number, the more elastic it will be. Default is 0.7.
   */
  static elasticOut(t: number, c?: number, p?: number): number;
  /**
   * Elastic in-out, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/).
   * @param t a value between 0 to 1
   * @param c the value to shape, default is 1
   * @param p elastic parmeter between 0 to 1. The lower the number, the more elastic it will be. Default is 0.6.
   */
  static elasticInOut(t: number, c?: number, p?: number): number;
  /**
   * Bounce in, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/).
   * @param t a value between 0 to 1
   * @param c the value to shape, default is 1
   */
  static bounceIn(t: number, c?: number): number;
  /**
   * Bounce out, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/).
   * @param t a value between 0 to 1
   * @param c the value to shape, default is 1
   */
  static bounceOut(t: number, c?: number): number;
  /**
   * Bounce in-out, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/).
   * @param t a value between 0 to 1
   * @param c the value to shape, default is 1
   */
  static bounceInOut(t: number, c?: number): number;
  /**
   * Sigmoid curve changes its shape adapted from the input value, but always returns a value between 0 to 1.
   * @param t a value between 0 to 1
   * @param c the value to shape, default is 1
   * @param p the larger the value, the "steeper" the curve will be. Default is 10.
   */
  static sigmoid(t: number, c?: number, p?: number): number;
  /**
   * Logistic sigmoid, adapted from Golan Levin's [shaping function](http://www.flong.com/texts/code/shapers_exp/).
   * @param t a value between 0 to 1
   * @param c the value to shape, default is 1
   * @param p a parameter between 0 to 1 to control the steepness of the curve. Higher is steeper. Default is 0.7.
   */
  static logSigmoid(t: number, c?: number, p?: number): number;
  /**
   * Exponential seat curve, adapted from Golan Levin's [shaping functions](http://www.flong.com/texts/code/shapers_exp/).
   * @param t a value between 0 to 1
   * @param c the value to shape, default is 1
   * @param p a parameter between 0 to 1 to control the steepness of the curve. Higher is steeper. Default is 0.5.
   */
  static seat(t: number, c?: number, p?: number): number;
  /**
   * Quadratic bezier curve, adapted from Golan Levin's [shaping functions](http://www.flong.com/texts/code/shapers_exp/).
   * @param t a value between 0 to 1
   * @param c the value to shape, default is 1
   * @param p a Pt object specifying the control Pt, or a value specifying its x position (its y position will default to 0.5). Default is `[0.05, 0.95]`.
   */
  static quadraticBezier(t: number, c?: number, p?: number | PtLike): number;
  /**
   * Cubic bezier curve. This reuses the bezier functions in Curve class. Note that `t` is the curve parameter, not the x position: unlike CSS `cubic-bezier(...)`, this returns the curve's y value at parameter `t` rather than solving y at x = t.
   * @param t a value between 0 to 1
   * @param c the value to shape, default is 1
   * @param p1` a Pt object specifying the first control Pt. Default is `Pt(0.1, 0.7).
   * @param p2` a Pt object specifying the second control Pt. Default is `Pt(0.9, 0.2).
   */
  static cubicBezier(t: number, c?: number, p1?: PtLike, p2?: PtLike): number;
  /**
   * Give a Pt, draw a quadratic curve that will pass through that Pt as closely as possible. Adapted from Golan Levin's [shaping functions](http://www.flong.com/texts/code/shapers_poly/).
   * @param t a value between 0 to 1
   * @param c the value to shape, default is 1
   * @param p1` a Pt object specifying the Pt to pass through. Default is `Pt(0.2, 0.35)
   */
  static quadraticTarget(t: number, c?: number, p1?: PtLike): number;
  /**
   * Step function is a simple jump from 0 to 1 at a specific Pt in time.
   * @param t a value between 0 to 1
   * @param c the value to shape, default is 1
   * @param p usually a value between 0 to 1, which specify the Pt to "jump". Default is 0.5 which is in the middle.
   */
  static cliff(t: number, c?: number, p?: number): number;
  /**
   * Convert any shaping functions into a series of steps.
   * @param fn the original shaping function
   * @param steps the number of steps
   * @param t a value between 0 to 1
   * @param c the value to shape, default is 1
   * @param args optional paramters to pass to original function
   */
  static step(fn: (t: number, c: number, ...args: any[]) => number, steps: number, t: number, c: number, ...args: any[]): number;
}
/**
 * Range object keeps track of a Group of n-dimensional Pts to provide its minimum, maximum, and magnitude in each dimension.
 * It also provides convenient functions such as mapping the Group to another range. This class may be useful for visualizing data in charts.
 */
declare class Range {
  protected _source: Group;
  protected _max: Pt;
  protected _min: Pt;
  protected _mag: Pt;
  protected _dims: number;
  /**
   * Construct a Range instance for a Group of Pts.
   * @param g a Group or an Iterable<Pt>
   */
  constructor(g: PtIterable);
  /**
   * Get this Range's maximum values per dimension.
   */
  get max(): Pt;
  /**
   * Get this Range's minimum values per dimension.
   */
  get min(): Pt;
  /**
   * Get this Range's magnitude in each dimension.
   */
  get magnitude(): Pt;
  /**
   * Go through the group and find its min and max values. Usually you don't need to call this function directly.
   */
  calc(): this | undefined;
  /**
   * Map this Range to another range of values.
   * @param min target range's minimum value
   * @param max target range's maximum value
   * @param exclude Optional boolean array where `true` means excluding the conversion in that specific dimension.
   */
  mapTo(min: number, max: number, exclude?: boolean[]): Group;
  /**
   * Add more Pts to this Range and recalculate its min and max values.
   * @param pts a Group or an Iterable<PtLike> to append to this Range
   * @param update Optional. Set the parameter to `false` if you want to append without immediately updating this Range's min and max values. Default is `true`.
   */
  append(pts: PtLikeIterable, update?: boolean): this;
  /**
   * Create a number of evenly spaced "ticks" that span this Range's min and max value.
   * @param count number of subdivision. For example, 10 subdivision will return 11 tick values, which include first(min) and last(max) values.
   */
  ticks(count: number): Group;
}
//#endregion
//#region src/Op.d.ts
/**
 * Line class provides static functions to create and operate on lines. A line is usually represented as a Group of 2 Pts.
 * You can use the static functions as-is, or apply the [`Group.op`](#link) or [`Pt.op`](#link) to enable functional programming.
 * See [Op guide](../guide/Op-0400.html) for details.
 */
declare class Line {
  /**
   * Create a line that originates from an anchor point, given an angle and a magnitude.
   * @param anchor an anchor Pt
   * @param angle an angle in radian
   * @param magnitude magnitude of the line
   * @return a Group of 2 Pts representing a line segement
   */
  static fromAngle(anchor: PtLike, angle: number, magnitude: number): Group;
  /**
   * Calculate the slope of a line.
   * @param p1 line's first end point
   * @param p2 line's second end point
   */
  static slope(p1: PtLike, p2: PtLike): number | undefined;
  /**
   * Calculate the slope and xy intercepts of a line.
   * @param p1 line's first end point
   * @param p2 line's second end point
   * @returns an object with `slope`, `xi`, `yi` properties
   */
  static intercept(p1: PtLike, p2: PtLike): {
    slope: number;
    xi: number | undefined;
    yi: number;
  } | undefined;
  /**
   * Given a 2D path and a point, find whether the point is on left or right side of the line.
   * @param line  a Group or an Iterable<PtLike> representing a line
   * @param pt a Pt or numeric array
   * @returns a negative value if on left and a positive value if on right. If collinear, then the return value is 0.
   */
  static sideOfPt2D(line: PtLikeIterable, pt: PtLike): number;
  /**
   * Check if three Pts are collinear, ie, on the same straight path.
   * @param p1 first Pt
   * @param p2 second Pt
   * @param p3 third Pt
   * @param threshold a threshold where a smaller value means higher precision threshold for the straight line. Default is 0.01.
   */
  static collinear(p1: PtLike, p2: PtLike, p3: PtLike, threshold?: number): boolean;
  /**
   * Get magnitude of a line segment.
   * @param line a Group or an Iterable<Pt> with at least 2 Pt
   */
  static magnitude(line: PtIterable): number;
  /**
   * Get squared magnitude of a line segment.
   * @param line a Group or an Iterable<Pt> with at least 2 Pt
   */
  static magnitudeSq(line: PtIterable): number;
  /**
   * Find a point on a line that is perpendicular (shortest distance) to a target point.
   * @param line a Group or an Iterable<Pt> that defines a line
   * @param pt a target Pt
   * @param asProjection if true, this returns the projection vector instead. Default is false.
   * @returns a Pt on the line that is perpendicular to the target Pt, or a projection vector if `asProjection` is true.
   */
  static perpendicularFromPt(line: PtIterable, pt: PtLike, asProjection?: boolean): Pt | undefined;
  /**
   * Given a line and a point, find the shortest distance from the point to the line.
   * @param line a Group of 2 Pts
   * @param pt a Pt
   * @see `Line.perpendicularFromPt`
   */
  static distanceFromPt(line: GroupLike, pt: PtLike | number[]): number;
  /**
   * Given two lines as rays (infinite lines), find their intersection point if any.
   * @param la a Group or an Iterable<Pt> with 2 Pt representing a ray
   * @param lb a Group or an Iterable<Pt> with 2 Pts representing another ray
   * @returns an intersection Pt or undefined if no intersection
   */
  static intersectRay2D(la: PtIterable, lb: PtIterable): Pt | undefined;
  /**
   * Given two line segemnts, find their intersection point if any.
   * @param la a Group or an Iterable<Pt> with 2 Pt representing a line segment
   * @param lb a Group or an Iterable<Pt> with 2 Pt representing a line segment
   * @returns an intersection Pt or undefined if no intersection
   */
  static intersectLine2D(la: PtIterable, lb: PtIterable): Pt | undefined;
  /**
   * Given a line segemnt and a ray (infinite line), find their intersection point if any.
   * @param line a Group of 2 Pts representing a line segment
   * @param ray a Group of 2 Pts representing a ray
   * @returns an intersection Pt or undefined if no intersection
   */
  static intersectLineWithRay2D(line: PtIterable, ray: PtIterable): Pt | undefined;
  /**
   * Given a line segemnt or a ray (infinite line), find its intersection point(s) with a polygon.
   * @param lineOrRay a Group or an Iterable<Pt> with 2 Pt representing a line or ray
   * @param poly a Group or an Iterable<Pt> representing a polygon
   * @param sourceIsRay a boolean value to treat the line as a ray (infinite line). Default is `false`.
   */
  static intersectPolygon2D(lineOrRay: PtIterable, poly: PtIterable, sourceIsRay?: boolean): Group | undefined;
  /**
   * Find intersection points of 2 sets of lines. This checks all line segments in the two lists. Consider using a bounding-box check before calling this. If you are checking convex polygon intersections, using [`Polygon.intersectPolygon2D`](#link) will be more efficient.
   * @param lines1 an Array/Iterable of (Groups or Iterables<Pt>)
   * @param lines2 an Array/Iterable of (Groups or Iterables<Pt>)
   * @param isRay a boolean value to treat the line as a ray (infinite line). Default is `false`.
   */
  static intersectLines2D(lines1: Iterable<PtIterable>, lines2: Iterable<PtIterable>, isRay?: boolean): Group;
  /**
   * Get two points of a ray that intersects with a point on a 2D grid.
   * @param ray a Group or an Iterable<Pt> representing a ray
   * @param gridPt a Pt on the grid
   * @returns a group of two intersecting Pts. The first one is horizontal intersection and the second one is vertical intersection.
   */
  static intersectGridWithRay2D(ray: PtIterable, gridPt: PtLike): Group;
  /**
   * Get two intersection Pts of a line segment with a 2D grid point.
   * @param line a ray specified by 2 Pts
   * @param gridPt a Pt on the grid
   * @returns a group of two intersecting Pts. The first one is horizontal intersection and the second one is vertical intersection.
   */
  static intersectGridWithLine2D(line: GroupLike, gridPt: PtLike | number[]): Group;
  /**
   * An easy way to get rectangle-line intersection points. For more optimized implementation, store the rectangle's sides separately (eg, `Rectangle.sides()`) and use `Polygon.intersectPolygon2D()`.
   * @param line a Group representing a line
   * @param rect a Group representing a rectangle
   * @returns a Group of intersecting Pts
   */
  static intersectRect2D(line: GroupLike, rect: GroupLike): Group;
  /**
   * Get evenly distributed points on a line. Similar to [`Create.distributeLinear`](#link) but excluding end points.
   * @param line a Group or an Iterable<PtLike> representing a line
   * @param num number of points to get
   */
  static subpoints(line: PtLikeIterable, num: number): Group;
  /**
   * Crop this line by a circle or rectangle at end points. This can be useful for creating arrows that connect to an object's edge.
   * @param line a Group or an Iterable<Pt> representing a line to crop
   * @param size size of circle or rectangle as Pt
   * @param index line's end point index, ie, 0 = start and 1 = end.
   * @param cropAsCircle a boolean to specify whether the `size` parameter should be treated as circle. Default is `true`.
   * @return an intersecting point on the line that can be used for cropping.
   */
  static crop(line: PtIterable, size: PtLike, index?: number, cropAsCircle?: boolean): Pt | undefined;
  /**
   * Create an marker arrow or line, placed at an end point of this line.
   * @param line a Group or an Iterable<Pt> representing a line to place marker
   * @param size size of the marker as Pt
   * @param graphic either "arrow" or "line"
   * @param atTail a boolean, if `true`, the marker will be positioned at tail of the line (ie, index = 1). Default is `true`.
   * @returns a Group that defines the marker's shape
   */
  static marker(line: PtIterable, size: PtLike, graphic?: string, atTail?: boolean): Group;
  /**
   * Convert this line to a new rectangle representation.
   * @param line a Group representing a line
   */
  static toRect(line: GroupLike): Group;
}
/**
 * Rectangle class provides static functions to create and operate on rectangles. A rectangle is usually represented as a Group of 2 Pts, marking the top-left and bottom-right corners of the rectangle.
 * You can use the static functions as-is, or apply the [`Group.op`](#link) or [`Pt.op`](#link) to enable functional programming.
 * See [Op guide](../guide/Op-0400.html) for details.
 */
declare class Rectangle {
  /**
   * Create a rectangle from top-left anchor point. Same as [`Rectangle.fromTopLeft`](#link).
   * @param topLeft top-left point
   * @param widthOrSize width as a number, or a Pt that defines its size
   * @param height optional height as a number
   * @returns a Group of 2 Pts representing a rectangle
   */
  static from(topLeft: PtLike, widthOrSize: number | PtLike, height?: number): Group;
  /**
   * Create a rectangle given a top-left position and a size.
   * @param topLeft top-left point
   * @param widthOrSize width as a number, or a Pt that defines its size
   * @param height optional height as a number
   * @returns a Group of 2 Pts representing a rectangle
   */
  static fromTopLeft(topLeft: PtLike, widthOrSize: number | PtLike, height?: number): Group;
  /**
   * Create a rectangle given a center position and a size.
   * @param center center point
   * @param widthOrSize width as a number, or a Pt that defines its size
   * @param height optional height as a number
   * @returns a Group of 2 Pts representing a rectangle
   */
  static fromCenter(center: PtLike, widthOrSize: number | PtLike, height?: number): Group;
  /**
   * Create a new circle that either fits within or encloses the rectangle. Same as [`Circle.fromRect`](#link).
   * @param pts a Group or an Iterable<Pt> with 2 Pt representing a rectangle
   * @param enclose if `true`, the circle will enclose the rectangle. If `false`, the circle will fit inside the rectangle.
   * @returns a Group that represents a circle
   */
  static toCircle(pts: PtIterable, enclose?: boolean): Group;
  /**
   * Create a square that either fits within or encloses a rectangle.
   * @param pts a Group or an Iterable<Pt> with 2 Pt representing a rectangle
   * @param enclose if `true`, the square will enclose the rectangle. Default is `false`, which will fit the square inside the rectangle.
   * @returns a Group of 2 Pts representing a rectangle
   */
  static toSquare(pts: PtIterable, enclose?: boolean): Group;
  /**
   * Get the size of this rectangle as a Pt.
   * @param pts a Group or an Iterable<Pt> with 2 Pt representing a Rectangle
   */
  static size(pts: PtIterable): Pt;
  /**
   * Get the center of this rectangle.
   * @param pts a Group or an Iterable<Pt> with 2 Pt representing a Rectangle
   */
  static center(pts: PtIterable): Pt;
  /**
   * Get the 4 corners of this rectangle as a Group.
   * @param rect a Group or an Iterable<Pt> with 2 Pt representing a Rectangle
   */
  static corners(rect: PtIterable): Group;
  /**
   * Get the 4 sides of this rectangle as an array of 4 Groups.
   * @param rect a Group or an Iterable<Pt> with 2 Pt representing a Rectangle
   * @returns an array of 4 Groups, each of which represents a line segment
   */
  static sides(rect: PtIterable): Group[];
  /**
   * Given an array of rectangles, get a rectangle that bounds all of them.
   * @param rects an array of (Groups or Iterables<PtLike>) that represents a set of rectangles
   * @returns the bounding rectangle as a Group
   */
  static boundingBox(rects: Iterable<PtLikeIterable>): Group;
  /**
   * Convert this rectangle into a Group representing a polygon. An alias for [`Rectangle.corners`](#link)
   * @param rect a Group or an Iterable<Pt> with 2 Pt representing a Rectangle
   */
  static polygon(rect: PtIterable): Group;
  /**
   * Subdivide a rectangle into 4 rectangles, one for each quadrant.
   * @param rect a Group or an Iterable<Pt> with 2 Pt representing a Rectangle
   * @returns an array of 4 Groups of rectangles
   */
  static quadrants(rect: PtIterable, center?: PtLike): Group[];
  /**
   * Subdivde a rectangle into 2 rectangles, by row or by column.
   * @param rect a Group or an Iterable<Pt> with 2 Pt representing a Rectangle
   * @param ratio a value between 0 to 1 to indicate the split ratio
   * @param asRows if `true`, split into 2 rows. Default is `false` which splits into 2 columns.
   * @returns an array of 2 Groups of rectangles
   */
  static halves(rect: PtIterable, ratio?: number, asRows?: boolean): Group[];
  /**
   * Check if a point is within a rectangle.
   * @param rect a Group of 2 Pts representing a Rectangle
   * @param pt the point to check
   */
  static withinBound(rect: GroupLike, pt: PtLike): boolean;
  /**
   * Check if a rectangle is within the bounds of another rectangle.
   * @param rect1 a Group of 2 Pts representing a rectangle
   * @param rect2 a Group of 2 Pts representing a rectangle
   * @param resetBoundingBox if `true`, reset the bounding box. Default is `false` which assumes the rect's first Pt at is its top-left corner.
   */
  static hasIntersectRect2D(rect1: GroupLike, rect2: GroupLike, resetBoundingBox?: boolean): boolean;
  /**
   * An easy way to get rectangle-rectangle intersection points. For more optimized implementation, store the rectangle's sides separately (eg, `Rectangle.sides()`) and use `Polygon.intersectPolygon2D()`.
   * @param rect1 a Group of 2 Pts representing a rectangle
   * @param rect2 a Group of 2 Pts representing a rectangle
   */
  static intersectRect2D(rect1: GroupLike, rect2: GroupLike): Group;
}
/**
 * Circle class provides static functions to create and operate on circles. A circle is usually represented as a Group of 2 Pts, where the first Pt specifies the center, and the second Pt specifies the radius.
 * To move a circle without changing its radius, move only its center, eg `circle[0].to(20, 20)`. Group transforms such as `circle.moveTo(20, 20)` affect both Pts, including the radius.
 * You can use the static functions as-is, or apply the [`Group.op`](#link) or [`Pt.op`](#link) to enable functional programming.
 * See [Op guide](../guide/Op-0400.html) for details.
 */
declare class Circle {
  /**
   * Create a circle that either fits within, or encloses, a rectangle.
   * @param pts a Group or an Iterable<PtLike> with 2 Pt representing a rectangle
   * @param enclose if `true`, the circle will enclose the rectangle. Default is `false`, which will fit the circle inside the rectangle.
   * @returns a Group that represents a circle
   */
  static fromRect(pts: PtLikeIterable, enclose?: boolean): Group;
  /**
   * Create a circle that either fits within, or encloses, a triangle. Same as [`Triangle.circumcircle`](#link) or [`Triangle.incircle`](#link).
   * @param pts a Group or an Iterable<Pt> with 3 Pt representing a rectangle
   * @param enclose if `true`, the circle will enclose the triangle. Default is `false`, which will fit the circle inside the triangle.
   * @returns a Group that represents a circle
   */
  static fromTriangle(pts: PtIterable, enclose?: boolean): Group | undefined;
  /**
   * Create a circle based on a center point and a radius.
   * @param pt center point of circle
   * @param radius radius of circle
   * @returns a Group that represents a circle
   */
  static fromCenter(pt: PtLike, radius: number): Group;
  /**
   * Check if a point is within a circle.
   * @param pts a Group or an Iterable<Pt> with 2 Pt representing a circle
   * @param pt the point to checks
   * @param threshold an optional small number to set threshold. Default is 0.
   */
  static withinBound(pts: PtIterable, pt: PtLike, threshold?: number): boolean;
  /**
   * Get the intersection points between a circle and a ray (infinite line).
   * @param circle a Group or an Iterable<Pt> with 2 Pt representing a circle
   * @param ray a Group or an Iterable<Pt> with 2 Pt representing a ray
   * @returns a Group of intersection points, or an empty Group if no intersection is found
   */
  static intersectRay2D(circle: PtIterable, ray: PtIterable): Group;
  /**
   * Get the intersection points between a circle and a line segment.
   * @param circle a Group or an Iterable<Pt> with Pt representing a circle
   * @param line a Group or an Iterable<Pt> with 2 Pt representing a line
   * @returns a Group of intersection points, or an empty Group if no intersection is found
   */
  static intersectLine2D(circle: PtIterable, line: PtIterable): Group;
  /**
   * Get the intersection points between two circles.
   * @param circle1 a Group or an Iterable<Pt> with 2 Pt representing a circle
   * @param circle2 a Group or an Iterable<Pt> with 2 Pt representing a circle
   * @returns a Group of intersection points, or an empty Group if no intersection is found
   */
  static intersectCircle2D(circle1: PtIterable, circle2: PtIterable): Group;
  /**
   * Quick way to check rectangle intersection with a circle.
   * For more optimized implementation, store the rectangle's sides separately (eg, [`Rectangle.sides`](#link)) and use [`Polygon.intersectPolygon2D()`](#link).
   * @param circle a Group or an Iterable<Pt> with 2 Pt representing a circle
   * @param rect a Group or an Iterable<Pt> with 2 Pt representing a rectangle
   * @returns a Group of intersection points, or an empty Group if no intersection is found
   */
  static intersectRect2D(circle: PtIterable, rect: PtIterable): Group;
  /**
   * Get a rectangle that either fits within or encloses this circle. See also [`Rectangle.toCircle`](#link)
   * @param circle a Group or an Iterable<Pt> with 2 Pt representing a circle
   * @param within if `true`, the rectangle will be within the circle. If `false`, the rectangle will enclose the circle.
   * @returns a Group representing a rectangle
   */
  static toRect(circle: PtIterable, within?: boolean): Group;
  /**
   * Get a triangle that fits within this circle.
   * @param circle a Group or an Iterable<Pt> with 2 Pt representing a circle
   * @param within if `true`, the triangle will be within the circle. If `false`, the triangle will enclose the circle.
   */
  static toTriangle(circle: PtIterable, within?: boolean): Group;
}
/**
 * Triangle class provides static functions to create and operate on trianges. A triange is a polygon represented as a Group of 3 Pts.
 * You can use the static functions as-is, or apply the [`Group.op`](#link) or [`Pt.op`](#link) to enable functional programming.
 * See [Op guide](../guide/Op-0400.html) for details.
 */
declare class Triangle {
  /**
   * Create a triangle from a rectangle. The triangle will be isosceles, with the bottom of the rectangle as its base.
   * @param rect a Group or an Iterable<Pt> with 2 Pt representing a rectangle
   */
  static fromRect(rect: PtIterable): Group;
  /**
   * Create a triangle that fits within a circle.
   * @param circle a Group or an Iterable<Pt> with 2 Pt representing a circle
   */
  static fromCircle(circle: PtIterable): Group;
  /**
   * Create an equilateral triangle based on a center point and a size.
   * @param pt the center point
   * @param size size is the magnitude of lines from center to the triangle's vertices, like a "radius".
   */
  static fromCenter(pt: PtLike, size: number): Group;
  /**
   * Get the medial, which is an inner triangle formed by connecting the midpoints of this triangle's sides.
   * @param tri a Group or an Iterable<Pt> representing a triangle
   * @returns a Group representing a medial triangle
   */
  static medial(tri: PtIterable): Group;
  /**
   * Given a point of the triangle, the opposite side is the side which the point doesn't touch.
   * @param tri a Group or an Iterable<Pt> representing a triangle
   * @param index a Pt on the triangle group
   * @returns a Group that represents a line of the opposite side
   */
  static oppositeSide(tri: PtIterable, index: number): Group;
  /**
   * Get a triangle's altitude, which is a line from a triangle's point to its opposite side, and perpendicular to its opposite side.
   * @param tri a Group or an Iterable<Pt> representing a triangle
   * @param index a Pt on the triangle group
   * @returns a Group that represents the altitude line
   */
  static altitude(tri: PtIterable, index: number): Group;
  /**
   * Get orthocenter, which is the intersection point of a triangle's 3 altitudes (the 3 lines that are perpendicular to its 3 opposite sides).
   * @param tri a Group or an Iterable<Pt> representing a triangle
   * @returns the orthocenter as a Pt
   */
  static orthocenter(tri: PtIterable): Pt | undefined;
  /**
   * Get incenter, which is the center point of its inner circle, and also the intersection point of its 3 angle bisector lines (each of which cuts one of the 3 angles in half).
   * @param tri a Group or an Iterable<Pt> representing a triangle
   * @returns the incenter as a Pt
   */
  static incenter(tri: PtIterable): Pt | undefined;
  /**
   * Get an interior circle, which is the largest circle completed enclosed by this triangle.
   * @param tri a Group or an Iterable<Pt> representing a triangle
   * @param center Optional parameter if the incenter is already known. Otherwise, leave it empty and the incenter will be calculated
   */
  static incircle(tri: PtIterable, center?: Pt): Group | undefined;
  /**
   * Get circumcenter, which is the intersection point of its 3 perpendicular bisectors lines ( each of which divides a side in half and is perpendicular to the side).
   * @param tri a Group or an Iterable<Pt> representing a triangle
   * @returns the circumcenter as a Pt
   */
  static circumcenter(tri: PtIterable): Pt | undefined;
  /**
   * Get circumcenter, which is the intersection point of its 3 perpendicular bisectors lines ( each of which divides a side in half and is perpendicular to the side).
   * @param tri a Group or an Iterable<Pt> representing a triangle
   * @param center Optional parameter if the circumcenter is already known. Otherwise, leave it empty and the circumcenter will be calculated
   */
  static circumcircle(tri: PtIterable, center?: Pt): Group | undefined;
}
/**
 * Polygon class provides static functions to create and operate on polygons. A polygon is usually represented as a Group of 3 or more Pts.
 * You can use the static functions as-is, or apply the [`Group.op`](#link) or [`Pt.op`](#link) to enable functional programming.
 * See [Op guide](../guide/Op-0400.html) for details.
 */
declare class Polygon {
  /**
   * Get the centroid of a polygon, which is the average of all its points.
   * @param pts a Group or an Iterable<PtLike> representing a polygon
   */
  static centroid(pts: PtLikeIterable): Pt;
  /**
   * Create a rectangular polygon. Same as creating a Rectangle and then getting its corners via [`Rectangle.corners`](#link).
   * @param center center point of the rectangle
   * @param widthOrSize width as number, or a Pt representing the size of the rectangle
   * @param height optional height
   */
  static rectangle(center: PtLike, widthOrSize: number | PtLike, height?: number): Group;
  /**
   * Create a regular polygon.
   * @param center The center position of the polygon
   * @param radius The radius, ie, a length from the center position to one of the polygon's corners.
   * @param sides Number of sides
   */
  static fromCenter(center: PtLike, radius: number, sides: number): Group;
  /**
   * Given a polygon, get one edge using an index.
   * @param pts a Group or an Iterable<PtLike> representing a polygon
   * @param index index of a Pt in the Group
   */
  static lineAt(pts: PtLikeIterable, index: number): Group;
  /**
   * Get the line segments in this polygon.
   * @param poly a Group or an Iterable<Pt>
   * @param closePath a boolean to specify whether the polygon should be closed (ie, whether the final segment should be counted).
   * @returns an array of Groups which has 2 Pts in each group
   */
  static lines(poly: PtIterable, closePath?: boolean): Group[];
  /**
   * Get a new polygon group that is derived from midpoints in this polygon.
   * @param poly a Group or an Iterable<Pt>
   * @param closePath a boolean to specify whether the polygon should be closed (ie, whether the final segment should be counted).
   * @param t a value between 0 to 1 for interpolation. Default to 0.5 which will get the middle point.
   */
  static midpoints(poly: PtIterable, closePath?: boolean, t?: number): Group;
  /**
   * Given a Pt in the polygon group, the adjacent sides are the two sides which the Pt touches.
   * @param poly a Group or an Iterable<Pt>
   * @param index the target Pt
   * @param closePath a boolean to specify whether the polygon should be closed (ie, whether the final segment should be counted).
   */
  static adjacentSides(poly: PtIterable, index: number, closePath?: boolean): Group[];
  /**
   * Get a bisector which is a line that split between two sides of a polygon equally.
   * @param poly a Group or an Iterable<Pt>
   * @param index the Pt in the polygon to bisect from
   * @returns a bisector direction Pt, the average of the two adjacent sides' unit vectors (not itself normalized)
   */
  static bisector(poly: PtIterable, index: number): Pt | undefined;
  /**
   * Find the perimeter of this polygon, ie, the lengths of its sides.
   * @param poly a Group or an Iterable<Pt>
   * @param closePath a boolean to specify whether the polygon should be closed (ie, whether the final segment should be counted).
   * @returns an object with `total` length, and `segments` which is a Pt that stores each segment's length
   */
  static perimeter(poly: PtIterable, closePath?: boolean): {
    total: number;
    segments: Pt;
  };
  /**
   * Find the area of a simple (non-self-intersecting) polygon using the shoelace formula.
   * @param pts a Group or an Iterable<PtLike> representing a polygon
   */
  static area(pts: PtLikeIterable): number;
  /**
   * Get a convex hull of a set of points, using Melkman's algorithm. ([Reference](http://geomalgorithms.com/a12-_hull-3.html)).
   * @param pts a Group or an Iterable<PtLike>
   * @param sorted a boolean value to indicate if the group is pre-sorted by x position. Default is false.
   * @returns a group of Pt that defines the convex hull polygon
   */
  static convexHull(pts: PtLikeIterable, sorted?: boolean): Group;
  /**
   * Given a point in the polygon as an origin, get an array of lines that connect all the remaining points to the origin point.
   * @param poly a Group or an Iterable<Pt> representing a polygon
   * @param originIndex the origin point's index in the polygon
   * @returns an array of Groups of line segments
   */
  static network(poly: PtIterable, originIndex?: number): Group[];
  /**
   * Given a target Pt, find a Pt in the polygon's corners that's nearest to it.
   * @param poly a Group or an Iterable<Pt>
   * @param pt Pt to check
   * @returns an index in the pts indicating the nearest Pt, or -1 if none found
   */
  static nearestPt(poly: PtIterable, pt: PtLike): number;
  /**
   * Project axis (eg, for use in Separation Axis Theorem).
   * @param poly a Group or an Iterable<Pt>
   * @param unitAxis unit axis for calculating dot product
   */
  static projectAxis(poly: PtIterable, unitAxis: Pt): Pt;
  /**
   * Scalar core of the axis-overlap test used by the SAT functions: project both polygons on
   * the unit axis (ax, ay) and return the gap between the intervals (negative means overlap).
   */
  private static _axisOverlap2D;
  /**
   * Check overlap distance from projected axis.
   * @param poly1 a Group or an Iterable<Pt> representing the first polygon
   * @param poly2 a Group or an Iterable<Pt> representing the second polygon
   * @param unitAxis unit axis
   */
  protected static _axisOverlap(poly1: PtIterable, poly2: PtIterable, unitAxis: Pt): number;
  /**
   * Check if a Pt is inside a convex polygon.
   * @param poly a Group or an Iterable<PtLike> representing a convex polygon
   * @param pt the Pt to check
   */
  static hasIntersectPoint(poly: PtLikeIterable, pt: PtLike): boolean;
  /**
   * Check if a convex polygon and a circle has intersections using Separating Axis Theorem.
   * @param poly a Group or an Iterable<Pt> representing a convex polygon
   * @param circle a Group or an Iterable<Pt> representing a circle
   * @returns an `IntersectContext` object that stores the intersection info, or undefined if there's no intersection
   */
  static hasIntersectCircle(poly: PtIterable, circle: PtIterable): IntersectContext | null;
  /**
   * Check if two convex polygons have intersections using Separating Axis Theorem.
   * @param poly1 a Group or an Iterable<Pt> representing a convex polygon
   * @param poly2 a Group or an Iterable<Pt> representing another convex polygon
   * @return an `IntersectContext` object that stores the intersection info, or undefined if there's no intersection
   */
  static hasIntersectPolygon(poly1: PtIterable, poly2: PtIterable): IntersectContext | null;
  /**
   * Find intersection points of 2 polygons by checking every side of both polygons. Performance may be slow for complex polygons.
   * @param poly1 a Group or an Iterable<Pt> representing a polygon
   * @param poly2 a Group or an Iterable<Pt> representing another polygon
   */
  static intersectPolygon2D(poly1: PtIterable, poly2: PtIterable): Group;
  /**
   * Get a bounding box for each polygon group, as well as a union bounding-box for all groups.
   * @param polys an Array/Iterable of (Groups or Iterables<Pt>)
   */
  static toRects(polys: Iterable<PtIterable>): Group[];
}
/**
 * Curve class provides static functions to interpolate curves. A curve is usually represented as a Group of 3 or more control points.
 * You can use the static functions as-is, or apply the [`Group.op`](#link) or [`Pt.op`](#link) to enable functional programming.
 * See [Op guide](../guide/Op-0400.html) for details.
 */
declare class Curve {
  /**
   * Get a precalculated coefficients per step.
   * @param steps number of steps
   */
  static getSteps(steps: number): Group;
  /**
   * Given an index for the starting position in a Pt group, get the control and/or end points of a curve segment.
   * @param pts a Group or an Iterable<PtLike>
   * @param index start index in `pts` array. Default is 0.
   * @param copyStart an optional boolean value to indicate if the start index should be used twice. Default is false.
   * @returns a group of 4 Pts
   */
  static controlPoints(pts: PtLikeIterable, index?: number, copyStart?: boolean): Group;
  /**
   * Build a per-step table of the 4 control-point weights for a curve family.
   * Computing these once per call (instead of a matrix product per output
   * point) is what makes the curve functions fast.
   */
  private static _weights;
  /**
   * Evaluate one curve segment with a precomputed weight table, pushing one
   * interpolated Pt per step into `out`. Control values are read by index so
   * both Pts and plain arrays work.
   */
  private static _evalSegment;
  /**
   * Calulcate weighted sum to get the interpolated points.
   * @param ctrls anchors
   * @param params parameters
   */
  static _calcPt(ctrls: GroupLike, params: PtLike): Pt;
  /**
   * Weighted sum of 4 control points with scalar weights — the shared core
   * of the single-point step functions, kept consistent with the batch
   * `_weights` tables by construction.
   */
  private static _stepPt;
  /**
   * Create a Catmull-Rom curve. Catmull-Rom is a kind of smooth-looking Cardinal curve.
   * @param pts a Group or an Iterable<PtLike>
   * @param steps the number of line segments per curve. Defaults to 10 steps
   * @returns a curve as a group of interpolated Pt
   */
  static catmullRom(pts: PtLikeIterable, steps?: number): Group;
  /**
   * Interpolate to get a point on Catmull-Rom curve.
   * @param step the coefficients [t*t*t, t*t, t, 1]
   * @param ctrls a group of anchor Pts
   * @return an interpolated Pt on the curve
   */
  static catmullRomStep(step: Pt, ctrls: GroupLike): Pt;
  /**
   * Create a Cardinal curve.
   * @param pts a Group or an Iterable<PtLike>
   * @param steps the number of line segments per curve. Defaults to 10 steps.
   * @param tension optional value between 0 to 1 to specify a "tension". Default to 0.5 which is the tension for Catmull-Rom curve.
   * @returns a curve as a group of interpolated Pt
   */
  static cardinal(pts: PtLikeIterable, steps?: number, tension?: number): Group;
  /**
   * Interpolate to get a point on Cardinal curve.
   * @param step the coefficients [t*t*t, t*t, t, 1]
   * @param ctrls a group of anchor Pts
   * @param tension optional value between 0 to 1 to specify a "tension". Default to 0.5 which is the tension for Catmull-Rom curve
   * @return an interpolated Pt on the curve
   */
  static cardinalStep(step: Pt, ctrls: GroupLike, tension?: number): Pt;
  /**
   * Create a Bezier curve. In a cubic bezier curve, the first and 4th anchors are end-points, and 2nd and 3rd anchors are control-points.
   * @param pts a group of anchor Pt
   * @param steps the number of line segments per curve. Defaults to 10 steps.
   * @returns a curve as a group of interpolated Pt
   */
  static bezier(pts: GroupLike, steps?: number): Group;
  /**
   * Interpolate to get a point on a cubic Bezier curve.
   * @param step the coefficients [t*t*t, t*t, t, 1]
   * @param ctrls a group of anchor Pts
   * @return an interpolated Pt on the curve
   */
  static bezierStep(step: Pt, ctrls: GroupLike): Pt;
  /**
   * Create a basis spline (NURBS) curve.
   * @param pts a group of anchor Pt
   * @param steps the number of line segments per curve. Defaults to 10 steps.
   * @param tension optional value between 0 to n to specify a "tension". Default is 1 which is the usual tension.
   * @returns a curve as a group of interpolated Pt
   */
  static bspline(pts: GroupLike, steps?: number, tension?: number): Group;
  /**
   * Interpolate to get a point on a basis spline curve.
   * @param step the coefficients [t*t*t, t*t, t, 1]
   * @param ctrls a group of anchor Pts
   * @return an interpolated Pt on the curve
   */
  static bsplineStep(step: Pt, ctrls: GroupLike): Pt;
  /**
   * Interpolate to get a point on a basis spline curve with tension.
   * @param step the coefficients [t*t*t, t*t, t, 1]
   * @param ctrls a group of anchor Pts
   * @param tension optional value between 0 to n to specify a "tension". Default to 1 which is the usual tension.
   * @return an interpolated Pt on the curve
   */
  static bsplineTensionStep(step: Pt, ctrls: GroupLike, tension?: number): Pt;
}
//#endregion
//#region src/Color.d.ts
/**
 * Color is a subclass of Pt. Since a color in a color space is analogous to a point or vector in a space, you can apply all Pt operations to colors too. The Color class provides support for many color spaces like HSL and LAB.
 * Convert non-RGB colors to RGB before using `.hex`, `.rgb`, or `.rgba` for rendering. These getters format the channels; they don't convert between color spaces.
 * @example
 * ```
 * const color = Color.hsl(268, 0.37, 0.51);
 * form.fill(Color.HSLtoRGB(color).rgb);
 * ```
 */
declare class Color extends Pt {
  private static D65;
  protected _mode: ColorType;
  private _isNorm;
  /**
   * Value range for each color space
   */
  static ranges: {
    [name: string]: Group;
  };
  /**
   * Create a Color. Same as creating a Pt. Optionally you may use [`Color.from`](#link) to create a color.
   * @param args Pt-like parameters which can be a list of numeric parameters, an array of numbers, or an object with {x,y,z,w} properties
   */
  constructor(...args: any[]);
  /**
   * Create a Color object with 4 default dimensional values (1,1,1,1).
   * @param args Pt-like parameters which can be a list of numeric parameters, an array of numbers, or an object with {x,y,z,w} properties
   */
  static from(...args: any[]): Color;
  /**
   * Convert a rgb hex string like `"#FF0000"` or `"#F00"` to a Color object.
   * @param hex a hex string, with optional '#' prefix
   */
  static fromHex(hex: string): Color;
  /**
   * Create RGB Color. RGB color ranges are (0...255, 0...255, 0...255) respectively. You may use [`Color.normalize`](#link) to convert the ranges to 0...1.
   * @param args Pt-like parameters which can be a list of numeric parameters, an array of numbers, or an object with {x,y,z,w} properties.
   */
  static rgb(...args: any[]): Color;
  /**
   * Create HSL Color. HSL color ranges are (0...360, 0...1, 0...1) respectively. You may use [`Color.normalize`](#link) to convert the ranges to 0...1.
   * @param args Pt-like parameters which can be a list of numeric parameters, an array of numbers, or an object with {x,y,z,w} properties.
   */
  static hsl(...args: any[]): Color;
  /**
   * Create HSB Color. HSB color ranges are (0...360, 0...1, 0...1) respectively. You may use [`Color.normalize`](#link) to convert the ranges to 0...1.
   * @param args Pt-like parameters which can be a list of numeric parameters, an array of numbers, or an object with {x,y,z,w} properties.
   */
  static hsb(...args: any[]): Color;
  /**
   * Create LAB Color. LAB color ranges are (0...100, -128...127, -128...127) respectively. You may use [`Color.normalize`](#link) to convert the ranges to 0...1.
   * @param args Pt-like parameters which can be a list of numeric parameters, an array of numbers, or an object with {x,y,z,w} properties.
   */
  static lab(...args: any[]): Color;
  /**
   * Create LCH Color. LCH color ranges are (0...100, 0...100, 0...360) respectively. You may use [`Color.normalize`](#link) to convert the ranges to 0...1.
   * @param args Pt-like parameters which can be a list of numeric parameters, an array of numbers, or an object with {x,y,z,w} properties.
   */
  static lch(...args: any[]): Color;
  /**
   * Create LUV Color. LUV color ranges are (0...100, -134...220, -140...122) respectively. You may use [`Color.normalize`](#link) to convert the ranges to 0...1.
   * @param args Pt-like parameters which can be a list of numeric parameters, an array of numbers, or an object with {x,y,z,w} properties.
   */
  static luv(...args: any[]): Color;
  /**
   * Create XYZ Color. XYZ color ranges are (0...100, 0...100, 0...100) respectively. You may use [`Color.normalize`](#link) to convert the ranges to 0...1.
   * @param args Pt-like parameters which can be a list of numeric parameters, an array of numbers, or an object with {x,y,z,w} properties.
   */
  static xyz(...args: any[]): Color;
  /**
   * Create OKLAB Color. OKLAB color ranges are (0...1, -0.4...0.4, -0.4...0.4) respectively. You may use [`Color.normalize`](#link) to convert the ranges to 0...1.
   * @param args Pt-like parameters which can be a list of numeric parameters, an array of numbers, or an object with {x,y,z,w} properties.
   */
  static oklab(...args: any[]): Color;
  /**
   * Create OKLCH Color. OKLCH color ranges are (0...1, 0...0.4, 0...360) respectively. You may use [`Color.normalize`](#link) to convert the ranges to 0...1.
   * @param args Pt-like parameters which can be a list of numeric parameters, an array of numbers, or an object with {x,y,z,w} properties.
   */
  static oklch(...args: any[]): Color;
  /**
   * Get a Color object whose values are the maximum of its mode.
   * @param mode a mode string such as "rgb" or "lab"
   * @example Color.maxValue("rgb") will return a rgb Color object with values (255,255,255)
   */
  static maxValues(mode: string): Pt;
  /**
   * Get a hex string such as "#FF0000". Same as `toString("hex")`.
   * For non-RGB colors, convert to RGB first.
   */
  get hex(): string;
  /**
   * Get a rgb string such as "rgb(255,0,0)". Same as `toString("rgb")`.
   * For non-RGB colors, convert to RGB first, eg `Color.HSLtoRGB(color).rgb`.
   */
  get rgb(): string;
  /**
   * Get a rgba string such as "rgba(255,0,0,0.5)". Same as `toString("rgba")`.
   * For non-RGB colors, convert to RGB first.
   */
  get rgba(): string;
  /**
   * Clone this Color.
   */
  clone(): Color;
  /**
   * Get a denormalized copy of a color, trusting the caller's flag over the
   * color's own normalized state so that explicit conversion arguments win.
   * Inlines the range math — this sits on the hot path of every conversion
   * that takes normalized input.
   */
  private static _denorm;
  /**
   * Normalize a freshly computed full-range color in place and flag it.
   * Conversion outputs are always full-range, so no state check is needed.
   */
  private static _normOut;
  /**
   * Convert this color from current color space to another color space.
   * @param mode a ColorType string: "rgb" "hsl" "hsb" "lab" "lch" "luv" "xyz";
   * @param convert if `true`, convert this Color to the new color space specified in `mode`. Default is `false`, which only sets the color mode without converting color values.
   */
  toMode(mode: ColorType, convert?: boolean): this;
  /**
   * Get this Color's mode.
   */
  get mode(): ColorType;
  /**
   * the `r` value in RGB color mode. Same as `x`.
   */
  get r(): number;
  set r(n: number);
  /**
   * the `g` value in RGB color mode. Same as `y`.
   */
  get g(): number;
  set g(n: number);
  /**
   * the `b` value in RGB/LAB/HSB color mode. Same as `z`.
   */
  get b(): number;
  set b(n: number);
  /**
   * the `h` value in HSL/HSB or LCH color mode. Same as either `x` or `z` depending on current color mode.
   */
  get h(): number;
  set h(n: number);
  /**
   * the `s` value in HSL/HSB color mode. Same as `y`.
   */
  get s(): number;
  set s(n: number);
  /**
   * the `l` value in HSL or LCH/LAB color mode. Same as either `x` or `z` depending on current color mode.
   */
  get l(): number;
  set l(n: number);
  /**
   * the `a` value in LAB color mode. Same as `y`.
   */
  get a(): number;
  set a(n: number);
  /**
   * the `c` value in LCH color mode. Same as `y`.
   */
  get c(): number;
  set c(n: number);
  /**
   * the `u` value in LUV color mode. Same as `y`.
   */
  get u(): number;
  set u(n: number);
  /**
   * the `v` value in LUV color mode. Same as `z`.
   */
  get v(): number;
  set v(n: number);
  /**
   * Get alpha value
   */
  set alpha(n: number);
  get alpha(): number;
  /**
   * Check if color values are normalized (between 0 to 1). If conversion is needed, use [`Color.normalize`](#link) function.
   */
  get normalized(): boolean;
  set normalized(b: boolean);
  /**
   * Normalize the color values to between 0 to 1, or revert it back to the min/max values in current color mode.
   * @param toNorm a boolean value specifying whether to normalize (`true`) or revert (`false`)
   */
  normalize(toNorm?: boolean): Color;
  /**
   * Like `normalize()` but returns a new Color.
   * @param toNorm a boolean value specifying whether to normalize (`true`) or revert (`false`)
   * @returns new Color
   */
  $normalize(toNorm?: boolean): Color;
  /**
   * Convert this Color to a string. It can be used to get a hex or rgb string for use in rendering.
   * This formats the current channels without converting color spaces. Convert to RGB before requesting "hex", "rgb", or "rgba". The default "mode" format is for inspecting values, not for CSS rendering.
   * @param format "hex", "rgb", "rgba", or "mode" which means using current color mode label. Default is "mode".
   */
  toString(format?: "hex" | "rgb" | "rgba" | "mode"): string;
  /**
   * A static function to convert RGB to HSL.
   * @param rgb a RGB Color
   * @param normalizedInput a boolean specifying whether input color is normalized. Default is not normalized: `false`.
   * @param normalizedOutput a boolean specifying whether output color shoud be normalized. Default is not normalized: `false`.
   * @returns a new HSL Color
   */
  static RGBtoHSL(rgb: Color, normalizedInput?: boolean, normalizedOutput?: boolean): Color;
  /**
   * A static function to convert HSL to RGB.
   * @param hsl a HSL Color
   * @param normalizedInput a boolean specifying whether input color is normalized. Default is not normalized: `false`.
   * @param normalizedOutput a boolean specifying whether output color shoud be normalized. Default is not normalized: `false`.
   * @returns a new RGB Color
   */
  static HSLtoRGB(hsl: Color, normalizedInput?: boolean, normalizedOutput?: boolean): Color;
  /**
   * A static function to convert RGB to HSB.
   * @param rgb a RGB Color
   * @param normalizedInput a boolean specifying whether input color is normalized. Default is not normalized: `false`.
   * @param normalizedOutput a boolean specifying whether output color shoud be normalized. Default is not normalized: `false`.
   * @returns a new HSB Color
   */
  static RGBtoHSB(rgb: Color, normalizedInput?: boolean, normalizedOutput?: boolean): Color;
  /**
   * A static function to convert HSB to RGB.
   * @param hsb a HSB Color
   * @param normalizedInput a boolean specifying whether input color is normalized. Default is not normalized: `false`.
   * @param normalizedOutput a boolean specifying whether output color shoud be normalized. Default is not normalized: `false`.
   * @returns a new RGB Color
   */
  static HSBtoRGB(hsb: Color, normalizedInput?: boolean, normalizedOutput?: boolean): Color;
  /**
   * A static function to convert RGB to LAB.
   * @param rgb a RGB Color
   * @param normalizedInput a boolean specifying whether input color is normalized. Default is not normalized: `false`.
   * @param normalizedOutput a boolean specifying whether output color shoud be normalized. Default is not normalized: `false`.
   * @returns a new LAB Color
   */
  static RGBtoLAB(rgb: Color, normalizedInput?: boolean, normalizedOutput?: boolean): Color;
  /**
   * A static function to convert LAB to RGB.
   * @param lab a LAB Color
   * @param normalizedInput a boolean specifying whether input color is normalized. Default is not normalized: `false`.
   * @param normalizedOutput a boolean specifying whether output color shoud be normalized. Default is not normalized: `false`.
   * @returns a new RGB Color
   */
  static LABtoRGB(lab: Color, normalizedInput?: boolean, normalizedOutput?: boolean): Color;
  /**
   * A static function to convert RGB to LCH.
   * @param rgb a RGB Color
   * @param normalizedInput a boolean specifying whether input color is normalized. Default is not normalized: `false`.
   * @param normalizedOutput a boolean specifying whether output color shoud be normalized. Default is not normalized: `false`.
   * @returns a new LCH Color
   */
  static RGBtoLCH(rgb: Color, normalizedInput?: boolean, normalizedOutput?: boolean): Color;
  /**
   * A static function to convert LCH to RGB.
   * @param lch a LCH Color
   * @param normalizedInput a boolean specifying whether input color is normalized. Default is not normalized: `false`.
   * @param normalizedOutput a boolean specifying whether output color shoud be normalized. Default is not normalized: `false`.
   * @returns a new RGB Color
   */
  static LCHtoRGB(lch: Color, normalizedInput?: boolean, normalizedOutput?: boolean): Color;
  /**
   * A static function to convert RGB to LUV.
   * @param rgb a RGB Color
   * @param normalizedInput a boolean specifying whether input color is normalized. Default is not normalized: `false`.
   * @param normalizedOutput a boolean specifying whether output color shoud be normalized. Default is not normalized: `false`.
   * @returns a new LUV Color
   */
  static RGBtoLUV(rgb: Color, normalizedInput?: boolean, normalizedOutput?: boolean): Color;
  /**
   * A static function to convert LUV to RGB.
   * @param luv a LUV Color
   * @param normalizedInput a boolean specifying whether input color is normalized. Default is not normalized: `false`.
   * @param normalizedOutput a boolean specifying whether output color shoud be normalized. Default is not normalized: `false`.
   * @returns a new RGB Color
   */
  static LUVtoRGB(luv: Color, normalizedInput?: boolean, normalizedOutput?: boolean): Color;
  /**
   * A static function to convert RGB to XYZ.
   * @param rgb a RGB Color
   * @param normalizedInput a boolean specifying whether input color is normalized. Default is not normalized: `false`.
   * @param normalizedOutput a boolean specifying whether output color shoud be normalized. Default is not normalized: `false`.
   * @returns a new XYZ Color
   */
  static RGBtoXYZ(rgb: Color, normalizedInput?: boolean, normalizedOutput?: boolean): Color;
  /**
   * A static function to convert XYZ to RGB.
   * @param xyz a XYZ Color
   * @param normalizedInput a boolean specifying whether input color is normalized. Default is not normalized: `false`.
   * @param normalizedOutput a boolean specifying whether output color shoud be normalized. Default is not normalized: `false`.
   * @returns a new RGB Color
   */
  static XYZtoRGB(xyz: Color, normalizedInput?: boolean, normalizedOutput?: boolean): Color;
  /**
   * A static function to convert XYZ to LAB.
   * @param xyz a XYZ Color
   * @param normalizedInput a boolean specifying whether input color is normalized. Default is not normalized: `false`.
   * @param normalizedOutput a boolean specifying whether output color shoud be normalized. Default is not normalized: `false`.
   * @returns a new LAB Color
   */
  static XYZtoLAB(xyz: Color, normalizedInput?: boolean, normalizedOutput?: boolean): Color;
  /**
   * A static function to convert LAB to XYZ.
   * @param lab a LAB Color
   * @param normalizedInput a boolean specifying whether input color is normalized. Default is not normalized: `false`.
   * @param normalizedOutput a boolean specifying whether output color shoud be normalized. Default is not normalized: `false`.
   * @returns a new XYZ Color
   */
  static LABtoXYZ(lab: Color, normalizedInput?: boolean, normalizedOutput?: boolean): Color;
  /**
   * A static function to convert XYZ to LUV.
   * @param xyz a XYZ Color
   * @param normalizedInput a boolean specifying whether input color is normalized. Default is not normalized: `false`.
   * @param normalizedOutput a boolean specifying whether output color shoud be normalized. Default is not normalized: `false`.
   * @returns a new LUV Color
   */
  static XYZtoLUV(xyz: Color, normalizedInput?: boolean, normalizedOutput?: boolean): Color;
  /**
   * A static function to convert LUV to XYZ.
   * @param luv a LUV Color
   * @param normalizedInput a boolean specifying whether input color is normalized. Default is not normalized: `false`.
   * @param normalizedOutput a boolean specifying whether output color shoud be normalized. Default is not normalized: `false`.
   * @returns a new XYZ Color
   */
  static LUVtoXYZ(luv: Color, normalizedInput?: boolean, normalizedOutput?: boolean): Color;
  /**
   * A static function to convert LAB to LCH.
   * @param lab a LAB Color
   * @param normalizedInput a boolean specifying whether input color is normalized. Default is not normalized: `false`.
   * @param normalizedOutput a boolean specifying whether output color shoud be normalized. Default is not normalized: `false`.
   * @returns a new LCH Color
   */
  static LABtoLCH(lab: Color, normalizedInput?: boolean, normalizedOutput?: boolean): Color;
  /**
   * A static function to convert LCH to LAB.
   * @param lch a LCH Color
   * @param normalizedInput a boolean specifying whether input color is normalized. Default is not normalized: `false`.
   * @param normalizedOutput a boolean specifying whether output color shoud be normalized. Default is not normalized: `false`.
   * @returns a new LAB Color
   */
  static LCHtoLAB(lch: Color, normalizedInput?: boolean, normalizedOutput?: boolean): Color;
  /**
   * A static function to convert RGB to OKLAB (Ottosson 2020, as specified in CSS Color 4). OKLAB improves on LAB's perceptual uniformity, especially hue stability in blues.
   * @param rgb a RGB Color
   * @param normalizedInput a boolean specifying whether input color is normalized. Default is not normalized: `false`.
   * @param normalizedOutput a boolean specifying whether output color shoud be normalized. Default is not normalized: `false`.
   * @returns a new OKLAB Color
   */
  static RGBtoOKLAB(rgb: Color, normalizedInput?: boolean, normalizedOutput?: boolean): Color;
  /**
   * A static function to convert OKLAB to RGB. Out-of-gamut results are clamped to the sRGB range.
   * @param oklab an OKLAB Color
   * @param normalizedInput a boolean specifying whether input color is normalized. Default is not normalized: `false`.
   * @param normalizedOutput a boolean specifying whether output color shoud be normalized. Default is not normalized: `false`.
   * @returns a new RGB Color
   */
  static OKLABtoRGB(oklab: Color, normalizedInput?: boolean, normalizedOutput?: boolean): Color;
  /**
   * A static function to convert RGB to OKLCH, the cylindrical form of OKLAB as specified in CSS Color 4.
   * @param rgb a RGB Color
   * @param normalizedInput a boolean specifying whether input color is normalized. Default is not normalized: `false`.
   * @param normalizedOutput a boolean specifying whether output color shoud be normalized. Default is not normalized: `false`.
   * @returns a new OKLCH Color
   */
  static RGBtoOKLCH(rgb: Color, normalizedInput?: boolean, normalizedOutput?: boolean): Color;
  /**
   * A static function to convert OKLCH to RGB. Out-of-gamut results are clamped to the sRGB range.
   * @param oklch an OKLCH Color
   * @param normalizedInput a boolean specifying whether input color is normalized. Default is not normalized: `false`.
   * @param normalizedOutput a boolean specifying whether output color shoud be normalized. Default is not normalized: `false`.
   * @returns a new RGB Color
   */
  static OKLCHtoRGB(oklch: Color, normalizedInput?: boolean, normalizedOutput?: boolean): Color;
  /**
   * A static function to convert OKLAB to OKLCH.
   * @param oklab an OKLAB Color
   * @param normalizedInput a boolean specifying whether input color is normalized. Default is not normalized: `false`.
   * @param normalizedOutput a boolean specifying whether output color shoud be normalized. Default is not normalized: `false`.
   * @returns a new OKLCH Color
   */
  static OKLABtoOKLCH(oklab: Color, normalizedInput?: boolean, normalizedOutput?: boolean): Color;
  /**
   * A static function to convert OKLCH to OKLAB.
   * @param oklch an OKLCH Color
   * @param normalizedInput a boolean specifying whether input color is normalized. Default is not normalized: `false`.
   * @param normalizedOutput a boolean specifying whether output color shoud be normalized. Default is not normalized: `false`.
   * @returns a new OKLAB Color
   */
  static OKLCHtoOKLAB(oklch: Color, normalizedInput?: boolean, normalizedOutput?: boolean): Color;
}
//#endregion
//#region src/Util.d.ts
/**
 * Various constant values for enumerations and calculations.
 */
declare const Const: {
  /** A string to indicate xy plane. */
  xy: string;
  /** A string to indicate yz plane. */
  yz: string;
  /** A string to indicate xz plane. */
  xz: string;
  /** A string to indicate xyz space. */
  xyz: string;
  /** Represents horizontal direction. */
  horizontal: number;
  /** Represents vertical direction. */
  vertical: number;
  /** Represents identical point or value */
  identical: number;
  /** Represents right position or direction */
  right: number;
  /** Represents bottom right position or direction */
  bottom_right: number;
  /** Represents bottom position or direction */
  bottom: number;
  /** Represents bottom left position or direction */
  bottom_left: number;
  /** Represents left position or direction */
  left: number;
  /** Represents top left position or direction */
  top_left: number;
  /** Represents top position or direction */
  top: number;
  /** Represents top right position or direction */
  top_right: number;
  /** Represents an arbitrary very small number. It is set as 0.0001 here. */
  epsilon: number;
  /** Represents Number.MAX_VALUE. Note: as a Float32 Pt value this overflows to Infinity. */
  max: number;
  /** Represents Number.MIN_VALUE, the smallest *positive* number (5e-324) — not the most negative number. Do not use it to initialize a running maximum; use -Infinity instead. As a Float32 Pt value this flushes to 0. */
  min: number;
  /** π radian (180 deg) */
  pi: number;
  /** Two π radian (360deg) */
  two_pi: number;
  /** Half π radian (90deg) */
  half_pi: number;
  /** π/4 radian (45deg) */
  quarter_pi: number;
  /** π/180 or 1 degree in radian */
  one_degree: number;
  /** Multiply this constant with a radian to get a degree */
  rad_to_deg: number;
  /** Multiply this constant with a degree to get a radian */
  deg_to_rad: number;
  /** Gravity acceleration (unit: m/s^2) and gravity force (unit: Newton) on 1kg of mass. */
  gravity: number;
  /** 1 Newton: 0.10197 Kilogram-force */
  newton: number;
  /** Gaussian constant (1 / Math.sqrt(2 * Math.PI)) */
  gaussian: number;
};
/**
 * Util class provides static helper functions.
 */
declare class Util {
  static _warnLevel: WarningType;
  /**
   * Set a global warning level setting. If no parameter is passed, this will return the current warn-level. See [`Util.warn`](#link).
   * @param lv a [`WarningType`](#link) option, where "error" will throw an error, "warn" will log in console, and "mute" will ignore the error.
   */
  static warnLevel(lv?: WarningType): WarningType;
  /**
   * Convert different kinds of parameters (arguments, array, object) into an array of numbers.
   * @param args can be either a list of numbers, an array, a Pt, or an object with {x,y,z,w} properties
   */
  static getArgs(args: any[]): Array<number>;
  /**
   * Copy an array or typed array of numbers into a fresh plain array.
   * @param a an array or typed array
   */
  static toNumericArray(a: ArrayLike<number>): number[];
  /**
   * Like [`Util.getArgs`](#link), but avoids copying when the arguments are already
   * a numeric array, a typed array (eg, a Pt), or a list of numbers. The result may be
   * the caller's own object, so it must be treated as read-only.
   * @param args can be either a list of numbers, an array, a Pt, or an object with {x,y,z,w} properties
   */
  static getPtLike(args: any[]): PtLike;
  /**
   * Send a warning message based on [`Util.warnLevel`](#link) global setting. This allows you to dynamically set whether minor errors should be thrown or printed in console or muted.
   * @param message any error or warning message
   * @param defaultReturn optional return value
   */
  static warn(message?: string, defaultReturn?: any): any;
  /**
   * Get a random integer. This can be useful for selecting a random index in an array.
   * @deprecated Use [`Num.randomRange`](#link) instead, for example `Math.floor( Num.randomRange( start, start + range ) )`.
   * @param range value range
   * @param start Optional starting value
   */
  static randomInt(range: number, start?: number): number;
  /**
   * Split an array into chunks of sub-array.
   * @param pts an array
   * @param size chunk size, ie, number of items in a chunk
   * @param stride optional parameter to "walk through" the array in steps
   * @param loopBack if `true`, always go through the array till the end and loop back to the beginning to complete the segments if needed.
   * @param matchSize if `true`, all chunks's length must match `size`.
   */
  static split(pts: any[], size: number, stride?: number, loopBack?: boolean, matchSize?: boolean): any[][];
  /**
   * Flatten an array of arrays such as Group[] to a flat Array or Group.
   * @param pts an array, usually an array of Groups
   * @param flattenAsGroup a boolean to specify whether the return type should be a Group or Array. Default is `true` which returns a Group.
   */
  static flatten(pts: any[], flattenAsGroup?: boolean): any;
  /**
   * Given two arrays of objects, and a function that operate on two objects, return an array. Objects must be of same type.
   * @param a an array of object, eg `[Group, Group, ...]`
   * @param b another array of object
   * @param op a function that takes two parameters (a, b) and returns an object.
   */
  static combine<T>(a: T[], b: T[], op: (a: T, b: T) => T): T[];
  /**
   * Zip arrays. eg, `[[1,2],[3,4],[5,6]] => [[1,3,5],[2,4,6]]`.
   * @param arrays an array of arrays
   */
  static zip(arrays: Array<any>[]): any[][];
  /**
   * Create a convenient stepper. This returns a function which you can call repeatedly to step a counter.
   * @param max Maximum of the stepper range. The resulting stepper will return values within [min, max). Note that the first call returns `min + stride`, not `min`.
   * @param min Minimum of the stepper range. Default is 0.
   * @param stride Stride of the step. Default is 1.
   * @param callback An optional callback function `fn( step )`, which will be called each time when stepper function is called.
   * @example `let counter = stepper(100); let c = counter(); c = counter(); ...`
   * @returns a function which will increment the stepper and return its value at each call.
   */
  static stepper(max: number, min?: number, stride?: number, callback?: (n: number) => void): () => number;
  /**
   * A convenient way to step through a range. Same as `for (i=0; i<range; i++)`, except this also stores the resulting return values at each step and return them as an array.
   * @param range a range to step through
   * @param fn a callback function `fn(index)`. If this function returns a value, it will be stored at each step
   * @returns an index-aligned array of returned values: entries sit at their step index, so with a non-zero `start` the positions below `start` are empty holes
   */
  static forRange(fn: (index: number) => any, range: number, start?: number, step?: number): any[];
  /**
   * A helper function to load data from a url via XMLHttpRequest GET. Since the response passed into callback is a string, if you're loading json data, you may use standard `JSON.parse(response)` to get a JSON object. For csv, try using a javascript csv library like papaparse or vega/datalib.
   * @param url the request url
   * @param callback a function to capture the data. It receives two parameters: a `response` as string, and a `success` status as boolean.
   */
  static load(url: string, callback: (response: string, success: boolean) => void): void;
  /**
   * Download the current `CanvasSpace` as an image (jpg/png/webp). Calling this function will automatically trigger a download.
   * @param space an instance of `CanvasSpace`
   * @param filename the name of the file, without the extension name.
   * @param filetype the image type (jpg/png/webp)
   * @param quality a value between 0 to 1, if filetype is either "jpg" or "png"
   */
  static download(space: CanvasSpace, filename?: string, filetype?: "jpeg" | "jpg" | "png" | "webp", quality?: number): void;
  /**
   * Estimate performance by checking how long it takes to render a frame
   * @param avgFrames The number of frames used calculate to average
   * @example `let perf = Util.performance(); perf();`
   * @returns milliseconds per frame
   */
  static performance(avgFrames?: number): () => number;
  /**
   * Check number of items in a Group against a required number
   * @param pts a Group or an Iterable<PtLike>
   * @param minRequired minimum number of items required
   */
  static arrayCheck(pts: PtLikeIterable, minRequired?: number): boolean;
  /**
   * Convert an iterable into an array
   * @param it an iterable
   */
  static iterToArray(it: Iterable<any>): any[];
  /**
   * Check if accessing from a mobile device. Can be useful since some experimental features may not be availble in mobile browsers.
   */
  static isMobile(): boolean;
  /**
   * Generate a time-based unique ID or a crypto-based ID.
   * @returns
   */
  static uniqueId(useCrypto?: boolean): string;
}
//#endregion
//#region src/Dom.d.ts
/**
 * DOMSpace hosts a Space in a DOM element. It is the subclassing entry point for building
 * custom element-based spaces; usually its subclass [`SVGSpace`](#link) should be used instead.
 * Learn more about spaces in [this guide](../guide/Space-0500.html).
 *
 * When using a Space inside a component framework, create it on mount and call
 * [`DOMSpace.dispose`](#link) on unmount so listeners and the animation loop are released.
 * For example, in React:
 * ```
 * useEffect(() => {
 *   const space = new SVGSpace(ref.current).setup({ resize: true });
 *   space.add(...).play();
 *   return () => { space.dispose(); };
 * }, []);
 * ```
 * Dispose is idempotent, and a new Space can be mounted on the same element afterwards
 * (as happens under React's StrictMode).
 */
declare class DOMSpace extends MultiTouchSpace {
  protected _canvas: HTMLElement | SVGElement;
  protected _container: Element;
  id: string;
  protected _autoResize: boolean;
  protected _bgcolor: string;
  protected _css: {};
  private _domDisposed;
  private _readyTimer;
  private _ownsContainer;
  private readonly _resizeHandlerBound;
  /**
   * Create a DOMSpace for HTML DOM elements
   * @param elem Specify an element by its "id" attribute as string, or by the element object itself. If left empty, a `<div id="pt_container"><div id="pt" /></div>` will be added to DOM; a missing id is created the same way. Use css to customize its appearance if needed.
   * @param callback an optional callback `function(boundingBox, spaceElement)` to be called when element is appended and ready. Alternatively, a "ready" event will also be fired from the element when it's appended, which can be traced with `spaceInstance.element.addEventListener("ready")`
   * @example `new DOMSpace( "#myElementID" )`
   */
  constructor(elem?: string | Element | null, callback?: (bound: Bound, elem: Element) => void);
  /**
   * Create the drawing element for a target that does not exist yet, inside the created container.
   * Subclasses that draw into a specific element type override this.
   * @param container the created container
   * @param id the id for the new element
   */
  protected _createDefaultElement(container: Element, id: string): HTMLElement | SVGElement;
  /**
   * Helper function to create a DOM element.
   * @param elem element tag name
   * @param id element id attribute
   * @param appendTo Optional, if specified, the created element will be appended to this element
   */
  static createElement(elem: string | undefined, id: string, appendTo?: Element): Element;
  /**
   * Handle callbacks after element is mounted in DOM.
   * @param callback
   */
  private _ready;
  /**
   * Set up various options for DOMSpace. This is usually set during instantiation, eg `new DOMSpace(...).setup( {opt} )`.
   * @param opt an object with these optional properties: **bgcolor** is a hex or rgba string to set initial background color of the canvas, or use `false` or "transparent" to set a transparent background; **resize** a boolean to set whether `<canvas>` size should auto resize to match its container's size, which can also be set using `autoSize()`.
   * @example `space.setup({ bgcolor: "#f00", resize: true })`
   */
  setup(opt: {
    bgcolor?: string;
    resize?: boolean;
  }): this;
  /**
   * Not implemented. See SVGSpace and HTMLSpace for implementation.
   */
  getForm(): Form;
  /**
   * Set whether the canvas element should resize when its container is resized.
   * @param auto a boolean value indicating if auto size is set
   */
  set autoResize(auto: boolean);
  get autoResize(): boolean;
  /**
   * This overrides Space's `resize` function. It's used as a callback function for window's resize event and not usually called directly. You can keep track of resize events with `resize: (bound, evt)` callback in your player objects (See [`Space.add`](#link) function).
   * @param b a Bound object to resize to
   * @param evt Optionally pass a resize event
   */
  resize(b: Bound, evt?: Event | null): this;
  /**
   * Window resize handling.
   * @param evt
   */
  protected _resizeHandler(evt: Event | null): void;
  /**
   * Get this DOM element.
   */
  get element(): Element;
  /**
   * Get the parent DOM element that contains this DOM element.
   */
  get parent(): Element;
  /**
   * A property to indicate if the Space is ready.
   */
  get ready(): boolean;
  /**
   * Clear the element's contents, and optionally set a new background color. This overrides Space's `clear` function.
   * @param bg Optionally specify a custom background color in hex or rgba string, or "transparent". If not defined, it will use its `bgcolor` property as background color to clear the canvas.
   */
  clear(bg?: string): this;
  /**
    * Set a background color on the container element.
    @param bg background color as hex or rgba string
    */
  set background(bg: string);
  get background(): string;
  /**
   * Add or update a style definition, and optionally update that style in the Element.
   * @param key style name
   * @param val style value
   * @param update a boolean to update the element's style immediately if set to `true`. Default is `false`.
   */
  style(key: string, val: string, update?: boolean): this;
  /**
   * Add of update a list of style definitions, and optionally update those styles in the Element.
   * @param styles a key-value objects of style definitions
   * @param update a boolean to update the element's style immediately if set to `true`. Default is `false`.
   * @return this
   */
  styles(styles: Record<string, string>, update?: boolean): this;
  /**
   * A static helper function to add or update Element attributes.
   * @param elem Element to update
   * @param data an object with key-value pairs
   * @returns this DOM element
   */
  static setAttr(elem: Element, data: Record<string, any>): Element;
  /**
   * A static helper function to compose an inline style string from a object of styles.
   * @param data an object with key-value pairs
   * @example `DOMSpace.getInlineStyles( {width: "100px", "font-size": "10px"} )`
   */
  static getInlineStyles(data: Record<string, any>): string;
  /**
   * Dispose of browser resources held by this space and remove all players. Call this before
   * unmounting the DOM, eg in a framework component's unmount/cleanup callback. Dispose is
   * idempotent, and a new Space can be created on the same element afterwards.
   */
  dispose(): this;
}
/**
 * @deprecated HTML rendering is deprecated and will be removed in a future major version. Use [`SVGSpace`](#link) for DOM-based output instead — it shares the supported subset of the [`CanvasForm`](#link) drawing API.
 * **[Experimental]** HTMLSpace is a subclass of DOMSpace that works with HTML elements. See [a demo here](https://ptsjs.org/demo/?name=htmlform.scope).
 */
declare class HTMLSpace extends DOMSpace {
  /**
   * Get a new `HTMLForm` which provides visualization functions in html elements.
   * @see `HTMLForm`
   */
  getForm(): Form;
  /**
   * A static function to add a DOM element inside a node. Usually you don't need to use this directly. See methods in [`HTMLForm`](#link) instead.
   * @param parent the parent element, or `null` to use current `<svg>` as parent.
   * @param name a string of element name,  such as `rect` or `circle`
   * @param id id attribute of the new element
   * @param autoClass add a class based on the id (from char 0 to index of "-"). Default is true.
   */
  static htmlElement(parent: Element | null | undefined, name: string, id?: string, autoClass?: boolean): HTMLElement;
  /**
   * Remove an item from this space.
   * @param player a player item with an auto-assigned `animateID` property
   */
  remove(player: IPlayer): this;
  /**
   * Remove all items from this space. This clears the contents of the space's
   * element but never touches its container.
   */
  removeAll(): this;
}
/**
 * @deprecated HTML rendering is deprecated and will be removed in a future major version. Use [`SVGForm`](#link) for DOM-based output instead — it shares the complete [`CanvasForm`](#link) drawing API.
 * **[Experimental]** HTMLForm is an implementation of abstract class [`VisualForm`](#link). It provide methods to express Pts on [`HTMLSpace`](#link).
 */
declare class HTMLForm extends VisualForm {
  /**
   * store common styles so that they can be restored to canvas context when using multiple forms. See `reset()`.
   */
  protected _style: {
    filled: boolean;
    stroked: boolean;
    background: string;
    "border-color": string;
    color: string;
    "border-width": string;
    "border-radius": string;
    "border-style": string;
    opacity: number;
    position: string;
    top: number;
    left: number;
    width: number;
    height: number;
  };
  protected _ctx: DOMFormContext;
  static get groupID(): number;
  static set groupID(n: number);
  static get domID(): number;
  static set domID(n: number);
  protected _space: HTMLSpace;
  protected _ready: boolean;
  protected _formID: number;
  /**
   * Create a new `HTMLForm`. Alternatively, you can use [`HTMLSpace.getForm`](#link) function to get an instance of HTMLForm.
   * @param space the space to use
   */
  constructor(space: HTMLSpace);
  /**
   * Get the corresponding space for this form
   */
  get space(): HTMLSpace;
  /**
   * Usually not used directly. This updates a style in `_ctx` context or throw an Error if the style doesn't exist.
   * @param k style key
   * @param v  style value
   * @param unit Optional unit like 'px' to append to value
   */
  protected styleTo(k: string, v: any, unit?: string): void;
  /**
   * Set current alpha value.
   * @example `form.alpha(0.6)`
   * @param a alpha value between 0 and 1
   */
  alpha(a: number): this;
  /**
   * Set current fill style. Provide a valid color string or `false` to specify no fill color.
   * @example `form.fill("#F90")`, `form.fill("rgba(0,0,0,.5")`, `form.fill(false)`
   * @param c fill color
   */
  fill(c: string | boolean): this;
  /**
   * Set current stroke style. Provide a valid color string or `false` to specify no stroke color.
   * @example `form.stroke("#F90")`, `form.stroke("rgba(0,0,0,.5")`, `form.stroke(false)`, `form.stroke("#000", 0.5, 'round', 'square')`
   * @param c stroke color which can be as color, gradient, or pattern. (See [canvas documentation](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/strokeStyle))
   * @param width Optional value (can be floating point) to set line width
   * @param linejoin not implemented in HTMLForm
   * @param linecap not implemented in HTMLForm
   */
  stroke(c: string | boolean, width?: number, linejoin?: string, linecap?: string): this;
  /**
   * Set current text color style. Provide a valid color string.
   * @example `form.fill("#F90")`, `form.fill("rgba(0,0,0,.5")`, `form.fill(false)`
   * @param c fill color
   */
  fillText(c: string): this;
  /**
   * Add custom class to the created element.
   * @param c custom class name or `false` to reset it
   * @example `form.fill("#f00").cls("myClass").rects(r)` `form.cls(false).circles(c)`
   */
  cls(c: string | boolean): this;
  /**
   * Set the current font.
   * @param sizeOrFont either a number to specify font-size, or a `Font` object to specify all font properties
   * @param weight Optional font-weight string such as "bold"
   * @param style Optional font-style string such as "italic"
   * @param lineHeight Optional line-height number suchas 1.5
   * @param family Optional font-family such as "Helvetica, sans-serif"
   * @example `form.font( myFont )`, `form.font(14, "bold")`
   */
  font(sizeOrFont: number | Font, weight?: string, style?: string, lineHeight?: number, family?: string): this;
  /**
   * Reset the context's common styles to this form's styles. This supports using multiple forms on the same canvas context.
   */
  reset(): this;
  /**
   * Set this form's group scope by an ID, and optionally define the group's parent element. A group scope keeps track of elements by their generated IDs, and updates their properties as needed. See also `scope()`.
   * @param group_id a string to use as prefix for the group's id. For example, group_id "hello" will create elements with id like "hello-1", "hello-2", etc
   * @param group Optional DOM element to define this group's parent element
   * @returns this form's context
   */
  updateScope(group_id: string, group?: Element): DOMFormContext;
  /**
   * Set the current group scope to an item added into space, in order to keep track of any point, circle, etc created within it. The item must have an `animateID` property, so that elements created within the item will have generated IDs like "item-{animateID}-{count}".
   * @param item a "player" item that's added to space (see `space.add(...)`) and has an `animateID` property
   * @returns this form's context
   */
  scope(item: IPlayer): DOMFormContext;
  /**
   * Get next available id in the current group.
   * @returns an id string
   */
  nextID(): string;
  /**
   * A static function to generate an ID string based on a context object.
   * @param ctx a context object for an HTMLForm
   */
  static getID(ctx: DOMFormContext): string;
  /**
   * A static function to generate an ID string for a scope, based on a "player" item in the Space.
   * @param item a "player" item that's added to space (see `space.add(...)`) and has an `animateID` property
   */
  static scopeID(item: IPlayer): string;
  /**
   * A static function to help adding style object to an element. This put all styles into `style` attribute instead of individual attributes, so that the styles can be parsed by Adobe Illustrator.
   * @param elem A DOM element to add to
   * @param styles an object of style properties
   * @example `HTMLForm.style(elem, {fill: "#f90", stroke: false})`
   * @returns DOM element
   */
  static style(elem: Element, styles: Record<string, any>): Element;
  /**
   * A helper function to set top, left, width, height of DOM element.
   * @param ctx the HTMLForm context whose style is updated
   * @param pt left and top position
   * @param size width and height
   */
  static rectStyle(ctx: DOMFormContext, pt: PtLike, size: PtLike): DOMFormContext;
  /**
   * A helper function to set the top and left position styling of text DOM context.
   * @param ctx context to add style to
   * @param pt a Pt object or numeric array determining the top-left position of the text
   */
  static textStyle(ctx: DOMFormContext, pt: PtLike): DOMFormContext;
  /**
   * A static function to draws a point.
   * @param ctx a context object of HTMLForm
   * @param pt a Pt object or numeric array
   * @param radius radius of the point. Default is 5.
   * @param shape The shape of the point. Defaults to "square", but it can be "circle" or a custom shape function in your own implementation.
   * @example `HTMLForm.point( p )`, `HTMLForm.point( p, 10, "circle" )`
   */
  static point(ctx: DOMFormContext, pt: PtLike, radius?: number, shape?: string): Element;
  /**
   * Draws a point.
   * @param pt a Pt object
   * @param radius radius of the point. Default is 5.
   * @param shape The shape of the point. Defaults to "square", but it can be "circle" or a custom shape function in your own implementation.
   * @example `form.point( p )`, `form.point( p, 10, "circle" )`
   */
  point(pt: PtLike, radius?: number, shape?: string): this;
  /**
   * A static function to draw a circle.
   * @param ctx a context object of HTMLForm
   * @param pt center position of the circle
   * @param radius radius of the circle
   */
  static circle(ctx: DOMFormContext, pt: PtLike, radius?: number): Element;
  /**
   * Draw a circle.
   * @param pts usually a Group of 2 Pts, but it can also take an array of two numeric arrays [ [position], [size] ]
   * @see [`Circle.fromCenter`](#link)
   */
  circle(pts: GroupLike | number[][]): this;
  /**
   * A static function to draw a square.
   * @param ctx a context object of HTMLForm
   * @param pt center position of the square
   * @param halfsize half size of the square
   */
  static square(ctx: DOMFormContext, pt: PtLike, halfsize: number): HTMLElement;
  /**
   * Draw a square, given a center and its half-size.
   * @param pt center Pt
   * @param halfsize half-size
   */
  square(pt: PtLike, halfsize: number): this;
  /**
   * A static function to draw a rectangle.
   * @param ctx a context object of HTMLForm
   * @param pts a Group or an Iterable<PtLike> with 2 Pt specifying the top-left and bottom-right positions.
   */
  static rect(ctx: DOMFormContext, pts: PtLikeIterable): Element | undefined;
  /**
   * Draw a rectangle.
   * @param pts a Group or an Iterable<PtLike> with 2 Pt specifying the top-left and bottom-right positions.
   */
  rect(pts: PtLikeIterable): this;
  /**
   * A static function to draw text.
   * @param ctx a context object of HTMLForm
   * @param pt a Point object to specify the anchor point
   * @param txt a string of text to draw
   */
  static text(ctx: DOMFormContext, pt: PtLike, txt: string): Element;
  /**
   * Draw text in a DOM element.
   * @param pt a Pt or numeric array to specify the anchor point
   * @param txt text
   */
  text(pt: PtLike, txt: string): this;
  /**
   * A convenient way to draw some text on canvas for logging or debugging. It'll be draw on the top-left of the canvas as an overlay.
   * @param txt text
   */
  log(txt: any): this;
  /**
   * Arc is not implemented in HTMLForm.
   */
  arc(pt: PtLike, radius: number, startAngle: number, endAngle: number, cc?: boolean): this;
  /**
   * Line is not implemented in HTMLForm.
   */
  line(pts: GroupLike | number[][]): this;
  /**
   * Polygon is not implemented in HTMLForm.
   * @param pts
   */
  polygon(pts: GroupLike | number[][]): this;
}
//#endregion
//#region src/Svg.d.ts
/**
 * A gradient handle returned by [`SVGContext2D`](#link)'s `createLinearGradient` and
 * `createRadialGradient`. It is structurally compatible with `CanvasGradient` (it has
 * `addColorStop`), and materializes into an SVG `<defs>` gradient when first painted.
 */
declare class SVGGradient {
  readonly id: string;
  readonly kind: "linear" | "radial";
  readonly coords: number[];
  stops: [number, string][];
  protected _elem: SVGElement | null;
  constructor(kind: "linear" | "radial", coords: number[]);
  addColorStop(offset: number, color: string): void;
  /** Create or update the `<defs>` element for this gradient and return its paint url. */
  materialize(defs: SVGElement): string;
  protected _render(elem: SVGElement): void;
}
/** A pending draw record produced by SVGContext2D, consumed by the frame commit. */
type SVGRun = {
  tag: "path" | "text" | "image";
  attrs: Record<string, string | number>;
  text?: string;
  shapeEnds?: number[];
};
/**
 * **`SVGContext2D`** implements the subset of `CanvasRenderingContext2D` that
 * [`CanvasForm`](#link) draws through, and renders it as SVG. Consecutive shapes that share
 * paint state are merged into single `<path>` elements ("style runs"), so the DOM cost per
 * frame is proportional to the number of style changes, not the number of shapes. This is
 * what lets sketches using the supported subset run unchanged on canvas and SVG.
 *
 * Capability notes: blend-mode composites map to `mix-blend-mode`; Porter-Duff composites,
 * `clip`, and `putImageData` warn once and no-op. Text metrics come from a hidden canvas, so
 * `textBox` layout matches canvas exactly. When shapes with both fill and stroke are merged,
 * all fills in a run paint before its strokes — visible only for overlapping same-styled
 * shapes.
 *
 * **Writing your own renderer**: this class is the reference implementation of the rendering
 * contract — any object implementing the same context surface can be handed to
 * [`CanvasForm`](#link)'s constructor to become a Pts renderer (a PDF writer, a command
 * recorder, a test snapshotter, and so on). The surface is the subset of
 * `CanvasRenderingContext2D` that `CanvasForm` draws through:
 * - path verbs: `beginPath`, `moveTo`, `lineTo`, `quadraticCurveTo`, `bezierCurveTo`,
 *   `rect`, `arc`, `ellipse`, `closePath`
 * - paint: `fill`, `stroke`, `fillRect`, `clearRect`
 * - state: `save`, `restore`, `clip`, `scale`
 * - style fields: `fillStyle`, `strokeStyle`, `lineWidth`, `lineJoin`, `lineCap`,
 *   `globalAlpha`, `globalCompositeOperation`, `setLineDash`, `lineDashOffset`
 * - text: `font`, `textAlign`, `textBaseline`, `fillText`, `measureText`
 * - images: `drawImage`, `putImageData`
 * - gradients: `createLinearGradient`, `createRadialGradient`
 *
 * A renderer driven by a Space should also expose a frame lifecycle like
 * [`SVGContext2D.beginFrame`](#link) / [`SVGContext2D.commitFrame`](#link), called around the
 * players' animate callbacks. The unit test "implements every context member that CanvasForm
 * uses" is the compatibility alarm: it fails when a new `CanvasForm` feature touches a
 * context member a renderer does not implement.
 */
declare class SVGContext2D {
  fillStyle: string | SVGGradient;
  strokeStyle: string | SVGGradient;
  lineWidth: number;
  lineJoin: string;
  lineCap: string;
  globalAlpha: number;
  globalCompositeOperation: string;
  font: string;
  textAlign: string;
  textBaseline: string;
  lineDashOffset: number;
  protected _dash: number[];
  protected _stateStack: object[];
  /** Optional CSS class applied to emitted elements (see `SVGForm.cls`). */
  className: string;
  protected _d: string;
  protected _shapeFill: string | null;
  protected _shapeStroke: string | null;
  protected _shapeStrokeStyle: Record<string, string | number>;
  protected _shapePainted: boolean;
  protected _shapeClass: string;
  protected _shapeAlpha: number;
  protected _shapeBlend: string;
  protected _runs: SVGRun[];
  protected _drawCount: number;
  protected _host: SVGElement;
  protected _group: SVGElement | null;
  protected _defs: SVGElement | null;
  protected _pool: SVGElement[];
  protected _attrCache: Record<string, string>[];
  constructor(host: SVGElement);
  protected static _warnOnce(key: string, msg: string): void;
  /** Start a new frame: subsequent draws build a fresh run list. */
  beginFrame(): void;
  /** Number of paint calls since `beginFrame` — used to skip empty commits. */
  get drawCount(): number;
  /** The `<g>` element holding this context's rendered output. */
  get group(): SVGElement | null;
  /**
   * Commit the frame: reconcile the run list against the pooled elements, patching only
   * changed attributes, and truncate unused elements.
   */
  commitFrame(): void;
  /** The current frame's run list (used by expanded export). */
  get runs(): SVGRun[];
  /** Forget cached DOM references, eg after the host's contents were removed externally. */
  resetDom(): void;
  /**
   * Remove this context's managed elements from the DOM and forget them. Used when a space
   * is disposed so that a re-mounted space on the same element starts clean.
   */
  disposeDom(): void;
  beginPath(): void;
  closePath(): void;
  moveTo(x: number, y: number): void;
  lineTo(x: number, y: number): void;
  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void;
  bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void;
  rect(x: number, y: number, w: number, h: number): void;
  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, ccw?: boolean): void;
  ellipse(x: number, y: number, rx: number, ry: number, rotation: number, startAngle: number, endAngle: number, ccw?: boolean): void;
  fill(): void;
  stroke(): void;
  protected _capturePaintState(): void;
  fillRect(x: number, y: number, w: number, h: number): void;
  clearRect(): void;
  fillText(txt: string, x: number, y: number, maxWidth?: number): void;
  measureText(txt: string): TextMetrics;
  drawImage(img: CanvasImageSource, x: number, y: number, w?: number, h?: number, ...rest: number[]): void;
  putImageData(): void;
  save(): void;
  restore(): void;
  scale(): void;
  clip(): void;
  setLineDash(segments: number[]): void;
  getLineDash(): number[];
  createLinearGradient(x1: number, y1: number, x2: number, y2: number): SVGGradient;
  createRadialGradient(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number): SVGGradient;
  protected _resolvePaint(style: string | SVGGradient): string;
  /** Add class, alpha, and blend attributes shared by all run kinds. */
  protected _applyCommon(attrs: Record<string, string | number>): void;
  /**
   * Commit the current shape (its path and fill/stroke usage) into the run list, merging
   * with the previous run when the paint state matches.
   */
  protected _flushShape(): void;
}
/**
 * SVGSpace extends [`DOMSpace`](#link) to support SVG elements. Use it with [`SVGForm`](#link),
 * which shares its drawing API and semantics with [`CanvasForm`](#link) — a sketch written for
 * canvas can run on SVG with the supported subset. Check out the [Space guide](../guide/Space-0500.html) for details.
 */
declare class SVGSpace extends DOMSpace {
  protected _bgcolor: string;
  protected _svgContexts: SVGContext2D[];
  protected _bgElem: SVGElement | null;
  protected _svgRefresh: boolean;
  /**
   * Create a SVGSpace which represents a Space for SVG elements.
   * @param elem Specify an element by its "id" attribute as string, or by the element object itself. An element can be an existing `<svg>`, or a `<div>` container in which a new `<svg>` will be created. If left empty, a `<div id="pt_container"><svg id="pt" /></div>` will be added to DOM. Use css to customize its appearance if needed.
   * @param callback an optional callback `function(boundingBox, spaceElement)` to be called when canvas is appended and ready. Alternatively, a "ready" event will also be fired from the `<svg>` element when it's appended, which can be traced with `spaceInstance.canvas.addEventListener("ready")`
   * @example `new SVGSpace( "#myElementID" )`
   */
  constructor(elem?: string | Element | null, callback?: (bound: Bound, elem: Element) => void);
  /**
   * For a missing target, create the documented `<svg id="pt">` inside the created container.
   */
  protected _createDefaultElement(container: Element, id: string): SVGElement;
  /**
   * Get a new [`SVGForm`](#link) for drawing. The form shares its API with
   * [`CanvasForm`](#link), rendered through a [`SVGContext2D`](#link).
   * @see `SVGForm`
   */
  getForm(): SVGForm;
  /**
   * Get the DOM element.
   */
  get element(): Element;
  /** Register a rendering context so its frame lifecycle follows this space's play cycle. */
  registerContext(ctx: SVGContext2D): void;
  /**
   * This overrides Space's `resize` function. It's used as a callback function for window's resize event and not usually called directly.
   * You can keep track of resize events with `resize: (bound ,evt)` callback in your [`IPlayer`](#link) objects (See [`Space.add`](#link)).
   * @param b a Bound object to resize to
   * @param evt Optionally pass a resize event
   */
  resize(b: Bound, evt?: Event | null): this;
  /**
   * Clear the drawing. In SVG this maintains a background rectangle rather than erasing
   * elements — the per-frame reconciliation removes stale shapes.
   * @param bg Optionally specify a custom background color in hex or rgba string, or "transparent"
   */
  clear(bg?: string): this;
  protected _updateBackground(): void;
  /**
   * The per-frame cycle: begin all registered contexts' frames, run the players, then
   * commit — reconciling the SVG DOM against what was drawn this frame.
   */
  protected playItems(time: number): void;
  /**
   * Set whether the rendering should be repainted on each frame.
   * @param b a boolean value to set whether to repaint each frame
   */
  refresh(b: boolean): this;
  /**
   * Serialize the current SVG output to a string.
   * @param expand if `true`, split merged style runs into one element per shape — a
   * semantic export suited for editing in vector tools. Default is `false`.
   */
  toSVG(expand?: boolean): string;
  /**
   * A static function to add a svg element inside a node. Usually you don't need to call this directly. See methods in [`SVGForm`](#link) instead.
   * @param parent the parent element, or `null` to use current `<svg>` as parent.
   * @param name a string of element name,  such as `rect` or `circle`
   * @param id id attribute of the new element
   */
  static svgElement(parent: Element | null | undefined, name: string, id?: string): SVGElement;
  /**
   * Remove an item from this Space.
   * @param player a player item with an auto-assigned `animateID` property
   */
  remove(player: IPlayer): this;
  /**
   * Remove all items from this Space. This clears the contents of the space's
   * `<svg>` element but never touches its container, so the space keeps
   * rendering after items are re-added.
   */
  removeAll(): this;
  /**
   * Dispose of browser resources held by this space: listeners, the animation loop, and the
   * elements this space manages inside the `<svg>`. Call this before unmounting, eg in a
   * framework component's cleanup callback. A new space can be mounted on the same element
   * afterwards (as happens under React's StrictMode).
   */
  dispose(): this;
}
/**
 * SVGForm is a [`CanvasForm`](#link) rendered through a [`SVGContext2D`](#link): it inherits
 * the canvas drawing API — shapes, gradients, dashes, images, `textBox` — with SVG
 * output, subject to the capability notes in `SVGContext2D`. Sketches using this subset
 * can swap between `CanvasSpace` and `SVGSpace`. The legacy per-element static helpers and `scope()` workflow are retained
 * for compatibility but are no longer needed.
 */
declare class SVGForm extends CanvasForm<SVGSpace> {
  protected _svgSpace: SVGSpace;
  protected _svgCtx: SVGContext2D;
  protected _formID: number;
  protected _legacyCtx: DOMFormContext;
  static get groupID(): number;
  static set groupID(n: number);
  static get domID(): number;
  static set domID(n: number);
  /**
   * Create a new SVGForm. You may also use [`SVGSpace.getForm`](#link) to get a default form directly.
   * @param space an instance of SVGSpace
   */
  constructor(space: SVGSpace);
  /**
   * Mirror style writes into the legacy scope context, so the static per-element helpers
   * (`SVGForm.circle( form.scope(player), ... )`) draw with the form's current fill, stroke,
   * alpha, and font as they did before the rendering-context path existed.
   */
  protected _set(key: string, value: unknown): void;
  get filled(): boolean;
  set filled(b: boolean);
  get stroked(): boolean;
  set stroked(b: boolean);
  /**
   * Offscreen buffers require Canvas output. In SVG this warns once and draws directly.
   */
  useOffscreen(_off?: boolean, _clear?: boolean | string): this;
  /**
   * Offscreen buffers require Canvas output. In SVG this warns once and does nothing.
   */
  renderOffscreen(_offset?: PtLike): void;
  private static _offscreenWarned;
  private static _warnOffscreen;
  /**
   * Get the [`SVGSpace`](#link) instance that this form is associated with.
   */
  get space(): SVGSpace;
  /**
   * The underlying [`SVGContext2D`](#link), for advanced use.
   */
  get svgContext(): SVGContext2D;
  /**
   * Add custom class to the created element(s). In batched rendering the class applies to
   * the current style run.
   * @param c custom class name or `false` to reset it
   * @example `form.fill("#f00").cls("myClass").rects(r)` `form.cls(false).circles(c)`
   */
  cls(c: string | boolean): this;
  /**
   * @deprecated No longer needed: elements are reconciled automatically each frame. Kept
   * for compatibility with code that pairs it with the legacy static helpers.
   */
  updateScope(group_id: string, group?: Element): DOMFormContext;
  /**
   * @deprecated No longer needed: elements are reconciled automatically each frame. Kept
   * for compatibility; returns the legacy context used by the static helpers.
   */
  scope(item: IPlayer): DOMFormContext;
  /**
   * @deprecated Part of the legacy scope workflow.
   */
  nextID(): string;
  /**
   * A static function to generate an ID string based on a context object.
   * @param ctx a context object for an SVGForm
   */
  static getID(ctx: DOMFormContext): string;
  /**
   * A static function to generate an ID string for a scope, based on an [`IPlayer`](#link) object in the Space.
   * @param item a [`IPlayer`](#link) object that's added to space (see [`Space.add`](#link)) and has an `animateID` property
   */
  static scopeID(item: IPlayer): string;
  /**
   * A static function to help adding style object to an element.
   * Note that this put all styles into `style` attribute instead of individual svg attributes, so that the styles can be parsed by Adobe Illustrator.
   * @param elem A DOM element to add to
   * @param styles an object of style properties
   * @example `SVGForm.style(elem, {fill: "#f90", stroke: false})`
   * @returns this DOM element
   */
  static style(elem: SVGElement, styles: Record<string, any>): Element;
  /** Draw through a rendering context, or use the legacy per-element DOM context. */
  static point(ctx: DOMFormContext, pt: PtLike, radius?: number, shape?: string): SVGElement;
  static point(ctx: RenderingContext2D, pt: PtLike, radius?: number, shape?: string): void;
  /** Draw through a rendering context, or use the legacy per-element DOM context. */
  static circle(ctx: DOMFormContext, pt: PtLike, radius?: number): SVGElement;
  static circle(ctx: RenderingContext2D, pt: PtLike, radius?: number): void;
  /** Draw through a rendering context, or use the legacy per-element DOM context. */
  static arc(ctx: DOMFormContext, pt: PtLike, radius: number, startAngle: number, endAngle: number, cc?: boolean): SVGElement;
  static arc(ctx: RenderingContext2D, pt: PtLike, radius: number, startAngle: number, endAngle: number, cc?: boolean): void;
  /** Draw through a rendering context, or use the legacy per-element DOM context. */
  static square(ctx: DOMFormContext, pt: PtLike, halfsize: number): SVGElement;
  static square(ctx: RenderingContext2D, pt: PtLike, halfsize: number): void;
  /** Draw through a rendering context, or use the legacy per-element DOM context. */
  static line(ctx: DOMFormContext, pts: PtLikeIterable): SVGElement | undefined;
  static line(ctx: RenderingContext2D, pts: PtLikeIterable): void;
  /** Draw through a rendering context, or use the legacy per-element DOM context. */
  static polygon(ctx: DOMFormContext, pts: PtLikeIterable): SVGElement;
  static polygon(ctx: RenderingContext2D, pts: PtLikeIterable): void;
  /** Draw through a rendering context, or use the legacy per-element DOM context. */
  static rect(ctx: DOMFormContext, pts: PtLikeIterable): SVGElement | undefined;
  static rect(ctx: RenderingContext2D, pts: PtLikeIterable): void;
  /** Draw through a rendering context, or use the legacy per-element DOM context. */
  static text(ctx: DOMFormContext, pt: PtLike, txt: string): SVGElement;
  static text(ctx: RenderingContext2D, pt: PtLike, txt: string, maxWidth?: number): void;
  /**
   * A static function to draw a point as a circle or square element.
   * @param ctx a context object of SVGForm
   * @param pt a Pt object or numeric array
   * @param radius radius of the point. Default is 5.
   * @param shape The shape of the point. Defaults to "square", but it can be "circle" or a custom shape function in your own implementation.
   * @example `SVGForm.point( ctx, p )`, `SVGForm.point( ctx, p, 10, "circle" )`
   */
  static pointElement(ctx: DOMFormContext, pt: PtLike, radius?: number, shape?: string): SVGElement;
  /**
   * A static function to draw a circle element.
   * @param ctx a context object of SVGForm
   * @param pt center position of the circle
   * @param radius radius of the circle
   */
  static circleElement(ctx: DOMFormContext, pt: PtLike, radius?: number): SVGElement;
  /**
   * A static function to draw an arc element.
   * @param ctx a context object of SVGForm
   * @param pt center position
   * @param radius radius of the arc circle
   * @param startAngle start angle of the arc
   * @param endAngle end angle of the arc
   * @param cc an optional boolean value to specify if it should be drawn clockwise (`false`) or counter-clockwise (`true`). Default is clockwise.
   */
  static arcElement(ctx: DOMFormContext, pt: PtLike, radius: number, startAngle: number, endAngle: number, cc?: boolean): SVGElement;
  /**
   * A static function to draw a square element.
   * @param ctx a context object of SVGForm
   * @param pt center position of the square
   * @param halfsize half size of the square
   */
  static squareElement(ctx: DOMFormContext, pt: PtLike, halfsize: number): SVGElement;
  /**
   * A static function to draw a line or polyline element.
   * @param ctx a context object of SVGForm
   * @param pts a Group or an Iterable<PtLike>
   */
  static lineElement(ctx: DOMFormContext, pts: PtLikeIterable): SVGElement | undefined;
  /**
   * A static helper function to draw polyline or polygon.
   * @param ctx a context object of SVGForm
   * @param points a string of points' positions. See `SVGForm.pointsString` for conversion.
   * @param closePath a boolean to specify if the polygon path should be closed
   */
  protected static _poly(ctx: DOMFormContext, points: string, closePath?: boolean): SVGElement;
  /**
   * Given a list of points, return a space-separated string
   * @param pts a Group or an Iterable<PtLike>
   * @returns an object of {string, count}
   */
  protected static pointsString(pts: PtLikeIterable): {
    string: string;
    count: number;
  };
  /**
   * A static function to draw a polygon element.
   * @param ctx a context object of SVGForm
   * @param pts a Group or an Iterable<PtLike> representing a polygon
   */
  static polygonElement(ctx: DOMFormContext, pts: PtLikeIterable): SVGElement;
  /**
   * A static function to draw a rectangle element.
   * @param ctx a context object of SVGForm
   * @param pts a Group or an Iterable<PtLike> with 2 Pt specifying the top-left and bottom-right positions.
   */
  static rectElement(ctx: DOMFormContext, pts: PtLikeIterable): SVGElement | undefined;
  /**
   * A static function to draw a text element.
   * @param ctx a context object of SVGForm
   * @param pt a Point object to specify the anchor point
   * @param txt a string of text to draw
   */
  static textElement(ctx: DOMFormContext, pt: PtLike, txt: string): SVGElement;
}
//#endregion
//#region src/Typography.d.ts
/**
 * Typography provides helper functions to support typographic layouts. For a concrete example, see [a demo here](https://ptsjs.org/demo/?name=canvasform.textBox) that uses the [`CanvasForm.textBox`](#link) function.
 */
declare class Typography {
  /**
   * Create a heuristic text width estimate function. It will be less accurate but faster.
   * @param fn a reference function that can measure text width accurately
   * @param samples a list of string samples. Default is ["M", "n", "."]
   * @param distribution a list of the samples' probability distribution, which should have the same length as `samples` and sum to 1. Default is [0.06, 0.8, 0.14]. (A distribution that sums to more or less than 1 will proportionally inflate or deflate every estimate.)
   * @return a function that can estimate text width
   */
  static textWidthEstimator(fn: TextMeasure, samples?: string[], distribution?: number[]): TextMeasure;
  /**
   * Create a memoizing text width function that measures each distinct character once and sums the cached widths. Nearly as accurate as the reference function for most texts (kerning and ligatures excepted) at close to estimator speed after warmup. The cache is keyed by character, so create a new instance whenever the font changes.
   * @param fn a reference function that can measure text width accurately
   * @return a function that measures text width using per-character caching
   */
  static charWidthCache(fn: TextMeasure): TextMeasure;
  /**
   * Truncate text to fit width. The result is guaranteed to fit: the largest prefix (possibly empty) is kept such that the prefix plus the tail measures within `width`. The cut never splits a surrogate pair. If even the tail alone cannot fit, `["", 0]` is returned.
   * @param fn a function that can measure text width
   * @param str text to truncate
   * @param width width to fit
   * @param tail text to indicate overflow such as "...". Default is empty "".
   * @param hint optional expected number of characters to keep — a pure performance hint (any value yields the same result) that seeds the search, such as the previous line's length when wrapping. With an empty `tail`, a hint also avoids measuring the entire string.
   * @return a tuple of the truncated text (tail included) and the number of characters kept from `str`
   */
  static truncate(fn: TextMeasure, str: string, width: number, tail?: string, hint?: number): [string, number];
  /**
   * Get a function to scale font size proportionally to a box's size. (Deprecated form: passing an initial box as the first parameter is deprecated — it never affected the result — and will be removed in a future version.)
   * @param ratio font-size to box-size ratio. Default is 1.
   * @param byHeight `true` to scale by the box's height, `false` to scale by its width. Default is `true`.
   * @returns a function where input parameter is a box, and returns a font size value (`ratio` multiplied by the box's height or width)
   */
  static fontSizeToBox(ratio?: number, byHeight?: boolean): (box: PtLikeIterable) => number;
  /**
   * @deprecated The initial box never affected the result. Use `fontSizeToBox(ratio, byHeight)` instead.
   */
  static fontSizeToBox(box: PtLikeIterable, ratio?: number, byHeight?: boolean): (box: PtLikeIterable) => number;
  /**
   * Get a function to scale font size based on a threshold value.
   * @param threshold threshold value. Cannot be 0.
   * @param direction if negative, get a font size <= defaultSize; if positive, get a font size >= defaultSize; Default is 0 which will scale font without min or max limits.
   * @returns a function whose input parameters are a default font size and a value to compare with threshold, and which returns a new font size value
   */
  static fontSizeToThreshold(threshold: number, direction?: number): (defaultSize: number, val: number) => number;
}
//#endregion
//#region src/Physics.d.ts
declare class World {
  protected _gravity: Pt;
  protected _friction: number;
  protected _damping: number;
  protected _iterations: number;
  protected _substeps: number;
  protected _maxTimeStep: number;
  protected _bound: Bound;
  protected _particles: Particle[];
  protected _bodies: Body[];
  protected _pnames: string[];
  protected _bnames: string[];
  protected _drawParticles: (p: Particle, i: number) => void;
  protected _drawBodies: (p: Body, i: number) => void;
  private _frictionStep;
  private _carry;
  private _hashKeys;
  private _cellStart;
  private _cellEntries;
  private _neighborKeys;
  private _bodyBounds;
  /**
   * Create a `World` for 2D physics simulation.
   * @param bound a Group or an Iterable<Pt> representing a rectangular bounding box
   * @param friction a value between 0 to 1, where 1 means no friction. Default is 1
   * @param gravity a number of a Pt to define gravitational force. A number is a shorthand to set `new Pt(0, n)`. Default is 0.
   */
  constructor(bound: PtIterable, friction?: number, gravity?: PtLike | number);
  /**
   * Current bound in this `World`.
   */
  get bound(): Bound;
  set bound(bound: Bound);
  /**
   * Current gravity in this `World`.
   */
  get gravity(): Pt;
  set gravity(g: Pt);
  /**
   * Current friction in this `World`.
   */
  get friction(): number;
  set friction(f: number);
  /**
   * Current damping in this `World`.
   */
  get damping(): number;
  set damping(f: number);
  /**
   * Constraint solver iterations per substep.
   */
  get iterations(): number;
  set iterations(f: number);
  /**
   * Target number of solver substeps per 60 Hz frame (16.7 ms). Each [`World.update`](#link)
   * runs enough substeps of about that size to cover its elapsed time, so a 30 Hz frame solves
   * twice as many substeps as a 60 Hz frame rather than larger ones. More substeps produce a
   * more stable and accurate simulation at a linear cost. Default is 4.
   */
  get substeps(): number;
  set substeps(n: number);
  /**
   * Maximum simulated time in milliseconds per [`World.update`](#link) call. Larger elapsed
   * times are clamped so that a hitch (eg, a backgrounded tab) cannot destabilize the
   * simulation. Default is 50.
   */
  get maxTimeStep(): number;
  set maxTimeStep(ms: number);
  /**
   * Get the number of bodies.
   */
  get bodyCount(): number;
  /**
   * Get the number of particles.
   */
  get particleCount(): number;
  /**
   * Get a body in this world by index or string id.
   * @param id numeric index of the body, or a string id that associates with it.
   * @returns a Body, or undefined if not found
   */
  body(id: number | string): Body | undefined;
  /**
   * Get a particle in this world by index or string id.
   * @param id numeric index of the particle, or a string id that associates with it.
   * @returns a Particle, or undefined if not found
   */
  particle(id: number | string): Particle | undefined;
  /**
   * Given a body's name, return its index in the bodies array, or -1 if not found.
   * @param name name of the body
   * @returns index number, or -1 if not found
   */
  bodyIndex(name: string): number;
  /**
   * Given a particle's name, return its index in the particles array, or -1 if not found.
   * @param name name of the particle
   * @returns index number, or -1 if not found
   */
  particleIndex(name: string): number;
  /**
   * Advance this world by an amount of time, solved in substeps sized by
   * [`World.substeps`](#link). The time is clamped to [`World.maxTimeStep`](#link), and an
   * elapsed time under 2 ms is carried into the next call. Draw callbacks fire once per call,
   * after the solve completes.
   * @param ms change in time in milliseconds
   */
  update(ms: number): void;
  /**
   * Draw particles using the provided function.
   * @param fn a function that draws a particle passed in the parameters `(particle, index)`.
   */
  drawParticles(fn: (p: Particle, i: number) => void): void;
  /**
   * Draw bodies using the provided function.
   * @param fn a function that draws a body passed in the parameters `(body, index)`.
   */
  drawBodies(fn: (p: Body, i: number) => void): void;
  /**
   * Add a particle or body to this world.
   * @param p `Particle` or `Body` instance
   * @param name optional name, which can be referenced in `body()` or `particle()` function to retrieve this back.
   */
  add(p: Particle | Body, name?: string): this;
  private _index;
  /**
   * Remove bodies from this world. Support removing a range and negative index.
   * @param from Start index, which can be negative (where -1 is at index 0, -2 at index 1, etc)
   * @param count Number of items to remove. Default is 1.
   */
  removeBody(from: number | string, count?: number): this;
  /**
   * Remove particles from this world. Support removing a range and negative index.
   * @param from Start index, which can be negative (where -1 is at index 0, -2 at index 1, etc)
   * @param count Number of items to remove. Default is 1.
   */
  removeParticle(from: number | string, count?: number): this;
  /**
   * Static function to calculate edge constraints between 2 particles.
   * @param p1 particle 1
   * @param p2 particle 2
   * @param dist distance between particles
   * @param stiff stiffness between 0 to 1.
   * @param precise use precise distance calculation. Default is `false`.
   */
  static edgeConstraint(p1: Particle, p2: Particle, dist: number, stiff?: number, precise?: boolean): Particle;
  /**
   * Static function to calculate bounding box constraints.
   * @param p particle
   * @param rect a Group or an Iterable<Pt> representing a bounding box
   * @param damping damping between 0 to 1, where 1 means no damping. Default is 0.75.
   */
  static boundConstraint(p: Particle, rect: PtIterable, damping?: number): void;
  /**
   * Shared scalar core of the bound constraint: clamp to the rectangle inset by the
   * particle's radius, and reflect the damped velocity on each axis that hit a wall
   * (a corner hit reflects both).
   */
  protected static _boundParticle(p: Particle, minX: number, minY: number, maxX: number, maxY: number, damping: number): void;
  /**
   * Integrate a particle for one substep: Verlet with the accumulated force plus gravity as
   * acceleration, and the substep-adjusted friction as drag. Forces are read but not cleared
   * here — they persist across the substeps of one update and are cleared when it completes.
   * @param p particle
   * @param dt substep time in seconds
   * @param prevDt time in seconds spanned by the particle's current displacement (see [`Particle.timeStep`](#link)); the velocity is rescaled to `dt` so that it is preserved when the step size changes.
   */
  protected integrate(p: Particle, dt: number, prevDt?: number): Particle;
  /**
   * Internal function to update free particles for one substep: integrate, constrain to the
   * bound, then resolve particle-particle collisions through the spatial hash.
   */
  protected _updateParticles(dt: number): void;
  /**
   * Resolve particle-particle collisions using a uniform spatial hash (a counting-sort grid),
   * visiting only neighboring cells instead of testing all pairs.
   */
  private _collideParticles;
  /**
   * Reset all accumulated forces after an update completes.
   */
  private _clearForces;
  /**
   * Internal function to update bodies for one substep: integrate and bound-constrain every
   * body particle, resolve body-body and body-particle collisions behind an AABB broad
   * phase, then restore shapes with the edge-constraint pass.
   * @param dt substep time in seconds
   */
  protected _updateBodies(dt: number): void;
  /**
   * Resolve body-body and body-particle collisions behind an AABB broad phase.
   */
  private _collideBodies;
}
/**
 * Particle is a subclass of [`Pt`](#link) that has radius and mass. It's usually added into [`World`](#link) to create physics simulations.
 * See [a demo here](https://ptsjs.org/demo/?name=physics.particles).
 */
declare class Particle extends Pt {
  protected _mass: number;
  protected _radius: number;
  protected _force: Pt;
  protected _prev: Pt;
  protected _prevDt: number;
  protected _body: Body;
  protected _lock: boolean;
  protected _lockPt: Pt;
  /**
   * Create a particle. Once a particle is created, you can set its mass and radius via the corresponding accessors.
   * @param args a list of numeric parameters, an array of numbers, or an object with {x,y,z,w} properties
   */
  constructor(...args: any[]);
  /**
   * Mass of this particle.
   */
  get mass(): number;
  set mass(m: number);
  /**
   * Radius of this particle.
   */
  get radius(): number;
  set radius(f: number);
  /**
   * Get this particle's previous position.
   */
  get previous(): Pt;
  set previous(p: Pt);
  /**
   * Get current accumulated force.
   */
  get force(): Pt;
  set force(g: Pt);
  /**
   * Get the body of this particle, if any.
   */
  get body(): Body;
  set body(b: Body);
  /**
   * Lock this particle in current position.
   */
  get lock(): boolean;
  set lock(b: boolean);
  /**
   * Get the change in position per 60 Hz frame, ie, the current velocity in the same unit
   * as [`Particle.hit`](#link). The raw displacement since the last step is
   * `particle.$subtract( particle.previous )`.
   */
  get changed(): Pt;
  /**
   * The time in seconds spanned by the displacement from [`Particle.previous`](#link) to the
   * current position. A [`World`](#link) sets it to the substep length on every step, and
   * [`Particle.hit`](#link) and the `position` setter reset it to one 60 Hz frame (1/60),
   * which is the unit of their velocities. 0 means unknown and is treated as one frame.
   */
  get timeStep(): number;
  set timeStep(t: number);
  /**
   * Set a new position, and update previous and lock states if needed. The move is stored as
   * this particle's velocity per frame, so dragging a locked particle knocks others away.
   */
  set position(p: Pt);
  /**
   * Set the size of this particle. This sets both the radius and the mass.
   * @param r `radius` value, and also set `mass` to the same value.
   */
  size(r: number): this;
  /**
   * Add to the accumulated force.
   * @param args a list of numeric parameters, an array of numbers, or an object with {x,y,z,w} properties
   */
  addForce(...args: any[]): Pt;
  /**
   * Verlet integration.
   * @param dt change in time in seconds
   * @param friction friction from 0 to 1, where 1 means no friction
   * @param lastDt optional last change in time in seconds. Default is [`Particle.timeStep`](#link), or `dt` if unknown.
   */
  verlet(dt: number, friction: number, lastDt?: number): this;
  /**
   * Hit this particle with an impulse, in pixels per 60 Hz frame. The impulse is scaled by 1/√mass, so a heavier particle moves less from the same hit.
   * The result is the same at any frame rate and any [`World.substeps`](#link) setting.
   * @param args an impulse vector defined by either a list of numeric parameters, an array of numbers, or an object with {x,y,z,w} properties
   * @example `hit(10, 20)`, `hit( new Pt(5, 9) )`
   */
  hit(...args: any[]): this;
  /**
   * Check and respoond to collisions between this and another particle.
   * @param p2 another particle
   * @param damp damping value between 0 to 1, where 1 means no damping.
   */
  collide(p2: Particle, damp?: number): void;
  /**
   * Get a string representation of this particle
   */
  toString(): string;
}
/**
 * Body is a subclass of [`Group`](#link) that stores a set of [`Particle`](#link)s and edge constraints. It is usually added into a [`World`](#link) to create physics simulations.
 * See [a demo here](https://ptsjs.org/demo/?name=physics.shapes).
 */
declare class Body extends Group {
  protected _cs: Array<number[]>;
  protected _stiff: number;
  protected _locks: {
    [index: string]: Particle;
  };
  protected _mass: number;
  protected _lambdas: Float32Array;
  /**
   * Create an empty Body, this is usually followed by [`Body.init`](#link) to populate the Body. Alternatively, use static function [`Body.fromGroup`](#link) to create and initate a body directly.
   */
  constructor();
  /**
   * Create and populate a body.
   * @param body a Group or an Iterable<Pt> to define the body
   * @param stiff stiffness value from 0 to 1, where 1 is the most stiff. Default is 1.
   * @param autoLink Automatically create links between the Pts. This usually works for regular convex polygons. Default is true.
   * @param autoMass Automatically calculate the mass based on the area of the polygon. Default is true.
   */
  static fromGroup(body: PtIterable, stiff?: number, autoLink?: boolean, autoMass?: boolean): Body;
  /**
   * Initiate a body.
   * @param body a Group or an Iterable<Pt> to define a body
   * @param stiff stiffness value from 0 to 1, where 1 is the most stiff. Default is 1.
   */
  init(body: PtIterable, stiff?: number): this;
  /**
   * Get mass of this body.
   */
  get mass(): number;
  set mass(m: number);
  /**
   * Automatically calculate a body's `mass` based on the area of the polygon.
   */
  autoMass(): this;
  /**
   * Create a linked edge between two points.
   * @param index1 first point by index
   * @param index2 first point by index
   * @param stiff optionally stiffness value between 0 to 1, where 1 is the most stiff.
   */
  link(index1: number, index2: number, stiff?: number): this;
  /**
   * Automatically create links for all the points to preserve the initial body shape. This usually works for regular convex polygon.
   * @param stiff optionally stiffness value between 0 to 1, where 1 is the most stiff.
   */
  linkAll(stiff: number): void;
  /**
   * Return a list of all the linked edges as line segments.
   * @returns an array of Groups, each of which represents an edge
   */
  linksToLines(): Group[];
  /**
   * Recalculate all edge constraints.
   */
  processEdges(): void;
  /**
   * Solve all edge constraints for one substep in XPBD form. A link's `stiff` value is a
   * geometric knob: it is the fraction of the remaining constraint violation resolved per
   * update, independent of the particles' masses and of the substep/iteration counts
   * (per Müller et al. 2007, the per-pass fraction is `1-(1-stiff)^(1/passes)`), and
   * `stiff=1` is a rigid projection. Mapping the fraction to a mass-relative compliance
   * keeps a heavy body exactly as stiff as a light one at the same value.
   * This is the solver used internally by [`World.update`](#link);
   * [`Body.processEdges`](#link) remains the simpler relaxation for direct use.
   * @param dt substep time in seconds (reserved; the geometric stiffness does not depend on it)
   * @param iterations solver iterations for this substep. Default is 1.
   * @param substeps the caller's substeps per update, for pass-count-independent stiffness. Default is 1.
   */
  solveEdges(dt: number, iterations?: number, substeps?: number): this;
  /**
   * Check and respond to collisions between two bodies.
   * @param b another body
   */
  processBody(b: Body): void;
  /**
   * Check and respond to collisions between this body and a particle.
   * @param b a particle
   */
  processParticle(b: Particle): void;
}
//#endregion
//#region src/Play.d.ts
/**
 * Tempo helps you create synchronized and rhythmic animations.
 */
declare class Tempo implements IPlayer {
  protected _bpm: number;
  protected _ms: number;
  protected _listeners: {
    [key: string]: ITempoListener;
  };
  protected _listenerInc: number;
  animateID: string;
  /**
   * Construct a new Tempo instance by beats-per-minute. Alternatively, you can use [`Tempo.fromBeat`](#link) to create from milliseconds.
   * @param bpm beats per minute. Must be greater than 0.
   */
  constructor(bpm: number);
  /**
   * Create a new Tempo instance by specifying milliseconds-per-beat.
   * @param ms milliseconds per beat. Must be greater than 0.
   */
  static fromBeat(ms: number): Tempo;
  /**
   * Beats-per-minute value. Must be greater than 0.
   */
  get bpm(): number;
  set bpm(n: number);
  /**
   * Milliseconds per beat (Note that this is derived from the bpm value).
   */
  get ms(): number;
  set ms(n: number);
  protected _createID(): string;
  /**
   * This is a core function that let you specify a rhythm and then define responses by calling the `start` and `progress` functions from the returned object. See [Animation guide](../guide/Animation-0700.html) for more details.
   * The `start` function lets you set a callback on every start. It takes a function ([`ITempoStartFn`](#link)).
   * The `progress` function lets you set a callback during progress. It takes a function ([`ITempoProgressFn`](#link)). Both functions let you optionally specify a time offset and a custom name.
   * A positive offset shifts the beat earlier (fires sooner), a negative offset shifts it later.
   * @param beats a rhythm in beats as a number or an array of numbers
   * @example `tempo.every(2).start( (count) => ... )`, `tempo.every([2,4,6]).progress( (count, t) => ... )`
   * @returns an object with chainable functions
   */
  every(beats: number | number[]): ITempoResponses;
  /**
   * Usually you can add a tempo instance to a space via [`Space.add`](#link) and it will track time automatically.
   * But if necessary, you can track time manually via this function.
   * @param time current time in milliseconds
   */
  track(time: number): void;
  /**
   * Remove a `start` or `progress` callback function from the list of callbacks. See [`Tempo.every`](#link) for details
   * @param name a name string specified when creating the callback function.
   */
  stop(name: string): void;
  /**
   * IPlayer interface. Internal implementation that calls `track( time )`.
   */
  animate(time: number, ftime: number): void;
  /**
   * IPlayer interface. Not implemented.
   */
  resize(bound: Bound, evt?: Event): void;
  /**
   * IPlayer interface. Not implemented.
   */
  action(type: string, px: number, py: number, evt: Event): void;
}
/**
 * Sound class simplifies common tasks like audio inputs and visualizations using a subset of Web Audio API. It can be used with other audio libraries like tone.js, and extended to support additional web audio functions. See [the guide](../guide/Sound-0800.html) to get started.
 */
declare class Sound {
  private _type;
  /** The audio context */
  _ctx: AudioContext;
  /** The audio node, which is usually a subclass liked OscillatorNode */
  _node: AudioNode;
  /**
   * The audio node to be connected to AudioContext when playing, if different than _node
   * This is useful when using the connect() function to filter, as typically the output would
   * come from the filtering nodes
   */
  _outputNode: AudioNode;
  /** The audio stream when streaming from input device */
  _stream: MediaStream;
  /** Audio src when loading from file */
  _source: HTMLMediaElement;
  _buffer: AudioBuffer;
  /** Analyzer if any */
  analyzer: ISoundAnalyzer;
  protected _playing: boolean;
  protected _timestamp: number;
  protected _wave: PeriodicWave;
  protected _gain: GainNode;
  protected _volume: number;
  protected _connected: AudioNode[];
  protected _bufferPlayed: boolean;
  protected _generated: boolean;
  protected static _sharedContext: AudioContext;
  /**
   * Construct a `Sound` instance. Usually, it's more convenient to use one of the static methods like [`Sound.load`](#function_load) or [`Sound.from`](#function_from).
   * By default, all instances share a single `AudioContext` (browsers limit how many can be live at once).
   * @param type a `SoundType` string: "file", "input", or "gen"
   * @param ctx Optionally provide your own AudioContext instead of the shared one
   */
  constructor(type: SoundType, ctx?: AudioContext);
  /**
   * Get the shared AudioContext instance, creating it on first use. This is called internally only.
   */
  protected static _getContext(): AudioContext;
  /**
   * Create a `Sound` given an [AudioNode](https://developer.mozilla.org/en-US/docs/Web/API/AudioNode) and an [AudioContext](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext) from Web Audio API. See also [this example](../guide/js/examples/tone.html) using tone.js in the [guide](../guide/Sound-0800.html).
   * @param node an AudioNode instance
   * @param ctx an AudioContext instance
   * @param type a string representing a type of input source: either "file", "input", or "gen".
   * @param stream Optionally include a MediaStream, if the type is "input"
   * @returns a `Sound` instance
   */
  static from(node: AudioNode, ctx: AudioContext, type?: SoundType, stream?: MediaStream): Sound;
  /**
   * Create a `Sound` by loading from a sound file or an audio element.
   * @param source either an url string to load a sound file, or an audio element.
   * @param crossOrigin whether to support loading cross-origin. Default is "anonymous". When passing an audio element, set the attribute in markup before the element loads for it to take effect.
   * @returns a `Sound` instance
   * @example `Sound.load( '/path/to/file.mp3' )`
   */
  static load(source: HTMLMediaElement | string, crossOrigin?: string): Promise<Sound>;
  /**
   * Create a `Sound` by loading and decoding a sound file URL as an `AudioBufferSourceNode`.
   * Unlike [`Sound.load`](#link), this loads the complete file instead of streaming it, which can provide more consistent analysis and replay behavior across browsers.
   * @param url an url to the sound file
   */
  static loadAsBuffer(url: string): Promise<Sound>;
  /**
   * Create or re-use an AudioBuffer. Only needed if you are using `Sound.loadAsBuffer` and want to prepare a replay manually — [`start`](#link) re-creates a used buffer automatically.
   * @param buf an AudioBuffer. Optionally, you can call this without parameters to re-use existing buffer.
   */
  createBuffer(buf?: AudioBuffer): this;
  /**
   * Create a `Sound` by generating a waveform using [OscillatorNode](https://developer.mozilla.org/en-US/docs/Web/API/OscillatorNode).
   * @param type a string representing the waveform type: "sine", "square", "sawtooth", "triangle", "custom"
   * @param val the frequency value in Hz to play, or a PeriodicWave instance if type is "custom".
   * @returns a `Sound` instance
   * @example `Sound.generate( 'sine', 120 )`
   */
  static generate(type: OscillatorType, val: number | PeriodicWave): Sound;
  protected _gen(type: OscillatorType, val: number | PeriodicWave): Sound;
  /**
   * Create a `Sound` by streaming from an input device like microphone. Note that this function returns a Promise which resolves to a Sound instance, and rejects if the input device is unavailable or permission is denied.
   * @param constraint Optional constraints which can be used to select a specific input device. For example, you may use [`enumerateDevices`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices) to find a specific deviceId;
   * @returns a `Promise` which resolves to `Sound` instance
   * @example `Sound.input().then( s => sound = s ).catch( err => ... );`
   */
  static input(constraint?: MediaStreamConstraints): Promise<Sound>;
  /**
   * Get this Sound's AudioContext instance for advanced use-cases.
   */
  get ctx(): AudioContext;
  /**
   * Get this Sound's AudioNode subclass instance for advanced use-cases.
   */
  get node(): AudioNode;
  /**
   * Get this Sound's Output node AudioNode instance for advanced use-cases.
   */
  get outputNode(): AudioNode;
  /**
   * Get this Sound's MediaStream (eg, from microphone, if in use) instance for advanced use-cases. See [`Sound.input`](#link)
   */
  get stream(): MediaStream;
  /**
   * Get this Sound's Audio element (if used) instance for advanced use-cases. See [`Sound.load`](#link).
   */
  get source(): HTMLMediaElement;
  /**
   * Get this Sound's AudioBuffer (if any) instance for advanced use-cases. See [`Sound.loadAsBuffer`](#link).
   */
  get buffer(): AudioBuffer;
  set buffer(b: AudioBuffer);
  /**
   * Get the type of input for this Sound instance. Either "file", "input", or "gen"
   */
  get type(): SoundType;
  /**
   * Indicate whether the sound is currently playing.
   */
  get playing(): boolean;
  /**
   * A value between 0 to 1 to indicate playback progress. Returns 0 if the sound has no duration (eg, generated or input sounds).
   */
  get progress(): number;
  /**
   * Indicate whether the sound is ready to play. When loading from a file, this corresponds to a ["canplaythrough"](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/readyState) event.
   * You can also use `this.source.addEventListener( 'canplaythrough', ...)` if needed. See also [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/canplaythrough_event).
   */
  get playable(): boolean;
  /**
   * If an analyzer is added (see [`analyze`](#function_analyze) function), get the number of frequency bins in the analyzer. Returns 0 if no analyzer is added.
   */
  get binSize(): number;
  /**
   * Get the sample rate of the audio, for example, at 44100 hz.
   */
  get sampleRate(): number;
  /**
   * If the sound is generated, this sets and gets the frequency of the tone.
   */
  get frequency(): number;
  set frequency(f: number);
  /**
   * Get and set the volume of this sound. Default is 1. Values above 1 amplify the sound. Can be set before or during playback.
   */
  get volume(): number;
  set volume(v: number);
  /**
   * Connect another AudioNode to this `Sound` instance's AudioNode. Using this function, you can extend the capabilities of this `Sound` instance for advanced use cases such as filtering. The connection is restored if a generated sound is restarted.
   * @param node another AudioNode
   */
  connect(node: AudioNode): this;
  /**
   * Sets the 'output' node for this Sound
   * This would typically be used after Sound.connect, if you are adding nodes
   * in your chain for filtering purposes.
   * @param  outputNode The AudioNode that should connect to the AudioContext
   */
  setOutputNode(outputNode: AudioNode): this;
  /**
   * Removes the 'output' node added from setOutputNode
   * Note: if you start the Sound after calling this, it will play via the default node
   */
  removeOutputNode(): this;
  /**
   * Add an analyzer to this `Sound`. Calling it again replaces the existing analyzer.
   * @param size the number of frequency bins. Should be a power of 2.
   * @param minDb Optional minimum decibels (corresponds to `AnalyserNode.minDecibels`)
   * @param maxDb Optional maximum decibels (corresponds to `AnalyserNode.maxDecibels`)
   * @param smooth Optional smoothing value (corresponds to `AnalyserNode.smoothingTimeConstant`)
   */
  analyze(size?: number, minDb?: number, maxDb?: number, smooth?: number): this;
  protected _domain(time: boolean): Uint8Array;
  protected _domainTo(time: boolean, size: PtLike, position?: PtLike, trim?: number[], out?: Group): Group;
  /**
   * Get the raw time-domain data from analyzer as unsigned 8-bit integers. An analyzer must be added before calling this function (See [analyze](#function_analyze) function).
   */
  timeDomain(): Uint8Array;
  /**
   * Map the time-domain data from analyzer to a range. An analyzer must be added before calling this function (See [analyze](#function_analyze) function).
   * @param size map each data point `[index, value]` to `[width, height]`
   * @param position Optionally, set a starting `[x, y]` position. Default is `[0, 0]`
   * @param trim Optionally, trim the start and end values by `[startTrim, data.length-endTrim]`
   * @param out Optionally, provide a `Group` (usually one returned by a previous call) whose Pts will be reused instead of allocating new ones — recommended when calling once per frame
   * @returns a Group containing the mapped values
   * @example form.point( s.timeDomainTo( space.size ) )
   */
  timeDomainTo(size: PtLike, position?: PtLike, trim?: number[], out?: Group): Group;
  /**
   * Get the raw frequency-domain data from analyzer as unsigned 8-bit integers. An analyzer must be added before calling this function (See [analyze](#function_analyze) function).
   */
  freqDomain(): Uint8Array;
  /**
   * Map the frequency-domain data from analyzer to a range. An analyzer must be added before calling this function (See [analyze](#function_analyze) function).
   * @param size map each data point `[index, value]` to `[width, height]`
   * @param position Optionally, set a starting `[x, y]` position. Default is `[0, 0]`
   * @param trim Optionally, trim the start and end values by `[startTrim, data.length-endTrim]`
   * @param out Optionally, provide a `Group` (usually one returned by a previous call) whose Pts will be reused instead of allocating new ones — recommended when calling once per frame
   * @returns a Group containing the mapped values
   * @example `form.point( s.freqDomainTo( space.size ) )`
   */
  freqDomainTo(size: PtLike, position?: PtLike, trim?: number[], out?: Group): Group;
  /**
   * Stop playing and disconnect the AudioNode.
   */
  reset(): this;
  protected _getGain(): GainNode;
  /**
   * Start playing. Internally this connects the `AudioNode` to `AudioContext`'s destination.
   * Calling `start( timeAt )` while a file or buffer sound is playing seeks to that time; a generated sound that is already playing is unaffected.
   * @param timeAt optional parameter to play from a specific time, in seconds
   */
  start(timeAt?: number): this;
  /**
   * Stop playing. Internally this also disconnects the `AudioNode` from `AudioContext`'s destination. Calling `stop` when the sound is not playing has no effect.
   */
  stop(): this;
  /**
   * Toggle between `start` and `stop`.
   */
  toggle(): this;
  /**
   * Stop playing and disconnect all nodes (including analyzer and volume), and release stream, source, and buffer references.
   * The instance should not be used after calling this. Note that this never closes an `AudioContext`: the shared context lives for the page, and a context you provided is yours to close.
   */
  dispose(): this;
}
//#endregion
export { AnimateCallbackFn, Body, Bound, CanvasForm, CanvasPatternRepetition, CanvasSpace, CanvasSpaceOptions, Circle, Color, ColorType, Const, Create, Curve, DOMFormContext, DOMSpace, DefaultFormStyle, Delaunay, DelaunayMesh, DelaunayShape, Font, Form, Geom, Group, GroupLike, HTMLForm, HTMLSpace, IPlayer, IPt, ISoundAnalyzer, ISpacePlayers, ITempoListener, ITempoProgressFn, ITempoResponses, ITempoStartFn, ITimer, Img, ImgOptions, IntersectContext, Line, Mat, MultiTouchElement, MultiTouchSpace, Noise, Num, Particle, Polygon, Pt, PtIterable, PtLike, PtLikeIterable, Range, Rectangle, RenderingContext2D, SVGContext2D, SVGForm, SVGSpace, Shaping, Sound, SoundType, Space, Tempo, TextMeasure, TextVerticalAlign, TouchPointsKey, Triangle, Typography, UI, UIActionEvent, UIButton, UIDragger, UIHandler, UIPointerAction, UIPointerActions, UIShape, UIShapeTest, Util, Vec, VisualForm, WarningType, World };
//# sourceMappingURL=index.d.mts.map