/**
 * Standalone Item Builder
 * Prepares attachable item entries for Bedrock addon generation (both single-slot and split-slot).
 */
import { generateSlotItemIconBlob } from '../../core/skin/iconGenerator.js';
import { BEDROCK_ARMOR_SLOTS } from '../../config/bedrock.config.js';
import { generateRandomId } from '../utils.js';

/**
 * Builds item configurations with skins and icon blobs
 * @param {Object} params
 * @param {string} params.itemName
 * @param {string} params.itemSlotType
 * @param {HTMLImageElement|CanvasImageSource} params.skinImg
 * @param {number} params.skinResolution
 * @param {{ head: boolean, body: boolean, arms: boolean, legs: boolean }} params.parts
 * @param {boolean} params.hasCustomUploadedIcon
 * @param {string|null} params.itemIconDataUrl
 * @param {(parts: any) => Promise<Blob>} params.createSkinBlobFn
 * @returns {Promise<Array<Object>>}
 */
export async function buildAddonItems({
  itemName,
  itemSlotType,
  skinImg,
  skinResolution,
  parts,
  hasCustomUploadedIcon,
  itemIconDataUrl,
  createSkinBlobFn
}) {
  const safeSlug = (itemName || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 14);

  const uniqueSuffix = generateRandomId(6);
  const baseItemId = safeSlug ? `skin_${safeSlug}_${uniqueSuffix}` : `skin_${uniqueSuffix}`;
  const items = [];
  const slotMap = BEDROCK_ARMOR_SLOTS;

  if (itemSlotType === 'both') {
    const headSkinBlob = await createSkinBlobFn({ head: true, body: parts.body, arms: false, legs: false });
    const headIconBlob = await generateSlotItemIconBlob(skinImg, skinResolution, { head: true, body: parts.body }, 'head');
    items.push({
      id: `${baseItemId}_head`,
      name: `${itemName} (หัว)`,
      slot: 'slot.armor.head',
      group: 'itemGroup.name.helmet',
      skinData: headSkinBlob,
      iconData: headIconBlob,
      isHead: true
    });

    const suitSkinBlob = await createSkinBlobFn({ head: false, body: true, arms: parts.arms, legs: parts.legs });
    let suitIconBlob;
    if (hasCustomUploadedIcon && itemIconDataUrl) {
      suitIconBlob = await (await fetch(itemIconDataUrl)).blob();
    } else {
      suitIconBlob = await generateSlotItemIconBlob(skinImg, skinResolution, { head: false, body: true, arms: parts.arms, legs: parts.legs }, 'suit');
    }
    items.push({
      id: `${baseItemId}_suit`,
      name: `${itemName} (ชุด)`,
      slot: 'slot.armor.chest',
      group: 'itemGroup.name.chestplate',
      skinData: suitSkinBlob,
      iconData: suitIconBlob,
      isHead: false
    });
  } else {
    const currentSlot = slotMap[itemSlotType] || slotMap.head;
    const skinBlob = await createSkinBlobFn(parts);
    let iconBlob;
    if (hasCustomUploadedIcon && itemIconDataUrl) {
      iconBlob = await (await fetch(itemIconDataUrl)).blob();
    } else {
      iconBlob = await generateSlotItemIconBlob(skinImg, skinResolution, parts, itemSlotType);
    }

    items.push({
      id: `${baseItemId}_${itemSlotType}`,
      name: itemName,
      slot: currentSlot.slot,
      group: currentSlot.group,
      skinData: skinBlob,
      iconData: iconBlob,
      isHead: itemSlotType === 'head'
    });
  }

  return items;
}
