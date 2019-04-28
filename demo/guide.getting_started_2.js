// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "Demo in getting started guide.";

//// Demo code starts (anonymous function wrapper is optional) ---

(function() {
  
  let run = Pts.quickStart( "#pt", "#e2e6ef" );

  run( (time, ftime)  => {
    let radius = Num.cycle( (time%1000)/1000 ) * 20;
    form.fill("#0ca").point( space.pointer, radius, "circle" );
  });

  //// ----  

  space.bindMouse().bindTouch().play();

})();