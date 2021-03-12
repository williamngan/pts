import { Pt } from "./Pt";
export class Img {
    constructor(editable = false, pixelScale = 1, crossOrigin) {
        this._scale = 1;
        this._loaded = false;
        this._editable = editable;
        this._scale = pixelScale;
        this._img = new Image();
        if (crossOrigin)
            this._img.crossOrigin = "Anonymous";
    }
    static load(src, editable = false, pixelScale = 1, ready) {
        let img = new Img(editable, pixelScale);
        img.load(src).then(res => {
            if (ready)
                ready(res);
        });
        return img;
    }
    load(src) {
        return new Promise((resolve, reject) => {
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
        const cms = (typeof canvasScale === 'number') ? [canvasScale, canvasScale] : canvasScale;
        const nw = img.width;
        const nh = img.height;
        this._cv.width = nw * cms[0];
        this._cv.height = nh * cms[1];
        this._ctx = this._cv.getContext('2d');
        if (img)
            this._ctx.drawImage(img, 0, 0, nw, nh, 0, 0, this._cv.width, this._cv.height);
    }
    bitmap(size) {
        const w = (size) ? size[0] : this._cv.width;
        const h = (size) ? size[1] : this._cv.height;
        return createImageBitmap(this._cv, 0, 0, w, h);
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
    static fromBlob(blob, editable = false, pixelScale = 1) {
        let url = URL.createObjectURL(blob);
        return new Img(editable, pixelScale).load(url);
    }
    static imageDataToBlob(data) {
        return new Promise(function (resolve) {
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