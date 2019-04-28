// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "Paragraph box demo in Typography guide.";

//// Demo code starts (anonymous function wrapper is optional) ---

(function() {
  
  Pts.quickStart( "#pt", "#e2e6ef" );
  let content = "I have discovered a truly remarkable proof of this theorem which this margin is too small to contain.";

  space.add({

    start: () => {
      form.font(16);
    },
    
    animate: (time, ftime) => {
      let size = space.center.$subtract( space.pointer ).abs().multiply(2);
      let rect = Rectangle.fromCenter( space.center, size.$max( space.size.$divide(6) )  );

      form.fill("#fff").stroke("#0ca", 3).rect( rect );
      form.fillOnly("#123").alignText("center").paragraphBox( rect, content, 1.5, "middle" );
    }
    
  });

  //// ----  

  space.bindMouse().bindTouch().play();

})();