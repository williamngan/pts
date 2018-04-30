// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "...";

(function() {

  Pts.namespace( this );

  var space = new CanvasSpace("#pt").setup({bgcolor: "#96bfed", resize: true, retina: true});
  var form = space.getForm();


  var world;

  space.add( {

    start: (bound, space) => {
      world = new World( space.innerBound, 1, 0 );

      let pts = Create.distributeRandom( space.innerBound, 70 );
      
      for (let i=0, len=pts.length; i<len; i++) {
        let p = new Particle( pts[i] ).size( 3 + Math.random()*20 );
        p.hit( Num.randomRange(-50,50), Num.randomRange(-20, 20) );
        world.add( p );
      }

    },

    animate: (time, ftime) => {

      world.drawParticles( (p, i) => form.fillOnly("#f00").point( p, p.radius, "circle" ) );
      world.update( ftime );

    },

    action:( type, px, py) => {
      
    },
    
    resize:( bound, evt) => {
      
    }
    
  });
  
  space.bindMouse().bindTouch();
  space.play();
  // space.playOnce(10000);

})();