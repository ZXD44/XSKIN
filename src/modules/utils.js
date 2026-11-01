/**
 * Utilities for Minecraft Bedrock Skin Project
 */
import {
  validateSkinDimensions,
  convert64x32To64x64,
  detectSkinModelFromPixels,
  applySmartAlphaInferToCanvas
} from '../core/skin/skinProcessor.js';
import { AppError } from '../core/errors/AppError.js';
import { saveAs } from 'file-saver';

export function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function generateRandomId(length = 10) {
  const letters = "abcdefghijklmnopqrstuvwxyz";
  const alphanum = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = letters.charAt(Math.floor(Math.random() * letters.length));
  for (let i = 1; i < length; i++) {
    result += alphanum.charAt(Math.floor(Math.random() * alphanum.length));
  }
  return result;
}

export function showToast(message, type = "info") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(100%)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/**
 * Process skin resolution: supports standard and HD skins (512, 1024, 2048, 4096)
 * Preserves original resolution and converts legacy 64x32 skins to 64x64 with complete UV mirroring.
 * Also automatically inspects and fixes solid outer background artifacts (Smart Alpha Inferrer).
 * @param {HTMLImageElement|Image} img
 * @param {Object} [options]
 */
export function processSkinResolution(img, options = {}) {
  return new Promise((resolve, reject) => {
    try {
      const dim = validateSkinDimensions(img.width, img.height);
      const autoInferAlpha = options.autoInferAlpha !== false;

      let workCanvas;
      let wasResized = false;
      const origW = img.width;
      const origH = img.height;

      if (dim.isLegacy) {
        workCanvas = convert64x32To64x64(img);
        wasResized = true;
      } else if (dim.needsResize) {
        workCanvas = document.createElement("canvas");
        workCanvas.width = dim.targetResolution;
        workCanvas.height = dim.targetResolution;
        const rCtx = workCanvas.getContext("2d");
        if (!rCtx) throw new Error("Canvas context unavailable");
        rCtx.imageSmoothingEnabled = false;
        rCtx.drawImage(img, 0, 0, dim.targetResolution, dim.targetResolution);
        wasResized = true;
      } else {
        workCanvas = document.createElement("canvas");
        workCanvas.width = img.width;
        workCanvas.height = img.height;
        const nCtx = workCanvas.getContext("2d");
        if (!nCtx) throw new Error("Canvas context unavailable");
        nCtx.imageSmoothingEnabled = false;
        nCtx.drawImage(img, 0, 0);
      }

      let alphaResult = { modified: false, clearedPixels: 0, bgColor: null };
      if (autoInferAlpha) {
        alphaResult = applySmartAlphaInferToCanvas(workCanvas, options);
      }

      if (!wasResized && !alphaResult.modified) {
        img._wasResized = false;
        img._origW = origW;
        img._origH = origH;
        img._wasAlphaInferred = false;
        resolve(img);
        return;
      }

      const outImg = new Image();
      outImg.onload = () => {
        outImg._wasResized = wasResized;
        outImg._origW = origW;
        outImg._origH = origH;
        outImg._wasAlphaInferred = alphaResult.modified;
        outImg._clearedPixels = alphaResult.clearedPixels;
        outImg._inferredBgColor = alphaResult.bgColor;
        resolve(outImg);
      };
      outImg.onerror = () => reject(new Error("ไม่สามารถสร้างภาพสกินผลลัพธ์ได้"));
      outImg.src = workCanvas.toDataURL("image/png");
    } catch (err) {
      reject(err instanceof AppError ? new Error(err.userMessage) : err);
    }
  });
}

/**
 * Detect whether skin uses Alex (slim 3px arm) or Steve (default 4px arm).
 * Analyzes alpha channel of the 2-pixel column in the right arm area.
 */
export function detectSlimModel(img) {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    const pixelData = ctx.getImageData(0, 0, img.width, img.height).data;
    const model = detectSkinModelFromPixels(pixelData, img.width, img.height);
    return model === 'alex';
  } catch (_) {
    return false;
  }
}

/**
 * Export and trigger download of .mcaddon package without browser appending .zip
 * Forces application/octet-stream and clean .mcaddon extension.
 * @param {import('jszip')} zip
 * @param {string} rawFilename
 */
export async function downloadMcaddonFile(zip, rawFilename) {
  const cleanName = (rawFilename || 'addon')
    .trim()
    .replace(/\.zip$/i, '')
    .replace(/\.mcaddon$/i, '');

  const fileName = `${cleanName}.mcaddon`;

  // Explicitly set mimeType to 'application/octet-stream' so Chrome, Edge, and mobile browsers
  // do not treat the blob as application/zip and force-append .zip to the extension.
  const blob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/octet-stream',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });

  let fileToSave;
  try {
    fileToSave = new File([blob], fileName, { type: 'application/octet-stream' });
  } catch (_) {
    fileToSave = new Blob([blob], { type: 'application/octet-stream' });
  }

  saveAs(fileToSave, fileName);
  return { blob, fileName };
}

/**
 * Export and trigger download of .mcpack package without browser appending .zip
 * Forces application/octet-stream and clean .mcpack extension.
 * @param {import('jszip')} zip
 * @param {string} rawFilename
 */
export async function downloadMcpackFile(zip, rawFilename) {
  const cleanName = (rawFilename || 'skin_pack')
    .trim()
    .replace(/\.zip$/i, '')
    .replace(/\.mcpack$/i, '')
    .replace(/\.mcaddon$/i, '');

  const fileName = `${cleanName}.mcpack`;

  const blob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/octet-stream',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });

  let fileToSave;
  try {
    fileToSave = new File([blob], fileName, { type: 'application/octet-stream' });
  } catch (_) {
    fileToSave = new Blob([blob], { type: 'application/octet-stream' });
  }

  saveAs(fileToSave, fileName);
  return { blob, fileName };
}

/**
 * Save an already-built archive through the File System Access API so the user
 * can confirm the exact filename (guarantees no browser-appended .zip).
 * Returns false when unsupported or when the write failed, so callers can fall
 * back to the classic download.
 * @param {Blob} blob
 * @param {string} fileName
 */
export async function saveArchiveWithPicker(blob, fileName) {
  if (typeof window.showSaveFilePicker !== 'function') return false;

  const extension = fileName.slice(fileName.lastIndexOf('.'));
  try {
    const handle = await window.showSaveFilePicker({
      suggestedName: fileName,
      types: [{
        description: 'Minecraft Bedrock package',
        accept: { 'application/octet-stream': [extension] }
      }]
    });
    const writable = await handle.createWritable();
    await writable.write(blob);
    await writable.close();
    return true;
  } catch (err) {
    // A user cancel is not a failure we need to report.
    if (err && err.name === 'AbortError') return true;
    return false;
  }
}

/**
 * Hand the finished package to the native share sheet (iOS lets the user send
 * the file straight into Minecraft). Returns true when the share sheet opened.
 * @param {Blob} blob
 * @param {string} fileName
 * @param {string} title
 */
export async function shareArchive(blob, fileName, title) {
  if (typeof navigator.share !== 'function' || typeof File === 'undefined') return false;

  let file;
  try {
    file = new File([blob], fileName, { type: 'application/octet-stream' });
  } catch (_) {
    return false;
  }

  if (typeof navigator.canShare === 'function' && !navigator.canShare({ files: [file] })) {
    return false;
  }

  try {
    await navigator.share({ files: [file], title: title || fileName });
    return true;
  } catch (err) {
    if (err && err.name === 'AbortError') return true;
    return false;
  }
}

/**
 * Convert any image (PNG, JPG, WebP, etc.) to a genuine PNG Blob via offscreen canvas
 * @param {HTMLImageElement|HTMLCanvasElement|ImageBitmap} img
 * @returns {Promise<Blob>}
 */
export function convertImageToPngBlob(img) {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Canvas 2D context not available');
      }
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(blob => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert image to PNG blob'));
        }
      }, 'image/png');
    } catch (err) {
      reject(err);
    }
  });
}



