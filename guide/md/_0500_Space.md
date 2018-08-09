# Space

[`Space`](#space-space) provides a general context for its points to be expressed. Each subclass of `Space` represents a specific context. Currently **`Pts`** includes [`CanvasSpace`](#canvas-canvasspace) which corresponds to the [`canvas`](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) element, and [`SVGSpace`](#svg-svgspace) which lets you create vector graphics in svg format instead. There is also an experimental [`HTMLSpace`](#dom-htmlspace) which renders forms in basic html elements. Soon we will have spaces for other contexts too.

[`CanvasSpace`](#canvas-canvasspace) can be created like this:
```
let space = new CanvasSpace( "#hello" );
space.setup({ bgcolor: "#123", retina: true });
```

The "#hello" is a [`selector string`](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector) that selects an element in the html page. If the element is a `<canvas>`, it will be used by CanvasSpace. If the element is a `<div>` or other block element, a new `<canvas>` will be appended into it. You may also pass a HTMLElement directly, instead of a query selector string.

Once the space is created, you can optionally call the [`setup`](#canvas-canvasspace) function to specify its background color (`bgcolor`) and other properties. Take a look at the [`setup`](#canvas-canvasspace) documentation for more.

Now the space is set up, let's look at what it can do.

### Players

A space by itself is void of form. Let's add a "player" to it. A player can be either a function or an object with specific properties. 

```
space.add( (time, ftime) => {
  // do things
});
```

In the above, we use [`add`](#canvas-canvasspace) to add a simple callback function. It has 2 parameters: `time` which gives the current running time, and `ftime` which gives the time taken to draw the previous frame. This callback is like an animation loop, which will be called continuously when the player plays. 

Let's look at a more elaborate player:

```
space.add( {
  start: (bound, space) => { 
    // code for init 
  },
  animate: (time, ftime, space) => { 
    // code for animation 
  },
  action: (type, x, y, event) => { 
    // code for interaction 
  },
  resize: (size, event) => { 
    // code for resize 
  }
} );
```

Here we add an object that conforms to the [IPlayer](../docs/interfaces/_space_.iplayer.html) interface, which defines 4 optional callback functions:
- `start` function is called when the space is ready. It includes 2 parameters: `bound` which returns the bounding box, and `space` which returns its space.   


- `animate` function is called continuously when the space plays. It includes 2 parameters: `time` which gives the current running time, and `ftime` which gives the time taken to draw the previous frame.    

- `action` function is called when an user event is detected. It includes 4 parameters: `type` is a string that returns the action's name. ("up", "down", "move", "drag", "drop", "over", and "out"). `x` and `y` returns the position at which the action happened, and `event` returns the actual event object. See also: [`bindMouse`](#canvas-canvasspace)   

- `resize` function is called when the space is resized. It includes 2 parameter: `size` which returns the new size, and event which returns the event object   

You may add multiple players into a space, each taking care of specific parts of a scene. Use [`add`](#canvas-canvasspace) and [`remove`](#canvas-canvasspace) to manage a space's players.

### Animation and interaction
You can tell a space to play or stop its players using [`play`](#canvas-canvasspace), [`stop`](#canvas-canvasspace) and other functions:

```
space.play();
space.playOnce( 1000 ); // play 1 sec then stop
space.pause();
space.resume();
space.stop();
```

Using [`bindMouse`](#canvas-canvasspace)  and [`bindTouch`](#canvas-canvasspace), you can easily make the space respond to user interactions. Once the space can receive mouse or touch events, you can track the events using a player's `action` callback function, as described above. 


```
// You can chain multiple functions together
space.bindMouse().bindTouch().play();
```

CanvasSpace also provides a couple convenient properties which you may access once the space is initiated. [`.pointer`](#canvas-canvasspace) gives you the current pointer position. [`.size`](#canvas-canvasspace), [`.center`](#canvas-canvasspace), [`.width`](#canvas-canvasspace), [`.height`](#canvas-canvasspace) and [`.innerBound`](#canvas-canvasspace) are handy to get a space's size and center point. [`.element`](#canvas-canvasspace) and [`.parent`](#canvas-canvasspace) returns the html elements of this space.

CanvasSpace also supports offscreen rendering which may help with rendering complex scene. Take a look at the source code of [this study](../study/index.html?name=CanvasSpace.offscreen) for more.


### Form

In the [Get Started](./Get-started-0100.html) guide, we made an analogy of paper and pencil when introducing Space and Form. So [`CanvasForm`](#canvas-canvasform) represents a pencil to draw on CanvasSpace. You can get the form with a single function call.

```
let space = new CanvasSpace("#paper");
let form = space.getForm(); // get default CanvasForm
```

[`CanvasForm`](#canvas-canvasform) includes many convenient functions to draw shapes on `<canvas>`. It's easier to use than the API provided by html canvas. Usually, you'll use form to draw a scene in a player's callback function as discussed above.

```
// Draw points inside the animate callback function
space.add({
  animate: (time, ftime) => {
    form.stroke("#fff").fill("#f03").circle( c );
    form.point( p, 10 );    
  }
});
```

![js:space_form](./assets/bg.png)

##### A demo of drawing different shapes

And since both Space and Form are javascript classes, you can extend them to override its functions and add new ones. 

### SVG Space
You can easily switch you code from [`CanvasSpace`](#canvas-canvasspace) to [`SVGSpace`](#svg-svgspace) in 3 easy steps:

First, initiate space as `SVGSpace` instead of `CanvasSpace`. If you use `space.getForm()`, then it will return an `SVGForm` instead of `CanvasForm` automatically.

Second, in the beginning of your animate callback function, add this line: 
```
form.scope( this );
``` 
This keeps track of the created svg or dom elements to optimize rendering.

Lastly, if you use es6 arrow function in a player's callback functions, for example: 
```
animate: (time, ftime) => ...
``` 
You should change it back to the standard form:
```
animate: function( time, ftime) ...
``` 
The arrow function automatically binds `this` and will confuse the `form.scope(this)` call.

Take a look at the source code of the [svg demo](https://ptsjs.org/demo/index.html?name=svgform.scope). It's pretty straightforward.


### HTML Space

There's also experimental support for rendering HTML elements using [`HTMLSpace`](#dom-htmlspace), which you can use by making similar changes in your code as described in SVG section above.

Take a look at the [html demo](https://ptsjs.org/pts/demo/index.html?name=htmlform.scope) and its source code. Because of the limitations of HTML, you cannot draw polygon, arc, and some other shapes with it.

If you use Pts with React or other web rendering frameworks, it will be better to use the props and states of their virtual DOM implementations instead.

### Cheat sheet

The following snippet is a typical template for making a quick **`Pts`** sketch. Pretty easy.

```
Pts.namespace( this ); // not needed if using npm package

var space = new CanvasSpace("#hello").setup({ retina: true });
var form = space.getForm();

space.add( (time, ftime) => {
  form.fill("#f03").point( space.pointer, 10, "circle" ); 
} );

space.bindMouse().bindTouch().play();
```

And if you need additional tracking in a player, you can add it as an object with these callback functions:

```
space.add( {

  start: (bound, space) => {},

  animate: (time, ftime) => {
    form.fill("#f03").point( space.pointer, 10, "circle" );
  },

  action: (type, x, y, evt) => {},

  resize: (size, evt) => {}
  
} );
```

