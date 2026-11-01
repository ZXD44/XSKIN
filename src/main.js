/**
 * Main Application Controller
 * Handles Navigation, Global Drag & Drop, Ctrl+V Clipboard Paste, and Minecraft Web Audio SFX
 */
import './style.css';
import { HidePartEditor } from './modules/hidepart.js';
import { StandaloneAddonGenerator } from './modules/standalone.js';
import { WardrobeMultiEditor } from './modules/wardrobe.js';
import { initMinecraftFireParticles } from './modules/mcfire.js';
import { sfx } from './modules/sfx.js';
import { showToast } from './modules/utils.js';
import { initExportSheet } from './modules/exportSheet.js';

document.addEventListener('DOMContentLoaded', () => {
  // 0. App Launch & Refresh Loading Screen Management (Discord Style)
  const appLoader = document.getElementById('app-loader');
  const loaderStatusText = document.getElementById('loader-status-text');
  const loaderTipText = document.getElementById('loader-tip-text');

  const statusMessages = [
    'กำลังเชื่อมต่อเอนจิน 3D Bedrock...',
    'ประกอบโครงกระดูก Steve & Alex...',
    'คำนวณ Smart Alpha ป้องกันกล่องดำ...',
    'จูนเสียงสังเคราะห์ Web Audio...',
    'ตรวจสอบระบบ In-Memory JSZip...'
  ];

  const tipsMessages = [
    'คุณสามารถกด Ctrl+V เพื่อแปะสกินจาก Clipboard ได้ทันที!',
    'ระบบ Smart Alpha จะช่วยตัดขอบดำของไฟล์ภาพ JPG ให้อัตโนมัติ',
    'ลากไฟล์สกิน .png หรือ .mcpack มาปล่อยที่หน้าต่างไหนก็ได้',
    'โหมดแอดออนสวมใส่ฝัง Humanoid Geometry ให้ครบ 100% แก้ Paperdoll ดำ'
  ];

  if (loaderTipText) {
    loaderTipText.textContent = tipsMessages[Math.floor(Math.random() * tipsMessages.length)];
  }

  let statusIdx = 0;
  const statusInterval = setInterval(() => {
    if (!appLoader || appLoader.classList.contains('loader-hidden')) {
      clearInterval(statusInterval);
      return;
    }
    statusIdx = (statusIdx + 1) % statusMessages.length;
    if (loaderStatusText) {
      loaderStatusText.textContent = statusMessages[statusIdx];
    }
  }, 480);

  const dismissLoader = () => {
    if (!appLoader || appLoader.classList.contains('loader-hidden')) return;
    clearInterval(statusInterval);
    if (loaderStatusText) {
      loaderStatusText.textContent = 'พร้อมใช้งาน! 🚀';
    }
    setTimeout(() => {
      appLoader.classList.add('loader-hidden');
      setTimeout(() => {
        appLoader.style.display = 'none';
      }, 300);
    }, 180);
  };

  // Snappy display: 250ms minimum for clean aesthetic frame
  const minTimer = new Promise(res => setTimeout(res, 250));
  const pageReady = new Promise(res => {
    if (document.readyState === 'complete') res();
    else window.addEventListener('load', res, { once: true });
  });

  Promise.all([minTimer, pageReady]).then(() => {
    dismissLoader();
  });

  // Immediately display loader on refresh / page unload (F5, Ctrl+R, reload)
  window.addEventListener('beforeunload', () => {
    if (appLoader) {
      appLoader.style.display = 'grid';
      appLoader.classList.remove('loader-hidden');
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'F5' || (e.ctrlKey && e.key.toLowerCase() === 'r')) {
      if (appLoader) {
        appLoader.style.display = 'grid';
        appLoader.classList.remove('loader-hidden');
      }
    }
  });

  // 1. Initialize Minecraft Fire Particles on zirconx.xyz credit button & developer badge
  initMinecraftFireParticles();

  // 2. Initialize modules
  const hidePartModule = new HidePartEditor();
  const standaloneModule = new StandaloneAddonGenerator();
  const wardrobeModule = new WardrobeMultiEditor();
  initExportSheet();

  let currentTab = 'home';

  // 3. Navigation Tabs Switcher (Desktop Sidebar & Mobile Dock)
  const tabButtons = document.querySelectorAll('.nav-tab-btn, .mobile-nav-item, .stage-nav-item, .desktop-nav-btn, .sidebar-nav-btn');
  const sections = document.querySelectorAll('.page-section');
  const activeCrumb = document.getElementById('topbar-active-crumb');

  const tabLabels = {
    home: 'OVERVIEW',
    hidepart: 'HIDE PART STUDIO',
    standalone: 'WEARABLE ADDON',
    wardrobe: 'WARDROBE PACK',
    guide: 'DOCUMENTATION'
  };

  function switchTab(targetTabId) {
    currentTab = targetTabId;
    sfx.playClick();

    if (activeCrumb) {
      activeCrumb.textContent = tabLabels[targetTabId] || targetTabId.toUpperCase();
    }

    tabButtons.forEach(btn => {
      const isTarget = btn.dataset.tab === targetTabId || btn.dataset.goto === targetTabId;
      btn.classList.toggle('active', isTarget);
    });

    sections.forEach(sec => {
      sec.classList.toggle('active', sec.id === `section-${targetTabId}`);
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Trigger 3D viewer resize when tab becomes visible
    setTimeout(() => {
      if (targetTabId === 'hidepart' && hidePartModule.viewer) {
        const c = document.getElementById('hidepart-3d-container');
        if (c && c.clientWidth) hidePartModule.viewer.width = c.clientWidth;
      } else if (targetTabId === 'standalone' && standaloneModule.viewer) {
        const c = document.getElementById('standalone-3d-container');
        if (c && c.clientWidth) standaloneModule.viewer.width = c.clientWidth;
      }
    }, 100);
  }

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;
      switchTab(tabId);
    });
  });

  // Feature Card Links on Home
  document.querySelectorAll('[data-goto]').forEach(el => {
    el.addEventListener('click', (e) => {
      // Prevent parent trigger if child also has data-goto
      e.stopPropagation();
      const target = el.dataset.goto;
      if (target) switchTab(target);
    });
  });

  // Guide Sub-tabs Switcher
  const guideTabBtns = document.querySelectorAll('.guide-tab-btn');
  const guidePanels = document.querySelectorAll('.guide-panel');

  guideTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetPanelId = `guide-panel-${btn.dataset.guidetab}`;
      guideTabBtns.forEach(b => b.classList.toggle('active', b === btn));
      guidePanels.forEach(panel => {
        panel.classList.toggle('active', panel.id === targetPanelId);
      });
    });
  });

  // 3.5. Theme Engine (โหมดสว่างสดใส / โหมดมืด)
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const themeIconLight = document.getElementById('theme-icon-light');
  const themeIconDark = document.getElementById('theme-icon-dark');

  const savedTheme = localStorage.getItem('zirconx-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);

  const themeColorMeta = document.querySelector('meta[name="theme-color"]');

  function updateThemeUi(theme) {
    if (themeIconLight && themeIconDark) {
      themeIconLight.style.display = theme === 'light' ? 'none' : 'block';
      themeIconDark.style.display = theme === 'light' ? 'block' : 'none';
    }
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', theme === 'light' ? '#f5f6fb' : '#070912');
    }
  }

  updateThemeUi(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const next = current === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('zirconx-theme', next);
      updateThemeUi(next);
      sfx.playClick();
      showToast(next === 'light' ? 'สลับเป็นโหมดสว่างสดใส' : 'สลับเป็นโหมดมืด', 'info');
    });
  }

  // 4. Sound Effects (SFX) Toggle
  const sfxToggleBtn = document.getElementById('sfx-toggle-btn');
  const iconOn = document.getElementById('sfx-icon-on');
  const iconOff = document.getElementById('sfx-icon-off');

  function updateSfxUi(muted) {
    if (sfxToggleBtn) {
      sfxToggleBtn.classList.toggle('muted', muted);
    }
    if (iconOn && iconOff) {
      iconOn.style.display = muted ? 'none' : 'block';
      iconOff.style.display = muted ? 'block' : 'none';
    }
  }

  if (sfxToggleBtn) {
    updateSfxUi(sfx.isMuted());
    sfxToggleBtn.addEventListener('click', () => {
      const muted = sfx.toggleMute();
      updateSfxUi(muted);
      if (!muted) {
        sfx.playClick();
        showToast('เปิดเสียงเอฟเฟกต์', 'info');
      } else {
        showToast('ปิดเสียงเอฟเฟกต์', 'info');
      }
    });
  }

  // 5. Global & Dropzone Drag & Drop
  function setupDropzone(dropzoneEl, onFileDrop) {
    if (!dropzoneEl) return;

    // Click to select file
    dropzoneEl.addEventListener('click', (e) => {
      const fileInput = dropzoneEl.querySelector('input[type="file"]');
      if (fileInput && e.target !== fileInput) {
        fileInput.value = '';
        fileInput.click();
      }
    });

    // Keyboard accessibility (Enter / Space)
    dropzoneEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const fileInput = dropzoneEl.querySelector('input[type="file"]');
        if (fileInput) {
          fileInput.value = '';
          fileInput.click();
        }
      }
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      dropzoneEl.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzoneEl.classList.add('drag-over');
        if (eventName === 'dragover' && !dropzoneEl.classList.contains('scanning')) {
          dropzoneEl.classList.add('scanning');
          sfx.playScan();
        }
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzoneEl.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzoneEl.classList.remove('drag-over', 'scanning');
      });
    });

    dropzoneEl.addEventListener('drop', (e) => {
      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        onFileDrop(files[0]);
      }
    });
  }

  setupDropzone(document.getElementById('hidepart-dropzone'), (file) => {
    hidePartModule.loadFile(file);
  });

  setupDropzone(document.getElementById('standalone-dropzone'), (file) => {
    standaloneModule.loadFile(file);
  });

  // Global Drag & Drop on window
  window.addEventListener('dragover', (e) => e.preventDefault());
  window.addEventListener('drop', (e) => {
    e.preventDefault();
    const files = e.dataTransfer?.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    // Deliver to active module or switch to hidepart/standalone if on home
    if (currentTab === 'hidepart') {
      hidePartModule.loadFile(file);
    } else if (currentTab === 'standalone') {
      standaloneModule.loadFile(file);
    } else if (currentTab === 'wardrobe') {
      wardrobeModule.handleFiles(Array.from(files));
    } else {
      switchTab('hidepart');
      setTimeout(() => hidePartModule.loadFile(file), 150);
    }
  });

  // 6. Global Clipboard Paste (Ctrl + V)
  window.addEventListener('paste', async (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        const blob = item.getAsFile();
        if (blob) {
          showToast('วางสกินจาก Clipboard (Ctrl+V)', 'info');
          if (currentTab === 'standalone') {
            standaloneModule.loadFile(blob);
          } else if (currentTab === 'wardrobe') {
            wardrobeModule.handleFiles([blob]);
          } else {
            if (currentTab !== 'hidepart') switchTab('hidepart');
            setTimeout(() => hidePartModule.loadFile(blob), 150);
          }
          break;
        }
      }
    }
  });

  // Global button click SFX
  document.addEventListener('click', (e) => {
    const target = e.target.closest('button, .tool-card, .mc-tool-card, .preset-chip, .slot-select-btn, .model-select-btn, .part-toggle-item, .skinpack-inspect-btn, .skinpack-model-toggle');
    if (target && !target.id?.includes('sfx-toggle')) {
      sfx.playClick();
    }
  });

  // 7. PWA Service Worker Registration & Offline Support
  if ('serviceWorker' in navigator && (window.location.protocol.startsWith('http') || window.location.protocol === 'https:')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then((reg) => {
          console.log('[PWA] Service Worker registered:', reg.scope);
        })
        .catch((err) => {
          console.warn('[PWA] Service Worker registration failed:', err);
        });
    });
  }

  // 8. PWA Install Prompt Handler & iOS Support
  let deferredInstallPrompt = null;
  const pwaInstallBtn = document.getElementById('pwa-install-btn');

  // Detect iOS Safari & Standalone Display Mode
  const userAgent = window.navigator.userAgent.toLowerCase();
  const isIos = /iphone|ipad|ipod/.test(userAgent);
  const isStandalone = window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;

  // Show install button on iOS if not already running in standalone mode
  if (isIos && !isStandalone && pwaInstallBtn) {
    pwaInstallBtn.style.display = 'inline-flex';
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    if (pwaInstallBtn && !isStandalone) {
      pwaInstallBtn.style.display = 'inline-flex';
    }
  });

  if (pwaInstallBtn) {
    pwaInstallBtn.addEventListener('click', async () => {
      sfx.playClick();

      if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        const choiceResult = await deferredInstallPrompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
          showToast('กำลังติดตั้งแอป XSKIN Studio...', 'success');
          pwaInstallBtn.style.display = 'none';
        }
        deferredInstallPrompt = null;
      } else if (isIos) {
        showToast('แตะปุ่มแชร์ [⎙] ใน Safari แล้วเลือก "เพิ่มไปยังหน้าจอโฮม"', 'info');
      } else if (isStandalone) {
        showToast('คุณกำลังใช้งานในโหมดแอปอยู่แล้ว 🎉', 'info');
      } else {
        showToast('เปิดเมนูเบราว์เซอร์ (⋮) แล้วเลือก "ติดตั้งแอป" หรือ "เพิ่มลงหน้าจอหลัก"', 'info');
      }
    });
  }

  window.addEventListener('appinstalled', () => {
    showToast('ติดตั้งแอปสำเร็จ! ใช้งานออฟไลน์ได้ทันที 🎉', 'success');
    if (pwaInstallBtn) pwaInstallBtn.style.display = 'none';
  });
});
