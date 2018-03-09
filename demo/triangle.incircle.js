// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)

(function() {
  
  Pts.namespace( this );
  var space = new CanvasSpace("#pt").setup({bgcolor: "#fe3", resize: true, retina: true});
  var form = space.getForm();
  
  
  //// Demo code ---
  
  
  space.add( (time, ftime) => {
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
  
  //// ----
  
  
  space.bindMouse().bindTouch().play();
  
})();