# 🚀 Automated Deployment Workflow: XSKIN Studio

> **คำสั่ง Trigger**: เมื่อผู้ใช้พิมพ์คำว่า `deploy` หรือ `/deploy` ให้เริ่มทำงานตามขั้นตอนในเอกสารนี้ทันทีตั้งแต่ต้นจนจบแบบอัตโนมัติ 100% (Zero Back-and-Forth)

---

## 🎯 ข้อมูลปลายทาง (Deployment Destinations)

| ปลายทาง | ชนิด | Branch / Trigger | URL สำหรับเข้าชม |
|---|---|---|---|
| **GitHub Pages** (หลัก) | Official Hosting | `main` → GitHub Action (`.github/workflows/deploy.yml`) → `gh-pages` | **https://zxd44.github.io/XSKIN/** |
| **Vercel** (สำรอง) | Mirror / CDN | Auto-deploy from `main` | **https://xskin.vercel.app** |
| **GitHub Repository** | Source & Version Control | `origin main` | **https://github.com/ZXD44/XSKIN** |
| **GitHub Actions Run** | CI/CD Pipeline | Auto-triggered on push to `main` | **https://github.com/ZXD44/XSKIN/actions** |

---

## 📋 ขั้นตอนการทำงานแบบสมบูรณ์ (Execution Checklist)

เมื่อได้รับคำสั่ง `deploy` ให้ผู้ช่วย Antigravity ดำเนินการตามลำดับดังต่อไปนี้โดยอัตโนมัติ:

### Step 1: Pre-Flight Integrity Checks (ตรวจสอบความสมบูรณ์ 100%)
1. รัน Unit & Integration Tests:
   ```powershell
   npm test
   ```
   *เงื่อนไข: ต้องผ่าน 100% (42/42 tests) หากมีข้อผิดพลาดให้หยุดทันทีและแจ้งผู้ใช้*

2. ตรวจสอบ Type Safety:
   ```powershell
   npm run type-check
   ```
   *เงื่อนไข: ต้องผ่าน 0 errors*

3. ตรวจสอบ Production Build:
   ```powershell
   npm run build
   ```
   *เงื่อนไข: ตรวจสอบว่าโฟลเดอร์ `dist/` สร้างสำเร็จ ปราศจาก Build Errors*

---

### Step 2: Git Synchronization & Commit (แพ็กและคอมมิตโค้ด)
1. ตรวจสอบสถานะการเปลี่ยนแปลง:
   ```powershell
   git status
   ```
2. ทำการ Stage ไฟล์ทั้งหมด:
   ```powershell
   git add .
   ```
3. ทำการ Commit ด้วยข้อความมาตรฐาน Conventional Commits (ระบุรายละเอียดการเปลี่ยนแปลงล่าสุด):
   ```powershell
   git commit -m "feat/refactor: <สรุปสิ่งที่แก้ไขหรืออัปเดต>"
   ```

---

### Step 3: Push to Origin (ส่งขึ้นคลาวด์เพื่อเริ่ม CI/CD)
1. Push ขึ้นกิ่ง `main`:
   ```powershell
   git push origin main
   ```
2. GitHub Action `deploy.yml` จะถูกเรียกทำงานอัตโนมัติเพื่อนำ `dist/` ไปดีพลอยลงกิ่ง `gh-pages`

---

### Step 4: Verification & Live URL Reporting (รายงานผล)
แสดงรายงานสรุปผลการดีพลอยให้ผู้ใช้ทราบแบบกระชับ (Caveman Style):
- ✅ Unit Tests Passed (จำนวนข้อสอบ)
- ✅ Type Check & Build Successful
- ✅ Git Commit SHA & Message
- 🔗 ลิงก์สดสำหรับทดสอบ: **https://zxd44.github.io/XSKIN/**
- 🔗 ลิงก์ติดตามการรัน GitHub Actions: **https://github.com/ZXD44/XSKIN/actions**
