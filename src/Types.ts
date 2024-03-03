/*! Pts.js is licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */

import {Pt, Group, Bound} from "./Pt";
import {Space} from "./Space";
import {UI} from "./UI";

/**
 * Typescript interface: IPt is an interface that represents an object with x, y, z, w properties.
 */
export interface IPt {
  x?:number;
  y?:number;
  z?:number;
  w?:number;
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
 * Typescript type: AnimateCallbackFn represents a callback function for animation. It accepts parameters to keep track of current time, current frame-time, and current space instance.
 */
export type AnimateCallbackFn = ( time?:number, frameTime?:number, currentSpace?:any ) => void;


/**
* Typescript interface: IPlayer is an interface that represents a "player" object that can be added into a Space.
*/
export interface IPlayer {
  animateID?: string;
  animate?:AnimateCallbackFn;
  resize?( bound:Bound, evt?:Event ): void;
  action?( type:string, px:number, py:number, evt:Event ): void;
  start?( bound:Bound, space:Space ): void;
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
  addEventListener( evt:any, callback:Function );
  removeEventListener( evt:any, callback:Function );
}


/**
 * Typescript interface: this extends Canvas's 2D context with backingStorePixelRatio property.
 */
export interface PtsCanvasRenderingContext2D extends CanvasRenderingContext2D {
  webkitBackingStorePixelRatio?:number;
  mozBackingStorePixelRatio?:number;
  msBackingStorePixelRatio?:number;
  oBackingStorePixelRatio?:number;
  backingStorePixelRatio?:number;
}


/**
 * Typescript type: Setup options for CanvasSpace. See [`CanvasSpace.setup()`](#link) function.
 */
export type CanvasSpaceOptions = {
  bgcolor?:string, resize?:boolean, retina?:boolean, offscreen?:boolean, pixelDensity?:number
};

/**
 * Typescript type: ColorType represents a defined set of string values such as "rgb" and "lab".
 */
export type ColorType = "rgb" | "hsl" | "hsb" | "lab" | "lch" | "luv" | "xyz";


/**
 * Typescript type: DelaunayShape represents an object type that can store a Delaunay element. It has 3 indices (i, j, k) and two groups that represent a triangle and a circle.
 */
export type DelaunayShape = {i:number, j:number, k:number, triangle:GroupLike, circle:Group };

/**
 * Typescript type: DelaunayMesh represents an object type that has an array of {key: shape} items, where each shape represents a DelaunayShape.
 */
export type DelaunayMesh = {[key:string]:DelaunayShape}[];



/**
 * Typescript type: DOMFormContext represents the current context for an DOMForm.
 */
export type DOMFormContext = {
  group:Element, groupID:string, groupCount:number,
  currentID:string,
  currentClass?:string,
  style:object,
};


/**
 * Typescript type: IntersectContext represents a type of an object that store the intersection info.
 */
export type IntersectContext = {
  which: number,
  dist: number,
  normal: Pt,
  vertex: Pt,
  edge: Group,
  other?: any
};


/**
 * Typescript type: UIHandler represents a callback function to handle UI actions.
 */
export type UIHandler = ( target:UI, pt:PtLike, type:string, evt:MouseEvent ) => void;


/**
 * Typescript type: WarningType specifies a level of warning for [`Util.warnLevel`](#link).
 */
export type WarningType = "error" | "warn" | "mute";


/**
 * Typescript type: a callback function type used in `tempo.every(...).start( fn )` 
 */
export type ITempoStartFn = ( count:number ) => void | boolean;

/**
 * Typescript type: a callback function type used in `tempo.every(...).progress( fn )` 
 */
export type ITempoProgressFn = ( count:number, t:number, ms:number, start:boolean ) => void | boolean;

/**
 * Typescript type: ITempoListener represents a listener created by Tempo class
 */
export type ITempoListener = {
  name?:string, // reference id
  beats?:number | number[], // rhythm in beats
  period?:number, // current number of beats per period
  duration?:number, // current duration in ms per period
  offset?:number, // time offset
  continuous?:boolean, // track progress is true, otherwise track only triggers
  index?:number, // if beats is an array, this is the current index
  fn: Function // callback function
};

/**
 * Typescript type: the return type of `tempo.every(...)`
 */
export type ITempoResponses = {
  start: ( fn:ITempoStartFn, offset:number, name?:string ) => string,
  progress: ( fn:ITempoProgressFn, offset:number, name?:string ) => string
};


/**
 * Typescript type: ISoundAnalyzer represents an object that stores the AnalyzerNode properties
 */
export type ISoundAnalyzer = {
  node:AnalyserNode,
  size:number,
  data:Uint8Array
};


/**
 * Typescript type: SoundType represents a type of sound input. It corresponds to Sound.type property.
 */
export type SoundType = "file" | "gen" | "input";


/**
 * Typescript type: DefaultFormStyle represents a default object for visual styles such as fill, stroke, line width, and others.
 */
export type DefaultFormStyle = {
  fillStyle?: string | CanvasGradient | CanvasPattern, 
  strokeStyle?: string | CanvasGradient | CanvasPattern, 
  lineWidth?: number, 
  lineJoin?: string, 
  lineCap?: string,
  globalAlpha?: number
};


/**
 * Typescript type: CanvasPatternRepetition represents the string options to specify pattern repetition
 */
export type CanvasPatternRepetition = "repeat" | "repeat-x" | "repeat-y" | "no-repeat";