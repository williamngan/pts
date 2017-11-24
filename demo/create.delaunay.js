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
      de = Delaunay.from( Create.distributeRandom( space.innerBound, 20 ) );
      dd = de.generate();
      console.log( de.network() );

      // Geom.orderPts2D( de );
      ddd = de.map( d => d.clone() );
      Geom.orderPts2D( ddd );
    },

    animate: (time, ftime) => {

      form.strokeOnly("#fff").circles( dd.map( (_d) => _d.circle ) );
      // form.strokeOnly("#f00").polygons( dd.map( (_d) => _d.triangle ) );
      form.fillOnly("#000").points( de, 3 );
      // form.fillOnly("#f0f").points( dd.map( (_d) => _d.circle[0] ), 2, "circle" );
      /*
      for (let i=0, len=dd.length; i<len; i++) {
        form.text( Triangle.incenter( dd[i].triangle ), i+"" );
      }
      */
      for (let i=0, len=de.length; i<len; i++) {
        form.text( de[i], i+"" );
      }

      // de.sort( (a, b) => {
      //   let c = a.$add(b).divide(2);
      //   return Vec.cross2D(a, c) - Vec.cross2D(b, c);
      //   // return a.x - b.x;
      // });

      

      form.strokeOnly("#0c9").polygon( ddd );
    },

  });

  //// ----
  

  space.bindMouse().bindTouch().play();

})();