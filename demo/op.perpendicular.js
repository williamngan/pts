Pts.scope( Pts, window );

var space = new CanvasSpace("#pt").setup({retina: true});
var form = space.getForm();

let ang = Math.random() * Const.two_pi;
let mouse = new Pt();

space.add( {
  animate: (time, ftime) => {
    let p = mouse.$subtract( space.center );
    let c = space.center;
    let ang = p.angle();
    form.log( Geom.toDegree( ang ) );

    form.stroke("#ccc").line([ c, new Pt( c.x+p.magnitude(), c.y)] );
    form.fill(false).arc( c, 20, 0, ang );
    
    form.stroke("#f00").line( [c, space.center.add(p)] );
    
    perpends = Geom.perpendicular( p ).map( (p) => p.$add( c ) );    
    form.stroke("#0f0").line( perpends );

  },
  onMouseAction:(type, px, py) => {
    if (type=="move") {
      mouse.to(px, py);
    }
  }
});
  
space.bindMouse();
space.play();