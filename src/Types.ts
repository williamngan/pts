/*! Source code licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */

import {Pt, Group, Bound} from "./Pt";
import {Space} from "./Space";
import {UI} from "./UI";

/**
 * Typescript only: IPt is an interface that represents an object with x, y, z, w properties.
 */
export interface IPt {
  x?:number;
  y?:number;
  z?:number;
  w?:number;
}


/**
 * Typescript only: PtLike is an alias of types that can represent a point.
 */
export type PtLike = Pt | Float32Array | number[];


/**
 * Typescript only: GroupLike is an alias of types that can represent a group of points.
 */
export type GroupLike = Group | Pt[];


/**
 * Typescript only: AnimateCallbackFn is a type alias that represents a callback function for animation. It accepts parameters to keep track of current time, current frame-time, and current space instance.
 */
export type AnimateCallbackFn = ( time?:number, frameTime?:number, currentSpace?:any ) => void;


/**
* Typescript only: IPlayer is an interface that represents a "player" object that can be added into a Space.
*/
export interface IPlayer {
  animateID?: string;
  animate?:AnimateCallbackFn;
  resize?( size:Bound, evt?:Event ): void;
  action?( type:string, px:number, py:number, evt:Event ): void;
  start?( bound:Bound, space:Space ): void;
}


/**
 * Typescript only: ISpacePlayers is an interface that represents a map of IPlayer instances.
 */
export interface ISpacePlayers {
  [key: string]: IPlayer;
}


/**
 *Typescript only: ITimer is an interface that represents a time-recording object.
 */
export interface ITimer {
  prev: number;
  diff: number;
  end: number;
}

/**
 * Typescript only: TouchPointsKey is a type alias that represents a set of acceptable string keys for defining touch action.
 */
export type TouchPointsKey = "touches" | "changedTouches" | "targetTouches";


/**
 * Typescript only: MultiTouchElement is an interface that represents an element that can handle touch events.
 */
export interface MultiTouchElement {
  addEventListener( evt:any, callback:Function );
  removeEventListener( evt:any, callback:Function );
}


/**
 * Typescript only: extends Canvas's 2D context with backingStorePixelRatio property.
 */
export interface PtsCanvasRenderingContext2D extends CanvasRenderingContext2D {
  webkitBackingStorePixelRatio?:number;
  mozBackingStorePixelRatio?:number;
  msBackingStorePixelRatio?:number;
  oBackingStorePixelRatio?:number;
  backingStorePixelRatio?:number;
}


/**
 * Typescript only: ColorType is a type alias for a defined set of string values such as "rgb" and "lab".
 */
export type ColorType = "rgb"|"hsl"|"hsb"|"lab"|"lch"|"luv"|"xyz";


/**
 * Typescript only: A DelaunayShape represents an object type that can store a Delaunay element. It has 3 indices (i, j, k) and two groups that represent a triangle and a circle.
 */
export type DelaunayShape = {i:number, j:number, k:number, triangle:GroupLike, circle:Group };

/**
 * Typescript only: A DelaunayMesh represents an object type that has an array of {key: shape} items, where each shape represents a DelaunayShape.
 */
export type DelaunayMesh = {[key:string]:DelaunayShape}[];



/**
 * Typescript only: A type that represents the current context for an DOMForm.
 */
export type DOMFormContext = {
  group:Element, groupID:string, groupCount:number,
  currentID:string,
  currentClass?:string,
  style:object,
  font:string, fontSize:number, fontFamily:string
};


/**
 * Typescript only: IntersectContext represents a type of an object that store the intersection info.
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
 * UIHandler is a type alias that represents a callback function to handle UI actions.
 */
export type UIHandler = ( target:UI, pt:PtLike, type:string ) => void;


/**
 * WarningType specifies a level of warning for [`Util.warnLevel`](#link).
 */
export type WarningType = "error"|"warn"|"mute";
