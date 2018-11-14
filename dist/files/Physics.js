"use strict";
/*! Source code licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */
Object.defineProperty(exports, "__esModule", { value: true });
const Pt_1 = require("./Pt");
const Op_1 = require("./Op");
class World {
    constructor(bound, friction = 1, gravity = 0) {
        this._lastTime = null;
        this._gravity = new Pt_1.Pt();
        this._friction = 1;
        this._damping = 0.75;
        this._particles = [];
        this._bodies = [];
        this._pnames = [];
        this._bnames = [];
        this._bound = Pt_1.Bound.fromGroup(bound);
        this._friction = friction;
        this._gravity = (typeof gravity === "number") ? new Pt_1.Pt(0, gravity) : new Pt_1.Pt(gravity);
        return this;
    }
    get bound() { return this._bound; }
    set bound(bound) { this._bound = bound; }
    get gravity() { return this._gravity; }
    set gravity(g) { this._gravity = g; }
    get friction() { return this._friction; }
    set friction(f) { this._friction = f; }
    get damping() { return this._damping; }
    set damping(f) { this._damping = f; }
    get bodyCount() { return this._bodies.length; }
    get particleCount() { return this._particles.length; }
    body(id) {
        let idx = id;
        if (typeof id === "string" && id.length > 0) {
            idx = this._bnames.indexOf(id);
        }
        if (!(idx >= 0))
            return undefined;
        return this._bodies[idx];
    }
    particle(id) {
        let idx = id;
        if (typeof id === "string" && id.length > 0) {
            idx = this._pnames.indexOf(id);
        }
        if (!(idx >= 0))
            return undefined;
        return this._particles[idx];
    }
    bodyIndex(name) {
        return this._bnames.indexOf(name);
    }
    particleIndex(name) {
        return this._pnames.indexOf(name);
    }
    update(ms) {
        let dt = ms / 1000;
        this._updateParticles(dt);
        this._updateBodies(dt);
    }
    drawParticles(fn) {
        this._drawParticles = fn;
    }
    drawBodies(fn) {
        this._drawBodies = fn;
    }
    add(p, name = '') {
        if (p instanceof Body) {
            this._bodies.push(p);
            this._bnames.push(name);
        }
        else {
            this._particles.push(p);
            this._pnames.push(name);
        }
        return this;
    }
    _index(fn, id) {
        let index = 0;
        if (typeof id === "string") {
            index = fn(id);
            if (index < 0)
                throw new Error(`Cannot find index of ${id}. You can use particleIndex() or bodyIndex() function to check existence by name.`);
        }
        else {
            index = id;
        }
        return index;
    }
    removeBody(from, count = 1) {
        const index = this._index(this.bodyIndex.bind(this), from);
        const param = (index < 0) ? [index * -1 - 1, count] : [index, count];
        this._bodies.splice(param[0], param[1]);
        this._bnames.splice(param[0], param[1]);
        return this;
    }
    removeParticle(from, count = 1) {
        const index = this._index(this.particleIndex.bind(this), from);
        const param = (index < 0) ? [index * -1 - 1, count] : [index, count];
        this._particles.splice(param[0], param[1]);
        this._pnames.splice(param[0], param[1]);
        return this;
    }
    static edgeConstraint(p1, p2, dist, stiff = 1, precise = false) {
        const m1 = 1 / (p1.mass || 1);
        const m2 = 1 / (p2.mass || 1);
        const mm = m1 + m2;
        let delta = p2.$subtract(p1);
        let distSq = dist * dist;
        let d = (precise) ? (dist / delta.magnitude() - 1) : (distSq / (delta.dot(delta) + distSq) - 0.5);
        let f = delta.$multiply(d * stiff);
        p1.subtract(f.$multiply(m1 / mm));
        p2.add(f.$multiply(m2 / mm));
        return p1;
    }
    static boundConstraint(p, rect, damping = 0.75) {
        let bound = rect.boundingBox();
        let np = p.$min(bound[1].subtract(p.radius)).$max(bound[0].add(p.radius));
        if (np[0] === bound[0][0] || np[0] === bound[1][0]) {
            let c = p.changed.$multiply(damping);
            p.previous = np.$subtract(new Pt_1.Pt(-c[0], c[1]));
        }
        else if (np[1] === bound[0][1] || np[1] === bound[1][1]) {
            let c = p.changed.$multiply(damping);
            p.previous = np.$subtract(new Pt_1.Pt(c[0], -c[1]));
        }
        p.to(np);
    }
    integrate(p, dt, prevDt) {
        p.addForce(this._gravity);
        p.verlet(dt, this._friction, prevDt);
        return p;
    }
    _updateParticles(dt) {
        for (let i = 0, len = this._particles.length; i < len; i++) {
            let p = this._particles[i];
            this.integrate(p, dt, this._lastTime);
            World.boundConstraint(p, this._bound, this._damping);
            for (let k = i + 1; k < len; k++) {
                if (i !== k) {
                    let p2 = this._particles[k];
                    p.collide(p2, this._damping);
                }
            }
            if (this._drawParticles)
                this._drawParticles(p, i);
        }
        this._lastTime = dt;
    }
    _updateBodies(dt) {
        for (let i = 0, len = this._bodies.length; i < len; i++) {
            let bds = this._bodies[i];
            if (bds) {
                for (let k = 0, klen = bds.length; k < klen; k++) {
                    let bk = bds[k];
                    World.boundConstraint(bk, this._bound, this._damping);
                    this.integrate(bk, dt, this._lastTime);
                }
                for (let k = i + 1; k < len; k++) {
                    bds.processBody(this._bodies[k]);
                }
                for (let m = 0, mlen = this._particles.length; m < mlen; m++) {
                    bds.processParticle(this._particles[m]);
                }
                bds.processEdges();
                if (this._drawBodies)
                    this._drawBodies(bds, i);
            }
        }
    }
}
exports.World = World;
class Particle extends Pt_1.Pt {
    constructor(...args) {
        super(...args);
        this._mass = 1;
        this._radius = 0;
        this._force = new Pt_1.Pt();
        this._prev = new Pt_1.Pt();
        this._lock = false;
        this._prev = this.clone();
    }
    get mass() { return this._mass; }
    set mass(m) { this._mass = m; }
    get radius() { return this._radius; }
    set radius(f) { this._radius = f; }
    get previous() { return this._prev; }
    set previous(p) { this._prev = p; }
    get force() { return this._force; }
    set force(g) { this._force = g; }
    get body() { return this._body; }
    set body(b) { this._body = b; }
    get lock() { return this._lock; }
    set lock(b) {
        this._lock = b;
        this._lockPt = new Pt_1.Pt(this);
    }
    get changed() { return this.$subtract(this._prev); }
    set position(p) {
        this.previous.to(this);
        if (this._lock)
            this._lockPt = p;
        this.to(p);
    }
    size(r) {
        this._mass = r;
        this._radius = r;
        return this;
    }
    addForce(...args) {
        this._force.add(...args);
        return this._force;
    }
    verlet(dt, friction, lastDt) {
        if (this._lock) {
            this.to(this._lockPt);
        }
        else {
            let lt = (lastDt) ? lastDt : dt;
            let a = this._force.multiply(dt * (dt + lt) / 2);
            let v = this.changed.multiply(friction * dt / lt).add(a);
            this._prev = this.clone();
            this.add(v);
            this._force = new Pt_1.Pt();
        }
        return this;
    }
    hit(...args) {
        this._prev.subtract(new Pt_1.Pt(...args).$divide(Math.sqrt(this._mass)));
        return this;
    }
    collide(p2, damp = 1) {
        let p1 = this;
        let dp = p1.$subtract(p2);
        let distSq = dp.magnitudeSq();
        let dr = p1.radius + p2.radius;
        if (distSq < dr * dr) {
            let c1 = p1.changed;
            let c2 = p2.changed;
            let dist = Math.sqrt(distSq);
            let d = dp.$multiply(((dist - dr) / dist) / 2);
            let np1 = p1.$subtract(d);
            let np2 = p2.$add(d);
            p1.to(np1);
            p2.to(np2);
            let f1 = damp * dp.dot(c1) / distSq;
            let f2 = damp * dp.dot(c2) / distSq;
            let dm1 = p1.mass / (p1.mass + p2.mass);
            let dm2 = p2.mass / (p1.mass + p2.mass);
            c1.add(new Pt_1.Pt(f2 * dp[0] - f1 * dp[0], f2 * dp[1] - f1 * dp[1]).$multiply(dm2));
            c2.add(new Pt_1.Pt(f1 * dp[0] - f2 * dp[0], f1 * dp[1] - f2 * dp[1]).$multiply(dm1));
            p1.previous = p1.$subtract(c1);
            p2.previous = p2.$subtract(c2);
        }
    }
    toString() {
        return `Particle: ${this[0]} ${this[1]} | previous ${this._prev[0]} ${this._prev[1]} | mass ${this._mass}`;
    }
}
exports.Particle = Particle;
class Body extends Pt_1.Group {
    constructor() {
        super();
        this._cs = [];
        this._stiff = 1;
        this._locks = {};
        this._mass = 1;
    }
    static fromGroup(list, stiff = 1, autoLink = true, autoMass = true) {
        let b = new Body().init(list);
        if (autoLink)
            b.linkAll(stiff);
        if (autoMass)
            b.autoMass();
        return b;
    }
    init(list, stiff = 1) {
        let c = new Pt_1.Pt();
        for (let i = 0, len = list.length; i < len; i++) {
            let p = new Particle(list[i]);
            p.body = this;
            c.add(list[i]);
            this.push(p);
        }
        this._stiff = stiff;
        return this;
    }
    get mass() { return this._mass; }
    set mass(m) {
        this._mass = m;
        for (let i = 0, len = this.length; i < len; i++) {
            this[i].mass = this._mass;
        }
    }
    autoMass() {
        this.mass = Math.sqrt(Op_1.Polygon.area(this)) / 10;
        return this;
    }
    link(index1, index2, stiff) {
        if (index1 < 0 || index1 >= this.length)
            throw new Error("index1 is not in the Group's indices");
        if (index2 < 0 || index2 >= this.length)
            throw new Error("index1 is not in the Group's indices");
        let d = this[index1].$subtract(this[index2]).magnitude();
        this._cs.push([index1, index2, d, stiff || this._stiff]);
        return this;
    }
    linkAll(stiff) {
        let half = this.length / 2;
        for (let i = 0, len = this.length; i < len; i++) {
            let n = (i >= len - 1) ? 0 : i + 1;
            this.link(i, n, stiff);
            if (len > 4) {
                let nd = (Math.floor(half / 2)) + 1;
                let n2 = (i >= len - nd) ? i % len : i + nd;
                this.link(i, n2, stiff);
            }
            if (i <= half - 1) {
                this.link(i, Math.min(this.length - 1, i + Math.floor(half)));
            }
        }
    }
    linksToLines() {
        let gs = [];
        for (let i = 0, len = this._cs.length; i < len; i++) {
            let ln = this._cs[i];
            gs.push(new Pt_1.Group(this[ln[0]], this[ln[1]]));
        }
        return gs;
    }
    processEdges() {
        for (let i = 0, len = this._cs.length; i < len; i++) {
            let [m, n, d, s] = this._cs[i];
            World.edgeConstraint(this[m], this[n], d, s);
        }
    }
    processBody(b) {
        let b1 = this;
        let b2 = b;
        let hit = Op_1.Polygon.hasIntersectPolygon(b1, b2);
        if (hit) {
            let cv = hit.normal.$multiply(hit.dist);
            let t;
            let eg = hit.edge;
            if (Math.abs(eg[0][0] - eg[1][0]) > Math.abs(eg[0][1] - eg[1][1])) {
                t = (hit.vertex[0] - cv[0] - eg[0][0]) / (eg[1][0] - eg[0][0]);
            }
            else {
                t = (hit.vertex[1] - cv[1] - eg[0][1]) / (eg[1][1] - eg[0][1]);
            }
            let lambda = 1 / (t * t + (1 - t) * (1 - t));
            let m0 = hit.vertex.body.mass || 1;
            let m1 = hit.edge[0].body.mass || 1;
            let mr0 = m0 / (m0 + m1);
            let mr1 = m1 / (m0 + m1);
            eg[0].subtract(cv.$multiply(mr0 * (1 - t) * lambda / 2));
            eg[1].subtract(cv.$multiply(mr0 * t * lambda / 2));
            hit.vertex.add(cv.$multiply(mr1));
        }
    }
    processParticle(b) {
        let b1 = this;
        let b2 = b;
        let hit = Op_1.Polygon.hasIntersectCircle(b1, Op_1.Circle.fromCenter(b, b.radius));
        if (hit) {
            let cv = hit.normal.$multiply(hit.dist);
            let t;
            let eg = hit.edge;
            if (Math.abs(eg[0][0] - eg[1][0]) > Math.abs(eg[0][1] - eg[1][1])) {
                t = (hit.vertex[0] - cv[0] - eg[0][0]) / (eg[1][0] - eg[0][0]);
            }
            else {
                t = (hit.vertex[1] - cv[1] - eg[0][1]) / (eg[1][1] - eg[0][1]);
            }
            let lambda = 1 / (t * t + (1 - t) * (1 - t));
            let m0 = hit.vertex.mass || b2.mass || 1;
            let m1 = hit.edge[0].body.mass || 1;
            let mr0 = m0 / (m0 + m1);
            let mr1 = m1 / (m0 + m1);
            eg[0].subtract(cv.$multiply(mr0 * (1 - t) * lambda / 2));
            eg[1].subtract(cv.$multiply(mr0 * t * lambda / 2));
            let c1 = b.changed.add(cv.$multiply(mr1));
            b.previous = b.$subtract(c1);
        }
    }
}
exports.Body = Body;
//# sourceMappingURL=Physics.js.map