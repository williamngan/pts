// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "Draw three cardinal curves with different tensions. Move pointer near the control points to modify the curve.";

Pts.quickStart( "#pt", "#0c6" );

//// Demo code starts (anonymous function wrapper is optional) ---

(function() {

  let pts, temp;

  space.add({ 
    start: (bound) => {

      // make 10 pts between 10% to 90% of space's boundary
      pts = Line.subpoints( [space.size.$multiply(0.1), space.size.$multiply(0.9) ], 10 );
      temp = pts.clone();
    },

    animate: (time, ftime) => {

      for (let i=0, len=temp.length; i<len; i++) {
        let d = pts[i].$subtract( space.pointer );

        // push out if inside threshold (100 radius)
        if ( d.magnitudeSq() < 100*100 ) {
          temp[i].to( space.pointer.$add( d.unit().$multiply( 100 ) ) );

        // pull in if outside threshold
        } else {
          if ( !pts[i].equals( temp[i], 0.1) ) {
            temp[i].to( Geom.interpolate( temp[i], pts[i], 0.02) );
          }
        }
      }

      
      
      form.fillOnly("rgba(255, 230, 0, 0.9)").line( Curve.catmullRom( temp, 10 ) );
      form.stroke("#f06").line( Curve.cardinal( temp, 10, 0.2 ) );
      form.strokeOnly("#123", 3).line( Curve.cardinal( temp, 10, 0.8 ) );
      form.fill("#fff").points( temp, 5, "circle" );
    },
    
  });

  //// ----
  

  space.bindMouse().bindTouch().play();

})();