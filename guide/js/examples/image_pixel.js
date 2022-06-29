// Source code licensed under Apache License 2.0. 
// Copyright © 2021 William Ngan. (https://github.com/williamngan/pts)



(async function(){
  // Pts.namespace( this ); // add Pts into scope if needed
  
  var demoID = "image_pixel";
  
  // create Space and Form
  let space = new CanvasSpace("#"+demoID).setup({ retina: true, bgcolor: "#e2e6ef", resize: true });
  let form = space.getForm();
  let img = await Img.loadAsync( "/assets/img_demo.jpg", true, space.pixelScale);
  let de, triangles;
  
  // animation
  space.add( 
    {
      start: (bound) => {
        // Create 20 random points and generate initial tessellations
        de = Create.delaunay( new Group() );
        triangles = de.delaunay();
      },

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
            const c = img.pixel( center, scaling );
            form.fillOnly( `rgba(${c[0]}, ${c[1]}, ${c[2]}, .85)` ).polygon( triangles[i] );
          }

          form.strokeOnly("#00000055").line( de );
        }
      },

      action: (type, x, y) => {
        if (type === 'move') {
          if (de.length === 0 || de[de.length-1].$subtract(x,y).magnitudeSq() > 100) {
            de.push( new Pt(x, y) )
          }
          if (de.length > 200) de.shift();
        }
      }
  });
  
  // start
  // Note that `playOnce(200)` will stop after 200ms. Use `play()` to run the animation loop continuously. 
  space.playOnce(200).bindMouse().bindTouch();
  
  // For use in demo page only
  if (window.registerDemo) window.registerDemo(demoID, space);
  
})();
