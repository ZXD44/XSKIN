/**
 * Wardrobe 3D Inspect Modal Controller
 * Interactive 3D preview, Steve/Alex model toggle, walking/running animations, and camera reset.
 */
import * as skinview3d from 'skinview3d';
import { sfx } from '../sfx.js';
import { showToast } from '../utils.js';

export class WardrobeInspectModal {
  constructor(options = {}) {
    this.onUpdate = options.onUpdate || (() => {});
    this.onDelete = options.onDelete || (() => {});
    this.currentIndex = -1;
    this.currentSkin = null;
    this.viewer = null;

    this.modalEl = document.getElementById('wardrobe-inspect-modal');
    this.container = document.getElementById('wardrobe-inspect-3d-container');
    this.canvas = document.getElementById('wardrobe-inspect-3d-canvas');
    this.titleEl = document.getElementById('wardrobe-inspect-title');
    this.nameInput = document.getElementById('wardrobe-inspect-name-input');

    this.init();
  }

  init() {
    const closeBtn = document.getElementById('wardrobe-inspect-close-btn');
    const saveBtn = document.getElementById('wardrobe-inspect-save-btn');
    const deleteBtn = document.getElementById('wardrobe-inspect-delete-btn');
    const camResetBtn = document.getElementById('wardrobe-inspect-cam-reset');

    if (closeBtn) closeBtn.addEventListener('click', () => this.close());
    if (saveBtn) saveBtn.addEventListener('click', () => this.close());

    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        if (this.currentIndex >= 0) {
          sfx.playClick();
          const idx = this.currentIndex;
          this.close();
          this.onDelete(idx);
          showToast('ลบสกินเรียบร้อย', 'info');
        }
      });
    }

    if (this.modalEl) {
      this.modalEl.addEventListener('click', (e) => {
        if (e.target === this.modalEl) this.close();
      });
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modalEl && this.modalEl.style.display !== 'none') {
        this.close();
      }
    });

    if (this.nameInput) {
      this.nameInput.addEventListener('input', (e) => {
        if (this.currentIndex >= 0 && this.currentSkin) {
          const newName = e.target.value.trim() || `Skin ${this.currentIndex + 1}`;
          this.currentSkin.name = newName;
          this.onUpdate(this.currentIndex, { name: newName });
        }
      });
    }

    // Modal Model Toggle (Steve/Alex)
    document.querySelectorAll('.wardrobe-inspect-model-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const m = btn.dataset.model;
        if (this.currentIndex >= 0 && this.currentSkin) {
          this.currentSkin.model = m;
          document.querySelectorAll('.wardrobe-inspect-model-btn').forEach(b => b.classList.toggle('active', b.dataset.model === m));
          if (this.viewer) {
            this.viewer.loadSkin(this.currentSkin.skinURL, {
              model: m === 'alex' ? 'slim' : 'default'
            });
          }
          this.onUpdate(this.currentIndex, { model: m });
          sfx.playClick();
        }
      });
    });

    // Modal Animation Toggle (Walk/Run/Idle)
    document.querySelectorAll('.wardrobe-inspect-anim-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const anim = btn.dataset.anim;
        document.querySelectorAll('.wardrobe-inspect-anim-btn').forEach(b => b.classList.toggle('active', b.dataset.anim === anim));
        if (this.viewer) {
          if (anim === 'walk') {
            this.viewer.animation = new skinview3d.WalkingAnimation();
            this.viewer.animation.speed = 0.6;
          } else if (anim === 'run') {
            this.viewer.animation = new skinview3d.RunningAnimation();
            this.viewer.animation.speed = 0.8;
          } else {
            this.viewer.animation = null;
          }
        }
        sfx.playClick();
      });
    });

    if (camResetBtn) {
      camResetBtn.addEventListener('click', () => {
        sfx.playClick();
        if (this.viewer) {
          this.viewer.camera.position.set(0, 0, 70);
          this.viewer.camera.lookAt(0, 0, 0);
        }
      });
    }
  }

  open(index, skin) {
    if (!skin) return;
    this.currentIndex = index;
    this.currentSkin = skin;

    if (this.titleEl) this.titleEl.textContent = `ตรวจสอบ: ${skin.name}`;
    if (this.nameInput) this.nameInput.value = skin.name;

    document.querySelectorAll('.wardrobe-inspect-model-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.model === skin.model);
    });

    if (this.modalEl) this.modalEl.style.display = 'flex';

    setTimeout(() => {
      if (!this.viewer && this.container && this.canvas) {
        this.viewer = new skinview3d.SkinViewer({
          canvas: this.canvas,
          width: this.container.clientWidth || 360,
          height: 280
        });
        if (this.viewer.renderer) {
          this.viewer.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }
        this.viewer.camera.position.set(0, 0, 70);
        this.viewer.animation = new skinview3d.WalkingAnimation();
        this.viewer.animation.speed = 0.6;
      } else if (this.viewer && this.container) {
        this.viewer.width = this.container.clientWidth || 360;
      }

      if (this.viewer) {
        if (this.viewer.animation) {
          this.viewer.animation.paused = false;
        }
        this.viewer.loadSkin(skin.skinURL, {
          model: skin.model === 'alex' ? 'slim' : 'default'
        });
      }
    }, 50);

    sfx.playClick();
  }

  close() {
    if (this.modalEl) this.modalEl.style.display = 'none';
    if (this.viewer && this.viewer.animation) {
      this.viewer.animation.paused = true;
    }
    this.currentIndex = -1;
    this.currentSkin = null;
  }
}
