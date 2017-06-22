Pts.namespace( window );

var space = new CanvasSpace("#pt").setup({retina: true});
var form = space.getForm();

let a = new Pt(100, 200);
let b = new Pt(150, 60);
let c = new Pt(90, 20);

space.add( {

  start: ( bound ) => {
    a.add( bound.center );
    b.add( bound.center );
    c.add( bound.center );
  },

  animate: (time, fps) => {
    form.stroke("#999").line([a, b]);
    form.stroke(false).fill("#f00").point( c, 5, "circle" );
    
    let p = Line.perpendicularFromPt( c, [a,b] );
    form.fill("#0f0").point( p, 3 );
    form.stroke("#f00").line( [c, p] );

    let dist = Line.distanceFromPt( c, [a,b] );
    form.log( "distance: "+dist );

    let intersector = [ space.center, c ];
    form.stroke("#ccc").line( intersector );
    let inPt1 = Line.intersectPath2D( [a, b], intersector );
    let inPt2 = Line.intersectLine2D( [a, b], intersector );
    if (inPt1) form.fill("#00f").stroke(false).point( inPt1, 5, "circle" );
    if (inPt2) form.fill("#f90").stroke(false).point( inPt2, 3, "circle" );

    let gridPt = Line.intersectGrid2D( c, space.center );
    form.stroke("#999").fill(false).points( [gridPt[0], gridPt[1]], 3 );

    let subPts = Line.subpoints( [b, c], 7 );
    form.points( subPts, 1 );

  },

  action:( type, px, py) => {
    if (type=="move") {
      c.to(px, py);
    }
  },
  
  resize:( bound, evt) => {
    
  }
  
});
  
space.bindMouse();
space.playOnce(5000);