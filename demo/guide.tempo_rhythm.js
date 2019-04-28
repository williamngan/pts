// Source code licensed under Apache License 2.0. 
// Copyright © 2019 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "Rhythm demo in Tempo guide.";

//// Demo code starts (anonymous function wrapper is optional) ---

(function() {
  
  Pts.quickStart( "#pt", "#e2e6ef" );

  // Create tempo instance
  let tempo = new Tempo(120);
  let counter = 0;

  // Rhythm is Taaa, Taaa, ta-ta
  tempo.every( [2, 2, 1, 1] ).progress( (count, t, time, start) => {
    let tt = Num.cycle( Shaping.cubicInOut( t ) ); // shaping
    let right = Line.fromAngle( space.center, -tt * Const.half_pi - Const.half_pi, space.size.y/3 );
    let left = Line.fromAngle( space.center, Const.pi+Const.half_pi + tt*Const.half_pi, space.size.y/3 );
    form.strokeOnly( "#123", 10, "round", "round" ).lines( [left, right] );
    
    if (start) counter++;
    let c = (counter % 4 < 2) ? "#62E" : "#0C9"
    form.fillOnly( c ).point( left.p2, 20, "circle" ).point( right.p2, 20, "circle" );
  });
  
  // Add tempo instance as a player to track animation
  space.add( tempo );

  //// ----  

  space.bindMouse().bindTouch().play();

})();