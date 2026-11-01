/**
 * Standalone Skin Item Addon Generator (แอดออนสกินแบบไอเทม)
 * UI Controller orchestrating state, 3D preview, and Bedrock addon generation.
 */
import { generateRandomId, processSkinResolution, detectSlimModel, showToast, downloadMcaddonFile } from './utils.js';
import { showExportSheet } from './exportSheet.js';
import { isZipArchive, extractSkinFromArchive } from './zip.js';
import { sfx } from './sfx.js';
import { createStandaloneSkinAddon } from '../core/addon/addonGenerator.js';
import { validateAddonPackage } from '../core/validator/addonValidator.js';
import { getPartUVRectangles, applyPartClippingToContext } from '../core/skin/skinProcessor.js';
import { generateSlotItemIconDataUrl, generateSlotItemIconBlob } from '../core/skin/iconGenerator.js';
import { BEDROCK_ARMOR_SLOTS } from '../config/bedrock.config.js';
import { StandaloneState } from './standalone/standaloneState.js';
import { StandaloneViewer } from './standalone/standaloneViewer.js';
import { buildAddonItems } from './standalone/standaloneItemBuilder.js';
import { bindStandaloneEvents } from './standalone/standaloneEvents.js';

export class StandaloneAddonGenerator {
  constructor() {
    this.state = new StandaloneState();

    this.canvas = document.getElementById('standalone-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

    const container = document.getElementById('standalone-3d-container');
    const canvas3d = document.getElementById('standalone-3d-canvas');
    this.viewerController = (container && canvas3d) ? new StandaloneViewer(container, canvas3d) : null;

    this.init();
  }

  // State delegates for clean backward compatibility
  get addonVersion() { return this.state.addonVersion; }
  set addonVersion(v) { this.state.addonVersion = v; }
  get addonName() { return this.state.addonName; }
  set addonName(v) { this.state.addonName = v; }
  get itemName() { return this.state.itemName; }
  set itemName(v) { this.state.itemName = v; }
  get itemIconDataUrl() { return this.state.itemIconDataUrl; }
  set itemIconDataUrl(v) { this.state.itemIconDataUrl = v; }
  get hasCustomUploadedIcon() { return this.state.hasCustomUploadedIcon; }
  set hasCustomUploadedIcon(v) { this.state.hasCustomUploadedIcon = v; }
  get skinImg() { return this.state.skinImg; }
  set skinImg(v) { this.state.skinImg = v; }
  get skinResolution() { return this.state.skinResolution; }
  set skinResolution(v) { this.state.skinResolution = v; }
  get processedSkinBlob() { return this.state.processedSkinBlob; }
  set processedSkinBlob(v) { this.state.processedSkinBlob = v; }
  get currentSkinBlobUrl() { return this.state.currentSkinBlobUrl; }
  set currentSkinBlobUrl(v) { this.state.currentSkinBlobUrl = v; }
  get modelType() { return this.state.modelType; }
  set modelType(v) { this.state.modelType = v; }
  get customGeometryJson() { return this.state.customGeometryJson; }
  set customGeometryJson(v) { this.state.customGeometryJson = v; }
  get itemSlotType() { return this.state.itemSlotType; }
  set itemSlotType(v) { this.state.itemSlotType = v; }
  get parts() { return this.state.parts; }
  set parts(v) { this.state.parts = v; }
  get rawInputImg() { return this.state.rawInputImg; }
  set rawInputImg(v) { this.state.rawInputImg = v; }
  get autofixEnabled() { return this.state.autofixEnabled; }
  set autofixEnabled(v) { this.state.autofixEnabled = v; }
  get isAlphaInferred() { return this.state.isAlphaInferred; }
  set isAlphaInferred(v) { this.state.isAlphaInferred = v; }

  get viewer() {
    return this.viewerController?.viewer || null;
  }

  init() {
    bindStandaloneEvents(this);
  }

  syncPartCheckboxes() {
    ['head', 'body', 'arms', 'legs'].forEach(part => {
      const cb = document.getElementById(`standalone-part-${part}`);
      if (cb) cb.checked = this.parts[part];
      const parent = cb?.closest('.part-toggle-item');
      if (parent) parent.classList.toggle('checked', this.parts[part]);
    });
  }

  handleIconUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 16;
        canvas.height = 16;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, 0, 0, 16, 16);
        this.itemIconDataUrl = canvas.toDataURL('image/png');
        this.hasCustomUploadedIcon = true;

        const removeBtn = document.getElementById('standalone-remove-icon-btn');
        if (removeBtn) removeBtn.style.display = 'inline-flex';
        this.updateDynamicItemIcon();
        showToast('อัพโหลดไอคอนเรียบร้อย', 'success');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }

  async handleSkinUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Smart autofill: Extract clean filename without extension
    const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_\s]/g, '');
    const addonInput = document.getElementById('standalone-addon-name');
    const itemInput = document.getElementById('standalone-item-name');

    if (addonInput && !addonInput.value.trim()) {
      this.addonName = baseName.replace(/\s+/g, '');
      addonInput.value = this.addonName;
    }
    if (itemInput && !itemInput.value.trim()) {
      this.itemName = baseName;
      itemInput.value = this.itemName;
    }

    this.loadFile(file);
  }

  async loadFile(file) {
    try {
      if (await isZipArchive(file)) {
        showToast('กำลังแตกไฟล์ ZIP / แอดออน...', 'info');
        const extracted = await extractSkinFromArchive(file);

        if (extracted.addonName && !this.addonName) {
          this.addonName = extracted.addonName;
          const nameInput = document.getElementById('standalone-addon-name');
          if (nameInput) nameInput.value = this.addonName;
        }
        if (extracted.fileName && !this.itemName) {
          this.itemName = extracted.fileName;
          const itemInput = document.getElementById('standalone-item-name');
          if (itemInput) itemInput.value = this.itemName;
        }

        await this.loadSkinFromImage(extracted.image, `[ZIP] ${extracted.fileName}`);
        return;
      }

      const reader = new FileReader();
      reader.onload = async (event) => {
        const rawImg = new Image();
        rawImg.onload = async () => {
          await this.loadSkinFromImage(rawImg, file.name);
        };
        rawImg.onerror = () => showToast('ไฟล์ภาพไม่ถูกต้อง', 'error');
        rawImg.src = event.target.result;
      };
      reader.readAsDataURL(file);
    } catch (err) {
      showToast(err.message || 'ไม่สามารถอ่านไฟล์ได้', 'error');
    }
  }

  async loadSkinFromImage(rawImg, fileName = '', options = {}) {
    try {
      this.rawInputImg = rawImg;
      const autoInfer = options.autoInferAlpha !== undefined ? options.autoInferAlpha : this.autofixEnabled;
      const processedImg = await processSkinResolution(rawImg, { autoInferAlpha: autoInfer });
      this.skinImg = processedImg;
      this.skinResolution = processedImg.width;
      this.hasCustomUploadedIcon = false;
      this.isAlphaInferred = !!processedImg._wasAlphaInferred;

      this.canvas.width = this.skinResolution;
      this.canvas.height = this.skinResolution;

      const resBadge = document.getElementById('standalone-res-badge');
      if (resBadge) {
        resBadge.textContent = this.skinResolution > 64 ? `${this.skinResolution}x${this.skinResolution} HD` : '64x64 Standard';
        resBadge.style.display = 'inline-flex';
      }

      const autofixBtn = document.getElementById('standalone-autofix-btn');
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

      const isSlim = detectSlimModel(processedImg);
      this.modelType = isSlim ? 2 : 1;
      document.querySelectorAll('.model-select-btn').forEach(btn => {
        const m = parseInt(btn.dataset.model);
        btn.classList.toggle('active', m === this.modelType);
        btn.classList.toggle('mc-btn-primary', m === this.modelType);
      });
      this.viewerController?.setModelType(this.modelType);

      this.syncPartCheckboxes();
      this.updateDynamicItemIcon();

      document.getElementById('standalone-skin-workarea').style.display = 'flex';
      this.viewerController?.resize();

      this.renderSkin();
      sfx.playScan();
      sfx.playPop();
      if (processedImg._wasResized) {
        showToast(`ปรับขนาดสกินจาก ${processedImg._origW}x${processedImg._origH} เป็น ${this.skinResolution}x${this.skinResolution} อัตโนมัติ`, 'info');
      }
      if (processedImg._wasAlphaInferred) {
        showToast('ตรวจพบสกินพื้นหลังทึบ: ลบกล่องดำเลเยอร์นอกให้ตรงปกอัตโนมัติ ✨', 'success');
      }
      showToast(fileName ? `โหลดสกิน ${fileName} เรียบร้อย` : 'อัปโหลดสกินเรียบร้อย', 'success');
    } catch (err) {
      showToast(err.message || 'ประมวลผลสกินล้มเหลว', 'error');
    }
  }

  handleCustomGeometryUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        if (json.format_version && json['minecraft:geometry']) {
          this.customGeometryJson = json;
          const geoId = json['minecraft:geometry'][0]?.description?.identifier || 'custom';
          showToast(`โหลดโมเดล: ${geoId}`, 'success');
        } else {
          showToast('รูปแบบไฟล์ Geometry JSON ไม่ถูกต้อง', 'error');
          this.customGeometryJson = null;
        }
      } catch (_) {
        showToast('ไฟล์ JSON เสียหายหรือไม่ถูกต้อง', 'error');
        this.customGeometryJson = null;
      }
    };
    reader.readAsText(file);
  }

  getPartRectangles() {
    return getPartUVRectangles(this.skinResolution);
  }

  renderSkin() {
    if (!this.skinImg.src) return;

    this.ctx.clearRect(0, 0, this.skinResolution, this.skinResolution);
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.drawImage(this.skinImg, 0, 0, this.skinResolution, this.skinResolution);

    applyPartClippingToContext(this.ctx, this.skinResolution, this.parts);

    this.canvas.toBlob(blob => {
      const blobUrl = this.state.updateSkinBlobUrl(blob);
      if (blobUrl) {
        this.viewerController?.loadSkin(blobUrl);
      }
    }, 'image/png');
  }

  createSpecificSkinBlob(partsToKeep) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = this.skinResolution;
    tempCanvas.height = this.skinResolution;
    const tctx = tempCanvas.getContext('2d');
    tctx.imageSmoothingEnabled = false;
    tctx.drawImage(this.skinImg, 0, 0, this.skinResolution, this.skinResolution);

    applyPartClippingToContext(tctx, this.skinResolution, partsToKeep);
    return new Promise(resolve => tempCanvas.toBlob(resolve, 'image/png'));
  }

  updateDynamicItemIcon() {
    if (!this.hasCustomUploadedIcon && this.skinImg && this.skinImg.src) {
      this.itemIconDataUrl = generateSlotItemIconDataUrl(this.skinImg, this.skinResolution, this.parts, this.itemSlotType);
    }

    const slotImg = document.getElementById('standalone-slot-icon-img');
    const slotEmpty = document.getElementById('standalone-slot-icon-empty');
    const slotStatus = document.getElementById('standalone-icon-status');
    const removeBtn = document.getElementById('standalone-remove-icon-btn');

    if (slotImg && slotEmpty) {
      if (this.itemIconDataUrl) {
        slotImg.src = this.itemIconDataUrl;
        slotImg.style.display = 'block';
        slotEmpty.style.display = 'none';
        if (slotStatus) {
          slotStatus.textContent = this.hasCustomUploadedIcon
            ? 'ไอคอนกำหนดเอง (Custom 16×16)'
            : `ไอคอนสกิน (${this.itemSlotType.toUpperCase()})`;
        }
      } else {
        slotImg.style.display = 'none';
        slotEmpty.style.display = 'block';
        if (slotStatus) slotStatus.textContent = 'ไม่มีรูปไอเทม (โปร่งใส)';
      }
    }

    if (removeBtn) {
      removeBtn.style.display = this.hasCustomUploadedIcon ? 'inline-flex' : 'none';
    }
  }

  createHeadIconBlob() {
    return generateSlotItemIconBlob(this.skinImg, this.skinResolution, { head: true, body: this.parts.body }, 'head');
  }

  createSuitIconBlob() {
    return generateSlotItemIconBlob(this.skinImg, this.skinResolution, { body: true, arms: true }, 'suit');
  }

  async generateAddon() {
    if (!this.addonName || !this.itemName) {
      showToast('กรุณากรอกชื่อแอดออนและชื่อไอเทมให้ครบถ้วน', 'error');
      return;
    }
    if (!this.processedSkinBlob) {
      showToast('กรุณาอัพโหลดสกินก่อนดาวน์โหลด', 'error');
      return;
    }
    if (this.modelType === 3 && !this.customGeometryJson) {
      showToast('กรุณาอัพโหลดไฟล์โมเดล Geometry JSON', 'error');
      return;
    }

    try {
      showToast('กำลังตรวจสอบและสร้างแอดออน...', 'info');

      const items = await buildAddonItems({
        itemName: this.itemName,
        itemSlotType: this.itemSlotType,
        skinImg: this.skinImg,
        skinResolution: this.skinResolution,
        parts: this.parts,
        hasCustomUploadedIcon: this.hasCustomUploadedIcon,
        itemIconDataUrl: this.itemIconDataUrl,
        createSkinBlobFn: (partsToKeep) => this.createSpecificSkinBlob(partsToKeep)
      });

      let packIconData = null;
      try {
        packIconData = await (await fetch(`${import.meta.env.BASE_URL}templates/packicon.png`)).blob();
      } catch (_) {}

      // 1. Generate In-Memory Addon via Headless Core Generator (CORE-001)
      const generated = await createStandaloneSkinAddon({
        addonName: this.addonName,
        itemName: this.itemName,
        addonVersion: this.addonVersion,
        itemSlotType: this.itemSlotType,
        modelType: this.modelType,
        customGeometryJson: this.customGeometryJson,
        items,
        packIconData
      });

      // 2. Pre-Export Validation (CORE-002)
      const validationReport = await validateAddonPackage(generated.zip);

      if (!validationReport.valid) {
        console.error('Validation failed:', validationReport.errors);
        showToast(`ตรวจสอบพบข้อผิดพลาด: ${validationReport.errors[0]}`, 'error');
        return;
      }

      // 3. Serializer & Download (.mcaddon without duplicate .zip)
      const exported = await downloadMcaddonFile(generated.zip, `${this.addonName}_v${this.addonVersion.join('_')}`);

      sfx.playLevelUp();
      showToast('✓ ตรวจสอบความถูกต้องผ่าน ดาวน์โหลดสำเร็จ!', 'success');
      showExportSheet({ ...exported, kind: 'mcaddon' });
    } catch (err) {
      console.error(err);
      showToast(err.userMessage || err.message || 'เกิดข้อผิดพลาดในการสร้างแอดออน', 'error');
    }
  }
}
