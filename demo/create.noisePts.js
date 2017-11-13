window.demoDescription = "Using Perlin noise to animate a line and a grid. Move mouse or touch around the canvas to change speed.";

(function() {

  Pts.namespace( this );
  var space = new CanvasSpace("#pt").setup({bgcolor: "#f1f5f9", resize: true, retina: true});
  var form = space.getForm();


  //// Demo code ---

  let noiseLine = [];
  let noiseGrid = [];

  space.add({ 

    start: (bound) => {

      // Create a line and a grid, and convert them to `Noise` points
      let ln = Create.distributeLinear( [new Pt(0, space.center.y), new Pt(space.width, space.center.y)], 30 );
      let gd = Create.gridPts( space.innerBound, 20, 20 );
      noiseLine = Create.noisePts( ln, 0.1, 0.1 );
      noiseGrid = Create.noisePts( gd, 0.05, 0.1, 20, 20 );
    },

    animate: (time, ftime) => {

      // Use pointer position to change speed
      let speed = space.pointer.$subtract( space.center ).divide( space.center ).abs();

      // Generate noise in a grid
      noiseGrid.map( (p) => {
        p.step( 0.01*speed.x, 0.01*(1-speed.y) );
        form.fillOnly("#123").point( p, Math.abs( p.noise2D() * space.size.x/18 ) );
      });

      // Generate noise in a line
      let nps = noiseLine.map( (p) => {
        p.step( 0.01*(1-speed.x), 0.05*speed.y );
        return p.$add( 0, p.noise2D()*space.center.y );
      });

      // Draw wave
      nps = nps.concat( [space.size, new Pt( 0, space.size.y )] );
      form.fillOnly("rgba(0,140,255,.65)").polygon( nps );
      form.fill("#fff").points( nps, 2, "circle");
    }
  
  });
  
  //// ----
  

  space.bindMouse().bindTouch().play();

})();