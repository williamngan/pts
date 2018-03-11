import {Pt} from "./Pt";


export class Physics extends Array<Particle> {

  protected _gravity:Pt = new Pt();
  protected _friction:number = 1;
  private _lastTime:number = null;

  constructor(...args) {
    super(...args);  
  }

  get gravity():Pt { return this._gravity; }
  set gravity( g:Pt ) { this._gravity = g; }

  get friction():number { return this._friction; }
  set friction( f:number ) { this._friction = f; }


  integrate( p:Particle, dt:number, prevDt?:number ):Particle {

    // console.log( "-->", p.toString() );
    p.addForce( this._gravity );
    // console.log( ">>>>", p.toString() );
    // p.multiplyForce( this._friction );
    // console.log( ">>>>!!", p.toString() );

    // let dd = p.changed.multiply( this._friction );
    // console.log( dd, "!" );
    // let step = p.multiplyForce( dt*dt );
    // console.log( dd.$add( step ), "!!!" );
    
    // p.step( dd.add( step ), true );
    p.verlet( dt, this._friction, prevDt );

    return p;
  }


  integrateAll( dt:number, timeCorrected:boolean=true ):void {
    let t = (timeCorrected) ? this._lastTime : undefined;
    for (let i=0, len=this.length; i<len; i++) {
      this.integrate( this[i], dt, t );
    }
    this._lastTime = dt;
  }


  static constraintSpring( p1:Particle, p2:Particle, stiff:number, damp:number ):Particle {
    const m1 = 1 / (p1.mass || 1);
    const m2 = 1 / (p2.mass || 1);
    const mm = m1 + m2;

    let d = p2.previous.$subtract( p1.previous );
    d.multiply( stiff * damp + mm );
    p1.addForce( d );

    return p1;
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

  get changed():Pt { return this.$subtract( this._prev ); }

  addForce( ...args ):Pt {
    this._force.add( ...args );
    return this._force;
  }

  multiplyForce( ...args ):Pt {
    this._force.multiply( ...args );
    return this._force;
  } 

  verlet( dt:number, damp:number, lastDt?:number ):this {
    // let dd = p.changed.multiply( this._friction );
    // console.log( dd, "!" );
    // let step = p.multiplyForce( dt*dt );
    // let dd = this.changed.multiply( friction );
    let a = this._force.$divide( this._mass ).multiply( dt*dt );
    let t = (lastDt) ? dt/lastDt : 1; // time corrected
    let v = this.changed.multiply( damp*t );

    this._prev = this.clone();
    this.add( v.add( a ) );
    
    this._force = new Pt();
    return this;
  }

  impulse( f:Pt ) {
    this._prev.subtract( f.$divide( this._mass ) );
  }

  toString() {
    return `Particle: ${this[0]} ${this[1]} | prev ${this._prev[0]} ${this._prev[1]} | mass ${this._mass}`;
  }

}

