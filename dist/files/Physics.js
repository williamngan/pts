"use strict";
// Source code licensed under Apache License 2.0.
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)
Object.defineProperty(exports, "__esModule", { value: true });
const Pt_1 = require("./Pt");
const Bound_1 = require("./Bound");
const Op_1 = require("./Op");
/**
 * A `World` stores and manages `Body` and `Particle` for 2D physics simulation
 */
class World {
    /**
     * Create a `World` for 2D physics simulation
     * @param bound a rectangular bounding box defined by a Group
     * @param friction a value between 0 to 1 where 1 means no friction. Default is 1
     * @param gravity a number of a Pt to define gravitational force. Using a number is a shorthand to set `new Pt(0, n)`. Default is 0.
     */
    constructor(bound, friction = 1, gravity = 0) {
        this._lastTime = null;
        this._gravity = new Pt_1.Pt();
        this._friction = 1; // general friction
        this._damping = 0.75; // collision damping
        this._particles = [];
        this._bodies = [];
        this._names = { p: {}, b: {} };
        this._bound = Bound_1.Bound.fromGroup(bound);
        this._friction = friction;
        this._gravity = (typeof gravity === "number") ? new Pt_1.Pt(0, gravity) : new Pt_1.Pt(gravity);
        return this;
    }
    get gravity() { return this._gravity; }
    set gravity(g) { this._gravity = g; }
    get friction() { return this._friction; }
    set friction(f) { this._friction = f; }
    get damping() { return this._damping; }
    set damping(f) { this._damping = f; }
    /**
     * Get the number of bodies
     */
    get bodyCount() { return this._bodies.length; }
    /**
     * Get the number of particles
     */
    get particleCount() { return this._particles.length; }
    /**
     * Get a body in this world by index or string id
     * @param id numeric index of the body, or a string id that associates with it.
     */
    body(id) { return this._bodies[(typeof id === "string") ? this._names.b[id] : id]; }
    /**
     * Get a particle in this world by index or string id
     * @param id numeric index of the particle, or a string id that associates with it.
     */
    particle(id) { return this._particles[(typeof id === "string") ? this._names.p[id] : id]; }
    /**
     * Update this world one time step
     * @param ms change in time in milliseconds
     */
    update(ms) {
        let dt = ms / 1000;
        this._updateParticles(dt);
        this._updateBodies(dt);
    }
    /**
     * Draw particles using the provided function
     * @param fn a function that draws particles passed in the parameters `(particles, index)`.
     */
    drawParticles(fn) {
        this._drawParticles = fn;
    }
    /**
     * Draw bodies using the provided function
     * @param fn a function that draws bodies passed in the parameters `(bodies, index)`.
     */
    drawBodies(fn) {
        this._drawBodies = fn;
    }
    /**
     * Add a particle or body to this world.
     * @param p `Particle` or `Body` instance
     * @param name optional name, which can be referenced in `body()` or `particle()` function to retrieve this back.
     */
    add(p, name) {
        if (p instanceof Body) {
            this._bodies.push(p);
            if (name)
                this._names.b[name] = this._bodies.length - 1;
        }
        else {
            this._particles.push(p);
            if (name)
                this._names.p[name] = this._particles.length - 1;
        }
        return this;
    }
    /**
     * Remove either body or particle from this world. Support removing a range and negative index.
     * @param which Either "body" or "particle"
     * @param index Start index, which can be negative (where -1 is at index 0, -2 at index 1, etc)
     * @param count Number of items to remove. Default is 1.
     */
    remove(which, index, count = 1) {
        let param = (index < 0) ? [index * -1 - 1, count] : [index, count];
        if (which == "body") {
            this._bodies.splice(param[0], param[1]);
        }
        else {
            this._particles.splice(param[0], param[1]);
        }
        return this;
    }
    /**
     * Static function to calculate edge constraints between 2 particles.
     * @param p1 particle 1
     * @param p2 particle 1
     * @param dist distance between particles
     * @param stiff stiffness between 0 to 1.
     * @param precise use precise distance calculation. Default is `false`.
     */
    static edgeConstraint(p1, p2, dist, stiff = 1, precise = false) {
        const m1 = 1 / (p1.mass || 1);
        const m2 = 1 / (p2.mass || 1);
        const mm = m1 + m2;
        let delta = p2.$subtract(p1);
        let distSq = dist * dist;
        let d = (precise) ? (dist / delta.magnitude() - 1) : (distSq / (delta.dot(delta) + distSq) - 0.5); // approx square root
        let f = delta.$multiply(d * stiff);
        p1.subtract(f.$multiply(m1 / mm));
        p2.add(f.$multiply(m2 / mm));
        return p1;
    }
    /**
     * Static function to calculate bounding box constraints.
     * @param p particle
     * @param rect bounding box defined by a Group
     * @param damping damping between 0 to 1, where 1 means no damping. Default is 0.75.
     */
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
    /**
     * Internal integrate function
     * @param p particle
     * @param dt time changed
     * @param prevDt previous change in time, optional
     */
    integrate(p, dt, prevDt) {
        p.addForce(this._gravity);
        p.verlet(dt, this._friction, prevDt);
        return p;
    }
    /**
     * Internal function to update particles
     */
    _updateParticles(dt) {
        for (let i = 0, len = this._particles.length; i < len; i++) {
            let p = this._particles[i];
            // force and integrate
            this.integrate(p, dt, this._lastTime);
            // constraints
            World.boundConstraint(p, this._bound, this._damping);
            // collisions
            for (let k = i + 1; k < len; k++) {
                if (i !== k) {
                    let p2 = this._particles[k];
                    p.collide(p2, this._damping);
                }
            }
            // render
            if (this._drawParticles)
                this._drawParticles(p, i);
        }
        this._lastTime = dt;
    }
    /**
     * Internal function to update bodies
     */
    _updateBodies(dt) {
        for (let i = 0, len = this._bodies.length; i < len; i++) {
            let b = this._bodies[i];
            // integrate
            for (let k = 0, klen = b.length; k < klen; k++) {
                let bk = b[k];
                World.boundConstraint(bk, this._bound, this._damping);
                this.integrate(bk, dt, this._lastTime);
            }
            for (let k = i + 1; k < len; k++) {
                b.processBody(this._bodies[k]);
            }
            for (let m = 0, mlen = this._particles.length; m < mlen; m++) {
                b.processParticle(this._particles[m]);
            }
            // constraints
            b.processEdges();
            // render
            if (this._drawBodies)
                this._drawBodies(b, i);
        }
    }
}
exports.World = World;
/**
 * Particle is a Pt that has radius and mass. It's usually added into `World` to create physics simulations.
 */
class Particle extends Pt_1.Pt {
    /**
     * Create a particle
     * @param args a list of numeric parameters, an array of numbers, or an object with {x,y,z,w} properties
     */
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
    /**
     * Get previous position
     */
    get previous() { return this._prev; }
    set previous(p) { this._prev = p; }
    /**
     * Get current accumulated force
     */
    get force() { return this._force; }
    set force(g) { this._force = g; }
    /**
     * Get the body of this particle, if any.
     */
    get body() { return this._body; }
    set body(b) { this._body = b; }
    /**
     *
     */
    get lock() { return this._lock; }
    set lock(b) {
        this._lock = b;
        this._lockPt = new Pt_1.Pt(this);
    }
    /**
     * Get the change in position since last time step
     */
    get changed() { return this.$subtract(this._prev); }
    /**
     * Set a new position, and update previous and lock states if needed.
     */
    set position(p) {
        this.previous.to(this);
        if (this._lock)
            this._lockPt = p;
        this.to(p);
    }
    /**
     * Set the size of this particle. This sets both the radius and the mass.
     * @param r `radius` value, and also set `mass` to the same value.
     */
    size(r) {
        this._mass = r;
        this._radius = r;
        return this;
    }
    /**
     * Add to the accumulated force
     * @param args a list of numeric parameters, an array of numbers, or an object with {x,y,z,w} properties
     */
    addForce(...args) {
        this._force.add(...args);
        return this._force;
    }
    /**
     * Verlet integration
     * @param dt change in time
     * @param friction friction from 0 to 1, where 1 means no friction
     * @param lastDt optional last change in time
     */
    verlet(dt, friction, lastDt) {
        // Positional verlet: curr + (curr - prev) + a * dt * dt
        if (this._lock) {
            this.to(this._lockPt);
            // this._prev.to( this._lockPt );
        }
        else {
            // time corrected (https://en.wikipedia.org/wiki/Verlet_integration#Non-constant_time_differences)
            let lt = (lastDt) ? lastDt : dt;
            let a = this._force.multiply(dt * (dt + lt) / 2);
            let v = this.changed.multiply(friction * dt / lt).add(a);
            this._prev = this.clone();
            this.add(v);
            this._force = new Pt_1.Pt();
        }
        return this;
    }
    /**
     * Hit this particle with an impulse
     * @param args a list of numeric parameters, an array of numbers, or an object with {x,y,z,w} properties
     * @example `hit(10, 20)`, `hit( new Pt(5, 9) )`
     */
    hit(...args) {
        this._prev.subtract(new Pt_1.Pt(...args).$divide(Math.sqrt(this._mass)));
        return this;
    }
    /**
     * Check and respoond to collisions between two particles
     * @param p2 another particle
     * @param damp damping value between 0 to 1, where 1 means no damping.
     */
    collide(p2, damp = 1) {
        // reference: http://codeflow.org/entries/2010/nov/29/verlet-collision-with-impulse-preservation
        // simultaneous collision not yet resolved. Possible solutions in this paper: https://www2.msm.ctw.utwente.nl/sluding/PAPERS/dem07.pdf 
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
/**
 * Body consists of a group of `Particles` and edge constraints. It is usually added into a `World` to create physics simulations
 */
class Body extends Pt_1.Group {
    /**
     * Create an empty Body, this is usually followed by `init` to populate the Body. Alternatively, use static function `fromGroup` to create and initate a body directly.
     */
    constructor() {
        super();
        this._cs = [];
        this._stiff = 1;
        this._locks = {};
        this._mass = 1;
    }
    /**
     * Create and populate a body with a group of Pts.
     * @param list a group of Pts
     * @param stiff stiffness value from 0 to 1, where 1 is the most stiff. Default is 1.
     * @param autoLink Automatically create links between the Pts. This usually works for regular convex polygons. Default is true.
     * @param autoMass Automatically calculate the mass based on the area of the polygon. Default is true.
     */
    static fromGroup(list, stiff = 1, autoLink = true, autoMass = true) {
        let b = new Body().init(list);
        if (autoLink)
            b.linkAll(stiff);
        if (autoMass)
            b.autoMass();
        return b;
    }
    /**
     * Initiate a body
     * @param list a group of Pts
     * @param stiff stiffness value from 0 to 1, where 1 is the most stiff. Default is 1.
     */
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
    /**
     * Get mass of this body.
     */
    get mass() { return this._mass; }
    set mass(m) {
        this._mass = m;
        for (let i = 0, len = this.length; i < len; i++) {
            this[i].mass = this._mass;
        }
    }
    /**
     * Automatically calculate `mass` to body's polygon area.
     */
    autoMass() {
        this.mass = Math.sqrt(Op_1.Polygon.area(this)) / 10;
        return this;
    }
    /**
     * Create a linked edge between two points
     * @param index1 first point by index
     * @param index2 first point by index
     * @param stiff optionally stiffness value between 0 to 1, where 1 is the most stiff.
     */
    link(index1, index2, stiff) {
        if (index1 < 0 || index1 >= this.length)
            throw new Error("index1 is not in the Group's indices");
        if (index2 < 0 || index2 >= this.length)
            throw new Error("index1 is not in the Group's indices");
        let d = this[index1].$subtract(this[index2]).magnitude();
        this._cs.push([index1, index2, d, stiff || this._stiff]);
        return this;
    }
    /**
     * Automatically create links for all the points to preserve the initial body shape. This usually works for regular convex polygon.
     * @param stiff optionally stiffness value between 0 to 1, where 1 is the most stiff.
     */
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
    /**
     * Return a list of all the linked edges as line segments.
     * @returns an array of Groups, each of which represents an edge
     */
    linksToLines() {
        let gs = [];
        for (let i = 0, len = this._cs.length; i < len; i++) {
            let ln = this._cs[i];
            gs.push(new Pt_1.Group(this[ln[0]], this[ln[1]]));
        }
        return gs;
    }
    /**
     * Recalculate all edge constraints
     */
    processEdges() {
        for (let i = 0, len = this._cs.length; i < len; i++) {
            let [m, n, d, s] = this._cs[i];
            World.edgeConstraint(this[m], this[n], d, s);
        }
    }
    /**
     * Check and respond to collisions between two bodies
     * @param b another body
     */
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
    /**
     * Check and respond to collisions between this body and a particle
     * @param b a particle
     */
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
            // let c2 = b2.changed.add( cv.$multiply(mr0) );
            // b2.previous = b2.$subtract( c2 );
        }
    }
}
exports.Body = Body;
//# sourceMappingURL=Physics.js.map