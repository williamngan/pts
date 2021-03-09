// Source code licensed under Apache License 2.0. 
// Copyright © 2021 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "Demo in loading images";

//// Demo code starts (anonymous function wrapper is optional) ---

(function() {
  
  let run = Pts.quickStart( "#pt", "#e2e6ef" );

  let duration = [Date.now(), 0];
  let img = new Img();
  img.load( "/assets/img_demo.jpg").then( res => {
    duration[1] = Date.now();
  });


  run( t  => {
    if (img.loaded) {
      form.fillOnly("#00000099").text( [20,30], img.loaded ? `Loaded in ${duration[1] - duration[0]} ms` : `Loading: ${Date.now() - duration[0]} ms` );

      const percent = 100*(space.pointer.x/space.size.x);
      form.ctx.filter = `saturate(${100-percent}%) brightness(${100-percent/4}%)`;
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

  //// ----  

  space.bindMouse().bindTouch().play();

})();