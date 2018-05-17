// pts.js
Pts.namespace(this);
var space = new CanvasSpace("#pts").setup({ bgcolor: "transparent", retina: true });
var form = space.getForm();

// tensorflow posenet model
var pose;
posenet.load().then( (net) => pose = net );

// BodyPose instance
var body;

// input
var video = document.getElementById('video');


function drawBody() {

  form.strokeOnly("#0cf", 3);  
  form.circle( body.headFixed(20) );
  form.polygon( body.shoulder() );
  form.polygon( body.body() );
  form.polygons( body.arm( "left" ) ).polygons( body.arm( "right" ) );
  form.polygon( body.leg( "left" ) ).polygon( body.leg( "right" ) );

  form.strokeOnly("#f06", 2);
  form.lines( body.wireframe() );
}

space.add({

  start: () => {
    body = new BodyPose( video, space, (k,i) => space.center );
  },
  
  animate: (time, ftime) => {
    
    form.image( video, space.innerBound );
    
    if (pose) {

      const poseScale = 0.6;
      const poseStride = 16;
      const poseFlip = false;

      pose.estimateMultiplePoses(video, poseScale, poseFlip, poseStride, 1).then( function (people) {
        if (people.length > 0) {
          body.update( people[0].keypoints );
          drawBody(); 
        }
      });
    }
  }

});

space.play().bindMouse().bindTouch();
