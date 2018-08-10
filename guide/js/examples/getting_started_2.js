(function(){
  // Pts.namespace( this ); // add Pts into scope if needed
  
  var demoID = "getting_started_2"; 
  
  // create Space and Form
  var space = new CanvasSpace("#"+demoID).setup({ retina: true, resize: true });
  var form = space.getForm();
  

  // animation
  space.add( (time, ftime) => {
    let radius = Num.cycle( (time%1000)/1000 ) * 20;
    form.fill("#0ca").point( space.pointer, radius, "circle" );
  });
  
  // start
  // Note that `playOnce(200)` will stop after 200ms. Use `play()` to run the animation loop continuously. 
  space.playOnce(200).bindMouse().bindTouch();
  
  // For use in demo page only
  if (window.registerDemo) window.registerDemo(demoID, space);
  
})();