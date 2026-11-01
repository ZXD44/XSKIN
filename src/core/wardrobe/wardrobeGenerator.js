/**
 * Headless Bedrock Skin Pack Generator (.mcpack)
 * Generates genuine Minecraft Bedrock Skin Packs in-memory without DOM dependencies.
 * Automatically recognized by Minecraft Bedrock Dressing Room / Classic Skins.
 */
import JSZip from 'jszip';
import { generateUUID, generateRandomId } from '../../modules/utils.js';
import { AppError, ErrorCode } from '../errors/AppError.js';
import { BEDROCK_FORMAT_VERSIONS, BEDROCK_GEOMETRY_IDS } from '../../config/bedrock.config.js';

/**
 * Generate a complete Minecraft Bedrock Skin Pack (.mcpack) in-memory
 * @param {Object} options
 * @param {string} [options.packName]
 * @param {string} [options.packId]
 * @param {Array<number>} [options.version]
 * @param {Array<number>} [options.addonVersion] legacy compat
 * @param {string} [options.description]
 * @param {Array<{ id?: string, name: string, model?: 'steve'|'alex', blob?: any, base64?: string, skinURL?: string }>} [options.skins]
 * @param {Array} [options.wardrobes] legacy compat
 * @param {any} [options.packIconData]
 * @param {string} [options.headerUuid]
 * @param {string} [options.moduleUuid]
 * @returns {Promise<{ zip: JSZip, packName: string, serializeName: string, skinCount: number, headerUuid: string, moduleUuid: string, outfitCount: number }>}
 */
export async function createSkinPack(options = {}) {
  let packName = options.packName || 'ZirconX Skin Pack';
  let version = options.version || options.addonVersion || [1, 0, 0];
  let description = options.description || 'Skin Pack created with ZirconX Skin Studio';
  let skins = options.skins || [];

  // Legacy wardrobe format adaptation: { wardrobes: [{ name, skinlist: [{ name, action, blob, base64 }] }] }
  if (Array.isArray(options.wardrobes) && options.wardrobes.length > 0) {
    skins = [];
    options.wardrobes.forEach(w => {
      if (Array.isArray(w.skinlist)) {
        w.skinlist.forEach(s => {
          skins.push({
            id: s.action || generateRandomId(8),
            name: s.name || 'Skin',
            model: s.model || 'steve',
            blob: s.blob,
            base64: s.base64,
            skinURL: s.skinURL
          });
        });
      }
    });
    if (options.wardrobes[0]?.name) {
      packName = options.wardrobes[0].name;
    }
  }

  if (!Array.isArray(skins) || skins.length === 0) {
    throw new AppError(ErrorCode.WARDROBE_EMPTY, null, 'กรุณาเพิ่มสกินอย่างน้อย 1 ชุดก่อนส่งออก');
  }

  const cleanPackName = (packName || 'ZirconX Skin Pack').trim();
  const serializeName = (options.packId || cleanPackName)
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '') || `zx_pack_${generateRandomId(6)}`;

  const headerUuid = options.headerUuid || generateUUID();
  const moduleUuid = options.moduleUuid || generateUUID();

  const zip = new JSZip();

  // 1. manifest.json with module type "skin_pack"
  const manifestJson = {
    format_version: BEDROCK_FORMAT_VERSIONS.MANIFEST,
    header: {
      name: cleanPackName,
      description: description,
      version: version,
      uuid: headerUuid,
      min_engine_version: [1, 21, 0]
    },
    modules: [
      {
        type: 'skin_pack',
        uuid: moduleUuid,
        version: version
      }
    ]
  };

  zip.file('manifest.json', JSON.stringify(manifestJson, null, 2));

  // 2. skins.json and texture files
  const skinsJson = {
    serialize_name: serializeName,
    localization_name: serializeName,
    skins: []
  };

  const langLines = [
    `skinpack.${serializeName}=${cleanPackName}`
  ];

  for (let i = 0; i < skins.length; i++) {
    const s = skins[i];
    const safeSkinId = (s.id || s.name || `skin_${i + 1}`)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '') || `skin_${i + 1}`;

    const textureFileName = `${safeSkinId}.png`;
    const isSlim = s.model === 'alex';
    const geometry = isSlim ? BEDROCK_GEOMETRY_IDS.ALEX : BEDROCK_GEOMETRY_IDS.STEVE;

    skinsJson.skins.push({
      localization_name: safeSkinId,
      geometry: geometry,
      texture: textureFileName,
      type: 'free'
    });

    const displayName = (s.name || `Skin ${i + 1}`).trim();
    langLines.push(`skin.${serializeName}.${safeSkinId}=${displayName}`);

    if (s.blob) {
      zip.file(textureFileName, s.blob);
    } else if (s.base64) {
      zip.file(textureFileName, s.base64, { base64: true });
    } else if (s.skinURL && typeof fetch === 'function') {
      try {
        const resp = await fetch(s.skinURL);
        const b = await resp.blob();
        zip.file(textureFileName, b);
      } catch (_) {}
    }
  }

  zip.file('skins.json', JSON.stringify(skinsJson, null, 2));

  // 3. texts/en_US.lang, texts/th_TH.lang, texts/languages.json
  const langContent = langLines.join('\n') + '\n';
  const languagesJson = JSON.stringify(['en_US', 'th_TH'], null, 2);

  zip.file('texts/en_US.lang', langContent);
  zip.file('texts/th_TH.lang', langContent);
  zip.file('texts/languages.json', languagesJson);

  // 4. pack_icon.png
  if (options.packIconData) {
    zip.file('pack_icon.png', options.packIconData);
  } else if (skins[0]?.blob) {
    zip.file('pack_icon.png', skins[0].blob);
  }

  return {
    zip,
    packName: cleanPackName,
    serializeName,
    skinCount: skins.length,
    headerUuid,
    moduleUuid,
    outfitCount: skins.length
  };
}

// Backward compatibility alias
export const createWardrobeAddon = createSkinPack;
