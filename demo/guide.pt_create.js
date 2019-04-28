// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "Demo in Pt guide.";

//// Demo code starts (anonymous function wrapper is optional) ---

(function() {
  
  let run = Pts.quickStart( "#pt", "#e2e6ef" );

  run( (time, ftime)  => {
    // space.pointer stores the last mouse or touch position
    let m = space.pointer;
    
    // drawing
    form.strokeOnly("#123", 5).line( [new Pt( m.x, 0), m, new Pt( 0, m.y)] );
    form.stroke("#42e").line( [new Pt(0,0), m] );
    form.stroke("#fff", 5).fill("#42e").point( m, 10, "circle")
    form.fill("#123").font(14, "bold").text( m.$add(20, 5), m.toString() );
  });

  //// ----  

  space.bindMouse().bindTouch().play();

})();