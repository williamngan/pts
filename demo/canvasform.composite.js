// Source code licensed under Apache License 2.0. 
// Copyright © 2020 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "Generate dynamic gradients using composite effects. Click to change colors.";

Pts.quickStart( "#pt", "#666" );

//// Demo code starts (anonymous function wrapper is optional) ---

(function() {

  let waves = [];
  let gradients = [];
  const nums = 20;

  function getColors() {
    let cs = [[0, 255, 50],[255, 255, 50],[255, 0, 50],[255, 50, 255],[50, 0, 255],[50, 255, 255]];
    let a = [...cs[Math.floor(Math.random() * cs.length)], 0.7];
    let b = [...cs[Math.floor(Math.random() * cs.length)], 0.7];
    let c = b.slice();
    c[3] = 0;
    let stops = [0.1, 0.4, 1];
    return [a,b,c].map( (p, i) => [ stops[i], `rgba(${p[0]}, ${p[1]}, ${p[2]}, ${p[3]})` ] );
  };

  function getGradients() {
    gradients = [];
    for (let i=0; i<nums; i++) {
      gradients.push( form.gradient(getColors()) );
    }
  }

  space.add({ 

    start: (bound) => {

      // Create two lines and convert to `Noise` points
      let ln1 = Create.distributeLinear( [new Pt(0, space.size.y*0.3), new Pt(space.width, space.size.y*0.3)], nums );
      let ln2 = Create.distributeLinear( [new Pt(0, space.size.y*0.6), new Pt(space.width, space.size.y*0.6)], nums );
      waves = [ Create.noisePts( ln1, 0.1, 0.1 ), Create.noisePts( ln2, 0.1, 0.1 ) ];
      
      getGradients();
    },

    animate: (time, ftime) => {

      // Use pointer position to change background and speed
      let speed = space.pointer.$subtract( space.center ).divide( space.center ).abs();

      let gr = speed.x * 100; // background gray
      form.fill( `rgb(${gr+80},${gr+80},${gr+80})` ).rect( space.innerBound );

      // Generate wave movements from Noise
      let nps = waves.map( nl => {
        return nl.map( p => p.$add( 0, p.step( 0.01*(1-speed.x), 0.05*speed.y ).noise2D() * space.size.y ) )
      })

      // Set canvas composite operation
      form.composite('overlay');

      for (let k=0, klen=nps.length; k<klen; k++) {
        for (let i=0; i<nums; i++) {
          let c1 = Circle.fromCenter( nps[k][i], space.size.minValue().value * 0.2 );
          let c2 = Circle.fromCenter( nps[k][i], space.size.minValue().value * 0.7 );
          let grad = gradients[ k===0 ? i : nums-i-1 ];
          form.fillOnly( grad( c1, c2 ) ).circle( c2 );
        } 
      }

    },

    action: (type, x, y) => {
      if (type === 'up') getGradients();
    }
  
  });
  
  //// ----
  

  space.bindMouse().bindTouch().play();

})();