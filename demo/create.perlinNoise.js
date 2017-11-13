window.demoDescription = "Perlin noise demo.";

(function() {

  Pts.namespace( this );
  var space = new CanvasSpace("#pt").setup({bgcolor: "#fe3", resize: true, retina: true});
  var form = space.getForm();


  //// Demo code ---

  let noiseLine = [];
  let noiseGrid = [];

  space.add({ 
    start: (bound) => {
      let ln = Create.distributeLinear( [new Pt(0, space.center.y), new Pt(space.width, space.center.y)], 50 );
      let gd = Create.gridPts( space.innerBound, 20, 20 );
      noiseLine = Create.noisePts( ln, 0.1, 0.1 );
      noiseGrid = Create.noisePts( gd, 0.05, 0.1, 20, 20 );
    },

    animate: (time, ftime) => {

      let nx = (space.pointer.x / space.width)*100 + 0.01;
      let ny = (space.pointer.y / space.height)*100 + 0.01;

      noiseGrid.map( (p) => {
        p.step( 0.0001*nx, 0.0001*ny );
        form.point( p, Math.abs(p.noise2D()*20), "circle" );
      });

      let nps = noiseLine.map( (p) => {
        p.step( 0.01, 0.01 );
        return p.$add( 0, p.noise2D()*space.center.y );
      });

      form.strokeOnly("#000").line( nps );
      form.fillOnly("#f00").points( nps, 3);
    },

    action:( type, px, py ) => {

    } 
  });
  
  //// ----
  

  space.bindMouse().bindTouch().play();

})();