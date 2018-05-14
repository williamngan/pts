"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Pt_1 = require("./Pt");
class Bound extends Pt_1.Group {
    constructor(...args) {
        super(...args);
        this._center = new Pt_1.Pt();
        this._size = new Pt_1.Pt();
        this._topLeft = new Pt_1.Pt();
        this._bottomRight = new Pt_1.Pt();
        this._inited = false;
        this.init();
    }
    static fromBoundingRect(rect) {
        let b = new Bound(new Pt_1.Pt(rect.left || 0, rect.top || 0), new Pt_1.Pt(rect.right || 0, rect.bottom || 0));
        if (rect.width && rect.height)
            b.size = new Pt_1.Pt(rect.width, rect.height);
        return b;
    }
    static fromGroup(g) {
        if (g.length < 2)
            throw new Error("Cannot create a Bound from a group that has less than 2 Pt");
        return new Bound(g[0], g[g.length - 1]);
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
    get size() { return new Pt_1.Pt(this._size); }
    set size(p) {
        this._size = new Pt_1.Pt(p);
        this._updatePosFromTop();
    }
    get center() { return new Pt_1.Pt(this._center); }
    set center(p) {
        this._center = new Pt_1.Pt(p);
        this._updatePosFromCenter();
    }
    get topLeft() { return new Pt_1.Pt(this._topLeft); }
    set topLeft(p) {
        this._topLeft = new Pt_1.Pt(p);
        this[0] = this._topLeft;
        this._updateSize();
    }
    get bottomRight() { return new Pt_1.Pt(this._bottomRight); }
    set bottomRight(p) {
        this._bottomRight = new Pt_1.Pt(p);
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
exports.Bound = Bound;
//# sourceMappingURL=Bound.js.map