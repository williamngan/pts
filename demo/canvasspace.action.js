(function() {

  Pts.namespace( this );

  var space = new CanvasSpace("#pt").setup({retina: true});
  var form = space.getForm();

  space.add({ 
    action:( type, px, py ) => {
      form.stroke("rgba(0,0,0,.2)").line( [space.center, [px, py]] );
    } 
  });

  space.bindMouse();

})();