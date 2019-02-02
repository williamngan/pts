# Animation

There are many great javascript animation libraries which you may use alongside Pts. For simple use cases, Pts' [`Tempo`](#link) utility class provides an intuitive and lightweight alternative.

Animation sequences are commonly implemented as a curated list of tweens played in milliseconds. But what if we take the idea one level higher, and think of it like a dance? Like One-two-three, One-two-three...

Let's start by setting the beats. Tempo is usually measured in beats-per-minute (bpm), so there are two ways to initiate a [`Tempo`](#link) instance: by setting a bpm, or specifying the duration of a beat in milliseconds.

```
// 120 beats-per-minute, or 500ms per beat
let tempo = new Tempo( 120 ); 

// 500ms per beat, or 120 bpm
let another = Tempo.fromBeat( 500 ); 
```

The essential function is [`Tempo.every`](#link), which counts the beats and triggers the callback functions you specified. It's like a smart metronome.

```
let everyTwo = tempo.every( 2 ); // count every 2 beats
let everyTen = tempo.every( 10 ); // count every 10 beats
```

The `every` function returns an object with two chainable functions: `start(...)` and `progress(...)`. The `start` function lets you set a callback to be triggered at the start of every period. For example:

```
// at the start of every 2-beats period, do something
everyTwo.start( (count) => ... )
```

The `progress` function lets you specify a callback during the progress of every period, so you can use it to interpolate values and tween properties.

```
// during every 10-beats period, do something
everyTen.progress( (count, t, time, isStart) => ... ) 
```

Let's look at an example. Here the tempo is set to 60 BPM (or 1 second per beat), and we design the behaviors as such:
- Every 1 beat, the square's color changes
- Every 2 beats, the circle's color changes and the rotation completes once

![js:tempo_progress](./assets/bg.png)

Pretty easy to create sychronized animation sequences, right? Let's try a few more example.

## Variations

**Tween**: Since the `t` parameter in `progress` callback function always go from 0 to 1, we can map its value to a [`Shaping`](../docs/?p=Num_Shaping) function and change the tweening style. Another neat trick is to use [`Num.cycle`](../docs/?p=Num_Num#function_cycle) to map the `t` value from [0...1] to [0...1...0].

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
let custom = tempo.every( [2, 2, 1, 1] ); // Taaa, Taaa, ta-ta.
```

![js:tempo_rhythm](./assets/bg.png)

## Controls

It's easy to control the speed of your animation by changing bpm by setting the [`Tempo.bpm`](#link) property. This makes it easier to synchronize your animations with music or in specific intervals.
```
tempo.bpm = 100; // set new bpm
tempo.bpm += 20; // make it 20 beats faster per minute
```

Try moving your cursor horizontally to change the bpm in this example:

![js:tempo_control](./assets/bg.png)

There are two ways to stop an animation. You can either add `return true` in the callback functions, or include a `name` in the third parameter of `start` or `progress` functions. 

```
let walking = (count, t) => {
   // ...
   return (count > 5);  // return true will stop this animation
}

tempo.progress( walking, 0, "robot" );
tempo.stop( "robot" ); // another way to stop this animation
```
