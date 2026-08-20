/*! Pts.js is licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */

import { Pt, Group, Bound } from "./Pt";
import { Polygon, Circle } from "./Op";
import { Geom } from "./Num";
import { PtLike, PtIterable } from "./Types";

/**
 * A `World` stores and manages [`Body`](#link) and [`Particle`](#link) for 2D physics simulation.
 * It advances with a substepped position-based (XPBD-style) solver and a spatial-hash broad phase.
 * See a [Particle demo](../demo/index.html?name=physics.particles) and a [Body demo](../demo/index.html?name=physics.shapes) on the demo page.
 */
export class World {
  protected _gravity: Pt = new Pt();
  protected _friction: number = 1; // general friction
  protected _damping: number = 0.75; // collision damping
  protected _iterations: number = 1; // constraint iterations per substep
  protected _substeps: number = 4; // solver substeps per update
  protected _maxTimeStep: number = 50; // clamp on ms per update
  protected _bound: Bound;

  protected _particles: Particle[] = [];
  protected _bodies: Body[] = [];
  protected _pnames: string[] = []; // particle name index
  protected _bnames: string[] = []; // body name index

  protected _drawParticles: (p: Particle, i: number) => void;
  protected _drawBodies: (p: Body, i: number) => void;

  // substep-adjusted friction, computed once per update
  private _frictionStep: number = 1;

  // spatial-hash and AABB scratch buffers, grown geometrically and reused
  private _hashKeys: Uint32Array = new Uint32Array(0);
  private _cellStart: Uint32Array = new Uint32Array(0);
  private _cellEntries: Uint32Array = new Uint32Array(0);
  private _neighborKeys: Uint32Array = new Uint32Array(9);
  private _bodyBounds: Float32Array = new Float32Array(0);

  /**
   * Create a `World` for 2D physics simulation.
   * @param bound a Group or an Iterable<Pt> representing a rectangular bounding box
   * @param friction a value between 0 to 1, where 1 means no friction. Default is 1
   * @param gravity a number of a Pt to define gravitational force. A number is a shorthand to set `new Pt(0, n)`. Default is 0.
   */
  constructor(
    bound: PtIterable,
    friction: number = 1,
    gravity: PtLike | number = 0,
  ) {
    this._bound = Bound.fromGroup(bound);
    this._friction = friction;
    this._gravity =
      typeof gravity === "number" ? new Pt(0, gravity) : new Pt(gravity);
    return this;
  }

  /**
   * Current bound in this `World`.
   */
  get bound(): Bound {
    return this._bound;
  }
  set bound(bound: Bound) {
    this._bound = bound;
  }

  /**
   * Current gravity in this `World`.
   */
  get gravity(): Pt {
    return this._gravity;
  }
  set gravity(g: Pt) {
    this._gravity = g;
  }

  /**
   * Current friction in this `World`.
   */
  get friction(): number {
    return this._friction;
  }
  set friction(f: number) {
    this._friction = f;
  }

  /**
   * Current damping in this `World`.
   */
  get damping(): number {
    return this._damping;
  }
  set damping(f: number) {
    this._damping = f;
  }

  /**
   * Constraint solver iterations per substep.
   */
  get iterations(): number {
    return this._iterations;
  }
  set iterations(f: number) {
    this._iterations = f;
  }

  /**
   * Number of solver substeps per [`World.update`](#link) call. More substeps produce a more
   * stable and accurate simulation at a linear cost. Default is 4.
   */
  get substeps(): number {
    return this._substeps;
  }
  set substeps(n: number) {
    this._substeps = Math.max(1, Math.round(n));
  }

  /**
   * Maximum simulated time in milliseconds per [`World.update`](#link) call. Larger elapsed
   * times are clamped so that a hitch (eg, a backgrounded tab) cannot destabilize the
   * simulation. Default is 50.
   */
  get maxTimeStep(): number {
    return this._maxTimeStep;
  }
  set maxTimeStep(ms: number) {
    this._maxTimeStep = Math.max(0, ms);
  }

  /**
   * Get the number of bodies.
   */
  get bodyCount(): number {
    return this._bodies.length;
  }

  /**
   * Get the number of particles.
   */
  get particleCount(): number {
    return this._particles.length;
  }

  /**
   * Get a body in this world by index or string id.
   * @param id numeric index of the body, or a string id that associates with it.
   * @returns a Body, or undefined if not found
   */
  body(id: number | string) {
    if (typeof id === "string" && id.length > 0) {
      return this._bodies[this._bnames.indexOf(id)];
    }
    return typeof id === "number" && id >= 0 ? this._bodies[id] : undefined;
  }

  /**
   * Get a particle in this world by index or string id.
   * @param id numeric index of the particle, or a string id that associates with it.
   * @returns a Particle, or undefined if not found
   */
  particle(id: number | string) {
    if (typeof id === "string" && id.length > 0) {
      return this._particles[this._pnames.indexOf(id)];
    }
    return typeof id === "number" && id >= 0 ? this._particles[id] : undefined;
  }

  /**
   * Given a body's name, return its index in the bodies array, or -1 if not found.
   * @param name name of the body
   * @returns index number, or -1 if not found
   */
  bodyIndex(name: string): number {
    return this._bnames.indexOf(name);
  }

  /**
   * Given a particle's name, return its index in the particles array, or -1 if not found.
   * @param name name of the particle
   * @returns index number, or -1 if not found
   */
  particleIndex(name: string): number {
    return this._pnames.indexOf(name);
  }

  /**
   * Advance this world by an amount of time, solved in [`World.substeps`](#link) substeps.
   * The time is clamped to [`World.maxTimeStep`](#link). Draw callbacks fire once per call,
   * after the solve completes.
   * @param ms change in time in milliseconds
   */
  update(ms: number) {
    const clamped = Math.min(ms, this._maxTimeStep);
    if (clamped > 0) {
      const n = this._substeps;
      const h = clamped / 1000 / n;
      // friction is a per-update drag; compound it across substeps
      this._frictionStep =
        n === 1 ? this._friction : Math.pow(this._friction, 1 / n);
      for (let s = 0; s < n; s++) {
        this._updateParticles(h);
        // Body contacts resolve every substep: penetrations are detected while
        // still shallow, and each positional push stays at the scale of one
        // substep's motion — resolving once per update would inject the whole
        // frame's correction at substep velocity, kicking bodies 4× harder than
        // intended. The scalarized SAT makes the extra narrow-phase passes cheap.
        this._updateBodies(h);
      }
      this._clearForces();
    }

    if (this._drawParticles) {
      for (let i = 0, len = this._particles.length; i < len; i++) {
        this._drawParticles(this._particles[i], i);
      }
    }
    if (this._drawBodies) {
      for (let i = 0, len = this._bodies.length; i < len; i++) {
        this._drawBodies(this._bodies[i], i);
      }
    }
  }

  /**
   * Draw particles using the provided function.
   * @param fn a function that draws a particle passed in the parameters `(particle, index)`.
   */
  drawParticles(fn: (p: Particle, i: number) => void): void {
    this._drawParticles = fn;
  }

  /**
   * Draw bodies using the provided function.
   * @param fn a function that draws a body passed in the parameters `(body, index)`.
   */
  drawBodies(fn: (p: Body, i: number) => void): void {
    this._drawBodies = fn;
  }

  /**
   * Add a particle or body to this world.
   * @param p `Particle` or `Body` instance
   * @param name optional name, which can be referenced in `body()` or `particle()` function to retrieve this back.
   */
  add(p: Particle | Body, name: string = ""): this {
    if (p instanceof Body) {
      this._bodies.push(<Body>p);
      this._bnames.push(name);
    } else {
      this._particles.push(<Particle>p);
      this._pnames.push(name);
    }
    return this;
  }

  private _index(fn: (string) => number, id: string | number): number {
    let index = 0;
    if (typeof id === "string") {
      index = fn(id);
      if (index < 0)
        throw new Error(
          `Cannot find index of ${id}. You can use particleIndex() or bodyIndex() function to check existence by name.`,
        );
    } else {
      index = id;
    }
    return index;
  }

  /**
   * Remove bodies from this world. Support removing a range and negative index.
   * @param from Start index, which can be negative (where -1 is at index 0, -2 at index 1, etc)
   * @param count Number of items to remove. Default is 1.
   */
  removeBody(from: number | string, count: number = 1): this {
    const index = this._index(this.bodyIndex.bind(this), from);
    const param = index < 0 ? [index * -1 - 1, count] : [index, count];
    this._bodies.splice(param[0], param[1]);
    this._bnames.splice(param[0], param[1]);
    return this;
  }

  /**
   * Remove particles from this world. Support removing a range and negative index.
   * @param from Start index, which can be negative (where -1 is at index 0, -2 at index 1, etc)
   * @param count Number of items to remove. Default is 1.
   */
  removeParticle(from: number | string, count: number = 1): this {
    const index = this._index(this.particleIndex.bind(this), from);
    const param = index < 0 ? [index * -1 - 1, count] : [index, count];
    this._particles.splice(param[0], param[1]);
    this._pnames.splice(param[0], param[1]);
    return this;
  }

  /**
   * Static function to calculate edge constraints between 2 particles.
   * @param p1 particle 1
   * @param p2 particle 2
   * @param dist distance between particles
   * @param stiff stiffness between 0 to 1.
   * @param precise use precise distance calculation. Default is `false`.
   */
  static edgeConstraint(
    p1: Particle,
    p2: Particle,
    dist: number,
    stiff: number = 1,
    precise: boolean = false,
  ) {
    const m1 = 1 / (p1.mass || 1);
    const m2 = 1 / (p2.mass || 1);
    const mm = m1 + m2;

    let delta = p2.$subtract(p1);
    let distSq = dist * dist;
    let d = precise
      ? dist / delta.magnitude() - 1
      : distSq / (delta.dot(delta) + distSq) - 0.5; // approx square root
    let f = delta.$multiply(d * stiff);

    p1.subtract(f.$multiply(m1 / mm));
    p2.add(f.$multiply(m2 / mm));

    return p1;
  }

  /**
   * Static function to calculate bounding box constraints.
   * @param p particle
   * @param rect a Group or an Iterable<Pt> representing a bounding box
   * @param damping damping between 0 to 1, where 1 means no damping. Default is 0.75.
   */
  static boundConstraint(
    p: Particle,
    rect: PtIterable,
    damping: number = 0.75,
  ) {
    const bound = Geom.boundingBox(rect);
    World._boundParticle(
      p,
      bound[0][0],
      bound[0][1],
      bound[1][0],
      bound[1][1],
      damping,
    );
  }

  /**
   * Shared scalar core of the bound constraint: clamp to the rectangle inset by the
   * particle's radius, and reflect the damped velocity on each axis that hit a wall
   * (a corner hit reflects both).
   */
  protected static _boundParticle(
    p: Particle,
    minX: number,
    minY: number,
    maxX: number,
    maxY: number,
    damping: number,
  ) {
    const px = p[0];
    const py = p[1];
    const nx = Math.min(Math.max(px, minX + p.radius), maxX - p.radius);
    const ny = Math.min(Math.max(py, minY + p.radius), maxY - p.radius);

    if (nx !== px || ny !== py) {
      const prev = p.previous;
      const cx = (px - prev[0]) * damping;
      const cy = (py - prev[1]) * damping;
      prev[0] = nx !== px ? nx + cx : nx - cx;
      prev[1] = ny !== py ? ny + cy : ny - cy;
      p[0] = nx;
      p[1] = ny;
    }
  }

  /**
   * Integrate a particle for one substep: Verlet with the accumulated force plus gravity as
   * acceleration, and the substep-adjusted friction as drag. Forces are read but not cleared
   * here — they persist across the substeps of one update and are cleared when it completes.
   * @param p particle
   * @param dt substep time in seconds
   * @param prevDt unused; substeps are equal so no time-correction is needed. Kept for signature compatibility.
   */
  protected integrate(p: Particle, dt: number, prevDt?: number): Particle {
    if (p.lock) {
      p.verlet(dt, this._frictionStep, prevDt); // re-pins to the lock point
      return p;
    }

    const prev = p.previous;
    const force = p.force;
    const f = this._frictionStep;
    const dtSq = dt * dt;
    const px = p[0];
    const py = p[1];
    const nx = px + (px - prev[0]) * f + (force[0] + this._gravity[0]) * dtSq;
    const ny = py + (py - prev[1]) * f + (force[1] + this._gravity[1]) * dtSq;
    prev[0] = px;
    prev[1] = py;
    p[0] = nx;
    p[1] = ny;
    return p;
  }

  /**
   * Internal function to update free particles for one substep: integrate, constrain to the
   * bound, then resolve particle-particle collisions through the spatial hash.
   */
  protected _updateParticles(dt: number) {
    const ps = this._particles;
    const len = ps.length;
    if (len === 0) return;

    const b0 = this._bound[0];
    const b1 = this._bound[1];
    const minX = Math.min(b0[0], b1[0]);
    const minY = Math.min(b0[1], b1[1]);
    const maxX = Math.max(b0[0], b1[0]);
    const maxY = Math.max(b0[1], b1[1]);

    for (let i = 0; i < len; i++) {
      const p = ps[i];
      this.integrate(p, dt);
      World._boundParticle(p, minX, minY, maxX, maxY, this._damping);
    }

    this._collideParticles();
  }

  /**
   * Resolve particle-particle collisions using a uniform spatial hash (a counting-sort grid),
   * visiting only neighboring cells instead of testing all pairs.
   */
  private _collideParticles() {
    const ps = this._particles;
    const n = ps.length;
    if (n < 2) return;

    let rmax = 0;
    for (let i = 0; i < n; i++) {
      if (ps[i].radius > rmax) rmax = ps[i].radius;
    }
    if (rmax <= 0) return; // nothing can collide

    // cells of 2×rmax mean any colliding pair is within the 3×3 neighborhood
    const inv = 1 / (rmax * 2);
    let m = 16;
    while (m < n * 2) m <<= 1;
    const mask = m - 1;

    if (this._cellStart.length < m + 1)
      this._cellStart = new Uint32Array(m + 1);
    if (this._hashKeys.length < n) {
      this._hashKeys = new Uint32Array(n * 2);
      this._cellEntries = new Uint32Array(n * 2);
    }
    const keys = this._hashKeys;
    const start = this._cellStart;
    const entries = this._cellEntries;

    // count per cell, exclusive prefix sum, then scatter; after the scatter,
    // bucket k spans [start[k-1], start[k])
    start.fill(0, 0, m + 1);
    for (let i = 0; i < n; i++) {
      const p = ps[i];
      const key =
        ((Math.imul(Math.floor(p[0] * inv), 0x9e3779b1) ^
          Math.imul(Math.floor(p[1] * inv), 0x85ebca77)) >>>
          0) &
        mask;
      keys[i] = key;
      start[key]++;
    }
    let sum = 0;
    for (let k = 0; k < m; k++) {
      const c = start[k];
      start[k] = sum;
      sum += c;
    }
    start[m] = sum;
    for (let i = 0; i < n; i++) {
      entries[start[keys[i]]++] = i;
    }

    const damping = this._damping;
    const visited = this._neighborKeys;
    for (let i = 0; i < n; i++) {
      const p = ps[i];
      const cx = Math.floor(p[0] * inv);
      const cy = Math.floor(p[1] * inv);
      // Visit each distinct hash key of the 3×3 neighborhood exactly once: two
      // neighbor cells can collide to the same bucket, and visiting it twice
      // would apply a pair's collision response twice.
      let visitedCount = 0;
      for (let gy = cy - 1; gy <= cy + 1; gy++) {
        const hy = Math.imul(gy, 0x85ebca77);
        for (let gx = cx - 1; gx <= cx + 1; gx++) {
          const key = ((Math.imul(gx, 0x9e3779b1) ^ hy) >>> 0) & mask;
          let seen = false;
          for (let v = 0; v < visitedCount; v++) {
            if (visited[v] === key) {
              seen = true;
              break;
            }
          }
          if (seen) continue;
          visited[visitedCount++] = key;
          const end = start[key];
          const begin = key > 0 ? start[key - 1] : 0;
          for (let e = begin; e < end; e++) {
            const j = entries[e];
            if (j > i) p.collide(ps[j], damping);
          }
        }
      }
    }
  }

  /**
   * Reset all accumulated forces after an update completes.
   */
  private _clearForces() {
    for (let i = 0, len = this._particles.length; i < len; i++) {
      this._particles[i].force.fill(0);
    }
    for (let i = 0, len = this._bodies.length; i < len; i++) {
      const bd = this._bodies[i];
      for (let k = 0, klen = bd.length; k < klen; k++) {
        (bd[k] as Particle).force.fill(0);
      }
    }
  }

  /**
   * Internal function to update bodies for one substep: integrate and bound-constrain every
   * body particle, resolve body-body and body-particle collisions behind an AABB broad
   * phase, then restore shapes with the edge-constraint pass.
   * @param dt substep time in seconds
   */
  protected _updateBodies(dt: number) {
    const bs = this._bodies;
    const blen = bs.length;
    if (blen === 0) return;

    const b0 = this._bound[0];
    const b1 = this._bound[1];
    const minX = Math.min(b0[0], b1[0]);
    const minY = Math.min(b0[1], b1[1]);
    const maxX = Math.max(b0[0], b1[0]);
    const maxY = Math.max(b0[1], b1[1]);

    for (let i = 0; i < blen; i++) {
      const bd = bs[i];
      if (!bd) continue;
      for (let k = 0, klen = bd.length; k < klen; k++) {
        const bk = bd[k] as Particle;
        this.integrate(bk, dt);
        World._boundParticle(bk, minX, minY, maxX, maxY, this._damping);
      }
    }

    this._collideBodies(blen);

    for (let i = 0; i < blen; i++) {
      if (bs[i]) bs[i].solveEdges(dt, this._iterations, this._substeps);
    }
  }

  /**
   * Resolve body-body and body-particle collisions behind an AABB broad phase.
   */
  private _collideBodies(blen: number) {
    const bs = this._bodies;

    // axis-aligned bounding boxes for the broad phase
    if (this._bodyBounds.length < blen * 4) {
      this._bodyBounds = new Float32Array(blen * 8);
    }
    const aabb = this._bodyBounds;
    for (let i = 0; i < blen; i++) {
      const bd = bs[i];
      let bx0 = Infinity;
      let by0 = Infinity;
      let bx1 = -Infinity;
      let by1 = -Infinity;
      if (bd) {
        for (let k = 0, klen = bd.length; k < klen; k++) {
          const v = bd[k];
          if (v[0] < bx0) bx0 = v[0];
          if (v[0] > bx1) bx1 = v[0];
          if (v[1] < by0) by0 = v[1];
          if (v[1] > by1) by1 = v[1];
        }
      }
      aabb[i * 4] = bx0;
      aabb[i * 4 + 1] = by0;
      aabb[i * 4 + 2] = bx1;
      aabb[i * 4 + 3] = by1;
    }

    const ps = this._particles;
    const plen = ps.length;

    for (let i = 0; i < blen; i++) {
      const bd = bs[i];
      if (!bd) continue;
      const ax0 = aabb[i * 4];
      const ay0 = aabb[i * 4 + 1];
      const ax1 = aabb[i * 4 + 2];
      const ay1 = aabb[i * 4 + 3];

      for (let k = i + 1; k < blen; k++) {
        if (
          bs[k] &&
          ax0 <= aabb[k * 4 + 2] &&
          ax1 >= aabb[k * 4] &&
          ay0 <= aabb[k * 4 + 3] &&
          ay1 >= aabb[k * 4 + 1]
        ) {
          bd.processBody(bs[k]);
        }
      }

      for (let mIdx = 0; mIdx < plen; mIdx++) {
        const p = ps[mIdx];
        const r = p.radius;
        if (
          p[0] >= ax0 - r &&
          p[0] <= ax1 + r &&
          p[1] >= ay0 - r &&
          p[1] <= ay1 + r
        ) {
          bd.processParticle(p);
        }
      }
    }
  }
}

/**
 * Particle is a subclass of [`Pt`](#link) that has radius and mass. It's usually added into [`World`](#link) to create physics simulations.
 * See [a demo here](../demo/index.html?name=physics.particles).
 */
export class Particle extends Pt {
  protected _mass: number = 1;
  protected _radius: number = 0;
  protected _force: Pt = new Pt();
  protected _prev: Pt = new Pt();

  protected _body: Body;
  protected _lock: boolean = false;
  protected _lockPt: Pt;

  /**
   * Create a particle. Once a particle is created, you can set its mass and radius via the corresponding accessors.
   * @param args a list of numeric parameters, an array of numbers, or an object with {x,y,z,w} properties
   */
  constructor(...args) {
    super(...args);
    this._prev = this.clone();
  }

  /**
   * Mass of this particle.
   */
  get mass(): number {
    return this._mass;
  }
  set mass(m: number) {
    this._mass = m;
  }

  /**
   * Radius of this particle.
   */
  get radius(): number {
    return this._radius;
  }
  set radius(f: number) {
    this._radius = f;
  }

  /**
   * Get this particle's previous position.
   */
  get previous(): Pt {
    return this._prev;
  }
  set previous(p: Pt) {
    this._prev = p;
  }

  /**
   * Get current accumulated force.
   */
  get force(): Pt {
    return this._force;
  }
  set force(g: Pt) {
    this._force = g;
  }

  /**
   * Get the body of this particle, if any.
   */
  get body(): Body {
    return this._body;
  }
  set body(b: Body) {
    this._body = b;
  }

  /**
   * Lock this particle in current position.
   */
  get lock(): boolean {
    return this._lock;
  }
  set lock(b: boolean) {
    // On unlock, reset `previous` to the current position: while locked, collisions
    // and dragging can leave it arbitrarily stale, and integrating that difference
    // would launch the particle. (To throw a particle on release, use `hit`.)
    if (this._lock && !b) this._prev.to(this);
    this._lock = b;
    this._lockPt = new Pt(this);
  }

  /**
   * Get the change in position since last time step.
   */
  get changed(): Pt {
    return this.$subtract(this._prev);
  }

  /**
   * Set a new position, and update previous and lock states if needed.
   */
  set position(p: Pt) {
    this.previous.to(this);
    if (this._lock) this._lockPt = p;
    this.to(p);
  }

  /**
   * Set the size of this particle. This sets both the radius and the mass.
   * @param r `radius` value, and also set `mass` to the same value.
   */
  size(r: number): this {
    this._mass = r;
    this._radius = r;
    return this;
  }

  /**
   * Add to the accumulated force.
   * @param args a list of numeric parameters, an array of numbers, or an object with {x,y,z,w} properties
   */
  addForce(...args): Pt {
    this._force.add(...args);
    return this._force;
  }

  /**
   * Verlet integration.
   * @param dt change in time
   * @param friction friction from 0 to 1, where 1 means no friction
   * @param lastDt optional last change in time
   */
  verlet(dt: number, friction: number, lastDt?: number): this {
    // Positional verlet: curr + (curr - prev) + a * dt * dt

    if (this._lock) {
      // Pin the position only. `previous` is deliberately left alone: dragging a
      // locked particle via the `position` setter stores the drag delta there, and
      // collisions read it as the particle's velocity — this is what makes a
      // pointer-dragged particle knock others away. Stale velocity is cleared at
      // the moment of unlocking instead (see the `lock` setter).
      this.to(this._lockPt);
    } else {
      // time corrected (https://en.wikipedia.org/wiki/Verlet_integration#Non-constant_time_differences)
      const lt = lastDt ? lastDt : dt;
      const adt = (dt * (dt + lt)) / 2;
      const f = (friction * dt) / lt;
      const force = this._force;
      const prev = this._prev;
      for (let i = 0, len = this.length; i < len; i++) {
        const cur = this[i];
        const v = (cur - prev[i]) * f + (force[i] || 0) * adt;
        prev[i] = cur;
        this[i] = cur + v;
      }
      force.fill(0);
    }
    return this;
  }

  /**
   * Hit this particle with an impulse. The impulse is scaled by 1/√mass, so a heavier particle moves less from the same hit.
   * @param args an impulse vector defined by either a list of numeric parameters, an array of numbers, or an object with {x,y,z,w} properties
   * @example `hit(10, 20)`, `hit( new Pt(5, 9) )`
   */
  hit(...args): this {
    this._prev.subtract(new Pt(...args).$divide(Math.sqrt(this._mass)));
    return this;
  }

  /**
   * Check and respoond to collisions between this and another particle.
   * @param p2 another particle
   * @param damp damping value between 0 to 1, where 1 means no damping.
   */
  collide(p2: Particle, damp: number = 1): void {
    // reference: http://codeflow.org/entries/2010/nov/29/verlet-collision-with-impulse-preservation
    // simultaneous collision not yet resolved. Possible solutions in this paper: https://www2.msm.ctw.utwente.nl/sluding/PAPERS/dem07.pdf

    const p1 = this;
    let dx = p1[0] - p2[0];
    let dy = p1[1] - p2[1];
    let distSq = dx * dx + dy * dy;
    const dr = p1.radius + p2.radius;
    if (distSq >= dr * dr) return;

    const prev1 = p1.previous;
    const prev2 = p2.previous;
    let c1x = p1[0] - prev1[0];
    let c1y = p1[1] - prev1[1];
    let c2x = p2[0] - prev2[0];
    let c2y = p2[1] - prev2[1];

    // separation of (dist - dr) / 2 along the collision axis; for exactly
    // coincident particles, separate deterministically along the x-axis
    let dist = Math.sqrt(distSq);
    let k: number;
    if (dist < 0.000001) {
      dx = 1;
      dy = 0;
      dist = 1;
      distSq = 1;
      k = -dr / 2;
    } else {
      k = (dist - dr) / dist / 2;
    }

    const np1x = p1[0] - dx * k;
    const np1y = p1[1] - dy * k;
    const np2x = p2[0] + dx * k;
    const np2y = p2[1] + dy * k;

    const f1 = (damp * (dx * c1x + dy * c1y)) / distSq;
    const f2 = (damp * (dx * c2x + dy * c2y)) / distSq;
    const dm1 = p1.mass / (p1.mass + p2.mass);
    const dm2 = p2.mass / (p1.mass + p2.mass);

    c1x += (f2 - f1) * dx * dm2;
    c1y += (f2 - f1) * dy * dm2;
    c2x += (f1 - f2) * dx * dm1;
    c2y += (f1 - f2) * dy * dm1;

    p1[0] = np1x;
    p1[1] = np1y;
    p2[0] = np2x;
    p2[1] = np2y;
    prev1[0] = np1x - c1x;
    prev1[1] = np1y - c1y;
    prev2[0] = np2x - c2x;
    prev2[1] = np2y - c2y;
  }

  /**
   * Get a string representation of this particle
   */
  toString(): string {
    return `Particle: ${this[0]} ${this[1]} | previous ${this._prev[0]} ${this._prev[1]} | mass ${this._mass}`;
  }
}

/**
 * Body is a subclass of [`Group`](#link) that stores a set of [`Particle`](#link)s and edge constraints. It is usually added into a [`World`](#link) to create physics simulations.
 * See [a demo here](../demo/index.html?name=physics.shapes).
 */
export class Body extends Group {
  protected _cs: Array<number[]> = [];
  protected _stiff: number = 1;
  protected _locks: { [index: string]: Particle } = {};
  protected _mass: number = 1;
  protected _lambdas: Float32Array = new Float32Array(0); // XPBD multipliers, one per link

  /**
   * Create an empty Body, this is usually followed by [`Body.init`](#link) to populate the Body. Alternatively, use static function [`Body.fromGroup`](#link) to create and initate a body directly.
   */
  constructor() {
    super();
  }

  /**
   * Create and populate a body.
   * @param body a Group or an Iterable<Pt> to define the body
   * @param stiff stiffness value from 0 to 1, where 1 is the most stiff. Default is 1.
   * @param autoLink Automatically create links between the Pts. This usually works for regular convex polygons. Default is true.
   * @param autoMass Automatically calculate the mass based on the area of the polygon. Default is true.
   */
  static fromGroup(
    body: PtIterable,
    stiff: number = 1,
    autoLink: boolean = true,
    autoMass: boolean = true,
  ): Body {
    let b = new Body().init(body);
    if (autoLink) b.linkAll(stiff);
    if (autoMass) b.autoMass();
    return b;
  }

  /**
   * Initiate a body.
   * @param body a Group or an Iterable<Pt> to define a body
   * @param stiff stiffness value from 0 to 1, where 1 is the most stiff. Default is 1.
   */
  init(body: PtIterable, stiff: number = 1): this {
    for (let li of body) {
      let p = new Particle(li);
      p.body = this;
      this.push(p);
    }

    this._stiff = stiff;

    return this;
  }

  /**
   * Get mass of this body.
   */
  get mass(): number {
    return this._mass;
  }
  set mass(m: number) {
    this._mass = m;
    for (let i = 0, len = this.length; i < len; i++) {
      (this[i] as Particle).mass = this._mass;
    }
  }

  /**
   * Automatically calculate a body's `mass` based on the area of the polygon.
   */
  autoMass(): this {
    this.mass = Math.sqrt(Polygon.area(this)) / 10;
    return this;
  }

  /**
   * Create a linked edge between two points.
   * @param index1 first point by index
   * @param index2 first point by index
   * @param stiff optionally stiffness value between 0 to 1, where 1 is the most stiff.
   */
  link(index1: number, index2: number, stiff?: number): this {
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
  linkAll(stiff: number): void {
    const half = this.length / 2;

    // skip duplicate pairs and self-pairs, which the cross-link passes below
    // can produce for odd sizes (a duplicate would double-solve an edge);
    // a linear scan of the small link list beats allocating a Set here
    const tryLink = (a: number, b: number, s?: number) => {
      if (a === b) return;
      const cs = this._cs;
      for (let k = 0, klen = cs.length; k < klen; k++) {
        const c = cs[k];
        if ((c[0] === a && c[1] === b) || (c[0] === b && c[1] === a)) return;
      }
      this.link(a, b, s);
    };

    for (let i = 0, len = this.length; i < len; i++) {
      const n = i >= len - 1 ? 0 : i + 1;
      tryLink(i, n, stiff);

      if (len > 4) {
        const nd = Math.floor(half / 2) + 1;
        const n2 = i >= len - nd ? i % len : i + nd;
        tryLink(i, n2, stiff);
      }

      if (i <= half - 1) {
        tryLink(i, Math.min(this.length - 1, i + Math.floor(half)));
      }
    }
  }

  /**
   * Return a list of all the linked edges as line segments.
   * @returns an array of Groups, each of which represents an edge
   */
  linksToLines(): Group[] {
    let gs = [];
    for (let i = 0, len = this._cs.length; i < len; i++) {
      let ln = this._cs[i];
      gs.push(new Group(this[ln[0]], this[ln[1]]));
    }
    return gs;
  }

  /**
   * Recalculate all edge constraints.
   */
  processEdges(): void {
    for (let i = 0, len = this._cs.length; i < len; i++) {
      let [m, n, d, s] = this._cs[i];
      World.edgeConstraint(this[m] as Particle, this[n] as Particle, d, s);
    }
  }

  /**
   * Solve all edge constraints for one substep in XPBD form. A link's `stiff` value is a
   * geometric knob: it is the fraction of the remaining constraint violation resolved per
   * update, independent of the particles' masses and of the substep/iteration counts
   * (per Müller et al. 2007, the per-pass fraction is `1-(1-stiff)^(1/passes)`), and
   * `stiff=1` is a rigid projection. Mapping the fraction to a mass-relative compliance
   * keeps a heavy body exactly as stiff as a light one at the same value.
   * This is the solver used internally by [`World.update`](#link);
   * [`Body.processEdges`](#link) remains the simpler relaxation for direct use.
   * @param dt substep time in seconds (reserved; the geometric stiffness does not depend on it)
   * @param iterations solver iterations for this substep. Default is 1.
   * @param substeps the caller's substeps per update, for pass-count-independent stiffness. Default is 1.
   */
  solveEdges(dt: number, iterations: number = 1, substeps: number = 1): this {
    const cs = this._cs;
    const clen = cs.length;
    if (clen === 0) return this;

    if (this._lambdas.length < clen) this._lambdas = new Float32Array(clen);
    const lambdas = this._lambdas;
    lambdas.fill(0, 0, clen);
    const invPasses = 1 / Math.max(1, iterations * substeps);

    for (let iter = 0; iter < iterations; iter++) {
      for (let ci = 0; ci < clen; ci++) {
        const c = cs[ci];
        const p1 = this[c[0]] as Particle;
        const p2 = this[c[1]] as Particle;
        const stiff = c[3];

        const w1 = p1.lock ? 0 : 1 / (p1.mass || 1);
        const w2 = p2.lock ? 0 : 1 / (p2.mass || 1);
        const w = w1 + w2;
        if (w === 0) continue;

        const dx = p2[0] - p1[0];
        const dy = p2[1] - p1[1];
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 0.000001) continue;

        // mass-relative compliance: the per-pass correction fraction is exactly
        // `sEff` regardless of mass, since w / (w + alpha) = sEff
        let alpha = 0;
        if (stiff < 1) {
          const sEff = 1 - Math.pow(1 - stiff, invPasses);
          alpha = sEff > 0.000001 ? (w * (1 - sEff)) / sEff : w * 1000000;
        }
        const dl = (-(dist - c[2]) - alpha * lambdas[ci]) / (w + alpha);
        lambdas[ci] += dl;

        const s = dl / dist;
        const fx = dx * s;
        const fy = dy * s;
        p1[0] -= fx * w1;
        p1[1] -= fy * w1;
        p2[0] += fx * w2;
        p2[1] += fy * w2;
      }
    }
    return this;
  }

  /**
   * Check and respond to collisions between two bodies.
   * @param b another body
   */
  processBody(b: Body): void {
    let b1 = this;
    let b2 = b;

    let hit = Polygon.hasIntersectPolygon(b1, b2);

    if (hit) {
      let cv = hit.normal.$multiply(hit.dist);

      let t;
      let eg = hit.edge;
      if (Math.abs(eg[0][0] - eg[1][0]) > Math.abs(eg[0][1] - eg[1][1])) {
        t = (hit.vertex[0] - cv[0] - eg[0][0]) / (eg[1][0] - eg[0][0]);
      } else {
        t = (hit.vertex[1] - cv[1] - eg[0][1]) / (eg[1][1] - eg[0][1]);
      }

      let lambda = 1 / (t * t + (1 - t) * (1 - t));

      let m0 = (hit.vertex as Particle).body.mass || 1;
      let m1 = (hit.edge[0] as Particle).body.mass || 1;
      let mr0 = m0 / (m0 + m1);
      let mr1 = m1 / (m0 + m1);

      eg[0].subtract(cv.$multiply((mr0 * (1 - t) * lambda) / 2));
      eg[1].subtract(cv.$multiply((mr0 * t * lambda) / 2));

      hit.vertex.add(cv.$multiply(mr1));
    }
  }

  /**
   * Check and respond to collisions between this body and a particle.
   * @param b a particle
   */
  processParticle(b: Particle): void {
    let b1 = this;
    let b2 = b;

    let hit = Polygon.hasIntersectCircle(b1, Circle.fromCenter(b, b.radius));

    if (hit) {
      let cv = hit.normal.$multiply(hit.dist);

      let t;
      let eg = hit.edge;
      if (Math.abs(eg[0][0] - eg[1][0]) > Math.abs(eg[0][1] - eg[1][1])) {
        t = (hit.vertex[0] - cv[0] - eg[0][0]) / (eg[1][0] - eg[0][0]);
      } else {
        t = (hit.vertex[1] - cv[1] - eg[0][1]) / (eg[1][1] - eg[0][1]);
      }

      let lambda = 1 / (t * t + (1 - t) * (1 - t));
      // hit.vertex is the circle's center Pt (not a Particle), so the
      // particle's own mass is the vertex-side mass here
      let m0 = b2.mass || 1;
      let m1 = (hit.edge[0] as Particle).body.mass || 1;

      let mr0 = m0 / (m0 + m1);
      let mr1 = m1 / (m0 + m1);

      eg[0].subtract(cv.$multiply((mr0 * (1 - t) * lambda) / 2));
      eg[1].subtract(cv.$multiply((mr0 * t * lambda) / 2));

      let c1 = b.changed.add(cv.$multiply(mr1));
      b.previous = b.$subtract(c1);
    }
  }
}
