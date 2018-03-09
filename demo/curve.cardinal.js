// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "Draw three cardinal curves with different tensions. Move pointer near the control points to modify the curve.";

(function() {

  Pts.namespace( this );

  var space = new CanvasSpace("#pt").setup({bgcolor: "#f1f3f7", resize: true, retina: true});
  var form = space.getForm();


  //// Demo code ---

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

      form.strokeOnly("#f03").line( Curve.cardinal( temp, 10, 0.8 ) );
      form.stroke("#678").line( Curve.cardinal( temp, 10, 0.2 ) );
      form.fillOnly("rgba(0, 50, 255, 0.5)").line( Curve.catmullRom( temp, 10 ) );
      form.fill("#123").points( temp, 3, "circle" );
    },
    
  });

  //// ----
  

  space.bindMouse().bindTouch().play();

})();