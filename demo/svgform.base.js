window.demoDescription = "SVG Test";

(function() {
  
  Pts.namespace( this );
  var space = new SVGSpace("#pt").setup({bgcolor: "#123", resize: true, retina: true});
  var form = space.getForm();
  
  console.log( form );
  
  //// Demo code ---
  
  let pts = new Group();
  
  space.add( {
    start: function (bound) {
      pts = Create.distributeRandom( space.innerBound, 100 );
    },
    animate: function (time, ftime) {
      
      if (space.ready) {
        
        // don't use arrow function so that `this` here will refer to this player
        form.base( this );
        
        
        form.point( new Pt(50,50) );
        form.line( Group.fromArray([[60,60], [100, 80]]) );

        // let pairs = pts.split( 2, 2 );
        // form.lines( pairs );
      }
      
    }
  });
  
  //// ----
  
  space.playOnce(200);
  // space.bindMouse().bindTouch().play();
  
})();