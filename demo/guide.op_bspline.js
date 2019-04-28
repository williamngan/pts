// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "B-spline demo in Op guide.";

//// Demo code starts (anonymous function wrapper is optional) ---

(function() {
  
  let run = Pts.quickStart( "#pt", "#e2e6ef" );

  run( (time, ftime)  => {
    // create a group of 4 Pts from rectangle
    let c = space.center.clone()
    let corners = Rectangle.corners( Rectangle.fromCenter( c, space.height ) );

    // interpolate with time to make them move
    let cycle = (t, i) => Num.cycle( (t+i*500)%3000/3000 );
    let pts = corners.map( (p, i) => Geom.interpolate( p, c, cycle(time, i)) );

    // close the B-spline path
    pts.push( space.pointer );
    pts = pts.concat( pts.slice(0, 3) );

    // draw the B-spline curve
    let curve = Curve.bspline( pts );
    form.fill("#0ca").stroke("#fff", 5).polygon( curve );
    form.stroke("rgba(0,0,0,.2", 1).lines( corners.map( (p) => [p, space.center]) );
    form.fillOnly("#f05").points( pts, 3, "circle" );
  });

  //// ----  

  space.bindMouse().bindTouch().play();

})();