var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { CanvasForm } from "./Canvas";
import { Pt } from "./Pt";
export class Img {
    constructor(editable = false, space, crossOrigin) {
        this._scale = 1;
        this._loaded = false;
        this._editable = editable;
        this._space = space;
        this._scale = this._space ? this._space.pixelScale : 1;
        this._img = new Image();
        if (crossOrigin)
            this._img.crossOrigin = "Anonymous";
    }
    static load(src, editable = false, space, ready) {
        const img = new Img(editable, space);
        img.load(src).then(res => {
            if (ready)
                ready(res);
        });
        return img;
    }
    static loadAsync(src, editable = false, space) {
        return __awaiter(this, void 0, void 0, function* () {
            const img = yield new Img(editable, space).load(src);
            return img;
        });
    }
    static loadPattern(src, editable = false, space, repeat = 'repeat') {
        return __awaiter(this, void 0, void 0, function* () {
            const img = yield Img.loadAsync(src, editable, space);
            return img.pattern(repeat);
        });
    }
    static blank(size, space) {
        let img = new Img(true, space);
        img.initCanvas(size[0], size[1], space ? space.pixelScale : 1);
        return img;
    }
    load(src) {
        return new Promise((resolve, reject) => {
            if (this._editable && !document) {
                reject("Cannot create html canvas element. document not found.");
            }
            this._img.src = src;
            this._img.onload = () => {
                if (this._editable) {
                    if (!this._cv)
                        this._cv = document.createElement("canvas");
                    this._drawToScale(this._scale, this._img);
                    this._data = this._ctx.getImageData(0, 0, this._cv.width, this._cv.height);
                }
                this._loaded = true;
                resolve(this);
            };
            this._img.onerror = (evt) => {
                reject(evt);
            };
        });
    }
    _drawToScale(canvasScale, img) {
        const nw = img.width;
        const nh = img.height;
        this.initCanvas(nw, nh, canvasScale);
        if (img)
            this._ctx.drawImage(img, 0, 0, nw, nh, 0, 0, this._cv.width, this._cv.height);
    }
    initCanvas(width, height, canvasScale = 1) {
        if (!this._editable) {
            console.error('Cannot initiate canvas because this Img is not set to be editable');
            return;
        }
        if (!this._cv)
            this._cv = document.createElement("canvas");
        const cms = (typeof canvasScale === 'number') ? [canvasScale, canvasScale] : canvasScale;
        this._cv.width = width * cms[0];
        this._cv.height = height * cms[1];
        this._ctx = this._cv.getContext('2d');
        this._loaded = true;
    }
    bitmap(size) {
        const w = (size) ? size[0] : this._cv.width;
        const h = (size) ? size[1] : this._cv.height;
        return createImageBitmap(this._cv, 0, 0, w, h);
    }
    pattern(reptition = 'repeat', dynamic = false) {
        if (!this._space)
            throw "Cannot find CanvasSpace ctx to create image pattern";
        return this._space.ctx.createPattern(dynamic ? this._cv : this._img, reptition);
    }
    sync() {
        if (this._scale !== 1) {
            this.bitmap().then(b => {
                this._drawToScale(1 / this._scale, b);
                this.load(this.toBase64());
            });
        }
        else {
            this._img.src = this.toBase64();
        }
    }
    pixel(p, rescale = true) {
        const s = (typeof rescale == 'number') ? rescale : (rescale ? this._scale : 1);
        return Img.getPixel(this._data, [p[0] * s, p[1] * s]);
    }
    static getPixel(imgData, p) {
        const no = new Pt(0, 0, 0, 0);
        if (p[0] >= imgData.width || p[1] >= imgData.height)
            return no;
        const i = Math.floor(p[1]) * (imgData.width * 4) + (Math.floor(p[0]) * 4);
        const d = imgData.data;
        if (i >= d.length - 4)
            return no;
        return new Pt(d[i], d[i + 1], d[i + 2], d[i + 3]);
    }
    resize(sizeOrScale, asScale = false) {
        let s = asScale ? sizeOrScale : [sizeOrScale[0] / this._img.naturalWidth, sizeOrScale[1] / this._img.naturalHeight];
        this._drawToScale(s, this._img);
        this._data = this._ctx.getImageData(0, 0, this._cv.width, this._cv.height);
        return this;
    }
    crop(box) {
        let p = box.topLeft.scale(this._scale);
        let s = box.size.scale(this._scale);
        return this._ctx.getImageData(p.x, p.y, s.x, s.y);
    }
    filter(css) {
        this._ctx.filter = css;
        this._ctx.drawImage(this._cv, 0, 0);
        this._ctx.filter = "none";
        return this;
    }
    cleanup() {
        if (this._cv)
            this._cv.remove();
        if (this._img)
            this._img.remove();
        this._data = null;
    }
    static fromBlob(blob, editable = false, space) {
        let url = URL.createObjectURL(blob);
        return new Img(editable, space).load(url);
    }
    static imageDataToBlob(data) {
        return new Promise(function (resolve, reject) {
            if (!document) {
                reject("Cannot create html canvas element. document not found.");
            }
            let cv = document.createElement("canvas");
            cv.width = data.width;
            cv.height = data.height;
            cv.getContext("2d").putImageData(data, 0, 0);
            cv.toBlob(blob => {
                resolve(blob);
                cv.remove();
            });
        });
    }
    toBase64() {
        return this._cv.toDataURL();
    }
    toBlob() {
        return new Promise((resolve) => {
            this._cv.toBlob(blob => resolve(blob));
        });
    }
    getForm() {
        if (!this._editable) {
            console.error("Cannot get a CanvasForm because this Img is not editable");
        }
        return this._ctx ? new CanvasForm(this._ctx) : undefined;
    }
    get current() {
        return this._editable ? this._cv : this._img;
    }
    get image() {
        return this._img;
    }
    get canvas() {
        return this._cv;
    }
    get data() {
        return this._data;
    }
    get ctx() {
        return this._ctx;
    }
    get loaded() {
        return this._loaded;
    }
    get pixelScale() {
        return this._scale;
    }
    get imageSize() {
        return new Pt(this._img.width, this._img.height);
    }
    get canvasSize() {
        return new Pt(this._cv.width, this._cv.height);
    }
}
//# sourceMappingURL=Image.js.map