# Sound

Sounds and visual forms complement each other and enable us to create expressive and unique compositions. Pts simplifies a subset of Web Audio API to assist you with common tasks like playbacks and visualizations.

Before we start, let's play a fun visualization using Pts's sound functions.

![js:sound_visual](./assets/bg.png)

### Input

Let's get some sounds to start! Do you want to load from a sound file, receive microphone input, or generate audio dynamically? Pts offers three handy static functions for these.

1. Using [`Sound.load`](#) to load a sound file with an url or a specific `<audio>` element. You can check if the audio file is ready to play by accessing [`.playable`](#) property.
```
let sound = Sound.load( "/path/to/hello.mp3" );
let sound2 = Sound.load( audioElement );
```

2. Using [`Sound.generate`](#) to create a sound.
```
let sound = Sound.generate( "sine", 120 ); // sine oscillator at 120Hz
```

3. Using [`Sound.input`](#) to get audio from default input device (usually microphone). This will return a Promise object which will resolve when the input device is ready.
```
let sound;
Sound.input().then( s => sound = s ); // default input device
Sound.input( constraints ).then( s => sound = s ); // advanced use cases
```

Here's a basic demo of getting audio from microphone:

![js:sound_mic](./assets/bg.png)

##### You may first need to allow this page to access microphone, and then click the record button. We also make the recording stop when the pointer leave the demo area so that your microphone is not always on.


You can then start and stop playing the sound like this:

```
sound.start();
sound.stop();
sound.toggle(); // toggle between start and stop
sound.playing; // boolean to indicate if sound is playing
```

##### Note that current browsers no longer support autoplay. Users will need to express intent to play the sound (eg, with a click). 

### Analyze

It gets more interesting when we can look into the sound data and analyze them. Let's hook up an analyzer to our Sound instance.

```
sound.analyze( 128 ); // Call once to initiate the analyzer
```

This will create an analyzer with 128 bins (more on that later) and default decibel range and smoothing values. See [docs](#) for description of the advanced options.

There are two common ways to analyze sounds. First, we can represent sounds as snapshots of sound waves, which correspond to variations in air pressure over time. This is called the time-domain, as it measures amplitudes of the "waves" over time steps.

To get the time domain data at current time step, call the [`timeDomain`](#) function.

```
// get an uint typed array of 128 values (corresponds to bin size above)
let td = sound.timeDomain(); 
```

Optionaly, use the [`timeDomainTo`](#) function to map the data to another range, such as a rectangular area. You can then apply various Pts functions to transform and visualize waveforms in a few lines of code.

```
// fit data into a 200x100 area, starting from position (50, 50)
let td = sound.timeDomainTo( [200, 100], [50, 50] );

form.points( td ); // visualize as points
```

In the following example, we map the data to a normalized circle and then re-map it to draw colorful lines.

```
sound.timeDomainTo( [Const.two_pi, 1] ).map( t => ... );
```

![js:sound_time](./assets/bg.png)

##### Click to play and visualize sounds of drum, tambourine, and flute from Philharmonia Orchestra.

In a similar way, we can access the frequency domain data by `frequencyDomain` and `frequencyDomainTo`. The frequency bins are calculated by an algorithm called Fast Fourier Transform (FFT). The FFT size is usually 2 times the bin size and they need to be multiples of 2. (Recall that we set bin size to 128 earlier). You can quickly test it with a single line of code:

```
form.points( sound.freqDomainTo( space.size ) );
```

Or make something fun, weird, beautiful through the interplay of sounds and shapes.

![js:sound_frequency](./assets/bg.png)

### Advanced
For advanced use cases, you can create an instance using  [`Sound.from`](#) static method. For example:

```
Sound.from( audioNode, audioContext );
```

The following example demonstrates how you may generate audio using [tone.js](https://tonejs.github.io/) and then visualize it with Pts: 

[ ![screenshot](./assets/tone.png) ](./js/examples/tone.html)

##### Click image to open tone.js demo. See [source code here](#).

If needed, you can also directly access the following properties in a Sound instance to make full use of the [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API).

- [`.ctx`](#) - access the `AudioContext` instance
- [`.node`](#) - access the `AudioNode` instance
- [`.stream`](#) - access the `MediaStream` instance
- [`.source`](#) - access the `HTMLMediaElement` if you're playing from a sound file

Also note that [`sound.start()`](#) will connect the AudioNode to the destination of the AudioContext, while [`start.stop()`](#) will disconnect it.

Web Audio covers a wide range of topics. Here are a few pointers for you to dive deeper:

- [Web Audio API book](https://webaudioapi.com/book/) and [samples](https://webaudioapi.com/samples/) by Boris Smus 
- [tone.js](https://tonejs.github.io/) is a framework for creating interactive music in the browser
- [tonal.js](https://github.com/danigb/tonal) is a functional music theory library for javascript
- [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) on Web Audio API

### Cheatsheet

Creating and playing a Sound instance
```
s = Sound.load( "path/to/file.mp3" ); // from file
s = Sound.generate( "sine", 120 ); // sine wave at 120hz
s = Sound.from( node, context ); // advanced use case
Sound.input().then( _s => s = _s ); // get microphone input

s.start();
s.stop();
s.toggle();
```

Getting time domain and frequency domain data
```
s.analyzer( 1024 ); // Create analyzer with 1024 bins. Call once only.

s.timeDomain();
s.timeDomainTo( area, position ); // map to a area [w, h] from position [x, y]

s.freqDomain();
s.freqDomainTo( [10, 5] ); // map to a 10x5 area
```

