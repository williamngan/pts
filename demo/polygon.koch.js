// Source code licensed under Apache License 2.0. Copyright © 2017 William Ngan.
// (https://github.com/williamngan/pts)

window.demoDescription = "Koch snowflakes with interpolation.";

Pts.quickStart("#pt", "#207");

//// Demo code starts (anonymous function wrapper is optional) ---

(function () {

  let kochs = [];
  let tris = [];
  let colors = ['#4af', "#fe0", "#f39"];
  
  class Koch extends Group {
    constructor() {
      super(...arguments);
      this.mag = this[0].$subtract(this[1]).magnitude();
      this.vsize = (this.mag/3) * 1.73205080757 / 2; // r*sqrt(3)/2 = height of eq triangle
      this.depth = 0;
      this.subs = []; // branches
      this.calc();
    }

    calc() {
      let uvec = this[0].$subtract(this[1]).$unit();
      this.midPt = this.interpolate( 0.5 );
      this.topPt = this.midPt.$add( new Pt( -uvec.y, uvec.x ).multiply( this.vsize ) );
      this.leftPt = this.interpolate( 1/3 );
      this.rightPt = this.interpolate( 2/3 );
    }

    // recursively calculate all subdivisions by depth
    subdivide( maxDepth ) {
      if (this.depth < maxDepth-1 ) {
        let seq = [this[0], this.leftPt, this.topPt, this.rightPt, this[1]];
        for (let i=0, len=seq.length-1; i<len; i++) {
          let ko = new Koch( seq[i], seq[i+1] )
          ko.depth = this.depth+1;
          this.subs.push( ko.subdivide( maxDepth ) )
        }
      }
      return this;
    }

    // interpolate each triangle height at t
    at( t=0 ) {
      if (t <= 1) {
        this.calc();
        let p = new Group( this.midPt, this.topPt ).interpolate( t );

        if (this.subs.length > 0) {
          let seq = [this[0], this.leftPt, p, this.rightPt, this[1]];
          for (let i=0, len=seq.length-1; i<len; i++) {
            this.subs[i][0].set( seq[i] );
            this.subs[i][1].set( seq[i+1] );
          }
        }
        return (this.subs.length > 0) ? this.subs : [this];
      } else {
        return [this];
      }
    }
    
    draw( dt=0, index=1 ) { 
      let poly = this.at( dt ).map( pair => pair[0] );
      form.fill( colors[ index % 3] ).stroke( colors[ index % 3] ).polygon( poly );
      this.subs.forEach( s => s.draw(dt, index) );
    }
  }

  space.add({
    start: (bound) => {
      tris = [
        Triangle.fromCenter( space.center, space.size.y*0.2 ).rotate2D(Math.PI/2, space.center),
        Triangle.fromCenter( space.center, space.size.y*0.35 ).rotate2D(Math.PI, space.center),
        Triangle.fromCenter( space.center, space.size.y*0.47 )
      ];

      for (let i=0, len=tris.length; i<len; i++) {
        kochs.push( tris[i].map( (t, idx) => {
          let ko = new Koch( tris[i][idx-1 < 0 ? 2 : idx-1], t ); // connect prev and current
          return ko.subdivide( i+3 );
        }));
      }
      
    },

    animate: (time, ftime) => {
      let t = 1 - (Math.abs(space.pointer.x-space.center.x) / (space.center.x));

      for (let len=kochs.length, i=len-1; i>=0; i--) {
        kochs[i].forEach( k => k.draw( t, i ) );
      }
      for (let len=tris.length, i=len-1; i>=0; i--) {
        form.strokeOnly( colors[ i % 3], 8-i*2, "round" ).polygon( tris[i]);
      }
    }

  });

  //// ----

  space.bindMouse().bindTouch().play();

})();