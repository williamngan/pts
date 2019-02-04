"use strict";
/*! Source code licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */
Object.defineProperty(exports, "__esModule", { value: true });
const Pt_1 = require("./Pt");
const Num_1 = require("./Num");
exports.Const = {
    xy: "xy",
    yz: "yz",
    xz: "xz",
    xyz: "xyz",
    horizontal: 0,
    vertical: 1,
    identical: 0,
    right: 4,
    bottom_right: 5,
    bottom: 6,
    bottom_left: 7,
    left: 8,
    top_left: 1,
    top: 2,
    top_right: 3,
    epsilon: 0.0001,
    max: Number.MAX_VALUE,
    min: Number.MIN_VALUE,
    pi: Math.PI,
    two_pi: 6.283185307179586,
    half_pi: 1.5707963267948966,
    quarter_pi: 0.7853981633974483,
    one_degree: 0.017453292519943295,
    rad_to_deg: 57.29577951308232,
    deg_to_rad: 0.017453292519943295,
    gravity: 9.81,
    newton: 0.10197,
    gaussian: 0.3989422804014327
};
class Util {
    static warnLevel(lv) {
        if (lv) {
            Util._warnLevel = lv;
        }
        return Util._warnLevel;
    }
    static getArgs(args) {
        if (args.length < 1)
            return [];
        let pos = [];
        let isArray = Array.isArray(args[0]) || ArrayBuffer.isView(args[0]);
        if (typeof args[0] === 'number') {
            pos = Array.prototype.slice.call(args);
        }
        else if (typeof args[0] === 'object' && !isArray) {
            let a = ["x", "y", "z", "w"];
            let p = args[0];
            for (let i = 0; i < a.length; i++) {
                if ((p.length && i >= p.length) || !(a[i] in p))
                    break;
                pos.push(p[a[i]]);
            }
        }
        else if (isArray) {
            pos = [].slice.call(args[0]);
        }
        return pos;
    }
    static warn(message = "error", defaultReturn = undefined) {
        if (Util.warnLevel() == "error") {
            throw new Error(message);
        }
        else if (Util.warnLevel() == "warn") {
            console.warn(message);
        }
        return defaultReturn;
    }
    static randomInt(range, start = 0) {
        return Math.floor(Math.random() * range) + start;
    }
    static split(pts, size, stride, loopBack = false) {
        let st = stride || size;
        let chunks = [];
        for (let i = 0; i < pts.length; i++) {
            if (i * st + size > pts.length) {
                if (loopBack) {
                    let g = pts.slice(i * st);
                    g = g.concat(pts.slice(0, (i * st + size) % size));
                    chunks.push(g);
                }
                else {
                    break;
                }
            }
            else {
                chunks.push(pts.slice(i * st, i * st + size));
            }
        }
        return chunks;
    }
    static flatten(pts, flattenAsGroup = true) {
        let arr = (flattenAsGroup) ? new Pt_1.Group() : new Array();
        return arr.concat.apply(arr, pts);
    }
    static combine(a, b, op) {
        let result = [];
        for (let i = 0, len = a.length; i < len; i++) {
            for (let k = 0, lenB = b.length; k < lenB; k++) {
                result.push(op(a[i], b[k]));
            }
        }
        return result;
    }
    static zip(arrays) {
        let z = [];
        for (let i = 0, len = arrays[0].length; i < len; i++) {
            let p = [];
            for (let k = 0; k < arrays.length; k++) {
                p.push(arrays[k][i]);
            }
            z.push(p);
        }
        return z;
    }
    static stepper(max, min = 0, stride = 1, callback) {
        let c = min;
        return function () {
            c += stride;
            if (c >= max) {
                c = min + (c - max);
            }
            if (callback)
                callback(c);
            return c;
        };
    }
    static forRange(fn, range, start = 0, step = 1) {
        let temp = [];
        for (let i = start, len = range; i < len; i += step) {
            temp[i] = fn(i);
        }
        return temp;
    }
    static load(url, callback) {
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.onload = function () {
            if (request.status >= 200 && request.status < 400) {
                callback(request.responseText, true);
            }
            else {
                callback(`Server error (${request.status}) when loading "${url}"`, false);
            }
        };
        request.onerror = function () {
            callback(`Unknown network error`, false);
        };
        request.send();
    }
}
Util._warnLevel = "mute";
exports.Util = Util;
class Tempo {
    constructor(bpm) {
        this._listeners = {};
        this._listenerInc = 0;
        this.bpm = bpm;
    }
    static fromBeat(ms) {
        return new Tempo(60000 / ms);
    }
    get bpm() { return this._bpm; }
    set bpm(n) {
        this._bpm = n;
        this._ms = 60000 / this._bpm;
    }
    get ms() { return this._ms; }
    set ms(n) {
        this._bpm = Math.floor(60000 / n);
        this._ms = 60000 / this._bpm;
    }
    _createID(listener) {
        let id = '';
        if (typeof listener === 'function') {
            id = '_b' + (this._listenerInc++);
        }
        else {
            id = listener.name || '_b' + (this._listenerInc++);
        }
        return id;
    }
    every(beats) {
        let self = this;
        let p = Array.isArray(beats) ? beats[0] : beats;
        return {
            start: function (fn, offset = 0, name) {
                let id = name || self._createID(fn);
                self._listeners[id] = { name: id, beats: beats, period: p, index: 0, offset: offset, duration: -1, smooth: false, fn: fn };
                return this;
            },
            progress: function (fn, offset = 0, name) {
                let id = name || self._createID(fn);
                self._listeners[id] = { name: id, beats: beats, period: p, index: 0, offset: offset, duration: -1, smooth: true, fn: fn };
                return this;
            }
        };
    }
    track(time) {
        for (let k in this._listeners) {
            if (this._listeners.hasOwnProperty(k)) {
                let li = this._listeners[k];
                let _t = (li.offset) ? time + li.offset : time;
                let ms = li.period * this._ms;
                let isStart = false;
                if (_t > li.duration + ms) {
                    li.duration = _t - (_t % this._ms);
                    if (Array.isArray(li.beats)) {
                        li.index = (li.index + 1) % li.beats.length;
                        li.period = li.beats[li.index];
                    }
                    isStart = true;
                }
                let count = Math.max(0, Math.ceil(Math.floor(li.duration / this._ms) / li.period));
                let params = (li.smooth) ? [count, Num_1.Num.clamp((_t - li.duration) / ms, 0, 1), _t, isStart] : [count];
                let done = li.fn.apply(li, params);
                if (done)
                    delete this._listeners[li.name];
            }
        }
    }
    stop(name) {
        if (this._listeners[name])
            delete this._listeners[name];
    }
    animate(time, ftime) {
        this.track(time);
    }
}
exports.Tempo = Tempo;
//# sourceMappingURL=Util.js.map