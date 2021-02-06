import { Pt } from "./Pt";
import { PtLike } from "./Types";
import { Util } from "./Util";

export class Img {

  protected _img:HTMLImageElement;
  protected _data:ImageData;
  protected _cv:HTMLCanvasElement;
  protected _ctx:CanvasRenderingContext2D;

  protected _loaded:boolean = false;
  protected _editable:boolean;

  /**
   * 
   * @param editable  
   */
  constructor( editable:boolean=true ) {
    this._editable = editable;
    this._img = new Image();
  }

  /**
   * @param src an url of the image in same domain. Alternatively you can use a base64 string. To load from Blob, use `Img.fromBlob` directly.
   * @returns a Promise that resolves to an Img
   */
  load( src:string ): Promise<Img> {
    return new Promise( (resolve,reject) => {
      this._img.src = src;

      this._img.onload = () => {
        if (this._editable) {
          this._cv = document.createElement( "canvas" ) as HTMLCanvasElement;
          this._cv.width = this._img.naturalWidth;
          this._cv.height = this._img.naturalHeight;
  
          this._ctx = this._cv.getContext( '2d' );
          this._ctx.drawImage( this._img, 0, 0 );
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
   * Get an efficient, readonly bitmap that can be drawn on canvas.
   * @returns a Promise that resolves to an ImageBitmap
   */
  bitmap():Promise<ImageBitmap> {
    return createImageBitmap( this._img, 0, 0, this._img.naturalWidth, this._img.naturalHeight );
  }


  pixel( p:PtLike ):Pt {
    return Img.getPixel( this._data, p );
  }
  

  static getPixel( imgData:ImageData, p:PtLike):Pt {
    const no = new Pt(0,0,0,0);
    if ( p[0] >= imgData.width || p[1] >= imgData.height ) return no;

    const i = p[1] * (imgData.width * 4) + (p[0] * 4);
    const d = imgData.data;
    if ( i >= d.length-4 ) return no;

    return new Pt( d[i], d[i+1], d[i+2], d[i+3] );
  }


  get image():HTMLImageElement {
    return this._img;
  }


  get data():ImageData {
    return this._data;
  }


  get ctx():CanvasRenderingContext2D {
    return this._ctx;
  }


  get loaded():boolean {
    return this._loaded;
  }


  /**
   * 
   * @param blob an image blob such as `new Blob([my_Uint8Array], {type: 'image/png'})`
   * @param editable 
   */
  static fromBlob( blob:Blob, editable:boolean=false ):Promise<Img> {
    let url = URL.createObjectURL(blob);
    return new Img( editable ).load( url );
  }

  toBase64():string {
    return this._cv.toDataURL();
  }

}