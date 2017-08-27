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

        
        form.point( new Pt(50,50), 3, "circle" );
        form.line( Group.fromArray([[60,60], [100, 80]]) );
        form.line( Group.fromArray([[60,70], [100, 90], [150, 100]]) );
        // form.squares( Group.fromArray([[60,70], [100, 90], [150, 100]]) );

        form.circle( Group.fromArray([[100,400], [30,30]]));

        
        // form.arc( new Pt( 200, 200), 50, 0, Const.quarter_pi+Const.pi+0.4);
        form.arc( new Pt( 200, 200), 50, 0, 5.5, false);
        // form.arc( new Pt( 200, 200), 50, 0, Const.pi-1.571);
        form.point( new Pt(200,200));

        // let pairs = pts.split( 2, 2 );
        // form.lines( pairs );
      }
      
    }
  });
  
  //// ----
  
  space.playOnce(200);
  // space.bindMouse().bindTouch().play();
  
})();