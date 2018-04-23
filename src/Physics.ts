
import {Pt, PtLike, Group, GroupLike} from "./Pt";
import {Bound} from "./Bound";
import { Rectangle, Polygon, Circle } from "./Op";


export class Physics extends Array<Particle> {

  static constraintEdge( p1:Particle, p2:Particle, dist:number, stiff:number=0.95 ) {
    const m1 = 1 / (p1.mass || 1);
    const m2 = 1 / (p2.mass || 1);
    const mm = m1 + m2;

    let delta = p2.$subtract( p1 );
    let distSq = dist * dist;
    let d = distSq / ( delta.dot( delta ) + distSq ) - 0.5; // approx square root
    let f = delta.$multiply( d * stiff );

    p1.subtract( f.$multiply( m1/mm ) );
    p2.add( f.$multiply( m2/mm ) );
    
    return p1;
  }



  static constraintBound( p:Particle, rect:Group, damp:number=0.95, keepImpulse:boolean=true ) {
    let bound = rect.boundingBox();
    let np = p.$min( bound[1].subtract( p.radius ) ).$max( bound[0].add( p.radius ) );

    if (keepImpulse) {
      if (np[0] === bound[0][0] || np[0] === bound[1][0]) { // hit vertical walls
        let c = p.changed;
        p.previous = np.$subtract( new Pt( c[0]*-1*damp, c[1] ) );
      } else if (np[1] === bound[0][1] || np[1] === bound[1][1]) { // hit horizontal walls
        let c = p.changed;
        p.previous = np.$subtract( new Pt( c[0], c[1]*-1*damp ) );
      }
    }
    p.to( np );

  }

  // Inspired by http://codeflow.org/entries/2010/nov/29/verlet-collision-with-impulse-preservation/
  static collideParticle( p1:Particle, p2:Particle, damp:number=0.95, keepImpulse:boolean=true ) {
    let dp = p1.$subtract( p2 );
    let distSq = dp.magnitudeSq();
    let dr = p1.radius + p2.radius;
    if ( distSq < dr*dr ) {

      let c1 = p1.changed;
      let c2 = p2.changed;

      let dist = Math.sqrt( distSq );
      let d =  dp.$multiply( ((dist-dr) / dist) / 2 );
      
      p1.subtract( d );
      p2.add( d );

      if (keepImpulse) {
        
        let df1 = dp.$multiply( damp * dp.dot( c1 ) / distSq );
        let df2 = dp.$multiply( damp * dp.dot( c2 ) / distSq );
        let df = df2.subtract( df1 );

        let dm1 = p1.mass / (p1.mass+p2.mass);
        let dm2 = p2.mass / (p1.mass+p2.mass);

        c1.add( df.$multiply( dm2 ) );
        c2.add( df.multiply(-dm1) );

        p1.previous = p1.$subtract( c1 );
        p2.previous = p2.$subtract( c2 );

      }
      
    }
  }

}

export class World {

  protected _gravity:Pt = new Pt();
  protected _friction:number = 1;
  protected _bound:Bound;
  private _lastTime:number = null;

  protected _particles:Particle[] = [];
  protected _bodies:Body[] = [];


  setup( bound:Group, friction:number=1, gravity?:Pt ):this {
    this._bound = Bound.fromGroup( bound );
    this._friction = friction;
    if (gravity) this._gravity = gravity;
    return this;
  }


  get gravity():Pt { return this._gravity; }
  set gravity( g:Pt ) { this._gravity = g; }

  get friction():number { return this._friction; }
  set friction( f:number ) { this._friction = f; }

  get bodyCount():number { return this._bodies.length; }
  get particleCount():number { return this._particles.length; }

  addParticle( p:Particle ) {
    this._particles.push( p );
  }

  addBody( b:Body ) {
    this._bodies.push( b );
  }

  body( index:number ) { return this._bodies[index]; }
  particle( index:number ) { return this._particles[index]; }

  


  integrate( p:Particle, dt:number, prevDt?:number ):Particle {
    

    p.addForce( this._gravity.$multiply( p.mass ) ); // multiply mass to cancel it out later
    p.verlet( dt, this._friction, prevDt );

    return p;
  }


  integrateAll( dt:number, timeCorrected:boolean=true ):void {
    let t = (timeCorrected) ? this._lastTime : undefined;
    
    for (let i=0, len=this._particles.length; i<len; i++) {
      this.integrate( this._particles[i], dt, t );
    }

    for (let i=0, len=this._bodies.length; i<len; i++) {
      let b = this._bodies[i];
      for (let k=0, klen=b.length; k<klen; k++) {
        this.integrate( b[k] as Particle, dt, t );
      }
    }
    this._lastTime = dt;
  }


  constrainAll() {
    for (let i=0, len=this._bodies.length; i<len; i++) {
      let b = this._bodies[i];
      b.constrain();

      for (let k=0, klen=b.length; k<klen; k++) {
        Physics.constraintBound( b[k] as Particle, this._bound );
      }
    }

    for (let i=0, len=this._particles.length; i<len; i++) {
      Physics.constraintBound( this._particles[i], this._bound );
    }
  }

  
}




export class Particle extends Pt {

  protected _mass:number = 1;
  protected _radius:number = 0;
  protected _force:Pt = new Pt();
  protected _prev:Pt = new Pt();
  protected _body:Body;

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

  get changed():Pt { return this.$subtract( this._prev ); }

  addForce( ...args ):Pt {
    this._force.add( ...args );
    return this._force;
  }


  verlet( dt:number, friction:number, lastDt?:number ):this {
    // Positional verlet: curr + (curr - prev) + a * dt * dt
    let a = this._force.$divide( this._mass ).multiply( dt*dt );
    let t = (lastDt) ? dt/lastDt : 1; // time corrected
    let v = this.changed.multiply( friction * t ).add( a );

    this._prev = this.clone();
    this.add( v );
    
    this._force = new Pt();
    return this;
  }

  hit( ...args ) {
    this._prev.subtract( new Pt(...args).$divide( this._mass ) );
  }

  inertia() {
    let p = this.changed.add( this );
    this.previous = this.clone();
    this.to( p );
  }

  toString() {
    return `Particle: ${this[0]} ${this[1]} | prev ${this._prev[0]} ${this._prev[1]} | mass ${this._mass}`;
  }

}



export class Body extends Group {

  protected _cs:Array<number[]> = [];


  static rectangle( rect:GroupLike, stiff:number=0.95 ):Body {
    let pts = Rectangle.corners( rect );
    let body = new Body().init( pts );
    return body.link(0, 1, stiff).link(1, 2, stiff).link(2, 3, stiff).link( 3, 0, stiff ).link(1, 3, stiff).link(0, 2, stiff);
  }

  
  init( list:GroupLike ):this {
    let c = new Pt();
    for (let i=0, len=list.length; i<len; i++) {
      let p = new Particle( list[i] );
      p.body = this;
      c.add( list[i] );
      this.push( p );
    }
    
    return this;
  } 



  link( index1:number, index2:number, stiff:number=0.95 ):this {
    if (index1 < 0 || index1 >= this.length) throw new Error( "index1 is not in the Group's indices");
    if (index2 < 0 || index2 >= this.length) throw new Error( "index1 is not in the Group's indices");

    let d = this[index1].$subtract( this[index2] ).magnitude();
    this._cs.push( [index1, index2, d, stiff] );
    return this;
  }


  constrain() {
    for (let i=0, len=this._cs.length; i<len; i++) {
      let [m, n, d, s] = this._cs[i];
      Physics.constraintEdge( this[m] as Particle, this[n] as Particle, d, s );
    }
  }



  process( b:Body ) {

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

      eg[0].subtract( cv.$multiply( (1-t)*lambda/2 ) );
      eg[1].subtract( cv.$multiply( t*lambda/2 ) );

      hit.vertex.add( cv.$multiply(0.5) );
    }

    // let cv = axis.multiply( dist );
    // let t;

    // if ( Math.abs( edge[0][0] - edge[1][0] ) > Math.abs( edge[0][1] - edge[1][1] ) ) {
    //   t = (v[0] - cv[0] - edge[0][0]) / (edge[1][0] - edge[0][0]);
    // } else {
    //   t = (v[1] - cv[1] - edge[0][1] )/( edge[1][1] - edge[0][1]);
    // }

    // let lambda = 1/(t*t + (1-t)*(1-t));

    // edge[0].subtract( cv.$multiply( (1-t)*lambda/2 ) );
    // edge[1].subtract( cv.$multiply( t*lambda/2 ) );

    // v.add( cv.divide(2) );
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

      eg[0].subtract( cv.$multiply( (1-t)*lambda/2 ) );
      eg[1].subtract( cv.$multiply( t*lambda/2 ) );

      // hit.vertex.add( cv.$multiply(0.5) );

      let c1 = b.changed;
      c1.add( cv.$multiply(0.5) );

      // console.log( cv.toString(), hit.dist, hit.normal );
      // c2.add( df.multiply(-dm1) );

      b.previous = b.$subtract( c1 );
      // p2.previous = p2.$subtract( c2 );
    }
  
  }

}