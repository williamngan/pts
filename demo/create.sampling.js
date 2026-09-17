// Source code licensed under Apache License 2.0.
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "Sampling circular areas with evenly spaced points. Move the pointer to comb, and click anywhere to settle back.";

Pts.quickStart( "#pt", "#fbf6ea" );

//// Demo code starts (anonymous function wrapper is optional) ---

(function() {

  var samples;               // a PoissonDisk is a Group of Pts that grows as you sample it
  var poles = new Group();   // five circle centers in the middle area of the frame
  var circleRadius = 0;
  var pts = new Group();     // the samples inside a circle, each with a hair
  var hairs = new Group();   // one hair per point: a short vector from the point
  var rest = new Group();    // each hair's resting direction, pointing to its circle's center
  var last = new Pt();       // last pointer position, to find how the pointer moves
  var comb = new Pt();       // pointer movement since the last frame
  var settleFrames = 0;      // frames left of easing back to rest after a click
  var combRadius = 60;
  var hairLength = 20;
  var maxLength = 200;       // how far a hair can be pulled

  // Hairs are colored by the direction they point, around a soft rainbow of even lightness (oklch) at 70% opacity
  var shades = [];
  for (let i = 0; i < 12; i++) {
    let c = Color.oklch( 0.72, 0.12, i * 30 ).toMode( "rgb", true );
    c.alpha = 0.7;
    shades.push( c.toString( "rgba" ) );
  }

  // Vector from a point to its nearest pole; the point is inside a circle when it's shorter than circleRadius
  var toPole = (p) => poles[ Polygon.nearestPt( poles, p ) ].$subtract( p );
  var inCircle = (p) => toPole( p ).magnitudeSq() <= circleRadius*circleRadius;

  // Place the five circles: centers land in the middle area of the frame, kept far enough
  // from the edges for the circles to fit. Clearing the hairs makes the next frame regrow them.
  var placePoles = () => {
    circleRadius = Math.min( space.size.x, space.size.y ) * 0.35;
    let inset = new Pt( Math.max( space.size.x/16, circleRadius ), Math.max( space.size.y/16, circleRadius ) );
    poles = Create.distributeRandom( new Bound( inset, space.size.$subtract( inset ) ), 5 );
    pts = new Group();
    hairs = new Group();
    rest = new Group();
  };

  // Start over with samples packed so that about 20000 of them fill the canvas
  var reset = () => {
    let radius = Math.sqrt( space.size.x * space.size.y / 20000 * 0.8 ) || 1;
    samples = new PoissonDisk().setup( space.innerBound, radius );
    hairLength = radius * 1.5;
    maxLength = hairLength * 5;
    placePoles();
  };

  space.add( {

    start: reset,


    animate: (time, ftime) => {

      // Fill phase: add some samples per frame and show the packing as it grows inside the circles
      if (!samples.done) {
        let n = samples.length;
        samples.sample( 300 );
        form.fillOnly( "rgba(74,63,58,.5)" ).points( samples.filter( inCircle ), 0.8, "circle" );
        form.fillOnly( shades[0] ).points( samples.slice( n ).filter( inCircle ), 1.5, "circle" );
        return;
      }

      // Once sampling finishes, grow a hair from every point inside a circle toward its center
      if (hairs.length === 0) {
        for (let p of samples) {
          if (inCircle( p )) {
            pts.push( p );
            rest.push( toPole( p ).unit().multiply( hairLength ) );
            hairs.push( rest[rest.length-1].clone() );
          }
        }
      }

      // Comb phase: hairs near the pointer are pulled along its movement and stay that way,
      // until a click eases every hair back to rest for a couple of seconds. Lines are collected
      // per shade so each shade is drawn in one pass.
      let strokes = shades.map( () => new Path2D() );
      let settling = settleFrames-- > 0;
      hairs.forEach( (h, i) => {
        let p = pts[i];
        let d = Math.hypot( p[0] - space.pointer[0], p[1] - space.pointer[1] );
        if (d < combRadius) {
          h.add( comb.$multiply( 1 - d/combRadius ) );
          let m = h.magnitude();
          if (m > maxLength) h.multiply( maxLength / m );
        }
        if (settling) h.to( Geom.interpolate( h, rest[i], 0.05 ) );

        let shade = Math.floor( (Math.atan2( h[1], h[0] ) / Const.two_pi + 0.5) * shades.length ) % shades.length;
        strokes[shade].moveTo( p[0], p[1] );
        strokes[shade].lineTo( p[0] + h[0], p[1] + h[1] );
      } );

      strokes.forEach( (path, i) => {
        form.strokeOnly( shades[i], 1 );
        form.ctx.stroke( path );
      } );
      comb.multiply( 0.5 ); // the pull fades once the pointer stops
    },


    action: (type, px, py) => {
      if (type === "move" || type === "drag") {
        comb.to( px - last[0], py - last[1] );
        last.to( px, py );
      } else if (type === "click") {
        settleFrames = 120;
      }
    },


    resize: reset

  } );

  //// ----

  space.bindMouse().bindTouch().play();

})();
