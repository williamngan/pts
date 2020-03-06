"use strict";
/*! Source code licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */
Object.defineProperty(exports, "__esModule", { value: true });
const Pt_1 = require("./Pt");
const Op_1 = require("./Op");
const Util_1 = require("./Util");
const Num_1 = require("./Num");
const LinearAlgebra_1 = require("./LinearAlgebra");
class Create {
    static distributeRandom(bound, count, dimensions = 2) {
        let pts = new Pt_1.Group();
        for (let i = 0; i < count; i++) {
            let p = [bound.x + Math.random() * bound.width];
            if (dimensions > 1)
                p.push(bound.y + Math.random() * bound.height);
            if (dimensions > 2)
                p.push(bound.z + Math.random() * bound.depth);
            pts.push(new Pt_1.Pt(p));
        }
        return pts;
    }
    static distributeLinear(line, count) {
        let ln = Op_1.Line.subpoints(line, count - 2);
        ln.unshift(line[0]);
        ln.push(line[line.length - 1]);
        return ln;
    }
    static gridPts(bound, columns, rows, orientation = [0.5, 0.5]) {
        if (columns === 0 || rows === 0)
            throw new Error("grid columns and rows cannot be 0");
        let unit = bound.size.$subtract(1).$divide(columns, rows);
        let offset = unit.$multiply(orientation);
        let g = new Pt_1.Group();
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < columns; c++) {
                g.push(bound.topLeft.$add(unit.$multiply(c, r)).add(offset));
            }
        }
        return g;
    }
    static gridCells(bound, columns, rows) {
        if (columns === 0 || rows === 0)
            throw new Error("grid columns and rows cannot be 0");
        let unit = bound.size.$subtract(1).divide(columns, rows);
        let g = [];
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < columns; c++) {
                g.push(new Pt_1.Group(bound.topLeft.$add(unit.$multiply(c, r)), bound.topLeft.$add(unit.$multiply(c, r).add(unit))));
            }
        }
        return g;
    }
    static radialPts(center, radius, count, angleOffset = -Util_1.Const.half_pi) {
        let g = new Pt_1.Group();
        let a = Util_1.Const.two_pi / count;
        for (let i = 0; i < count; i++) {
            g.push(new Pt_1.Pt(center).toAngle(a * i + angleOffset, radius, true));
        }
        return g;
    }
    static noisePts(pts, dx = 0.01, dy = 0.01, rows = 0, columns = 0) {
        let seed = Math.random();
        let g = new Pt_1.Group();
        for (let i = 0, len = pts.length; i < len; i++) {
            let np = new Noise(pts[i]);
            let r = (rows && rows > 0) ? Math.floor(i / rows) : i;
            let c = (columns && columns > 0) ? i % columns : i;
            np.initNoise(dx * c, dy * r);
            np.seed(seed);
            g.push(np);
        }
        return g;
    }
    static delaunay(pts) {
        return Delaunay.from(pts);
    }
}
exports.Create = Create;
const __noise_grad3 = [
    [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
    [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
    [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]
];
const __noise_permTable = [151, 160, 137, 91, 90, 15,
    131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23,
    190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33,
    88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166,
    77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244,
    102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196,
    135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123,
    5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42,
    223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9,
    129, 22, 39, 253, 9, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228,
    251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107,
    49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254,
    138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180
];
class Noise extends Pt_1.Pt {
    constructor(...args) {
        super(...args);
        this.perm = [];
        this._n = new Pt_1.Pt(0.01, 0.01);
        this.perm = __noise_permTable.concat(__noise_permTable);
    }
    initNoise(...args) {
        this._n = new Pt_1.Pt(...args);
        return this;
    }
    step(x = 0, y = 0) {
        this._n.add(x, y);
        return this;
    }
    seed(s) {
        if (s > 0 && s < 1)
            s *= 65536;
        s = Math.floor(s);
        if (s < 256)
            s |= s << 8;
        for (let i = 0; i < 255; i++) {
            let v = (i & 1) ? __noise_permTable[i] ^ (s & 255) : __noise_permTable[i] ^ ((s >> 8) & 255);
            this.perm[i] = this.perm[i + 256] = v;
        }
        return this;
    }
    noise2D() {
        let i = Math.max(0, Math.floor(this._n[0])) % 255;
        let j = Math.max(0, Math.floor(this._n[1])) % 255;
        let x = (this._n[0] % 255) - i;
        let y = (this._n[1] % 255) - j;
        let n00 = LinearAlgebra_1.Vec.dot(__noise_grad3[(i + this.perm[j]) % 12], [x, y, 0]);
        let n01 = LinearAlgebra_1.Vec.dot(__noise_grad3[(i + this.perm[j + 1]) % 12], [x, y - 1, 0]);
        let n10 = LinearAlgebra_1.Vec.dot(__noise_grad3[(i + 1 + this.perm[j]) % 12], [x - 1, y, 0]);
        let n11 = LinearAlgebra_1.Vec.dot(__noise_grad3[(i + 1 + this.perm[j + 1]) % 12], [x - 1, y - 1, 0]);
        let _fade = (f) => f * f * f * (f * (f * 6 - 15) + 10);
        let tx = _fade(x);
        return Num_1.Num.lerp(Num_1.Num.lerp(n00, n10, tx), Num_1.Num.lerp(n01, n11, tx), _fade(y));
    }
}
exports.Noise = Noise;
class Delaunay extends Pt_1.Group {
    constructor() {
        super(...arguments);
        this._mesh = [];
    }
    delaunay(triangleOnly = true) {
        if (this.length < 3)
            return [];
        this._mesh = [];
        let n = this.length;
        let indices = [];
        for (let i = 0; i < n; i++)
            indices[i] = i;
        indices.sort((i, j) => this[j][0] - this[i][0]);
        let pts = this.slice();
        let st = this._superTriangle();
        pts = pts.concat(st);
        let opened = [this._circum(n, n + 1, n + 2, st)];
        let closed = [];
        let tris = [];
        for (let i = 0, len = indices.length; i < len; i++) {
            let c = indices[i];
            let edges = [];
            let j = opened.length;
            if (!this._mesh[c])
                this._mesh[c] = {};
            while (j--) {
                let circum = opened[j];
                let radius = circum.circle[1][0];
                let d = pts[c].$subtract(circum.circle[0]);
                if (d[0] > 0 && d[0] * d[0] > radius * radius) {
                    closed.push(circum);
                    tris.push(circum.triangle);
                    opened.splice(j, 1);
                    continue;
                }
                if (d[0] * d[0] + d[1] * d[1] - radius * radius > Util_1.Const.epsilon) {
                    continue;
                }
                edges.push(circum.i, circum.j, circum.j, circum.k, circum.k, circum.i);
                opened.splice(j, 1);
            }
            Delaunay._dedupe(edges);
            j = edges.length;
            while (j > 1) {
                opened.push(this._circum(edges[--j], edges[--j], c, false, pts));
            }
        }
        for (let i = 0, len = opened.length; i < len; i++) {
            let o = opened[i];
            if (o.i < n && o.j < n && o.k < n) {
                closed.push(o);
                tris.push(o.triangle);
                this._cache(o);
            }
        }
        return (triangleOnly) ? tris : closed;
    }
    voronoi() {
        let vs = [];
        let n = this._mesh;
        for (let i = 0, len = n.length; i < len; i++) {
            vs.push(this.neighborPts(i, true));
        }
        return vs;
    }
    mesh() {
        return this._mesh;
    }
    neighborPts(i, sort = false) {
        let cs = new Pt_1.Group();
        let n = this._mesh;
        for (let k in n[i]) {
            if (n[i].hasOwnProperty(k))
                cs.push(n[i][k].circle[0]);
        }
        return (sort) ? Num_1.Geom.sortEdges(cs) : cs;
    }
    neighbors(i) {
        let cs = [];
        let n = this._mesh;
        for (let k in n[i]) {
            if (n[i].hasOwnProperty(k))
                cs.push(n[i][k]);
        }
        return cs;
    }
    _cache(o) {
        this._mesh[o.i][`${Math.min(o.j, o.k)}-${Math.max(o.j, o.k)}`] = o;
        this._mesh[o.j][`${Math.min(o.i, o.k)}-${Math.max(o.i, o.k)}`] = o;
        this._mesh[o.k][`${Math.min(o.i, o.j)}-${Math.max(o.i, o.j)}`] = o;
    }
    _superTriangle() {
        let minPt = this[0];
        let maxPt = this[0];
        for (let i = 1, len = this.length; i < len; i++) {
            minPt = minPt.$min(this[i]);
            maxPt = maxPt.$max(this[i]);
        }
        let d = maxPt.$subtract(minPt);
        let mid = minPt.$add(maxPt).divide(2);
        let dmax = Math.max(d[0], d[1]);
        return new Pt_1.Group(mid.$subtract(20 * dmax, dmax), mid.$add(0, 20 * dmax), mid.$add(20 * dmax, -dmax));
    }
    _triangle(i, j, k, pts = this) {
        return new Pt_1.Group(pts[i], pts[j], pts[k]);
    }
    _circum(i, j, k, tri, pts = this) {
        let t = tri || this._triangle(i, j, k, pts);
        return {
            i: i,
            j: j,
            k: k,
            triangle: t,
            circle: Op_1.Triangle.circumcircle(t)
        };
    }
    static _dedupe(edges) {
        let j = edges.length;
        while (j > 1) {
            let b = edges[--j];
            let a = edges[--j];
            let i = j;
            while (i > 1) {
                let n = edges[--i];
                let m = edges[--i];
                if ((a == m && b == n) || (a == n && b == m)) {
                    edges.splice(j, 2);
                    edges.splice(i, 2);
                    break;
                }
            }
        }
        return edges;
    }
}
exports.Delaunay = Delaunay;
//# sourceMappingURL=Create.js.map