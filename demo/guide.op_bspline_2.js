// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "B-spline demo in Op guide.";

//// Demo code starts (anonymous function wrapper is optional) ---

(function() {
  
  let run = Pts.quickStart( "#pt", "#e2e6ef" );
  let pts;

  run( (time, ftime)  => {
    // would be better to init this in player's `start` function, but we are lazy here.
    if (!pts) pts = Create.distributeRandom( space.innerBound, 100 );

    let t = space.pointer;
    pts.sort( (a,b) => a.$subtract(t).magnitudeSq() - b.$subtract(t).magnitudeSq() );
    
    let ten = pts.slice(0, 10);
    let curve = Polygon.convexHull( ten );
    curve.insert( curve.slice(0, 3), curve.length );
    

    form.fillOnly("#123").points( pts, 2, "circle" );
    form.strokeOnly("#fff",3).line( curve );
    form.stroke("#123").polygon( Curve.bspline( curve ) );
    
    let pp = ten.map( (p) => [space.pointer, p] );
    form.strokeOnly("#f05", 2).lines( pp );
  });

  //// ----  

  space.bindMouse().bindTouch().play();

})();