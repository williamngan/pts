// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)

(async function(){
  // Pts.namespace( this ); // add Pts into scope if needed
  
  var demoID = "image_pattern"; 
  
  // create Space and Form
  var space = new CanvasSpace("#"+demoID).setup({ bgcolor: "#e2e6ef", retina: true, resize: true });
  var form = space.getForm();
  const pattern = await Img.loadPattern( "/assets/img_pattern.jpg", space, "repeat")


  // animation
  space.add( () => form.fill( pattern ).rect( space.innerBound ) );
  
  
  // start
  // Note that `playOnce(200)` will stop after 200ms. Use `play()` to run the animation loop continuously. 
  space.playOnce(200).bindMouse().bindTouch();
  
  // For use in demo page only
  if (window.registerDemo) window.registerDemo(demoID, space);
  
})();