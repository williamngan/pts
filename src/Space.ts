import {Vector} from "vectorious";
import {Bound} from "./Bound";
import {Pt, IPt} from "./Pt";
import {Pts} from "./Pts";


export interface IPlayer {
  animateID: string;
  animate( time:number, frameTime:number, context:any ): IPlayer;
  onSpaceResize( p:IPt ): undefined;
}

interface ISpacePlayers { 
  [key: string]: IPlayer;
}

interface ITimer {
  prev: number;
  diff: number;
  end: number;
}

export abstract class Space {

  id: string = "space";
  bound: Bound = new Bound();

  protected _time: ITimer = { prev: 0, diff: 0, end: -1 };
  protected players:ISpacePlayers = {};
  protected playerCount = 0;
  protected ctx:any = {};

  private _animID:number = -1;

  private _pause:boolean = false;
  private _refresh:boolean = false;

  /**
   * Set whether the rendering should be repainted on each frame
   * @param b a boolean value to set whether to repaint each frame
   */
  refresh( b:boolean ):Space {
    this._refresh = b;
    return this;
  }

  /**
   * Add an item to this space. An item must define a callback function `animate( time, fps, context )` and will be assigned a property `animateID` automatically. 
   * An item should also define a callback function `onSpaceResize( w, h, evt )`. 
   * Subclasses of Space may define other callback functions.
   * @param player 
   */
  add( player:IPlayer ):Space {
    let k = this.playerCount++;
    let pid = this.id + k;

    this.players[pid] = player;
    player.animateID = pid;
    player.onSpaceResize( this.bound ); 

    return this;
  }

  /**
   * Remove a player from this Space
   * @param player an IPlayer that has an `animateID` property
   */
  remove( player:IPlayer ):Space {
    delete this.players[ player.animateID ];
    return this;
  }

  /**
   * Remove all players from this Space
   */
  removeAll():Space {
    this.players = {};
    return this;
  }

  /**
   * Main play loop. This implements window.requestAnimationFrame and calls it recursively. 
   * Override this `play()` function to implemenet your own animation loop.
   * @param time current time
   */
  play( time=0 ):Space {
    this._animID = requestAnimationFrame( (t) => this.play(t) );
    if (this._pause) return this;

    this._time.diff = time - this._time.prev;

    try {
      this.playItems( time );
    } catch (err) {
      cancelAnimationFrame( this._animID );
      throw err;
    }

    return this;
  }

  /**
   * Main animate function. This calls all the items to perform
   * @param time current time
   */
  protected playItems( time: number ) {
    // clear before draw if refresh is true
    if (this._refresh) this.clear();

    // animate all players
    for (let k in this.players) {
      this.players[k].animate( time, this._time.diff, this.ctx );
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
  pause( toggle=false ):Space {
    this._pause = (toggle) ? !this._pause : true;
    return this;
  }

  /**
   * Resume the pause animation
   */
  resume():Space {
    this._pause = false;
    return this;
  }

  /**
   * Specify when the animation should stop: immediately, after a time period, or never stops.
   * @param t a value in millisecond to specify a time period to play before stopping, or `-1` to play forever, or `0` to end immediately. Default is 0 which will stop the animation immediately.
   */
  stop( t=0 ):Space {
    this._time.end = t;
    return this;
  }

  /**
   * Play animation loop, and then stop after `duration` time has passed.
   * @param duration a value in millisecond to specify a time period to play before stopping, or `-1` to play forever
   */
  playOnce( duration=5000 ):Space {
    this.play();
    this.stop( duration );
    return this;
  }

  /**
   * set custom render function (on resize and other events)
   * @param context graphics context
   */
  abstract render( context?:any ):Space;

  /**
   * Resize the space
   * @param w `width or an IPt object
   * @param h height
   */
  abstract resize( w:number|IPt, h?:number ):Space;

  /**
   * clear all contents in the space
   */
  abstract clear( ):Space;

  /**
   * Bind event listener in canvas element, for events such as mouse events
   * @param evt 
   * @param callback 
   */
  abstract bindCanvas(evt:Event, callback:Function);

  /**
   * A convenient method to bind (or unbind) all mouse events
   * @param _bind 
   */
  abstract bindMouse( _bind:boolean );

  /**
   * A convenient method to bind (or unbind) all mobile touch events
   * @param _bind 
   */
  abstract bindTouch( _bind:boolean );

  /**
   * A convenient method to convert the touch points in a touch event to a Pts
   * @param evt 
   * @param which 
   */
  abstract touchesToPoints( evt:Event, which?:string ):Pts;
}