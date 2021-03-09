// Source code licensed under Apache License 2.0. 
// Copyright © 2021 William Ngan. (https://github.com/williamngan/pts)

(function(){
  // Pts.namespace( this ); // add Pts into scope if needed
  
  var demoID = "image_load";
  
  // create Space and Form
  let space = new CanvasSpace("#"+demoID).setup({ retina: true, bgcolor: "#e2e6ef", resize: true });
  let form = space.getForm();
  let img = Img.load( "/assets/img_demo.jpg");
  
  // animation
  space.add( (time, ftime) => {
    form.image( space.pointer, img );
  });
  
  // start
  // Note that `playOnce(200)` will stop after 200ms. Use `play()` to run the animation loop continuously. 
  space.playOnce(200).bindMouse().bindTouch();
  
  // For use in demo page only
  if (window.registerDemo) window.registerDemo(demoID, space);
  
})();
