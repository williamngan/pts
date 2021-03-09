# Image

Why don't we see more interactive and experimental plays with images, even as photos, videos and gifs fill the web? Perhaps working with images on html canvas is way harder than it should be — even a common use case, like loading an image and getting the color values of its pixels, proves to be practically tortuous.

Fret not! Pts' [`Img`](#image-img) provides some convenient and straightforward functions to help you experiment with images. Let's take a look.

### Loading and Displaying Images

Let's start a minimalistic example: Load an image and display it on canvas. This can be done in 3 lines of code:

```
const run = Pts.quickStart( "#elemID" );
const img = Img.load( "/assets/demo.jpg" );
run( t => form.image( space.pointer, img ) );
```

![js:image_load](./assets/bg.png)

##### Image credit: "C 50 Last Birds And Flowers" by Kurt Schwitters

The above example uses the static function [`load`](#image-img) to load an image, and then uses CanvasForm's [`image`](#canvas-canvasform) function to display it automatically when it's loaded.

If you need to manually track when the image is loaded, you can either:
- access the `img.loaded` property 
- add a callback function to the [`Img.load`](#image-img) function
- create an Img instance, call its [`load`](#image-img) function and use `async/await`.

```
const img = new Img();
await img.load( "/assets/demo.jpg" )
```

Once the image is loaded, you can access its properties like width and height and manipulate its data. We will be discussing these advanced use cases next.

![js:image_load2](./assets/bg.png)

##### Once the image is loaded, we can access its original width and height, and rescale it to fit the canvas size.


### Editing Images
When you create an Img instance with its `editable` parameter set to `true`, it will hold an internal canvas to support image manipulations. It also supports higher pixel-density displays via the `pixelScale` parameter. An example:

```
// Create an editable img with the current space's pixelScale
let img = new Img( true, space.pixelScale );
img.load( "/assets/demo.jpg" );

// Alternatively, use the Img.load static function
let img2 = Img.load( "/assets/demo.jpg", true, space.pixelScale );
```

With an editable image, you can now inspect and manipulate it creatively. 

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

##### Click to cut out a region in the image.

It's more efficient to draw `ImageData` directly on canvas. If needed, you can also export it to a blob using [`Img.imageDataToBlob`](#image-img) and then load it into an image again.

### Edit and Sync

Since an editable [`Img`](#image-img) stores an internal canvas, you can leverage [`CanvasForm`](#canvas-canvasform)'s many drawing functions to draw directly on it. It's that easy!

After the image is loaded, you can access the canvas' rendering context through the property `img.ctx` and then create a new [`CanvasForm`](#canvas-canvasform) instance with it. For example:

```
let form;
img.load( "demo.jpg" ).then( a => form = new CanvasForm(a.ctx) )  
```

![js:image_edit](./assets/bg.png)

Additionally, the [`filter`](https://ptsjs.org/docs/?p=Image_Img#function_filter) function supports image filter effects like desaturation and blur (See the [full list](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/filter) supported by canvas). Note that some effects may not work in mobile browsers.

```
img.filter( "blur(10px) contrast(20%) saturate(0%)" )
```

To display the edited image, use CanvasForm's [`image`](https://ptsjs.org/docs/?p=Canvas_CanvasForm#function_image) function but pass `img.canvas` (instead of `img` itself) in the parameter. As we are only editing an internal canvas, the original image is unchanged until it's explicitly updated. Use [`sync`](#image-img) to update the original image when needed.

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

// Display an image automatically when it's loaded 
form.image( [0,0], img );

// Check if image is loaded, then display its canvas in a rect
if (img.loaded) form.image( rect, img.canvas ); 

```

Useful properties
```
img.loaded; // true if the image is loaded
img.image; // the original image
img.canvas; // the internal canvas of an editable Img
img.ctx; // the context which can be used to create a CanvasForm
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
```




