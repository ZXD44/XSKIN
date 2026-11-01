/**
 * Headless Addon Generator Core
 * Generates pure Minecraft Bedrock 1.21.10+ Standalone Skin Addons in-memory without DOM dependencies
 */
import JSZip from 'jszip';
import { AppError, ErrorCode } from '../errors/AppError.js';
import { getStandardHumanoidGeometryJson } from './humanoidGeometry.js';
import {
  BEDROCK_FORMAT_VERSIONS,
  BEDROCK_MIN_ENGINE_VERSION,
  BEDROCK_RENDER_CONTROLLER_ID,
  BEDROCK_GEOMETRY_IDS
} from '../../config/bedrock.config.js';

export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function generateDeterministicId(name, suffix) {
  const safeSlug = (name || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 14);

  return safeSlug ? `skin_${safeSlug}_${suffix}` : `skin_${suffix}`;
}

/**
 * Generate Standalone Skin Item Addon package
 * @param {Object} options
 * @param {string} options.addonName
 * @param {string} options.itemName
 * @param {number[]} [options.addonVersion]
 * @param {'head'|'suit'|'legs'|'feet'|'both'} [options.itemSlotType]
 * @param {number} [options.modelType] 1: Steve, 2: Alex, 3: Custom
 * @param {Object} [options.customGeometryJson]
 * @param {Array<{ id?: string, name: string, slot: string, group: string, skinData: Blob|ArrayBuffer|Uint8Array, iconData?: Blob|ArrayBuffer|Uint8Array, isHead?: boolean }>} options.items
 * @param {Blob|ArrayBuffer|Uint8Array} [options.packIconData]
 * @param {string} [options.bpUuid] optional explicit UUID for deterministic testing
 * @param {string} [options.rpUuid] optional explicit UUID for deterministic testing
 * @returns {Promise<{ zip: JSZip, bpFolder: string, rpFolder: string, bpUuid: string, rpUuid: string }>}
 */
export async function createStandaloneSkinAddon(options) {
  const {
    addonName,
    itemName,
    addonVersion = [1, 0, 0],
    itemSlotType = 'head',
    modelType = 1,
    customGeometryJson = null,
    items = [],
    packIconData = null,
    bpUuid = generateUUID(),
    rpUuid = generateUUID()
  } = options;

  if (!addonName || !itemName) {
    throw new AppError(ErrorCode.GENERATOR_MISSING_NAME);
  }

  if (!items || items.length === 0) {
    throw new AppError(ErrorCode.GENERATOR_MISSING_SKIN);
  }

  const zip = new JSZip();
  const bpFolder = `${addonName}_XSKIN_BP`;
  const rpFolder = `${addonName}_XSKIN_RP`;

  // Determine geometry identifier
  let geometryIdentifier = BEDROCK_GEOMETRY_IDS.ALEX;
  if (modelType === 1) geometryIdentifier = BEDROCK_GEOMETRY_IDS.STEVE;
  if (customGeometryJson) {
    const geo = customGeometryJson['minecraft:geometry']?.[0] || customGeometryJson.geometry?.[0];
    if (geo?.description?.identifier) {
      geometryIdentifier = geo.description.identifier;
    }
  }

  // 1. Behavior Pack Items
  items.forEach(item => {
    const itemJson = {
      format_version: BEDROCK_FORMAT_VERSIONS.ITEM,
      'minecraft:item': {
        description: {
          identifier: `zirconx:${item.id}`,
          menu_category: {
            category: 'equipment',
            group: item.group
          }
        },
        components: {
          'minecraft:icon': item.id,
          'minecraft:max_stack_size': 1,
          'minecraft:wearable': {
            slot: item.slot,
            protection: 0
          },
          'minecraft:display_name': {
            value: item.name
          }
        }
      }
    };
    zip.file(`${bpFolder}/items/${item.id}.json`, JSON.stringify(itemJson, null, 2));
  });

  // 2. Behavior Pack Manifest
  const bpManifest = {
    format_version: BEDROCK_FORMAT_VERSIONS.MANIFEST,
    header: {
      name: `${addonName} | สกินไอเทม ${addonVersion.join('.')}`,
      description: 'แอดออนสกินสวมใส่ สร้างโดย XSKIN Studio',
      min_engine_version: BEDROCK_MIN_ENGINE_VERSION,
      uuid: bpUuid,
      version: addonVersion
    },
    modules: [{
      type: 'data',
      uuid: generateUUID(),
      version: addonVersion
    }],
    dependencies: [{
      uuid: rpUuid,
      version: addonVersion
    }]
  };
  zip.file(`${bpFolder}/manifest.json`, JSON.stringify(bpManifest, null, 2));

  // 3. Resource Pack Custom Render Controller
  const customRenderController = {
    format_version: BEDROCK_FORMAT_VERSIONS.RENDER_CONTROLLER,
    render_controllers: {
      [BEDROCK_RENDER_CONTROLLER_ID]: {
        geometry: 'geometry.default',
        materials: [{ '*': 'material.default' }],
        textures: ['texture.default']
      }
    }
  };
  zip.file(`${rpFolder}/render_controllers/zirconx_skin.json`, JSON.stringify(customRenderController, null, 2));

  // 4. Resource Pack Attachables & Atlas
  const itemTextureJson = {
    resource_pack_name: addonName,
    texture_name: 'atlas.items',
    texture_data: {}
  };

  for (const item of items) {
    const attachableJson = {
      format_version: BEDROCK_FORMAT_VERSIONS.ATTACHABLE,
      'minecraft:attachable': {
        description: {
          identifier: `zirconx:${item.id}`,
          materials: {
            default: 'entity_alphatest',
            enchanted: 'entity_alphatest'
          },
          textures: {
            default: `textures/skin/${item.id}`,
            enchanted: 'textures/misc/enchanted_item_glint'
          },
          geometry: {
            default: geometryIdentifier
          },
          scripts: {
            scale: "c.item_slot == 'main_hand' || c.item_slot == 'off_hand' ? 0.0 : 1.0"
          },
          render_controllers: [BEDROCK_RENDER_CONTROLLER_ID]
        }
      }
    };
    zip.file(`${rpFolder}/attachables/${item.id}.json`, JSON.stringify(attachableJson, null, 2));

    itemTextureJson.texture_data[item.id] = {
      textures: [`textures/items/zirconx/${item.id}`]
    };

    // Add skin texture
    zip.file(`${rpFolder}/textures/skin/${item.id}.png`, item.skinData);

    // Add icon texture
    if (item.iconData) {
      zip.file(`${rpFolder}/textures/items/zirconx/${item.id}.png`, item.iconData);
    }
  }

  zip.file(`${rpFolder}/textures/item_texture.json`, JSON.stringify(itemTextureJson, null, 2));

  // 5. Resource Pack Manifest
  const rpManifest = {
    format_version: BEDROCK_FORMAT_VERSIONS.MANIFEST,
    header: {
      name: `${addonName} | สกินไอเทม ${addonVersion.join('.')}`,
      description: 'แอดออนสกินสวมใส่ สร้างโดย XSKIN Studio',
      min_engine_version: BEDROCK_MIN_ENGINE_VERSION,
      uuid: rpUuid,
      version: addonVersion
    },
    modules: [{
      type: 'resources',
      uuid: generateUUID(),
      version: addonVersion
    }],
    dependencies: [{
      uuid: bpUuid,
      version: addonVersion
    }]
  };
  zip.file(`${rpFolder}/manifest.json`, JSON.stringify(rpManifest, null, 2));

  // 6. Geometry definitions (Standard Bedrock Humanoid for Steve & Alex + Custom if present)
  // Ensures Minecraft Bedrock 1.21.x can resolve attachable geometry without black box paperdoll crashes
  zip.file(`${rpFolder}/models/entity/humanoid_custom.geo.json`, JSON.stringify(getStandardHumanoidGeometryJson(), null, 2));

  if (customGeometryJson) {
    const geoFileName = geometryIdentifier.replace(/^geometry\./, '') + '.geo.json';
    zip.file(`${rpFolder}/models/entity/${geoFileName}`, JSON.stringify(customGeometryJson, null, 2));
  }

  // 7. Localization texts (en_US and th_TH)
  const langLines = [
    '## XSKIN Studio Item Localization',
    `pack.name=${addonName} | สกินไอเทม ${addonVersion.join('.')}`,
    'pack.description=แอดออนสกินสวมใส่ สร้างโดย XSKIN Studio'
  ];

  for (const item of items) {
    langLines.push(`item.zirconx:${item.id}.name=${item.name}`);
    langLines.push(`item.zirconx:${item.id}=${item.name}`);
  }

  const langContent = langLines.join('\n') + '\n';
  const languagesJson = JSON.stringify(['en_US', 'th_TH'], null, 2);

  zip.file(`${rpFolder}/texts/en_US.lang`, langContent);
  zip.file(`${rpFolder}/texts/th_TH.lang`, langContent);
  zip.file(`${rpFolder}/texts/languages.json`, languagesJson);

  zip.file(`${bpFolder}/texts/en_US.lang`, langContent);
  zip.file(`${bpFolder}/texts/th_TH.lang`, langContent);
  zip.file(`${bpFolder}/texts/languages.json`, languagesJson);

  // 8. Pack icon if provided
  if (packIconData) {
    zip.file(`${bpFolder}/pack_icon.png`, packIconData);
    zip.file(`${rpFolder}/pack_icon.png`, packIconData);
  }

  return {
    zip,
    bpFolder,
    rpFolder,
    bpUuid,
    rpUuid
  };
}
