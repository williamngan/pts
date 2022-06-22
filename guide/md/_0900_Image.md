# Image

Working with images in creative coding tends to be challenging and tedious. The Img class simplifies the common use cases, from loading and displaying static images to generating dynamic textures. Let's take a look.

### Loading and Displaying Images

We will start a minimalistic example: Load an image and display it on canvas. This can be done in 2 lines of code:

```
const img = Img.load( "/assets/demo.jpg" );
space.add( time => form.image( space.pointer, img ) );
```

![js:image_load](./assets/bg.png)

##### Image credit: "C 50 Last Birds And Flowers" by Kurt Schwitters

The above example uses the *static* function [`Img.load`](#image-img) to load an image, and then uses CanvasForm's [`image`](#canvas-canvasform) function to display it. The image will be displayed as soon as it's loaded.

To wait for the image to be ready first, either use the static [`Img.loadAsync`](#image-img) function, or create a blank Img instance and then call the *instance* function [`load`](#image-img). An example:

```
(async function() {
  let img = await Img.loadAsync( "/assets/img_demo.jpg" );
  space.add( time => form.image( space.pointer, img ) );
})();
```

Once the image is loaded, you can access its properties like width and height and manipulate its data. We will be discussing these advanced use cases next.

![js:image_load2](./assets/bg.png)

##### In this example, we access the image's original width and height after it's loaded, and then rescale it to fit the canvas size.


### Editing Images
When you create an Img instance with its `editable` parameter set to `true`, it will hold an internal canvas to support image manipulations. It also supports higher pixel-density displays via the `pixelScale` parameter. An example:

```
// Create an editable img with the current space's pixelScale
let img = new Img( true, space.pixelScale );
img.load( "/assets/demo.jpg" ).then( ... );

// Alternatively, Img.loadAsync static function
let img2 = await Img.loadAsync( "/assets/demo.jpg", true, space.pixelScale );
```

You can do a lot with an editable image. Let's try a couple common use cases.

### Get Pixels and Crop Regions

The [`pixel`](#image-img) function supports a very common use case: specify a pixel position on the image, get its RGBA color values, and do something with it. A wide range of visual possibilities may open up if you use this simple function creatively.

![js:image_pixel](./assets/bg.png)

##### Try scribbling in different regions of the image to change it. This demo combines `Create.delaunay` with `Img.pixel`.

Another common use case is to crop a region of the image. The [`crop`](#image-img) function takes a bounding box and returns an [`ImageData`](https://developer.mozilla.org/en-US/docs/Web/API/ImageData). You can then use CanvasForm's[`imageData`](#canvas-canvasform) to draw the region. 

```
form.imageData( img.crop( bound ) );
```

Let's try this in a demo:

![js:image_crop](./assets/bg.png)

##### Click to cut out a region in the image. Move pointer to shift its position.

It's more efficient to draw `ImageData` directly on canvas. If needed, you can also export it to a blob using [`Img.imageDataToBlob`](#image-img) and then load it into an image again.

### Edit and Sync

Since an editable [`Img`](#image-img) stores an internal canvas, you can leverage [`CanvasForm`](#canvas-canvasform)'s many drawing functions to draw directly on it. It's that easy!

After the image is loaded, you can access the canvas' rendering context through the property `img.ctx` and then create a new [`CanvasForm`](#canvas-canvasform) instance with it. For example:

```
const img = await Img.loadAsync( "demo.jpg" );
const imgForm = new CanvasForm( img.ctx );
...
imgForm.fill("#f00").rect( rect );
```

The following is a demo of drawing random rectangles directly on the image canvas.

![js:image_edit](./assets/bg.png)

##### Move pointer to draw patches on the image canvas.

Additionally, the [`filter`](https://ptsjs.org/docs/?p=Image_Img#function_filter) function supports image filter effects like desaturation and blur (See the [full list](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/filter) supported by canvas). Note that some effects may not work in mobile browsers.

```
img.filter( "blur(10px) contrast(20%) saturate(0%)" )
```

To display the edited image, use CanvasForm's [`image`](https://ptsjs.org/docs/?p=Canvas_CanvasForm#function_image) function but pass `img.canvas` (instead of `img` itself) in the parameter. 

```
// draw internal image canvas
form.image( img.canvas ); 
```

As we are only editing an internal canvas, the original image is unchanged until it's explicitly updated. Use [`sync`](#image-img) to update the original image when needed.

### Patterns

In a similar way, you can treat an image (or an image canvas) as a pattern to fill an area. One difference is that we'll use a [`CanvasPattern`](https://developer.mozilla.org/en-US/docs/Web/API/CanvasPattern) instance for `form.fill(...)`, instead of an image for `form.image(...)`.

```
const pattern = await Img.loadPattern( "tile.jpg", space );
...
form.fill( pattern ).rect( rect );
```

![js:image_pattern](./assets/bg.png)

##### Loading an image and filling it as a pattern

A pattern can be transformed via the standard canvas api [`pattern.setTransform`](https://developer.mozilla.org/en-US/docs/Web/API/CanvasPattern/setTransform). However, the documentation is confusing and incomplete. Pts provides an easy way to create a [`DOMMatrix`](https://developer.mozilla.org/en-US/docs/Web/API/DOMMatrix) for this use case.

```
const m = new Mat().translate2D( ... ).rotate2D( ... ).domMatrix;
pattern.setTransform( m );
```

![js:image_pattern2](./assets/bg.png)

##### Applying transforms to the pattern

All together, the Img class offers a wide range of potential creative expressions. For example, you can create a dynamic image and use it as a pattern fill (As shown in this [demo](https://ptsjs.org/demo/?name=img.pattern)).

It's now your turn to experiment!

### Tips and Tricks

- Anticipate screens with different pixel density. You can pass a CanvasSpace's [`pixelScale`](https://ptsjs.org/docs/?p=Canvas_CanvasSpace#accessor_pixelScale) when creating an Img instance. (See example in Cheatsheet below)

- You can [`load`](#image-img) an image from a base64 string or an url, or from a blob via the [`fromBlob`](#image-img) function. To export the current image, use [`toBase64`](#image-img) or [`toBlob`](#image-img) functions.

- CanvasForm's [`image`](#canvas-canvasform) drawing function can take either an Img instance or a [`CanvasImageSource`](https://developer.mozilla.org/en-US/docs/Web/API/CanvasImageSource) which includes various kinds of image objects like HTML Image or Canvas.

- Typically, you can't load an image from another domain due to security concerns. But if the image server allows for it and you want to do it, you can set the [`crossOrigin`](#image-img) parameter to `true` when creating an  `Img` instance. [More details here](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image).


### Cheatsheet

Creating, loading, displaying

```
// Simplest way
let img = Img.load( "demo.jpg");

// Load an editable image that matches the screen's resolution
// with an optional callback function when the image is loaded.
let img = Img.load("demo.png", true, space.pixelScale, onLoad );

// Equivalent but using async/await
let img = new Img( true, space.pixelScale );
await img.load("demo.png")

// Or using the loadAsync static function
let img = await Img.loadAsync( "demo.png" )

// Display an image automatically when it's loaded 
form.image( [0,0], img );

// Load a pattern and use it as fill
let pattern = Img.loadPattern( "tile.jpg" );
form.fill( pattern ).rect( rect );

// Get a pattern from an Img instance
const pattern = img.pattern();
form.fill( pattern ).rect( rect );

```

Useful properties
```
img.loaded; // true if the image is loaded
img.image; // the original image
img.canvas; // the internal canvas of an editable Img
img.ctx; // the context which can be used to create a CanvasForm
img.pixelScale; // pixel density which usually matches the space's
```

Editing an image
```
img.crop( rect )
img.resize( 0.5, true );
img.filter( "blur(10px) | contrast(200%)" );
img.pixel( space.pointer );

// Draw on image
let imgForm = new CanvasForm( img.ctx );
imgForm.fill( "#f00" ).point( space.pointer, 20 );

// Export as base64 string
img.toBase64(); 

// Getting a DOMMatrix instance for pattern transforms
const m = img.scaledMatrix.rotate2D(...).domMatrix;
pattern.setTransform( m );
form.fill( pattern ).rect( rect );

```




