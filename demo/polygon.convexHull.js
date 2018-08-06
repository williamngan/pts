// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "Use convex hull to envelope a set of points. Move the pointer to modify the boundary.";

Pts.quickStart( "#pt", "#0c3" );

//// Demo code starts (anonymous function wrapper is optional) ---

(function() {

  let pts;

  space.add({ 
    start: (bound) => {
      // Make a face with 30 radial points with slight randomness
      radius = space.size.minValue().value/3;
      pts = Create.radialPts( space.center, radius, 30  );
      pts.map( p => p.add( 50*(Math.random() - Math.random()) ) )
      
    },

    animate: (time, ftime) => {

      pts[pts.length-1] = space.pointer;

      // convex hull the points
      let hull = Polygon.convexHull( pts );

      // eyes' positions
      let left = space.center.$subtract( 50 );
      let right = space.center.$add( 50, -50 );
      let leftB = left.clone().toAngle( space.pointer.$subtract( left ).angle(), 10, left );
      let rightB = right.clone().toAngle( space.pointer.$subtract( right ).angle(), 10, right );

      // draw face and eyes
      form.fillOnly("rgba(255, 255, 255, 0.5)").polygon( hull );
      form.fill("#fff").points( [left, right], 20, "circle" );
      form.fill("#123").points( [leftB, rightB], 5, "circle" );

      // draw the hull and pts
      form.fill("#fff").points( hull, 5, "circle" );
      form.fill("rgba(0,0,0,.5)").points( pts, 2, "circle" );
      form.fill("#f03").point( space.pointer, 10, "circle" );

      // draw mouth
      form.strokeOnly("#123", 5).line( [left.$add(0,80), right.$add(0, 80)]);
      
    },
    
  });

  //// ----
  

  space.bindMouse().bindTouch().play();

})();