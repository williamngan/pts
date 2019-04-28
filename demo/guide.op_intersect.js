// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "Intersection demo in Op guide.";

//// Demo code starts (anonymous function wrapper is optional) ---

(function() {
  
  let run = Pts.quickStart( "#pt", "#e2e6ef" );
  let pts;

  run( (time, ftime)  => {

    // create 100 points and sort them by position
    // would be better to init this in player's `start` function, but we are lazy here.
    if (!pts) {
      pts = Create.distributeRandom( space.innerBound, 100 );
      pts.sort( (a,b) => (a[0]-b[0]) - (a[1]-b[1]) );
    }

    // get line segments and check intersections
    let pairs = pts.segments(2, 2);
    let hit = new Group( space.center, space.pointer ).op( Line.intersectLine2D );
    let hitPts = pairs.map( (pa) => hit( pa ) );

    form.strokeOnly("#123").lines( pairs );
    form.stroke("#42e").line([space.center, space.pointer]);
    form.fillOnly("#123").points( pts, 2, "circle" );
    form.fill("#42e").points( hitPts, 5, "circle" );

  });

  //// ----  

  space.bindMouse().bindTouch().play();

})();