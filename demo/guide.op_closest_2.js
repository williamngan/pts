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
    
    form.fillOnly("#123", 1);
    pts.forEach( (p, i) => form.point( p, 20 - 20*i/pts.length, "circle" ) )

    form.fillOnly("#fff").points( pts, 2, "circle" );

    let three = pts.slice(0, 3);
    let threeLines = three.map( (p) => [p, space.pointer] );
    form.strokeOnly("#f05", 2).lines( threeLines );
    form.fillOnly("#f05").points( three, 3, "circle" );
  });

  //// ----  

  space.bindMouse().bindTouch().play();

})();