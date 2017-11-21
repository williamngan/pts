window.demoDescription = "Draw shapes based on the size of space. Resize the window and the drawing will update.";

(function() {

  Pts.namespace( this );

  var space = new CanvasSpace("#pt").setup({bgcolor: "#96bfed", resize: true, retina: true});
  var form = space.getForm();


  //// Demo code ---


  var de = new Delaunay();
  let dd = [];

  space.add({ 
    start: (bound) => {
      de = Delaunay.from( Create.distributeRandom( space.innerBound, 100 ) );
      dd = de.generate();
    },

    animate: (time, ftime) => {

      form.strokeOnly("#fff").circles( dd.map( (_d) => _d.circle ) );
      form.strokeOnly("#f00").polygons( dd.map( (_d) => _d.triangle ) );
      form.fillOnly("#000").points( de, 3 );
    },

  });

  //// ----
  

  space.bindMouse().bindTouch().play();

})();