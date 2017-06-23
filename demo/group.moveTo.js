Pts.namespace( window );

var space = new CanvasSpace("#pt").setup({retina: true});
var form = space.getForm();

let group = Group.fromArray( [[100, 250], [220, 240], [150, 180]] );
let group2 = group.clone();
let m = new Pt();

space.add( {

  start: (bound, space) => {
    group2.moveTo( bound.center );
  },

  animate: (time, fps) => {
    form.fill(false).stroke("#999").points( group, 5 );
    form.fill("#f00").stroke(false).points( group2, 5 );
    group2.moveBy( m );
    m.multiply(0.95);
  },

  action:( type, px, py) => {
    if (type=="move") {
      m.to( new Pt(px,py).subtract( group2[0] ) ).divide(20);
    }
  },
  
  resize:( bound, evt) => {
    
  }
  
});
  
space.bindMouse();
space.play();