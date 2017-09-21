// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan)


import {Bound} from "./Bound";
import {Pt, IPt} from "./Pt";
import {Form} from "./Form";

export type AnimateFunction = ( time?:number, frameTime?:number, currentSpace?:any ) => void;


/**
* Interface of a "player" object that can be added into a Space
*/
export interface IPlayer {
  animateID?: string;
  animate?:AnimateFunction;
  resize?( size:IPt, evt?:Event ): undefined;
  action?( type:string, px:number, py:number, evt:Event );
  start?( bound:Bound, space:Space );
}

export interface ISpacePlayers { 
  [key: string]: IPlayer;
}

export interface ITimer {
  prev: number;
  diff: number;
  end: number;
}


/**
* Space is an abstract class that represents a general context for expressing Pts.
* See [Space guide](../../guide/Space-0500.html) for details.
*/
export abstract class Space {
  
  id: string = "space";
  protected bound: Bound = new Bound();
  
  protected _time: ITimer = { prev: 0, diff: 0, end: -1 };
  protected players:ISpacePlayers = {};
  protected playerCount = 0;
  protected _ctx:any;
  
  private _animID:number = -1;
  
  private _pause:boolean = false;
  private _refresh:boolean = undefined;
  private _renderFunc: (context:any, self:Space) => null;
  
  protected _pointer:Pt = new Pt();

  protected _isReady = false;
  
  
  /**
  * Set whether the rendering should be repainted on each frame
  * @param b a boolean value to set whether to repaint each frame
  */
  refresh( b:boolean ):this {
    this._refresh = b;
    return this;
  }
  
  
  /**
  * Add an IPlayer to this space. An IPlayer can define the following callback functions:    
  * - `animate( time, ftime, space )`
  * - `start(bound, space)`   
  * - `resize( size, event )`
  * - `action( type, x, y, event )`  
  * Subclasses of Space may define other callback functions.
  * @param player an IPlayer object with animate function, or simply a function(time, ftime){}
  */
  add( p:IPlayer|AnimateFunction ):this {
    let player:IPlayer = (typeof p == "function") ? { animate: p } : p;
    
    let k = this.playerCount++;
    let pid = this.id + k;
    
    this.players[pid] = player;
    player.animateID = pid;
    if (player.resize && this.bound.inited) player.resize( this.bound ); 
    
    // if _refresh is not set, set it to true
    if (this._refresh === undefined) this._refresh = true;
    
    return this;
  }
  
  
  /**
  * Remove a player from this Space
  * @param player an IPlayer that has an `animateID` property
  */
  remove( player:IPlayer ):this {
    delete this.players[ player.animateID ];
    return this;
  }
  
  
  /**
  * Remove all players from this Space
  */
  removeAll():this {
    this.players = {};
    return this;
  }
  
  
  /**
  * Main play loop. This implements window.requestAnimationFrame and calls it recursively. 
  * Override this `play()` function to implemenet your own animation loop.
  * @param time current time
  */
  play( time=0 ):this {
    
    this._animID = requestAnimationFrame( this.play.bind(this) );
    if (this._pause) return this;
    
    this._time.diff = time - this._time.prev;
    this._time.prev = time;
    
    try {
      this.playItems( time );
    } catch (err) {
      cancelAnimationFrame( this._animID );
      throw err;
    }
    
    return this;
  }
  
  
  /**
  * Replay the animation after `stop()`. This resets the end-time counter.
  * You may also use `pause()` and `resume()` for temporary pause.
  */
  replay() {
    this._time.end = -1;
    this.play();
  }
  
  
  /**
  * Main animate function. This calls all the items to perform
  * @param time current time
  */
  protected playItems( time: number ) {
    
    // clear before draw if refresh is true
    if (this._refresh) this.clear();
    
    // animate all players
    if (this._isReady) {
      for (let k in this.players) {
        if (this.players[k].animate) this.players[k].animate( time, this._time.diff, this );
      }
    }
    
    // stop if time ended
    if (this._time.end >= 0 && time > this._time.end) {
      cancelAnimationFrame( this._animID );
    }
  }
  
  
  /**
  * Pause the animation
  * @param toggle a boolean value to set if this function call should be a toggle (between pause and resume)
  */
  pause( toggle=false ):this {
    this._pause = (toggle) ? !this._pause : true;
    return this;
  }
  
  
  /**
  * Resume the pause animation
  */
  resume():this {
    this._pause = false;
    return this;
  }
  
  
  /**
  * Specify when the animation should stop: immediately, after a time period, or never stops.
  * @param t a value in millisecond to specify a time period to play before stopping, or `-1` to play forever, or `0` to end immediately. Default is 0 which will stop the animation immediately.
  */
  stop( t=0 ):this {
    this._time.end = t;
    return this;
  }
  
  
  /**
  * Play animation loop, and then stop after `duration` time has passed.
  * @param duration a value in millisecond to specify a time period to play before stopping, or `-1` to play forever
  */
  playOnce( duration=5000 ):this {
    this.play();
    this.stop( duration );
    return this;
  }
  
  /**
  * Custom rendering
  * @param context rendering context
  */
  protected render( context:any ):this {
    if (this._renderFunc) this._renderFunc( context, this );
    return this;
  }
  
  
  /**
  * Set a custom rendering `function(graphics_context, canvas_space)` if needed
  */
  set customRendering( f:(context:any, self:Space) => null ) { this._renderFunc = f; }
  get customRendering():(context:any, self:Space) => null { return this._renderFunc; }
  
  
  /**
  * Get this space's bounding box
  */
  get outerBound():Bound { return this.bound.clone(); }
  
  
  /**
  * The bounding box of the canvas
  */
  public get innerBound():Bound { return new Bound( Pt.make( this.size.length, 0 ), this.size.clone() ); }
  
  
  /**
  * Get the size of this bounding box as a Pt
  */
  get size():Pt { return this.bound.size.clone(); }
  
  
  /**
  * Get the size of this bounding box as a Pt
  */
  get center():Pt { return this.size.divide(2); }
  
  
  /**
  * Get width of canvas
  */
  get width():number { return this.bound.width; }
  
  
  /**
  * Get height of canvas
  */
  get height():number { return this.bound.height; }
  
  
  /**
  * Resize the space
  * @param w `width or an IPt object
  * @param h height
  */
  abstract resize( b:IPt, evt?:Event ):this;
  
  
  /**
  * clear all contents in the space
  */
  abstract clear( ):this;
  
  
  /**
  * Get a default form for drawing in this space
  */
  abstract getForm():Form;
  
}

export type TouchPointsKey = "touches" | "changedTouches" | "targetTouches";

export interface MultiTouchElement {
  addEventListener( evt:any, callback:Function );
  removeEventListener( evt:any, callback:Function );
}

export abstract class MultiTouchSpace extends Space {
  
  // track mouse dragging
  protected _pressed = false;
  protected _dragged = false;
  
  protected _hasMouse = false;
  protected _hasTouch = false;
  
  // accept subclasses that implements addEventListener, removeEventListener, dispatchEvent
  protected _canvas:EventTarget;
  
  /**
  * Get the mouse or touch pointer that stores the last action
  */
  public get pointer():Pt {
    let p = this._pointer.clone();
    p.id = this._pointer.id;
    return p;
  }
  
  /**
  * Bind event listener in canvas element. You can also use `bindMouse` or `bindTouch` to bind mouse or touch events conveniently.
  * @param evt an event string such as "mousedown"
  * @param callback callback function for this event
  */
  bindCanvas(evt:string, callback:EventListener) {
    this._canvas.addEventListener( evt, callback );
  }
  
  
  /**
  * Unbind a callback from the event listener
  * @param evt an event string such as "mousedown"
  * @param callback callback function to unbind
  */
  unbindCanvas(evt:string, callback:EventListener) {
    this._canvas.removeEventListener( evt, callback );
  }
  
  
  /**
  * A convenient method to bind (or unbind) all mouse events in canvas element. All "players" added to this space that implements an `action` callback property will receive mouse event callbacks. The types of mouse actions are: "up", "down", "move", "drag", "drop", "over", and "out". See `Space`'s `add()` function fore more.
  * @param _bind a boolean value to bind mouse events if set to `true`. If `false`, all mouse events will be unbound. Default is true.
  * @see Space`'s [`add`](./_space_.space.html#add) function
  */
  bindMouse( _bind:boolean=true ):this {
    if ( _bind) {
      this.bindCanvas( "mousedown", this._mouseDown.bind(this) );
      this.bindCanvas( "mouseup", this._mouseUp.bind(this) );
      this.bindCanvas( "mouseover", this._mouseOver.bind(this) );
      this.bindCanvas( "mouseout", this._mouseOut.bind(this) );
      this.bindCanvas( "mousemove", this._mouseMove.bind(this) );
      this._hasMouse = true;
    } else {
      this.unbindCanvas( "mousedown", this._mouseDown.bind(this) );
      this.unbindCanvas( "mouseup", this._mouseUp.bind(this) );
      this.unbindCanvas( "mouseover", this._mouseOver.bind(this) );
      this.unbindCanvas( "mouseout", this._mouseOut.bind(this) );
      this.unbindCanvas( "mousemove", this._mouseMove.bind(this) );
      this._hasMouse = false;
    }
    return this;
  }
  
  
  /**
  * A convenient method to bind (or unbind) all touch events in canvas element. All "players" added to this space that implements an `action` callback property will receive mouse event callbacks. The types of mouse actions are: "up", "down", "move", "drag", "drop", "over", and "out". 
  * @param _bind a boolean value to bind touch events if set to `true`. If `false`, all mouse events will be unbound. Default is true.
  * @see Space`'s [`add`](./_space_.space.html#add) function
  */
  bindTouch( _bind:boolean=true ):this {
    if (_bind) {
      this.bindCanvas( "touchstart", this._mouseDown.bind(this) );
      this.bindCanvas( "touchend", this._mouseUp.bind(this) );
      this.bindCanvas( "touchmove", this._touchMove.bind(this) );
      this.bindCanvas( "touchcancel", this._mouseOut.bind(this) );
      this._hasTouch = true;
    } else {
      this.unbindCanvas( "touchstart", this._mouseDown.bind(this) );
      this.unbindCanvas( "touchend", this._mouseUp.bind(this) );
      this.unbindCanvas( "touchmove", this._touchMove.bind(this) );
      this.unbindCanvas( "touchcancel", this._mouseOut.bind(this) );
      this._hasTouch = false;
    }
    return this;
  }
  
  
  
  
  /**
  * A convenient method to convert the touch points in a touch event to an array of `Pt`.
  * @param evt a touch event which contains touches, changedTouches, and targetTouches list
  * @param which a string to select a touches list: "touches", "changedTouches", or "targetTouches". Default is "touches"
  * @return an array of Pt, whose origin position (0,0) is offset to the top-left of this space
  */
  touchesToPoints( evt:TouchEvent, which:TouchPointsKey="touches" ): Pt[] {
    if (!evt || !evt[which]) return [];
    let ts = [];
    for (var i=0; i<evt[which].length; i++) {
      let t = evt[which].item(i);
      ts.push( new Pt( t.pageX - this.bound.topLeft.x, t.pageY - this.bound.topLeft.y ) );
    }
    return ts;
  }
  
  
  /**
  * Go through all the `players` and call its `action` callback function
  * @param type "up", "down", "move", "drag", "drop", "over", and "out"
  * @param evt mouse or touch event
  */
  protected _mouseAction( type:string, evt:MouseEvent|TouchEvent ) {
    let px = 0, py = 0;
    if (evt instanceof MouseEvent) {
      for (let k in this.players) {
        if (this.players.hasOwnProperty(k)) {
          let v = this.players[k];
          px = evt.pageX - this.outerBound.x;
          py = evt.pageY - this.outerBound.y;
          if (v.action) v.action( type, px, py, evt );
        }
      }
    } else {
      for (let k in this.players) {
        if (this.players.hasOwnProperty(k)) {
          let v = this.players[k];
          let c = evt.changedTouches && evt.changedTouches.length > 0;
          let touch = evt.changedTouches.item(0);
          px = (c) ? touch.pageX - this.outerBound.x : 0;
          py = (c) ? touch.pageY - this.outerBound.y : 0;
          if (v.action) v.action( type, px, py, evt );
        }
      }
    }
    if (type) {
      this._pointer.to( px, py );
      this._pointer.id = type;
    }
  }
  
  
  /**
  * MouseDown handler
  * @param evt 
  */
  protected _mouseDown( evt:MouseEvent|TouchEvent ) {
    this._mouseAction( "down", evt );
    this._pressed = true;
    return false;
  }
  
  
  /**
  * MouseUp handler
  * @param evt 
  */
  protected _mouseUp( evt:MouseEvent|TouchEvent ) {
    this._mouseAction( "up", evt );
    if (this._dragged) this._mouseAction( "drop", evt );
    this._pressed = false;
    this._dragged = false;
    return false;
  }
  
  
  /**
  * MouseMove handler
  * @param evt 
  */
  protected _mouseMove( evt:MouseEvent|TouchEvent ) {
    this._mouseAction( "move", evt );
    if (this._pressed) {
      this._dragged = true;
      this._mouseAction( "drag", evt );
    }
    return false;
  }
  
  
  /**
  * MouseOver handler
  * @param evt 
  */
  protected _mouseOver( evt:MouseEvent|TouchEvent ) {
    this._mouseAction( "over", evt );
    return false;
  }
  
  
  /**
  * MouseOut handler
  * @param evt 
  */
  protected _mouseOut( evt:MouseEvent|TouchEvent ) {
    this._mouseAction( "out", evt );
    if (this._dragged) this._mouseAction( "drop", evt );
    this._dragged = false;
    return false;
  }
  
  
  /**
  * TouchMove handler
  * @param evt 
  */
  protected _touchMove( evt:TouchEvent) {
    this._mouseMove(evt);
    evt.preventDefault();
    return false;
  }
  
}