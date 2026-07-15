---
sidebar_position: 3
---

# 3.2.2 ขั้นตอนที่ 1 — SETUP, Credential Offer, Discovery, Authentication

## 3.2.2 คำอธิบายแต่ละขั้นตอนโดยละเอียด (SETUP, Credential Offer, Discovery, Authentication)

ต่อจากภาพรวมทั้งหมดใน [3.2.1 Full Flow](02b-full-flow-technical-detail.md) บทนี้อธิบาย **SETUP และ STEP 1–3** แบบละเอียดทีละ field ตั้งแต่การเตรียมระบบ ไปจนถึงผู้ใช้ยืนยันตัวตนด้วย OTP

---

##### 🟢 SETUP — เตรียมระบบก่อนเริ่มใช้งาน

> **เมื่อไหร่:** ทำครั้งเดียวตอน install app (Wallet) หรือ deploy ระบบ (DOPA)
> **ทำไม:** ทุกฝ่ายต้องมีข้อมูลพื้นฐานก่อน จึงจะ verify กันได้

---

###### 🔐 Pre-Setup — ETDA Public Key (root of trust)

**ทำอะไร:** Wallet และ DOPA ดึง ETDA Public Key จาก endpoint ที่ ETDA ประกาศไว้ก่อน — ใช้ key นี้ verify ลายเซ็นบน Trustlist

**Request:**
```http
GET https://trust.etda.or.th/.well-known/trust-anchor
```

**Response:**
```json
{
  "kty": "EC", "crv": "P-256",
  "x": "ETDA_public_x_value", "y": "ETDA_public_y_value",
  "kid": "etda-trust-anchor-2025", "use": "sig"
}
```

> **Root of Trust:** key นี้เป็นจุดเริ่มของ trust chain — ETDA อัปเดต key ได้โดยไม่ต้อง redeploy app

---

###### GET /trustlist — ดึงรายชื่อผู้น่าเชื่อถือ

**ทำอะไร:** Wallet และ DOPA ต่างดึง Trustlist จาก ETDA พร้อมแนบ API Key ยืนยันตัวตน

**Request ตัวอย่าง:**
```http
GET https://trust.etda.or.th/trustlist
Authorization: Bearer etda-api-key-dopa-2025-xyz
```

**Response ตัวอย่าง:**
```json
{
  "iss": "https://trust.etda.or.th",
  "iat": 1750000000,
  "exp": 1750086400,
  "entries": [
    {
      "type": "IssuerEntry",
      "credential_issuer": "https://issuer.dopa.go.th",
      "status": "active",
      "jwks_uri": "https://issuer.dopa.go.th/.well-known/jwt-vc-issuer",
      "allowed_credential_types": [["VerifiableCredential", "ThaiNationalIDCredential"]]
    },
    {
      "type": "WalletProviderEntry",
      "id": "wp-thangrath-001",
      "endpoint": "https://wp.thangrath.go.th",
      "status": "active"
    }
  ]
}
```

**หลัง verify JWS แล้ว** Wallet/DOPA เก็บ Trustlist นี้ไว้ใน Local Storage พร้อมบันทึก `exp = 1750086400` (**ตัวอย่างสมมติเท่านั้น** — คำนวณได้ประมาณ 24 ชั่วโมงนับจากนี้ แต่ค่า TTL มาตรฐานจริงยังไม่ถูกกำหนดอย่างเป็นทางการ ดู [§ 1.3 ตาราง "Pull บ่อยแค่ไหน"](../../01-concepts-and-roles/02-roles-and-trust-model.md)) เพื่อรู้ว่าต้องดึงใหม่เมื่อไหร่

---

###### ⚙️ Wallet Attestation — หลักฐานว่าแอปนี้ผ่านการรับรอง

**ทำอะไร:** Wallet Provider ออก JWT ให้ Wallet เพื่อใช้เป็นหลักฐานว่าแอปนี้ได้รับการตรวจสอบแล้ว

**Wallet Attestation JWT ตัวอย่าง (decoded):**
```json
{
  "header": { "alg": "ES256", "typ": "wallet-attestation+jwt", "kid": "wp-key-001" },
  "payload": {
    "iss": "wp-thangrath-001",
    "sub": "wallet-instance-abc123",
    "iat": 1750000000,
    "exp": 1750604800,
    "cnf": {
      "jwk": {
        "kty": "EC", "crv": "P-256",
        "x": "wallet_pub_x", "y": "wallet_pub_y"
      }
    },
    "aal": "high",
    "attested_security_context": "hardware_backed"
  }
}
```

> **เปรียบเหมือน:** บัตรพนักงานที่บริษัทออกให้ พิสูจน์ว่าคนถือเป็นพนักงานจริง ไม่ใช่คนปลอม

---

##### 🔵 STEP 1 — Credential Offer (รับคำเชิญ)

> **Steps:** [1] → [5]

---

**[1] ผู้ใช้กดขอบัตร**

ผู้ใช้เข้าเว็บไซต์ DOPA และกดปุ่ม "ขอบัตรประชาชนดิจิทัล" ระบบตรวจว่าผู้ใช้ login ถูกต้องก่อน

---

**[2] DOPA สร้างรหัสสำหรับ flow นี้**

DOPA สร้างข้อมูล 2 ชิ้นสำหรับ session นี้โดยเฉพาะ:

| ข้อมูล | ค่าตัวอย่าง | อายุ | ใช้ทำอะไร |
|--------|------------|------|-----------|
| `pre_authorized_code` | `pac-a1b2c3d4e5f6` | 5 นาที | รหัสลับที่ Wallet ใช้แลก token |
| `tx_code` (OTP) | `512847` | 5 นาที | ผู้ใช้กรอกเพื่อยืนยันตัวตน |

---

**[3] QR Code บนหน้าจอ**

QR Code เก็บ Credential Offer Object ซึ่งมีข้อมูลสำคัญ:

```json
openid-credential-offer://?credential_offer={
  "credential_issuer": "https://issuer.dopa.go.th",
  "credential_configuration_ids": ["ThaiNationalIDCredential-config"],
  "grants": {
    "urn:ietf:params:oauth:grant-type:pre-authorized_code": {
      "pre-authorized_code": "pac-a1b2c3d4e5f6",
      "tx_code": { "input_mode": "numeric", "length": 6 }
    }
  }
}
```

---

**[4] SMS OTP ส่งไปที่มือถือผู้ใช้**

DOPA ส่ง SMS: `"รหัส OTP สำหรับบัตรประชาชนดิจิทัล: 512847 ใช้ได้ภายใน 5 นาที"`

---

**[5] ผู้ใช้สแกน QR ด้วย Wallet app**

Wallet อ่าน QR แล้วรู้ว่า:
- ต้องไปขอบัตรที่ `https://issuer.dopa.go.th`
- ต้องใช้ pre_authorized_code `pac-a1b2c3d4e5f6`
- ต้องให้ผู้ใช้กรอก OTP 6 หลัก

---

##### 🟠 STEP 1.5 — Early Trust Check: Issuer

> **Steps:** [5.5] → [5.7] | **ทำโดย:** Wallet ฝั่งเดียว ใช้ local cache ไม่ต้องมี network call

**🟠 [5.5–5.7] STEP 1.5 — Early Trust Check: Issuer**
Wallet ตรวจ `credential_issuer` จาก QR ใน Local Trustlist ทันที — fail fast ถ้า Issuer ไม่อยู่ใน TL (ไม่ต้องมี network call — ใช้ local cache)
ตรวจ status = active + อยู่ใน validity window + `credential_configuration_id` อยู่ใน `allowed_credential_types`

---

##### 🔵 STEP 2 — Discovery (ดูข้อมูลผู้ออกบัตร)

> **Steps:** [6] → [7.1]

---

**[6] GET /.well-known/openid-credential-issuer**

Wallet ดึงข้อมูลเบื้องต้นของ DOPA Issuer:

```http
GET https://issuer.dopa.go.th/.well-known/openid-credential-issuer
```

---

**[7] Credential Issuer Metadata**

DOPA ตอบกลับด้วยข้อมูลสำคัญ:

```json
{
  "credential_issuer": "https://issuer.dopa.go.th",
  "token_endpoint": "https://issuer.dopa.go.th/token",
  "credential_endpoint": "https://issuer.dopa.go.th/credential",
  "notification_endpoint": "https://issuer.dopa.go.th/notification",
  "credential_configurations_supported": {
    "ThaiNationalIDCredential-config": {
      "format": "dc+sd-jwt",
      "vct": "ThaiNationalIDCredential",
      "display": [{ "name": "บัตรประชาชนดิจิทัล", "locale": "th-TH" }],
      "claims": {
        "credentialSubject": {
          "ชื่อ": { "display": [{ "name": "ชื่อ-นามสกุล" }] },
          "เลขบัตร": { "display": [{ "name": "เลขบัตรประชาชน" }] },
          "วันเกิด": { "display": [{ "name": "วันเกิด" }] }
        }
      }
    }
  }
}
```

Wallet ได้รู้:
- **ส่ง token request ไปที่ไหน:** `/token`
- **ส่ง credential request ไปที่ไหน:** `/credential`
- **บัตรแบบไหนที่ DOPA ออกได้:** `ThaiNationalIDCredential-config`

---

**[7.1] Scope Validation — ตรวจก่อนดำเนินการต่อ**

Wallet ตรวจว่า `ThaiNationalIDCredential-config` (จาก QR) อยู่ใน `credential_configurations_supported` หรือไม่

```
QR มี:     "ThaiNationalIDCredential-config"
Metadata มี: "ThaiNationalIDCredential-config" ✅ → ดำเนินการต่อ
```

> ถ้าไม่พบ → Wallet หยุดและแจ้ง error — ป้องกันการส่งคำขอที่ DOPA ไม่รองรับ

---

##### 🔵 STEP 3 — Authentication (ยืนยันตัวตน)

> **Steps:** [8] → [9]

---

**[8] Wallet ถามผู้ใช้ขอ OTP**

Wallet แสดง UI: `"กรุณากรอกรหัส OTP 6 หลักที่ได้รับทาง SMS"`

---

**[9] ผู้ใช้กรอก OTP**

ผู้ใช้กรอก `512847` → Wallet เก็บไว้ใช้ในขั้นตอนถัดไป

> **ทำไมต้องมี OTP:** พิสูจน์ว่าผู้ใช้เป็นเจ้าของเบอร์โทรที่ผูกกับบัญชี ป้องกันคนอื่นสแกน QR แทน

---

*(ต่อใน [§ 3.2.3 Token Request, Credential Request, ตรวจ Wallet Provider](04-token-and-credential-request.md))*
