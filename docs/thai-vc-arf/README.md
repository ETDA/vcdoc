---
description: "Thai VC ARF — 2.0 DRAFT 0 — Thai VC ARF 2.0 DRAFT 0"
---

# Thai VC ARF — กรอบแนวทางการทำงานร่วมกันของเอกสารรับรองดิจิทัล (เวอร์ชัน 1.1 + ส่วนขยาย 2.1)

{/* METADATA (agent-only — not rendered to readers)
> **สถานะ:** 📄 Reference — บทที่ 1–8 แปลงจาก PDF ต้นฉบับ Thai VC ARF v1.1 ของ สพธอ. (มกราคม 2568) และเพิ่มส่วนขยายเวอร์ชัน 2.1 (บทที่ 6.5, 8.1, 8.2, 9–16)
> **แหล่งข้อมูล:** [Thai-VC-ARF-v1-1.pdf](https://www.etda.or.th/getattachment/Our-Service/Digital-Trusted-services-Infrastructure/VC-and-Digital-Document-Wallet/Information/รายงานทางเทคนค-Thai-VC-ARF-v1-1.pdf) — รายงานทางเทคนิค: THAI VC ARCHITECTURE AND REFERENCE FRAMEWORK เวอร์ชัน 1.1 (มกราคม 2568)
> **เอกสารที่เกี่ยวข้อง:** [research/34 — Trusted List domestic + cross-border](../research/34-trustlist-domestic-and-crossborder.md) · [governance/VCGF](../governance/README.md)
*/}

---

## เอกสารนี้คืออะไร

นี่คือ **รายงานทางเทคนิค Thai VC ARF** ของ สพธอ. ในรูปแบบ Markdown เพื่อใช้บนเว็บ (Docusaurus)
เอกสารต้นฉบับวางกรอบการทำงานร่วมกัน (interoperability) ของเอกสารรับรองดิจิทัล (VC) และเอกสารสำแดงดิจิทัล (VP) สำหรับประเทศไทย

บทที่ 1–8 มีฐานจากต้นฉบับเวอร์ชัน 1.1 แต่มีการปรับปรุงมาตรฐานและแนวทางปฏิบัติในบางบท; บทที่ 6.5 และบทที่ 9–14 เป็นส่วนขยายหลักเวอร์ชัน 2.0 (บทที่ 6.5 เป็นบทเกริ่นนำเรื่องกลไกการสร้างความน่าเชื่อถือ แทรกก่อนบทที่ 7) ส่วนบทที่ 8.1, 8.2 และ 12.1 เพิ่มเติมในเวอร์ชัน 2.1 และบทที่ 8 มี revision ย่อยตาม metadata ของบท แต่ละบทอยู่คนละไฟล์เพื่อให้อ่านง่ายบนเว็บ

{/* METADATA (agent-only — not rendered to readers)
## หมายเหตุการแปลงและการปรับปรุง

- เนื้อความไทยและศัพท์เทคนิคภาษาอังกฤษในบทที่ 1–8 เก็บไว้ตรงตามต้นฉบับ ไม่ได้เขียนใหม่ (บทที่ 5 มีข้อยกเว้นเป็นหมายเหตุกำกับเพิ่มเติม — ดูรายการถัดไป)
- **บทที่ 5 ปรับปรุงมาตรฐานในรอบ v2.0 (MASA-170)** — ระบุการรองรับ W3C VCDM v1.1 สำหรับเอกสารเดิม และ SD-JWT VC (`dc+sd-jwt`) สำหรับโปรไฟล์เอกสารใหม่ พร้อม OID4VCI 1.0 Final และ OID4VP 1.0 Final (DCQL); รายละเอียดทางเทคนิคอยู่ที่บทที่ 8/8.1/8.2
- รูปทั้ง 28 รูปถูกดึงออกมาเป็นไฟล์ภาพและฝังไว้ในตำแหน่งเดิม (ดูโฟลเดอร์ `images/`)
- คอมเมนต์ `<!-- pdf page N -->` บอกเลขหน้าของ PDF ต้นฉบับไว้เพื่ออ้างอิง
- **บทที่ 6.5 (กลไกการสร้างความน่าเชื่อถือ — Trusted List และแบบจำลองความน่าเชื่อถือ 3 รูปแบบ) และบทที่ 9–14 (Trust Model 3, WUA, Cryptographic Suites, Key Management/Trusted List Deployment, VC Status/Revocation และ Threat Model/Conformance) เป็นส่วนขยายเวอร์ชัน 2.0** ที่คณะทำงานเพิ่ม ไม่ได้อยู่ใน PDF ต้นฉบับ
- **บทที่ 8.1 (OID4VCI Full Flow) และ 8.2 (OID4VP Full Flow) เป็นส่วนขยายเวอร์ชัน 2.1** ที่เพิ่มเติมภายใต้ MASA-158 — รวมแผนภาพฉบับสมบูรณ์ รายละเอียด field-by-field และนโยบาย DPoP จาก trust-guide เข้าเป็นภาคผนวกของบทที่ 8
- **บันทึกการเปลี่ยนแปลงจากเวอร์ชัน 1.1 เป็น 2.0** อยู่ใน [ภาคผนวก ข](15-appendix.md)
- **[บทที่ 0](00-minimal-interoperability-reference.md) เป็นบทสรุปหนึ่งหน้าที่จัดทำเพิ่มเติม** เพื่อให้ระบบของคู่ภาคีใช้ตรวจสอบความสอดคล้องกัน (interoperability) โดยรายละเอียดโครงสร้าง Trusted List ให้ยึด [research/42](../research/42-trusted-list-lote-jwt-format.md) และบทที่ 0 เป็นแหล่งข้อมูลอ้างอิงหลัก
*/}

## สารบัญ

| บท | หัวข้อ | ไฟล์ |
|---|--------|------|
| 0 | **ชุดมาตรฐานและเทคโนโลยีของเอกสารรับรองดิจิทัลของประเทศไทย — สรุปหนึ่งหน้า** (บทสรุปสำหรับระบบของคู่ภาคี) | [00-minimal-interoperability-reference.md](00-minimal-interoperability-reference.md) |
| 1 | ขอบข่าย | [01-scope.md](01-scope.md) |
| 2 | บทนิยาม | [02-definitions.md](02-definitions.md) |
| 3 | ภาพรวมการใช้งาน | [03-usage-overview.md](03-usage-overview.md) |
| 4 | แนวคิดและองค์ประกอบที่ส่งเสริมการทำงานร่วมกัน | [04-interoperability-concepts.md](04-interoperability-concepts.md) |
| 5 | มาตรฐานและข้อปฏิบัติสำหรับ VC และ VP | [05-standards-and-compliance.md](05-standards-and-compliance.md) |
| 6 | Decentralized Identifiers Methodologies | [06-did-methodologies.md](06-did-methodologies.md) |
| 6.5 | **กลไกการสร้างความน่าเชื่อถือ (Trust-Building Mechanism) — Trusted List และแบบจำลองความน่าเชื่อถือ 3 รูปแบบ** (ส่วนขยาย v2.0) | [06.5-trust-building-mechanism.md](06.5-trust-building-mechanism.md) |
| 7 | การทำงานร่วมกันข้ามระบบนิเวศและผลของ Trusted List | [07-cross-ecosystem-interoperability.md](07-cross-ecosystem-interoperability.md) |
| 8 | Implementation Guidelines (OID4VCI / OID4VP) | [08-implementation-guidelines.md](08-implementation-guidelines.md) |
| 8.1 | **ภาคผนวกบทที่ 8 — Full Flow OID4VCI ทางเทคนิคโดยละเอียด** (ส่วนขยาย v2.1 — MASA-158, STEP 1.5 → 2.5) | [08.1-issuance-full-flow-detail.md](08.1-issuance-full-flow-detail.md) |
| 8.2 | **ภาคผนวกบทที่ 8 — Full Flow OID4VP ทางเทคนิคโดยละเอียด** (ส่วนขยาย v2.1 — MASA-158) | [08.2-oid4vp-full-flow-detail.md](08.2-oid4vp-full-flow-detail.md) |
| 9 | **Trust Model 3 — Trusted List + DID** (ส่วนขยาย v2.0) | [09-trust-model-3.md](09-trust-model-3.md) |
| 10 | **Wallet Unit Attestation (WUA)** (ส่วนขยาย v2.0) | [10-wallet-unit-attestation.md](10-wallet-unit-attestation.md) |
| 11 | **Cryptographic Suites** (ส่วนขยาย v2.0) | [11-cryptographic-suites.md](11-cryptographic-suites.md) |
| 12 | **Key Management, Key Rotation และ Trusted List Deployment** (ส่วนขยาย v2.0) | [12-key-management-and-trustlist-deployment.md](12-key-management-and-trustlist-deployment.md) |
| 12.1 | **ข้อกำหนดการเผยแพร่ Trusted List — JWT แบบ LoTE จำนวน 3 ไฟล์ จุดเผยแพร่ โครงสร้างข้อมูล และตัวอย่าง** (ส่วนขยาย v2.1) | [12.1-trust-list-publication-profile.md](12.1-trust-list-publication-profile.md) |
| 13 | **VC Status และ Revocation** (ส่วนขยาย v2.0) | [13-vc-status-and-revocation.md](13-vc-status-and-revocation.md) |
| 14 | **ความมั่นคงปลอดภัย: Threat Model และรายการตรวจ Conformance** (ส่วนขยาย v2.0) | [14-security-threat-model-and-conformance.md](14-security-threat-model-and-conformance.md) |
| 15 | ภาคผนวก (ก. การทำงานร่วมกัน · ข. บันทึกการเปลี่ยนแปลง v1.1 → v2.0) | [15-appendix.md](15-appendix.md) |
| 16 | บรรณานุกรม | [16-bibliography.md](16-bibliography.md) |

---

> 📌 กลับไปที่ [th/](../README.md) | [README.md หลัก](../../README.md)
