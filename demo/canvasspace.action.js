window.demoDescription = "A set of points records the mouse trail as the mouse moves. When mouse is down and dragging, the trail will extend. When released, the trail gradually shortens.";

(function() {

  Pts.namespace( this );
  var space = new CanvasSpace("#pt").setup({bgcolor: "#fe3", resize: true, retina: true});
  var form = space.getForm();


  //// Demo code ---

  var chain = new Group();
  var stretch = false;

  space.add({ 
    animate: (time, ftime) => {
      if (chain.length > ((stretch) ? 100 : 10)) chain.shift();

      form.strokeOnly("#123", 3).line( chain );
      form.fillOnly("#123").point( space.pointer, 10, "circle")
    },

    action:( type, px, py ) => {
      if (type == "down") stretch = true;
      if (type == "up") stretch = false; 
      if (type == "move") chain.push( new Pt(px, py) );  
    } 
  });
  
  //// ----
  

  space.bindMouse().bindTouch().play();

})();