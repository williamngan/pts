/*! Source code licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */
import { Util, Const } from "./Util";
import { Geom, Num } from "./Num";
import { Vec, Mat } from "./LinearAlgebra";
export class Pt extends Float32Array {
    constructor(...args) {
        if (args.length === 1 && typeof args[0] == "number") {
            super(args[0]);
        }
        else {
            super((args.length > 0) ? Util.getArgs(args) : [0, 0]);
        }
    }
    static make(dimensions, defaultValue = 0, randomize = false) {
        let p = new Float32Array(dimensions);
        if (defaultValue)
            p.fill(defaultValue);
        if (randomize) {
            for (let i = 0, len = p.length; i < len; i++) {
                p[i] = p[i] * Num.random();
            }
        }
        return new Pt(p);
    }
    get id() { return this._id; }
    set id(s) { this._id = s; }
    get x() { return this[0]; }
    set x(n) { this[0] = n; }
    get y() { return this[1]; }
    set y(n) { this[1] = n; }
    get z() { return this[2]; }
    set z(n) { this[2] = n; }
    get w() { return this[3]; }
    set w(n) { this[3] = n; }
    clone() {
        return new Pt(this);
    }
    equals(p, threshold = 0.000001) {
        for (let i = 0, len = this.length; i < len; i++) {
            if (Math.abs(this[i] - p[i]) > threshold)
                return false;
        }
        return true;
    }
    to(...args) {
        let p = Util.getArgs(args);
        for (let i = 0, len = Math.min(this.length, p.length); i < len; i++) {
            this[i] = p[i];
        }
        return this;
    }
    $to(...args) {
        return this.clone().to(...args);
    }
    toAngle(radian, magnitude, anchorFromPt = false) {
        let m = (magnitude != undefined) ? magnitude : this.magnitude();
        let change = [Math.cos(radian) * m, Math.sin(radian) * m];
        return (anchorFromPt) ? this.add(change) : this.to(change);
    }
    op(fn) {
        let self = this;
        return (...params) => {
            return fn(self, ...params);
        };
    }
    ops(fns) {
        let _ops = [];
        for (let i = 0, len = fns.length; i < len; i++) {
            _ops.push(this.op(fns[i]));
        }
        return _ops;
    }
    $take(axis) {
        let p = [];
        for (let i = 0, len = axis.length; i < len; i++) {
            p.push(this[axis[i]] || 0);
        }
        return new Pt(p);
    }
    $concat(...args) {
        return new Pt(this.toArray().concat(Util.getArgs(args)));
    }
    add(...args) {
        (args.length === 1 && typeof args[0] == "number") ? Vec.add(this, args[0]) : Vec.add(this, Util.getArgs(args));
        return this;
    }
    $add(...args) { return this.clone().add(...args); }
    subtract(...args) {
        (args.length === 1 && typeof args[0] == "number") ? Vec.subtract(this, args[0]) : Vec.subtract(this, Util.getArgs(args));
        return this;
    }
    $subtract(...args) { return this.clone().subtract(...args); }
    multiply(...args) {
        (args.length === 1 && typeof args[0] == "number") ? Vec.multiply(this, args[0]) : Vec.multiply(this, Util.getArgs(args));
        return this;
    }
    $multiply(...args) { return this.clone().multiply(...args); }
    divide(...args) {
        (args.length === 1 && typeof args[0] == "number") ? Vec.divide(this, args[0]) : Vec.divide(this, Util.getArgs(args));
        return this;
    }
    $divide(...args) { return this.clone().divide(...args); }
    magnitudeSq() { return Vec.dot(this, this); }
    magnitude() { return Vec.magnitude(this); }
    unit(magnitude = undefined) {
        Vec.unit(this, magnitude);
        return this;
    }
    $unit(magnitude = undefined) { return this.clone().unit(magnitude); }
    dot(...args) { return Vec.dot(this, Util.getArgs(args)); }
    $cross2D(...args) { return Vec.cross2D(this, Util.getArgs(args)); }
    $cross(...args) { return Vec.cross(this, Util.getArgs(args)); }
    $project(...args) {
        return this.$multiply(this.dot(...args) / this.magnitudeSq());
    }
    projectScalar(...args) {
        return this.dot(...args) / this.magnitude();
    }
    abs() {
        Vec.abs(this);
        return this;
    }
    $abs() {
        return this.clone().abs();
    }
    floor() {
        Vec.floor(this);
        return this;
    }
    $floor() {
        return this.clone().floor();
    }
    ceil() {
        Vec.ceil(this);
        return this;
    }
    $ceil() {
        return this.clone().ceil();
    }
    round() {
        Vec.round(this);
        return this;
    }
    $round() {
        return this.clone().round();
    }
    minValue() {
        return Vec.min(this);
    }
    maxValue() {
        return Vec.max(this);
    }
    $min(...args) {
        let p = Util.getArgs(args);
        let m = this.clone();
        for (let i = 0, len = Math.min(this.length, p.length); i < len; i++) {
            m[i] = Math.min(this[i], p[i]);
        }
        return m;
    }
    $max(...args) {
        let p = Util.getArgs(args);
        let m = this.clone();
        for (let i = 0, len = Math.min(this.length, p.length); i < len; i++) {
            m[i] = Math.max(this[i], p[i]);
        }
        return m;
    }
    angle(axis = Const.xy) {
        return Math.atan2(this[axis[1]], this[axis[0]]);
    }
    angleBetween(p, axis = Const.xy) {
        return Geom.boundRadian(this.angle(axis)) - Geom.boundRadian(p.angle(axis));
    }
    scale(scale, anchor) {
        Geom.scale(this, scale, anchor || Pt.make(this.length, 0));
        return this;
    }
    rotate2D(angle, anchor, axis) {
        Geom.rotate2D(this, angle, anchor || Pt.make(this.length, 0), axis);
        return this;
    }
    shear2D(scale, anchor, axis) {
        Geom.shear2D(this, scale, anchor || Pt.make(this.length, 0), axis);
        return this;
    }
    reflect2D(line, axis) {
        Geom.reflect2D(this, line, axis);
        return this;
    }
    toString() {
        return `Pt(${this.join(", ")})`;
    }
    toArray() {
        return [].slice.call(this);
    }
    toGroup() {
        return new Group(Pt.make(this.length), this.clone());
    }
    toBound() {
        return new Bound(Pt.make(this.length), this.clone());
    }
}
export class Group extends Array {
    constructor(...args) {
        super(...args);
    }
    get id() { return this._id; }
    set id(s) { this._id = s; }
    get p1() { return this[0]; }
    get p2() { return this[1]; }
    get p3() { return this[2]; }
    get p4() { return this[3]; }
    get q1() { return this[this.length - 1]; }
    get q2() { return this[this.length - 2]; }
    get q3() { return this[this.length - 3]; }
    get q4() { return this[this.length - 4]; }
    clone() {
        let group = new Group();
        for (let i = 0, len = this.length; i < len; i++) {
            group.push(this[i].clone());
        }
        return group;
    }
    static fromArray(list) {
        let g = new Group();
        for (let li of list) {
            let p = (li instanceof Pt) ? li : new Pt(li);
            g.push(p);
        }
        return g;
    }
    static fromPtArray(list) {
        return Group.from(list);
    }
    split(chunkSize, stride, loopBack = false) {
        let sp = Util.split(this, chunkSize, stride, loopBack);
        return sp;
    }
    insert(pts, index = 0) {
        Group.prototype.splice.apply(this, [index, 0, ...pts]);
        return this;
    }
    remove(index = 0, count = 1) {
        let param = (index < 0) ? [index * -1 - 1, count] : [index, count];
        return Group.prototype.splice.apply(this, param);
    }
    segments(pts_per_segment = 2, stride = 1, loopBack = false) {
        return this.split(pts_per_segment, stride, loopBack);
    }
    lines() { return this.segments(2, 1); }
    centroid() {
        return Geom.centroid(this);
    }
    boundingBox() {
        return Geom.boundingBox(this);
    }
    anchorTo(ptOrIndex = 0) { Geom.anchor(this, ptOrIndex, "to"); }
    anchorFrom(ptOrIndex = 0) { Geom.anchor(this, ptOrIndex, "from"); }
    op(fn) {
        let self = this;
        return (...params) => {
            return fn(self, ...params);
        };
    }
    ops(fns) {
        let _ops = [];
        for (let i = 0, len = fns.length; i < len; i++) {
            _ops.push(this.op(fns[i]));
        }
        return _ops;
    }
    interpolate(t) {
        t = Num.clamp(t, 0, 1);
        let chunk = this.length - 1;
        let tc = 1 / (this.length - 1);
        let idx = Math.floor(t / tc);
        return Geom.interpolate(this[idx], this[Math.min(this.length - 1, idx + 1)], (t - idx * tc) * chunk);
    }
    moveBy(...args) {
        return this.add(...args);
    }
    moveTo(...args) {
        let d = new Pt(Util.getArgs(args)).subtract(this[0]);
        this.moveBy(d);
        return this;
    }
    scale(scale, anchor) {
        for (let i = 0, len = this.length; i < len; i++) {
            Geom.scale(this[i], scale, anchor || this[0]);
        }
        return this;
    }
    rotate2D(angle, anchor, axis) {
        for (let i = 0, len = this.length; i < len; i++) {
            Geom.rotate2D(this[i], angle, anchor || this[0], axis);
        }
        return this;
    }
    shear2D(scale, anchor, axis) {
        for (let i = 0, len = this.length; i < len; i++) {
            Geom.shear2D(this[i], scale, anchor || this[0], axis);
        }
        return this;
    }
    reflect2D(line, axis) {
        for (let i = 0, len = this.length; i < len; i++) {
            Geom.reflect2D(this[i], line, axis);
        }
        return this;
    }
    sortByDimension(dim, desc = false) {
        return this.sort((a, b) => (desc) ? b[dim] - a[dim] : a[dim] - b[dim]);
    }
    forEachPt(ptFn, ...args) {
        if (!this[0][ptFn]) {
            Util.warn(`${ptFn} is not a function of Pt`);
            return this;
        }
        for (let i = 0, len = this.length; i < len; i++) {
            this[i] = this[i][ptFn](...args);
        }
        return this;
    }
    add(...args) {
        return this.forEachPt("add", ...args);
    }
    subtract(...args) {
        return this.forEachPt("subtract", ...args);
    }
    multiply(...args) {
        return this.forEachPt("multiply", ...args);
    }
    divide(...args) {
        return this.forEachPt("divide", ...args);
    }
    $matrixAdd(g) {
        return Mat.add(this, g);
    }
    $matrixMultiply(g, transposed = false, elementwise = false) {
        return Mat.multiply(this, g, transposed, elementwise);
    }
    zipSlice(index, defaultValue = false) {
        return Mat.zipSlice(this, index, defaultValue);
    }
    $zip(defaultValue = undefined, useLongest = false) {
        return Mat.zip(this, defaultValue, useLongest);
    }
    toString() {
        return "Group[ " + this.reduce((p, c) => p + c.toString() + " ", "") + " ]";
    }
}
export class Bound extends Group {
    constructor(...args) {
        super(...args);
        this._center = new Pt();
        this._size = new Pt();
        this._topLeft = new Pt();
        this._bottomRight = new Pt();
        this._inited = false;
        this.init();
    }
    static fromBoundingRect(rect) {
        let b = new Bound(new Pt(rect.left || 0, rect.top || 0), new Pt(rect.right || 0, rect.bottom || 0));
        if (rect.width && rect.height)
            b.size = new Pt(rect.width, rect.height);
        return b;
    }
    static fromGroup(g) {
        let _g = Util.iterToArray(g);
        if (_g.length < 2)
            throw new Error("Cannot create a Bound from a group that has less than 2 Pt");
        return new Bound(_g[0], _g[_g.length - 1]);
    }
    init() {
        if (this.p1) {
            this._size = this.p1.clone();
            this._inited = true;
        }
        if (this.p1 && this.p2) {
            let a = this.p1;
            let b = this.p2;
            this.topLeft = a.$min(b);
            this._bottomRight = a.$max(b);
            this._updateSize();
            this._inited = true;
        }
    }
    clone() {
        return new Bound(this._topLeft.clone(), this._bottomRight.clone());
    }
    _updateSize() {
        this._size = this._bottomRight.$subtract(this._topLeft).abs();
        this._updateCenter();
    }
    _updateCenter() {
        this._center = this._size.$multiply(0.5).add(this._topLeft);
    }
    _updatePosFromTop() {
        this._bottomRight = this._topLeft.$add(this._size);
        this._updateCenter();
    }
    _updatePosFromBottom() {
        this._topLeft = this._bottomRight.$subtract(this._size);
        this._updateCenter();
    }
    _updatePosFromCenter() {
        let half = this._size.$multiply(0.5);
        this._topLeft = this._center.$subtract(half);
        this._bottomRight = this._center.$add(half);
    }
    get size() { return new Pt(this._size); }
    set size(p) {
        this._size = new Pt(p);
        this._updatePosFromTop();
    }
    get center() { return new Pt(this._center); }
    set center(p) {
        this._center = new Pt(p);
        this._updatePosFromCenter();
    }
    get topLeft() { return new Pt(this._topLeft); }
    set topLeft(p) {
        this._topLeft = new Pt(p);
        this[0] = this._topLeft;
        this._updateSize();
    }
    get bottomRight() { return new Pt(this._bottomRight); }
    set bottomRight(p) {
        this._bottomRight = new Pt(p);
        this[1] = this._bottomRight;
        this._updateSize();
    }
    get width() { return (this._size.length > 0) ? this._size.x : 0; }
    set width(w) {
        this._size.x = w;
        this._updatePosFromTop();
    }
    get height() { return (this._size.length > 1) ? this._size.y : 0; }
    set height(h) {
        this._size.y = h;
        this._updatePosFromTop();
    }
    get depth() { return (this._size.length > 2) ? this._size.z : 0; }
    set depth(d) {
        this._size.z = d;
        this._updatePosFromTop();
    }
    get x() { return this.topLeft.x; }
    get y() { return this.topLeft.y; }
    get z() { return this.topLeft.z; }
    get inited() { return this._inited; }
    update() {
        this._topLeft = this[0];
        this._bottomRight = this[1];
        this._updateSize();
        return this;
    }
}
//# sourceMappingURL=Pt.js.map