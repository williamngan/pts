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
      world = new World().setup( space.innerBound, 0.99, new Pt(0, 1000) );
      
      let rect = Rectangle.corners( Rectangle.fromCenter( space.center, 50 ) );
      for (let i=0, len=rect.length; i<len; i++) {
        let p = new Particle( rect[i] );
        p.mass = 5;
        world.push( p );
      }

      world[0].impulse( new Pt(300, -50));

    },

    animate: (time, ftime) => {


      
      
      let diagonal = Math.sqrt( 20000 );
      Physics.constraintEdge( world[1], world[3], diagonal );
      Physics.constraintEdge( world[0], world[2], diagonal );

      form.strokeOnly("#fff").line( [world[1], world[3]] );
      form.strokeOnly("#fff").line( [world[0], world[2]] );

      for (let i=0, len=world.length; i<len; i++) {
        form.fillOnly("#f00").point( world[i], world[i].mass, "circle" );
        
        let k = (i<len-1) ? i+1 : 0;
        Physics.constraintEdge( world[i], world[k], 100 );
        Physics.constraintBound( world[i], space.innerBound );

        form.strokeOnly("#9ab").line( [world[i], world[k]] );
      }

      world.integrateAll( ftime/1000 );

      
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