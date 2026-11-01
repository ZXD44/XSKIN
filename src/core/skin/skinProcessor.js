/**
 * Core Skin Processor
 * Pure math & pixel-manipulation logic independent of DOM/Browser UI
 */
import { AppError, ErrorCode } from '../errors/AppError.js';
import { SKIN_RESOLUTIONS } from '../../config/skin.config.js';

// Re-export UV mapping and Smart Alpha utilities for backwards compatibility
export {
  getPartUVRectangles,
  getOuterLayerUVRectangles,
  getVoidUVRectangles,
  applyPartClippingToContext
} from './uvMap.js';

export {
  detectSolidBackground,
  smartAlphaInfer,
  applySmartAlphaInferToCanvas
} from './smartAlpha.js';

export const VALID_EXPLICIT_RESOLUTIONS = SKIN_RESOLUTIONS.SUPPORTED_HD;

/**
 * Validate image dimensions
 * @param {number} width
 * @param {number} height
 * @returns {{ isLegacy: boolean, needsResize: boolean, resolution: number, targetResolution: number, originalWidth?: number, originalHeight?: number }}
 */
export function validateSkinDimensions(width, height) {
  if (!width || !height) {
    throw new AppError(ErrorCode.SKIN_INVALID_DIMENSIONS, { width, height });
  }

  // Reject out of bounds (security & memory limit)
  if (width > SKIN_RESOLUTIONS.MAX || height > SKIN_RESOLUTIONS.MAX || width < SKIN_RESOLUTIONS.MIN || height < SKIN_RESOLUTIONS.MIN) {
    throw new AppError(ErrorCode.SKIN_INVALID_DIMENSIONS, { width, height });
  }

  // Legacy 64x32
  if (width === SKIN_RESOLUTIONS.STANDARD && height === SKIN_RESOLUTIONS.LEGACY_HEIGHT) {
    return { isLegacy: true, needsResize: false, resolution: SKIN_RESOLUTIONS.STANDARD, targetResolution: SKIN_RESOLUTIONS.STANDARD };
  }

  if (width !== height) {
    throw new AppError(ErrorCode.SKIN_NON_SQUARE, { width, height });
  }

  const isExactStandard =
    VALID_EXPLICIT_RESOLUTIONS.includes(width) ||
    (width % SKIN_RESOLUTIONS.STANDARD === 0 && width <= SKIN_RESOLUTIONS.MAX);

  if (isExactStandard) {
    return { isLegacy: false, needsResize: false, resolution: width, targetResolution: width };
  }

  // Arbitrary square dimensions (e.g. 1452x1452, 1254x1254, 800x800, etc.)
  // Automatically normalize to standard 64x64
  return {
    isLegacy: false,
    needsResize: true,
    resolution: SKIN_RESOLUTIONS.STANDARD,
    targetResolution: SKIN_RESOLUTIONS.STANDARD,
    originalWidth: width,
    originalHeight: height
  };
}

/**
 * Detect Alex (slim 3px) vs Steve (classic 4px) from pixel array
 * @param {Uint8ClampedArray|Uint8Array} data RGBA pixel buffer
 * @param {number} width
 * @param {number} height
 * @returns {'alex'|'steve'}
 */
export function detectSkinModelFromPixels(data, width, height) {
  const scale = width / 64;
  // Inspect the right arm unused column in 3px slim model (x: 55, y: 20..31 in 64px scale)
  const checkX = Math.round(55 * scale);
  const startY = Math.round(20 * scale);
  const endY = Math.round(32 * scale);

  let allTransparent = true;
  for (let y = startY; y < endY; y++) {
    const idx = (y * width + checkX) * 4 + 3; // Alpha channel
    if (data[idx] > 10) {
      allTransparent = false;
      break;
    }
  }

  return allTransparent ? 'alex' : 'steve';
}

/**
 * Convert legacy 64x32 skin canvas to 64x64 square canvas with complete UV limb mirroring
 * @param {CanvasImageSource} sourceImg
 * @param {HTMLCanvasElement} [targetCanvas]
 * @returns {HTMLCanvasElement}
 */
export function convert64x32To64x64(sourceImg, targetCanvas = null) {
  const canvas = targetCanvas || (typeof document !== 'undefined' ? document.createElement('canvas') : null);
  if (!canvas) {
    throw new AppError(ErrorCode.SKIN_CONVERT_FAILED, null, 'Canvas API not available');
  }

  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  // 1. Draw top half (64x32) directly
  ctx.drawImage(sourceImg, 0, 0);

  // Read source using offscreen scratch canvas
  const srcCanvas = typeof document !== 'undefined' ? document.createElement('canvas') : new OffscreenCanvas(64, 32);
  srcCanvas.width = 64;
  srcCanvas.height = 32;
  const sctx = srcCanvas.getContext('2d');
  sctx.imageSmoothingEnabled = false;
  sctx.drawImage(sourceImg, 0, 0);

  const copyFlipped = (sx, sy, w, h, dx, dy) => {
    ctx.save();
    ctx.translate(dx + w, dy);
    ctx.scale(-1, 1);
    ctx.drawImage(srcCanvas, sx, sy, w, h, 0, 0, w, h);
    ctx.restore();
  };

  // 2. Mirror Right Leg (0, 16, 16, 16) -> Left Leg (16, 48, 16, 16)
  copyFlipped(4, 16, 4, 4, 20, 48);  // Top
  copyFlipped(8, 16, 4, 4, 24, 48);  // Bottom
  copyFlipped(0, 20, 4, 12, 24, 52); // Outside -> Inside
  copyFlipped(4, 20, 4, 12, 20, 52); // Front -> Front
  copyFlipped(8, 20, 4, 12, 16, 52); // Inside -> Outside
  copyFlipped(12, 20, 4, 12, 28, 52);// Back -> Back

  // 3. Mirror Right Arm (40, 16, 16, 16) -> Left Arm (32, 48, 16, 16)
  copyFlipped(44, 16, 4, 4, 36, 48); // Top
  copyFlipped(48, 16, 4, 4, 40, 48); // Bottom
  copyFlipped(40, 20, 4, 12, 40, 52);// Outside -> Inside
  copyFlipped(44, 20, 4, 12, 36, 52);// Front -> Front
  copyFlipped(48, 20, 4, 12, 32, 52);// Inside -> Outside
  copyFlipped(52, 20, 4, 12, 44, 52);// Back -> Back

  return canvas;
}
