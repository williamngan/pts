// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "Demo in Group guide.";

//// Demo code starts (anonymous function wrapper is optional) ---

(function() {
  
  let run = Pts.quickStart( "#pt", "#e2e6ef" );

  // Find a color based on the distances between anchor points
  function colorize( group, pt, radius ) {
    let gc = group.map( (g) => radius - Math.min( radius, Line.magnitude([g, pt]) ) );
    return new Color( gc ).multiply( 255 / radius );
  }
  
  run( (time, ftime)  => {
    let p = space.pointer.clone().reflect2D( [[0,0], space.size] );
    let pts = new Group( space.pointer, space.center, p );
    let gridColor = pts.op( colorize );
    let grid = Create.gridCells( space.innerBound, 20, 20 );
    
    grid.forEach( (cell) => {
      form.fill( gridColor( cell.p1, space.height ).hex );
      form.rect( cell );
    })
    
    form.fillOnly("#fff").points( pts, 10, "circle" );
  });

  //// ----  

  space.bindMouse().bindTouch().play();

})();