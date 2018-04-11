
import {Pt, PtLike, Group} from "./Pt";
import {Bound} from "./Bound";


export class Physics extends Array<Particle> {

  static constraintEdge( p1:Particle, p2:Particle, dist:number, stiff:number=0.9 ) {
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



  static constraintBound( p:Particle, rect:Group, damp:number=0.9, keepImpulse:boolean=true ) {
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
  static collideParticle( p1:Particle, p2:Particle, damp:number=0.9, keepImpulse:boolean=true ) {
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


  /*

  // compute the projected component factors
    var f1 = (damping*(x*v1x+y*v1y))/slength;
    var f2 = (damping*(x*v2x+y*v2y))/slength;

    // swap the projected components
    v1x += f2*x-f1*x;
    v1y += f2*y-f1*y;
    v2x += f1*x-f2*x;
    v2y += f1*y-f2*y;
    

    // the previous position is adjusted
    // to represent the new velocity
    body1.px = body1.x - v1x;
    body1.py = body1.y - v1y;
    body2.px = body2.x - v2x;
    body2.py = body2.y - v2y;

var collide = function(){
    for(var i=0, l=bodies.length; i<l; i++){
        var body1 = bodies[i];
        for(var j=i+1; j<l; j++){
            var body2 = bodies[j];
            var x = body1.x - body2.x;
            var y = body1.y - body2.y;
            var slength = x*x+y*y;
            var length = Math.sqrt(slength);
            var target = body1.radius + body2.radius;

            // if the spheres are closer
            // then their radii combined
            if(length < target){ 
                var factor = (length-target)/length;
                // move the spheres away from each other
                // by half the conflicting length
                body1.x -= x*factor*0.5;
                body1.y -= y*factor*0.5;
                body2.x += x*factor*0.5;
                body2.y += y*factor*0.5;
            }
        }
    }
    */

}

export class World extends Array<Particle> {

  protected _gravity:Pt = new Pt();
  protected _friction:number = 1;
  protected _bound:Bound;
  private _lastTime:number = null;

  constructor(...args) {
    super(...args);  
  }

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


  integrate( p:Particle, dt:number, prevDt?:number ):Particle {

    p.addForce( this._gravity.$multiply( p.mass ) ); // multiply mass to cancel it out later
    p.positionVerlet( dt, this._friction, prevDt );

    return p;
  }


  integrateAll( dt:number, timeCorrected:boolean=true ):void {
    let t = (timeCorrected) ? this._lastTime : undefined;
    for (let i=0, len=this.length; i<len; i++) {
      this.integrate( this[i], dt, t );
    }
    this._lastTime = dt;
  }


  
}




export class Particle extends Pt {

  protected _mass:number = 1;
  protected _radius:number = 0;
  protected _force:Pt = new Pt();
  protected _prev:Pt = new Pt();

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

  get changed():Pt { return this.$subtract( this._prev ); }

  addForce( ...args ):Pt {
    this._force.add( ...args );
    return this._force;
  }


  positionVerlet( dt:number, friction:number, lastDt?:number ):this {
    // Positional verlet: curr + (curr - prev) + a * dt * dt
    let a = this._force.$divide( this._mass ).multiply( dt*dt );
    let t = (lastDt) ? dt/lastDt : 1; // time corrected
    let v = this.changed.multiply( friction * t ).add( a );

    this._prev = this.clone();
    this.add( v );
    
    this._force = new Pt();
    return this;
  }

  impulse( ...args ) {
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



