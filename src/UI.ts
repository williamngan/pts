// Source code licensed under Apache License 2.0.
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)


import {Pt, Group} from "./Pt";
import { Rectangle, Circle, Polygon } from "./Op";
import {UIHandler, GroupLike, PtLike} from "./Types";


/**
 * **[Experimental]** A set of string constatns to represent different UI types, for use in [`UI`](#link) instances.
 */
export const UIShape = {
  rectangle: "rectangle", circle: "circle", polygon: "polygon", polyline: "polyline", line: "line"
};


/**
 * **[Experimental]** A set of string constants to represent different UI events.
 */
export const UIPointerActions = {
  up: "up", down: "down", move: "move", drag: "drag", drop: "drop", over: "over", out: "out", enter: "enter", leave: "leave", all: "all"
};



/**
 * **[Experimental]** An abstract class that represents an UI element. It wraps a [`Group`](#link) and supports UI event handling. 
 * Extend this class to create custom UI elements.
 */
export class UI {
  _group: Group;
  _shape: string;

  protected static _counter:number = 0;

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
  constructor( group:GroupLike, shape:string, states:{[key:string]: any}={}, id?:string ) {
    this._group = Group.fromArray( group );
    this._shape = shape;
    this._id = id === undefined ? `ui_${(UI._counter++)}` : id;
    this._states = states;
    this._actions = {};
  }

  static fromRectangle( group:GroupLike, states: {}, id?:string ) {
    return new this( group, UIShape.rectangle, states, id );
  }

  static fromCircle( group:GroupLike, states: {}, id?:string ) {
    return new this( group, UIShape.circle, states, id );
  }

  static fromPolygon( group:GroupLike, states: {}, id?:string ) {
    return new this( group, UIShape.polygon, states, id );
  }

  static fromUI( ui:UI, states?:object ) {
    return new this( ui.group, ui.shape, states || ui._states, ui.id );
  }


  /**
   * An unique id of the UI.
   */
  get id():string { return this._id; }
  set id( d:string ) { this._id = d; } 

  get group():Group { return this._group; }
  set group( d:Group ) { this._group = d; } 

  get shape():string { return this._shape; }
  set shape( d:string ) { this._shape = d; } 


  /**
   * Get and/or set a specific UI state.
   * @param key state's name
   */
  state( key:string, value?:any ):any {
    if (!key) return false;
    if (value !== undefined) {
      this._states[key] = value;
      return this; 
    }
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
  listen( key:string, p:PtLike ):boolean {
    if ( this._actions[key] !== undefined ) {
      if ( this._trigger(p) ) {
        this._actions[key]( p, this, key );
        return true;
      } else if (this._actions['all']) { // listen for all regardless of trigger
        this._actions['all']( p, this, key );
        return true;
      }
    }
    return false;
  }

  static listen( uis:UI[], key:string, p:PtLike ) {
    for (let i=0, len=uis.length; i<len; i++) {
      uis[i].listen( key, p );
    }
  }


  /**
   * Take a custom render function to render this UI.
   * @param fn render function
   */
  render( fn:( group:Group, states:{[key:string]: any}) => void ) {
    fn( this._group, this._states );
  }


  /**
   * Check intersection using a specific function based on [`UIShape`](#link).
   * @param p a point to check
   */
  protected _trigger( p:PtLike ):boolean {
    let fn = null;
    if (this._shape === UIShape.rectangle) {
      fn = Rectangle.withinBound;
    } else if (this._shape === UIShape.circle) {
      fn = Circle.withinBound;
    } else if (this._shape === UIShape.polygon) {
      fn = Polygon.hasIntersectPoint;
    } else {
      return false;
    }

    return fn( this._group, p );
  }

}


/**
 * **[Experimental]** A simple button that extends [`UI`](#link) to track clicks and hovers.
 */
export class UIButton extends UI {


  /**
   * Create an UI button.
   * @param group a Group that defines the UI's appearance
   * @param shape specifies the shape of the Group
   * @param states Optional default state object
   * @param id Optional id string
   */
  constructor( group:GroupLike, shape:string, states:{[key:string]: any}={}, id?:string ) {
    super( group, shape, states, id );
    if (!states.hover) states.hover = false;
    if (!states.clicks) states.hover = 0;
    
  }


  /**
   * Add click handler.
   * @param fn a [`UIHandler`](#link) function to handle clicks. Eg, `fn( pt:Pt, target:UI, type:string )`
   */
  onClick( fn?:UIHandler ) {
    this.on( UIPointerActions.up, (pt:Pt, target:UI, type:string) => {
      this.state( 'clicks', this._states.clicks+1 );
      if (fn) fn(pt, target, type);
    });
  }

  
  /**
   * Add hover handler.
   * @param over a [`UIHandler`](#link) function to handle when pointer enters hover. Eg, `fn( pt:Pt, target:UI, type:string )`
   * @param leave a [`UIHandler`](#link) function to handle when pointer exits hover. Eg, `fn( pt:Pt, target:UI, type:string )`
   */
  onHover( enter?:UIHandler, leave?:UIHandler ) {
    const UA = UIPointerActions;

    
    
    this.on( UA.move, (pt, target, type) => {
      let hover = this._trigger( pt );

      // hover on
      if (hover && !this._states.hover) {
        this.state('hover', true);

        // enter trigger
        if (this._actions[UA.enter]) {
          this._actions[UA.enter]( pt, this, UA.enter );
        }
          
        // listen for hover off
        this.on( UA.all, (p, t) => {
          this.state('hover', false);

          // leave trigger
          if (this._actions[UA.leave]) this._actions[UA.leave]( p, this, UA.leave );
          this.off('all'); // remove 'all' listener
        });
      }
    });

    if (enter) this.on( UA.enter, enter);
    if (leave) this.on( UA.leave, leave);
  }

}