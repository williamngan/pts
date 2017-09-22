"use strict";
// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan)
Object.defineProperty(exports, "__esModule", { value: true });
const Bound_1 = require("./Bound");
const Pt_1 = require("./Pt");
/**
* Space is an abstract class that represents a general context for expressing Pts.
* See [Space guide](../../guide/Space-0500.html) for details.
*/
class Space {
    constructor() {
        this.id = "space";
        this.bound = new Bound_1.Bound();
        this._time = { prev: 0, diff: 0, end: -1 };
        this.players = {};
        this.playerCount = 0;
        this._animID = -1;
        this._pause = false;
        this._refresh = undefined;
        this._pointer = new Pt_1.Pt();
        this._isReady = false;
    }
    /**
    * Set whether the rendering should be repainted on each frame
    * @param b a boolean value to set whether to repaint each frame
    */
    refresh(b) {
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
    add(p) {
        let player = (typeof p == "function") ? { animate: p } : p;
        let k = this.playerCount++;
        let pid = this.id + k;
        this.players[pid] = player;
        player.animateID = pid;
        if (player.resize && this.bound.inited)
            player.resize(this.bound);
        // if _refresh is not set, set it to true
        if (this._refresh === undefined)
            this._refresh = true;
        return this;
    }
    /**
    * Remove a player from this Space
    * @param player an IPlayer that has an `animateID` property
    */
    remove(player) {
        delete this.players[player.animateID];
        return this;
    }
    /**
    * Remove all players from this Space
    */
    removeAll() {
        this.players = {};
        return this;
    }
    /**
    * Main play loop. This implements window.requestAnimationFrame and calls it recursively.
    * Override this `play()` function to implemenet your own animation loop.
    * @param time current time
    */
    play(time = 0) {
        this._animID = requestAnimationFrame(this.play.bind(this));
        if (this._pause)
            return this;
        this._time.diff = time - this._time.prev;
        this._time.prev = time;
        try {
            this.playItems(time);
        }
        catch (err) {
            cancelAnimationFrame(this._animID);
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
    playItems(time) {
        // clear before draw if refresh is true
        if (this._refresh)
            this.clear();
        // animate all players
        if (this._isReady) {
            for (let k in this.players) {
                if (this.players[k].animate)
                    this.players[k].animate(time, this._time.diff, this);
            }
        }
        // stop if time ended
        if (this._time.end >= 0 && time > this._time.end) {
            cancelAnimationFrame(this._animID);
        }
    }
    /**
    * Pause the animation
    * @param toggle a boolean value to set if this function call should be a toggle (between pause and resume)
    */
    pause(toggle = false) {
        this._pause = (toggle) ? !this._pause : true;
        return this;
    }
    /**
    * Resume the pause animation
    */
    resume() {
        this._pause = false;
        return this;
    }
    /**
    * Specify when the animation should stop: immediately, after a time period, or never stops.
    * @param t a value in millisecond to specify a time period to play before stopping, or `-1` to play forever, or `0` to end immediately. Default is 0 which will stop the animation immediately.
    */
    stop(t = 0) {
        this._time.end = t;
        return this;
    }
    /**
    * Play animation loop, and then stop after `duration` time has passed.
    * @param duration a value in millisecond to specify a time period to play before stopping, or `-1` to play forever
    */
    playOnce(duration = 5000) {
        this.play();
        this.stop(duration);
        return this;
    }
    /**
    * Custom rendering
    * @param context rendering context
    */
    render(context) {
        if (this._renderFunc)
            this._renderFunc(context, this);
        return this;
    }
    /**
    * Set a custom rendering `function(graphics_context, canvas_space)` if needed
    */
    set customRendering(f) { this._renderFunc = f; }
    get customRendering() { return this._renderFunc; }
    /**
    * Get this space's bounding box
    */
    get outerBound() { return this.bound.clone(); }
    /**
    * The bounding box of the canvas
    */
    get innerBound() { return new Bound_1.Bound(Pt_1.Pt.make(this.size.length, 0), this.size.clone()); }
    /**
    * Get the size of this bounding box as a Pt
    */
    get size() { return this.bound.size.clone(); }
    /**
    * Get the size of this bounding box as a Pt
    */
    get center() { return this.size.divide(2); }
    /**
    * Get width of canvas
    */
    get width() { return this.bound.width; }
    /**
    * Get height of canvas
    */
    get height() { return this.bound.height; }
}
exports.Space = Space;
class MultiTouchSpace extends Space {
    constructor() {
        super(...arguments);
        // track mouse dragging
        this._pressed = false;
        this._dragged = false;
        this._hasMouse = false;
        this._hasTouch = false;
    }
    /**
    * Get the mouse or touch pointer that stores the last action
    */
    get pointer() {
        let p = this._pointer.clone();
        p.id = this._pointer.id;
        return p;
    }
    /**
    * Bind event listener in canvas element. You can also use `bindMouse` or `bindTouch` to bind mouse or touch events conveniently.
    * @param evt an event string such as "mousedown"
    * @param callback callback function for this event
    */
    bindCanvas(evt, callback) {
        this._canvas.addEventListener(evt, callback);
    }
    /**
    * Unbind a callback from the event listener
    * @param evt an event string such as "mousedown"
    * @param callback callback function to unbind
    */
    unbindCanvas(evt, callback) {
        this._canvas.removeEventListener(evt, callback);
    }
    /**
    * A convenient method to bind (or unbind) all mouse events in canvas element. All "players" added to this space that implements an `action` callback property will receive mouse event callbacks. The types of mouse actions are: "up", "down", "move", "drag", "drop", "over", and "out". See `Space`'s `add()` function fore more.
    * @param _bind a boolean value to bind mouse events if set to `true`. If `false`, all mouse events will be unbound. Default is true.
    * @see Space`'s [`add`](./_space_.space.html#add) function
    */
    bindMouse(_bind = true) {
        if (_bind) {
            this.bindCanvas("mousedown", this._mouseDown.bind(this));
            this.bindCanvas("mouseup", this._mouseUp.bind(this));
            this.bindCanvas("mouseover", this._mouseOver.bind(this));
            this.bindCanvas("mouseout", this._mouseOut.bind(this));
            this.bindCanvas("mousemove", this._mouseMove.bind(this));
            this._hasMouse = true;
        }
        else {
            this.unbindCanvas("mousedown", this._mouseDown.bind(this));
            this.unbindCanvas("mouseup", this._mouseUp.bind(this));
            this.unbindCanvas("mouseover", this._mouseOver.bind(this));
            this.unbindCanvas("mouseout", this._mouseOut.bind(this));
            this.unbindCanvas("mousemove", this._mouseMove.bind(this));
            this._hasMouse = false;
        }
        return this;
    }
    /**
    * A convenient method to bind (or unbind) all touch events in canvas element. All "players" added to this space that implements an `action` callback property will receive mouse event callbacks. The types of mouse actions are: "up", "down", "move", "drag", "drop", "over", and "out".
    * @param _bind a boolean value to bind touch events if set to `true`. If `false`, all mouse events will be unbound. Default is true.
    * @see Space`'s [`add`](./_space_.space.html#add) function
    */
    bindTouch(_bind = true) {
        if (_bind) {
            this.bindCanvas("touchstart", this._mouseDown.bind(this));
            this.bindCanvas("touchend", this._mouseUp.bind(this));
            this.bindCanvas("touchmove", this._touchMove.bind(this));
            this.bindCanvas("touchcancel", this._mouseOut.bind(this));
            this._hasTouch = true;
        }
        else {
            this.unbindCanvas("touchstart", this._mouseDown.bind(this));
            this.unbindCanvas("touchend", this._mouseUp.bind(this));
            this.unbindCanvas("touchmove", this._touchMove.bind(this));
            this.unbindCanvas("touchcancel", this._mouseOut.bind(this));
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
    touchesToPoints(evt, which = "touches") {
        if (!evt || !evt[which])
            return [];
        let ts = [];
        for (var i = 0; i < evt[which].length; i++) {
            let t = evt[which].item(i);
            ts.push(new Pt_1.Pt(t.pageX - this.bound.topLeft.x, t.pageY - this.bound.topLeft.y));
        }
        return ts;
    }
    /**
    * Go through all the `players` and call its `action` callback function
    * @param type "up", "down", "move", "drag", "drop", "over", and "out"
    * @param evt mouse or touch event
    */
    _mouseAction(type, evt) {
        let px = 0, py = 0;
        if (evt instanceof MouseEvent) {
            for (let k in this.players) {
                if (this.players.hasOwnProperty(k)) {
                    let v = this.players[k];
                    px = evt.pageX - this.outerBound.x;
                    py = evt.pageY - this.outerBound.y;
                    if (v.action)
                        v.action(type, px, py, evt);
                }
            }
        }
        else {
            for (let k in this.players) {
                if (this.players.hasOwnProperty(k)) {
                    let v = this.players[k];
                    let c = evt.changedTouches && evt.changedTouches.length > 0;
                    let touch = evt.changedTouches.item(0);
                    px = (c) ? touch.pageX - this.outerBound.x : 0;
                    py = (c) ? touch.pageY - this.outerBound.y : 0;
                    if (v.action)
                        v.action(type, px, py, evt);
                }
            }
        }
        if (type) {
            this._pointer.to(px, py);
            this._pointer.id = type;
        }
    }
    /**
    * MouseDown handler
    * @param evt
    */
    _mouseDown(evt) {
        this._mouseAction("down", evt);
        this._pressed = true;
        return false;
    }
    /**
    * MouseUp handler
    * @param evt
    */
    _mouseUp(evt) {
        this._mouseAction("up", evt);
        if (this._dragged)
            this._mouseAction("drop", evt);
        this._pressed = false;
        this._dragged = false;
        return false;
    }
    /**
    * MouseMove handler
    * @param evt
    */
    _mouseMove(evt) {
        this._mouseAction("move", evt);
        if (this._pressed) {
            this._dragged = true;
            this._mouseAction("drag", evt);
        }
        return false;
    }
    /**
    * MouseOver handler
    * @param evt
    */
    _mouseOver(evt) {
        this._mouseAction("over", evt);
        return false;
    }
    /**
    * MouseOut handler
    * @param evt
    */
    _mouseOut(evt) {
        this._mouseAction("out", evt);
        if (this._dragged)
            this._mouseAction("drop", evt);
        this._dragged = false;
        return false;
    }
    /**
    * TouchMove handler
    * @param evt
    */
    _touchMove(evt) {
        this._mouseMove(evt);
        evt.preventDefault();
        return false;
    }
}
exports.MultiTouchSpace = MultiTouchSpace;
//# sourceMappingURL=Space.js.map