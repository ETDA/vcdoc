# VC Document

> **Thai VC ARF — 2.0 DRAFT 0** กรอบแนวทางการทำงานร่วมกันของเอกสารรับรองดิจิทัลสำหรับประเทศไทย

**🌐 เว็บไซต์ (อ่านเอกสารฉบับเต็ม):** **https://etda.github.io/vcdoc/**

[![Deploy to GitHub Pages](https://github.com/ETDA/vcdoc/actions/workflows/deploy.yml/badge.svg)](https://github.com/ETDA/vcdoc/actions/workflows/deploy.yml)

---

## เกี่ยวกับโปรเจกต์นี้

เว็บไซต์นี้แสดง [Thai VC ARF ฉบับภาษาไทย](docs/thai-vc-arf/README.md) เป็นเนื้อหาหลัก ครอบคลุมบทสรุป บทที่ 1–16 และรูปประกอบ โดยแทนที่คู่มือ Trust Framework เดิมทั้งหมด

- **เวอร์ชันเว็บไซต์:** `2.0 DRAFT 0` แสดงในเมนูเวอร์ชันของ Docusaurus
- **ต้นทางบทภาษาไทย:** `vc-document/th/thai-vc-arf/`
- [English summary](docs/en/thai-vc-arf/00-minimal-interoperability-reference.md) — คัดลอกจาก `vc-document/en/thai-vc-arf/`; แหล่งต้นทางมีบทสรุปภาษาอังกฤษหนึ่งหน้า ไม่ใช่คำแปลทุกบท

ไฟล์ Markdown ที่นำเข้าปรับรูปแบบคอมเมนต์จาก HTML เป็น MDX เพื่อให้ Docusaurus สร้างเว็บไซต์ได้ โดยไม่แก้เนื้อหาหลักที่แสดงแก่ผู้อ่าน

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
