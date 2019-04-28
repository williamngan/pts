// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "Demo in Space guide.";

//// Demo code starts (anonymous function wrapper is optional) ---

(function() {
  
  let run = Pts.quickStart( "#pt", "#e2e6ef" );

  run( (time, ftime)  => {
    let cycle = (off) => space.center.y * ( Num.cycle( (time+off)%2000/2000 ) - 0.5 );

    let circle = Circle.fromCenter( space.center.$add( 0, cycle(0) ), 30 );
    let rect = Rectangle.fromCenter( space.center.$add( cycle(1000), 0 ), 50 );
    let triangle = Triangle.fromCenter( space.center.$add( cycle(0)/2, cycle(500) ), 30 );
    let curve = new Group( space.pointer, circle.p1, rect.p1, triangle.p1, space.pointer );

    form.stroke("#fff", 3).fill("#ff6").circle( circle );
    form.fill("#09f").rect( rect );
    form.fill("#f03").polygon( triangle );
    form.strokeOnly("#123", 5).polygon( Curve.cardinal( curve ) );
    form.fillOnly("#124").point( space.pointer, 10, "circle" );
  });

  //// ----  

  space.bindMouse().bindTouch().play();

})();