window.demoDescription = "Lines rotating in a grid. Intersections between lines are marked with circles. Move the pointer to change the rotation speed.";

(function() {

  Pts.namespace( this );

  var space = new CanvasSpace("#pt").setup({bgcolor: "#123", resize: true, retina: true});
  var form = space.getForm();


  //// Demo code ---

  var pts, lines;

  // check intersect of a line with other lines
  var intersect = (ln, k) => {
    let ps = new Group();
    for (let i=0, len=lines.length; i<len; i++) {
      if (i!==k) {
        let ip = Line.intersectLine2D( lines[i], ln );
        if (ip) ps.push( ip );
      }
    }
    return ps;
  };

  space.add({ 

    // create a grid of lines
    start: (bound) => {  
      pts = Create.gridPts( space.innerBound, 10, 10 );
      lines = pts.map( (p, i) => Line.fromAngle( p, i*Const.one_degree*10, Math.random()*space.size.x/5 + 20) );
    },

    animate: (time, ftime) => {

      let speed = (space.pointer.x - space.center.x) / space.center.x;
      
      // rotate each line, then check and draw intersections
      lines.forEach( (ln, i) => {
        ln[1].rotate2D(0.02 * speed, ln[0]);
        let ips = intersect( ln, i );
        form.fillOnly("#fff").points( ips, 7, "circle" );
        form.stroke( (ips.length > 0) ? "#fff" : "rgba(255,255,255,.3)").line( ln );
      });
      
    }
    
  });

  //// ----
  

  space.bindMouse().bindTouch().play();

})();