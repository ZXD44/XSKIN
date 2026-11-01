# 🎨 XSKIN Studio System Architecture & Guide (XSKIN)

> **คู่มือระบบและการทำงานทั้งหมดของ XSKIN Studio สำหรับ Minecraft Bedrock Edition**  
> ครอบคลุมระบบพรีวิว 3D, การสร้างสกินล่องหน, แอดออนสกินสวมใส่, ระบบตู้เสื้อผ้าเซิร์ฟเวอร์, ระบบแตกไฟล์ ZIP, และ Web Audio SFX

---

## 📂 สารบัญระบบ
1. [ภาพรวมสถาปัตยกรรมระบบ (System Architecture)](#1-ภาพรวมสถาปัตยกรรมระบบ-system-architecture)
2. [ระบบพรีวิว 3 มิติ (Interactive 3D Skin Viewer)](#2-ระบบพรีวิว-3-มิติ-interactive-3d-skin-viewer)
3. [ระบบสร้างสกินล่องหน (Hide Part Editor) & พรีเซ็ต 1 คลิก](#3-ระบบสร้างสกินล่องหน-hide-part-editor--พรีเซ็ต-1-คลิก)
4. [ระบบแอดออนสกินแบบไอเทม (Standalone Skin Addon Generator)](#4-ระบบแอดออนสกินแบบไอเทม-standalone-skin-addon-generator)
5. [ระบบตู้เสื้อผ้าเซิร์ฟเวอร์ (Wardrobe Multi-Skin Addon)](#5-ระบบตู้เสื้อผ้าเซิร์ฟเวอร์-wardrobe-multi-skin-addon)
6. [ระบบแตกไฟล์ ZIP / MCPACK / MCADDON (Archive Handler)](#6-ระบบแตกไฟล์-zip--mcpack--mcaddon-archive-handler)
7. [ระบบเสียงสังเคราะห์ Minecraft SFX (Web Audio API)](#7-ระบบเสียงสังเคราะห์-minecraft-sfx-web-audio-api)
8. [ระบบละอองไฟ Minecraft Motes (Pixel Flame Particles)](#8-ระบบละอองไฟ-minecraft-motes-pixel-flame-particles)
9. [มาตรฐานไฟล์และการประมวลผลสกิน (Skin Resolution & UV Layout)](#9-มาตรฐานไฟล์และการประมวลผลสกิน-skin-resolution--uv-layout)
10. [ระบบอุปกรณ์เสริม 3D (3D Cosmetics & Modular Accessories)](#10-ระบบอุปกรณ์เสริม-3d-3d-cosmetics--modular-accessories)
11. [ระบบนำเข้า Blockbench (.geo.json)](#11-ระบบนำเข้า-blockbench-geojson)
12. [ระบบ PWA Offline & ติดตั้งแอป](#12-ระบบ-pwa-offline--ติดตั้งแอป)

---

## 1. ภาพรวมสถาปัตยกรรมระบบ (System Architecture)

- **Frontend Core**: Vanilla JavaScript (ES Modules) + HTML5 + Vanilla CSS (Instant 60fps, Zero Overhead).
- **TypeScript Intelligence**: ใช้ `tsconfig.json` และ Type Definitions (`src/types/index.d.ts`) ตรวจจับ Type Error ครบถ้วนโดยไม่ต้องคอมไพล์ผ่านเครื่องมือภายนอก
- **Decoupled Headless Core**: แยกตรรกะ In-Memory Generator, Parser, Validator, UV Math, Icon Renderer, และ SafeZip ออกจาก DOM 100% ทำให้รัน Unit Test และบำรุงรักษาง่าย
- **Automated Testing Engine**: ขับเคลื่อนด้วย `Vitest` ทดสอบครอบคลุม 43 เคส (Error codes, SafeZip bounds, UV calculation, Addon generator, Validator, Wardrobe system, 3D Cosmetics engine)
- **Launch & Refresh Loading Screen**: จอโหลดสไตล์ Dragon Crimson (Critical Inline CSS + Smooth Exit Transition) แสดงผลทันทีเมื่อเปิดเว็บหรือกด F5 / รีเฟรชหน้า ป้องกันภาพกระพริบ FOUC
- **3D Engine**: WebGL Three.js ผ่านไลบรารี `skinview3d (^3.1.0)`.
- **In-Memory Archive Engine**: `JSZip (^3.10.1)` สำหรับการอ่านและสร้างไฟล์ `.zip`, `.mcpack`, `.mcaddon` บน Client-side 100% ปลอดภัย ไร้ Server
- **Audio Engine**: Synthesized Web Audio API (สร้างเสียงความถี่บริสุทธิ์ ไม่ต้องดาวน์โหลดไฟล์เสียงภายนอก)

```
src/
├── core/                       # Headless Core Engine (Pure In-Memory, Zero DOM)
│   ├── addon/
│   │   └── addonGenerator.js   # ตัวสร้างแอดออนสกินไอเทมเดี่ยวมาตรฐาน 1.21.10+ (In-Hand scale 1e-5)
│   ├── cosmetics/
│   │   └── cosmeticsManager.js # 3D Cosmetics Engine: Preset meshes, Blockbench parser, Three.js viewer attachment, Auto-Color Sampling
│   ├── wardrobe/
│   │   ├── wardrobeGenerator.js# ตัวสร้าง Official Bedrock Skin Pack (.mcpack)
│   │   └── wardrobeParser.js   # ตัวแยกไฟล์และนำเข้าแอดออนเดิมอย่างปลอดภัย
│   ├── skin/
│   │   ├── skinProcessor.js    # คำนวณ UV Map 2 เลเยอร์, Steve/Alex detection, 64x32 to 64x64
│   │   ├── iconGenerator.js    # สร้างไอคอน 16x16 พิกเซลสำหรับกระเป๋าไอเทม
│   │   └── smartAlpha.js       # Smart Alpha Inferrer & Outer Layer Masking (แก้กล่องดำ JPG)
│   ├── validator/
│   │   └── addonValidator.js   # ตรวจสอบ Manifest schema, RFC4122 UUID, Textures ก่อนส่งออก
│   ├── security/
│   │   └── safeZip.js          # ป้องกัน Zip Bomb และ Path Traversal
│   └── errors/
│       └── AppError.js         # ระบบรหัสข้อผิดพลาดรวมศูนย์พร้อมข้อความภาษาไทย
├── modules/                    # UI Controllers
│   ├── hidepart.js             # ระบบสกินล่องหน + UV Canvas + 3D Viewer + Presets
│   ├── standalone.js           # ตัวควบคุมหน้าแอดออนสกินไอเทม + Live Slot Icon Preview + 3D Cosmetics UI
│   ├── wardrobe.js             # ตัวควบคุมหน้าตู้เสื้อผ้า + 3D Live Inspect Modal
│   ├── zip.js                  # ตัวแยกไฟล์ ZIP/MCPACK/MCADDON
│   ├── sfx.js                  # เอนจินเสียงสังเคราะห์ Web Audio API
│   ├── mcfire.js               # ระบบสะเก็ดไฟละอองพิกเซล Minecraft
│   └── utils.js                # ฟังก์ชันช่วย (UUID, Toast, Resolution)
├── styles/
│   ├── forms.css               # UI Components: Cosmetic cards, emoji rendering, form controls
│   └── wardrobe.css            # Wardrobe grid, 3D inspect modal, skin pack export UI
├── types/
│   └── index.d.ts              # Type Definitions สำหรับ TypeScript
├── main.js                     # ควบคุม Router สลับแท็บ, Global Drag & Drop, Ctrl+V, Global SFX
└── style.css                   # ดีไซน์ระบบ Mobile-First Blood Dragon Theme (Dark Fantasy + Luxury Gaming)

public/
├── manifest.json               # PWA Web App Manifest (name, icons, theme_color, display: standalone)
├── sw.js                       # Service Worker (Offline Cache: zirconx-studio-v1.5.0)
└── vercel.json                 # Vercel ignoreCommand สำหรับกิ่ง gh-pages
```

---

## 2. ระบบพรีวิว 3 มิติ (Interactive 3D Skin Viewer)

- ขับเคลื่อนด้วย `skinview3d.SkinViewer` บน `<canvas>` ที่เรนเดอร์ผ่าน WebGL
- **Steve vs Alex Model Switcher**:
  - `Steve`: โมเดลมาตรฐาน ความกว้างแขน 4 พิกเซล (`model: 'default'`)
  - `Alex`: โมเดลสลิม ความกว้างแขน 3 พิกเซล (`model: 'slim'`)
- **Animation Controls**:
  - เดิน (`WalkingAnimation` speed 0.6)
  - วิ่ง (`RunningAnimation` speed 0.8)
  - หยุดนิ่ง (`animation: null`)
  - ปุ่มรีเซ็ตมุมกล้องกลับจุดศูนย์กลาง (`camera.position.set(0, 0, 70)`)
- **Real-time Transparent Part Rendering**:
  - เมื่อผู้ใช้เลือกซ่อนส่วนใดส่วนหนึ่ง UV Map จะถูกล้างแบบโปร่งใส (`clearRect`) และแปลงเป็น Blob URL สด ส่งเข้า `viewer.loadSkin()` ทันที ทำให้มองเห็นส่วนที่ล่องหนในโมเดล 3D แบบเรียลไทม์
- **Battery & Mobile Optimization**:
  - ใช้ `IntersectionObserver` หยุดการเรนเดอร์อนิเมชันทันทีที่ Canvas เลื่อนหลุดจากหน้าจอ ช่วยประหยัดแบตเตอรี่บนมือถือ

---

## 3. ระบบสร้างสกินล่องหน (Hide Part Editor) & พรีเซ็ต 1 คลิก

### การคำนวณ UV Map (ครอบคลุมทั้ง 2 เลเยอร์)
คำนวณตำแหน่งสัดส่วนพิกเซลแบบไดนามิก รองรับทั้ง 64x64 และสกิน HD (128x128 ถึง 4096px):
- **ส่วนหัว (Head)**:
  - Inner Head: `[0, 0, 32, 16]`
  - Outer Hat: `[32, 0, 32, 16]`
- **ส่วนลำตัว (Body/Torso)**:
  - Inner Torso: `[16, 16, 24, 16]`
  - Outer Jacket: `[16, 32, 24, 16]`
- **ส่วนแขน (Arms)**:
  - แขนขวา (Inner/Outer): `[40, 16, 16, 16]`, `[40, 32, 16, 16]`
  - แขนซ้าย (Inner/Outer): `[32, 48, 16, 16]`, `[48, 48, 16, 16]`
- **ส่วนขา (Legs)**:
  - ขวา (Inner/Outer): `[0, 16, 16, 16]`, `[0, 32, 16, 16]`
  - ซ้าย (Inner/Outer): `[16, 48, 16, 16]`, `[0, 48, 16, 16]`

### รายการพรีเซ็ตด่วน (One-Click Presets)
1. **ทั้งหมด (`all`)**: แสดงครบทั้ง 4 ส่วน
2. **หัวลอย (`head-only`)**: แสดงเฉพาะหัว ซ่อนลำตัว แขน และขา
3. **ล่องหน 100% (`hide-all`)**: ซ่อนทุกส่วน สกินจะโปร่งใสทั้งตัว
4. **ถอดแขนขา (`hide-arms-legs`)**: แสดงเฉพาะหัวและลำตัว ซ่อนแขนและขาทั้งหมด
5. **แค่ตัว (`body-only`)**: แสดงเฉพาะลำตัว ซ่อนหัว แขน และขา
6. **ซ่อนหัว (`hide-head`)**: แสดงลำตัว แขน และขา ซ่อนเฉพาะหัว
7. **ซ่อนตัว (`hide-body`)**: แสดงหัว แขน และขา ซ่อนเฉพาะลำตัว

### การดาวน์โหลด
- **ดาวน์โหลดเฉพาะรูปภาพ (.png)**: บันทึกไฟล์ภาพสกินที่มีชิ้นส่วนโปร่งใสเป็น `zxskin_custompart.png` ทันที สำหรับผู้เล่นที่ต้องการนำสกินไปใช้ตรงๆ ในเกม

---

## 4. ระบบแอดออนสกินแบบไอเทม (Standalone Skin Addon Generator)

แปลงสกินของผู้ใช้ให้เป็นชุดสวมใส่ในเกมผ่านระบบ Attachables และ Custom Items ของ Minecraft Bedrock:
- **ช่องสวมใส่ (Equipment Slots)**:
  - `suit` (ช่องลำตัว/เสื้อเกราะ: `slot.armor.chest`)
  - `head` (ช่องหมวก: `slot.armor.head`)
  - `legs` (ช่องกางเกง: `slot.armor.legs`)
  - `feet` (ช่องรองเท้า: `slot.armor.feet`)
  - `both` (สร้าง 2 ไอเทมแยกกัน: หมวก 1 ชิ้น + ชุด 1 ชิ้น)
- **ระบบเลือกชิ้นส่วนอิสระ (Decoupled Part Selection & Hair Support)**:
  - แยกช่องสวมใส่ออกจากชิ้นส่วนที่เรนเดอร์อย่างเด็ดขาด (Decoupled Slot & Geometry)
  - รองรับสกินผมยาว/ปอยผมที่วาดติดบนตัว: สามารถเลือกสวมใส่ในช่อง `head` แต่ติ๊กให้เรนเดอร์ทั้ง `Head` + `Torso` ได้โดยตัวเกมไม่ซ่อนชิ้นส่วนลำตัว
  - **Standalone Presets**:
    - `all`: เรนเดอร์ครบทุกส่วน (หัว + ตัว + แขน + ขา)
    - `head-hair`: หมวก/วิกผมยาว (หัว + ลำตัว)
    - `head-only`: เฉพาะหัว
    - `suit-only`: ชุดสวมใส่ (ตัว + แขน + ขา)
- **Custom Render Controller (`controller.render.zirconx_skin`)**:
  - แทนที่การใช้ `controller.render.armor` เดิมของ Bedrock ซึ่งบังคับซ่อนชิ้นส่วนนอกช่องสวมใส่ (เช่น หมวกจะบังคับซ่อน body, jacket, arms, legs)
  - ใช้ `controller.render.zirconx_skin` ชี้ตรงไปยัง `geometry.default` และ `texture.default` ทำให้แสดงผลชิ้นส่วนได้อย่างสมบูรณ์ 100% ปราศจากบัคชิ้นส่วนล่องหนผิดจุด
- **คุณสมบัติไอเทม (มาตรฐาน Bedrock 1.21.10+)**:
  - `minecraft:wearable`: กำหนดช่องสวมใส่ตามที่เลือก พร้อม `protection: 0` (ไม่มีพลังป้องกัน เพื่อความสมดุล)
  - `minecraft:max_stack_size: 1`
  - ไม่ใช้ `minecraft:armor` และ `minecraft:render_offsets` (เนื่องจาก Deprecated ใน 1.21.10+)
  - ไม่มีแถบความเสียหาย (Unbreakable) เนื่องจากไม่มีคอมโพเนนต์ `minecraft:durability`
  - In-Hand Hide: ซ่อนโมเดลในมือด้วยสเกล `1e-5` ใน attachable
- **Slot-Based Dynamic 16x16 Item Icon (`iconGenerator.js`)**:
  - สร้างไอคอน 16x16 พิกเซลตามรูปลักษณ์ช่องสวมใส่จริง (Slot-based UV geometry mapping) พร้อมตรวจสอบ Visible Pixels:
    - `head`: เรนเดอร์ Base Face (8x8) + Outer Hat (8x8) ขยาย 2x เป็น 16x16 (หากเปิด Torso จะดึงปอยผม 4 แถวล่าง)
    - `suit` / `chest`: เรนเดอร์เสื้อด้านหน้าและแขนทั้งสองข้าง (Base + Outer)
    - `legs`: เรนเดอร์กางเกง/เอวช่วงบน (Base + Outer)
    - `feet`: เรนเดอร์รองเท้าบูท (6 พิกเซลล่างสุดของขา Base + Outer)
  - หากสกินที่นำเข้าไม่มีพิกเซลในช่องสวมใส่นั้นๆ ตัวไอคอนจะโปร่งใส 100% ป้องกันการแสดงรูปไอคอนผิดประเภท
  - มีกล่อง Live Slot Icon Preview แสดงรูปไอคอนที่จะปรากฏในเกมแบบสดๆ บน UI ทันที
- **ระบบรองรับภาษาไทย & สากล (Full Thai & English Localization)**:
  - สร้างไฟล์ `texts/en_US.lang`, `texts/th_TH.lang` และ `texts/languages.json` ทั้งใน RP และ BP
  - ผูกคีย์แปลภาษา `item.zirconx:<id>.name=<ชื่อภาษาไทย>` และ `item.zirconx:<id>=<ชื่อภาษาไทย>` อัตโนมัติ เพื่อให้ตัวเกมแสดงชื่อภาษาไทยในกระเป๋า ช่องสวมใส่ และ Hotbar แทนที่จะแสดงรหัสไอดีดิบ (เช่น `skin_ft2ba2vf_head`)

---

## 5. ระบบตู้เสื้อผ้า / สกินแพ็ก (Wardrobe Skin Pack Manager)

- สร้าง **Official Bedrock Skin Pack (`.mcpack`)** สำหรับนำเข้าห้องแต่งตัว (Dressing Room / Classic Skins) ของเกมโดยตรง
- **โครงสร้างไฟล์ Skin Pack**:
  - `manifest.json`: โมดูล `type: "skin_pack"`, UUID สร้างใหม่ทุกครั้ง
  - `skins.json`: แมปไฟล์ PNG กับโมเดล Steve (`geometry.humanoid.custom`) หรือ Alex (`geometry.humanoid.customSlim`)
  - `texts/en_US.lang`, `texts/th_TH.lang`, `texts/languages.json`: ไฟล์แปลภาษาป้องกันรหัสดิบ
  - ไฟล์ภาพ `.png` ทุกไฟล์ผ่านการแปลง PNG แท้ผ่าน Canvas ก่อนบรรจุ
- **3D Live Inspect Modal**: คลิกดูโมเดล 3D เต็มตัว 360° ของทุกสกินในตู้เสื้อผ้า สลับ Steve/Alex และทดสอบท่าเดิน/วิ่ง/หยุดนิ่งก่อน Export
- **นำเข้า/ส่งออก**: รองรับลากวาง `.mcpack` หรือ `.zip` เดิมเข้ามาแก้ไขรายชื่อและเปลี่ยนโมเดลได้ทันที
- **Smart Alpha Remediation**: สกินที่นำเข้าจะถูกตรวจจับและซ่อมแซมเลเยอร์นอกอัตโนมัติก่อนบรรจุ

---

## 6. ระบบแตกไฟล์ ZIP / MCPACK / MCADDON (Archive Handler)

โมดูล `src/modules/zip.js`:
- ตรวจจับนามสกุลไฟล์: `.zip`, `.mcpack`, `.mcaddon`
- คลายไฟล์ในหน่วยความจำผ่าน `JSZip.loadAsync()`
- สแกนหาภาพสกินอัตโนมัติตามลำดับความสำคัญ:
  1. `textures/entity/*skin*.png`
  2. `textures/entity/*steve*.png`
  3. `textures/entity/*alex*.png`
  4. `*skin*.png`
  5. ไฟล์ `.png` แรกที่พบในแอดออน
- อ่านไฟล์ `manifest.json` ดึงชื่อแอดออน (`header.name`) มากรอกลงในช่องชื่อแอดออนให้อัตโนมัติ

---

## 7. ระบบเสียงสังเคราะห์ Minecraft SFX (Web Audio API)

โมดูล `src/modules/sfx.js`:
- ไม่ต้องโหลดไฟล์เสียง `.ogg` หรือ `.mp3` ภายนอก ทำให้เว็บโหลดเร็วและไม่เจอปัญหา 404
- **UI Click**: สังเคราะห์คลื่น Triangle Wave กวาดความถี่จาก 1400Hz ลงมา 320Hz ใน 0.045 วินาที
- **Item Pop / Equip**: สังเคราะห์คลื่น Sine Wave กวาดความถี่จาก 500Hz ขึ้นไป 1200Hz ใน 0.07 วินาที
- **Level Up / Addon Ready**: สังเคราะห์คอร์ดฮาร์มอนิก 4 โน้ต (C5, E5, G5, C6) กังวาน 0.35 วินาที
- **ปุ่มเปิด/ปิดเสียง (Sound Toggle)**:
  - บันทึกสถานะลง `localStorage.getItem('mc_sfx_muted')`
  - มีไอคอนลำโพงเปิด/ปิดที่แถบ Header

---

## 8. ระบบละอองไฟ Minecraft Motes (Pixel Flame Particles)

โมดูล `src/modules/mcfire.js`:
- เรนเดอร์บน `<canvas>` ด้วย `image-rendering: pixelated`
- ละอองสะเก็ดไฟพิกเซลขนาดเล็ก (1x1 – 3x3 px) จำนวน 16–18 เม็ด ลอยขึ้นอย่างต่อเนื่อง
- ไล่เฉดสีอบอุ่นตามวัฏจักรไฟ Minecraft: ขาวสว่าง $\rightarrow$ เหลืองนวล $\rightarrow$ ส้มทอง $\rightarrow$ แดงกุหลาบ $\rightarrow$ จางหายในอากาศ
- มีระบบคลื่น Sine Wave Drift จำลองกระแสลมพัดเอื่อยๆ

---

## 9. มาตรฐานไฟล์และการประมวลผลสกิน (Skin Resolution & UV Layout)

- **การอัปเกรดสกิน 64x32 เป็น 64x64 พร้อม UV Mirroring**:
  - สกินคลาสสิก 64x32 มีเฉพาะ UV แขนและขาขวา
  - ระบบตรวจจับโมเดล Alex (3px) หรือ Steve (4px) จาก Alpha พิกเซลตำแหน่งตรวจสอบ (`x: 54..55, y: 20`) อัตโนมัติ
  - ทำการ Mirror กาง UV แขนซ้ายและขาซ้ายแบบแยกหน้า 6 ด้าน (Face-by-Face UV Mirroring):
    - สลับหน้า Outside $\leftrightarrow$ Inside
    - กลับแนวนอน (Horizontal Flip) สำหรับหน้า Top, Bottom, Front, Back
    - ป้องกันปัญหาแขน/ขาแสดงผลกลับด้านหรือลวดลายบิดเบี้ยว 100%
- **สกิน HD**: รองรับความละเอียด 128x128, 256x256, 512x512, 1024x1024 จนถึง 4096px โดยคำนวณอัตราส่วนมาตราส่วน UV อัตโนมัติ
- **การตรวจจับความละเอียด**: แสดงป้าย Badge เช่น `64x64 Standard` หรือ `128x128 HD` บนหน้าจอทันทีที่โหลดไฟล์
- **การป้อนข้อมูล (Input Methods)**:
  - แตะเลือกไฟล์ผ่าน File Dialog
  - ลากไฟล์มาวางบน Dropzone หรือบนหน้าต่างเบราว์เซอร์ (Global Drag & Drop)
  - กดแปะภาพจาก Clipboard ด้วยคีย์ลัด **Ctrl + V**
---

## 10. ระบบอุปกรณ์เสริม 3D (3D Cosmetics & Modular Accessories)

โมดูล `src/core/cosmetics/cosmeticsManager.js`:
- **พรีเซ็ตสำเร็จรูป 5 แบบ** (เลือกผ่านกริดการ์ดบน UI):
  - `cat_ears`: หูแมว 3D — 4 กล่อง (หูนอก + หูใน ซ้าย/ขวา) ติดบน `skin.head` ที่ตำแหน่ง y=9.2+ (เหนือศีรษะ ไม่บังหน้า)
  - `dragon_wings`: ปีกมังกร — 4 กล่อง (ปีกหลัก + ปลายปีก ซ้าย/ขวา) ติดบน `skin.body` กางออกด้านหลัง
  - `fox_tail`: หางจิ้งจอก — 4 ท่อน (โคน → กลาง → ปลาย → ขนฟู) ยื่นจาก `skin.body` ด้านหลัง ปลายสีขาว
  - `crown`: มงกุฎทอง 3D — ฐาน + 5 ยอดแหลม + เพชรแดง ติดบน `skin.head` y=8.7+ (เหนือศีรษะ ไม่บดบังใบหน้า)
  - `backpack`: กระเป๋าเป้ — ช่องหลัก + กระเป๋าหน้า + ถุงนอนม้วน ติดบน `skin.body` ด้านหลัง
- **ระบบสี (Color Tinting)**:
  - `auto`: สุ่มตรวจสีเฉลี่ยจากพื้นที่ UV หัว/ตัวของสกินจริง (`sampleSkinColor()`)
  - เลือกสีสำเร็จรูป 6 เฉด: ชมพูพาสเทล, ส้มจิ้งจอก, แดงเข้ม, ฟ้าคราม, ดำด้าน, ขาวหิมะ
  - เลือกสีอิสระผ่าน `<input type="color">`
- **Three.js Real-time Attachment**: ชิ้นส่วนทั้งหมดถูกสร้างเป็น `THREE.Group` ที่มี `userData.isCosmetic = true` เพื่อให้ลบ/สลับได้ทันที ใช้ `MeshStandardMaterial` พร้อม roughness/metalness ที่เหมาะสม
- **Bedrock Geometry Merge**: เมื่อส่งออก `.mcaddon` ระบบจะรวมกล่อง Cosmetic เข้าในกระดูกเป้าหมาย (head/body) ของไฟล์ Geometry JSON มาตรฐาน ได้ Identifier เช่น `geometry.zirconx_cat_ears`
- **Cross-Platform Emoji**: การ์ดเลือก Cosmetic ใช้ Emoji จาก Unicode ≤ 14.0 เท่านั้น (🐱 🐉 🦊 👑 🎒 📁 ❌) พร้อม Font Stack `Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji`

---

## 11. ระบบนำเข้า Blockbench (.geo.json)

- **Drag & Drop / File Picker**: ลากวางหรือเลือกไฟล์ `.geo.json` ที่ Export จากโปรแกรม Blockbench
- **Parser (`parseBlockbenchGeoJson`)**:
  - รองรับทั้งรูปแบบ `minecraft:geometry` (1.12.0+) และ `geometry` (legacy)
  - ดึง Identifier, จำนวนกระดูก (bones), จำนวนกล่อง (cubes), ขนาดเทกซ์เจอร์
  - ตรวจสอบความถูกต้องของโครงสร้าง JSON พร้อม Error Message ภาษาไทย
- **3D Preview ของโมเดล Custom**:
  - วนกระดูกทั้งหมด → จับคู่กับ `skin[boneName]` ใน skinview3d
  - คำนวณ Center ของกล่องแต่ละอันจาก `origin + size/2 - pivot` พร้อมแปลงแกน Z (Bedrock → Three.js)
  - เรนเดอร์เป็น `BoxGeometry` สีตามที่เลือก
- **Addon Export**: เมื่อเลือก `custom` + มีไฟล์ `.geo.json` ระบบจะใช้ JSON ต้นฉบับเป็น Geometry ของแอดออนโดยตรง ไม่ต้องเขียนโค้ด JSON ด้วยตนเอง

---

## 12. ระบบ PWA Offline & ติดตั้งแอป

- **Web App Manifest** (`public/manifest.json`):
  - `display: standalone`, `theme_color: #0f1117`, `background_color: #0f1117`
  - ไอคอน 192x192 และ 512x512 สำหรับ Splash Screen
- **Service Worker** (`public/sw.js`):
  - Cache Name: `zirconx-studio-v1.5.0`
  - กลยุทธ์ Cache-First: แคชไฟล์ทั้งหมดใน `dist/` เมื่อติดตั้ง เปิดใช้งานได้ 100% Offline
  - Auto-Cleanup: ลบ Cache เวอร์ชันเก่าอัตโนมัติเมื่ออัปเดต
- **ปุ่มติดตั้งแอป (Responsive Emerald Pill)**:
  - Chromium/Edge/Samsung: ดักจับ `beforeinstallprompt` แสดงปุ่ม "📲 ติดตั้งแอป" → เรียก `prompt()` เมื่อกด
  - iOS Safari: แสดง A2HS Guide "ใช้ Share → Add to Home Screen" พร้อมปุ่มสลับแสดง/ซ่อนคำแนะนำ
  - ซ่อนปุ่มอัตโนมัติเมื่อแอปถูกเปิดใน Standalone Mode (`display-mode: standalone`)
  - ดีไซน์ Responsive ยืดหยุ่นทุกขนาดจอ ตั้งแต่มือถือ 320px จนถึง Desktop
