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
   * Create an UI element. You may also create a new UI using one of the static helper like [`UI.fromRectangle`](#link) or [`UI.fromCircle`](#link).
   * @param group a Group that defines the UI's appearance
   * @param shape specifies the shape of the Group
   * @param states optional a state object keep track of custom states for this UI
   * @param id optional id string
   */
  constructor( group:GroupLike, shape:string, states:{[key:string]: any}={}, id?:string ) {
    this._group = Group.fromArray( group );
    this._shape = shape;
    this._id = id === undefined ? `ui_${(UI._counter++)}` : id;
    this._states = states;
    this._actions = {};
  }


  /**
   * A static helper function to create a Rectangle UI.
   * @param group a group that defines a rectangle
   * @param states optional a state object keep track of custom states for this UI
   * @param id optional id string
   */
  static fromRectangle( group:GroupLike, states: {}, id?:string ):UI {
    return new this( group, UIShape.rectangle, states, id );
  }


  /**
   * A static helper function to create a Circle UI.
   * @param group a group that defines a rectangle
   * @param states optional a state object keep track of custom states for this UI
   * @param id optional id string
   */
  static fromCircle( group:GroupLike, states: {}, id?:string ):UI {
    return new this( group, UIShape.circle, states, id );
  }


  /**
   * A static helper function to create a Polygon UI.
   * @param group a group that defines a rectangle
   * @param states optional a state object keep track of custom states for this UI
   * @param id optional id string
   */
  static fromPolygon( group:GroupLike, states: {}, id?:string ):UI {
    return new this( group, UIShape.polygon, states, id );
  }


  /**
   * A static helper function to create a new UI based on another UI.
   * @param ui base UI
   * @param states optional a state object keep track of custom states for this UI
   */
  static fromUI( ui:UI, states?:object, id?:string ):UI {
    return new this( ui.group, ui.shape, states || ui._states, id );
  }


  /**
   * An unique id of the UI.
   */
  get id():string { return this._id; }
  set id( d:string ) { this._id = d; } 


  /**
   * A group of Pts that defines this UI's shape.
   */
  get group():Group { return this._group; }
  set group( d:Group ) { this._group = d; } 


  /**
   * A string that describes this UI's shape.
   */
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
   * @param fn a [`UIHandler`](#link) callback function: `fn( pt:Pt, target:UI, type:string )`
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
   * Check intersection using a specific function based on the shape of the UI.
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


  /**
   * Static function to trigger an array of UIHandlers
   */
  protected static _trigger( fns:UIHandler[], target:UI, pt:PtLike, type:string ) {
    if (fns) {
      for (let i=0, len=fns.length; i<len; i++) {
        if (fns[i]) fns[i]( target, pt, type );
      }
    }
  }


  /**
   * Static function to add a new handler to an array store of UIHandlers.
   */
  protected static _addHandler( fns:UIHandler[], fn:UIHandler ):number {
    if (fn) {
      fns.push( fn );
      return fns.length-1;
    } else {
      return -1;
    }
  }


  /**
   * Static function to remove an existing handler from an array store of UIHandlers.
   */
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
   * Create an UIButton. A button has 2 states, "clicks" (number) and "hover" (boolean), which you can access through [`UI.state`](#link) function. You may also create a new UIButton using one of the static helper like [`UI.fromRectangle`](#link) or [`UI.fromCircle`](#link).
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
   * Add a new click handler
   * @param fn a [`UIHandler`](#link) callback function: `fn( pt:Pt, target:UI, type:string )`
   * @returns an id number that refers to this handler, for use in [`UIButton.offClick`](#link) or [`UI.off`](#link).
   */
  onClick( fn:UIHandler ):number {
    return this.on( UIPointerActions.up, fn) ;
  }


  /**
   * Remove an existing click handler
   * @param id an ID number returned by [`UIButton.onClick`](#link). If this is not defined, all handlers in this key will be removed.
   * @returns a boolean indicating whether the handler was removed successfully
   */
  offClick( id:number ):boolean {
    return this.off( UIPointerActions.up, id );
  }

  
  /**
   * Add handlers for hover events.
   * @param enter an optional [`UIHandler`](#link) function to handle when pointer enters hover. Eg, `fn( pt:Pt, target:UI, type:string )`
   * @param leave an optional [`UIHandler`](#link) function to handle when pointer exits hover. Eg, `fn( pt:Pt, target:UI, type:string )`
   * @returns id numbers that refer to enter/leave handlers, for use in [`UIButton.offHover`](#link) or [`UI.off`](#link).
   */
  onHover( enter?:UIHandler, leave?:UIHandler ):number[] {
    var ids = [undefined, undefined];
    if (enter) ids[0] = this.on( UIPointerActions.enter, enter);
    if (leave) ids[1] = this.on( UIPointerActions.leave, leave);
    return ids;
  }


  /**
   * Remove handlers for hover events.
   * @param enterID an ID number returned by [`UI.onClick`](#link), or -1 to skip. If this is not defined, all handlers in this key will be removed. 
   * @param leaveID an ID number returned by [`UI.onClick`](#link), or -1 to skip. If this is not defined, all handlers in this key will be removed. 
   * @returns an array of booleans indicating whether the handlers were removed successfully
   */
  offHover( enterID?:number, leaveID?:number ):boolean[] {
    var s = [false, false];
    if (enterID === undefined || enterID >= 0) s[0] = this.off( UIPointerActions.enter, enterID );
    if (leaveID === undefined || leaveID >= 0) s[1] = this.off( UIPointerActions.leave, leaveID );
    return s;
  }

}

export class UIDragger extends UIButton {

  private _draggingID:number = -1;

  /**
   * Create a dragger which has all the states in UIButton, with additional "dragging" (boolean) and "offset" (Pt) states. You may also create a new UIDragger using one of the static helper like [`UI.fromRectangle`](#link) or [`UI.fromCircle`](#link).
   * @param group a Group that defines the UI's appearance
   * @param shape specifies the shape of the Group
   * @param states Optional default state object
   * @param id Optional id string
   */
  constructor( group:GroupLike, shape:string, states:{[key:string]: any}={}, id?:string ) {
    super( group, shape, states, id );
    if (!states.dragging) states.dragging = false;
    if (!states.offset) states.offset = new Pt( group[0] );

    const UA = UIPointerActions;

    // Handle pointer down and begin dragging
    this.on( UA.down, (target:UI, pt:PtLike, type:string) => {
      this.state( 'dragging', true );
      this.state( 'offset', new Pt(pt) );

      // begin listening for all events after dragging starts
      this._draggingID = this.on( UA.all, (t:UI, p:PtLike) => {
        if ( this.state('dragging') ) {
          UI._trigger( this._actions[UA.drag], target, pt, type );
        }
      });
    });

    // Handle pointer up and end dragging
    this.on( UA.up, (target:UI, pt:PtLike, type:string) => {
      this.state('dragging', false);
      this.off('all', this._draggingID); // remove 'all' listener
      UI._trigger( this._actions[UA.drop], target, pt, type );
    });

  }


  /**
   * Add a new drag handler.
   * @param fn a [`UIHandler`](#link) callback function: `fn( pt:Pt, target:UI, type:string )`
   * @returns an id number that refers to this handler, for use in [`UIDragger.offDrag`](#link) or [`UI.off`](#link).
   */
  onDrag( fn:UIHandler ):number {
    return this.on( UIPointerActions.drag, fn) ;
  }
  

  /**
   * Remove an existing drag handler
   * @param id an ID number returned by [`UIDragger.onDrag`](#link). If this is not defined, all handlers in this key will be removed.
   * @returns a boolean indicating whether the handler was removed successfully
   */
  offDrag( id:number ):boolean {
    return this.off( UIPointerActions.drag, id );
  }


  /**
   * Add a new drop handler.
   * @param fn a [`UIHandler`](#link) callback function: `fn( pt:Pt, target:UI, type:string )`
   * @returns an id number that refers to this handler, for use in [`UIDragger.offDrop`](#link) or [`UI.off`](#link).
   */
  onDrop( fn:UIHandler ):number {
    return this.on( UIPointerActions.drop, fn) ;
  }


  /**
   * Remove an existing drop handler
   * @param id an ID number returned by [`UIDragger.onDrag`](#link). If this is not defined, all handlers in this key will be removed.
   * @returns a boolean indicating whether the handler was removed successfully
   */
  offDrop( id:number ):boolean {
    return this.off( UIPointerActions.drop, id );
  }

}