import { describe, expect, it } from "vitest";
import { Font, VisualForm } from "../Form";
import { Pt } from "../Pt";
import { PtLike } from "../Types";

class RecordingForm extends VisualForm {
  calls: Array<[string, ...unknown[]]> = [];

  constructor() {
    super();
    this._ready = true;
  }

  reset() {
    this.calls.push(["reset"]);
    return this;
  }

  alpha(value: number) {
    super.alpha(value);
    this.calls.push(["alpha", value]);
    return this;
  }

  fill(color: string | boolean) {
    this.filled = color !== false;
    this.calls.push(["fill", color]);
    return this;
  }

  stroke(color: string | boolean, ...rest: unknown[]) {
    this.stroked = color !== false;
    this.calls.push(["stroke", color, ...rest]);
    return this;
  }

  point(point: PtLike, radius: number, shape: string) {
    this.calls.push(["point", point, radius, shape]);
    return this;
  }

  circle(points) {
    this.calls.push(["circle", points]);
    return this;
  }

  square(points) {
    this.calls.push(["square", points]);
    return this;
  }

  arc(point, radius, startAngle, endAngle, cc = false) {
    this.calls.push(["arc", point, radius, startAngle, endAngle, cc]);
    return this;
  }

  line(points) {
    this.calls.push(["line", points]);
    return this;
  }

  polygon(points) {
    this.calls.push(["polygon", points]);
    return this;
  }

  rect(points) {
    this.calls.push(["rect", points]);
    return this;
  }

  text(point, value, maxWidth?) {
    this.calls.push(["text", point, value, maxWidth]);
    return this;
  }

  font(sizeOrFont, weight?, style?, lineHeight?, family?) {
    this.calls.push(["font", sizeOrFont, weight, style, lineHeight, family]);
    return this;
  }
}

describe("VisualForm", () => {
  it("exposes readiness and mutable fill/stroke state", () => {
    const form = new RecordingForm();
    expect(form.ready).toBe(true);
    expect(form.filled).toBe(true);
    expect(form.stroked).toBe(true);
    form.filled = false;
    form.stroked = false;
    expect([form.filled, form.stroked]).toEqual([false, false]);
    expect(form.currentFont).toBeInstanceOf(Font);
  });

  it("implements fill-only and stroke-only as fluent paired changes", () => {
    const form = new RecordingForm();
    expect(form.fillOnly("red")).toBe(form);
    expect(form.calls.slice(-2)).toEqual([
      ["stroke", false],
      ["fill", "red"],
    ]);

    expect(form.strokeOnly("blue", 2, "round", "square")).toBe(form);
    expect(form.calls.slice(-2)).toEqual([
      ["fill", false],
      ["stroke", "blue", 2, "round", "square"],
    ]);
  });

  it("dispatches bulk primitives and tolerates missing groups", () => {
    const form = new RecordingForm();
    const groups = [
      [new Pt(0, 0), new Pt(1, 1)],
      [new Pt(2, 2), new Pt(3, 3)],
    ];
    expect(form.points(groups[0], 3, "circle")).toBe(form);
    expect(form.circles(groups)).toBe(form);
    expect(form.squares(groups)).toBe(form);
    expect(form.lines(groups)).toBe(form);
    expect(form.polygons(groups)).toBe(form);
    expect(form.rects(groups)).toBe(form);
    expect(form.circles(null)).toBe(form);

    expect(form.calls.filter(([name]) => name === "point")).toHaveLength(2);
    for (const name of ["circle", "square", "line", "polygon", "rect"]) {
      expect(form.calls.filter(([call]) => call === name)).toHaveLength(2);
    }
  });

  it("keeps base no-op fluent methods usable by subclasses", () => {
    const form = new RecordingForm();
    expect(VisualForm.prototype.alpha.call(form, 0.5)).toBe(form);
    expect(VisualForm.prototype.fill.call(form, "red")).toBe(form);
    expect(VisualForm.prototype.stroke.call(form, "red")).toBe(form);
    expect(form.reset()).toBe(form);
  });
});

describe("Font", () => {
  it("formats defaults and complete CSS font values", () => {
    expect(new Font().value).toBe("  12px/1.5 sans-serif");
    const font = new Font(18, "Inter, sans-serif", "700", "italic", 1.2);
    expect(font.toString()).toBe("italic 700 18px/1.2 Inter, sans-serif");
    expect(`${font}`).toBe(font.value);
  });
});
