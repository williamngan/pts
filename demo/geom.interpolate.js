Pts.namespace( window );

var space = new CanvasSpace("#pt").setup({retina: true, resize: true});
var form = space.getForm();

var ratio = 0.5;

space.add( {
  animate: (time, ftime) => {
    form.log( 1000/ftime + " fps" );

    var center = space.size.$divide(2);
    let a = new Pt(100, 40);
    let b = new Pt(-50, 200);
    let c = new Pt(-100, -250);
    
    form.stroke("#f00").line( [a.$add(center), b.$add(center)] );
    form.stroke("#0f0").line( [b.$add(center), c.$add(center)] );
    form.stroke("#00f").line( [c.$add(center), a.$add(center)] );
    
    let p1 = Geom.interpolate( a, b, ratio );
    let p2 = Geom.interpolate( b, c, ratio );
    let p3 = Geom.interpolate( c, a, ratio );

    form.fill(false);
    form.stroke("#333").line([center.$add(p1), center] );
    form.stroke("#333").line([center.$add(p2), center] );
    form.stroke("#333").line([center.$add(p3), center] );

    let graph = new Group( a, b, c, a );
    let p4 = graph.interpolate( ratio );
    form.stroke(false).fill("#f00").point( center.$add(p4), 10, "circle");
    // form.stroke("#999").line([center.$add(p1), center.$add(p2), center.$add(p3), center.$add(p1)] );

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