/**
 * Smart Alpha Inferrer & Solid Background Cleaner
 * Detects solid background artifacts (e.g. from JPGs) and clears Outer Layer / Void regions
 * while preserving Inner Base Layers (head, body, arms, legs).
 */
import { getOuterLayerUVRectangles, getVoidUVRectangles } from './uvMap.js';
import { ALPHA_CONFIG } from '../../config/skin.config.js';

/**
 * Detect if skin has a solid background (e.g. from JPG or non-transparent PNG)
 * by sampling naturally empty void regions.
 * @param {Uint8ClampedArray|Uint8Array} data
 * @param {number} width
 * @param {number} height
 * @returns {{ isSolid: boolean, bgColor: [number, number, number]|null, confidence: number }}
 */
export function detectSolidBackground(data, width, height) {
  const scale = width / 64;
  // Key guaranteed void coordinates in 64x64 grid
  const voidPoints = [
    [0, 0], [1, 0], [2, 1], [33, 1], [58, 1],
    [58, 20], [62, 25], [60, 40], [2, 18], [58, 45]
  ];

  let transparentCount = 0;
  const opaqueColors = [];

  for (const [gx, gy] of voidPoints) {
    const px = Math.min(width - 1, Math.floor(gx * scale));
    const py = Math.min(height - 1, Math.floor(gy * scale));
    const idx = (py * width + px) * 4;
    const a = data[idx + 3];

    if (a < 50) {
      transparentCount++;
    } else if (a >= 180) {
      opaqueColors.push([data[idx], data[idx + 1], data[idx + 2]]);
    }
  }

  // If even 20% of void pixels are transparent, native transparency is present
  if (transparentCount > voidPoints.length * 0.2 || opaqueColors.length === 0) {
    return { isSolid: false, bgColor: null, confidence: 0 };
  }

  // Find dominant color cluster among void sample points (robust against gradients/glows)
  let bestCluster = [];
  for (const pivot of opaqueColors) {
    const cluster = opaqueColors.filter(c => {
      const dist = Math.sqrt((c[0] - pivot[0]) ** 2 + (c[1] - pivot[1]) ** 2 + (c[2] - pivot[2]) ** 2);
      return dist <= 38;
    });
    if (cluster.length > bestCluster.length) {
      bestCluster = cluster;
    }
  }

  if (bestCluster.length < opaqueColors.length * 0.5) {
    return { isSolid: false, bgColor: null, confidence: 0 };
  }

  const avgR = Math.round(bestCluster.reduce((s, c) => s + c[0], 0) / bestCluster.length);
  const avgG = Math.round(bestCluster.reduce((s, c) => s + c[1], 0) / bestCluster.length);
  const avgB = Math.round(bestCluster.reduce((s, c) => s + c[2], 0) / bestCluster.length);
  const confidence = bestCluster.length / voidPoints.length;

  return {
    isSolid: confidence >= 0.6,
    bgColor: [avgR, avgG, avgB],
    confidence
  };
}

/**
 * Smart Alpha Inferrer: Clears solid background artifacts from Outer Layers and Void areas
 * without touching the Inner Base Layers (head, body, arms, legs).
 * @param {Uint8ClampedArray|Uint8Array} data
 * @param {number} width
 * @param {number} height
 * @param {{ tolerance?: number, bgColor?: [number, number, number], force?: boolean, cleanVoid?: boolean }} options
 * @returns {{ modified: boolean, clearedPixels: number, bgColor: [number, number, number]|null }}
 */
export function smartAlphaInfer(data, width, height, options = {}) {
  const tolerance = options.tolerance ?? ALPHA_CONFIG.DEFAULT_TOLERANCE;
  const cleanVoid = options.cleanVoid ?? true;

  let bgColor = options.bgColor;
  if (!bgColor) {
    const detection = detectSolidBackground(data, width, height);
    if (!detection.isSolid && !options.force) {
      return { modified: false, clearedPixels: 0, bgColor: null };
    }
    bgColor = detection.bgColor || [0, 0, 0];
  }

  const [bgR, bgG, bgB] = bgColor;
  let cleared = 0;

  const isMatchingBg = (r, g, b) => {
    return Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2) <= tolerance;
  };

  // 1. Clean Outer Layers (Hat, Jacket, Sleeves, Pants)
  const outerBoxes = getOuterLayerUVRectangles(width);
  for (const box of outerBoxes) {
    const startX = Math.max(0, box.x);
    const endX = Math.min(width, box.x + box.w);
    const startY = Math.max(0, box.y);
    const endY = Math.min(height, box.y + box.h);

    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const idx = (y * width + x) * 4;
        if (data[idx + 3] > 0) {
          if (isMatchingBg(data[idx], data[idx + 1], data[idx + 2])) {
            data[idx + 3] = 0; // Set transparent!
            cleared++;
          }
        }
      }
    }
  }

  // 2. Clean Natural Void areas
  if (cleanVoid) {
    const voidBoxes = getVoidUVRectangles(width);
    for (const box of voidBoxes) {
      const startX = Math.max(0, box.x);
      const endX = Math.min(width, box.x + box.w);
      const startY = Math.max(0, box.y);
      const endY = Math.min(height, box.y + box.h);

      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          const idx = (y * width + x) * 4;
          if (data[idx + 3] > 0) {
            if (isMatchingBg(data[idx], data[idx + 1], data[idx + 2])) {
              data[idx + 3] = 0;
              cleared++;
            }
          }
        }
      }
    }
  }

  return {
    modified: cleared > 0,
    clearedPixels: cleared,
    bgColor
  };
}

/**
 * Apply Smart Alpha Inferrer directly on a 2D Canvas context
 * @param {HTMLCanvasElement|OffscreenCanvas} canvas
 * @param {Object} [options]
 */
export function applySmartAlphaInferToCanvas(canvas, options = {}) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return { modified: false, clearedPixels: 0, bgColor: null };
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const result = smartAlphaInfer(imgData.data, canvas.width, canvas.height, options);
  if (result.modified) {
    ctx.putImageData(imgData, 0, 0);
  }
  return result;
}
