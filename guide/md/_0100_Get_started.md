# Get started

It's easy to get started with **`pts`**. Here we'll review the core concepts and build a fun thing together. Let's do this!

![js:getting_started](./assets/bg.png)

##### Here's a spolier of what we will build. Touch to play it, and take a look at the source code. The core code is only ~10 lines long.

### Space, Form, and Point
**`pts`** is built upon the abstractions of Space, Form, and Point. If that's too abstract, you can think of it like drawing: Space provides the paper, Form provides the pencil, and Point provides the idea. Given an idea, you may express it in different forms in different spaces. Would it be expressed in pixels or LEDs? Is it visible or audible? Does it look like abstract art or ASCII art? As **`pts`** develops, it will offer more Spaces and Forms that enable you to experiment with different ideas and their different expressions. 

But enough of abstractions for now. Let's see how it works in a concrete example. In the following sections, we will create a quick sketch step-by-step and discuss the main features of **`pts`**.

##### [Here's an article](https://medium.com/@williamngan/pt-93382bf5943e) where I write about the concepts of Space, Form, and Point.

### Using pts with npm
If you use npm, first [`npm install pts`](https://www.npmjs.com/package/pts) and then: 

```
import {CanvasSpace, CanvasForm} from "pts/Canvas"
```

##### Note that pts is an es2015 library, so if you want to compile to es5, you'll need to configure babel accordingly. (Possibly with the [`builtin-extend`](https://github.com/loganfsmyth/babel-plugin-transform-builtin-extend) babel plugin)

### Using pts as a script
First download the latest release and add `pts.min.js` in your html. Then create another js file for your script and add it to html too. 

For convience, we usually start by adding **`pts`** into a scope first. 

```
Pts.namespace( this );
```

That means we can call `CanvasSpace`, instead of `Pts.CanvasSpace` which is a bit clumsy to write. If you don't want to "pollute" the global scope, it's common to wrap your code with a anonymous function:

```
(function() {
    Pts.namespace( this );
    ...
})();
```

And that's it. We can now have some fun.

### Creating Space and Form
In current release, **`pts`** provides a [`CanvasSpace`](#canvas-canvasspace) which enables you to use html `<canvas>` as space. You can create a `CanvasSpace` like this:

```
var space = new CanvasSpace("#hello");
space.setup({ bgcolor: "#fff" });
```

This assumes you have an element with `id="hello"` in your html. If your element is `<canvas id="hello">`, CanvasSpace will target that canvas. Otherwise if your element is a container like `<div id="hello">`, a new canvas will be created and appended into it.

The [`setup`](#canvas-canvasspace) function allows you to initiate the space with an object that specifies some setup options, like background-color and auto-resize.

Next, you can get the default [`CanvasForm`](#canvas-canvasform) which, as we mentioned before, provides the "pencils". CanvasForm helps you draw lines, circles, curves and more on the html canvas.

```
var form = space.getForm();
```

In future, you may create your own forms by extending `CanvasForm` or `Form` class. It's like making your own pencils. So you can also initiate your form like this:

```
var form = new BeautifulForm( space );
```

Now we have paper and pencil. What should we draw?

### Drawing a point
The `space`, which we just created, contains some handy variables. For example, the `pointer` variable tells us the current position of pointer in space (ie, mouse or touch position). Let's use it to draw a point.

To render an animation continuously, we need to add a "player" to the space. A "player" can be a callback function to run your animation, or an object that specifies functions for `start`, `animate`, and `action`. You may add multiple players to a space.

At its simplest form, this is how we can draw the `pointer`.

```
space.add( () => form.point( space.pointer, 10 ) );
```

And here's the result. Touch the demo and move around.

![js:getting_started_1](./assets/bg.png)

So first we add a "player" as a function to `space`, and in that function, we use `form` to draw `space.pointer` with radius of 10. By default, the point is drawn as a square with red fill-color and white stroke-color. 

The animate callback function actually provides 2 parameters: `time` which gives the current running time, and `ftime` which gives the time to render a frame.

Let's modify the code above to make the circle pulsate.

```
space.add( (time, ftime) => {
  let radius = Num.cycle( (time%1000)/1000 ) * 20;
  form.fill("#09f").point( space.pointer, radius, "circle" );
});
```

![js:getting_started_2](./assets/bg.png)

Success! The calculation `(time%1000)/1000` maps the running time to a value between 0 to 1 every second. Then we use the [`Num.cycle`](#num-num) function to make the value cycle between 0...1...0...1, and we multiply the value by 20 to get the radius. Finally, we draw the pointer with the radius as a blue circle. Pretty easy, right?

### Drawing shapes