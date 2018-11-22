
// pts.js
Pts.namespace(this);
var space = new CanvasSpace("#pts").setup({ bgcolor: "transparent", retina: true });
var form = space.getForm();

// tensorflow.js posenet model
var posenetInstance;
posenet.load().then( (net) => posenetInstance = net );

// BodyPose instance
var bodies = [];
var de = new Delaunay(); // Delaunay is a Group of Pts
var ds = []; // store the delaunay triangles
var dots = [];
var keypoints;


// input
var video = document.getElementById('video');

function toGroup( keypoints, minConfidence=0.3 ) {
  let g = new Group();
  for (let i=0, len=keypoints.length; i<len; i++) {
    let k = keypoints[i];
    if (k.score > minConfidence) {
      g.push( new Pt(k.position.x, k.position.y, k.score) );
    }
  }
  return g;
}

// Add a player to CanvasSpace
space.add({

  start: () => {
    // dots = Create.distributeRandom( space.innerBound, 20 );
  },
  
  animate: (time, ftime) => {
    
    form.image( video, space.innerBound );
    
    if (posenetInstance) {

      const poseScale = 0.6;
      const poseStride = 16;
      const poseFlip = false;

      
      posenetInstance.estimateMultiplePoses(video, poseScale, poseFlip, poseStride, 3).then( (poses) => {
        for (let i=0, len=poses.length; i<len; i++) {
          let g = toGroup( poses[i].keypoints );
          bodies[i] = g;
        }
      });


      var cs = dots.concat( bodies.flat() );
      // if (ds.length < 60) {
      //   ds = ds.concat( cs );
      // } else {
      //   ds.splice( 0, 17 );
      // }



      de = Create.delaunay( cs );
      let tris = de.delaunay();

      var tcs = [];
      for (let i=0, len=tris.length; i<len; i++) {
        let cen = Polygon.centroid( tris[i] );
        let c = space.ctx.getImageData( cen[0]*space.pixelScale, cen[1]*space.pixelScale, 1, 1 ).data;
        tcs.push(c);
      }

      // form.fillOnly("#123").rect( space.innerBound );
      
      for (let i=0, len=tris.length; i<len; i++) {
        form.fillOnly( `rgb(${tcs[i][0]}, ${tcs[i][1]}, ${tcs[i][2]})`).polygon( tris[i] );
      }
      
    }
  }

});

// play
space.play();
