// Source code licensed under Apache License 2.0. 
// Copyright © 2021 William Ngan. (https://github.com/williamngan/pts)



(function(){
  // Pts.namespace( this ); // add Pts into scope if needed
  
  var demoID = "image_edit";
  
  // create Space and Form
  var space = new CanvasSpace("#"+demoID).setup({ retina: true, bgcolor: "#e2e6ef", resize: true });
  var form = space.getForm();
  let imgform;
  let img = new Img(true, space.pixelScale);
  img.load( "/assets/img_demo.jpg" ).then( res => imgform = new CanvasForm( res.ctx ) );
  
  // animation
  space.add( 
    {

      animate: (time, ftime) => {
        const scaling = space.size.x / img.canvas.width;

        if (img.loaded) {
          form.image( [[0,0], [space.size.x, img.canvas.height * scaling]], img.canvas );

          const p = space.pointer.divide( scaling );
          const jitter = p.$add( Num.randomPt( [-2, -2], [2, 2] )).floor();
          const diff = space.pointer.$subtract( space.center );
          const ang = diff.angle() + Math.random()*0.1 + Math.PI/2;
          
          const c = img.pixel( p, false );
          const d = c.clone();
          c[3] = Math.random()*0.5 + 0.2;
          d[3] = Math.random()*0.1;
          const r = Num.randomRange(0, diff.magnitude());

          imgform.fill(`rgba(${c.join(",")})`).stroke(`rgba(${d.join(",")})`).ellipse( jitter, [5, Math.min( space.size.x/4, 20+r )], ang );

        }
      }
  });
  
  // start
  // Note that `playOnce(200)` will stop after 200ms. Use `play()` to run the animation loop continuously. 
  space.playOnce(200).bindMouse().bindTouch();
  
  // For use in demo page only
  if (window.registerDemo) window.registerDemo(demoID, space);
  
})();
