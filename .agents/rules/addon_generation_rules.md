# 📦 กฎและมาตรฐานการสร้าง Minecraft Bedrock Addon (Addon Generation Rules)

> เอกสารกำหนดมาตรฐานโครงสร้างไฟล์ JSON, การจัดเตรียม Texture, ไอคอน, และ Manifest สำหรับการสร้างไฟล์ `.mcaddon` จากเว็บ ZirconX Skin Project

---

## 1. ⚙️ มาตรฐานคอมโพเนนต์ไอเทมสกินสวมใส่ (Bedrock 1.21.10+)

- **ระบบ Wearable**:
  - กำหนดช่องสวมใส่ตามที่เลือก:
    - ชุด/เสื้อเกราะ: `slot.armor.chest`
    - หมวก/วิกผม: `slot.armor.head`
    - กางเกง: `slot.armor.legs`
    - รองเท้า: `slot.armor.feet`
  - **Decoupled Geometry & Custom Render Controller**:
    - ห้ามใช้ `controller.render.armor` เริ่มต้นของเกม เนื่องจากมี `part_visibility` บังคับซ่อนชิ้นส่วนนอกช่องสวมใส่ (เช่น สวมหมวกจะถูกซ่อนตัว)
    - ต้องสร้างและใช้ `controller.render.zirconx_skin` ใน Resource Pack เพื่อเรนเดอร์ `geometry.default` และ `texture.default` โดยตรง
    - อนุญาตให้สกินหมวก/วิกผมเรนเดอร์ชิ้นส่วนลำตัว (Torso) เพิ่มเติมได้โดยไม่ถูกตัดทอน
  - ตั้งค่า `protection: 0` เสมอ (ไม่มีเกราะป้องกัน เพื่อไม่ให้ทำลายสมดุลเกม)
  - กำหนด `max_stack_size: 1`
  - **ห้ามใช้คอมโพเนนต์ Deprecated**: ห้ามใช้ `minecraft:armor` และ `minecraft:render_offsets` (ยกเลิกแล้วในเวอร์ชันใหม่)
  - **Unbreakable**: ห้ามใส่ `minecraft:durability` เพื่อให้ไอเทมไม่มีวันพังเสียหาย
  - **Anti-Clipping Armor Offset**: ในไฟล์โมเดล Humanoid Geometry (`humanoid_custom.geo.json`) รองรับการกำหนด `inflateOffset` (+0.05) สำหรับเลเยอร์ในและเลเยอร์นอกของไอเทมเสื้อผ้า เพื่อให้สวมคลุมอยู่ชั้นนอกตัวละคร ป้องกันการเกิด Z-Fighting หรือเนื้อสกินแลบทะลุ
- **In-Hand Scale Glitch Prevention**:
  - เมื่อถือไอเทมในมือ ให้ตั้งสเกลเป็นขนาดจิ๋ว `1e-5` ใน attachable เพื่อซ่อนไม่ให้มีโมเดลลอยเกะกะในมุมมองบุคคลที่ 1 หรือ 3

---

## 2. 🖼️ การประมวลผล Texture และ Dynamic 16x16 Icon

- **ความละเอียดสกิน (Skin Resolution)**:
  - รองรับทั้งสกิน 64x64, 128x128 และสกิน HD จนถึง 4096px
  - หากเป็นสกินเก่า 64x32 ต้องแปลงขยายเป็น 64x64 อัตโนมัติ พร้อมสร้าง UV แขนซ้าย/ขวาตามมาตรฐาน Minecraft 1.8+
- **Dynamic 16x16 Item Icon**:
  - ครอปใบหน้าตัวละครจากสกินของผู้ใช้โดยตรง (`updateDynamicItemIcon`)
  - นำชิ้นส่วน Outer Hat Layer ซ้อนทับลงบน Base Face เสมอ เพื่อให้เห็นทรงผม/แว่น/หมวกครบถ้วน
  - เรนเดอร์เป็นภาพ PNG ขนาด 16x16 พิกเซล คมชัดระดับพิกเซล เพื่อใช้เป็นไอคอนในกระเป๋าและ Hotbar

---

## 3. 🌐 ระบบภาษาและการแปลชื่อ (Localization Standard)

- **ไฟล์แปลภาษาครบวงจร**:
  - ต้องสร้างทั้งใน Resource Pack (RP) และ Behavior Pack (BP):
    - `texts/en_US.lang`
    - `texts/th_TH.lang`
    - `texts/languages.json` (ระบุ `["en_US", "th_TH"]`)
- **โครงสร้างคีย์แปลภาษา**:
  - `item.zirconx:<id>.name=<ชื่อที่ตั้ง>`
  - `item.zirconx:<id>=<ชื่อที่ตั้ง>`
  - ป้องกันการแสดงรหัส ID ดิบ (เช่น `skin_ft2ba2vf_head`) บนจอเมื่อสวมใส่หรือชี้ดูไอเทม

---

## 4. 🔑 มาตรฐาน Manifest & UUID Binding

- **UUID Generation**:
  - ต้องสร้าง UUID v4 แบบสุ่มและไม่ซ้ำกันในทุกรอบการ Export
  - สำหรับ `manifest.json`:
    - Header UUID และ Module UUID ต้องเป็นคนละตัวกัน
    - การจับคู่ Dependency ระหว่าง BP และ RP ต้องอ้างอิง Header UUID และเวอร์ชันของอีกฝั่งอย่างถูกต้อง
- **Script API Dependencies (สำหรับตู้เสื้อผ้า Wardrobe)**:
  - ใช้ `@minecraft/server: "2.1.0-beta"`
  - ใช้ `@minecraft/server-ui: "2.0.0-beta"`
  - ระบุ `min_engine_version: [1, 21, 0]`

---

## 5. 🗂️ การแพ็กเกจไฟล์ (.mcaddon)

- โครงสร้าง ZIP ภายใน `.mcaddon`:
  - มีทั้งโฟลเดอร์ Resource Pack (`*_RP`) และ Behavior Pack (`*_BP`) อยู่ใน Root ระดับเดียวกัน
  - หรือรวม RP และ BP เข้าด้วยกันในรูปแบบ Multi-pack `.mcaddon` ที่ตัวเกม Minecraft Bedrock สามารถแตะดับเบิลคลิกเพื่อ Import อัตโนมัติได้ทันที
