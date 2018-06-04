// Source code licensed under Apache License 2.0. 
// Copyright © 2018 William Ngan. (https://github.com/williamngan/pts)

// This demo shows how to load a video, run it through tensorflow.js posenet model, and then visualize the result with pts.js
// see c.html on how to add a video of your choice


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
let scene = scenes( [5000, 5000, 3000 ])

let grid;


function drawBody() {

  // number of interpolated points along a path
  let num = 15; 

  // body torso center
  let centerTop = body.at("leftShoulder").$subtract( body.at("rightShoulder") ).divide(2).add( body.at("rightShoulder") );
  let centerBottom = body.at("leftHip").$subtract( body.at("rightHip") ).divide(2).add( body.at("rightHip") );
  let bd = body.body( 40, 10 );
  
  let leftBottom = Line.subpoints( [ bd[2], centerBottom ], num );
  let rightBottom = Line.subpoints( [ centerBottom, bd[3] ], num );
  let leftTop = Line.subpoints( [ bd[0], centerTop ], num );
  let rightTop = Line.subpoints( [ centerTop, bd[bd.length-1] ], num );

  let lk = body.leg( "left", 40, 20, 5, false );
  let leftLegSub = [];
  if (lk.length > 0) leftLegSub = Line.subpoints( lk[1].slice(0, 2), num );
  
  let rk = body.leg( "right", 40, 20, 5, false );
  let rightLegSub = [];
  if (rk.length > 0) rightLegSub = Line.subpoints( rk[1].slice(0, 2), num );

  let lh = body.arm( "left", 20, 20, 5, false );
  let leftShoulderSub = [];
  let leftElbowSub = [];
  if (lh.length > 0) {
    leftShoulderSub = Line.subpoints( lh[0].slice(0, 2), num );
    leftElbowSub = Line.subpoints( lh[1].slice(0, 2), num );
  }

  let rh = body.arm( "right", 20, 20, 5, false );
  let rightShoulderSub = [];
  let rightElbowSub = [];
  if (rh.length > 0) {
    rightShoulderSub = Line.subpoints( rh[0].slice(0, 2), num );
    rightElbowSub = Line.subpoints( rh[1].slice(0, 2), num );
  }

  let lw = 3;
  for (let i=0; i<num; i++) {
    let c = (i%2 === 0) ? "rgba(0,0,0,.9)" : "rgba(255,255,255,.9)";
    let c2 = (i%2 === 0) ? "rgba(255,0,60,.9)" : "rgba(0,255,200,.9)";
    form.strokeOnly(c2, lw).line( Curve.cardinal( [body.at("nose"), rightTop[i], rightBottom[i], rightLegSub[i], body.at("rightAnkle")] ) );
    form.strokeOnly(c2, lw).line( Curve.cardinal( [body.at("nose"), leftTop[i], leftBottom[i], leftLegSub[i], body.at("leftAnkle")] ) ); 
    
    form.strokeOnly(c, lw).line( Curve.cardinal( [body.at("nose"), leftShoulderSub[i], leftElbowSub[i], body.at("leftWrist") ] ) );
    form.strokeOnly(c, lw).line( Curve.cardinal( [body.at("nose"), rightShoulderSub[i], rightElbowSub[i], body.at("rightWrist") ] ) );
  }

  // Head
  let dir = body.at("leftEar").$subtract( body.at("rightEar") ).angle();
  let tri = Triangle.fromCenter( body.at("nose"), 30 ).rotate2D( dir, body.at("nose") );
  form.strokeOnly("#f06", 5).polygon( tri );
  form.fillOnly("#f06").point( body.at("nose"), 10, "circle");
  

  form.fill("#000").point( body.at("leftWrist"), 10, "circle" ).point( body.at("rightWrist"), 10, "circle" );
  form.fill("#fff").point( body.at("leftAnkle"), 10, "circle" ).point( body.at("rightAnkle"), 10, "circle" );
  
}


// Add a player to CanvasSpace
space.add({

  start: () => {
    body = new BodyPose( space, (d, i) => space.center.add(Math.random(), Math.random()) );
    squareCrop = body.squareBuffer( video );
    grid = Create.gridCells( space.innerBound, 1, 40 );
  },
  
  animate: (time, ftime) => {

    form.useOffscreen( true ); // use offscreen canvas for performance
    let cropped = squareCrop();
    
    // track time and draw background graphics after some time passes
    let st = scene(time);
    if (st < 2) form.image( cropped, space.innerBound, [new Pt(0,0), new Pt(cropped.width, cropped.height)] );
    if (st >= 1) {
      let fade = Math.min(1, st-1);
      form.fill( `rgba(255,235,30, ${ fade })` ).rect( space.innerBound );
    }
    
    if (pose) {

      const poseScale = 0.6;
      const poseStride = 16;
      const poseFlip = false;

      pose.estimateMultiplePoses( cropped, poseScale, poseFlip, poseStride, 1).then( function (people) {
        if (people.length > 0) {
          body.update( people[0].keypoints );
          drawBody(); 
        }
      });
    }
    
    form.renderOffscreen(); // render offscreen canvas
  }

});

space.play();
