(function(){
  // Pts.namespace( this ); // add Pts into scope if needed

  var demoID = "group_op";
  
  // create Space and Form
  var space = new CanvasSpace("#"+demoID).setup({ retina: true, bgcolor: "#e2e6ef", resize: true });
  var form = space.getForm();
  
  // Find a color based on the distances between anchor points
  function colorize( group, pt, radius ) {
    let gc = group.map( (g) => radius - Math.min( radius, Line.magnitude([g, pt]) ) );
    return new Color( gc ).multiply( 255 / radius );
  }
  
  // animation
  space.add( (time, ftime) => {
    
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
  
  // start
  // Note that `playOnce(200)` will stop after 200ms. Use `play()` to run the animation loop continuously. 
  space.playOnce(20000).bindMouse().bindTouch();
  
  // For use in demo page only
  if (window.registerDemo) window.registerDemo(demoID, space);
  
})();