/*! Source code licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */
import { Pt, Group } from "./Pt";
import { Rectangle, Circle, Polygon } from "./Op";
export const UIShape = {
    rectangle: "rectangle", circle: "circle", polygon: "polygon", polyline: "polyline", line: "line"
};
export const UIPointerActions = {
    up: "up", down: "down", move: "move", drag: "drag", uidrag: "uidrag", drop: "drop", uidrop: "uidrop", over: "over", out: "out", enter: "enter", leave: "leave", click: "click", contextmenu: "contextmenu", all: "all"
};
export class UI {
    constructor(group, shape, states = {}, id) {
        this._holds = new Map();
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
    on(type, fn) {
        if (!this._actions[type])
            this._actions[type] = [];
        return UI._addHandler(this._actions[type], fn);
    }
    off(type, which) {
        if (!this._actions[type])
            return false;
        if (which === undefined) {
            delete this._actions[type];
            return true;
        }
        else {
            return UI._removeHandler(this._actions[type], which);
        }
    }
    listen(type, p, evt) {
        if (this._actions[type] !== undefined) {
            if (this._within(p) || Array.from(this._holds.values()).indexOf(type) >= 0) {
                UI._trigger(this._actions[type], this, p, type, evt);
                return true;
            }
            else if (this._actions['all']) {
                UI._trigger(this._actions['all'], this, p, type, evt);
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
        if (key !== undefined) {
            this._holds.delete(key);
        }
        else {
            this._holds.clear();
        }
    }
    static track(uis, type, p, evt) {
        for (let i = 0, len = uis.length; i < len; i++) {
            uis[i].listen(type, p, evt);
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
    static _trigger(fns, target, pt, type, evt) {
        if (fns) {
            for (let i = 0, len = fns.length; i < len; i++) {
                if (fns[i])
                    fns[i](target, pt, type, evt);
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
        this.on(UA.up, (target, pt, type, evt) => {
            this.state('clicks', this._states.clicks + 1);
        });
        this.on(UA.move, (target, pt, type, evt) => {
            let hover = this._within(pt);
            if (hover && !this._states.hover) {
                this.state('hover', true);
                UI._trigger(this._actions[UA.enter], this, pt, UA.enter, evt);
                var _capID = this.hold(UA.move);
                this._hoverID = this.on(UA.move, (t, p) => {
                    if (!this._within(p) && !this.state('dragging')) {
                        this.state('hover', false);
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
        this._dropHoldID = -1;
        this._upHoldID = -1;
        if (states.dragging === undefined)
            this._states['dragging'] = false;
        if (states.moved === undefined)
            this._states['moved'] = false;
        if (states.offset === undefined)
            this._states['offset'] = new Pt();
        const UA = UIPointerActions;
        this.on(UA.down, (target, pt, type, evt) => {
            if (this._moveHoldID === -1) {
                this.state('dragging', true);
                this.state('offset', new Pt(pt).subtract(target.group[0]));
                this._moveHoldID = this.hold(UA.move);
            }
            if (this._dropHoldID === -1) {
                this._dropHoldID = this.hold(UA.drop);
            }
            if (this._upHoldID === -1) {
                this._upHoldID = this.hold(UA.up);
            }
            if (this._draggingID === -1) {
                this._draggingID = this.on(UA.move, (t, p) => {
                    if (this.state('dragging')) {
                        UI._trigger(this._actions[UA.uidrag], t, p, UA.uidrag, evt);
                        this.state('moved', true);
                    }
                });
            }
        });
        const endDrag = (target, pt, type, evt) => {
            this.state('dragging', false);
            this.off(UA.move, this._draggingID);
            this._draggingID = -1;
            this.unhold(this._moveHoldID);
            this._moveHoldID = -1;
            this.unhold(this._dropHoldID);
            this._dropHoldID = -1;
            this.unhold(this._upHoldID);
            this._upHoldID = -1;
            if (this.state('moved')) {
                UI._trigger(this._actions[UA.uidrop], target, pt, UA.uidrop, evt);
                this.state('moved', false);
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
}
//# sourceMappingURL=UI.js.map