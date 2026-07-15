---
sidebar_position: 6
---

# 3.2.5 Trustlist Verification — รายละเอียดการตรวจสอบ (STEP 5.5 และ 6.5)

## 3.2.5 Trustlist Verification — รายละเอียดการตรวจสอบ (STEP 5.5 และ 6.5)

ต่อจาก [§ 3.2.4](05-issue-and-notify.md) ที่กล่าวถึงจุดตรวจ Trustlist โดยสรุปแล้ว บทนี้ขยายรายละเอียดของจุดตรวจทั้ง 2 จุด (STEP 5.5 และ 6.5) แบบ step-by-step พร้อม diagram เต็ม

ใน flow การออกบัตรประชาชนดิจิทัล มีจุดตรวจ Trustlist อยู่ **2 จุด** โดยแต่ละฝ่ายตรวจคนละบทบาท

| จุดตรวจ | ใครตรวจ | ตรวจอะไร | เกิดขึ้นตอนไหน |
|---------|---------|---------|----------------|
| STEP 5.5 | DOPA (Issuer) | Wallet Provider น่าเชื่อถือไหม? | ก่อนออกบัตร |
| STEP 6.5 | Wallet | DOPA (Issuer) น่าเชื่อถือไหม? | หลังรับบัตรมา |

---

##### STEP 5.5 — DOPA ตรวจ Wallet Provider

ก่อนออกบัตรให้ DOPA ต้องมั่นใจว่า Wallet ที่ขอรับบัตรเป็น Wallet ที่ ETDA รับรองแล้ว

```mermaid
%%{init: {"theme":"base","themeVariables":{"fontSize":"15px"},"flowchart":{"useMaxWidth":true,"htmlLabels":true,"curve":"linear"}}}%%
flowchart TD
    classDef input fill:#dbeafe,stroke:#1d4ed8,color:#1e3a8a
    classDef check fill:#fef9c3,stroke:#ca8a04,color:#713f12
    classDef pass fill:#dcfce7,stroke:#16a34a,color:#14532d
    classDef fail fill:#fee2e2,stroke:#dc2626,color:#7f1d1d
    classDef store fill:#f3f4f6,stroke:#6b7280,color:#374151

    WA["wallet_attestation JWT
    (แนบมาใน Credential Request)"]:::input

    TL[("Trustlist\n(DOPA เก็บไว้ใน Local Storage)")]:::store

    S1["① แกะ wallet_attestation\nได้ iss = Wallet Provider ID"]:::check
    S2["② Lookup WP ID ใน Trustlist\nตรวจว่า status = active?"]:::check
    S3["③ ดึง WP endpoint จาก Trustlist\nGET {endpoint}/.well-known/provider-info"]:::check
    S4["④ ได้ WP Public Key"]:::check
    S5["⑤ GET /wallet-registry?wallet_id=...\nตรวจสถานะ Wallet Instance"]:::check
    S6["⑥ Verify ลายเซ็น wallet_attestation\nด้วย WP Public Key"]:::check
    S7["⑦ ตรวจ aal และ security context\nอยู่ใน allowed_aal ของ entry?"]:::check
    S8["⑧ Self-check — credential_configuration_id\nอยู่ใน Issuer allowed_credential_types?"]:::check

    OK["✅ ผ่านทุกข้อ\nออกบัตรได้"]:::pass
    F1["❌ WP ไม่อยู่ใน Trustlist\nหรือ status ≠ active"]:::fail
    F2["❌ Wallet ถูก revoke\nหรือไม่ได้ลงทะเบียน"]:::fail
    F3["❌ ลายเซ็น wallet_attestation\nไม่ถูกต้อง"]:::fail
    F4["❌ aal ไม่ผ่านเกณฑ์"]:::fail
    F5["❌ ประเภท credential ไม่ได้รับอนุมัติ"]:::fail

    WA --> S1
    TL --> S2
    S1 --> S2
    S2 -->|"ไม่พบ หรือ inactive"| F1
    S2 -->|"พบ และ active"| S3 --> S4 --> S5
    S5 -->|"Wallet ถูก revoke"| F2
    S5 -->|"Wallet valid"| S6
    S6 -->|"ลายเซ็นผิด"| F3
    S6 -->|"ลายเซ็นถูก"| S7
    S7 -->|"aal ไม่ผ่าน"| F4
    S7 -->|"ผ่าน"| S8
    S8 -->|"ไม่อยู่ใน list"| F5
    S8 -->|"ผ่าน"| OK
```

**ข้อมูลที่ตรวจเทียบกับ Trustlist entry ของ WP:**

| ข้อมูลจาก wallet_attestation | เทียบกับ Trustlist entry | ต้องผ่าน |
|------------------------------|--------------------------|----------|
| `iss` (WP ID) | `entry.id` | พบและ status = active |
| ลายเซ็น JWT | `entry.public_key` (จาก WP endpoint) | verify สำเร็จ |
| `aal` (assurance level) | `entry.allowed_aal` | อยู่ใน list |
| `attested_security_context` | `entry.allowed_security_contexts` | อยู่ใน list |
| Wallet Instance ID | WP Registry | registered และ valid |
| `credential_configuration_id` (จาก Credential Request) | `Issuer.allowed_credential_types` | อยู่ใน list |

---

##### STEP 6.5 — Wallet ตรวจ Issuer (DOPA)

หลังได้รับบัตรมาแล้ว Wallet ต้องมั่นใจว่าบัตรนี้ออกโดย DOPA ที่ ETDA รับรองจริง และลายเซ็นไม่ถูกปลอมแปลง

```mermaid
%%{init: {"theme":"base","themeVariables":{"fontSize":"15px"},"flowchart":{"useMaxWidth":true,"htmlLabels":true,"curve":"linear"}}}%%
flowchart TD
    classDef input fill:#dbeafe,stroke:#1d4ed8,color:#1e3a8a
    classDef check fill:#fef9c3,stroke:#ca8a04,color:#713f12
    classDef pass fill:#dcfce7,stroke:#16a34a,color:#14532d
    classDef fail fill:#fee2e2,stroke:#dc2626,color:#7f1d1d
    classDef store fill:#f3f4f6,stroke:#6b7280,color:#374151
    classDef ietf fill:#fde8d8,stroke:#c2410c,color:#7c2d12

    VC["SD-JWT VC\n(IETF SD-JWT VC (dc+sd-jwt), typ:dc+sd-jwt)"]:::input

    TL_W[("Trustlist\n(Wallet Local Storage)")]:::store
    JWKS_E[("JWKS Endpoint\nhttps://issuer.dopa.go.th\n/.well-known/jwt-vc-issuer")]:::store
    SL_E[("statuslist+jwt\nhttps://status.dopa.go.th/statuslist/1")]:::ietf

    V1["① แกะ iss, jti, sub\nจาก JWT payload"]:::check
    V2["② Lookup iss ใน Trustlist\nstatus = active?"]:::check
    V2b["③ iss == issuer.id?\njti == id?"]:::check
    V3a["④ @context[0] ==\nhttps://www.w3.org/ns/credentials/v2?"]:::check
    V3b["⑤ type[0] == VerifiableCredential?\ntype[1] ∈ allowed_credential_types?"]:::check
    V4["⑥ GET JWKS Endpoint"]:::check
    V5b["⑦ kid matching\nหา key ใน JWKS ที่ kid ตรง\n→ publicKeyJwk"]:::check
    V6["⑧ Verify SD-JWT signature\nด้วย publicKeyJwk"]:::check
    V7["⑨ nbf == validFrom?\nvalidFrom ≤ now ≤ validUntil?\nsub == credentialSubject.id?"]:::check
    V8["⑩ GET statuslist+jwt\nAccept: application/statuslist+jwt"]:::check
    V9["⑪ Verify statuslist+jwt\niss == credential iss?\ntyp == statuslist+jwt? sub == uri?"]:::check
    V10["⑫ Decode lst\nbit[status_list.idx] == 0?"]:::check

    OK2["✅ ผ่านทุกข้อ\nบันทึกบัตรลง Wallet"]:::pass
    F1["❌ Issuer ไม่อยู่\nใน Trustlist"]:::fail
    F2["❌ iss/jti\nไม่ตรงกัน"]:::fail
    F3["❌ @context ผิด\nไม่ใช่ VC DM 2.0"]:::fail
    F4["❌ type ผิด\nหรือไม่ได้รับอนุมัติ"]:::fail
    F5["❌ JWKS ล้มเหลว"]:::fail
    F6["❌ kid ไม่พบ\nใน JWKS"]:::fail
    F7["❌ Signature\nไม่ถูกต้อง"]:::fail
    F8["❌ Validity\nไม่ผ่าน"]:::fail
    F9["❌ statuslist+jwt\nverify ล้มเหลว"]:::fail
    F10["❌ Revoked\nbit = 1"]:::fail

    VC --> V1
    TL_W --> V2
    V1 --> V2
    V2 -->|"ไม่พบ"| F1
    V2 -->|"active"| V2b
    V2b -->|"ไม่ตรง"| F2
    V2b -->|"ตรง"| V3a
    V3a -->|"ผิด"| F3
    V3a -->|"ถูก"| V3b
    V3b -->|"ผิด"| F4
    V3b -->|"ถูก"| V4
    JWKS_E --> V4
    V4 -->|"ล้มเหลว"| F5
    V4 -->|"สำเร็จ"| V5b
    V5b -->|"kid ไม่พบ"| F6
    V5b -->|"พบ"| V6
    V6 -->|"ล้มเหลว"| F7
    V6 -->|"สำเร็จ"| V7
    V7 -->|"ไม่ผ่าน"| F8
    V7 -->|"ผ่าน"| V8
    SL_E --> V8
    V8 --> V9
    V9 -->|"ล้มเหลว"| F9
    V9 -->|"ผ่าน"| V10
    V10 -->|"bit=1"| F10
    V10 -->|"bit=0"| OK2
```

**ข้อมูลที่ตรวจเทียบกับ Trustlist entry ของ Issuer:**

| ข้อมูลจาก SD-JWT VC | เทียบกับ Trustlist entry | ต้องผ่าน |
|---------------------|--------------------------|----------|
| `iss` | Trustlist `entry.credential_issuer` + == `issuer.id` | พบ + active + ตรง |
| `jti` | VC `id` field | `jti == id` (ต้องเท่ากัน) |
| `sub` | `credentialSubject.id` | `sub == credentialSubject.id` |
| `@context[0]` | `https://www.w3.org/ns/credentials/v2` | ต้องตรง |
| `type[0]` / `type[1]` | `"VerifiableCredential"` / `entry.allowed_credential_types` | ทั้งคู่พบ |
| `kid` (JOSE header) | JWKS `keys[].kid` | พบ key |
| SD-JWT signature | `publicKeyJwk` จาก JWKS | verify สำเร็จ |
| `nbf` ↔ `validFrom` | Unix ↔ ISO 8601 | ต้องตรงกัน |
| `validFrom` / `validUntil` | เวลาปัจจุบัน | `validFrom ≤ now ≤ validUntil` |
| `status.status_list.idx` | bit ใน `statuslist+jwt` | bit = 0 (valid) |

---

##### เปรียบเทียบ: ตรวจ Trustlist vs ไม่ตรวจ

```mermaid
%%{init: {"theme":"base","themeVariables":{"fontSize":"15px"},"flowchart":{"useMaxWidth":true,"htmlLabels":true,"curve":"linear"}}}%%
graph LR
    subgraph no_tl["❌ ไม่มี Trustlist"]
        N1["Wallet รับบัตรจากใครก็ได้"]
        N2["DOPA ออกบัตรให้ Wallet ใดก็ได้"]
        N3["ไม่มีใครการันตีว่าใครน่าเชื่อถือ"]
    end

    subgraph with_tl["✅ มี Trustlist (ETDA)"]
        W1["DOPA ตรวจก่อนออกบัตร\nว่า Wallet ผ่านมาตรฐาน ETDA"]
        W2["Wallet ตรวจก่อนรับบัตร\nว่า DOPA ได้รับอนุมัติจาก ETDA"]
        W3["ทั้งสองฝ่ายการันตีโดย ETDA"]
    end
```

---

*(ต่อใน [§ 3.2.6 Data Flow และ LoA/DPoP Policy](07-data-flow-and-policy.md))*
