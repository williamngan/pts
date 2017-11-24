window.demoDescription = "Draw shapes based on the size of space. Resize the window and the drawing will update.";

(function() {

  Pts.namespace( this );

  var space = new CanvasSpace("#pt").setup({bgcolor: "#96bfed", resize: true, retina: true});
  var form = space.getForm();


  //// Demo code ---


  var de = new Delaunay();
  let dd = [];
  let ddd = [];

  space.add({ 
    start: (bound) => {
      de = Delaunay.from( Create.distributeRandom( space.innerBound, 200 ) );
      dd = de.delaunay();
      ddd= de.voronoi();
    },

    animate: (time, ftime) => {

      let nearIndex = Polygon.nearestPt( de, space.pointer );

      let neighbors = de.neighbors( nearIndex, true ).map( (n) => n.triangle );
      
      form.strokeOnly("#f00", 3).polygons( neighbors );

      form.strokeOnly("#f00", 1).polygons( dd );
      form.fillOnly("#000").points( de, 3 );

      
      form.stroke("#fff").fill("rgba(255,255,0,.2)").polygons( ddd );
    },

  });

  //// ----
  

  space.bindMouse().bindTouch().play();

})();