/**
 * DOM event bindings for Hidepart Editor
 */
import { sfx } from '../sfx.js';
import { showToast } from '../utils.js';

/**
 * Binds all DOM event listeners for the Hidepart Editor.
 * @param {import('../hidepart.js').HidePartEditor} editor
 */
export function bindHidepartEvents(editor) {
  // 1. File input & Dropzone
  const fileInput = document.getElementById('hidepart-file-input');
  const dropzone = document.getElementById('hidepart-dropzone');

  if (fileInput) {
    fileInput.addEventListener('change', (e) => editor.handleFileUpload(e));
  }

  if (dropzone && fileInput) {
    dropzone.addEventListener('click', (e) => {
      if (e.target !== fileInput) {
        fileInput.value = '';
        fileInput.click();
      }
    });

    dropzone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        fileInput.value = '';
        fileInput.click();
      }
    });
  }

  // 2. 4-Part checkboxes (Head, Body, Arms, Legs)
  ['head', 'body', 'arms', 'legs'].forEach((part) => {
    const checkbox = document.getElementById(`hidepart-${part}`);
    if (checkbox) {
      checkbox.addEventListener('change', (e) => {
        sfx.playClick();
        editor.parts[part] = e.target.checked;
        const parent = checkbox.closest('.part-toggle-item');
        if (parent) {
          parent.classList.toggle('checked', e.target.checked);
        }
        editor.render();
      });
    }
  });

  // 3. Quick Presets
  document.querySelectorAll('.hidepart-preset-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      sfx.playClick();
      editor.applyPreset(btn.dataset.preset);
    });
  });

  // 4. Model Switcher (Steve / Alex)
  document.querySelectorAll('.hidepart-model-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      sfx.playClick();
      editor.setModel(btn.dataset.model);
    });
  });

  // 5. Animation Switcher (Walk, Run, Idle)
  document.querySelectorAll('.hidepart-anim-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      sfx.playClick();
      editor.setAnimation(btn.dataset.anim);
    });
  });

  // 6. Camera Reset
  const resetCam = document.getElementById('hidepart-cam-reset');
  if (resetCam) {
    resetCam.addEventListener('click', () => {
      sfx.playClick();
      editor.resetCamera();
    });
  }

  // 7. Autofix Toggle (Smart Alpha Inferrer)
  const autofixBtn = document.getElementById('hidepart-autofix-btn');
  if (autofixBtn) {
    autofixBtn.addEventListener('click', async () => {
      if (!editor.rawInputImg) return;
      editor.autofixEnabled = !editor.autofixEnabled;
      autofixBtn.classList.toggle('disabled', !editor.autofixEnabled);
      const text = autofixBtn.querySelector('.autofix-text');
      if (text) text.textContent = editor.autofixEnabled ? 'ซ่อมกล่องดำ: เปิด' : 'กล่องดำ: สกินเดิม';
      showToast(editor.autofixEnabled ? 'เปิดระบบซ่อมกล่องดำเลเยอร์นอก' : 'ปิดระบบซ่อม: แสดงภาพต้นฉบับ', 'info');
      await editor.loadSkinFromImage(editor.rawInputImg, '', { autoInferAlpha: editor.autofixEnabled });
    });
  }

  // 8. Download Skin PNG
  const downloadPngBtn = document.getElementById('hidepart-download-png-btn');
  if (downloadPngBtn) {
    downloadPngBtn.addEventListener('click', () => editor.downloadSkinPng());
  }

  const downloadBtn = document.getElementById('hidepart-download-btn');
  if (downloadBtn && !downloadPngBtn) {
    downloadBtn.addEventListener('click', () => editor.downloadSkinPng());
  }
}
