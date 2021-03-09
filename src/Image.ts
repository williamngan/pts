import { Bound, Pt } from "./Pt";
import { PtLike } from "./Types";

/**
 * Img provides convenient functions to support image operations on HTML Canvas and [`CanvasSpace`](#link). Combine this with other Pts functions to experiment with visual forms that integrate bitmaps and vector graphics.
 */
export class Img {

  protected _img:HTMLImageElement;
  protected _data:ImageData;
  protected _cv:HTMLCanvasElement;
  protected _ctx:CanvasRenderingContext2D;
  protected _scale:number = 1;

  protected _loaded:boolean = false;
  protected _editable:boolean;

  /**
   * Create an Img
   * @param editable Specify if you want to manipulate pixels of this image. Default is `false`.
   * @param pixelScale Set internal canvas' scale in relation to original image size. Useful for retina screens. Use `CanvasSpace.pixelScale` to pass current scale.
   * @param crossOrigin an optional parameter to enable loading cross-domain images if set to true. The image server's configuration must also be set correctly. For more, see [this documentation](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image).
   */
  constructor( editable:boolean=false, pixelScale:number=1, crossOrigin?:boolean ) {
    this._editable = editable;
    this._scale = pixelScale;
    this._img = new Image();
    if (crossOrigin) this._img.crossOrigin = "Anonymous";
  }


  /**
   * A static function to create an Img with an optional ready callback. The Img instance will returned immediately before the image is loaded.
   * @param src an url of the image in same domain. Alternatively you can use a base64 string. To load from Blob, use `Img.fromBlob`.
   * @param editable Specify if you want to manipulate pixels of this image. Default is `false`.
   * @param pixelScale Set internal canvas' scale in relation to original image size. Useful for retina screens. Use `CanvasSpace.pixelScale` to pass current scale.
   * @param ready An optional ready callback function 
   */
  static load( src:string, editable:boolean=false, pixelScale:number=1, ready?:(img) => {} ):Img {
    let img = new Img( editable, pixelScale );
    img.load( src ).then( res => {
      if (ready) ready(res);
    });
    return img;
  }
  

  /**
   * Load an image. 
   * @param src an url of the image in same domain. Alternatively you can use a base64 string. To load from Blob, use `Img.fromBlob`.
   * @returns a Promise that resolves to an Img
   */
  load( src:string ): Promise<Img> {
    return new Promise( (resolve,reject) => {
      this._img.src = src;

      this._img.onload = () => {
        if (this._editable) {
          if (!this._cv) this._cv = document.createElement( "canvas" ) as HTMLCanvasElement;
          this._drawToScale( this._scale, this._img );
          this._data = this._ctx.getImageData(0, 0, this._cv.width, this._cv.height );
        }
  
        this._loaded = true;
        resolve( this );
      };
      
      this._img.onerror = (evt:Event) => {
        reject( evt );
      };

    });
  }

  /**
   * Rescale the canvas and draw an image-source on it.
   * @param imgScale rescale factor for the image
   * @param canvasScale rescale factor for the canvas
   * @param img an image source like Image, Canvas, or ImageBitmap.
   */
  protected _drawToScale( canvasScale:number|PtLike, img:CanvasImageSource ) {
    const cms = (typeof canvasScale === 'number') ? [canvasScale, canvasScale] : canvasScale;
    const nw = img.width as number;
    const nh = img.height as number;
    this._cv.width = nw * cms[0];
    this._cv.height = nh * cms[1];

    this._ctx = this._cv.getContext( '2d' );
    if (img) this._ctx.drawImage( img, 0, 0, nw, nh, 0, 0, this._cv.width, this._cv.height );
  }


  /**
   * Get an efficient, readonly bitmap of the current canvas.
   * @param size Optional size to crop
   * @returns a Promise that resolves to an ImageBitmap
   */
  bitmap( size?:PtLike ):Promise<ImageBitmap> {
    const w = (size) ? size[0] : this._cv.width;
    const h = (size) ? size[1] : this._cv.height;
    return createImageBitmap( this._cv, 0, 0, w, h );
  }


  /**
   * Replace the image with the current canvas data. For example, you can use CanvasForm's static functions to draw on `this.ctx` and then update the current image.
   */
  sync() {
    // retina: resize canvas to fit image original size
    if (this._scale !== 1) {
      this.bitmap().then( b => {
        this._drawToScale( 1/this._scale, b ); // rescale canvas to match original and draw saved bitmap        
        this.load( this.toBase64() ); // load current canvas into image
      });

    // no retina so no need to rescale
    } else {
      this._img.src = this.toBase64(); 
    }
  }


  /**
   * Get the RGBA values of a pixel in the image
   * @param p position of the pixel
   * @param rescale Specify if the pixel position should be scaled. Usually use rescale when tracking image and don't rescale when tracking canvas. You may also set a custom scale value.
   * @returns [R,G,B,A] values of the pixel at the specific position
   */
  pixel( p:PtLike, rescale:boolean|number=true ):Pt {
    const s = ( typeof rescale == 'number' ) ? rescale : (rescale ? this._scale : 1);
    return Img.getPixel( this._data, [ p[0]*s, p[1]*s ] );
  }
  

  /**
   * Given an ImaegData object and a position, return the RGBA pixel value at that position.
   * @param imgData an ImageData object
   * @param p a position on the image
   * @returns [R,G,B,A] values of the pixel at the specific position
   */
  static getPixel( imgData:ImageData, p:PtLike):Pt {
    const no = new Pt(0,0,0,0);
    if ( p[0] >= imgData.width || p[1] >= imgData.height ) return no;

    const i = Math.floor(p[1]) * ( imgData.width * 4 ) + ( Math.floor(p[0]) * 4 );
    const d = imgData.data;
    if ( i >= d.length-4 ) return no;

    return new Pt( d[i], d[i+1], d[i+2], d[i+3] );
  }


  /**
   * Resize the canvas image. The original image is unchanged until `sync()`.
   * @param sizeOrScale A PtLike array specifying either [x, y] scales or [x, y] sizes.
   * @param asScale If true, treat the first parameter as scales. Otherwise, treat it as specific sizes.
   */
  resize( sizeOrScale:PtLike, asScale:boolean = false ):this {
    let s = asScale ? sizeOrScale : [ sizeOrScale[0]/this._img.naturalWidth, sizeOrScale[1]/this._img.naturalHeight ];
    this._drawToScale( s, this._img );
    this._data = this._ctx.getImageData(0, 0, this._cv.width, this._cv.height );
    return this;
  }


  /**
   * Crop an area of the image.
   * @param box bounding box
   */
  crop( box:Bound ):ImageData {
    let p = box.topLeft.scale( this._scale );
    let s = box.size.scale( this._scale );
    return this._ctx.getImageData( p.x, p.y, s.x, s.y );
  }


  /**
   * Apply filters such as blur and grayscale to the canvas image. The original image is unchanged until `sync()`.
   * @param css a css filter string such as "blur(10px) | contrast(200%)". See [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/filter#browser_compatibility) for a list of filter functions.
   */
  filter( css:string ):this {
    this._ctx.filter = css;
    return this;
  }


  /**
   * Remove the elements and data associated with this Img.
   */
  cleanup() {
    if (this._cv) this._cv.remove();
    if (this._img) this._img.remove();
    this._data = null;
  }


  /**
   * Create a blob url that can be passed to `Img.load`
   * @param blob an image blob such as `new Blob([my_Uint8Array], {type: 'image/png'})`
   * @param editable Specify if you want to manipulate pixels of this image. Default is `false`.
   */
  static fromBlob( blob:Blob, editable:boolean=false, pixelScale:number=1  ):Promise<Img> {
    let url = URL.createObjectURL(blob);
    return new Img( editable, pixelScale ).load( url );
  }


  /**
   * Convert ImageData object to a Blob, which you can then create an Img instance via [`Img.fromBlob`](#link). Note that the resulting image's dimensions will not account for pixel density.
   * @param data 
   */
  static imageDataToBlob( data:ImageData ):Promise<Blob> {
    return new Promise( function (resolve)  { 
      let cv = document.createElement( "canvas" ) as HTMLCanvasElement;
      cv.width = data.width;
      cv.height = data.height;
      cv.getContext("2d").putImageData( data, 0, 0);
      cv.toBlob( blob => {
        resolve( blob );
        cv.remove();
      });
    });
  }


  /**
   * Export current canvas image as base64 string
   */
  toBase64():string {
    return this._cv.toDataURL();
  }


  /**
   * Export current canvas image as a blob
   */
  toBlob():Promise<Blob> {
    return new Promise( (resolve) => { 
      this._cv.toBlob( blob => resolve(blob) );
    });
  }


  /**
   * Get current image source. If editable, this will return the canvas, otherwise it will return the original image.
   */
  get current():CanvasImageSource {
    return this._editable ? this._cv : this._img;
  }


  /**
   * Get the original image
   */
  get image():HTMLImageElement {
    return this._img;
  }


  /**
   * Get the internal canvas
   */
  get canvas():HTMLCanvasElement {
    return this._cv;
  }


  /**
   * Get the internal canvas' ImageData
   */
  get data():ImageData {
    return this._data;
  }


  /**
   * Get the internal canvas' context. You can use this to draw directly on canvas, or create a new [CanvasForm](#link) instance with it.
   */
  get ctx():CanvasRenderingContext2D {
    return this._ctx;
  }


  /**
   * Get whether the image is loaded
   */
  get loaded():boolean {
    return this._loaded;
  }

  
  /**
   * Get pixel density scale
   */
  get pixelScale():number {
    return this._scale;
  }


  /**
   * Get size of the original image
   */
  get imageSize():Pt {
    return new Pt(this._img.width, this._img.height);
  }


  /**
   * Get size of the canvas
   */
  get canvasSize():Pt {
    return new Pt(this._cv.width, this._cv.height);
  }
}