// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "Nearest point demo in Op guide.";

//// Demo code starts (anonymous function wrapper is optional) ---

(function() {
  
  let run = Pts.quickStart( "#pt", "#e2e6ef" );
  let pts;

  run( (time, ftime)  => {
    // would be better to init this in player's `start` function, but we are lazy here.
    if (!pts) pts = Create.distributeRandom( space.innerBound, 100 );

    let t = space.pointer;
    pts.sort( (a,b) => a.$subtract(t).magnitudeSq() - b.$subtract(t).magnitudeSq() );
    
    form.fillOnly("#123").points( pts, 2, "circle" );
    form.fill("#f05").point( pts[0], 10, "circle" );
    form.strokeOnly("#f05", 2).line( [pts[0], space.pointer] );
  });

  //// ----  

  space.bindMouse().bindTouch().play();

})();