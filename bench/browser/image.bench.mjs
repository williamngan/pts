/**
 * `Img`.
 *
 * Pixel reads and canvas rescaling are what sketches do per frame when they
 * sample an image.
 *
 * The fixture is generated rather than loaded from a file, so the suite has no
 * asset or network dependency. It still goes through `Img.load`, because that
 * is the only path that populates the `ImageData` the pixel functions read —
 * `Img.blank(...)` followed by `sync()` leaves it undefined until the image has
 * asynchronously reloaded itself.
 */

import { SIZES } from "../lib/fixtures.mjs";
import { sink } from "../lib/sink.mjs";
import { defineSuite } from "../lib/suite.mjs";

const SAMPLES = SIZES.M;
const IMAGE = 256;

export default defineSuite("image", (b, { Pts, fx }) => {
  const { Img, Bound, Group } = Pts;

  /** Deterministic source image as a data URL. */
  const sourceUrl = () => {
    const canvas = document.createElement("canvas");
    canvas.width = IMAGE;
    canvas.height = IMAGE;
    const ctx = canvas.getContext("2d");
    const values = fx.ptLikes("image:paint", 64, 3, 0, 255);
    for (let i = 0; i < values.length; i++) {
      const [r, g, bl] = values[i];
      ctx.fillStyle = `rgb(${r | 0},${g | 0},${bl | 0})`;
      ctx.fillRect((i % 8) * 32, Math.floor(i / 8) * 32, 32, 32);
    }
    return canvas.toDataURL();
  };

  const loadImage = () => new Img(true).load(sourceUrl());

  b.case("Img.pixel", {
    batch: SAMPLES,
    setupOnce: async () => ({
      img: await loadImage(),
      probes: fx.ptLikes("image:probes", SAMPLES, 2, 0, IMAGE - 1),
    }),
    teardown: (state) => state?.img?.cleanup(),
    run: ({ img, probes }) => {
      let acc = 0;
      for (let i = 0; i < SAMPLES; i++) acc += img.pixel(probes[i], false)[0];
      sink(acc + 1);
    },
  });

  b.case("Img.getPixel (static, on ImageData)", {
    batch: SAMPLES,
    setupOnce: async () => {
      const img = await loadImage();
      return {
        img,
        data: img.data,
        probes: fx.ptLikes("image:probes:static", SAMPLES, 2, 0, IMAGE - 1),
      };
    },
    teardown: (state) => state?.img?.cleanup(),
    run: ({ data, probes }) => {
      let acc = 0;
      for (let i = 0; i < SAMPLES; i++) acc += Img.getPixel(data, probes[i])[0];
      sink(acc + 1);
    },
  });

  b.case("Img.crop", {
    batch: 64 * 64,
    setupOnce: async () => ({
      img: await loadImage(),
      box: Bound.fromGroup(
        Group.fromArray([
          [16, 16],
          [80, 80],
        ]),
      ),
    }),
    teardown: (state) => state?.img?.cleanup(),
    run: ({ img, box }) => {
      sink(img.crop(box).width);
    },
  });

  // Resizes to an absolute size rather than a scale factor, so repeating it
  // does not shrink the image away over the course of a measurement run.
  b.case("Img.resize", {
    batch: IMAGE * IMAGE,
    setupOnce: async () => await loadImage(),
    teardown: (img) => img?.cleanup(),
    run: (img) => {
      img.resize([IMAGE, IMAGE], false);
      sink(img.canvasSize[0]);
    },
  });

  b.case("Img.filter", {
    batch: IMAGE * IMAGE,
    setupOnce: async () => await loadImage(),
    teardown: (img) => img?.cleanup(),
    run: (img) => {
      img.filter("blur(2px)");
      sink(img.canvasSize[0]);
    },
  });
});
