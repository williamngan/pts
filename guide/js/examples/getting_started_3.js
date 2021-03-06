// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)

(function(){
  // Pts.namespace( this ); // add Pts into scope if needed
  
  var demoID = "getting_started_3"; 
  
  // create Space and Form
  var space = new CanvasSpace("#"+demoID).setup({ bgcolor: "#e2e6ef", retina: true, resize: true });
  var form = space.getForm();
  

  // animation
  space.add( (time, ftime) => {

    // rectangle
    var rect = Rectangle.fromCenter( space.center, space.size.$divide(2) );
    var poly = Rectangle.corners( rect );
    poly.shear2D( Num.cycle( time%2000/2000 ) - 0.5, space.center );
    
    // drawing
    form.fillOnly("#123").polygon( poly );
    form.strokeOnly("#fff", 3).rect( rect );
    
  });
  
  // start
  // Note that `playOnce(200)` will stop after 200ms. Use `play()` to run the animation loop continuously. 
  space.playOnce(200).bindMouse().bindTouch();
  
  // For use in demo page only
  if (window.registerDemo) window.registerDemo(demoID, space);
  
})();