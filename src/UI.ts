// Source code licensed under Apache License 2.0.
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)


import {Pt, Group} from "./Pt";
import { Rectangle, Circle } from "./Op";
import {UIHandler} from "./Types";


/**
 * An enumeration of different UI types.
 */
export enum UIShape {
  Rectangle, Circle, Polygon, Polyline, Line
}


/**
 * A set of string constants to represent different UI events.
 */
export const UIPointerActions = {
  up: "up", down: "down", move: "move", drag: "drag", drop: "drop", over: "over", out: "out"
};



/**
 * This class represents a UI element. Experimental.
 */
export class UI {
  group: Group;
  shape: UIShape;

  protected _id:string;
  protected _actions: {[key:string]: UIHandler };
  protected _states: {[key:string]: any};


  /**
   * Wrap an UI insider a group
   */
  constructor( group:Group, shape:UIShape, states: {}, id?:string ) {
    this.group = group;
    this.shape = shape;
    this._id = id;
    this._states = states;
    this._actions = {};
  }


  /**
   * Get and set uique id
   */
  get id():string { return this._id; }
  set id( d:string ) { this._id = d; } 


  /**
   * Get a state
   * @param key state's name
   */
  state( key:string ):any {
    return this._states[key] || false;
  }


  /**
   * Add an event handler
   * @param key event key
   * @param fn handler function
   */
  on( key:string, fn:UIHandler ) {
    this._actions[key] = fn;
    return this;
  }


  /**
   * Remove an event handler
   * @param key even key
   * @param fn 
   */
  off( key:string ) {
    delete this._actions[key];
    return this;
  }


  /**
   * Listen for interactions and trigger action handlers
   * @param key action key
   * @param p point to check
   */
  listen( key:string, p:Pt ):boolean {
    if ( this._actions[key] !== undefined ) {
      if ( this._trigger(p) ) {
        this._actions[key]( p, this, key );
        return true;
      }
    }
    return false;
  }


  /**
   * Take a custom render function to render this UI
   * @param fn render function
   */
  render( fn:( group:Group, states:{[key:string]: any}) => void ) {
    fn( this.group, this._states );
  }


  /**
   * Check intersection using a specific function based on UIShape
   * @param p a point to check
   */
  protected _trigger( p:Pt ):boolean {
    let fn = null;
    if (this.shape === UIShape.Rectangle) {
      fn = Rectangle.withinBound;
    } else if (this.shape === UIShape.Circle) {
      fn = Circle.withinBound;
    } else if (this.shape === UIShape.Polygon) {
      fn = Rectangle.withinBound;
    } else {
      return false;
    }

    return fn( this.group, p );
  }

}


/**
 * A simple UI button that can track clicks and hovers.
 */
export class UIButton extends UI {

  _clicks:number = 0;

  constructor( group:Group, shape:UIShape, states: {}, id?:string ) {
    super( group, shape, states, id );
  }

  
  /**
   * Get the total number of clicks on this UIButton
   */
  get clicks():number { return this._clicks; }


  /**
   * Add a click handler
   * @param fn a function to handle clicks
   */
  onClick( fn:UIHandler ) {
    this._clicks++;
    this.on( UIPointerActions.up, fn );
  }

  
  /**
   * Add hover handler
   * @param over a function to handle when pointer enters hover
   * @param out a function to handle when pointer exits hover
   */
  onHover( over:UIHandler, out:UIHandler ) {
    this.on( UIPointerActions.over, over);
    this.on( UIPointerActions.out, out);
  }

}