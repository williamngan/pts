/*! Source code licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */
import { Pt, Bound } from "./Pt";
import { UIPointerActions as UIA } from "./UI";
export class Space {
    constructor() {
        this.id = "space";
        this.bound = new Bound();
        this._time = { prev: 0, diff: 0, end: -1 };
        this.players = {};
        this.playerCount = 0;
        this._animID = -1;
        this._pause = false;
        this._refresh = undefined;
        this._pointer = new Pt();
        this._isReady = false;
        this._playing = false;
    }
    refresh(b) {
        this._refresh = b;
        return this;
    }
    add(p) {
        let player = (typeof p == "function") ? { animate: p } : p;
        let k = this.playerCount++;
        let pid = this.id + k;
        this.players[pid] = player;
        player.animateID = pid;
        if (player.resize && this.bound.inited)
            player.resize(this.bound);
        if (this._refresh === undefined)
            this._refresh = true;
        return this;
    }
    remove(player) {
        delete this.players[player.animateID];
        return this;
    }
    removeAll() {
        this.players = {};
        return this;
    }
    play(time = 0) {
        if (time === 0 && this._animID !== -1) {
            return;
        }
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
            this._animID = -1;
            this._playing = false;
            throw err;
        }
        return this;
    }
    replay() {
        this._time.end = -1;
        this.play();
    }
    playItems(time) {
        this._playing = true;
        if (this._refresh)
            this.clear();
        if (this._isReady) {
            for (let k in this.players) {
                if (this.players[k].animate)
                    this.players[k].animate(time, this._time.diff, this);
            }
        }
        if (this._time.end >= 0 && time > this._time.end) {
            cancelAnimationFrame(this._animID);
            this._animID = -1;
            this._playing = false;
        }
    }
    pause(toggle = false) {
        this._pause = (toggle) ? !this._pause : true;
        return this;
    }
    resume() {
        this._pause = false;
        return this;
    }
    stop(t = 0) {
        this._time.end = t;
        return this;
    }
    playOnce(duration = 5000) {
        this.play();
        this.stop(duration);
        return this;
    }
    render(context) {
        if (this._renderFunc)
            this._renderFunc(context, this);
        return this;
    }
    set customRendering(f) { this._renderFunc = f; }
    get customRendering() { return this._renderFunc; }
    get isPlaying() { return this._playing; }
    get outerBound() { return this.bound.clone(); }
    get innerBound() { return new Bound(Pt.make(this.size.length, 0), this.size.clone()); }
    get size() { return this.bound.size.clone(); }
    get center() { return this.size.divide(2); }
    get width() { return this.bound.width; }
    get height() { return this.bound.height; }
}
export class MultiTouchSpace extends Space {
    constructor() {
        super(...arguments);
        this._pressed = false;
        this._dragged = false;
        this._hasMouse = false;
        this._hasTouch = false;
    }
    get pointer() {
        let p = this._pointer.clone();
        p.id = this._pointer.id;
        return p;
    }
    bindCanvas(evt, callback) {
        this._canvas.addEventListener(evt, callback);
    }
    unbindCanvas(evt, callback) {
        this._canvas.removeEventListener(evt, callback);
    }
    bindMouse(_bind = true) {
        if (_bind) {
            this.bindCanvas("mousedown", this._mouseDown.bind(this));
            this.bindCanvas("mouseup", this._mouseUp.bind(this));
            this.bindCanvas("mouseover", this._mouseOver.bind(this));
            this.bindCanvas("mouseout", this._mouseOut.bind(this));
            this.bindCanvas("mousemove", this._mouseMove.bind(this));
            this.bindCanvas("contextmenu", this._contextMenu.bind(this));
            this._hasMouse = true;
        }
        else {
            this.unbindCanvas("mousedown", this._mouseDown.bind(this));
            this.unbindCanvas("mouseup", this._mouseUp.bind(this));
            this.unbindCanvas("mouseover", this._mouseOver.bind(this));
            this.unbindCanvas("mouseout", this._mouseOut.bind(this));
            this.unbindCanvas("mousemove", this._mouseMove.bind(this));
            this.unbindCanvas("contextmenu", this._contextMenu.bind(this));
            this._hasMouse = false;
        }
        return this;
    }
    bindTouch(_bind = true) {
        if (_bind) {
            this.bindCanvas("touchstart", this._touchStart.bind(this));
            this.bindCanvas("touchend", this._mouseUp.bind(this));
            this.bindCanvas("touchmove", this._touchMove.bind(this));
            this.bindCanvas("touchcancel", this._mouseOut.bind(this));
            this._hasTouch = true;
        }
        else {
            this.unbindCanvas("touchstart", this._touchStart.bind(this));
            this.unbindCanvas("touchend", this._mouseUp.bind(this));
            this.unbindCanvas("touchmove", this._touchMove.bind(this));
            this.unbindCanvas("touchcancel", this._mouseOut.bind(this));
            this._hasTouch = false;
        }
        return this;
    }
    touchesToPoints(evt, which = "touches") {
        if (!evt || !evt[which])
            return [];
        let ts = [];
        for (var i = 0; i < evt[which].length; i++) {
            let t = evt[which].item(i);
            ts.push(new Pt(t.pageX - this.bound.topLeft.x, t.pageY - this.bound.topLeft.y));
        }
        return ts;
    }
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
    _mouseDown(evt) {
        this._mouseAction(UIA.down, evt);
        this._pressed = true;
        return false;
    }
    _mouseUp(evt) {
        if (this._dragged) {
            this._mouseAction(UIA.drop, evt);
        }
        else {
            this._mouseAction(UIA.up, evt);
        }
        this._pressed = false;
        this._dragged = false;
        return false;
    }
    _mouseMove(evt) {
        this._mouseAction(UIA.move, evt);
        if (this._pressed) {
            this._dragged = true;
            this._mouseAction(UIA.drag, evt);
        }
        return false;
    }
    _mouseOver(evt) {
        this._mouseAction(UIA.over, evt);
        return false;
    }
    _mouseOut(evt) {
        this._mouseAction(UIA.out, evt);
        if (this._dragged)
            this._mouseAction(UIA.drop, evt);
        this._dragged = false;
        return false;
    }
    _contextMenu(evt) {
        this._mouseAction(UIA.contextmenu, evt);
        return false;
    }
    _touchMove(evt) {
        this._mouseMove(evt);
        evt.preventDefault();
        return false;
    }
    _touchStart(evt) {
        this._mouseDown(evt);
        evt.preventDefault();
        return false;
    }
}
//# sourceMappingURL=Space.js.map