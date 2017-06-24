Pts.namespace( window );

var space = new CanvasSpace("#pt").setup({retina: true});
var form = space.getForm();

let group = Group.fromArray( [[100, 100], [100, 250], [250, 250]] );
let group2 = group.clone();
let m = new Pt();
let mouse = new Pt();

space.add( {

  start: (bound, space) => {
    // group2.moveTo( bound.center );
    // console.log( Util.split( new Group( new Pt(1,2), new Pt(2,3), new Pt(3,4), new Pt(4,5), new Pt(5,6), new Pt(6,7) ), 2, 3 ) );
  },

  animate: (time, fps) => {
    form.fill(false).stroke("#999").points( group, 5 );
    form.fill("#f00").stroke(false).points( group2, 5 );
    group2.moveBy( m );
    m.multiply(0.95);

    let s = Math.abs(space.center.x - mouse.x)/space.center.x + 1;
    let a = Math.atan2( space.center.y-mouse.y, space.center.x-mouse.x );

    let centroid = group.centroid();
    let gscale = group.clone().scale2D( s, centroid );
    form.fill(false).stroke("#f00").points( gscale, 5 );

    let grotate = group.clone().rotate2D( a, centroid );
    form.stroke(false).fill("#0f0").points( grotate, 5, "circle" );

    let gshear = group.clone().shear2D( [a/5, 0], centroid );
    form.stroke("#00f").line( gshear );

  },

  action:( type, px, py) => {
    if (type=="move") {
      mouse.to(px, py);
      m.to( new Pt(px,py).subtract( group2[0] ) ).divide(20);
    }
  },
  
  resize:( bound, evt) => {
    
  }
  
});
  
space.bindMouse();
space.play();
// space.playOnce(5000);