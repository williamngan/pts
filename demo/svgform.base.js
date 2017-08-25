window.demoDescription = "SVG Test";

(function() {
  
  Pts.namespace( this );
  var space = new SVGSpace("#pt").setup({bgcolor: "#123", resize: true, retina: true});
  var form = space.getForm();
  
  console.log( form );
  
  //// Demo code ---
  
  
  space.add( function (time, ftime) {

    if (space.ready) {

      // don't use arrow function so that `this` here will refer to this player
      form.base( this );


      form.point( new Pt(50,50) );
    }

  });
  
  //// ----
  
  space.playOnce(2000);
  // space.bindMouse().bindTouch().play();
  
})();