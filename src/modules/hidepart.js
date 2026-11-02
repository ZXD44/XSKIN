/**
 * Hide Part Editor (ระบบสร้างสกินล่องหน)
 * Clean Architecture Orchestrator
 */
import { processSkinResolution, detectSlimModel, showToast, downloadMcpackFile } from './utils.js';
import { isZipArchive, extractSkinFromArchive } from './zip.js';
import { sfx } from './sfx.js';
import { getPartUVRectangles, applyPartClippingToContext } from '../core/skin/skinProcessor.js';
import { createSkinPack } from '../core/wardrobe/wardrobeGenerator.js';
import { validateAddonPackage } from '../core/validator/addonValidator.js';
import { showExportSheet } from './exportSheet.js';
import { HIDEPART_PRESETS } from '../config/hidepart.config.js';
import { HidepartViewerController } from './hidepart/hidepartViewer.js';
import { bindHidepartEvents } from './hidepart/hidepartEvents.js';

export class HidePartEditor {
  constructor() {
    this.canvas = document.getElementById('hidepart-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.originalImg = new Image();
    this.currentSkinBlobUrl = null;
    this.resolution = 64;
    this.modelType = 'steve'; // 'steve' (default 4px) or 'alex' (slim 3px)
    this.animMode = 'walk'; // 'walk', 'run', 'idle'

    this.parts = { head: true, body: true, arms: true, legs: true };

    this.viewerController = null;
    this.rawInputImg = null;
    this.autofixEnabled = true;
    this.isAlphaInferred = false;

    this.init();
  }

  // Getter for backwards compatibility with any external reader
  get viewer() {
    return this.viewerController?.viewer;
  }

  init() {
    this.viewerController = new HidepartViewerController(this);
    bindHidepartEvents(this);
  }

  setModel(model) {
    this.viewerController?.setModel(model);
    showToast(`สลับโมเดลเป็น ${model === 'alex' ? 'Alex (แขน 3px)' : 'Steve (แขน 4px)'}`, 'info');
  }

  setAnimation(anim) {
    this.viewerController?.setAnimation(anim);
  }

  resetCamera() {
    this.viewerController?.resetCamera();
  }

  getPartRectangles() {
    return getPartUVRectangles(this.resolution);
  }

  applyPreset(preset) {
    if (!this.originalImg.src) {
      showToast('กรุณาอัปโหลดสกินก่อนเลือกพรีเซ็ต', 'info');
      return;
    }

    const presetConfig = HIDEPART_PRESETS[preset];
    if (presetConfig) {
      this.parts = { ...presetConfig };
    }

    // Sync Checkboxes
    ['head', 'body', 'arms', 'legs'].forEach((p) => {
      const cb = document.getElementById(`hidepart-${p}`);
      if (cb) cb.checked = this.parts[p];
      const parent = cb?.closest('.part-toggle-item');
      if (parent) parent.classList.toggle('checked', this.parts[p]);
    });

    this.render();
    showToast('ปรับแต่งตามพรีเซ็ตเรียบร้อย', 'success');
  }

  async handleFileUpload(e) {
    const file = e.target?.files ? e.target.files[0] : (e.target ? null : e);
    if (!file) return;
    await this.loadFile(file);
    if (e.target?.value !== undefined) {
      e.target.value = '';
    }
  }

  async loadFile(file) {
    try {
      if (await isZipArchive(file)) {
        showToast('กำลังแตกไฟล์ ZIP / แอดออน...', 'info');
        const extracted = await extractSkinFromArchive(file);
        await this.loadSkinFromImage(extracted.image, `[ZIP] ${extracted.fileName}`);
        return;
      }

      const reader = new FileReader();
      reader.onload = async (event) => {
        const rawImg = new Image();
        rawImg.onload = async () => {
          await this.loadSkinFromImage(rawImg, file.name);
        };
        rawImg.onerror = () => {
          showToast('ไฟล์ภาพไม่ถูกต้อง', 'error');
        };
        rawImg.src = event.target.result;
      };
      reader.readAsDataURL(file);
    } catch (err) {
      showToast(err.message || 'ไม่สามารถอ่านไฟล์ได้', 'error');
    }
  }

  async loadSkinFromImage(rawImg, displayName = '', options = {}) {
    try {
      this.rawInputImg = rawImg;
      const autoInfer = options.autoInferAlpha !== undefined ? options.autoInferAlpha : this.autofixEnabled;
      const processedImg = await processSkinResolution(rawImg, { autoInferAlpha: autoInfer });
      this.originalImg = processedImg;
      this.resolution = processedImg.width;
      this.isAlphaInferred = !!processedImg._wasAlphaInferred;

      if (this.canvas) {
        this.canvas.width = this.resolution;
        this.canvas.height = this.resolution;
      }

      // Update resolution badge in DOM
      const resBadge = document.getElementById('hidepart-res-badge');
      if (resBadge) {
        resBadge.textContent = this.resolution > 64 ? `${this.resolution}x${this.resolution} HD` : '64x64 Standard';
        resBadge.style.display = 'inline-flex';
      }

      // Update autofix badge button in DOM
      const autofixBtn = document.getElementById('hidepart-autofix-btn');
      if (autofixBtn) {
        if (this.isAlphaInferred || !autoInfer) {
          autofixBtn.style.display = 'inline-flex';
          autofixBtn.classList.toggle('disabled', !this.autofixEnabled);
          const text = autofixBtn.querySelector('.autofix-text');
          if (text) text.textContent = this.autofixEnabled ? 'ซ่อมกล่องดำ: เปิด' : 'กล่องดำ: สกินเดิม';
        } else {
          autofixBtn.style.display = 'none';
        }
      }

      // Auto-detect Alex (slim 3px) vs Steve (default 4px)
      const isSlim = detectSlimModel(processedImg);
      this.modelType = isSlim ? 'alex' : 'steve';
      document.querySelectorAll('.hidepart-model-btn').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.model === this.modelType);
      });

      // Reset parts to visible
      ['head', 'body', 'arms', 'legs'].forEach((part) => {
        this.parts[part] = true;
        const cb = document.getElementById(`hidepart-${part}`);
        if (cb) cb.checked = true;
        const parent = cb?.closest('.part-toggle-item');
        if (parent) parent.classList.add('checked');
      });

      // Show work area
      const workArea = document.getElementById('hidepart-workarea');
      if (workArea) {
        workArea.style.display = 'block';
      }

      this.viewerController?.resize();
      this.render();
      sfx.playPop();

      if (processedImg._wasResized) {
        showToast(`ปรับขนาดสกินจาก ${processedImg._origW}x${processedImg._origH} เป็น ${this.resolution}x${this.resolution} อัตโนมัติ`, 'info');
      }
      if (processedImg._wasAlphaInferred) {
        showToast('ตรวจพบสกินพื้นหลังทึบ: ลบกล่องดำเลเยอร์นอกให้ตรงปกอัตโนมัติ ✨', 'success');
      }
      showToast(displayName ? `โหลดสกิน ${displayName} เรียบร้อย` : 'อัปโหลดสกินเรียบร้อย', 'success');
    } catch (err) {
      showToast(err.message || 'ประมวลผลสกินล้มเหลว', 'error');
    }
  }

  render() {
    if (!this.originalImg.src || !this.ctx || !this.canvas) return;

    this.ctx.clearRect(0, 0, this.resolution, this.resolution);
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.drawImage(this.originalImg, 0, 0, this.resolution, this.resolution);

    // Erase unchecked parts completely (both inner base and outer overlay)
    applyPartClippingToContext(this.ctx, this.resolution, this.parts);

    // Update 3D viewer & Blob URL with transparent cutouts
    this.canvas.toBlob((blob) => {
      if (!blob) return;
      if (this.currentSkinBlobUrl) URL.revokeObjectURL(this.currentSkinBlobUrl);
      this.currentSkinBlobUrl = URL.createObjectURL(blob);

      this.viewerController?.loadSkin(this.currentSkinBlobUrl, this.modelType === 'alex');
    }, 'image/png');
  }

  downloadSkinPng() {
    if (!this.currentSkinBlobUrl) {
      showToast('กรุณาอัปโหลดสกินก่อนดาวน์โหลด', 'error');
      return;
    }

    const a = document.createElement('a');
    a.href = this.currentSkinBlobUrl;
    a.download = 'zxskin_custompart.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    sfx.playLevelUp();
    showToast('ดาวน์โหลดไฟล์สกิน (.png) เรียบร้อยแล้ว', 'success');
  }

  async downloadSkinPackMcpack() {
    if (!this.currentSkinBlobUrl || !this.canvas) {
      showToast('กรุณาอัปโหลดสกินก่อนดาวน์โหลด', 'error');
      return;
    }

    try {
      showToast('กำลังแพ็กสกินล่องหนเป็น .mcpack...', 'info');

      const blob = await new Promise((resolve) => this.canvas.toBlob(resolve, 'image/png'));
      if (!blob) {
        showToast('ไม่สามารถสร้างรูปภาพสกินได้', 'error');
        return;
      }

      const packName = 'XSKIN_Invis_Pack';
      const skinName = 'สกินล่องหน (Invisible Skin)';

      const generated = await createSkinPack({
        packName,
        version: [1, 0, 0],
        description: 'สกินล่องหนสำหรับห้องแต่งตัว Bedrock สร้างโดย XSKIN Studio',
        skins: [
          {
            id: 'invis_skin',
            name: skinName,
            model: this.modelType === 'alex' ? 'alex' : 'steve',
            blob
          }
        ]
      });

      const validation = await validateAddonPackage(generated.zip);
      if (!validation.valid) {
        showToast(`ตรวจสอบพบข้อผิดพลาด: ${validation.errors[0]}`, 'error');
        return;
      }

      const exported = await downloadMcpackFile(generated.zip, packName);
      sfx.playLevelUp();
      showToast('ดาวน์โหลดสกินแพ็ก (.mcpack) เรียบร้อยแล้ว', 'success');
      showExportSheet({ ...exported, kind: 'mcpack' });
    } catch (err) {
      console.error(err);
      showToast(err.userMessage || err.message || 'เกิดข้อผิดพลาดในการสร้างสกินแพ็ก', 'error');
    }
  }
}
