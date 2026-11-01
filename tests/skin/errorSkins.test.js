import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import {
  validateSkinDimensions,
  detectSolidBackground,
  smartAlphaInfer
} from '../../src/core/skin/skinProcessor.js';

describe('Error Skins Handling (s1.jpg & s2.png)', () => {
  it('correctly handles s1.jpg dimension (1452x1452)', () => {
    const dim = validateSkinDimensions(1452, 1452);
    expect(dim.isLegacy).toBe(false);
    expect(dim.needsResize).toBe(true);
    expect(dim.targetResolution).toBe(64);
  });

  it('correctly handles s2.png dimension (1254x1254)', () => {
    const dim = validateSkinDimensions(1254, 1254);
    expect(dim.isLegacy).toBe(false);
    expect(dim.needsResize).toBe(true);
    expect(dim.targetResolution).toBe(64);
  });

  it('correctly detects solid black background and infers alpha for s2.png', () => {
    const s2Path = path.resolve(__dirname, '../fixtures/error_skins/s2.png');
    if (!fs.existsSync(s2Path)) return;

    const buf = fs.readFileSync(s2Path);
    let pos = 8;
    const idat = [];
    while (pos < buf.length) {
      const len = buf.readUInt32BE(pos);
      const type = buf.toString('ascii', pos + 4, pos + 8);
      if (type === 'IDAT') idat.push(buf.slice(pos + 8, pos + 8 + len));
      pos += 12 + len;
    }
    const decompressed = zlib.inflateSync(Buffer.concat(idat));
    const w = 1254, h = 1254, bpp = 3;
    const stride = 1 + w * bpp;
    const uncompressed = Buffer.alloc(w * h * bpp);

    function paeth(a, b, c) {
      const p = a + b - c;
      const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
      if (pa <= pb && pa <= pc) return a;
      if (pb <= pc) return b;
      return c;
    }

    for (let y = 0; y < h; y++) {
      const filter = decompressed[y * stride];
      const srcRow = y * stride + 1, dstRow = y * w * bpp, prevDstRow = (y - 1) * w * bpp;
      for (let x = 0; x < w * bpp; x++) {
        const raw = decompressed[srcRow + x];
        const left = x >= bpp ? uncompressed[dstRow + x - bpp] : 0;
        const up = y > 0 ? uncompressed[prevDstRow + x] : 0;
        const upLeft = (y > 0 && x >= bpp) ? uncompressed[prevDstRow + x - bpp] : 0;
        let val = 0;
        if (filter === 0) val = raw;
        else if (filter === 1) val = raw + left;
        else if (filter === 2) val = raw + up;
        else if (filter === 3) val = raw + Math.floor((left + up) / 2);
        else if (filter === 4) val = raw + paeth(left, up, upLeft);
        uncompressed[dstRow + x] = val & 0xff;
      }
    }

    // Resample s2.png to 64x64 RGBA buffer
    const sampled64 = new Uint8ClampedArray(64 * 64 * 4);
    for (let gy = 0; gy < 64; gy++) {
      const py = Math.floor((gy * h) / 64);
      for (let gx = 0; gx < 64; gx++) {
        const px = Math.floor((gx * w) / 64);
        const pIdx = (py * w + px) * bpp;
        const outIdx = (gy * 64 + gx) * 4;

        sampled64[outIdx] = uncompressed[pIdx];
        sampled64[outIdx + 1] = uncompressed[pIdx + 1];
        sampled64[outIdx + 2] = uncompressed[pIdx + 2];
        sampled64[outIdx + 3] = 255; // solid
      }
    }

    // 1. Detect background
    const detection = detectSolidBackground(sampled64, 64, 64);
    expect(detection.isSolid).toBe(true);
    expect(detection.bgColor[0]).toBeLessThan(30); // near-black
    expect(detection.bgColor[1]).toBeLessThan(30);
    expect(detection.bgColor[2]).toBeLessThan(30);

    // 2. Infer Alpha
    const result = smartAlphaInfer(sampled64, 64, 64);
    expect(result.modified).toBe(true);
    expect(result.clearedPixels).toBeGreaterThan(100);

    // Natural void at (0, 0) should now be transparent
    expect(sampled64[3]).toBe(0);
  });
});
