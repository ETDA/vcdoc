# VC Document

> เอกสารและมาตรฐาน **Verifiable Credential (VC)** โดย ETDA — คู่มือ Trust Framework ของระบบ VC Ecosystem ประเทศไทย

**🌐 เว็บไซต์ (อ่านเอกสารฉบับเต็ม):** **https://etda.github.io/vcdoc/**

[![Deploy to GitHub Pages](https://github.com/ETDA/vcdoc/actions/workflows/deploy.yml/badge.svg)](https://github.com/ETDA/vcdoc/actions/workflows/deploy.yml)

---

## เกี่ยวกับโปรเจกต์นี้

โปรเจกต์นี้คือเว็บไซต์เอกสาร (documentation site) ที่รวบรวม **คู่มือ Trust Framework** ของระบบ Verifiable Credential ในประเทศไทย
อธิบายว่ากรอบความน่าเชื่อถือ (Trust Framework) ของ ETDA ทำให้ทุกฝ่ายในระบบ VC เชื่อใจกันได้อย่างไร
ตั้งแต่การ **ออกเอกสารดิจิทัล (Issuance)** ไปจนถึงการ **แสดงเอกสารให้ผู้ตรวจสอบ (Presentation)**

เนื้อหาแบ่งเป็น 9 ส่วนหลัก เรียงตามลำดับที่ควรอ่าน:

| บท | หัวข้อ | เหมาะกับใคร |
|----|--------|-------------|
| 1 | Concepts & Roles — แนวคิดและบทบาท | ผู้เริ่มต้นทุกคน |
| 2 | Architecture — สถาปัตยกรรมภาพรวม | ผู้เริ่มต้น / สถาปนิกระบบ |
| 3 | Issuance Flow — ขั้นตอนการออกเอกสาร | นักพัฒนาฝั่งผู้ออกบัตร (Issuer) |
| 4 | Presentation Flow — ขั้นตอนการแสดงเอกสาร | นักพัฒนาฝั่งผู้ตรวจสอบ (Verifier) |
| 5 | Trust Infrastructure — โครงสร้างความน่าเชื่อถือ | นักพัฒนา / ผู้ดูแลระบบ |
| 6 | Security & Privacy — ความปลอดภัยและความเป็นส่วนตัว | ทุกฝ่าย |
| 7 | Governance & Conformance — การกำกับดูแลและการรับรอง | องค์กรที่ต้องการเข้าร่วมระบบ |
| 8 | FAQ — คำถามที่พบบ่อย | ทุกคน |
| 9 | Appendix — ภาคผนวก (สรุปกฎความปลอดภัย) | อ้างอิงเร็ว |

> 💡 แนะนำ: ผู้เริ่มต้นอ่านบท 1–2 ก่อน, ผู้ออกบัตรเริ่มบท 3, ผู้ตรวจสอบเริ่มบท 4, องค์กรที่อยากเข้าร่วมดูบท 7

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
