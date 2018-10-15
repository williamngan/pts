/*! Source code licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */
import { Pt, Group } from "./Pt";
import { Rectangle, Circle, Polygon } from "./Op";
export const UIShape = {
    rectangle: "rectangle", circle: "circle", polygon: "polygon", polyline: "polyline", line: "line"
};
export const UIPointerActions = {
    up: "up", down: "down", move: "move", drag: "drag", uidrag: "uidrag", drop: "drop", over: "over", out: "out", enter: "enter", leave: "leave", all: "all"
};
export class UI {
    constructor(group, shape, states = {}, id) {
        this._holds = [];
        this._group = Group.fromArray(group);
        this._shape = shape;
        this._id = id === undefined ? `ui_${(UI._counter++)}` : id;
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
    get id() { return this._id; }
    set id(d) { this._id = d; }
    get group() { return this._group; }
    set group(d) { this._group = d; }
    get shape() { return this._shape; }
    set shape(d) { this._shape = d; }
    state(key, value) {
        if (!key)
            return null;
        if (value !== undefined) {
            this._states[key] = value;
            return this;
        }
        return this._states[key];
    }
    on(key, fn) {
        if (!this._actions[key])
            this._actions[key] = [];
        return UI._addHandler(this._actions[key], fn);
    }
    off(key, which) {
        if (!this._actions[key])
            return false;
        if (which === undefined) {
            delete this._actions[key];
            return true;
        }
        else {
            return UI._removeHandler(this._actions[key], which);
        }
    }
    listen(key, p) {
        if (this._actions[key] !== undefined) {
            if (this._within(p) || this._holds.indexOf(key) >= 0) {
                UI._trigger(this._actions[key], this, p, key);
                return true;
            }
            else if (this._actions['all']) {
                UI._trigger(this._actions['all'], this, p, key);
                return true;
            }
        }
        return false;
    }
    hold(key) {
        this._holds.push(key);
        return this._holds.length - 1;
    }
    unhold(id) {
        if (id !== undefined) {
            this._holds = this._holds.splice(id, 1);
        }
        else {
            this._holds = [];
        }
    }
    static track(uis, key, p) {
        for (let i = 0, len = uis.length; i < len; i++) {
            uis[i].listen(key, p);
        }
    }
    render(fn) {
        fn(this._group, this._states);
    }
    toString() {
        return `UI ${this.group.toString}`;
    }
    _within(p) {
        let fn = null;
        if (this._shape === UIShape.rectangle) {
            fn = Rectangle.withinBound;
        }
        else if (this._shape === UIShape.circle) {
            fn = Circle.withinBound;
        }
        else if (this._shape === UIShape.polygon) {
            fn = Polygon.hasIntersectPoint;
        }
        else {
            return false;
        }
        return fn(this._group, p);
    }
    static _trigger(fns, target, pt, type) {
        if (fns) {
            for (let i = 0, len = fns.length; i < len; i++) {
                if (fns[i])
                    fns[i](target, pt, type);
            }
        }
    }
    static _addHandler(fns, fn) {
        if (fn) {
            fns.push(fn);
            return fns.length - 1;
        }
        else {
            return -1;
        }
    }
    static _removeHandler(fns, index) {
        if (index >= 0 && index < fns.length) {
            let temp = fns.length;
            fns.splice(index, 1);
            return (temp > fns.length);
        }
        else {
            return false;
        }
    }
}
UI._counter = 0;
export class UIButton extends UI {
    constructor(group, shape, states = {}, id) {
        super(group, shape, states, id);
        this._hoverID = -1;
        if (states.hover === undefined)
            this._states['hover'] = false;
        if (states.clicks === undefined)
            this._states['clicks'] = 0;
        const UA = UIPointerActions;
        this.on(UA.up, (target, pt, type) => {
            this.state('clicks', this._states.clicks + 1);
        });
        this.on(UA.move, (target, pt, type) => {
            let hover = this._within(pt);
            if (hover && !this._states.hover) {
                this.state('hover', true);
                UI._trigger(this._actions[UA.enter], this, pt, UA.enter);
                var _capID = this.hold(UA.move);
                this._hoverID = this.on(UA.move, (t, p) => {
                    if (!this._within(p) && !this.state('dragging')) {
                        this.state('hover', false);
                        UI._trigger(this._actions[UA.leave], this, pt, UA.leave);
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
    onHover(enter, leave) {
        var ids = [undefined, undefined];
        if (enter)
            ids[0] = this.on(UIPointerActions.enter, enter);
        if (leave)
            ids[1] = this.on(UIPointerActions.leave, leave);
        return ids;
    }
    offHover(enterID, leaveID) {
        var s = [false, false];
        if (enterID === undefined || enterID >= 0)
            s[0] = this.off(UIPointerActions.enter, enterID);
        if (leaveID === undefined || leaveID >= 0)
            s[1] = this.off(UIPointerActions.leave, leaveID);
        return s;
    }
}
export class UIDragger extends UIButton {
    constructor(group, shape, states = {}, id) {
        super(group, shape, states, id);
        this._draggingID = -1;
        this._moveHoldID = -1;
        if (states.dragging === undefined)
            this._states['dragging'] = false;
        if (states.offset === undefined)
            this._states['offset'] = new Pt();
        const UA = UIPointerActions;
        this.on(UA.down, (target, pt, type) => {
            this.state('dragging', true);
            this.state('offset', new Pt(pt).subtract(target.group[0]));
            this._moveHoldID = this.hold(UA.move);
            this._draggingID = this.on(UA.move, (t, p) => {
                if (this.state('dragging')) {
                    UI._trigger(this._actions[UA.uidrag], t, p, UA.uidrag);
                }
            });
        });
        this.on(UA.up, (target, pt, type) => {
            this.state('dragging', false);
            this.off(UA.move, this._draggingID);
            this.unhold(this._moveHoldID);
            UI._trigger(this._actions[UA.drop], target, pt, type);
        });
    }
    onDrag(fn) {
        return this.on(UIPointerActions.uidrag, fn);
    }
    offDrag(id) {
        return this.off(UIPointerActions.uidrag, id);
    }
    onDrop(fn) {
        return this.on(UIPointerActions.drop, fn);
    }
    offDrop(id) {
        return this.off(UIPointerActions.drop, id);
    }
}
//# sourceMappingURL=UI.js.map