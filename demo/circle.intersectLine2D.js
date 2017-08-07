window.demoDescription = "A circle and a donut meets. Indicate their points of intersections.";

(function() {
  
  Pts.namespace( this );
  var space = new CanvasSpace("#pt").setup({bgcolor: "#123", resize: true, retina: true});
  var form = space.getForm();
  
  
  //// Demo code ---
  var lines = [];
  var createLines = () => {
    lines = [];
    var ps = Create.distributeRandom( space.innerBound, 100 );
    for (let i=0, len=ps.length; i<len; i++) {
      lines.push( new Group( ps[i], ps[i].clone().toAngle( Math.random()*Const.pi, Math.random()*space.size.y/2+20, true) ) );
    }
  };
  
  space.add( { 
    start: (bound) => { createLines(); },
    resize: (bound) => { createLines(); },
    
    animate: (time, ftime) => {
      
      let range = Circle.fromCenter( space.pointer, 100 );
      
      form.stroke( "rgba(255,255,255,.1" ).lines( lines );
      
      for (let i=0, len=lines.length; i<len; i++) {
        let ins = Circle.intersectLine2D( range, lines[i] );
        if (ins.length > 0) {
          form.stroke("#f03").line( lines[i] );
          form.fillOnly("#f03").points( ins, 3, "circle" );
        }
      }
    }

  });
  
  //// ----
  
  
  space.bindMouse().bindTouch().play();
  
})();