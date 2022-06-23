// Source code licensed under Apache License 2.0. 
// Copyright © 2021 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "Demo in loading images";

//// Demo code starts ---

(async function() { // async/await function
  
  const run = Pts.quickStart( "#pt", "#e2e6ef" );
  const pattern = await Img.loadPattern( "/assets/img_pattern.jpg", space, "repeat");
  

  run( time  => {
    const ang = space.pointer.$subtract( space.center ).angle();
    const transform = new Mat().translate2D( [time/50, 0] ).rotate2D( ang, space.center ).domMatrix;
    pattern.setTransform( transform );
    form.fill( pattern ).rect( space.innerBound )
  });

  //// ----  

  space.bindMouse().bindTouch().play();

})();