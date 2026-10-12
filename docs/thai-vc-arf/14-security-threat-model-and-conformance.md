---
description: "14. ความมั่นคงปลอดภัย: Threat Model และรายการตรวจ Conformance — Thai VC ARF 2.0 DRAFT 0"
---

# 14. ความมั่นคงปลอดภัย: Threat Model และรายการตรวจ Conformance

{/* METADATA (agent-only — not rendered to readers)
> **สถานะ:** 📐 Specification — Draft สำหรับการทบทวนเชิงกำกับดูแล (S8, MASA-129 → MASA-150)
> **เวอร์ชันเอกสาร:** 1.0.2 (2026-08-06) — ตัดการอ้างถึง Phase 3 ในช่องว่าง G-05 (§14.2) เปลี่ยนเป็น "แนวทางในอนาคต" ตามมติให้ยกเลิกการแบ่งระยะ (MASA-157)
> **เวอร์ชันเอกสาร:** 1.0.1 (2026-08-06) — ตัดข้อมูล Access Certificate และกลไก `cnf.jwk` ใน Verifier Attestation ออกจากช่องว่าง G-07 (§14.4) และลบแหล่งอ้างอิง A-ACP ที่ไม่ถูกอ้างแล้ว ให้สรุป G-07 ตรงกับมติใน §12.2.1 (soft key / TEE-WSCD / HSM และประกาศ public key ผ่าน Trusted List หรือ `did:web`) (MASA-153)
> **เวอร์ชันเอกสาร:** 1.0.0 (2026-08-06)
> **แหล่งข้อมูล:** เอกสารสถาปัตยกรรมภายใต้ `th/architecture/` เท่านั้น — ดู §14.5 References
> **ขอบเขต:** เอกสารกำกับดูแลและข้อกำหนดสำหรับการตรวจประเมิน ห้ามตีความเป็นผลทดสอบ production
> **เอกสารที่เกี่ยวข้อง:** [11-cryptographic-suites.md](11-cryptographic-suites.md), [12-key-management-and-trustlist-deployment.md](12-key-management-and-trustlist-deployment.md), [13-vc-status-and-revocation.md](13-vc-status-and-revocation.md), [ดัชนีเอกสาร ARF](README.md)
*/}

---

บทที่ 14 รวม threat model, abuse case, รายการตรวจ conformance ที่ตรวจสอบได้ และสรุปช่องว่างที่ต้อง escalate ของทั้งสามเรื่องในบทที่ 11–13 คือ cryptographic suites, key management/Trusted List deployment และ VC status/revocation ไว้ในบทเดียว เพื่อให้ผู้ตรวจประเมินใช้เป็นกรอบเดียวกัน

---

## 14.1 ขอบเขตและการจำแนกข้อความ

หัวข้อนี้รวม threat model และรายการตรวจ conformance ของบทที่ 11–13 คือ (1) Cryptographic Suites (2) Key Management/Rotation และ Trusted List Deployment (3) VC Revocation ด้วย IETF Token Status List

**กฎการอ้างอิงของหัวข้อนี้:** ข้อกำหนดทุกข้อ **MUST** สืบย้อนไปยังไฟล์ภายใต้ `th/architecture/` มาตรฐานภายนอกอ้างผ่านไฟล์สถาปัตยกรรมที่ระบุมาตรฐานนั้นไว้แล้ว หัวข้อนี้ **MUST NOT** สร้างข้อกำหนดใหม่ที่ไม่มีฐานในเอกสารสถาปัตยกรรม

การจำแนกข้อความ:

| ป้าย | ความหมาย |
|------|----------|
| **[ข้อเท็จจริง]** | ข้อความที่ปรากฏในเอกสารสถาปัตยกรรมโดยตรง พร้อมเลขอ้างอิง |
| **[ข้อวิเคราะห์]** | การประมวลข้อเท็จจริงหลายแหล่งเข้าเป็นข้อกำหนดเชิงกำกับดูแล |
| **[ช่องว่าง]** | ประเด็นที่เอกสารสถาปัตยกรรมยังขัดกันเองหรือยังไม่กำหนด ต้องมีมติก่อนบังคับใช้ |

คำ **MUST / MUST NOT / SHOULD / MAY** ใช้ตามความหมายเชิงข้อกำหนด: ต้อง / ห้าม / ควร / อาจ

---

## 14.2 Threat Model และ Abuse Case

**[ข้อเท็จจริง]** เอกสารสถาปัตยกรรมใช้กรอบ **STRIDE ร่วมกับ VC Trust Triangle** ครอบคลุม 4 actor และกำหนดรหัสภัยคุกคามไว้ 32 รายการ [A-TM §1, §8.1]

| ชุด | ขอบเขต | จำนวน |
|-----|--------|:-----:|
| W1–W8 | Wallet ปลอมหรือถูกฝัง malware | 8 |
| I1–I8 | Issuer ปลอมหรือถูก impersonate | 8 |
| V1–V9 | Verifier ปลอม MITM หรือขอข้อมูลเกิน | 9 |
| T1–T7 | โครงสร้างพื้นฐาน Trusted List ถูกโจมตี | 7 |

**[ข้อเท็จจริง]** ข้อความสำคัญของ threat model คือ ทุก attack ต้องผ่านทุก checkpoint จึงจะถึงสถานะ `BREACH_RISK` ซึ่งเกิดได้เมื่อทุก layer fail พร้อมกันเท่านั้น [A-TM §2.0]

### 14.2.1 Abuse Case ที่เกี่ยวกับ Crypto, Key และ Status โดยตรง

**[ข้อวิเคราะห์]** ตารางนี้คัดรหัสภัยคุกคามที่เกี่ยวกับสามหัวข้อของเอกสารนี้ พร้อมมาตรการที่ตรวจสอบได้ ทุกแถวอ้างรหัสจาก [A-TM]

| รหัส | Abuse case | ผลกระทบ | มาตรการที่ตรวจสอบได้ |
|------|-----------|---------|---------------------|
| W2 | Wallet binary ถูกแก้ให้ข้ามการตรวจลายมือชื่อ TL | ยอมรับ TL ปลอม | pin TL public key ใน binary, code signing, runtime integrity check และถ้า pubkey ไม่ตรงให้ app block ตัวเอง |
| W4 | Wallet ใช้ soft key ที่ export ได้ | กุญแจ holder ถูกขโมยไปสร้าง wallet ปลอม | Issuer ปฏิเสธกุญแจที่ไม่มี `key_storage_verified` และตรวจ WSCD attestation chain; หากจะใช้ข้อกำหนดฮาร์ดแวร์จาก Trusted List ต้องกำหนดฟิลด์และกฎใน Thai profile ก่อน [research/42](../research/42-trusted-list-lote-jwt-format.md) |
| W5 | TL rollback หรือ downgrade | ใช้ TL เก่าที่องค์กรหรือบริการถูกเพิกถอนแล้วยังปรากฏว่า active | ตรวจ `LoTE.ListAndSchemeInformation.LoTESequenceNumber` ไม่ให้ย้อนกลับ และตรวจ `NextUpdate` ก่อนใช้ cache [research/42](../research/42-trusted-list-lote-jwt-format.md) |
| W6 | Holder ส่ง VC และ key handle ให้ผู้อื่น | ใช้ VC ของบุคคลอื่น | ผูก `cnf` กับกุญแจใน WSCD ที่ส่งต่อไม่ได้, ตรวจ PoP ใน VP และ biometric gate ก่อนปล่อยกุญแจ |
| W7 | Cache poisoning บนเครื่องที่ root | ใช้ TL ที่ถูกแก้ในเครื่อง | re-sign cached TL ด้วยกุญแจจาก WSCD ก่อนเก็บ, encrypted storage และตรวจ HMAC ทุกครั้งที่ load |
| I3 | กุญแจ Issuer เก่าถูกขโมยแต่ยังถูก trust | ปลอม VC ด้วยกุญแจเก่า | Thai profile ต้องกำหนดสถานะและช่วงเวลาต่อกุญแจ; หากตรวจไม่ได้ให้ปฏิเสธ [research/42](../research/42-trusted-list-lote-jwt-format.md) |
| I6 | Status List endpoint ถูก takeover | ส่งค่า active ให้ VC ที่ถูกเพิกถอน | Status List ต้องเป็น signed JWS; หากจะอ้าง URI จาก Trusted List ต้องกำหนดตำแหน่ง URI และกฎการผูกกับ Issuer ใน Thai profile ก่อน ห้ามเชื่อ URI จาก `status` claim เพียงลำพัง และต้องตรวจลายมือชื่อด้วยกุญแจที่อนุญาต [research/42](../research/42-trusted-list-lote-jwt-format.md) |
| I7 | DID Document ถูกแก้ให้เปลี่ยน controller key | หลอกให้ trust กุญแจของผู้โจมตี | TL เป็นแหล่งข้อมูลอ้างอิงหลักของกุญแจ, monitor การเปลี่ยนกุญแจใน DID Document และเผยแพร่ TL ใหม่ภายใน 24 ชั่วโมง |
| I8 | Replay Issuer ที่ถูกเพิกถอนแล้ว | Wallet ที่ cache เก่ายังยอมรับ VC | Verifier ตรวจ Status List รายใบและสถานะ Issuer ใน Trusted List ที่ยังไม่เกิน `LoTE.ListAndSchemeInformation.NextUpdate` [research/42](../research/42-trusted-list-lote-jwt-format.md) |
| V7 | ใช้ Verifier Attestation ที่หมดอายุจาก cache | Verifier ที่หมดสิทธิ์ยังขอข้อมูลได้ | เพดาน TTL ที่ override ไม่ได้, ห้าม cache attestation และตรวจ `iat` กับ `exp` โดย clock skew ไม่เกิน 60 วินาที |
| V8 | Verifier ถูก compromise หลัง onboard | รายการ Verifier ยังมีผลใช้ได้ | สพธอ. ต้องเผยแพร่การเปลี่ยนสถานะ Verifier เป็น `suspended` หรือ `withdrawn` ตามฟิลด์ที่ Thai profile กำหนด; Wallet ดึงไฟล์ Verifier Trusted List ฉบับเต็มเมื่อเกิดการตรวจสอบ และตรวจสถานะก่อนนำเสนอ [research/42](../research/42-trusted-list-lote-jwt-format.md) |
| T1 | HSM ที่ลงลายมือชื่อ TL ถูก breach | ลงลายมือชื่อ TL ปลอมได้ | กุญแจอยู่ใน HSM ที่ export ไม่ได้, quorum M-of-N แบบ 3-of-5, emergency key แบบ air-gapped และ HSM กระจายตามภูมิศาสตร์ |
| T4 | Rollback หรือ freeze attack ด้วย TL เก่าที่ลายมือชื่อถูกต้อง | ไม่เห็นการเพิกถอนล่าสุด | ตรวจ `LoTESequenceNumber`, `ListIssueDateTime` และ `NextUpdate` ใน `LoTE.ListAndSchemeInformation` พร้อมตรวจ clock skew [research/42](../research/42-trusted-list-lote-jwt-format.md) |
| T5 | เนื้อหา JWT ที่เผยแพร่กับข้อมูลต้นทางไม่ตรงกัน | consumer ตัดสิน trust จากข้อมูลผิด | ตรวจความสอดคล้องของ payload แบบ LoTE ใน JWT ทั้งสามรายการกับข้อมูลต้นทางก่อนลงลายมือชื่อ และใช้ CI gate ปฏิเสธเมื่อพบความคลาดเคลื่อน [research/42](../research/42-trusted-list-lote-jwt-format.md) |
| T6 | ผู้ดูแล TL ภายในกระทำโดยทุจริต | แก้รายการหรือขอบเขตสิทธิ์ | Transparency Log แบบ append-only, 2-person rule ที่แยกหน้าที่ admin ไม่เท่ากับ approver และไม่เท่ากับ signer, public diff feed และบันทึก privileged session |

**[ข้อเท็จจริง]** หลักการ defense-in-depth ที่บันทึกไว้ 4 ข้อคือ ทุกการตัดสินใจผ่านหลาย layer / Trusted List เป็นแหล่งข้อมูลอ้างอิงหลักของกุญแจและขอบเขตสิทธิ์ตาม Thai profile / มีการเพิกถอนกุญแจ Issuer แบบเรียลไทม์ และเพิกถอนผู้ตรวจสอบเอกสารผ่านการเปลี่ยนสถานะใน Trusted List / มี append-only log ที่ตรวจสอบได้จากภายนอก [A-TM §6] ทั้งนี้ [JWT ตัวอย่างแบบ LoTE](../research/42-trusted-list-lote-jwt-format.md) ยังไม่แสดงฟิลด์ขอบเขตสิทธิ์ครบถ้วน

**[ช่องว่าง G-05]** threat model ระบุประเด็นที่ยังไม่ปิดไว้เอง 5 รายการ ได้แก่ การย้ายไป PQC ในปี 2028 เป็นต้นไป การ compromise ที่ผู้ผลิต WSCD ซึ่งอยู่นอกขอบเขต TL การทำ side-channel บนกุญแจ holder ซึ่งเป็นความรับผิดของผู้ผลิต การต้านการสอดส่องเป็นวงกว้างด้วย BBS+ ซึ่งเป็นแนวทางในอนาคต และ Bridge TL specification ที่กำหนดกรอบ Q4 2026 [A-TM §9] เอกสารนี้ไม่ขยายขอบเขตเกินรายการดังกล่าว

---

## 14.3 Security Checklist ที่ตรวจสอบได้

**[ข้อวิเคราะห์]** รายการนี้ประกอบจาก pen-test scope checklist สำหรับ onboarding ผู้ผลิต Wallet [A-TM §8.2] ขอบเขต conformance ของ Issuer และ Verifier [A-TM §8.3] และรายการตรวจประเมินของ ETDA [A-ARCH §8] ทุกแถวผูกกับรหัสภัยคุกคามหรือรหัสข้อตรวจที่มีอยู่แล้ว

### 14.3.1 Wallet

| # | ข้อกำหนด | รหัสที่เกี่ยวข้อง | หลักฐานที่ต้องมี | เกณฑ์ผ่าน |
|---|---------|-----------------|-----------------|-----------|
| SC-01 | App attestation ทำงานจริง | W1 | ผล Play Integrity หรือ App Attest ตอน enrollment | enrollment จาก app ที่ไม่ผ่าน attestation ถูกปฏิเสธ |
| SC-02 | การตรวจลายมือชื่อ TL แก้ไม่ได้ | W2 | code review และ binary ที่ pin pubkey | TL ที่ลายมือชื่อผิดถูกปฏิเสธทุกกรณี |
| SC-03 | บังคับขอบเขตสิทธิ์ตาม Thai profile โดยข้ามไม่ได้ | W3, V3 | negative conformance test เมื่อ Thai profile กำหนดฟิลด์ขอบเขตสิทธิ์แล้ว | VC หรือคำขอที่อยู่นอก scope ถูกปฏิเสธ และผู้ใช้ override ไม่ได้ [research/42](../research/42-trusted-list-lote-jwt-format.md) |
| SC-04 | กุญแจใน WSCD export ไม่ได้ | W4 | WSCD attestation chain | กุญแจที่ไม่มี `key_storage_verified` ถูกปฏิเสธ |
| SC-05 | บังคับ `LoTESequenceNumber` ไม่ย้อนกลับ | W5, T4 | fixture JWT ที่ `LoTESequenceNumber` ย้อนหลังหรือ `NextUpdate` หมดอายุ | JWT ที่ย้อนหลังหรือหมดอายุถูกปฏิเสธ [research/42](../research/42-trusted-list-lote-jwt-format.md) |
| SC-06 | ตรวจ `cnf` key binding | W6, V9 | fixture ที่ `cnf` ไม่ตรง | VP ที่ `cnf` ไม่ตรงถูกปฏิเสธ |
| SC-07 | Cache integrity ของ TL | W7 | ผลตรวจ HMAC และการทดสอบแก้ cache บนเครื่อง root | cache ที่ถูกแก้ถูกตรวจจับและไม่ถูกใช้ |
| SC-08 | ป้องกัน overlay และ phishing UI | W8, V6 | ผลทดสอบ anti-overlay | prompt สำหรับยืนยันสำคัญมาจาก WSCD และ UI แสดงชื่อจาก TL เท่านั้น |
| SC-09 | บังคับ `client_id_scheme` อย่างเข้มงวด | V1, V4 | fixture ที่ SAN ไม่ตรงและ `response_uri` นอก SAN | ถูกปฏิเสธทั้งสองกรณี |
| SC-10 | ไม่ cache Verifier Attestation | V7 | code review และ fixture ที่หมดอายุ | revalidate ทุกครั้งที่นำเสนอ และ clock skew ที่ยอมรับไม่เกิน 60 วินาที |
| SC-11 | ตรวจสถานะ Verifier ใน Trusted List | V8 | fixture JWT แบบ LoTE ที่มีสถานะ `suspended` และ `withdrawn` ตามฟิลด์ที่ Thai profile กำหนด | ปฏิเสธ **ก่อน** แสดงหน้าขอความยินยอม; หากไม่มีฟิลด์สถานะที่ตรวจสอบได้ ให้ปฏิเสธ [research/42](../research/42-trusted-list-lote-jwt-format.md) |

### 14.3.2 Issuer

| # | ข้อกำหนด | รหัสที่เกี่ยวข้อง | หลักฐานที่ต้องมี | เกณฑ์ผ่าน |
|---|---------|-----------------|-----------------|-----------|
| SC-12 | กุญแจลงลายมือชื่ออยู่ใน HSM | A-ARCH §8 I1 | ใบรับรอง HSM | ระดับตรงตามข้อกำหนด และไม่มีทางส่งออกกุญแจแบบ plaintext |
| SC-13 | พิธีสร้างกุญแจมีพยาน | A-ARCH §8 I2 | รายงานพิธีและบันทึกวิดีโอ | ครบทั้งพยานและบันทึก |
| SC-14 | แผนหมุนเวียนกุญแจประจำปี | A-ARCH §8 I3 | เอกสารนโยบาย | ระบุรอบ ผู้รับผิดชอบ และขั้นตอน rollback |
| SC-15 | Status List endpoint ตรงตามรูปแบบ | A-ARCH §8 I7 | ผลทดสอบ endpoint | ส่งกลับ `application/statuslist+jwt` ที่ `typ` ถูกต้อง |
| SC-16 | SLA อัปเดต Status List | A-ARCH §8 I8 | เอกสาร SLA และ log การอัปเดต | ไม่เกิน 15 นาที และวัดจาก log ได้ |
| SC-17 | Status List JWT ครบองค์ประกอบ | A-ARCH §8 I9 | ตรวจ token | ลงลายมือชื่อด้วยกุญแจผู้ออก และมีทั้ง `exp` กับ `ttl` โดย `ttl` ≤ `exp` |
| SC-18 | Rotation endpoint ตรวจ PoP ด้วยกุญแจเดิม | A-KD08 §7 | fixture PoP ที่ลงลายมือชื่อด้วยกุญแจผิด | คำขอที่ PoP ไม่ถูกต้องถูกปฏิเสธ |
| SC-19 | mark VC เดิมเป็น `rotated` | A-KD08 §3, §8 | log การหมุนเวียนและสถานะใน list | VC เดิมเปลี่ยนสถานะสำเร็จก่อน Wallet ลบ key handle |
| SC-20 | ตรวจ WSCD attestation ก่อนออก VC | W4, A-KD06 | ผลตรวจ attestation chain | กุญแจที่เป็น software หรือมาจากเครื่อง root ถูกปฏิเสธ |

### 14.3.3 Verifier

| # | ข้อกำหนด | รหัสที่เกี่ยวข้อง | หลักฐานที่ต้องมี | เกณฑ์ผ่าน |
|---|---------|-----------------|-----------------|-----------|
| SC-21 | ตรวจการอนุญาตของ Issuer ผ่าน Trusted List | A-ARCH §8 V2 | code review | ตัดสิน trust จาก entry ใน Trusted List เท่านั้น ไม่ใช้ผล resolve DID เป็นหลักฐานการอนุญาต |
| SC-22 | ตรวจ KB-JWT | A-ARCH §8 V3 | ผลทดสอบ | KB-JWT ที่ผิดถูกปฏิเสธ |
| SC-23 | ตรวจ Status List JWT ครบสามขั้น | A-ARCH §8 V4 | fixture ที่ลายมือชื่อผิด, `typ` ผิด, `exp` หมด และ index เกินขอบเขต | ยอมรับเฉพาะ fixture ที่ถูกต้องครบทุกขั้น |
| SC-24 | ตรวจแหล่ง status URI ตาม Thai profile | I6 | code review และ fixture ที่ `status` claim ชี้ไป host อื่น เมื่อ profile กำหนด URI อ้างอิงแล้ว | ไม่เชื่อ URI ที่ credential กำหนดเองโดยไม่มีการตรวจผูกกับแหล่งที่อนุญาต [research/42](../research/42-trusted-list-lote-jwt-format.md) |
| SC-25 | ตรวจลายมือชื่อก่อนคลาย ZLIB | I6 | code review และ fixture ที่ลายมือชื่อผิดแต่ payload ใหญ่ | ไม่คลายข้อมูลที่ยังไม่ผ่านการตรวจลายมือชื่อ |
| SC-26 | ตรวจ `iat` ของ VC ในช่วงอายุกุญแจ | I3 | fixture VC ที่ `iat` อยู่นอกช่วง | ถูกปฏิเสธ |
| SC-27 | ตรวจ `nonce` และ `aud` | V5 | fixture VP ที่ `aud` เป็นของ Verifier อื่น | ถูกปฏิเสธ และอายุ token ไม่เกิน 5 นาที |
| SC-28 | ทดสอบเจาะระบบ VP verification endpoint | A-ARCH §8 V9 | รายงาน pen test | ไม่มีช่องข้ามการตรวจลายมือชื่อหรือการตรวจสถานะ |

### 14.3.4 โครงสร้างพื้นฐาน Trusted List (ETDA)

| # | ข้อกำหนด | รหัสที่เกี่ยวข้อง | หลักฐานที่ต้องมี | เกณฑ์ผ่าน |
|---|---------|-----------------|-----------------|-----------|
| SC-29 | quorum M-of-N ในการลงลายมือชื่อ TL | T1 | บันทึกการลงลายมือชื่อ | การลงลายมือชื่อด้วยผู้ถือ share น้อยกว่า quorum ไม่สำเร็จ |
| SC-30 | 2-person rule และแยกหน้าที่ | I4, T6 | signed change log และบันทึก session | admin ไม่เท่ากับ approver และไม่เท่ากับ signer พร้อม audit record ที่ลงลายมือชื่อทุกการแก้ไข |
| SC-31 | Transparency Log แบบ append-only | I4, T4, T6 | public diff feed และผล query witness | ทุกการเผยแพร่ปรากฏใน log และตรวจสอบจากภายนอกได้ |
| SC-32 | ความสอดคล้องระหว่างข้อมูลต้นทางกับ JWT แบบ LoTE | T5 | ผล CI gate ของ JWT ทั้งสามรายการ | CI block การเผยแพร่เมื่อ payload ไม่ตรงกับข้อมูลต้นทาง [research/42](../research/42-trusted-list-lote-jwt-format.md) |
| SC-33 | Multi-CDN และ DNS fallback | T2, T3 | ผลทดสอบ fault injection | ปิด primary แล้วยัง fetch TL ได้จาก endpoint สำรอง |
| SC-34 | ขั้นตอนเพิกถอนฉุกเฉิน | I3, T1 | บันทึกการซ้อม | การเพิกถอนแพร่กระจายภายในเป้าหมายที่กำหนด และมี emergency key แบบ air-gapped |

> **ห้ามรายงานว่า "ผ่าน"** จนกว่าจะมี artifact จากการรันจริง ได้แก่ hash ของ fixture คำสั่งที่ใช้ timestamp สภาพแวดล้อม และผลลัพธ์ เอกสารฉบับนี้ยัง**ไม่มี**ผลการทดสอบใด ๆ แนบมา

**[ข้อเท็จจริง]** ขอบเขต TTA Conformance v2.0 สาย Trusted List กำหนด negative test case เพิ่ม 32 รายการ แบ่งเป็น W-series 8 รายการ I-series 8 รายการ V-series 9 รายการ และ T-series 7 รายการ [A-TM §8.1] และทุก state ที่อยู่ในคอลัมน์ Critical States ของตาราง mapping **MUST** มีทั้ง unit test และ negative conformance test สำหรับรหัสภัยคุกคามที่เกี่ยวข้อง [A-TM §7]

---

## 14.4 สรุปช่องว่างที่ต้อง Escalate

**[ช่องว่าง]** ประเด็นทั้งหมดที่พบจากการตรวจความสอดคล้องภายใน `th/architecture/` เรียงตามความสำคัญ

| รหัส | ประเด็น | นัยสำคัญ | ผู้ตัดสิน | อ้างอิงที่ขัดกัน |
|------|--------|---------|----------|-----------------|
| G-02 | เอกสารต้นทางบางแห่งประกาศ `bits: 1` แต่กำหนด status `SUSPENDED` (`0x02`) และ Thai-profile `rotated` (`0x03`) ซึ่งแทนด้วย 1 บิตไม่ได้ | interoperability — issuer ต้องใช้ `bits: 2` ขึ้นไปสำหรับ status เหล่านี้; `rotated` เป็นค่าเฉพาะ Thai profile ไม่ใช่ status ที่ IETF ลงทะเบียนหรือข้อกำหนดที่ยืนยันได้จาก CIR โดยตรง | ETDA Security Team | [A-ARCH §ลำดับที่ 3] กับ [A-KD08 §8, §9]; TSL draft-21 §§4.1, 7.1, 14.5.2 |
| G-03 | `ttl` 12 ชั่วโมงขัดกับ SLA อัปเดต 15 นาทีและเป้าหมายเพิกถอนฉุกเฉิน 1 ชั่วโมง | ความมั่นคงปลอดภัย เพราะ Verifier อาจไม่เห็นการเพิกถอนได้นานถึง 12 ชั่วโมง | ETDA Security Team | [A-ARCH §ลำดับที่ 3] กับ [A-ARCH §8 I8] และ [A-TM §I3] |
| G-06 | เอกสารสถาปัตยกรรมกำหนด algorithm profile แบบ mandatory และ optional ไว้เฉพาะกุญแจ Wallet Level 1–3 ยังไม่มี profile ที่บังคับสำหรับกุญแจลงลายมือชื่อ VC ของ Issuer และกุญแจ TL ของ ETDA มีเพียงค่าที่ปรากฏในตัวอย่าง | ต้องมี profile ที่บังคับได้ก่อนใช้เป็นเกณฑ์ตรวจประเมิน | ETDA Security Team | [A-KD01 §9] เทียบกับ [A-ARCH §ลำดับที่ 3] |
| G-01 | HSM ของ Issuer กำหนด FIPS 140-2 Level 3 ขณะที่ HSM ของ ETDA กำหนด FIPS 140-3 Level 3 ขึ้นไป | **มีมติแล้ว (ดู §12.2):** เกณฑ์ขั้นต่ำคือ FIPS 140-2 Level 3 [N1] และยอมรับ FIPS 140-3 Level 3 [N2] เป็นมาตรฐานสืบทอด เนื่องจาก NIST เปลี่ยนใบรับรอง FIPS 140-2 เป็น Historical วันที่ 21 กันยายน 2569 [N3] | ETDA Security Team | [A-ARCH §8 I1] กับ [A-TM §T1] |
| G-07 | ผู้ตรวจสอบเอกสารต้องมีกุญแจลงลายมือชื่อ Request Object และการบังคับใช้ HSM ทุกรายมีต้นทุนสูง | **มีมติแล้ว (ดู §12.2.1):** กำหนดทางเลือกการเก็บกุญแจ 3 แบบตามระดับความเชื่อมั่น คือ soft key (**MAY**) TEE หรือ WSCD (**ควร** เป็นอย่างน้อย) และ HSM (**MAY** ความเชื่อมั่นสูงสุดแต่ต้นทุนสูง) ทุกแบบต้องประกาศ public key ผ่าน Trusted List entry หรือ `did:web` ที่ `/.well-known/did.json` | ETDA Security Team | [A-HSM §2], [A-VRP] |
| G-05 | ประเด็นค้างที่ threat model ระบุไว้เอง 5 รายการ รวมถึงการย้ายไป PQC และ Bridge TL | ต้องมีเจ้าภาพและกรอบเวลา | ETDA Security Team | [A-TM §9] |

**[ข้อวิเคราะห์]** การจัดทำเอกสารนี้**ไม่พบ** critical security finding ที่ต้องหยุดงาน ช่องว่างข้างต้นเป็นความไม่สอดคล้องของเอกสารที่ต้องมีมติ และยังไม่มีหลักฐานว่าเป็นช่องโหว่ที่ถูกใช้โจมตีได้ทันที หากการทดสอบใน staging พบการข้ามการตรวจลายมือชื่อ การข้ามการตรวจสถานะ หรือการข้าม gate ของ Trusted List **MUST** หยุดการนำขึ้นใช้งานและรายงานทันที

**[ข้อเท็จจริง]** threat model กำหนดตัวเองเป็น living document ที่ต้องปรับทุกไตรมาสหรือเมื่อมี attack surface ใหม่ ผู้ดูแลคือ ETDA Security Team และต้องทบทวนทุกครั้งที่ TL ขึ้น minor version [A-TM §สถานะเอกสาร]

---

{/* METADATA (agent-only — not rendered to readers)
## 14.5 References

### 14.5.1 แหล่งข้อมูลหลัก — เอกสารสถาปัตยกรรมในโครงการ

วันที่เข้าถึงทุกไฟล์: **2026-08-04** โดยอ้างสถานะ repository ณ เวอร์ชันเอกสาร 1.0.0

| รหัส | เอกสาร | เวอร์ชันที่ระบุในไฟล์ |
|------|--------|---------------------|
| A-ARCH | [../architecture/01-architecture.md](../architecture/01-architecture.md) — สถาปัตยกรรมความน่าเชื่อถือแบบ Trusted List | v2.3 |
| A-TM | [../architecture/phase2/trustlist/10-threat-model.md](../architecture/phase2/trustlist/10-threat-model.md) — Trust List Verification: Threat Model & Mitigations | Draft v1.0 |
| A-KD01 | [../architecture/phase2/key-derivation/01-key-derivation-architecture.md](../architecture/phase2/key-derivation/01-key-derivation-architecture.md) — Key Derivation Architecture | Draft v1.0 |
| A-KD08 | [../architecture/phase2/key-derivation/08-key-rotation-lifecycle.md](../architecture/phase2/key-derivation/08-key-rotation-lifecycle.md) — Key Rotation & Lifecycle | Draft v1.0 |
| A-KD06 | [../architecture/phase2/key-derivation/06-wscd-key-attestation.md](../architecture/phase2/key-derivation/06-wscd-key-attestation.md) — WSCD Key Attestation | Draft v1.0 |
| A-VRP | [../policy/01-verifier-registration-policy.md](../policy/01-verifier-registration-policy.md) — นโยบายการลงทะเบียนผู้ตรวจสอบ | Draft v1.0 |
| A-HSM | [../policy/07-hsm-and-schema-governance-policy.md](../policy/07-hsm-and-schema-governance-policy.md) — นโยบาย HSM Service Model และ Schema Governance | Draft v1.0 |

### 14.5.2 มาตรฐานภายนอกที่อ้างผ่านเอกสารข้างต้น

เอกสารนี้ไม่อ้างมาตรฐานภายนอกโดยตรง รายการต่อไปนี้คือมาตรฐานที่ไฟล์สถาปัตยกรรมระบุไว้เป็นแหล่งข้อมูลของตน

| มาตรฐาน | ส่วนที่อ้าง | ไฟล์ที่อ้าง |
|---------|-----------|-----------|
| IETF Token Status List | Architecture baseline: `draft-ietf-oauth-status-list-18`; current technical reference: `draft-ietf-oauth-status-list-21` [13] (Internet-Draft) | A-ARCH, A-TM §10 |
| OID4VP 1.0 Final | §5.10, §11 Security Considerations, §11.5, §11.6 | A-TM §10, §V1, §V4, §V5 |
| OID4VCI 1.0 Final | §11 | A-TM §10 |
| SD-JWT VC (draft-ietf-oauth-sd-jwt-vc) | §4.1 Key Binding JWT, §6 | A-TM §10, §W6 |
| EU eIDAS ARF | §2.5, §6 WSCD, §6.6.3.8, Annex 2 Threat Model | A-TM §10, A-KD08, A-KD06 |
| CIR 2024/2979 | ข้อกำหนดการหมุนเวียนกุญแจ | A-KD08 |
| NIST SP 800-63 | IAL และ AAL | A-TM §10 |
| RFC 4033 | DNSSEC | A-TM §I1 |
| RFC 9162 | Certificate Transparency v2 | A-TM §I4, §10 |
| RFC 5891 และ Unicode TR 39 | IDN และการตรวจ homograph | A-TM §I2 |
| OWASP STRIDE | กรอบการทำ threat model | A-TM §1, §10 |
| Apple App Attest และ Android Key Attestation | กลไก attestation ระดับ platform | A-TM §W1, A-KD06 |

### 14.5.3 แหล่งอ้างอิง NIST สำหรับข้อกำหนด HSM

ระดับการรับรอง HSM ในหัวข้อนี้อ้างอิงมาตรฐานของ National Institute of Standards and Technology (NIST) โดยตรง เนื่องจากเอกสารสถาปัตยกรรม [A-ARCH §8 I1] และ [A-TM §T1] ระบุระดับ FIPS ไว้แล้ว รายการนี้จึงระบุแหล่งที่มาที่ตรวจสอบได้ของมาตรฐานดังกล่าว

- [N1] NIST, "FIPS PUB 140-2 — Security Requirements for Cryptographic Modules", พฤษภาคม ค.ศ. 2001 (ปรับปรุงตาม Change Notice ธันวาคม ค.ศ. 2002) — https://csrc.nist.gov/pubs/fips/140-2/upd2/final
- [N2] NIST, "FIPS PUB 140-3 — Security Requirements for Cryptographic Modules", มีนาคม ค.ศ. 2019 — https://csrc.nist.gov/pubs/fips/140-3/final
- [N3] NIST, "Cryptographic Module Validation Program (CMVP) — FIPS 140-2 Transition" — ใบรับรองตาม FIPS 140-2 เปลี่ยนสถานะเป็น Historical ตั้งแต่วันที่ 21 กันยายน ค.ศ. 2026 — https://csrc.nist.gov/projects/cryptographic-module-validation-program

---

**สถานะเอกสาร:** Living document — ทบทวนพร้อม [A-TM] ทุกไตรมาส หรือเมื่อ Trusted List ขึ้น minor version
**ผู้ดูแล:** ETDA Security Team

---
*/}

**การนำทาง:** [⬅️ บทที่ 13 — VC Status และ Revocation](13-vc-status-and-revocation.md) · [⬆️ สารบัญ ARF](README.md) · [บทที่ 15 — ภาคผนวก ➡️](15-appendix.md)
