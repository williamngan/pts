// Source code licensed under Apache License 2.0. 
// Copyright © 2021 William Ngan. (https://github.com/williamngan/pts)

(function(){
  // Pts.namespace( this ); // add Pts into scope if needed
  
  var demoID = "image_crop";
  
  // create Space and Form
  let space = new CanvasSpace("#"+demoID).setup({ retina: true, bgcolor: "#e2e6ef", resize: true });
  let form = space.getForm();
  let grid;
  let crops = [];
  let img;
  
  
  // animation
  space.add( {
    start: () => {
      img = new Img(true, space.pixelScale);
      img.load( "/assets/img_demo.jpg" );
      grid = Create.gridCells( space.innerBound, 5, 5 );
    },
    animate: (time, ftime) => {
      if (img.loaded) {
        form.image( [0,0], img );

        const offset = space.pointer.$subtract( space.center );
        for (let i=0, len=crops.length; i<len; i++) {
          const c = img.crop( new Bound( crops[i][0].$add( offset ), crops[i][1].$add( offset ) ) );
          form.imageData( crops[i][0].$multiply( img.pixelScale ), c );
          // form.imageData( crops[i][0][0], crops[i][1] );
          form.strokeOnly("#000", 3).rect(crops[i]);
        }

        form.strokeOnly("#fff", 3).rects( grid.filter( g => Rectangle.withinBound( g, space.pointer ) ) );
      }
    },
    action: (type, x, y) => {
      if (type === "click") {
        let curr = grid.filter( g => Rectangle.withinBound( g, space.pointer ) );
        crops.push( curr[0] );
        if (crops.length > 7) crops.shift();
      }
          rec = true;
    }
  });
  
  // start
  // Note that `playOnce(200)` will stop after 200ms. Use `play()` to run the animation loop continuously. 
  space.playOnce(200).bindMouse().bindTouch();
  
  // For use in demo page only
  if (window.registerDemo) window.registerDemo(demoID, space);
  
})();
