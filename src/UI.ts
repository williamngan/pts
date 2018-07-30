// Source code licensed under Apache License 2.0.
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)


import {Pt, Group} from "./Pt";
import { Rectangle, Circle } from "./Op";
import {UIHandler} from "./Types";


/**
 * **[Experimental]** An enumeration of different UI types, for use in [`UI`](#link) instances.
 */
export enum UIShape {
  Rectangle, Circle, Polygon, Polyline, Line
}


/**
 * **[Experimental]** A set of string constants to represent different UI events.
 */
export const UIPointerActions = {
  up: "up", down: "down", move: "move", drag: "drag", drop: "drop", over: "over", out: "out"
};



/**
 * **[Experimental]** An abstract class that represents an UI element. It wraps a [`Group`](#link) and supports UI event handling. 
 * Extend this class to create custom UI elements.
 */
export class UI {
  group: Group;
  shape: UIShape;

  protected _id:string;
  protected _actions: {[key:string]: UIHandler };
  protected _states: {[key:string]: any};


  /**
   * Create an UI element.
   * @param group a Group that defines the UI's appearance
   * @param shape specifies the shape of the Group
   * @param states Optional default state object
   * @param id Optional id string
   */
  constructor( group:Group, shape:UIShape, states: {}, id?:string ) {
    this.group = group;
    this.shape = shape;
    this._id = id;
    this._states = states;
    this._actions = {};
  }


  /**
   * An unique id of the UI.
   */
  get id():string { return this._id; }
  set id( d:string ) { this._id = d; } 


  /**
   * Get a specific UI state.
   * @param key state's name
   */
  state( key:string ):any {
    return this._states[key] || false;
  }


  /**
   * Add an event handler.
   * @param key event key
   * @param fn a [`UIHandler`](#link) function: `fn( pt:Pt, target:UI, type:string )`
   */
  on( key:string, fn:UIHandler ) {
    this._actions[key] = fn;
    return this;
  }


  /**
   * Remove an event handler.
   * @param key event key
   * @param fn a [`UIHandler`](#link) function: `fn( pt:Pt, target:UI, type:string )`
   */
  off( key:string ) {
    delete this._actions[key];
    return this;
  }


  /**
   * Listen for UI events and trigger action handlers.
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
   * Take a custom render function to render this UI.
   * @param fn render function
   */
  render( fn:( group:Group, states:{[key:string]: any}) => void ) {
    fn( this.group, this._states );
  }


  /**
   * Check intersection using a specific function based on [`UIShape`](#link).
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
 * **[Experimental]** A simple button that extends [`UI`](#link) to track clicks and hovers.
 */
export class UIButton extends UI {

  _clicks:number = 0;

  /**
   * Create an UI button.
   * @param group a Group that defines the UI's appearance
   * @param shape specifies the shape of the Group
   * @param states Optional default state object
   * @param id Optional id string
   */
  constructor( group:Group, shape:UIShape, states: {}, id?:string ) {
    super( group, shape, states, id );
  }

  
  /**
   * Get the total number of clicks on this button.
   */
  get clicks():number { return this._clicks; }


  /**
   * Add click handler.
   * @param fn a [`UIHandler`](#link) function to handle clicks. Eg, `fn( pt:Pt, target:UI, type:string )`
   */
  onClick( fn:UIHandler ) {
    this._clicks++;
    this.on( UIPointerActions.up, fn );
  }

  
  /**
   * Add hover handler.
   * @param over a [`UIHandler`](#link) function to handle when pointer enters hover. Eg, `fn( pt:Pt, target:UI, type:string )`
   * @param out a [`UIHandler`](#link) function to handle when pointer exits hover. Eg, `fn( pt:Pt, target:UI, type:string )`
   */
  onHover( over:UIHandler, out:UIHandler ) {
    this.on( UIPointerActions.over, over);
    this.on( UIPointerActions.out, out);
  }

}