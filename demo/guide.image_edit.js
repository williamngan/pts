// Source code licensed under Apache License 2.0. 
// Copyright © 2021 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "Demo in editing images";

//// Demo code starts (anonymous function wrapper is optional) ---

(function() {
  
  let run = Pts.quickStart( "#pt", "#e2e6ef" );
  let imgform;
  let img = new Img(true, space.pixelScale);
  img.load( "/assets/img_demo.jpg" ).then( res => imgform = new CanvasForm( res.ctx ) );

  run( t  => {
    const scaling = space.size.x / img.canvas.width;

    if (img.loaded) {
      form.image( [[0,0], [space.size.x, img.canvas.height * scaling]], img.canvas );

      // calculate the ellipses' attributes
      const p = space.pointer.divide( scaling );
      const jitter = p.$add( Num.randomPt( [-2, -2], [2, 2] )).floor();
      const diff = space.pointer.$subtract( space.center );
      const ang = diff.angle() + Math.random()*0.1 + Math.PI/2;
      const r = Num.randomRange(0, diff.magnitude());
      
      // pixel color
      const c = img.pixel( p, false );
      c[3] = Math.random()*0.5 + 0.2;
      
      imgform.fill(`rgba(${c.join(",")})`).stroke( Math.random() < 0.3 ? "#ffffff99" : "#ffffff00");
      imgform.ellipse( jitter, [10, Math.min( space.size.x/4, 20+r )], ang );
    }

  });

  //// ----  

  space.bindMouse().bindTouch().play();

})();