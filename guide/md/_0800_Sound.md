# Sound

Sounds and visual forms complement each other. Together they enable us to create expressive and unique compositions. Pts simplifies a subset of Web Audio API to assist you with common tasks like playbacks and visualizations.

### Input

Let's get some sounds! Do you want to load from a sound file, receive microphone input, or generate audio dynamically? Pts offers three handy static functions for these.

1. Using [`Sound.load`](#) to load a sound file with an url or a specific `<audio>` element.
```
let sound = Sound.load( "/path/to/hello.mp3" );
let sound2 = Sound.load( audioElement );
```

2. Using [`Sound.input`](#) to get audio from default input device (usually microphone).
```
let sound = Sound.input(); // default input device
let sound2 = Sound.input( constraints ); // advanced use cases
```

3. Using [`Sound.generate`](#) to create a tone.
```
let sound = Sound.generate( "sine", 120 ); // sine oscillator at 120Hz
```

### Play
After creating a Sound instance, what can you do with it? You can play it, obviously.

```
sound.start();
sound.stop();
sound.toggle(); // toggle between start and stop
sound.playing; // boolean to indicate if sound is playing
```

##### Note that current browsers no longer support autoplay. Users will need to express intent to play the sound (eg, with a click).

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

Optionaly, use the [`timeDomainTo`](#) function to map the data into a rectangular area. You can then apply various Pts functions to transform and visualize the data.

```
// fit data into a 200x100 area, starting from position (50, 50)
let td = sound.timeDomainTo( [200, 100], [50, 50] );

form.points( td ); // visualize as points
```

![js:sound_time](./assets/bg.png)


