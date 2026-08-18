/*! Copyright © 2017-present William Ngan and contributors.
Licensed under Apache 2.0 License.
See https://github.com/williamngan/pts for details. */
Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
//#region src/LinearAlgebra.ts
var Vec = class Vec {
	static add(a, b) {
		if (typeof b == "number") for (let i = 0, len = a.length; i < len; i++) a[i] += b;
		else for (let i = 0, len = a.length; i < len; i++) a[i] += b[i] || 0;
		return a;
	}
	static subtract(a, b) {
		if (typeof b == "number") for (let i = 0, len = a.length; i < len; i++) a[i] -= b;
		else for (let i = 0, len = a.length; i < len; i++) a[i] -= b[i] || 0;
		return a;
	}
	static multiply(a, b) {
		if (typeof b == "number") for (let i = 0, len = a.length; i < len; i++) a[i] *= b;
		else {
			if (a.length != b.length) throw new Error(`Cannot do element-wise multiply since the array lengths don't match: ${a.toString()} multiply-with ${b.toString()}`);
			for (let i = 0, len = a.length; i < len; i++) a[i] *= b[i];
		}
		return a;
	}
	static divide(a, b) {
		if (typeof b == "number") {
			if (b === 0) throw new Error("Cannot divide by zero");
			for (let i = 0, len = a.length; i < len; i++) a[i] /= b;
		} else {
			if (a.length != b.length) throw new Error(`Cannot do element-wise divide since the array lengths don't match. ${a.toString()} divide-by ${b.toString()}`);
			for (let i = 0, len = a.length; i < len; i++) a[i] /= b[i];
		}
		return a;
	}
	static dot(a, b) {
		if (a.length != b.length) throw new Error("Array lengths don't match");
		let d = 0;
		for (let i = 0, len = a.length; i < len; i++) d += a[i] * b[i];
		return d;
	}
	static cross2D(a, b) {
		return a[0] * b[1] - a[1] * b[0];
	}
	static cross(a, b) {
		return new Pt(a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]);
	}
	static magnitude(a) {
		return Math.sqrt(Vec.dot(a, a));
	}
	static unit(a, magnitude = void 0) {
		const m = magnitude === void 0 ? Vec.magnitude(a) : magnitude;
		if (m === 0) return Pt.make(a.length);
		return Vec.divide(a, m);
	}
	static abs(a) {
		return Vec.map(a, Math.abs);
	}
	static floor(a) {
		return Vec.map(a, Math.floor);
	}
	static ceil(a) {
		return Vec.map(a, Math.ceil);
	}
	static round(a) {
		return Vec.map(a, Math.round);
	}
	static max(a) {
		let m = Number.MIN_VALUE;
		let index = 0;
		for (let i = 0, len = a.length; i < len; i++) {
			m = Math.max(m, a[i]);
			if (m === a[i]) index = i;
		}
		return {
			value: m,
			index
		};
	}
	static min(a) {
		let m = Number.MAX_VALUE;
		let index = 0;
		for (let i = 0, len = a.length; i < len; i++) {
			m = Math.min(m, a[i]);
			if (m === a[i]) index = i;
		}
		return {
			value: m,
			index
		};
	}
	static sum(a) {
		let s = 0;
		for (let i = 0, len = a.length; i < len; i++) s += a[i];
		return s;
	}
	static map(a, fn) {
		for (let i = 0, len = a.length; i < len; i++) a[i] = fn(a[i], i, a);
		return a;
	}
};
var Mat = class Mat {
	constructor() {
		this.reset();
	}
	get value() {
		return this._33;
	}
	get domMatrix() {
		return new DOMMatrix(Mat.toDOMMatrix(this._33));
	}
	reset() {
		this._33 = Mat.scale2DMatrix(1, 1);
	}
	scale2D(val, at = [0, 0]) {
		const m = Mat.scaleAt2DMatrix(val[0] || 1, val[1] || 1, at);
		this._33 = Mat.multiply(this._33, m);
		return this;
	}
	rotate2D(ang, at = [0, 0]) {
		const m = Mat.rotateAt2DMatrix(Math.cos(ang), Math.sin(ang), at);
		this._33 = Mat.multiply(this._33, m);
		return this;
	}
	translate2D(val) {
		const m = Mat.translate2DMatrix(val[0] || 0, val[1] || 0);
		this._33 = Mat.multiply(this._33, m);
		return this;
	}
	shear2D(val, at = [0, 0]) {
		const m = Mat.shearAt2DMatrix(Math.tan(val[0] || 0), Math.tan(val[1] || 1), at);
		this._33 = Mat.multiply(this._33, m);
		return this;
	}
	static add(a, b) {
		if (typeof b != "number") {
			if (a[0].length != b[0].length) throw new Error("Cannot add matrix if rows' and columns' size don't match.");
			if (a.length != b.length) throw new Error("Cannot add matrix if rows' and columns' size don't match.");
		}
		const g = new Group();
		const isNum = typeof b == "number";
		for (let i = 0, len = a.length; i < len; i++) g.push(a[i].$add(isNum ? b : b[i]));
		return g;
	}
	static multiply(a, b, transposed = false, elementwise = false) {
		const g = new Group();
		if (typeof b != "number") {
			if (elementwise) {
				if (a.length != b.length) throw new Error("Cannot multiply matrix element-wise because the matrices' sizes don't match.");
				for (let ai = 0, alen = a.length; ai < alen; ai++) g.push(a[ai].$multiply(b[ai]));
			} else {
				if (!transposed && a[0].length != b.length) throw new Error("Cannot multiply matrix if rows in matrix-a don't match columns in matrix-b.");
				if (transposed && a[0].length != b[0].length) throw new Error("Cannot multiply matrix if transposed and the columns in both matrices don't match.");
				if (!transposed) b = Mat.transpose(b);
				for (let ai = 0, alen = a.length; ai < alen; ai++) {
					const p = Pt.make(b.length, 0);
					for (let bi = 0, blen = b.length; bi < blen; bi++) p[bi] = Vec.dot(a[ai], b[bi]);
					g.push(p);
				}
			}
		} else for (let ai = 0, alen = a.length; ai < alen; ai++) g.push(a[ai].$multiply(b));
		return g;
	}
	static zipSlice(g, index, defaultValue = false) {
		const z = [];
		for (let i = 0, len = g.length; i < len; i++) {
			if (g[i].length - 1 < index && defaultValue === false) throw `Index ${index} is out of bounds`;
			z.push(g[i][index] || defaultValue);
		}
		return new Pt(z);
	}
	static zip(g, defaultValue = false, useLongest = false) {
		const ps = new Group();
		const len = useLongest ? g.reduce((a, b) => Math.max(a, b.length), 0) : g[0].length;
		for (let i = 0; i < len; i++) ps.push(Mat.zipSlice(g, i, defaultValue));
		return ps;
	}
	static transpose(g, defaultValue = false, useLongest = false) {
		return Mat.zip(g, defaultValue, useLongest);
	}
	static toDOMMatrix(m) {
		return [
			m[0][0],
			m[0][1],
			m[1][0],
			m[1][1],
			m[2][0],
			m[2][1]
		];
	}
	static transform2D(pt, m) {
		const x = pt[0] * m[0][0] + pt[1] * m[1][0] + m[2][0];
		const y = pt[0] * m[0][1] + pt[1] * m[1][1] + m[2][1];
		return new Pt(x, y);
	}
	static scale2DMatrix(x, y) {
		return new Group(new Pt(x, 0, 0), new Pt(0, y, 0), new Pt(0, 0, 1));
	}
	static rotate2DMatrix(cosA, sinA) {
		return new Group(new Pt(cosA, sinA, 0), new Pt(-sinA, cosA, 0), new Pt(0, 0, 1));
	}
	static shear2DMatrix(tanX, tanY) {
		return new Group(new Pt(1, tanX, 0), new Pt(tanY, 1, 0), new Pt(0, 0, 1));
	}
	static translate2DMatrix(x, y) {
		return new Group(new Pt(1, 0, 0), new Pt(0, 1, 0), new Pt(x, y, 1));
	}
	static scaleAt2DMatrix(sx, sy, at) {
		const m = Mat.scale2DMatrix(sx, sy);
		m[2][0] = -at[0] * sx + at[0];
		m[2][1] = -at[1] * sy + at[1];
		return m;
	}
	static rotateAt2DMatrix(cosA, sinA, at) {
		const m = Mat.rotate2DMatrix(cosA, sinA);
		m[2][0] = at[0] * (1 - cosA) + at[1] * sinA;
		m[2][1] = at[1] * (1 - cosA) - at[0] * sinA;
		return m;
	}
	static shearAt2DMatrix(tanX, tanY, at) {
		const m = Mat.shear2DMatrix(tanX, tanY);
		m[2][0] = -at[1] * tanY;
		m[2][1] = -at[0] * tanX;
		return m;
	}
	static reflectAt2DMatrix(p1, p2) {
		const intercept = Line.intercept(p1, p2);
		if (intercept == void 0) return [
			new Pt([
				-1,
				0,
				0
			]),
			new Pt([
				0,
				1,
				0
			]),
			new Pt([
				p1[0] + p2[0],
				0,
				1
			])
		];
		else {
			const yi = intercept.yi;
			const ang2 = Math.atan(intercept.slope) * 2;
			const cosA = Math.cos(ang2);
			const sinA = Math.sin(ang2);
			return [
				new Pt([
					cosA,
					sinA,
					0
				]),
				new Pt([
					sinA,
					-cosA,
					0
				]),
				new Pt([
					-yi * sinA,
					yi + yi * cosA,
					1
				])
			];
		}
	}
};

//#endregion
//#region src/Op.ts
let _errorLength = (obj, param = "expected") => Util.warn("Group's length is less than " + param, obj);
let _errorOutofBound = (obj, param = "") => Util.warn(`Index ${param} is out of bound in Group`, obj);
var Line = class Line {
	static fromAngle(anchor, angle, magnitude) {
		let g = new Group(new Pt(anchor), new Pt(anchor));
		g[1].toAngle(angle, magnitude, true);
		return g;
	}
	static slope(p1, p2) {
		return p2[0] - p1[0] === 0 ? void 0 : (p2[1] - p1[1]) / (p2[0] - p1[0]);
	}
	static intercept(p1, p2) {
		if (p2[0] - p1[0] === 0) return;
		else {
			let m = (p2[1] - p1[1]) / (p2[0] - p1[0]);
			let c = p1[1] - m * p1[0];
			return {
				slope: m,
				yi: c,
				xi: m === 0 ? void 0 : -c / m
			};
		}
	}
	static sideOfPt2D(line, pt) {
		let _line = Util.iterToArray(line);
		return (_line[1][0] - _line[0][0]) * (pt[1] - _line[0][1]) - (pt[0] - _line[0][0]) * (_line[1][1] - _line[0][1]);
	}
	static collinear(p1, p2, p3, threshold = .01) {
		let a = new Pt(0, 0, 0).to(p1).$subtract(p2);
		let b = new Pt(0, 0, 0).to(p1).$subtract(p3);
		return a.$cross(b).divide(1e3).equals(new Pt(0, 0, 0), threshold);
	}
	static magnitude(line) {
		let _line = Util.iterToArray(line);
		return _line.length >= 2 ? _line[1].$subtract(_line[0]).magnitude() : 0;
	}
	static magnitudeSq(line) {
		let _line = Util.iterToArray(line);
		return _line.length >= 2 ? _line[1].$subtract(_line[0]).magnitudeSq() : 0;
	}
	static perpendicularFromPt(line, pt, asProjection = false) {
		let _line = Util.iterToArray(line);
		if (_line[0].equals(_line[1])) return void 0;
		let a = _line[0].$subtract(_line[1]);
		let b = _line[1].$subtract(pt);
		let proj = b.$subtract(a.$project(b));
		return asProjection ? proj : proj.$add(pt);
	}
	static distanceFromPt(line, pt) {
		let _line = Util.iterToArray(line);
		let projectionVector = Line.perpendicularFromPt(_line, pt, true);
		if (projectionVector) return projectionVector.magnitude();
		else return _line[0].$subtract(pt).magnitude();
	}
	static intersectRay2D(la, lb) {
		let _la = Util.iterToArray(la);
		let _lb = Util.iterToArray(lb);
		let a = Line.intercept(_la[0], _la[1]);
		let b = Line.intercept(_lb[0], _lb[1]);
		let pa = _la[0];
		let pb = _lb[0];
		if (a == void 0) {
			if (b == void 0) return void 0;
			let y1 = -b.slope * (pb[0] - pa[0]) + pb[1];
			return new Pt(pa[0], y1);
		} else if (b == void 0) {
			let y1 = -a.slope * (pa[0] - pb[0]) + pa[1];
			return new Pt(pb[0], y1);
		} else if (b.slope != a.slope) {
			let px = (a.slope * pa[0] - b.slope * pb[0] + pb[1] - pa[1]) / (a.slope - b.slope);
			let py = a.slope * (px - pa[0]) + pa[1];
			return new Pt(px, py);
		} else if (a.yi == b.yi) return new Pt(pa[0], pa[1]);
		else return;
	}
	static intersectLine2D(la, lb) {
		let _la = Util.iterToArray(la);
		let _lb = Util.iterToArray(lb);
		let pt = Line.intersectRay2D(_la, _lb);
		return pt && Geom.withinBound(pt, _la[0], _la[1]) && Geom.withinBound(pt, _lb[0], _lb[1]) ? pt : void 0;
	}
	static intersectLineWithRay2D(line, ray) {
		let _line = Util.iterToArray(line);
		let _ray = Util.iterToArray(ray);
		let pt = Line.intersectRay2D(_line, _ray);
		return pt && Geom.withinBound(pt, _line[0], _line[1]) ? pt : void 0;
	}
	static intersectPolygon2D(lineOrRay, poly, sourceIsRay = false) {
		let _lineOrRay = Util.iterToArray(lineOrRay);
		let _poly = Util.iterToArray(poly);
		let fn = sourceIsRay ? Line.intersectLineWithRay2D : Line.intersectLine2D;
		let pts = new Group();
		for (let i = 0, len = _poly.length; i < len; i++) {
			let next = i === len - 1 ? 0 : i + 1;
			let d = fn([_poly[i], _poly[next]], _lineOrRay);
			if (d) pts.push(d);
		}
		return pts.length > 0 ? pts : void 0;
	}
	static intersectLines2D(lines1, lines2, isRay = false) {
		let group = new Group();
		let fn = isRay ? Line.intersectLineWithRay2D : Line.intersectLine2D;
		for (let l1 of lines1) for (let l2 of lines2) {
			let _ip = fn(l1, l2);
			if (_ip) group.push(_ip);
		}
		return group;
	}
	static intersectGridWithRay2D(ray, gridPt) {
		let _ray = Util.iterToArray(ray);
		let t = Line.intercept(new Pt(_ray[0]).subtract(gridPt), new Pt(_ray[1]).subtract(gridPt));
		let g = new Group();
		if (t && t.xi) g.push(new Pt(gridPt[0] + t.xi, gridPt[1]));
		if (t && t.yi) g.push(new Pt(gridPt[0], gridPt[1] + t.yi));
		return g;
	}
	static intersectGridWithLine2D(line, gridPt) {
		let _line = Util.iterToArray(line);
		let g = Line.intersectGridWithRay2D(_line, gridPt);
		let gg = new Group();
		for (let i = 0, len = g.length; i < len; i++) if (Geom.withinBound(g[i], _line[0], _line[1])) gg.push(g[i]);
		return gg;
	}
	static intersectRect2D(line, rect) {
		let _line = Util.iterToArray(line);
		let _rect = Util.iterToArray(rect);
		let box = Geom.boundingBox(Group.fromPtArray(_line));
		if (!Rectangle.hasIntersectRect2D(box, _rect)) return new Group();
		return Line.intersectLines2D([_line], Rectangle.sides(_rect));
	}
	static subpoints(line, num) {
		let _line = Util.iterToArray(line);
		let pts = new Group();
		for (let i = 1; i <= num; i++) pts.push(Geom.interpolate(_line[0], _line[1], i / (num + 1)));
		return pts;
	}
	static crop(line, size, index = 0, cropAsCircle = true) {
		let _line = Util.iterToArray(line);
		let ls = _line[index === 0 ? 1 : 0].$subtract(_line[index]);
		if (ls[0] === 0 || size[0] === 0) return _line[index];
		if (cropAsCircle) {
			let d = ls.unit().multiply(size[1]);
			return _line[index].$add(d);
		} else {
			let rect = Rectangle.fromCenter(_line[index], size);
			let sides = Rectangle.sides(rect);
			let sideIdx = 0;
			if (Math.abs(ls[1] / ls[0]) > Math.abs(size[1] / size[0])) sideIdx = ls[1] < 0 ? 0 : 2;
			else sideIdx = ls[0] < 0 ? 3 : 1;
			return Line.intersectRay2D(sides[sideIdx], _line);
		}
	}
	static marker(line, size, graphic = "arrow", atTail = true) {
		let _line = Util.iterToArray(line);
		let h = atTail ? 0 : 1;
		let t = atTail ? 1 : 0;
		let unit = _line[h].$subtract(_line[t]);
		if (unit.magnitudeSq() === 0) return new Group();
		unit.unit();
		let ps = Geom.perpendicular(unit).multiply(size[0]).add(_line[t]);
		if (graphic == "arrow") {
			ps.add(unit.$multiply(size[1]));
			return new Group(_line[t], ps[0], ps[1]);
		} else return new Group(ps[0], ps[1]);
	}
	static toRect(line) {
		let _line = Util.iterToArray(line);
		return new Group(_line[0].$min(_line[1]), _line[0].$max(_line[1]));
	}
};
var Rectangle = class Rectangle {
	static from(topLeft, widthOrSize, height) {
		return Rectangle.fromTopLeft(topLeft, widthOrSize, height);
	}
	static fromTopLeft(topLeft, widthOrSize, height) {
		let size = typeof widthOrSize == "number" ? [widthOrSize, height || widthOrSize] : widthOrSize;
		return new Group(new Pt(topLeft), new Pt(topLeft).add(size));
	}
	static fromCenter(center, widthOrSize, height) {
		let half = typeof widthOrSize == "number" ? [widthOrSize / 2, (height || widthOrSize) / 2] : new Pt(widthOrSize).divide(2);
		return new Group(new Pt(center).subtract(half), new Pt(center).add(half));
	}
	static toCircle(pts, enclose = true) {
		return Circle.fromRect(pts, enclose);
	}
	static toSquare(pts, enclose = false) {
		let _pts = Util.iterToArray(pts);
		let s = Rectangle.size(_pts);
		let m = enclose ? s.maxValue().value : s.minValue().value;
		return Rectangle.fromCenter(Rectangle.center(_pts), m, m);
	}
	static size(pts) {
		let p = Util.iterToArray(pts);
		return p[0].$max(p[1]).subtract(p[0].$min(p[1]));
	}
	static center(pts) {
		let p = Util.iterToArray(pts);
		let min = p[0].$min(p[1]);
		let max = p[0].$max(p[1]);
		return min.add(max.$subtract(min).divide(2));
	}
	static corners(rect) {
		let _rect = Util.iterToArray(rect);
		let p0 = _rect[0].$min(_rect[1]);
		let p2 = _rect[0].$max(_rect[1]);
		return new Group(p0, new Pt(p2.x, p0.y), p2, new Pt(p0.x, p2.y));
	}
	static sides(rect) {
		let [p0, p1, p2, p3] = Rectangle.corners(rect);
		return [
			new Group(p0, p1),
			new Group(p1, p2),
			new Group(p2, p3),
			new Group(p3, p0)
		];
	}
	static boundingBox(rects) {
		let _rects = Util.iterToArray(rects);
		let merged = Util.flatten(_rects, false);
		if (merged.length === 0) return new Group();
		let min = Pt.make(2, Infinity);
		let max = Pt.make(2, -Infinity);
		for (let i = 0, len = merged.length; i < len; i++) {
			let p = merged[i];
			let dim = Math.min(2, p.length);
			for (let k = 0; k < dim; k++) {
				min[k] = Math.min(min[k], p[k]);
				max[k] = Math.max(max[k], p[k]);
			}
		}
		return new Group(min, max);
	}
	static polygon(rect) {
		return Rectangle.corners(rect);
	}
	static quadrants(rect, center) {
		let _rect = Util.iterToArray(rect);
		let corners = Rectangle.corners(_rect);
		let _center = center != void 0 ? new Pt(center) : Rectangle.center(_rect);
		return corners.map((c) => new Group(c, _center).boundingBox());
	}
	static halves(rect, ratio = .5, asRows = false) {
		let _rect = Util.iterToArray(rect);
		let min = _rect[0].$min(_rect[1]);
		let max = _rect[0].$max(_rect[1]);
		let mid = asRows ? Num.lerp(min[1], max[1], ratio) : Num.lerp(min[0], max[0], ratio);
		return asRows ? [new Group(min, new Pt(max[0], mid)), new Group(new Pt(min[0], mid), max)] : [new Group(min, new Pt(mid, max[1])), new Group(new Pt(mid, min[1]), max)];
	}
	static withinBound(rect, pt) {
		let _rect = Util.iterToArray(rect);
		return Geom.withinBound(pt, _rect[0], _rect[1]);
	}
	static hasIntersectRect2D(rect1, rect2, resetBoundingBox = false) {
		let _rect1 = Util.iterToArray(rect1);
		let _rect2 = Util.iterToArray(rect2);
		if (resetBoundingBox) {
			_rect1 = Geom.boundingBox(_rect1);
			_rect2 = Geom.boundingBox(_rect2);
		}
		if (_rect1[0][0] > _rect2[1][0] || _rect2[0][0] > _rect1[1][0]) return false;
		if (_rect1[0][1] > _rect2[1][1] || _rect2[0][1] > _rect1[1][1]) return false;
		return true;
	}
	static intersectRect2D(rect1, rect2) {
		let _rect1 = Util.iterToArray(rect1);
		let _rect2 = Util.iterToArray(rect2);
		if (!Rectangle.hasIntersectRect2D(_rect1, _rect2)) return new Group();
		return Line.intersectLines2D(Rectangle.sides(_rect1), Rectangle.sides(_rect2));
	}
};
var Circle = class Circle {
	static fromRect(pts, enclose = false) {
		let _pts = Util.iterToArray(pts);
		let r = 0;
		let min = r = Rectangle.size(_pts).minValue().value / 2;
		if (enclose) {
			let max = Rectangle.size(_pts).maxValue().value / 2;
			r = Math.sqrt(min * min + max * max);
		} else r = min;
		return new Group(Rectangle.center(_pts), new Pt(r, r));
	}
	static fromTriangle(pts, enclose = false) {
		if (enclose) return Triangle.circumcircle(pts);
		else return Triangle.incircle(pts);
	}
	static fromCenter(pt, radius) {
		return new Group(new Pt(pt), new Pt(radius, radius));
	}
	static withinBound(pts, pt, threshold = 0) {
		let _pts = Util.iterToArray(pts);
		let d = _pts[0].$subtract(pt);
		return d.dot(d) + threshold < _pts[1].x * _pts[1].x;
	}
	static intersectRay2D(circle, ray) {
		let _pts = Util.iterToArray(circle);
		let _ray = Util.iterToArray(ray);
		let d = _ray[0].$subtract(_ray[1]);
		let f = _pts[0].$subtract(_ray[0]);
		let a = d.dot(d);
		let b = f.dot(d);
		let c = f.dot(f) - _pts[1].x * _pts[1].x;
		let p = b / a;
		let q = c / a;
		let disc = p * p - q;
		if (disc < 0) return new Group();
		else {
			let discSqrt = Math.sqrt(disc);
			let t1 = -p + discSqrt;
			let p1 = _ray[0].$subtract(d.$multiply(t1));
			if (disc === 0) return new Group(p1);
			let t2 = -p - discSqrt;
			let p2 = _ray[0].$subtract(d.$multiply(t2));
			return new Group(p1, p2);
		}
	}
	static intersectLine2D(circle, line) {
		let _pts = Util.iterToArray(circle);
		let _line = Util.iterToArray(line);
		let ps = Circle.intersectRay2D(_pts, _line);
		let g = new Group();
		if (ps.length > 0) {
			for (let i = 0, len = ps.length; i < len; i++) if (Rectangle.withinBound(_line, ps[i])) g.push(ps[i]);
		}
		return g;
	}
	static intersectCircle2D(circle1, circle2) {
		let _pts = Util.iterToArray(circle1);
		let _circle = Util.iterToArray(circle2);
		let dv = _circle[0].$subtract(_pts[0]);
		let dr2 = dv.magnitudeSq();
		let dr = Math.sqrt(dr2);
		let ar = _pts[1].x;
		let br = _circle[1].x;
		let ar2 = ar * ar;
		let br2 = br * br;
		if (dr > ar + br) return new Group();
		else if (dr < Math.abs(ar - br)) return new Group(_pts[0].clone());
		else {
			let a = (ar2 - br2 + dr2) / (2 * dr);
			let h = Math.sqrt(ar2 - a * a);
			let p = dv.$multiply(a / dr).add(_pts[0]);
			return new Group(new Pt(p.x + h * dv.y / dr, p.y - h * dv.x / dr), new Pt(p.x - h * dv.y / dr, p.y + h * dv.x / dr));
		}
	}
	static intersectRect2D(circle, rect) {
		let _pts = Util.iterToArray(circle);
		let _rect = Util.iterToArray(rect);
		let sides = Rectangle.sides(_rect);
		let g = [];
		for (let i = 0, len = sides.length; i < len; i++) {
			let ps = Circle.intersectLine2D(_pts, sides[i]);
			if (ps.length > 0) g.push(ps);
		}
		return Util.flatten(g);
	}
	static toRect(circle, within = false) {
		let _pts = Util.iterToArray(circle);
		let r = _pts[1][0];
		if (within) {
			let half = Math.sqrt(r * r) / 2;
			return new Group(_pts[0].$subtract(half), _pts[0].$add(half));
		} else return new Group(_pts[0].$subtract(r), _pts[0].$add(r));
	}
	static toTriangle(circle, within = true) {
		let _pts = Util.iterToArray(circle);
		if (within) {
			let ang = -Math.PI / 2;
			let inc = Math.PI * 2 / 3;
			let g = new Group();
			for (let i = 0; i < 3; i++) {
				g.push(_pts[0].clone().toAngle(ang, _pts[1][0], true));
				ang += inc;
			}
			return g;
		} else return Triangle.fromCenter(_pts[0], _pts[1][0]);
	}
};
var Triangle = class Triangle {
	static fromRect(rect) {
		let _rect = Util.iterToArray(rect);
		let top = _rect[0].$add(_rect[1]).divide(2);
		top.y = _rect[0][1];
		let left = _rect[1].clone();
		left.x = _rect[0][0];
		return new Group(top, _rect[1].clone(), left);
	}
	static fromCircle(circle) {
		return Circle.toTriangle(circle, true);
	}
	static fromCenter(pt, size) {
		return Triangle.fromCircle(Circle.fromCenter(pt, size));
	}
	static medial(tri) {
		let _pts = Util.iterToArray(tri);
		if (_pts.length < 3) return _errorLength(new Group(), 3);
		return Polygon.midpoints(_pts, true);
	}
	static oppositeSide(tri, index) {
		let _pts = Util.iterToArray(tri);
		if (_pts.length < 3) return _errorLength(new Group(), 3);
		if (index === 0) return Group.fromPtArray([_pts[1], _pts[2]]);
		else if (index === 1) return Group.fromPtArray([_pts[0], _pts[2]]);
		else return Group.fromPtArray([_pts[0], _pts[1]]);
	}
	static altitude(tri, index) {
		let _pts = Util.iterToArray(tri);
		let opp = Triangle.oppositeSide(_pts, index);
		if (opp.length > 1) return new Group(_pts[index], Line.perpendicularFromPt(opp, _pts[index]));
		else return new Group();
	}
	static orthocenter(tri) {
		let _pts = Util.iterToArray(tri);
		if (_pts.length < 3) return _errorLength(void 0, 3);
		let a = Triangle.altitude(_pts, 0);
		let b = Triangle.altitude(_pts, 1);
		return Line.intersectRay2D(a, b);
	}
	static incenter(tri) {
		let _pts = Util.iterToArray(tri);
		if (_pts.length < 3) return _errorLength(void 0, 3);
		let a = Polygon.bisector(_pts, 0).add(_pts[0]);
		let b = Polygon.bisector(_pts, 1).add(_pts[1]);
		return Line.intersectRay2D(new Group(_pts[0], a), new Group(_pts[1], b));
	}
	static incircle(tri, center) {
		let _pts = Util.iterToArray(tri);
		let c = center ? center : Triangle.incenter(_pts);
		let area = Polygon.area(_pts);
		let perim = Polygon.perimeter(_pts, true);
		let r = 2 * area / perim.total;
		return Circle.fromCenter(c, r);
	}
	static circumcenter(tri) {
		let _pts = Util.iterToArray(tri);
		let md = Triangle.medial(_pts);
		let a = [md[0], Geom.perpendicular(_pts[0].$subtract(md[0])).p1.$add(md[0])];
		let b = [md[1], Geom.perpendicular(_pts[1].$subtract(md[1])).p1.$add(md[1])];
		return Line.intersectRay2D(a, b);
	}
	static circumcircle(tri, center) {
		let _pts = Util.iterToArray(tri);
		let c = center ? center : Triangle.circumcenter(_pts);
		let r = _pts[0].$subtract(c).magnitude();
		return Circle.fromCenter(c, r);
	}
};
var Polygon = class Polygon {
	static centroid(pts) {
		return Geom.centroid(pts);
	}
	static rectangle(center, widthOrSize, height) {
		return Rectangle.corners(Rectangle.fromCenter(center, widthOrSize, height));
	}
	static fromCenter(center, radius, sides) {
		let g = new Group();
		for (let i = 0; i < sides; i++) {
			let ang = Math.PI * 2 * i / sides;
			g.push(new Pt(Math.cos(ang) * radius, Math.sin(ang) * radius).add(center));
		}
		return g;
	}
	static lineAt(pts, index) {
		let _pts = Util.iterToArray(pts);
		if (index < 0 || index >= _pts.length) throw new Error("index out of the Polygon's range");
		return new Group(_pts[index], index === _pts.length - 1 ? _pts[0] : _pts[index + 1]);
	}
	static lines(poly, closePath = true) {
		let _pts = Util.iterToArray(poly);
		if (_pts.length < 2) return _errorLength(new Group(), 2);
		let sp = Util.split(_pts, 2, 1);
		if (closePath) sp.push(new Group(_pts[_pts.length - 1], _pts[0]));
		return sp.map((g) => g);
	}
	static midpoints(poly, closePath = false, t = .5) {
		return Polygon.lines(poly, closePath).map((s) => Geom.interpolate(s[0], s[1], t));
	}
	static adjacentSides(poly, index, closePath = false) {
		let _pts = Util.iterToArray(poly);
		if (_pts.length < 2) return _errorLength(new Group(), 2);
		if (index < 0 || index >= _pts.length) return _errorOutofBound(new Group(), index);
		let gs = [];
		let left = index - 1;
		if (closePath && left < 0) left = _pts.length - 1;
		if (left >= 0) gs.push(new Group(_pts[index], _pts[left]));
		let right = index + 1;
		if (closePath && right > _pts.length - 1) right = 0;
		if (right <= _pts.length - 1) gs.push(new Group(_pts[index], _pts[right]));
		return gs;
	}
	static bisector(poly, index) {
		let sides = Polygon.adjacentSides(poly, index, true);
		if (sides.length >= 2) {
			let a = sides[0][1].$subtract(sides[0][0]).unit();
			let b = sides[1][1].$subtract(sides[1][0]).unit();
			return a.add(b).divide(2);
		} else return;
	}
	static perimeter(poly, closePath = false) {
		let lines = Polygon.lines(poly, closePath);
		let mag = 0;
		let p = Pt.make(lines.length, 0);
		for (let i = 0, len = lines.length; i < len; i++) {
			let m = Line.magnitude(lines[i]);
			mag += m;
			p[i] = m;
		}
		return {
			total: mag,
			segments: p
		};
	}
	static area(pts) {
		let _pts = Util.iterToArray(pts);
		if (_pts.length < 3) return _errorLength(new Group(), 3);
		let det = (a, b) => a[0] * b[1] - a[1] * b[0];
		let area = 0;
		for (let i = 0, len = _pts.length; i < len; i++) if (i < _pts.length - 1) area += det(_pts[i], _pts[i + 1]);
		else area += det(_pts[i], _pts[0]);
		return Math.abs(area / 2);
	}
	static convexHull(pts, sorted = false) {
		let _pts = Util.iterToArray(pts);
		if (_pts.length < 3) return _errorLength(new Group(), 3);
		if (!sorted) {
			_pts = _pts.slice();
			_pts.sort((a, b) => a[0] - b[0]);
		}
		let left = (a, b, c) => {
			return (b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1]) > 0;
		};
		let dq = [];
		let bot = _pts.length - 2;
		let top = bot + 3;
		dq[bot] = _pts[2];
		dq[top] = _pts[2];
		if (left(_pts[0], _pts[1], _pts[2])) {
			dq[bot + 1] = _pts[0];
			dq[bot + 2] = _pts[1];
		} else {
			dq[bot + 1] = _pts[1];
			dq[bot + 2] = _pts[0];
		}
		for (let i = 3, len = _pts.length; i < len; i++) {
			let pt = _pts[i];
			if (left(dq[bot], dq[bot + 1], pt) && left(dq[top - 1], dq[top], pt)) continue;
			while (!left(dq[bot], dq[bot + 1], pt)) bot += 1;
			bot -= 1;
			dq[bot] = pt;
			while (!left(dq[top - 1], dq[top], pt)) top -= 1;
			top += 1;
			dq[top] = pt;
		}
		let hull = new Group();
		for (let h = 0; h < top - bot; h++) hull.push(dq[bot + h]);
		return hull;
	}
	static network(poly, originIndex = 0) {
		let _pts = Util.iterToArray(poly);
		let g = [];
		for (let i = 0, len = _pts.length; i < len; i++) if (i != originIndex) g.push(new Group(_pts[originIndex], _pts[i]));
		return g;
	}
	static nearestPt(poly, pt) {
		const _poly = Util.iterToArray(poly);
		const px = pt[0];
		const py = pt[1];
		let _near = Number.MAX_VALUE;
		let _item = -1;
		for (let i = 0, len = _poly.length; i < len; i++) {
			const dx = _poly[i][0] - px;
			const dy = _poly[i][1] - py;
			const d = dx * dx + dy * dy;
			if (d < _near) {
				_near = d;
				_item = i;
			}
		}
		return _item;
	}
	static projectAxis(poly, unitAxis) {
		let _poly = Util.iterToArray(poly);
		let min = unitAxis.dot(_poly[0]);
		let max = min;
		for (let n = 1, len = _poly.length; n < len; n++) {
			const dot = unitAxis.dot(_poly[n]);
			if (dot < min) min = dot;
			else if (dot > max) max = dot;
		}
		return new Pt(min, max);
	}
	static _axisOverlap2D(poly1, poly2, ax, ay) {
		let min1 = ax * poly1[0][0] + ay * poly1[0][1];
		let max1 = min1;
		for (let n = 1, len = poly1.length; n < len; n++) {
			const d = ax * poly1[n][0] + ay * poly1[n][1];
			if (d < min1) min1 = d;
			else if (d > max1) max1 = d;
		}
		let min2 = ax * poly2[0][0] + ay * poly2[0][1];
		let max2 = min2;
		for (let n = 1, len = poly2.length; n < len; n++) {
			const d = ax * poly2[n][0] + ay * poly2[n][1];
			if (d < min2) min2 = d;
			else if (d > max2) max2 = d;
		}
		return min1 < min2 ? min2 - max1 : min1 - max2;
	}
	static _axisOverlap(poly1, poly2, unitAxis) {
		let pa = Polygon.projectAxis(poly1, unitAxis);
		let pb = Polygon.projectAxis(poly2, unitAxis);
		return pa[0] < pb[0] ? pb[0] - pa[1] : pa[0] - pb[1];
	}
	static hasIntersectPoint(poly, pt) {
		let _poly = Util.iterToArray(poly);
		let c = false;
		for (let i = 0, len = _poly.length; i < len; i++) {
			let ln = Polygon.lineAt(_poly, i);
			if (ln[0][1] > pt[1] != ln[1][1] > pt[1] && pt[0] < (ln[1][0] - ln[0][0]) * (pt[1] - ln[0][1]) / (ln[1][1] - ln[0][1]) + ln[0][0]) c = !c;
		}
		return c;
	}
	static hasIntersectCircle(poly, circle) {
		let _poly = Util.iterToArray(poly);
		let _circle = Util.iterToArray(circle);
		const c = _circle[0];
		const r = _circle[1][0];
		let bx0 = Infinity;
		let by0 = Infinity;
		let bx1 = -Infinity;
		let by1 = -Infinity;
		for (let i = 0, len = _poly.length; i < len; i++) {
			const p = _poly[i];
			if (p[0] < bx0) bx0 = p[0];
			if (p[0] > bx1) bx1 = p[0];
			if (p[1] < by0) by0 = p[1];
			if (p[1] > by1) by1 = p[1];
		}
		if (c[0] + r < bx0 || c[0] - r > bx1 || c[1] + r < by0 || c[1] - r > by1) return null;
		let minDist = Number.MAX_SAFE_INTEGER;
		let minEdge = null;
		let minAx = 0;
		let minAy = 0;
		let which = -1;
		for (let i = 0, len = _poly.length; i < len; i++) {
			const ea = _poly[i];
			const eb = _poly[i === len - 1 ? 0 : i + 1];
			let ax = ea[1] - eb[1];
			let ay = eb[0] - ea[0];
			const alen = Math.sqrt(ax * ax + ay * ay);
			if (alen === 0) continue;
			ax /= alen;
			ay /= alen;
			let minP = ax * _poly[0][0] + ay * _poly[0][1];
			let maxP = minP;
			for (let n = 1; n < len; n++) {
				const d = ax * _poly[n][0] + ay * _poly[n][1];
				if (d < minP) minP = d;
				else if (d > maxP) maxP = d;
			}
			const dotC = ax * c[0] + ay * c[1];
			const dist = minP < dotC - r ? dotC - r - maxP : minP - (dotC + r);
			if (dist > 0) return null;
			else if (Math.abs(dist) < minDist) {
				const edge = Polygon.lineAt(_poly, i);
				if (Rectangle.withinBound(edge, Line.perpendicularFromPt(edge, c)) || Circle.intersectLine2D(_circle, edge).length > 0) {
					minEdge = edge;
					minAx = ax;
					minAy = ay;
					minDist = Math.abs(dist);
					which = i;
				}
			}
		}
		if (!minEdge) return null;
		const centroid = Polygon.centroid(_poly);
		if (minAx * (c[0] - centroid[0]) + minAy * (c[1] - centroid[1]) < 0) {
			minAx = -minAx;
			minAy = -minAy;
		}
		return {
			which,
			dist: minDist,
			normal: new Pt(minAx, minAy),
			edge: minEdge,
			vertex: c
		};
	}
	static hasIntersectPolygon(poly1, poly2) {
		let _poly1 = Util.iterToArray(poly1);
		let _poly2 = Util.iterToArray(poly2);
		const len1 = _poly1.length;
		const len2 = _poly2.length;
		let ax0 = Infinity;
		let ay0 = Infinity;
		let ax1 = -Infinity;
		let ay1 = -Infinity;
		for (let i = 0; i < len1; i++) {
			const p = _poly1[i];
			if (p[0] < ax0) ax0 = p[0];
			if (p[0] > ax1) ax1 = p[0];
			if (p[1] < ay0) ay0 = p[1];
			if (p[1] > ay1) ay1 = p[1];
		}
		let bx0 = Infinity;
		let by0 = Infinity;
		let bx1 = -Infinity;
		let by1 = -Infinity;
		for (let i = 0; i < len2; i++) {
			const p = _poly2[i];
			if (p[0] < bx0) bx0 = p[0];
			if (p[0] > bx1) bx1 = p[0];
			if (p[1] < by0) by0 = p[1];
			if (p[1] > by1) by1 = p[1];
		}
		if (ax0 > bx1 || bx0 > ax1 || ay0 > by1 || by0 > ay1) return null;
		let minDist = Number.MAX_SAFE_INTEGER;
		let minIndex = -1;
		let minAx = 0;
		let minAy = 0;
		for (let i = 0, plen = len1 + len2; i < plen; i++) {
			const src = i < len1 ? _poly1 : _poly2;
			const ei = i < len1 ? i : i - len1;
			const ea = src[ei];
			const eb = src[ei === src.length - 1 ? 0 : ei + 1];
			let ax = ea[1] - eb[1];
			let ay = eb[0] - ea[0];
			const alen = Math.sqrt(ax * ax + ay * ay);
			if (alen === 0) continue;
			ax /= alen;
			ay /= alen;
			const dist = Polygon._axisOverlap2D(_poly1, _poly2, ax, ay);
			if (dist > 0) return null;
			else if (Math.abs(dist) < minDist) {
				minDist = Math.abs(dist);
				minIndex = i;
				minAx = ax;
				minAy = ay;
			}
		}
		if (minIndex < 0) return null;
		const which = minIndex < len1 ? 0 : 1;
		const edge = which === 0 ? Polygon.lineAt(_poly1, minIndex) : Polygon.lineAt(_poly2, minIndex - len1);
		const b1 = which === 0 ? _poly2 : _poly1;
		const b2 = which === 0 ? _poly1 : _poly2;
		const c1 = Polygon.centroid(b1);
		const c2 = Polygon.centroid(b2);
		if (minAx * (c1[0] - c2[0]) + minAy * (c1[1] - c2[1]) < 0) {
			minAx = -minAx;
			minAy = -minAy;
		}
		let smallest = Number.MAX_SAFE_INTEGER;
		let vertex = null;
		for (let i = 0, len = b1.length; i < len; i++) {
			const d = minAx * (b1[i][0] - c2[0]) + minAy * (b1[i][1] - c2[1]);
			if (d < smallest) {
				smallest = d;
				vertex = b1[i];
			}
		}
		return {
			which,
			dist: minDist,
			normal: new Pt(minAx, minAy),
			edge,
			vertex
		};
	}
	static intersectPolygon2D(poly1, poly2) {
		let _poly1 = Util.iterToArray(poly1);
		let _poly2 = Util.iterToArray(poly2);
		let lp = Polygon.lines(_poly1);
		let g = [];
		for (let i = 0, len = lp.length; i < len; i++) {
			let ins = Line.intersectPolygon2D(lp[i], _poly2, false);
			if (ins) g.push(ins);
		}
		return Util.flatten(g, true);
	}
	static toRects(polys) {
		let boxes = [];
		for (let g of polys) boxes.push(Geom.boundingBox(g));
		let merged = Util.flatten(boxes, false);
		boxes.unshift(Geom.boundingBox(merged));
		return boxes;
	}
};
var Curve = class Curve {
	static getSteps(steps) {
		let ts = new Group();
		for (let i = 0; i <= steps; i++) {
			let t = i / steps;
			ts.push(new Pt(t * t * t, t * t, t, 1));
		}
		return ts;
	}
	static controlPoints(pts, index = 0, copyStart = false) {
		let _pts = Util.iterToArray(pts);
		if (index > _pts.length - 1) return new Group();
		let _index = (i) => i < _pts.length - 1 ? i : _pts.length - 1;
		let p0 = _pts[index];
		index = copyStart ? index : index + 1;
		return new Group(p0, _pts[_index(index++)], _pts[_index(index++)], _pts[_index(index++)]);
	}
	static _weights(steps, fill) {
		const w = new Float64Array((steps + 1) * 4);
		for (let i = 0; i <= steps; i++) fill(i / steps, w, i * 4);
		return w;
	}
	static _evalSegment(out, c, w, steps) {
		const c0 = c[0];
		const c1 = c[1];
		const c2 = c[2];
		const c3 = c[3];
		const dim3 = c0.length > 2;
		for (let i = 0; i <= steps; i++) {
			const o = i * 4;
			const w0 = w[o];
			const w1 = w[o + 1];
			const w2 = w[o + 2];
			const w3 = w[o + 3];
			const x = w0 * c0[0] + w1 * c1[0] + w2 * c2[0] + w3 * c3[0];
			const y = w0 * c0[1] + w1 * c1[1] + w2 * c2[1] + w3 * c3[1];
			out.push(dim3 ? new Pt(x, y, w0 * c0[2] + w1 * c1[2] + w2 * c2[2] + w3 * c3[2]) : new Pt(x, y));
		}
	}
	static _calcPt(ctrls, params) {
		let x = ctrls.reduce((a, c, i) => a + c.x * params[i], 0);
		let y = ctrls.reduce((a, c, i) => a + c.y * params[i], 0);
		if (ctrls[0].length > 2) {
			let z = ctrls.reduce((a, c, i) => a + c.z * params[i], 0);
			return new Pt(x, y, z);
		}
		return new Pt(x, y);
	}
	static catmullRom(pts, steps = 10) {
		let _pts = Util.iterToArray(pts);
		if (_pts.length < 2) return new Group();
		let ps = new Group();
		const w = Curve._weights(steps, (t, out, o) => {
			const t2 = t * t;
			const t3 = t2 * t;
			out[o] = -.5 * t3 + t2 - .5 * t;
			out[o + 1] = 1.5 * t3 - 2.5 * t2 + 1;
			out[o + 2] = -1.5 * t3 + 2 * t2 + .5 * t;
			out[o + 3] = .5 * t3 - .5 * t2;
		});
		Curve._evalSegment(ps, Curve.controlPoints(_pts, 0, true), w, steps);
		let k = 0;
		while (k < _pts.length - 2) {
			let cp = Curve.controlPoints(_pts, k);
			if (cp.length > 0) {
				Curve._evalSegment(ps, cp, w, steps);
				k++;
			}
		}
		return ps;
	}
	static catmullRomStep(step, ctrls) {
		let m = new Group(new Pt(-.5, 1, -.5, 0), new Pt(1.5, -2.5, 0, 1), new Pt(-1.5, 2, .5, 0), new Pt(.5, -.5, 0, 0));
		return Curve._calcPt(ctrls, Mat.multiply([step], m, true)[0]);
	}
	static cardinal(pts, steps = 10, tension = .5) {
		let _pts = Util.iterToArray(pts);
		if (_pts.length < 2) return new Group();
		let ps = new Group();
		const w = Curve._weights(steps, (t, out, o) => {
			const t2 = t * t;
			const t3 = t2 * t;
			out[o] = tension * (-t3 + 2 * t2 - t);
			out[o + 1] = tension * (-t3 + t2) + (2 * t3 - 3 * t2 + 1);
			out[o + 2] = tension * (t3 - 2 * t2 + t) + (-2 * t3 + 3 * t2);
			out[o + 3] = tension * (t3 - t2);
		});
		Curve._evalSegment(ps, Curve.controlPoints(_pts, 0, true), w, steps);
		let k = 0;
		while (k < _pts.length - 2) {
			let cp = Curve.controlPoints(_pts, k);
			if (cp.length > 0) {
				Curve._evalSegment(ps, cp, w, steps);
				k++;
			}
		}
		return ps;
	}
	static cardinalStep(step, ctrls, tension = .5) {
		let m = new Group(new Pt(-1, 2, -1, 0), new Pt(-1, 1, 0, 0), new Pt(1, -2, 1, 0), new Pt(1, -1, 0, 0));
		let h = Mat.multiply([step], m, true)[0].multiply(tension);
		let h2 = 2 * step[0] - 3 * step[1] + 1;
		let h3 = -2 * step[0] + 3 * step[1];
		let pt = Curve._calcPt(ctrls, h);
		pt.x += h2 * ctrls[1].x + h3 * ctrls[2].x;
		pt.y += h2 * ctrls[1].y + h3 * ctrls[2].y;
		if (pt.length > 2) pt.z += h2 * ctrls[1].z + h3 * ctrls[2].z;
		return pt;
	}
	static bezier(pts, steps = 10) {
		let _pts = Util.iterToArray(pts);
		if (_pts.length < 4) return new Group();
		let ps = new Group();
		const w = Curve._weights(steps, (t, out, o) => {
			const t2 = t * t;
			const t3 = t2 * t;
			out[o] = -t3 + 3 * t2 - 3 * t + 1;
			out[o + 1] = 3 * t3 - 6 * t2 + 3 * t;
			out[o + 2] = -3 * t3 + 3 * t2;
			out[o + 3] = t3;
		});
		let k = 0;
		while (k < _pts.length - 3) {
			let c = Curve.controlPoints(_pts, k);
			if (c.length > 0) {
				Curve._evalSegment(ps, c, w, steps);
				k += 3;
			}
		}
		return ps;
	}
	static bezierStep(step, ctrls) {
		let m = new Group(new Pt(-1, 3, -3, 1), new Pt(3, -6, 3, 0), new Pt(-3, 3, 0, 0), new Pt(1, 0, 0, 0));
		return Curve._calcPt(ctrls, Mat.multiply([step], m, true)[0]);
	}
	static bspline(pts, steps = 10, tension = 1) {
		let _pts = Util.iterToArray(pts);
		if (_pts.length < 2) return new Group();
		let ps = new Group();
		const w = tension !== 1 ? Curve._weights(steps, (t, out, o) => {
			const t2 = t * t;
			const t3 = t2 * t;
			const b1 = 2 * t3 - 3 * t2 + 1;
			const b2 = -2 * t3 + 3 * t2;
			out[o] = tension * (-t3 / 6 + .5 * t2 - .5 * t + 1 / 6);
			out[o + 1] = tension * (-1.5 * t3 + 2 * t2 - 1 / 3) + b1;
			out[o + 2] = tension * (1.5 * t3 - 2.5 * t2 + .5 * t + 1 / 6) + b2;
			out[o + 3] = tension * (t3 / 6);
		}) : Curve._weights(steps, (t, out, o) => {
			const t2 = t * t;
			const t3 = t2 * t;
			out[o] = -t3 / 6 + .5 * t2 - .5 * t + 1 / 6;
			out[o + 1] = .5 * t3 - t2 + 2 / 3;
			out[o + 2] = -.5 * t3 + .5 * t2 + .5 * t + 1 / 6;
			out[o + 3] = t3 / 6;
		});
		let k = 0;
		while (k < _pts.length - 3) {
			let c = Curve.controlPoints(_pts, k);
			if (c.length > 0) {
				Curve._evalSegment(ps, c, w, steps);
				k++;
			}
		}
		return ps;
	}
	static bsplineStep(step, ctrls) {
		let m = new Group(new Pt(-.16666666666666666, .5, -.5, .16666666666666666), new Pt(.5, -1, 0, .6666666666666666), new Pt(-.5, .5, .5, .16666666666666666), new Pt(.16666666666666666, 0, 0, 0));
		return Curve._calcPt(ctrls, Mat.multiply([step], m, true)[0]);
	}
	static bsplineTensionStep(step, ctrls, tension = 1) {
		let m = new Group(new Pt(-.16666666666666666, .5, -.5, .16666666666666666), new Pt(-1.5, 2, 0, -.3333333333333333), new Pt(1.5, -2.5, .5, .16666666666666666), new Pt(.16666666666666666, 0, 0, 0));
		let h = Mat.multiply([step], m, true)[0].multiply(tension);
		let h2 = 2 * step[0] - 3 * step[1] + 1;
		let h3 = -2 * step[0] + 3 * step[1];
		let pt = Curve._calcPt(ctrls, h);
		pt.x += h2 * ctrls[1].x + h3 * ctrls[2].x;
		pt.y += h2 * ctrls[1].y + h3 * ctrls[2].y;
		if (pt.length > 2) pt.z += h2 * ctrls[1].z + h3 * ctrls[2].z;
		return pt;
	}
};

//#endregion
//#region src/uheprng.ts
function Mash() {
	let n = 4022871197;
	let mash = function(data) {
		if (data) {
			data = data.toString();
			for (let i = 0; i < data.length; i++) {
				n += data.charCodeAt(i);
				let h = .02519603282416938 * n;
				n = h >>> 0;
				h -= n;
				h *= n;
				n = h >>> 0;
				h -= n;
				n += h * 4294967296;
			}
			return (n >>> 0) * 23283064365386963e-26;
		} else n = 4022871197;
	};
	return mash;
}
function uheprng_default(seed) {
	let o = 48;
	let c = 1;
	let p = o;
	let s = new Array(o);
	let i, j, k = 0;
	let mash = Mash();
	for (i = 0; i < o; i++) s[i] = mash(Math.random().toString());
	function initState() {
		mash();
		for (i = 0; i < o; i++) s[i] = mash(" ");
		c = 1;
		p = o;
	}
	function cleanString(inStr) {
		inStr = inStr.replace(/(^\s*)|(\s*$)/gi, "");
		inStr = inStr.replace(/[\x00-\x1F]/gi, "");
		inStr = inStr.replace(/\n /, "\n");
		return inStr;
	}
	function hashString(inStr) {
		inStr = cleanString(inStr);
		mash(inStr);
		for (i = 0; i < inStr.length; i++) {
			k = inStr.charCodeAt(i);
			for (j = 0; j < o; j++) {
				s[j] -= mash(k.toString());
				if (s[j] < 0) s[j] += 1;
			}
		}
	}
	initState();
	hashString(seed);
	return { random() {
		if (++p >= o) p = 0;
		let t = 1768863 * s[p] + c * 23283064365386963e-26;
		return s[p] = t - (c = t | 0);
	} };
}

//#endregion
//#region src/Num.ts
var Num = class Num {
	static equals(a, b, threshold = 1e-5) {
		return Math.abs(a - b) < threshold;
	}
	static lerp(a, b, t) {
		return (1 - t) * a + t * b;
	}
	static clamp(val, min, max) {
		return Math.max(min, Math.min(max, val));
	}
	static boundValue(val, min, max) {
		const len = Math.abs(max - min);
		let a = val % len;
		if (a > max) a -= len;
		else if (a < min) a += len;
		return a;
	}
	static within(p, a, b) {
		return p >= Math.min(a, b) && p <= Math.max(a, b);
	}
	static randomRange(a, b = 0) {
		const r = a > b ? a - b : b - a;
		return a + Num.random() * r;
	}
	static randomPt(a, b) {
		const p = new Pt(a.length);
		const range = b ? Vec.subtract(b.slice(), a) : a;
		const start = b ? a : new Pt(a.length).fill(0);
		for (let i = 0, len = p.length; i < len; i++) p[i] = Num.random() * range[i] + start[i];
		return p;
	}
	static normalizeValue(n, a, b) {
		const min = Math.min(a, b);
		const max = Math.max(a, b);
		return (n - min) / (max - min);
	}
	static sum(pts) {
		const _pts = Util.iterToArray(pts);
		const c = new Pt(_pts[0]);
		for (let i = 1, len = _pts.length; i < len; i++) Vec.add(c, _pts[i]);
		return c;
	}
	static average(pts) {
		const _pts = Util.iterToArray(pts);
		return Num.sum(_pts).divide(_pts.length);
	}
	static cycle(t, method = Shaping.sineInOut) {
		return method(t > .5 ? 2 - t * 2 : t * 2);
	}
	static mapToRange(n, currA, currB, targetA, targetB) {
		if (currA == currB) throw new Error("[currMin, currMax] must define a range that is not zero");
		const min = Math.min(targetA, targetB);
		const max = Math.max(targetA, targetB);
		return Num.normalizeValue(n, currA, currB) * (max - min) + min;
	}
	static seed(seed) {
		this.generator = uheprng_default(seed);
	}
	static random() {
		return this.generator ? this.generator.random() : Math.random();
	}
};
var Geom = class Geom {
	static boundAngle(angle) {
		return Num.boundValue(angle, 0, 360);
	}
	static boundRadian(radian) {
		return Num.boundValue(radian, 0, Const.two_pi);
	}
	static toRadian(angle) {
		return angle * Const.deg_to_rad;
	}
	static toDegree(radian) {
		return radian * Const.rad_to_deg;
	}
	static boundingBox(pts) {
		let minPt, maxPt;
		for (const p of pts) if (minPt == void 0) {
			minPt = p.clone();
			maxPt = p.clone();
		} else for (let i = 0, len = Math.min(minPt.length, p.length); i < len; i++) {
			minPt[i] = Math.min(minPt[i], p[i]);
			maxPt[i] = Math.max(maxPt[i], p[i]);
		}
		return new Group(minPt, maxPt);
	}
	static centroid(pts) {
		return Num.average(pts);
	}
	static anchor(pts, ptOrIndex = 0, direction = "to") {
		const method = direction == "to" ? "subtract" : "add";
		let i = 0;
		for (const p of pts) {
			if (typeof ptOrIndex == "number") {
				if (ptOrIndex !== i) p[method](pts[ptOrIndex]);
			} else p[method](ptOrIndex);
			i++;
		}
	}
	static interpolate(a, b, t = .5) {
		const len = Math.min(a.length, b.length);
		const d = Pt.make(len);
		for (let i = 0; i < len; i++) d[i] = a[i] * (1 - t) + b[i] * t;
		return d;
	}
	static perpendicular(pt, axis = Const.xy) {
		const y = axis[1];
		const x = axis[0];
		const p = new Pt(pt);
		const pa = new Pt(p);
		pa[x] = -p[y];
		pa[y] = p[x];
		const pb = new Pt(p);
		pb[x] = p[y];
		pb[y] = -p[x];
		return new Group(pa, pb);
	}
	static isPerpendicular(p1, p2) {
		return new Pt(p1).dot(p2) === 0;
	}
	static withinBound(pt, boundPt1, boundPt2) {
		for (let i = 0, len = Math.min(pt.length, boundPt1.length, boundPt2.length); i < len; i++) if (!Num.within(pt[i], boundPt1[i], boundPt2[i])) return false;
		return true;
	}
	static sortEdges(pts) {
		const _pts = Util.iterToArray(pts);
		const bounds = Geom.boundingBox(_pts);
		const center = bounds[1].add(bounds[0]).divide(2);
		const fn = (a, b) => {
			if (a.length < 2 || b.length < 2) throw new Error("Pt dimension cannot be less than 2");
			const da = a.$subtract(center);
			const db = b.$subtract(center);
			if (da[0] >= 0 && db[0] < 0) return 1;
			if (da[0] < 0 && db[0] >= 0) return -1;
			if (da[0] == 0 && db[0] == 0) {
				if (da[1] >= 0 || db[1] >= 0) return da[1] > db[1] ? 1 : -1;
				return db[1] > da[1] ? 1 : -1;
			}
			const det = da.$cross2D(db);
			if (det < 0) return 1;
			if (det > 0) return -1;
			return da[0] * da[0] + da[1] * da[1] > db[0] * db[0] + db[1] * db[1] ? 1 : -1;
		};
		return _pts.sort(fn);
	}
	static scale(ps, scale, anchor) {
		const pts = Util.iterToArray(ps[0] !== void 0 && typeof ps[0] == "number" ? [ps] : ps);
		const scs = typeof scale == "number" ? Pt.make(pts[0].length, scale) : scale;
		if (!anchor) anchor = Pt.make(pts[0].length, 0);
		for (let i = 0, len = pts.length; i < len; i++) {
			const p = pts[i];
			for (let k = 0, lenP = p.length; k < lenP; k++) p[k] = anchor && anchor[k] ? anchor[k] + (p[k] - anchor[k]) * scs[k] : p[k] * scs[k];
		}
		return Geom;
	}
	static rotate2D(ps, angle, anchor, axis) {
		const pts = Util.iterToArray(ps[0] !== void 0 && typeof ps[0] == "number" ? [ps] : ps);
		const fn = anchor ? Mat.rotateAt2DMatrix : Mat.rotate2DMatrix;
		if (!anchor) anchor = Pt.make(pts[0].length, 0);
		const cos = Math.cos(angle);
		const sin = Math.sin(angle);
		for (let i = 0, len = pts.length; i < len; i++) {
			const p = axis ? pts[i].$take(axis) : pts[i];
			p.to(Mat.transform2D(p, fn(cos, sin, anchor)));
			if (axis) for (let k = 0; k < axis.length; k++) pts[i][axis[k]] = p[k];
		}
		return Geom;
	}
	static shear2D(ps, scale, anchor, axis) {
		const pts = Util.iterToArray(ps[0] !== void 0 && typeof ps[0] == "number" ? [ps] : ps);
		const s = typeof scale == "number" ? [scale, scale] : scale;
		if (!anchor) anchor = Pt.make(pts[0].length, 0);
		const fn = anchor ? Mat.shearAt2DMatrix : Mat.shear2DMatrix;
		const tanx = Math.tan(s[0]);
		const tany = Math.tan(s[1]);
		for (let i = 0, len = pts.length; i < len; i++) {
			const p = axis ? pts[i].$take(axis) : pts[i];
			p.to(Mat.transform2D(p, fn(tanx, tany, anchor)));
			if (axis) for (let k = 0; k < axis.length; k++) pts[i][axis[k]] = p[k];
		}
		return Geom;
	}
	static reflect2D(ps, line, axis) {
		const pts = Util.iterToArray(ps[0] !== void 0 && typeof ps[0] == "number" ? [ps] : ps);
		const _line = Util.iterToArray(line);
		const mat = Mat.reflectAt2DMatrix(_line[0], _line[1]);
		for (let i = 0, len = pts.length; i < len; i++) {
			const p = axis ? pts[i].$take(axis) : pts[i];
			p.to(Mat.transform2D(p, mat));
			if (axis) for (let k = 0; k < axis.length; k++) pts[i][axis[k]] = p[k];
		}
		return Geom;
	}
	static cosTable() {
		const cos = /* @__PURE__ */ new Float64Array(360);
		for (let i = 0; i < 360; i++) cos[i] = Math.cos(i * Math.PI / 180);
		const find = (rad) => cos[Math.floor(Geom.boundAngle(Geom.toDegree(rad)))];
		return {
			table: cos,
			cos: find
		};
	}
	static sinTable() {
		const sin = /* @__PURE__ */ new Float64Array(360);
		for (let i = 0; i < 360; i++) sin[i] = Math.sin(i * Math.PI / 180);
		const find = (rad) => sin[Math.floor(Geom.boundAngle(Geom.toDegree(rad)))];
		return {
			table: sin,
			sin: find
		};
	}
};
var Shaping = class Shaping {
	static linear(t, c = 1) {
		return c * t;
	}
	static quadraticIn(t, c = 1) {
		return c * t * t;
	}
	static quadraticOut(t, c = 1) {
		return -c * t * (t - 2);
	}
	static quadraticInOut(t, c = 1) {
		const dt = t * 2;
		return t < .5 ? c / 2 * t * t * 4 : -c / 2 * ((dt - 1) * (dt - 3) - 1);
	}
	static cubicIn(t, c = 1) {
		return c * t * t * t;
	}
	static cubicOut(t, c = 1) {
		const dt = t - 1;
		return c * (dt * dt * dt + 1);
	}
	static cubicInOut(t, c = 1) {
		const dt = t * 2;
		return t < .5 ? c / 2 * dt * dt * dt : c / 2 * ((dt - 2) * (dt - 2) * (dt - 2) + 2);
	}
	static exponentialIn(t, c = 1, p = .25) {
		return c * Math.pow(t, 1 / p);
	}
	static exponentialOut(t, c = 1, p = .25) {
		return c * Math.pow(t, p);
	}
	static sineIn(t, c = 1) {
		return -c * Math.cos(t * Const.half_pi) + c;
	}
	static sineOut(t, c = 1) {
		return c * Math.sin(t * Const.half_pi);
	}
	static sineInOut(t, c = 1) {
		return -c / 2 * (Math.cos(Math.PI * t) - 1);
	}
	static cosineApprox(t, c = 1) {
		const t2 = t * t;
		const t4 = t2 * t2;
		return c * (4 * (t4 * t2) / 9 - 17 * t4 / 9 + 22 * t2 / 9);
	}
	static circularIn(t, c = 1) {
		return -c * (Math.sqrt(1 - t * t) - 1);
	}
	static circularOut(t, c = 1) {
		const dt = t - 1;
		return c * Math.sqrt(1 - dt * dt);
	}
	static circularInOut(t, c = 1) {
		const dt = t * 2;
		return t < .5 ? -c / 2 * (Math.sqrt(1 - dt * dt) - 1) : c / 2 * (Math.sqrt(1 - (dt - 2) * (dt - 2)) + 1);
	}
	static elasticIn(t, c = 1, p = .7) {
		const dt = t - 1;
		const s = p / Const.two_pi * 1.5707963267948966;
		return c * (-Math.pow(2, 10 * dt) * Math.sin((dt - s) * Const.two_pi / p));
	}
	static elasticOut(t, c = 1, p = .7) {
		const s = p / Const.two_pi * 1.5707963267948966;
		return c * (Math.pow(2, -10 * t) * Math.sin((t - s) * Const.two_pi / p)) + c;
	}
	static elasticInOut(t, c = 1, p = .6) {
		let dt = t * 2;
		const s = p / Const.two_pi * 1.5707963267948966;
		if (t < .5) {
			dt -= 1;
			return c * (-.5 * (Math.pow(2, 10 * dt) * Math.sin((dt - s) * Const.two_pi / p)));
		} else {
			dt -= 1;
			return c * (.5 * (Math.pow(2, -10 * dt) * Math.sin((dt - s) * Const.two_pi / p))) + c;
		}
	}
	static bounceIn(t, c = 1) {
		return c - Shaping.bounceOut(1 - t, c);
	}
	static bounceOut(t, c = 1) {
		if (t < 1 / 2.75) return c * (7.5625 * t * t);
		else if (t < 2 / 2.75) {
			t -= 1.5 / 2.75;
			return c * (7.5625 * t * t + .75);
		} else if (t < 2.5 / 2.75) {
			t -= 2.25 / 2.75;
			return c * (7.5625 * t * t + .9375);
		} else {
			t -= 2.625 / 2.75;
			return c * (7.5625 * t * t + .984375);
		}
	}
	static bounceInOut(t, c = 1) {
		return t < .5 ? Shaping.bounceIn(t * 2, c) / 2 : Shaping.bounceOut(t * 2 - 1, c) / 2 + c / 2;
	}
	static sigmoid(t, c = 1, p = 10) {
		const d = p * (t - .5);
		return c / (1 + Math.exp(-d));
	}
	static logSigmoid(t, c = 1, p = .7) {
		p = Math.max(Const.epsilon, Math.min(1 - Const.epsilon, p));
		p = 1 / (1 - p);
		const A = 1 / (1 + Math.exp((t - .5) * p * -2));
		const B = 1 / (1 + Math.exp(p));
		const C = 1 / (1 + Math.exp(-p));
		return c * (A - B) / (C - B);
	}
	static seat(t, c = 1, p = .5) {
		if (t < .5) return c * Math.pow(2 * t, 1 - p) / 2;
		else return c * (1 - Math.pow(2 * (1 - t), 1 - p) / 2);
	}
	static quadraticBezier(t, c = 1, p = [.05, .95]) {
		const a = typeof p != "number" ? p[0] : p;
		const b = typeof p != "number" ? p[1] : .5;
		let om2a = 1 - 2 * a;
		if (om2a === 0) om2a = Const.epsilon;
		const d = (Math.sqrt(a * a + om2a * t) - a) / om2a;
		return c * ((1 - 2 * b) * (d * d) + 2 * b * d);
	}
	static cubicBezier(t, c = 1, p1 = [.1, .7], p2 = [.9, .2]) {
		const curve = new Group(new Pt(0, 0), new Pt(p1), new Pt(p2), new Pt(1, 1));
		return c * Curve.bezierStep(new Pt(t * t * t, t * t, t, 1), Curve.controlPoints(curve)).y;
	}
	static quadraticTarget(t, c = 1, p1 = [.2, .35]) {
		const a = Math.min(1 - Const.epsilon, Math.max(Const.epsilon, p1[0]));
		const b = Math.min(1, Math.max(0, p1[1]));
		const A = (1 - b) / (1 - a) - b / a;
		const B = (A * (a * a) - b) / a;
		const y = A * (t * t) - B * t;
		return c * Math.min(1, Math.max(0, y));
	}
	static cliff(t, c = 1, p = .5) {
		return t > p ? c : 0;
	}
	static step(fn, steps, t, c, ...args) {
		const s = 1 / steps;
		return fn(Math.floor(t / s) * s, c, ...args);
	}
};
var Range = class {
	constructor(g) {
		this._dims = 0;
		this._source = Group.fromPtArray(g);
		this.calc();
	}
	get max() {
		return this._max.clone();
	}
	get min() {
		return this._min.clone();
	}
	get magnitude() {
		return this._mag.clone();
	}
	calc() {
		if (!this._source) return;
		const dims = this._source[0].length;
		this._dims = dims;
		const max = new Pt(dims);
		const min = new Pt(dims);
		const mag = new Pt(dims);
		for (let i = 0; i < dims; i++) {
			max[i] = Const.min;
			min[i] = Const.max;
			mag[i] = 0;
			const s = this._source.zipSlice(i);
			for (let k = 0, len = s.length; k < len; k++) {
				max[i] = Math.max(max[i], s[k]);
				min[i] = Math.min(min[i], s[k]);
				mag[i] = max[i] - min[i];
			}
		}
		this._max = max;
		this._min = min;
		this._mag = mag;
		return this;
	}
	mapTo(min, max, exclude) {
		const target = new Group();
		for (let i = 0, len = this._source.length; i < len; i++) {
			const g = this._source[i];
			const n = new Pt(this._dims);
			for (let k = 0; k < this._dims; k++) n[k] = exclude && exclude[k] ? g[k] : Num.mapToRange(g[k], this._min[k], this._max[k], min, max);
			target.push(n);
		}
		return target;
	}
	append(pts, update = true) {
		const _pts = Util.iterToArray(pts);
		if (_pts[0].length !== this._dims) throw new Error(`Dimensions don't match. ${this._dims} dimensions in Range and ${_pts[0].length} provided in parameter. `);
		this._source = this._source.concat(_pts);
		if (update) this.calc();
		return this;
	}
	ticks(count) {
		const g = new Group();
		for (let i = 0; i <= count; i++) {
			const p = new Pt(this._dims);
			for (let k = 0, len = this._max.length; k < len; k++) p[k] = Num.lerp(this._min[k], this._max[k], i / count);
			g.push(p);
		}
		return g;
	}
};

//#endregion
//#region src/Util.ts
const Const = {
	xy: "xy",
	yz: "yz",
	xz: "xz",
	xyz: "xyz",
	horizontal: 0,
	vertical: 1,
	identical: 0,
	right: 4,
	bottom_right: 5,
	bottom: 6,
	bottom_left: 7,
	left: 8,
	top_left: 1,
	top: 2,
	top_right: 3,
	epsilon: 1e-4,
	max: Number.MAX_VALUE,
	min: Number.MIN_VALUE,
	pi: Math.PI,
	two_pi: 6.283185307179586,
	half_pi: 1.5707963267948966,
	quarter_pi: .7853981633974483,
	one_degree: .017453292519943295,
	rad_to_deg: 57.29577951308232,
	deg_to_rad: .017453292519943295,
	gravity: 9.81,
	newton: .10197,
	gaussian: .3989422804014327
};
var Util = class Util {
	static warnLevel(lv) {
		if (lv) Util._warnLevel = lv;
		return Util._warnLevel;
	}
	static getArgs(args) {
		if (args.length < 1) return [];
		let pos = [];
		let isArray = Array.isArray(args[0]) || ArrayBuffer.isView(args[0]);
		if (typeof args[0] === "number") pos = Array.prototype.slice.call(args);
		else if (typeof args[0] === "object" && !isArray) {
			let a = [
				"x",
				"y",
				"z",
				"w"
			];
			let p = args[0];
			for (let i = 0; i < a.length; i++) {
				if (p.length && i >= p.length || !(a[i] in p)) break;
				pos.push(p[a[i]]);
			}
		} else if (isArray) pos = Util.toNumericArray(args[0]);
		return pos;
	}
	static toNumericArray(a) {
		if (Array.isArray(a)) return a.slice();
		const out = [];
		for (let i = 0, len = a.length; i < len; i++) out.push(a[i]);
		return out;
	}
	static getPtLike(args) {
		const a0 = args[0];
		if (typeof a0 === "number") return args;
		if (args.length === 1 && (Array.isArray(a0) || ArrayBuffer.isView(a0))) return a0;
		return Util.getArgs(args);
	}
	static warn(message = "error", defaultReturn = void 0) {
		if (Util.warnLevel() == "error") throw new Error(message);
		else if (Util.warnLevel() == "warn") console.warn(message);
		return defaultReturn;
	}
	static randomInt(range, start = 0) {
		Util.warn("Util.randomInt is deprecated. Please use `Num.randomRange`");
		return Math.floor(Num.random() * range) + start;
	}
	static split(pts, size, stride, loopBack = false, matchSize = true) {
		let chunks = [];
		let part = [];
		let st = stride || size;
		let index = 0;
		if (pts.length <= 0 || st <= 0) return [];
		while (index < pts.length) {
			part = [];
			for (let k = 0; k < size; k++) if (loopBack) part.push(pts[(index + k) % pts.length]);
			else {
				if (index + k >= pts.length) break;
				part.push(pts[index + k]);
			}
			index += st;
			if (!matchSize || matchSize && part.length === size) chunks.push(part);
		}
		return chunks;
	}
	static flatten(pts, flattenAsGroup = true) {
		let arr = flattenAsGroup ? new Group() : [];
		return arr.concat.apply(arr, pts);
	}
	static combine(a, b, op) {
		let result = [];
		for (let i = 0, len = a.length; i < len; i++) for (let k = 0, lenB = b.length; k < lenB; k++) result.push(op(a[i], b[k]));
		return result;
	}
	static zip(arrays) {
		let z = [];
		for (let i = 0, len = arrays[0].length; i < len; i++) {
			let p = [];
			for (let k = 0; k < arrays.length; k++) p.push(arrays[k][i]);
			z.push(p);
		}
		return z;
	}
	static stepper(max, min = 0, stride = 1, callback) {
		let c = min;
		return function() {
			c += stride;
			if (c >= max) c = min + (c - max);
			if (callback) callback(c);
			return c;
		};
	}
	static forRange(fn, range, start = 0, step = 1) {
		let temp = [];
		for (let i = start, len = range; i < len; i += step) temp[i] = fn(i);
		return temp;
	}
	static load(url, callback) {
		let request = new XMLHttpRequest();
		request.open("GET", url, true);
		request.onload = function() {
			if (request.status >= 200 && request.status < 400) callback(request.responseText, true);
			else callback(`Server error (${request.status}) when loading "${url}"`, false);
		};
		request.onerror = function() {
			callback(`Unknown network error`, false);
		};
		request.send();
	}
	static download(space, filename = "pts_canvas_image", filetype = "png", quality = 1) {
		const ftype = filetype === "jpg" ? "jpeg" : filetype;
		space.element.toBlob(function(blob) {
			const link = document.createElement("a");
			const url = URL.createObjectURL(blob);
			link.href = url;
			link.download = `${filename}.${filetype}`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
		}, `image/${ftype}`, quality);
	}
	static performance(avgFrames = 10) {
		let last = Date.now();
		let avg = [];
		return function() {
			const now = Date.now();
			avg.push(now - last);
			if (avg.length >= avgFrames) avg.shift();
			last = now;
			return Math.floor(avg.reduce((a, b) => a + b, 0) / avg.length);
		};
	}
	static arrayCheck(pts, minRequired = 2) {
		if (Array.isArray(pts) && pts.length < minRequired) {
			Util.warn(`Requires ${minRequired} or more Pts in this Group.`);
			return false;
		}
		return true;
	}
	static iterToArray(it) {
		return !Array.isArray(it) ? [...it] : it;
	}
	static isMobile() {
		return /iPhone|iPad|Android/i.test(navigator.userAgent);
	}
	static uniqueId(useCrypto = false) {
		return useCrypto && crypto ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).substring(2);
	}
};
Util._warnLevel = "mute";

//#endregion
//#region src/Pt.ts
var Pt = class Pt extends Float32Array {
	constructor(...args) {
		let params;
		const a0 = args[0];
		if (args.length === 1 && typeof a0 == "number") params = a0;
		else if (args.length === 0) params = 2;
		else if (args.length === 1 && (Array.isArray(a0) || ArrayBuffer.isView(a0))) params = a0;
		else if (typeof a0 === "number") params = args;
		else params = Util.getArgs(args);
		super(params);
	}
	static make(dimensions, defaultValue = 0, randomize = false) {
		const p = new Pt(dimensions);
		if (defaultValue) p.fill(defaultValue);
		if (randomize) for (let i = 0, len = p.length; i < len; i++) p[i] = p[i] * Num.random();
		return p;
	}
	get id() {
		return this._id;
	}
	set id(s) {
		this._id = s;
	}
	get x() {
		return this[0];
	}
	set x(n) {
		this[0] = n;
	}
	get y() {
		return this[1];
	}
	set y(n) {
		this[1] = n;
	}
	get z() {
		return this[2];
	}
	set z(n) {
		this[2] = n;
	}
	get w() {
		return this[3];
	}
	set w(n) {
		this[3] = n;
	}
	clone() {
		return new Pt(this);
	}
	equals(p, threshold = 1e-6) {
		for (let i = 0, len = this.length; i < len; i++) if (Math.abs(this[i] - p[i]) > threshold) return false;
		return true;
	}
	to(...args) {
		const p = Util.getPtLike(args);
		for (let i = 0, len = Math.min(this.length, p.length); i < len; i++) this[i] = p[i];
		return this;
	}
	$to(...args) {
		return this.clone().to(...args);
	}
	toAngle(radian, magnitude, anchorFromPt = false) {
		const m = magnitude != void 0 ? magnitude : this.magnitude();
		const change = [Math.cos(radian) * m, Math.sin(radian) * m];
		return anchorFromPt ? this.add(change) : this.to(change);
	}
	op(fn) {
		const self = this;
		return (...params) => {
			return fn(self, ...params);
		};
	}
	ops(fns) {
		const _ops = [];
		for (let i = 0, len = fns.length; i < len; i++) _ops.push(this.op(fns[i]));
		return _ops;
	}
	$take(axis) {
		const p = [];
		for (let i = 0, len = axis.length; i < len; i++) p.push(this[axis[i]] || 0);
		return new Pt(p);
	}
	$concat(...args) {
		return new Pt(this.toArray().concat(Util.getArgs(args)));
	}
	add(...args) {
		args.length === 1 && typeof args[0] == "number" ? Vec.add(this, args[0]) : Vec.add(this, Util.getPtLike(args));
		return this;
	}
	$add(...args) {
		return this.clone().add(...args);
	}
	subtract(...args) {
		args.length === 1 && typeof args[0] == "number" ? Vec.subtract(this, args[0]) : Vec.subtract(this, Util.getPtLike(args));
		return this;
	}
	$subtract(...args) {
		return this.clone().subtract(...args);
	}
	multiply(...args) {
		args.length === 1 && typeof args[0] == "number" ? Vec.multiply(this, args[0]) : Vec.multiply(this, Util.getPtLike(args));
		return this;
	}
	$multiply(...args) {
		return this.clone().multiply(...args);
	}
	divide(...args) {
		args.length === 1 && typeof args[0] == "number" ? Vec.divide(this, args[0]) : Vec.divide(this, Util.getPtLike(args));
		return this;
	}
	$divide(...args) {
		return this.clone().divide(...args);
	}
	magnitudeSq() {
		return Vec.dot(this, this);
	}
	magnitude() {
		return Vec.magnitude(this);
	}
	unit(magnitude = void 0) {
		Vec.unit(this, magnitude);
		return this;
	}
	$unit(magnitude = void 0) {
		return this.clone().unit(magnitude);
	}
	dot(...args) {
		return Vec.dot(this, Util.getPtLike(args));
	}
	$cross2D(...args) {
		return Vec.cross2D(this, Util.getPtLike(args));
	}
	$cross(...args) {
		return Vec.cross(this, Util.getPtLike(args));
	}
	$project(...args) {
		return this.$multiply(this.dot(...args) / this.magnitudeSq());
	}
	projectScalar(...args) {
		return this.dot(...args) / this.magnitude();
	}
	abs() {
		Vec.abs(this);
		return this;
	}
	$abs() {
		return this.clone().abs();
	}
	floor() {
		Vec.floor(this);
		return this;
	}
	$floor() {
		return this.clone().floor();
	}
	ceil() {
		Vec.ceil(this);
		return this;
	}
	$ceil() {
		return this.clone().ceil();
	}
	round() {
		Vec.round(this);
		return this;
	}
	$round() {
		return this.clone().round();
	}
	minValue() {
		return Vec.min(this);
	}
	maxValue() {
		return Vec.max(this);
	}
	$min(...args) {
		const p = Util.getPtLike(args);
		const m = this.clone();
		for (let i = 0, len = Math.min(this.length, p.length); i < len; i++) m[i] = Math.min(this[i], p[i]);
		return m;
	}
	$max(...args) {
		const p = Util.getPtLike(args);
		const m = this.clone();
		for (let i = 0, len = Math.min(this.length, p.length); i < len; i++) m[i] = Math.max(this[i], p[i]);
		return m;
	}
	angle(axis = Const.xy) {
		return Math.atan2(this[axis[1]], this[axis[0]]);
	}
	angleBetween(p, axis = Const.xy) {
		return Geom.boundRadian(this.angle(axis)) - Geom.boundRadian(p.angle(axis));
	}
	scale(scale, anchor) {
		Geom.scale(this, scale, anchor || Pt.make(this.length, 0));
		return this;
	}
	rotate2D(angle, anchor, axis) {
		Geom.rotate2D(this, angle, anchor || Pt.make(this.length, 0), axis);
		return this;
	}
	shear2D(scale, anchor, axis) {
		Geom.shear2D(this, scale, anchor || Pt.make(this.length, 0), axis);
		return this;
	}
	reflect2D(line, axis) {
		Geom.reflect2D(this, line, axis);
		return this;
	}
	toString() {
		return `Pt(${this.join(", ")})`;
	}
	toArray() {
		const a = [];
		for (let i = 0, len = this.length; i < len; i++) a.push(this[i]);
		return a;
	}
	toGroup() {
		return new Group(Pt.make(this.length), this.clone());
	}
	toBound() {
		return new Bound(Pt.make(this.length), this.clone());
	}
};
var Group = class Group extends Array {
	constructor(...args) {
		super(...args);
	}
	get id() {
		return this._id;
	}
	set id(s) {
		this._id = s;
	}
	get p1() {
		return this[0];
	}
	get p2() {
		return this[1];
	}
	get p3() {
		return this[2];
	}
	get p4() {
		return this[3];
	}
	get q1() {
		return this[this.length - 1];
	}
	get q2() {
		return this[this.length - 2];
	}
	get q3() {
		return this[this.length - 3];
	}
	get q4() {
		return this[this.length - 4];
	}
	clone() {
		const group = new Group();
		for (let i = 0, len = this.length; i < len; i++) group.push(this[i].clone());
		return group;
	}
	static fromArray(list) {
		const g = new Group();
		for (const li of list) {
			const p = li instanceof Pt ? li : new Pt(li);
			g.push(p);
		}
		return g;
	}
	static fromPtArray(list) {
		return Group.from(list);
	}
	split(chunkSize, stride, loopBack = false) {
		return Util.split(this, chunkSize, stride, loopBack);
	}
	insert(pts, index = 0) {
		Group.prototype.splice.apply(this, [
			index,
			0,
			...pts
		]);
		return this;
	}
	remove(index = 0, count = 1) {
		const param = index < 0 ? [index * -1 - 1, count] : [index, count];
		return Group.prototype.splice.apply(this, param);
	}
	segments(pts_per_segment = 2, stride = 1, loopBack = false) {
		return this.split(pts_per_segment, stride, loopBack);
	}
	lines() {
		return this.segments(2, 1);
	}
	centroid() {
		return Geom.centroid(this);
	}
	boundingBox() {
		return Geom.boundingBox(this);
	}
	anchorTo(ptOrIndex = 0) {
		Geom.anchor(this, ptOrIndex, "to");
	}
	anchorFrom(ptOrIndex = 0) {
		Geom.anchor(this, ptOrIndex, "from");
	}
	op(fn) {
		const self = this;
		return (...params) => {
			return fn(self, ...params);
		};
	}
	ops(fns) {
		const _ops = [];
		for (let i = 0, len = fns.length; i < len; i++) _ops.push(this.op(fns[i]));
		return _ops;
	}
	interpolate(t) {
		t = Num.clamp(t, 0, 1);
		const chunk = this.length - 1;
		const tc = 1 / (this.length - 1);
		const idx = Math.floor(t / tc);
		return Geom.interpolate(this[idx], this[Math.min(this.length - 1, idx + 1)], (t - idx * tc) * chunk);
	}
	moveBy(...args) {
		return this.add(...args);
	}
	moveTo(...args) {
		const d = new Pt(...args).subtract(this[0]);
		this.moveBy(d);
		return this;
	}
	scale(scale, anchor) {
		for (let i = 0, len = this.length; i < len; i++) Geom.scale(this[i], scale, anchor || this[0]);
		return this;
	}
	rotate2D(angle, anchor, axis) {
		for (let i = 0, len = this.length; i < len; i++) Geom.rotate2D(this[i], angle, anchor || this[0], axis);
		return this;
	}
	shear2D(scale, anchor, axis) {
		for (let i = 0, len = this.length; i < len; i++) Geom.shear2D(this[i], scale, anchor || this[0], axis);
		return this;
	}
	reflect2D(line, axis) {
		for (let i = 0, len = this.length; i < len; i++) Geom.reflect2D(this[i], line, axis);
		return this;
	}
	sortByDimension(dim, desc = false) {
		return this.sort((a, b) => desc ? b[dim] - a[dim] : a[dim] - b[dim]);
	}
	forEachPt(ptFn, ...args) {
		if (!this[0][ptFn]) {
			Util.warn(`${ptFn} is not a function of Pt`);
			return this;
		}
		for (let i = 0, len = this.length; i < len; i++) this[i] = this[i][ptFn](...args);
		return this;
	}
	_vecOp(fn, args) {
		const b = args.length === 1 && typeof args[0] == "number" ? args[0] : Util.getPtLike(args);
		for (let i = 0, len = this.length; i < len; i++) fn(this[i], b);
		return this;
	}
	add(...args) {
		return this._vecOp(Vec.add, args);
	}
	subtract(...args) {
		return this._vecOp(Vec.subtract, args);
	}
	multiply(...args) {
		return this._vecOp(Vec.multiply, args);
	}
	divide(...args) {
		return this._vecOp(Vec.divide, args);
	}
	$matrixAdd(g) {
		return Mat.add(this, g);
	}
	$matrixMultiply(g, transposed = false, elementwise = false) {
		return Mat.multiply(this, g, transposed, elementwise);
	}
	zipSlice(index, defaultValue = false) {
		return Mat.zipSlice(this, index, defaultValue);
	}
	$zip(defaultValue = void 0, useLongest = false) {
		return Mat.zip(this, defaultValue, useLongest);
	}
	toBound() {
		return Bound.fromGroup(this);
	}
	toString() {
		return "Group[ " + this.reduce((p, c) => p + c.toString() + " ", "") + " ]";
	}
};
var Bound = class Bound extends Group {
	constructor(...args) {
		super(...args);
		this._center = new Pt();
		this._size = new Pt();
		this._inited = false;
		this.init();
	}
	static fromBoundingRect(rect) {
		const b = new Bound(new Pt(rect.left || 0, rect.top || 0), new Pt(rect.right || 0, rect.bottom || 0));
		if (rect.width && rect.height) b.size = new Pt(rect.width, rect.height);
		return b;
	}
	static fromGroup(g) {
		const _g = Util.iterToArray(g);
		if (_g.length < 2) throw new Error("Cannot create a Bound from a group that has less than 2 Pt");
		return new Bound(_g[0], _g[_g.length - 1]);
	}
	init() {
		if (this.p1) {
			this._size = this.p1.clone();
			this._inited = true;
		}
		if (this.p1 && this.p2) {
			this._updateSize();
			this._inited = true;
		}
	}
	clone() {
		return new Bound(this.topLeft, this.bottomRight);
	}
	_updateSize() {
		const a = this[0];
		const b = this[1];
		const n = b ? b.length : 0;
		if (this._size.length !== n) this._size = new Pt(n);
		for (let i = 0; i < n; i++) this._size[i] = Math.abs(b[i] - (a ? a[i] || 0 : 0));
		this._updateCenter();
	}
	_updateCenter() {
		const a = this[0];
		const n = this._size.length;
		if (this._center.length !== n) this._center = new Pt(n);
		for (let i = 0; i < n; i++) this._center[i] = this._size[i] * .5 + (a ? a[i] || 0 : 0);
	}
	_updatePosFromTop() {
		this.bottomRight = this.topLeft.$add(this._size);
		this._updateCenter();
	}
	_updatePosFromBottom() {
		this.topLeft = this.bottomRight.$subtract(this._size);
		this._updateCenter();
	}
	_updatePosFromCenter() {
		const half = this._size.$multiply(.5);
		const center = this._center;
		this[0] = center.$subtract(half);
		this[1] = center.$add(half);
	}
	get size() {
		return new Pt(this._size);
	}
	set size(p) {
		this._size = new Pt(p);
		this._updatePosFromTop();
	}
	get center() {
		return new Pt(this._center);
	}
	set center(p) {
		this._center = new Pt(p);
		this._updatePosFromCenter();
	}
	get topLeft() {
		return new Pt(this[0]);
	}
	set topLeft(p) {
		this[0] = new Pt(p);
		this._updateSize();
	}
	get bottomRight() {
		return new Pt(this[1]);
	}
	set bottomRight(p) {
		this[1] = new Pt(p);
		this._updateSize();
	}
	get width() {
		return this._size.length > 0 ? this._size.x : 0;
	}
	set width(w) {
		this._size.x = w;
		this._updatePosFromTop();
	}
	get height() {
		return this._size.length > 1 ? this._size.y : 0;
	}
	set height(h) {
		this._size.y = h;
		this._updatePosFromTop();
	}
	get depth() {
		return this._size.length > 2 ? this._size.z : 0;
	}
	set depth(d) {
		this._size.z = d;
		this._updatePosFromTop();
	}
	get x() {
		return this.topLeft.x;
	}
	get y() {
		return this.topLeft.y;
	}
	get z() {
		return this.topLeft.z;
	}
	get inited() {
		return this._inited;
	}
	update() {
		this.topLeft = this[0];
		this.bottomRight = this[1];
		this._updateSize();
		return this;
	}
};

//#endregion
//#region src/UI.ts
const UIShape = {
	rectangle: "rectangle",
	circle: "circle",
	polygon: "polygon",
	polyline: "polyline",
	line: "line"
};
const UIPointerActions = {
	up: "up",
	down: "down",
	move: "move",
	drag: "drag",
	uidrag: "uidrag",
	drop: "drop",
	uidrop: "uidrop",
	over: "over",
	out: "out",
	enter: "enter",
	leave: "leave",
	click: "click",
	keydown: "keydown",
	keyup: "keyup",
	pointerdown: "pointerdown",
	pointerup: "pointerup",
	contextmenu: "contextmenu",
	all: "all"
};
var UI = class UI {
	constructor(group, shape, states = {}, id) {
		this._holds = /* @__PURE__ */ new Map();
		this._group = Group.fromArray(group);
		this._shape = shape;
		this._id = id === void 0 ? `ui_${UI._counter++}` : id;
		this._states = states;
		this._actions = {};
	}
	static fromRectangle(group, states, id) {
		return new this(group, UIShape.rectangle, states, id);
	}
	static fromCircle(group, states, id) {
		return new this(group, UIShape.circle, states, id);
	}
	static fromPolygon(group, states, id) {
		return new this(group, UIShape.polygon, states, id);
	}
	static fromUI(ui, states, id) {
		return new this(ui.group, ui.shape, states || ui._states, id);
	}
	get id() {
		return this._id;
	}
	set id(d) {
		this._id = d;
	}
	get group() {
		return this._group;
	}
	set group(d) {
		this._group = d;
	}
	get shape() {
		return this._shape;
	}
	set shape(d) {
		this._shape = d;
	}
	state(key, value) {
		if (!key) return null;
		if (value !== void 0) {
			this._states[key] = value;
			return this;
		}
		return this._states[key];
	}
	on(type, fn) {
		if (!this._actions[type]) this._actions[type] = [];
		return UI._addHandler(this._actions[type], fn);
	}
	off(type, which) {
		if (!this._actions[type]) return false;
		if (which === void 0) {
			delete this._actions[type];
			return true;
		} else return UI._removeHandler(this._actions[type], which);
	}
	listen(type, p, evt) {
		if (this._actions[type] !== void 0) {
			if (this._within(p) || Array.from(this._holds.values()).indexOf(type) >= 0) {
				UI._trigger(this._actions[type], this, p, type, evt);
				return true;
			} else if (this._actions["all"]) {
				UI._trigger(this._actions["all"], this, p, type, evt);
				return true;
			}
		}
		return false;
	}
	hold(type) {
		let newKey = Math.max(0, ...Array.from(this._holds.keys())) + 1;
		this._holds.set(newKey, type);
		return newKey;
	}
	unhold(key) {
		if (key !== void 0) this._holds.delete(key);
		else this._holds.clear();
	}
	static track(uis, type, p, evt) {
		for (let i = 0, len = uis.length; i < len; i++) uis[i].listen(type, p, evt);
	}
	render(fn) {
		fn(this._group, this._states);
	}
	toString() {
		return `UI ${this.group.toString}`;
	}
	_within(p) {
		let fn = null;
		if (this._shape === UIShape.rectangle) fn = Rectangle.withinBound;
		else if (this._shape === UIShape.circle) fn = Circle.withinBound;
		else if (this._shape === UIShape.polygon) fn = Polygon.hasIntersectPoint;
		else return false;
		return fn(this._group, p);
	}
	static _trigger(fns, target, pt, type, evt) {
		if (fns) {
			for (let i = 0, len = fns.length; i < len; i++) if (fns[i]) fns[i](target, pt, type, evt);
		}
	}
	static _addHandler(fns, fn) {
		if (fn) {
			fns.push(fn);
			return fns.length - 1;
		} else return -1;
	}
	static _removeHandler(fns, index) {
		if (index >= 0 && index < fns.length) {
			let temp = fns.length;
			fns.splice(index, 1);
			return temp > fns.length;
		} else return false;
	}
};
UI._counter = 0;
var UIButton = class extends UI {
	constructor(group, shape, states = {}, id) {
		super(group, shape, states, id);
		this._hoverID = -1;
		if (states.hover === void 0) this._states["hover"] = false;
		if (states.clicks === void 0) this._states["clicks"] = 0;
		const UA = UIPointerActions;
		this.on(UA.up, (target, pt, type, evt) => {
			this.state("clicks", this._states.clicks + 1);
		});
		this.on(UA.move, (target, pt, type, evt) => {
			if (this._within(pt) && !this._states.hover) {
				this.state("hover", true);
				UI._trigger(this._actions[UA.enter], this, pt, UA.enter, evt);
				let _capID = this.hold(UA.move);
				this._hoverID = this.on(UA.move, (t, p) => {
					if (!this._within(p) && !this.state("dragging")) {
						this.state("hover", false);
						UI._trigger(this._actions[UA.leave], this, pt, UA.leave, evt);
						this.off(UA.move, this._hoverID);
						this.unhold(_capID);
					}
				});
			}
		});
	}
	onClick(fn) {
		return this.on(UIPointerActions.up, fn);
	}
	offClick(id) {
		return this.off(UIPointerActions.up, id);
	}
	onContextMenu(fn) {
		return this.on(UIPointerActions.contextmenu, fn);
	}
	offContextMenu(id) {
		return this.off(UIPointerActions.contextmenu, id);
	}
	onHover(enter, leave) {
		let ids = [void 0, void 0];
		if (enter) ids[0] = this.on(UIPointerActions.enter, enter);
		if (leave) ids[1] = this.on(UIPointerActions.leave, leave);
		return ids;
	}
	offHover(enterID, leaveID) {
		let s = [false, false];
		if (enterID === void 0 || enterID >= 0) s[0] = this.off(UIPointerActions.enter, enterID);
		if (leaveID === void 0 || leaveID >= 0) s[1] = this.off(UIPointerActions.leave, leaveID);
		return s;
	}
};
var UIDragger = class extends UIButton {
	constructor(group, shape, states = {}, id) {
		super(group, shape, states, id);
		this._draggingID = -1;
		this._moveHoldID = -1;
		this._dropHoldID = -1;
		this._upHoldID = -1;
		if (states.dragging === void 0) this._states["dragging"] = false;
		if (states.moved === void 0) this._states["moved"] = false;
		if (states.offset === void 0) this._states["offset"] = new Pt();
		const UA = UIPointerActions;
		this.on(UA.down, (target, pt, type, evt) => {
			if (this._moveHoldID === -1) {
				this.state("dragging", true);
				this.state("offset", new Pt(pt).subtract(target.group[0]));
				this._moveHoldID = this.hold(UA.move);
			}
			if (this._dropHoldID === -1) this._dropHoldID = this.hold(UA.drop);
			if (this._upHoldID === -1) this._upHoldID = this.hold(UA.up);
			if (this._draggingID === -1) this._draggingID = this.on(UA.move, (t, p) => {
				if (this.state("dragging")) {
					UI._trigger(this._actions[UA.uidrag], t, p, UA.uidrag, evt);
					this.state("moved", true);
				}
			});
		});
		const endDrag = (target, pt, type, evt) => {
			this.state("dragging", false);
			this.off(UA.move, this._draggingID);
			this._draggingID = -1;
			this.unhold(this._moveHoldID);
			this._moveHoldID = -1;
			this.unhold(this._dropHoldID);
			this._dropHoldID = -1;
			this.unhold(this._upHoldID);
			this._upHoldID = -1;
			if (this.state("moved")) {
				UI._trigger(this._actions[UA.uidrop], target, pt, UA.uidrop, evt);
				this.state("moved", false);
			}
		};
		this.on(UA.drop, endDrag);
		this.on(UA.up, endDrag);
		this.on(UA.out, endDrag);
	}
	onDrag(fn) {
		return this.on(UIPointerActions.uidrag, fn);
	}
	offDrag(id) {
		return this.off(UIPointerActions.uidrag, id);
	}
	onDrop(fn) {
		return this.on(UIPointerActions.uidrop, fn);
	}
	offDrop(id) {
		return this.off(UIPointerActions.uidrop, id);
	}
};

//#endregion
//#region src/Space.ts
var Space = class {
	constructor() {
		this.id = "space";
		this.bound = new Bound();
		this._time = {
			prev: 0,
			diff: 0,
			end: -1,
			min: 0
		};
		this.players = {};
		this.playerCount = 0;
		this._animID = -1;
		this._pause = false;
		this._refresh = void 0;
		this._pointer = new Pt();
		this._isReady = false;
		this._playing = false;
	}
	refresh(b) {
		this._refresh = b;
		return this;
	}
	minFrameTime(ms = 0) {
		this._time.min = ms;
	}
	add(p) {
		const player = typeof p == "function" ? { animate: p } : p;
		const k = this.playerCount++;
		const pid = player.animateID || this.id + k;
		this.players[pid] = player;
		player.animateID = pid;
		if (player.resize && this.bound.inited) player.resize(this.bound);
		if (this._refresh === void 0) this._refresh = true;
		return this;
	}
	remove(player) {
		delete this.players[player.animateID];
		return this;
	}
	removeAll() {
		this.players = {};
		return this;
	}
	play(time = 0) {
		if (time === 0 && this._animID !== -1) return;
		this._animID = requestAnimationFrame(this.play.bind(this));
		if (this._pause) return this;
		this._time.diff = time - this._time.prev;
		if (this._time.diff < this._time.min) return this;
		this._time.prev = time;
		try {
			this.playItems(time);
		} catch (err) {
			cancelAnimationFrame(this._animID);
			this._animID = -1;
			this._playing = false;
			throw err;
		}
		return this;
	}
	replay() {
		this._time.end = -1;
		this.play();
	}
	playItems(time) {
		this._playing = true;
		if (this._refresh) this.clear();
		if (this._isReady) {
			for (const k in this.players) if (this.players[k].animate) this.players[k].animate(time, this._time.diff, this);
		}
		if (this._time.end >= 0 && time > this._time.end) {
			cancelAnimationFrame(this._animID);
			this._animID = -1;
			this._playing = false;
		}
	}
	pause(toggle = false) {
		this._pause = toggle ? !this._pause : true;
		return this;
	}
	resume() {
		this._pause = false;
		return this;
	}
	stop(t = 0) {
		this._time.end = t;
		return this;
	}
	_cancelAnimation() {
		if (this._animID !== -1) cancelAnimationFrame(this._animID);
		this._animID = -1;
		this._playing = false;
		return this;
	}
	playOnce(duration = 0) {
		this.play();
		this.stop(duration);
		return this;
	}
	render(context) {
		if (this._renderFunc) this._renderFunc(context, this);
		return this;
	}
	set customRendering(f) {
		this._renderFunc = f;
	}
	get customRendering() {
		return this._renderFunc;
	}
	get isPlaying() {
		return this._playing;
	}
	get outerBound() {
		return this.bound.clone();
	}
	get innerBound() {
		return new Bound(Pt.make(this.size.length, 0), this.size.clone());
	}
	get size() {
		return this.bound.size.clone();
	}
	get center() {
		return this.size.divide(2);
	}
	get width() {
		return this.bound.width;
	}
	get height() {
		return this.bound.height;
	}
};
var MultiTouchSpace = class extends Space {
	constructor(..._args) {
		super(..._args);
		this._pressed = false;
		this._dragged = false;
		this._hasMouse = false;
		this._hasTouch = false;
		this._hasKeyboard = false;
		this._touchPassive = false;
		this._mouseDownBind = this._mouseDown.bind(this);
		this._mouseUpBind = this._mouseUp.bind(this);
		this._mouseOverBind = this._mouseOver.bind(this);
		this._mouseOutBind = this._mouseOut.bind(this);
		this._mouseMoveBind = this._mouseMove.bind(this);
		this._mouseClickBind = this._mouseClick.bind(this);
		this._contextMenuBind = this._contextMenu.bind(this);
		this._touchStartBind = this._touchStart.bind(this);
		this._touchMoveBind = this._touchMove.bind(this);
		this._keyDownBind = this._keyDown.bind(this);
		this._keyUpBind = this._keyUp.bind(this);
	}
	get pointer() {
		const p = this._pointer.clone();
		p.id = this._pointer.id;
		return p;
	}
	bindCanvas(evt, callback, options = {}, customTarget) {
		(customTarget ? customTarget : this._canvas).addEventListener(evt, callback, options);
	}
	unbindCanvas(evt, callback, options = {}, customTarget) {
		(customTarget ? customTarget : this._canvas).removeEventListener(evt, callback, options);
	}
	bindDoc(evt, callback, options = {}) {
		if (document) document.addEventListener(evt, callback, options);
	}
	unbindDoc(evt, callback, options = {}) {
		if (document) document.removeEventListener(evt, callback, options);
	}
	bindMouse(bind = true, customTarget) {
		if (bind) {
			if (this._hasMouse) {
				if (this._mouseTarget === customTarget) return this;
				this.bindMouse(false);
			}
			this._mouseTarget = customTarget;
			this.bindCanvas("pointerdown", this._mouseDownBind, {}, customTarget);
			this.bindCanvas("pointerup", this._mouseUpBind, {}, customTarget);
			this.bindCanvas("pointerover", this._mouseOverBind, {}, customTarget);
			this.bindCanvas("pointerout", this._mouseOutBind, {}, customTarget);
			this.bindCanvas("pointermove", this._mouseMoveBind, {}, customTarget);
			this.bindCanvas("click", this._mouseClickBind, {}, customTarget);
			this.bindCanvas("contextmenu", this._contextMenuBind, {}, customTarget);
			this._hasMouse = true;
		} else if (this._hasMouse) {
			const target = this._mouseTarget;
			this.unbindCanvas("pointerdown", this._mouseDownBind, {}, target);
			this.unbindCanvas("pointerup", this._mouseUpBind, {}, target);
			this.unbindCanvas("pointerover", this._mouseOverBind, {}, target);
			this.unbindCanvas("pointerout", this._mouseOutBind, {}, target);
			this.unbindCanvas("pointermove", this._mouseMoveBind, {}, target);
			this.unbindCanvas("click", this._mouseClickBind, {}, target);
			this.unbindCanvas("contextmenu", this._contextMenuBind, {}, target);
			this._hasMouse = false;
			this._mouseTarget = void 0;
		}
		return this;
	}
	bindTouch(bind = true, passive = false, customTarget) {
		if (bind) {
			if (this._hasTouch) {
				if (this._touchTarget === customTarget && this._touchPassive === passive) return this;
				this.bindTouch(false);
			}
			this._touchTarget = customTarget;
			this._touchPassive = passive;
			this.bindCanvas("touchstart", this._touchStartBind, { passive }, customTarget);
			this.bindCanvas("touchend", this._mouseUpBind, {}, customTarget);
			this.bindCanvas("touchmove", this._touchMoveBind, { passive }, customTarget);
			this.bindCanvas("touchcancel", this._mouseOutBind, {}, customTarget);
			this._hasTouch = true;
		} else if (this._hasTouch) {
			const target = this._touchTarget;
			const options = { passive: this._touchPassive };
			this.unbindCanvas("touchstart", this._touchStartBind, options, target);
			this.unbindCanvas("touchend", this._mouseUpBind, {}, target);
			this.unbindCanvas("touchmove", this._touchMoveBind, options, target);
			this.unbindCanvas("touchcancel", this._mouseOutBind, {}, target);
			this._hasTouch = false;
			this._touchTarget = void 0;
		}
		return this;
	}
	bindKeyboard(bind = true, customTarget) {
		if (bind) {
			const target = customTarget || document;
			if (this._hasKeyboard) {
				if (this._keyboardTarget === target) return this;
				this.bindKeyboard(false);
			}
			target.addEventListener("keydown", this._keyDownBind, {});
			target.addEventListener("keyup", this._keyUpBind, {});
			this._keyboardTarget = target;
			this._hasKeyboard = true;
		} else if (this._hasKeyboard) {
			this._keyboardTarget.removeEventListener("keydown", this._keyDownBind, {});
			this._keyboardTarget.removeEventListener("keyup", this._keyUpBind, {});
			this._keyboardTarget = void 0;
			this._hasKeyboard = false;
		}
		return this;
	}
	_unbindAll() {
		this.bindMouse(false);
		this.bindTouch(false);
		this.bindKeyboard(false);
		return this;
	}
	touchesToPoints(evt, which = "touches") {
		if (!evt || !evt[which]) return [];
		const ts = [];
		for (let i = 0; i < evt[which].length; i++) {
			const t = evt[which].item(i);
			ts.push(new Pt(t.pageX - this.bound.topLeft.x, t.pageY - this.bound.topLeft.y));
		}
		return ts;
	}
	_mouseAction(type, evt) {
		if (!this.isPlaying) return;
		let px = 0, py = 0;
		if (evt instanceof MouseEvent) {
			for (const k in this.players) if (this.players.hasOwnProperty(k)) {
				const v = this.players[k];
				px = evt.pageX - this.outerBound.x;
				py = evt.pageY - this.outerBound.y;
				if (v.action) v.action(type, px, py, evt);
			}
		} else for (const k in this.players) if (this.players.hasOwnProperty(k)) {
			const v = this.players[k];
			const c = evt.changedTouches && evt.changedTouches.length > 0;
			const touch = evt.changedTouches.item(0);
			px = c ? touch.pageX - this.outerBound.x : 0;
			py = c ? touch.pageY - this.outerBound.y : 0;
			if (v.action) v.action(type, px, py, evt);
		}
		if (type) {
			this._pointer.to(px, py);
			this._pointer.id = type;
		}
	}
	_mouseDown(evt) {
		this._mouseAction(UIPointerActions.down, evt);
		this._mouseAction(UIPointerActions.pointerdown, evt);
		this._pressed = true;
		if (evt.target instanceof Element) evt.target.setPointerCapture(evt.pointerId);
		return false;
	}
	_mouseUp(evt) {
		this._mouseAction(UIPointerActions.pointerup, evt);
		if (this._dragged) this._mouseAction(UIPointerActions.drop, evt);
		else this._mouseAction(UIPointerActions.up, evt);
		this._pressed = false;
		this._dragged = false;
		if (evt.target instanceof Element) evt.target.releasePointerCapture(evt.pointerId);
		return false;
	}
	_mouseMove(evt) {
		if (this._pressed) {
			this._dragged = true;
			this._mouseAction(UIPointerActions.drag, evt);
		} else this._mouseAction(UIPointerActions.move, evt);
		return false;
	}
	_mouseOver(evt) {
		this._mouseAction(UIPointerActions.over, evt);
		return false;
	}
	_mouseOut(evt) {
		this._mouseAction(UIPointerActions.out, evt);
		if (this._dragged) this._mouseAction(UIPointerActions.drop, evt);
		this._dragged = false;
		return false;
	}
	_mouseClick(evt) {
		this._mouseAction(UIPointerActions.click, evt);
		this._pressed = false;
		this._dragged = false;
		return false;
	}
	_contextMenu(evt) {
		this._mouseAction(UIPointerActions.contextmenu, evt);
		return false;
	}
	_touchMove(evt) {
		this._mouseAction(UIPointerActions.move, evt);
		if (this._pressed) {
			this._dragged = true;
			this._mouseAction(UIPointerActions.drag, evt);
		}
		evt.preventDefault();
		return false;
	}
	_touchStart(evt) {
		this._mouseAction(UIPointerActions.down, evt);
		this._pressed = true;
		return false;
	}
	_keyDown(evt) {
		this._keyboardAction(UIPointerActions.keydown, evt);
		return false;
	}
	_keyUp(evt) {
		this._keyboardAction(UIPointerActions.keyup, evt);
		return false;
	}
	_keyboardAction(type, evt) {
		if (!this.isPlaying) return;
		for (const k in this.players) if (this.players.hasOwnProperty(k)) {
			const v = this.players[k];
			if (v.action) v.action(type, evt.shiftKey ? 1 : 0, evt.altKey ? 1 : 0, evt);
		}
	}
};

//#endregion
//#region src/Form.ts
var Form = class {
	constructor() {
		this._ready = false;
	}
	get ready() {
		return this._ready;
	}
};
var VisualForm = class extends Form {
	constructor(..._args) {
		super(..._args);
		this._filled = true;
		this._stroked = true;
		this._font = new Font(14, "sans-serif");
	}
	get filled() {
		return this._filled;
	}
	set filled(b) {
		this._filled = b;
	}
	get stroked() {
		return this._stroked;
	}
	set stroked(b) {
		this._stroked = b;
	}
	get currentFont() {
		return this._font;
	}
	_multiple(groups, shape, ...rest) {
		if (!groups) return this;
		for (let i = 0, len = groups.length; i < len; i++) this[shape](groups[i], ...rest);
		return this;
	}
	alpha(a) {
		return this;
	}
	fill(c) {
		return this;
	}
	fillOnly(c) {
		this.stroke(false);
		return this.fill(c);
	}
	stroke(c, width, linejoin, linecap) {
		return this;
	}
	strokeOnly(c, width, linejoin, linecap) {
		this.fill(false);
		return this.stroke(c, width, linejoin, linecap);
	}
	points(pts, radius, shape) {
		if (!pts) return;
		for (let i = 0, len = pts.length; i < len; i++) this.point(pts[i], radius, shape);
		return this;
	}
	circles(groups) {
		return this._multiple(groups, "circle");
	}
	squares(groups) {
		return this._multiple(groups, "square");
	}
	lines(groups) {
		return this._multiple(groups, "line");
	}
	polygons(groups) {
		return this._multiple(groups, "polygon");
	}
	rects(groups) {
		return this._multiple(groups, "rect");
	}
};
var Font = class {
	constructor(size = 12, face = "sans-serif", weight = "", style = "", lineHeight = 1.5) {
		this.size = size;
		this.face = face;
		this.style = style;
		this.weight = weight;
		this.lineHeight = lineHeight;
	}
	get value() {
		return `${this.style} ${this.weight} ${this.size}px/${this.lineHeight} ${this.face}`;
	}
	toString() {
		return this.value;
	}
};

//#endregion
//#region src/Typography.ts
var Typography = class {
	static textWidthEstimator(fn, samples = [
		"M",
		"n",
		"."
	], distribution = [
		.06,
		.8,
		.14
	]) {
		let m = samples.map(fn);
		let avg = new Pt(distribution).dot(m);
		return (str) => str.length * avg;
	}
	static truncate(fn, str, width, tail = "") {
		let trim = Math.floor(str.length * Math.min(1, width / fn(str)));
		if (trim < str.length) {
			trim = Math.max(0, trim - tail.length);
			return [str.substr(0, trim) + tail, trim];
		} else return [str, str.length];
	}
	static fontSizeToBox(box, ratio = 1, byHeight = true) {
		let bound = Bound.fromGroup(box);
		let h = byHeight ? bound.height : bound.width;
		let f = ratio * h;
		return function(box2) {
			let bound2 = Bound.fromGroup(box2);
			let nh = (byHeight ? bound2.height : bound2.width) / h;
			return f * nh;
		};
	}
	static fontSizeToThreshold(threshold, direction = 0) {
		return function(defaultSize, val) {
			let d = defaultSize * val / threshold;
			if (direction < 0) return Math.min(d, defaultSize);
			if (direction > 0) return Math.max(d, defaultSize);
			return d;
		};
	}
};

//#endregion
//#region \0@oxc-project+runtime@0.143.0/helpers/esm/asyncToGenerator.js
function asyncGeneratorStep(n, t, e, r, o, a, c) {
	try {
		var i = n[a](c), u = i.value;
	} catch (n) {
		e(n);
		return;
	}
	i.done ? t(u) : Promise.resolve(u).then(r, o);
}
function _asyncToGenerator(n) {
	return function() {
		var t = this, e = arguments;
		return new Promise(function(r, o) {
			var a = n.apply(t, e);
			function _next(n) {
				asyncGeneratorStep(a, r, o, _next, _throw, "next", n);
			}
			function _throw(n) {
				asyncGeneratorStep(a, r, o, _next, _throw, "throw", n);
			}
			_next(void 0);
		});
	};
}

//#endregion
//#region src/Image.ts
var Img = class Img {
	constructor(editable = false, space, crossOrigin) {
		var _opts$pixelScale;
		this._scale = 1;
		this._loaded = false;
		this._pendingLoadReject = null;
		this._dataDirty = false;
		const opts = typeof editable === "object" ? editable : {
			editable,
			space,
			crossOrigin
		};
		this._editable = !!opts.editable;
		this._space = opts.space;
		this._scale = (_opts$pixelScale = opts.pixelScale) !== null && _opts$pixelScale !== void 0 ? _opts$pixelScale : this._space ? this._space.pixelScale : 1;
		this._img = new Image();
		if (opts.crossOrigin) this._img.crossOrigin = "Anonymous";
	}
	static load(src, editable = false, space, ready) {
		return new Img(editable, space).load(src).then((res) => {
			if (ready) ready(res);
			return res;
		});
	}
	static loadAsync(src, editable = false, space) {
		return _asyncToGenerator(function* () {
			return Img.load(src, editable, space);
		})();
	}
	static loadPattern(src, space, repeat = "repeat", editable = false) {
		return _asyncToGenerator(function* () {
			return (yield Img.loadAsync(src, editable, space)).pattern(repeat);
		})();
	}
	static blank(size, space, scale) {
		let img = new Img(true, space);
		const s = scale ? scale : space ? space.pixelScale : 1;
		img.initCanvas(size[0], size[1], s);
		return img;
	}
	load(src) {
		if (this._editable && typeof document === "undefined") return Promise.reject(/* @__PURE__ */ new Error("Cannot create html canvas element. document not found."));
		return this._loadImageSrc(src).then(() => {
			if (this._editable) {
				if (!this._cv) this._cv = document.createElement("canvas");
				this._drawToScale(this._scale, this._img);
				this._dataDirty = true;
			}
			this._loaded = true;
			return this;
		});
	}
	_loadImageSrc(src) {
		return new Promise((resolve, reject) => {
			if (this._pendingLoadReject) this._pendingLoadReject(/* @__PURE__ */ new Error("Img loading superseded by a newer load"));
			this._pendingLoadReject = reject;
			this._img.onload = () => {
				this._pendingLoadReject = null;
				resolve();
			};
			this._img.onerror = () => {
				this._pendingLoadReject = null;
				reject(/* @__PURE__ */ new Error(`Img cannot load ${src}`));
			};
			this._img.src = src;
		});
	}
	_refreshData() {
		this._data = this._ctx.getImageData(0, 0, this._cv.width, this._cv.height);
		this._dataDirty = false;
	}
	_ensureData() {
		if ((this._dataDirty || !this._data) && this._ctx && this._cv) this._refreshData();
	}
	_drawToScale(canvasScale, img) {
		const nw = img.width;
		const nh = img.height;
		this._initCanvas(nw, nh, canvasScale);
		if (img) this._ctx.drawImage(img, 0, 0, nw, nh, 0, 0, this._cv.width, this._cv.height);
	}
	initCanvas(width, height, canvasScale = 1) {
		this._initCanvas(width, height, canvasScale);
	}
	_initCanvas(width, height, canvasScale = 1) {
		if (!this._editable) {
			Util.warn("Cannot initiate canvas because this Img is not set to be editable");
			return;
		}
		if (!this._cv) this._cv = document.createElement("canvas");
		const cms = typeof canvasScale === "number" ? [canvasScale, canvasScale] : canvasScale;
		this._cv.width = width * cms[0];
		this._cv.height = height * cms[1];
		this._ctx = this._cv.getContext("2d", { willReadFrequently: true });
		CanvasForm.resetStyleCache(this._ctx);
		if (typeof canvasScale === "number") this._scale = canvasScale;
		this._dataDirty = true;
		this._loaded = true;
	}
	bitmap(size) {
		const w = size ? size[0] : this._cv.width;
		const h = size ? size[1] : this._cv.height;
		return createImageBitmap(this._cv, 0, 0, w, h);
	}
	pattern(reptition = "repeat", dynamic = false) {
		let ctx = this._space ? this._space.ctx : void 0;
		if (!ctx) {
			if (!this._patternCtx) this._patternCtx = document.createElement("canvas").getContext("2d");
			ctx = this._patternCtx;
		}
		return ctx.createPattern(dynamic ? this._cv : this._img, reptition);
	}
	sync() {
		var _this = this;
		return _asyncToGenerator(function* () {
			let source = _this._cv;
			if (_this._scale !== 1) {
				source = document.createElement("canvas");
				source.width = _this._cv.width / _this._scale;
				source.height = _this._cv.height / _this._scale;
				source.getContext("2d").drawImage(_this._cv, 0, 0, _this._cv.width, _this._cv.height, 0, 0, source.width, source.height);
			}
			const blob = yield new Promise((resolve, reject) => {
				source.toBlob((b) => b ? resolve(b) : reject(/* @__PURE__ */ new Error("Img cannot export canvas to blob")));
			});
			const url = URL.createObjectURL(blob);
			_this._objectUrl = url;
			try {
				yield _this._loadImageSrc(url);
				_this._loaded = true;
			} finally {
				URL.revokeObjectURL(url);
				_this._objectUrl = null;
			}
			return _this;
		})();
	}
	pixel(p, rescale = true) {
		this._ensureData();
		if (!this._data) {
			Util.warn("Img has no pixel data — create it as editable and wait for load");
			return new Pt(0, 0, 0, 0);
		}
		const s = typeof rescale == "number" ? rescale : rescale ? this._scale : 1;
		return Img.getPixel(this._data, [p[0] * s, p[1] * s]);
	}
	setPixel(p, rgba, rescale = true) {
		this._ensureData();
		if (!this._data) {
			Util.warn("Img has no pixel data — create it as editable");
			return this;
		}
		const s = typeof rescale == "number" ? rescale : rescale ? this._scale : 1;
		const x = Math.floor(p[0] * s);
		const y = Math.floor(p[1] * s);
		if (x < 0 || y < 0 || x >= this._data.width || y >= this._data.height) return this;
		const i = y * this._data.width * 4 + x * 4;
		this._data.data[i] = rgba[0];
		this._data.data[i + 1] = rgba[1];
		this._data.data[i + 2] = rgba[2];
		this._data.data[i + 3] = rgba[3] !== void 0 ? rgba[3] : 255;
		return this;
	}
	loadPixels() {
		if (!this._ctx) {
			Util.warn("Img has no canvas — create it as editable");
			return this;
		}
		this._refreshData();
		return this;
	}
	updatePixels() {
		if (!this._ctx || !this._data) {
			Util.warn("Img has no canvas — create it as editable");
			return this;
		}
		this._ctx.putImageData(this._data, 0, 0);
		this._dataDirty = false;
		return this;
	}
	static getPixel(imgData, p) {
		const out = new Pt(4);
		if (p[0] < 0 || p[1] < 0 || p[0] >= imgData.width || p[1] >= imgData.height) return out;
		const i = Math.floor(p[1]) * (imgData.width * 4) + Math.floor(p[0]) * 4;
		const d = imgData.data;
		if (i > d.length - 4) return out;
		out[0] = d[i];
		out[1] = d[i + 1];
		out[2] = d[i + 2];
		out[3] = d[i + 3];
		return out;
	}
	resize(sizeOrScale, asScale = false) {
		const hasImage = this._img.naturalWidth > 0;
		const refW = hasImage ? this._img.naturalWidth : this._cv.width;
		const refH = hasImage ? this._img.naturalHeight : this._cv.height;
		if (!refW || !refH) {
			Util.warn("Img cannot resize before an image or canvas exists");
			return this;
		}
		const s = asScale ? sizeOrScale : [sizeOrScale[0] / refW, sizeOrScale[1] / refH];
		let source = this._img;
		if (!hasImage) {
			const snap = document.createElement("canvas");
			snap.width = this._cv.width;
			snap.height = this._cv.height;
			snap.getContext("2d").drawImage(this._cv, 0, 0);
			source = snap;
		}
		this._drawToScale(s, source);
		this._dataDirty = true;
		return this;
	}
	crop(box) {
		const s = this._scale;
		return this._ctx.getImageData(box[0][0] * s, box[0][1] * s, box.width * s, box.height * s);
	}
	filter(css) {
		const op = this._ctx.globalCompositeOperation;
		this._ctx.globalCompositeOperation = "copy";
		this._ctx.filter = css;
		this._ctx.drawImage(this._cv, 0, 0);
		this._ctx.filter = "none";
		this._ctx.globalCompositeOperation = op;
		this._dataDirty = true;
		return this;
	}
	dispose() {
		if (this._objectUrl) {
			URL.revokeObjectURL(this._objectUrl);
			this._objectUrl = null;
		}
		if (this._cv) this._cv.remove();
		if (this._img) this._img.remove();
		this._cv = null;
		this._ctx = null;
		this._patternCtx = null;
		this._img = null;
		this._data = null;
		this._loaded = false;
		return this;
	}
	cleanup() {
		this.dispose();
	}
	static fromBlob(blob, editable = false, space) {
		const url = URL.createObjectURL(blob);
		const img = new Img(editable, space);
		img._objectUrl = url;
		const done = () => {
			URL.revokeObjectURL(url);
			img._objectUrl = null;
		};
		return img.load(url).then((res) => {
			done();
			return res;
		}, (err) => {
			done();
			throw err;
		});
	}
	static imageDataToBlob(data) {
		return new Promise(function(resolve, reject) {
			if (typeof document === "undefined") {
				reject(/* @__PURE__ */ new Error("Cannot create html canvas element. document not found."));
				return;
			}
			let cv = document.createElement("canvas");
			cv.width = data.width;
			cv.height = data.height;
			cv.getContext("2d").putImageData(data, 0, 0);
			cv.toBlob((blob) => {
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
			this._cv.toBlob((blob) => resolve(blob));
		});
	}
	getForm() {
		if (!this._editable) Util.warn("Cannot get a CanvasForm because this Img is not editable");
		return this._ctx ? new CanvasForm(this._ctx) : void 0;
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
		this._ensureData();
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
		if (!this._img || !this._img.width || !this._img.height) return this._cv ? this.canvasSize.$divide(this._scale) : new Pt(0, 0);
		else return new Pt(this._img.width, this._img.height);
	}
	get canvasSize() {
		return new Pt(this._cv.width, this._cv.height);
	}
	get scaledMatrix() {
		const s = 1 / this._scale;
		return new Mat().scale2D([s, s]);
	}
};

//#endregion
//#region src/Canvas.ts
var CanvasSpace = class extends MultiTouchSpace {
	constructor(elem, callback) {
		super();
		this._pixelScale = 1;
		this._bgcolor = "#e1e9f0";
		this._offscreen = false;
		this._autoResize = true;
		this._initialResize = false;
		this._disposed = false;
		let _selector = null;
		let _existed = false;
		this.id = Util.uniqueId();
		if (elem instanceof Element) {
			_selector = elem;
			this.id = _selector.id || this.id;
		} else {
			let id = elem;
			id = elem[0] === "#" || elem[0] === "." ? elem : "#" + elem;
			_selector = document.querySelector(id);
			this.id = id.substr(1);
		}
		if (!_selector) {
			this._container = this._createElement("div", this.id + "_container");
			this._canvas = this._createElement("canvas", this.id);
			document.body.appendChild(this._container);
		} else if (_selector.nodeName.toLowerCase() != "canvas") {
			this._container = _selector;
			this._canvas = this._createElement("canvas", this.id + "_canvas");
			this._initialResize = true;
		} else {
			this._canvas = _selector;
			this._container = _selector.parentElement;
			this._autoResize = false;
			_existed = true;
		}
		this._ctx = this._canvas.getContext("2d");
		if (!_existed) {
			this._readyObserver = new MutationObserver((mutations) => {
				mutations.forEach((mutation) => {
					if (mutation.type === "childList" && mutation.addedNodes.length) {
						for (let node of mutation.addedNodes) if (node === this._canvas) {
							var _this$_readyObserver;
							this._ready(callback);
							(_this$_readyObserver = this._readyObserver) === null || _this$_readyObserver === void 0 || _this$_readyObserver.disconnect();
							this._readyObserver = void 0;
							return;
						}
					}
				});
			});
			this._readyObserver.observe(this._container, { childList: true });
			this._container.appendChild(this._canvas);
		} else this._readyTimer = window.setTimeout(() => this._ready(callback), 100);
	}
	_createElement(elem = "div", id) {
		const d = document.createElement(elem);
		d.setAttribute("id", id);
		return d;
	}
	_ready(callback) {
		if (this._disposed) return;
		this._readyTimer = void 0;
		if (!this._container) throw new Error(`Cannot initiate #${this.id} element`);
		this._isReady = true;
		this._resizeHandler(null);
		this.clear(this._bgcolor);
		this._canvas.dispatchEvent(new Event("ready"));
		for (const k in this.players) if (this.players.hasOwnProperty(k)) {
			if (this.players[k].start) this.players[k].start(this.bound.clone(), this);
		}
		this._pointer = this.center;
		this._initialResize = false;
		if (callback) callback(this.bound, this._canvas);
	}
	setup(opt) {
		this._bgcolor = opt.bgcolor ? opt.bgcolor : "transparent";
		this.autoResize = opt.resize != void 0 ? opt.resize : false;
		if (opt.retina !== false) {
			const r1 = window ? window.devicePixelRatio || 1 : 1;
			this._pixelScale = Math.max(1, r1);
		}
		if (opt.offscreen) {
			this._offscreen = true;
			this._offCanvas = this._createElement("canvas", this.id + "_offscreen");
			this._offCtx = this._offCanvas.getContext("2d");
		} else this._offscreen = false;
		if (opt.pixelDensity) this._pixelScale = opt.pixelDensity;
		return this;
	}
	set autoResize(auto) {
		if (this._autoResize === auto && (!auto || this._resizeObserver)) return;
		if (this._resizeObserver) {
			this._resizeObserver.disconnect();
			this._resizeObserver = void 0;
		}
		this._autoResize = auto;
		if (auto) {
			this._resizeObserver = new ResizeObserver((entries) => {
				this._resizeHandler(null);
			});
			this._resizeObserver.observe(this._container);
		}
	}
	get autoResize() {
		return this._autoResize;
	}
	resize(b, evt) {
		this.bound = b;
		this._canvas.width = Math.ceil(this.bound.size.x) * this._pixelScale;
		this._canvas.height = Math.ceil(this.bound.size.y) * this._pixelScale;
		this._canvas.style.width = this.bound.size.x + "px";
		this._canvas.style.height = this.bound.size.y + "px";
		if (this._offscreen) {
			this._offCanvas.width = Math.ceil(this.bound.size.x) * this._pixelScale;
			this._offCanvas.height = Math.ceil(this.bound.size.y) * this._pixelScale;
		}
		if (this._pixelScale != 1) {
			this._ctx.scale(this._pixelScale, this._pixelScale);
			if (this._offscreen) this._offCtx.scale(this._pixelScale, this._pixelScale);
		}
		CanvasForm.resetStyleCache(this._ctx);
		if (this._offscreen) CanvasForm.resetStyleCache(this._offCtx);
		for (const k in this.players) if (this.players.hasOwnProperty(k)) {
			const p = this.players[k];
			if (p.resize) p.resize(this.bound, evt);
		}
		this.render(this._ctx);
		if (evt && !this.isPlaying) this.playOnce(0);
		return this;
	}
	_resizeHandler(evt) {
		const b = this._autoResize || this._initialResize ? this._container.getBoundingClientRect() : this._canvas.getBoundingClientRect();
		if (b) {
			var _window, _window2;
			const box = Bound.fromBoundingRect(b);
			box.center = box.center.add(((_window = window) === null || _window === void 0 ? void 0 : _window.scrollX) || 0, ((_window2 = window) === null || _window2 === void 0 ? void 0 : _window2.scrollY) || 0);
			this.resize(box, evt);
		}
	}
	set background(bg) {
		this._bgcolor = bg;
	}
	get background() {
		return this._bgcolor;
	}
	get pixelScale() {
		return this._pixelScale;
	}
	get hasOffscreen() {
		return this._offscreen;
	}
	get offscreenCtx() {
		return this._offCtx;
	}
	get offscreenCanvas() {
		return this._offCanvas;
	}
	getForm() {
		return new CanvasForm(this);
	}
	get element() {
		return this._canvas;
	}
	get parent() {
		return this._container;
	}
	get ready() {
		return this._isReady;
	}
	get ctx() {
		return this._ctx;
	}
	clear(bg) {
		if (bg) this._bgcolor = bg;
		const lastColor = this._ctx.fillStyle;
		const px = Math.ceil(this.pixelScale);
		if (!this._bgcolor || this._bgcolor === "transparent") this._ctx.clearRect(-px, -px, this._canvas.width + px, this._canvas.height + px);
		else {
			if (this._bgcolor.indexOf("rgba") === 0 || this._bgcolor.length === 9 && this._bgcolor.indexOf("#") === 0) this._ctx.clearRect(-px, -px, this._canvas.width + px, this._canvas.height + px);
			this._ctx.fillStyle = this._bgcolor;
			this._ctx.fillRect(-px, -px, this._canvas.width + px, this._canvas.height + px);
		}
		this._ctx.fillStyle = lastColor;
		return this;
	}
	clearOffscreen(bg) {
		if (this._offscreen) {
			const px = Math.ceil(this.pixelScale);
			if (bg) {
				this._offCtx.fillStyle = bg;
				this._offCtx.fillRect(-px, -px, this._canvas.width + px, this._canvas.height + px);
			} else this._offCtx.clearRect(-px, -px, this._offCanvas.width + px, this._offCanvas.height + px);
		}
		return this;
	}
	playItems(time) {
		if (this._isReady) {
			this._ctx.save();
			if (this._offscreen) this._offCtx.save();
			super.playItems(time);
			this._ctx.restore();
			if (this._offscreen) this._offCtx.restore();
			CanvasForm.resetStyleCache(this._ctx);
			if (this._offscreen) CanvasForm.resetStyleCache(this._offCtx);
			this.render(this._ctx);
		}
	}
	dispose() {
		if (this._disposed) return this;
		this._disposed = true;
		if (this._readyTimer !== void 0) {
			window.clearTimeout(this._readyTimer);
			this._readyTimer = void 0;
		}
		if (this._readyObserver) {
			this._readyObserver.disconnect();
			this._readyObserver = void 0;
		}
		if (this._resizeObserver) {
			this._resizeObserver.disconnect();
			this._resizeObserver = void 0;
		}
		this._unbindAll();
		this._cancelAnimation();
		this.removeAll();
		this._isReady = false;
		return this;
	}
	recorder(downloadOrCallback, filetype = "webm", bitrate = 15e6) {
		const stream = this._canvas.captureStream();
		const recorder = new MediaRecorder(stream, {
			mimeType: `video/${filetype}`,
			bitsPerSecond: bitrate
		});
		recorder.ondataavailable = function(d) {
			const url = URL.createObjectURL(new Blob([d.data], { type: `video/${filetype}` }));
			if (typeof downloadOrCallback === "function") downloadOrCallback(url);
			else if (downloadOrCallback) {
				const a = document.createElement("a");
				a.href = url;
				a.download = `canvas_video.${filetype}`;
				a.click();
				a.remove();
			}
		};
		return recorder;
	}
};
const _ctxStyleCache = /* @__PURE__ */ new WeakMap();
var CanvasForm = class CanvasForm extends VisualForm {
	_cacheForCtx() {
		if (this._styleCacheCtx !== this._ctx) {
			let cache = _ctxStyleCache.get(this._ctx);
			if (!cache) {
				cache = {};
				_ctxStyleCache.set(this._ctx, cache);
			}
			this._styleCache = cache;
			this._styleCacheCtx = this._ctx;
		}
		return this._styleCache;
	}
	static resetStyleCache(ctx) {
		const cache = _ctxStyleCache.get(ctx);
		if (cache) for (const k in cache) delete cache[k];
	}
	_set(key, value) {
		const cache = this._cacheForCtx();
		if (cache[key] !== value) {
			cache[key] = value;
			this._ctx[key] = value;
		}
	}
	constructor(space) {
		super();
		this._styleCache = null;
		this._styleCacheCtx = null;
		this._style = {
			fillStyle: "#f03",
			strokeStyle: "#fff",
			lineWidth: 1,
			lineJoin: "bevel",
			lineCap: "butt",
			globalAlpha: 1
		};
		if (!space) return this;
		const _setup = (ctx) => {
			this._ctx = ctx;
			this._set("fillStyle", this._style.fillStyle);
			this._set("strokeStyle", this._style.strokeStyle);
			this._set("lineJoin", "bevel");
			this._set("font", this._font.value);
			this._ready = true;
		};
		if (space instanceof CanvasSpace) {
			this._space = space;
			if (this._space.ready && this._space.ctx) _setup(this._space.ctx);
			else this._space.add({ start: () => {
				_setup(this._space.ctx);
			} });
		} else _setup(space);
	}
	get space() {
		return this._space;
	}
	get ctx() {
		return this._ctx;
	}
	useOffscreen(off = true, clear = false) {
		if (clear) this._space.clearOffscreen(typeof clear == "string" ? clear : null);
		this._ctx = this._space.hasOffscreen && off ? this._space.offscreenCtx : this._space.ctx;
		return this;
	}
	renderOffscreen(offset = [0, 0]) {
		if (this._space.hasOffscreen) this._space.ctx.drawImage(this._space.offscreenCanvas, offset[0], offset[1], this._space.width, this._space.height);
	}
	alpha(a) {
		this._set("globalAlpha", a);
		this._style.globalAlpha = a;
		return this;
	}
	fill(c) {
		if (typeof c == "boolean") this.filled = c;
		else {
			this.filled = true;
			this._style.fillStyle = c;
			this._set("fillStyle", c);
		}
		return this;
	}
	fillOnly(c) {
		this.stroke(false);
		return this.fill(c);
	}
	stroke(c, width, linejoin, linecap) {
		if (typeof c == "boolean") this.stroked = c;
		else {
			this.stroked = true;
			this._style.strokeStyle = c;
			this._set("strokeStyle", c);
			if (width) {
				this._set("lineWidth", width);
				this._style.lineWidth = width;
			}
			if (linejoin) {
				this._set("lineJoin", linejoin);
				this._style.lineJoin = linejoin;
			}
			if (linecap) {
				this._set("lineCap", linecap);
				this._style.lineCap = linecap;
			}
		}
		return this;
	}
	strokeOnly(c, width, linejoin, linecap) {
		this.fill(false);
		return this.stroke(c, width, linejoin, linecap);
	}
	applyFillStroke(filled = true, stroked = true, strokeWidth = 1) {
		if (filled) {
			if (typeof filled === "string") this.fill(filled);
			this._ctx.fill();
		}
		if (stroked) {
			if (typeof stroked === "string") this.stroke(stroked, strokeWidth);
			this._ctx.stroke();
		}
		return this;
	}
	gradient(stops) {
		const vals = [];
		if (stops.length < 2) stops.push([.99, "#000"], [1, "#000"]);
		for (let i = 0, len = stops.length; i < len; i++) {
			const t = typeof stops[i] === "string" ? i * (1 / (stops.length - 1)) : stops[i][0];
			const v = typeof stops[i] === "string" ? stops[i] : stops[i][1];
			vals.push([t, v]);
		}
		return (area1, area2) => {
			const grad = area2 ? this._ctx.createRadialGradient(area1[0][0], area1[0][1], Math.abs(area1[1][0]), area2[0][0], area2[0][1], Math.abs(area2[1][0])) : this._ctx.createLinearGradient(area1[0][0], area1[0][1], area1[1][0], area1[1][1]);
			for (let i = 0, len = vals.length; i < len; i++) grad.addColorStop(vals[i][0], vals[i][1]);
			return grad;
		};
	}
	composite(mode = "source-over") {
		this._set("globalCompositeOperation", mode);
		return this;
	}
	clip() {
		this._ctx.clip();
		return this;
	}
	dash(segments = true, offset = 0) {
		const cache = this._cacheForCtx();
		if (!segments) {
			if (cache.dash !== "/0") {
				cache.dash = "/0";
				this._ctx.setLineDash([]);
				this._ctx.lineDashOffset = 0;
			}
		} else {
			if (segments === true) segments = [5, 5];
			const key = `${segments[0]},${segments[1]}/${offset}`;
			if (cache.dash !== key) {
				cache.dash = key;
				this._ctx.setLineDash([segments[0], segments[1]]);
				this._ctx.lineDashOffset = offset;
			}
		}
		return this;
	}
	font(sizeOrFont, weight, style, lineHeight, family) {
		if (typeof sizeOrFont == "number") {
			this._font.size = sizeOrFont;
			if (family) this._font.face = family;
			if (weight) this._font.weight = weight;
			if (style) this._font.style = style;
			if (lineHeight) this._font.lineHeight = lineHeight;
		} else this._font = sizeOrFont;
		this._set("font", this._font.value);
		if (this._estimateTextWidth) this.fontWidthEstimate(true);
		return this;
	}
	fontWidthEstimate(estimate = true) {
		this._estimateTextWidth = estimate ? Typography.textWidthEstimator((c) => this._ctx.measureText(c).width) : void 0;
		return this;
	}
	getTextWidth(c) {
		return !this._estimateTextWidth ? this._ctx.measureText(c + " .").width : this._estimateTextWidth(c);
	}
	_textTruncate(str, width, tail = "") {
		return Typography.truncate(this.getTextWidth.bind(this), str, width, tail);
	}
	_textAlign(box, vertical, offset, center) {
		const _box = Util.iterToArray(box);
		if (!Util.arrayCheck(_box)) return;
		if (!center) center = Rectangle.center(_box);
		let px = _box[0][0];
		if (this._ctx.textAlign == "end" || this._ctx.textAlign == "right") px = _box[1][0];
		else if (this._ctx.textAlign == "center" || this._ctx.textAlign == "middle") px = center[0];
		let py = center[1];
		if (vertical == "top" || vertical == "start") py = _box[0][1];
		else if (vertical == "end" || vertical == "bottom") py = _box[1][1];
		return offset ? new Pt(px + offset[0], py + offset[1]) : new Pt(px, py);
	}
	reset() {
		const cache = this._cacheForCtx();
		for (const k in this._style) if (this._style.hasOwnProperty(k)) {
			this._ctx[k] = this._style[k];
			cache[k] = this._style[k];
		}
		this._font = new Font();
		this._ctx.font = this._font.value;
		cache.font = this._font.value;
		return this;
	}
	_paint() {
		if (this._filled) this._ctx.fill();
		if (this._stroked) this._ctx.stroke();
	}
	static point(ctx, p, radius = 5, shape = "square") {
		if (!p) return;
		if (!CanvasForm[shape]) throw new Error(`${shape} is not a static function of CanvasForm`);
		CanvasForm[shape](ctx, p, radius);
	}
	point(p, radius = 5, shape = "square") {
		CanvasForm.point(this._ctx, p, radius, shape);
		this._paint();
		return this;
	}
	static circle(ctx, pt, radius = 10) {
		if (!pt) return;
		ctx.beginPath();
		ctx.arc(pt[0], pt[1], radius, 0, Const.two_pi, false);
		ctx.closePath();
	}
	circle(pts) {
		const p = Util.iterToArray(pts);
		CanvasForm.circle(this._ctx, p[0], p[1][0]);
		this._paint();
		return this;
	}
	static ellipse(ctx, pt, radius, rotation = 0, startAngle = 0, endAngle = Const.two_pi, cc = false) {
		if (!pt || !radius) return;
		ctx.beginPath();
		ctx.ellipse(pt[0], pt[1], radius[0], radius[1], rotation, startAngle, endAngle, cc);
	}
	ellipse(pt, radius, rotation = 0, startAngle = 0, endAngle = Const.two_pi, cc = false) {
		CanvasForm.ellipse(this._ctx, pt, radius, rotation, startAngle, endAngle, cc);
		this._paint();
		return this;
	}
	static arc(ctx, pt, radius, startAngle, endAngle, cc) {
		if (!pt) return;
		ctx.beginPath();
		ctx.arc(pt[0], pt[1], radius, startAngle, endAngle, cc);
	}
	arc(pt, radius, startAngle, endAngle, cc) {
		CanvasForm.arc(this._ctx, pt, radius, startAngle, endAngle, cc);
		this._paint();
		return this;
	}
	static square(ctx, pt, halfsize) {
		if (!pt) return;
		const x1 = pt[0] - halfsize;
		const y1 = pt[1] - halfsize;
		const x2 = pt[0] + halfsize;
		const y2 = pt[1] + halfsize;
		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(x1, y2);
		ctx.lineTo(x2, y2);
		ctx.lineTo(x2, y1);
		ctx.closePath();
	}
	square(pt, halfsize) {
		CanvasForm.square(this._ctx, pt, halfsize);
		this._paint();
		return this;
	}
	static line(ctx, pts) {
		if (!Util.arrayCheck(pts)) return;
		let i = 0;
		ctx.beginPath();
		for (const it of pts) if (it) {
			if (i++ > 0) ctx.lineTo(it[0], it[1]);
			else ctx.moveTo(it[0], it[1]);
		}
	}
	line(pts) {
		CanvasForm.line(this._ctx, pts);
		this._paint();
		return this;
	}
	static polygon(ctx, pts) {
		if (!Util.arrayCheck(pts)) return;
		CanvasForm.line(ctx, pts);
		ctx.closePath();
	}
	polygon(pts) {
		CanvasForm.polygon(this._ctx, pts);
		this._paint();
		return this;
	}
	static rect(ctx, pts) {
		const p = Util.iterToArray(pts);
		if (!Util.arrayCheck(p)) return;
		ctx.beginPath();
		ctx.moveTo(p[0][0], p[0][1]);
		ctx.lineTo(p[0][0], p[1][1]);
		ctx.lineTo(p[1][0], p[1][1]);
		ctx.lineTo(p[1][0], p[0][1]);
		ctx.closePath();
	}
	rect(pts) {
		CanvasForm.rect(this._ctx, pts);
		this._paint();
		return this;
	}
	static image(ctx, ptOrRect, img, orig) {
		const t = Util.iterToArray(ptOrRect);
		let pos;
		if (typeof t[0] === "number") pos = t;
		else if (orig) {
			const o = Util.iterToArray(orig);
			pos = [
				o[0][0],
				o[0][1],
				o[1][0] - o[0][0],
				o[1][1] - o[0][1],
				t[0][0],
				t[0][1],
				t[1][0] - t[0][0],
				t[1][1] - t[0][1]
			];
		} else pos = [
			t[0][0],
			t[0][1],
			t[1][0] - t[0][0],
			t[1][1] - t[0][1]
		];
		if (img instanceof Img) {
			if (img.loaded) ctx.drawImage(img.image, ...pos);
		} else ctx.drawImage(img, ...pos);
	}
	image(ptOrRect, img, orig) {
		if (img instanceof Img) {
			if (img.loaded) CanvasForm.image(this._ctx, ptOrRect, img.image, orig);
		} else CanvasForm.image(this._ctx, ptOrRect, img, orig);
		return this;
	}
	static imageData(ctx, ptOrRect, img) {
		const t = Util.iterToArray(ptOrRect);
		if (typeof t[0] === "number") ctx.putImageData(img, t[0], t[1]);
		else ctx.putImageData(img, t[0][0], t[0][1], t[0][0], t[0][1], t[1][0], t[1][1]);
	}
	imageData(ptOrRect, img) {
		CanvasForm.imageData(this._ctx, ptOrRect, img);
		return this;
	}
	static text(ctx, pt, txt, maxWidth) {
		if (!pt) return;
		ctx.fillText(txt, pt[0], pt[1], maxWidth);
	}
	text(pt, txt, maxWidth) {
		CanvasForm.text(this._ctx, pt, txt, maxWidth);
		return this;
	}
	textBox(box, txt, verticalAlign = "middle", tail = "", overrideBaseline = true) {
		if (overrideBaseline) this._ctx.textBaseline = verticalAlign;
		const size = Rectangle.size(box);
		const t = this._textTruncate(txt, size[0], tail);
		this.text(this._textAlign(box, verticalAlign), t[0]);
		return this;
	}
	paragraphBox(box, txt, lineHeight = 1.2, verticalAlign = "top", crop = true) {
		const b = Util.iterToArray(box);
		const size = Rectangle.size(b);
		this._ctx.textBaseline = "top";
		const lstep = this._font.size * lineHeight;
		const nextLine = (sub, buffer = [], cc = 0) => {
			if (!sub) return buffer;
			if (crop && cc * lstep > size[1] - lstep * 2) return buffer;
			if (cc > 1e4) throw new Error("max recursion reached (10000)");
			const t = this._textTruncate(sub, size[0], "");
			const newln = t[0].indexOf("\n");
			if (newln >= 0) {
				buffer.push(t[0].substr(0, newln));
				return nextLine(sub.substr(newln + 1), buffer, cc + 1);
			}
			let dt = t[0].lastIndexOf(" ") + 1;
			if (dt <= 0 || t[1] === sub.length) dt = void 0;
			const line = t[0].substr(0, dt);
			buffer.push(line);
			return t[1] <= 0 || t[1] === sub.length ? buffer : nextLine(sub.substr(dt || t[1]), buffer, cc + 1);
		};
		const lines = nextLine(txt);
		const lsize = lines.length * lstep;
		let lbox = b;
		if (verticalAlign == "middle" || verticalAlign == "center") {
			let lpad = (size[1] - lsize) / 2;
			if (crop) lpad = Math.max(0, lpad);
			lbox = new Group(b[0].$add(0, lpad), b[1].$subtract(0, lpad));
		} else if (verticalAlign == "bottom") lbox = new Group(b[0].$add(0, size[1] - lsize), b[1]);
		else lbox = new Group(b[0], b[0].$add(size[0], lsize));
		const center = Rectangle.center(lbox);
		for (let i = 0, len = lines.length; i < len; i++) this.text(this._textAlign(lbox, "top", [0, i * lstep], center), lines[i]);
		return this;
	}
	alignText(alignment = "left", baseline = "alphabetic") {
		if (baseline == "center") baseline = "middle";
		if (baseline == "baseline") baseline = "alphabetic";
		this._ctx.textAlign = alignment;
		this._ctx.textBaseline = baseline;
		return this;
	}
	log(txt) {
		const w = this._ctx.measureText(txt).width + 20;
		this.stroke(false).fill("rgba(0,0,0,.4)").rect([[0, 0], [w, 20]]);
		this.fill("#fff").text([10, 14], txt);
		return this;
	}
};

//#endregion
//#region src/Create.ts
var Create = class {
	static distributeRandom(bound, count, dimensions = 2) {
		let pts = new Group();
		for (let i = 0; i < count; i++) {
			let p = [bound.x + Num.random() * bound.width];
			if (dimensions > 1) p.push(bound.y + Num.random() * bound.height);
			if (dimensions > 2) p.push(bound.z + Num.random() * bound.depth);
			pts.push(new Pt(p));
		}
		return pts;
	}
	static distributeLinear(line, count) {
		let _line = Util.iterToArray(line);
		let ln = Line.subpoints(_line, count - 2);
		ln.unshift(_line[0]);
		ln.push(_line[_line.length - 1]);
		return ln;
	}
	static gridPts(bound, columns, rows, orientation = [.5, .5]) {
		if (columns === 0 || rows === 0) throw new Error("grid columns and rows cannot be 0");
		let unit = bound.size.$subtract(1).$divide(columns, rows);
		let offset = unit.$multiply(orientation);
		let g = new Group();
		for (let r = 0; r < rows; r++) for (let c = 0; c < columns; c++) g.push(bound.topLeft.$add(unit.$multiply(c, r)).add(offset));
		return g;
	}
	static gridCells(bound, columns, rows) {
		if (columns === 0 || rows === 0) throw new Error("grid columns and rows cannot be 0");
		let unit = bound.size.$subtract(1).divide(columns, rows);
		let g = [];
		for (let r = 0; r < rows; r++) for (let c = 0; c < columns; c++) g.push(new Group(bound.topLeft.$add(unit.$multiply(c, r)), bound.topLeft.$add(unit.$multiply(c, r).add(unit))));
		return g;
	}
	static radialPts(center, radius, count, angleOffset = -Const.half_pi) {
		let g = new Group();
		let a = Const.two_pi / count;
		for (let i = 0; i < count; i++) g.push(new Pt(center).toAngle(a * i + angleOffset, radius, true));
		return g;
	}
	static noisePts(pts, dx = .01, dy = .01, rows = 0, columns = 0) {
		let seed = Num.random();
		let g = new Group();
		let i = 0;
		for (let p of pts) {
			let np = new Noise(p);
			let r = rows && rows > 0 ? Math.floor(i / rows) : i;
			let c = columns && columns > 0 ? i % columns : i;
			np.initNoise(dx * c, dy * r);
			np.seed(seed);
			g.push(np);
			i++;
		}
		return g;
	}
	static delaunay(pts) {
		return Delaunay.from(pts);
	}
};
const __noise_grad3 = [
	[
		1,
		1,
		0
	],
	[
		-1,
		1,
		0
	],
	[
		1,
		-1,
		0
	],
	[
		-1,
		-1,
		0
	],
	[
		1,
		0,
		1
	],
	[
		-1,
		0,
		1
	],
	[
		1,
		0,
		-1
	],
	[
		-1,
		0,
		-1
	],
	[
		0,
		1,
		1
	],
	[
		0,
		-1,
		1
	],
	[
		0,
		1,
		-1
	],
	[
		0,
		-1,
		-1
	]
];
const __noise_permTable = [
	151,
	160,
	137,
	91,
	90,
	15,
	131,
	13,
	201,
	95,
	96,
	53,
	194,
	233,
	7,
	225,
	140,
	36,
	103,
	30,
	69,
	142,
	8,
	99,
	37,
	240,
	21,
	10,
	23,
	190,
	6,
	148,
	247,
	120,
	234,
	75,
	0,
	26,
	197,
	62,
	94,
	252,
	219,
	203,
	117,
	35,
	11,
	32,
	57,
	177,
	33,
	88,
	237,
	149,
	56,
	87,
	174,
	20,
	125,
	136,
	171,
	168,
	68,
	175,
	74,
	165,
	71,
	134,
	139,
	48,
	27,
	166,
	77,
	146,
	158,
	231,
	83,
	111,
	229,
	122,
	60,
	211,
	133,
	230,
	220,
	105,
	92,
	41,
	55,
	46,
	245,
	40,
	244,
	102,
	143,
	54,
	65,
	25,
	63,
	161,
	1,
	216,
	80,
	73,
	209,
	76,
	132,
	187,
	208,
	89,
	18,
	169,
	200,
	196,
	135,
	130,
	116,
	188,
	159,
	86,
	164,
	100,
	109,
	198,
	173,
	186,
	3,
	64,
	52,
	217,
	226,
	250,
	124,
	123,
	5,
	202,
	38,
	147,
	118,
	126,
	255,
	82,
	85,
	212,
	207,
	206,
	59,
	227,
	47,
	16,
	58,
	17,
	182,
	189,
	28,
	42,
	223,
	183,
	170,
	213,
	119,
	248,
	152,
	2,
	44,
	154,
	163,
	70,
	221,
	153,
	101,
	155,
	167,
	43,
	172,
	9,
	129,
	22,
	39,
	253,
	9,
	98,
	108,
	110,
	79,
	113,
	224,
	232,
	178,
	185,
	112,
	104,
	218,
	246,
	97,
	228,
	251,
	34,
	242,
	193,
	238,
	210,
	144,
	12,
	191,
	179,
	162,
	241,
	81,
	51,
	145,
	235,
	249,
	14,
	239,
	107,
	49,
	192,
	214,
	31,
	181,
	199,
	106,
	157,
	184,
	84,
	204,
	176,
	115,
	121,
	50,
	45,
	127,
	4,
	150,
	254,
	138,
	236,
	205,
	93,
	222,
	114,
	67,
	29,
	24,
	72,
	243,
	141,
	128,
	195,
	78,
	66,
	215,
	61,
	156,
	180
];
var Noise = class extends Pt {
	constructor(...args) {
		super(...args);
		this.perm = [];
		this._n = new Pt(.01, .01);
		this.perm = __noise_permTable.concat(__noise_permTable);
	}
	initNoise(...args) {
		this._n = new Pt(...args);
		return this;
	}
	step(x = 0, y = 0) {
		this._n.add(x, y);
		return this;
	}
	seed(s) {
		if (s > 0 && s < 1) s *= 65536;
		s = Math.floor(s);
		if (s < 256) s |= s << 8;
		for (let i = 0; i < 255; i++) {
			let v = i & 1 ? __noise_permTable[i] ^ s & 255 : __noise_permTable[i] ^ s >> 8 & 255;
			this.perm[i] = this.perm[i + 256] = v;
		}
		return this;
	}
	noise2D() {
		let i = Math.max(0, Math.floor(this._n[0])) % 255;
		let j = Math.max(0, Math.floor(this._n[1])) % 255;
		let x = this._n[0] % 255 - i;
		let y = this._n[1] % 255 - j;
		let n00 = Vec.dot(__noise_grad3[(i + this.perm[j]) % 12], [
			x,
			y,
			0
		]);
		let n01 = Vec.dot(__noise_grad3[(i + this.perm[j + 1]) % 12], [
			x,
			y - 1,
			0
		]);
		let n10 = Vec.dot(__noise_grad3[(i + 1 + this.perm[j]) % 12], [
			x - 1,
			y,
			0
		]);
		let n11 = Vec.dot(__noise_grad3[(i + 1 + this.perm[j + 1]) % 12], [
			x - 1,
			y - 1,
			0
		]);
		let _fade = (f) => f * f * f * (f * (f * 6 - 15) + 10);
		let tx = _fade(x);
		return Num.lerp(Num.lerp(n00, n10, tx), Num.lerp(n01, n11, tx), _fade(y));
	}
};
const _DELAUNAY_EPSILON = Math.pow(2, -52);
const _delaunayEdgeStack = /* @__PURE__ */ new Uint32Array(512);
function _pseudoAngle(dx, dy) {
	const p = dx / (Math.abs(dx) + Math.abs(dy));
	return (dy > 0 ? 3 - p : 1 + p) / 4;
}
function _sqDist(ax, ay, bx, by) {
	const dx = ax - bx;
	const dy = ay - by;
	return dx * dx + dy * dy;
}
function _orientIfSure(px, py, rx, ry, qx, qy) {
	const l = (ry - py) * (qx - px);
	const r = (rx - px) * (qy - py);
	return Math.abs(l - r) >= 33306690738754716e-32 * Math.abs(l + r) ? l - r : 0;
}
function _orient(rx, ry, qx, qy, px, py) {
	return (_orientIfSure(px, py, rx, ry, qx, qy) || _orientIfSure(rx, ry, qx, qy, px, py) || _orientIfSure(qx, qy, px, py, rx, ry)) < 0;
}
function _inCircle(ax, ay, bx, by, cx, cy, px, py) {
	const dx = ax - px;
	const dy = ay - py;
	const ex = bx - px;
	const ey = by - py;
	const fx = cx - px;
	const fy = cy - py;
	const ap = dx * dx + dy * dy;
	const bp = ex * ex + ey * ey;
	const cp = fx * fx + fy * fy;
	return dx * (ey * cp - bp * fy) - dy * (ex * cp - bp * fx) + ap * (ex * fy - ey * fx) < 0;
}
function _circumradiusSq(ax, ay, bx, by, cx, cy) {
	const dx = bx - ax;
	const dy = by - ay;
	const ex = cx - ax;
	const ey = cy - ay;
	const bl = dx * dx + dy * dy;
	const cl = ex * ex + ey * ey;
	const d = .5 / (dx * ey - dy * ex);
	const x = (ey * bl - dy * cl) * d;
	const y = (dx * cl - ex * bl) * d;
	return x * x + y * y;
}
function _circumcenterX(ax, ay, bx, by, cx, cy) {
	const dx = bx - ax;
	const dy = by - ay;
	const ex = cx - ax;
	const ey = cy - ay;
	const bl = dx * dx + dy * dy;
	const cl = ex * ex + ey * ey;
	const d = .5 / (dx * ey - dy * ex);
	return ax + (ey * bl - dy * cl) * d;
}
function _circumcenterY(ax, ay, bx, by, cx, cy) {
	const dx = bx - ax;
	const dy = by - ay;
	const ex = cx - ax;
	const ey = cy - ay;
	const bl = dx * dx + dy * dy;
	const cl = ex * ex + ey * ey;
	const d = .5 / (dx * ey - dy * ex);
	return ay + (dx * cl - ex * bl) * d;
}
function _quicksortIds(ids, dists, left, right) {
	if (right - left <= 20) {
		for (let i = left + 1; i <= right; i++) {
			const temp = ids[i];
			const tempDist = dists[temp];
			let j = i - 1;
			while (j >= left && dists[ids[j]] > tempDist) ids[j + 1] = ids[j--];
			ids[j + 1] = temp;
		}
		return;
	}
	const median = left + right >> 1;
	let i = left + 1;
	let j = right;
	_swapIds(ids, median, i);
	if (dists[ids[left]] > dists[ids[right]]) _swapIds(ids, left, right);
	if (dists[ids[i]] > dists[ids[right]]) _swapIds(ids, i, right);
	if (dists[ids[left]] > dists[ids[i]]) _swapIds(ids, left, i);
	const temp = ids[i];
	const tempDist = dists[temp];
	while (true) {
		do
			i++;
		while (dists[ids[i]] < tempDist);
		do
			j--;
		while (dists[ids[j]] > tempDist);
		if (j < i) break;
		_swapIds(ids, i, j);
	}
	ids[left + 1] = ids[j];
	ids[j] = temp;
	if (right - i + 1 >= j - left) {
		_quicksortIds(ids, dists, i, right);
		_quicksortIds(ids, dists, left, j - 1);
	} else {
		_quicksortIds(ids, dists, left, j - 1);
		_quicksortIds(ids, dists, i, right);
	}
}
function _swapIds(arr, i, j) {
	const tmp = arr[i];
	arr[i] = arr[j];
	arr[j] = tmp;
}
function _triangulate(coords) {
	const n = coords.length >> 1;
	let minX = Infinity;
	let minY = Infinity;
	let maxX = -Infinity;
	let maxY = -Infinity;
	const ids = new Uint32Array(n);
	for (let i = 0; i < n; i++) {
		const x = coords[2 * i];
		const y = coords[2 * i + 1];
		if (x < minX) minX = x;
		if (y < minY) minY = y;
		if (x > maxX) maxX = x;
		if (y > maxY) maxY = y;
		ids[i] = i;
	}
	const bcx = (minX + maxX) / 2;
	const bcy = (minY + maxY) / 2;
	let i0 = 0;
	let i1 = -1;
	let i2 = -1;
	let minDist = Infinity;
	for (let i = 0; i < n; i++) {
		const d = _sqDist(bcx, bcy, coords[2 * i], coords[2 * i + 1]);
		if (d < minDist) {
			i0 = i;
			minDist = d;
		}
	}
	let i0x = coords[2 * i0];
	let i0y = coords[2 * i0 + 1];
	minDist = Infinity;
	for (let i = 0; i < n; i++) {
		if (i === i0) continue;
		const d = _sqDist(i0x, i0y, coords[2 * i], coords[2 * i + 1]);
		if (d < minDist && d > 0) {
			i1 = i;
			minDist = d;
		}
	}
	if (i1 === -1) return null;
	let i1x = coords[2 * i1];
	let i1y = coords[2 * i1 + 1];
	let minRadius = Infinity;
	for (let i = 0; i < n; i++) {
		if (i === i0 || i === i1) continue;
		const r = _circumradiusSq(i0x, i0y, i1x, i1y, coords[2 * i], coords[2 * i + 1]);
		if (r < minRadius) {
			i2 = i;
			minRadius = r;
		}
	}
	if (i2 === -1 || minRadius === Infinity) return null;
	let i2x = coords[2 * i2];
	let i2y = coords[2 * i2 + 1];
	if (_orient(i0x, i0y, i1x, i1y, i2x, i2y)) {
		const i = i1;
		const x = i1x;
		const y = i1y;
		i1 = i2;
		i1x = i2x;
		i1y = i2y;
		i2 = i;
		i2x = x;
		i2y = y;
	}
	const cx = _circumcenterX(i0x, i0y, i1x, i1y, i2x, i2y);
	const cy = _circumcenterY(i0x, i0y, i1x, i1y, i2x, i2y);
	const dists = new Float64Array(n);
	for (let i = 0; i < n; i++) dists[i] = _sqDist(coords[2 * i], coords[2 * i + 1], cx, cy);
	_quicksortIds(ids, dists, 0, n - 1);
	const hashSize = Math.ceil(Math.sqrt(n));
	const hullPrev = new Uint32Array(n);
	const hullNext = new Uint32Array(n);
	const hullTri = new Uint32Array(n);
	const hullHash = new Int32Array(hashSize).fill(-1);
	const hashKey = (x, y) => Math.floor(_pseudoAngle(x - cx, y - cy) * hashSize) % hashSize;
	let hullStart = i0;
	hullNext[i0] = hullPrev[i2] = i1;
	hullNext[i1] = hullPrev[i0] = i2;
	hullNext[i2] = hullPrev[i1] = i0;
	hullTri[i0] = 0;
	hullTri[i1] = 1;
	hullTri[i2] = 2;
	hullHash[hashKey(i0x, i0y)] = i0;
	hullHash[hashKey(i1x, i1y)] = i1;
	hullHash[hashKey(i2x, i2y)] = i2;
	const maxTriangles = Math.max(2 * n - 5, 0);
	const triangles = new Uint32Array(maxTriangles * 3);
	const halfedges = new Int32Array(maxTriangles * 3);
	let trianglesLen = 0;
	const link = (a, b) => {
		halfedges[a] = b;
		if (b !== -1) halfedges[b] = a;
	};
	const addTriangle = (t0, t1, t2, a, b, c) => {
		const t = trianglesLen;
		triangles[t] = t0;
		triangles[t + 1] = t1;
		triangles[t + 2] = t2;
		link(t, a);
		link(t + 1, b);
		link(t + 2, c);
		trianglesLen += 3;
		return t;
	};
	const legalize = (a) => {
		let i = 0;
		let ar = 0;
		while (true) {
			const b = halfedges[a];
			if (b === -1) {
				if (i === 0) break;
				a = _delaunayEdgeStack[--i];
				continue;
			}
			const a0 = a - a % 3;
			ar = a0 + (a + 2) % 3;
			const al = a0 + (a + 1) % 3;
			const b0 = b - b % 3;
			const bl = b0 + (b + 2) % 3;
			const p0 = triangles[ar];
			const pr = triangles[a];
			const pl = triangles[al];
			const p1 = triangles[bl];
			if (_inCircle(coords[2 * p0], coords[2 * p0 + 1], coords[2 * pr], coords[2 * pr + 1], coords[2 * pl], coords[2 * pl + 1], coords[2 * p1], coords[2 * p1 + 1])) {
				triangles[a] = p1;
				triangles[b] = p0;
				const hbl = halfedges[bl];
				if (hbl === -1) {
					let e = hullStart;
					do {
						if (hullTri[e] === bl) {
							hullTri[e] = a;
							break;
						}
						e = hullPrev[e];
					} while (e !== hullStart);
				}
				link(a, hbl);
				link(b, halfedges[ar]);
				link(ar, bl);
				const br = b0 + (b + 1) % 3;
				if (i < _delaunayEdgeStack.length) _delaunayEdgeStack[i++] = br;
			} else {
				if (i === 0) break;
				a = _delaunayEdgeStack[--i];
			}
		}
		return ar;
	};
	addTriangle(i0, i1, i2, -1, -1, -1);
	let xp = 0;
	let yp = 0;
	for (let k = 0; k < n; k++) {
		const i = ids[k];
		const x = coords[2 * i];
		const y = coords[2 * i + 1];
		if (k > 0 && Math.abs(x - xp) <= _DELAUNAY_EPSILON && Math.abs(y - yp) <= _DELAUNAY_EPSILON) continue;
		xp = x;
		yp = y;
		if (i === i0 || i === i1 || i === i2) continue;
		let start = 0;
		for (let j = 0, key = hashKey(x, y); j < hashSize; j++) {
			start = hullHash[(key + j) % hashSize];
			if (start !== -1 && start !== hullNext[start]) break;
		}
		start = hullPrev[start];
		let e = start;
		let q = hullNext[e];
		while (!_orient(x, y, coords[2 * e], coords[2 * e + 1], coords[2 * q], coords[2 * q + 1])) {
			e = q;
			if (e === start) {
				e = -1;
				break;
			}
			q = hullNext[e];
		}
		if (e === -1) continue;
		let t = addTriangle(e, i, hullNext[e], -1, -1, hullTri[e]);
		hullTri[i] = legalize(t + 2);
		hullTri[e] = t;
		let next = hullNext[e];
		q = hullNext[next];
		while (_orient(x, y, coords[2 * next], coords[2 * next + 1], coords[2 * q], coords[2 * q + 1])) {
			t = addTriangle(next, i, q, hullTri[i], -1, hullTri[next]);
			hullTri[i] = legalize(t + 2);
			hullNext[next] = next;
			next = q;
			q = hullNext[next];
		}
		if (e === start) {
			q = hullPrev[e];
			while (_orient(x, y, coords[2 * q], coords[2 * q + 1], coords[2 * e], coords[2 * e + 1])) {
				t = addTriangle(q, i, e, -1, hullTri[e], hullTri[q]);
				legalize(t + 2);
				hullTri[q] = t;
				hullNext[e] = e;
				e = q;
				q = hullPrev[e];
			}
		}
		hullStart = hullPrev[i] = e;
		hullNext[e] = hullPrev[next] = i;
		hullNext[i] = next;
		hullHash[hashKey(x, y)] = i;
		hullHash[hashKey(coords[2 * e], coords[2 * e + 1])] = e;
	}
	return {
		triangles: triangles.subarray(0, trianglesLen),
		halfedges: halfedges.subarray(0, trianglesLen)
	};
}
function _clipCellToRect(cell, x0, y0, x1, y1) {
	let inside = true;
	for (let i = 0, len = cell.length; i < len; i++) {
		const px = cell[i][0];
		const py = cell[i][1];
		if (px < x0 || px > x1 || py < y0 || py > y1 || !Number.isFinite(px + py)) {
			inside = false;
			break;
		}
	}
	if (inside) return cell;
	if (cell.length < 3) {
		const kept = new Group();
		for (let i = 0, len = cell.length; i < len; i++) {
			const px = cell[i][0];
			const py = cell[i][1];
			if (px >= x0 && px <= x1 && py >= y0 && py <= y1) kept.push(cell[i]);
		}
		return kept;
	}
	const big = 1e7;
	let pts = [];
	for (let i = 0, len = cell.length; i < len; i++) {
		let px = cell[i][0];
		let py = cell[i][1];
		if (!Number.isFinite(px)) px = px > 0 ? big : -1e7;
		if (!Number.isFinite(py)) py = py > 0 ? big : -1e7;
		if (Number.isNaN(px) || Number.isNaN(py)) continue;
		pts.push([px, py]);
	}
	const clip = (input, keep, cross) => {
		const output = [];
		for (let i = 0, len = input.length; i < len; i++) {
			const a = input[i === 0 ? len - 1 : i - 1];
			const b = input[i];
			const keepB = keep(b);
			if (keep(a)) {
				if (keepB) output.push(b);
				else output.push(cross(a, b));
			} else if (keepB) output.push(cross(a, b), b);
		}
		return output;
	};
	const lerpAt = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
	pts = clip(pts, (p) => p[0] >= x0, (a, b) => lerpAt(a, b, (x0 - a[0]) / (b[0] - a[0])));
	pts = clip(pts, (p) => p[0] <= x1, (a, b) => lerpAt(a, b, (x1 - a[0]) / (b[0] - a[0])));
	pts = clip(pts, (p) => p[1] >= y0, (a, b) => lerpAt(a, b, (y0 - a[1]) / (b[1] - a[1])));
	pts = clip(pts, (p) => p[1] <= y1, (a, b) => lerpAt(a, b, (y1 - a[1]) / (b[1] - a[1])));
	const out = new Group();
	for (let i = 0, len = pts.length; i < len; i++) out.push(new Pt(pts[i]));
	return out;
}
var Delaunay = class extends Group {
	constructor(..._args) {
		super(..._args);
		this._mesh = [];
		this._triangles = null;
		this._halfedges = null;
		this._shapes = null;
	}
	delaunay(triangleOnly = true) {
		if (this.length < 3) return [];
		const n = this.length;
		this._mesh = [];
		for (let i = 0; i < n; i++) this._mesh[i] = {};
		const coords = new Float64Array(n * 2);
		for (let i = 0; i < n; i++) {
			coords[2 * i] = this[i][0];
			coords[2 * i + 1] = this[i][1];
		}
		const result = _triangulate(coords);
		this._triangles = result ? result.triangles : null;
		this._halfedges = result ? result.halfedges : null;
		this._shapes = null;
		if (!result) return [];
		const triIndices = result.triangles;
		const shapes = [];
		const tris = [];
		for (let t = 0, len = triIndices.length; t < len; t += 3) {
			const i = triIndices[t];
			const j = triIndices[t + 1];
			const k = triIndices[t + 2];
			const triangle = this._triangle(i, j, k);
			const ax = coords[2 * i];
			const ay = coords[2 * i + 1];
			const ccx = _circumcenterX(ax, ay, coords[2 * j], coords[2 * j + 1], coords[2 * k], coords[2 * k + 1]);
			const ccy = _circumcenterY(ax, ay, coords[2 * j], coords[2 * j + 1], coords[2 * k], coords[2 * k + 1]);
			const r = Math.sqrt(_sqDist(ax, ay, ccx, ccy));
			const shape = {
				i,
				j,
				k,
				triangle,
				circle: new Group(new Pt(ccx, ccy), new Pt(r, r))
			};
			this._cache(shape);
			shapes.push(shape);
			tris.push(triangle);
		}
		this._shapes = shapes;
		return triangleOnly ? tris : shapes;
	}
	voronoi(bound) {
		const cells = this._voronoiCells();
		if (!bound) return cells;
		const _bound = Geom.boundingBox(Util.iterToArray(bound));
		const x0 = _bound[0][0];
		const y0 = _bound[0][1];
		const x1 = _bound[1][0];
		const y1 = _bound[1][1];
		for (let i = 0, len = cells.length; i < len; i++) cells[i] = _clipCellToRect(cells[i], x0, y0, x1, y1);
		return cells;
	}
	_voronoiCells() {
		const triangles = this._triangles;
		const halfedges = this._halfedges;
		const shapes = this._shapes;
		if (!triangles || !halfedges || !shapes) {
			let vs = [];
			let n = this._mesh;
			for (let i = 0, len = n.length; i < len; i++) vs.push(this.neighborPts(i, true));
			return vs;
		}
		const n = this._mesh.length;
		const inedges = new Int32Array(n).fill(-1);
		for (let e = 0, len = triangles.length; e < len; e++) {
			const p = triangles[e % 3 === 2 ? e - 2 : e + 1];
			if (halfedges[e] === -1 || inedges[p] === -1) inedges[p] = e;
		}
		const vs = [];
		for (let i = 0; i < n; i++) {
			const cell = new Group();
			const e0 = inedges[i];
			if (e0 !== -1) {
				let e = e0;
				do {
					cell.push(shapes[Math.floor(e / 3)].circle[0]);
					const next = e % 3 === 2 ? e - 2 : e + 1;
					if (triangles[next] !== i) break;
					e = halfedges[next];
				} while (e !== -1 && e !== e0);
			}
			vs.push(cell);
		}
		return vs;
	}
	mesh() {
		return this._mesh;
	}
	neighborPts(i, sort = false) {
		let cs = new Group();
		let n = this._mesh;
		for (let k in n[i]) if (n[i].hasOwnProperty(k)) cs.push(n[i][k].circle[0]);
		return sort ? Geom.sortEdges(cs) : cs;
	}
	neighbors(i) {
		let cs = [];
		let n = this._mesh;
		for (let k in n[i]) if (n[i].hasOwnProperty(k)) cs.push(n[i][k]);
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
		return new Group(mid.$subtract(20 * dmax, dmax), mid.$add(0, 20 * dmax), mid.$add(20 * dmax, -dmax));
	}
	_triangle(i, j, k, pts = this) {
		return new Group(pts[i], pts[j], pts[k]);
	}
	_circum(i, j, k, tri, pts = this) {
		let t = tri || this._triangle(i, j, k, pts);
		return {
			i,
			j,
			k,
			triangle: t,
			circle: Triangle.circumcircle(t)
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
				if (a == m && b == n || a == n && b == m) {
					edges.splice(j, 2);
					edges.splice(i, 2);
					break;
				}
			}
		}
		return edges;
	}
};

//#endregion
//#region src/Color.ts
var Color = class Color extends Pt {
	constructor(...args) {
		super(...args);
		this._mode = "rgb";
		this._isNorm = false;
	}
	static from(...args) {
		const p = [
			1,
			1,
			1,
			1
		];
		const c = Util.getArgs(args);
		for (let i = 0, len = p.length; i < len; i++) if (i < c.length) p[i] = c[i];
		return new Color(p);
	}
	static fromHex(hex) {
		if (hex[0] == "#") hex = hex.substr(1);
		if (hex.length <= 3) {
			const fn = (i) => hex[i] || "F";
			hex = `${fn(0)}${fn(0)}${fn(1)}${fn(1)}${fn(2)}${fn(2)}`;
		}
		let alpha = 1;
		if (hex.length === 8) {
			alpha = hex.substr(6) && 1;
			hex = hex.substring(0, 6);
		}
		const hexVal = parseInt(hex, 16);
		return new Color(hexVal >> 16, hexVal >> 8 & 255, hexVal & 255, alpha);
	}
	static rgb(...args) {
		return Color.from(...args).toMode("rgb");
	}
	static hsl(...args) {
		return Color.from(...args).toMode("hsl");
	}
	static hsb(...args) {
		return Color.from(...args).toMode("hsb");
	}
	static lab(...args) {
		return Color.from(...args).toMode("lab");
	}
	static lch(...args) {
		return Color.from(...args).toMode("lch");
	}
	static luv(...args) {
		return Color.from(...args).toMode("luv");
	}
	static xyz(...args) {
		return Color.from(...args).toMode("xyz");
	}
	static maxValues(mode) {
		return Color.ranges[mode].zipSlice(1).$take([
			0,
			1,
			2
		]);
	}
	get hex() {
		return this.toString("hex");
	}
	get rgb() {
		return this.toString("rgb");
	}
	get rgba() {
		return this.toString("rgba");
	}
	clone() {
		const c = new Color(this);
		c.toMode(this._mode);
		return c;
	}
	toMode(mode, convert = false) {
		if (convert) {
			const fname = this._mode.toUpperCase() + "to" + mode.toUpperCase();
			if (Color[fname]) this.to(Color[fname](this, this._isNorm, this._isNorm));
			else throw new Error("Cannot convert color with " + fname);
		}
		this._mode = mode;
		return this;
	}
	get mode() {
		return this._mode;
	}
	get r() {
		return this[0];
	}
	set r(n) {
		this[0] = n;
	}
	get g() {
		return this[1];
	}
	set g(n) {
		this[1] = n;
	}
	get b() {
		return this[2];
	}
	set b(n) {
		this[2] = n;
	}
	get h() {
		return this._mode == "lch" ? this[2] : this[0];
	}
	set h(n) {
		const i = this._mode == "lch" ? 2 : 0;
		this[i] = n;
	}
	get s() {
		return this[1];
	}
	set s(n) {
		this[1] = n;
	}
	get l() {
		return this._mode == "hsl" ? this[2] : this[0];
	}
	set l(n) {
		const i = this._mode == "hsl" ? 2 : 0;
		this[i] = n;
	}
	get a() {
		return this[1];
	}
	set a(n) {
		this[1] = n;
	}
	get c() {
		return this[1];
	}
	set c(n) {
		this[1] = n;
	}
	get u() {
		return this[1];
	}
	set u(n) {
		this[1] = n;
	}
	get v() {
		return this[2];
	}
	set v(n) {
		this[2] = n;
	}
	set alpha(n) {
		if (this.length > 3) this[3] = n;
	}
	get alpha() {
		return this.length > 3 ? this[3] : 1;
	}
	get normalized() {
		return this._isNorm;
	}
	set normalized(b) {
		this._isNorm = b;
	}
	normalize(toNorm = true) {
		if (this._isNorm == toNorm) return this;
		const ranges = Color.ranges[this._mode];
		for (let i = 0; i < 3; i++) this[i] = !toNorm ? Num.mapToRange(this[i], 0, 1, ranges[i][0], ranges[i][1]) : Num.mapToRange(this[i], ranges[i][0], ranges[i][1], 0, 1);
		this._isNorm = toNorm;
		return this;
	}
	$normalize(toNorm = true) {
		return this.clone().normalize(toNorm);
	}
	toString(format = "mode") {
		if (format == "hex") {
			const _hex = (n) => {
				const s = Math.floor(n).toString(16);
				return s.length < 2 ? "0" + s : s;
			};
			return `#${_hex(this[0])}${_hex(this[1])}${_hex(this[2])}`;
		} else if (format == "rgba") return `rgba(${Math.floor(this[0])},${Math.floor(this[1])},${Math.floor(this[2])},${this.alpha})`;
		else if (format == "rgb") return `rgb(${Math.floor(this[0])},${Math.floor(this[1])},${Math.floor(this[2])})`;
		else return `${this._mode}(${this[0]},${this[1]},${this[2]},${this.alpha})`;
	}
	static RGBtoHSL(rgb, normalizedInput = false, normalizedOutput = false) {
		const [r, g, b] = !normalizedInput ? rgb.$normalize() : rgb;
		const max = Math.max(r, g, b);
		const min = Math.min(r, g, b);
		let h = (max + min) / 2;
		let s = h;
		const l = h;
		if (max == min) {
			h = 0;
			s = 0;
		} else {
			const d = max - min;
			s = l > .5 ? d / (2 - max - min) : d / (max + min);
			h = 0;
			if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
			else if (max === g) h = (b - r) / d + 2;
			else if (max === b) h = (r - g) / d + 4;
		}
		return Color.hsl(normalizedOutput ? h / 60 : h * 60, s, l, rgb.alpha);
	}
	static HSLtoRGB(hsl, normalizedInput = false, normalizedOutput = false) {
		let [h, s, l] = hsl;
		if (!normalizedInput) h = h / 360;
		if (s == 0) return Color.rgb(l * 255, l * 255, l * 255, hsl.alpha);
		const q = l <= .5 ? l * (1 + s) : l + s - l * s;
		const p = 2 * l - q;
		const convert = (t) => {
			t = t < 0 ? t + 1 : t > 1 ? t - 1 : t;
			if (t * 6 < 1) return p + (q - p) * t * 6;
			else if (t * 2 < 1) return q;
			else if (t * 3 < 2) return p + (q - p) * (2 / 3 - t) * 6;
			else return p;
		};
		const sc = normalizedOutput ? 1 : 255;
		return Color.rgb(sc * convert(h + 1 / 3), sc * convert(h), sc * convert(h - 1 / 3), hsl.alpha);
	}
	static RGBtoHSB(rgb, normalizedInput = false, normalizedOutput = false) {
		const [r, g, b] = !normalizedInput ? rgb.$normalize() : rgb;
		const max = Math.max(r, g, b);
		const min = Math.min(r, g, b);
		const d = max - min;
		let h = 0;
		const s = max === 0 ? 0 : d / max;
		const v = max;
		if (max != min) {
			if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
			else if (max === g) h = (b - r) / d + 2;
			else if (max === b) h = (r - g) / d + 4;
		}
		return Color.hsb(normalizedOutput ? h / 60 : h * 60, s, v, rgb.alpha);
	}
	static HSBtoRGB(hsb, normalizedInput = false, normalizedOutput = false) {
		let [h, s, v] = hsb;
		if (!normalizedInput) h = h / 360;
		const i = Math.floor(h * 6);
		const f = h * 6 - i;
		const p = v * (1 - s);
		const q = v * (1 - f * s);
		const t = v * (1 - (1 - f) * s);
		const c = [
			[
				v,
				t,
				p
			],
			[
				q,
				v,
				p
			],
			[
				p,
				v,
				t
			],
			[
				p,
				q,
				v
			],
			[
				t,
				p,
				v
			],
			[
				v,
				p,
				q
			]
		][i % 6];
		const sc = normalizedOutput ? 1 : 255;
		return Color.rgb(sc * c[0], sc * c[1], sc * c[2], hsb.alpha);
	}
	static RGBtoLAB(rgb, normalizedInput = false, normalizedOutput = false) {
		const c = normalizedInput ? rgb.$normalize(false) : rgb;
		return Color.XYZtoLAB(Color.RGBtoXYZ(c), false, normalizedOutput);
	}
	static LABtoRGB(lab, normalizedInput = false, normalizedOutput = false) {
		const c = normalizedInput ? lab.$normalize(false) : lab;
		return Color.XYZtoRGB(Color.LABtoXYZ(c), false, normalizedOutput);
	}
	static RGBtoLCH(rgb, normalizedInput = false, normalizedOutput = false) {
		const c = normalizedInput ? rgb.$normalize(false) : rgb;
		return Color.LABtoLCH(Color.RGBtoLAB(c), false, normalizedOutput);
	}
	static LCHtoRGB(lch, normalizedInput = false, normalizedOutput = false) {
		const c = normalizedInput ? lch.$normalize(false) : lch;
		return Color.LABtoRGB(Color.LCHtoLAB(c), false, normalizedOutput);
	}
	static RGBtoLUV(rgb, normalizedInput = false, normalizedOutput = false) {
		const c = normalizedInput ? rgb.$normalize(false) : rgb;
		return Color.XYZtoLUV(Color.RGBtoXYZ(c), false, normalizedOutput);
	}
	static LUVtoRGB(luv, normalizedInput = false, normalizedOutput = false) {
		const c = normalizedInput ? luv.$normalize(false) : luv;
		return Color.XYZtoRGB(Color.LUVtoXYZ(c), false, normalizedOutput);
	}
	static RGBtoXYZ(rgb, normalizedInput = false, normalizedOutput = false) {
		const c = !normalizedInput ? rgb.$normalize() : rgb.clone();
		for (let i = 0; i < 3; i++) {
			c[i] = c[i] > .04045 ? Math.pow((c[i] + .055) / 1.055, 2.4) : c[i] / 12.92;
			if (!normalizedOutput) c[i] = c[i] * 100;
		}
		const cc = Color.xyz(c[0] * .4124564 + c[1] * .3575761 + c[2] * .1804375, c[0] * .2126729 + c[1] * .7151522 + c[2] * .072175, c[0] * .0193339 + c[1] * .119192 + c[2] * .9503041, rgb.alpha);
		return normalizedOutput ? cc.normalize() : cc;
	}
	static XYZtoRGB(xyz, normalizedInput = false, normalizedOutput = false) {
		const [x, y, z] = !normalizedInput ? xyz.$normalize() : xyz;
		const rgb = [
			x * 3.2406254773200533 + y * -1.5372079722103187 + z * -.4986285986982479,
			x * -.9689307147293197 + y * 1.8757560608852415 + z * .041517523842953964,
			x * .055710120445510616 + y * -.2040210505984867 + z * 1.0569959422543882
		];
		for (let i = 0; i < 3; i++) {
			rgb[i] = rgb[i] > .0031308 ? 1.055 * Math.pow(rgb[i], 1 / 2.4) - .055 : 12.92 * rgb[i];
			rgb[i] = Math.max(0, Math.min(1, rgb[i]));
			if (!normalizedOutput) rgb[i] = Math.round(rgb[i] * 255);
		}
		const cc = Color.rgb(rgb[0], rgb[1], rgb[2], xyz.alpha);
		return normalizedOutput ? cc.normalize() : cc;
	}
	static XYZtoLAB(xyz, normalizedInput = false, normalizedOutput = false) {
		const c = normalizedInput ? xyz.$normalize(false) : xyz.clone();
		const eps = .00885645167;
		const kap = 903.296296296;
		c.divide(Color.D65);
		const fn = (n) => n > eps ? Math.pow(n, 1 / 3) : (kap * n + 16) / 116;
		const cy = fn(c[1]);
		const cc = Color.lab(116 * cy - 16, 500 * (fn(c[0]) - cy), 200 * (cy - fn(c[2])), xyz.alpha);
		return normalizedOutput ? cc.normalize() : cc;
	}
	static LABtoXYZ(lab, normalizedInput = false, normalizedOutput = false) {
		const c = normalizedInput ? lab.$normalize(false) : lab;
		const y = (c[0] + 16) / 116;
		const x = c[1] / 500 + y;
		const z = y - c[2] / 200;
		const eps = .00885645167;
		const kap = 903.296296296;
		const d = Color.D65;
		const xxx = Math.pow(x, 3);
		const zzz = Math.pow(z, 3);
		const cc = Color.xyz(d[0] * (xxx > eps ? xxx : (116 * x - 16) / kap), d[1] * (c[0] > kap * eps ? Math.pow((c[0] + 16) / 116, 3) : c[0] / kap), d[2] * (zzz > eps ? zzz : (116 * z - 16) / kap), lab.alpha);
		return normalizedOutput ? cc.normalize() : cc;
	}
	static XYZtoLUV(xyz, normalizedInput = false, normalizedOutput = false) {
		let [x, y, z] = normalizedInput ? xyz.$normalize(false) : xyz;
		const u = 4 * x / (x + 15 * y + 3 * z);
		const v = 9 * y / (x + 15 * y + 3 * z);
		y = y / 100;
		y = y > .008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
		const refU = 4 * Color.D65[0] / (Color.D65[0] + 15 * Color.D65[1] + 3 * Color.D65[2]);
		const refV = 9 * Color.D65[1] / (Color.D65[0] + 15 * Color.D65[1] + 3 * Color.D65[2]);
		const L = 116 * y - 16;
		return Color.luv(L, 13 * L * (u - refU), 13 * L * (v - refV), xyz.alpha);
	}
	static LUVtoXYZ(luv, normalizedInput = false, normalizedOutput = false) {
		let [l, u, v] = normalizedInput ? luv.$normalize(false) : luv;
		let y = (l + 16) / 116;
		const cubeY = y * y * y;
		y = cubeY > .008856 ? cubeY : (y - 16 / 116) / 7.787;
		const refU = 4 * Color.D65[0] / (Color.D65[0] + 15 * Color.D65[1] + 3 * Color.D65[2]);
		const refV = 9 * Color.D65[1] / (Color.D65[0] + 15 * Color.D65[1] + 3 * Color.D65[2]);
		u = u / (13 * l) + refU;
		v = v / (13 * l) + refV;
		y = y * 100;
		const x = -1 * (9 * y * u) / ((u - 4) * v - u * v);
		const z = (9 * y - 15 * v * y - v * x) / (3 * v);
		return Color.xyz(x, y, z, luv.alpha);
	}
	static LABtoLCH(lab, normalizedInput = false, normalizedOutput = false) {
		const c = normalizedInput ? lab.$normalize(false) : lab;
		const h = Geom.toDegree(Geom.boundRadian(Math.atan2(c[2], c[1])));
		return Color.lch(c[0], Math.sqrt(c[1] * c[1] + c[2] * c[2]), h, lab.alpha);
	}
	static LCHtoLAB(lch, normalizedInput = false, normalizedOutput = false) {
		const c = normalizedInput ? lch.$normalize(false) : lch;
		const rad = Geom.toRadian(c[2]);
		return Color.lab(c[0], Math.cos(rad) * c[1], Math.sin(rad) * c[1], lch.alpha);
	}
};
Color.D65 = new Pt(95.047, 100, 108.883, 1);
Color.ranges = {
	rgb: new Group(new Pt(0, 255), new Pt(0, 255), new Pt(0, 255)),
	hsl: new Group(new Pt(0, 360), new Pt(0, 1), new Pt(0, 1)),
	hsb: new Group(new Pt(0, 360), new Pt(0, 1), new Pt(0, 1)),
	lab: new Group(new Pt(0, 100), new Pt(-128, 127), new Pt(-128, 127)),
	lch: new Group(new Pt(0, 100), new Pt(0, 100), new Pt(0, 360)),
	luv: new Group(new Pt(0, 100), new Pt(-134, 220), new Pt(-140, 122)),
	xyz: new Group(new Pt(0, 100), new Pt(0, 100), new Pt(0, 100))
};

//#endregion
//#region src/Dom.ts
var DOMSpace = class DOMSpace extends MultiTouchSpace {
	constructor(elem, callback) {
		super();
		this.id = "domspace";
		this._autoResize = true;
		this._bgcolor = "#e1e9f0";
		this._css = {};
		this._domDisposed = false;
		this._resizeHandlerBound = this._resizeHandler.bind(this);
		let _selector = null;
		this.id = "pts";
		if (elem instanceof Element) {
			_selector = elem;
			this.id = "pts_existing_space";
		} else {
			_selector = document.querySelector(elem);
			this.id = elem.substr(1);
		}
		if (!_selector) {
			this._container = DOMSpace.createElement("div", "pts_container");
			this._canvas = DOMSpace.createElement("div", "pts_element");
			this._container.appendChild(this._canvas);
			document.body.appendChild(this._container);
		} else {
			this._canvas = _selector;
			this._container = _selector.parentElement;
		}
		setTimeout(this._ready.bind(this, callback), 50);
	}
	static createElement(elem = "div", id, appendTo) {
		let d = document.createElement(elem);
		if (id) d.setAttribute("id", id);
		if (appendTo && appendTo.appendChild) appendTo.appendChild(d);
		return d;
	}
	_ready(callback) {
		if (!this._container) throw new Error(`Cannot initiate #${this.id} element`);
		this._isReady = true;
		this._resizeHandler(null);
		this.clear(this._bgcolor);
		this._canvas.dispatchEvent(new Event("ready"));
		for (let k in this.players) if (this.players.hasOwnProperty(k)) {
			if (this.players[k].start) this.players[k].start(this.bound.clone(), this);
		}
		this._pointer = this.center;
		this.refresh(false);
		if (callback) callback(this.bound, this._canvas);
	}
	setup(opt) {
		if (opt.bgcolor) this._bgcolor = opt.bgcolor;
		this.autoResize = opt.resize != void 0 ? opt.resize : false;
		return this;
	}
	getForm() {
		return null;
	}
	set autoResize(auto) {
		this._autoResize = auto;
		if (auto) window.addEventListener("resize", this._resizeHandlerBound);
		else {
			delete this._css["width"];
			delete this._css["height"];
			window.removeEventListener("resize", this._resizeHandlerBound);
		}
	}
	get autoResize() {
		return this._autoResize;
	}
	resize(b, evt) {
		this.bound = b;
		this.styles({
			width: `${b.width}px`,
			height: `${b.height}px`
		}, true);
		for (let k in this.players) if (this.players.hasOwnProperty(k)) {
			let p = this.players[k];
			if (p.resize) p.resize(this.bound, evt);
		}
		return this;
	}
	_resizeHandler(evt) {
		let b = Bound.fromBoundingRect(this._container.getBoundingClientRect());
		if (this._autoResize) this.styles({
			width: "100%",
			height: "100%"
		}, true);
		else this.styles({
			width: `${b.width}px`,
			height: `${b.height}px`
		}, true);
		this.resize(b, evt);
	}
	get element() {
		return this._canvas;
	}
	get parent() {
		return this._container;
	}
	get ready() {
		return this._isReady;
	}
	clear(bg) {
		if (bg) this.background = bg;
		this._canvas.innerHTML = "";
		return this;
	}
	set background(bg) {
		this._bgcolor = bg;
		this._container.style.backgroundColor = this._bgcolor;
	}
	get background() {
		return this._bgcolor;
	}
	style(key, val, update = false) {
		this._css[key] = val;
		if (update) this._canvas.style[key] = val;
		return this;
	}
	styles(styles, update = false) {
		for (let k in styles) if (styles.hasOwnProperty(k)) this.style(k, styles[k], update);
		return this;
	}
	static setAttr(elem, data) {
		for (let k in data) if (data.hasOwnProperty(k)) elem.setAttribute(k, data[k]);
		return elem;
	}
	static getInlineStyles(data) {
		let str = "";
		for (let k in data) if (data.hasOwnProperty(k)) {
			if (data[k]) str += `${k}: ${data[k]}; `;
		}
		return str;
	}
	dispose() {
		if (this._domDisposed) return this;
		this._domDisposed = true;
		this.autoResize = false;
		this._unbindAll();
		this._cancelAnimation();
		Space.prototype.removeAll.call(this);
		return this;
	}
};
var HTMLSpace = class extends DOMSpace {
	getForm() {
		return new HTMLForm(this);
	}
	static htmlElement(parent, name, id, autoClass = true) {
		if (!parent || !parent.appendChild) throw new Error("parent is not a valid DOM element");
		let elem = document.querySelector(`#${id}`);
		if (!elem) {
			elem = document.createElement(name);
			elem.setAttribute("id", id);
			if (autoClass) elem.setAttribute("class", id.substring(0, id.indexOf("-")));
			parent.appendChild(elem);
		}
		return elem;
	}
	remove(player) {
		this._container.querySelectorAll("." + HTMLForm.scopeID(player)).forEach((el) => {
			el.parentNode.removeChild(el);
		});
		return super.remove(player);
	}
	removeAll() {
		this._container.innerHTML = "";
		return super.removeAll();
	}
};
let _htmlFormGroupID = 0;
let _htmlFormDomID = 0;
var HTMLForm = class HTMLForm extends VisualForm {
	static get groupID() {
		return _htmlFormGroupID;
	}
	static set groupID(n) {
		_htmlFormGroupID = n;
	}
	static get domID() {
		return _htmlFormDomID;
	}
	static set domID(n) {
		_htmlFormDomID = n;
	}
	constructor(space) {
		super();
		this._style = {
			filled: true,
			stroked: true,
			background: "#f03",
			"border-color": "#fff",
			color: "#000",
			"border-width": "1px",
			"border-radius": "0",
			"border-style": "solid",
			opacity: 1,
			position: "absolute",
			top: 0,
			left: 0,
			width: 0,
			height: 0
		};
		this._ctx = {
			group: null,
			groupID: "pts",
			groupCount: 0,
			currentID: "pts0",
			currentClass: "",
			style: {}
		};
		this._ready = false;
		this._space = space;
		this._space.add({ start: () => {
			this._ctx.group = this._space.element;
			this._ctx.groupID = "pts_dom_" + HTMLForm.groupID++;
			this._ctx.style = Object.assign({}, this._style);
			this._ready = true;
		} });
	}
	get space() {
		return this._space;
	}
	styleTo(k, v, unit = "") {
		if (this._ctx.style[k] === void 0) throw new Error(`${k} style property doesn't exist`);
		this._ctx.style[k] = `${v}${unit}`;
	}
	alpha(a) {
		this.styleTo("opacity", a);
		return this;
	}
	fill(c) {
		if (typeof c == "boolean") {
			this.styleTo("filled", c);
			if (!c) this.styleTo("background", "transparent");
		} else {
			this.styleTo("filled", true);
			this.styleTo("background", c);
		}
		return this;
	}
	stroke(c, width, linejoin, linecap) {
		if (typeof c == "boolean") {
			this.styleTo("stroked", c);
			if (!c) this.styleTo("border-width", 0);
		} else {
			this.styleTo("stroked", true);
			this.styleTo("border-color", c);
			this.styleTo("border-width", (width || 1) + "px");
		}
		return this;
	}
	fillText(c) {
		this.styleTo("color", c);
		return this;
	}
	cls(c) {
		if (typeof c == "boolean") this._ctx.currentClass = "";
		else this._ctx.currentClass = c;
		return this;
	}
	font(sizeOrFont, weight, style, lineHeight, family) {
		if (typeof sizeOrFont == "number") {
			this._font.size = sizeOrFont;
			if (family) this._font.face = family;
			if (weight) this._font.weight = weight;
			if (style) this._font.style = style;
			if (lineHeight) this._font.lineHeight = lineHeight;
		} else this._font = sizeOrFont;
		this._ctx.style["font"] = this._font.value;
		return this;
	}
	reset() {
		this._ctx.style = Object.assign({}, this._style);
		this._font = new Font(10, "sans-serif");
		this._ctx.style["font"] = this._font.value;
		return this;
	}
	updateScope(group_id, group) {
		this._ctx.group = group;
		this._ctx.groupID = group_id;
		this._ctx.groupCount = 0;
		this.nextID();
		return this._ctx;
	}
	scope(item) {
		if (!item || item.animateID == null) throw new Error("item not defined or not yet added to Space");
		return this.updateScope(HTMLForm.scopeID(item), this.space.element);
	}
	nextID() {
		this._ctx.groupCount++;
		this._ctx.currentID = `${this._ctx.groupID}-${this._ctx.groupCount}`;
		return this._ctx.currentID;
	}
	static getID(ctx) {
		return ctx.currentID || `p-${HTMLForm.domID++}`;
	}
	static scopeID(item) {
		return `item-${item.animateID}`;
	}
	static style(elem, styles) {
		let st = [];
		if (!styles["filled"]) st.push("background: none");
		if (!styles["stroked"]) st.push("border: none");
		for (let k in styles) if (styles.hasOwnProperty(k) && k != "filled" && k != "stroked") {
			let v = styles[k];
			if (v) {
				if (!styles["filled"] && k.indexOf("background") === 0) continue;
				else if (!styles["stroked"] && k.indexOf("border-width") === 0) continue;
				else st.push(`${k}: ${v}`);
			}
		}
		return HTMLSpace.setAttr(elem, { style: st.join(";") });
	}
	static rectStyle(ctx, pt, size) {
		ctx.style["left"] = pt[0] + "px";
		ctx.style["top"] = pt[1] + "px";
		ctx.style["width"] = size[0] + "px";
		ctx.style["height"] = size[1] + "px";
		return ctx;
	}
	static textStyle(ctx, pt) {
		ctx.style["left"] = pt[0] + "px";
		ctx.style["top"] = pt[1] + "px";
		return ctx;
	}
	static point(ctx, pt, radius = 5, shape = "square") {
		if (shape === "circle") return HTMLForm.circle(ctx, pt, radius);
		else return HTMLForm.square(ctx, pt, radius);
	}
	point(pt, radius = 5, shape = "square") {
		this.nextID();
		if (shape == "circle") this.styleTo("border-radius", "100%");
		HTMLForm.point(this._ctx, pt, radius, shape);
		return this;
	}
	static circle(ctx, pt, radius = 10) {
		let elem = HTMLSpace.htmlElement(ctx.group, "div", HTMLForm.getID(ctx));
		HTMLSpace.setAttr(elem, { class: `pts-form pts-circle ${ctx.currentClass}` });
		HTMLForm.rectStyle(ctx, new Pt(pt).$subtract(radius), new Pt(radius * 2, radius * 2));
		HTMLForm.style(elem, ctx.style);
		return elem;
	}
	circle(pts) {
		this.nextID();
		this.styleTo("border-radius", "100%");
		HTMLForm.circle(this._ctx, pts[0], pts[1][0]);
		return this;
	}
	static square(ctx, pt, halfsize) {
		let elem = HTMLSpace.htmlElement(ctx.group, "div", HTMLForm.getID(ctx));
		HTMLSpace.setAttr(elem, { class: `pts-form pts-square ${ctx.currentClass}` });
		HTMLForm.rectStyle(ctx, new Pt(pt).$subtract(halfsize), new Pt(halfsize * 2, halfsize * 2));
		HTMLForm.style(elem, ctx.style);
		return elem;
	}
	square(pt, halfsize) {
		this.nextID();
		HTMLForm.square(this._ctx, pt, halfsize);
		return this;
	}
	static rect(ctx, pts) {
		let p = Util.iterToArray(pts);
		if (!Util.arrayCheck(p)) return;
		let elem = HTMLSpace.htmlElement(ctx.group, "div", HTMLForm.getID(ctx));
		HTMLSpace.setAttr(elem, { class: `pts-form pts-rect ${ctx.currentClass}` });
		HTMLForm.rectStyle(ctx, p[0], p[1]);
		HTMLForm.style(elem, ctx.style);
		return elem;
	}
	rect(pts) {
		this.nextID();
		this.styleTo("border-radius", "0");
		HTMLForm.rect(this._ctx, pts);
		return this;
	}
	static text(ctx, pt, txt) {
		let elem = HTMLSpace.htmlElement(ctx.group, "div", HTMLForm.getID(ctx));
		HTMLSpace.setAttr(elem, { class: `pts-form pts-text ${ctx.currentClass}` });
		elem.textContent = txt;
		HTMLForm.textStyle(ctx, pt);
		HTMLForm.style(elem, ctx.style);
		return elem;
	}
	text(pt, txt) {
		this.nextID();
		HTMLForm.text(this._ctx, pt, txt);
		return this;
	}
	log(txt) {
		this.fill("#000").stroke("#fff", .5).text([10, 14], txt);
		return this;
	}
	arc(pt, radius, startAngle, endAngle, cc) {
		Util.warn("arc is not implemented in HTMLForm");
		return this;
	}
	line(pts) {
		Util.warn("line is not implemented in HTMLForm");
		return this;
	}
	polygon(pts) {
		Util.warn("polygon is not implemented in HTMLForm");
		return this;
	}
};

//#endregion
//#region \0@oxc-project+runtime@0.143.0/helpers/esm/typeof.js
function _typeof(o) {
	"@babel/helpers - typeof";
	return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o) {
		return typeof o;
	} : function(o) {
		return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
	}, _typeof(o);
}

//#endregion
//#region \0@oxc-project+runtime@0.143.0/helpers/esm/toPrimitive.js
function toPrimitive(t, r) {
	if ("object" != _typeof(t) || !t) return t;
	var e = t[Symbol.toPrimitive];
	if (void 0 !== e) {
		var i = e.call(t, r || "default");
		if ("object" != _typeof(i)) return i;
		throw new TypeError("@@toPrimitive must return a primitive value.");
	}
	return ("string" === r ? String : Number)(t);
}

//#endregion
//#region \0@oxc-project+runtime@0.143.0/helpers/esm/toPropertyKey.js
function toPropertyKey(t) {
	var i = toPrimitive(t, "string");
	return "symbol" == _typeof(i) ? i : i + "";
}

//#endregion
//#region \0@oxc-project+runtime@0.143.0/helpers/esm/defineProperty.js
function _defineProperty(e, r, t) {
	return (r = toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
		value: t,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[r] = t, e;
}

//#endregion
//#region \0@oxc-project+runtime@0.143.0/helpers/esm/objectSpread2.js
function ownKeys(e, r) {
	var t = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var o = Object.getOwnPropertySymbols(e);
		r && (o = o.filter(function(r) {
			return Object.getOwnPropertyDescriptor(e, r).enumerable;
		})), t.push.apply(t, o);
	}
	return t;
}
function _objectSpread2(e) {
	for (var r = 1; r < arguments.length; r++) {
		var t = null != arguments[r] ? arguments[r] : {};
		r % 2 ? ownKeys(Object(t), !0).forEach(function(r) {
			_defineProperty(e, r, t[r]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r) {
			Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
		});
	}
	return e;
}

//#endregion
//#region src/Svg.ts
const SVG_NS = "http://www.w3.org/2000/svg";
const BLEND_MODES = /* @__PURE__ */ new Set([
	"multiply",
	"screen",
	"overlay",
	"darken",
	"lighten",
	"color-dodge",
	"color-burn",
	"hard-light",
	"soft-light",
	"difference",
	"exclusion",
	"hue",
	"saturation",
	"color",
	"luminosity"
]);
let _gradientCount = 0;
var SVGGradient = class {
	constructor(kind, coords) {
		this.stops = [];
		this._elem = null;
		this.kind = kind;
		this.coords = coords;
		this.id = `pts_grad_${_gradientCount++}`;
	}
	addColorStop(offset, color) {
		this.stops.push([offset, color]);
		if (this._elem) this._render(this._elem);
	}
	materialize(defs) {
		if (!this._elem) {
			this._elem = document.createElementNS(SVG_NS, this.kind === "linear" ? "linearGradient" : "radialGradient");
			this._elem.setAttribute("id", this.id);
			this._elem.setAttribute("gradientUnits", "userSpaceOnUse");
			if (this.kind === "linear") {
				const [x1, y1, x2, y2] = this.coords;
				DOMSpace.setAttr(this._elem, {
					x1,
					y1,
					x2,
					y2
				});
			} else {
				const [x0, y0, r0, x1, y1, r1] = this.coords;
				DOMSpace.setAttr(this._elem, {
					cx: x1,
					cy: y1,
					r: r1,
					fx: x0,
					fy: y0
				});
				if (r0) this._elem.setAttribute("fr", `${r0}`);
			}
			this._render(this._elem);
			defs.appendChild(this._elem);
		}
		return `url(#${this.id})`;
	}
	_render(elem) {
		elem.textContent = "";
		for (const [offset, color] of this.stops) {
			const stop = document.createElementNS(SVG_NS, "stop");
			stop.setAttribute("offset", `${offset}`);
			stop.setAttribute("stop-color", color);
			elem.appendChild(stop);
		}
	}
};
let _svgMeasurer = null;
const _svgWarned = {};
var SVGContext2D = class SVGContext2D {
	constructor(host) {
		this.fillStyle = "#f03";
		this.strokeStyle = "#fff";
		this.lineWidth = 1;
		this.lineJoin = "bevel";
		this.lineCap = "butt";
		this.globalAlpha = 1;
		this.globalCompositeOperation = "source-over";
		this.font = "10px sans-serif";
		this.textAlign = "start";
		this.textBaseline = "alphabetic";
		this.lineDashOffset = 0;
		this._dash = [];
		this._stateStack = [];
		this.className = "";
		this._d = "";
		this._shapeFill = null;
		this._shapeStroke = null;
		this._shapePainted = false;
		this._shapeClass = "";
		this._shapeAlpha = 1;
		this._shapeBlend = "source-over";
		this._runs = [];
		this._drawCount = 0;
		this._group = null;
		this._defs = null;
		this._pool = [];
		this._attrCache = [];
		this._host = host;
	}
	static _warnOnce(key, msg) {
		if (!_svgWarned[key]) {
			_svgWarned[key] = true;
			Util.warn(msg);
		}
	}
	beginFrame() {
		this._runs = [];
		this._d = "";
		this._shapeFill = null;
		this._shapeStroke = null;
		this._shapePainted = false;
		this._drawCount = 0;
	}
	get drawCount() {
		return this._drawCount;
	}
	get group() {
		return this._group;
	}
	commitFrame() {
		this._flushShape();
		if (!this._group) {
			this._group = document.createElementNS(SVG_NS, "g");
			this._group.setAttribute("class", "pts-svgform");
			this._host.appendChild(this._group);
		}
		const runs = this._runs;
		for (let i = 0; i < runs.length; i++) {
			const run = runs[i];
			let elem = this._pool[i];
			if (!elem || elem.nodeName !== run.tag) {
				const fresh = document.createElementNS(SVG_NS, run.tag);
				if (elem) this._group.replaceChild(fresh, elem);
				else this._group.appendChild(fresh);
				elem = fresh;
				this._pool[i] = elem;
				this._attrCache[i] = {};
			}
			const cache = this._attrCache[i];
			for (const k in cache) if (!(k in run.attrs)) {
				elem.removeAttribute(k);
				delete cache[k];
			}
			for (const k in run.attrs) {
				const v = `${run.attrs[k]}`;
				if (cache[k] !== v) {
					elem.setAttribute(k, v);
					cache[k] = v;
				}
			}
			if (run.tag === "text" && elem.textContent !== run.text) elem.textContent = run.text;
		}
		for (let i = this._pool.length - 1; i >= runs.length; i--) {
			this._group.removeChild(this._pool[i]);
			this._pool.pop();
			this._attrCache.pop();
		}
	}
	get runs() {
		return this._runs;
	}
	resetDom() {
		this._group = null;
		this._defs = null;
		this._pool = [];
		this._attrCache = [];
	}
	disposeDom() {
		if (this._group && this._group.parentNode) this._group.parentNode.removeChild(this._group);
		if (this._defs && this._defs.parentNode) this._defs.parentNode.removeChild(this._defs);
		this.resetDom();
	}
	beginPath() {
		this._flushShape();
		this._d = "";
	}
	closePath() {
		this._d += "Z";
	}
	moveTo(x, y) {
		this._d += `M${round2(x)} ${round2(y)}`;
	}
	lineTo(x, y) {
		this._d += `L${round2(x)} ${round2(y)}`;
	}
	quadraticCurveTo(cpx, cpy, x, y) {
		this._d += `Q${round2(cpx)} ${round2(cpy)} ${round2(x)} ${round2(y)}`;
	}
	bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y) {
		this._d += `C${round2(cp1x)} ${round2(cp1y)} ${round2(cp2x)} ${round2(cp2y)} ${round2(x)} ${round2(y)}`;
	}
	rect(x, y, w, h) {
		this._d += `M${round2(x)} ${round2(y)}h${round2(w)}v${round2(h)}h${round2(-w)}Z`;
	}
	arc(x, y, radius, startAngle, endAngle, ccw = false) {
		this.ellipse(x, y, radius, radius, 0, startAngle, endAngle, ccw);
	}
	ellipse(x, y, rx, ry, rotation, startAngle, endAngle, ccw = false) {
		let delta = ccw ? startAngle - endAngle : endAngle - startAngle;
		const full = delta >= Const.two_pi;
		if (!full) delta = (delta % Const.two_pi + Const.two_pi) % Const.two_pi;
		const cosR = Math.cos(rotation);
		const sinR = Math.sin(rotation);
		const ptAt = (angle) => {
			const px = rx * Math.cos(angle);
			const py = ry * Math.sin(angle);
			return [x + px * cosR - py * sinR, y + px * sinR + py * cosR];
		};
		const dir = ccw ? -1 : 1;
		const sweepFlag = ccw ? 0 : 1;
		const rotDeg = round2(rotation * 180 / Math.PI);
		const [sx, sy] = ptAt(startAngle);
		this._d += this._d.length > 0 ? `L${round2(sx)} ${round2(sy)}` : `M${round2(sx)} ${round2(sy)}`;
		const sweep = full ? Const.two_pi : delta;
		const segments = Math.max(1, Math.ceil(sweep / Const.pi - 1e-6));
		let angle = startAngle;
		for (let s = 1; s <= segments; s++) {
			const target = s === segments ? startAngle + dir * sweep : angle + dir * Const.pi;
			const [ex, ey] = ptAt(target);
			this._d += `A${round2(rx)} ${round2(ry)} ${rotDeg} 0 ${sweepFlag} ${round2(ex)} ${round2(ey)}`;
			angle = target;
		}
		if (full) this._d += "Z";
	}
	fill() {
		this._shapeFill = this._resolvePaint(this.fillStyle);
		this._capturePaintState();
	}
	stroke() {
		this._shapeStroke = this._resolvePaint(this.strokeStyle);
		this._capturePaintState();
	}
	_capturePaintState() {
		this._shapePainted = true;
		this._shapeClass = this.className;
		this._shapeAlpha = this.globalAlpha;
		this._shapeBlend = this.globalCompositeOperation;
		this._drawCount++;
	}
	fillRect(x, y, w, h) {
		this.beginPath();
		this.rect(x, y, w, h);
		this.fill();
	}
	clearRect() {}
	fillText(txt, x, y) {
		this._flushShape();
		const anchor = this.textAlign === "center" ? "middle" : this.textAlign === "right" || this.textAlign === "end" ? "end" : "start";
		const baseline = this.textBaseline === "top" ? "text-before-edge" : this.textBaseline === "middle" ? "central" : this.textBaseline === "bottom" ? "text-after-edge" : this.textBaseline;
		const attrs = {
			x: round2(x),
			y: round2(y),
			fill: this._resolvePaint(this.fillStyle),
			"text-anchor": anchor,
			"dominant-baseline": baseline,
			style: `font: ${this.font}`,
			"pointer-events": "none"
		};
		this._applyCommon(attrs);
		this._runs.push({
			tag: "text",
			attrs,
			text: txt
		});
		this._drawCount++;
	}
	measureText(txt) {
		if (!_svgMeasurer) _svgMeasurer = document.createElement("canvas").getContext("2d");
		_svgMeasurer.font = this.font;
		return _svgMeasurer.measureText(txt);
	}
	drawImage(img, x, y, w, h, ...rest) {
		var _src;
		if (rest.length > 0) {
			SVGContext2D._warnOnce("drawImage9", "SVG output does not support the 9-argument (source-cropped) drawImage");
			return;
		}
		this._flushShape();
		const src = (_src = img.src) !== null && _src !== void 0 ? _src : img.toDataURL ? img.toDataURL() : null;
		if (!src) {
			SVGContext2D._warnOnce("drawImageSrc", "SVG output supports images from <img> elements or canvases only");
			return;
		}
		const attrs = {
			href: src,
			x: round2(x),
			y: round2(y)
		};
		const iw = w !== null && w !== void 0 ? w : img.width;
		const ih = h !== null && h !== void 0 ? h : img.height;
		if (iw != null) attrs.width = round2(iw);
		if (ih != null) attrs.height = round2(ih);
		this._applyCommon(attrs);
		this._runs.push({
			tag: "image",
			attrs
		});
		this._drawCount++;
	}
	putImageData() {
		SVGContext2D._warnOnce("putImageData", "putImageData is not supported in SVG output");
	}
	save() {
		this._stateStack.push({
			fillStyle: this.fillStyle,
			strokeStyle: this.strokeStyle,
			lineWidth: this.lineWidth,
			lineJoin: this.lineJoin,
			lineCap: this.lineCap,
			globalAlpha: this.globalAlpha,
			globalCompositeOperation: this.globalCompositeOperation,
			font: this.font,
			textAlign: this.textAlign,
			textBaseline: this.textBaseline,
			lineDashOffset: this.lineDashOffset,
			_dash: this._dash.slice()
		});
	}
	restore() {
		const s = this._stateStack.pop();
		if (s) Object.assign(this, s);
	}
	scale() {}
	clip() {
		SVGContext2D._warnOnce("clip", "clip is not yet supported in SVG output");
	}
	setLineDash(segments) {
		this._dash = segments;
	}
	getLineDash() {
		return this._dash;
	}
	createLinearGradient(x1, y1, x2, y2) {
		return new SVGGradient("linear", [
			x1,
			y1,
			x2,
			y2
		]);
	}
	createRadialGradient(x0, y0, r0, x1, y1, r1) {
		return new SVGGradient("radial", [
			x0,
			y0,
			r0,
			x1,
			y1,
			r1
		]);
	}
	_resolvePaint(style) {
		if (style instanceof SVGGradient) {
			if (!this._defs) {
				this._defs = document.createElementNS(SVG_NS, "defs");
				this._host.insertBefore(this._defs, this._host.firstChild);
			}
			return style.materialize(this._defs);
		}
		return style;
	}
	_applyCommon(attrs) {
		attrs.class = this.className ? `pts-svgform ${this.className}` : "pts-svgform";
		if (this.globalAlpha !== 1) attrs.opacity = this.globalAlpha;
		else attrs.opacity = 1;
		const op = this.globalCompositeOperation;
		if (op !== "source-over") {
			if (BLEND_MODES.has(op)) attrs["mix-blend-mode"] = op;
			else SVGContext2D._warnOnce(`composite-${op}`, `composite operation "${op}" has no SVG equivalent`);
		}
	}
	_flushShape() {
		var _this$_shapeFill, _this$_shapeStroke;
		if (!this._shapePainted || this._d.length === 0) {
			this._shapePainted = false;
			return;
		}
		const attrs = {
			d: this._d,
			fill: (_this$_shapeFill = this._shapeFill) !== null && _this$_shapeFill !== void 0 ? _this$_shapeFill : "none",
			stroke: (_this$_shapeStroke = this._shapeStroke) !== null && _this$_shapeStroke !== void 0 ? _this$_shapeStroke : "none"
		};
		if (this._shapeStroke) {
			attrs["stroke-width"] = this.lineWidth;
			attrs["stroke-linejoin"] = this.lineJoin;
			attrs["stroke-linecap"] = this.lineCap;
			if (this._dash.length > 0) {
				attrs["stroke-dasharray"] = this._dash.join(" ");
				if (this.lineDashOffset) attrs["stroke-dashoffset"] = this.lineDashOffset;
			}
		}
		attrs.class = this._shapeClass ? `pts-svgform ${this._shapeClass}` : "pts-svgform";
		attrs.opacity = this._shapeAlpha;
		if (this._shapeBlend !== "source-over") {
			if (BLEND_MODES.has(this._shapeBlend)) attrs["mix-blend-mode"] = this._shapeBlend;
			else SVGContext2D._warnOnce(`composite-${this._shapeBlend}`, `composite operation "${this._shapeBlend}" has no SVG equivalent`);
		}
		const prev = this._runs[this._runs.length - 1];
		if (prev && prev.tag === "path" && sameRunStyle(prev.attrs, attrs)) {
			prev.shapeEnds.push(prev.attrs.d.length);
			prev.attrs.d = prev.attrs.d + this._d;
		} else this._runs.push({
			tag: "path",
			attrs,
			shapeEnds: []
		});
		this._d = "";
		this._shapeFill = null;
		this._shapeStroke = null;
		this._shapePainted = false;
	}
};
function round2(n) {
	return Math.round(n * 100) / 100;
}
function sameRunStyle(a, b) {
	const keysA = Object.keys(a);
	const keysB = Object.keys(b);
	if (keysA.length !== keysB.length) return false;
	for (const k of keysA) {
		if (k === "d") continue;
		if (a[k] !== b[k]) return false;
	}
	return true;
}
var SVGSpace = class SVGSpace extends DOMSpace {
	constructor(elem, callback) {
		super(elem, callback);
		this._bgcolor = "#999";
		this._svgContexts = [];
		this._bgElem = null;
		this._svgRefresh = true;
		if (this._canvas.nodeName.toLowerCase() != "svg") {
			let s = SVGSpace.svgElement(this._canvas, "svg", `${this.id}_svg`);
			this._container = this._canvas;
			this._canvas = s;
		}
		this.refresh(true);
	}
	getForm() {
		return new SVGForm(this);
	}
	get element() {
		return this._canvas;
	}
	registerContext(ctx) {
		this._svgContexts.push(ctx);
	}
	resize(b, evt) {
		super.resize(b, evt);
		SVGSpace.setAttr(this.element, {
			viewBox: `0 0 ${this.bound.width} ${this.bound.height}`,
			width: `${this.bound.width}`,
			height: `${this.bound.height}`,
			xmlns: SVG_NS,
			version: "1.1"
		});
		this._updateBackground();
		return this;
	}
	clear(bg) {
		if (bg) this._bgcolor = bg;
		this._updateBackground();
		return this;
	}
	_updateBackground() {
		const svg = this._canvas;
		if (!this._bgElem) {
			this._bgElem = document.createElementNS(SVG_NS, "rect");
			this._bgElem.setAttribute("class", "pts-svg-bg");
			svg.insertBefore(this._bgElem, svg.firstChild);
		}
		DOMSpace.setAttr(this._bgElem, {
			x: 0,
			y: 0,
			width: this.bound.width,
			height: this.bound.height,
			fill: !this._bgcolor || this._bgcolor === "transparent" ? "none" : this._bgcolor
		});
	}
	playItems(time) {
		const ctxs = this._svgContexts;
		for (let i = 0, len = ctxs.length; i < len; i++) ctxs[i].beginFrame();
		super.playItems(time);
		for (let i = 0, len = ctxs.length; i < len; i++) if (this._svgRefresh || ctxs[i].drawCount > 0) ctxs[i].commitFrame();
	}
	refresh(b) {
		this._svgRefresh = b;
		return super.refresh(b);
	}
	toSVG(expand = false) {
		const svg = this._canvas;
		if (!expand) return svg.outerHTML;
		const clone = svg.cloneNode(true);
		const groups = clone.querySelectorAll("g.pts-svgform");
		let gi = 0;
		for (const ctx of this._svgContexts) {
			const group = groups[gi++];
			if (!group) continue;
			group.textContent = "";
			for (const run of ctx.runs) {
				if (run.tag !== "path") {
					const elem = document.createElementNS(SVG_NS, run.tag);
					DOMSpace.setAttr(elem, run.attrs);
					if (run.text) elem.textContent = run.text;
					group.appendChild(elem);
					continue;
				}
				const d = run.attrs.d;
				const bounds = [...run.shapeEnds, d.length];
				let begin = 0;
				for (const end of bounds) {
					const elem = document.createElementNS(SVG_NS, "path");
					DOMSpace.setAttr(elem, _objectSpread2(_objectSpread2({}, run.attrs), {}, { d: d.slice(begin, end) }));
					group.appendChild(elem);
					begin = end;
				}
			}
		}
		return clone.outerHTML;
	}
	static svgElement(parent, name, id) {
		if (!parent || !parent.appendChild) throw new Error("parent is not a valid DOM element");
		let elem = document.querySelector(`#${id}`);
		if (!elem) {
			elem = document.createElementNS(SVG_NS, name);
			elem.setAttribute("id", id);
			parent.appendChild(elem);
		}
		return elem;
	}
	remove(player) {
		this._container.querySelectorAll("." + SVGForm.scopeID(player)).forEach((el) => {
			el.parentNode.removeChild(el);
		});
		return super.remove(player);
	}
	removeAll() {
		this._container.innerHTML = "";
		this._bgElem = null;
		for (const ctx of this._svgContexts) ctx.resetDom();
		return super.removeAll();
	}
	dispose() {
		super.dispose();
		for (const ctx of this._svgContexts) ctx.disposeDom();
		this._svgContexts = [];
		if (this._bgElem && this._bgElem.parentNode) this._bgElem.parentNode.removeChild(this._bgElem);
		this._bgElem = null;
		return this;
	}
};
let _svgFormGroupID = 0;
let _svgFormDomID = 0;
var SVGForm = class SVGForm extends CanvasForm {
	static get groupID() {
		return _svgFormGroupID;
	}
	static set groupID(n) {
		_svgFormGroupID = n;
	}
	static get domID() {
		return _svgFormDomID;
	}
	static set domID(n) {
		_svgFormDomID = n;
	}
	constructor(space) {
		super();
		this._legacyCtx = {
			group: null,
			groupID: "pts",
			groupCount: 0,
			currentID: "pts0",
			currentClass: "",
			style: {}
		};
		this._svgSpace = space;
		this._svgCtx = new SVGContext2D(space.element);
		space.registerContext(this._svgCtx);
		this._ctx = this._svgCtx;
		this._ctx.fillStyle = "#f03";
		this._ctx.strokeStyle = "#fff";
		this._ready = true;
		this._legacyCtx.group = space.element;
	}
	get space() {
		return this._svgSpace;
	}
	get svgContext() {
		return this._svgCtx;
	}
	cls(c) {
		const cls = typeof c == "boolean" ? "" : c;
		this._legacyCtx.currentClass = cls;
		this._svgCtx.className = cls;
		return this;
	}
	updateScope(group_id, group) {
		this._legacyCtx.group = group;
		this._legacyCtx.groupID = group_id;
		this._legacyCtx.groupCount = 0;
		this.nextID();
		return this._legacyCtx;
	}
	scope(item) {
		if (!item || item.animateID == null) throw new Error("item not defined or not yet added to Space");
		return this.updateScope(SVGForm.scopeID(item), this._svgSpace.element);
	}
	nextID() {
		this._legacyCtx.groupCount++;
		this._legacyCtx.currentID = `${this._legacyCtx.groupID}-${this._legacyCtx.groupCount}`;
		return this._legacyCtx.currentID;
	}
	static getID(ctx) {
		return ctx.currentID || `p-${SVGForm.domID++}`;
	}
	static scopeID(item) {
		return `item-${item.animateID}`;
	}
	static style(elem, styles) {
		let st = [];
		if (!styles["filled"]) st.push("fill: none");
		if (!styles["stroked"]) st.push("stroke: none");
		for (let k in styles) if (styles.hasOwnProperty(k) && k != "filled" && k != "stroked") {
			let v = styles[k];
			if (v) {
				if (!styles["filled"] && k.indexOf("fill") === 0) continue;
				else if (!styles["stroked"] && k.indexOf("stroke") === 0) continue;
				else st.push(`${k}: ${v}`);
			}
		}
		return DOMSpace.setAttr(elem, { style: st.join(";") });
	}
	static pointElement(ctx, pt, radius = 5, shape = "square") {
		if (shape === "circle") return SVGForm.circleElement(ctx, pt, radius);
		else return SVGForm.squareElement(ctx, pt, radius);
	}
	static circleElement(ctx, pt, radius = 10) {
		let elem = SVGSpace.svgElement(ctx.group, "circle", SVGForm.getID(ctx));
		DOMSpace.setAttr(elem, {
			cx: pt[0],
			cy: pt[1],
			r: radius,
			class: `pts-svgform pts-circle ${ctx.currentClass}`
		});
		SVGForm.style(elem, ctx.style);
		return elem;
	}
	static arcElement(ctx, pt, radius, startAngle, endAngle, cc) {
		let elem = SVGSpace.svgElement(ctx.group, "path", SVGForm.getID(ctx));
		const start = new Pt(pt).toAngle(startAngle, radius, true);
		const end = new Pt(pt).toAngle(endAngle, radius, true);
		let largeArc = Geom.boundAngle(endAngle) - Geom.boundAngle(startAngle) > Const.pi ? true : false;
		if (cc) largeArc = !largeArc;
		const sweep = cc ? "0" : "1";
		const d = `M ${start[0]} ${start[1]} A ${radius} ${radius} 0 ${largeArc ? "1" : "0"} ${sweep} ${end[0]} ${end[1]}`;
		DOMSpace.setAttr(elem, {
			d,
			class: `pts-svgform pts-arc ${ctx.currentClass}`
		});
		SVGForm.style(elem, ctx.style);
		return elem;
	}
	static squareElement(ctx, pt, halfsize) {
		let elem = SVGSpace.svgElement(ctx.group, "rect", SVGForm.getID(ctx));
		DOMSpace.setAttr(elem, {
			x: pt[0] - halfsize,
			y: pt[1] - halfsize,
			width: halfsize * 2,
			height: halfsize * 2,
			class: `pts-svgform pts-square ${ctx.currentClass}`
		});
		SVGForm.style(elem, ctx.style);
		return elem;
	}
	static lineElement(ctx, pts) {
		let points = SVGForm.pointsString(pts);
		if (points.count < 2) return;
		if (points.count > 2) return SVGForm._poly(ctx, points.string, false);
		let elem = SVGSpace.svgElement(ctx.group, "line", SVGForm.getID(ctx));
		let p = Util.iterToArray(pts);
		DOMSpace.setAttr(elem, {
			x1: p[0][0],
			y1: p[0][1],
			x2: p[1][0],
			y2: p[1][1],
			class: `pts-svgform pts-line ${ctx.currentClass}`
		});
		SVGForm.style(elem, ctx.style);
		return elem;
	}
	static _poly(ctx, points, closePath = true) {
		let elem = SVGSpace.svgElement(ctx.group, closePath ? "polygon" : "polyline", SVGForm.getID(ctx));
		DOMSpace.setAttr(elem, {
			points,
			class: `pts-svgform pts-polygon ${ctx.currentClass}`
		});
		SVGForm.style(elem, ctx.style);
		return elem;
	}
	static pointsString(pts) {
		let points = "";
		let count = 0;
		for (let p of pts) {
			points += `${p[0]},${p[1]} `;
			count++;
		}
		return {
			string: points,
			count
		};
	}
	static polygonElement(ctx, pts) {
		let points = SVGForm.pointsString(pts);
		return SVGForm._poly(ctx, points.string, true);
	}
	static rectElement(ctx, pts) {
		if (!Util.arrayCheck(pts)) return;
		let elem = SVGSpace.svgElement(ctx.group, "rect", SVGForm.getID(ctx));
		let bound = Group.fromArray(pts).boundingBox();
		let size = Rectangle.size(bound);
		DOMSpace.setAttr(elem, {
			x: bound[0][0],
			y: bound[0][1],
			width: size[0],
			height: size[1],
			class: `pts-svgform pts-rect ${ctx.currentClass}`
		});
		SVGForm.style(elem, ctx.style);
		return elem;
	}
	static textElement(ctx, pt, txt) {
		let elem = SVGSpace.svgElement(ctx.group, "text", SVGForm.getID(ctx));
		DOMSpace.setAttr(elem, {
			"pointer-events": "none",
			x: pt[0],
			y: pt[1],
			dx: 0,
			dy: 0,
			class: `pts-svgform pts-text ${ctx.currentClass}`
		});
		elem.textContent = txt;
		SVGForm.style(elem, ctx.style);
		return elem;
	}
};

//#endregion
//#region src/Physics.ts
var World = class World {
	constructor(bound, friction = 1, gravity = 0) {
		this._gravity = new Pt();
		this._friction = 1;
		this._damping = .75;
		this._iterations = 1;
		this._substeps = 4;
		this._maxTimeStep = 50;
		this._particles = [];
		this._bodies = [];
		this._pnames = [];
		this._bnames = [];
		this._frictionStep = 1;
		this._hashKeys = /* @__PURE__ */ new Uint32Array(0);
		this._cellStart = /* @__PURE__ */ new Uint32Array(0);
		this._cellEntries = /* @__PURE__ */ new Uint32Array(0);
		this._neighborKeys = /* @__PURE__ */ new Uint32Array(9);
		this._bodyBounds = /* @__PURE__ */ new Float32Array(0);
		this._bound = Bound.fromGroup(bound);
		this._friction = friction;
		this._gravity = typeof gravity === "number" ? new Pt(0, gravity) : new Pt(gravity);
		return this;
	}
	get bound() {
		return this._bound;
	}
	set bound(bound) {
		this._bound = bound;
	}
	get gravity() {
		return this._gravity;
	}
	set gravity(g) {
		this._gravity = g;
	}
	get friction() {
		return this._friction;
	}
	set friction(f) {
		this._friction = f;
	}
	get damping() {
		return this._damping;
	}
	set damping(f) {
		this._damping = f;
	}
	get iterations() {
		return this._iterations;
	}
	set iterations(f) {
		this._iterations = f;
	}
	get substeps() {
		return this._substeps;
	}
	set substeps(n) {
		this._substeps = Math.max(1, Math.round(n));
	}
	get maxTimeStep() {
		return this._maxTimeStep;
	}
	set maxTimeStep(ms) {
		this._maxTimeStep = Math.max(0, ms);
	}
	get bodyCount() {
		return this._bodies.length;
	}
	get particleCount() {
		return this._particles.length;
	}
	body(id) {
		if (typeof id === "string" && id.length > 0) return this._bodies[this._bnames.indexOf(id)];
		return typeof id === "number" && id >= 0 ? this._bodies[id] : void 0;
	}
	particle(id) {
		if (typeof id === "string" && id.length > 0) return this._particles[this._pnames.indexOf(id)];
		return typeof id === "number" && id >= 0 ? this._particles[id] : void 0;
	}
	bodyIndex(name) {
		return this._bnames.indexOf(name);
	}
	particleIndex(name) {
		return this._pnames.indexOf(name);
	}
	update(ms) {
		const clamped = Math.min(ms, this._maxTimeStep);
		if (clamped > 0) {
			const n = this._substeps;
			const h = clamped / 1e3 / n;
			this._frictionStep = n === 1 ? this._friction : Math.pow(this._friction, 1 / n);
			for (let s = 0; s < n; s++) {
				this._updateParticles(h);
				this._updateBodies(h);
			}
			this._clearForces();
		}
		if (this._drawParticles) for (let i = 0, len = this._particles.length; i < len; i++) this._drawParticles(this._particles[i], i);
		if (this._drawBodies) for (let i = 0, len = this._bodies.length; i < len; i++) this._drawBodies(this._bodies[i], i);
	}
	drawParticles(fn) {
		this._drawParticles = fn;
	}
	drawBodies(fn) {
		this._drawBodies = fn;
	}
	add(p, name = "") {
		if (p instanceof Body) {
			this._bodies.push(p);
			this._bnames.push(name);
		} else {
			this._particles.push(p);
			this._pnames.push(name);
		}
		return this;
	}
	_index(fn, id) {
		let index = 0;
		if (typeof id === "string") {
			index = fn(id);
			if (index < 0) throw new Error(`Cannot find index of ${id}. You can use particleIndex() or bodyIndex() function to check existence by name.`);
		} else index = id;
		return index;
	}
	removeBody(from, count = 1) {
		const index = this._index(this.bodyIndex.bind(this), from);
		const param = index < 0 ? [index * -1 - 1, count] : [index, count];
		this._bodies.splice(param[0], param[1]);
		this._bnames.splice(param[0], param[1]);
		return this;
	}
	removeParticle(from, count = 1) {
		const index = this._index(this.particleIndex.bind(this), from);
		const param = index < 0 ? [index * -1 - 1, count] : [index, count];
		this._particles.splice(param[0], param[1]);
		this._pnames.splice(param[0], param[1]);
		return this;
	}
	static edgeConstraint(p1, p2, dist, stiff = 1, precise = false) {
		const m1 = 1 / (p1.mass || 1);
		const m2 = 1 / (p2.mass || 1);
		const mm = m1 + m2;
		let delta = p2.$subtract(p1);
		let distSq = dist * dist;
		let d = precise ? dist / delta.magnitude() - 1 : distSq / (delta.dot(delta) + distSq) - .5;
		let f = delta.$multiply(d * stiff);
		p1.subtract(f.$multiply(m1 / mm));
		p2.add(f.$multiply(m2 / mm));
		return p1;
	}
	static boundConstraint(p, rect, damping = .75) {
		const bound = Geom.boundingBox(rect);
		World._boundParticle(p, bound[0][0], bound[0][1], bound[1][0], bound[1][1], damping);
	}
	static _boundParticle(p, minX, minY, maxX, maxY, damping) {
		const px = p[0];
		const py = p[1];
		const nx = Math.min(Math.max(px, minX + p.radius), maxX - p.radius);
		const ny = Math.min(Math.max(py, minY + p.radius), maxY - p.radius);
		if (nx !== px || ny !== py) {
			const prev = p.previous;
			const cx = (px - prev[0]) * damping;
			const cy = (py - prev[1]) * damping;
			prev[0] = nx !== px ? nx + cx : nx - cx;
			prev[1] = ny !== py ? ny + cy : ny - cy;
			p[0] = nx;
			p[1] = ny;
		}
	}
	integrate(p, dt, prevDt) {
		if (p.lock) {
			p.verlet(dt, this._frictionStep, prevDt);
			return p;
		}
		const prev = p.previous;
		const force = p.force;
		const f = this._frictionStep;
		const dtSq = dt * dt;
		const px = p[0];
		const py = p[1];
		const nx = px + (px - prev[0]) * f + (force[0] + this._gravity[0]) * dtSq;
		const ny = py + (py - prev[1]) * f + (force[1] + this._gravity[1]) * dtSq;
		prev[0] = px;
		prev[1] = py;
		p[0] = nx;
		p[1] = ny;
		return p;
	}
	_updateParticles(dt) {
		const ps = this._particles;
		const len = ps.length;
		if (len === 0) return;
		const b0 = this._bound[0];
		const b1 = this._bound[1];
		const minX = Math.min(b0[0], b1[0]);
		const minY = Math.min(b0[1], b1[1]);
		const maxX = Math.max(b0[0], b1[0]);
		const maxY = Math.max(b0[1], b1[1]);
		for (let i = 0; i < len; i++) {
			const p = ps[i];
			this.integrate(p, dt);
			World._boundParticle(p, minX, minY, maxX, maxY, this._damping);
		}
		this._collideParticles();
	}
	_collideParticles() {
		const ps = this._particles;
		const n = ps.length;
		if (n < 2) return;
		let rmax = 0;
		for (let i = 0; i < n; i++) if (ps[i].radius > rmax) rmax = ps[i].radius;
		if (rmax <= 0) return;
		const inv = 1 / (rmax * 2);
		let m = 16;
		while (m < n * 2) m <<= 1;
		const mask = m - 1;
		if (this._cellStart.length < m + 1) this._cellStart = new Uint32Array(m + 1);
		if (this._hashKeys.length < n) {
			this._hashKeys = new Uint32Array(n * 2);
			this._cellEntries = new Uint32Array(n * 2);
		}
		const keys = this._hashKeys;
		const start = this._cellStart;
		const entries = this._cellEntries;
		start.fill(0, 0, m + 1);
		for (let i = 0; i < n; i++) {
			const p = ps[i];
			const key = (Math.imul(Math.floor(p[0] * inv), 2654435761) ^ Math.imul(Math.floor(p[1] * inv), 2246822519)) >>> 0 & mask;
			keys[i] = key;
			start[key]++;
		}
		let sum = 0;
		for (let k = 0; k < m; k++) {
			const c = start[k];
			start[k] = sum;
			sum += c;
		}
		start[m] = sum;
		for (let i = 0; i < n; i++) entries[start[keys[i]]++] = i;
		const damping = this._damping;
		const visited = this._neighborKeys;
		for (let i = 0; i < n; i++) {
			const p = ps[i];
			const cx = Math.floor(p[0] * inv);
			const cy = Math.floor(p[1] * inv);
			let visitedCount = 0;
			for (let gy = cy - 1; gy <= cy + 1; gy++) {
				const hy = Math.imul(gy, 2246822519);
				for (let gx = cx - 1; gx <= cx + 1; gx++) {
					const key = (Math.imul(gx, 2654435761) ^ hy) >>> 0 & mask;
					let seen = false;
					for (let v = 0; v < visitedCount; v++) if (visited[v] === key) {
						seen = true;
						break;
					}
					if (seen) continue;
					visited[visitedCount++] = key;
					const end = start[key];
					const begin = key > 0 ? start[key - 1] : 0;
					for (let e = begin; e < end; e++) {
						const j = entries[e];
						if (j > i) p.collide(ps[j], damping);
					}
				}
			}
		}
	}
	_clearForces() {
		for (let i = 0, len = this._particles.length; i < len; i++) this._particles[i].force.fill(0);
		for (let i = 0, len = this._bodies.length; i < len; i++) {
			const bd = this._bodies[i];
			for (let k = 0, klen = bd.length; k < klen; k++) bd[k].force.fill(0);
		}
	}
	_updateBodies(dt) {
		const bs = this._bodies;
		const blen = bs.length;
		if (blen === 0) return;
		const b0 = this._bound[0];
		const b1 = this._bound[1];
		const minX = Math.min(b0[0], b1[0]);
		const minY = Math.min(b0[1], b1[1]);
		const maxX = Math.max(b0[0], b1[0]);
		const maxY = Math.max(b0[1], b1[1]);
		for (let i = 0; i < blen; i++) {
			const bd = bs[i];
			if (!bd) continue;
			for (let k = 0, klen = bd.length; k < klen; k++) {
				const bk = bd[k];
				this.integrate(bk, dt);
				World._boundParticle(bk, minX, minY, maxX, maxY, this._damping);
			}
		}
		this._collideBodies(blen);
		for (let i = 0; i < blen; i++) if (bs[i]) bs[i].solveEdges(dt, this._iterations, this._substeps);
	}
	_collideBodies(blen) {
		const bs = this._bodies;
		if (this._bodyBounds.length < blen * 4) this._bodyBounds = new Float32Array(blen * 8);
		const aabb = this._bodyBounds;
		for (let i = 0; i < blen; i++) {
			const bd = bs[i];
			let bx0 = Infinity;
			let by0 = Infinity;
			let bx1 = -Infinity;
			let by1 = -Infinity;
			if (bd) for (let k = 0, klen = bd.length; k < klen; k++) {
				const v = bd[k];
				if (v[0] < bx0) bx0 = v[0];
				if (v[0] > bx1) bx1 = v[0];
				if (v[1] < by0) by0 = v[1];
				if (v[1] > by1) by1 = v[1];
			}
			aabb[i * 4] = bx0;
			aabb[i * 4 + 1] = by0;
			aabb[i * 4 + 2] = bx1;
			aabb[i * 4 + 3] = by1;
		}
		const ps = this._particles;
		const plen = ps.length;
		for (let i = 0; i < blen; i++) {
			const bd = bs[i];
			if (!bd) continue;
			const ax0 = aabb[i * 4];
			const ay0 = aabb[i * 4 + 1];
			const ax1 = aabb[i * 4 + 2];
			const ay1 = aabb[i * 4 + 3];
			for (let k = i + 1; k < blen; k++) if (bs[k] && ax0 <= aabb[k * 4 + 2] && ax1 >= aabb[k * 4] && ay0 <= aabb[k * 4 + 3] && ay1 >= aabb[k * 4 + 1]) bd.processBody(bs[k]);
			for (let mIdx = 0; mIdx < plen; mIdx++) {
				const p = ps[mIdx];
				const r = p.radius;
				if (p[0] >= ax0 - r && p[0] <= ax1 + r && p[1] >= ay0 - r && p[1] <= ay1 + r) bd.processParticle(p);
			}
		}
	}
};
var Particle = class extends Pt {
	constructor(...args) {
		super(...args);
		this._mass = 1;
		this._radius = 0;
		this._force = new Pt();
		this._prev = new Pt();
		this._lock = false;
		this._prev = this.clone();
	}
	get mass() {
		return this._mass;
	}
	set mass(m) {
		this._mass = m;
	}
	get radius() {
		return this._radius;
	}
	set radius(f) {
		this._radius = f;
	}
	get previous() {
		return this._prev;
	}
	set previous(p) {
		this._prev = p;
	}
	get force() {
		return this._force;
	}
	set force(g) {
		this._force = g;
	}
	get body() {
		return this._body;
	}
	set body(b) {
		this._body = b;
	}
	get lock() {
		return this._lock;
	}
	set lock(b) {
		if (this._lock && !b) this._prev.to(this);
		this._lock = b;
		this._lockPt = new Pt(this);
	}
	get changed() {
		return this.$subtract(this._prev);
	}
	set position(p) {
		this.previous.to(this);
		if (this._lock) this._lockPt = p;
		this.to(p);
	}
	size(r) {
		this._mass = r;
		this._radius = r;
		return this;
	}
	addForce(...args) {
		this._force.add(...args);
		return this._force;
	}
	verlet(dt, friction, lastDt) {
		if (this._lock) this.to(this._lockPt);
		else {
			const lt = lastDt ? lastDt : dt;
			const adt = dt * (dt + lt) / 2;
			const f = friction * dt / lt;
			const force = this._force;
			const prev = this._prev;
			for (let i = 0, len = this.length; i < len; i++) {
				const cur = this[i];
				const v = (cur - prev[i]) * f + (force[i] || 0) * adt;
				prev[i] = cur;
				this[i] = cur + v;
			}
			force.fill(0);
		}
		return this;
	}
	hit(...args) {
		this._prev.subtract(new Pt(...args).$divide(Math.sqrt(this._mass)));
		return this;
	}
	collide(p2, damp = 1) {
		const p1 = this;
		let dx = p1[0] - p2[0];
		let dy = p1[1] - p2[1];
		let distSq = dx * dx + dy * dy;
		const dr = p1.radius + p2.radius;
		if (distSq >= dr * dr) return;
		const prev1 = p1.previous;
		const prev2 = p2.previous;
		let c1x = p1[0] - prev1[0];
		let c1y = p1[1] - prev1[1];
		let c2x = p2[0] - prev2[0];
		let c2y = p2[1] - prev2[1];
		let dist = Math.sqrt(distSq);
		let k;
		if (dist < 1e-6) {
			dx = 1;
			dy = 0;
			dist = 1;
			distSq = 1;
			k = -dr / 2;
		} else k = (dist - dr) / dist / 2;
		const np1x = p1[0] - dx * k;
		const np1y = p1[1] - dy * k;
		const np2x = p2[0] + dx * k;
		const np2y = p2[1] + dy * k;
		const f1 = damp * (dx * c1x + dy * c1y) / distSq;
		const f2 = damp * (dx * c2x + dy * c2y) / distSq;
		const dm1 = p1.mass / (p1.mass + p2.mass);
		const dm2 = p2.mass / (p1.mass + p2.mass);
		c1x += (f2 - f1) * dx * dm2;
		c1y += (f2 - f1) * dy * dm2;
		c2x += (f1 - f2) * dx * dm1;
		c2y += (f1 - f2) * dy * dm1;
		p1[0] = np1x;
		p1[1] = np1y;
		p2[0] = np2x;
		p2[1] = np2y;
		prev1[0] = np1x - c1x;
		prev1[1] = np1y - c1y;
		prev2[0] = np2x - c2x;
		prev2[1] = np2y - c2y;
	}
	toString() {
		return `Particle: ${this[0]} ${this[1]} | previous ${this._prev[0]} ${this._prev[1]} | mass ${this._mass}`;
	}
};
var Body = class Body extends Group {
	constructor() {
		super();
		this._cs = [];
		this._stiff = 1;
		this._locks = {};
		this._mass = 1;
		this._lambdas = /* @__PURE__ */ new Float32Array(0);
	}
	static fromGroup(body, stiff = 1, autoLink = true, autoMass = true) {
		let b = new Body().init(body);
		if (autoLink) b.linkAll(stiff);
		if (autoMass) b.autoMass();
		return b;
	}
	init(body, stiff = 1) {
		let c = new Pt();
		for (let li of body) {
			let p = new Particle(li);
			p.body = this;
			c.add(li);
			this.push(p);
		}
		this._stiff = stiff;
		return this;
	}
	get mass() {
		return this._mass;
	}
	set mass(m) {
		this._mass = m;
		for (let i = 0, len = this.length; i < len; i++) this[i].mass = this._mass;
	}
	autoMass() {
		this.mass = Math.sqrt(Polygon.area(this)) / 10;
		return this;
	}
	link(index1, index2, stiff) {
		if (index1 < 0 || index1 >= this.length) throw new Error("index1 is not in the Group's indices");
		if (index2 < 0 || index2 >= this.length) throw new Error("index1 is not in the Group's indices");
		let d = this[index1].$subtract(this[index2]).magnitude();
		this._cs.push([
			index1,
			index2,
			d,
			stiff || this._stiff
		]);
		return this;
	}
	linkAll(stiff) {
		let half = this.length / 2;
		for (let i = 0, len = this.length; i < len; i++) {
			let n = i >= len - 1 ? 0 : i + 1;
			this.link(i, n, stiff);
			if (len > 4) {
				let nd = Math.floor(half / 2) + 1;
				let n2 = i >= len - nd ? i % len : i + nd;
				this.link(i, n2, stiff);
			}
			if (i <= half - 1) this.link(i, Math.min(this.length - 1, i + Math.floor(half)));
		}
	}
	linksToLines() {
		let gs = [];
		for (let i = 0, len = this._cs.length; i < len; i++) {
			let ln = this._cs[i];
			gs.push(new Group(this[ln[0]], this[ln[1]]));
		}
		return gs;
	}
	processEdges() {
		for (let i = 0, len = this._cs.length; i < len; i++) {
			let [m, n, d, s] = this._cs[i];
			World.edgeConstraint(this[m], this[n], d, s);
		}
	}
	solveEdges(dt, iterations = 1, substeps = 1) {
		const cs = this._cs;
		const clen = cs.length;
		if (clen === 0) return this;
		if (this._lambdas.length < clen) this._lambdas = new Float32Array(clen);
		const lambdas = this._lambdas;
		lambdas.fill(0, 0, clen);
		const invPasses = 1 / Math.max(1, iterations * substeps);
		for (let iter = 0; iter < iterations; iter++) for (let ci = 0; ci < clen; ci++) {
			const c = cs[ci];
			const p1 = this[c[0]];
			const p2 = this[c[1]];
			const stiff = c[3];
			const w1 = p1.lock ? 0 : 1 / (p1.mass || 1);
			const w2 = p2.lock ? 0 : 1 / (p2.mass || 1);
			const w = w1 + w2;
			if (w === 0) continue;
			const dx = p2[0] - p1[0];
			const dy = p2[1] - p1[1];
			const dist = Math.sqrt(dx * dx + dy * dy);
			if (dist < 1e-6) continue;
			let alpha = 0;
			if (stiff < 1) {
				const sEff = 1 - Math.pow(1 - stiff, invPasses);
				alpha = sEff > 1e-6 ? w * (1 - sEff) / sEff : w * 1e6;
			}
			const dl = (-(dist - c[2]) - alpha * lambdas[ci]) / (w + alpha);
			lambdas[ci] += dl;
			const s = dl / dist;
			const fx = dx * s;
			const fy = dy * s;
			p1[0] -= fx * w1;
			p1[1] -= fy * w1;
			p2[0] += fx * w2;
			p2[1] += fy * w2;
		}
		return this;
	}
	processBody(b) {
		let b1 = this;
		let b2 = b;
		let hit = Polygon.hasIntersectPolygon(b1, b2);
		if (hit) {
			let cv = hit.normal.$multiply(hit.dist);
			let t;
			let eg = hit.edge;
			if (Math.abs(eg[0][0] - eg[1][0]) > Math.abs(eg[0][1] - eg[1][1])) t = (hit.vertex[0] - cv[0] - eg[0][0]) / (eg[1][0] - eg[0][0]);
			else t = (hit.vertex[1] - cv[1] - eg[0][1]) / (eg[1][1] - eg[0][1]);
			let lambda = 1 / (t * t + (1 - t) * (1 - t));
			let m0 = hit.vertex.body.mass || 1;
			let m1 = hit.edge[0].body.mass || 1;
			let mr0 = m0 / (m0 + m1);
			let mr1 = m1 / (m0 + m1);
			eg[0].subtract(cv.$multiply(mr0 * (1 - t) * lambda / 2));
			eg[1].subtract(cv.$multiply(mr0 * t * lambda / 2));
			hit.vertex.add(cv.$multiply(mr1));
		}
	}
	processParticle(b) {
		let b1 = this;
		let b2 = b;
		let hit = Polygon.hasIntersectCircle(b1, Circle.fromCenter(b, b.radius));
		if (hit) {
			let cv = hit.normal.$multiply(hit.dist);
			let t;
			let eg = hit.edge;
			if (Math.abs(eg[0][0] - eg[1][0]) > Math.abs(eg[0][1] - eg[1][1])) t = (hit.vertex[0] - cv[0] - eg[0][0]) / (eg[1][0] - eg[0][0]);
			else t = (hit.vertex[1] - cv[1] - eg[0][1]) / (eg[1][1] - eg[0][1]);
			let lambda = 1 / (t * t + (1 - t) * (1 - t));
			let m0 = hit.vertex.mass || b2.mass || 1;
			let m1 = hit.edge[0].body.mass || 1;
			let mr0 = m0 / (m0 + m1);
			let mr1 = m1 / (m0 + m1);
			eg[0].subtract(cv.$multiply(mr0 * (1 - t) * lambda / 2));
			eg[1].subtract(cv.$multiply(mr0 * t * lambda / 2));
			let c1 = b.changed.add(cv.$multiply(mr1));
			b.previous = b.$subtract(c1);
		}
	}
};

//#endregion
//#region src/Play.ts
var Tempo = class Tempo {
	constructor(bpm) {
		this._listeners = {};
		this._listenerInc = 0;
		this.bpm = bpm;
	}
	static fromBeat(ms) {
		return new Tempo(6e4 / ms);
	}
	get bpm() {
		return this._bpm;
	}
	set bpm(n) {
		this._bpm = n;
		this._ms = 6e4 / this._bpm;
	}
	get ms() {
		return this._ms;
	}
	set ms(n) {
		this._bpm = 6e4 / n;
		this._ms = n;
	}
	_createID() {
		return "_b" + this._listenerInc++;
	}
	every(beats) {
		const self = this;
		const p = Array.isArray(beats) ? beats[0] : beats;
		return {
			start: function(fn, offset = 0, name) {
				const id = name || self._createID();
				self._listeners[id] = {
					name: id,
					beats,
					period: p,
					index: 0,
					offset,
					duration: -1,
					count: 0,
					continuous: false,
					fn
				};
				return this;
			},
			progress: function(fn, offset = 0, name) {
				const id = name || self._createID();
				self._listeners[id] = {
					name: id,
					beats,
					period: p,
					index: 0,
					offset,
					duration: -1,
					count: 0,
					continuous: true,
					fn
				};
				return this;
			}
		};
	}
	track(time) {
		for (const k in this._listeners) if (this._listeners.hasOwnProperty(k)) {
			const li = this._listeners[k];
			const _t = li.offset ? time + li.offset : time;
			const ms = li.period * this._ms;
			let isStart = false;
			if (li.duration < 0) {
				li.duration = _t - _t % this._ms;
				isStart = true;
			} else if (_t > li.duration + ms) {
				li.duration = _t - _t % this._ms;
				if (Array.isArray(li.beats)) {
					li.index = (li.index + 1) % li.beats.length;
					li.period = li.beats[li.index];
				}
				li.count++;
				isStart = true;
			}
			let done;
			if (li.continuous) {
				const t = Num.clamp((_t - li.duration) / ms, 0, 1);
				done = li.fn.call(li, li.count, t, _t, isStart);
			} else if (isStart) done = li.fn.call(li, li.count);
			if (done) delete this._listeners[li.name];
		}
	}
	stop(name) {
		if (this._listeners[name]) delete this._listeners[name];
	}
	animate(time, ftime) {
		this.track(time);
	}
	resize(bound, evt) {}
	action(type, px, py, evt) {}
};
var Sound = class Sound {
	constructor(type, ctx) {
		this._playing = false;
		this._volume = 1;
		this._connected = [];
		this._bufferPlayed = false;
		this._type = type;
		this._ctx = ctx || Sound._getContext();
	}
	static _getContext() {
		if (!Sound._sharedContext) {
			const _ctx = typeof window !== "undefined" ? window.AudioContext : void 0;
			if (!_ctx) throw new Error("Your browser doesn't support Web Audio. (No AudioContext)");
			Sound._sharedContext = new _ctx();
		}
		return Sound._sharedContext;
	}
	static from(node, ctx, type = "gen", stream) {
		const s = new Sound(type, ctx);
		s._node = node;
		if (stream) s._stream = stream;
		return s;
	}
	static load(source, crossOrigin = "anonymous") {
		return new Promise((resolve, reject) => {
			const s = new Sound("file");
			if (typeof source === "string") {
				s._source = new Audio();
				s._source.crossOrigin = crossOrigin;
				s._source.src = source;
			} else {
				s._source = source;
				s._source.crossOrigin = crossOrigin;
			}
			s._source.autoplay = false;
			s._source.addEventListener("ended", function() {
				s._playing = false;
			});
			const ready = () => {
				s._node = s._ctx.createMediaElementSource(s._source);
				resolve(s);
			};
			if (s._source.readyState >= 4) ready();
			else {
				s._source.addEventListener("error", () => reject(/* @__PURE__ */ new Error(`Error loading sound: ${s._source.src || "media element"}`)), { once: true });
				s._source.addEventListener("canplaythrough", ready, { once: true });
				if (s._source.readyState === 0) s._source.load();
			}
		});
	}
	static loadAsBuffer(url) {
		return _asyncToGenerator(function* () {
			const s = new Sound("file");
			const res = yield fetch(url);
			if (!res.ok) throw new Error(`Error loading sound: ${url} (status ${res.status})`);
			try {
				s.createBuffer(yield s._ctx.decodeAudioData(yield res.arrayBuffer()));
			} catch (err) {
				throw Object.assign(/* @__PURE__ */ new Error("Error decoding audio"), { cause: err });
			}
			return s;
		})();
	}
	createBuffer(buf) {
		this._node = this._ctx.createBufferSource();
		if (buf !== void 0) this._buffer = buf;
		this._node.buffer = this._buffer;
		this._node.onended = () => {
			this._playing = false;
		};
		this._bufferPlayed = false;
		if (this.analyzer) this._node.connect(this.analyzer.node);
		return this;
	}
	static generate(type, val) {
		return new Sound("gen")._gen(type, val);
	}
	_gen(type, val) {
		this._node = this._ctx.createOscillator();
		const osc = this._node;
		osc.type = type;
		if (type === "custom") {
			this._wave = val;
			osc.setPeriodicWave(this._wave);
		} else osc.frequency.value = val;
		return this;
	}
	static input(constraint) {
		return _asyncToGenerator(function* () {
			const s = new Sound("input");
			const c = constraint ? constraint : {
				audio: true,
				video: false
			};
			s._stream = yield navigator.mediaDevices.getUserMedia(c);
			s._node = s._ctx.createMediaStreamSource(s._stream);
			return s;
		})();
	}
	get ctx() {
		return this._ctx;
	}
	get node() {
		return this._node;
	}
	get outputNode() {
		return this._outputNode;
	}
	get stream() {
		return this._stream;
	}
	get source() {
		return this._source;
	}
	get buffer() {
		return this._buffer;
	}
	set buffer(b) {
		this._buffer = b;
	}
	get type() {
		return this._type;
	}
	get playing() {
		return this._playing;
	}
	get progress() {
		let dur = 0;
		let curr = 0;
		if (this._buffer) {
			dur = this._buffer.duration;
			curr = this._timestamp ? this._ctx.currentTime - this._timestamp : 0;
		} else if (this._source) {
			dur = this._source.duration;
			curr = this._source.currentTime;
		}
		return dur > 0 ? Num.clamp(curr / dur, 0, 1) : 0;
	}
	get playable() {
		if (this._type === "input" || this._type === "gen") return this._node !== void 0;
		return !!this._buffer || this._source !== void 0 && this._source.readyState === 4;
	}
	get binSize() {
		return this.analyzer ? this.analyzer.size : 0;
	}
	get sampleRate() {
		return this._ctx.sampleRate;
	}
	get frequency() {
		return this._type === "gen" ? this._node.frequency.value : 0;
	}
	set frequency(f) {
		if (this._type === "gen") this._node.frequency.value = f;
	}
	get volume() {
		return this._volume;
	}
	set volume(v) {
		this._volume = Math.max(0, v);
		if (this._gain) this._gain.gain.value = this._volume;
	}
	connect(node) {
		this._connected.push(node);
		this._node.connect(node);
		return this;
	}
	setOutputNode(outputNode) {
		this._outputNode = outputNode;
		return this;
	}
	removeOutputNode() {
		this._outputNode = null;
		return this;
	}
	analyze(size = 256, minDb = -100, maxDb = -30, smooth = .8) {
		if (this.analyzer && this._node) try {
			this._node.disconnect(this.analyzer.node);
		} catch (_unused) {}
		const a = this._ctx.createAnalyser();
		a.fftSize = size * 2;
		a.minDecibels = minDb;
		a.maxDecibels = maxDb;
		a.smoothingTimeConstant = smooth;
		this.analyzer = {
			node: a,
			size: a.frequencyBinCount,
			data: new Uint8Array(a.frequencyBinCount)
		};
		this._node.connect(this.analyzer.node);
		return this;
	}
	_domain(time) {
		if (this.analyzer) {
			if (time) this.analyzer.node.getByteTimeDomainData(this.analyzer.data);
			else this.analyzer.node.getByteFrequencyData(this.analyzer.data);
			return this.analyzer.data;
		}
		return /* @__PURE__ */ new Uint8Array(0);
	}
	_domainTo(time, size, position = [0, 0], trim = [0, 0]) {
		const data = time ? this.timeDomain() : this.freqDomain();
		const g = new Group();
		for (let i = trim[0], len = data.length - trim[1]; i < len; i++) g.push(new Pt(position[0] + size[0] * i / len, position[1] + size[1] * data[i] / 255));
		return g;
	}
	timeDomain() {
		return this._domain(true);
	}
	timeDomainTo(size, position = [0, 0], trim = [0, 0]) {
		return this._domainTo(true, size, position, trim);
	}
	freqDomain() {
		return this._domain(false);
	}
	freqDomainTo(size, position = [0, 0], trim = [0, 0]) {
		return this._domainTo(false, size, position, trim);
	}
	reset() {
		this.stop();
		if (this._node) this._node.disconnect();
		if (this._outputNode) this._outputNode.disconnect();
		return this;
	}
	_getGain() {
		if (!this._gain) {
			this._gain = this._ctx.createGain();
			this._gain.gain.value = this._volume;
			this._gain.connect(this._ctx.destination);
		}
		return this._gain;
	}
	start(timeAt = 0) {
		if (this._ctx.state === "suspended") this._ctx.resume();
		if (this._type === "file") {
			if (this._buffer) {
				if (this._bufferPlayed) this.createBuffer();
				this._node.start(0, timeAt);
				this._bufferPlayed = true;
				this._timestamp = this._ctx.currentTime - timeAt;
			} else {
				if (timeAt > 0) this._source.currentTime = timeAt;
				this._source.play();
			}
		} else if (this._type === "gen") {
			const osc = this._node;
			this._gen(osc.type, osc.type === "custom" ? this._wave : osc.frequency.value);
			this._node.start();
			if (this.analyzer) this._node.connect(this.analyzer.node);
			for (const n of this._connected) this._node.connect(n);
		}
		(this._outputNode || this._node).connect(this._getGain());
		this._playing = true;
		return this;
	}
	stop() {
		if (!this._playing) return this;
		(this._outputNode || this._node).disconnect(this._gain);
		if (this._type === "file") {
			if (this._buffer) {
				if (this.progress < 1) this._node.stop();
			} else this._source.pause();
		} else if (this._type === "gen") this._node.stop();
		else if (this._type === "input") this._stream.getAudioTracks().forEach((track) => track.stop());
		this._playing = false;
		return this;
	}
	toggle() {
		if (this._playing) this.stop();
		else this.start();
		return this;
	}
	dispose() {
		this.reset();
		if (this.analyzer) {
			this.analyzer.node.disconnect();
			this.analyzer = void 0;
		}
		if (this._gain) {
			this._gain.disconnect();
			this._gain = void 0;
		}
		this._connected = [];
		this._stream = void 0;
		this._source = void 0;
		this._buffer = void 0;
		return this;
	}
};

//#endregion
exports.Body = Body;
exports.Bound = Bound;
exports.CanvasForm = CanvasForm;
exports.CanvasSpace = CanvasSpace;
exports.Circle = Circle;
exports.Color = Color;
exports.Const = Const;
exports.Create = Create;
exports.Curve = Curve;
exports.DOMSpace = DOMSpace;
exports.Delaunay = Delaunay;
exports.Font = Font;
exports.Form = Form;
exports.Geom = Geom;
exports.Group = Group;
exports.HTMLForm = HTMLForm;
exports.HTMLSpace = HTMLSpace;
exports.Img = Img;
exports.Line = Line;
exports.Mat = Mat;
exports.MultiTouchSpace = MultiTouchSpace;
exports.Noise = Noise;
exports.Num = Num;
exports.Particle = Particle;
exports.Polygon = Polygon;
exports.Pt = Pt;
exports.Range = Range;
exports.Rectangle = Rectangle;
exports.SVGContext2D = SVGContext2D;
exports.SVGForm = SVGForm;
exports.SVGSpace = SVGSpace;
exports.Shaping = Shaping;
exports.Sound = Sound;
exports.Space = Space;
exports.Tempo = Tempo;
exports.Triangle = Triangle;
exports.Typography = Typography;
exports.UI = UI;
exports.UIButton = UIButton;
exports.UIDragger = UIDragger;
exports.UIPointerActions = UIPointerActions;
exports.UIShape = UIShape;
exports.Util = Util;
exports.Vec = Vec;
exports.VisualForm = VisualForm;
exports.World = World;
//# sourceMappingURL=index.js.map