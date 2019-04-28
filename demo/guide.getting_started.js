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
    poly.shear2D( Num.cycle( time%5000/5000 ) - 0.5, space.center );
    
    // triangle
    var tris = poly.segments( 2, 1, true );
    tris.map( (t) => t.push( space.pointer ) );
    
    // circle
    var circles = tris.map( (t) => Triangle.incircle( t ) );
    
    // drawing
    form.fillOnly("#123").polygon( poly );
    form.fill("#f05").circles( circles );
    form.strokeOnly("#fff ", 3 ).polygons( tris );
    form.fill("#123").point( space.pointer, 5 );
  });

  //// ----  

  space.bindMouse().bindTouch().play();

})();