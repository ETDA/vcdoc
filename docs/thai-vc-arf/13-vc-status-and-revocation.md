---
description: "13. VC Status และ Revocation — Thai VC ARF 2.0 DRAFT 0"
---

# 13. VC Status และ Revocation

{/* METADATA (agent-only — not rendered to readers)
> **สถานะ:** 📐 Specification — Draft สำหรับการทบทวนเชิงกำกับดูแล (S8, MASA-129 → MASA-150)
> **เวอร์ชันเอกสาร:** 1.3.0 (2026-08-07) — เพิ่ม §13.7.7 ผลกระทบเมื่อผู้ออกเอกสารหมุนเวียนกุญแจลงลายมือชื่อ (4 สถานะของกุญแจ 4 trigger T0–T3, ผลต่อ VC เดิม, กลไก wallet-side notification และ reissue campaign) และเพิ่มแถวในตารางสรุป §13.7.6 (MASA-166) แก้ถ้อยคำแปลตรงตัว "คำร่ม" → "คำรวม" และ "แหล่งความจริงเดียว" → "แหล่งข้อมูลอ้างอิงหลัก" (MASA-167) · เดิม: เพิ่ม §13.7 แผนภาพลำดับของรูปแบบการเพิกถอนทั้ง 5 แบบ (เพิกถอน VC, เพิกถอน Issuer/Verifier ผ่าน Trusted List, wallet provider เพิกถอน WIA/KA พร้อม cascade) และตารางสรุป §13.7.6 (MASA-158)
> **แหล่งข้อมูล:** เอกสารสถาปัตยกรรมภายใต้ `th/architecture/` เท่านั้น — ดู §13.9 References
> **ขอบเขต:** เอกสารกำกับดูแลและข้อกำหนดสำหรับการตรวจประเมิน ห้ามตีความเป็นผลทดสอบ production
> **เอกสารที่เกี่ยวข้อง:** [11-cryptographic-suites.md](11-cryptographic-suites.md), [12-key-management-and-trustlist-deployment.md](12-key-management-and-trustlist-deployment.md), [14-security-threat-model-and-conformance.md](14-security-threat-model-and-conformance.md), [ดัชนีเอกสาร ARF](README.md)
*/}

---

บทที่ 13 กำหนดกลไกการแสดงสถานะและการเพิกถอนเอกสารรับรองดิจิทัล (VC) ด้วย IETF Token Status List การเพิกถอนผู้ตรวจสอบเอกสาร (verifier) ผ่านการเปลี่ยนสถานะใน Trusted List และลำดับการตรวจสถานะระหว่างการนำเสนอ VP เรื่อง cryptographic suites อยู่ในบทที่ 11 และ key management อยู่ในบทที่ 12

---

## 13.1 ขอบเขตและการจำแนกข้อความ

บทนี้รวมข้อกำหนดด้านการแสดงสถานะและการเพิกถอนที่เกี่ยวข้องกับการนำเสนอ VC สี่เรื่อง คือ (1) การเพิกถอน VC (VC Revocation) ด้วย IETF Token Status List (2) การเพิกถอนผู้ตรวจสอบเอกสาร (verifier) ผ่านการเปลี่ยนสถานะใน Trusted List (3) ลำดับการตรวจสถานะระหว่างการนำเสนอ VP และ (4) ผลกระทบเมื่อผู้ออกเอกสารหมุนเวียนกุญแจลงลายมือชื่อ (Issuer Key Rotation) ตามที่ §13.7.7 อธิบาย

**กฎการอ้างอิงของบทนี้:** ข้อกำหนดทุกข้อ **MUST** สืบย้อนไปยังไฟล์ภายใต้ `th/architecture/` มาตรฐานภายนอกอ้างผ่านไฟล์สถาปัตยกรรมที่ระบุมาตรฐานนั้นไว้แล้ว บทนี้ **MUST NOT** สร้างข้อกำหนดใหม่ที่ไม่มีฐานในเอกสารสถาปัตยกรรม

การจำแนกข้อความ:

| ป้าย | ความหมาย |
|------|----------|
| **[ข้อเท็จจริง]** | ข้อความที่ปรากฏในเอกสารสถาปัตยกรรมโดยตรง พร้อมเลขอ้างอิง |
| **[ข้อวิเคราะห์]** | การประมวลข้อเท็จจริงหลายแหล่งเข้าเป็นข้อกำหนดเชิงกำกับดูแล |
| **[ช่องว่าง]** | ประเด็นที่เอกสารสถาปัตยกรรมยังขัดกันเองหรือยังไม่กำหนด ต้องมีมติก่อนบังคับใช้ |

คำ **MUST / MUST NOT / SHOULD / MAY** ใช้ตามความหมายเชิงข้อกำหนด: ต้อง / ห้าม / ควร / อาจ

---

## 13.2 รูปแบบที่เลือกใช้

**[ข้อเท็จจริง]** เอกสารสถาปัตยกรรมของโครงการระบุ Token Status List revision `draft-ietf-oauth-status-list-18` เป็นฐานที่เลือกใช้ [A-ARCH §2, §3] ส่วนการอธิบายพารามิเตอร์และกฎการประมวลผลในบทนี้ตรวจเทียบกับ revision ปัจจุบันที่ตรวจพบ `draft-ietf-oauth-status-list-21` (Internet-Draft; RFC Editor status: Awaiting First editor ณ 1 ตุลาคม 2569) [13] ทั้งสอง revision ยังเป็น draft จึงต้องระบุ revision ของ profile ที่นำไปใช้งานจริง

**[ข้อเท็จจริง]** เหตุผลที่บันทึกไว้ในสถาปัตยกรรมคือสอดคล้องกับ SD-JWT VC ที่กำหนด `status.status_list.{idx, uri}`, ตรงกับ EUDI Wallet ARF และ media type `application/statuslist+jwt` ลงทะเบียนกับ IANA แล้ว [A-ARCH §3]

**[ข้อเท็จจริง]** ความต่างจาก W3C Bitstring ตามที่สถาปัตยกรรมบันทึกไว้ คือใช้รูปแบบ token JWT แทน JSON-LD และการบีบอัดข้อมูลต่างกัน [A-ARCH §2]

**[ข้อวิเคราะห์]** ก่อนนำไปใช้งานจริง ผู้ดูแล profile **MUST** กำหนด revision ที่แน่นอน แล้วประเมินความเข้ากันได้และผลกระทบเมื่อเปลี่ยน revision; ไม่ถือว่า draft-18 และ draft-21 ใช้แทนกันได้โดยอัตโนมัติ

---

## 13.3 โครงสร้าง Status List Token ของ VC

**[ข้อเท็จจริง]** สถานะใน VC อยู่ในรูป `status: { status_list: { idx, uri } }` และ Status List Token มีโครงสร้างดังนี้ [A-ARCH §ลำดับที่ 2B, §ลำดับที่ 3]

```
Header:
{
  "alg": "ES256",
  "kid": "did:web:dopa.go.th#key-2026-001",
  "typ": "statuslist+jwt"
}

Payload:
{
  "sub": "https://status.dopa.go.th/statuslists/1",
  "iat": 1742284800,
  "exp": 1742371200,
  "ttl": 43200,
  "status_list": { "bits": 2, "lst": "eNrbuRgAAhcBXQ" }
}
```

**[ข้อเท็จจริง]** ความหมายของ `exp` กับ `ttl` คือ `exp` (86,400 วินาที = 24 ชั่วโมง) เป็นอายุสูงสุดของ JWT หลังจากนั้นต้อง fetch ใหม่ ส่วน `ttl` (43,200 วินาที = 12 ชั่วโมง) เป็นระยะเวลาที่ Verifier ควร cache และ `ttl` ≤ `exp` เสมอ [A-ARCH §ลำดับที่ 3]

**[ข้อเท็จจริง]** ขั้นตอนการตรวจสถานะสี่ขั้น [A-ARCH §ลำดับที่ 3]

1. ตรวจ Referenced Token ก่อน (เช่น claims ที่คาดหมาย ลายมือชื่อ และ `exp`); หากไม่ผ่าน ต้องปฏิเสธและห้ามตรวจ status ต่อ
2. เมื่อ Referenced Token ผ่าน ให้ดึง URI ของ Status List แล้วรับ JWT ที่มี `typ: statuslist+jwt`
3. ตรวจ Status List Token ตามกฎ JWT และ trust/key-resolution rules ที่ Thai profile กำหนด; ตรวจ claims ที่มีอยู่ รวม `sub` ว่าตรงกับ URI ใน `status.status_list.uri`, `iat` ตาม freshness policy และ `exp` หากมี
4. base64url-decode ค่า `lst` แล้วคลายข้อมูลด้วย decompressor ที่เข้ากันได้กับ DEFLATE/ZLIB
5. อ่านค่า status ที่ index `idx` ตามจำนวนบิตต่อรายการ (`bits`) ใน `status_list`; `bits` คือความกว้างของช่อง ไม่ใช่ค่า status และมีค่าได้ 1, 2, 4 หรือ 8
6. ตรวจ status ตาม semantics ที่ IETF ลงทะเบียนหรือ Thai profile กำหนด; หาก `idx` อยู่นอกขอบเขตหรือ status ไม่รองรับ ให้ปฏิเสธแบบ fail-closed

---

## 13.4 Status Value

**[ข้อเท็จจริง]** draft IETF Token Status List ที่ตรวจพบกำหนด status ที่ลงทะเบียนไว้คือ `0x00 VALID`, `0x01 INVALID` และ `0x02 SUSPENDED`; ค่า `0x03` และช่วง `0x0C–0x0F` สงวนไว้สำหรับการใช้งานเฉพาะแอปพลิเคชันตาม draft-21; Thai profile ที่กำหนด `0x03 = rotated` ต้องระบุ semantics และ processing rules ให้ชัด ค่า `0x03` จึงไม่ใช่ status `rotated` ที่ IETF กำหนดความหมายให้ ส่วน IETF เปิดให้ use case กำหนดค่าเพิ่มเติมได้ โดย Thai profile อาจกำหนด `0x03` เป็น `rotated` ได้เมื่อระบุความหมายและกฎประมวลผลให้ชัดเจน [TSL draft-21 §§7.1, 14.5.2]

| ค่า status | สถานะ | แหล่งความหมาย / การใช้ |
|:---:|-------|----------|
| `0x00` | `VALID` | IETF — token ใช้ได้ตามสถานะ (แต่ยังต้องผ่าน validation ของ token เอง) |
| `0x01` | `INVALID` | IETF — token ถูกเพิกถอนหรือยกเลิก |
| `0x02` | `SUSPENDED` | IETF — token ถูกระงับชั่วคราว |
| `0x03` | `rotated` | **Thai-profile extension** — ต้องกำหนดร่วมกันใน ecosystem และระบุการจัดการเมื่อพบค่านี้ |

ตัวอย่าง: ใช้เฉพาะ `VALID`/`INVALID` รองรับ `bits: 1`; เมื่อรวม `SUSPENDED` ต้องใช้ `bits: 2`; หากใช้ `rotated = 0x03` ด้วยก็ยังใช้ `bits: 2` ได้ ทั้งนี้ `bits: 1` ใช้แทน status `0x02` หรือ `0x03` ไม่ได้

---

## 13.5 ข้อกำหนดการตรวจประเมินที่เกี่ยวกับการเพิกถอน

**[ข้อเท็จจริง]** รายการตรวจสำหรับ Issuer [A-ARCH §8 I7–I9]

| # | ข้อตรวจ | หลักฐาน |
|---|---------|---------|
| I7 | ต้องรองรับ IETF Token Status List (`statuslist+jwt`) | ทดสอบ endpoint |
| I8 | SLA อัปเดต Status List ≤ 15 นาที | เอกสาร SLA |
| I9 | Status List JWT ต้องผ่านการตรวจลายมือชื่อและ key resolution ตาม trust model ที่ Thai profile กำหนด; ตรวจ `exp` หากมี และใช้ `ttl` ตามนโยบาย cache | ตรวจ token |

**[ข้อเท็จจริง]** รายการตรวจสำหรับ Verifier ข้อ V4 กำหนดให้ตรวจ IETF Token Status List JWT ทั้งลายมือชื่อ คลายข้อมูล และ status [A-ARCH §8 V4] การอ่านค่า status ต้องใช้ความกว้าง `bits` ที่ระบุใน JWT ไม่ใช่ตรวจบิตเดี่ยว

**[ช่องว่าง G-03 — มีนัยด้านความมั่นคงปลอดภัย]** ค่าความสดของข้อมูลสามค่าในเอกสารสถาปัตยกรรมยังไม่สอดคล้องกัน Issuer มี SLA อัปเดต Status List ≤ 15 นาที [A-ARCH §8 I8] การเพิกถอนฉุกเฉินต้องแพร่กระจายภายใน 1 ชั่วโมง [A-TM §I3] แต่ `ttl` ที่ให้ Verifier cache คือ 12 ชั่วโมง และ `exp` คือ 24 ชั่วโมง [A-ARCH §ลำดับที่ 3] Verifier ที่ cache ตาม `ttl` จะไม่เห็นการเพิกถอนได้นานถึง 12 ชั่วโมง ทำให้ SLA 15 นาทีและเป้าหมาย 1 ชั่วโมงไม่มีผลจริงแบบ end-to-end โดย TSL กำหนด `exp` และ `ttl` เป็น RECOMMENDED ไม่ใช่ REQUIRED; Thai profile จึงต้องระบุค่าและเพดาน cache ให้สอดคล้องกับเป้าหมายการแพร่กระจาย หรือกำหนดกลไก force refresh สำหรับการเพิกถอนฉุกเฉิน

---

## 13.6 การเพิกถอนผู้ตรวจสอบเอกสาร (verifier) ผ่าน Trusted List

**[ข้อวิเคราะห์]** การเพิกถอนผู้ตรวจสอบเอกสาร (verifier) ดำเนินการผ่านการเปลี่ยนสถานะใน Trusted List เท่านั้น รายงานฉบับนี้ **ไม่ใช้** status list แยกต่างหากสำหรับผู้ตรวจสอบเอกสาร แหล่งข้อมูลอ้างอิงหลักของสถานะการอนุญาตของผู้ตรวจสอบเอกสารคือ Trusted List ของ สพธอ. โครงสร้าง entry และการจัดสถานะตามบทบาทมีรายละเอียดในบทที่ 9

**[ข้อเท็จจริง]** JWT ตัวอย่างจัดองค์กรใน `LoTE.TrustedEntitiesList[]` และจัดบริการใน `TrustedEntityServices[]` โดยชนิดบริการอยู่ที่ `ServiceInformation.ServiceTypeIdentifier` ตัวอย่างยังไม่แสดงฟิลด์สถานะครบทั้งระดับองค์กรและบริการ [research/42](../research/42-trusted-list-lote-jwt-format.md)

**[ข้อกำหนด]** Thai profile ต้องกำหนดฟิลด์สถานะทั้งสองระดับและค่า `active`, `suspended`, `withdrawn` ให้ชัดเจน ผู้ตรวจสอบข้อมูล **ต้อง** ยืนยันสถานะเป็น `active` ทั้งระดับองค์กรและบริการ หากตรวจไม่ได้หรือพบ `suspended` หรือ `withdrawn` **ต้อง** ปฏิเสธ [บทสรุปความสอดคล้องขั้นต่ำ](00-minimal-interoperability-reference.md) [research/42](../research/42-trusted-list-lote-jwt-format.md)

**[ข้อกำหนด]** เมื่อ สพธอ. ระงับผู้ตรวจสอบเอกสาร สถานะบริการ Verifier ตาม Thai profile ต้องเปลี่ยนเป็น `suspended` และเมื่อเพิกถอนถาวรต้องเปลี่ยนเป็น `withdrawn` โดยต้องยื่นลงทะเบียนใหม่ตามนโยบายการลงทะเบียนผู้ตรวจสอบ [A-VRP] [บทสรุปความสอดคล้องขั้นต่ำ](00-minimal-interoperability-reference.md)

**[ข้อวิเคราะห์]** Wallet **MUST** ตรวจสถานะของผู้ตรวจสอบเอกสารใน Trusted List **ก่อน** แสดงหน้าขอความยินยอมทุกครั้ง หากยืนยันสถานะ `active` ไม่ได้ Wallet **MUST** ปฏิเสธหรือเตือนผู้ใช้แล้วหยุดการนำเสนอ เนื่องจากการแสดงหน้าขอความยินยอมของผู้ตรวจสอบเอกสารที่ถูกเพิกถอนแล้วเป็นการเปิดช่อง phishing [A-TM §V6, §V8]

**[ข้อวิเคราะห์]** การเพิกถอนผู้ตรวจสอบเอกสารแบบฉุกเฉิน เช่น กรณีละเมิด PDPA ร้ายแรงหรือกุญแจถูก compromise ใช้การดึง Trusted List ด้วย HTTP `GET` จาก CDN เมื่อ Wallet หรือ Verifier มี connection และกำลังจะตัดสินใจ โดยใช้ `If-None-Match` เพื่อตรวจการเปลี่ยนแปลงและตรวจลายมือชื่อของไฟล์ใหม่ [research/41] ทั้งนี้ ระยะเวลาที่ผู้ตรวจสอบเอกสารและ Wallet เห็นการเพิกถอนขึ้นกับจังหวะการเชื่อมต่อและนโยบาย cache ที่กำหนดใน Trusted List

---

## 13.7 แผนภาพลำดับของการตรวจสถานะและการเพิกถอน

หัวข้อนี้รวมแผนภาพลำดับ (sequence diagram) ของการตรวจสถานะระหว่างการนำเสนอ VP และรูปแบบการเพิกถอนทั้งหมดในระบบ ประกอบด้วย 5 แผนภาพ ได้แก่ (1) การนำเสนอ VP พร้อมการตรวจสถานะ (2) การที่ผู้ออกเอกสารเพิกถอน VC (3) การเพิกถอนผู้ออกเอกสารผ่าน Trusted List (4) การเพิกถอนผู้ตรวจสอบเอกสารผ่าน Trusted List และ (5) การที่ wallet provider เพิกถอน WUA คือ WIA และ KA พร้อมผลต่อเนื่อง (cascade) โดยปิดท้ายด้วยตารางสรุปใน §13.7.6 และ §13.7.7 เพิ่มการวิเคราะห์ผลกระทบเมื่อผู้ออกเอกสารหมุนเวียนกุญแจลงลายมือชื่อ ทั้งนี้ ทุกแผนภาพประกอบจากลำดับที่บันทึกไว้ในเอกสารสถาปัตยกรรมและบทที่เกี่ยวข้อง มิได้สร้างข้อกำหนดใหม่

### 13.7.1 การนำเสนอ VP พร้อมการตรวจสถานะ

**[ข้อวิเคราะห์]** แผนภาพนี้ประกอบจากลำดับที่บันทึกไว้ในเอกสารสถาปัตยกรรม คือ ลำดับการตรวจสถานะ VC [A-ARCH §ลำดับที่ 3] การตรวจสถานะผู้ตรวจสอบเอกสารใน Trusted List (ดู §13.6 และบทที่ 9) และ gate การตรวจตาม defense state machine [A-TM §3.0, §4.0]

**Wallet ตรวจ Verifier ก่อนขอความยินยอม**

```mermaid
sequenceDiagram
    autonumber
    actor U as ผู้ใช้
    participant W as Wallet
    participant V as Verifier (RP)
    participant TL as Trusted List<br/>(ETDA) — แหล่งการอนุญาต

    V->>W: VP Request + Verifier Attestation

    Note over W: ตรวจ Verifier ก่อนเปิดเผยข้อมูล
    W->>W: ตรวจ client_id_scheme กับ SAN ของ TLS cert (V1)
    W->>W: ตรวจ response_uri อยู่ใน SAN เดียวกัน (V4)
    W->>TL: GET Verifier Trusted List ฉบับเต็มจาก CDN
    TL-->>W: JWT พร้อม LoTE.TrustedEntitiesList[]
    W->>W: ตรวจลายมือชื่อ Attestation และ cnf (V2)
    W->>W: ตรวจ iat กับ exp โดย clock skew ไม่เกิน 60 วินาที ห้าม cache (V7)
    W->>W: ตรวจ status ของ Verifier ทั้งระดับองค์กรและระดับบทบาท

    alt status ของ Verifier เป็น suspended หรือ withdrawn
        W-->>U: ปฏิเสธหรือเตือน แล้วหยุด (V8)
    else status ของ Verifier เป็น active
        W->>W: เทียบ claim ที่ขอกับขอบเขตสิทธิ์ตาม Thai profile (V3)
        W-->>U: แสดงชื่อและ logo จาก TL เพื่อขอความยินยอม (V6)
        U-->>W: ให้ความยินยอม
        W->>W: WSCD ปล่อยกุญแจ Level 3 แล้วลงลายมือชื่อ KB-JWT ด้วย ES256
        W->>V: vp_token + KB-JWT
    end
```

**Verifier ตรวจ Issuer และสถานะ VC**

```mermaid
sequenceDiagram
    autonumber
    actor U as ผู้ใช้
    participant V as Verifier (RP)
    participant TL as Trusted List<br/>(ETDA) — แหล่งการอนุญาต
    participant UR as Universal Resolver<br/>resolve custom DID เท่านั้น
    participant VSL as VC Status List<br/>ของ Issuer

    Note over V: ตรวจฝ่าย Issuer และสถานะ VC
    V->>TL: GET Issuer Trusted List JWT ฉบับเต็มจาก CDN
    TL-->>V: JWT พร้อม LoTE.TrustedEntitiesList[]
    V->>V: ตรวจลายมือชื่อและบริการ Issuer ตาม Thai profile
    V->>UR: resolve DID ของ Issuer เฉพาะ custom DID (เช่น did:ndid)
    UR-->>V: didDocument
    V->>V: ตรวจลายมือชื่อ VC ด้วยกุญแจที่ผูกกับ TL (I7)
    V->>V: ตรวจช่วงเวลากุญแจตาม Thai profile และปฏิเสธหากไม่มีข้อมูล
    V->>V: ตรวจ KB-JWT กับ nonce และ aud ที่ต้องเป็น client_id ของตน (V5)
    V->>VSL: GET status URI ที่ตรวจผูกกับ Issuer ตาม Thai profile (I6)
    VSL-->>V: statuslist+jwt พร้อม typ กับ exp และ ttl
    V->>V: ตรวจลายมือชื่อ แล้ว base64url-decode และคลาย ZLIB
    V->>V: อ่าน status slot ที่ idx ตามความกว้าง `bits`

    alt สถานะเป็น Valid (0)
        V-->>U: ยอมรับตามนโยบาย
    else สถานะเป็น Invalid หรือ Suspended หรือ rotated
        V-->>U: ปฏิเสธ พร้อมรหัสเหตุผลที่ไม่เปิดเผยข้อมูลส่วนบุคคล
    end
```

**[ข้อวิเคราะห์]** จุดสำคัญสามข้อที่แผนภาพบังคับไว้

1. Wallet **MUST** ตรวจสถานะของ Verifier ใน Trusted List **ก่อน** แสดงหน้าขอความยินยอม เพื่อป้องกันการแสดงคำขอของ Verifier ที่ถูกเพิกถอนแล้ว [A-TM §V6, §V8]
2. Verifier **MUST** ตรวจว่า URI ใน `status` claim ของ VC อยู่ในแหล่งที่อนุญาตตาม Thai profile เพื่อกัน status endpoint takeover [A-TM §I6] ทั้งนี้ [JWT ตัวอย่างแบบ LoTE](../research/42-trusted-list-lote-jwt-format.md) ยังไม่แสดงฟิลด์ status URI จึงต้องกำหนดเส้นทางข้อมูลก่อนใช้เกณฑ์นี้
3. การตรวจลายมือชื่อ **MUST** เกิดก่อนการคลาย ZLIB ทุกครั้ง เพราะการคลายข้อมูลที่ยังไม่ผ่านการตรวจลายมือชื่อคือการประมวลผลข้อมูลที่ผู้โจมตีควบคุมได้

### 13.7.2 การที่ผู้ออกเอกสารเพิกถอน VC

**[ข้อวิเคราะห์]** ผู้ออกเอกสาร (issuer) เปลี่ยนค่า status ในรายการ IETF Token Status List ของตนเองเพื่อระบุสถานะเอกสารรับรอง (VC) ตามรูปแบบและขั้นตอนที่กำหนดไว้ใน §13.2–§13.4 [A-ARCH §2, §3; A-KD08 §9] แผนภาพนี้แสดงทั้งการกระทำเพิกถอนและการที่ผู้ตรวจสอบเอกสาร (verifier) รับรู้สถานะนั้นในการนำเสนอ VP ครั้งถัดไป

```mermaid
sequenceDiagram
    autonumber
    participant EV as เหตุการณ์<br/>(ผู้ถือร้องขอ / ข้อมูลเปลี่ยน / key รั่ว / cascade จาก WUA)
    participant ISS as ผู้ออกเอกสาร (Issuer)
    participant VSL as VC Token Status List<br/>ของ Issuer
    participant V as ผู้ตรวจสอบเอกสาร (Verifier)

    EV->>ISS: มีเหตุต้องเพิกถอน VC
    ISS->>ISS: หาตำแหน่ง idx ของ VC ในรายการสถานะของตน
    ISS->>VSL: เขียนค่า status ที่ idx เป็น 0x01 (INVALID), 0x02 (SUSPENDED) หรือ 0x03 (Thai-profile `rotated`)
    ISS->>VSL: ลงลายมือชื่อและเผยแพร่ statuslist+jwt ฉบับใหม่ โดย `bits` ต้องเพียงพอแทนทุกค่าที่ใช้ (SLA ≤ 15 นาที)
    Note over ISS,VSL: กรณีฉุกเฉินต้องแพร่กระจายภายใน 1 ชั่วโมง
    V->>VSL: GET status URI ที่ตรวจผูกกับ Issuer ตาม Thai profile (ตอนตรวจ VP ครั้งถัดไป)
    VSL-->>V: statuslist+jwt พร้อม exp และ ttl
    V->>V: ตรวจลายมือชื่อ แล้ว base64url-decode และคลาย ZLIB
    V->>V: อ่าน status slot ที่ idx ตามความกว้าง `bits`
    alt status = 0x00 (VALID)
        V-->>V: ยอมรับต่อเมื่อ Referenced Token ผ่าน validation และผ่านนโยบายอื่น
    else status = 0x01 (INVALID) หรือ 0x02 (SUSPENDED) หรือ 0x03 (Thai-profile `rotated`)
        V-->>V: ปฏิเสธตามนโยบาย status ที่ประกาศไว้
    else status ไม่รู้จัก / ใช้ร่วมกันไม่ได้
        V-->>V: ปฏิเสธแบบ fail-closed
    end
```

**[ข้อวิเคราะห์]** อำนาจการเพิกถอน VC เป็นของผู้ออกเอกสารที่ออก VC นั้นเท่านั้น ผู้ตรวจสอบเอกสารรับรู้การเพิกถอนได้เร็วเพียงใดขึ้นกับค่า cache TTL ของรายการสถานะ ซึ่งเป็นช่องว่าง G-03 ที่บันทึกไว้ใน §13.5 ผู้ตรวจสอบเอกสารที่ cache ตาม `ttl` อาจไม่เห็นการเพิกถอนได้นานถึง 12 ชั่วโมง จึง **ควร** มีกลไก force refresh สำหรับการเพิกถอนฉุกเฉิน

### 13.7.3 การเพิกถอนผู้ออกเอกสารผ่าน Trusted List

**[ข้อวิเคราะห์]** การเพิกถอนผู้ออกเอกสาร (issuer) ทั้งรายอยู่ในอำนาจของสำนักงานพัฒนาธุรกรรมทางอิเล็กทรอนิกส์ (สพธอ.) ในฐานะผู้ดูแล Trusted List สพธอ. เปลี่ยนสถานะของผู้ออกเอกสารใน Trusted List เป็น `suspended` หรือ `withdrawn` [A-ARCH §6] แล้วเผยแพร่ไฟล์ที่ลงลายมือชื่อผ่าน CDN ผู้ตรวจสอบเอกสารเรียก `GET` พร้อม `If-None-Match` เมื่อรับ VP และก่อนตัดสินใจ [research/41]

```mermaid
sequenceDiagram
    autonumber
    participant ETDA as สพธอ.<br/>(ผู้ดูแล Trusted List)
    participant TL as Trusted List<br/>(CDN)
    participant V as ผู้ตรวจสอบเอกสาร (Verifier)

    ETDA->>ETDA: พบเหตุร้ายแรง (key รั่ว / ประเมินไม่ผ่าน / ละเมิดนโยบาย)
    ETDA->>TL: เปลี่ยนสถานะบริการ Issuer ใน TrustedEntityServices[]
    Note over V: ตอนรับ VP ครั้งถัดไป
    V->>TL: GET https://trustme.etda.or.th/.well-known/iss.txt<br/>If-None-Match: ETag เดิม
    TL-->>V: 304 หรือ 200 + Trusted List ที่เกี่ยวข้องฉบับเต็ม
    V->>V: ตรวจ JWT signature, LoTESequenceNumber และ NextUpdate
    V->>TL: ค้นหาบริการ Issuer ใน TrustedEntitiesList[]
    TL-->>V: status ของ Issuer
    alt status ของ Issuer = active
        V->>V: ตรวจ VC และสถานะราย VC ตามปกติ (ดู §13.7.1)
    else status ของ Issuer ≠ active
        V-->>V: ปฏิเสธ VC ทุกใบของ Issuer นั้น โดยไม่ต้องอ่านสถานะราย VC
    end
```

**[ข้อวิเคราะห์]** เมื่อผู้ออกเอกสารถูกเพิกถอนใน Trusted List VC ทุกใบที่ผู้ออกเอกสารนั้นเคยออกจะใช้ไม่ได้ในการตรวจสอบ โดยไม่จำเป็นต้องเปลี่ยนค่า status ในรายการสถานะราย VC เนื่องจากแหล่งข้อมูลอ้างอิงหลักของสถานะการอนุญาตของผู้ออกเอกสารคือ Trusted List หากยืนยันสถานะ `active` ไม่ได้ ผู้ตรวจสอบเอกสาร **ต้อง** ปฏิเสธ VC นั้น [A-ARCH §6, §8] การเพิกถอนผู้ออกเอกสารจึงมีผลต่อ VC ทุกใบของผู้ออกเอกสารรายนั้น

### 13.7.4 การเพิกถอนผู้ตรวจสอบเอกสารผ่าน Trusted List

**[ข้อวิเคราะห์]** การเพิกถอนผู้ตรวจสอบเอกสาร (verifier) ดำเนินการผ่าน Trusted List เท่านั้น ตาม §13.6 ผู้มีอำนาจคือ สพธอ. จุดสำคัญคือ กระเป๋าเอกสารดิจิทัล (wallet) **ต้อง** ตรวจสถานะของผู้ตรวจสอบเอกสาร **ก่อน** แสดงหน้าขอความยินยอมทุกครั้ง เพราะการแสดงหน้าขอความยินยอมของผู้ตรวจสอบเอกสารที่ถูกเพิกถอนแล้วเป็นการเปิดช่อง phishing [A-TM §V6, §V8]

```mermaid
sequenceDiagram
    autonumber
    actor U as ผู้ใช้
    participant ETDA as สพธอ.<br/>(ผู้ดูแล Trusted List)
    participant TL as Trusted List<br/>(CDN)
    participant W as Wallet

    ETDA->>ETDA: พบเหตุ (ละเมิด PDPA ร้ายแรง / key รั่ว)
    ETDA->>TL: เปลี่ยนสถานะบริการ Verifier ใน TrustedEntityServices[]
    Note over W: ตอนได้รับ VP Request ครั้งถัดไป
    W->>TL: GET https://trustme.etda.or.th/.well-known/ver.txt<br/>If-None-Match: ETag เดิม
    TL-->>W: 304 หรือ 200 + Trusted List ที่เกี่ยวข้องฉบับเต็ม
    W->>W: ตรวจ JWT signature, LoTESequenceNumber และ NextUpdate
    W->>TL: ค้นหาบริการ Verifier ใน TrustedEntitiesList[]
    TL-->>W: status ของ Verifier
    alt status = active
        W-->>U: แสดงชื่อและ logo จาก TL เพื่อขอความยินยอม
    else status ≠ active
        W-->>U: ปฏิเสธหรือเตือน แล้วหยุดการนำเสนอ (กัน phishing)
    end
```

**[ข้อวิเคราะห์]** ระยะเวลาที่ Wallet เห็นการเพิกถอนขึ้นกับจังหวะที่ได้รับ VP Request และผลการตรวจ `GET` จาก CDN ในครั้งนั้น ระบบไม่ใช้ message broker หรือ background polling การตรวจจึงเกิดตรงจุดที่ Wallet ต้องตัดสินใจว่าจะขอความยินยอมจากผู้ใช้หรือไม่ [research/41]

### 13.7.5 การที่ wallet provider เพิกถอน WUA คือ WIA และ KA พร้อมผลต่อเนื่อง

**[ข้อวิเคราะห์]** WUA เป็นคำรวม (umbrella term) ประกอบด้วย Wallet Instance Attestation (WIA) และ Key Attestation (KA) การเพิกถอนและสถานะของทั้งสองประเภทเป็นไปตาม EUDI คือใช้ IETF Token Status List ที่ wallet provider เผยแพร่ ผ่าน field `client_status` (WIA) และ `key_storage_status` (KA) รายละเอียดอยู่ใน [บทที่ 10 §10.5](10-wallet-unit-attestation.md) แผนภาพนี้แสดง 3 ผลต่อเนื่อง (chain) ที่เกิดขึ้นเมื่อ wallet provider เพิกถอน WUA

```mermaid
sequenceDiagram
    autonumber
    participant EV as เหตุการณ์<br/>(อุปกรณ์สูญหาย / key รั่ว / WSCD ถูก compromise)
    participant WP as Wallet Provider
    participant WSL as WUA Token Status List<br/>client_status (WIA) / key_storage_status (KA)
    participant ISS as ผู้ออกเอกสาร (Issuer)
    participant VSL as VC Token Status List<br/>ของ Issuer
    participant V as ผู้ตรวจสอบเอกสาร (Verifier)

    EV->>WP: มีเหตุต้องเพิกถอน WUA
    alt เพิกถอน WIA (wallet instance ถูก compromise)
        WP->>WSL: ปรับค่า status ในรายการ client_status ของ WIA
    else เพิกถอน KA (WSCD หรือกุญแจถูก compromise)
        WP->>WSL: ปรับค่า status ในรายการ key_storage_status ของ KA
        Note over WP,WSL: KA แบบ type-shared: 1 index ครอบทุก wallet unit ของ WSCD ประเภทนั้น
    end
    Note over ISS: chain 1 — Issuer ติดตามสถานะ WIA/KA ที่เคยตรวจไว้เป็นระยะ เช่น รายวัน
    ISS->>WSL: ตรวจสถานะ WIA/KA ของ wallet unit ที่เคยออกเอกสารให้
    WSL-->>ISS: revoked
    Note over ISS,VSL: chain 2 — Issuer ต้องเพิกถอน VC ที่ผูกกับ wallet unit นั้น (CIR 2024/2977 Art. 5(4)(b))
    ISS->>VSL: ตั้งค่า status ของ VC ที่ผูกไว้เป็น 0x01 (INVALID) ในรายการสถานะของตน
    Note over V: chain 3 — Verifier ไม่อ่านสถานะ WUA โดยตรง (RP เห็นเฉพาะ Use Case 1)
    V->>VSL: GET status uri ตอนตรวจ VP
    VSL-->>V: statuslist+jwt
    V->>V: อ่าน status slot ตาม bits และ idx แล้วปฏิเสธ VC ที่ผูกกับ wallet unit ที่ถูกเพิกถอน
```

**[ข้อวิเคราะห์]** แผนภาพนี้ตอบคำถามหลักสองข้อ

1. **ผู้ออกเอกสารต้องเพิกถอน VC ที่ผูกกับ WUA หรือไม่** — **ต้อง** เมื่อ wallet provider เพิกถอน WIA หรือ KA ผู้ออกเอกสารที่เคยออก VC ให้ wallet unit นั้น **ต้อง** เพิกถอน VC ที่ผูกไว้ผ่าน IETF Token Status List **ของผู้ออกเอกสารเอง** ตาม CIR 2024/2977 Art. 5(4)(b) [บทที่ 10 §10.5.3](10-wallet-unit-attestation.md) รายการสถานะของ WUA ใช้กับ wallet instance และกุญแจ ส่วนรายการสถานะของผู้ออกเอกสารใช้กับ VC ที่ผูกกับ wallet unit นั้น จึงเป็นคนละรายการกัน
2. **ผู้ตรวจสอบเอกสารรับรู้ได้อย่างไร** — ผู้ตรวจสอบเอกสารได้รับ WUA เฉพาะรูปแบบยืนยันตัวตน (Use Case 1) และรับรู้ผลของการเพิกถอน WUA **โดยอ้อม** ผ่านรายการสถานะ VC ของผู้ออกเอกสาร (chain 3) ผู้ออกเอกสารตรวจสถานะ WUA โดยตรงในกระแสงาน OID4VCI ตาม [บทที่ 10 §10.3.1](10-wallet-unit-attestation.md)

_ข้อสังเกต:_ กรณี KA แบบ type-shared การเพิกถอน 1 index มีผลต่อ wallet unit ทุกหน่วยที่ใช้ WSCD ประเภทเดียวกัน ผู้ออกเอกสารจึงต้องเพิกถอน VC ทุกใบที่ผูกกับ WSCD ประเภทนั้น ผลต่อเนื่องจึงกว้างกว่าการเพิกถอน WIA รายหน่วยมาก

### 13.7.6 ตารางสรุปรูปแบบการเพิกถอน

**[ข้อวิเคราะห์]** ตารางต่อไปนี้สรุปรูปแบบการเพิกถอนและการหมุนเวียนกุญแจทั้ง 6 แบบใน §13.7.2–§13.7.7 ว่าใครมีอำนาจ ใช้กลไกใด ใครต้องรับรู้ และรับรู้ได้อย่างไร

| รูปแบบการเพิกถอน / การหมุนเวียนกุญแจ | ผู้มีอำนาจ | กลไก / รายการสถานะ | ผู้ที่ต้องรับรู้ และรับรู้ได้อย่างไร | เวลาเป้าหมาย / ช่องว่าง |
|---|---|---|---|---|
| เพิกถอน VC (§13.7.2) | ผู้ออกเอกสารที่ออก VC นั้น | VC Token Status List ของผู้ออกเอกสาร | ผู้ตรวจสอบเอกสารอ่านค่า status ตอนตรวจ VP | SLA ≤ 15 นาที (ฉุกเฉิน ≤ 1 ชั่วโมง) จำกัดด้วย cache TTL — ช่องว่าง G-03 |
| เพิกถอนผู้ออกเอกสาร (§13.7.3) | สพธอ. | สถานะใน Trusted List (`suspended`/`withdrawn`) | ผู้ตรวจสอบเอกสารเรียก `GET` จาก CDN ตอนรับ VP และตรวจลายมือชื่อ | ตรวจ ณ จุดตัดสินใจ; ปฏิเสธหากยืนยันสถานะ `active` ไม่ได้ [research/41] |
| เพิกถอนผู้ตรวจสอบเอกสาร (§13.7.4) | สพธอ. | สถานะใน Trusted List (`suspended`/`withdrawn`) | กระเป๋าเอกสารดิจิทัลเรียก `GET` จาก CDN **ก่อน** แสดงหน้าขอความยินยอม | ตรวจ ณ จุดตัดสินใจ; กัน phishing [A-TM §V6, §V8] |
| เพิกถอน WIA (§13.7.5) | wallet provider ที่ออก WIA | `client_status` list ของ wallet provider | ผู้ออกเอกสาร อ่านตอน OID4VCI และ poll เป็นระยะ → cascade เพิกถอน VC → ผู้ตรวจสอบเอกสารรับรู้ผ่านสถานะ VC | poll เป็นระยะ เช่น รายวัน + SLA ของ VC status |
| เพิกถอน KA (§13.7.5) | wallet provider ที่ออก KA | `key_storage_status` list (รายหน่วย หรือ type-shared) | เหมือน WIA; หาก type-shared จะ cascade ครอบ WSCD ทั้งประเภท | poll เป็นระยะ เช่น รายวัน + SLA ของ VC status |
| หมุนเวียนกุญแจลงลายมือชื่อของผู้ออกเอกสาร (§13.7.7) | ผู้ออกเอกสารเอง (T0–T3) | (ก) DID Document `assertionMethod` (ข) ข้อมูลกุญแจใน `ServiceInformation.ServiceDigitalIdentity` ของ Trusted List; การกำหนดช่วงเวลาต่อกุญแจยังต้องระบุใน Thai profile [research/42](../research/42-trusted-list-lote-jwt-format.md) (ค) Campaign Manifest ผ่าน `/.well-known/reissue-campaigns/{id}` (ง) VC Token Status List ค่า status `0x03` = `rotated` ตาม Thai-profile extension | กระเป๋าเอกสารดิจิทัลรับรู้ผ่าน push/pull ตาม Campaign Protocol | ขึ้นกับ trigger และนโยบายการเผยแพร่ |

**[ข้อวิเคราะห์]** จุดที่ผู้พัฒนาต้องไม่สับสน คือ การเพิกถอนสามระดับใช้รายการสถานะคนละชุดกัน ได้แก่ (1) รายการสถานะ VC ของผู้ออกเอกสาร (2) รายการสถานะ WUA ของ wallet provider ผ่าน `client_status` และ `key_storage_status` และ (3) Trusted List ของ สพธอ. สำหรับสถานะการอนุญาตของผู้ออกเอกสารและผู้ตรวจสอบเอกสาร แม้ (1) และ (2) ใช้รูปแบบ IETF Token Status List เหมือนกัน แต่เป็นคนละรายการ มีผู้เผยแพร่และวัตถุประสงค์ต่างกัน ตาม §13.7.5 และ [บทที่ 10 §10.5.3](10-wallet-unit-attestation.md)

### 13.7.7 ผลกระทบเมื่อผู้ออกเอกสารหมุนเวียนกุญแจลงลายมือชื่อ (Issuer Key Rotation)

หัวข้อนี้ตอบคำถามเชิงกำกับดูแลสามข้อเกี่ยวกับการหมุนเวียนกุญแจลงลายมือชื่อของผู้ออกเอกสาร ได้แก่ (1) ผลกระทบต่อเอกสารรับรอง (VC) เดิมที่ลงลายมือชื่อด้วยกุญแจรุ่นก่อน (2) กลไกที่กระเป๋าเอกสารดิจิทัล (wallet unit) ใช้รับรู้ว่ากุญแจถูกหมุนเวียน (3) ความจำเป็นในการออก VC ใหม่ ทั้งนี้ หัวข้อนี้ประกอบจากข้อกำหนดในเอกสารสถาปัตยกรรม [A-KD08 §1–§9], [A-TM §I3, §I7] และงานวิจัยภายใน [research/07], [research/07-1] มิได้สร้างข้อกำหนดใหม่ที่ไม่มีฐานในเอกสารต้นทาง

#### 13.7.7.1 สถานะของกุญแจลงลายมือชื่อผู้ออกเอกสาร 4 สถานะ

**[ข้อเท็จจริง]** วงจรชีวิตของกุญแจลงลายมือชื่อของผู้ออกเอกสารแบ่งเป็น 4 สถานะ ดังนี้ [research/07 §สถานะของกุญแจผู้ออก]

| สถานะ | ลงลายมือชื่อ VC ใหม่ | ตรวจ VC เก่า | อยู่ใน DID Document |
|-------|:---:|:---:|:---:|
| **Created** | ❌ | ❌ | ✅ (กำหนดวันเริ่มใช้ในอนาคต) |
| **Active** | ✅ | ✅ | ✅ (`authentication` + `assertionMethod`) |
| **Inactive** | ❌ | ✅ | ✅ (`assertionMethod` เท่านั้น) |
| **Decommissioned** | ❌ | ❌ | ❌ (ลบ + ทำลายกุญแจลับ) |

**[ข้อวิเคราะห์]** กฎสำคัญคือ กุญแจเดิมต้องอยู่ใน `assertionMethod` จนกว่า VC ทั้งหมดที่ลงลายมือชื่อด้วยกุญแจนั้นจะหมดอายุ การลบกุญแจออกจาก DID Document ก่อนกำหนดจะทำให้ VC ที่ออกด้วยกุญแจนั้นตรวจสอบไม่ได้อีกต่อไป ทั้งนี้ ต้องเสริมด้วยข้อจำกัดของ W3C DID Core ที่ไม่มีช่องบอกสถานะรายกุญแจ สถานะ `Inactive` และ `Created` จึงเป็นวินัยฝั่งผู้ออกเอกสาร ผู้ตรวจสอบเอกสารตรวจข้อนี้โดยตรงไม่ได้ จึงต้องพึ่ง Trusted List ของ สพธอ. เป็นกลไกยืนยันภายนอกตามที่ §13.7.7.3 อธิบาย

#### 13.7.7.2 รูปแบบการหมุนเวียนกุญแจ 4 รูปแบบ (T0–T3)

**[ข้อเท็จจริง]** การหมุนเวียนกุญแจลงลายมือชื่อของผู้ออกเอกสารจำแนกเป็น 4 รูปแบบตาม trigger และความรุนแรง [A-KD08 §1], [research/07-1 §2] ดังนี้

| Trigger | ความรุนแรง | SLA แจ้งเตือน | Grace Period | VC เก่าใช้ได้หรือไม่ |
|---------|:---------:|:-------------:|:------------:|:---------------------:|
| **T0 — Scheduled Rotation** (รายปี ตามนโยบาย [A-KD08 §1]) | 🟢 ปกติ | ไม่ต้องแจ้ง | ไม่กำหนด (จนกว่า VCs จะหมดอายุ) | ✅ ใช้ได้ตราบเท่าที่กุญแจเดิมยังอยู่ใน `assertionMethod` |
| **T1 — Key Compromise** ([A-KD08 §1], [A-TM §I3]) | 🔴 ฉุกเฉิน | ≤ 15 นาที (push) | 0 (ทันที) | ❌ ต้องปฏิเสธเมื่อยืนยันสถานะกุญแจเดิมไม่ได้ตาม Thai profile [research/42](../research/42-trusted-list-lote-jwt-format.md) |
| **T2 — Early Decommissioning** (compliance / ยุติใช้ก่อน VCs หมดอายุ) | 🟡 เร่งด่วน | ≥ 90 วันล่วงหน้า | ≥ 90 วัน | ✅ ใช้ได้จนถึง `deadline` |
| **T3 — Coordinated Migration** (algorithm upgrade เช่น `ES256 → EdDSA`) | 🟢 ปกติ | ≥ 30 วันล่วงหน้า | ≥ 30 วัน | ✅ ใช้ได้จนถึง `deadline` |

**[ข้อวิเคราะห์]** ข้อแตกต่างสำคัญระหว่าง T0 กับ T1–T3 คือ T0 เป็นการหมุนเวียนแบบโปร่งใส (transparent) เนื่องจากกุญแจเดิมยังอยู่ใน `assertionMethod` ผู้ตรวจสอบเอกสารยังตรวจ VC เก่าได้ จึงไม่ต้องมีกลไกแจ้ง wallet ส่วน T1–T3 เป็นการหมุนเวียนที่มี deadline หรือเป็นเหตุฉุกเฉิน จำเป็นต้องมีกลไกแจ้ง wallet เพื่อให้ผู้ใช้ออก VC ใหม่ก่อนกุญแจเดิมถูกถอนออกจาก DID Document ตามแนวทาง Campaign Protocol ใน [research/07-1]

#### 13.7.7.3 กลไกที่กระเป๋าเอกสารดิจิทัลใช้รับรู้การหมุนเวียนกุญแจ

**[ข้อวิเคราะห์]** กระเป๋าเอกสารดิจิทัล (wallet unit) อาจรับรู้การหมุนเวียนกุญแจของผู้ออกเอกสารผ่าน 4 ช่องทางตามสถาปัตยกรรมที่เสนอ ทั้งนี้ JWT ตัวอย่างใน [research/42](../research/42-trusted-list-lote-jwt-format.md) ยังไม่แสดงช่วงเวลาที่มีผลของกุญแจแต่ละรุ่นใน Trusted List

| ช่องทาง | สารที่ส่ง | ใช้กับ Trigger | ผู้เผยแพร่ |
|--------|----------|:---------------:|------------|
| (1) DID Document `assertionMethod` | กุญแจเดิมยังอยู่ใน `assertionMethod` หรือถูกถอนออก | T0 (มีอยู่) / T1–T3 (ถูกถอนเมื่อถึง deadline) | ผู้ออกเอกสาร |
| (2) Trusted List `ServiceInformation.ServiceDigitalIdentity` | กุญแจสาธารณะหรือ DID; ช่วงเวลาต่อกุญแจต้องกำหนดเพิ่มใน Thai profile | ทุก trigger เมื่อ profile รองรับ | สพธอ. |
| (3) Reissue Campaign Manifest ผ่าน `/.well-known/reissue-campaigns/{id}` | campaign id, `affected_kid`, `trigger`, `severity`, `deadline` | T1–T3 | ผู้ออกเอกสาร |
| (4) VC Token Status List ค่า status `0x03` = `rotated` (Thai-profile extension) | ระบุว่า VC ถูกแทนด้วยใบใหม่แล้ว | T1–T3 (หลังออกใบใหม่) | ผู้ออกเอกสาร |

**[ข้อกำหนด]** กระเป๋าเอกสารดิจิทัลต้องตรวจข้อมูลกุญแจของ Issuer ใน Trusted List และตรวจช่วงเวลาต่อกุญแจเมื่อ Thai profile ประกาศฟิลด์ดังกล่าว หากไม่มีข้อมูลเพียงพอที่จะยืนยันว่ากุญแจมีผลในเวลาที่ VC ถูกลงลายมือชื่อ ต้องปฏิเสธการใช้ VC นั้น การมีชื่อกุญแจใน DID Document เพียงอย่างเดียวไม่ยืนยันสถานะการอนุญาต [research/42](../research/42-trusted-list-lote-jwt-format.md) [บทสรุปความสอดคล้องขั้นต่ำ](00-minimal-interoperability-reference.md)

**[ข้อวิเคราะห์]** ช่องทาง (3) เป็นกลไกเฉพาะของ T1–T3 ที่ช่วยให้กระเป๋าเอกสารดิจิทัลรับรู้ล่วงหน้าก่อน deadline และกระตุ้นให้ผู้ใช้ออก VC ใหม่ กลไกนี้ใช้ dual-channel คือ push ผ่าน wallet provider (APN/FCM) สำหรับ T1 ที่ต้องการความเร็ว และ pull ผ่านการเรียก `GET /.well-known/reissue-campaigns/active` เป็นระยะตาม TTL เป็น safety net [research/07-1 §3] ทั้งนี้ Campaign Manifest ต้องลงลายมือชื่อด้วย **กุญแจใหม่** เพื่อกันผู้โจมตีที่ครอบครองกุญแจเดิมปลอม campaign ยกเลิกเหตุฉุกเฉิน [research/07-1 §4.3]

#### 13.7.7.4 ผลกระทบต่อ VC เดิม และความจำเป็นในการออก VC ใหม่

**[ข้อเท็จจริง]** ผลกระทบต่อ VC เดิมที่ลงลายมือชื่อด้วยกุญแจรุ่นก่อนหน้า (`key-1`) จำแนกตาม trigger ดังนี้ [A-KD08 §8], [research/07], [research/07-1]

| Trigger | VC เดิม (`key-1`) ตรวจสอบได้หรือไม่ | ค่า status ใน Status List | ต้องออก VC ใหม่หรือไม่ |
|---------|:----------------------------------:|:-----------------:|:------------------------:|
| **T0 — Scheduled Rotation** | ✅ ใช้ได้ตราบเท่าที่ `key-1` อยู่ใน `assertionMethod` และ VC ยังไม่หมดอายุ | คงค่า `0` (Valid) | ❓ ไม่บังคับ แต่แนะนำให้ reissue ตามรอบหมุนเวียนประจำปี เพื่อลดหน้าต่างความเสี่ยงจาก compromise [A-KD08 §10] |
| **T1 — Key Compromise** | ❌ ต้องปฏิเสธเมื่อยืนยันสถานะกุญแจเดิมจาก Thai profile ไม่ได้; JWT ตัวอย่างยังไม่มีช่วงเวลาต่อกุญแจ [research/42](../research/42-trusted-list-lote-jwt-format.md) | เปลี่ยนเป็น status `0x03` (`rotated` ตาม Thai-profile extension) ทันทีที่ออก VC ใหม่ | ✅ **บังคับ** ต้องออก VC ใหม่ผูกกับ `key-2` และ mark VC เดิมเป็น `rotated` ตามนโยบายกำกับดูแล |
| **T2 — Early Decommissioning** | ✅ ใช้ได้จนถึง `deadline` ที่กำหนด | คงค่า `0` (Valid) จนกว่าจะถึง `deadline` | ✅ **บังคับ** ต้องออก VC ใหม่ภายใน grace period (≥ 90 วัน) หากต้องการให้ VC ยังใช้งานได้หลัง `deadline` |
| **T3 — Coordinated Migration** | ✅ ใช้ได้จนถึง `deadline` ที่กำหนด | คงค่า `0` (Valid) จนกว่าจะถึง `deadline` | ✅ **แนะนำ** ให้ออก VC ใหม่ภายใน grace period (≥ 30 วัน) เพื่อให้ผู้ใช้พร้อมใช้อัลกอริทึมใหม่ก่อนกุญแจเดิมถูกถอน |

**[ข้อวิเคราะห์]** หลักการตอบคำถาม "ต้องออก VC ใหม่หรือไม่" มีสามประเด็น

1. **T0 Scheduled Rotation** — เป็นทางเลือก ไม่บังคับ เพราะ VC เดิมยังตรวจสอบได้ตราบเท่าที่กุญแจเดิมอยู่ใน `assertionMethod` และ VC ยังไม่หมดอายุ ผู้ออกเอกสาร **SHOULD** กำหนดนโยบายหมุนเวียนประจำปีควบคู่กับ reissue เพื่อลดหน้าต่างความเสี่ยง แต่ไม่จำเป็นต้องออก VC ใหม่ให้ผู้ถือทุกรายทันที [A-KD08 §10]
2. **T1 Key Compromise** — ผู้ออกเอกสาร **MUST** ออก VC ใหม่ให้ผู้ถือที่ได้รับผลกระทบ และ **MUST** mark VC เดิมเป็น status `0x03` (`rotated` ตาม Thai-profile extension) ใน Status List ของตน การตรวจ Trusted List ต้องปฏิเสธกุญแจที่ยืนยันสถานะหรือช่วงเวลาที่มีผลไม่ได้ โดย Thai profile ยังต้องกำหนดฟิลด์ช่วงเวลาต่อกุญแจตาม [research/42](../research/42-trusted-list-lote-jwt-format.md) ขั้นตอน mark VC เดิมเป็น `rotated` **MUST** สำเร็จก่อนลบ key handle เดิม [A-KD08 §3]
3. **T2/T3 Planned Scenarios** — เป็นข้อบังคับในเชิงเวลา ผู้ออกเอกสาร **MUST** แจ้ง campaign ล่วงหน้าตาม grace period ที่กำหนด (≥ 90 วัน สำหรับ T2, ≥ 30 วัน สำหรับ T3) กระเป๋าเอกสารดิจิทัล **MUST** แสดง notification ให้ผู้ใช้ทราบตาม milestone (30d / 7d / 1d / deadline) หากผู้ใช้ไม่ดำเนินการภายใน deadline กระเป๋าเอกสารดิจิทัล **MUST** บล็อกการนำเสนอ VC ที่ลงลายมือชื่อด้วยกุญแจรุ่นเก่าที่ถูกถอนออกจาก `assertionMethod` แล้ว

**[ข้อวิเคราะห์]** กระเป๋าเอกสารดิจิทัล **MUST NOT** ลบ VC เดิมก่อนได้รับ VC ใหม่ที่ลงลายมือชื่อด้วยกุญแจรุ่นใหม่ เพราะหาก reissue ล้มเหลว (เช่น issuer down) ผู้ใช้จะไม่มีหลักฐานในกระเป๋าฯ เลย ทั้งนี้ กระเป๋าเอกสารดิจิทัล **SHOULD** เก็บ VC เดิมไว้ในสถานะ "superseded" เป็นเวลาอย่างน้อย 30 วันหลัง reissue สำเร็จ เพื่อใช้อ้างอิงย้อนหลังหากผู้ตรวจสอบเอกสารยังไม่ได้รับ Trusted List ฉบับใหม่

#### 13.7.7.5 แผนภาพลำดับการหมุนเวียนกุญแจ T1 (Key Compromise)

**[ข้อวิเคราะห์]** แผนภาพนี้แสดงกระแสงานเต็มเมื่อกุญแจลงลายมือชื่อของผู้ออกเอกสารถูก compromise (T1) ครอบคลุม (1) การ push campaign จาก issuer ผ่าน wallet provider (2) การ pull campaign manifest โดย wallet (3) การ reissue ผ่าน OID4VCI (4) การ mark VC เดิมเป็น `rotated` และ (5) การอัปเดต Trusted List โดย สพธอ.

```mermaid
sequenceDiagram
    autonumber
    participant EV as เหตุการณ์<br/>กุญแจถูก compromise
    participant ISS as ผู้ออกเอกสาร
    participant VSL as VC Token Status List<br/>ของผู้ออกเอกสาร
    participant WP as Wallet Provider<br/>(APN/FCM)
    participant W as Wallet Unit
    actor U as ผู้ใช้
    participant ETDA as สพธอ.<br/>ผู้ดูแล Trusted List
    participant TL as Trusted List<br/>(ข้อมูลกุญแจตาม Thai profile)

    EV->>ISS: T1 กุญแจ key-1 ถูก compromise (SLA ≤ 15 นาที)
    ISS->>ISS: mark key-1 = COMPROMISED<br/>สร้าง Campaign Manifest JWS<br/>(signed by key-2 ใหม่)
    ISS->>WP: POST /notify/reissue-campaign<br/>(Campaign Manifest JWS)
    WP->>W: Push notification (silent)
    Note over W: ถ้า push ล้มเหลว → poll<br/>GET /.well-known/reissue-campaigns/active<br/>ทุก 6 ชม. เป็น safety net
    W->>ISS: GET /.well-known/reissue-campaigns/{id}
    ISS-->>W: Campaign Manifest (JWS)
    W->>W: verify JWS + match `affected_kid`<br/>กับ VC ที่เก็บไว้
    W-->>U: 🔔 Modal blocking: "VC ต้องออกใหม่ด่วน"
    U->>W: กด "Reissue Now"
    W->>ISS: OID4VCI + reissue_context.campaign_id
    ISS->>VSL: mark VC เดิม status = 0x03 (Thai-profile `rotated`, ต้องประกาศ `bits` ที่รองรับ)
    ISS-->>W: VC ใหม่ (signed by key-2)
    W->>W: เก็บ VC ใหม่<br/>mark VC เดิม = SUPERSEDED
    Note over ETDA,TL: คู่ขนาน: สพธอ. ปรับข้อมูลกุญแจและสถานะตาม Thai profile
    ETDA->>TL: เผยแพร่ JWT ฉบับใหม่พร้อม LoTESequenceNumber ใหม่
    TL-->>W: Wallet ตรวจครั้งต่อไป: กุญแจเดิมไม่ผ่านเกณฑ์ → ปฏิเสธ
```

**[ข้อวิเคราะห์]** จุดสำคัญสี่ประการที่แผนภาพบังคับไว้

1. ผู้ออกเอกสาร **MUST** ลงลายมือชื่อ Campaign Manifest ด้วยกุญแจใหม่ (`key-2`) เพราะผู้โจมตีที่ครอบครอง `key-1` จะปลอม campaign "ยกเลิกฉุกเฉิน" ได้ [research/07-1 §4.3, S1]
2. กระเป๋าเอกสารดิจิทัล **MUST** block UI สำหรับ T1 จนกว่าผู้ใช้จะอนุมัติหรือปฏิเสธ เพราะ VC ที่ลงลายมือชื่อด้วยกุญแจที่ compromise มีความเสี่ยงสูงที่จะถูกปลอม
3. การ mark VC เดิมเป็น `rotated` ใน Status List **MUST** สำเร็จก่อนที่กระเป๋าเอกสารดิจิทัลจะลบ key handle เดิม [A-KD08 §3]
4. สพธอ. **MUST** เผยแพร่ Trusted List ฉบับใหม่ที่ระบุผลต่อกุญแจที่ถูก compromise ตาม Thai profile โดยต้องกำหนดฟิลด์สถานะและช่วงเวลาต่อกุญแจให้ตรวจได้ก่อนใช้งานจริง [research/42](../research/42-trusted-list-lote-jwt-format.md)

#### 13.7.7.6 ตารางเปรียบเทียบ 4 รูปแบบการหมุนเวียนกุญแจ

**[ข้อวิเคราะห์]** ตารางต่อไปนี้สรุปมิติสำคัญของการหมุนเวียนกุญแจทั้ง 4 รูปแบบ เพื่อให้ผู้พัฒนาเห็นความแตกต่างชัดเจน

| มิติ | T0 Scheduled | T1 Compromise | T2 Early Decomm. | T3 Migration |
|------|:------------:|:-------------:|:----------------:|:-------------:|
| **Trigger** | นโยบายหมุนเวียนประจำปี | กุญแจรั่วไหล / ถูกขโมย | Compliance / ยุติใช้ | Algorithm upgrade |
| **SLA แจ้งเตือน** | ไม่ต้องแจ้ง | ≤ 15 นาที push / 6 ชม. pull | ≥ 90 วันล่วงหน้า | ≥ 30 วันล่วงหน้า |
| **Grace Period** | ไม่กำหนด | 0 (ทันที) | ≥ 90 วัน | ≥ 30 วัน |
| **Sign Campaign ด้วย key** | ไม่ต้อง sign | key ใหม่ (key-2) | key ใดก็ได้ | key ใดก็ได้ |
| **Push notification** | ไม่ต้อง | ✅ Required | ✅ ที่ 30/7/1 วัน | ✅ ที่ 14/3 วัน |
| **Pull endpoint** | ไม่ต้อง | ✅ Required | ✅ Required | ✅ Required |
| **VC เดิมใช้ได้ไหม** | ✅ จนกว่า VCs จะหมดอายุ | ❌ verify fail ทันที | ✅ จนถึง deadline | ✅ จนถึง deadline |
| **ต้อง reissue หรือไม่** | ❓ ตามนโยบาย | ✅ บังคับ | ✅ บังคับ (ก่อน deadline) | ✅ แนะนำ |
| **Mark VC เดิมเป็น `rotated`** | ไม่บังคับ | ✅ บังคับ (พร้อม reissue) | ✅ บังคับ (เมื่อ reissue) | ✅ แนะนำ (เมื่อ reissue) |
| **TL update ข้อมูลกุญแจตาม Thai profile** | ไม่บังคับ | ✅ ตามเป้าหมายฉุกเฉิน [A-TM §I3] | ✅ ตาม deadline | ✅ ตาม deadline |
| **Wallet block UI** | ไม่ | ✅ modal blocking | ไม่ (in-app banner) | ไม่ (in-app banner) |

**[ข้อวิเคราะห์]** ข้อสังเกตที่ผู้พัฒนาต้องไม่สับสน มีดังนี้

1. **T0 transparent** ต่างจาก T1–T3 ตรงที่ไม่มี deadline และไม่มีกลไกแจ้ง wallet เนื่องจาก `key-1` ยังอยู่ใน `assertionMethod` และ VC ที่ลงด้วยกุญแจนี้ยังตรวจสอบได้
2. **T1 มี SLA สั้นที่สุด** (15 นาที) และเป็น trigger เดียวที่ต้อง sign campaign ด้วยกุญแจใหม่ เพราะต้องกันผู้โจมตีปลอม campaign ยกเลิกเหตุฉุกเฉิน
3. **T2 มี grace period ยาวที่สุด** (≥ 90 วัน) เพราะไม่มีเหตุเร่งด่วนด้านความปลอดภัย แต่ต้องการเวลาให้ผู้ถือออก VC ใหม่อย่างทั่วถึง
4. **ทั้ง 4 รูปแบบ** ต้องมี audit log และประวัติ KSN เพื่อให้ตรวจสอบย้อนหลังได้ตาม [A-KD08 §8]

**[ช่องว่าง G-04 — มีนัยด้านการปฏิบัติตามข้อกำหนด]** แม้เอกสารสถาปัตยกรรม [A-TM §I3] จะกำหนด SLA แพร่กระจายการเพิกถอนฉุกเฉินภายใน 1 ชั่วโมงสำหรับกรณี Issuer key compromise แต่กลไก dual-channel (push + pull) ที่บันทึกไว้ใน [research/07-1] อิงกับ push notification ผ่าน wallet provider ซึ่งไม่มีในเอกสารสถาปัตยกรรมระดับ spec ปัจจุบัน ETDA **MUST** กำหนดสัญญาการให้บริการ (SLA) ระหว่าง สพธอ. กับ wallet provider ว่าด้วยเวลาแจ้งเตือน push notification สำหรับ T1 ให้ชัดเจน และ **MUST** กำหนดให้ wallet unit ตรวจ pull endpoint ทุก 6 ชั่วโมงเป็น safety net ก่อนออกข้อกำหนดการตรวจประเมิน

---

## 13.8 ช่องว่างที่เกี่ยวข้อง

**[ช่องว่าง]** ช่องว่าง G-02, G-03 และ G-04 ที่พบในบทนี้มีรายละเอียดอยู่ในหัวข้อข้างต้น (§13.4, §13.5 และ §13.7.7 ตามลำดับ) รายการรวมของช่องว่างทั้งหมดเพื่อ escalate ต่อ ETDA Security Team อยู่ในบทที่ 14 §14.4 บทนี้จึงไม่ทำซ้ำตารางรวมดังกล่าว

---

{/* METADATA (agent-only — not rendered to readers)
## 13.9 References

### 13.9.1 แหล่งข้อมูลหลัก — เอกสารสถาปัตยกรรมในโครงการ

วันที่เข้าถึงทุกไฟล์: **2026-08-07** โดยอ้างสถานะ repository ณ เวอร์ชันเอกสาร 1.0.0 (อัปเดตเพิ่ม research/07 และ research/07-1 สำหรับ §13.7.7)

| รหัส | เอกสาร | เวอร์ชันที่ระบุในไฟล์ |
|------|--------|---------------------|
| A-ARCH | [../architecture/01-architecture.md](../architecture/01-architecture.md) — สถาปัตยกรรมความน่าเชื่อถือแบบ Trusted List | v2.3 |
| A-TM | [../architecture/phase2/trustlist/10-threat-model.md](../architecture/phase2/trustlist/10-threat-model.md) — Trust List Verification: Threat Model & Mitigations | Draft v1.0 |
| A-KD08 | [../architecture/phase2/key-derivation/08-key-rotation-lifecycle.md](../architecture/phase2/key-derivation/08-key-rotation-lifecycle.md) — Key Rotation & Lifecycle | Draft v1.0 |
| A-VRP | [../policy/01-verifier-registration-policy.md](../policy/01-verifier-registration-policy.md) — นโยบายการลงทะเบียนผู้ตรวจสอบ | Draft v1.0 |
| research/41 | [../research/41-trustlist-serving-filecdn-etag-binary.md](../research/41-trustlist-serving-filecdn-etag-binary.md) — Trustlist ผ่าน File/Edge CDN และ lazy revalidation | v1.10 |
| research/07 | [../research/07-issuer-key-rotation.md](../research/07-issuer-key-rotation.md) — Issuer Key Rotation (did:web) — 4 สถานะของกุญแจผู้ออก (Created/Active/Inactive/Decommissioned) และ 3 scenarios ที่สมมุติฐาน transparent พัง | v2.1 |
| research/07-1 | [../research/07-1-issuer-key-rotation-wallet-notification.md](../research/07-1-issuer-key-rotation-wallet-notification.md) — Issuer Key Rotation: Wallet Notification & Re-issue Campaign — Campaign Protocol, FSM M₁₃, API endpoints สำหรับ T1/T2/T3 | v1.0 |
| บทที่ 10 | [10-wallet-unit-attestation.md](10-wallet-unit-attestation.md) — Wallet Unit Attestation (WUA) — บทภายในเล่ม (ARF) แหล่งของ §13.7.5 (การเพิกถอน WIA/KA และ cascade) สืบย้อนไปยัง EUDI ARF 2.9.0 TS3 และ CIR 2024/2977 Art. 5(4)(b) | v1.6 |

### 13.9.2 มาตรฐานภายนอกที่อ้างผ่านเอกสารข้างต้น

เอกสารนี้ไม่อ้างมาตรฐานภายนอกโดยตรง รายการต่อไปนี้คือมาตรฐานที่ไฟล์สถาปัตยกรรมระบุไว้เป็นแหล่งข้อมูลของตน และปรากฏในเนื้อหาของบทนี้

| มาตรฐาน | ส่วนที่อ้าง | ไฟล์ที่อ้าง |
|---------|-----------|-----------|
| IETF Token Status List | `draft-ietf-oauth-status-list-18` (architecture baseline); current technical reference: `draft-ietf-oauth-status-list-21` [13] (`0x03` application-specific; Thai profile may define `rotated`) | A-ARCH, A-TM §10, A-KD08 §9 |
| OID4VP 1.0 Final | §5.10, §11 Security Considerations, §11.5, §11.6 | A-TM §10, §V1, §V4, §V5 |
| SD-JWT VC (draft-ietf-oauth-sd-jwt-vc) | §4.1 Key Binding JWT, §6 | A-TM §10, §W6 |
| CIR (EU) 2024/2979 | Wallet requirements (Art. 5, 6, 7 — รวมการหมุนเวียนกุญแจ) | A-KD08 §8 |
| CIR (EU) 2024/2977 | PID issuance (Art. 5(4)(b) — cascade revocation เมื่อ wallet unit ถูกยกเลิก) | A-KD08, บทที่ 10 §10.5.3 |
| W3C DID Core | Data Model (ข้อจำกัดเรื่องสถานะรายกุญแจ) | research/07 |

---
*/}

**การนำทาง:** [⬅️ บทที่ 12 — Key Management และ Trusted List Deployment](12-key-management-and-trustlist-deployment.md) · [⬆️ สารบัญ ARF](README.md) · [บทที่ 14 — ความมั่นคงปลอดภัย: Threat Model และ Conformance ➡️](14-security-threat-model-and-conformance.md)
