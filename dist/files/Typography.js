"use strict";
/*! Source code licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */
Object.defineProperty(exports, "__esModule", { value: true });
const Pt_1 = require("./Pt");
class Typography {
    static textWidthEstimator(fn, samples = ["M", "n", "."], distribution = [0.06, 0.8, 0.14]) {
        let m = samples.map(fn);
        let avg = new Pt_1.Pt(distribution).dot(m);
        return (str) => str.length * avg;
    }
    static truncate(fn, str, width, tail = "") {
        let trim = Math.floor(str.length * Math.min(1, width / fn(str)));
        if (trim < str.length) {
            trim = Math.max(0, trim - tail.length);
            return [str.substr(0, trim) + tail, trim];
        }
        else {
            return [str, str.length];
        }
    }
    static fontSizeToBox(box, ratio = 1, byHeight = true) {
        let i = byHeight ? 1 : 0;
        let h = (box[1][i] - box[0][i]);
        let f = ratio * h;
        return function (b) {
            let nh = (b[1][i] - b[0][i]) / h;
            return f * nh;
        };
    }
    static fontSizeToThreshold(threshold, direction = 0) {
        return function (defaultSize, val) {
            let d = defaultSize * val / threshold;
            if (direction < 0)
                return Math.min(d, defaultSize);
            if (direction > 0)
                return Math.max(d, defaultSize);
            return d;
        };
    }
}
exports.Typography = Typography;
//# sourceMappingURL=Typography.js.map