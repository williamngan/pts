Pts.scope( Pts, window );

var space = new CanvasSpace("#pt").setup({retina: true, resize: true});
var form = space.getForm();

var ratio = 0.5;

space.add( {
  animate: (time, ftime) => {
    form.log( 1000/ftime + " fps" );

    var center = space.size.$divide(2);
    let a = [center, center.$subtract(100, 40)];
    let b = [center, center.$subtract(-50, 200)];
    let c = [center, center.$subtract(-100, -250)];
    
    form.stroke("#f00").line( a );
    form.stroke("#0f0").line( b );
    form.stroke("#00f").line( c );

    let p1 = Geom.interpolate( a[1].$subtract(a[0]), b[1].$subtract(b[0]), ratio );
    let p2 = Geom.interpolate( b[1].$subtract(a[0]), c[1].$subtract(c[0]), ratio );
    let p3 = Geom.interpolate( c[1].$subtract(c[0]), a[1].$subtract(b[0]), ratio );
    
    form.fill(false);
    form.stroke("#333").line([center, center.$add(p1)] );
    form.stroke("#999").line([center.$add(p1), center.$add(p2), center.$add(p3), center.$add(p1)] );

  },
  action:( type, px, py) => {
    if (type=="move") {
      ratio = Num.normalizeValue( px, 0, space.size.x)
    }
  },
  resize:( bound, evt) => {
    console.log( bound.width, bound.height );
  }
})
  
space.bindMouse();
space.play();