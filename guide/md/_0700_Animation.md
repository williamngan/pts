# Animation

There are many great javascript animation libraries, like the elegant Popmotion and the full-featured GSAP, which you may use alongside Pts. For simple use cases, Pts' Tempo class offers an intuitive and lightweight alternative.

Often, an animation sequence is implemented as a curated list of tweens played in milliseconds. What if we take the idea one level higher, and think of the sequence like a dance? One-two-three, One-two-three...

Let's start by setting the beats. The common measurement is beats-per-minute (BPM). You can create a Tempo instance in two ways: by setting a BPM, or specifying the duration of a beat in milliseconds.

```
// 120 beats-per-minute, or 500ms per beat
let ta = new Tempo( 120 ); 

// 500ms per beat, or 120 BPM
let tb = Tempo.fromBeat( 500 ); 
```

The essential function in a Tempo instance is `every(...)`, which counts the beats for you. It's like a smart metronome.

```
let everyTwo = ta.every( 2 );
let everyTen = ta.every( 10 );
```

The returned object from `every` has two chainable functions: `start( fn )` and `progress( fn )`. `start` lets you set a callback at the start of every period. For example:

```
// at the start of every 2-beats period, add a dot
everyTwo.start( (count) => ... )
```

`progress` lets you specify a callback during the progress of every period, so you can use it to interpolate values and tween properties.

```
// during every 10-beats period, do this...
everyTen.progress( (count, t, time, isStart) => ... ) 
```

Let's look at an example. Here the tempo is set to 60 BPM (or 1 second per beat), and we design the behaviors as such:
- Every 1 beat, the square's color changes
- Every 2 beats, the circle's color changes and the rotation completes once

![js:tempo_progress](./assets/bg.png)

It's pretty easy to create animations that are in sync with rhythm. Let's try a few more example.

## Variations

**Tween**: Since the `t` parameter in `progress` callback function always go from 0 to 1, we can map the value to a [Shaping](../docs/?p=Num_Shaping) function and change the tweening style. 

```
everyTwo.progress( (count, t, time, isStart) => {
    let tt = Shaping.elasticOut( t );
    ...
}) 
```

![js:tempo_shaping](./assets/bg.png)


**Stagger**: You can offset a beat's timing by a small difference to create a "stagger" effect. Specify an offset time (in milliseconds) in the optional second parameter.

```
let fn = (count, t) => ... ;
everyTwo.progress( fn, -100 ); // activate 100ms sooner
```

![js:tempo_stagger](./assets/bg.png)

**Rhythm**: Set a custom rhythm by passing a list of beats in the `every` function.

```
let ta = tempo.every( [2, 2, 1, 1] ); // Taaa, Taaa, ta-ta.
```

![js:tempo_rhythm](./assets/bg.png)
