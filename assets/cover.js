(function() {
  
  Pts.namespace( this );
  var space = new CanvasSpace("#pt").setup({bgcolor: "#fff", resize: true, retina: true});
  var form = space.getForm();
  
  
  //// Demo code ---
  
  var delay = 0;
  var angle = 0;
  
  space.add( { 
    animate: (time, ftime) => {

      delay++;
      angle += Const.one_degree/2;
      
      // get a line from pointer to center, and use it for direction and magnitude calculations
      let center = space.center.clone().toAngle( angle, 0.1, space.center );
      let ln = space.pointer.$subtract( center );
      let dir = ln.$unit();
      let mag = ln.magnitude();
      let mag2 = space.size.magnitude();
      let sc = (space.size.x > space.size.y) ? space.size.y/12 : space.size.x/12;
      
      // create a grid of lines
      let lines = Create.gridPts( space.innerBound, Math.floor( space.size.x/sc ), Math.floor( space.size.y/sc ) ).map( (p) => {
        let dist = p.$subtract( space.center ).magnitude() / mag2;
        return new Group(p, p.$add( dir.$multiply( dist*(20 + mag/5) ) )) 
      });
      
      // let color = Color.lab( Color.maxValues("lab") );
      // color.multiply( 0.5, (space.pointer.x-space.center.x)/space.center.x, (space.pointer.y-space.center.y)/space.center.y, 1 );
      // form.fillOnly( Color.LABtoRGB( color ).hex ).rect( space.innerBound );
      
      form.strokeOnly("#f03", 2).line( [space.center, space.pointer] );
      form.strokeOnly("#123", 1).lines( lines );
    },
    
    action: (type, x, y) => {
      delay = 0;
    }
  });
  
  //// ----
  
  
  space.bindMouse().bindTouch().play();
  
})();