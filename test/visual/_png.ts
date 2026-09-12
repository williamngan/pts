/**
 * Minimal PNG encoder/decoder for visual regression baselines.
 *
 * Only the subset Pts' visual tests need: 8-bit RGBA, non-interlaced, single
 * IDAT stream. Kept dependency-free so baselines can be written and compared
 * in the plain node test project.
 */

import { deflateSync, inflateSync } from "node:zlib";

const SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const BYTES_PER_PIXEL = 4;

export type RGBAImage = {
  width: number;
  height: number;
  pixels: Uint8ClampedArray; // width * height * 4, row-major, top-down
};

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c;
  }
  return table;
})();

function crc32(buf: Buffer): number {
  let c = -1;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ -1) >>> 0;
}

function chunk(type: string, data: Buffer): Buffer {
  const head = Buffer.alloc(8);
  head.writeUInt32BE(data.length, 0);
  head.write(type, 4, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([head.subarray(4), data])), 0);
  return Buffer.concat([head, data, crc]);
}

/**
 * Encode an RGBA image as a PNG buffer. Rows use the Sub filter, which keeps
 * smooth horizontal gradients (ie, most colour plots) small.
 */
export function encodePNG(image: RGBAImage): Buffer {
  const { width, height, pixels } = image;
  const stride = width * BYTES_PER_PIXEL;
  const raw = Buffer.alloc(height * (stride + 1));

  for (let y = 0; y < height; y++) {
    const src = y * stride;
    const dest = y * (stride + 1);
    raw[dest] = 1; // Sub filter
    for (let i = 0; i < stride; i++) {
      const left = i >= BYTES_PER_PIXEL ? pixels[src + i - BYTES_PER_PIXEL] : 0;
      raw[dest + 1 + i] = (pixels[src + i] - left) & 0xff;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // colour type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  return Buffer.concat([
    SIGNATURE,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function paeth(a: number, b: number, c: number): number {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  return pb <= pc ? b : c;
}

/**
 * Decode a PNG buffer produced by [`encodePNG`](#link).
 */
export function decodePNG(buf: Buffer): RGBAImage {
  if (!buf.subarray(0, 8).equals(SIGNATURE)) {
    throw new Error("Not a PNG file");
  }

  let width = 0;
  let height = 0;
  const idat: Buffer[] = [];

  let offset = 8;
  while (offset < buf.length) {
    const length = buf.readUInt32BE(offset);
    const type = buf.toString("ascii", offset + 4, offset + 8);
    const data = buf.subarray(offset + 8, offset + 8 + length);
    offset += 12 + length;

    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      if (data[8] !== 8 || data[9] !== 6 || data[12] !== 0) {
        throw new Error("Only 8-bit non-interlaced RGBA PNGs are supported");
      }
    } else if (type === "IDAT") {
      idat.push(data);
    } else if (type === "IEND") {
      break;
    }
  }

  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * BYTES_PER_PIXEL;
  const pixels = new Uint8ClampedArray(height * stride);

  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const src = y * (stride + 1) + 1;
    const dest = y * stride;
    for (let i = 0; i < stride; i++) {
      const a = i >= BYTES_PER_PIXEL ? pixels[dest + i - BYTES_PER_PIXEL] : 0;
      const b = y > 0 ? pixels[dest + i - stride] : 0;
      const c =
        y > 0 && i >= BYTES_PER_PIXEL
          ? pixels[dest + i - stride - BYTES_PER_PIXEL]
          : 0;
      const x = raw[src + i];
      let value = x;
      if (filter === 1) value = x + a;
      else if (filter === 2) value = x + b;
      else if (filter === 3) value = x + ((a + b) >> 1);
      else if (filter === 4) value = x + paeth(a, b, c);
      else if (filter !== 0) throw new Error(`Unknown PNG filter ${filter}`);
      pixels[dest + i] = value & 0xff;
    }
  }

  return { width, height, pixels };
}
