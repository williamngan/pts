"use strict";
/*! Source code licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */
Object.defineProperty(exports, "__esModule", { value: true });
const Util_1 = require("./Util");
const Op_1 = require("./Op");
const Pt_1 = require("./Pt");
const LinearAlgebra_1 = require("./LinearAlgebra");
class Num {
    static equals(a, b, threshold = 0.00001) {
        return Math.abs(a - b) < threshold;
    }
    static lerp(a, b, t) {
        return (1 - t) * a + t * b;
    }
    static clamp(val, min, max) {
        return Math.max(min, Math.min(max, val));
    }
    static boundValue(val, min, max) {
        let len = Math.abs(max - min);
        let a = val % len;
        if (a > max)
            a -= len;
        else if (a < min)
            a += len;
        return a;
    }
    static within(p, a, b) {
        return p >= Math.min(a, b) && p <= Math.max(a, b);
    }
    static randomRange(a, b = 0) {
        let r = (a > b) ? (a - b) : (b - a);
        return a + Math.random() * r;
    }
    static normalizeValue(n, a, b) {
        let min = Math.min(a, b);
        let max = Math.max(a, b);
        return (n - min) / (max - min);
    }
    static sum(pts) {
        let c = new Pt_1.Pt(pts[0]);
        for (let i = 1, len = pts.length; i < len; i++) {
            LinearAlgebra_1.Vec.add(c, pts[i]);
        }
        return c;
    }
    static average(pts) {
        return Num.sum(pts).divide(pts.length);
    }
    static cycle(t, method = Shaping.sineInOut) {
        return method(t > 0.5 ? 2 - t * 2 : t * 2);
    }
    static mapToRange(n, currA, currB, targetA, targetB) {
        if (currA == currB)
            throw new Error("[currMin, currMax] must define a range that is not zero");
        let min = Math.min(targetA, targetB);
        let max = Math.max(targetA, targetB);
        return Num.normalizeValue(n, currA, currB) * (max - min) + min;
    }
}
exports.Num = Num;
class Geom {
    static boundAngle(angle) {
        return Num.boundValue(angle, 0, 360);
    }
    static boundRadian(radian) {
        return Num.boundValue(radian, 0, Util_1.Const.two_pi);
    }
    static toRadian(angle) {
        return angle * Util_1.Const.deg_to_rad;
    }
    static toDegree(radian) {
        return radian * Util_1.Const.rad_to_deg;
    }
    static boundingBox(pts) {
        let minPt = pts.reduce((a, p) => a.$min(p));
        let maxPt = pts.reduce((a, p) => a.$max(p));
        return new Pt_1.Group(minPt, maxPt);
    }
    static centroid(pts) {
        return Num.average(pts);
    }
    static anchor(pts, ptOrIndex = 0, direction = "to") {
        let method = (direction == "to") ? "subtract" : "add";
        for (let i = 0, len = pts.length; i < len; i++) {
            if (typeof ptOrIndex == "number") {
                if (ptOrIndex !== i)
                    pts[i][method](pts[ptOrIndex]);
            }
            else {
                pts[i][method](ptOrIndex);
            }
        }
    }
    static interpolate(a, b, t = 0.5) {
        let len = Math.min(a.length, b.length);
        let d = Pt_1.Pt.make(len);
        for (let i = 0; i < len; i++) {
            d[i] = a[i] * (1 - t) + b[i] * t;
        }
        return d;
    }
    static perpendicular(pt, axis = Util_1.Const.xy) {
        let y = axis[1];
        let x = axis[0];
        let p = new Pt_1.Pt(pt);
        let pa = new Pt_1.Pt(p);
        pa[x] = -p[y];
        pa[y] = p[x];
        let pb = new Pt_1.Pt(p);
        pb[x] = p[y];
        pb[y] = -p[x];
        return new Pt_1.Group(pa, pb);
    }
    static isPerpendicular(p1, p2) {
        return new Pt_1.Pt(p1).dot(p2) === 0;
    }
    static withinBound(pt, boundPt1, boundPt2) {
        for (let i = 0, len = Math.min(pt.length, boundPt1.length, boundPt2.length); i < len; i++) {
            if (!Num.within(pt[i], boundPt1[i], boundPt2[i]))
                return false;
        }
        return true;
    }
    static sortEdges(pts) {
        let bounds = Geom.boundingBox(pts);
        let center = bounds[1].add(bounds[0]).divide(2);
        let fn = (a, b) => {
            if (a.length < 2 || b.length < 2)
                throw new Error("Pt dimension cannot be less than 2");
            let da = a.$subtract(center);
            let db = b.$subtract(center);
            if (da[0] >= 0 && db[0] < 0)
                return 1;
            if (da[0] < 0 && db[0] >= 0)
                return -1;
            if (da[0] == 0 && db[0] == 0) {
                if (da[1] >= 0 || db[1] >= 0)
                    return (da[1] > db[1]) ? 1 : -1;
                return (db[1] > da[1]) ? 1 : -1;
            }
            let det = da.$cross2D(db);
            if (det < 0)
                return 1;
            if (det > 0)
                return -1;
            return (da[0] * da[0] + da[1] * da[1] > db[0] * db[0] + db[1] * db[1]) ? 1 : -1;
        };
        return pts.sort(fn);
    }
    static scale(ps, scale, anchor) {
        let pts = (!Array.isArray(ps)) ? [ps] : ps;
        let scs = (typeof scale == "number") ? Pt_1.Pt.make(pts[0].length, scale) : scale;
        if (!anchor)
            anchor = Pt_1.Pt.make(pts[0].length, 0);
        for (let i = 0, len = pts.length; i < len; i++) {
            let p = pts[i];
            for (let k = 0, lenP = p.length; k < lenP; k++) {
                p[k] = (anchor && anchor[k]) ? anchor[k] + (p[k] - anchor[k]) * scs[k] : p[k] * scs[k];
            }
        }
        return Geom;
    }
    static rotate2D(ps, angle, anchor, axis) {
        let pts = (!Array.isArray(ps)) ? [ps] : ps;
        let fn = (anchor) ? LinearAlgebra_1.Mat.rotateAt2DMatrix : LinearAlgebra_1.Mat.rotate2DMatrix;
        if (!anchor)
            anchor = Pt_1.Pt.make(pts[0].length, 0);
        let cos = Math.cos(angle);
        let sin = Math.sin(angle);
        for (let i = 0, len = pts.length; i < len; i++) {
            let p = (axis) ? pts[i].$take(axis) : pts[i];
            p.to(LinearAlgebra_1.Mat.transform2D(p, fn(cos, sin, anchor)));
        }
        return Geom;
    }
    static shear2D(ps, scale, anchor, axis) {
        let pts = (!Array.isArray(ps)) ? [ps] : ps;
        let s = (typeof scale == "number") ? [scale, scale] : scale;
        if (!anchor)
            anchor = Pt_1.Pt.make(pts[0].length, 0);
        let fn = (anchor) ? LinearAlgebra_1.Mat.shearAt2DMatrix : LinearAlgebra_1.Mat.shear2DMatrix;
        let tanx = Math.tan(s[0]);
        let tany = Math.tan(s[1]);
        for (let i = 0, len = pts.length; i < len; i++) {
            let p = (axis) ? pts[i].$take(axis) : pts[i];
            p.to(LinearAlgebra_1.Mat.transform2D(p, fn(tanx, tany, anchor)));
        }
        return Geom;
    }
    static reflect2D(ps, line, axis) {
        let pts = (!Array.isArray(ps)) ? [ps] : ps;
        let mat = LinearAlgebra_1.Mat.reflectAt2DMatrix(line[0], line[1]);
        for (let i = 0, len = pts.length; i < len; i++) {
            let p = (axis) ? pts[i].$take(axis) : pts[i];
            p.to(LinearAlgebra_1.Mat.transform2D(p, mat));
        }
        return Geom;
    }
    static cosTable() {
        let cos = new Float64Array(360);
        for (let i = 0; i < 360; i++)
            cos[i] = Math.cos(i * Math.PI / 180);
        let find = (rad) => cos[Math.floor(Geom.boundAngle(Geom.toDegree(rad)))];
        return { table: cos, cos: find };
    }
    static sinTable() {
        let sin = new Float64Array(360);
        for (let i = 0; i < 360; i++)
            sin[i] = Math.sin(i * Math.PI / 180);
        let find = (rad) => sin[Math.floor(Geom.boundAngle(Geom.toDegree(rad)))];
        return { table: sin, sin: find };
    }
}
exports.Geom = Geom;
class Shaping {
    static linear(t, c = 1) {
        return c * t;
    }
    static quadraticIn(t, c = 1) {
        return c * t * t;
    }
    static quadraticOut(t, c = 1) {
        return -c * t * (t - 2);
    }
    static quadraticInOut(t, c = 1) {
        let dt = t * 2;
        return (t < 0.5) ? c / 2 * t * t * 4 : -c / 2 * ((dt - 1) * (dt - 3) - 1);
    }
    static cubicIn(t, c = 1) {
        return c * t * t * t;
    }
    static cubicOut(t, c = 1) {
        let dt = t - 1;
        return c * (dt * dt * dt + 1);
    }
    static cubicInOut(t, c = 1) {
        let dt = t * 2;
        return (t < 0.5) ? c / 2 * dt * dt * dt : c / 2 * ((dt - 2) * (dt - 2) * (dt - 2) + 2);
    }
    static exponentialIn(t, c = 1, p = 0.25) {
        return c * Math.pow(t, 1 / p);
    }
    static exponentialOut(t, c = 1, p = 0.25) {
        return c * Math.pow(t, p);
    }
    static sineIn(t, c = 1) {
        return -c * Math.cos(t * Util_1.Const.half_pi) + c;
    }
    static sineOut(t, c = 1) {
        return c * Math.sin(t * Util_1.Const.half_pi);
    }
    static sineInOut(t, c = 1) {
        return -c / 2 * (Math.cos(Math.PI * t) - 1);
    }
    static cosineApprox(t, c = 1) {
        let t2 = t * t;
        let t4 = t2 * t2;
        let t6 = t4 * t2;
        return c * (4 * t6 / 9 - 17 * t4 / 9 + 22 * t2 / 9);
    }
    static circularIn(t, c = 1) {
        return -c * (Math.sqrt(1 - t * t) - 1);
    }
    static circularOut(t, c = 1) {
        let dt = t - 1;
        return c * Math.sqrt(1 - dt * dt);
    }
    static circularInOut(t, c = 1) {
        let dt = t * 2;
        return (t < 0.5) ? -c / 2 * (Math.sqrt(1 - dt * dt) - 1) : c / 2 * (Math.sqrt(1 - (dt - 2) * (dt - 2)) + 1);
    }
    static elasticIn(t, c = 1, p = 0.7) {
        let dt = t - 1;
        let s = (p / Util_1.Const.two_pi) * 1.5707963267948966;
        return c * (-Math.pow(2, 10 * dt) * Math.sin((dt - s) * Util_1.Const.two_pi / p));
    }
    static elasticOut(t, c = 1, p = 0.7) {
        let s = (p / Util_1.Const.two_pi) * 1.5707963267948966;
        return c * (Math.pow(2, -10 * t) * Math.sin((t - s) * Util_1.Const.two_pi / p)) + c;
    }
    static elasticInOut(t, c = 1, p = 0.6) {
        let dt = t * 2;
        let s = (p / Util_1.Const.two_pi) * 1.5707963267948966;
        if (t < 0.5) {
            dt -= 1;
            return c * (-0.5 * (Math.pow(2, 10 * dt) * Math.sin((dt - s) * Util_1.Const.two_pi / p)));
        }
        else {
            dt -= 1;
            return c * (0.5 * (Math.pow(2, -10 * dt) * Math.sin((dt - s) * Util_1.Const.two_pi / p))) + c;
        }
    }
    static bounceIn(t, c = 1) {
        return c - Shaping.bounceOut((1 - t), c);
    }
    static bounceOut(t, c = 1) {
        if (t < (1 / 2.75)) {
            return c * (7.5625 * t * t);
        }
        else if (t < (2 / 2.75)) {
            t -= 1.5 / 2.75;
            return c * (7.5625 * t * t + 0.75);
        }
        else if (t < (2.5 / 2.75)) {
            t -= 2.25 / 2.75;
            return c * (7.5625 * t * t + 0.9375);
        }
        else {
            t -= 2.625 / 2.75;
            return c * (7.5625 * t * t + 0.984375);
        }
    }
    static bounceInOut(t, c = 1) {
        return (t < 0.5) ? Shaping.bounceIn(t * 2, c) / 2 : Shaping.bounceOut(t * 2 - 1, c) / 2 + c / 2;
    }
    static sigmoid(t, c = 1, p = 10) {
        let d = p * (t - 0.5);
        return c / (1 + Math.exp(-d));
    }
    static logSigmoid(t, c = 1, p = 0.7) {
        p = Math.max(Util_1.Const.epsilon, Math.min(1 - Util_1.Const.epsilon, p));
        p = 1 / (1 - p);
        let A = 1 / (1 + Math.exp(((t - 0.5) * p * -2)));
        let B = 1 / (1 + Math.exp(p));
        let C = 1 / (1 + Math.exp(-p));
        return c * (A - B) / (C - B);
    }
    static seat(t, c = 1, p = 0.5) {
        if ((t < 0.5)) {
            return c * (Math.pow(2 * t, 1 - p)) / 2;
        }
        else {
            return c * (1 - (Math.pow(2 * (1 - t), 1 - p)) / 2);
        }
    }
    static quadraticBezier(t, c = 1, p = [0.05, 0.95]) {
        let a = (typeof p != "number") ? p[0] : p;
        let b = (typeof p != "number") ? p[1] : 0.5;
        let om2a = 1 - 2 * a;
        if (om2a === 0) {
            om2a = Util_1.Const.epsilon;
        }
        let d = (Math.sqrt(a * a + om2a * t) - a) / om2a;
        return c * ((1 - 2 * b) * (d * d) + (2 * b) * d);
    }
    static cubicBezier(t, c = 1, p1 = [0.1, 0.7], p2 = [0.9, 0.2]) {
        let curve = new Pt_1.Group(new Pt_1.Pt(0, 0), new Pt_1.Pt(p1), new Pt_1.Pt(p2), new Pt_1.Pt(1, 1));
        return c * Op_1.Curve.bezierStep(new Pt_1.Pt(t * t * t, t * t, t, 1), Op_1.Curve.controlPoints(curve)).y;
    }
    static quadraticTarget(t, c = 1, p1 = [0.2, 0.35]) {
        let a = Math.min(1 - Util_1.Const.epsilon, Math.max(Util_1.Const.epsilon, p1[0]));
        let b = Math.min(1, Math.max(0, p1[1]));
        let A = (1 - b) / (1 - a) - (b / a);
        let B = (A * (a * a) - b) / a;
        let y = A * (t * t) - B * t;
        return c * Math.min(1, Math.max(0, y));
    }
    static cliff(t, c = 1, p = 0.5) {
        return (t > p) ? c : 0;
    }
    static step(fn, steps, t, c, ...args) {
        let s = 1 / steps;
        let tt = Math.floor(t / s) * s;
        return fn(tt, c, ...args);
    }
}
exports.Shaping = Shaping;
class Range {
    constructor(g) {
        this._dims = 0;
        this._source = Pt_1.Group.fromPtArray(g);
        this.calc();
    }
    get max() { return this._max.clone(); }
    get min() { return this._min.clone(); }
    get magnitude() { return this._mag.clone(); }
    calc() {
        if (!this._source)
            return;
        let dims = this._source[0].length;
        this._dims = dims;
        let max = new Pt_1.Pt(dims);
        let min = new Pt_1.Pt(dims);
        let mag = new Pt_1.Pt(dims);
        for (let i = 0; i < dims; i++) {
            max[i] = Util_1.Const.min;
            min[i] = Util_1.Const.max;
            mag[i] = 0;
            let s = this._source.zipSlice(i);
            for (let k = 0, len = s.length; k < len; k++) {
                max[i] = Math.max(max[i], s[k]);
                min[i] = Math.min(min[i], s[k]);
                mag[i] = max[i] - min[i];
            }
        }
        this._max = max;
        this._min = min;
        this._mag = mag;
        return this;
    }
    mapTo(min, max, exclude) {
        let target = new Pt_1.Group();
        for (let i = 0, len = this._source.length; i < len; i++) {
            let g = this._source[i];
            let n = new Pt_1.Pt(this._dims);
            for (let k = 0; k < this._dims; k++) {
                n[k] = (exclude && exclude[k]) ? g[k] : Num.mapToRange(g[k], this._min[k], this._max[k], min, max);
            }
            target.push(n);
        }
        return target;
    }
    append(g, update = true) {
        if (g[0].length !== this._dims)
            throw new Error(`Dimensions don't match. ${this._dims} dimensions in Range and ${g[0].length} provided in parameter. `);
        this._source = this._source.concat(g);
        if (update)
            this.calc();
        return this;
    }
    ticks(count) {
        let g = new Pt_1.Group();
        for (let i = 0; i <= count; i++) {
            let p = new Pt_1.Pt(this._dims);
            for (let k = 0, len = this._max.length; k < len; k++) {
                p[k] = Num.lerp(this._min[k], this._max[k], i / count);
            }
            g.push(p);
        }
        return g;
    }
}
exports.Range = Range;
//# sourceMappingURL=Num.js.map