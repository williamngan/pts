(function(){
var demoID = "pt_create";


var space = new CanvasSpace("#"+demoID).setup({ retina: true, bgcolor: "#e2e6ef" });
var form = space.getForm();

space.add( (time, ftime) => {

  let m = space.pointer;

  form.stroke("#1e252C", 5).line( [new Pt( m.x, 0), m, new Pt( 0, m.y)] );
  form.stroke("#fff",5).fill("#f00").point( m, 10, "circle")
  form.text( m.$add(20, 5), m.toString() );

});

space.playOnce(200).bindMouse().bindTouch();

// For demo page only
if (window.registerDemo) window.registerDemo(demoID, space);

})();