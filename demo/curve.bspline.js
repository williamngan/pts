// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "Create a set of points around a center point, varying each's radius slightly. Draw a b-spline curve and also show the corresponding bezier handles.";

Pts.quickStart( "#pt", "#f03" );

//// Demo code starts (anonymous function wrapper is optional) ---

(function() {

  let pts, temp, radius;

  space.add({ 
    start: (bound) => {
      // Make an egg with 10 radial points with slight randomness
      radius = space.size.minValue().value/3;
      pts = Create.radialPts( space.center, radius, 10  );
      pts.map( p => p.add( 20*(Math.random() - Math.random()) ) )
      temp = pts.clone();
    },

    animate: (time, ftime) => {

      let r = radius + radius * (Num.cycle(time%3000/3000) * 0.2);

      for (let i=0, len=temp.length; i<len; i++) {
        let d = pts[i].$subtract( space.pointer );

        // push out if inside threshold 
        if ( d.magnitudeSq() < r*r ) {
          temp[i].to( space.pointer.$add( d.unit().$multiply( r ) ) );

        // pull in if outside threshold
        } else {
          if ( !pts[i].equals( temp[i], 0.1) ) {
            temp[i].to( Geom.interpolate( temp[i], pts[i], 0.02) );
          }
        }
      }

      // close the bspline curve with 3 extra points
      let tempB = temp.clone();
      tempB.push( temp.p1 );
      tempB.push( temp.p2 );
      tempB.push( temp.p3 );

      // convert the b-spline anchors to Bezier control points and draw one native path
      let bezier = Curve.bsplineToBezier( tempB );
      form.fillOnly("#fff").bezier( bezier );
      form.fill("rgba(255, 255, 255, 0.5)").points( temp, 2, "circle" );
      form.fill("#fd6").point( temp.centroid(), radius/3, "circle" );

      // the Bezier anchors sit on the curve, each with a control point on either side
      let anchors = Curve.bezierToCardinal( bezier );
      form.strokeOnly("rgba(0,0,0,.7)", 1);
      for (let i=0, len=bezier.length-1; i<len; i+=3) {
        form.line( [bezier[i], bezier[i+1]] ).line( [bezier[i+2], bezier[i+3]] );
      }
    },
    
  });

  //// ----
  

  space.bindMouse().bindTouch().play();

})();