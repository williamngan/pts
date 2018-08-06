// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "Add a point to a trail as the pointer moves. Use those points as controls for a continuous bezier curve.";

Pts.quickStart( "#pt", "#123" );

//// Demo code starts (anonymous function wrapper is optional) ---

(function() {

  var chain = new Group();

  space.add({ 
    animate: (time, ftime) => {

      // limit up to 50 points
      if (chain.length > 50 && chain.length % 3 === 0) chain.splice( 0, 3 );
      
      // rotate the control points slowly
      for (let i=4, len=chain.length; i<len; i+=3) {
        chain[i].rotate2D( ((i%7===0) ? 0.002 : -0.003), chain[i-1] );

        // align the other control pt by extrapolating its corresponding position
        chain[i-2].to( Geom.interpolate( chain[i], chain[i-1], 2 ) ); 
      }

      form.strokeOnly("#f03", 10, "round").line( Curve.bezier( chain ) );
      form.strokeOnly("rgba(255,255,255,.3)", 1).line( chain );
      form.fillOnly("#fff").points( chain, 1, "circle")
    },

    action:( type, px, py ) => {

      if (type == "move") {
        let p = new Pt(px, py);
        
        if (chain.length < 1) {
          chain.push( p );  
          return;
        }

        if (  p.$subtract( chain.q1 ).magnitudeSq() > 900) {

          // the forth point
          if ( chain.length === 4 ) {
            chain.push( p );
            chain.q3.to( Geom.interpolate( chain.q1, chain.q2, 2 ) ); // third pt aligns with the fifth point

          // every third points afterwards
          } else if (chain.length > 4 && chain.length % 3 === 0) {
            chain.push( p );
            chain.push( Geom.interpolate( chain.q2, chain.q1, 2 ) ); // add a new pt to align second-last pt
          
          } else {
            chain.push( p );  
          }
          
        }
      }
    } 
  });
  
  //// ----
  

  space.bindMouse().bindTouch().play();

})();