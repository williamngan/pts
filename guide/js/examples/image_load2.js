// Source code licensed under Apache License 2.0. 
// Copyright © 2021 William Ngan. (https://github.com/williamngan/pts)

(function(){
  // Pts.namespace( this ); // add Pts into scope if needed
  
  var demoID = "image_load2";
  
  // create Space and Form
  var space = new CanvasSpace("#"+demoID).setup({ retina: true, bgcolor: "#e2e6ef", resize: true });
  var form = space.getForm();
  let img = new Img();
  let duration = [Date.now(), 0];
  img.load( "/assets/img_demo.jpg").then( res => {
    duration[1] = Date.now();
  });
  
  // animation
  space.add( (time, ftime) => {
    if (img.loaded) {
      form.fillOnly("#00000099").text( [20,30], img.loaded ? `Loaded in ${duration[1] - duration[0]} ms` : `Loading: ${Date.now() - duration[0]} ms` );

      form.ctx.filter = "grayscale()";
      const w = img.image.width * space.size.y / img.image.height;
      form.image( [[space.center.x, 0], [space.center.x + w, space.size.y]], img );

      form.ctx.filter = "none";
      if (space.pointer.x < space.center.x) {
        form.ctx.translate(space.pointer.x + space.center.x , 0);
        form.ctx.scale(-1, 1);
      }
      form.image( [[space.pointer.x, 0], [space.center.x, space.size.y]] , img );
    }
  });
  
  // start
  // Note that `playOnce(200)` will stop after 200ms. Use `play()` to run the animation loop continuously. 
  space.playOnce(200).bindMouse().bindTouch();
  
  // For use in demo page only
  if (window.registerDemo) window.registerDemo(demoID, space);
  
})();
