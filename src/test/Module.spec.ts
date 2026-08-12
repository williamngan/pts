import { describe, expect, it } from "vitest";

import * as Pts from "../_module";

describe("public module entry", () => {
  it("exports every runtime subsystem", () => {
    expect(Pts).toEqual(
      expect.objectContaining({
        Bound: expect.any(Function),
        CanvasSpace: expect.any(Function),
        Color: expect.any(Function),
        Create: expect.any(Function),
        DOMSpace: expect.any(Function),
        Font: expect.any(Function),
        Img: expect.any(Function),
        Mat: expect.any(Function),
        Num: expect.any(Function),
        Particle: expect.any(Function),
        Pt: expect.any(Function),
        Rectangle: expect.any(Function),
        SVGSpace: expect.any(Function),
        Shaping: expect.any(Function),
        Sound: expect.any(Function),
        Tempo: expect.any(Function),
        Typography: expect.any(Function),
        UI: expect.any(Function),
        Util: expect.any(Function),
      }),
    );
  });
});
