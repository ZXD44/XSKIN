/**
 * Standalone Addon Generator State Management
 * Encapsulates addon metadata, UV parts selection, and skin image buffers.
 */
import { BEDROCK_ARMOR_SLOTS } from '../../config/bedrock.config.js';

export class StandaloneState {
  constructor() {
    this.addonVersion = [1, 0, 0];
    this.addonName = '';
    this.itemName = '';
    this.itemIconDataUrl = null;
    this.hasCustomUploadedIcon = false;

    this.skinImg = new Image();
    this.skinResolution = 64;
    this.processedSkinBlob = null;
    this.currentSkinBlobUrl = null;

    this.modelType = 1; // 1: Steve (4px), 2: Alex (3px), 3: Custom
    this.customGeometryJson = null;

    this.itemSlotType = 'head';
    this.parts = { ...BEDROCK_ARMOR_SLOTS.head.defaultParts };

    this.rawInputImg = null;
    this.autofixEnabled = true;
    this.isAlphaInferred = false;
    this.antiClippingEnabled = true;
  }

  /**
   * Set slot type and automatically synchronize default parts for that slot
   * @param {string} slot 'head' | 'suit' | 'legs' | 'feet' | 'both'
   */
  setSlotType(slot) {
    this.itemSlotType = slot;
    const slotConfig = BEDROCK_ARMOR_SLOTS[slot];
    if (slotConfig?.defaultParts) {
      this.parts = { ...slotConfig.defaultParts };
    }
  }

  /**
   * Apply part preset
   * @param {'all' | 'head-hair' | 'head-only' | 'suit-only'} preset
   */
  setPreset(preset) {
    if (preset === 'all') {
      this.parts = { head: true, body: true, arms: true, legs: true };
    } else if (preset === 'head-hair') {
      this.parts = { head: true, body: true, arms: false, legs: false };
    } else if (preset === 'head-only') {
      this.parts = { head: true, body: false, arms: false, legs: false };
    } else if (preset === 'suit-only') {
      this.parts = { head: false, body: true, arms: true, legs: true };
    }
  }

  /**
   * Safely updates blob and revokes previous Object URL to prevent memory leaks
   * @param {Blob|null} blob
   * @returns {string|null}
   */
  updateSkinBlobUrl(blob) {
    this.processedSkinBlob = blob;
    if (!blob) return null;
    if (this.currentSkinBlobUrl) {
      URL.revokeObjectURL(this.currentSkinBlobUrl);
    }
    this.currentSkinBlobUrl = URL.createObjectURL(blob);
    return this.currentSkinBlobUrl;
  }
}
