/*! Source code licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */

import {Pt, Group} from "./Pt";
import { Rectangle, Circle, Polygon } from "./Op";
import {UIHandler, GroupLike, PtLike, PtLikeIterable} from "./Types";


/**
 * **[Experimental]** A set of string constatns to represent different UI types, for use in [`UI`](#link) instances.
 */
export const UIShape = {
  rectangle: "rectangle", circle: "circle", polygon: "polygon", polyline: "polyline", line: "line"
};


/**
 * **[Experimental]** A set of string constants to represent different UI event types.
 */
export const UIPointerActions = {
  up: "up", down: "down", move: "move", drag: "drag", uidrag: "uidrag", drop: "drop", uidrop: "uidrop", over: "over", out: "out", enter: "enter", leave: "leave", contextmenu: "contextmenu", all: "all"
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
  protected _actions: {[type:string]: UIHandler[] };
  protected _states: {[key:string]: any};

  protected _holds = new Map<number, string>();

  /**
   * Create an UI element. You may also create a new UI using one of the static helper like [`UI.fromRectangle`](#link) or [`UI.fromCircle`](#link).
   * @param group a Group or an Iterable<PtLike> that defines the UI's appearance
   * @param shape specifies the shape of the Group
   * @param states optional a state object keep track of custom states for this UI
   * @param id optional id string
   */
  constructor( group:PtLikeIterable, shape:string, states:{[key:string]: any}={}, id?:string ) {
    this._group = Group.fromArray( group );
    this._shape = shape;
    this._id = id === undefined ? `ui_${(UI._counter++)}` : id;
    this._states = states;
    this._actions = {};
  }


  /**
   * A static helper function to create a Rectangle UI.
   * @param group a Group or an Iterable<PtLike> with 2 Pt representing a rectangle
   * @param states optional a state object keep track of custom states for this UI
   * @param id optional id string
   */
  static fromRectangle( group:PtLikeIterable, states: {}, id?:string ):UI {
    return new this( group, UIShape.rectangle, states, id );
  }


  /**
   * A static helper function to create a Circle UI.
   * @param group a Group or an Iterable<PtLike> with 2 Pt representing a circle
   * @param states optional a state object keep track of custom states for this UI
   * @param id optional id string
   */
  static fromCircle( group:PtLikeIterable, states: {}, id?:string ):UI {
    return new this( group, UIShape.circle, states, id );
  }


  /**
   * A static helper function to create a Polygon UI.
   * @param group a Group or an Iterable<PtLike> representing a polygon
   * @param states optional a state object keep track of custom states for this UI
   * @param id optional id string
   */
  static fromPolygon( group:PtLikeIterable, states: {}, id?:string ):UI {
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
    return this._states[key];
  }


  /**
   * Add an event handler. Remember this UI will also need to be tracked for events via `UI.track`.
   * @param type event type
   * @param fn a [`UIHandler`](#link) callback function: `fn( target:UI, pt:Pt, type:string, evt:MouseEvent )`
   * @returns an id number that reference to this handler, for use in [`UI.off`](#link)
   */
  on( type:string, fn:UIHandler ):number {
    if (!this._actions[type]) this._actions[type] = [];
    return UI._addHandler( this._actions[type], fn );
  }


  /**
   * Remove an event handler.
   * @param type event type
   * @param which an ID number returned by [`UI.on`](#link). If this is not defined, all handlers in this type will be removed.
   * @param fn a [`UIHandler`](#link) function: `fn( target:UI, pt:Pt, type:string, evt:MouseEvent )`
   */
  off( type:string, which?:number ):boolean {
    if (!this._actions[type]) return false;
    if (which === undefined) {
      delete this._actions[type];
      return true;
    } else {
      return UI._removeHandler( this._actions[type], which );
    }
  }


  /**
   * Listen for UI events and trigger action handlers.
   * @param type an action type. Can be one of UIPointerActions or a custom one.
   * @param p a point to check
   * @param evt a MouseEvent emitted by the browser (See [MDN docs](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent))
   */
  listen( type:string, p:PtLike, evt:MouseEvent ):boolean {
    if ( this._actions[type] !== undefined ) {
      
      if ( this._within(p) || Array.from(this._holds.values()).indexOf(type) >= 0 ) {
        UI._trigger( this._actions[type], this, p, type, evt );
        return true;
      } else if (this._actions['all']) { // listen for all regardless of trigger
        UI._trigger( this._actions['all'], this, p, type, evt );
        return true;
      }
    }
    return false;
  }


  /**
   * Continue to keep track of an actions even if it's not within this UI. Useful for hover-leave and drag-outside.
   * @param type a string defined in [`UIPointerActions`](#link)
   */
  protected hold( type:string ):number {
    let newKey = Math.max(0, ...Array.from(this._holds.keys())) + 1;
    this._holds.set(newKey, type);
    return newKey;
  }


  /**
   * Stop keeping track of this action
   * @param key an id returned by the [`UI.hold`](#link) function
   */
  protected unhold( key?:number ):void {
    if (key !== undefined) {
      this._holds.delete(key);
    } else {
      this._holds.clear();
    }
  }


  /**
   * A static function to listen for a list of UIs. See also [`UI.listen`](#link).
   * @param uis an array of UI
   * @param type an action type. Can be one of `UIPointerActions` or a custom one.
   * @param p a point to check
   * @param evt a MouseEvent emitted by the browser (See [MDN docs](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent))
   */
  static track( uis:UI[], type:string, p:PtLike, evt:MouseEvent ):void {
    for (let i=0, len=uis.length; i<len; i++) {
      uis[i].listen( type, p, evt );
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
   * Returns a string representation of this UI
   */
  toString():string {
    return `UI ${this.group.toString}`;
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
  protected static _trigger( fns:UIHandler[], target:UI, pt:PtLike, type:string, evt:MouseEvent ) {
    if (fns) {
      for (let i=0, len=fns.length; i<len; i++) {
        if (fns[i]) fns[i]( target, pt, type, evt );
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
   * @param group a Group or an Iterable<PtLike> that defines the UI's appearance
   * @param shape specifies the shape of the Group
   * @param states Optional default state object
   * @param id Optional id string
   */
  constructor( group:PtLikeIterable, shape:string, states:{[key:string]: any}={}, id?:string ) {
    super( group, shape, states, id );
    
    if (states.hover === undefined) this._states['hover'] = false;
    if (states.clicks === undefined) this._states['clicks'] = 0;

    const UA = UIPointerActions;

    // listen for clicks when mouse up and increment clicks 
    this.on( UA.up, (target:UI, pt:PtLike, type:string, evt:MouseEvent) => {
      this.state( 'clicks', this._states.clicks+1 );
    });


    // listen for move events and fire enter and leave events accordingly
    this.on( UA.move, (target:UI, pt:PtLike, type:string, evt:MouseEvent) => {
      let hover = this._within( pt );

      // hover on
      if (hover && !this._states.hover) {
        this.state('hover', true);

        // enter trigger
        UI._trigger( this._actions[UA.enter], this, pt, UA.enter, evt);
          
        // listen for hover off
        var _capID = this.hold( UA.move ); // keep hold of second move
        this._hoverID = this.on( UA.move, (t:UI, p:PtLike) => {
          
          if (!this._within( p ) && !this.state('dragging')) {
            this.state('hover', false);
            // leave trigger
            UI._trigger( this._actions[UA.leave], this, pt, UA.leave, evt);
            this.off( UA.move, this._hoverID); // remove second move listener
            this.unhold( _capID ); // stop keeping hold of second move
          }
        });
      }
    });
  }
  

  /**
   * Add a new click handler. Remember this button will also need to be tracked for events via `UI.track`. If you want to track right clicks, you may also consider [`UIButton.onContextMenu`](#link).
   * @param fn a [`UIHandler`](#link) callback function: `fn( target:UI, pt:Pt, type:string, evt:MouseEvent )`
   * @returns an id number that refers to this handler, for use in [`UIButton.offClick`](#link) or [`UI.off`](#link).
   */
  onClick( fn:UIHandler ):number {
    return this.on( UIPointerActions.up, fn) ;
  }


  /**
   * Remove an existing click handler
   * @param id an ID number returned by [`UIButton.onClick`](#link). If this is not defined, all handlers in this type will be removed.
   * @returns a boolean indicating whether the handler was removed successfully
   */
  offClick( id:number ):boolean {
    return this.off( UIPointerActions.up, id );
  }

  
  /**
   * Add a new contextmenu handler. `contextmenu` is similar to right click, see the [MDN docs](https://developer.mozilla.org/en-US/docs/Web/API/Element/contextmenu_event). Remember this button will also need to be tracked for events via `UI.track`. Also note that you may need to use `event.preventDefault()` in the callback function to prevent other events from triggering.
   * @param fn a [`UIHandler`](#link) callback function: `fn( target:UI, pt:Pt, type:string, evt:MouseEvent )`
   * @returns an id number that refers to this handler, for use in [`UIButton.offContextMenu`](#link) or [`UI.off`](#link).
   */
  onContextMenu( fn:UIHandler ):number {
    return this.on( UIPointerActions.contextmenu, fn) ;
  }


  /**
   * Remove an existing contextmenu handler
   * @param id an ID number returned by [`UIButton.onContextMenu`](#link). If this is not defined, all handlers in this type will be removed.
   * @returns a boolean indicating whether the handler was removed successfully
   */
  offContextMenu( id:number ):boolean {
    return this.off( UIPointerActions.contextmenu, id );
  }

  
  /**
   * Add handlers for hover events. Remember this button will also need to be tracked for events via `UI.track`.
   * @param enter an optional [`UIHandler`](#link) function to handle when pointer enters hover. Eg, `fn( target:UI, pt:Pt, type:string, evt:MouseEvent )`
   * @param leave an optional [`UIHandler`](#link) function to handle when pointer exits hover. Eg, `fn( target:UI, pt:Pt, type:string, evt:MouseEvent )`
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
   * @param enterID an ID number returned by [`UI.onClick`](#link), or -1 to skip. If this is not defined, all handlers in this type will be removed. 
   * @param leaveID an ID number returned by [`UI.onClick`](#link), or -1 to skip. If this is not defined, all handlers in this type will be removed. 
   * @returns an array of booleans indicating whether the handlers were removed successfully
   */
  offHover( enterID?:number, leaveID?:number ):boolean[] {
    var s = [false, false];
    if (enterID === undefined || enterID >= 0) s[0] = this.off( UIPointerActions.enter, enterID );
    if (leaveID === undefined || leaveID >= 0) s[1] = this.off( UIPointerActions.leave, leaveID );
    return s;
  }

}


/**
 * [Experimental] A draggable UI that provides handler such as [`UIDragger.onDrag`](#link) and [`UIDragger.onDrop`](#link).
 */
export class UIDragger extends UIButton {

  private _draggingID:number = -1;
  private _moveHoldID:number = -1;
  private _dropHoldID:number = -1;
  private _upHoldID:number = -1;

  /**
   * Create a dragger which has all the states in UIButton, with additional "dragging" (a boolean indicating whether it's currently being dragged) and "offset" (a Pt representing the offset between this UI's position and the pointer's position when dragged) states. (See [`UI.state`](#link)) You may also create a new UIDragger using one of the static helper like [`UI.fromRectangle`](#link) or [`UI.fromCircle`](#link).
   * @param group a Group or an Iterable<PtLike> that defines the UI's appearance
   * @param shape specifies the shape of the Group
   * @param states Optional default state object
   * @param id Optional id string
   */
  constructor( group:PtLikeIterable, shape:string, states:{[key:string]: any}={}, id?:string ) {
    super( group, shape, states, id );
    if (states.dragging === undefined) this._states['dragging'] = false;
    if (states.moved === undefined) this._states['moved'] = false;
    if (states.offset === undefined) this._states['offset'] = new Pt();

    const UA = UIPointerActions;

    /* 
     * Note: drag/drop is implemented in Space.ts, uidrag/uidrop is 
     * reimplemented here so that we can keep track of move events happening 
     * outside of the UI element. E.g. when the mouse moves faster than the 
     * UI refreshes.
     */

     // Handle pointer down and begin dragging
    this.on( UA.down, (target:UI, pt:PtLike, type:string, evt: MouseEvent) => {
      // begin listening for all events after dragging starts
      if (this._moveHoldID === -1) {
        this.state( 'dragging', true );
        this.state( 'offset', new Pt(pt).subtract( target.group[0] ) );
        this._moveHoldID = this.hold( UA.move ); // keep hold of move
      }
      if (this._dropHoldID === -1) {
        this._dropHoldID = this.hold( UA.drop ); // keep hold of drop (normal drag and drop)
      }
      if (this._upHoldID === -1) {
        this._upHoldID = this.hold( UA.up ); // keep hold of up (cancel dragging if simple click)
      }
      if (this._draggingID === -1) {
        this._draggingID = this.on( UA.move, (t:UI, p:PtLike) => {
          if ( this.state('dragging') ) {
            UI._trigger( this._actions[UA.uidrag], t, p, UA.uidrag, evt );
            this.state( 'moved', true );
          }
        });
      }
    });

    // Handle pointer drop or up and end dragging
    const endDrag = (target:UI, pt:PtLike, type:string, evt:MouseEvent) => {
      this.state('dragging', false);
      // remove move listener
      this.off(UA.move, this._draggingID);
      this._draggingID = -1;
      // stop keeping hold of move
      this.unhold( this._moveHoldID );
      this._moveHoldID = -1;
      // stop keeping hold of drop
      this.unhold( this._dropHoldID );
      this._dropHoldID = -1;
      // stop keeping hold of up
      this.unhold( this._upHoldID );
      this._upHoldID = -1;
      // trigger event
      if ( this.state('moved') ) {
        UI._trigger( this._actions[UA.uidrop], target, pt, UA.uidrop, evt );
        this.state( 'moved', false );
      }
    };
    this.on( UA.drop, endDrag);
    this.on( UA.up, endDrag);
    this.on( UA.out, endDrag);

  }


  /**
   * Add a new drag handler. Remember this button will also need to be tracked for events via `UI.track`.
   * @param fn a [`UIHandler`](#link) callback function: `fn( target:UI, pt:Pt, type:string, evt:MouseEvent )`. You can access the states "dragging" and "offset" (See [`UI.state`](#link)) in the callback.
   * @returns an id number that refers to this handler, for use in [`UIDragger.offDrag`](#link) or [`UI.off`](#link).
   */
  onDrag( fn:UIHandler ):number {
    return this.on( UIPointerActions.uidrag, fn) ;
  }
  

  /**
   * Remove an existing drag handler
   * @param id an ID number returned by [`UIDragger.onDrag`](#link). If this is not defined, all handlers in this type will be removed.
   * @returns a boolean indicating whether the handler was removed successfully
   */
  offDrag( id:number ):boolean {
    return this.off( UIPointerActions.uidrag, id );
  }


  /**
   * Add a new drop handler. Remember this button will also need to be tracked for events via `UI.track`.
   * @param fn a [`UIHandler`](#link) callback function: `fn( target:UI, pt:Pt, type:string, evt:MouseEvent )`
   * @returns an id number that refers to this handler, for use in [`UIDragger.offDrop`](#link) or [`UI.off`](#link).
   */
  onDrop( fn:UIHandler ):number {
    return this.on( UIPointerActions.uidrop, fn) ;
  }


  /**
   * Remove an existing drop handler
   * @param id an ID number returned by [`UIDragger.onDrag`](#link). If this is not defined, all handlers in this type will be removed.
   * @returns a boolean indicating whether the handler was removed successfully
   */
  offDrop( id:number ):boolean {
    return this.off( UIPointerActions.uidrop, id );
  }

}