/*! Source code licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */

import {Pt, Group, Bound} from "./Pt";
import { Polygon, Circle } from "./Op";
import {PtLike, GroupLike} from "./Types";

/**
 * A `World` stores and manages [`Body`](#link) and [`Particle`](#link) for 2D physics simulation. 
 * See a [Particle demo](../demo/index.html?name=physics.particles) and a [Body demo](../demo/index.html?name=physics.shapes) on the demo page.
 */
export class World {

  private _lastTime:number = null;

  protected _gravity:Pt = new Pt();
  protected _friction:number = 1; // general friction
  protected _damping:number = 0.75; // collision damping
  protected _bound:Bound;
  
  protected _particles:Particle[] = [];
  protected _bodies:Body[] = [];
  protected _pnames:string[] = []; // particle name index
  protected _bnames:string[] = []; // body name index

  protected _drawParticles:(p:Particle, i:number) => void;
  protected _drawBodies:(p:Body, i:number) => void;


  /**
   * Create a `World` for 2D physics simulation.
   * @param bound a rectangular bounding box defined by a Group
   * @param friction a value between 0 to 1, where 1 means no friction. Default is 1
   * @param gravity a number of a Pt to define gravitational force. A number is a shorthand to set `new Pt(0, n)`. Default is 0.
   */
  constructor( bound:Group, friction:number=1, gravity:PtLike|number=0 ) {
    this._bound = Bound.fromGroup( bound );
    this._friction = friction;
    this._gravity = (typeof gravity === "number") ? new Pt( 0, gravity) : new Pt( gravity );
    return this;
  }


  /**
   * Current gravity in this `World`.
   */
  get gravity():Pt { return this._gravity; }
  set gravity( g:Pt ) { this._gravity = g; }

  /**
   * Current friction in this `World`.
   */
  get friction():number { return this._friction; }
  set friction( f:number ) { this._friction = f; }

  /**
   * Current damping in this `World`.
   */
  get damping():number { return this._damping; }
  set damping( f:number ) { this._damping = f; }

  /**
   * Get the number of bodies.
   */
  get bodyCount():number { return this._bodies.length; }

  /**
   * Get the number of particles.
   */
  get particleCount():number { return this._particles.length; }


  /**
   * Get a body in this world by index or string id.
   * @param id numeric index of the body, or a string id that associates with it.
   */
  body( id:number|string ) {
    let idx = id;
    if (typeof id === "string" && id.length > 0) {
      idx = this._bnames.indexOf( id );
    }
    if (!(idx >= 0)) throw new Error( "Cannot find body id: "+id );
    return this._bodies[idx];
  }


  /**
   * Get a particle in this world by index or string id.
   * @param id numeric index of the particle, or a string id that associates with it. 
   */
  particle( id:number|string ) { 
    let idx = id;
    if (typeof id === "string" && id.length > 0) {
      idx = this._pnames.indexOf( id );
    }
    if (!(idx >= 0)) throw new Error( "Cannot find particle id: "+id );
    return this._particles[idx];
  }


  /**
   * Given a body's name, return its index in the bodies array, or -1 if not found.
   * @param name name of the body
   * @returns index number, or -1 if not found
   */
  bodyIndex( name:string ):number {
    return this._bnames.indexOf(name);
  }


  /**
   * Given a particle's name, return its index in the particles array, or -1 if not found.
   * @param name name of the particle
   * @returns index number, or -1 if not found
   */
  particleIndex( name:string ):number {
    return this._pnames.indexOf(name);
  }


  /**
   * Update this world by one time-step.
   * @param ms change in time in milliseconds
   */
  update( ms:number ) {
    let dt = ms/1000;
    this._updateParticles( dt );
    this._updateBodies( dt );
  }


  /**
   * Draw particles using the provided function.
   * @param fn a function that draws a particle passed in the parameters `(particle, index)`.
   */
  drawParticles( fn:(p:Particle, i:number) => void ):void {
    this._drawParticles = fn;
  }


  /**
   * Draw bodies using the provided function.
   * @param fn a function that draws a body passed in the parameters `(body, index)`.
   */
  drawBodies( fn:(p:Body, i:number) => void ):void {
    this._drawBodies = fn;
  }


  /**
   * Add a particle or body to this world.
   * @param p `Particle` or `Body` instance
   * @param name optional name, which can be referenced in `body()` or `particle()` function to retrieve this back.
   */
  add( p:Particle|Body, name:string='' ):this {
    if ( p instanceof Body) {
      this._bodies.push( <Body>p );
      this._bnames.push( name );
    } else {
      this._particles.push( <Particle>p );
      this._pnames.push( name );
    }
    return this;
  }


  private _index( fn:( string )=>number, id:string|number ):number {
    let index = 0;
    if (typeof id === "string") {
      index = fn(id);
      if (index < 0) throw new Error( "Cannot find index of " + id );
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
  removeBody( from:number|string, count:number=1 ):this {
    const index = this._index( this.bodyIndex.bind(this), from );
    const param = (index<0) ? [index*-1 - 1, count] : [index, count];
    this._bodies.splice( param[0], param[1] );
    this._bnames.splice( param[0], param[1] );
    return this;
  }


  /**
   * Remove particles from this world. Support removing a range and negative index.
   * @param from Start index, which can be negative (where -1 is at index 0, -2 at index 1, etc) 
   * @param count Number of items to remove. Default is 1.
   */
  removeParticle( from:number|string, count:number=1 ):this {
    const index = this._index( this.particleIndex.bind(this), from );
    const param = (index<0) ? [index*-1 - 1, count] : [index, count];
    this._particles.splice( param[0], param[1] );
    this._pnames.splice( param[0], param[1] );
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
  static edgeConstraint( p1:Particle, p2:Particle, dist:number, stiff:number=1, precise:boolean=false ) {
    const m1 = 1 / (p1.mass || 1);
    const m2 = 1 / (p2.mass || 1);
    const mm = m1 + m2;

    let delta = p2.$subtract( p1 );
    let distSq = dist * dist;
    let d = (precise) ? (dist / delta.magnitude() - 1) : (distSq / ( delta.dot( delta ) + distSq ) - 0.5); // approx square root
    let f = delta.$multiply( d * stiff );

    p1.subtract( f.$multiply( m1/mm ) );
    p2.add( f.$multiply( m2/mm ) );
    
    return p1;
  }


  /**
   * Static function to calculate bounding box constraints.
   * @param p particle
   * @param rect bounding box defined by a Group
   * @param damping damping between 0 to 1, where 1 means no damping. Default is 0.75.
   */
  static boundConstraint( p:Particle, rect:Group, damping:number=0.75 ) {
    let bound = rect.boundingBox();
    let np = p.$min( bound[1].subtract( p.radius ) ).$max( bound[0].add( p.radius ) );
    
    if (np[0] === bound[0][0] || np[0] === bound[1][0]) { // hit vertical walls
      let c = p.changed.$multiply(damping);
      p.previous = np.$subtract( new Pt( -c[0], c[1] ) );
    } else if (np[1] === bound[0][1] || np[1] === bound[1][1]) { // hit horizontal walls
      let c = p.changed.$multiply(damping);
      p.previous = np.$subtract( new Pt( c[0], -c[1] ) );
    }
  
    p.to( np );

  }


  /**
   * Internal integrate function
   * @param p particle
   * @param dt time changed
   * @param prevDt previous change in time, optional
   */
  protected integrate( p:Particle, dt:number, prevDt?:number ):Particle {
    p.addForce( this._gravity );
    p.verlet( dt, this._friction, prevDt );
    return p;
  }


  /**
   * Internal function to update particles
   */
  protected _updateParticles( dt:number ) {
    
    for (let i=0, len=this._particles.length; i<len; i++) {
      let p = this._particles[i];

      // force and integrate
      this.integrate( p, dt, this._lastTime );

      // constraints
      World.boundConstraint( p, this._bound, this._damping );

      // collisions
      for (let k=i+1; k<len; k++) {
        if (i!==k) {
          let p2 = this._particles[k];
          p.collide( p2, this._damping );
        }
      }
      
      // render
      if (this._drawParticles) this._drawParticles( p, i );
    }

    this._lastTime = dt;
  }


  /**
   * Internal function to update bodies
   */
  protected _updateBodies( dt:number ) {
    for (let i=0, len=this._bodies.length; i<len; i++) {
      let bds = this._bodies[i];

      if (bds) {
        // integrate
        for (let k=0, klen=bds.length; k<klen; k++) {
          let bk = bds[k] as Particle;
          World.boundConstraint( bk, this._bound, this._damping );
          this.integrate( bk, dt, this._lastTime );
        }
      
        for (let k=i+1; k<len; k++) {
          bds.processBody( this._bodies[k] );
        }

        for (let m=0, mlen=this._particles.length; m<mlen; m++) {
          bds.processParticle( this._particles[m] );
        }

        // constraints
        bds.processEdges();
      
        // render
        if (this._drawBodies) this._drawBodies( bds, i );
      }
    }
  } 

  
}



/**
 * Particle is a subclass of [`Pt`](#link) that has radius and mass. It's usually added into [`World`](#link) to create physics simulations. 
 * See [a demo here](../demo/index.html?name=physics.particles).
 */
export class Particle extends Pt {

  protected _mass:number = 1;
  protected _radius:number = 0;
  protected _force:Pt = new Pt();
  protected _prev:Pt = new Pt();
  
  protected _body:Body;
  protected _lock:boolean = false;
  protected _lockPt:Pt;


  /**
   * Create a particle. Once a particle is created, you can set its mass and radius via the corresponding accessors.
   * @param args a list of numeric parameters, an array of numbers, or an object with {x,y,z,w} properties
   */
  constructor( ...args ) {
    super( ...args );
    this._prev = this.clone();
  }

  /**
   * Mass of this particle.
   */
  get mass():number { return this._mass; }
  set mass( m:number ) { this._mass = m; }

  /**
   * Radius of this particle.
   */
  get radius():number { return this._radius; }
  set radius( f:number ) { this._radius = f; }

  /**
   * Get this particle's previous position.
   */
  get previous():Pt { return this._prev; }
  set previous( p:Pt ) { this._prev = p; }

  /**
   * Get current accumulated force.
   */
  get force():Pt { return this._force; }
  set force( g:Pt ) { this._force = g; }

  /**
   * Get the body of this particle, if any.
   */
  get body():Body { return this._body; }
  set body( b:Body ) { this._body = b; }

  /**
   * Lock this particle in current position.
   */
  get lock():boolean { return this._lock; }
  set lock( b:boolean ) { 
    this._lock = b; 
    this._lockPt = new Pt(this);
  }

  /**
   * Get the change in position since last time step.
   */
  get changed():Pt { return this.$subtract( this._prev ); }


  /**
   * Set a new position, and update previous and lock states if needed.
   */
  set position( p:Pt ) {
    this.previous.to( this );
    if (this._lock) this._lockPt = p;
    this.to( p );
  }

  
  /**
   * Set the size of this particle. This sets both the radius and the mass.
   * @param r `radius` value, and also set `mass` to the same value.
   */
  size( r:number ):this {
    this._mass = r;
    this._radius = r;
    return this;
  }


  /**
   * Add to the accumulated force.
   * @param args a list of numeric parameters, an array of numbers, or an object with {x,y,z,w} properties
   */
  addForce( ...args ):Pt {
    this._force.add( ...args );
    return this._force;
  }


  /**
   * Verlet integration. 
   * @param dt change in time 
   * @param friction friction from 0 to 1, where 1 means no friction
   * @param lastDt optional last change in time 
   */
  verlet( dt:number, friction:number, lastDt?:number ):this {
    // Positional verlet: curr + (curr - prev) + a * dt * dt

    if (this._lock) {
      this.to( this._lockPt );
      // this._prev.to( this._lockPt );
    } else {

      // time corrected (https://en.wikipedia.org/wiki/Verlet_integration#Non-constant_time_differences)
      let lt = (lastDt) ? lastDt : dt; 
      let a = this._force.multiply( dt * (dt+lt)/2  );
      let v = this.changed.multiply( friction * dt/lt ).add( a );

      this._prev = this.clone();
      this.add( v );
      
      this._force = new Pt();
    }
    return this;
  }


  /**
   * Hit this particle with an impulse.
   * @param args an impulse vector defined by either a list of numeric parameters, an array of numbers, or an object with {x,y,z,w} properties
   * @example `hit(10, 20)`, `hit( new Pt(5, 9) )`
   */
  hit( ...args ):this {
    this._prev.subtract( new Pt(...args).$divide( Math.sqrt(this._mass) ) );
    return this;
  }


  /**
   * Check and respoond to collisions between this and another particle.
   * @param p2 another particle
   * @param damp damping value between 0 to 1, where 1 means no damping.
   */
  collide( p2:Particle, damp:number=1 ):void {
    // reference: http://codeflow.org/entries/2010/nov/29/verlet-collision-with-impulse-preservation
    // simultaneous collision not yet resolved. Possible solutions in this paper: https://www2.msm.ctw.utwente.nl/sluding/PAPERS/dem07.pdf 

    let p1 = this;
    let dp = p1.$subtract( p2 );
    let distSq = dp.magnitudeSq();
    let dr = p1.radius + p2.radius;
    
    if ( distSq < dr*dr ) {

      let c1 = p1.changed;
      let c2 = p2.changed;

      let dist = Math.sqrt( distSq );
      let d =  dp.$multiply( ((dist-dr) / dist) / 2 );

      let np1 = p1.$subtract( d );
      let np2 = p2.$add( d );

      p1.to( np1 );
      p2.to( np2 );
      
      let f1 = damp*dp.dot(c1)/distSq;
      let f2 = damp*dp.dot(c2)/distSq;

      let dm1 = p1.mass / (p1.mass+p2.mass);
      let dm2 = p2.mass / (p1.mass+p2.mass);

      c1.add( new Pt( f2*dp[0] - f1*dp[0], f2*dp[1] - f1*dp[1] ).$multiply( dm2 ) );
      c2.add( new Pt( f1*dp[0] - f2*dp[0], f1*dp[1] - f2*dp[1] ).$multiply( dm1 ) );

      p1.previous = p1.$subtract( c1 ); 
      p2.previous = p2.$subtract( c2 ); 

    }
  }
  

  /**
   * Get a string representation of this particle
   */
  toString():string {
    return `Particle: ${this[0]} ${this[1]} | previous ${this._prev[0]} ${this._prev[1]} | mass ${this._mass}`;
  }

}


/**
 * Body is a subclass of [`Group`](#link) that stores a set of [`Particle`](#link)s and edge constraints. It is usually added into a [`World`](#link) to create physics simulations. 
 * See [a demo here](../demo/index.html?name=physics.shapes).
 */
export class Body extends Group {

  protected _cs:Array<number[]> = [];
  protected _stiff:number = 1;
  protected _locks:{ [index:string]: Particle } = {};
  protected _mass:number = 1;

  /**
   * Create an empty Body, this is usually followed by [`Body.init`](#link) to populate the Body. Alternatively, use static function [`Body.fromGroup`](#link) to create and initate a body directly.
   */
  constructor() {
    super();
  }

  
  /**
   * Create and populate a body with a group of Pts.
   * @param list a group of Pts
   * @param stiff stiffness value from 0 to 1, where 1 is the most stiff. Default is 1.
   * @param autoLink Automatically create links between the Pts. This usually works for regular convex polygons. Default is true.
   * @param autoMass Automatically calculate the mass based on the area of the polygon. Default is true.
   */
  static fromGroup( list:GroupLike, stiff:number=1, autoLink:boolean=true, autoMass:boolean=true ):Body {
    let b = new Body().init( list );
    if (autoLink) b.linkAll( stiff );
    if (autoMass) b.autoMass();
    return b;
  }


  /**
   * Initiate a body.
   * @param list a group of Pts
   * @param stiff stiffness value from 0 to 1, where 1 is the most stiff. Default is 1.
   */
  init( list:GroupLike, stiff:number=1 ):this {
    let c = new Pt();
    for (let i=0, len=list.length; i<len; i++) {
      let p = new Particle( list[i] );
      p.body = this;
      c.add( list[i] );
      this.push( p );
    }

    this._stiff = stiff;
    
    return this;
  } 


  /**
   * Get mass of this body. 
   */
  get mass():number { return this._mass; }
  set mass( m:number ) { 
    this._mass = m; 
    for (let i=0, len=this.length; i<len; i++) {
      (this[i] as Particle).mass = this._mass;
    }
  }


  /**
   * Automatically calculate a body's `mass` based on the area of the polygon.
   */
  autoMass():this {
    this.mass = Math.sqrt( Polygon.area( this ) ) / 10;
    return this;
  }


  /**
   * Create a linked edge between two points.
   * @param index1 first point by index
   * @param index2 first point by index
   * @param stiff optionally stiffness value between 0 to 1, where 1 is the most stiff.
   */
  link( index1:number, index2:number, stiff?:number ):this {
    if (index1 < 0 || index1 >= this.length) throw new Error( "index1 is not in the Group's indices");
    if (index2 < 0 || index2 >= this.length) throw new Error( "index1 is not in the Group's indices");

    let d = this[index1].$subtract( this[index2] ).magnitude();
    this._cs.push( [index1, index2, d, stiff || this._stiff] );
    return this;
  }



  /**
   * Automatically create links for all the points to preserve the initial body shape. This usually works for regular convex polygon.
   * @param stiff optionally stiffness value between 0 to 1, where 1 is the most stiff.
   */
  linkAll( stiff:number ):void {
    let half = this.length/2;

    for (let i=0, len=this.length; i<len; i++) {
      let n = (i >= len-1) ? 0 : i+1;
      this.link( i, n, stiff ); 

      if (len > 4) {
        let nd = (Math.floor(half/2))+1;
        let n2 = (i >= len-nd) ? i%len : i+nd;
        this.link( i, n2, stiff ); 
      }

      if (i <= half-1) {
        this.link( i, Math.min( this.length-1, i+Math.floor( half )) );
      }
    }
  }


  /**
   * Return a list of all the linked edges as line segments.
   * @returns an array of Groups, each of which represents an edge
   */
  linksToLines():Group[] {
    let gs = [];
    for (let i=0, len=this._cs.length; i<len; i++) {
      let ln = this._cs[i];
      gs.push( new Group( this[ ln[0] ], this[ ln[1] ] ) );
    }
    return gs;
  }
 

  /**
   * Recalculate all edge constraints.
   */
  processEdges():void {
    for (let i=0, len=this._cs.length; i<len; i++) {
      let [m, n, d, s] = this._cs[i];
      World.edgeConstraint( this[m] as Particle, this[n] as Particle, d, s );
    }
  }


  /**
   * Check and respond to collisions between two bodies.
   * @param b another body
   */
  processBody( b:Body ):void {

    let b1 = this;
    let b2 = b;

    let hit = Polygon.hasIntersectPolygon( b1, b2 );

    if (hit) {
      let cv = hit.normal.$multiply( hit.dist );
    
      let t;    
      let eg = hit.edge;
      if ( Math.abs( eg[0][0] - eg[1][0] ) > Math.abs( eg[0][1] - eg[1][1] ) ) {
        t = ( hit.vertex[0] - cv[0] - eg[0][0]) / (eg[1][0] - eg[0][0]);
      } else {
        t = ( hit.vertex[1] - cv[1] - eg[0][1] )/( eg[1][1] - eg[0][1]);
      }

      let lambda = 1/(t*t + (1-t)*(1-t));

      let m0 = (hit.vertex as Particle).body.mass || 1;
      let m1 = (hit.edge[0] as Particle).body.mass || 1;
      let mr0 = m0 / (m0+m1);
      let mr1 = m1 / (m0+m1);

      eg[0].subtract( cv.$multiply( mr0*(1-t)*lambda/2 ) );
      eg[1].subtract( cv.$multiply( mr0*t*lambda/2 ) );

      hit.vertex.add( cv.$multiply(mr1) );
    }

  }


  /**
   * Check and respond to collisions between this body and a particle.
   * @param b a particle
   */
  processParticle( b:Particle ):void {

    let b1 = this;
    let b2 = b;

    let hit = Polygon.hasIntersectCircle( b1, Circle.fromCenter( b, b.radius ) );

    if (hit) {
      let cv = hit.normal.$multiply( hit.dist );
    
      let t;    
      let eg = hit.edge;
      if ( Math.abs( eg[0][0] - eg[1][0] ) > Math.abs( eg[0][1] - eg[1][1] ) ) {
        t = ( hit.vertex[0] - cv[0] - eg[0][0]) / (eg[1][0] - eg[0][0]);
      } else {
        t = ( hit.vertex[1] - cv[1] - eg[0][1] )/( eg[1][1] - eg[0][1]);
      }

      let lambda = 1/(t*t + (1-t)*(1-t));
      let m0 = (hit.vertex as Particle).mass || b2.mass || 1;
      let m1 = (hit.edge[0] as Particle).body.mass || 1;

      let mr0 = m0 / (m0+m1);
      let mr1 = m1 / (m0+m1);

      eg[0].subtract( cv.$multiply( mr0*(1-t)*lambda/2 ) );
      eg[1].subtract( cv.$multiply( mr0*t*lambda/2 ) );

      let c1 = b.changed.add( cv.$multiply(mr1) );
      b.previous = b.$subtract( c1 );

      // let c2 = b2.changed.add( cv.$multiply(mr0) );
      // b2.previous = b2.$subtract( c2 );
    }
  
  }

}