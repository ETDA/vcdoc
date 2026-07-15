---
sidebar_position: 7
---

# 3.2.6 Data Flow และ LoA/DPoP Policy — รายละเอียดเพิ่มเติม

## 3.2.6 Data Flow และ LoA/DPoP Policy

ต่อจาก [§ 3.2.5](06-verification-details.md) ที่อธิบายจุดตรวจ Trustlist แบบละเอียดแล้ว บทนี้สรุปว่าแต่ละ STEP ใช้ข้อมูลอะไรบ้าง (Data Flow) และอธิบายนโยบาย LoA/DPoP ที่ควบคุมความเข้มของการป้องกัน token — เป็นบทสุดท้ายของ Issuance Flow (บทที่ 3)

##### ● SETUP — เตรียมข้อมูลก่อนเริ่ม

```mermaid
%%{init: {"theme":"base","themeVariables":{"fontSize":"15px"},"flowchart":{"useMaxWidth":true,"htmlLabels":true,"curve":"linear"}}}%%
flowchart LR
    classDef req fill:#d4edda,stroke:#28a745,color:#155724
    classDef store fill:#e2e3e5,stroke:#6c757d,color:#343a40
    classDef src fill:#cce5ff,stroke:#0056b3,color:#003d80
    classDef key fill:#fff3cd,stroke:#ffc107,color:#856404
    classDef pin fill:#f3e8ff,stroke:#7c3aed,color:#4c1d95

    ETDA[("🛡️ ETDA")]:::src
    WP_SRC[("🏢 Wallet Provider")]:::src

    ETDA_PK["🔐 ETDA Public Key\n(pre-pinned ตอน install/deploy)\nใช้ verify Trustlist JWS"]:::pin
    APIKEY["🔑 API Key\n(ออกโดย ETDA หลังลงทะเบียน)"]:::key

    TL["Trustlist + TTL
• WP ID → endpoint
• Issuer DID list
• Verifier DID list
• exp (วันหมดอายุ)"]:::req
    WA["Wallet Attestation JWT
• iss: WP ID
• sub: Wallet Instance ID
• cnf.jwk: Wallet PubKey
• aal: assurance level"]:::req

    W_LS[("📱 Wallet\nLocal Storage")]:::store
    D_LS[("🏛️ DOPA\nLocal Storage")]:::store

    ETDA_PK -->|"pre-installed"| W_LS & D_LS
    APIKEY -->|"Authorization: Bearer"| ETDA
    ETDA --> TL
    TL -->|"✅ จำเป็น"| W_LS & D_LS
    WP_SRC --> WA
    WA -->|"✅ จำเป็น"| W_LS
```

| ข้อมูล | มาจาก | จำเป็น | ใช้เมื่อไหน |
|--------|-------|--------|----------|
| ETDA Public Key | pre-pinned ตอน install/deploy | ✅ | SETUP — verify Trustlist JWS signature |
| API Key | ETDA (ออกให้หลังลงทะเบียน) | ✅ | SETUP — ใช้ดึง Trustlist (Authorization header) |
| Trustlist | ETDA | ✅ | STEP 5.5 และ 6.5 (lookup) |
| Wallet Attestation JWT | Wallet Provider | ✅ | STEP 5 (แนบใน Credential Request) |

---

##### ● STEP 1–3 — Credential Offer + Discovery + OTP

```mermaid
%%{init: {"theme":"base","themeVariables":{"fontSize":"15px"},"flowchart":{"useMaxWidth":true,"htmlLabels":true,"curve":"linear"}}}%%
flowchart LR
    classDef req fill:#d4edda,stroke:#28a745,color:#155724
    classDef opt fill:#fff3cd,stroke:#ffc107,color:#856404
    classDef src fill:#cce5ff,stroke:#0056b3,color:#003d80

    DOPA[("🏛️ DOPA")]:::src

    QR["Credential Offer (QR)
• credential_issuer URL ✅
• credential_configuration_ids ✅
• pre_authorized_code ✅"]:::req

    OTP["SMS OTP = tx_code ✅"]:::req

    META["Credential Issuer Metadata
• token_endpoint ✅
• credential_endpoint ✅
• credential_configurations_supported ✅
• display (UI) ⚠️"]:::req

    DOPA --> QR & OTP
    DOPA -->|"GET /.well-known/\nopenid-credential-issuer"| META
```

| ข้อมูล | มาจาก | จำเป็น | ใช้เมื่อไหน |
|--------|-------|--------|----------|
| `pre_authorized_code` | QR Code | ✅ | STEP 4 (POST /token) |
| `tx_code` (OTP) | SMS | ✅ | STEP 4 (POST /token) |
| `token_endpoint` | Credential Issuer Metadata | ✅ | STEP 4 (URL ที่จะ call) |
| `credential_endpoint` | Credential Issuer Metadata | ✅ | STEP 5 (URL ที่จะ call) |
| `credential_configuration_id` | QR Code (`credential_configuration_ids`) | ✅ | STEP 5 (ระบุประเภทบัตรใน Credential Request), [7.1] ตรวจกับ Metadata |
| `display` | Credential Issuer Metadata | ⚠️ เสริม | แสดงชื่อ/โลโก้ใน UI เท่านั้น |

---

##### ● STEP 4–5 — Token Request + Credential Request

```mermaid
%%{init: {"theme":"base","themeVariables":{"fontSize":"15px"},"flowchart":{"useMaxWidth":true,"htmlLabels":true,"curve":"linear"}}}%%
flowchart TD
    classDef req fill:#d4edda,stroke:#28a745,color:#155724
    classDef store fill:#e2e3e5,stroke:#6c757d,color:#343a40

    subgraph token_req["POST /token"]
        TR["grant_type: pre-authorized_code ✅\npre_authorized_code ✅\ntx_code (OTP) ✅"]:::req
    end

    subgraph token_res["ผล Token Response"]
        AT["access_token ✅"]:::req
        CN["c_nonce ✅"]:::req
    end

    subgraph cred_req["POST /credential"]
        CR["Bearer: access_token ✅\ncredential_configuration_id ✅\nproof.jwt ✅\nwallet_attestation ✅"]:::req
    end

    subgraph proof_build["🔐 Wallet สร้าง proof.jwt"]
        KP["Key Pair\n(Private Key เก็บในเครื่อง) ✅"]:::req
        JP["JWT signed\nด้วย Private Key + c_nonce ✅"]:::req
        KP --> JP
    end

    QR_S[("จาก QR (STEP 1)")]:::store --> TR
    OTP_S[("จาก SMS (STEP 3)")]:::store --> TR
    TR --> AT & CN
    CN --> JP
    AT --> CR
    JP --> CR
    WA_S[("จาก SETUP")]:::store --> CR
    META_S[("จาก Metadata (STEP 2)")]:::store --> CR
```

| ข้อมูล | มาจาก | จำเป็น | หมายเหตุ |
|--------|-------|--------|----------|
| `access_token` | Token Response | ✅ | บัตรผ่านเข้า /credential |
| `token_type` | Token Response | ✅ | `DPoP` (LoA ≥ 3) หรือ `Bearer` (LoA 1) |
| `c_nonce` | Token Response | ✅ | ป้องกัน replay ใน proof |
| DPoP key pair | สร้างใน step [9.1] | ✅ (LoA ≥ 3) | private key เก็บใน Trusted Execution Environment (TEE) |
| DPoP Proof JWT | Wallet สร้างใหม่ทุก request | ✅ (LoA ≥ 3) | แนบเป็น `DPoP` header |
| Private Key | สร้างในเครื่อง | ✅ | ผูกบัตรกับ Wallet นี้ |
| `proof.jwt` | Wallet สร้างเอง | ✅ | พิสูจน์ควบคุม key |
| `credential_configuration_id` | QR Code (STEP 1) | ✅ | ระบุประเภทบัตรใน Credential Request |
| `wallet_attestation` | SETUP | ✅ | DOPA ใช้ตรวจ WP ใน STEP 5.5 |

---

##### ● STEP 5.5 — Trustlist Verification: Wallet Provider

```mermaid
%%{init: {"theme":"base","themeVariables":{"fontSize":"15px"},"flowchart":{"useMaxWidth":true,"htmlLabels":true,"curve":"linear"}}}%%
flowchart LR
    classDef req fill:#d4edda,stroke:#28a745,color:#155724
    classDef check fill:#fff3cd,stroke:#ffc107,color:#856404
    classDef store fill:#e2e3e5,stroke:#6c757d,color:#343a40
    classDef pass fill:#d4edda,stroke:#28a745,color:#155724
    classDef fail fill:#f8d7da,stroke:#721c24,color:#721c24

    WA["wallet_attestation
(INPUT)"]:::req
    TL[("🏛️ DOPA\nLocal Trustlist")]:::store
    WP[("🏢 Wallet Provider")]:::store

    C1["① WP ID"]:::check
    C2["② WP endpoint"]:::check
    C3["③ WP Public Key"]:::check
    C4["④ Wallet status"]:::check
    C5{"⑤ Verify
signature"}:::check
    C6["⑥ Self-check
credential_configuration_id"]:::check

    OK["✅ → ออกบัตร"]:::pass
    NG["❌ → ปฏิเสธ (sig)"]:::fail
    NG2["❌ → ปฏิเสธ (type)"]:::fail

    WA --> C1
    TL -->|"ใช้ lookup"| C2
    C1 --> C2 --> C3
    WP --> C3 & C4
    C3 & C4 --> C5
    C5 -->|"ผ่าน"| C6
    C5 -->|"ล้มเหลว"| NG
    C6 -->|"อนุมัติ"| OK
    C6 -->|"ไม่อนุมัติ"| NG2
```

| ข้อมูล | มาจาก | ตรวจอะไร |
|--------|-------|----------|
| WP ID | wallet_attestation | ใช้ lookup ใน Trustlist |
| WP endpoint | Local Trustlist | URL ที่จะถาม WP |
| WP Public Key | GET WP endpoint | ใช้ verify ลายเซ็น WA |
| Wallet status | GET /wallet-registry | ตรวจว่า Wallet ยังใช้งานได้ไหม |
| `credential_configuration_id` | Credential Request | ตรวจ Issuer allowed_credential_types (self-check ⑥) |

---

##### ● STEP 6–6.5 — Issue VC + Trustlist Verification: Issuer

```mermaid
%%{init: {"theme":"base","themeVariables":{"fontSize":"15px"},"flowchart":{"useMaxWidth":true,"htmlLabels":true,"curve":"linear"}}}%%
flowchart LR
    classDef req fill:#d4edda,stroke:#28a745,color:#155724
    classDef opt fill:#fff3cd,stroke:#ffc107,color:#856404
    classDef check fill:#fff3cd,stroke:#ffc107,color:#856404
    classDef store fill:#e2e3e5,stroke:#6c757d,color:#343a40
    classDef pass fill:#d4edda,stroke:#28a745,color:#155724
    classDef fail fill:#f8d7da,stroke:#721c24,color:#721c24

    subgraph vc["SD-JWT VC ที่ DOPA สร้าง (IETF SD-JWT VC (dc+sd-jwt))"]
        VC_C["— JOSE Header —\ntyp:dc+sd-jwt ✅  alg:ES256 ✅  kid:... ✅\n— JWT Claims —\niss, sub, jti, nbf, exp, cnf.jwk ✅\n_sd_alg:sha-256 ✅\nstatus.status_list:{idx:42, uri:...} ✅\n— VC Body (IETF SD-JWT VC (dc+sd-jwt)) —\n@context:[w3.org/ns/credentials/v2,...] ✅\ntype:[VerifiableCredential, ThaiNationalIDCredential] ✅\nissuer:{id, name} ✅\nvalidFrom / validUntil ✅\ncredentialSubject:{id, ชื่อ, เลขบัตร, วันเกิด} ✅\ncredentialSchema ✅\n_sd:[digest_ที่อยู่, digest_รูปภาพ] ⚠️"]:::req
    end

    subgraph verify["Wallet ตรวจ (STEP 6.5) — 16 ขั้น"]
        V1["① iss/jti/sub + Trustlist\n+ @context + type"]:::check
        V2["② GET JWKS → kid\n→ Verify signature"]:::check
        V3["③ validFrom/validUntil\n+ sub check"]:::check
        V4["④ GET statuslist+jwt\n→ bit[idx]=0"]:::check
        OK["✅ บันทึกบัตร"]:::pass
        NG["❌ ทิ้งบัตร"]:::fail
        V1 --> V2 --> V3 --> V4
        V4 -->|"ผ่าน"| OK
        V4 -->|"ล้มเหลว"| NG
    end

    TL_W[("📱 Wallet\nLocal Trustlist")]:::store
    JWKS_S[("🔑 JWKS Endpoint")]:::store
    SL_S[("📋 statuslist+jwt")]:::store

    vc --> V1
    TL_W -.->|"ใช้ lookup"| V1
    JWKS_S -->|"ได้ publicKeyJwk"| V2
    SL_S -->|"ได้ statuslist+jwt"| V4
```

| ข้อมูลใน VC | มาจาก | จำเป็น | หมายเหตุ |
|-----------|-------|--------|----------|
| JOSE `typ: dc+sd-jwt` | DOPA | ✅ | ระบุ format ให้ Wallet/Verifier รู้ |
| `iss` | DOPA | ✅ | = `issuer.id` (ต้องตรงกัน) |
| `sub` | Wallet (จาก proof.jwt) | ✅ | = `credentialSubject.id` |
| `jti` | DOPA | ✅ | = VC `id` field (ต้องตรงกัน) |
| `nbf` / `exp` | DOPA | ✅ | = `validFrom` / `validUntil` (Unix timestamp) |
| `_sd_alg: sha-256` | DOPA | ✅ | บังคับระบุ สำหรับ SD verification |
| `status.status_list` | DOPA | ✅ | IETF Token Status List `{idx, uri}` |
| `@context` | W3C + DOPA context | ✅ | JSON-LD semantics |
| `type` | DOPA | ✅ | `[VerifiableCredential, ThaiNationalIDCredential]` |
| `issuer: {id, name}` | DOPA | ✅ | object form |
| `validFrom` / `validUntil` | DOPA | ✅ | ISO 8601 ใน VC body |
| `credentialSubject` | ฐานข้อมูล DOPA | ✅ | ห่อทุก claims (ชื่อ, เลขบัตร, วันเกิด) |
| `credentialSchema` | DOPA | ✅ | JSON Schema URL |
| `_sd` (SD claims) | DOPA | ⚠️ เสริม | digest ของ `ที่อยู่`, `รูปภาพ` |
| `cnf.jwk` (Wallet PubKey) | จาก proof.jwt STEP 5 | ✅ | Holder Binding |
| JWKS | `issuer.dopa.go.th/.well-known/jwt-vc-issuer` | ✅ | ดึง `publicKeyJwk` มา verify |
| `statuslist+jwt` | `status.dopa.go.th/statuslist/1` | ✅ | IETF Token Status List |

---

##### ● STEP 7 — Notification (Optional)

| ข้อมูล | มาจาก | จำเป็น | หมายเหตุ |
|--------|-------|--------|----------|
| `notification_id` | Credential Response (jti ของ VC) | ⚠️ เสริม | ระบุว่า VC ใบไหน |
| `event` | Wallet กำหนด | ⚠️ เสริม | `credential_accepted` หรือ `credential_failure` |

> STEP 7 เป็น Optional — ถ้า Wallet ส่ง DOPA จะบันทึก audit log ว่าบัตรถูกรับแล้ว
> ถ้าไม่ส่ง — ไม่กระทบการใช้งานบัตร แต่ DOPA ไม่รู้ว่าบัตรถูกรับหรือเปล่า

---


### 3.2.6.1 LoA และ DPoP Policy

> **LoA (Level of Assurance)** = ระดับความมั่นใจในตัวตนของผู้ถือ VC
> ยิ่ง LoA สูง → ข้อมูลอ่อนไหวมากขึ้น → ต้องป้องกัน token ให้แข็งแกร่งขึ้น

---

#### 3.2.6.1.1 LoA แต่ละระดับหมายถึงอะไร?

| LoA | ความหมาย | วิธียืนยันตัวตน | ตัวอย่าง VC (ไทย) |
|-----|---------|----------------|-----------------|
| **LoA 1** | ความเชื่อมั่นต่ำ — สมัครด้วยตัวเอง ไม่ verify | กรอกชื่อเองโดยไม่ต้องพิสูจน์ | บัตรสมาชิก, Loyalty card |
| **LoA 2** | ความเชื่อมั่นปานกลาง — verify เอกสาร online | สแกนบัตร + OTP ออนไลน์ | ใบขับขี่ดิจิทัล, ใบรับรองวิชาชีพ |
| **LoA 3** | ความเชื่อมั่นสูง — verify ใบหน้า + เอกสาร | Biometric + เอกสารจริง (เช่น DOPA) | **บัตรประชาชน**, หนังสือเดินทาง |
| **LoA 4** | ความเชื่อมั่นสูงมาก — hardware key + biometric | Hardware token + ยืนยันตัวตน in-person | บัตรสุขภาพระดับสูง |

> **บัตรประชาชนดิจิทัลใน section 5.1 = LoA 3** ตามมาตรฐาน ETDA และ NIST SP 800-63

---

#### 3.2.6.1.2 DPoP คืออะไร ทำไมต้องมี?

**DPoP (Demonstrating Proof of Possession)** ผูก access_token กับ key ของ Wallet โดยเฉพาะ — ขโมย token ไปใช้จากที่อื่นไม่ได้

**โดยไม่มี DPoP:**
```
Wallet ได้ access_token "eyJhbG..." ← Bearer token
Attacker ขโมย token ไป
Attacker POST /credential + token ที่ขโมยมา → ได้บัตรของเหยื่อ 😱
```

**เมื่อมี DPoP:**
```
Wallet สร้าง DPoP key pair (private key อยู่ใน Wallet เท่านั้น)
Wallet ได้ access_token ที่ผูกกับ DPoP public key
Attacker ขโมย token ไป แต่ไม่มี DPoP private key
Attacker POST /credential → DOPA ตรวจ DPoP ไม่ผ่าน → 401 ❌
```

---

#### 3.2.6.1.3 DPoP Policy: ใช้เมื่อไหร่?

| LoA | tx_code (OTP) | Wallet Attestation | DPoP | เหตุผล |
|-----|-------------|-------------------|------|--------|
| **LoA 1** | ⚪ ไม่บังคับ | ⚪ ไม่บังคับ | ⚪ ไม่บังคับ — Bearer OK | ข้อมูลไม่ sensitive ถ้าหายออกใหม่ได้ง่าย |
| **LoA 2** | ✅ แนะนำ | 🟡 แนะนำ | 🟡 แนะนำ (SHOULD) | ข้อมูลสำคัญ ควรป้องกัน |
| **LoA 3** | ✅ บังคับ | ✅ บังคับ | ✅ บังคับ (MUST) | ข้อมูล identity หลัก — HAIP กำหนด |
| **LoA 4** | ✅ บังคับ | ✅ บังคับ | ✅ บังคับ + hardware key | ข้อมูลอ่อนไหวสูงสุด |

---

#### 3.2.6.1.4 DPoP ทำงานอย่างไรใน Pre-Auth Flow?

DPoP เพิ่มใน 2 จุด — **STEP 4** (แลก token) และ **STEP 5** (ขอบัตร)

```mermaid
%%{init: {"theme":"base","themeVariables":{"fontSize":"15px"},"flowchart":{"useMaxWidth":true,"htmlLabels":true,"curve":"linear"}}}%%
sequenceDiagram
    participant W as 📱 Wallet
    participant DOPA as 🏛️ DOPA

    Note over W: ก่อน STEP 4 — สร้าง DPoP key pair
    W->>W: [9.1] DPoP private key → Trusted Execution Environment (TEE)

    rect rgb(220, 240, 255)
        Note over W,DOPA: STEP 4 — POST /token
        W->>W: สร้าง DPoP Proof { htu:/token, htm:POST, jti:abc }
        W->>DOPA: POST /token + DPoP-Proof: eyJ...
        DOPA->>DOPA: verify DPoP → ผูก token กับ DPoP public key
        DOPA-->>W: access_token (token_type: DPoP)
    end

    rect rgb(220, 240, 255)
        Note over W,DOPA: STEP 5 — POST /credential
        W->>W: สร้าง DPoP Proof ใหม่ { htu:/credential, jti:xyz }
        Note over W: ⚠️ jti ต้องใหม่ทุก request — ห้ามนำ proof เก่ามาใช้ซ้ำ
        W->>DOPA: POST /credential + Authorization: DPoP {token} + DPoP-Proof: eyJ...
        DOPA->>DOPA: verify DPoP key ตรงกับที่ผูกไว้ + jti ไม่ซ้ำ
        DOPA-->>W: SD-JWT VC ✅
    end
```

---

#### 3.2.6.1.5 Trustlist Entry ต้องระบุ LoA และ DPoP requirement

เพื่อให้ Issuer รู้ว่า VC ประเภทนี้ต้องบังคับ DPoP ระดับไหน:

```json
// ตัวอย่าง entry ใน Trustlist สำหรับ credential configuration
{
  "credential_configuration_id": "ThaiNationalIDCredential-config",
  "required_loa": 3,
  "require_dpop": true,
  "require_wallet_attestation": true,
  "require_tx_code": true
}
```

```json
{
  "credential_configuration_id": "MembershipCard-config",
  "required_loa": 1,
  "require_dpop": false,
  "require_wallet_attestation": false,
  "require_tx_code": false
}
```

---

#### 3.2.6.1.6 สิ่งที่ Issuer ต้องตรวจใน STEP 4 ตาม LoA

| การตรวจ | LoA 1 | LoA 2 | LoA 3 | LoA 4 |
|---------|:-----:|:-----:|:-----:|:-----:|
| `pre_authorized_code` valid + single-use | ✅ | ✅ | ✅ | ✅ |
| `tx_code` (OTP) ถูกต้อง | ⚪ | ✅ | ✅ | ✅ |
| Wallet Attestation ถูกต้อง | ⚪ | 🟡 | ✅ | ✅ |
| DPoP-Proof header มีและถูกต้อง | ⚪ | 🟡 | ✅ | ✅ |
| DPoP `jti` ไม่ซ้ำ (replay protection) | ⚪ | 🟡 | ✅ | ✅ |
| Hardware-backed key | ⚪ | ⚪ | ⚪ | ✅ |

---

จบเนื้อหาบทที่ 3 (กระบวนการออกเอกสาร) ทั้งหมด — บทถัดไปคือ [บทที่ 4 กระบวนการแสดงเอกสาร (OID4VP)](../../04-presentation-flow/01-overview/index.md) ซึ่งอธิบายว่าเมื่อ Holder มี VC อยู่ใน Wallet แล้ว จะแสดงให้ Verifier ตรวจสอบอย่างไร
