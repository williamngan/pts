/*! Pts.js is licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */
import { Pt, Bound } from "./Pt";
import { UIPointerActions as UIA } from "./UI";
export class Space {
    constructor() {
        this.id = "space";
        this.bound = new Bound();
        this._time = { prev: 0, diff: 0, end: -1, min: 0 };
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
    minFrameTime(ms = 0) {
        this._time.min = ms;
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
        if (this._time.diff < this._time.min)
            return this;
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
    playOnce(duration = 0) {
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
        this._hasKeyboard = false;
    }
    get pointer() {
        let p = this._pointer.clone();
        p.id = this._pointer.id;
        return p;
    }
    bindCanvas(evt, callback, options = {}, customTarget) {
        const target = customTarget ? customTarget : this._canvas;
        target.addEventListener(evt, callback, options);
    }
    unbindCanvas(evt, callback, options = {}, customTarget) {
        const target = customTarget ? customTarget : this._canvas;
        target.removeEventListener(evt, callback, options);
    }
    bindDoc(evt, callback, options = {}) {
        if (document) {
            document.addEventListener(evt, callback, options);
        }
    }
    unbindDoc(evt, callback, options = {}) {
        if (document) {
            document.removeEventListener(evt, callback, options);
        }
    }
    bindMouse(bind = true, customTarget) {
        if (bind) {
            this._mouseDown = this._mouseDown.bind(this);
            this._mouseUp = this._mouseUp.bind(this);
            this._mouseOver = this._mouseOver.bind(this);
            this._mouseOut = this._mouseOut.bind(this);
            this._mouseMove = this._mouseMove.bind(this);
            this._mouseClick = this._mouseClick.bind(this);
            this._contextMenu = this._contextMenu.bind(this);
            this.bindCanvas("mousedown", this._mouseDown, {}, customTarget);
            this.bindCanvas("mouseup", this._mouseUp, {}, customTarget);
            this.bindCanvas("mouseover", this._mouseOver, {}, customTarget);
            this.bindCanvas("mouseout", this._mouseOut, {}, customTarget);
            this.bindCanvas("mousemove", this._mouseMove, {}, customTarget);
            this.bindCanvas("click", this._mouseClick, {}, customTarget);
            this.bindCanvas("contextmenu", this._contextMenu, {}, customTarget);
            this._hasMouse = true;
        }
        else {
            this.unbindCanvas("mousedown", this._mouseDown, {}, customTarget);
            this.unbindCanvas("mouseup", this._mouseUp, {}, customTarget);
            this.unbindCanvas("mouseover", this._mouseOver, {}, customTarget);
            this.unbindCanvas("mouseout", this._mouseOut, {}, customTarget);
            this.unbindCanvas("mousemove", this._mouseMove, {}, customTarget);
            this.unbindCanvas("click", this._mouseClick, {}, customTarget);
            this.unbindCanvas("contextmenu", this._contextMenu, {}, customTarget);
            this._hasMouse = false;
        }
        return this;
    }
    bindTouch(bind = true, passive = false, customTarget) {
        if (bind) {
            this.bindCanvas("touchstart", this._touchStart.bind(this), { passive: passive }, customTarget);
            this.bindCanvas("touchend", this._mouseUp.bind(this), {}, customTarget);
            this.bindCanvas("touchmove", this._touchMove.bind(this), { passive: passive }, customTarget);
            this.bindCanvas("touchcancel", this._mouseOut.bind(this), {}, customTarget);
            this._hasTouch = true;
        }
        else {
            this.unbindCanvas("touchstart", this._touchStart.bind(this), { passive: passive }, customTarget);
            this.unbindCanvas("touchend", this._mouseUp.bind(this), {}, customTarget);
            this.unbindCanvas("touchmove", this._touchMove.bind(this), { passive: passive }, customTarget);
            this.unbindCanvas("touchcancel", this._mouseOut.bind(this), {}, customTarget);
            this._hasTouch = false;
        }
        return this;
    }
    bindKeyboard(bind = true) {
        if (bind) {
            this._keyDownBind = this._keyDown.bind(this);
            this._keyUpBind = this._keyUp.bind(this);
            this.bindDoc("keydown", this._keyDownBind, {});
            this.bindDoc("keyup", this._keyUpBind, {});
            this._hasKeyboard = true;
        }
        else {
            this.unbindDoc("keydown", this._keyDownBind, {});
            this.unbindDoc("keyup", this._keyUpBind, {});
            this._hasKeyboard = false;
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
        if (!this.isPlaying)
            return;
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
    _mouseClick(evt) {
        this._mouseAction(UIA.click, evt);
        this._pressed = false;
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
    _keyDown(evt) {
        this._keyboardAction(UIA.keydown, evt);
        return false;
    }
    _keyUp(evt) {
        this._keyboardAction(UIA.keyup, evt);
        return false;
    }
    _keyboardAction(type, evt) {
        if (!this.isPlaying)
            return;
        for (let k in this.players) {
            if (this.players.hasOwnProperty(k)) {
                let v = this.players[k];
                if (v.action)
                    v.action(type, evt.shiftKey ? 1 : 0, evt.altKey ? 1 : 0, evt);
            }
        }
    }
}
//# sourceMappingURL=Space.js.map