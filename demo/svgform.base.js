window.demoDescription = "SVG Test";

(function() {
  
  Pts.namespace( this );
  var space = new SVGSpace("#pt").setup({bgcolor: "#123", resize: false });
  var form = space.getForm();
  
  
  //// Demo code ---
  
  let pts = new Group();

  space.add( {
    start: function (bound) {
      pts = Create.distributeRandom( space.innerBound, 100 );
    },
    animate: function (time, ftime) {
      
        
        // don't use arrow function so that `this` here will refer to this player
        form.scope( this );

        let poly = Group.fromArray([[60,70], [100, 90], [150, 100]]);

        form.fill("#ff0").stroke(false).rect( Group.fromArray([[100,60], [60, 80]]) );
        
        form.fill("#f03").stroke("#fff").point( new Pt(50,50), 3, "circle" );
        
        form.line( Group.fromArray([[100,60], [60, 80]]) );
        form.line( poly );
        form.polygon( poly.clone().moveBy(0,150) );
        // form.squares( Group.fromArray([[60,70], [100, 90], [150, 100]]) );

        form.strokeOnly("#09f", 5).circle( Group.fromArray([[100,400], [30,30]]));

        form.fillOnly("#f03").arc( new Pt( 200, 200), 50, 0, 5.5, false);
        // form.arc( new Pt( 200, 200), 50, 0, Const.pi-1.571);
        form.point( space.pointer );

        form.fill("#09f").stroke(false).text( space.pointer,  space.pointer.toString());
        form.log("log text")
        // form.arc( new Pt( 200, 200), 50, 0, Const.quarter_pi+Const.pi+0.4);
        
        

        // let pairs = pts.split( 2, 2 );
        // form.lines( pairs );
      
      
    }
  });
  
  //// ----
  
  // space.playOnce(2000);
  space.bindMouse().bindTouch().playOnce(500);
  
})();