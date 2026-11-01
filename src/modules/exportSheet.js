/**
 * Post-export bottom sheet: tells the player exactly what to do with the file
 * they just downloaded, and offers the two escapes that solve the classic
 * mobile problems — pick an exact filename (no appended .zip) or send the file
 * straight into Minecraft through the native share sheet.
 */
import { saveArchiveWithPicker, shareArchive } from './utils.js';

const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

const isAndroid = () => /android/i.test(navigator.userAgent);

function stepsFor(kind, platform) {
  const packName = kind === 'mcpack' ? 'สกินแพ็ก' : 'แอดออน';

  if (platform === 'ios') {
    return [
      `ไฟล์${packName}จะถูกบันทึกไว้ในแอป Files → โฟลเดอร์ Downloads`,
      'แตะไฟล์ค้างไว้ แล้วเลือก แชร์ → Minecraft เกมจะนำเข้าให้อัตโนมัติ',
      'ถ้าแตะไฟล์แล้วไม่มีแอป Minecraft ให้กดปุ่ม “แชร์ไปยัง Minecraft” ด้านล่าง'
    ];
  }

  if (platform === 'android') {
    return [
      `เปิดแอป Files แล้วไปที่โฟลเดอร์ Downloads เพื่อหาไฟล์${packName}`,
      'แตะไฟล์ แล้วเลือกเปิดด้วย Minecraft เกมจะติดตั้งให้ทันที',
      'ถ้าชื่อไฟล์ลงท้ายด้วย .zip ให้ลบ .zip ออกให้เหลือ .' + (kind === 'mcpack' ? 'mcpack' : 'mcaddon')
    ];
  }

  return kind === 'mcpack'
    ? [
      'ดับเบิลคลิกไฟล์ .mcpack ที่ดาวน์โหลดมา เกมจะติดตั้งสกินแพ็กให้',
      'เปิดเกม → Dressing Room → Classic Skins → Owned Skins',
      'ถ้าไฟล์ลงท้าย .zip ให้ลบ .zip ออกก่อนเปิด หรือใช้ปุ่ม “เลือกชื่อไฟล์เอง” ด้านล่าง'
    ]
    : [
      'ดับเบิลคลิกไฟล์ .mcaddon ที่ดาวน์โหลดมา เกมจะติดตั้ง Resource + Behavior Pack ให้',
      'เปิดเกม → ตั้งค่าโลก → Resource Packs และ Behavior Packs → Activate',
      'ถ้าไฟล์ลงท้าย .zip ให้ลบ .zip ออกก่อนเปิด หรือใช้ปุ่ม “เลือกชื่อไฟล์เอง” ด้านล่าง'
    ];
}

export function showExportSheet({ blob, fileName, kind = 'mcaddon' }) {
  const sheet = document.getElementById('export-sheet');
  if (!sheet || !blob) return;

  const platform = isIos() ? 'ios' : (isAndroid() ? 'android' : 'desktop');
  const list = document.getElementById('export-sheet-steps');
  const fileLabel = document.getElementById('export-sheet-file');
  const title = document.getElementById('export-sheet-title');
  const pickerBtn = document.getElementById('export-sheet-picker');
  const shareBtn = document.getElementById('export-sheet-share');
  const hint = document.getElementById('export-sheet-hint');

  if (fileLabel) fileLabel.textContent = fileName;
  if (title) title.textContent = kind === 'mcpack' ? 'สกินแพ็กพร้อมติดตั้ง' : 'แอดออนพร้อมติดตั้ง';

  if (list) {
    list.textContent = '';
    stepsFor(kind, platform).forEach((step) => {
      const li = document.createElement('li');
      li.className = 'export-sheet-step';
      li.textContent = step;
      list.appendChild(li);
    });
  }

  if (hint) {
    hint.textContent = platform === 'ios'
      ? 'iOS จะไม่บันทึกไฟล์ลงเครื่องโดยตรง — ใช้ปุ่มแชร์เพื่อส่งเข้า Minecraft ทันที'
      : 'หากไฟล์ที่ได้ลงท้ายด้วย .zip ให้เปลี่ยนชื่อก่อนเปิดในเกม';
  }

  if (pickerBtn) {
    pickerBtn.hidden = typeof window.showSaveFilePicker !== 'function';
    pickerBtn.onclick = async () => {
      const ok = await saveArchiveWithPicker(blob, fileName);
      if (!ok) {
        hint.textContent = 'เบราว์เซอร์นี้ไม่รองรับการตั้งชื่อไฟล์เอง — ใช้วิธีเปลี่ยนชื่อในแอปไฟล์แทน';
        return;
      }
      hint.textContent = `บันทึก ${fileName} เรียบร้อย`;
    };
  }

  if (shareBtn) {
    shareBtn.hidden = !(platform === 'ios' && typeof navigator.share === 'function');
    shareBtn.onclick = async () => {
      const ok = await shareArchive(blob, fileName, fileName);
      if (!ok) {
        hint.textContent = 'เปิด share sheet ไม่ได้ — แตะไฟล์ในแอป Files แล้วเลือกแชร์เองแทน';
      }
    };
  }

  sheet.hidden = false;
  requestAnimationFrame(() => sheet.classList.add('is-open'));
  document.body.classList.add('export-sheet-open');

  const closeBtn = sheet.querySelector('#export-sheet-done');
  if (closeBtn) closeBtn.focus({ preventScroll: true });
}

export function initExportSheet() {
  const sheet = document.getElementById('export-sheet');
  if (!sheet) return;

  const close = () => {
    sheet.classList.remove('is-open');
    document.body.classList.remove('export-sheet-open');
    window.setTimeout(() => { sheet.hidden = true; }, 220);
  };

  sheet.querySelectorAll('[data-export-close]').forEach((el) => {
    el.addEventListener('click', close);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !sheet.hidden) close();
  });
}
