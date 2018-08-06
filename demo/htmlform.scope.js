// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "Pts also provides experimental support for rendering HTML elements. Take a look using your browser's DOM inspector.";

//// Demo code starts (anonymous function wrapper is optional) ---

(function() {  

  // Create HTML space and form
  Pts.namespace( this );
  var space = new HTMLSpace("#pt").setup({bgcolor: "#36f", resize: true });
  var form = space.getForm();

  // css for testing
  var css = document.createElement("style");
  css.type = "text/css";
  css.innerHTML = ".pts-rect { font-size: 30vw; line-height: 50vh; overflow: hidden; } .r2 { opacity: 0.9 } .r1a { border-bottom-color: #fff !important; }";
  document.body.appendChild(css);


  space.add(
    // For DOM, don't use arrow function so that `this` here will refer to this player
    function (time, ftime) {
        
      // DOM scope starts
      form.scope( this );

      let p = space.pointer.$max(0, 0).$min( space.size );
      let r1 = Rectangle.fromTopLeft( [0,0], space.size );
      let r1Alt = Rectangle.fromTopLeft( [10,0], [p.x, p.y] );
      let r2 = Rectangle.fromTopLeft( [p.x, 0], space.size );

      // Draw first rectangle(s)
      form.strokeOnly("#36f", 1).fillText("#fe3").cls("r1").rect( r1 );
      form.strokeOnly("#36f", 1).fillText("#fff").cls("r1a").rect( r1Alt );
      document.querySelector(".r1").textContent = "hello";
      document.querySelector(".r1a").textContent = "hello";

      // Draw second rectange
      form.fillOnly("#f03").fillText("#fff").cls("r2").rect( r2 );
      document.querySelector(".r2").textContent = "world";
    }
  );


  // Add another player for testing. Again don't use arrow function => so as to bind the scope of "this" correctly.
  space.add( function(time, ftime) {

    // SVG scope starts
    form.scope(this);
    form.strokeOnly("#fff", 2).point( space.pointer, 5, "circle" );
  });

  
  //// ----
  space.bindMouse().bindTouch().play(5000);
  
})();