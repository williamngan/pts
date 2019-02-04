# Animation

[`Tempo`](#link) is a lightweight utility class which helps you create animation sequences intuitively. It's an alternative to many other great animation libraries (which you can use with Pts too).

Typically, animation sequences are often implemented as a curated list of tweens in milliseconds. But what if we take the idea one level higher, and treat it like a dance? Like One-two-three, One-two-three...

Let's start by counting the beats. Tempo is usually measured in beats-per-minute (bpm), so there are two ways to initiate a [`Tempo`](#link) instance: by setting a bpm, or specifying the duration of a beat in milliseconds.

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

The `every` function returns an object with two chainable functions: `start(...)` and `progress(...)`. These functions let you attach custom callback functions that respond to animation events.

The `start` function lets you set a callback to be triggered at the start of every *n*-beats period. For example: 

```
// at the start of every 2-beats period, do something
everyTwo.start( (count) => ... )
```

The `progress` function lets you set a callback during the progress of every *n*-beats period. The second parameter `t` always start at 0 and ends at 1 in every period, so you can use it to interpolate values and tween properties. 

```
// during every 10-beats period, do something
everyTen.progress( (count, t, time, isStart) => ... ) 
```

Let's look at an example. Here the tempo is set to 60 BPM (or 1 second per beat), and we design the behaviors so that:
- Every 1 beat, the square's color changes
- Every 2 beats, the circle's color changes and the rotation completes once

![js:tempo_progress](./assets/bg.png)

Pretty easy to create synchronized animation sequences, right? Let's try a few more example.

### Variations

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

### Controls

By changing bpm by setting the [`Tempo.bpm`](#link) property, you can control the speed of your animation. This makes it easier to synchronize your animations with music or at specific intervals.
```
tempo.bpm = 100; // set new bpm
tempo.bpm += 20; // make it 20 beats faster per minute
```

Try moving your cursor horizontally to change the bpm in this example:

![js:tempo_control](./assets/bg.png)

There are two ways to stop an animation. You can either `return true` within `start` or `progress` callback functions, or include a `name` in the third parameter of the callbacks and then call `tempo.stop( name )`. 

```
let walking = (count, t) => {
   // ...
   return (count > 5);  // return true will stop this animation
}

tempo.progress( walking, 0, "robot" );
tempo.stop( "robot" ); // another way to stop this animation
```

### Cheat Sheet

Create a [`Tempo`](#link) instance with specific bpm.
```
tempo = new Tempo(120); // 120 bpm
tempo = Tempo.fromBeat( 100 ); // one beat every 100ms
```

Count beats and trigger animation callbacks
```
let fiveBeats = tempo.every( 5 );

fiveBeats.start( (count) => { 
  // do something at start of every period
  return count > 5; // optionally return true to stop animating
});

fiveBeats.progress( (count, t, time, isStart) =>  { 
  // do something during each period
});
```
