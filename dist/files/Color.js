"use strict";
/*! Source code licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */
Object.defineProperty(exports, "__esModule", { value: true });
const Pt_1 = require("./Pt");
const Util_1 = require("./Util");
const Num_1 = require("./Num");
class Color extends Pt_1.Pt {
    constructor(...args) {
        super(...args);
        this._mode = "rgb";
        this._isNorm = false;
    }
    static from(...args) {
        let p = [1, 1, 1, 1];
        let c = Util_1.Util.getArgs(args);
        for (let i = 0, len = p.length; i < len; i++) {
            if (i < c.length)
                p[i] = c[i];
        }
        return new Color(p);
    }
    static fromHex(hex) {
        if (hex[0] == "#")
            hex = hex.substr(1);
        if (hex.length <= 3) {
            let fn = (i) => hex[i] || "F";
            hex = `${fn(0)}${fn(0)}${fn(1)}${fn(1)}${fn(2)}${fn(2)}`;
        }
        let alpha = 1;
        if (hex.length === 8) {
            alpha = hex.substr(6) && 0xFF / 255;
            hex = hex.substring(0, 6);
        }
        let hexVal = parseInt(hex, 16);
        return new Color(hexVal >> 16, hexVal >> 8 & 0xFF, hexVal & 0xFF, alpha);
    }
    static rgb(...args) { return Color.from(...args).toMode("rgb"); }
    static hsl(...args) { return Color.from(...args).toMode("hsl"); }
    static hsb(...args) { return Color.from(...args).toMode("hsb"); }
    static lab(...args) { return Color.from(...args).toMode("lab"); }
    static lch(...args) { return Color.from(...args).toMode("lch"); }
    static luv(...args) { return Color.from(...args).toMode("luv"); }
    static xyz(...args) { return Color.from(...args).toMode("xyz"); }
    static maxValues(mode) { return Color.ranges[mode].zipSlice(1).$take([0, 1, 2]); }
    get hex() { return this.toString("hex"); }
    get rgb() { return this.toString("rgb"); }
    get rgba() { return this.toString("rgba"); }
    clone() {
        let c = new Color(this);
        c.toMode(this._mode);
        return c;
    }
    toMode(mode, convert = false) {
        if (convert) {
            let fname = this._mode.toUpperCase() + "to" + mode.toUpperCase();
            if (Color[fname]) {
                this.to(Color[fname](this, this._isNorm, this._isNorm));
            }
            else {
                throw new Error("Cannot convert color with " + fname);
            }
        }
        this._mode = mode;
        return this;
    }
    get mode() { return this._mode; }
    get r() { return this[0]; }
    set r(n) { this[0] = n; }
    get g() { return this[1]; }
    set g(n) { this[1] = n; }
    get b() { return this[2]; }
    set b(n) { this[2] = n; }
    get h() { return (this._mode == "lch") ? this[2] : this[0]; }
    set h(n) {
        let i = (this._mode == "lch") ? 2 : 0;
        this[i] = n;
    }
    get s() { return this[1]; }
    set s(n) { this[1] = n; }
    get l() { return (this._mode == "hsl") ? this[2] : this[0]; }
    set l(n) {
        let i = (this._mode == "hsl") ? 2 : 0;
        this[i] = n;
    }
    get a() { return this[1]; }
    set a(n) { this[1] = n; }
    get c() { return this[1]; }
    set c(n) { this[1] = n; }
    get u() { return this[1]; }
    set u(n) { this[1] = n; }
    get v() { return this[2]; }
    set v(n) { this[2] = n; }
    set alpha(n) { if (this.length > 3)
        this[3] = n; }
    get alpha() { return (this.length > 3) ? this[3] : 1; }
    get normalized() { return this._isNorm; }
    set normalized(b) { this._isNorm = b; }
    normalize(toNorm = true) {
        if (this._isNorm == toNorm)
            return this;
        let ranges = Color.ranges[this._mode];
        for (let i = 0; i < 3; i++) {
            this[i] = (!toNorm)
                ? Num_1.Num.mapToRange(this[i], 0, 1, ranges[i][0], ranges[i][1])
                : Num_1.Num.mapToRange(this[i], ranges[i][0], ranges[i][1], 0, 1);
        }
        this._isNorm = toNorm;
        return this;
    }
    $normalize(toNorm = true) { return this.clone().normalize(toNorm); }
    toString(format = "mode") {
        if (format == "hex") {
            let _hex = (n) => {
                let s = Math.floor(n).toString(16);
                return (s.length < 2) ? '0' + s : s;
            };
            return `#${_hex(this[0])}${_hex(this[1])}${_hex(this[2])}`;
        }
        else if (format == "rgba") {
            return `rgba(${Math.floor(this[0])},${Math.floor(this[1])},${Math.floor(this[2])},${this.alpha}`;
        }
        else if (format == "rgb") {
            return `rgb(${Math.floor(this[0])},${Math.floor(this[1])},${Math.floor(this[2])}`;
        }
        else {
            return `${this._mode}(${this[0]},${this[1]},${this[2]},${this.alpha})`;
        }
    }
    static RGBtoHSL(rgb, normalizedInput = false, normalizedOutput = false) {
        let [r, g, b] = (!normalizedInput) ? rgb.$normalize() : rgb;
        let max = Math.max(r, g, b);
        let min = Math.min(r, g, b);
        let h = (max + min) / 2;
        let s = h;
        let l = h;
        if (max == min) {
            h = 0;
            s = 0;
        }
        else {
            let d = max - min;
            s = (l > 0.5) ? d / (2 - max - min) : d / (max + min);
            h = 0;
            if (max === r) {
                h = (g - b) / d + ((g < b) ? 6 : 0);
            }
            else if (max === g) {
                h = (b - r) / d + 2;
            }
            else if (max === b) {
                h = (r - g) / d + 4;
            }
        }
        return Color.hsl(((normalizedOutput) ? h / 60 : h * 60), s, l, rgb.alpha);
    }
    static HSLtoRGB(hsl, normalizedInput = false, normalizedOutput = false) {
        let [h, s, l] = hsl;
        if (!normalizedInput)
            h = h / 360;
        if (s == 0)
            return Color.rgb(l * 255, l * 255, l * 255, hsl.alpha);
        let q = (l <= 0.5) ? l * (1 + s) : l + s - (l * s);
        let p = 2 * l - q;
        let convert = (t) => {
            t = (t < 0) ? t + 1 : (t > 1) ? t - 1 : t;
            if (t * 6 < 1) {
                return p + (q - p) * t * 6;
            }
            else if (t * 2 < 1) {
                return q;
            }
            else if (t * 3 < 2) {
                return p + (q - p) * ((2 / 3) - t) * 6;
            }
            else {
                return p;
            }
        };
        let sc = (normalizedOutput) ? 1 : 255;
        return Color.rgb(sc * convert((h + 1 / 3)), sc * convert(h), sc * convert((h - 1 / 3)), hsl.alpha);
    }
    static RGBtoHSB(rgb, normalizedInput = false, normalizedOutput = false) {
        let [r, g, b] = (!normalizedInput) ? rgb.$normalize() : rgb;
        let max = Math.max(r, g, b);
        let min = Math.min(r, g, b);
        let d = max - min;
        let h = 0;
        let s = (max === 0) ? 0 : d / max;
        let v = max;
        if (max != min) {
            if (max === r) {
                h = (g - b) / d + ((g < b) ? 6 : 0);
            }
            else if (max === g) {
                h = (b - r) / d + 2;
            }
            else if (max === b) {
                h = (r - g) / d + 4;
            }
        }
        return Color.hsb(((normalizedOutput) ? h / 60 : h * 60), s, v, rgb.alpha);
    }
    static HSBtoRGB(hsb, normalizedInput = false, normalizedOutput = false) {
        let [h, s, v] = hsb;
        if (!normalizedInput)
            h = h / 360;
        let i = Math.floor(h * 6);
        let f = h * 6 - i;
        let p = v * (1 - s);
        let q = v * (1 - f * s);
        let t = v * (1 - (1 - f) * s);
        let pick = [
            [v, t, p], [q, v, p], [p, v, t],
            [p, q, v], [t, p, v], [v, p, q]
        ];
        let c = pick[i % 6];
        let sc = (normalizedOutput) ? 1 : 255;
        return Color.rgb(sc * c[0], sc * c[1], sc * c[2], hsb.alpha);
    }
    static RGBtoLAB(rgb, normalizedInput = false, normalizedOutput = false) {
        let c = (normalizedInput) ? rgb.$normalize(false) : rgb;
        return Color.XYZtoLAB(Color.RGBtoXYZ(c), false, normalizedOutput);
    }
    static LABtoRGB(lab, normalizedInput = false, normalizedOutput = false) {
        let c = (normalizedInput) ? lab.$normalize(false) : lab;
        return Color.XYZtoRGB(Color.LABtoXYZ(c), false, normalizedOutput);
    }
    static RGBtoLCH(rgb, normalizedInput = false, normalizedOutput = false) {
        let c = (normalizedInput) ? rgb.$normalize(false) : rgb;
        return Color.LABtoLCH(Color.RGBtoLAB(c), false, normalizedOutput);
    }
    static LCHtoRGB(lch, normalizedInput = false, normalizedOutput = false) {
        let c = (normalizedInput) ? lch.$normalize(false) : lch;
        return Color.LABtoRGB(Color.LCHtoLAB(c), false, normalizedOutput);
    }
    static RGBtoLUV(rgb, normalizedInput = false, normalizedOutput = false) {
        let c = (normalizedInput) ? rgb.$normalize(false) : rgb;
        return Color.XYZtoLUV(Color.RGBtoXYZ(c), false, normalizedOutput);
    }
    static LUVtoRGB(luv, normalizedInput = false, normalizedOutput = false) {
        let c = (normalizedInput) ? luv.$normalize(false) : luv;
        return Color.XYZtoRGB(Color.LUVtoXYZ(c), false, normalizedOutput);
    }
    static RGBtoXYZ(rgb, normalizedInput = false, normalizedOutput = false) {
        let c = (!normalizedInput) ? rgb.$normalize() : rgb.clone();
        for (let i = 0; i < 3; i++) {
            c[i] = (c[i] > 0.04045) ? Math.pow((c[i] + 0.055) / 1.055, 2.4) : c[i] / 12.92;
            if (!normalizedOutput)
                c[i] = c[i] * 100;
        }
        let cc = Color.xyz(c[0] * 0.4124564 + c[1] * 0.3575761 + c[2] * 0.1804375, c[0] * 0.2126729 + c[1] * 0.7151522 + c[2] * 0.0721750, c[0] * 0.0193339 + c[1] * 0.1191920 + c[2] * 0.9503041, rgb.alpha);
        return (normalizedOutput) ? cc.normalize() : cc;
    }
    static XYZtoRGB(xyz, normalizedInput = false, normalizedOutput = false) {
        let [x, y, z] = (!normalizedInput) ? xyz.$normalize() : xyz;
        let rgb = [
            x * 3.2404542 + y * -1.5371385 + z * -0.4985314,
            x * -0.9692660 + y * 1.8760108 + z * 0.0415560,
            x * 0.0556434 + y * -0.2040259 + z * 1.0572252
        ];
        for (let i = 0; i < 3; i++) {
            rgb[i] = (rgb[i] < 0) ? 0 : (rgb[i] > 0.0031308) ? (1.055 * Math.pow(rgb[i], 1 / 2.4) - 0.055) : (12.92 * rgb[i]);
            rgb[i] = Math.max(0, Math.min(1, rgb[i]));
            if (!normalizedOutput)
                rgb[i] = Math.round(rgb[i] * 255);
        }
        let cc = Color.rgb(rgb[0], rgb[1], rgb[2], xyz.alpha);
        return (normalizedOutput) ? cc.normalize() : cc;
    }
    static XYZtoLAB(xyz, normalizedInput = false, normalizedOutput = false) {
        let c = (normalizedInput) ? xyz.$normalize(false) : xyz.clone();
        c.divide(Color.D65);
        let fn = (n) => (n > 0.008856) ? Math.pow(n, 1 / 3) : (7.787 * n) + 16 / 116;
        let cy = fn(c[1]);
        let cc = Color.lab((116 * cy) - 16, 500 * (fn(c[0]) - cy), 200 * (cy - fn(c[2])), xyz.alpha);
        return (normalizedOutput) ? cc.normalize() : cc;
    }
    static LABtoXYZ(lab, normalizedInput = false, normalizedOutput = false) {
        let c = (normalizedInput) ? lab.$normalize(false) : lab;
        let y = (c[0] + 16) / 116;
        let x = (c[1] / 500) + y;
        let z = y - c[2] / 200;
        let fn = (n) => {
            let nnn = n * n * n;
            return (nnn > 0.008856) ? nnn : (n - 16 / 116) / 7.787;
        };
        let d = Color.D65;
        let cc = Color.xyz(Math.max(0, d[0] * fn(x)), Math.max(0, d[1] * fn(y)), Math.max(0, d[2] * fn(z)), lab.alpha);
        return (normalizedOutput) ? cc.normalize() : cc;
    }
    static XYZtoLUV(xyz, normalizedInput = false, normalizedOutput = false) {
        let [x, y, z] = (normalizedInput) ? xyz.$normalize(false) : xyz;
        let u = (4 * x) / (x + (15 * y) + (3 * z));
        let v = (9 * y) / (x + (15 * y) + (3 * z));
        y = y / 100;
        y = (y > 0.008856) ? Math.pow(y, 1 / 3) : (7.787 * y + 16 / 116);
        let refU = (4 * Color.D65[0]) / (Color.D65[0] + (15 * Color.D65[1]) + (3 * Color.D65[2]));
        let refV = (9 * Color.D65[1]) / (Color.D65[0] + (15 * Color.D65[1]) + (3 * Color.D65[2]));
        let L = (116 * y) - 16;
        return Color.luv(L, 13 * L * (u - refU), 13 * L * (v - refV), xyz.alpha);
    }
    static LUVtoXYZ(luv, normalizedInput = false, normalizedOutput = false) {
        let [l, u, v] = (normalizedInput) ? luv.$normalize(false) : luv;
        let y = (l + 16) / 116;
        let cubeY = y * y * y;
        y = (cubeY > 0.008856) ? cubeY : (y - 16 / 116) / 7.787;
        let refU = (4 * Color.D65[0]) / (Color.D65[0] + (15 * Color.D65[1]) + (3 * Color.D65[2]));
        let refV = (9 * Color.D65[1]) / (Color.D65[0] + (15 * Color.D65[1]) + (3 * Color.D65[2]));
        u = u / (13 * l) + refU;
        v = v / (13 * l) + refV;
        y = y * 100;
        let x = -1 * (9 * y * u) / ((u - 4) * v - u * v);
        let z = (9 * y - (15 * v * y) - (v * x)) / (3 * v);
        return Color.xyz(x, y, z, luv.alpha);
    }
    static LABtoLCH(lab, normalizedInput = false, normalizedOutput = false) {
        let c = (normalizedInput) ? lab.$normalize(false) : lab;
        let h = Num_1.Geom.toDegree(Num_1.Geom.boundRadian(Math.atan2(c[2], c[1])));
        return Color.lch(c[0], Math.sqrt(c[1] * c[1] + c[2] * c[2]), h, lab.alpha);
    }
    static LCHtoLAB(lch, normalizedInput = false, normalizedOutput = false) {
        let c = (normalizedInput) ? lch.$normalize(false) : lch;
        let rad = Num_1.Geom.toRadian(c[2]);
        return Color.lab(c[0], Math.cos(rad) * c[1], Math.sin(rad) * c[1], lch.alpha);
    }
}
Color.D65 = new Pt_1.Pt(95.047, 100, 108.883, 1);
Color.ranges = {
    rgb: new Pt_1.Group(new Pt_1.Pt(0, 255), new Pt_1.Pt(0, 255), new Pt_1.Pt(0, 255)),
    hsl: new Pt_1.Group(new Pt_1.Pt(0, 360), new Pt_1.Pt(0, 1), new Pt_1.Pt(0, 1)),
    hsb: new Pt_1.Group(new Pt_1.Pt(0, 360), new Pt_1.Pt(0, 1), new Pt_1.Pt(0, 1)),
    lab: new Pt_1.Group(new Pt_1.Pt(0, 100), new Pt_1.Pt(-128, 127), new Pt_1.Pt(-128, 127)),
    lch: new Pt_1.Group(new Pt_1.Pt(0, 100), new Pt_1.Pt(0, 100), new Pt_1.Pt(0, 360)),
    luv: new Pt_1.Group(new Pt_1.Pt(0, 100), new Pt_1.Pt(-134, 220), new Pt_1.Pt(-140, 122)),
    xyz: new Pt_1.Group(new Pt_1.Pt(0, 100), new Pt_1.Pt(0, 100), new Pt_1.Pt(0, 100))
};
exports.Color = Color;
//# sourceMappingURL=Color.js.map