# 🎨 Workspace Rules for XSKIN Studio (XSKIN)

> ระบบและกฎการพัฒนาเว็บแอปพลิเคชันเครื่องมือสร้างและจัดการสกิน Minecraft Bedrock Edition (XSKIN Studio)

---

## 📂 สารบัญเอกสารและกฎในโปรเจกต์:
- **สถาปัตยกรรมระบบฉบับสมบูรณ์**: [skin_studio_system.md](skin_studio_system.md)
- **มาตรฐานเว็บและ UI/UX**: [web_standards.md](rules/web_standards.md)
- **กฎการสร้างแอดออน Bedrock**: [addon_generation_rules.md](rules/addon_generation_rules.md)
- **โหมดกระชับรวดเร็ว (Caveman Mode)**: [caveman.md](rules/caveman.md)
- **ปรัชญาการออกแบบ Impeccable Style**: [impeccable-style/SKILL.md](skills/impeccable-style/SKILL.md)
- **ระบบดีพลอยอัตโนมัติ (.workflow)**: [.workflow/deploy.md](../.workflow/deploy.md)

---

## ⚠️ MANDATORY RULES (กฎเหล็กห้ามลืม)

1. **สถาปัตยกรรมประมวลผลบนเบราว์เซอร์ 100% (Pure Client-Side Architecture)**:
   - ห้ามส่งไฟล์ ภาพสกิน หรือโค้ดของผู้ใช้ขึ้น Server หรือภายนอกเด็ดขาด
   - การอ่านไฟล์ บีบอัด สร้าง และแตกไฟล์ `.zip`, `.mcpack`, `.mcaddon` ต้องผ่าน `JSZip` ในหน่วยความจำ (In-Memory)
   - ปลอดภัย เป็นส่วนตัว และไม่ต้องพึ่งพา Backend API

2. **ความถูกต้องของ UV Map และโมเดล 3D (3D & UV Integrity)**:
   - การซ่อนชิ้นส่วนสกินต้องคำนวณและลบทั้ง 2 เลเยอร์เสมอ (Inner Base + Outer Hat/Jacket/Sleeves/Pants)
   - รองรับทั้งสกิน 64x64 และสกิน HD (128px จนถึง 4096px) โดยคำนวณสัดส่วนพิกเซลแบบไดนามิก
   - สกิน 64x32 ต้องแปลงเป็น 64x64 อัตโนมัติ พร้อมกาง UV ซ้าย/ขวา
   - อัปเดต Blob URL สดเข้า `skinview3d` เพื่อแสดงผลโปร่งใสเรียลไทม์ทันที

3. **มาตรฐานแอดออนสกินสวมใส่ (Bedrock 1.21.10+ Standard)**:
   - ใช้ `minecraft:wearable` ตามช่องสวมใส่ (`slot.armor.chest`, `slot.armor.head`, `slot.armor.legs`, `slot.armor.feet`)
   - **ใช้ Custom Render Controller (`controller.render.zirconx_skin`)** แทน `controller.render.armor` เพื่อแก้ปัญหาชิ้นส่วนสกินนอกช่องถูกซ่อน และรองรับวิกผมยาว/ปอยผมพาดตัว
   - **ต้องฝังโมเดล Humanoid Geometry (`models/entity/humanoid_custom.geo.json`) เสมอ**: บรรจุโมเดล Steve (`geometry.humanoid.custom` แขน 4px) และ Alex (`geometry.humanoid.customSlim` แขน 3px) ลงใน Resource Pack เสมอ เพื่อป้องกันปัญหาเกมหา Geometry ไม่พบจนแสดงผลเป็นกล่องดำทึบในหน้าจอช่องเก็บของ (Paperdoll Black Box Glitch)
   - **ระบบเลือกชิ้นส่วนอัตโนมัติตามช่องสวมใส่ (Smart Slot Part Sync)**: เมื่อเลือกช่องสวมใส่ (หมวก, เสื้อ, กางเกง, รองเท้า) ระบบต้องตั้งค่าและแสดงผลชิ้นส่วนสกินที่ถูกต้องตรงช่องทันที ป้องกันปัญหาเสื้อติดชิ้นส่วนหัวดำ หรือเสื้อไม่มีแขน
   - `protection: 0`, `max_stack_size: 1`, ไม่มี `minecraft:durability` (Unbreakable)
   - **ห้ามใช้คอมโพเนนต์เก่าที่ Deprecated** เช่น `minecraft:armor` และ `minecraft:render_offsets`
   - ซ่อนโมเดลขณะถือในมือด้วยสเกล `1e-5` ใน attachable
   - เจนไอคอน 16x16 จากใบหน้าตัวละครจริง (Base Face + Outer Hat) พร้อมดึงปอยผม/ลำตัวส่วนบนเมื่อเปิดเรนเดอร์ Torso
   - สร้างไฟล์แปลภาษาครบทั้ง `texts/th_TH.lang`, `texts/en_US.lang` และ `texts/languages.json` ป้องกันรหัสไอดีดิบแสดงบนจอ

4. **มาตรฐานตู้เสื้อผ้า / สกินแพ็ก (Bedrock Skin Pack .mcpack Standard)**:
   - ระบบตู้เสื้อผ้าต้องสร้างเป็น **Official Bedrock Skin Pack (`.mcpack`)** สำหรับนำเข้าสู่ **ห้องแต่งตัว (Dressing Room / Classic Skins)** ของเกมโดยตรง
   - ห้ามใช้ Script API หรือ Behavior Pack สิ้นเปลืองกับตู้เสื้อผ้า
   - โครงสร้างต้องประกอบด้วย `manifest.json` (โมดูล `type: "skin_pack"`), `skins.json` ที่แมปโมเดล Steve (`geometry.humanoid.custom` แขน 4px) หรือ Alex (`geometry.humanoid.customSlim` แขน 3px), ไฟล์แปลภาษา `texts/*.lang` และรูปภาพสกินนามสกุล `.png`
   - รองรับการนำเข้าไฟล์ `.mcpack` หรือ `.zip` เดิมเข้ามาแก้ไขรายชื่อและเปลี่ยนโมเดลได้ทันที

5. **การรองรับภาพและระบบ Auto-Resampling (Image Handling & Robustness)**:
   - รองรับไฟล์ภาพทั้ง `.png`, `.jpg`, `.jpeg` และไฟล์ Archive `.zip`/`.mcpack`/`.mcaddon`
   - ไฟล์ภาพ JPG หรือไฟล์ใดๆ ที่รับเข้ามา **ต้องแปลงเป็น PNG Blob (`image/png`) ผ่าน Canvas ก่อนนำไปแพ็กเป็นไฟล์แอดออน/สกินแพ็กเสมอ** ห้ามบันทึกข้อมูลไบนารี JPEG ลงในชื่อไฟล์ `.png`
   - **ระบบ Auto-Resampling**: สกินรูปสี่เหลี่ยมจัตุรัสที่มีขนาดพิกเซลอิสระจากการเรนเดอร์หรือแคปจอ (เช่น 1452x1452, 1254x1254, 800x800) ต้องถูกย่อและแมป UV ลงสู่ 64x64 มาตรฐาน Minecraft Bedrock อัตโนมัติ โดยไม่ปฏิเสธไฟล์
   - **แจ้งเตือนเสมอ (No Silent Failures)**: ห้ามกลืน Error เงียบๆ หรือใส่แค่ `console.warn` ทุกกรณีที่เกิด Error หรือมีการปรับขนาด ต้องแสดง Toast แจ้งเตือนผู้ใช้บนหน้าจอทันที

6. **ความปลอดภัยของไฟล์และนามสกุลดาวน์โหลด (Security & File Cleanliness)**:
   - ตรวจจับและบล็อกช่องโหว่ Zip Slip / Path Traversal (`../`) ใน [`safeZip.js`](../src/core/security/safeZip.js)
   - ป้องกันเบราว์เซอร์ Chromium / Android เติมนามสกุล `.zip` ต่อท้ายไฟล์ โดยบังคับ MIME Type เป็น `application/octet-stream` และตัดนามสกุลซ้ำซ้อนทิ้ง
   - ป้องกัน Vercel Preview Build Error บนกิ่ง `gh-pages` ด้วยการใส่ `public/vercel.json` (`ignoreCommand: exit 0`) เพื่อให้ Vercel ข้ามการ Build กิ่งสำเร็จรูป

7. **เสียงและแอนิเมชันสังเคราะห์ในตัว (Zero-Dependency Audio & FX)**:
   - เสียงเอฟเฟกต์ทั้งหมด (Click, Pop, LevelUp) ต้องสังเคราะห์ผ่าน Web Audio API (`sfx.js`) ห้ามโหลดไฟล์เสียง `.mp3` / `.ogg` จากภายนอก
   - ปุ่มเปิด/ปิดเสียงต้องจำสถานะผ่าน `localStorage`
   - จอโหลด (Dragon Crimson Loader) ต้องทำงานทันทีตอนโหลดและรีเฟรชหน้า ป้องกันภาพกระพริบ FOUC

8. **Universal Input & UX**:
   - รองรับการลากวางไฟล์ทุกที่บนหน้าเว็บ (Global Drag & Drop)
   - รองรับคีย์ลัด **Ctrl + V** เพื่อแปะภาพจาก Clipboard ทันที
   - ตรวจจับไฟล์ `.zip`, `.mcpack`, `.mcaddon` อัตโนมัติ พร้อมอ่านชื่อจาก `manifest.json`

9. **ความเข้ากันได้ของ Emoji ข้ามแพลตฟอร์ม (Cross-Platform Emoji Rendering)**:
   - **ห้ามใช้ Emoji ที่สูงกว่า Unicode 14.0** (ปี 2021) ในอินเทอร์เฟซ เนื่องจาก Windows 10, Android 12 ลงไป, และ Samsung Browser จะแสดงเป็นช่องว่างหรือกล่องสี่เหลี่ยม
   - ตัวอย่าง Emoji ต้องห้าม: `🪽` (U+1FABD, Unicode 15.0), `🫨` (U+1FAE8), `🪿` (U+1FABF)
   - ตัวอย่าง Emoji ปลอดภัย (Unicode ≤ 14.0): `🐉` `🐱` `🦊` `👑` `🎒` `📁` `❌` `✨` `💡` `📦`
   - ทุก Element ที่แสดง Emoji ต้องกำหนด `font-family: 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif;` เสมอ เพื่อบังคับให้เบราว์เซอร์ใช้ Font Emoji ที่เหมาะสม

10. **การทำงานแบบทีละขั้นตอน โฟกัสทีละจุด (Step-by-Step Single-Focus Execution)**:
    - เมื่องานมีหลายเงื่อนไข มีคำว่า "และ/หรือ" หรือมีความซับซ้อน **ห้ามแก้ทุกอย่างพร้อมกันในคราวเดียว**
    - ต้องแตกย่อยเป็น Step ชัดเจน ทำทีละจุด โฟกัสแก้ทีละเป้าหมาย ทดสอบยืนยันความแม่นยำ แล้วจึงขยับไปจุดถัดไป เพื่อความละเอียดและป้องกันผลข้างเคียง

11. **การดีพลอยอัตโนมัติ (Automated Deployment Trigger)**:
    - เมื่อผู้ใช้สั่ง `deploy` หรือ `/deploy` ระบบจะเรียกและปฏิบัติตามคำสั่งใน [`.workflow/deploy.md`](../.workflow/deploy.md) ทันที:
      1. ตรวจสอบ Integrity: รันเทสต์ `npm test` + `npm run type-check` + `npm run build`
      2. Git Sync: `git add .` + `git commit`
      3. Cloud Push: `git push origin main` (เรียก GitHub Actions CI/CD สร้างกิ่ง `gh-pages`)
      4. รายงานสรุปผลพร้อม Live URL ทันที

12. **มาตรฐาน Impeccable Style (Anti-AI-Slop Frontend Standard)**:
    - ปฏิบัติตามหลักการออกแบบใน [`DESIGN.md`](../docs/DESIGN.md) และ [`.agents/skills/impeccable-style/SKILL.md`](skills/impeccable-style/SKILL.md)
    - แบนการใช้สีม่วงไล่เฉด AI Slop ทั่วไป, ฟอนต์ต้องมีบุคลิกชัดเจนตามธีม Minecraft Obsidian/Emerald, ปุ่มกดต้องมีสัมผัสแบบ Physical Tactile, 60fps micro-animations, และคงมาตรฐานการเข้าถึง WCAG AA/AAA เสมอ

---

## 📝 บันทึกประวัติการปรับปรุงระบบ (Update Logs & Changelog)

### v1.7.2 (ล่าสุด - 2 พฤศจิกายน 2026)
- **Anti-Clipping Armor Offset**: เพิ่มตัวเลือกระบบขยายสเกลโมเดล `geometry.humanoid.custom` (+0.05) สำหรับเสื้อผ้าแอดออน สวมคลุมอยู่ชั้นนอกตัวละคร ป้องกันการเกิด Z-Fighting หรือเนื้อสกินแลบทะลุเสื้อผ้า
- **Skin Pack Export (.mcpack) in Hide Part Editor**: เพิ่มตัวเลือกดาวน์โหลดสกินล่องหนเป็น Official Bedrock Skin Pack (.mcpack) นำเข้าห้องแต่งตัว (Dressing Room) โดยตรง ตัวเกม Bedrock ยอมรับความโปร่งใส ไม่ถูกถมดำ
- **Smart Slot Anti-Overlap**: ปรับค่าเริ่มต้นของช่องหมวก (Head) ไม่พ่วงส่วนลำตัว (Body) ซ้ำซ้อนกับเสื้อผ้าเมื่อสวมใส่คู่กัน
- **Default Light Theme**: ปรับค่าเริ่มต้นของทั้งเว็บเป็นโหมดสว่างสดใส (Daylight Theme) พร้อม Script ดักเคลียร์แคช LocalStorage เก่าอัตโนมัติ และอัปเดต Service Worker v1.7.4
- **Clean UI Typography**: ลบอีโมจิรบกวนสายตาในปุ่มและหัวข้อควบคุม คงความเรียบหรู คมชัด ระดับ Impeccable Style

### v1.7.1 (1 พฤศจิกายน 2026)
- **Universal Dropzone & Multi-Format**: ปรับปรุง Hidepart Dropzone ให้คลิกเปิด File Picker ได้ทันที รองรับครบทั้งภาพ (.png, .jpg, .jpeg, .webp, MIME image/*) และแพ็กเกจ (.zip, .mcpack, .mcaddon) พร้อม Scan Beam FX และแปะสกินด้วย Ctrl+V
- **Slot Icon Live Card as Single Source of Truth**: ลบแถว `icon-preview-row` ที่ซ้ำซ้อนออก และผสานปุ่มลบ/รีเซ็ตไอคอนเข้ากับ `slot-icon-live-card`
- **Short & Distinct Showcase Badges**: แก้ไขป้ายกำกับใน Hero Showcase ให้สั้นกระชับ แยกเป็น `Bedrock` (Titlebar) และ `3D Preview` (มุมจอ 3D) ป้องกันความสับสน
- **Centered Pill Guide Tabs**: จัดระเบียบ `.guide-nav-tabs` ให้อยู่กึ่งกลาง ดีไซน์ขอบมน (Pill) สวยงามแบบ Glassmorphism พร้อมกระจายตัว 50/50 บนมือถือ
- **Compact & Lag-Free PWA Install Button**: ปรับปุ่มติดตั้ง PWA เป็นคำว่า "ติดตั้ง" ความสูง 32px ตอบสนองเร็วระดับ 60fps ไร้แอนิเมชันหน่วงเครื่อง

### v1.7.0 (1 พฤศจิกายน 2026)
- **Impeccable Style Integration**: ติดตั้งแนวคิดการออกแบบระดับพรีเมียมจาก impeccable.style ป้องกัน AI Slop พร้อมร่าง `DESIGN.md` และ skill `impeccable-style`
- **Automated Workflow (.workflow)**: ติดตั้งระบบดีพลอยอัตโนมัติครบวงจร เมื่อพิมพ์ `deploy` จะรันเทสต์ ตรวจสอบความถูกต้อง คอมมิต และ push ขึ้น GitHub Pages ทันที
- **Full Architecture Refactoring**: แยกโค้ดแบบ Modular SoC ทุกไฟล์ใน `src/` ความยาวต่ำกว่า 500 บรรทัด (42/42 tests ผ่าน 100%)
- **Bedrock Humanoid Geometry Integration**: แก้ไขปัญหาสกินไอเทมสวมใส่ในเกมแล้วหน้าจอ Paperdoll ดำสนิท (Fix-2.png) โดยการฝังโมเดล Humanoid Geometry มาตรฐาน (`models/entity/humanoid_custom.geo.json`) ครบทั้ง Steve (4px) และ Alex (3px) ลงใน Resource Pack อัตโนมัติ 100%
- **Smart Slot Part Sync**: เมื่อเลือกช่องสวมใส่ (หมวก, เสื้อ, กางเกง, รองเท้า) ระบบจะปรับเลือกชิ้นส่วนสกินที่สัมพันธ์กับช่องนั้นให้อัตโนมัติ ป้องกันปัญหาเสื้อติดหัวดำ หรือเสื้อไม่มีแขน (Fix-1.png)
- **Clean Addon Engine**: ลบระบบของแต่งตัว 3D เสริม (3D Cosmetics & Blockbench Bridge) ทิ้งทั้งหมดตามคำสั่ง เพื่อความเรียบง่าย เสถียร คลีน และประสิทธิภาพสูงสุด
- **Geometry Definition Validation**: เพิ่มตัวตรวจสอบ Addon Validator ให้ตรวจเช็กว่าโมเดล Geometry ที่ Attachable อ้างอิง มีไฟล์นิยามอยู่ใน Resource Pack หรือไม่ ป้องกันการปล่อยแอดออนที่มีข้อผิดพลาด

### v1.5.0 (29 กันยายน 2026)
- **3D Cosmetics & Modular Accessories Studio**: เพิ่มระบบเลือกของแต่งตัว 3D สำเร็จรูป (หูแมว 3D, ปีกมังกร, หางจิ้งจอก, มงกุฎลอย, กระเป๋าเป้นักเดินทาง) สวมใส่เข้ากับตัวละครพร้อมระบบเลือกโทนสี หรือปรับสีตามสกินอัตโนมัติ (Auto-Color Sampling)
- **Blockbench Bridge (.geo.json)**: รองรับการลากวางนำเข้าไฟล์โมเดล Bedrock Geometry ที่ออกแบบจากโปรแกรม Blockbench โดยตรง แปลงเป็นแอดออนสวมใส่ในเกมอัตโนมัติ 100% ไร้โค้ด JSON
- **Real-time 3D Attachment Engine**: ชิ้นส่วน 3D เคลื่อนไหวตามท่าทางเดิน/วิ่งของตัวละครบนเบราว์เซอร์สดๆ ด้วย Three.js
- **Cross-Platform Emoji Rendering Fix**: แก้ไข Emoji `🪽` (U+1FABD, Unicode 15.0) ที่แสดงผลเป็นช่องว่างบน Windows 10/11 และ Android เก่า เปลี่ยนเป็น `🐉` (U+1F409, Unicode 6.0) พร้อมเพิ่ม Font Stack `Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji` ให้ `.cosmetic-card-icon` แสดงผลครบ 100% ทุกแพลตฟอร์ม
- **Responsive PWA Install Button**: ออกแบบปุ่มติดตั้งแอปใหม่สไตล์ Emerald Pill พร้อม iOS Safari A2HS Guide ยืดหยุ่นทุกขนาดจอ

### v1.4.0 (29 กันยายน 2026)
- **Wardrobe 3D Live Inspect**: ผู้ใช้สามารถคลิกดูโมเดล 3D แบบเต็มตัวของทุกชุดในตู้เสื้อผ้า หมุนดู 360 องศา สลับโมเดล Steve/Alex และทดสอบท่าเดิน/วิ่งก่อน Export เป็น `.mcpack` ได้ทันที
- **Full PWA Offline Support**: เพิ่ม Web App Manifest และ Service Worker แคชไฟล์ในเครื่อง สามารถกด "ติดตั้งแอป" ลงหน้าจอโฮมมือถือ และเปิดใช้งานได้แม้อยู่ในโหมดไม่มีเน็ต (100% Offline)

### v1.3.0 (29 กันยายน 2026)
- **Smart Alpha Inferrer & Outer Layer Masking**: ปลดล็อกแก้ปัญหาสกินไม่ตรงปก 100% สำหรับไฟล์ JPG และ PNG ที่ไม่มีช่อง Alpha โดยตรวจจับสีพื้นหลังและลบเฉพาะในพื้นที่เลเยอร์นอก (หมวก, เสื้อ, กางเกง) ให้โปร่งใส ไม่เกิดกล่องดำครอบตัวละคร และคงเลเยอร์ในไว้ครบถ้วน
- **Dominant Cluster Sampling**: ตรวจจับสีพื้นหลังแบบกลุ่มสีหลัก ทนทานต่อภาพที่มีแสงนีออน แสงออร่า หรือสัญญาณรบกวนจากการบีบอัดไฟล์ (เช่น ภาพ `s2.png`)
- **Interactive Auto-Fix Toggle**: เพิ่มปุ่มสลับ "✨ ซ่อมกล่องดำ: เปิด/ปิด" บนแถบควบคุม 3D Realtime ให้ผู้ใช้สลับดูภาพเดิมหรือภาพที่ซ่อมแซมได้ทันที
- **Wardrobe Auto-Remediation**: สกินที่นำเข้าสู่ตู้เสื้อผ้าจะถูกตรวจจับและซ่อมแซมความโปร่งใสอัตโนมัติก่อนบรรจุลง `.mcpack` นำเข้าห้องแต่งตัวได้ตรงปกทันที

### v1.2.0 (29 กันยายน 2026)
- **Universal Auto-Resampler**: ปลดล็อกให้รองรับภาพสกินที่มีขนาดพิกเซลอิสระ เช่น `1452x1452`, `1254x1254`, `800x800` โดยย่อและแมปลงเป็น 64x64 มาตรฐาน Bedrock อัตโนมัติ
- **Full JPG/JPEG Conversion**: รองรับภาพ `.jpg` และแปลงเป็น `.png` แท้ 100% ผ่าน Offscreen Canvas ก่อนบรรจุลงใน `.mcpack` และ `.mcaddon`
- **Comprehensive Toast Feedback**: แก้ไขระบบแจ้งเตือนตู้เสื้อผ้าให้แสดง Toast ทั้งกรณีปรับขนาดสำเร็จและแจ้งเตือน Error ทันที (ไม่เกิดอาการอัปโหลดแล้วเงียบอีกต่อไป)
- **Official Skin Pack (.mcpack)**: ยกเครื่องระบบตู้เสื้อผ้าจาก Script API มาเป็น Bedrock Skin Pack มาตรฐาน นำเข้าห้องแต่งตัว Dressing Room โดยตรง
- **Clean Extension**: แก้ปัญหาดาวน์โหลดไฟล์แล้วติดนามสกุล `.zip` พ่วงท้าย (`.mcaddon.zip` / `.mcpack.zip`) ด้วย MIME `application/octet-stream`
- **Vercel CI/CD Fix**: ป้องกัน Build Error บนกิ่ง `gh-pages` ด้วย `ignoreCommand: exit 0` และรองรับทั้ง Vercel (Root) และ GitHub Pages

### v1.1.0
- สถาปัตยกรรม Client-Side 100% ผ่าน JSZip In-Memory ไร้ Backend
- สลับโมเดล Steve (แขน 4px) และ Alex (แขน 3px) แบบเรียลไทม์
- Custom Render Controller (`controller.render.zirconx_skin`) สำหรับ Bedrock 1.21.10+
- Web Audio API Sound Effects ในตัว ไม่โหลดไฟล์เสียงภายนอก

### v1.0.0
- เปิดตัว ZirconX Studio เครื่องมือสร้างสกินล่องหน และสกินไอเทมสวมใส่

---

## 💡 กลยุทธ์และสถาปัตยกรรมการแก้ปัญหาสกินไม่ตรงปก (Skin Integrity & Restoration Strategies)

### 1. ปัญหาพื้นหลังทึบของเลเยอร์นอก (Solid Black/White Overlay Glitch จากไฟล์ JPG):
- **สาเหตุ**: ไฟล์ JPG ไม่มี Alpha Channel พื้นที่ว่างรอบสกินจึงกลายเป็นสีดำ `#000000` ส่งผลให้เลเยอร์นอก (หมวก, เสื้อ, กางเกง) กลายเป็นกล่องทึบครอบตัวละคร 360 องศา บังหน้าตาและเสื้อผ้าจริง
- **โซลูชัน (Smart Alpha Inferrer)**:
  - สุ่มตรวจพิกเซลที่ตำแหน่งว่างแน่นอนของ Minecraft เช่น มุม `(0, 0)` หรือ `(32, 0)` หากพบว่าเป็นสีทึบสม่ำเสมอ
  - ทำ Alpha Masking เฉพาะใน **พื้นที่เลเยอร์นอก (Outer Overlay Rectangles)** โดยเปลี่ยนสีพื้นหลังนั้นให้โปร่งใส (`alpha = 0`) โดยไม่กระทบเลเยอร์ใน เพื่อให้สกินกลับมาแสดงผลปกติ

### 2. ปัญหาตำแหน่ง UV เคลื่อนจากการครอบตัดหรือแคปจอ (Scale & Grid Misalignment):
- **สาเหตุ**: ผู้ใช้นำภาพสกินที่แคปจอมาจากโซเชียลซึ่งมีขอบ Padding ส่วนเกิน หรือถูกครอปตำแหน่งทำให้พิกเซลไม่ตรงเส้นกริด 64x64
- **โซลูชัน (Auto-Anchor & Trimming)**:
  - สแกนหา Bounding Box ของเทมเพลตสกิน ตัดขอบดำ/ขอบขาวรอบนอกทิ้งก่อนย่อลง 64x64
  - รองรับระบบ Manual UV Calibration สำหรับขยับ Offset เล็กน้อยในหน้าพรีวิว

### 3. ปัญหาภาพวาดแฟนอาร์ต/วอลเปเปอร์ (Fanart Wallpaper Misuse):
- **สาเหตุ**: ภาพมีตัวหนังสือ โซ่ แสงนีออน หรือภาพฉากหลังวาดทับเทมเพลต (เช่น ภาพ `s2.png`) ซึ่งไม่ใช่สกินจริง
- **โซลูชัน (Heuristic Skin Validator)**:
  - คำนวณ Skin Health Score หากพบสัญญาณรบกวนในพื้นที่ที่ไม่ควรมีพิกเซลเกินเกณฑ์ ให้ขึ้นข้อความแนะนำให้ดาวน์โหลดสกินต้นฉบับที่เป็น PNG โปร่งใสจากเว็บสกินมาตรฐาน (NameMC / Skindex)

---

## 🪨 Global Efficiency Rule
- **Caveman Mode (Always-On)**: ดูรายละเอียดที่ [caveman.md](rules/caveman.md)

