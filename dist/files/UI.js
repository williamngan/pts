"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Op_1 = require("./Op");
/**
 * An enumeration of different UI types
 */
var UIShape;
(function (UIShape) {
    UIShape[UIShape["Rectangle"] = 0] = "Rectangle";
    UIShape[UIShape["Circle"] = 1] = "Circle";
    UIShape[UIShape["Polygon"] = 2] = "Polygon";
    UIShape[UIShape["Polyline"] = 3] = "Polyline";
    UIShape[UIShape["Line"] = 4] = "Line";
})(UIShape = exports.UIShape || (exports.UIShape = {}));
exports.UIPointerActions = {
    up: "up", down: "down", move: "move", drag: "drag", drop: "drop", over: "over", out: "out"
};
class UI {
    /**
     * Wrap an UI insider a group
     */
    constructor(group, shape, states, id) {
        this.group = group;
        this.shape = shape;
        this._id = id;
        this._states = states;
        this._actions = {};
    }
    /**
     * Get and set uique id
     */
    get id() { return this._id; }
    set id(d) { this._id = d; }
    /**
     * Get a state
     * @param key state's name
     */
    state(key) {
        return this._states[key] || false;
    }
    /**
     * Add an event handler
     * @param key event key
     * @param fn handler function
     */
    on(key, fn) {
        this._actions[key] = fn;
        return this;
    }
    /**
     * Remove an event handler
     * @param key even key
     * @param fn
     */
    off(key) {
        delete this._actions[key];
        return this;
    }
    /**
     * Listen for interactions and trigger action handlers
     * @param key action key
     * @param p point to check
     */
    listen(key, p) {
        if (this._actions[key] !== undefined) {
            if (this._trigger(p)) {
                this._actions[key](p, this, key);
                return true;
            }
        }
        return false;
    }
    /**
     * Take a custom render function to render this UI
     * @param fn render function
     */
    render(fn) {
        fn(this.group, this._states);
    }
    /**
     * Check intersection using a specific function based on UIShape
     * @param p a point to check
     */
    _trigger(p) {
        let fn = null;
        if (this.shape === UIShape.Rectangle) {
            fn = Op_1.Rectangle.withinBound;
        }
        else if (this.shape === UIShape.Circle) {
            fn = Op_1.Circle.withinBound;
        }
        else if (this.shape === UIShape.Polygon) {
            fn = Op_1.Rectangle.withinBound;
        }
        else {
            return false;
        }
        return fn(this.group, p);
    }
}
exports.UI = UI;
/**
 * A simple UI button that can track clicks and hovers
 */
class UIButton extends UI {
    constructor(group, shape, states, id) {
        super(group, shape, states, id);
        this._clicks = 0;
    }
    /**
     * Get the total number of clicks on this UIButton
     */
    get clicks() { return this._clicks; }
    /**
     * Add a click handler
     * @param fn a function to handle clicks
     */
    onClick(fn) {
        this._clicks++;
        this.on(exports.UIPointerActions.up, fn);
    }
    /**
     * Add hover handler
     * @param over a function to handle when pointer enters hover
     * @param out a function to handle when pointer exits hover
     */
    onHover(over, out) {
        this.on(exports.UIPointerActions.over, over);
        this.on(exports.UIPointerActions.out, out);
    }
}
exports.UIButton = UIButton;
//# sourceMappingURL=UI.js.map