(function(){
var demoID = "pt_test";

var space = new CanvasSpace("#"+demoID).setup({ retina: true });
var form = space.getForm();

let ang = Math.random() * Const.two_pi;
let mouse = new Pt();

space.add({
  animate: (time, ftime) => {

    let p = mouse.$subtract(space.center);
    let c = space.center;

    let ang = p.angle();
    form.log(Geom.toDegree(ang));

    // line to mouse
    let pm = new Pt(c.x + p.magnitude(), c.y);
    form.stroke("#ccc").line([c, pm]);
    form.fill(false).arc(c, 20, 0, ang);

    // line at specific angle
    let d = p.clone().toAngle(ang + Math.PI);
    form.stroke("#f99").line([c, c.$add(d)]);

    // line at angle 0    
    form.stroke("#f00").line([c, space.center.add(p)]);

    // perpendicular lines
    perpends = Geom.perpendicular(p).map((p) => p.$add(c));
    form.stroke("#0f0").line(perpends);

  },
  action: (type, px, py) => {
    if (type == "move") {
      mouse.to(px, py);
    }
  }
});

space.playOnce(200).bindMouse().bindTouch();

// For demo page only
if (window.registerDemo) window.registerDemo(demoID, space);

})();