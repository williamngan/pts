/*! Pts.js is licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */

import { type Pt, type Group, type Bound } from "./Pt";
import { type Space } from "./Space";
import { type UI, type UIPointerAction } from "./UI";

/**
 * Typescript interface: IPt is an interface that represents an object with x, y, z, w properties.
 */
export interface IPt {
  x?: number;
  y?: number;
  z?: number;
  w?: number;
}

/**
 * Typescript type: PtLike represents the data of a point. It can be either a Pt instance or an array of numbers.
 */
export type PtLike = Pt | Float32Array | number[];

/**
 * Typescript type: GroupLike represents an array of Pt instances. It be a Group instance or an array of Pt. Unlike `PtIterable`, this type only allows arrays but not iterables.
 */
export type GroupLike = Group | Pt[];

/**
 * Typescript type: PtIterable represents an iterable list of Pt instances. Unlike `PtLikeIterable`, this type only allows Pt instances but not numbers' arrays.
 * If you aren't sure what this type means, treat this as a [`Group`](#link) instance.
 */
export type PtIterable = GroupLike | Pt[] | Iterable<Pt>;

/**
 * Typescript type: PtLikeIterable is the most flexible way to represent an iterable list of point data. For example, it can be a Group, an iterable of Pt instances, or an array of numbers' arrays.
 * If you aren't sure what this type means, treat this as a [`Group`](#link) instance.
 */
export type PtLikeIterable = GroupLike | PtLike[] | Iterable<PtLike>;

/**
 * Typescript type: TextMeasure represents a function that returns the rendered width of a string of text, such as canvas context's `measureText` or an estimator created via [`Typography.textWidthEstimator`](#link).
 */
export type TextMeasure = (text: string) => number;

/**
 * Typescript type: TextVerticalAlign represents the vertical alignment options accepted by [`CanvasForm.textBox`](#link) and [`CanvasForm.paragraphBox`](#link).
 */
export type TextVerticalAlign =
  "top" | "start" | "middle" | "center" | "bottom" | "end";

/**
 * Typescript type: AnimateCallbackFn represents a callback function for animation. It accepts parameters to keep track of current time, current frame-time, and current space instance.
 */
export type AnimateCallbackFn = (
  time: number,
  frameTime: number,
  currentSpace: Space,
) => void;

/**
 * Typescript type: UIActionEvent represents the DOM events a Space dispatches to players and UI handlers — pointer, mouse, touch, and keyboard.
 */
export type UIActionEvent =
  MouseEvent | TouchEvent | PointerEvent | KeyboardEvent;

/**
 * Typescript interface: IPlayer is an interface that represents a "player" object that can be added into a Space.
 */
export interface IPlayer {
  animateID?: string;
  animate?: AnimateCallbackFn;
  resize?(bound: Bound, evt?: Event | null): void;
  action?(type: string, px: number, py: number, evt: UIActionEvent): void;
  start?(bound: Bound, space: Space): void;
}

/**
 * Typescript interface: ISpacePlayers represents a map of IPlayer instances.
 */
export interface ISpacePlayers {
  [key: string]: IPlayer;
}

/**
 *Typescript interface: ITimer represents a time-recording object.
 */
export interface ITimer {
  prev: number;
  diff: number;
  end: number;
  min: number;
}

/**
 * Typescript type: TouchPointsKey represents a set of acceptable string keys for defining touch action.
 */
export type TouchPointsKey = "touches" | "changedTouches" | "targetTouches";

/**
 * Typescript interface: MultiTouchElement represents an element that can handle touch events.
 */
export interface MultiTouchElement {
  addEventListener(
    evt: string,
    callback: EventListenerOrEventListenerObject,
  ): void;
  removeEventListener(
    evt: string,
    callback: EventListenerOrEventListenerObject,
  ): void;
}

/**
 * Typescript type: Setup options for CanvasSpace. See [`CanvasSpace.setup()`](#link) function.
 */
export type CanvasSpaceOptions = {
  bgcolor?: string;
  resize?: boolean;
  retina?: boolean;
  offscreen?: boolean;
  pixelDensity?: number;
};

/**
 * Typescript type: ColorType represents a defined set of string values such as "rgb" and "lab".
 */
export type ColorType =
  "rgb" | "hsl" | "hsb" | "lab" | "lch" | "luv" | "xyz" | "oklab" | "oklch";

/**
 * Typescript type: DelaunayShape represents an object type that can store a Delaunay element. It has 3 indices (i, j, k) and two groups that represent a triangle and a circle.
 */
export type DelaunayShape = {
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
export type DelaunayMesh = { [key: string]: DelaunayShape }[];

/**
 * Typescript type: FlockBoundary is how a [`Flock`](#link) treats the edges of its bound:
 * `"steer"` turns agents back within a margin, `"wrap"` moves them to the opposite edge,
 * `"bounce"` reflects them, and `"none"` lets them leave.
 */
export type FlockBoundary = "steer" | "wrap" | "bounce" | "none";

/**
 * Typescript type: FlockOptions are the settings accepted by [`Create.flock`](#link) and
 * [`Flock.setup`](#link). Every field is optional; see the matching [`Flock`](#link) accessor
 * for its meaning and default.
 */
export type FlockOptions = {
  /** Radius within which an agent sees its neighbors. Default is 40. */
  perception?: number;
  /** Radius within which an agent steers away from its neighbors. Default is 20. */
  separation?: number;
  /** Weight of steering toward the neighbors' center. Default is 1. */
  cohesionWeight?: number;
  /** Weight of matching the neighbors' heading. Default is 1. */
  alignWeight?: number;
  /** Weight of steering away from close neighbors. Default is 1.5. */
  separateWeight?: number;
  /** Maximum speed, in units per second. Default is 100. */
  maxSpeed?: number;
  /** Minimum speed, in units per second. Default is 0. */
  minSpeed?: number;
  /** Maximum steering force, in units per second squared. Default is 200. */
  maxForce?: number;
  /** A [`Bound`](#link) or a Group of 2 Pts that keeps the flock in view. Default is none. */
  bound?: GroupLike;
  /** How the bound's edges are treated. Default is `"steer"`. */
  boundary?: FlockBoundary;
  /** Distance from an edge at which `"steer"` starts turning agents back. Default is 50. */
  margin?: number;
  /** Maximum simulated time in milliseconds per step. Default is 50. */
  maxTimeStep?: number;
  /** Speed given to agents added without a velocity. Default is half of `maxSpeed`. */
  initialSpeed?: number;
};

/**
 * Typescript type: DOMFormContext represents the current context for an DOMForm.
 */
export type DOMFormContext = {
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
export type IntersectContext = {
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
export type UIHandler = (
  target: UI,
  pt: PtLike,
  type: UIPointerAction | (string & {}),
  evt: UIActionEvent,
) => void;

/**
 * Typescript type: WarningType specifies a level of warning for [`Util.warnLevel`](#link).
 */
export type WarningType = "error" | "warn" | "mute";

/**
 * Typescript type: a callback function type used in `tempo.every(...).start( fn )`
 */
export type ITempoStartFn = (count: number) => void | boolean;

/**
 * Typescript type: a callback function type used in `tempo.every(...).progress( fn )`
 */
export type ITempoProgressFn = (
  count: number,
  t: number,
  ms: number,
  start: boolean,
) => void | boolean;

/**
 * Typescript type: ITempoListener represents a listener created by Tempo class
 */
export type ITempoListener = {
  name?: string; // reference id
  beats?: number | number[]; // rhythm in beats
  period?: number; // current number of beats per period
  duration?: number; // current duration in ms per period
  offset?: number; // time offset
  continuous?: boolean; // track progress is true, otherwise track only triggers
  index?: number; // if beats is an array, this is the current index
  count?: number; // number of periods started so far
  fn: ITempoStartFn | ITempoProgressFn; // callback function
};

/**
 * Typescript type: the return type of `tempo.every(...)`
 */
export type ITempoResponses = {
  start: (fn: ITempoStartFn, offset?: number, name?: string) => ITempoResponses;
  progress: (
    fn: ITempoProgressFn,
    offset?: number,
    name?: string,
  ) => ITempoResponses;
};

/**
 * Typescript type: ISoundAnalyzer represents an object that stores the AnalyzerNode properties
 */
export type ISoundAnalyzer = {
  node: AnalyserNode;
  size: number;
  data: Uint8Array;
};

/**
 * Typescript type: SoundType represents a type of sound input. It corresponds to Sound.type property.
 */
export type SoundType = "file" | "gen" | "input";

/**
 * Typescript type: DefaultFormStyle represents a default object for visual styles such as fill, stroke, line width, and others.
 */
export type DefaultFormStyle = {
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
export type CanvasPatternRepetition =
  "repeat" | "repeat-x" | "repeat-y" | "no-repeat";

export type RenderingContext2D =
  CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
