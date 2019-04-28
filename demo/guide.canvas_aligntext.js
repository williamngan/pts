// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "Align text demo in Typography guide.";

//// Demo code starts (anonymous function wrapper is optional) ---

(function() {
  
  let run = Pts.quickStart( "#pt", "#e2e6ef" );

  run( (time, ftime)  => {
    let size = space.center.$subtract( space.pointer ).abs().multiply(2);
    let rect = Rectangle.fromCenter( space.center, size.$max( space.size.$divide(6) )  );
    let content = "hello";

    form.fill("#fff").stroke("#0ca", 3).rect( rect );
    form.fillOnly("#123");
    form.font(12)
    form.alignText("left").textBox( rect, content, "top" );
    form.alignText("left").textBox( rect, content, "middle" );
    form.alignText("left").textBox( rect, content, "bottom" );
    form.alignText("right").textBox( rect, content, "top" );
    form.alignText("right").textBox( rect, content, "middle" );
    form.alignText("right").textBox( rect, content, "bottom" );

    form.font(24);
    form.fill("rgba(0,0,0,.2)")
    form.alignText("center", "top").textBox( rect, content, "middle", "...", false );
    form.alignText("center", "middle").textBox( rect, content, "middle", "...", false );
    form.alignText("center", "bottom").textBox( rect, content, "middle", "...", false );
    form.alignText("center", "hanging").textBox( rect, content, "middle", "...", false );
    form.alignText("center", "baseline").textBox( rect, content, "middle", "...", false );
      
  });

  //// ----  

  space.bindMouse().bindTouch().play();

})();