// Source code licensed under Apache License 2.0.
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "A minimal starting point for a Pts sketch.";

Pts.quickStart( "#pt", "#123" );

//// Demo code starts (anonymous function wrapper is optional) ---

(function() {

  space.add({
    animate: (time, ftime) => {
      form.fillOnly("#fff").point( space.pointer, 10, "circle" );
    }
  });

  //// ----

  space.bindMouse().bindTouch().play();

})();
