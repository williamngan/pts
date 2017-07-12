Pts.namespace( window );

var space = new CanvasSpace("#pt").setup({retina: true});
var form = space.getForm();

var mouse = new Pt();
var center = new Pt();


space.add( {

  start: ( bound, space) => {
    console.log( "started" );
    center = bound.center;
  },

  animate: (time, fps) => {
    let p = center.$subtract( mouse );
    let ang = Math.atan2( p.y, p.x );

    let a = center.$subtract(50, 0);
    let da = center.$subtract(50, 0);
    let b = center.$subtract(50, 50);
    let db = center.$subtract(50, 50);



    // let a = new Pt(50, 0);
    // Geom.scale( new Group(a, b), [p.x*4/center.x, p.y*4/center.y], center);
    // Geom.rotate2D([a, b], ang, center);
    // Geom.rotate2D(a, ang, center);
    // Geom.shear2D([a, b], [p.y/center.y, 0], center);

    // console.log( [a, b], p.y/center.y, center );
    
    let reflectLine = [ mouse, center ];
    Geom.reflect2D( [a,b], reflectLine);
    // console.log( mouse, da, db, a, b, center );
    form.stroke("#0f0").line( reflectLine );
    
    // a.add(center);

    form.stroke("#ccc").line( [center, da, db] );
    form.stroke("#f99").line( [center, a, b] );
    
    form.fill("#f00").point( a, 5, "circle" ).point(b, 3, "circle");
    form.fill("#ccc").stroke(false).point( center, 3 );
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
space.playOnce(3000);