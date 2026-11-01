# ⛏️ XSKIN Studio — สตูดิโอสกิน Minecraft Bedrock by ZirconX

> **เว็บแอปพลิเคชันเครื่องมือสร้างและจัดการสกิน Minecraft Bedrock Edition ครบวงจร**  
> ดีไซน์ระดับ Impeccable Style รองรับมือถือและ iPad เต็มรูปแบบ (Mobile-First) พรีวิว 3 มิติสด และประมวลผลบนเครื่อง 100% (Pure Client-Side In-Memory) ไม่ต้องพึ่งพาเซิร์ฟเวอร์

🔗 **ใช้งานออนไลน์ (GitHub Pages)**: [https://zxd44.github.io/XSKIN/](https://zxd44.github.io/XSKIN/)  
📦 **GitHub Repository**: [https://github.com/ZXD44/XSKIN](https://github.com/ZXD44/XSKIN)

---

## ⚡ 4 เครื่องมือหลักในโปรเจกต์ (Studio Workspaces)

1. **🎭 สกินล่องหน (Hide Part Editor)**:
   - เลือกลบชิ้นส่วนสกินให้โปร่งใสระดับพิกเซล ครอบคลุมทั้ง 2 เลเยอร์ (Inner Base + Outer Hat/Jacket/Sleeves/Pants)
   - พรีเซ็ตด่วน 1 คลิก: `หัวลอย`, `ล่องหน 100%`, `ถอดแขนขา`, `แค่ตัว`, `ซ่อนหัว`, `ซ่อนตัว`
   - อัปโหลดสะดวก: คลิกเปิดไฟล์, ลากวาง (พร้อม Scan Beam FX) หรือกด `Ctrl + V` แปะสกินจาก Clipboard ได้ทันที

2. **🦺 แอดออนสกินไอเทมสวมใส่ (Standalone Wearable Skin Addon)**:
   - แปลงไฟล์สกินเป็นแอดออนชุดเกราะสวมใส่ในเกม (`.mcaddon`)
   - **Smart Slot Part Sync**: ปรับเลือกชิ้นส่วนสกินให้ตรงกับช่องสวมใส่อัตโนมัติ (หมวก, เสื้อ, กางเกง, รองเท้า) ป้องกันปัญหาเสื้อติดหัวดำ
   - **ฝัง Humanoid Geometry**: บรรจุโมเดล Steve (แขน 4px) และ Alex (แขน 3px) ครบถ้วน แก้ไขปัญหาจอช่องเก็บของตัวละครเป็นกล่องดำทึบ (Paperdoll Black Box) 100%
   - **Dynamic Item Icon 16x16**: เจนไอคอนไอเทมในช่องเก็บของจากใบหน้าตัวละครจริง หรืออัปโหลดไอคอนกำหนดเองได้

3. **🚪 สกินแพ็กตู้เสื้อผ้า (Official Bedrock Skin Pack .mcpack)**:
   - รวมหลายสกินเป็นไฟล์ `.mcpack` เดียว นำเข้า **ห้องแต่งตัว (Dressing Room > Classic Skins)** ของเกมโดยตรง
   - **3D Live Inspect**: คลิกหมุนดูโมเดล 3D แบบเต็มตัว 360 องศา สลับโมเดล Steve/Alex และทดสอบท่าเดิน/วิ่งก่อนดาวน์โหลด

4. **📖 คู่มือการติดตั้งและใช้งาน (Interactive Guide)**:
   - แถบนำทางจัดกึ่งกลางสไตล์ Pill (Centered Glassmorphism) รองรับมือถือและแท็บเล็ต
   - สรุปขั้นตอนติดตั้งไฟล์ `.mcaddon` และ `.mcpack` พร้อมวิธีเปิดใช้งานในโลก (World Settings)

---

## 📂 แผนผังโครงสร้างโปรเจกต์ (Clean & Beginner-Friendly Directory)

```
XSKIN/
├── public/                       # ไฟล์ Static ที่เบราว์เซอร์เรียกใช้โดยตรง
│   ├── manifest.webmanifest      # PWA Manifest สำหรับกด "ติดตั้งแอป" ลงหน้าจอมือถือ
│   ├── sw.js                     # Service Worker แคชไฟล์ในเครื่อง ใช้งานออฟไลน์ได้
│   ├── templates/                # แม่แบบไฟล์ Minecraft Addon (BP/RP)
│   └── favicon.svg               # ไอคอนเว็บ
│
├── src/                          # โค้ดหลักของโปรเจกต์ทั้งหมด (ทุกไฟล์สั้นกว่า 400 บรรทัด)
│   ├── config/                   # ⚙️ ค่าคงที่และการตั้งค่าส่วนกลาง (แก้ง่ายที่เดียว)
│   │   ├── bedrock.config.js     # UUIDs, Bedrock Format Version, รหัสช่องสวมใส่
│   │   ├── skin.config.js        # พิกัด UV Map, ขนาดความละเอียดที่รองรับ
│   │   ├── hidepart.config.js    # พรีเซ็ตชิ้นส่วน และการตั้งค่ากล้อง 3D
│   │   └── archive.config.js     # การจำกัดขนาดไฟล์ SafeZip
│   │
│   ├── core/                     # 🧠 Business Logic แท้ (คำนวณอย่างเดียว ไม่มี UI/DOM)
│   │   ├── addon/                # สร้างไฟล์แอดออน .mcaddon และฝังโมเดล 3D
│   │   ├── wardrobe/             # สร้างและแตกไฟล์สกินแพ็ก .mcpack
│   │   ├── skin/                 # ตัวแปลงขนาดสกิน, UV Mapping, ตัดกล่องดำ Smart Alpha
│   │   ├── validator/            # ตรวจสอบความถูกต้องของโมเดลและไฟล์ JSON ก่อนดาวน์โหลด
│   │   ├── security/             # ป้องกัน Zip Bomb และ Path Traversal (safeZip.js)
│   │   └── errors/               # รวมศูนย์ข้อความ Error ภาษาไทยที่เข้าใจง่าย
│   │
│   ├── modules/                  # 🖥️ ตัวควบคุมหน้าจอ UI แต่ละส่วน
│   │   ├── hidepart/             # ซับโมดูลหน้าสกินล่องหน (Events + 3D Viewer)
│   │   ├── standalone/           # ซับโมดูลหน้าสร้างแอดออน (Events + State + Viewer)
│   │   ├── wardrobe/             # ซับโมดูลหน้าตู้เสื้อผ้า (3D Inspect Modal)
│   │   ├── hidepart.js           # ตัวควบคุมหลักหน้าสกินล่องหน
│   │   ├── standalone.js         # ตัวควบคุมหลักหน้าสร้างแอดออน
│   │   ├── wardrobe.js           # ตัวควบคุมหลักหน้าตู้เสื้อผ้า
│   │   ├── sfx.js                # เสียงเอฟเฟกต์ Web Audio API (ไม่ต้องโหลดไฟล์ mp3)
│   │   ├── mcfire.js             # สะเก็ดไฟพิกเซล Minecraft
│   │   └── utils.js              # ตัวแจ้งเตือน Toast, ตรวจจับแขน Steve/Alex
│   │
│   ├── styles/                   # 🎨 สไตล์ CSS แยกเป็นหมวดหมู่ ค้นหาง่าย
│   │   ├── variables.css         # โทนสี Obsidian, Emerald, ขนาดขอบมน และ Font Tokens
│   │   ├── header.css            # แถบเมนูด้านบน, โลโก้, ปุ่มสลับธีม และปุ่มติดตั้ง PWA
│   │   ├── workbench.css         # จอพรีวิว 3D, กล่อง Live Card, คอนโซลปรับแต่ง
│   │   ├── hero-editorial.css    # ส่วนหัวเว็บ Hero Showcase
│   │   ├── guide.css             # แท็บคู่มือการติดตั้งแบบ Pill Centered
│   │   ├── components.css        # ปุ่ม, Dropzone, กล่อง Toast แจ้งเตือน
│   │   ├── forms.css             # ช่องกรอกชื่อแอดออน, เช็กบ็อกซ์เลือกชิ้นส่วน
│   │   └── dock.css              # แถบนำทางด้านล่างหน้าจอสำหรับมือถือ
│   │
│   ├── main.js                   # ไฟล์เริ่มต้นระบบ (Event Router, Paste, Global Drop)
│   └── style.css                 # จุดเชื่อมโยงไฟล์ CSS ทั้งหมดเข้าด้วยกัน
│
├── tests/                        # 🧪 ชุดทดสอบอัตโนมัติ (Unit Tests ครบ 42 รายการ)
├── index.html                    # หน้าเว็บหลัก Single Page Application
├── package.json                  # รายการ Dependencies และคำสั่งรันโปรเจกต์
└── vite.config.js                # การตั้งค่า Vite Bundler
```

---

## 🛠️ คู่มือสำหรับมือใหม่: อยากแก้อะไร ต้องไปที่ไฟล์ไหน?

| สิ่งที่คุณต้องการแก้ไข | ไฟล์ที่ต้องเปิด | คำอธิบายสั้นๆ |
| :--- | :--- | :--- |
| **เปลี่ยนสีหลัก / ฟอนต์ / ธีมเว็บ** | `src/styles/variables.css` | รวมตัวแปรสีทั้งหมด เช่น `--blurple`, `--spring`, `--ink-100` |
| **แก้หน้าตาหรือขนาดปุ่มติดตั้ง PWA** | `src/styles/header.css` | ค้นหาคลาส `.nav-install` |
| **แก้หน้าตา Dropzone ลากไฟล์** | `src/styles/components.css` | ค้นหาคลาส `.upload-dropzone` |
| **แก้ขนาดหรือตำแหน่งจอ 3D** | `src/styles/workbench.css` | ค้นหาคลาส `.workbench-canvas-container` |
| **แก้หรือเพิ่มพรีเซ็ตชิ้นส่วนสกิน** | `src/config/hidepart.config.js` | กำหนดค่า Boolean ใน `HIDEPART_PRESETS` |
| **แก้เวอร์ชัน Bedrock เริ่มต้น** | `src/config/bedrock.config.js` | ปรับแก้ `MINECRAFT_CONFIG.FORMAT_VERSION` |
| **แก้ข้อความแจ้งเตือน Error** | `src/core/errors/AppError.js` | ค้นหาข้อความภาษาไทยใน `USER_MESSAGES` |
| **แก้โครงสร้างปุ่ม/ข้อความบนหน้าเว็บ** | `index.html` | ไฟล์ HTML หน้าหลักของเว็บ |

---

## 🚀 วิธีติดตั้งและรันโปรเจกต์ (Step-by-Step Setup)

### สิ่งที่ต้องมีในเครื่อง:
- [Node.js](https://nodejs.org/) (แนะนำเวอร์ชัน 18 ขึ้นไป)

### 1. ติดตั้ง Dependencies:
เปิด Terminal หรือ Command Prompt ในโฟลเดอร์โปรเจกต์ แล้วพิมพ์:
```powershell
npm install
```

### 2. รัน Dev Server เพื่อดูผลสดๆ ในเครื่อง:
```powershell
npm run dev
```
ระบบจะเปิดพอร์ตให้ใช้งาน เช่น `http://localhost:3000/` หรือ `http://localhost:3002/` (เปิดดูผ่านเบราว์เซอร์ได้ทันที และแก้โค้ดจะอัปเดตแบบเรียลไทม์)

### 3. รันการทดสอบระบบ (Automated Tests):
ตรวจสอบว่าโค้ดยังทำงานถูกต้อง 100% ด้วยคำสั่ง:
```powershell
npm test
```
*(ระบบจะรัน Unit Tests ครบ 42 ข้อ ในเวลาเพียง 2-3 วินาที)*

### 4. ตรวจสอบชนิดข้อมูล (TypeScript Type-Check):
```powershell
npm run type-check
```

### 5. บิลด์ไฟล์สำเร็จรูปสำหรับขึ้นเซิร์ฟเวอร์ (Production Build):
```powershell
npm run build
```
*(ไฟล์บิลด์สำเร็จรูปจะถูกสร้างไว้ในโฟลเดอร์ `dist/`)*

---

## 🛡️ จุดเด่นด้านสถาปัตยกรรม (Architecture Highlights)

- **Pure Client-Side 100%**: ปลอดภัย มั่นใจได้ ไม่มีการส่งไฟล์สกินขึ้นเซิร์ฟเวอร์ภายนอก ประมวลผลและสร้างไฟล์ ZIP/MCPACK ผ่าน RAM ของเครื่องผู้ใช้โดยตรง
- **Bedrock Humanoid Geometry Integration**: ฝังโมเดล Steve และ Alex มาตรฐานลงใน Resource Pack แก้ปัญหากล่องดำในช่องเก็บของ (Paperdoll Black Box) 100%
- **Smart Alpha Inferrer**: ตรวจจับสีพื้นหลังและตัดขอบดำเฉพาะเลเยอร์นอกของไฟล์ภาพ JPG ให้อัตโนมัติ โดยไม่ทำลายเลเยอร์ใน
- **Universal Auto-Resampler**: ปรับขนาดสกินขนาดอิสระ (เช่น 1452×1452 หรือ 800×800) ลงสู่ 64×64 มาตรฐานอัตโนมัติ
- **PWA Offline Support**: ใช้งานได้แม้ไม่มีสัญญาณอินเทอร์เน็ต และติดตั้งลงหน้าจอโฮมมือถือได้ง่าย

---

## 📄 ลิขสิทธิ์และการพัฒนา
- พัฒนาโดย **ZirconX Studio** ([www.zirconx.xyz](https://www.zirconx.xyz))
- ออกแบบสำหรับคอมมูนิตี้ Minecraft Bedrock Edition (MCPE / Windows 10/11 / iOS / Android)
