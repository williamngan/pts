window.demoDescription = "Create a set of points around a center point, varying each's radius slightly. Draw a b-spline curve around the points.";

(function() {

  Pts.namespace( this );

  var space = new CanvasSpace("#pt").setup({bgcolor: "#f03", resize: true, retina: true});
  var form = space.getForm();


  //// Demo code ---

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

      for (let i=0, len=temp.length; i<len; i++) {
        let d = pts[i].$subtract( space.pointer );

        // push out if inside threshold 
        if ( d.magnitudeSq() < radius*radius ) {
          temp[i].to( space.pointer.$add( d.unit().$multiply( radius   ) ) );

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

      form.fillOnly("#fff").line( Curve.bspline( tempB, 10 ) );
      form.fill("rgba(255, 255, 255, 0.5)").points( temp, 2, "circle" );
      form.fill("#fd6").point( temp.centroid(), radius/3, "circle" );
    },
    
  });

  //// ----
  

  space.bindMouse().bindTouch().play();

})();