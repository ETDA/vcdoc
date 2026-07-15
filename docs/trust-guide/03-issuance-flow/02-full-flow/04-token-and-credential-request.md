---
sidebar_position: 4
---

# 3.2.3 ขั้นตอนที่ 2 — Token Request, Credential Request, ตรวจ Wallet Provider

## 3.2.3 Token Request, Credential Request และ Trust Check: Wallet Provider

ต่อจาก [§ 3.2.2](03-setup-and-credential-offer.md) ที่ผู้ใช้ยืนยันตัวตนด้วย OTP แล้ว บทนี้อธิบาย **STEP 4–5.5** — ตั้งแต่แลก token ไปจนถึง DOPA ตรวจสอบว่า Wallet Provider น่าเชื่อถือก่อนออกบัตร

##### 🔵 STEP 4 — Token Request (แลกบัตรผ่าน)

> **Steps:** [9.1] → [12] | **เพิ่ม DPoP สำหรับ LoA ≥ 3** (ดู [§ 3.2.6.1](07-data-flow-and-policy.md#32611-loa-แต่ละระดับหมายถึงอะไร))

---

**[9.1] สร้าง DPoP Key Pair + DPoP Proof JWT (LoA ≥ 3)**

> **DPoP คืออะไร (อธิบายสั้น ๆ):**
> access_token ปกติ = Bearer token ใครขโมยไปก็ใช้ได้จากที่ไหนก็ได้
> DPoP = ผูก token กับ key บนมือถือของเรา ขโมย token ไปใช้จากเครื่องอื่นไม่ได้

**สิ่งที่สร้าง:**

| สิ่งที่สร้าง | เก็บที่ไหน | ส่งไปที่ไหน |
|-------------|-----------|------------|
| DPoP Private Key | Trusted Execution Environment (TEE) | ไม่ส่งออกเลย |
| DPoP Public Key | ฝังใน DPoP Proof JWT header | ส่งไปกับทุก request |
| DPoP Proof JWT | สร้างใหม่ทุก request | ส่งเป็น `DPoP` header |

**DPoP Proof JWT ตัวอย่าง:**
```json
{
  "header": {
    "typ": "dpop+jwt",
    "alg": "ES256",
    "jwk": { "kty": "EC", "crv": "P-256", "x": "dpop_pub_x", "y": "dpop_pub_y" }
  },
  "payload": {
    "jti": "unique-per-request-abc123",
    "htm": "POST",
    "htu": "https://issuer.dopa.go.th/token",
    "iat": 1750000100
  }
}
```

| Field | ค่า | ทำหน้าที่ |
|-------|-----|----------|
| `typ` | `dpop+jwt` | บอก DOPA ว่านี่คือ DPoP Proof |
| `jwk` | DPoP Public Key | ให้ DOPA verify signature + ผูก token กับ key นี้ |
| `jti` | random unique ID | ป้องกัน replay — ใช้ซ้ำไม่ได้ |
| `htm` | `POST` | ต้องตรงกับ HTTP method ที่ใช้ |
| `htu` | URL ของ endpoint | ต้องตรงกับ endpoint ที่เรียก |
| `iat` | timestamp ปัจจุบัน | ป้องกัน Proof เก่าๆ ถูกนำมาใช้ซ้ำ |

---

**[10] POST /token**

Wallet ส่ง request พร้อม DPoP-Proof header (LoA ≥ 3):

```http
POST https://issuer.dopa.go.th/token
Content-Type: application/x-www-form-urlencoded
DPoP: eyJhbGciOiJFUzI1NiIsInR5cCI6ImRwb3Arand...  ← DPoP Proof (LoA ≥ 3)

grant_type=urn:ietf:params:oauth:grant-type:pre-authorized_code
&pre-authorized_code=pac-a1b2c3d4e5f6
&tx_code=512847
```

---

**[11] DOPA ตรวจหลักฐานทั้งหมด**

DOPA ตรวจตามลำดับ:

| # | ตรวจอะไร | ถ้าไม่ผ่าน |
|---|---------|----------|
| 1 | `pre-authorized_code` ถูกต้องและยังไม่หมดอายุ | `invalid_grant` |
| 2 | `tx_code` ตรงกับ OTP ที่ส่งไป | `invalid_grant` |
| 3 | code ถูกใช้ไปแล้วหรือเปล่า (single-use) | `invalid_grant` |
| 4 | **(LoA ≥ 3)** DPoP Proof header มีไหม | `use_dpop_nonce` |
| 5 | **(LoA ≥ 3)** DPoP Proof signature ถูกต้อง | `invalid_dpop_proof` |
| 6 | **(LoA ≥ 3)** DPoP `jti` ยังไม่เคยใช้ | `invalid_dpop_proof` |

ถ้าผ่านทั้งหมด → DOPA **ผูก access_token กับ DPoP public key** (LoA ≥ 3)

---

**[12] access_token + c_nonce**

ถ้าผ่านทั้งหมด DOPA ตอบกลับ:

```json
// LoA ≥ 3 (DPoP)
{
  "access_token": "eyJhbGci...token...",
  "token_type": "DPoP",
  "expires_in": 300,
  "c_nonce": "nonce-random-xyz-789",
  "c_nonce_expires_in": 300
}

// LoA 1 (Bearer)
{
  "access_token": "eyJhbGci...token...",
  "token_type": "Bearer",
  "expires_in": 300,
  "c_nonce": "nonce-random-xyz-789",
  "c_nonce_expires_in": 300
}
```

| ข้อมูล | LoA 1 | LoA ≥ 3 | ใช้ทำอะไร |
|--------|-------|---------|----------|
| `token_type` | `Bearer` | **`DPoP`** | บอก Wallet ว่าต้องแนบ DPoP-Proof ทุก request |
| `access_token` | JWT | JWT (ผูก DPoP key) | ใช้แนบใน Credential Request |
| `c_nonce` | `nonce-random-xyz-789` | เหมือนกัน | ป้องกัน replay ใน proof.jwt |
| `expires_in` | 300 วินาที | เหมือนกัน | access_token หมดอายุใน 5 นาที |

> **token_type: DPoP** แปลว่า Wallet ต้องสร้าง DPoP Proof ใหม่ทุกครั้งที่ใช้ token นี้

---

###### 🔵 STEP 5 — Credential Request (ขอรับบัตร)

> **Steps:** [13] → [14] | **เพิ่ม DPoP-Proof ใหม่สำหรับ LoA ≥ 3**

---

**[13] Wallet สร้าง Key Pair + JWT Proof**

Wallet สร้าง key คู่บนเครื่อง (Holder Key) แล้วลงนาม JWT Proof:

**Key Pair ที่สร้าง:**
```
Private Key → เก็บใน Trusted Execution Environment (TEE)
Public Key  → แนบใน proof.jwt เพื่อส่งให้ DOPA
```

**JWT Proof (decoded):**
```json
{
  "header": { "alg": "ES256", "typ": "openid4vci-proof+jwt", "kid": "wallet-key-abc" },
  "payload": {
    "iss": "wallet-instance-abc123",
    "aud": "https://issuer.dopa.go.th",
    "iat": 1750000100,
    "nonce": "nonce-random-xyz-789",
    "cnf": {
      "jwk": { "kty": "EC", "crv": "P-256", "x": "wallet_pub_x", "y": "wallet_pub_y" }
    }
  }
}
```

> **ทำไมต้องมี c_nonce ใน proof:** ถ้าไม่มี nonce คนอื่นอาจขโมย proof เก่าไปใช้ซ้ำได้ (Replay Attack)

---

**[13.1] สร้าง DPoP Proof JWT ใหม่ (LoA ≥ 3)**

DPoP Proof ต้องสร้างใหม่ทุก request (ใช้ซ้ำไม่ได้) โดยเปลี่ยน `htu` ให้ตรงกับ endpoint ที่จะเรียก:

```json
{
  "payload": {
    "jti": "new-unique-id-per-request-789",
    "htm": "POST",
    "htu": "https://issuer.dopa.go.th/credential",
    "iat": 1750000200,
    "ath": "SHA256(access_token)"
  }
}
```

> **`ath` (access token hash):** ผูก DPoP Proof กับ access_token ที่ใช้ — ป้องกันนำ DPoP Proof ไปใช้กับ token อื่น

---

**[14] POST /credential**

Wallet รวบรวมข้อมูลจากหลาย step ก่อนหน้า แล้วส่งเป็น Credential Request:

| Field | มาจาก Step | ทำหน้าที่ |
|-------|-----------|----------|
| `Authorization: DPoP {token}` | [12] Token Response | บัตรผ่าน — พิสูจน์ว่า authen แล้ว (LoA 3+: DPoP-bound) |
| `DPoP: {proof}` header | [13.1] สร้างใหม่ทุก request | ผูก request นี้กับ DPoP key — token ที่ขโมยมาใช้ที่นี่ไม่ได้ |
| `credential_configuration_id` | [5] QR Code | ระบุว่าต้องการบัตรประเภทไหน |
| `proof.jwt` | [13] สร้างใหม่ + c_nonce จาก [12] | พิสูจน์ว่า Wallet ควบคุม Holder Key จริง + ป้องกัน replay |
| `wallet_attestation` | SETUP (WP ออกให้ล่วงหน้า) | พิสูจน์ว่าแอปนี้ผ่านการรับรองจาก ETDA |

**HTTP Request ตัวอย่าง:**

```http
POST https://issuer.dopa.go.th/credential
Authorization: DPoP eyJhbGci...access_token...
DPoP: eyJhbGciOiJFUzI1NiIsInR5cCI6ImRwb3Arand...DPoP_Proof...
Content-Type: application/json

{
  "credential_configuration_id": "ThaiNationalIDCredential-config",
  "proof": {
    "proof_type": "jwt",
    "jwt": "eyJhbGciOiJFUzI1NiIsInR5cCI6Im9wZW5pZDR2Y2ktcHJvb2Yrand..."
  },
  "wallet_attestation": "eyJhbGciOiJFUzI1NiIsInR5cCI6IndhbGxldC1hdHRlc3RhdGlvbirand..."
}
```

> **ข้อสังเกต:** แต่ละ field มาจาก step ที่ต่างกัน — ถ้าขาด field ใดก็จะ fail ที่ step นั้น
> ลำดับ: SETUP (WA) → [5] QR (cred_id) → [12] Token (access_token) → [13] proof.jwt → [13.1] DPoP Proof

---

###### ⚙️ Trustlist Freshness Check (ก่อน STEP 5.5)

DOPA ตรวจว่า Trustlist ที่เก็บไว้ยังใช้ได้ไหม:

```
ปัจจุบัน:      2025-06-15 10:30:00
Trustlist exp:  2025-06-15 23:59:59  ← ยังไม่หมด ✅ ใช้ของเดิม
```

ถ้าหมดอายุ → ดึงใหม่จาก ETDA ก่อนทำ STEP 5.5

---

###### 🟠 STEP 5.5 — Trust Check: Wallet Provider (DOPA ตรวจ Wallet)

> **Steps:** [15] → [21.1] | **ทำโดย:** DOPA ฝั่งเดียว ผู้ใช้ไม่รู้สึกอะไร

---

**[15] แกะ WP ID จาก wallet_attestation**

DOPA decode Wallet Attestation JWT (ไม่ต้อง verify ก่อน):
```
iss = "wp-thangrath-001"  ← นี่คือ Wallet Provider ID
sub = "wallet-instance-abc123"
```

---

**[16] Lookup WP ใน Trustlist**

DOPA ค้นหา `wp-thangrath-001` ใน Local Trustlist:
```json
{
  "id": "wp-thangrath-001",
  "endpoint": "https://wp.thangrath.go.th",
  "status": "active"  ← ✅ พบและ active
}
```
→ ได้ WP endpoint: `https://wp.thangrath.go.th`

---

**[17] → [18] GET WP Public Key**

```http
GET https://wp.thangrath.go.th/.well-known/provider-info
```

```json
{
  "provider_id": "wp-thangrath-001",
  "jwks": {
    "keys": [{
      "kid": "wp-key-001",
      "kty": "EC", "crv": "P-256",
      "x": "wp_pub_x", "y": "wp_pub_y"
    }]
  }
}
```

---

**[19] → [20] ตรวจสถานะ Wallet Instance**

```http
GET https://wp.thangrath.go.th/wallet-registry?wallet_id=wallet-instance-abc123
```

```json
{
  "wallet_id": "wallet-instance-abc123",
  "status": "registered",
  "valid": true,
  "revoked": false
}
```

> ถ้า `valid: false` หรือ `revoked: true` → DOPA ปฏิเสธทันที ไม่ออกบัตร

---

**[21] Verify ลายเซ็น wallet_attestation**

DOPA ตรวจ signature ของ Wallet Attestation JWT ด้วย WP Public Key:
```
signature ของ WA JWT + WP Public Key → verify สำเร็จ ✅
หมายความว่า WP ออก WA นี้จริง ไม่ถูกปลอม
```

---

**[21.1] Self-check credential type**

DOPA ตรวจว่าตัวเองออก `ThaiNationalIDCredential` ได้ไหม:
```
credential_configuration_id: "ThaiNationalIDCredential-config"
DOPA allowed_credential_types: ["ThaiNationalIDCredential-config", ...]  ✅
```

> **ทำไมต้องตรวจ:** เพื่อป้องกันการขอบัตรประเภทที่ DOPA ไม่ได้รับอนุมัติจาก ETDA

---

*(ต่อใน [§ 3.2.4 Issue VC, ตรวจ Issuer, Notification](05-issue-and-notify.md))*
