// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "Demo in Pt guide.";

//// Demo code starts (anonymous function wrapper is optional) ---

(function() {
  
  let run = Pts.quickStart( "#pt", "#e2e6ef" );

  run( (time, ftime)  => {
    let c = space.center;
    let m = space.pointer;
    let reflectLine = [ m, c ];
    
    // a group of points
    let g1 = new Group( c.$add(0, -50), c.$add(50, -50), c.$add(50, 0), c.$add(50, 50), c.$add(0, 50) );
    
    // scale each one using Pt's scale functions
    let s = 0.75 + m.$subtract(c).magnitude() / space.width;
    let g2 = g1.map( (p) => p.scale(s)  );
    
    // Alternatively, just use the Geom.reflect2D to reflect a group of Pt
    let g3 = g2.clone();
    Geom.reflect2D( g3, reflectLine );
    
    form.strokeOnly("#fff", 20, "miter").line(g1).stroke("#123").line(g3);
    form.stroke("#42e", 10).line( reflectLine );
  });

  //// ----  

  space.bindMouse().bindTouch().play();

})();