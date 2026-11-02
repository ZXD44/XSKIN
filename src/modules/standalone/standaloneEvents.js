/**
 * DOM event bindings for Standalone Addon Generator UI.
 */
import { sfx } from '../sfx.js';
import { showToast } from '../utils.js';

/**
 * Binds all DOM event listeners for the Standalone Addon Generator.
 * @param {import('../standalone.js').StandaloneAddonGenerator} controller
 */
export function bindStandaloneEvents(controller) {
  // Version inputs
  ['major', 'minor', 'patch'].forEach((v, index) => {
    const input = document.getElementById(`standalone-v-${v}`);
    if (input) {
      input.addEventListener('input', (e) => {
        let val = parseInt(e.target.value);
        if (isNaN(val) || val < 0) val = 0;
        if (val > 99) val = 99;
        controller.addonVersion[index] = val;
        e.target.value = val;
      });
    }
  });

  // Addon Name & Item Name
  const nameInput = document.getElementById('standalone-addon-name');
  if (nameInput) {
    nameInput.addEventListener('input', (e) => (controller.addonName = e.target.value.trim()));
  }

  const itemInput = document.getElementById('standalone-item-name');
  if (itemInput) {
    itemInput.addEventListener('input', (e) => (controller.itemName = e.target.value.trim()));
  }

  // Item Icon Input & Dropzone
  const iconInput = document.getElementById('standalone-icon-input');
  const iconDropzone = document.getElementById('standalone-icon-dropzone');
  if (iconInput) {
    iconInput.addEventListener('change', (e) => {
      controller.handleIconUpload(e);
      iconInput.value = '';
    });
  }
  if (iconDropzone && iconInput) {
    iconDropzone.addEventListener('click', (e) => {
      if (e.target !== iconInput) {
        iconInput.value = '';
        iconInput.click();
      }
    });
    iconDropzone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        iconInput.value = '';
        iconInput.click();
      }
    });
  }

  const removeIconBtn = document.getElementById('standalone-remove-icon-btn');
  if (removeIconBtn) {
    removeIconBtn.addEventListener('click', () => {
      sfx.playClick();
      controller.itemIconDataUrl = null;
      controller.hasCustomUploadedIcon = false;
      removeIconBtn.style.display = 'none';
      controller.updateDynamicItemIcon();
      showToast('รีเซ็ตเป็นไอคอนจากสกินเรียบร้อย', 'info');
    });
  }

  // Skin upload input & dropzone
  const skinInput = document.getElementById('standalone-skin-input');
  const skinDropzone = document.getElementById('standalone-dropzone');
  if (skinInput) {
    skinInput.addEventListener('change', (e) => {
      controller.handleSkinUpload(e);
      skinInput.value = '';
    });
  }
  if (skinDropzone && skinInput) {
    skinDropzone.addEventListener('click', (e) => {
      if (e.target !== skinInput) {
        skinInput.value = '';
        skinInput.click();
      }
    });
    skinDropzone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        skinInput.value = '';
        skinInput.click();
      }
    });
  }

  // Part checkboxes
  ['head', 'body', 'arms', 'legs'].forEach((part) => {
    const checkbox = document.getElementById(`standalone-part-${part}`);
    if (checkbox) {
      checkbox.addEventListener('change', (e) => {
        controller.parts[part] = e.target.checked;
        const parent = checkbox.closest('.part-toggle-item');
        if (parent) {
          parent.classList.toggle('checked', e.target.checked);
        }
        controller.updateDynamicItemIcon();
        controller.renderSkin();
      });
    }
  });

  // Anti-clipping offset toggle
  const antiClippingCheckbox = document.getElementById('standalone-anticlipping-checkbox');
  if (antiClippingCheckbox) {
    antiClippingCheckbox.addEventListener('change', (e) => {
      controller.antiClippingEnabled = e.target.checked;
      const parent = antiClippingCheckbox.closest('.part-toggle-item');
      if (parent) {
        parent.classList.toggle('checked', e.target.checked);
      }
      sfx.playClick();
      showToast(
        e.target.checked
          ? 'เปิดโหมดสวมทับ (ขยายเกราะ +0.05 ป้องกันการซ้อน) 🛡️'
          : 'ปิดโหมดสวมทับ (ใช้ขนาด 1:1 แนบเนื้อ)',
        'info'
      );
    });
  }

  // Quick Presets for Standalone (Independent part toggle)
  document.querySelectorAll('.standalone-preset-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.standalone-preset-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      sfx.playClick();
      controller.state.setPreset(btn.dataset.preset);
      controller.syncPartCheckboxes();
      controller.updateDynamicItemIcon();
      controller.renderSkin();
    });
  });

  // Model selection buttons
  document.querySelectorAll('.model-select-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.model-select-btn').forEach((b) => b.classList.remove('active', 'mc-btn-primary'));
      btn.classList.add('active', 'mc-btn-primary');
      controller.modelType = parseInt(btn.dataset.model);

      const customUploadArea = document.getElementById('standalone-custom-model-area');
      if (customUploadArea) {
        customUploadArea.style.display = controller.modelType === 3 ? 'block' : 'none';
      }

      controller.viewerController?.setModelType(controller.modelType);
    });
  });

  // 3D Animation Selector (Walk / Run / Idle)
  document.querySelectorAll('.standalone-anim-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.standalone-anim-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      sfx.playClick();
      controller.viewerController?.setAnimation(btn.dataset.anim || 'walk');
    });
  });

  // 3D Camera Reset Button
  const camResetBtn = document.getElementById('standalone-cam-reset');
  if (camResetBtn) {
    camResetBtn.addEventListener('click', () => {
      sfx.playClick();
      controller.viewerController?.resetCamera();
    });
  }

  // Dropzone Scanning Beam & Audio Feedback
  const dropzone = document.getElementById('standalone-dropzone');
  if (dropzone) {
    dropzone.addEventListener('dragover', () => {
      if (!dropzone.classList.contains('scanning')) {
        dropzone.classList.add('scanning');
        sfx.playScan();
      }
    });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('scanning'));
    dropzone.addEventListener('drop', () => dropzone.classList.remove('scanning'));
  }

  // Item Slot Type buttons - Smart auto-preset with Interactive Hover Mesh
  document.querySelectorAll('.slot-select-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.slot-select-btn').forEach((b) => b.classList.remove('active', 'mc-btn-primary'));
      btn.classList.add('active', 'mc-btn-primary');
      controller.state.setSlotType(btn.dataset.slot || 'head');
      sfx.playClick();

      controller.syncPartCheckboxes();
      controller.updateDynamicItemIcon();
      controller.renderSkin();
    });

    // Interactive 3D Mesh Hover Highlight
    btn.addEventListener('mouseenter', () => {
      sfx.playHover();
      controller.viewerController?.highlightPart(btn.dataset.slot || 'head', true);
    });
    btn.addEventListener('mouseleave', () => {
      controller.viewerController?.highlightPart(btn.dataset.slot || 'head', false);
    });
  });

  // Part Checkboxes Hover Mesh Highlight
  ['head', 'body', 'arms', 'legs'].forEach((part) => {
    const parent = document.getElementById(`standalone-part-${part}`)?.closest('.part-toggle-item');
    if (parent) {
      parent.addEventListener('mouseenter', () => {
        sfx.playHover();
        controller.viewerController?.highlightPart(part, true);
      });
      parent.addEventListener('mouseleave', () => {
        controller.viewerController?.highlightPart(part, false);
      });
    }
  });

  // Initialize checkboxes according to default 'head' slot
  controller.syncPartCheckboxes();

  // Custom geometry upload
  const customGeoInput = document.getElementById('standalone-custom-geo-input');
  if (customGeoInput) {
    customGeoInput.addEventListener('change', (e) => controller.handleCustomGeometryUpload(e));
  }

  // Autofix Toggle (Smart Alpha Inferrer)
  const autofixBtn = document.getElementById('standalone-autofix-btn');
  if (autofixBtn) {
    autofixBtn.addEventListener('click', async () => {
      if (!controller.rawInputImg) return;
      controller.autofixEnabled = !controller.autofixEnabled;
      autofixBtn.classList.toggle('disabled', !controller.autofixEnabled);
      const text = autofixBtn.querySelector('.autofix-text');
      if (text) text.textContent = controller.autofixEnabled ? 'ซ่อมกล่องดำ: เปิด' : 'กล่องดำ: สกินเดิม';
      showToast(controller.autofixEnabled ? 'เปิดระบบซ่อมกล่องดำเลเยอร์นอก' : 'ปิดระบบซ่อม: แสดงภาพต้นฉบับ', 'info');
      await controller.loadSkinFromImage(controller.rawInputImg, '', { autoInferAlpha: controller.autofixEnabled });
    });
  }

  // Download Button
  const downloadBtn = document.getElementById('standalone-download-btn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => controller.generateAddon());
  }
}
