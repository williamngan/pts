// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "Angle demo in Pt guide.";

//// Demo code starts (anonymous function wrapper is optional) ---

(function() {
  
  let run = Pts.quickStart( "#pt", "#e2e6ef" );

  run( (time, ftime)  => {
    let m = space.pointer;
    let c = space.center;
    let p = m.$subtract(c); // the vector from center to mouse
    let lengthP = p.magnitude();
    
    let ang = p.angle();
    let angText = Geom.boundRadian( ang ); // bound between 0 to 2-PI

    form.strokeOnly("#0ca", 10, "round", "round").line( [c, m] );
    form.stroke("#fff").line( [c, new Pt(c.x + lengthP, c.y)])
    form.stroke("#42e", 10).arc(c, lengthP, 0, ang);
    let pos = c.$add( p.toAngle( angText/2, lengthP/2 ) ).add(10, 5);
    form.fill("#123").font(18, "bold").text( pos, Math.floor( Geom.toDegree(angText) )+"°" );
  });

  //// ----  

  space.bindMouse().bindTouch().play();

})();