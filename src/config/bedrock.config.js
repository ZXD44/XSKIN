/**
 * Minecraft Bedrock Configuration & Standards
 * Centralized schema versions, slot bindings, and geometry identifiers.
 */

export const BEDROCK_FORMAT_VERSIONS = {
  ITEM: '1.21.10',
  ATTACHABLE: '1.10.0',
  GEOMETRY: '1.12.0',
  RENDER_CONTROLLER: '1.10.0',
  MANIFEST: 2
};

export const BEDROCK_MIN_ENGINE_VERSION = [1, 21, 60];

export const BEDROCK_RENDER_CONTROLLER_ID = 'controller.render.zirconx_skin';

export const BEDROCK_GEOMETRY_IDS = {
  STEVE: 'geometry.humanoid.custom',
  ALEX: 'geometry.humanoid.customSlim'
};

export const BEDROCK_ARMOR_SLOTS = {
  head: {
    id: 'head',
    name: 'หมวก (Head)',
    slot: 'slot.armor.head',
    group: 'itemGroup.name.helmet',
    defaultParts: { head: true, body: true, arms: false, legs: false }
  },
  suit: {
    id: 'suit',
    name: 'เสื้อ (Chest)',
    slot: 'slot.armor.chest',
    group: 'itemGroup.name.chestplate',
    defaultParts: { head: false, body: true, arms: true, legs: false }
  },
  legs: {
    id: 'legs',
    name: 'กางเกง (Legs)',
    slot: 'slot.armor.legs',
    group: 'itemGroup.name.leggings',
    defaultParts: { head: false, body: false, arms: false, legs: true }
  },
  feet: {
    id: 'feet',
    name: 'รองเท้า (Feet)',
    slot: 'slot.armor.feet',
    group: 'itemGroup.name.boots',
    defaultParts: { head: false, body: false, arms: false, legs: true }
  },
  both: {
    id: 'both',
    name: 'แยก 2 ชิ้น (หมวก + เสื้อ)',
    defaultParts: { head: true, body: true, arms: true, legs: true }
  }
};
