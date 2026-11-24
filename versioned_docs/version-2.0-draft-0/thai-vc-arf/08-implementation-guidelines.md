---
description: "8. Implementation Guidelines — OID4VCI / OID4VP และแนวทางการนำไปใช้งาน — Thai VC ARF 2.0 DRAFT 0"
---

# 8. Implementation Guidelines — OID4VCI / OID4VP และแนวทางการนำไปใช้งาน

{/* METADATA (agent-only — not rendered to readers)
> **สถานะ:** Reference — เอกสารแปลงจาก PDF ต้นฉบับของ สพธอ. (Thai VC ARF v1.1, มกราคม 2568) และปรับปรุงเพิ่มเติมจากเอกสารใน trust-guide (th/public-site/vcdoc/docs/trust-guide) ภายใต้ข้อกำหนด MASA-158
> **เวอร์ชันเอกสาร:** v2.1.3 (2026-10-01) — กำหนดให้รองรับการลงลายมือชื่อด้วย EdDSA (Ed25519) และ ES256 (ECDSA P-256/SHA-256) ในข้อกำหนดหลักและตารางสรุป
> **เวอร์ชัน:** v2.1 (Implementation Guidelines)
> **วันที่:** 1 ตุลาคม 2569
> **แหล่งข้อมูล:** [Thai-VC-ARF-v1-1.pdf](https://www.etda.or.th/getattachment/Our-Service/Digital-Trusted-services-Infrastructure/VC-and-Digital-Document-Wallet/Information/รายงานทางเทคนค-Thai-VC-ARF-v1-1.pdf) · trust-guide/03-issuance-flow/ · trust-guide/04-presentation-flow/ · [REF-MASA-158][REF-MASA-165]
> **เอกสารที่เกี่ยวข้อง:** [ดัชนีเอกสาร ARF](README.md) · [02-definitions.md](02-definitions.md) · [06-did-methodologies.md](06-did-methodologies.md) · [07-cross-ecosystem-interoperability.md](07-cross-ecosystem-interoperability.md) · [08.1 — OID4VCI Full Flow](08.1-issuance-full-flow-detail.md) · [08.2 — OID4VP Full Flow](08.2-oid4vp-full-flow-detail.md) · [09-trust-model-3.md](09-trust-model-3.md) · [15-appendix.md](15-appendix.md) · [16-bibliography.md](16-bibliography.md)
*/}

---

## 8.0. วัตถุประสงค์และขอบเขต

ข้อแนะนำเบื้องต้นการพัฒนาระบบจะช่วยให้การให้บริการและการแลกเปลี่ยนเอกสารรับรองดิจิทัลมีความมั่นคงปลอดภัย และช่วยคุ้มครองข้อมูลส่วนบุคคลของเอนทิตีต่าง ๆ ที่เกี่ยวข้อง รวมถึงช่วยจำกัดความซับซ้อนของแนวทางการพัฒนาเชิงเทคนิค (technical solution) เพื่อให้กระเป๋าเอกสารดิจิทัล (Document Wallet) และเอกสารรับรอง (Verifiable Credential — VC) สามารถทำงานร่วมกันได้

บทนี้ระบุข้อกำหนดเชิงเทคนิค (MUST / SHOULD / MAY) สำหรับการออก VC และการแสดง VP โดยใช้โปรโตคอลมาตรฐาน OID4VCI 1.0 และ OID4VP 1.0 ของ OpenID Foundation พร้อมแผนภาพผังขั้นตอนภาพรวม (Overview Flow) และอธิบายการทำงานร่วมกับรายชื่อผู้ที่ได้รับความเชื่อถือ (ETDA Trusted List) และการ resolve DID (DID Resolution) ในกรณีต่าง ๆ

{/* METADATA (agent-only — not rendered to readers)
> **ฐานที่มาของบท:** เนื้อหาบทนี้ปรับปรุงจากฐานเวอร์ชัน 1.1 ของรายงาน Thai VC ARF [REF-ARF-V11-SRC] ร่วมกับแผนภาพฉบับสมบูรณ์จากเอกสาร trust-guide (th/public-site/vcdoc/docs/trust-guide) ภายใต้ข้อกำหนดงาน MASA-158 [REF-MASA-158] แผนภาพ Sequence ฉบับสมบูรณ์และรายละเอียดทางเทคนิคระดับ field-by-field ของทั้ง OID4VCI และ OID4VP อยู่ใน [08.1-issuance-full-flow-detail.md](08.1-issuance-full-flow-detail.md) และ [08.2-oid4vp-full-flow-detail.md](08.2-oid4vp-full-flow-detail.md) ตามลำดับ กลไกการตรวจสอบความน่าเชื่อถือ 4 จุดตรวจ (TC-1 ถึง TC-4) อธิบายด้วยข้อความเชิงบรรยายใน §8.4
*/}

{/* METADATA (agent-only — not rendered to readers)
> **ศัพท์เทคนิค:** คงคำภาษาอังกฤษตามมาตรฐาน (เช่น Verifiable Credential — VC, Verifiable Presentation — VP, Issuer, Verifier, Holder, Trusted List, Status List) เพื่อความชัดเจนและสอดคล้องกับเอกสารอ้างอิงสากล [REF-OID4VCI][REF-OID4VP][REF-SDJWT][REF-TSL][REF-DID-CORE]
*/}

---

## 8.1. องค์ประกอบพื้นฐาน

### 8.1.1. กรณีศึกษา

รายงานฉบับนี้ใช้กรณีศึกษา การออกใบประมวลผลการศึกษา (Transcript) ของสถาบันการศึกษาในประเทศไทย เป็นตัวอย่างประกอบแผนภาพและคำอธิบาย เพื่อให้ผู้อ่านเห็นภาพการนำ OID4VCI/OID4VP ไปใช้งานจริง

### 8.1.2. ข้อกำหนดทางเทคนิค

ระบบที่พัฒนาตามแนวทางนี้ MUST ปฏิบัติตามข้อกำหนดต่อไปนี้:

| หัวข้อ | ข้อกำหนด (RFC 2119) | แหล่งอ้างอิง |
|--------|---------------------|---------------|
| ภาษาในการพัฒนา | MUST เป็น High-Level Language | — |
| อัลกอริทึมลายมือชื่ออิเล็กทรอนิกส์ | MUST รองรับการสร้างและตรวจลายมือชื่อด้วย EdDSA (Ed25519) และ ES256 (ECDSA P-256/SHA-256) | [REF-EdDSA] [REF-ES256] |
| เค้าร่างเอกสารรับรอง | MUST รองรับ W3C Verifiable Credentials Data Model v1.1 สำหรับเอกสารเดิม และ MUST รองรับ IETF SD-JWT Verifiable Credential (`dc+sd-jwt`) ที่เพิ่มใน ARF ฉบับนี้; การออกเอกสารใหม่ SHOULD ใช้ `dc+sd-jwt` | [REF-W3C-VCDM] [REF-SDJWT] |
| โปรโตคอลออกเอกสารรับรอง | MUST ใช้ OpenID for Verifiable Credential Issuance (OID4VCI) 1.0 Final | [REF-OID4VCI] |
| โปรโตคอลแสดงเอกสาร | MUST ใช้ OpenID for Verifiable Presentations (OID4VP) 1.0 Final พร้อม Digital Credentials Query Language (DCQL) | [REF-OID4VP] |
| การยกเลิก/ระงับเอกสาร | MUST ใช้ IETF Token Status List (`statuslist+jwt`) เป็นกลไก revocation | [REF-TSL] |
| กระบวนการ Authorization Code | MUST ใช้ pre-authorized code flow ตาม OID4VCI §4.1 ยกเว้นกรณีผู้ถือ (Holder) ร้องขอ authorization แบบ explicit code | [REF-OID4VCI] |
| การ resolve DID (DID Resolution) | MUST รองรับ DIF Universal Resolver เป็นตัวกลางมาตรฐาน และ SHOULD รองรับ `did:web` และ `did:key` โดยตรงเพื่อลดการพึ่งพาส่วนกลาง | [REF-UR][REF-DID-CORE] |
| ลายมือชื่อในคำขอ (Request Object) | MUST ใช้ client identifier scheme ที่ OID4VP §5.9 ระบุ เช่น `x509_san_dns:`, `x509_hash:`, `decentralized_identifier:`, `verifier_attestation`, `openid_federation` | [REF-OID4VP] |

{/* METADATA (agent-only — not rendered to readers)
> **ฐานจากเวอร์ชัน 1.1 และการปรับปรุงในเวอร์ชัน 2.0:** เวอร์ชัน 1.1 ใช้ W3C VCDM v1.1 และ JSON-LD สำหรับเอกสารเดิม รวมทั้ง OID4VC draft 13 กับ OID4VP draft 20 เวอร์ชัน 2.0 ยังคงรองรับ W3C VCDM v1.1 และเพิ่ม SD-JWT VC (`dc+sd-jwt`) สำหรับเอกสารใหม่ พร้อมใช้ OID4VCI 1.0 Final และ OID4VP 1.0 Final (พร้อม DCQL) โดยกำหนด EdDSA (Ed25519) เป็นอัลกอริทึมที่แนะนำ และกำหนดให้รองรับ ES256 เพิ่มเติมตามโปรไฟล์กุญแจในบทที่ 11; pre-authorized code flow ยังคงเป็นแนวทางเดิม รายละเอียดการเปลี่ยนแปลงดูได้ที่ [ภาคผนวก ข — บันทึกการเปลี่ยนแปลง v1.1→v2.0](15-appendix.md)
*/}

{/* METADATA (agent-only — not rendered to readers)
> **หมายเหตุการเปลี่ยนชื่อ WTE → WUA:** เอกสารนี้ใช้คำว่า **WUA (Wallet Unit Attestation)** ตาม EUDI ARF 2.9.0 [REF-ARF] แทนคำว่า WTE เดิม ข้อกำหนดใน OID4VCI คงตามกระบวนการออกเอกสารที่ระบุใน §8.2 และภาคผนวก 8.1 ส่วน **ใน OID4VP** Thai profile กำหนดให้ Wallet รัฐบาลส่ง WIA และ WIA-PoP ครบคู่ ส่วน Wallet เอกชนเลือกส่งครบคู่หรือไม่ส่งทั้งคู่ได้ หากส่งไม่ครบคู่หรือหลักฐานตรวจไม่ผ่าน ให้ปฏิเสธ VP; Verifier ต้องจำแนกประเภท Wallet จากข้อมูลที่เชื่อถือได้ และปฏิเสธ VP หากจำแนกไม่ได้ [กลไก §8.4.2 และภาคผนวก 8.2](08.2-oid4vp-full-flow-detail.md) บทนี้กล่าวถึง WUA เฉพาะที่ปรากฏในกระแสงาน OID4VCI/OID4VP ส่วนแนวคิดและนิยามดู [บทที่ 10 — Wallet Unit Attestation (WUA)](10-wallet-unit-attestation.md)
*/}

### 8.1.3. บทบาทและผู้มีส่วนได้ส่วนเสีย

การแลกเปลี่ยน VC และ VP ประกอบด้วย 4 บทบาทหลัก MUST เข้าใจร่วมกันดังนี้:

| บทบาท | ความหมาย | ตัวอย่างในบริบทไทย |
|------|---------|----------------|
| **Issuer** | ผู้ออก VC เป็นผู้รับผิดชอบในการลงนามและเผยแพร่ Status List | สถาบันการศึกษา, กรมการปกครอง (DOPA), กรมการขนส่งทางบก (DLT) |
| **Holder (ผู้ถือ)** | ผู้ครอบครอง VC ในกระเป๋าเอกสารดิจิทัล (Document Wallet) และเป็นผู้สร้าง VP เมื่อต้องแสดง | ผู้ใช้งาน Document Wallet |
| **Verifier** | ผู้ขอและตรวจสอบ VP จากผู้ถือ ตามวัตถุประสงค์ที่ลงทะเบียนไว้กับ สพธอ. | สถานพยาบาล, สถาบันการเงิน, หน่วยงานภาครัฐ |
| **Wallet Provider (WP)** | ผู้พัฒนาและดูแลกระเป๋าเอกสารดิจิทัล ออก Wallet Unit Attestation (WUA) เพื่อรับรองแอป | สำนักงานพัฒนารัฐบาลดิจิทัล (DGA), ผู้ให้บริการกระเป๋าเอกสารเอกชน |

นอกจาก 4 บทบาทหลักแล้ว ยังมี **ETDA Trusted List (TL)** ทำหน้าที่:

1. **การเข้าถึงไฟล์ (file access)** — Wallet, Issuer และ Verifier ดึง Trusted List ที่เกี่ยวข้องฉบับเต็มในรูปแบบ JWT จาก CDN โดยตรงเมื่อเกิดการใช้งาน ไม่ต้องใช้ API key
2. **ควบคุมความเชื่อถือ (trust anchor)** — Trusted List ที่ดึงจาก CDN เป็น JWT ที่ สพธอ. ลงลายมือชื่อ ผู้ตรวจต้องตรวจลายมือชื่อทุกครั้งที่ได้รับไฟล์ใหม่จาก CDN [REF-TRUSTLIST-CDN]

> รายละเอียดเกี่ยวกับ Trusted List schema และการดึงไฟล์จาก CDN ดูได้ที่ [§9 Trust Model 3](09-trust-model-3.md) และ [ข้อกำหนดการเผยแพร่ Trust List](12.1-trust-list-publication-profile.md) [REF-TRUSTLIST-CDN]

### 8.1.4. รหัสสีในแผนภาพ

แผนภาพ Mermaid ในบทนี้ใช้สีเพื่อแยกประเภทของขั้นตอนอย่างชัดเจน:

| สี | ความหมาย | ผู้รับผิดชอบ |
|----|---------|------------|
| **เขียว** | การดาวน์โหลด Trusted List (เกิดก่อนผู้ใช้เริ่ม) | สพธอ. (ETDA) |
| **น้ำเงิน** | ขั้นตอนตามมาตรฐาน OID4VCI/OID4VP สากล | OpenID Foundation |
| **ส้ม** | จุดตรวจสอบความน่าเชื่อถือ (TC-1 ถึง TC-4) | Trust Framework (สพธอ.) |

---

## 8.2. การออกเอกสารรับรองดิจิทัล (OID4VCI) — Flow การรับเอกสารรับรอง

{/* METADATA (agent-only — not rendered to readers)
> **แหล่งข้อมูล:** trust-guide/03-issuance-flow/ · [08.1-issuance-full-flow-detail.md](08.1-issuance-full-flow-detail.md) · [REF-OID4VCI]
*/}

### 8.2.1. สถานการณ์

ผู้ใช้ต้องการรับเอกสารรับรองดิจิทัล (เช่น ใบประมวลผลการศึกษา Transcript) ไว้ในกระเป๋าเอกสารดิจิทัล โดยไม่ต้องเดินทางไปสถาบันการศึกษา

### 8.2.2. ผังขั้นตอนภาพรวม — Flow การรับเอกสารรับรอง (OID4VCI)

แผนภาพนี้แสดงภาพรวมทั้งกระบวนการ แบ่งเป็น 5 ช่วงหลัก (1) เตรียมความพร้อม (2) การรับคำเชิญและการค้นหาข้อมูลผู้ออกบัตร (3) การตรวจสอบความน่าเชื่อถือก่อนยืนยันตัวตน (4) การขอ Token และ Credential และ (5) การตรวจสอบก่อนบันทึก จุดตรวจความน่าเชื่อถือของระบบ Trust Framework (TC-1 ถึง TC-4) ที่ปรากฏใน Flow นี้มี 2 จุด คือ **ช่วงที่ 3 ตรวจสอบ Issuer ก่อนยืนยันตัวตน = TC-3 (รอบแรก)** และ **ช่วงที่ 5 ตรวจสอบ VC และสถานะก่อนบันทึก = TC-3 (รอบที่สอง) + TC-4** (กลไกแต่ละจุดอธิบายใน §8.4)

```mermaid
flowchart LR
    classDef setup fill:#E8F5E9,stroke:#2E7D32,color:#1B5E20
    classDef std fill:#E3F2FD,stroke:#1565C0,color:#0D47A1
    classDef tc fill:#FFF3E0,stroke:#E65100,color:#BF360C

    P1(["① เตรียมความพร้อม<br/>ดาวน์โหลด Trusted List + WUA"]):::setup
    P2(["② รับคำเชิญ + ค้นหาข้อมูล<br/>Credential Offer + Discovery"]):::std
    P3(["③ ตรวจ Issuer ก่อนยืนยันตัวตน<br/>TC-3 (รอบแรก)"]):::tc
    P4(["④ Token + Credential<br/>ออก VC"]):::std
    P5(["⑤ ตรวจ VC + สถานะก่อนบันทึก<br/>TC-3 (รอบที่สอง) + TC-4"]):::tc

    P1 --> P2 --> P3 --> P4 --> P5
```

> **ตารางจับคู่ช่วง ↔ TC (OID4VCI):**

| ช่วง | ชื่อช่วง | จุดตรวจ TC ที่ทำงาน | ผู้ตรวจ | ผู้ถูกตรวจ | อธิบายกลไก |
|:----:|---------|:-----------------:|--------|----------|------------|
| ① | เตรียมความพร้อม | — | — | — | ดาวน์โหลด Trusted List ที่เกี่ยวข้องฉบับเต็มในรูปแบบ JWT จาก CDN แบบ lazy และตรวจลายมือชื่อ JWT — ยังไม่มีปฏิสัมพันธ์กับคู่กรณี จึงไม่มี TC |
| ② | รับคำเชิญ + ค้นหาข้อมูล | — | — | — | Credential Offer, Issuer Discovery, /.well-known/openid-credential-issuer เป็นมาตรฐาน OID4VCI ล้วน ยังไม่มีการตรวจสอบความน่าเชื่อถือของ Issuer ในระดับ Trust Framework |
| ③ | ตรวจ Issuer ก่อนยืนยันตัวตน | **TC-3 (รอบแรก)** | Wallet (ฝั่งผู้ถือ) | Issuer | Wallet ตรวจ Credential Issuer Metadata เทียบกับบริการ Issuer ใน `LoTE.TrustedEntitiesList[].TrustedEntityServices[]` ก่อนขอ OTP/ยืนยันตัวตน (รายละเอียด §8.4.3 และ [§12.1](12.1-trust-list-publication-profile.md)) |
| ④ | Token + Credential | **TC-2 เมื่อ Thai profile กำหนด** | Wallet → Authorization Server (ก่อนออก Access Token) | Wallet | Token Endpoint และ Credential Endpoint เป็น OID4VCI มาตรฐาน; หาก profile ใช้ Client Attestation ให้ตรวจที่ PAR หรือ Token Request ตาม Appendix E. Credential Request ใช้ `proofs.jwt`; ตรวจ Issuer/VC ในช่วง ⑤ |
| ⑤ | ตรวจ VC + สถานะก่อนบันทึก | **TC-3 (รอบที่สอง) + TC-4** | Wallet (ฝั่งผู้ถือ) | Issuer + Status List | (1) TC-3 รอบที่สอง: ตรวจ SD-JWT VC ฉบับสมบูรณ์ — claims, iss, jti, ลายมือชื่อด้วย PK_iss, validFrom/Until, disclosures (รายละเอียด §8.4.3) (2) TC-4: ดึงและตรวจ Status List JWT เพื่อยืนยันว่า VC ยังไม่ถูกยกเลิก/ระงับ (รายละเอียด §8.4.4) |

> **หมายเหตุ (TC-2):** ใน OID4VCI Flow นี้ **TC-2 (ตรวจ Wallet) ทำงานฝั่ง Issuer** ไม่ได้แสดงเป็น node แยกในภาพรวมนี้ เนื่องจากผู้ตรวจคือ Issuer ซึ่งเป็นฝั่งตรงข้ามกับผู้ถือที่ผู้อ่านมองตามภาพ flow กลไก TC-2 ใน OID4VCI อธิบายใน §8.4.2 และรายละเอียดเชิงลำดับขั้นอยู่ใน [ภาคผนวก 8.1](08.1-issuance-full-flow-detail.md)

> **หมายเหตุ:** แผนภาพนี้เป็นผังขั้นตอนภาพรวมฉบับย่อ (oversimplified overview) เพื่อให้ผู้อ่านเห็นลำดับกระบวนการโดยรวม หากต้องการทำความเข้าใจขั้นตอน คำขอ-คำตอบ และการตรวจสอบความน่าเชื่อถือในรายละเอียด ให้ศึกษาจาก **[ภาคผนวก 8.1 — OID4VCI Full Flow ทางเทคนิคโดยละเอียด](08.1-issuance-full-flow-detail.md)** ซึ่งแสดง TC-2 เมื่อ profile กำหนด, Client Attestation ในขั้น Token, `proofs.jwt` ใน Credential Request และ DPoP แบบมีเงื่อนไข

### 8.2.3. แผนภาพ Sequence ฉบับสมบูรณ์และนโยบาย DPoP

กระบวนการออกเอกสารรับรองดิจิทัลตามมาตรฐาน OID4VCI ฉบับสมบูรณ์ประกอบด้วยทุกขั้นตอน ตั้งแต่การเตรียมระบบ (SETUP) การออกคำเชิญ (STEP 1) การค้นหาข้อมูลผู้ออกเอกสาร (STEP 2) การตรวจสอบความน่าเชื่อถือ (STEP 2.5) การยืนยันตัวตน (STEP 3) การขอ Token และ Credential (STEP 4–5) การออกเอกสาร (STEP 6) และการแจ้งเตือน (STEP 7) รวมถึงการตรวจสอบความสดใหม่ของ Trusted List (Freshness Check) การใช้ DPoP เมื่อ Thai profile กำหนด และการออกเอกสารแบบทันที (Immediate Issuance) หรือแบบรอ (Deferred Issuance)

รายละเอียดของแผนภาพ Sequence ฉบับสมบูรณ์ พร้อมคำอธิบายระดับ field-by-field และนโยบาย DPoP แยกตามระดับ IAL/AAL อยู่ใน **[ภาคผนวกของบทที่ 8 — OID4VCI Full Flow ทางเทคนิคโดยละเอียด](08.1-issuance-full-flow-detail.md)**

---

## 8.3. การแสดงและตรวจสอบเอกสารรับรองดิจิทัล (OID4VP) — Flow การแสดงเอกสารรับรอง

{/* METADATA (agent-only — not rendered to readers)
> **แหล่งข้อมูล:** trust-guide/04-presentation-flow/ · [08.2-oid4vp-full-flow-detail.md](08.2-oid4vp-full-flow-detail.md) · [REF-OID4VP]
*/}

### 8.3.1. สถานการณ์

ผู้ใช้ต้องการแสดงเอกสารรับรองดิจิทัล เช่น ใบประมวลผลการศึกษา Transcript ให้หน่วยงานที่ขอตรวจสอบ (เช่น สถานศึกษาปลายทาง หรือนายจ้าง) โดยเปิดเผยเฉพาะข้อมูลที่จำเป็น (Selective Disclosure)

### 8.3.2. ผังขั้นตอนภาพรวม — Flow การแสดงเอกสารรับรอง (OID4VP)

แผนภาพนี้แสดงภาพรวมทั้งกระบวนการ แบ่งเป็น 6 ช่วงหลัก (1) เตรียมความพร้อม (2) Verifier ขอข้อมูล (3) Wallet ตรวจ Verifier (4) ยืนยันและสร้าง VP (5) ส่ง VP และตรวจ Wallet ตามเงื่อนไข TC-2 และ (6) Verifier ตรวจ VC และสถานะ สำหรับ OID4VP จุดตรวจ TC-1, TC-3 และ TC-4 ทำงานตามปกติ ส่วน TC-2 กำหนดให้ Wallet รัฐบาลส่ง WIA/WIA-PoP ครบคู่; Wallet เอกชนเลือกส่งครบคู่หรือไม่ส่งทั้งคู่ได้ โดย Verifier ต้องจำแนกประเภท Wallet จากข้อมูลที่เชื่อถือได้ หากตรวจประเภทไม่ได้ให้ปฏิเสธ VP (กลไกแต่ละจุดอธิบายใน §8.4)

```mermaid
flowchart LR
    classDef setup fill:#E8F5E9,stroke:#2E7D32,color:#1B5E20
    classDef std fill:#E3F2FD,stroke:#1565C0,color:#0D47A1
    classDef tc fill:#FFF3E0,stroke:#E65100,color:#BF360C

    P1(["① เตรียมความพร้อม<br/>ดาวน์โหลด Trusted List"]):::setup
    P2(["② Verifier ขอข้อมูล<br/>Auth Request + QR"]):::std
    P3(["③ Wallet ตรวจ Verifier<br/>TC-1"]):::tc
    P4(["④ ยืนยัน + สร้าง VP<br/>Selective Disclosure"]):::std
    P5(["⑤ ส่ง VP + ตรวจ Wallet ตามประเภท<br/>TC-2 ตามข้อกำหนดของประเภท Wallet"]):::tc
    P6(["⑥ Verifier ตรวจ VC + สถานะ<br/>TC-3 + TC-4"]):::tc

    P1 --> P2 --> P3 --> P4 --> P5 --> P6
```

> **ตารางจับคู่ช่วง ↔ TC (OID4VP):**

| ช่วง | ชื่อช่วง | จุดตรวจ TC ที่ทำงาน | ผู้ตรวจ | ผู้ถูกตรวจ | อธิบายกลไก |
|:----:|---------|:-----------------:|--------|----------|------------|
| ① | เตรียมความพร้อม | — | — | — | Wallet/Verifier ดาวน์โหลด Trusted List ที่เกี่ยวข้องฉบับเต็มในรูปแบบ JWT จาก CDN แบบ lazy และตรวจลายมือชื่อ JWT — ยังไม่มีปฏิสัมพันธ์ระหว่างคู่กรณี จึงไม่มี TC |
| ② | Verifier ขอข้อมูล | — | — | — | Verifier สร้าง Authorization Request, Request Object (JWS), แสดง QR/ deep link ตาม OID4VP มาตรฐาน — การยืนยันตัวตนของ Verifier จะเกิดในช่วง ③ |
| ③ | Wallet ตรวจ Verifier | **TC-1** | Wallet (ฝั่งผู้ถือ) | Verifier | ก่อนยินยอมให้ข้อมูล Wallet ตรวจบริการ Verifier ใน Trusted List ลายมือชื่อ Request Object และขอบเขต claims กับวัตถุประสงค์ตาม Thai profile (รายละเอียด §8.4.1 และ [§12.1](12.1-trust-list-publication-profile.md)) |
| ④ | ยืนยัน + สร้าง VP | — | — | — | แสดง Consent UI ให้ผู้ใช้กดยินยอม, จับคู่ Disclosure, สร้าง VP ตาม DCQL เป็น OID4VP มาตรฐาน — ยังไม่มีการตรวจสอบข้ามฝั่งในระดับ Trust Framework |
| ⑤ | ส่ง VP + ตรวจ Wallet | **TC-2 ตามประเภท Wallet** | Verifier | Wallet (WIA/WIA-PoP) | Wallet รัฐบาล MUST ส่งหลักฐานครบคู่; Wallet เอกชน MAY ส่งครบคู่หรือไม่ส่งทั้งคู่ Verifier ต้องจำแนกประเภทจากข้อมูลที่เชื่อถือได้ หากตรวจประเภทไม่ได้ ให้ปฏิเสธ VP; หลักฐานไม่ครบหรือไม่ผ่านการตรวจให้ปฏิเสธ (รายละเอียด §8.4.2) |
| ⑥ | Verifier ตรวจ VC + สถานะ | **TC-3 + TC-4** | Verifier | Issuer + Status List | (1) TC-3: ตรวจ SD-JWT VC ใน `vp_token` — iss/jti, ดึง PK_iss ผ่าน DID Resolution, ตรวจลายมือชื่อ, validFrom/Until, disclosures ตรงกับ DCQL (รายละเอียด §8.4.3) (2) TC-4: ดึงและตรวจ Status List JWT เพื่อยืนยันว่า VC ยังไม่ถูกยกเลิก/ระงับ (รายละเอียด §8.4.4) |

> **หมายเหตุ:** แผนภาพนี้เป็นผังขั้นตอนภาพรวมฉบับย่อ (oversimplified overview) เพื่อให้ผู้อ่านเห็นลำดับกระบวนการโดยรวม หากต้องการทำความเข้าใจขั้นตอน คำขอ-คำตอบ และการตรวจสอบความน่าเชื่อถือในรายละเอียด ให้ศึกษาจาก **[ภาคผนวก 8.2 — OID4VP Full Flow ทางเทคนิคโดยละเอียด](08.2-oid4vp-full-flow-detail.md)** ซึ่งประกอบด้วยแผนภาพ Sequence ฉบับสมบูรณ์ คำอธิบายระดับ field-by-field และสรุปจุดตรวจ L1–L7

### 8.3.3. แผนภาพ Sequence ฉบับสมบูรณ์ — OID4VP

กระบวนการแสดงและตรวจสอบเอกสารสำแดงดิจิทัลตามมาตรฐาน OID4VP ฉบับสมบูรณ์ประกอบด้วยทุกขั้นตอน ตั้งแต่การเตรียมระบบ (SETUP) การสร้างคำขอ (Step 1) การโอนข้ามอุปกรณ์ (Step 2) การดึง Request Object (Step 2.5) การตรวจสอบผู้ตรวจสอบเอกสาร การจับคู่ข้อมูลในเครื่องและการขอความยินยอม (Step 3) การสร้างเอกสารสำแดงและ Proof of Possession (Step 4) การส่งคำตอบ (Step 5) และการตรวจสอบฝั่งผู้ตรวจสอบเอกสาร (Step 6) ซึ่งรวมถึงการตรวจสอบผู้ให้บริการกระเป๋า การผูกผู้ถือเอกสาร (KB-JWT) การตรวจสอบผู้ออกเอกสาร และการตรวจสอบสถานะเอกสาร

รายละเอียดของแผนภาพ Sequence ฉบับสมบูรณ์ พร้อมคำอธิบายระดับ field-by-field และสรุปจุดตรวจ L1–L7 อยู่ใน **[ภาคผนวกของบทที่ 8 — OID4VP Full Flow ทางเทคนิคโดยละเอียด](08.2-oid4vp-full-flow-detail.md)**

---

## 8.4. กลไกการตรวจสอบความน่าเชื่อถือ 4 จุดตรวจ (TC-1 ถึง TC-4)

ทั้ง 2 กระบวนการ (OID4VCI และ OID4VP) ใช้ชุดจุดตรวจเดียวกัน ต่างกันที่ผู้ดำเนินการตรวจและผู้ถูกตรวจ บทนี้อธิบายกลไกด้วยข้อความเชิงบรรยายเพื่อให้ผู้อ่านเข้าใจการทำงานของแต่ละจุดตรวจ โดยไม่อาศัยแผนภาพลำดับการตัดสินใจ (decision flow) ฉบับย่อยซึ่งเคยก่อให้เกิดความสับสนในฉบับก่อนหน้า

### 8.4.1. TC-1 — กระเป๋าเอกสารดิจิทัลตรวจสอบผู้ตรวจสอบเอกสาร (Wallet ตรวจ Verifier)

จุดตรวจ TC-1 ปรากฏเฉพาะในกระบวนการ OID4VP และถือเป็นจุดควบคุมความปลอดภัยที่สำคัญที่สุดของฝั่งกระเป๋าเอกสารดิจิทัล เนื่องจากเป็นด่านสุดท้ายก่อนที่กระเป๋าจะส่งข้อมูลส่วนบุคคลของผู้ถือออกไปยังผู้ตรวจสอบเอกสาร

กลไกของ TC-1 ดำเนินการในช่วงระหว่างที่กระเป๋าเอกสารดิจิทัลดึง Request Object จากผู้ตรวจสอบเอกสาร และก่อนที่จะแสดง Consent UI ให้ผู้ใช้อนุมัติ มีลำดับขั้นตอนหลัก ดังนี้

1. **แยกกุญแจสาธารณะของผู้ตรวจสอบเอกสาร (Public Key — PK_v)** จาก Request Object ที่ลงนามแล้ว
2. **ตรวจสอบลายมือชื่อ Trusted List** ด้วย ETDA public key เพื่อยืนยันว่าข้อมูล Trusted List ที่จัดเก็บไว้ในเครื่องยังน่าเชื่อถือ
3. **ค้นหาบริการ Verifier ใน `LoTE.TrustedEntitiesList[].TrustedEntityServices[]`** โดยตรวจ `ServiceInformation.ServiceTypeIdentifier` และกุญแจใน `ServiceDigitalIdentity` ต้องยืนยันสถานะระดับองค์กรและบริการเป็น `active` ตาม Thai profile ได้ มิฉะนั้นให้หยุดดำเนินการทันที [research/42](../research/42-trusted-list-lote-jwt-format.md)
4. **ตรวจสอบลายมือชื่อ Request Object ด้วย PK_v** พร้อมตรวจสอบ `aud`, `exp`/`iat` และค่า `nonce`
5. **ตรวจสอบขอบเขตข้อมูลที่ขอ** — `dcql_query.claims[].path` ต้องอยู่ภายในขอบเขต claims ที่ Thai profile ของบริการ Verifier ประกาศไว้
6. **ตรวจสอบวัตถุประสงค์** — `purpose` ต้องอยู่ในขอบเขตวัตถุประสงค์ที่ Thai profile ของบริการ Verifier ประกาศไว้; หากไม่มีข้อมูลให้ปฏิเสธ [research/42](../research/42-trusted-list-lote-jwt-format.md)

เมื่อผ่านทุกขั้นตอน กระเป๋าเอกสารดิจิทัลจึงจะแสดง Consent UI ให้ผู้ใช้อนุมัติการส่งข้อมูล หากขั้นตอนใดไม่ผ่าน กระเป๋าเอกสารดิจิทัล MUST หยุดดำเนินการทันทีและไม่ส่งข้อมูลใด ๆ ออกไป

### 8.4.2. TC-2 — การตรวจสอบความน่าเชื่อถือของกระเป๋าเอกสารดิจิทัล (Issuer/Verifier ตรวจ Wallet)

จุดตรวจ TC-2 ปรากฏทั้งใน OID4VCI และ OID4VP เพื่อให้ผู้ออกเอกสารหรือผู้ตรวจสอบเอกสารยืนยันความน่าเชื่อถือของ Wallet ตาม Thai profile. ใน OID4VCI เมื่อใช้ Wallet Attestation ตาม Appendix E ให้ส่ง Client Attestation ใน Pushed Authorization Request หรือ Token Request เพื่อยืนยัน Client ต่อ Authorization Server ก่อนออก Access Token; รายละเอียด OID4VCI อยู่ใน [§8.2](08-implementation-guidelines.md) และ [ภาคผนวก 8.1](08.1-issuance-full-flow-detail.md). `proofs.jwt` ใน Credential Request แยกต่างหากและใช้พิสูจน์การครอบครองกุญแจที่จะผูกกับ Credential.

หาก Thai profile กำหนด TC-2 ใน OID4VCI ผู้ออก/Authorization Server ต้องตรวจ Attestation และ PoP ตามกลไกที่ profile ประกาศก่อนออก Access Token, ตรวจ trust source/ลายมือชื่อและสถานะ Wallet ตามข้อมูลที่ profile กำหนด, และปฏิเสธเมื่อหลักฐานไม่ครบหรือไม่ผ่าน. OID4VCI Appendix E ไม่ได้กำหนด Trusted List schema หรือ Wallet Provider Registry ของไทย; แหล่งข้อมูล ฟิลด์ค้นหา freshness และการจัดการข้อผิดพลาดจึงเป็นเรื่องที่ Thai profile ต้องกำหนด.

กติกาแยกประเภท Wallet ด้านล่างใช้กับ TC-2 ของ OID4VP เท่านั้น.

ใน OID4VP ผู้ตรวจสอบเอกสารดำเนินการตรวจหลังได้รับ Authorization Response ดังนี้:

1. ตรวจประเภท Wallet จากข้อมูล Wallet Provider ที่เชื่อถือได้และ Thai profile ซึ่งต้องกำหนดแหล่งข้อมูลและวิธีตรวจประเภทก่อนใช้งานจริง หากไม่มีข้อมูล ข้อมูลไม่สดใหม่ หรือตรวจประเภทไม่ได้ ให้ปฏิเสธ VP
2. **Wallet รัฐบาล:** ต้องมี WIA และ WIA-PoP ครบทั้งคู่ หากขาดรายการใด ให้ปฏิเสธ VP
3. **Wallet เอกชน:** MAY เลือกส่ง WIA และ WIA-PoP ครบทั้งคู่เพื่อทำ TC-2 หรือไม่ส่งทั้งคู่เพื่อข้าม TC-2 และตรวจ TC-3/TC-4 ต่อ; หากส่งมาเพียงรายการเดียว ให้ปฏิเสธ VP
4. เมื่อมี WIA และ WIA-PoP ครบ ให้ทำ TC-2:
   - แยก WIA เพื่ออ่าน `iss` (Wallet Provider ID) และ `PK_wp`
   - ค้นหา PK_wp ในบริการ Wallet Provider ใน `LoTE.TrustedEntitiesList[].TrustedEntityServices[]`; หากไม่พบ ให้ตอบกลับด้วย `400 untrusted_wallet_provider` [research/42](../research/42-trusted-list-lote-jwt-format.md)
   - ตรวจลายมือชื่อ WIA ด้วย PK_wp และตรวจช่วงเวลา `iat`/`exp`
   - ตรวจลายมือชื่อ WIA-PoP ด้วย `WIA.cnf.jwk` พร้อมตรวจ `iss`, `aud` และ `nonce`
   - ทำเครื่องหมาย `jti` ว่าถูกใช้แล้วเพื่อป้องกัน replay

หาก WIA หรือ WIA-PoP ที่ส่งมาตรวจไม่ผ่าน Verifier MUST ปฏิเสธ VP

### 8.4.3. TC-3 — การตรวจสอบความน่าเชื่อถือของผู้ออกเอกสาร (Wallet/Verifier ตรวจ Issuer)

จุดตรวจ TC-3 ปรากฏทั้งใน OID4VCI และ OID4VP โดยมีจุดประสงค์เพื่อยืนยันว่าเอกสารรับรองที่ได้รับมีผู้ออกเอกสารที่น่าเชื่อถือและลายมือชื่อถูกต้อง

ใน OID4VCI มีการตรวจสอบ 2 รอบ ดังนี้

- **รอบแรก (ตรวจก่อนยืนยันตัวตน)** — กระเป๋าเอกสารดิจิทัลตรวจสอบข้อมูล Credential Issuer Metadata ที่ได้รับจากผู้ออกเอกสารควบคู่กับ Trusted List ก่อนที่จะขอ OTP จากผู้ใช้ เพื่อป้องกันการส่งข้อมูลยืนยันตัวตนไปยังผู้ออกเอกสารที่ไม่ผ่านการรับรอง
- **รอบที่สอง (ตรวจก่อนบันทึก)** — กระเป๋าเอกสารดิจิทัลตรวจสอบ SD-JWT VC ฉบับสมบูรณ์ที่ได้รับจากผู้ออกเอกสาร

ใน OID4VP ผู้ตรวจสอบเอกสารตรวจสอบ SD-JWT VC ที่อยู่ใน `vp_token` สำหรับแต่ละ credential ที่ผู้ถือส่งมา

กลไกของ TC-3 ในการตรวจแต่ละครั้งมีลำดับขั้นตอนหลัก ดังนี้

1. **แยก claims** จาก JWT payload ได้แก่ `iss`, `jti`, `sub`, `@context`, `type`
2. **ค้นหาบริการ Issuer ใน `LoTE.TrustedEntitiesList[].TrustedEntityServices[]`** ต้องยืนยันสถานะระดับองค์กรและบริการเป็น `active` ตาม Thai profile ได้ [research/42](../research/42-trusted-list-lote-jwt-format.md)
3. **ตรวจสอบความสอดคล้องของข้อมูล** — ตรวจ `iss` และ `jti` ตามรูปแบบ VC ที่ได้รับ และตรวจประเภท VC กับขอบเขตสิทธิ์ของ Issuer ใน Thai profile; `@context` และ `type` ใช้ตรวจเฉพาะ VC รูปแบบ W3C VCDM ตามข้อกำหนดของรูปแบบนั้น
4. **ดึงกุญแจสาธารณะของผู้ออกเอกสาร (PK_iss)** โดย dereference `kid` ผ่าน DID Resolver
5. **ตรวจสอบลายมือชื่อ SD-JWT VC** ด้วย PK_iss
6. **ตรวจสอบช่วงเวลาใช้งาน** — `validFrom ≤ now ≤ validUntil`
7. **ตรวจสอบ disclosures** ในกรณี OID4VP — ต้อง hash ตรงกับ `_sd` ใน issuer_jwt และ DCQL query ต้อง match กับ `reconstructed_credential`

หากขั้นตอนใดไม่ผ่าน ฝั่งที่ดำเนินการตรวจ MUST ปฏิเสธคำขอหรือทิ้ง VC ทันที

### 8.4.4. TC-4 — การตรวจสอบสถานะเอกสาร (Wallet/Verifier ตรวจ Status List)

จุดตรวจ TC-4 ปรากฏทั้งใน OID4VCI และ OID4VP โดยมีจุดประสงค์เพื่อยืนยันว่าเอกสารรับรองที่ลงนามโดยผู้ออกเอกสารที่น่าเชื่อถือยังคงสถานะใช้งานได้ ไม่ถูกยกเลิกหรือระงับ

หลักการสำคัญ: ลายมือชื่อที่ถูกต้องตาม TC-3 ไม่ได้หมายความว่าเอกสารรับรองยังใช้ได้ ผู้ออกเอกสารอาจยกเลิกเอกสารรับรองได้ทุกเมื่อ ฝั่งที่ดำเนินการตรวจ MUST ตรวจสอบ Status List ทุกครั้ง แม้ว่า TC-3 จะผ่านแล้ว [REF-TSL]

กลไกของ TC-4 มีลำดับขั้นตอนหลัก ดังนี้

1. **อ่าน `uri` และ `idx`** จาก `status.status_list` ใน JWT payload
2. **ดึง Status List JWT** จาก `uri` โดยระบุ `Accept: application/statuslist+jwt`
3. **ตรวจสอบ Status List JWT** — ต้องมี `typ = "statuslist+jwt"`, `sub` ตรงกับ URI, ช่วงเวลา `iat`/`exp` ยังไม่หมดอายุ และลงนามโดย PK_iss ที่ตรวจได้ใน TC-3
4. **ถอดรหัส `lst`** — base64url decode แล้วคลาย DEFLATE ตามรูปแบบ ZLIB
5. **อ่านค่า status ที่ตำแหน่ง `idx`** โดยใช้ความกว้าง `bits` ที่ระบุใน Status List JWT — `0x00` หมายถึงใช้งานได้ (VALID), `0x01` หมายถึงถูกยกเลิก (INVALID), `0x02` หมายถึงถูกระงับ (SUSPENDED); ปฏิเสธค่าที่ไม่รู้จักหรือไม่รองรับ (fail-closed)

หากดึงหรือตรวจสอบ Status List JWT ไม่สำเร็จ ฝั่งที่ดำเนินการตรวจ MUST ปฏิเสธคำขอ (fail-closed) เนื่องจากไม่สามารถยืนยันสถานะของเอกสารรับรองได้

### 8.4.5. สรุปจุดตรวจ 4 ด่าน และการเทียบเคียงกับ PKI

ตารางต่อไปนี้สรุปหน้าที่ของจุดตรวจทั้ง 4 ด่าน และเทียบเคียงกับกลไกในโครงสร้างพื้นฐานกุญแจสาธารณะ (Public Key Infrastructure — PKI) เพื่อให้ผู้อ่านที่คุ้นเคยกับ PKI เข้าใจความสอดคล้อง

| รหัส | ตรวจอะไร | ใครตรวจ | ปรากฏใน | บังคับ? | เทียบเคียง PKI |
|------|---------|--------|---------|--------|---------------|
| **TC-1** | ตรวจว่าผู้ขอข้อมูลน่าเชื่อถือ | Wallet | OID4VP เท่านั้น | ใช่ — Wallet MUST ตรวจ Verifier ก่อนส่งข้อมูลใด ๆ | ตรวจ Relying Party identity |
| **TC-2** | ตรวจว่า Wallet น่าเชื่อถือ | Issuer (OID4VCI) / Verifier (OID4VP) | ทั้ง 2 Flow | OID4VCI ตาม §8.2; สำหรับ OID4VP ต้องจำแนกประเภท Wallet จากข้อมูลที่เชื่อถือได้ (หากทำไม่ได้ให้ปฏิเสธ VP); Wallet รัฐบาลต้องส่งและผ่านการตรวจ WIA/WIA-PoP ครบคู่ ส่วน Wallet เอกชนเลือกส่งครบคู่หรือไม่ส่งทั้งคู่ หากส่งไม่ครบหรือหลักฐานตรวจไม่ผ่านต้องปฏิเสธ | ตรวจ Application identity |
| **TC-3** | ตรวจว่า Issuer น่าเชื่อถือ + ลายมือชื่อถูกต้อง | Wallet (OID4VCI) / Verifier (OID4VP) | ทั้ง 2 Flow | ใช่ — ใน OID4VCI ตรวจ 2 รอบ (early + full) | ตรวจ Issuer identity + signature |
| **TC-4** | ตรวจว่าสถานะ VC ใช้งานได้ | Wallet (OID4VCI) / Verifier (OID4VP) | ทั้ง 2 Flow | ใช่ — MUST ตรวจ Status List ทุกครั้ง | ตรวจสถานะ JWT แบบ Status List |

> **ข้อสังเกต:** TC-4 ใช้ IETF Token Status List [REF-TSL] ซึ่งเก็บค่า status แบบบรรจุหลายรายการใน byte array ตามความกว้าง `bits` แล้วบีบอัดเป็น JWT; ผู้ออก Status List ลงลายมือชื่อ Status List JWT และผู้ตรวจสอบต้องตรวจลายมือชื่อนั้นด้วยกุญแจที่เชื่อถือได้ของผู้ออก Status List ตาม profile

---

## 8.5. การ resolve DID (DID Resolution) — 3 กรณี

เมื่อกระเป๋าเอกสารดิจิทัล (ใน OID4VCI) หรือผู้ตรวจสอบเอกสาร (ใน OID4VP) ต้องตรวจสอบลายมือชื่อของ VC ต้องดึงกุญแจสาธารณะของผู้ออกเอกสารจาก DID ก่อน มี 3 กรณีตาม DID method [REF-DID-CORE][REF-UR] ดังนี้

**กรณีที่ 1 — `did:web:issuer.example.th`:** ฝ่ายที่ตรวจสอบดึง DID Document โดยตรงจาก HTTPS GET ไปยัง `https://issuer.example.th/.well-known/did.json` กรณีนี้ต้องอาศัยเครือข่าย และผู้ดูแลคือ Issuer เอง

**กรณีที่ 2 — `did:key:z6Mki...`:** กุญแจสาธารณะถูกฝังอยู่ในสายอักขระของ DID โดยตรง (self-contained) ฝ่ายที่ตรวจสอบสามารถแยกกุญแจสาธารณะออกมาได้ทันทีโดยไม่ต้องอาศัยเครือข่าย ไม่มีผู้ดูแลส่วนกลาง

**กรณีที่ 3 — `did:ndid:...` หรือ custom DID method:** ฝ่ายที่ตรวจสอบส่งคำขอไปยัง ETDA Trust Gateway ซึ่งทำหน้าที่เป็น Universal Resolver กรณีนี้ต้องอาศัยเครือข่ายและใช้ API key ผู้ดูแลคือ สพธอ. (ETDA)

| DID method | วิธี resolve DID | ต้องเครือข่าย? | ผู้ดูแล |
|-----------|-------------|:------------:|---------|
| `did:web:issuer.example.th` | HTTPS GET `.well-known/did.json` | ใช่ | Issuer เอง |
| `did:key:z6Mki...` | แยกจากสายอักขระ DID (self-contained) | ไม่ | ไม่มี |
| `did:ndid:...` / custom | ETDA Trust Gateway Universal Resolver (API key) | ใช่ | สพธอ. (ETDA) |

> **สำคัญ:** ทั้ง 3 กรณีต้องดำเนินการภายหลังจากผ่าน TC-3 แล้ว กล่าวคือ การ resolve DID เกิดขึ้นหลังยืนยันความน่าเชื่อถือของผู้ออกเอกสารจาก Trusted List แล้ว เพื่อให้ทราบว่าต้องดึงกุญแจสาธารณะจากแหล่งใด
>
> **หมายเหตุ `did:ndid`:** ปัจจุบันยังไม่จดทะเบียนใน W3C DID method registry สพธอ. ต้องพัฒนา DID method spec + Universal Resolver driver เอง

---

## 8.6. กฎเสริมสำหรับการพัฒนา

นอกเหนือจากข้อกำหนดหลักใน 8.1.2 แล้ว การพัฒนาระบบ SHOULD ปฏิบัติตามกฎเสริมเหล่านี้เพื่อให้ระบบมีความปลอดภัยและทำงานร่วมกันได้:

| หัวข้อ | กฎเสริม (RFC 2119) | ที่มา |
|--------|--------------------|------|
| Access Token TTL | SHOULD ตั้งอายุสั้น (เช่น 5 นาที) และผูกกับอุปกรณ์ (DPoP หรือ cnf) — แนวปฏิบัติที่เอกสารนี้เสนอเพิ่มเติมจากข้อกำหนด OID4VCI | [REF-OID4VCI] |
| Trusted List TTL | SHOULD ตั้งอายุไม่เกิน 24 ชั่วโมง และ SHOULD มีระบบ push notification เมื่อมีการเปลี่ยนแปลง | แนวปฏิบัติ [REF-ARF] |
| WUA | MUST ใช้ WUA ตาม EUDI ARF 2.9.0 ใน OID4VCI ตาม §8.2; สำหรับ OID4VP Verifier MUST จำแนกประเภท Wallet จากข้อมูลที่เชื่อถือได้และปฏิเสธ VP หากทำไม่ได้; Wallet รัฐบาล MUST ส่ง WIA/WIA-PoP ครบคู่ ส่วน Wallet เอกชน MAY ส่งครบคู่หรือไม่ส่งทั้งคู่ (Thai-profile extension) | [REF-ARF] |
| DPoP | SHOULD ใช้ DPoP (RFC 9449) สำหรับ Access Token binding | [REF-DPOP] |
| PKCE | MUST ใช้ PKCE (RFC 7636) ใน Authorization Code flow | [REF-PKCE] |
| Consent UI | MUST แสดงข้อมูล Verifier, ข้อมูลที่ขอ, วัตถุประสงค์ และให้ผู้ใช้เลือกเปิดเผยเฉพาะที่จำเป็น | [REF-ARF] [REF-PDPA] |
| Audit log | MUST บันทึกเหตุการณ์การออก VC การแสดง VP และการตรวจสอบ โดยเก็บไว้ไม่น้อยกว่า 7 ปีตาม พ.ร.บ. ธุรกรรมทางอิเล็กทรอนิกส์ | [REF-ETA] |
| การป้องกันการโจมตีแบบ replay | MUST ใช้ nonce, `jti` หรือกลไกป้องกัน replay อื่นตามที่ protocol และ Thai profile กำหนด; ตรวจ freshness และใช้ซ้ำในแต่ละ proof/token ตามข้อกำหนดที่เกี่ยวข้อง | [REF-OID4VCI] [REF-OID4VP] [REF-DPOP] |
| การบันทึกข้อมูลส่วนบุคคล | MUST ปฏิบัติตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA) 2562 และ SHOULD ใช้ Selective Disclosure เพื่อลดการเปิดเผยข้อมูล | [REF-PDPA] |

---

## 8.7. ข้อกำหนดของกรณีศึกษา (จากฉบับเวอร์ชัน 1.1)

รายงานฉบับนี้ศึกษาการออกและแสดงเอกสารรับรองดิจิทัล โดยใช้กรณีศึกษาการออกใบประมวลผลการศึกษา (Transcript) ของสถาบันการศึกษาในประเทศไทย ตามแผนภาพที่แสดงใน [§7](07-cross-ecosystem-interoperability.md) และ [§9](09-trust-model-3.md) โดยมีข้อกำหนดซึ่งคงไว้จากฉบับเวอร์ชัน 1.1 ดังนี้

1. การศึกษามุ่งเน้นไปที่ขั้นตอนการออกเอกสารรับรองดิจิทัล (VC) และการแสดงเอกสารสำแดงดิจิทัล (VP)
2. กระบวนการดึงข้อมูล (Resolve) DID Document ตามมาตรฐานของ W3C จะใช้ DIF Universal Resolver ซึ่งในรายงานฉบับนี้ใช้ DIF Universal Resolver จำลองของ สพธอ. (ETDA) ที่พัฒนาขึ้นเพื่อรองรับความพร้อมของการใช้งานของผู้ให้บริการในคณะทำงานส่งเสริมการพัฒนา Document Wallet และ Verifiable Credentials เพื่อไปดึงข้อมูล DID Document จาก Registry
3. ขั้นตอนการลงทะเบียน (Register) จะดำเนินการโดยใช้โปรโตคอล OID4VP ในรายงานฉบับนี้คณะทำงานส่งเสริมการพัฒนา Document Wallet และ Verifiable Credentials ได้สร้าง DID Document แล้วบันทึกลง Registry เอง

---

## 8.8. สรุป — ข้อกำหนด MUST / SHOULD / MAY

| หัวข้อ | MUST | SHOULD | MAY |
|--------|:----:|:------:|:---:|
| ใช้มาตรฐาน OID4VCI 1.0 + OID4VP 1.0 | ✅ | | |
| รองรับ W3C VCDM v1.1 สำหรับเอกสารเดิม | ✅ | | |
| รองรับ credential format `dc+sd-jwt` สำหรับเอกสารใหม่ | ✅ | | |
| รองรับ EdDSA (Ed25519) และ ES256 (ECDSA P-256/SHA-256) | ✅ | | |
| ใช้ IETF Token Status List | ✅ | | |
| ใช้ PKCE ใน Authorization Code flow | ✅ | | |
| ตรวจสอบ Issuer/Verifier ใน Trusted List | ✅ | | |
| จำแนกประเภท Wallet รัฐบาล/เอกชนจากข้อมูล Wallet Provider ที่เชื่อถือได้และตรวจสอบความสดใหม่ได้ใน OID4VP; หากจำแนกไม่ได้ให้ปฏิเสธ VP | ✅ | | |
| ตรวจ Status List ก่อนใช้ VC (TC-4) | ✅ | | |
| ใช้ WUA ใน OID4VCI ตาม §8.2 | ✅ | | |
| Wallet รัฐบาลส่ง WIA และ WIA-PoP ครบคู่ใน OID4VP | ✅ | | |
| Wallet เอกชนเลือกส่ง WIA/WIA-PoP ครบคู่หรือไม่ส่งทั้งคู่ใน OID4VP | | | ✅ |
| ปฏิเสธ WIA/WIA-PoP ที่ส่งไม่ครบหรือไม่ผ่านการตรวจ | ✅ | | |
| ใช้ DPoP สำหรับ Access Token binding | | ✅ | |
| ใช้ W3C DID Universal Resolver | ✅ | | |
| รองรับ `did:web` โดยตรง | | ✅ | |
| รองรับ `did:key` โดยตรง | | ✅ | |
| แสดง Consent UI ครบถ้วน | ✅ | | |
| เก็บ audit log ≥ 7 ปี | ✅ | | |
| ปฏิบัติตาม PDPA | ✅ | | |
| ใช้ Selective Disclosure | | ✅ | |

---

{/* METADATA (agent-only — not rendered to readers)
## อ้างอิง

- [REF-OID4VCI] OpenID Foundation, "OpenID for Verifiable Credential Issuance 1.0" — https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0.html
- [REF-OID4VP] OpenID Foundation, "OpenID for Verifiable Presentations 1.0" — https://openid.net/specs/openid-4-verifiable-presentations-1_0.html
- [REF-SDJWT] IETF, “SD-JWT-based Verifiable Digital Credentials (SD-JWT VC),” draft-ietf-oauth-sd-jwt-vc-19, 31 August 2026 (Internet-Draft; status as of 1 October 2026: Waiting for AD Go-Ahead) — https://datatracker.ietf.org/doc/draft-ietf-oauth-sd-jwt-vc/
- [REF-W3C-VCDM] W3C, "Verifiable Credentials Data Model v1.1" — https://www.w3.org/TR/vc-data-model/
- [REF-TSL] IETF, “Token Status List (TSL),” draft-ietf-oauth-status-list-21, 21 June 2026 (Internet-Draft; status as of 1 October 2026: RFC Editor — Awaiting First editor) — https://datatracker.ietf.org/doc/draft-ietf-oauth-status-list/
- [REF-DID-CORE] W3C, "Decentralized Identifiers (DIDs) v1.0", 19 July 2022
- [REF-ARF] European Commission, "EUDI Architecture and Reference Framework v2.9.0" — https://eudi.dev/2.9.0/main/
- [REF-EdDSA] IETF RFC 8032, "Edwards-Curve Digital Signature Algorithm (EdDSA)"
- [REF-ES256] IETF RFC 7518, "JSON Web Algorithms (JWA)", §3.4 — https://www.rfc-editor.org/rfc/rfc7518.html#section-3.4
- [REF-UR] DIF, "Universal Resolver" — https://github.com/decentralized-identity/universal-resolver
- [REF-CIR-WUA] (EU) CIR 2024/2979, "Wallet Unit Attestation"
- [REF-DPOP] IETF RFC 9449, "OAuth 2.0 Demonstrating Proof-of-Possession (DPoP)"
- [REF-PKCE] IETF RFC 7636, "Proof Key for Code Exchange (PKCE)"
- [REF-PDPA] พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562
- [REF-ETA] พ.ร.บ. ว่าด้วยธุรกรรมทางอิเล็กทรอนิกส์ พ.ศ. 2544 และฉบับแก้ไข
- [REF-MASA-126] MASA-126 — S5 Implementation Guidelines (issue tracker)
- [REF-MASA-158] MASA-158 — Merge Full Flow from trust-guide into ARF, STEP 1.5 → 2.5 (2026-08-07)
- [REF-MASA-165] MASA-165 — Polish th/thai-vc-arf/08-implementation-guidelines.md: ตัด Trust Check flowchart ฉบับย่อย อธิบายกลไกด้วยข้อความเชิงบรรยาย และเพิ่มป้ายกำกับ TC-1 ถึง TC-4 บนผังขั้นตอนภาพรวม OID4VCI/OID4VP (2026-08-07)
- [REF-TRUSTLIST-CDN] คณะทำงาน VC, "แนวทางกระจาย Trustlist (LoTE) ผ่าน File/Edge CDN — ไม่ใช้ RabbitMQ", เวอร์ชัน 1.10, 4 กันยายน 2569 — [research/41](../research/41-trustlist-serving-filecdn-etag-binary.md)
- [REF-ARF-V11-SRC] Thai VC ARF v1.1 (มกราคม 2568), สพธอ. — [Thai-VC-ARF-v1-1.pdf](https://www.etda.or.th/getattachment/Our-Service/Digital-Trusted-services-Infrastructure/VC-and-Digital-Document-Wallet/Information/รายงานทางเทคนค-Thai-VC-ARF-v1-1.pdf)
- [REF-DRAFT-TFM] ฉบับร่าง Trust Flow ฉบับอธิบาย — [draft/trust-flow-minimal-explained.md](../draft/trust-flow-minimal-explained.md)
- [REF-DRAFT-TFT] ฉบับร่าง Trust Framework Template — [draft/trust-framework-template.md](../draft/trust-framework-template.md)

<!-- METADATA (agent-only — not rendered to readers)
> **หมายเหตุการอ้างอิง:** เอกสารนี้ใช้รูปแบบ `[REF-XXX]` เพื่อให้ตรวจสอบการอ้างอิงสองทาง (two-way) ได้ ทุก `[REF-XXX]` ในเนื้อความมีอยู่ในรายการนี้ และทุกรายการในนี้ถูกอ้างถึงในเนื้อความ (ตามมาตรฐาน AGENTS.md §Output & Writing)
-->

<!-- pdf page 52 -->

---
*/}

**การนำทาง:** [บทที่ 7 — การทำงานร่วมกันข้ามระบบนิเวศและผลของ Trusted List](07-cross-ecosystem-interoperability.md) · [สารบัญ ARF](README.md) · [บทที่ 8.1 — OID4VCI Full Flow ทางเทคนิคโดยละเอียด](08.1-issuance-full-flow-detail.md)
