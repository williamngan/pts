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
        return (line[1][0] - line[0][0]) * (pt[1] - line[0][1]) - (pt[0] - line[0][0]) * (line[1][1] - line[0][1]);
    }
    static collinear(p1, p2, p3, threshold = 0.01) {
        let a = new Pt(0, 0, 0).to(p1).$subtract(p2);
        let b = new Pt(0, 0, 0).to(p1).$subtract(p3);
        return a.$cross(b).divide(1000).equals(new Pt(0, 0, 0), threshold);
    }
    static magnitude(line) {
        return (line.length >= 2) ? line[1].$subtract(line[0]).magnitude() : 0;
    }
    static magnitudeSq(line) {
        return (line.length >= 2) ? line[1].$subtract(line[0]).magnitudeSq() : 0;
    }
    static perpendicularFromPt(line, pt, asProjection = false) {
        if (line[0].equals(line[1]))
            return undefined;
        let a = line[0].$subtract(line[1]);
        let b = line[1].$subtract(pt);
        let proj = b.$subtract(a.$project(b));
        return (asProjection) ? proj : proj.$add(pt);
    }
    static distanceFromPt(line, pt) {
        return Line.perpendicularFromPt(line, pt, true).magnitude();
    }
    static intersectRay2D(la, lb) {
        let a = Line.intercept(la[0], la[1]);
        let b = Line.intercept(lb[0], lb[1]);
        let pa = la[0];
        let pb = lb[0];
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
        let pt = Line.intersectRay2D(la, lb);
        return (pt && Geom.withinBound(pt, la[0], la[1]) && Geom.withinBound(pt, lb[0], lb[1])) ? pt : undefined;
    }
    static intersectLineWithRay2D(line, ray) {
        let pt = Line.intersectRay2D(line, ray);
        return (pt && Geom.withinBound(pt, line[0], line[1])) ? pt : undefined;
    }
    static intersectPolygon2D(lineOrRay, poly, sourceIsRay = false) {
        let fn = sourceIsRay ? Line.intersectLineWithRay2D : Line.intersectLine2D;
        let pts = new Group();
        for (let i = 0, len = poly.length; i < len; i++) {
            let next = (i === len - 1) ? 0 : i + 1;
            let d = fn([poly[i], poly[next]], lineOrRay);
            if (d)
                pts.push(d);
        }
        return (pts.length > 0) ? pts : undefined;
    }
    static intersectLines2D(lines1, lines2, isRay = false) {
        let group = new Group();
        let fn = isRay ? Line.intersectLineWithRay2D : Line.intersectLine2D;
        for (let i = 0, len = lines1.length; i < len; i++) {
            for (let k = 0, lenk = lines2.length; k < lenk; k++) {
                let _ip = fn(lines1[i], lines2[k]);
                if (_ip)
                    group.push(_ip);
            }
        }
        return group;
    }
    static intersectGridWithRay2D(ray, gridPt) {
        let t = Line.intercept(new Pt(ray[0]).subtract(gridPt), new Pt(ray[1]).subtract(gridPt));
        let g = new Group();
        if (t && t.xi)
            g.push(new Pt(gridPt[0] + t.xi, gridPt[1]));
        if (t && t.yi)
            g.push(new Pt(gridPt[0], gridPt[1] + t.yi));
        return g;
    }
    static intersectGridWithLine2D(line, gridPt) {
        let g = Line.intersectGridWithRay2D(line, gridPt);
        let gg = new Group();
        for (let i = 0, len = g.length; i < len; i++) {
            if (Geom.withinBound(g[i], line[0], line[1]))
                gg.push(g[i]);
        }
        return gg;
    }
    static intersectRect2D(line, rect) {
        let box = Geom.boundingBox(Group.fromPtArray(line));
        if (!Rectangle.hasIntersectRect2D(box, rect))
            return new Group();
        return Line.intersectLines2D([line], Rectangle.sides(rect));
    }
    static subpoints(line, num) {
        let pts = new Group();
        for (let i = 1; i <= num; i++) {
            pts.push(Geom.interpolate(line[0], line[1], i / (num + 1)));
        }
        return pts;
    }
    static crop(line, size, index = 0, cropAsCircle = true) {
        let tdx = (index === 0) ? 1 : 0;
        let ls = line[tdx].$subtract(line[index]);
        if (ls[0] === 0 || size[0] === 0)
            return line[index];
        if (cropAsCircle) {
            let d = ls.unit().multiply(size[1]);
            return line[index].$add(d);
        }
        else {
            let rect = Rectangle.fromCenter(line[index], size);
            let sides = Rectangle.sides(rect);
            let sideIdx = 0;
            if (Math.abs(ls[1] / ls[0]) > Math.abs(size[1] / size[0])) {
                sideIdx = (ls[1] < 0) ? 0 : 2;
            }
            else {
                sideIdx = (ls[0] < 0) ? 3 : 1;
            }
            return Line.intersectRay2D(sides[sideIdx], line);
        }
    }
    static marker(line, size, graphic = ("arrow" || "line"), atTail = true) {
        let h = atTail ? 0 : 1;
        let t = atTail ? 1 : 0;
        let unit = line[h].$subtract(line[t]);
        if (unit.magnitudeSq() === 0)
            return new Group();
        unit.unit();
        let ps = Geom.perpendicular(unit).multiply(size[0]).add(line[t]);
        if (graphic == "arrow") {
            ps.add(unit.$multiply(size[1]));
            return new Group(line[t], ps[0], ps[1]);
        }
        else {
            return new Group(ps[0], ps[1]);
        }
    }
    static toRect(line) {
        return new Group(line[0].$min(line[1]), line[0].$max(line[1]));
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
        let s = Rectangle.size(pts);
        let m = (enclose) ? s.maxValue().value : s.minValue().value;
        return Rectangle.fromCenter(Rectangle.center(pts), m, m);
    }
    static size(pts) {
        return pts[0].$max(pts[1]).subtract(pts[0].$min(pts[1]));
    }
    static center(pts) {
        let min = pts[0].$min(pts[1]);
        let max = pts[0].$max(pts[1]);
        return min.add(max.$subtract(min).divide(2));
    }
    static corners(rect) {
        let p0 = rect[0].$min(rect[1]);
        let p2 = rect[0].$max(rect[1]);
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
        let merged = Util.flatten(rects, false);
        let min = Pt.make(2, Number.MAX_VALUE);
        let max = Pt.make(2, Number.MIN_VALUE);
        for (let i = 0, len = merged.length; i < len; i++) {
            for (let k = 0; k < 2; k++) {
                min[k] = Math.min(min[k], merged[i][k]);
                max[k] = Math.max(max[k], merged[i][k]);
            }
        }
        return new Group(min, max);
    }
    static polygon(rect) {
        return Rectangle.corners(rect);
    }
    static quadrants(rect, center) {
        let corners = Rectangle.corners(rect);
        let _center = (center != undefined) ? new Pt(center) : Rectangle.center(rect);
        return corners.map((c) => new Group(c, _center).boundingBox());
    }
    static halves(rect, ratio = 0.5, asRows = false) {
        let min = rect[0].$min(rect[1]);
        let max = rect[0].$max(rect[1]);
        let mid = (asRows) ? Num.lerp(min[1], max[1], ratio) : Num.lerp(min[0], max[0], ratio);
        return (asRows)
            ? [new Group(min, new Pt(max[0], mid)), new Group(new Pt(min[0], mid), max)]
            : [new Group(min, new Pt(mid, max[1])), new Group(new Pt(mid, min[1]), max)];
    }
    static withinBound(rect, pt) {
        return Geom.withinBound(pt, rect[0], rect[1]);
    }
    static hasIntersectRect2D(rect1, rect2, resetBoundingBox = false) {
        if (resetBoundingBox) {
            rect1 = Geom.boundingBox(rect1);
            rect2 = Geom.boundingBox(rect2);
        }
        if (rect1[0][0] > rect2[1][0] || rect2[0][0] > rect1[1][0])
            return false;
        if (rect1[0][1] > rect2[1][1] || rect2[0][1] > rect1[1][1])
            return false;
        return true;
    }
    static intersectRect2D(rect1, rect2) {
        if (!Rectangle.hasIntersectRect2D(rect1, rect2))
            return new Group();
        return Line.intersectLines2D(Rectangle.sides(rect1), Rectangle.sides(rect2));
    }
}
export class Circle {
    static fromRect(pts, enclose = false) {
        let r = 0;
        let min = r = Rectangle.size(pts).minValue().value / 2;
        if (enclose) {
            let max = Rectangle.size(pts).maxValue().value / 2;
            r = Math.sqrt(min * min + max * max);
        }
        else {
            r = min;
        }
        return new Group(Rectangle.center(pts), new Pt(r, r));
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
        let d = pts[0].$subtract(pt);
        return d.dot(d) + threshold < pts[1].x * pts[1].x;
    }
    static intersectRay2D(pts, ray) {
        let d = ray[0].$subtract(ray[1]);
        let f = pts[0].$subtract(ray[0]);
        let a = d.dot(d);
        let b = f.dot(d);
        let c = f.dot(f) - pts[1].x * pts[1].x;
        let p = b / a;
        let q = c / a;
        let disc = p * p - q;
        if (disc < 0) {
            return new Group();
        }
        else {
            let discSqrt = Math.sqrt(disc);
            let t1 = -p + discSqrt;
            let p1 = ray[0].$subtract(d.$multiply(t1));
            if (disc === 0)
                return new Group(p1);
            let t2 = -p - discSqrt;
            let p2 = ray[0].$subtract(d.$multiply(t2));
            return new Group(p1, p2);
        }
    }
    static intersectLine2D(pts, line) {
        let ps = Circle.intersectRay2D(pts, line);
        let g = new Group();
        if (ps.length > 0) {
            for (let i = 0, len = ps.length; i < len; i++) {
                if (Rectangle.withinBound(line, ps[i]))
                    g.push(ps[i]);
            }
        }
        return g;
    }
    static intersectCircle2D(pts, circle) {
        let dv = circle[0].$subtract(pts[0]);
        let dr2 = dv.magnitudeSq();
        let dr = Math.sqrt(dr2);
        let ar = pts[1].x;
        let br = circle[1].x;
        let ar2 = ar * ar;
        let br2 = br * br;
        if (dr > ar + br) {
            return new Group();
        }
        else if (dr < Math.abs(ar - br)) {
            return new Group(pts[0].clone());
        }
        else {
            let a = (ar2 - br2 + dr2) / (2 * dr);
            let h = Math.sqrt(ar2 - a * a);
            let p = dv.$multiply(a / dr).add(pts[0]);
            return new Group(new Pt(p.x + h * dv.y / dr, p.y - h * dv.x / dr), new Pt(p.x - h * dv.y / dr, p.y + h * dv.x / dr));
        }
    }
    static intersectRect2D(pts, rect) {
        let sides = Rectangle.sides(rect);
        let g = [];
        for (let i = 0, len = sides.length; i < len; i++) {
            let ps = Circle.intersectLine2D(pts, sides[i]);
            if (ps.length > 0)
                g.push(ps);
        }
        return Util.flatten(g);
    }
    static toRect(pts, within = false) {
        let r = pts[1][0];
        if (within) {
            let half = Math.sqrt(r * r) / 2;
            return new Group(pts[0].$subtract(half), pts[0].$add(half));
        }
        else {
            return new Group(pts[0].$subtract(r), pts[0].$add(r));
        }
    }
    static toTriangle(pts, within = true) {
        if (within) {
            let ang = -Math.PI / 2;
            let inc = Math.PI * 2 / 3;
            let g = new Group();
            for (let i = 0; i < 3; i++) {
                g.push(pts[0].clone().toAngle(ang, pts[1][0], true));
                ang += inc;
            }
            return g;
        }
        else {
            return Triangle.fromCenter(pts[0], pts[1][0]);
        }
    }
}
export class Triangle {
    static fromRect(rect) {
        let top = rect[0].$add(rect[1]).divide(2);
        top.y = rect[0][1];
        let left = rect[1].clone();
        left.x = rect[0][0];
        return new Group(top, rect[1].clone(), left);
    }
    static fromCircle(circle) {
        return Circle.toTriangle(circle, true);
    }
    static fromCenter(pt, size) {
        return Triangle.fromCircle(Circle.fromCenter(pt, size));
    }
    static medial(pts) {
        if (pts.length < 3)
            return _errorLength(new Group(), 3);
        return Polygon.midpoints(pts, true);
    }
    static oppositeSide(pts, index) {
        if (pts.length < 3)
            return _errorLength(new Group(), 3);
        if (index === 0) {
            return Group.fromPtArray([pts[1], pts[2]]);
        }
        else if (index === 1) {
            return Group.fromPtArray([pts[0], pts[2]]);
        }
        else {
            return Group.fromPtArray([pts[0], pts[1]]);
        }
    }
    static altitude(pts, index) {
        let opp = Triangle.oppositeSide(pts, index);
        if (opp.length > 1) {
            return new Group(pts[index], Line.perpendicularFromPt(opp, pts[index]));
        }
        else {
            return new Group();
        }
    }
    static orthocenter(pts) {
        if (pts.length < 3)
            return _errorLength(undefined, 3);
        let a = Triangle.altitude(pts, 0);
        let b = Triangle.altitude(pts, 1);
        return Line.intersectRay2D(a, b);
    }
    static incenter(pts) {
        if (pts.length < 3)
            return _errorLength(undefined, 3);
        let a = Polygon.bisector(pts, 0).add(pts[0]);
        let b = Polygon.bisector(pts, 1).add(pts[1]);
        return Line.intersectRay2D(new Group(pts[0], a), new Group(pts[1], b));
    }
    static incircle(pts, center) {
        let c = (center) ? center : Triangle.incenter(pts);
        let area = Polygon.area(pts);
        let perim = Polygon.perimeter(pts, true);
        let r = 2 * area / perim.total;
        return Circle.fromCenter(c, r);
    }
    static circumcenter(pts) {
        let md = Triangle.medial(pts);
        let a = [md[0], Geom.perpendicular(pts[0].$subtract(md[0])).p1.$add(md[0])];
        let b = [md[1], Geom.perpendicular(pts[1].$subtract(md[1])).p1.$add(md[1])];
        return Line.intersectRay2D(a, b);
    }
    static circumcircle(pts, center) {
        let c = (center) ? center : Triangle.circumcenter(pts);
        let r = pts[0].$subtract(c).magnitude();
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
    static lineAt(pts, idx) {
        if (idx < 0 || idx >= pts.length)
            throw new Error("index out of the Polygon's range");
        return new Group(pts[idx], (idx === pts.length - 1) ? pts[0] : pts[idx + 1]);
    }
    static lines(pts, closePath = true) {
        if (pts.length < 2)
            return _errorLength(new Group(), 2);
        let sp = Util.split(pts, 2, 1);
        if (closePath)
            sp.push(new Group(pts[pts.length - 1], pts[0]));
        return sp.map((g) => g);
    }
    static midpoints(pts, closePath = false, t = 0.5) {
        if (pts.length < 2)
            return _errorLength(new Group(), 2);
        let sides = Polygon.lines(pts, closePath);
        let mids = sides.map((s) => Geom.interpolate(s[0], s[1], t));
        return mids;
    }
    static adjacentSides(pts, index, closePath = false) {
        if (pts.length < 2)
            return _errorLength(new Group(), 2);
        if (index < 0 || index >= pts.length)
            return _errorOutofBound(new Group(), index);
        let gs = [];
        let left = index - 1;
        if (closePath && left < 0)
            left = pts.length - 1;
        if (left >= 0)
            gs.push(new Group(pts[index], pts[left]));
        let right = index + 1;
        if (closePath && right > pts.length - 1)
            right = 0;
        if (right <= pts.length - 1)
            gs.push(new Group(pts[index], pts[right]));
        return gs;
    }
    static bisector(pts, index) {
        let sides = Polygon.adjacentSides(pts, index, true);
        if (sides.length >= 2) {
            let a = sides[0][1].$subtract(sides[0][0]).unit();
            let b = sides[1][1].$subtract(sides[1][0]).unit();
            return a.add(b).divide(2);
        }
        else {
            return undefined;
        }
    }
    static perimeter(pts, closePath = false) {
        if (pts.length < 2)
            return _errorLength(new Group(), 2);
        let lines = Polygon.lines(pts, closePath);
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
        if (pts.length < 3)
            return _errorLength(new Group(), 3);
        let det = (a, b) => a[0] * b[1] - a[1] * b[0];
        let area = 0;
        for (let i = 0, len = pts.length; i < len; i++) {
            if (i < pts.length - 1) {
                area += det(pts[i], pts[i + 1]);
            }
            else {
                area += det(pts[i], pts[0]);
            }
        }
        return Math.abs(area / 2);
    }
    static convexHull(pts, sorted = false) {
        if (pts.length < 3)
            return _errorLength(new Group(), 3);
        if (!sorted) {
            pts = pts.slice();
            pts.sort((a, b) => a[0] - b[0]);
        }
        let left = (a, b, c) => {
            return (b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1]) > 0;
        };
        let dq = [];
        let bot = pts.length - 2;
        let top = bot + 3;
        dq[bot] = pts[2];
        dq[top] = pts[2];
        if (left(pts[0], pts[1], pts[2])) {
            dq[bot + 1] = pts[0];
            dq[bot + 2] = pts[1];
        }
        else {
            dq[bot + 1] = pts[1];
            dq[bot + 2] = pts[0];
        }
        for (let i = 3, len = pts.length; i < len; i++) {
            let pt = pts[i];
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
    static network(pts, originIndex = 0) {
        let g = [];
        for (let i = 0, len = pts.length; i < len; i++) {
            if (i != originIndex)
                g.push(new Group(pts[originIndex], pts[i]));
        }
        return g;
    }
    static nearestPt(pts, pt) {
        let _near = Number.MAX_VALUE;
        let _item = -1;
        for (let i = 0, len = pts.length; i < len; i++) {
            let d = pts[i].$subtract(pt).magnitudeSq();
            if (d < _near) {
                _near = d;
                _item = i;
            }
        }
        return _item;
    }
    static projectAxis(poly, unitAxis) {
        let dot = unitAxis.dot(poly[0]);
        let d = new Pt(dot, dot);
        for (let n = 1, len = poly.length; n < len; n++) {
            dot = unitAxis.dot(poly[n]);
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
        let c = false;
        for (let i = 0, len = poly.length; i < len; i++) {
            let ln = Polygon.lineAt(poly, i);
            if (((ln[0][1] > pt[1]) != (ln[1][1] > pt[1])) &&
                (pt[0] < (ln[1][0] - ln[0][0]) * (pt[1] - ln[0][1]) / (ln[1][1] - ln[0][1]) + ln[0][0])) {
                c = !c;
            }
        }
        return c;
    }
    static hasIntersectCircle(poly, circle) {
        let info = {
            which: -1,
            dist: 0,
            normal: null,
            edge: null,
            vertex: null,
        };
        let c = circle[0];
        let r = circle[1][0];
        let minDist = Number.MAX_SAFE_INTEGER;
        for (let i = 0, len = poly.length; i < len; i++) {
            let edge = Polygon.lineAt(poly, i);
            let axis = new Pt(edge[0].y - edge[1].y, edge[1].x - edge[0].x).unit();
            let poly2 = new Group(c.$add(axis.$multiply(r)), c.$subtract(axis.$multiply(r)));
            let dist = Polygon._axisOverlap(poly, poly2, axis);
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
        let dir = c.$subtract(Polygon.centroid(poly)).dot(info.normal);
        if (dir < 0)
            info.normal.multiply(-1);
        info.dist = minDist;
        info.vertex = c;
        return info;
    }
    static hasIntersectPolygon(poly1, poly2) {
        let info = {
            which: -1,
            dist: 0,
            normal: new Pt(),
            edge: new Group(),
            vertex: new Pt()
        };
        let minDist = Number.MAX_SAFE_INTEGER;
        for (let i = 0, plen = (poly1.length + poly2.length); i < plen; i++) {
            let edge = (i < poly1.length) ? Polygon.lineAt(poly1, i) : Polygon.lineAt(poly2, i - poly1.length);
            let axis = new Pt(edge[0].y - edge[1].y, edge[1].x - edge[0].x).unit();
            let dist = Polygon._axisOverlap(poly1, poly2, axis);
            if (dist > 0) {
                return null;
            }
            else if (Math.abs(dist) < minDist) {
                info.edge = edge;
                info.normal = axis;
                minDist = Math.abs(dist);
                info.which = (i < poly1.length) ? 0 : 1;
            }
        }
        info.dist = minDist;
        let b1 = (info.which === 0) ? poly2 : poly1;
        let b2 = (info.which === 0) ? poly1 : poly2;
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
        let lp = Polygon.lines(poly1);
        let g = [];
        for (let i = 0, len = lp.length; i < len; i++) {
            let ins = Line.intersectPolygon2D(lp[i], poly2, false);
            if (ins)
                g.push(ins);
        }
        return Util.flatten(g, true);
    }
    static toRects(polys) {
        let boxes = polys.map((g) => Geom.boundingBox(g));
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
        if (index > pts.length - 1)
            return new Group();
        let _index = (i) => (i < pts.length - 1) ? i : pts.length - 1;
        let p0 = pts[index];
        index = (copyStart) ? index : index + 1;
        return new Group(p0, pts[_index(index++)], pts[_index(index++)], pts[_index(index++)]);
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
        if (pts.length < 2)
            return new Group();
        let ps = new Group();
        let ts = Curve.getSteps(steps);
        let c = Curve.controlPoints(pts, 0, true);
        for (let i = 0; i <= steps; i++) {
            ps.push(Curve.catmullRomStep(ts[i], c));
        }
        let k = 0;
        while (k < pts.length - 2) {
            let cp = Curve.controlPoints(pts, k);
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
        if (pts.length < 2)
            return new Group();
        let ps = new Group();
        let ts = Curve.getSteps(steps);
        let c = Curve.controlPoints(pts, 0, true);
        for (let i = 0; i <= steps; i++) {
            ps.push(Curve.cardinalStep(ts[i], c, tension));
        }
        let k = 0;
        while (k < pts.length - 2) {
            let cp = Curve.controlPoints(pts, k);
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
        if (pts.length < 4)
            return new Group();
        let ps = new Group();
        let ts = Curve.getSteps(steps);
        let k = 0;
        while (k < pts.length - 3) {
            let c = Curve.controlPoints(pts, k);
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
        if (pts.length < 2)
            return new Group();
        let ps = new Group();
        let ts = Curve.getSteps(steps);
        let k = 0;
        while (k < pts.length - 3) {
            let c = Curve.controlPoints(pts, k);
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