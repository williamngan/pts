

// Source code licensed under Apache License 2.0. 
// Copyright © 2021 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "Demo in getting image pixels";

//// Demo code starts ---

(async function() { // async/await function
  
  Pts.quickStart( "#pt", "#e2e6ef" );
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

  //// ----  

  space.bindMouse().bindTouch().play();

})();