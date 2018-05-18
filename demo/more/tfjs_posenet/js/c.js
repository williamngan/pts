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
var squareCrop;

// scene time step
let scene = scenes( [10000, 5000, 3000 ])


function drawBody() {

  form.fillOnly("#000", 3);
  form.circle( body.head(1.2) );
  form.polygon( body.shoulder( 30, 20 ) );
  
  form.polygon( body.body(30, 10) );
  form.circle( body.joint( "leftShoulder", 30 ) ).circle( body.joint( "rightShoulder", 30 ) );
  
  form.polygon( Curve.cardinal( 
    body.dup( body.leg( "left", 10, 10, 3 ), 2), 10, 0.4));
  form.polygon( Curve.cardinal( 
    body.dup( body.leg( "right", 10, 10, 3 ), 2), 10, 0.4));

  form.polygons( body.arm( "left", 30 ) ).polygons( body.arm( "right", 30 ) );
  form.fill("#f06");
  form.circle( body.joint( "leftWrist", 10 ) ).circle( body.joint( "rightWrist", 10 ) );

  form.polygon( Triangle.fromCenter( body.at( "leftEye" ), 10) );
}



function drawBg() {
  
  let bg2 = body.take( ["rightKnee", "rightHip", "leftHip", "leftKnee", "rightKnee", "rightHip", "leftHip"] );
  if (bg2.length > 3) {
    bg2.scale( 3, Polygon.centroid( bg2 ) );
    form.fillOnly("#fff").polygon( Curve.bspline( bg2, 15) );
  }

  let bg1 = body.take( ["leftWrist", "rightWrist", "rightElbow", "leftElbow"] );
  if (bg1.length > 3) {
    bg1.scale( new Pt(1.5, 2.5), Polygon.centroid( bg1) );
    form.fillOnly("#fe3").polygon( bg1 );
  }

}



space.add({

  start: () => {
    // webcam( video );
    body = new BodyPose( space, (d, i) => space.center.add(Math.random(), Math.random()) );
    squareCrop = body.squareBuffer( video );
  },
  
  animate: (time, ftime) => {

    form.useOffscreen( true );
    let cropped = squareCrop();

    let st = scene(time);
    if (st < 2) form.image( cropped, space.innerBound );
    if (st >= 1) form.fillOnly( `rgba(70,0, 220, ${ Math.min(1, st-1) })` ).rect( space.innerBound );
    
    if (pose) {

      const poseScale = 0.6;
      const poseStride = 16;
      const poseFlip = false;

      pose.estimateMultiplePoses( cropped, poseScale, poseFlip, poseStride, 1).then( function (people) {
        if (people.length > 0) {
          body.update( people[0].keypoints );
          drawBg();
          drawBody(); 
        }
      });
    }

    form.log( st );

    form.renderOffscreen();
  }

});

space.play().bindMouse().bindTouch();
