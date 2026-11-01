/**
 * Minecraft Bedrock Skin Pack Generator (.mcpack)
 * Pure Client-Side Generator for Minecraft Bedrock Dressing Room / Classic Skins
 */
import { generateRandomId, showToast, downloadMcpackFile, processSkinResolution, detectSlimModel, convertImageToPngBlob } from './utils.js';
import { showExportSheet } from './exportSheet.js';
import { createSkinPack } from '../core/wardrobe/wardrobeGenerator.js';
import { parseSkinPackArchive } from '../core/wardrobe/wardrobeParser.js';
import { validateAddonPackage } from '../core/validator/addonValidator.js';
import { sfx } from './sfx.js';
import { WardrobeInspectModal } from './wardrobe/wardrobeInspectModal.js';

/**
 * Extract 16x16 pixel face avatar from skin image for UI preview
 * @param {HTMLImageElement|ImageBitmap|CanvasImageSource} img
 * @returns {string} data URL
 */
function extractFaceDataUrl(img) {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    ctx.imageSmoothingEnabled = false;
    const t = (img.width || 64) / 64;
    // Base Face (8, 8, 8, 8) -> (1, 1, 14, 14)
    ctx.drawImage(img, Math.round(8 * t), Math.round(8 * t), Math.round(8 * t), Math.round(8 * t), 1, 1, 14, 14);
    // Outer Hat (40, 8, 8, 8) -> (1, 1, 14, 14)
    ctx.drawImage(img, Math.round(40 * t), Math.round(8 * t), Math.round(8 * t), Math.round(8 * t), 1, 1, 14, 14);
    return canvas.toDataURL('image/png');
  } catch (_) {
    return '';
  }
}

export class WardrobeMultiEditor {
  constructor() {
    this.packName = 'ชุดสกินของฉัน';
    this.version = [1, 0, 0];
    this.skins = [];

    this.modal = new WardrobeInspectModal({
      onUpdate: (index, patch) => {
        if (this.skins[index]) {
          Object.assign(this.skins[index], patch);
          this.renderSkinList();
        }
      },
      onDelete: (index) => {
        this.skins.splice(index, 1);
        this.renderSkinList();
      }
    });

    this.init();
  }

  init() {
    // 1. Pack Name input
    const nameInput = document.getElementById('wardrobe-pack-name') || document.getElementById('wardrobe-detail-name');
    if (nameInput) {
      nameInput.value = this.packName;
      nameInput.addEventListener('input', (e) => {
        this.packName = e.target.value.trim() || 'ZirconX Skin Pack';
      });
    }

    // 2. Add Skins Input (Multiple PNGs)
    const addOutfitInput = document.getElementById('wardrobe-add-outfit-input');
    if (addOutfitInput) {
      addOutfitInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
          this.handleFiles(files);
        }
        e.target.value = '';
      });
    }

    // 3. Dropzone
    const dropzone = document.getElementById('wardrobe-dropzone');
    if (dropzone) {
      dropzone.addEventListener('click', () => {
        if (addOutfitInput) addOutfitInput.click();
      });

      ['dragenter', 'dragover'].forEach(name => {
        dropzone.addEventListener(name, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropzone.classList.add('drag-over');
        });
      });

      ['dragleave', 'drop'].forEach(name => {
        dropzone.addEventListener(name, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropzone.classList.remove('drag-over');
        });
      });

      dropzone.addEventListener('drop', (e) => {
        const files = Array.from(e.dataTransfer?.files || []);
        if (files.length > 0) {
          this.handleFiles(files);
        }
      });
    }

    // 4. Import .mcpack / .zip Input
    const importInput = document.getElementById('wardrobe-import-input');
    if (importInput) {
      importInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          this.handleImportMcpack(file);
        }
        e.target.value = '';
      });
    }

    // 5. Clear All Button
    const clearBtn = document.getElementById('wardrobe-clear-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (this.skins.length === 0) return;
        this.skins = [];
        this.renderSkinList();
        showToast('ล้างรายการสกินเรียบร้อย', 'info');
      });
    }

    // 6. Export Button
    const exportBtn = document.getElementById('wardrobe-export-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportMcpack());
    }

    this.renderSkinList();
  }

  openInspectModal(index) {
    this.modal.open(index, this.skins[index]);
  }

  closeInspectModal() {
    this.modal.close();
    this.renderSkinList();
  }

  async handleFiles(files) {
    // Check if user dropped a .mcpack or .zip file
    const archiveFile = files.find(f => {
      const n = f.name.toLowerCase();
      return n.endsWith('.mcpack') || n.endsWith('.zip') || n.endsWith('.mcaddon');
    });

    if (archiveFile && files.length === 1) {
      await this.handleImportMcpack(archiveFile);
      return;
    }

    const imageFiles = files.filter(f => {
      const n = f.name.toLowerCase();
      return n.endsWith('.png') || n.endsWith('.jpg') || n.endsWith('.jpeg') || f.type.startsWith('image/');
    });
    if (imageFiles.length === 0) {
      showToast('กรุณาเลือกไฟล์ภาพสกิน (.png, .jpg)', 'error');
      return;
    }

    let loaded = 0;
    const errors = [];
    for (const file of imageFiles) {
      try {
        const reader = new FileReader();
        const readPromise = new Promise((resolve, reject) => {
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = () => reject(new Error('ไม่สามารถอ่านไฟล์ได้'));
          reader.readAsDataURL(file);
        });

        const dataUrl = await readPromise;
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = () => reject(new Error('ไฟล์ภาพไม่ถูกต้องหรือชำรุด'));
          img.src = dataUrl;
        });

        const processedImg = await processSkinResolution(img);
        const isSlim = detectSlimModel(processedImg);
        const facePreviewUrl = extractFaceDataUrl(processedImg);

        // Convert any input image (PNG, JPG, WebP) to genuine PNG Blob
        const pngBlob = await convertImageToPngBlob(processedImg);
        const pngUrl = URL.createObjectURL(pngBlob);

        const cleanName = file.name
          .replace(/\.[^/.]+$/, '')
          .replace(/[_\-]+/g, ' ')
          .trim();

        const safeId = cleanName
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '_')
          .slice(0, 16) || `skin_${generateRandomId(6)}`;

        this.skins.push({
          id: safeId,
          name: cleanName || `ชุดที่ ${this.skins.length + 1}`,
          model: isSlim ? 'alex' : 'steve',
          faceUrl: facePreviewUrl,
          skinURL: pngUrl,
          blob: pngBlob
        });

        loaded++;

        if (processedImg._wasResized) {
          showToast(`ปรับขนาด ${file.name} (${processedImg._origW}x${processedImg._origH} → ${processedImg.width}x${processedImg.height}) อัตโนมัติ`, 'info');
        }
        if (processedImg._wasAlphaInferred) {
          showToast(`ลบพื้นหลังทึบของ ${file.name} ให้ตรงปกอัตโนมัติ ✨`, 'success');
        }
      } catch (err) {
        console.warn(`Failed to process skin file ${file.name}:`, err);
        errors.push(`${file.name}: ${err.message || 'ประมวลผลล้มเหลว'}`);
      }
    }

    if (loaded > 0) {
      sfx.playPop();
      showToast(`เพิ่มสกินสำเร็จ ${loaded} ชุด!`, 'success');
      this.renderSkinList();
    }

    if (errors.length > 0) {
      showToast(`พบข้อผิดพลาด: ${errors[0]}`, 'error');
    }
  }

  renderSkinList() {
    const container = document.getElementById('wardrobe-outfit-list');
    const countBadge = document.getElementById('wardrobe-skin-count');
    const emptyState = document.getElementById('wardrobe-empty-state');
    const exportBtn = document.getElementById('wardrobe-export-btn');

    if (countBadge) {
      countBadge.textContent = `${this.skins.length} ชุด`;
    }

    if (exportBtn) {
      exportBtn.disabled = this.skins.length === 0;
      exportBtn.style.opacity = this.skins.length === 0 ? '0.5' : '1';
    }

    if (!container) return;

    if (this.skins.length === 0) {
      if (emptyState) emptyState.style.display = 'block';
      container.innerHTML = '';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    container.innerHTML = '';

    this.skins.forEach((skin, index) => {
      const card = document.createElement('div');
      card.className = 'skinpack-card';

      card.innerHTML = `
        <div class="skinpack-card-avatar-wrap" title="คลิกเพื่อหมุนดูโมเดล 3D" data-inspect="${index}">
          <img src="${skin.faceUrl || skin.skinURL}" alt="${skin.name}" class="skinpack-card-avatar">
          <span class="skinpack-model-pill ${skin.model}">${skin.model === 'alex' ? 'Alex 3px' : 'Steve 4px'}</span>
        </div>
        <div class="skinpack-card-body">
          <input type="text" class="mc-input skinpack-name-input" value="${skin.name}" placeholder="ชื่อชุด...">
          <div class="skinpack-card-controls">
            <div class="skinpack-model-buttons">
              <button type="button" class="skinpack-model-toggle ${skin.model === 'steve' ? 'active' : ''}" data-model="steve">
                Steve (4px)
              </button>
              <button type="button" class="skinpack-model-toggle ${skin.model === 'alex' ? 'active' : ''}" data-model="alex">
                Alex (3px)
              </button>
            </div>
            <button type="button" class="skinpack-inspect-btn" title="หมุนดูโมเดล 3D" data-inspect="${index}">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              <span>3D</span>
            </button>
            <button type="button" class="skinpack-del-btn" title="ลบชุดนี้" data-del="${index}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      `;

      card.querySelectorAll(`[data-inspect="${index}"]`).forEach(el => {
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          this.openInspectModal(index);
        });
      });

      const nameInput = card.querySelector('.skinpack-name-input');
      if (nameInput) {
        nameInput.addEventListener('input', (e) => {
          skin.name = e.target.value.trim() || `Skin ${index + 1}`;
        });
      }

      card.querySelectorAll('.skinpack-model-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
          const m = btn.dataset.model;
          skin.model = m;
          sfx.playClick();
          this.renderSkinList();
        });
      });

      const delBtn = card.querySelector(`[data-del="${index}"]`);
      if (delBtn) {
        delBtn.addEventListener('click', () => {
          sfx.playClick();
          this.skins.splice(index, 1);
          this.renderSkinList();
          showToast('ลบสกินเรียบร้อย', 'info');
        });
      }

      container.appendChild(card);
    });
  }

  async handleImportMcpack(file) {
    try {
      showToast('กำลังแยกและอ่านไฟล์ .mcpack...', 'info');
      const parsed = await parseSkinPackArchive(file);

      if (parsed.packName) {
        this.packName = parsed.packName;
        const nameInput = document.getElementById('wardrobe-pack-name') || document.getElementById('wardrobe-detail-name');
        if (nameInput) nameInput.value = this.packName;
      }

      if (parsed.version) {
        this.version = parsed.version;
      }

      for (const s of parsed.skins) {
        if (s.skinURL) {
          const img = new Image();
          await new Promise(res => {
            img.onload = res;
            img.onerror = res;
            img.src = s.skinURL;
          });
          s.faceUrl = extractFaceDataUrl(img);
        }
      }

      this.skins = parsed.skins;
      this.renderSkinList();
      sfx.playPop();
      showToast(`โหลดสกินแพ็กสำเร็จ! พบทั้งหมด ${this.skins.length} ชุด`, 'success');
    } catch (err) {
      console.error(err);
      showToast(err.userMessage || err.message || 'ไม่สามารถเปิดไฟล์ .mcpack ได้', 'error');
    }
  }

  async exportMcpack() {
    if (this.skins.length === 0) {
      showToast('กรุณาเพิ่มสกินอย่างน้อย 1 ชุดก่อนส่งออก', 'error');
      return;
    }

    try {
      showToast('กำลังสร้างสกินแพ็ก (.mcpack)...', 'info');

      const generated = await createSkinPack({
        packName: this.packName || 'ZirconX Skin Pack',
        version: this.version || [1, 0, 0],
        skins: this.skins
      });

      const validation = await validateAddonPackage(generated.zip);
      if (!validation.valid) {
        console.error('Validation failed:', validation.errors);
        showToast(`ตรวจสอบพบข้อผิดพลาด: ${validation.errors[0]}`, 'error');
        return;
      }

      const exported = await downloadMcpackFile(generated.zip, this.packName || 'ZirconX_SkinPack');

      sfx.playLevelUp();
      showToast('✓ ตรวจสอบผ่าน ดาวน์โหลดสกินแพ็ก (.mcpack) เรียบร้อย!', 'success');
      showExportSheet({ ...exported, kind: 'mcpack' });
    } catch (err) {
      console.error(err);
      showToast(err.userMessage || err.message || 'เกิดข้อผิดพลาดในการสร้างสกินแพ็ก', 'error');
    }
  }
}
