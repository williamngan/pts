// Source code licensed under Apache License 2.0. 
// Copyright © 2021 William Ngan. (https://github.com/williamngan/pts)



(function(){
  // Pts.namespace( this ); // add Pts into scope if needed
  
  var demoID = "image_pixel";
  
  // create Space and Form
  let space = new CanvasSpace("#"+demoID).setup({ retina: true, bgcolor: "#e2e6ef", resize: true });
  let form = space.getForm();
  let img = Img.load( "/assets/img_demo.jpg", true, space.pixelScale);
  let de = Create.delaunay( new Group() );
  let triangles = de.delaunay();
  
  // animation
  space.add( 
    {
      animate: (time, ftime) => {
        const scaling = space.size.x / img.image.width;

        if (img.loaded) {
          form.image( [[0,0], [space.size.x, img.image.height * scaling]], img );

          // Uncomment to see the pixel color at pointer position
          /*
           * let cc = img.pixel( space.pointer, space.pixelScale / scaling );
           * form.fillOnly( `rgba(${cc.join(",")})` ).point([0,0], 100);
           */

          if (de.length > 10) {
            triangles = de.delaunay();
          }
  
          for (let i=0, len=triangles.length; i<len; i++) {
            const center = Triangle.incenter( triangles[i] );
            const c = img.pixel( center, space.pixelScale / scaling );
            form.fillOnly( `rgba(${c[0]}, ${c[1]}, ${c[2]}, .85)` ).polygon( triangles[i] );
          }
        }
      },

      action: (type, x, y) => {
        if (type === 'move') {
          if (de.length === 0 || de[de.length-1].$subtract(x,y).magnitudeSq() > 400) {
            de.push( new Pt(x, y) )
          }
          if (de.length > 30) de.shift();
        }
      }
  });
  
  // start
  // Note that `playOnce(200)` will stop after 200ms. Use `play()` to run the animation loop continuously. 
  space.playOnce(200).bindMouse().bindTouch();
  
  // For use in demo page only
  if (window.registerDemo) window.registerDemo(demoID, space);
  
})();
