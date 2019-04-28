// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "Perpendicular demo in Op guide.";

//// Demo code starts (anonymous function wrapper is optional) ---

(function() {
  
  let run = Pts.quickStart( "#pt", "#e2e6ef" );
  let pts;

  run( (time, ftime)  => {
    // would be better to init this in player's `start` function, but we are lazy here.
    if (!pts) pts = Create.distributeRandom( space.innerBound, 100 );

    let path = [new Pt(), space.pointer];    
    let perpends = pts.map( (p) => [p, Line.perpendicularFromPt( path, p )] );

    form.strokeOnly("#42e", 5).line( path );
    form.strokeOnly("#123", 1).lines( perpends );
    form.fillOnly("#123").points( pts, 2, "circle" );
  });

  //// ----  

  space.bindMouse().bindTouch().play();

})();