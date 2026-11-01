/**
 * XSKIN Studio - TypeScript Type Definitions
 * Pure Client-Side Minecraft Bedrock Skin & Addon Studio
 */

export type SkinModelType = 'steve' | 'alex';

export type ArmorSlot = 'head' | 'suit' | 'legs' | 'feet' | 'both';

export interface SkinPartRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface PartUVCollection {
  head: SkinPartRect[];
  body: SkinPartRect[];
  leftArm: SkinPartRect[];
  rightArm: SkinPartRect[];
  leftLeg: SkinPartRect[];
  rightLeg: SkinPartRect[];
}

export interface SkinPartSelection {
  head: boolean;
  body: boolean;
  arms: boolean;
  legs: boolean;
}

export interface StandaloneAddonConfig {
  itemName: string;
  addonName: string;
  slot: ArmorSlot;
  model: '1' | '2' | '3' | number; // 1 = steve, 2 = alex, 3 = custom
  skinDataUrl: string;
  parts: SkinPartSelection;
  version?: [number, number, number];
  iconBlob?: Blob | null;
  customGeoJson?: Record<string, any> | null;
}

export interface ValidationIssue {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface SafeZipLimits {
  maxCompressedBytes?: number;
  maxUncompressedBytes?: number;
  maxEntryCount?: number;
}

export interface WardrobeOutfit {
  id: string;
  name: string;
  skinDataUrl: string;
  slot: ArmorSlot;
  model: 'steve' | 'alex';
  parts: SkinPartSelection;
}

export interface WardrobeGroup {
  id: string;
  name: string;
  allowedGamertags: string[];
  outfits: WardrobeOutfit[];
}

export interface WardrobeState {
  version: [number, number, number];
  authors: string[];
  groups: WardrobeGroup[];
}

export interface SkinStudioState {
  currentTab: 'home' | 'hidepart' | 'standalone' | 'wardrobe' | 'guide';
  sfxEnabled: boolean;
}
