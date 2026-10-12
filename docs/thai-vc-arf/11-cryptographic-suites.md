---
description: "11. Cryptographic Suites — Thai VC ARF 2.0 DRAFT 0"
---

# 11. Cryptographic Suites

{/* METADATA (agent-only — not rendered to readers)
> **สถานะ:** 📐 Specification — Draft สำหรับการทบทวนเชิงกำกับดูแล (S8, MASA-129 → MASA-150)
> **เวอร์ชันเอกสาร:** 1.0.1 (2026-08-06) — ลบกุญแจ Level 2 (Pairwise Key ต่อ Verifier) และแถว Pairwise pseudonym hash ออกจากตาราง algorithm profile ตามมติให้ยกเลิกการใช้ pairwise DID (MASA-157)
> **แหล่งข้อมูล:** เอกสารสถาปัตยกรรมภายใต้ `th/architecture/` เท่านั้น — ดู §11.5 References
> **ขอบเขต:** เอกสารกำกับดูแลและข้อกำหนดสำหรับการตรวจประเมิน ห้ามตีความเป็นผลทดสอบ production
> **เอกสารที่เกี่ยวข้อง:** [12-key-management-and-trustlist-deployment.md](12-key-management-and-trustlist-deployment.md), [13-vc-status-and-revocation.md](13-vc-status-and-revocation.md), [14-security-threat-model-and-conformance.md](14-security-threat-model-and-conformance.md), [ดัชนีเอกสาร ARF](README.md)
*/}

---

บทที่ 11 กำหนดข้อกำหนดด้าน cryptographic suites สำหรับกระเป๋าเอกสารดิจิทัล (Wallet) ผู้ออกเอกสาร (Issuer) และสำนักงานพัฒนาธุรกรรมทางอิเล็กทรอนิกส์ (สพธอ.) เดิมเนื้อหานี้เป็นส่วนหนึ่งของบทความมั่นคงปลอดภัยที่รวมสามเรื่องไว้ด้วยกัน คือ Cryptographic Suites, Key Management และ VC Status/Revocation รายงานฉบับนี้แยกเรื่อง Cryptographic Suites ออกมาเป็นบทเฉพาะ เพื่อให้อ้างอิงได้ชัดเจน ทั้งนี้ เรื่อง Key Management อยู่ในบทที่ 12 และเรื่อง VC Status/Revocation อยู่ในบทที่ 13

---

## 11.1 ขอบเขตและการจำแนกข้อความ

บทนี้กำหนดข้อกำหนดด้าน Cryptographic Suites ที่ ARF v1.1 ยังไม่ครอบคลุม ครอบคลุม algorithm profile ของกุญแจฝ่าย Wallet suite ที่ปรากฏในเอกสารสถาปัตยกรรม และการเปลี่ยน algorithm พร้อมแผนระยะยาว ส่วนเรื่อง Key Management/Rotation อยู่ในบทที่ 12 และเรื่อง VC Revocation ด้วย IETF Token Status List อยู่ในบทที่ 13

**กฎการอ้างอิงของหัวข้อนี้:** ข้อกำหนดทุกข้อ **MUST** สืบย้อนไปยังไฟล์ภายใต้ `th/architecture/` มาตรฐานภายนอกอ้างผ่านไฟล์สถาปัตยกรรมที่ระบุมาตรฐานนั้นไว้แล้ว หัวข้อนี้ **MUST NOT** สร้างข้อกำหนดใหม่ที่ไม่มีฐานในเอกสารสถาปัตยกรรม

การจำแนกข้อความ:

| ป้าย | ความหมาย |
|------|----------|
| **[ข้อเท็จจริง]** | ข้อความที่ปรากฏในเอกสารสถาปัตยกรรมโดยตรง พร้อมเลขอ้างอิง |
| **[ข้อวิเคราะห์]** | การประมวลข้อเท็จจริงหลายแหล่งเข้าเป็นข้อกำหนดเชิงกำกับดูแล |
| **[ช่องว่าง]** | ประเด็นที่เอกสารสถาปัตยกรรมยังขัดกันเองหรือยังไม่กำหนด ต้องมีมติก่อนบังคับใช้ |

คำ **MUST / MUST NOT / SHOULD / MAY** ใช้ตามความหมายเชิงข้อกำหนด: ต้อง / ห้าม / ควร / อาจ

---

## 11.2 Algorithm Profile ของกุญแจฝ่าย Wallet

**[ข้อเท็จจริง]** เอกสาร Key Derivation กำหนด algorithm profile ตามระดับกุญแจไว้ดังนี้ [A-KD01 §9]

| ระดับกุญแจ | การใช้งาน | Recommended | รองรับเพิ่มเติม |
|-----------|-----------|:-----------:|:--------------:|
| Level 1 | Wallet Identity Key signing | `EdDSA` (Ed25519) | `ES256` |
| Level 3 | Per-credential `cnf` signing (KB-JWT) | `EdDSA` (Ed25519) | `ES256` (ค่าปริยายของ OID4VP) |
| — | BIP32 derivation | `HMAC-SHA512` | — |

> **หมายเหตุ:** ตารางข้ามจาก Level 1 ไป Level 3 ตามมติให้ยกเลิก Level 2 ซึ่งเดิมกำหนด Pairwise Key ต่อ Verifier (MASA-157) รายงานฉบับนี้คงหมายเลข Level 1 และ Level 3 ไว้ตามเอกสารสถาปัตยกรรมต้นทาง
>
> **หมายเหตุเรื่อง Ed25519:** `EdDSA` (Ed25519) เป็น algorithm ที่แนะนำ (recommended) สำหรับทุกระดับกุญแจ อย่างไรก็ตาม KB-JWT ใน Level 3 มีค่าปริยายเป็น `ES256` ตามมาตรฐาน OID4VP Wallet จึงรองรับทั้งสองและเลือกตามความสามารถของฮาร์ดแวร์ — ดู §11.4 สำหรับแผน transition

**[ข้อเท็จจริง]** KB-JWT ใช้ `ES256` เพราะเป็นค่าปริยายของ OID4VP ส่วนกุญแจระดับอื่นเลือก `EdDSA` ตามข้อกำหนด VCTF-06 [A-KD01 §9]

**[ข้อวิเคราะห์ — การรองรับทั้ง Ed25519 และ ES256]** ระบบยังคงรองรับ `EdDSA` (Ed25519) และถือว่าเป็น algorithm หลัก อย่างไรก็ตาม อุปกรณ์ Apple (iOS) ไม่รองรับ Ed25519 ใน Secure Enclave ทำให้ไม่สามารถเก็บกุญแจ Ed25519 ใน hardware-backed keystore ของ Apple ได้ เมื่อใดก็ตามที่เป็นไปได้ ระบบจะใช้ `ES256` (ECDSA P-256) แทนบนอุปกรณ์ที่ไม่รองรับ Ed25519 ในฮาร์ดแวร์ โดย ES256 ได้รับการรองรับจาก Secure Enclave ของ Apple และ StrongBox ของ Android ทั้งคู่ สรุปคือ Wallet รองรับทั้ง `EdDSA` และ `ES256` และจะเลือกใช้ตามความสามารถของฮาร์ดแวร์ — ถ้าฮาร์ดแวร์รองรับ Ed25519 ก็ใช้ EdDSA ถ้าไม่ ก็ใช้ ES256

**[ข้อวิเคราะห์]** Wallet **MUST** รองรับทั้ง `EdDSA` และ `ES256` สำหรับทุกระดับกุญแจ Issuer และ Verifier **MUST** ยอมรับทั้งสอง suite เป็นอย่างน้อย มิฉะนั้น Wallet ที่ทำตามข้อกำหนดจะใช้งานร่วมกันไม่ได้ ส่วน `HMAC-SHA512` สำหรับ BIP32 derivation **MUST** รองรับเป็นกรณีบังคับ

---

## 11.3 Suite ที่ปรากฏในเอกสารสถาปัตยกรรม

**[ข้อเท็จจริง]** ตัวอย่างในเอกสารสถาปัตยกรรมประกาศ suite ดังนี้

| วัตถุ | ผู้ลงลายมือชื่อ | ค่า `alg` หรือกุญแจ | ที่มา |
|-------|----------------|--------------------|-------|
| Issuer metadata `proof_types_supported` | Wallet | `["EdDSA", "ES256"]` | [A-ARCH §ลำดับที่ 2B] |
| Holder binding `cnf` JWK | Wallet | `kty=OKP`, `crv=Ed25519` (recommended) หรือ `kty=EC`, `crv=P-256` | [A-ARCH §ลำดับที่ 2B] |
| VC Status List Token | Issuer | `EdDSA` หรือ `ES256` | [A-ARCH §ลำดับที่ 3] |
| Issuer DID Document verification key (ตัวอย่าง DOPA) | Issuer | `kty=OKP`, `crv=Ed25519` (recommended) หรือ `kty=EC`, `crv=P-256` | [A-ARCH §6] |

**[ข้อวิเคราะห์]** ผู้ตรวจ **MUST** ผูก `alg` กับชนิดและ curve ของกุญแจให้ตรงกัน โดย `ES256` ต้องคู่กับ `kty=EC` และ `crv=P-256` ส่วน `EdDSA` ต้องคู่กับกุญแจ Ed25519 การพบ `alg` ที่ไม่ตรงกับกุญแจ **MUST** ถือว่าตรวจไม่ผ่านและปฏิเสธทันที

**[ข้อวิเคราะห์]** ผู้ตรวจ **MUST NOT** เลือก algorithm จาก JWT header เพียงลำพัง ต้องตรวจชนิดกุญแจและ algorithm ที่อนุญาตตาม Thai profile ประกอบกับกุญแจที่ประกาศใน `LoTE.TrustedEntitiesList[].TrustedEntityServices[].ServiceInformation.ServiceDigitalIdentity` ทั้งนี้ [JWT ตัวอย่าง](../research/42-trusted-list-lote-jwt-format.md) ยังไม่แสดงฟิลด์ suite รายบริการ จึงห้ามสมมติว่ามีฟิลด์ดังกล่าวใน Trusted List; หาก profile ที่ประกาศใช้ไม่ระบุวิธีจับคู่ algorithm กับกุญแจ ผู้ตรวจต้องปฏิเสธการตัดสินใจด้านความน่าเชื่อถือ สถาปัตยกรรมกำหนดให้ใช้ **Trusted List เป็นแหล่งข้อมูลอ้างอิงหลักของกุญแจ** [A-TM §6, §I7]

---

## 11.4 การเปลี่ยน Algorithm และแผนระยะยาว

**[ข้อวิเคราะห์ — แผน transition จาก Ed25519 ไป ES256]** `EdDSA` (Ed25519) เป็น algorithm ที่แนะนำและระบบรองรับอยู่ อย่างไรก็ตาม อุปกรณ์ Apple (iOS) ไม่รองรับ Ed25519 ใน Secure Enclave ทำให้ไม่สามารถเก็บกุญแจ Ed25519 ใน hardware-backed keystore ของ Apple ได้ ระบบจึงวางแผน transition ไปสู่ `ES256` (ECDSA P-256) ซึ่งได้รับการรองรับจาก Secure Enclave ของ Apple และ StrongBox ของ Android ทั้งคู่ ทั้งนี้ Wallet ยังคงรองรับ `EdDSA` ในระหว่าง transition และจะเลือกใช้ตามความสามารถของฮาร์ดแวร์ — ถ้าฮาร์ดแวร์รองรับ Ed25519 ก็ใช้ EdDSA ถ้าไม่ ก็ใช้ ES256

| ระยะ | algorithm | สถานะ | เงื่อนไข |
|------|----------|-------|----------|
| ปัจจุบัน | `EdDSA` (Ed25519) | Recommended | ฮาร์ดแวร์รองรับ (Android StrongBox) |
| ปัจจุบัน | `ES256` (P-256) | รองรับ | ฮาร์ดแวร์ไม่รองรับ Ed25519 (Apple Secure Enclave) |
| อนาคต | `ES256` (P-256) | เป้าหมาย transition | รอการยืนยันจากคณะทำงาน — To be confirmed |

> **หมายเหตุ:** แผน transition ด้านบนยังไม่ได้รับการยืนยัน (To be confirmed) รอมติคณะทำงาน VC ระบบไม่ทิ้งการรองรับ Ed25519 แม้หลัง transition จะเสร็จ เพื่อรองรับ credential เดิมที่ลงลายมือชื่อด้วย EdDSA

**[ข้อเท็จจริง]** การเลิกใช้ algorithm เป็นหนึ่งใน rotation trigger ที่กำหนดไว้ ตัวอย่างที่ระบุคือ `ES256 → ES384` [A-KD08 §1]

**[ข้อเท็จจริง]** แผนย้ายไปสู่ Post-Quantum Cryptography (PQC) กำหนดกรอบเวลาปี 2028 เป็นต้นไป เส้นทางที่ระบุคือ `Ed25519 → ML-DSA-65 (CRYSTALS-Dilithium)` [A-TM §9]

**[ข้อวิเคราะห์]** ETDA ในฐานะ Trust Framework Authority **MUST** ประกาศ algorithm registry แบบมีเวอร์ชัน ระบุสถานะ `allowed` / `deprecated` / `prohibited` และวันที่มีผล เพราะการเปลี่ยน algorithm เป็น rotation trigger ที่ทุกฝ่ายต้องตรวจสอบได้ร่วมกัน

**[ข้อวิเคราะห์]** การรองรับหลาย suite พร้อมกัน **MUST NOT** เปิดช่องให้ downgrade กล่าวคือ credential ที่ลงลายมือชื่อด้วย suite หนึ่ง **MUST** ตรวจด้วย suite นั้นและกุญแจที่ผูกกันเท่านั้น

---

{/* METADATA (agent-only — not rendered to readers)
## 11.5 References

### 11.5.1 แหล่งข้อมูลหลัก — เอกสารสถาปัตยกรรมในโครงการ

วันที่เข้าถึงทุกไฟล์: **2026-08-04** โดยอ้างสถานะ repository ณ เวอร์ชันเอกสาร 1.0.0

| รหัส | เอกสาร | เวอร์ชันที่ระบุในไฟล์ |
|------|--------|---------------------|
| A-ARCH | [../architecture/01-architecture.md](../architecture/01-architecture.md) — สถาปัตยกรรมความน่าเชื่อถือแบบ Trusted List | v2.3 |
| A-TM | [../architecture/phase2/trustlist/10-threat-model.md](../architecture/phase2/trustlist/10-threat-model.md) — Trust List Verification: Threat Model & Mitigations | Draft v1.0 |
| A-KD01 | [../architecture/phase2/key-derivation/01-key-derivation-architecture.md](../architecture/phase2/key-derivation/01-key-derivation-architecture.md) — Key Derivation Architecture | Draft v1.0 |
| A-KD08 | [../architecture/phase2/key-derivation/08-key-rotation-lifecycle.md](../architecture/phase2/key-derivation/08-key-rotation-lifecycle.md) — Key Rotation & Lifecycle | Draft v1.0 |

### 11.5.2 มาตรฐานภายนอกที่อ้างผ่านเอกสารข้างต้น

เอกสารนี้ไม่อ้างมาตรฐานภายนอกโดยตรง รายการต่อไปนี้คือมาตรฐานที่ไฟล์สถาปัตยกรรมข้างต้นระบุไว้เป็นแหล่งข้อมูลของตน เฉพาะส่วนที่เกี่ยวข้องกับ cryptographic suites ในบทนี้

| มาตรฐาน | ส่วนที่อ้าง | ไฟล์ที่อ้าง |
|---------|-----------|-----------|
| OID4VP 1.0 Final | ค่าปริยาย `alg` ของ KB-JWT (`ES256`) | A-KD01 §9, A-ARCH §ลำดับที่ 2B |
| SD-JWT VC (draft-ietf-oauth-sd-jwt-vc) | §4.1 Key Binding JWT | A-KD01 §9, A-ARCH §ลำดับที่ 2B |
| EU eIDAS ARF | เส้นทางการย้ายไป PQC (`Ed25519 → ML-DSA-65`) และการเลิกใช้ algorithm | A-TM §9, A-KD08 §1 |

---
*/}

**การนำทาง:** [⬅️ บทที่ 10 — Wallet Unit Attestation (WUA)](10-wallet-unit-attestation.md) · [⬆️ สารบัญ ARF](README.md) · [บทที่ 12 — Key Management และ Trusted List Deployment ➡️](12-key-management-and-trustlist-deployment.md)
