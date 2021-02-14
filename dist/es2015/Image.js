import { Pt } from "./Pt";
export class Img {
    constructor(editable = false, pixelScale = 1) {
        this._scale = 1;
        this._loaded = false;
        this._editable = editable;
        this._scale = pixelScale;
        this._img = new Image();
    }
    load(src) {
        return new Promise((resolve, reject) => {
            this._img.src = src;
            this._img.onload = () => {
                if (this._editable) {
                    this._cv = document.createElement("canvas");
                    this._drawToScale(this._scale, this._scale, this._img);
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
    _drawToScale(imgScale, canvasScale, img) {
        this._cv.width = this._img.naturalWidth * imgScale;
        this._cv.height = this._img.naturalHeight * imgScale;
        this._ctx = this._cv.getContext('2d');
        this._ctx.save();
        this._ctx.scale(canvasScale, canvasScale);
        if (img)
            this._ctx.drawImage(img, 0, 0);
        this._ctx.restore();
    }
    bitmap(size) {
        const w = (size) ? size[0] : this._cv.width;
        const h = (size) ? size[1] : this._cv.height;
        return createImageBitmap(this._cv, 0, 0, w, h);
    }
    sync() {
        if (this._scale !== 1) {
            this.bitmap().then(b => {
                this._drawToScale(1, 1 / this._scale, b);
                this._img.src = this.toBase64();
                this._drawToScale(this._scale, this._scale, this._img);
            });
        }
        else {
            this._img.src = this.toBase64();
        }
    }
    pixel(p) {
        return Img.getPixel(this._data, [p[0] * this._scale, p[1] * this._scale]);
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
    crop(box) {
        let p = box.topLeft.scale(this._scale);
        let s = box.size.scale(this._scale);
        return this._ctx.getImageData(p.x, p.y, s.x, s.y);
    }
    static fromBlob(blob, editable = false) {
        let url = URL.createObjectURL(blob);
        return new Img(editable).load(url);
    }
    toBase64() {
        return this._cv.toDataURL();
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
}
//# sourceMappingURL=Image.js.map