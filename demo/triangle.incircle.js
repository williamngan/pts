// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "Fitting four circles inside and outside of four triangles, which are connected to the pointer.";

//// Demo code starts (anonymous function wrapper is optional) ---

(function() {
  
  var run = Pts.quickStart( "#pt", "#fe3" ); 

  run( (time, ftime) => {
    // rectangle
    var rect = Rectangle.fromCenter( space.center, space.size.$divide(3) );
    var poly = Rectangle.corners( rect );
    poly.shear2D( (Num.cycle( time%5000/5000 ) - 0.5)/2, space.center );
    
    // triangle
    var tris = poly.segments( 2, 1, true );
    tris.map( (t) => t.push( space.pointer ) );
    
    // circle
    var circles = tris.map( (t) => Triangle.incircle( t ) );
    var circums = tris.map( (t) => Triangle.circumcircle( t ) );
    
    // drawing
    form.fillOnly("rgba(255,255,255,.2)", 1 ).circles( circums );
    form.fillOnly("#123").polygon( poly );
    form.fill("#f03").circles( circles );
    form.strokeOnly("#fff ", 3 ).polygons( tris );
    form.fill("#123").point( space.pointer, 5 );
    
  });

})();