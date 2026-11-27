# VC Document

> **Thai VC ARF — 2.0 DRAFT 1** กรอบแนวทางการทำงานร่วมกันของเอกสารรับรองดิจิทัลสำหรับประเทศไทย

**🌐 เว็บไซต์ (อ่านเอกสารฉบับเต็ม):** **https://etda.github.io/vcdoc/**

[![Deploy to GitHub Pages](https://github.com/ETDA/vcdoc/actions/workflows/deploy.yml/badge.svg)](https://github.com/ETDA/vcdoc/actions/workflows/deploy.yml)

---

## เกี่ยวกับโปรเจกต์นี้

เว็บไซต์นี้แสดง [Thai VC ARF ฉบับภาษาไทย](docs/thai-vc-arf/README.md) เป็นเนื้อหาหลัก ครอบคลุมบทสรุป บทที่ 1–16 และรูปประกอบ โดยแทนที่คู่มือ Trust Framework เดิมทั้งหมด

- **เวอร์ชันเว็บไซต์:** `2.0 DRAFT 1` (กำลังจัดทำ) แสดงในเมนูเวอร์ชันของ Docusaurus — ดูหัวข้อ “เวอร์ชันของเอกสาร” ด้านล่าง
- **ต้นทางบทภาษาไทย:** `vc-document/th/thai-vc-arf/`
- [English summary](docs/en/thai-vc-arf/00-minimal-interoperability-reference.md) — คัดลอกจาก `vc-document/en/thai-vc-arf/`; แหล่งต้นทางมีบทสรุปภาษาอังกฤษหนึ่งหน้า ไม่ใช่คำแปลทุกบท

ไฟล์ Markdown ที่นำเข้าปรับรูปแบบคอมเมนต์จาก HTML เป็น MDX เพื่อให้ Docusaurus สร้างเว็บไซต์ได้ โดยไม่แก้เนื้อหาหลักที่แสดงแก่ผู้อ่าน

## เวอร์ชันของเอกสาร

เอกสารเผยแพร่เป็น **ลูกโซ่ของฉบับที่ตรึงเนื้อหาไว้** (frozen drafts) ฉบับใดเผยแพร่แล้วจะไม่ถูกแก้ไขอีกและมีวันที่เผยแพร่ (พ.ศ.) แสดงบนทุกหน้าของฉบับนั้น ส่วนฉบับปัจจุบันเปิดรับการแก้ไขและจะถูกตรึงเมื่อตัดเวอร์ชันถัดไป

| เวอร์ชัน | วันที่เผยแพร่ | ที่อยู่ |
|---|---|---|
| 2.0 DRAFT 1 (กำลังจัดทำ) | — | `/` (`docs/`) |
| 2.0 DRAFT 0 | 6 ตุลาคม 2569 | `/2.0-draft-0/` (`versioned_docs/version-2.0-draft-0/`) |
| 1.1 | 15 มกราคม 2568 | เอกสาร PDF ต้นฉบับ (ลิงก์จากหน้า `/versions`) |

- `versions.meta.mjs` เป็นแหล่งข้อมูลเดียวของลูกโซ่ (label, วันที่, tree hash, สถานะที่คำนวณจากลำดับ) — ไม่มีที่อื่นให้แก้
- `/versions` ประวัติเวอร์ชัน · `/versions/diff/<a>__<b>/` ส่วนต่างระดับบท · `/versions/diff/<a>__<b>/clauses/` ส่วนต่างระดับข้อ
- ตัดเวอร์ชันใหม่: `npm run version:cut -- "2.0 DRAFT 2"` — คัดลอก `docs/` เป็น `versioned_docs/version-<id>/`, บันทึก `treeHash`, แปลงฉบับที่กำลังทำเป็น snapshot และตั้ง `docs/` เป็นฉบับถัดไป
- ตรวจลูกโซ่และ hash ของฉบับที่ตรึงไว้: `npm run versions:check` (ถูกรันใน `npm test` ด้วย)
- **ห้ามแก้ไฟล์ใน `versioned_docs/version-*/`** — ฉบับที่ตรึงแล้วต้องไม่เปลี่ยน; การแก้ไขทั้งหมดทำที่ `docs/` เท่านั้น
- ช่องค้นหาไม่ index ฉบับที่ตรึงไว้ (`ignoreFiles` ใน `docusaurus.config.ts`) เพื่อไม่ให้ผลค้นหาซ้ำทุกเวอร์ชัน

## การเข้าถึงสำหรับ AI

- [`llms.txt`](https://etda.github.io/vcdoc/llms.txt) คือดัชนีบทและคำอธิบายสำหรับ agent
- ทุกบทมี Markdown ที่ต่อท้าย URL ของหน้าเว็บด้วย `.md` เช่น `/thai-vc-arf/faq.md`
- [`faq.json`](https://etda.github.io/vcdoc/faq.json) คือคำถามและคำตอบพร้อมสถานะ สำหรับใช้เป็นชุดข้อมูล

## เทคโนโลยีที่ใช้

- [Docusaurus 3](https://docusaurus.io/) — static site generator
- ค้นหาแบบ offline รองรับ **ภาษาไทย** (ตัดคำด้วย `Intl.Segmenter`)
- Deploy อัตโนมัติผ่าน **GitHub Actions → GitHub Pages**

## พัฒนาในเครื่อง (Local Development)

```bash
npm install       # ติดตั้ง dependencies (จะ apply patch ค้นหาไทยอัตโนมัติ)
npm start         # เปิด dev server ที่ http://localhost:3000
npm run build     # build เว็บไซต์ static ไปที่ build/
npm run serve     # ทดสอบผลลัพธ์ build ในเครื่อง
```

> ต้องใช้ Node.js เวอร์ชัน 20 ขึ้นไป

## การ Deploy

เว็บไซต์ deploy อัตโนมัติทุกครั้งที่ push เข้า branch `main`
ผ่าน workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)

หลัง deploy สำเร็จ เว็บไซต์จะอัปเดตที่ 👉 **https://etda.github.io/vcdoc/**

---

© ETDA — Electronic Transactions Development Agency
