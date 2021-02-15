import { Bound, Pt } from "./Pt";
import { PtLike } from "./Types";
export declare class Img {
    protected _img: HTMLImageElement;
    protected _data: ImageData;
    protected _cv: HTMLCanvasElement;
    protected _ctx: CanvasRenderingContext2D;
    protected _scale: number;
    protected _loaded: boolean;
    protected _editable: boolean;
    constructor(editable?: boolean, pixelScale?: number);
    load(src: string): Promise<Img>;
    protected _drawToScale(imgScale: number, canvasScale: number, img: CanvasImageSource): void;
    bitmap(size?: PtLike): Promise<ImageBitmap>;
    sync(): void;
    pixel(p: PtLike): Pt;
    static getPixel(imgData: ImageData, p: PtLike): Pt;
    crop(box: Bound): ImageData;
    static fromBlob(blob: Blob, editable?: boolean): Promise<Img>;
    toBase64(): string;
    get image(): HTMLImageElement;
    get canvas(): HTMLCanvasElement;
    get data(): ImageData;
    get ctx(): CanvasRenderingContext2D;
    get loaded(): boolean;
    get pixelScale(): number;
}
