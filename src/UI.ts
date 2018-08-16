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
  protected _actions: {[key:string]: UIHandler[] };
  protected _states: {[key:string]: any};


  /**
   * Create an UI element.
   * @param group a Group that defines the UI's appearance
   * @param shape specifies the shape of the Group
   * @param states Optional a state object keep track of custom states for this UI
   * @param id Optional id string
   */
  constructor( group:GroupLike, shape:string, states:{[key:string]: any}={}, id?:string ) {
    this._group = Group.fromArray( group );
    this._shape = shape;
    this._id = id === undefined ? `ui_${(UI._counter++)}` : id;
    this._states = states;
    this._actions = {};
  }

  static fromRectangle( group:GroupLike, states: {}, id?:string ):UI {
    return new this( group, UIShape.rectangle, states, id );
  }

  static fromCircle( group:GroupLike, states: {}, id?:string ):UI {
    return new this( group, UIShape.circle, states, id );
  }

  static fromPolygon( group:GroupLike, states: {}, id?:string ):UI {
    return new this( group, UIShape.polygon, states, id );
  }

  static fromUI( ui:UI, states?:object ):UI {
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
   * @param value optionally set a new value for this state.key
   * @param if `value` is changed, return this instance. Otherwise, return the value of the specific key.
   */
  state( key:string, value?:any ):any {
    if (!key) return null;
    if (value !== undefined) {
      this._states[key] = value;
      return this; 
    }
    return this._states[key] || null;
  }


  /**
   * Add an event handler.
   * @param key event key
   * @param fn a [`UIHandler`](#link) function: `fn( pt:Pt, target:UI, type:string )`
   * @returns an id number that reference to this handler, for use in [`UI.off`](#link)
   */
  on( key:string, fn:UIHandler ):number {
    if (!this._actions[key]) this._actions[key] = [];
    return UI._addHandler( this._actions[key], fn );
  }


  /**
   * Remove an event handler.
   * @param key event key
   * @param which an ID number returned by [`UI.on`](#link). If this is not defined, all handlers in this key will be removed.
   * @param fn a [`UIHandler`](#link) function: `fn( pt:Pt, target:UI, type:string )`
   */
  off( key:string, which?:number ):boolean {
    if (!this._actions[key]) return false;
    if (which === undefined) {
      delete this._actions[key];
      return true;
    } else {
      return UI._removeHandler( this._actions[key], which );
    }
  }


  /**
   * Listen for UI events and trigger action handlers.
   * @param key an action key. Can be one of UIPointerActions or a custom one.
   * @param p a point to check
   */
  listen( key:string, p:PtLike ):boolean {
    if ( this._actions[key] !== undefined ) {
      if ( this._within(p) ) {
        UI._trigger( this._actions[key], this, p, key );
        return true;
      } else if (this._actions['all']) { // listen for all regardless of trigger
        UI._trigger( this._actions['all'], this, p, key );
        return true;
      }
    }
    return false;
  }


  /**
   * A static function to listen for a list of UIs. See also [`UI.listen`](#link).
   * @param uis an array of UI
   * @param key an action key. Can be one of UIPointerActions or a custom one.
   * @param p A point to check
   */
  static track( uis:UI[], key:string, p:PtLike ):void {
    for (let i=0, len=uis.length; i<len; i++) {
      uis[i].listen( key, p );
    }
  }

  /**
   * Take a custom render function to render this UI.
   * @param fn a render function
   */
  render( fn:( group:Group, states:{[key:string]: any}) => void ):void {
    fn( this._group, this._states );
  }


  /**
   * Check intersection using a specific function based on [`UIShape`](#link).
   * @param p a point to check
   * @returns a boolean to indicate if the event should be triggered
   */
  protected _within( p:PtLike ):boolean {
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


  protected static _trigger( fns:UIHandler[], target:UI, pt:PtLike, type:string ) {
    if (fns) {
      for (let i=0, len=fns.length; i<len; i++) {
        fns[i]( target, pt, type );
      }
    }
  }

  protected static _addHandler( fns:UIHandler[], fn:UIHandler ):number {
    if (fn) {
      fns.push( fn );
      return fns.length-1;
    } else {
      return -1;
    }
  }

  protected static _removeHandler( fns:UIHandler[], index:number ):boolean {
    if (index >=0 && index<fns.length) {
      let temp = fns.length;
      fns.splice( index, 1 );
      return (temp > fns.length);
    } else {
      return false;
    }
  }

}


/**
 * **[Experimental]** A simple button that extends [`UI`](#link) to track clicks and hovers.
 */
export class UIButton extends UI {

  private _hoverID:number = -1;

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

    const UA = UIPointerActions;

    // listen for clicks when mouse up and increment clicks 
    this.on( UA.up, (target:UI, pt:PtLike, type:string) => {
      this.state( 'clicks', this._states.clicks+1 );
    });


    // listen for move events and fire enter and leave events accordingly
    this.on( UA.move, (target:UI, pt:PtLike, type:string) => {
      let hover = this._within( pt );

      // hover on
      if (hover && !this._states.hover) {
        this.state('hover', true);

        // enter trigger
        UI._trigger( this._actions[UA.enter], this, pt, UA.enter);
          
        // listen for hover off
        this._hoverID = this.on( UA.all, (t:UI, p:PtLike) => {
          this.state('hover', false);
          // leave trigger
          UI._trigger( this._actions[UA.leave], this, pt, UA.leave);
          this.off('all', this._hoverID); // remove 'all' listener
        });
      }
    });
  }
  

  /**
   * Start handling click event. This will set a 'clicks' property on the `state` object which count the number of clicks applied to this UIButton -- useful for implementing custom toggle states.
   * @param fn a [`UIHandler`](#link) function to handle clicks. Eg, `fn( pt:Pt, target:UI, type:string )`
   * @returns a numeric id of the added function, or -1 if it's not added.
   */
  onClick( fn:UIHandler ):number {
    return this.on( UIPointerActions.up, fn) ;
  }

  offClick( id:number ):boolean {
    return this.off( UIPointerActions.up, id );
  }

  
  /**
   * Start handling hover events (enter, leave). This will set a 'hover' property on the `state` object which can be used to determine current hover state.  
   * @param over an optional [`UIHandler`](#link) function to handle when pointer enters hover. Eg, `fn( pt:Pt, target:UI, type:string )`
   * @param leave an optional [`UIHandler`](#link) function to handle when pointer exits hover. Eg, `fn( pt:Pt, target:UI, type:string )`
   */
  onHover( enter?:UIHandler, leave?:UIHandler ) {
  
    if (enter) this.on( UIPointerActions.enter, enter);
    if (leave) this.on( UIPointerActions.leave, leave);
  }

}

export class UIDragger extends UIButton {

  /**
   * Create an UI Dragger.
   * @param group a Group that defines the UI's appearance
   * @param shape specifies the shape of the Group
   * @param states Optional default state object
   * @param id Optional id string
   */
  constructor( group:GroupLike, shape:string, states:{[key:string]: any}={}, id?:string ) {
    super( group, shape, states, id );
    if (!states.hover) states.dragging = false;
    if (!states.clicks) states.offset = group[0].clone();
  }



  

}