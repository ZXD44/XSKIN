/**
 * Standalone Addon 3D Skin Viewer Controller
 * Wraps skinview3d with responsive resizing, animations, camera controls,
 * and interactive hover mesh highlighting for Unified 3D Workbench.
 */
import * as skinview3d from 'skinview3d';

export class StandaloneViewer {
  constructor(containerEl, canvasEl) {
    this.container = containerEl;
    this.canvas = canvasEl;
    this.viewer = null;
    this.observer = null;
    this.resizeHandler = null;

    if (containerEl && canvasEl) {
      this.init();
    }
  }

  init() {
    this.viewer = new skinview3d.SkinViewer({
      canvas: this.canvas,
      width: this.container.clientWidth || 340,
      height: 380
    });

    if (this.viewer.renderer) {
      this.viewer.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }
    this.viewer.camera.position.set(0, 0, 70);
    this.viewer.camera.lookAt(0, 0, 0);

    this.viewer.animation = new skinview3d.WalkingAnimation();
    this.viewer.animation.speed = 0.55;

    // Pause animation when 3D viewer is scrolled offscreen to conserve CPU/GPU
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (this.viewer && this.viewer.animation) {
          this.viewer.animation.paused = !entry.isIntersecting;
        }
      });
    }, { threshold: 0.1 });
    this.observer.observe(this.container);

    this.resizeHandler = () => {
      if (this.viewer && this.container.clientWidth) {
        this.viewer.width = this.container.clientWidth;
      }
    };
    window.addEventListener('resize', this.resizeHandler);
  }

  /**
   * Set model geometry (Alex slim 3px vs Steve classic 4px)
   * @param {number|'slim'|'default'} modelType 1: Steve, 2: Alex
   */
  setModelType(modelType) {
    if (!this.viewer?.playerObject?.skin) return;
    const isSlim = modelType === 2 || modelType === 'slim';
    this.viewer.playerObject.skin.modelType = isSlim ? 'slim' : 'default';
  }

  /**
   * Set walking / running / idle animation
   * @param {'walk'|'run'|'idle'} type
   */
  setAnimation(type) {
    if (!this.viewer) return;
    if (type === 'walk') {
      this.viewer.animation = new skinview3d.WalkingAnimation();
      this.viewer.animation.speed = 0.55;
    } else if (type === 'run') {
      this.viewer.animation = new skinview3d.RunningAnimation();
      this.viewer.animation.speed = 0.85;
    } else {
      this.viewer.animation = null;
    }
  }

  /**
   * Reset 3D camera to default straight-on view
   */
  resetCamera() {
    if (!this.viewer) return;
    this.viewer.camera.position.set(0, 0, 70);
    this.viewer.camera.lookAt(0, 0, 0);
  }

  /**
   * Interactive Hover Mesh: highlight body parts in 3D when hovering UI controls
   * @param {string} partName 'head' | 'body' | 'arms' | 'legs' | 'suit' | 'feet'
   * @param {boolean} highlight
   */
  highlightPart(partName, highlight) {
    const skin = this.viewer?.playerObject?.skin;
    if (!skin) return;

    const scale = highlight ? 1.08 : 1.0;
    const targetParts = [];

    if (partName === 'head') {
      targetParts.push(skin.head);
    } else if (partName === 'body') {
      targetParts.push(skin.body);
    } else if (partName === 'suit') {
      targetParts.push(skin.body, skin.leftArm, skin.rightArm);
    } else if (partName === 'arms') {
      targetParts.push(skin.leftArm, skin.rightArm);
    } else if (partName === 'legs' || partName === 'feet') {
      targetParts.push(skin.leftLeg, skin.rightLeg);
    } else if (partName === 'both') {
      targetParts.push(skin.head, skin.body, skin.leftArm, skin.rightArm);
    } else if (partName === 'all') {
      targetParts.push(skin.head, skin.body, skin.leftArm, skin.rightArm, skin.leftLeg, skin.rightLeg);
    }

    targetParts.forEach(mesh => {
      if (mesh?.scale) {
        mesh.scale.set(scale, scale, scale);
      }
    });
  }

  /**
   * Load skin texture from Blob URL or Image URL
   * @param {string} blobUrl
   */
  loadSkin(blobUrl) {
    if (!this.viewer || !blobUrl) return;
    this.viewer.loadSkin(blobUrl);
  }

  /**
   * Resize viewer canvas
   * @param {number} [width]
   */
  resize(width) {
    if (!this.viewer) return;
    this.viewer.width = width || this.container?.clientWidth || 340;
  }

  /**
   * Clean up observers and listeners
   */
  dispose() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
      this.resizeHandler = null;
    }
    if (this.viewer) {
      this.viewer.dispose();
      this.viewer = null;
    }
  }
}
