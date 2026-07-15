---
sidebar_position: 5
---

# 3.2.4 ขั้นตอนที่ 3 — Issue VC, ตรวจ Issuer, Notification

## 3.2.4 Issue VC, Trust Check: Issuer และ Notification

ต่อจาก [§ 3.2.3](04-token-and-credential-request.md) ที่ DOPA ตรวจ Wallet Provider ผ่านแล้ว บทนี้อธิบาย **STEP 6–7** — ตั้งแต่ DOPA ออก SD-JWT VC, Wallet ตรวจสอบ Issuer ก่อนบันทึกบัตร ไปจนถึงการแจ้งเตือนกลับ (Optional)

###### 🔵 STEP 6 — Issue VC (ออกบัตรประชาชนดิจิทัล)

> **Steps:** [22] → [25]

---

**[22] DOPA สร้าง SD-JWT VC (IETF SD-JWT VC (dc+sd-jwt))**

DOPA สร้าง SD-JWT VC ที่สอดคล้อง IETF SD-JWT VC (dc+sd-jwt):

**JOSE Header:**
```json
{
  "typ": "dc+sd-jwt",
  "alg": "ES256",
  "kid": "https://issuer.dopa.go.th#key-2025-1"
}
```

**JWT Payload:**
```json
{
  "iss": "https://issuer.dopa.go.th",
  "sub": "wallet-instance-abc123",
  "jti": "https://credentials.dopa.go.th/credentials/tid-2025-00042",
  "nbf": 1750000200,
  "exp": 1781536200,
  "cnf": { "jwk": { "kty": "EC", "crv": "P-256", "x": "wallet_pub_x", "y": "wallet_pub_y" } },
  "_sd_alg": "sha-256",
  "status": {
    "status_list": {
      "idx": 42,
      "uri": "https://status.dopa.go.th/statuslist/1"
    }
  },
  "@context": [
    "https://www.w3.org/ns/credentials/v2",
    "https://vocab.dopa.go.th/credentials/v1"
  ],
  "id": "https://credentials.dopa.go.th/credentials/tid-2025-00042",
  "type": ["VerifiableCredential", "ThaiNationalIDCredential"],
  "issuer": {
    "id": "https://issuer.dopa.go.th",
    "name": "กรมการปกครอง"
  },
  "validFrom": "2025-06-15T00:00:00Z",
  "validUntil": "2030-06-15T00:00:00Z",
  "credentialSubject": {
    "id": "wallet-instance-abc123",
    "ชื่อ": "สมชาย ใจดี",
    "เลขบัตร": "1234567890123",
    "วันเกิด": "1990-01-15"
  },
  "credentialSchema": {
    "id": "https://schema.dopa.go.th/ThaiNationalID-v1.json",
    "type": "JsonSchema"
  },
  "_sd": [
    "X9yH3mK2vP...digest_ที่อยู่",
    "aB7cD4eF1g...digest_รูปภาพ"
  ]
}
```

**SD Disclosures** (สำหรับ claims ที่ซ่อน):
```
~base64url(["kp_salt1", "ที่อยู่", "123 ถนนสุขุมวิท กรุงเทพฯ 10110"])
~base64url(["kp_salt2", "รูปภาพ", "base64url_portrait..."])
```

---

**[23] Immediate vs Deferred Issuance**

| กรณี | ความหมาย | Response |
|------|---------|----------|
| **Immediate** | ออกบัตรทันที (ปกติ) | `{ "credential": "eyJ...SD-JWT..." }` |
| **Deferred** | ต้องรอ (เช่น ต้องตรวจสอบเพิ่ม) | `{ "transaction_id": "txn-dopa-456" }` |

**Deferred flow — Polling Parameters:**

> **[ยังไม่ได้กำหนดค่ามาตรฐานอย่างเป็นทางการ]** ETDA ยังไม่ได้ประกาศตัวเลขที่แน่นอนสำหรับ polling interval/timeout — ค่าด้านล่างเป็นแนวทางชั่วคราว (interim) อ้างอิงแนวปฏิบัติทั่วไปของ OID4VCI Deferred Flow

| พารามิเตอร์ | ค่าแนะนำชั่วคราว |
|-------------|----------------------|
| Polling interval ขั้นต่ำ | ทุก 5 วินาที (ไม่ควร poll ถี่กว่านี้เพื่อลดภาระ Gateway) |
| Timeout รวม | 10 นาที นับจากคำขอ deferred ครั้งแรก |
| Max retry | ไม่จำกัดจำนวนครั้งภายใน timeout รวม แต่ **SHOULD** เว้นระยะตาม polling interval |
| Error response เมื่อตรวจสอบไม่ผ่าน | `{ "error": "credential_request_denied" }` พร้อมเหตุผลใน `error_description` (ถ้ามี) |
| Error response เมื่อ transaction หมดอายุ (เกิน timeout) | `{ "error": "invalid_transaction_id" }` — Wallet ต้องเริ่ม flow การขอ credential ใหม่ |

**Deferred flow** — Wallet ต้องกลับมาถามซ้ำ:
```http
POST /deferred_credential
{ "transaction_id": "txn-dopa-456" }
→ DOPA ตรวจสอบเสร็จแล้ว → ส่ง credential กลับมา
```

---

###### ⚙️ Trustlist Freshness Check (ก่อน STEP 6.5)

Wallet ตรวจว่า Trustlist ยังใช้ได้หรือไม่ (เหมือนที่ DOPA ทำในขั้น 5.5) ถ้าหมดอายุ → ดึงใหม่ก่อน

---

###### 🟠 STEP 6.5 — Trust Check: Issuer (Wallet ตรวจบัตร)

> **Steps:** [26] → [30.7] | **ทำโดย:** Wallet ฝั่งเดียว ผู้ใช้ยังรอผลอยู่

---

**ตารางสรุป: แต่ละ step หยิบค่าจากไหน เอาไปเช็คกับอะไร**

| Step | หยิบค่าจาก | เช็คกับ | ผ่านเมื่อ |
|------|-----------|---------|----------|
| **[26]** แกะ claims | JWT payload | — | decode สำเร็จ |
| **[27]** Trustlist lookup | `iss` จาก [26] | `Trustlist entry.credential_issuer` | พบ + status = active |
| **[27.1]** iss/jti match | `iss`, `jti` จาก JWT | `issuer.id`, `id` ใน VC body | ทั้งคู่ต้องเท่ากัน |
| **[27.2]** @context check | `@context[0]` จาก VC body | `"https://www.w3.org/ns/credentials/v2"` | ตรงทั้งหมด |
| **[27.3]** type check | `type[0]`, `type[1]` จาก VC body | `"VerifiableCredential"` + Trustlist `allowed_credential_types` | ทั้งสองพบ |
| **[28]** GET JWKS | `credential_issuer` จาก Trustlist | — | HTTP 200 |
| **[29]** รับ JWKS | JWKS response | — | parse สำเร็จ |
| **[29.1]** kid match | `kid` จาก JOSE header | `JWKS keys[].kid` | พบ key → ได้ `publicKeyJwk` |
| **[30]** verify signature | SD-JWT signature | `publicKeyJwk` จาก [29.1] | ES256 verify สำเร็จ |
| **[30.1]** nbf/sub | `nbf` (Unix) และ `sub` จาก JWT | `validFrom` (ISO 8601) และ `credentialSubject.id` ใน VC body | ตรงกัน |
| **[30.2]** validity window | `validFrom`, `validUntil` จาก VC body | เวลาปัจจุบัน | validFrom ≤ now ≤ validUntil |
| **[30.3]** GET statuslist | `status.status_list.uri` จาก JWT | — | HTTP 200 |
| **[30.4]** รับ statuslist+jwt | response | — | parse JWT สำเร็จ |
| **[30.5]** verify statuslist | statuslist+jwt signature | `publicKeyJwk` ของ Issuer | verify สำเร็จ + `iss` ตรงกับ credential issuer |
| **[30.6]** validity statuslist | `iat`, `exp` จาก statuslist+jwt | now | iat ≤ now ≤ exp |
| **[30.7]** decode bit | `lst` ที่ index `status.status_list.idx` | 0 | bit = 0 (valid) |

---

**[26] แกะ claims จาก JWT payload**

Wallet decode JWT (ยังไม่ verify signature) ได้ค่า 3 ตัวที่จะใช้ต่อในขั้นตอนถัดไป:

```
iss = "https://issuer.dopa.go.th"         → ใช้ใน [27] Trustlist lookup
jti = "https://credentials.dopa.go.th/credentials/tid-2025-00042"  → ใช้ใน [27.1]
sub = "wallet-instance-abc123"            → ใช้ใน [30.1]
```

---

**[27] Trustlist lookup**

ค้น `iss` ใน Local Trustlist → ได้ entry ของ DOPA:

```json
{
  "credential_issuer": "https://issuer.dopa.go.th",
  "status": "active",
  "allowed_credential_types": [["VerifiableCredential", "ThaiNationalIDCredential"]]
}
```

---

**[27.1] iss == issuer.id และ jti == id**

ตรวจว่า JWT layer กับ VC body ไม่ถูกสลับกัน:

```
JWT iss       = "https://issuer.dopa.go.th"
VC issuer.id  = "https://issuer.dopa.go.th"  ✅

JWT jti       = "https://credentials.dopa.go.th/credentials/tid-2025-00042"
VC id         = "https://credentials.dopa.go.th/credentials/tid-2025-00042"  ✅
```

> ป้องกันการนำ JWT ของ issuer หนึ่งไปจับคู่กับ VC body ของอีก issuer

---

**[27.2] ตรวจ @context**

```
VC @context[0] = "https://www.w3.org/ns/credentials/v2"  ✅
```
พิสูจน์ว่าบัตรนี้เป็น IETF SD-JWT VC (dc+sd-jwt) — ถ้าไม่มี = format ผิด reject ทันที

---

**[27.3] ตรวจ type**

```
VC type[0] = "VerifiableCredential"           ✅ บังคับต้องมี
VC type[1] = "ThaiNationalIDCredential"
Trustlist allowed_credential_types: [["VerifiableCredential", "ThaiNationalIDCredential"]]  ✅
```
พิสูจน์ว่า DOPA ได้รับอนุมัติจาก ETDA ให้ออกบัตรประเภทนี้

---

**[28–29.1] GET JWKS และ kid matching**

```
GET https://issuer.dopa.go.th/.well-known/jwt-vc-issuer

JOSE header kid: "https://issuer.dopa.go.th#key-2025-1"
JWKS keys[0].kid: "https://issuer.dopa.go.th#key-2025-1"  ✅ ตรงกัน
→ ดึง publicKeyJwk ของ keys[0] ไปใช้ verify signature
```

> ถ้า DOPA มีหลาย key (ระหว่าง key rotation) — kid ช่วยระบุว่าใช้ key ไหนเซ็น

---

**[30] Verify SD-JWT signature**

```
SD-JWT signature + publicKeyJwk (จาก [29.1]) → ES256 verify → ✅
```
พิสูจน์ว่า DOPA เซ็นบัตรนี้จริง และไม่มีใครแก้ไข payload ภายหลัง

---

**[30.1] ตรวจ nbf กับ validFrom และ sub กับ credentialSubject.id**

```
JWT nbf:          1750000200 (Unix)
VC validFrom:     "2025-06-15T00:00:03Z" (ISO 8601)  ✅ ตรงกัน (±30 วินาที)

JWT sub:          "wallet-instance-abc123"
VC credentialSubject.id: "wallet-instance-abc123"  ✅ ตรงกัน
```

---

**[30.2] ตรวจ validity window**

```
validFrom:  2025-06-15T00:00:00Z  ≤  now: 2025-06-15T10:30:00Z  ≤  validUntil: 2030-06-15T00:00:00Z  ✅
```

---

**[30.3–30.7] ตรวจ IETF Token Status List**

```
status.status_list.uri = "https://status.dopa.go.th/statuslist/1"
status.status_list.idx = 42

GET https://status.dopa.go.th/statuslist/1 → statuslist+jwt
→ verify signature (Issuer key เดิม)  ✅
→ iss = "https://issuer.dopa.go.th"  ✅ ตรงกับ credential issuer
→ iat ≤ now ≤ exp  ✅
→ decode lst → bit ที่ index 42 = 0 (VALID)  ✅ บัตรยังไม่ถูกยกเลิก
```

---

##### 🔵 STEP 7 — Notification (แจ้งว่ารับแล้ว, Optional)

> **Steps:** [31] → [33]

---

**[31] POST /notification**

```http
POST https://issuer.dopa.go.th/notification
Authorization: Bearer eyJhbGci...
Content-Type: application/json

{
  "notification_id": "tid-2025-00042",
  "event": "credential_accepted"
}
```

---

**[32] DOPA รับทราบ**

```http
HTTP/1.1 204 No Content
```

> DOPA บันทึกว่าบัตรถูกรับไปแล้ว ใช้สำหรับ audit log และ analytics

---

**[33] ✅ บันทึกบัตรสำเร็จ**

Wallet แสดงผล: `"บัตรประชาชนดิจิทัลของคุณพร้อมใช้งานแล้ว"`

ผู้ใช้ได้บัตรที่:
- **ออกโดย DOPA จริง** — ตรวจ signature แล้ว
- **ผ่านการรับรองจาก ETDA** — ทั้ง DOPA และ Wallet อยู่ใน Trustlist
- **ยังไม่ถูกยกเลิก** — ตรวจ status list แล้ว
- **ผูกกับ Wallet นี้** — ด้วย cnf.jwk (ใครขโมยไปก็ใช้ไม่ได้)

---

*(ต่อใน [§ 3.2.5 Trustlist Verification — รายละเอียดการตรวจสอบ](06-verification-details.md))*
