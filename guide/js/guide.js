(function() {

  Pts.namespace( this );

  var blocks = Array.from( document.querySelectorAll("img") ).filter( (f) => {
    var t = f.getAttribute("alt");
    var idx = t.indexOf(".js");
    return idx > 0 && idx === (t.length - 3);
  });

  for (let i=0, len=blocks.length; i<len; i++) {
    createDemoContainer( blocks[i] );
  }

  var demos = {};

  function createDemoContainer( imgElem ) {
    var div = document.createElement("div");
    var divID = imgElem.getAttribute("alt").replace(/\./, "_");
    div.setAttribute("class", "demoOverlay");
    div.setAttribute("id", divID );
    imgElem.parentNode.appendChild( div );

    var demo = sampleDemo( divID );

    div.addEventListener( 'mouseenter', function(evt) {
      div.classList.add("active");
      demo.play();
    });

    div.addEventListener( 'mouseleave', function(evt) {
      div.classList.remove("active");
      demo.stop();
    });
  }

  function sampleDemo( spaceID ) {
    var space = new CanvasSpace( "#"+spaceID ).setup({retina: true});
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

    space.bindMouse();

    space.bindMouse();

    return space;
  }

  
})();

