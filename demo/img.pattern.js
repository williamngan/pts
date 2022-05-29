// Source code licensed under Apache License 2.0. 
// Copyright © 2022 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "A dynamic pattern-fill that responds to mouse position.";

Pts.quickStart( "#pt", "#fe3" );

//// Demo code starts (anonymous function wrapper is optional) ---

(function() {

  let img = Img.blank([120, 120], space );
  let imgForm = img.getForm();
  let pattern;
  let grid, cellSize;

  space.add({ 

    start: (bound, space) => {
      const w = space.size.$divide(2).minValue().value;
      const cells = 12;

      img = Img.blank( new Pt( w, w ), space );
      imgForm = img.getForm();

      grid = Create.gridPts( img.canvasSize.toBound(), cells, cells );
      cellSize = w / cells;
    },
    
    animate: (time, ftime) => {
      
      const p = space.center.$subtract( space.pointer );
      const unit = cellSize/2 + (p.magnitude() / cellSize);

      // Pattern background
      imgForm.fillOnly("#000").rect( [[0,0], img.canvasSize]);

      // Pattern dots
      grid.forEach( (c, i) => {
        const t = Num.cycle( Shaping.sigmoid( ( (i * time/10000)  % unit ) / unit ) );
        imgForm.fillOnly( ["#fe3","#f03","#63c", "#fff"][i%4] );

        // draw circles scaled by pixelScale since we're drawing on the internal canvas for pattern fill
        imgForm.circle( Circle.fromCenter( c, unit * t * img.pixelScale ) ); 
      });

      // Transform and fill pattern
      pattern = img.pattern('repeat', true);
      pattern.setTransform( 
        // We get the `scaledMatrix` instance first which pre-calculate the scaling factor (ie, `img.pixelScale`) based on screen pixel density.
        // Alternatively, if we don't want to support retina, we can set the pixelScale to be always `1` in `Img.blank(..., 1)` above
        img.scaledMatrix.translate2D( [time/50, 0] ).rotate2D( p.angle(), space.center ).domMatrix 
      );

      form.fill( pattern ).rect( space.innerBound );

    },

  });
  
  //// ----
  

  space.bindMouse().bindTouch().play();

})();