// Source code licensed under Apache License 2.0. 
// Copyright © 2021 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "Demo in loading images";

//// Demo code starts (anonymous function wrapper is optional) ---

(function() {
  
  let run = Pts.quickStart( "#pt", "#e2e6ef" );
  let img = Img.load( "/assets/img_demo.jpg")
  run( t  => form.image( space.pointer, img ) );

  //// ----  

  space.bindMouse().bindTouch().play();

})();