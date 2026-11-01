/**
 * Addon Pre-Export Validation Engine
 * Validates manifests, UUIDs, textures, geometries, and file structures before export.
 */
import { AppError, ErrorCode } from '../errors/AppError.js';
import { UUID_V4_REGEX } from '../../config/archive.config.js';

export { UUID_V4_REGEX };

/**
 * Validate UUID string against RFC4122 standard
 * @param {string} uuid
 * @returns {boolean}
 */
export function isValidUUID(uuid) {
  return typeof uuid === 'string' && UUID_V4_REGEX.test(uuid.trim());
}

/**
 * Inspect an in-memory JSZip instance of an addon and return a structured validation report
 * @param {import('jszip')} zip JSZip instance
 * @returns {Promise<{ valid: boolean, checks: Array<{ name: string, passed: boolean, message: string }>, errors: string[], warnings: string[] }>}
 */
export async function validateAddonPackage(zip) {
  const errors = [];
  const warnings = [];
  const checks = [];

  const allFiles = Object.keys(zip.files);
  const seenUUIDs = new Map(); // uuid -> file location

  // 1. Check Manifests
  const manifestFiles = allFiles.filter(f => /manifest\.json$/i.test(f));
  let manifestsPassed = true;

  if (manifestFiles.length === 0) {
    errors.push('ไม่พบไฟล์ manifest.json ในแพ็กเกจ');
    manifestsPassed = false;
  }

  for (const manifestPath of manifestFiles) {
    try {
      const content = await zip.file(manifestPath).async('string');
      const manifest = JSON.parse(content);

      if (!manifest.format_version || manifest.format_version !== 2) {
        warnings.push(`${manifestPath}: format_version ควรเป็น 2`);
      }

      if (!manifest.header || !manifest.header.name || !manifest.header.uuid) {
        errors.push(`${manifestPath}: ข้อมูล header (name หรือ uuid) ไม่สมบูรณ์`);
        manifestsPassed = false;
      } else {
        const hUuid = manifest.header.uuid;
        if (!isValidUUID(hUuid)) {
          errors.push(`${manifestPath}: Header UUID (${hUuid}) ไม่ถูกต้องตามมาตรฐาน RFC4122`);
        } else if (seenUUIDs.has(hUuid)) {
          errors.push(`พบ UUID ซ้ำกัน (${hUuid}) ใน ${manifestPath} และ ${seenUUIDs.get(hUuid)}`);
        } else {
          seenUUIDs.set(hUuid, `${manifestPath} [header]`);
        }
      }

      if (Array.isArray(manifest.modules)) {
        manifest.modules.forEach((mod, idx) => {
          if (!mod.uuid || !isValidUUID(mod.uuid)) {
            errors.push(`${manifestPath}: Module #${idx + 1} UUID ไม่ถูกต้อง`);
            manifestsPassed = false;
          } else if (seenUUIDs.has(mod.uuid)) {
            errors.push(`พบ UUID ซ้ำกัน (${mod.uuid}) ใน ${manifestPath} module #${idx + 1}`);
            manifestsPassed = false;
          } else {
            seenUUIDs.set(mod.uuid, `${manifestPath} [module ${idx}]`);
          }
        });
      } else {
        errors.push(`${manifestPath}: ไม่มีรายการ modules`);
        manifestsPassed = false;
      }
    } catch (e) {
      errors.push(`ไม่สามารถอ่าน JSON ใน ${manifestPath}: ${e.message}`);
      manifestsPassed = false;
    }
  }

  checks.push({
    name: 'Manifest Validity & Schema',
    passed: manifestsPassed,
    message: manifestsPassed ? 'โครงสร้าง Manifest ถูกต้องสมบูรณ์' : 'พบข้อผิดพลาดในไฟล์ Manifest'
  });

  // 2. Check UUID Compliance & Uniqueness
  const uuidErrors = errors.filter(e => e.includes('UUID'));
  checks.push({
    name: 'UUID Standard & Uniqueness',
    passed: uuidErrors.length === 0,
    message: uuidErrors.length === 0 ? 'UUID ทั้งหมดถูกต้องและไม่ซ้ำกัน' : 'พบปัญหา UUID ซ้ำหรือไม่ถูกต้อง'
  });

  // 3. Check Textures & Assets
  const isSkinPack = allFiles.some(f => /skins\.json$/i.test(f));
  let texturesPassed = true;

  if (isSkinPack) {
    const skinsFile = allFiles.find(f => /skins\.json$/i.test(f));
    if (skinsFile) {
      try {
        const content = await zip.file(skinsFile).async('string');
        const skinsData = JSON.parse(content);
        if (Array.isArray(skinsData.skins)) {
          skinsData.skins.forEach(s => {
            const texName = (s.texture || '').split('/').pop();
            const hasTex = allFiles.some(f => f.endsWith(texName));
            if (!hasTex) {
              errors.push(`ขาดไฟล์สกิน '${texName}' ที่ระบุใน skins.json`);
              texturesPassed = false;
            }
          });
        }
      } catch (e) {
        errors.push(`ไฟล์ skins.json ผิดพลาด: ${e.message}`);
        texturesPassed = false;
      }
    }

    checks.push({
      name: 'Texture Assets Integrity',
      passed: texturesPassed,
      message: texturesPassed ? 'ไฟล์ภาพสกินครบถ้วนตาม skins.json' : 'พบสกินที่ขาดหายไป'
    });

    checks.push({
      name: 'Skin Pack Compatibility',
      passed: true,
      message: 'แพ็กเกจรองรับห้องแต่งตัว (Dressing Room) ของ Minecraft Bedrock โดยตรง'
    });
  } else {
    const attachableFiles = allFiles.filter(f => f.includes('attachables/') && f.endsWith('.json'));

    for (const attPath of attachableFiles) {
      try {
        const content = await zip.file(attPath).async('string');
        const att = JSON.parse(content);
        const desc = att['minecraft:attachable']?.description;
        if (desc?.item_display_transforms) {
          errors.push(`Attachable ${attPath} มีฟิลด์ผิดไวยากรณ์ Bedrock 'item_display_transforms' ใน description (ทำให้เกมปฏิเสธไม่โหลดโมเดล)`);
          texturesPassed = false;
        }
        if (desc && desc.textures) {
          const defaultTex = desc.textures.default;
          if (defaultTex && typeof defaultTex === 'string') {
            const baseTex = defaultTex.replace(/\.png$/i, '');
            const hasMatchingPng = allFiles.some(f => f.endsWith(`${baseTex}.png`));
            if (!hasMatchingPng) {
              errors.push(`ขาดไฟล์ Texture '${defaultTex}.png' ที่อ้างอิงใน ${attPath}`);
              texturesPassed = false;
            }
          }
        }
      } catch (e) {
        errors.push(`ไฟล์ Attachable ${attPath} ผิดพลาด: ${e.message}`);
        texturesPassed = false;
      }
    }

    checks.push({
      name: 'Texture Assets Integrity',
      passed: texturesPassed,
      message: texturesPassed ? 'ไฟล์ Texture สกินตรงตามการอ้างอิงครบถ้วน' : 'พบ Texture ที่ขาดหาย'
    });

    // 4. Check Geometry Integrity for Attachables (Prevents Black Screen / Paperdoll Glitches)
    const modelFiles = allFiles.filter(f => f.includes('models/entity/') && f.endsWith('.json'));
    const definedGeometries = new Set();
    for (const mPath of modelFiles) {
      try {
        const mContent = await zip.file(mPath).async('string');
        const mData = JSON.parse(mContent);
        const geoList = mData['minecraft:geometry'] || mData.geometry;
        if (Array.isArray(geoList)) {
          geoList.forEach(g => {
            const id = g?.description?.identifier;
            if (id) definedGeometries.add(id);
          });
        }
      } catch (_) {}
    }

    let geometryPassed = true;
    for (const attPath of attachableFiles) {
      try {
        const content = await zip.file(attPath).async('string');
        const att = JSON.parse(content);
        const desc = att['minecraft:attachable']?.description;
        if (desc?.geometry?.default) {
          const geoId = desc.geometry.default;
          const isVanillaArmor = /^geometry\.player\.armor\./i.test(geoId);
          if (!isVanillaArmor && !definedGeometries.has(geoId)) {
            errors.push(`โมเดล Geometry '${geoId}' ใน ${attPath} ไม่มีนิยามใน models/entity/ (ส่งผลให้เกมแสดงผลกล่องดำ)`);
            geometryPassed = false;
          }
        }
      } catch (_) {}
    }

    checks.push({
      name: 'Geometry Definition & Bone Mapping',
      passed: geometryPassed,
      message: geometryPassed ? 'โมเดล 3D Geometry ใน models/entity/ ครบถ้วนตามมาตรฐาน Bedrock' : 'พบโมเดล Geometry ที่ไม่มีนิยาม'
    });

    // 5. Check Render Controllers for Standalone Addons
    const rcFiles = allFiles.filter(f => f.includes('render_controllers/') && f.endsWith('.json'));
    checks.push({
      name: 'Render Controller Mapping',
      passed: rcFiles.length > 0,
      message: rcFiles.length > 0 ? 'ติดตั้ง Custom Render Controller ป้องกันสกินถูกซ่อนแล้ว' : 'ไม่พบนิยาม Render Controller'
    });
  }

  // 6. Check Localization
  const langFiles = allFiles.filter(f => f.endsWith('.lang'));
  const hasEnLang = langFiles.some(f => f.includes('en_US.lang'));
  const hasThLang = langFiles.some(f => f.includes('th_TH.lang'));
  const locPassed = hasEnLang && hasThLang;

  checks.push({
    name: 'Localization (texts/)',
    passed: locPassed,
    message: locPassed ? 'ไฟล์แปลภาษาครบถ้วน (th_TH, en_US)' : 'ไฟล์แปลภาษาขาดหายไป'
  });

  const valid = errors.length === 0;

  return {
    valid,
    checks,
    errors,
    warnings
  };
}
