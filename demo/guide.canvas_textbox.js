// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "Text box demo in Typography guide.";

//// Demo code starts (anonymous function wrapper is optional) ---

(function() {
  
  let run = Pts.quickStart( "#pt", "#e2e6ef" );
  let content = "I have discovered a truly remarkable proof of this theorem which this margin is too small to contain.";
  
  run( (time, ftime)  => {
    let size = space.center.$subtract( space.pointer ).abs().multiply(2);
    let rect = Rectangle.fromCenter( space.center, size.$max( space.size.$divide(6) )  );

    form.fill("#fff").stroke("#0ca", 3).rect( rect );
    form.fillOnly("#123");
    form.font(24).textBox( rect, content, "top", "..." );
    form.font(16).textBox( rect, content, "middle", " ☞ " );
    form.font(12).textBox( rect, content, "bottom", "", true );
  });

  //// ----  

  space.bindMouse().bindTouch().play();

})();