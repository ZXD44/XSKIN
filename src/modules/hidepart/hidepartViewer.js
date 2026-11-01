/**
 * 3D Skinview3d Viewer Manager for Hidepart Editor
 */
import * as skinview3d from 'skinview3d';
import { VIEWER_CONFIG } from '../../config/hidepart.config.js';

export class HidepartViewerController {
  constructor(editor) {
    this.editor = editor;
    this.viewer = null;
    this.container = document.getElementById('hidepart-3d-container');
    this.canvasEl = document.getElementById('hidepart-3d-canvas');
    this.init();
  }

  init() {
    if (!this.container || !this.canvasEl) return;

    this.viewer = new skinview3d.SkinViewer({
      canvas: this.canvasEl,
      width: this.container.clientWidth || VIEWER_CONFIG.DEFAULT_WIDTH,
      height: VIEWER_CONFIG.DEFAULT_HEIGHT
    });

    if (this.viewer.renderer) {
      this.viewer.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }
    this.viewer.camera.position.set(0, 0, VIEWER_CONFIG.CAMERA_Z);
    this.setAnimation('walk');

    // Pause rendering when hidden to save battery & maintain 60fps
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (this.viewer && this.viewer.animation) {
          this.viewer.animation.paused = !entry.isIntersecting;
        }
      });
    }, { threshold: 0.1 });
    observer.observe(this.container);

    window.addEventListener('resize', () => {
      if (this.viewer && this.container.clientWidth) {
        this.viewer.width = this.container.clientWidth;
      }
    });
  }

  setModel(model) {
    this.editor.modelType = model;
    document.querySelectorAll('.hidepart-model-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.model === model);
    });

    if (this.viewer && this.editor.currentSkinBlobUrl) {
      this.viewer.loadSkin(this.editor.currentSkinBlobUrl, {
        model: model === 'alex' ? 'slim' : 'default'
      });
    }
  }

  setAnimation(anim) {
    this.editor.animMode = anim;
    document.querySelectorAll('.hidepart-anim-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.anim === anim);
    });

    if (!this.viewer) return;

    if (anim === 'walk') {
      this.viewer.animation = new skinview3d.WalkingAnimation();
      this.viewer.animation.speed = VIEWER_CONFIG.WALK_SPEED;
    } else if (anim === 'run') {
      this.viewer.animation = new skinview3d.RunningAnimation();
      this.viewer.animation.speed = VIEWER_CONFIG.RUN_SPEED;
    } else {
      this.viewer.animation = null;
    }
  }

  resetCamera() {
    if (this.viewer) {
      this.viewer.camera.position.set(0, 0, VIEWER_CONFIG.CAMERA_Z);
      this.viewer.camera.lookAt(0, 0, 0);
    }
  }

  loadSkin(blobUrl, isSlim) {
    if (this.viewer) {
      this.viewer.loadSkin(blobUrl, {
        model: isSlim ? 'slim' : 'default'
      });
    }
  }

  resize() {
    if (this.viewer && this.container) {
      this.viewer.width = this.container.clientWidth || VIEWER_CONFIG.DEFAULT_WIDTH;
    }
  }
}
