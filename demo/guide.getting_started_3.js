// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "Demo in getting started guide.";

//// Demo code starts (anonymous function wrapper is optional) ---

(function() {
  
  let run = Pts.quickStart( "#pt", "#e2e6ef" );

  run( (time, ftime)  => {
    // rectangle
    var rect = Rectangle.fromCenter( space.center, space.size.$divide(2) );
    var poly = Rectangle.corners( rect );
    poly.shear2D( Num.cycle( time%2000/2000 ) - 0.5, space.center );
    
    // drawing
    form.fillOnly("#123").polygon( poly );
    form.strokeOnly("#fff", 3).rect( rect );
  });

  //// ----  

  space.bindMouse().bindTouch().play();

})();