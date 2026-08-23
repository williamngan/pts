# Obsolete: Pts + TensorFlow.js PoseNet prototype

This experimental 2018 prototype is retained only as historical source. Its
live demos have been retired because PoseNet and the TensorFlow.js APIs used here
are deprecated, and the examples no longer work with the current Pts API.

Do not use these files as a starting point for a new project. TensorFlow now
recommends its
[`@tensorflow-models/pose-detection`](https://github.com/tensorflow/tfjs-models/tree/master/pose-detection)
package, which includes supported MoveNet, BlazePose, and PoseNet detectors.

The `js/` and `img/` directories remain unchanged so old references and the
original visual experiments can still be inspected. The HTML entry points now
lead to a retirement notice and do not load third-party scripts, request webcam
access, or start model inference.

## Historical contents

- `a.html` estimated a pose from a static image.
- `b.html` used webcam input.
- `c.html` and `d.html` expected a local video file that was never distributed
  with the repository.
- `js/bodypose.js` provided the prototype's Pts drawing helpers.

These files are not maintained or included in demo lint and runtime smoke tests.
