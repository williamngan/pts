/*! Source code licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */
import { Util } from "./Util";
import { Geom, Num } from "./Num";
import { Pt, Group } from "./Pt";
import { Mat } from "./LinearAlgebra";
let _errorLength = (obj, param = "expected") => Util.warn("Group's length is less than " + param, obj);
let _errorOutofBound = (obj, param = "") => Util.warn(`Index ${param} is out of bound in Group`, obj);
export class Line {
    static fromAngle(anchor, angle, magnitude) {
        let g = new Group(new Pt(anchor), new Pt(anchor));
        g[1].toAngle(angle, magnitude, true);
        return g;
    }
    static slope(p1, p2) {
        return (p2[0] - p1[0] === 0) ? undefined : (p2[1] - p1[1]) / (p2[0] - p1[0]);
    }
    static intercept(p1, p2) {
        if (p2[0] - p1[0] === 0) {
            return undefined;
        }
        else {
            let m = (p2[1] - p1[1]) / (p2[0] - p1[0]);
            let c = p1[1] - m * p1[0];
            return { slope: m, yi: c, xi: (m === 0) ? undefined : -c / m };
        }
    }
    static sideOfPt2D(line, pt) {
        let _line = Util.iterToArray(line);
        return (_line[1][0] - _line[0][0]) * (pt[1] - _line[0][1]) - (pt[0] - _line[0][0]) * (_line[1][1] - _line[0][1]);
    }
    static collinear(p1, p2, p3, threshold = 0.01) {
        let a = new Pt(0, 0, 0).to(p1).$subtract(p2);
        let b = new Pt(0, 0, 0).to(p1).$subtract(p3);
        return a.$cross(b).divide(1000).equals(new Pt(0, 0, 0), threshold);
    }
    static magnitude(line) {
        let _line = Util.iterToArray(line);
        return (_line.length >= 2) ? _line[1].$subtract(_line[0]).magnitude() : 0;
    }
    static magnitudeSq(line) {
        let _line = Util.iterToArray(line);
        return (_line.length >= 2) ? _line[1].$subtract(_line[0]).magnitudeSq() : 0;
    }
    static perpendicularFromPt(line, pt, asProjection = false) {
        let _line = Util.iterToArray(line);
        if (_line[0].equals(_line[1]))
            return undefined;
        let a = _line[0].$subtract(_line[1]);
        let b = _line[1].$subtract(pt);
        let proj = b.$subtract(a.$project(b));
        return (asProjection) ? proj : proj.$add(pt);
    }
    static distanceFromPt(line, pt) {
        let _line = Util.iterToArray(line);
        let projectionVector = Line.perpendicularFromPt(_line, pt, true);
        if (projectionVector) {
            return projectionVector.magnitude();
        }
        else {
            return _line[0].$subtract(pt).magnitude();
        }
    }
    static intersectRay2D(la, lb) {
        let _la = Util.iterToArray(la);
        let _lb = Util.iterToArray(lb);
        let a = Line.intercept(_la[0], _la[1]);
        let b = Line.intercept(_lb[0], _lb[1]);
        let pa = _la[0];
        let pb = _lb[0];
        if (a == undefined) {
            if (b == undefined)
                return undefined;
            let y1 = -b.slope * (pb[0] - pa[0]) + pb[1];
            return new Pt(pa[0], y1);
        }
        else {
            if (b == undefined) {
                let y1 = -a.slope * (pa[0] - pb[0]) + pa[1];
                return new Pt(pb[0], y1);
            }
            else if (b.slope != a.slope) {
                let px = (a.slope * pa[0] - b.slope * pb[0] + pb[1] - pa[1]) / (a.slope - b.slope);
                let py = a.slope * (px - pa[0]) + pa[1];
                return new Pt(px, py);
            }
            else {
                if (a.yi == b.yi) {
                    return new Pt(pa[0], pa[1]);
                }
                else {
                    return undefined;
                }
            }
        }
    }
    static intersectLine2D(la, lb) {
        let _la = Util.iterToArray(la);
        let _lb = Util.iterToArray(lb);
        let pt = Line.intersectRay2D(_la, _lb);
        return (pt && Geom.withinBound(pt, _la[0], _la[1]) && Geom.withinBound(pt, _lb[0], _lb[1])) ? pt : undefined;
    }
    static intersectLineWithRay2D(line, ray) {
        let _line = Util.iterToArray(line);
        let _ray = Util.iterToArray(ray);
        let pt = Line.intersectRay2D(_line, _ray);
        return (pt && Geom.withinBound(pt, _line[0], _line[1])) ? pt : undefined;
    }
    static intersectPolygon2D(lineOrRay, poly, sourceIsRay = false) {
        let _lineOrRay = Util.iterToArray(lineOrRay);
        let _poly = Util.iterToArray(poly);
        let fn = sourceIsRay ? Line.intersectLineWithRay2D : Line.intersectLine2D;
        let pts = new Group();
        for (let i = 0, len = _poly.length; i < len; i++) {
            let next = (i === len - 1) ? 0 : i + 1;
            let d = fn([_poly[i], _poly[next]], _lineOrRay);
            if (d)
                pts.push(d);
        }
        return (pts.length > 0) ? pts : undefined;
    }
    static intersectLines2D(lines1, lines2, isRay = false) {
        let group = new Group();
        let fn = isRay ? Line.intersectLineWithRay2D : Line.intersectLine2D;
        for (let l1 of lines1) {
            for (let l2 of lines2) {
                let _ip = fn(l1, l2);
                if (_ip)
                    group.push(_ip);
            }
        }
        return group;
    }
    static intersectGridWithRay2D(ray, gridPt) {
        let _ray = Util.iterToArray(ray);
        let t = Line.intercept(new Pt(_ray[0]).subtract(gridPt), new Pt(_ray[1]).subtract(gridPt));
        let g = new Group();
        if (t && t.xi)
            g.push(new Pt(gridPt[0] + t.xi, gridPt[1]));
        if (t && t.yi)
            g.push(new Pt(gridPt[0], gridPt[1] + t.yi));
        return g;
    }
    static intersectGridWithLine2D(line, gridPt) {
        let _line = Util.iterToArray(line);
        let g = Line.intersectGridWithRay2D(_line, gridPt);
        let gg = new Group();
        for (let i = 0, len = g.length; i < len; i++) {
            if (Geom.withinBound(g[i], _line[0], _line[1]))
                gg.push(g[i]);
        }
        return gg;
    }
    static intersectRect2D(line, rect) {
        let _line = Util.iterToArray(line);
        let _rect = Util.iterToArray(rect);
        let box = Geom.boundingBox(Group.fromPtArray(_line));
        if (!Rectangle.hasIntersectRect2D(box, _rect))
            return new Group();
        return Line.intersectLines2D([_line], Rectangle.sides(_rect));
    }
    static subpoints(line, num) {
        let _line = Util.iterToArray(line);
        let pts = new Group();
        for (let i = 1; i <= num; i++) {
            pts.push(Geom.interpolate(_line[0], _line[1], i / (num + 1)));
        }
        return pts;
    }
    static crop(line, size, index = 0, cropAsCircle = true) {
        let _line = Util.iterToArray(line);
        let tdx = (index === 0) ? 1 : 0;
        let ls = _line[tdx].$subtract(_line[index]);
        if (ls[0] === 0 || size[0] === 0)
            return _line[index];
        if (cropAsCircle) {
            let d = ls.unit().multiply(size[1]);
            return _line[index].$add(d);
        }
        else {
            let rect = Rectangle.fromCenter(_line[index], size);
            let sides = Rectangle.sides(rect);
            let sideIdx = 0;
            if (Math.abs(ls[1] / ls[0]) > Math.abs(size[1] / size[0])) {
                sideIdx = (ls[1] < 0) ? 0 : 2;
            }
            else {
                sideIdx = (ls[0] < 0) ? 3 : 1;
            }
            return Line.intersectRay2D(sides[sideIdx], _line);
        }
    }
    static marker(line, size, graphic = ("arrow" || "line"), atTail = true) {
        let _line = Util.iterToArray(line);
        let h = atTail ? 0 : 1;
        let t = atTail ? 1 : 0;
        let unit = _line[h].$subtract(_line[t]);
        if (unit.magnitudeSq() === 0)
            return new Group();
        unit.unit();
        let ps = Geom.perpendicular(unit).multiply(size[0]).add(_line[t]);
        if (graphic == "arrow") {
            ps.add(unit.$multiply(size[1]));
            return new Group(_line[t], ps[0], ps[1]);
        }
        else {
            return new Group(ps[0], ps[1]);
        }
    }
    static toRect(line) {
        let _line = Util.iterToArray(line);
        return new Group(_line[0].$min(_line[1]), _line[0].$max(_line[1]));
    }
}
export class Rectangle {
    static from(topLeft, widthOrSize, height) {
        return Rectangle.fromTopLeft(topLeft, widthOrSize, height);
    }
    static fromTopLeft(topLeft, widthOrSize, height) {
        let size = (typeof widthOrSize == "number") ? [widthOrSize, (height || widthOrSize)] : widthOrSize;
        return new Group(new Pt(topLeft), new Pt(topLeft).add(size));
    }
    static fromCenter(center, widthOrSize, height) {
        let half = (typeof widthOrSize == "number") ? [widthOrSize / 2, (height || widthOrSize) / 2] : new Pt(widthOrSize).divide(2);
        return new Group(new Pt(center).subtract(half), new Pt(center).add(half));
    }
    static toCircle(pts, within = true) {
        return Circle.fromRect(pts, within);
    }
    static toSquare(pts, enclose = false) {
        let _pts = Util.iterToArray(pts);
        let s = Rectangle.size(_pts);
        let m = (enclose) ? s.maxValue().value : s.minValue().value;
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
            new Group(p0, p1), new Group(p1, p2),
            new Group(p2, p3), new Group(p3, p0)
        ];
    }
    static boundingBox(rects) {
        let _rects = Util.iterToArray(rects);
        let merged = Util.flatten(_rects, false);
        let min = Pt.make(2, Number.MAX_VALUE);
        let max = Pt.make(2, Number.MIN_VALUE);
        for (let i = 0, len = merged.length; i < len; i++) {
            let k = 0;
            for (let m of merged[i]) {
                min[k] = Math.min(min[k], m[k]);
                max[k] = Math.max(max[k], m[k]);
                if (++k >= 2)
                    break;
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
        let _center = (center != undefined) ? new Pt(center) : Rectangle.center(_rect);
        return corners.map((c) => new Group(c, _center).boundingBox());
    }
    static halves(rect, ratio = 0.5, asRows = false) {
        let _rect = Util.iterToArray(rect);
        let min = _rect[0].$min(_rect[1]);
        let max = _rect[0].$max(_rect[1]);
        let mid = (asRows) ? Num.lerp(min[1], max[1], ratio) : Num.lerp(min[0], max[0], ratio);
        return (asRows)
            ? [new Group(min, new Pt(max[0], mid)), new Group(new Pt(min[0], mid), max)]
            : [new Group(min, new Pt(mid, max[1])), new Group(new Pt(mid, min[1]), max)];
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
        if (_rect1[0][0] > _rect2[1][0] || _rect2[0][0] > _rect1[1][0])
            return false;
        if (_rect1[0][1] > _rect2[1][1] || _rect2[0][1] > _rect1[1][1])
            return false;
        return true;
    }
    static intersectRect2D(rect1, rect2) {
        let _rect1 = Util.iterToArray(rect1);
        let _rect2 = Util.iterToArray(rect2);
        if (!Rectangle.hasIntersectRect2D(_rect1, _rect2))
            return new Group();
        return Line.intersectLines2D(Rectangle.sides(_rect1), Rectangle.sides(_rect2));
    }
}
export class Circle {
    static fromRect(pts, enclose = false) {
        let _pts = Util.iterToArray(pts);
        let r = 0;
        let min = r = Rectangle.size(_pts).minValue().value / 2;
        if (enclose) {
            let max = Rectangle.size(_pts).maxValue().value / 2;
            r = Math.sqrt(min * min + max * max);
        }
        else {
            r = min;
        }
        return new Group(Rectangle.center(_pts), new Pt(r, r));
    }
    static fromTriangle(pts, enclose = false) {
        if (enclose) {
            return Triangle.circumcircle(pts);
        }
        else {
            return Triangle.incircle(pts);
        }
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
        if (disc < 0) {
            return new Group();
        }
        else {
            let discSqrt = Math.sqrt(disc);
            let t1 = -p + discSqrt;
            let p1 = _ray[0].$subtract(d.$multiply(t1));
            if (disc === 0)
                return new Group(p1);
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
            for (let i = 0, len = ps.length; i < len; i++) {
                if (Rectangle.withinBound(_line, ps[i]))
                    g.push(ps[i]);
            }
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
        if (dr > ar + br) {
            return new Group();
        }
        else if (dr < Math.abs(ar - br)) {
            return new Group(_pts[0].clone());
        }
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
            if (ps.length > 0)
                g.push(ps);
        }
        return Util.flatten(g);
    }
    static toRect(circle, within = false) {
        let _pts = Util.iterToArray(circle);
        let r = _pts[1][0];
        if (within) {
            let half = Math.sqrt(r * r) / 2;
            return new Group(_pts[0].$subtract(half), _pts[0].$add(half));
        }
        else {
            return new Group(_pts[0].$subtract(r), _pts[0].$add(r));
        }
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
        }
        else {
            return Triangle.fromCenter(_pts[0], _pts[1][0]);
        }
    }
}
export class Triangle {
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
        if (_pts.length < 3)
            return _errorLength(new Group(), 3);
        return Polygon.midpoints(_pts, true);
    }
    static oppositeSide(tri, index) {
        let _pts = Util.iterToArray(tri);
        if (_pts.length < 3)
            return _errorLength(new Group(), 3);
        if (index === 0) {
            return Group.fromPtArray([_pts[1], _pts[2]]);
        }
        else if (index === 1) {
            return Group.fromPtArray([_pts[0], _pts[2]]);
        }
        else {
            return Group.fromPtArray([_pts[0], _pts[1]]);
        }
    }
    static altitude(tri, index) {
        let _pts = Util.iterToArray(tri);
        let opp = Triangle.oppositeSide(_pts, index);
        if (opp.length > 1) {
            return new Group(_pts[index], Line.perpendicularFromPt(opp, _pts[index]));
        }
        else {
            return new Group();
        }
    }
    static orthocenter(tri) {
        let _pts = Util.iterToArray(tri);
        if (_pts.length < 3)
            return _errorLength(undefined, 3);
        let a = Triangle.altitude(_pts, 0);
        let b = Triangle.altitude(_pts, 1);
        return Line.intersectRay2D(a, b);
    }
    static incenter(tri) {
        let _pts = Util.iterToArray(tri);
        if (_pts.length < 3)
            return _errorLength(undefined, 3);
        let a = Polygon.bisector(_pts, 0).add(_pts[0]);
        let b = Polygon.bisector(_pts, 1).add(_pts[1]);
        return Line.intersectRay2D(new Group(_pts[0], a), new Group(_pts[1], b));
    }
    static incircle(tri, center) {
        let _pts = Util.iterToArray(tri);
        let c = (center) ? center : Triangle.incenter(_pts);
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
        let c = (center) ? center : Triangle.circumcenter(_pts);
        let r = _pts[0].$subtract(c).magnitude();
        return Circle.fromCenter(c, r);
    }
}
export class Polygon {
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
        if (index < 0 || index >= _pts.length)
            throw new Error("index out of the Polygon's range");
        return new Group(_pts[index], (index === _pts.length - 1) ? _pts[0] : _pts[index + 1]);
    }
    static lines(poly, closePath = true) {
        let _pts = Util.iterToArray(poly);
        if (_pts.length < 2)
            return _errorLength(new Group(), 2);
        let sp = Util.split(_pts, 2, 1);
        if (closePath)
            sp.push(new Group(_pts[_pts.length - 1], _pts[0]));
        return sp.map((g) => g);
    }
    static midpoints(poly, closePath = false, t = 0.5) {
        let sides = Polygon.lines(poly, closePath);
        let mids = sides.map((s) => Geom.interpolate(s[0], s[1], t));
        return mids;
    }
    static adjacentSides(poly, index, closePath = false) {
        let _pts = Util.iterToArray(poly);
        if (_pts.length < 2)
            return _errorLength(new Group(), 2);
        if (index < 0 || index >= _pts.length)
            return _errorOutofBound(new Group(), index);
        let gs = [];
        let left = index - 1;
        if (closePath && left < 0)
            left = _pts.length - 1;
        if (left >= 0)
            gs.push(new Group(_pts[index], _pts[left]));
        let right = index + 1;
        if (closePath && right > _pts.length - 1)
            right = 0;
        if (right <= _pts.length - 1)
            gs.push(new Group(_pts[index], _pts[right]));
        return gs;
    }
    static bisector(poly, index) {
        let sides = Polygon.adjacentSides(poly, index, true);
        if (sides.length >= 2) {
            let a = sides[0][1].$subtract(sides[0][0]).unit();
            let b = sides[1][1].$subtract(sides[1][0]).unit();
            return a.add(b).divide(2);
        }
        else {
            return undefined;
        }
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
        if (_pts.length < 3)
            return _errorLength(new Group(), 3);
        let det = (a, b) => a[0] * b[1] - a[1] * b[0];
        let area = 0;
        for (let i = 0, len = _pts.length; i < len; i++) {
            if (i < _pts.length - 1) {
                area += det(_pts[i], _pts[i + 1]);
            }
            else {
                area += det(_pts[i], _pts[0]);
            }
        }
        return Math.abs(area / 2);
    }
    static convexHull(pts, sorted = false) {
        let _pts = Util.iterToArray(pts);
        if (_pts.length < 3)
            return _errorLength(new Group(), 3);
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
        }
        else {
            dq[bot + 1] = _pts[1];
            dq[bot + 2] = _pts[0];
        }
        for (let i = 3, len = _pts.length; i < len; i++) {
            let pt = _pts[i];
            if (left(dq[bot], dq[bot + 1], pt) && left(dq[top - 1], dq[top], pt)) {
                continue;
            }
            while (!left(dq[bot], dq[bot + 1], pt)) {
                bot += 1;
            }
            bot -= 1;
            dq[bot] = pt;
            while (!left(dq[top - 1], dq[top], pt)) {
                top -= 1;
            }
            top += 1;
            dq[top] = pt;
        }
        let hull = new Group();
        for (let h = 0; h < (top - bot); h++) {
            hull.push(dq[bot + h]);
        }
        return hull;
    }
    static network(poly, originIndex = 0) {
        let _pts = Util.iterToArray(poly);
        let g = [];
        for (let i = 0, len = _pts.length; i < len; i++) {
            if (i != originIndex)
                g.push(new Group(_pts[originIndex], _pts[i]));
        }
        return g;
    }
    static nearestPt(poly, pt) {
        let _near = Number.MAX_VALUE;
        let _item = -1;
        let i = 0;
        for (let p of poly) {
            let d = p.$subtract(pt).magnitudeSq();
            if (d < _near) {
                _near = d;
                _item = i;
            }
            i++;
        }
        return _item;
    }
    static projectAxis(poly, unitAxis) {
        let _poly = Util.iterToArray(poly);
        let dot = unitAxis.dot(_poly[0]);
        let d = new Pt(dot, dot);
        for (let n = 1, len = _poly.length; n < len; n++) {
            dot = unitAxis.dot(_poly[n]);
            d = new Pt(Math.min(dot, d[0]), Math.max(dot, d[1]));
        }
        return d;
    }
    static _axisOverlap(poly1, poly2, unitAxis) {
        let pa = Polygon.projectAxis(poly1, unitAxis);
        let pb = Polygon.projectAxis(poly2, unitAxis);
        return (pa[0] < pb[0]) ? pb[0] - pa[1] : pa[0] - pb[1];
    }
    static hasIntersectPoint(poly, pt) {
        let _poly = Util.iterToArray(poly);
        let c = false;
        for (let i = 0, len = _poly.length; i < len; i++) {
            let ln = Polygon.lineAt(_poly, i);
            if (((ln[0][1] > pt[1]) != (ln[1][1] > pt[1])) &&
                (pt[0] < (ln[1][0] - ln[0][0]) * (pt[1] - ln[0][1]) / (ln[1][1] - ln[0][1]) + ln[0][0])) {
                c = !c;
            }
        }
        return c;
    }
    static hasIntersectCircle(poly, circle) {
        let _poly = Util.iterToArray(poly);
        let _circle = Util.iterToArray(circle);
        let info = {
            which: -1,
            dist: 0,
            normal: null,
            edge: null,
            vertex: null,
        };
        let c = _circle[0];
        let r = _circle[1][0];
        let minDist = Number.MAX_SAFE_INTEGER;
        for (let i = 0, len = _poly.length; i < len; i++) {
            let edge = Polygon.lineAt(_poly, i);
            let axis = new Pt(edge[0].y - edge[1].y, edge[1].x - edge[0].x).unit();
            let poly2 = new Group(c.$add(axis.$multiply(r)), c.$subtract(axis.$multiply(r)));
            let dist = Polygon._axisOverlap(_poly, poly2, axis);
            if (dist > 0) {
                return null;
            }
            else if (Math.abs(dist) < minDist) {
                let check = Rectangle.withinBound(edge, Line.perpendicularFromPt(edge, c)) || Circle.intersectLine2D(circle, edge).length > 0;
                if (check) {
                    info.edge = edge;
                    info.normal = axis;
                    minDist = Math.abs(dist);
                    info.which = i;
                }
            }
        }
        if (!info.edge)
            return null;
        let dir = c.$subtract(Polygon.centroid(_poly)).dot(info.normal);
        if (dir < 0)
            info.normal.multiply(-1);
        info.dist = minDist;
        info.vertex = c;
        return info;
    }
    static hasIntersectPolygon(poly1, poly2) {
        let _poly1 = Util.iterToArray(poly1);
        let _poly2 = Util.iterToArray(poly2);
        let info = {
            which: -1,
            dist: 0,
            normal: new Pt(),
            edge: new Group(),
            vertex: new Pt()
        };
        let minDist = Number.MAX_SAFE_INTEGER;
        for (let i = 0, plen = (_poly1.length + _poly2.length); i < plen; i++) {
            let edge = (i < _poly1.length) ? Polygon.lineAt(_poly1, i) : Polygon.lineAt(_poly2, i - _poly1.length);
            let axis = new Pt(edge[0].y - edge[1].y, edge[1].x - edge[0].x).unit();
            let dist = Polygon._axisOverlap(_poly1, _poly2, axis);
            if (dist > 0) {
                return null;
            }
            else if (Math.abs(dist) < minDist) {
                info.edge = edge;
                info.normal = axis;
                minDist = Math.abs(dist);
                info.which = (i < _poly1.length) ? 0 : 1;
            }
        }
        info.dist = minDist;
        let b1 = (info.which === 0) ? _poly2 : _poly1;
        let b2 = (info.which === 0) ? _poly1 : _poly2;
        let c1 = Polygon.centroid(b1);
        let c2 = Polygon.centroid(b2);
        let dir = c1.$subtract(c2).dot(info.normal);
        if (dir < 0)
            info.normal.multiply(-1);
        let smallest = Number.MAX_SAFE_INTEGER;
        for (let i = 0, len = b1.length; i < len; i++) {
            let d = info.normal.dot(b1[i].$subtract(c2));
            if (d < smallest) {
                smallest = d;
                info.vertex = b1[i];
            }
        }
        return info;
    }
    static intersectPolygon2D(poly1, poly2) {
        let _poly1 = Util.iterToArray(poly1);
        let _poly2 = Util.iterToArray(poly2);
        let lp = Polygon.lines(_poly1);
        let g = [];
        for (let i = 0, len = lp.length; i < len; i++) {
            let ins = Line.intersectPolygon2D(lp[i], _poly2, false);
            if (ins)
                g.push(ins);
        }
        return Util.flatten(g, true);
    }
    static toRects(polys) {
        let boxes = [];
        for (let g of polys) {
            boxes.push(Geom.boundingBox(g));
        }
        let merged = Util.flatten(boxes, false);
        boxes.unshift(Geom.boundingBox(merged));
        return boxes;
    }
}
export class Curve {
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
        if (index > _pts.length - 1)
            return new Group();
        let _index = (i) => (i < _pts.length - 1) ? i : _pts.length - 1;
        let p0 = _pts[index];
        index = (copyStart) ? index : index + 1;
        return new Group(p0, _pts[_index(index++)], _pts[_index(index++)], _pts[_index(index++)]);
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
        if (_pts.length < 2)
            return new Group();
        let ps = new Group();
        let ts = Curve.getSteps(steps);
        let c = Curve.controlPoints(_pts, 0, true);
        for (let i = 0; i <= steps; i++) {
            ps.push(Curve.catmullRomStep(ts[i], c));
        }
        let k = 0;
        while (k < _pts.length - 2) {
            let cp = Curve.controlPoints(_pts, k);
            if (cp.length > 0) {
                for (let i = 0; i <= steps; i++) {
                    ps.push(Curve.catmullRomStep(ts[i], cp));
                }
                k++;
            }
        }
        return ps;
    }
    static catmullRomStep(step, ctrls) {
        let m = new Group(new Pt(-0.5, 1, -0.5, 0), new Pt(1.5, -2.5, 0, 1), new Pt(-1.5, 2, 0.5, 0), new Pt(0.5, -0.5, 0, 0));
        return Curve._calcPt(ctrls, Mat.multiply([step], m, true)[0]);
    }
    static cardinal(pts, steps = 10, tension = 0.5) {
        let _pts = Util.iterToArray(pts);
        if (_pts.length < 2)
            return new Group();
        let ps = new Group();
        let ts = Curve.getSteps(steps);
        let c = Curve.controlPoints(_pts, 0, true);
        for (let i = 0; i <= steps; i++) {
            ps.push(Curve.cardinalStep(ts[i], c, tension));
        }
        let k = 0;
        while (k < _pts.length - 2) {
            let cp = Curve.controlPoints(_pts, k);
            if (cp.length > 0) {
                for (let i = 0; i <= steps; i++) {
                    ps.push(Curve.cardinalStep(ts[i], cp, tension));
                }
                k++;
            }
        }
        return ps;
    }
    static cardinalStep(step, ctrls, tension = 0.5) {
        let m = new Group(new Pt(-1, 2, -1, 0), new Pt(-1, 1, 0, 0), new Pt(1, -2, 1, 0), new Pt(1, -1, 0, 0));
        let h = Mat.multiply([step], m, true)[0].multiply(tension);
        let h2 = (2 * step[0] - 3 * step[1] + 1);
        let h3 = -2 * step[0] + 3 * step[1];
        let pt = Curve._calcPt(ctrls, h);
        pt.x += h2 * ctrls[1].x + h3 * ctrls[2].x;
        pt.y += h2 * ctrls[1].y + h3 * ctrls[2].y;
        if (pt.length > 2)
            pt.z += h2 * ctrls[1].z + h3 * ctrls[2].z;
        return pt;
    }
    static bezier(pts, steps = 10) {
        let _pts = Util.iterToArray(pts);
        if (_pts.length < 4)
            return new Group();
        let ps = new Group();
        let ts = Curve.getSteps(steps);
        let k = 0;
        while (k < _pts.length - 3) {
            let c = Curve.controlPoints(_pts, k);
            if (c.length > 0) {
                for (let i = 0; i <= steps; i++) {
                    ps.push(Curve.bezierStep(ts[i], c));
                }
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
        if (_pts.length < 2)
            return new Group();
        let ps = new Group();
        let ts = Curve.getSteps(steps);
        let k = 0;
        while (k < _pts.length - 3) {
            let c = Curve.controlPoints(_pts, k);
            if (c.length > 0) {
                if (tension !== 1) {
                    for (let i = 0; i <= steps; i++) {
                        ps.push(Curve.bsplineTensionStep(ts[i], c, tension));
                    }
                }
                else {
                    for (let i = 0; i <= steps; i++) {
                        ps.push(Curve.bsplineStep(ts[i], c));
                    }
                }
                k++;
            }
        }
        return ps;
    }
    static bsplineStep(step, ctrls) {
        let m = new Group(new Pt(-0.16666666666666666, 0.5, -0.5, 0.16666666666666666), new Pt(0.5, -1, 0, 0.6666666666666666), new Pt(-0.5, 0.5, 0.5, 0.16666666666666666), new Pt(0.16666666666666666, 0, 0, 0));
        return Curve._calcPt(ctrls, Mat.multiply([step], m, true)[0]);
    }
    static bsplineTensionStep(step, ctrls, tension = 1) {
        let m = new Group(new Pt(-0.16666666666666666, 0.5, -0.5, 0.16666666666666666), new Pt(-1.5, 2, 0, -0.3333333333333333), new Pt(1.5, -2.5, 0.5, 0.16666666666666666), new Pt(0.16666666666666666, 0, 0, 0));
        let h = Mat.multiply([step], m, true)[0].multiply(tension);
        let h2 = (2 * step[0] - 3 * step[1] + 1);
        let h3 = -2 * step[0] + 3 * step[1];
        let pt = Curve._calcPt(ctrls, h);
        pt.x += h2 * ctrls[1].x + h3 * ctrls[2].x;
        pt.y += h2 * ctrls[1].y + h3 * ctrls[2].y;
        if (pt.length > 2)
            pt.z += h2 * ctrls[1].z + h3 * ctrls[2].z;
        return pt;
    }
}
//# sourceMappingURL=Op.js.map