// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)

(async function(){
  // Pts.namespace( this ); // add Pts into scope if needed
  
  var demoID = "image_pattern2"; 
  
  // create Space and Form
  var space = new CanvasSpace("#"+demoID).setup({ bgcolor: "#e2e6ef", retina: true, resize: true });
  var form = space.getForm();
  const pattern = await Img.loadPattern( "/assets/img_pattern.jpg", space, "repeat")


  // animation
  space.add( time => {
    const ang = space.pointer.$subtract( space.center ).angle();
    const transform = new Mat().translate2D( [time/50, 0] ).rotate2D( ang, space.center ).domMatrix;
    pattern.setTransform( transform );
    form.fill( pattern ).rect( space.innerBound )
  });
  
  
  // start
  // Note that `playOnce(200)` will stop after 200ms. Use `play()` to run the animation loop continuously. 
  space.playOnce(200).bindMouse().bindTouch();
  
  // For use in demo page only
  if (window.registerDemo) window.registerDemo(demoID, space);
  
})();