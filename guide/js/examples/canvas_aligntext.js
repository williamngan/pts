(function(){
  // Pts.namespace( this ); // add Pts into scope if needed
  
  var demoID = "canvas_aligntext";
  
  // create Space and Form
  var space = new CanvasSpace("#"+demoID).setup({ retina: true, bgcolor: "#e2e6ef", resize: true });
  var form = space.getForm();
  var content = "hello";
  
  // animation
  space.add({

    start: () => {
      
    },
    
    animate: (time, ftime) => {
      let size = space.center.$subtract( space.pointer ).abs().multiply(2);
      let rect = Rectangle.fromCenter( space.center, size.$max( space.size.$divide(6) )  );

      form.fill("#fff").stroke("#0ca", 3).rect( rect );
      form.fillOnly("#123");
      form.font(12)
      form.alignText("left").textBox( rect, content, "top" );
      form.alignText("left").textBox( rect, content, "middle" );
      form.alignText("left").textBox( rect, content, "bottom" );
      form.alignText("right").textBox( rect, content, "top" );
      form.alignText("right").textBox( rect, content, "middle" );
      form.alignText("right").textBox( rect, content, "bottom" );

      form.font(24);
      form.fill("rgba(0,0,0,.2)")
      form.alignText("center", "top").textBox( rect, content, "middle", "...", false );
      form.alignText("center", "middle").textBox( rect, content, "middle", "...", false );
      form.alignText("center", "bottom").textBox( rect, content, "middle", "...", false );
      form.alignText("center", "hanging").textBox( rect, content, "middle", "...", false );
      form.alignText("center", "baseline").textBox( rect, content, "middle", "...", false );
      
    }
    
  });
  
  // start
  // Note that `playOnce(200)` will stop after 200ms. Use `play()` to run the animation loop continuously. 
  space.playOnce(200).bindMouse().bindTouch(); 
  
  // For use in demo page only
  if (window.registerDemo) window.registerDemo(demoID, space);
  
})();
