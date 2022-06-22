// Source code licensed under Apache License 2.0. 
// Copyright © 2021 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "Demo in cropping images";

//// Demo code starts (anonymous function wrapper is optional) ---

(function() {  

  // create Space and Form
  Pts.quickStart( "#pt", "#e2e6ef" );

  let grid;
  let crops = [];
  let img;
  
  // animation
  space.add( {
    start: () => {
      img = new Img(true, space);
      img.load( "/assets/img_demo.jpg" );
      grid = Create.gridCells( space.innerBound, 5, 5 );
    },

    animate: (time, ftime) => {

      // As an example, this shows how we load the image and then check img.loaded here. 
      // This is an alternative to Img.loadAsync() as shown in other examples in this guide
      if (img.loaded) { 
        
        // draw original image
        form.image( [0,0], img ); 

        const offset = space.pointer.$subtract( space.center );
        for (let i=0, len=crops.length; i<len; i++) {
          const c = img.crop( new Bound( crops[i][0].$add( offset ), crops[i][1].$add( offset ) ) );
          form.imageData( crops[i][0].$multiply( img.pixelScale ), c ); // draw crops
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
    }
  });
  

  //// ----  

  space.bindMouse().bindTouch().play();

})();