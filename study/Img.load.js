// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "Load an image and get its pixel";

//// Demo code starts (anonymous function wrapper is optional) ---

(function() {

  // Pts quick start mode.
  var run = Pts.quickStart( "#pt", "#123" ); 
  var img = new Img(true, space.pixelScale);
  var imgform;
  var preview;
  img.load("../assets/feature1.jpg");


  run( (time, ftime) => {

    let bound = Bound.fromGroup( Rectangle.fromCenter( space.pointer, 100 ) );
    let cropped = img.crop( bound );

    
    form.image( [0,0], img );
    form.imageData( [0,0], cropped );
    if (!preview) {
      preview = Img.imageDataToBlob( cropped ).then( b => {
        Img.fromBlob(b, true, img.pixelScale).then( i => {
          preview = i;
        });
      });
    } else if (preview.loaded) {
      form.image([[space.size.x-100,0],[space.size.x,100]], preview );
    }
    // form.image( img, Group.fromArray([[20,20], [200, 200]]), Group.fromArray([[50,50], [400,400]]) );

    let p = img.pixel( space.pointer );
    form.text( [20,20], space.pointer.toString() + " " + space.pixelScale );
    form.fillOnly( `rgba(${p.join(",")})` ).point( space.center, 50 ); 
    form.strokeOnly("#ff0").rect( bound );

    if (!imgform) {
      imgform = new CanvasForm( img.ctx );
    }

    imgform.fill("#90f").stroke("#fff").point( space.pointer.$multiply( space.pixelScale ), 10, "circle" );

    // form.strokeOnly("#fe3").line( [space.center, space.pointer] );

  },

  () => {

  },
  
  (action, x, y) => {
    if (action === 'up') {
      console.log( "!!" );
      img.sync(1);
    } else if (action === "move") {
      preview = false;
    }
  });

})();