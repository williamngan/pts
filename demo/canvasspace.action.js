// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "A set of points records the mouse trail as the mouse moves. When mouse is down and dragging, the trail will extend. When released, the trail gradually shortens.";

Pts.quickStart( "#pt", "#fe3" );

//// Demo code starts (anonymous function wrapper is optional) ---

(function() {

  var chain = new Group();
  var stretch = false;

  space.add({ 
    animate: (time, ftime) => {
      // shorten the line when it's not stretching
      if (chain.length > ((stretch) ? 100 : 10)) chain.shift();

      form.strokeOnly("#123", 3).line( chain );
      form.fillOnly("#123").point( space.pointer, 10, "circle")
    },

    action:( type, px, py ) => {
      // stretch the line when mouse is down
      if (type == "down") stretch = true;
      if (type == "up") stretch = false; 

      // add a point to the line when mouse moves
      if (type == "move") chain.push( new Pt(px, py) );  
    } 
  });
  
  //// ----
  

  space.bindMouse().bindTouch().play();

})();