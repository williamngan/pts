Pts.namespace( window );

var space = new CanvasSpace("#pt").setup({retina: true});
var form = space.getForm();

var mouse = new Pt();
var center = new Pt();


space.add( {

  start: ( bound, space) => {
    center = bound.center;
  },

  animate: (time, fps) => {
    let p = center.$subtract( mouse );
    let ang = Math.atan2( p.y, p.x );

    let a = center.$subtract(50, 0);
    let b = center.$subtract(50, 50);
    // let a = new Pt(50, 0);
    Geom.rotate2D([a, b], ang, center);
    // a.add(center);

    form.stroke("#ccc").line( [center, a, b] );
    form.fill("#f00").point( a, 5 ).point(b, 3);
  },

  action:( type, px, py) => {
    if (type=="move") {
      mouse.to(px, py);
    }
  },
  
  resize:( bound, evt) => {
    
  }
  
});
  
space.bindMouse();
space.playOnce(5000);