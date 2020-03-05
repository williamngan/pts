// Source code licensed under Apache License 2.0. 
// Copyright © 2020 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "Grid cells filled with simple linear gradient, over a complex radial graident background.";

//// Demo code starts (anonymous function wrapper is optional) ---

(function() {

  // Pts quick start mode.
  var run = Pts.quickStart( "#pt", "#123" ); 

  run( (time, ftime) => {
    let scale = space.center.$subtract( space.pointer ).divide( space.center ).abs();
    let bound = new Bound( new Pt(), space.size.$add( 0, space.size.y * scale.y ) );
    let cells = Create.gridCells( bound, 21, 30 );
    let offy = (bound.height - space.innerBound.height ) / 2;
    let cy = 1 - Math.abs(space.center.y - space.pointer.y) / space.center.y;

    // Create complex radial gradient with stops
    let radial = form.gradient([
      [0.2, `rgba(${70 * cy}, 0, ${255 * cy})`], 
      [0.6, `rgba(${205 * cy}, 0, ${30 * cy})`], 
      [0.95, `rgba(${255 * cy}, ${220 * cy}, 0)`]]
    );

    // Define the radial gradient areas and fill inta rectangular area.
    form.fill( 
      radial( Circle.fromCenter(space.pointer, space.center.y/2), Circle.fromCenter(space.pointer, space.size.y*1.5) )
    ).rect( space.innerBound );
    
    // Fill every other grid cells with a simple linear gradient
    for (let i=0, len=cells.length; i<len; i++) {
      let grad = form.gradient( ["rgba(255,255,255,1)", "rgba(255,255,255,0)"] );
      form.fillOnly( i%2 === 0 ? grad( cells[i] ) : "rgba(0,0,0,0)" ).rect( cells[i].subtract(0, offy) );
    }
  });


})();