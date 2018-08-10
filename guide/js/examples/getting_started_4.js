(function(){
  // Pts.namespace( this ); // add Pts into scope if needed
  
  var demoID = "getting_started_4"; 
  
  // create Space and Form
  var space = new CanvasSpace("#"+demoID).setup({ retina: true, resize: true });
  var form = space.getForm();
  

  // animation
  space.add( (time, ftime) => {

    // rectangle
    var rect = Rectangle.fromCenter( space.center, space.size.$divide(2) );
    var poly = Rectangle.corners( rect );
    poly.shear2D( Num.cycle( time%5000/5000 ) - 0.5, space.center );
    
    // triangle
    var tris = poly.segments( 2, 1, true );
    tris.map( (t) => t.push( space.pointer ) );
    
    // drawing
    form.fillOnly("#123").polygon( poly );
    form.strokeOnly("#fff ", 3 ).polygons( tris );
    form.fill("#123").point( space.pointer, 5 );
    
  });
  
  // start
  // Note that `playOnce(200)` will stop after 200ms. Use `play()` to run the animation loop continuously. 
  space.playOnce(200).bindMouse().bindTouch();
  
  // For use in demo page only
  if (window.registerDemo) window.registerDemo(demoID, space);
  
})();