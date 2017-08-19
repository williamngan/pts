import { Bound } from "./Bound";
import { Pt, IPt } from "./Pt";
import { Form } from "./Form";
export declare type AnimateFunction = (time?: number, frameTime?: number, currentSpace?: any) => void;
/**
 * Interface of a "player" object that can be added into a Space
 */
export interface IPlayer {
    animateID?: string;
    animate?: AnimateFunction;
    resize?(size: IPt, evt?: Event): undefined;
    action?(type: string, px: number, py: number, evt: Event): any;
    start?(bound: Bound, space: Space): any;
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
export declare abstract class Space {
    id: string;
    protected bound: Bound;
    protected _time: ITimer;
    protected players: ISpacePlayers;
    protected playerCount: number;
    protected _ctx: any;
    private _animID;
    private _pause;
    private _refresh;
    protected _pointer: Pt;
    /**
     * Set whether the rendering should be repainted on each frame
     * @param b a boolean value to set whether to repaint each frame
     */
    refresh(b: boolean): this;
    /**
     * Add an IPlayer to this space. An IPlayer can define the following callback functions:
     * - `animate( time, ftime, space )`
     * - `start(bound, spacE)`
     * - `resize( size, event )`
     * - `action( type, x, y, event )`
     * Subclasses of Space may define other callback functions.
     * @param player an IPlayer object with animate function, or simply a function(time, ftime){}
     */
    add(p: IPlayer | AnimateFunction): this;
    /**
     * Remove a player from this Space
     * @param player an IPlayer that has an `animateID` property
     */
    remove(player: IPlayer): this;
    /**
     * Remove all players from this Space
     */
    removeAll(): this;
    /**
     * Main play loop. This implements window.requestAnimationFrame and calls it recursively.
     * Override this `play()` function to implemenet your own animation loop.
     * @param time current time
     */
    play(time?: number): this;
    /**
     * Replay the animation after `stop()`. This resets the end-time counter.
     * You may also use `pause()` and `resume()` for temporary pause.
     */
    replay(): void;
    /**
     * Main animate function. This calls all the items to perform
     * @param time current time
     */
    protected playItems(time: number): void;
    /**
     * Pause the animation
     * @param toggle a boolean value to set if this function call should be a toggle (between pause and resume)
     */
    pause(toggle?: boolean): this;
    /**
     * Resume the pause animation
     */
    resume(): this;
    /**
     * Specify when the animation should stop: immediately, after a time period, or never stops.
     * @param t a value in millisecond to specify a time period to play before stopping, or `-1` to play forever, or `0` to end immediately. Default is 0 which will stop the animation immediately.
     */
    stop(t?: number): this;
    /**
     * Play animation loop, and then stop after `duration` time has passed.
     * @param duration a value in millisecond to specify a time period to play before stopping, or `-1` to play forever
     */
    playOnce(duration?: number): this;
    /**
     * Get this space's bounding box
     */
    readonly outerBound: Bound;
    /**
     * The bounding box of the canvas
     */
    readonly innerBound: Bound;
    /**
     * Get the size of this bounding box as a Pt
     */
    readonly size: Pt;
    /**
     * Get the size of this bounding box as a Pt
     */
    readonly center: Pt;
    /**
     * Get width of canvas
     */
    readonly width: number;
    /**
     * Get height of canvas
     */
    readonly height: number;
    /**
     * Resize the space
     * @param w `width or an IPt object
     * @param h height
     */
    abstract resize(b: IPt, evt?: Event): this;
    /**
     * clear all contents in the space
     */
    abstract clear(): this;
    /**
     * Get a default form for drawing in this space
     */
    abstract getForm(): Form;
}
