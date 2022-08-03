// Source code licensed under Apache License 2.0. 
// Copyright © 2021 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "Demo in editing images";

//// Demo code starts (anonymous function wrapper is optional) ---

(function() {
  
  let run = Pts.quickStart( "#pt", "#e2e6ef" );
  let lastP = new Pt();
  let imgform;
  let img = new Img(true, space.pixelScale);
  img.load( "/assets/img_demo.jpg" ).then( res => imgform = new CanvasForm( res.ctx ) );

  run( t  => {
    if (img.loaded) {
      const scaling = space.size.x / img.canvas.width;
      form.image( [[0,0], [space.size.x, img.canvas.height * scaling]], img.canvas );

      const p = space.pointer.divide( scaling );
      const jitter = p.$add( Num.randomPt( [-2, -2], [2, 2] )).floor();
      const ang = lastP.$subtract( space.pointer ).angle();
      lastP = space.pointer.clone();

      const r = Num.randomRange(0, space.pointer.$subtract( space.center ).magnitude() * 2);
      const c = img.pixel( p, false );
      c[3] = Math.random()*0.5 + 0.2;

      imgform.fill(`rgba(${c.join(",")})`).stroke(  Math.random() < 0.1 ? "#fff" : "#ffffff00");

      let size = new Pt( 10+Math.random()*50, Math.min( space.size.x/2, 30+r ) );
      let rect = Rectangle.corners( Rectangle.fromCenter( jitter, size ) );
      rect.rotate2D( ang, jitter );
      imgform.polygon( rect );

      form.strokeOnly("#f03", 3).point( space.pointer, 8, "circle");
    }
  });

  //// ----  

  space.bindMouse().bindTouch().play();

})();