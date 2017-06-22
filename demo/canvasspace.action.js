(function() {

  Pts.namespace( this );

  var space = new CanvasSpace("#pt").setup({retina: true});
  var form = space.getForm();
  var prev;

  let ps = Group.from( [new Pt(1,3), new Pt(-10,4), new Pt(2,-1), new Pt(100,-20)] );
  console.log( ps.sortByDimension(1).toString() );

  space.add( { 
    action:( type, px, py ) => {
      if (prev) form.stroke("#999").line( [prev, new Pt(px, py)] );
      prev = new Pt(px, py);
    } 
  } );

  space.bindMouse();

})();