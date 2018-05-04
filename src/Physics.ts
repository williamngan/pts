
import {Pt, PtLike, Group, GroupLike} from "./Pt";
import {Bound} from "./Bound";
import { Rectangle, Polygon, Circle } from "./Op";
import { ParsedPath } from "path";


export class World {

  protected _gravity:Pt = new Pt();
  protected _friction:number = 1;
  protected _damping:number = 0.75;
  protected _precise:boolean = false;
  protected _bound:Bound;
  private _lastTime:number = null;

  protected _particles:Particle[] = [];
  protected _bodies:Body[] = [];

  protected _drawParticles:(p:Particle, i:number) => void;
  protected _drawBodies:(p:Body, i:number) => void;

  constructor( bound:Group, friction:number=1, gravity:Pt|number=0, precision:boolean=false ) {
    this._bound = Bound.fromGroup( bound );
    this._friction = friction;
    this._precise = precision;
    this._gravity = (typeof gravity === "number") ? new Pt( 0, gravity) : gravity;
    return this;

  }

  drawParticles( fn:(p:Particle, i:number) => void ):void {
    this._drawParticles = fn;
  }

  drawBodies( fn:(p:Body, i:number) => void ):void {
    this._drawBodies = fn;
  }


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



  get gravity():Pt { return this._gravity; }
  set gravity( g:Pt ) { this._gravity = g; }

  get friction():number { return this._friction; }
  set friction( f:number ) { this._friction = f; }

  get damping():number { return this._damping; }
  set damping( f:number ) { this._damping = f; }

  get bodyCount():number { return this._bodies.length; }
  get particleCount():number { return this._particles.length; }

  add( p:Particle|Body ):this {
    if ( p instanceof Body) {
      this._bodies.push( <Body>p );
    } else {
      this._particles.push( <Particle>p );
    }
    return this;
  }


  body( index:number ) { return this._bodies[index]; }
  particle( index:number ) { return this._particles[index]; }

  
  integrate( p:Particle, dt:number, prevDt?:number ):Particle {
    
    p.addForce( this._gravity );
    p.verlet( dt, this._friction, prevDt );

    return p;
  }



  update( ms:number ) {
    let dt = ms/1000;
    this._updateParticles( dt );
    this._updateBodies( dt );
  }

  _updateParticles( dt:number ) {
    
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


  _updateBodies( dt:number ) {
    for (let i=0, len=this._bodies.length; i<len; i++) {
      let b = this._bodies[i];

      // integrate
      for (let k=0, klen=b.length; k<klen; k++) {
        let bk = b[k] as Particle;
        World.boundConstraint( bk, this._bound, this._damping );
        this.integrate( bk, dt, this._lastTime );
      }
    
      for (let k=i+1; k<len; k++) {
        b.processBody( this._bodies[k] );
      }

      for (let m=0, mlen=this._particles.length; m<mlen; m++) {
        b.processParticle( this._particles[m] );
      }

      // constraints
      b.processEdges();

      // render
      if (this._drawBodies) this._drawBodies( b, i );
    }
  } 

  
}




export class Particle extends Pt {

  protected _mass:number = 1;
  protected _radius:number = 0;
  protected _force:Pt = new Pt();
  protected _prev:Pt = new Pt();
  
  protected _body:Body;
  protected _lock:boolean = false;
  protected _lockPt:Pt;

  constructor( ...args ) {
    super( ...args );
    this._prev = this.clone();
  }

  get mass():number { return this._mass; }
  set mass( m:number ) { this._mass = m; }

  get radius():number { return this._radius; }
  set radius( f:number ) { this._radius = f; }

  get force():Pt { return this._force; }
  set force( g:Pt ) { this._force = g; }
  
  get previous():Pt { return this._prev; }
  set previous( p:Pt ) { this._prev = p; }

  get body():Body { return this._body; }
  set body( b:Body ) { this._body = b; }

  get lock():boolean { return this._lock; }
  set lock( b:boolean ) { 
    this._lock = b; 
    this._lockPt = this.clone();
  }

  get changed():Pt { return this.$subtract( this._prev ); }

  size( r:number ):this {
    this._mass = r;
    this._radius = r;
    return this;
  }

  addForce( ...args ):Pt {
    this._force.add( ...args );
    return this._force;
  }

  verlet( dt:number, friction:number, lastDt?:number ):this {
    // Positional verlet: curr + (curr - prev) + a * dt * dt

    if (this._lock) {
      this.to( this._lockPt );
      this._prev.to( this._lockPt );
    }

    // time corrected (https://en.wikipedia.org/wiki/Verlet_integration#Non-constant_time_differences)
    let lt = (lastDt) ? lastDt : dt; 
    let a = this._force.multiply( dt * (dt+lt)/2  );
    let v = this.changed.multiply( friction * dt/lt ).add( a );

    this._prev = this.clone();
    this.add( v );
    
    this._force = new Pt();
    return this;
  }

  hit( ...args ) {
    this._prev.subtract( new Pt(...args).$divide( Math.sqrt(this._mass) ) );
  }

  inertia() {
    let p = this.changed.add( this );
    this.previous = this.clone();
    this.to( p );
  }


  collide( p2:Particle, damp:number=1 ) {
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
  

  toString() {
    return `Particle: ${this[0]} ${this[1]} | prev ${this._prev[0]} ${this._prev[1]} | mass ${this._mass}`;
  }

}



export class Body extends Group {

  protected _cs:Array<number[]> = [];
  protected _stiff:number = 1;
  protected _locks:{ [index:string]: Particle } = {};
  protected _mass:number = 1;

  constructor(...args:Pt[]) {
    super(...args);
  }

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

  get mass():number { return this._mass; }
  set mass( m:number ) { 
    this._mass = m; 
    for (let i=0, len=this.length; i<len; i++) {
      (this[i] as Particle).mass = this._mass;
    }
  }

  autoMass():this {
    this.mass = Math.sqrt( Polygon.area( this ) ) / 10;
    return this;
  }

  static fromGroup( list:GroupLike, stiff:number=1, autoLink:boolean=true, autoMass:boolean=true ):Body {
    let b = new Body().init( list );
    if (autoLink) b.linkAll( stiff );
    if (autoMass) b.autoMass();
    return b;
  }



  static rectangle( rect:GroupLike, stiff?:number ):Body {
    let pts = Rectangle.corners( rect );
    let body = new Body().init( pts );
    return body.link(0, 1, stiff).link(1, 2, stiff).link(2, 3, stiff).link( 3, 0, stiff ).link(1, 3, stiff).link(0, 2, stiff);
  }


  link( index1:number, index2:number, stiff?:number ):this {
    if (index1 < 0 || index1 >= this.length) throw new Error( "index1 is not in the Group's indices");
    if (index2 < 0 || index2 >= this.length) throw new Error( "index1 is not in the Group's indices");

    let d = this[index1].$subtract( this[index2] ).magnitude();
    this._cs.push( [index1, index2, d, stiff || this._stiff] );
    return this;
  }



  linkAll( stiff:number ) {
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



  linksToLines():Group[] {
    let gs = [];
    for (let i=0, len=this._cs.length; i<len; i++) {
      let ln = this._cs[i];
      gs.push( new Group( this[ ln[0] ], this[ ln[1] ] ) );
    }
    return gs;
  }
 

  processEdges() {
    for (let i=0, len=this._cs.length; i<len; i++) {
      let [m, n, d, s] = this._cs[i];
      World.edgeConstraint( this[m] as Particle, this[n] as Particle, d, s );
    }
  }



  processBody( b:Body ) {

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


  processParticle( b:Particle ) {

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