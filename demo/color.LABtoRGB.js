// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "Create a gradient grid using Lab color space. The pointer position updates the lightness. With subtle wave-like animation.";

Pts.quickStart( "#pt", "#96bfed" );

//// Demo code starts (anonymous function wrapper is optional) ---

(function() {

  var grid = [];

  // Lab max value range (100, 127, 127)
  let cu = Color.lab( Color.maxValues("lab") );

  function init() {
    let ratio = space.size.x/space.size.y;
    grid = Create.gridCells( space.innerBound, 20*ratio, 20 );
    grid.forEach( (cell) => cell[1].ceil() );
  }


  space.add({ 
    start: init,
    resize: init,

    animate: (time, ftime) => {
      let size = space.size;
      let pointer = space.pointer.$divide( size );

      for (let i=0, len=grid.length; i<len; i++) {
        let p = grid[i].interpolate( Num.cycle( (time+i*60)%1000/1000 ) ).divide( size );
        let c = cu.$multiply( new Pt( pointer.x, p.x-0.5, p.y-0.5, 1 ) );
        form.fillOnly( Color.LABtoRGB( c ).toString("rgb") ).rect( grid[i] );
      }
    },

    
  });

  //// ----
  

  space.bindMouse().bindTouch().play();

})();