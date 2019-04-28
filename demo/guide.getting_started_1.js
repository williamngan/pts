// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "Demo in getting started guide.";

//// Demo code starts (anonymous function wrapper is optional) ---

(function() {

  /** 
   * Option 1: a single one-liner
   */
  Pts.quickStart( "#pt", "#e2e6ef" )( t => form.point( space.pointer, 10 ) );
  
  
  /** 
   * Option 2: Same quickStart mode, but storing the animate function in a `run` variable.
   */
  // let run = Pts.quickStart( "#pt", "#ff99ee" );
  // run( (time, ftime)  => { form.point( space.pointer, 10 ); });


  /** 
   * Option 3: Using quickStart to initiate space and form variables, then add a player to space.
   */
  // Pts.quickStart( "#pt", "#ee99ff" );
  // space.add( {
  //   animate: (time, ftime) => { form.point( space.pointer, 10 ); }
  // });

  
  /** 
   * Option 4: Advanced mode to initiate space and form, allowing for more options
   */
  // var space = new CanvasSpace("#pt").setup({ bgcolor: "#99eeff", retina: true, resize: true });
  // var form = space.getForm();
  // space.add( {
  //   start: (bound) => {},

  //   animate: (time, ftime) => {
  //     form.point( space.pointer, 10 );
  //   },

  //   action: (type, x, y) => {}
  // });


  //// ----  

  space.bindMouse().bindTouch().play();

})();