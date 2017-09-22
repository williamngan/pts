window.demoDescription = "Pts also provides experimental support for rendering HTML elements. Take a look using your browser's DOM inspector.";

(function() {
  
  Pts.namespace( this );
  var space = new HTMLSpace("#pt").setup({bgcolor: "#000", resize: true });
  var form = space.getForm();
  

  //// Demo code ---
  let pts = new Group();

  // css for testing
  var css = document.createElement("style");
  css.type = "text/css";
  css.innerHTML = ".pts-rect { font-size: 30vw; line-height: 1; overflow: hidden; } .r1, .r2 { opacity: 0.9 }";
  document.body.appendChild(css);


  space.add(
    // For DOM, don't use arrow function so that `this` here will refer to this player
    function (time, ftime) {
        
      // DOM scope starts
      form.scope( this );

      let p = space.pointer.$max(0, 0).$min( space.size );
      let r1 = Rectangle.fromTopLeft( [0,0], space.size );
      let r1Alt = Rectangle.fromTopLeft( [0,0], [p.x, p.y] );
      let r2 = Rectangle.fromTopLeft( [p.x, 0], space.size );

      form.fillOnly("#36f").fillText("#fe3").cls("rect1").rect( r1 );
      form.cls("rect1a").fillText("#fff").stroke("#fff", 1).rect( r1Alt );
      document.querySelector(".rect1").textContent = "hello";
      document.querySelector(".rect1a").textContent = "hello";

      form.fillOnly("#f03").fillText("#fff").cls("r2 rect2").rect( r2 );
      document.querySelector(".rect2").textContent = "world";
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