---
sidebar_position: 1
---

# 3.1 กระบวนการออกเอกสาร (OID4VCI) — ภาพรวมและ Minimal Flow

บทนี้อธิบายกระบวนการออกเอกสาร (Verifiable Credential) ตามมาตรฐาน OID4VCI ตั้งแต่ **Minimal Flow** ที่เข้าใจง่าย (§ 3.1) ไปจนถึง **Full Flow** ฉบับเทคนิคเต็มรูปแบบ (§ 3.2) โดยใช้สถานการณ์ตัวอย่างเดียวกันตลอดทั้งบท

> **Protocol:** OID4VCI **1.0 Final** (openid-4-verifiable-credential-issuance-1_0)
> **VC Format:** IETF SD-JWT VC (dc+sd-jwt) + VC-JOSE-COSE (`typ: dc+sd-jwt`)
> **Status:** IETF Token Status List (`statuslist+jwt`)
> **Flow:** Pre-Authorized Code Flow (สำหรับ VC ทุกประเภท — ไม่ใช้ Authorization Code Flow)
> **Token Binding:** DPoP (RFC 9449) — บังคับสำหรับ **LoA ≥ 3**, แนะนำสำหรับ LoA 2 (ดู [§ 3.2.6.1](02-full-flow/07-data-flow-and-policy.md#32611-loa-แต่ละระดับหมายถึงอะไร))

**สถานการณ์:** ประชาชนขอรับ **บัตรประชาชนดิจิทัล** จากกรมการปกครอง (DOPA) เก็บไว้ในแอป Wallet บนมือถือ

> **หมายเหตุ:** ในตัวอย่างนี้ กรมการปกครอง (DOPA) ทำหน้าที่เป็นทั้ง Credential Issuer และ Authorization Server ในตัวเดียวกัน จึงไม่มีขั้นตอน AS Discovery แยกต่างหาก (Issuer ที่แยก Authorization Server ออกจาก Credential Issuer จะมีขั้นตอน AS Discovery เพิ่มเติมตามมาตรฐาน OID4VCI ซึ่งเอกสารฉบับนี้ยังไม่ครอบคลุมรายละเอียด)

---

## 3.1 Minimal Flow — ภาพรวมและจุดที่ Trust Model คุม

```mermaid
%%{init: {"theme":"base","themeVariables":{"fontSize":"15px"},"flowchart":{"useMaxWidth":true,"htmlLabels":true,"curve":"linear"}}}%%
sequenceDiagram
    actor User as 👤 ประชาชน
    participant W as 📱 Wallet
    participant WP as 🏢 Wallet Provider
    participant DOPA as 🏛️ กรมการปกครอง (DOPA)
    participant ETDA as 🛡️ ETDA Trustlist

    rect rgb(210, 240, 210)
        note over W,ETDA: 🟢 [ETDA คุม] SETUP — ดึง Trustlist (ต้องแนบ API Key)
        W->>ETDA: ขอรายชื่อผู้ที่ผ่านการรับรอง + API Key
        ETDA-->>W: Trustlist (WP, Issuer ที่อนุมัติแล้ว)
        DOPA->>ETDA: ขอรายชื่อผู้ที่ผ่านการรับรอง + API Key
        ETDA-->>DOPA: Trustlist
    end

    rect rgb(220, 240, 255)
        note over User,DOPA: 🔵 [OID4VCI] STEP 1 — รับคำเชิญ
        User->>DOPA: เข้าระบบ + กด ขอบัตรประชาชนดิจิทัล
        DOPA-->>User: QR Code + SMS OTP
        User->>W: สแกน QR
    end

    rect rgb(255, 237, 200)
        note over W,ETDA: 🟠 [ETDA Trust Model] STEP 1.5 — Early Trust Check: Issuer
        W->>W: ตรวจ credential_issuer จาก QR ใน Trustlist — active?
        W->>W: ตรวจ credential_type ใน QR ได้รับอนุมัติจาก ETDA?
    end

    rect rgb(220, 240, 255)
        note over User,W: 🔵 [OID4VCI] STEP 2–3 — ยืนยันตัวตน
        User->>W: กรอก OTP
    end

    rect rgb(220, 240, 255)
        note over W,DOPA: 🔵 [OID4VCI] STEP 4 — Token Request
        W->>DOPA: ส่ง OTP + รหัสลับจาก QR
        DOPA-->>W: access_token (บัตรผ่านชั่วคราว)
    end

    rect rgb(220, 240, 255)
        note over W,DOPA: 🔵 [OID4VCI] STEP 5 — ขอบัตรประชาชนดิจิทัล
        W->>DOPA: ส่งคำขอบัตร + แนบ Wallet Attestation
    end

    rect rgb(255, 237, 200)
        note over DOPA,WP: 🟠 [ETDA Trust Model] STEP 5.5 — ตรวจ Wallet Provider
        DOPA-->>DOPA: ตรวจว่า Wallet Provider นี้อยู่ใน Trustlist 
        DOPA->>WP: ตรวจว่า Wallet นี้อยู่ใน Wallet Provider
        WP-->>DOPA: ยืนยัน Wallet อยู่ใน Wallet Provider
        DOPA-->>DOPA: ตรวจว่า Wallet ไม่ถูกแก้ไข
    end

    rect rgb(220, 240, 255)
        note over W,DOPA: 🔵 [OID4VCI] STEP 6 — ออกบัตรประชาชนดิจิทัล
        DOPA-->>W: บัตรประชาชนดิจิทัล (SD-JWT VC)
    end

    rect rgb(255, 237, 200)
        note over W,ETDA: 🟠 [ETDA Trust Model] STEP 6.5 — ตรวจ Issuer
        W->>W: ตรวจว่า DOPA อยู่ใน Trustlist ไหม?
        W->>W: ตรวจลายเซ็นดิจิทัลของบัตร ✅
    end

    W-->>User: ✅ บันทึกบัตรประชาชนดิจิทัลสำเร็จ!
```

**สีกรอบในผังหมายถึงอะไร:**

| สี | หมายถึง | ใครกำหนด |
|----|---------|----------|
| 🟢 สีเขียว | ขั้นตอนที่ ETDA ดูแลโดยตรง (Trustlist) | ETDA |
| 🔵 สีน้ำเงิน | ขั้นตอนตามมาตรฐาน OID4VCI สากล | OpenID Foundation |
| 🟠 สีส้ม | จุดตรวจสอบ trust ว่าใครน่าเชื่อถือ | Trust Framework (ETDA) |
| ⚪ สีเทา | ขั้นตอนเตรียมการของ Wallet Provider | Wallet Provider |

**Trustlist Verification — จุดตรวจที่ ETDA คุม (2 จุดใน flow):**

```mermaid
%%{init: {"theme":"base","themeVariables":{"fontSize":"15px"},"flowchart":{"useMaxWidth":true,"htmlLabels":true,"curve":"linear"}}}%%
flowchart TD
    classDef store fill:#e2e3e5,stroke:#6c757d,color:#343a40
    classDef check fill:#fff3cd,stroke:#ffc107,color:#856404
    classDef pass fill:#d4edda,stroke:#28a745,color:#155724
    classDef fail fill:#f8d7da,stroke:#721c24,color:#721c24
    classDef src fill:#cce5ff,stroke:#0056b3,color:#003d80

    ETDA[("🛡️ ETDA Trustlist")]:::src
    TL_W[("📱 Wallet Local Trustlist\n• Issuer DID")]:::store
    TL_D[("🏛️ DOPA Local Trustlist\n• WP ID → endpoint")]:::store
    ETDA -->|"SETUP ดึงก่อนใช้งาน (API Key required) "| TL_W & TL_D

    subgraph step55["🟠 STEP 5.5 — DOPA ตรวจ Wallet Provider (ก่อนออกบัตร)"]
        WP_ID["① ดึง Wallet Provider ID(iss) \nจาก wallet_attestation"]:::check
        WP_EP{"② ตรวจ Wallet Provider\nอยู่ใน Trustlistไหม"}:::check
        WP_PK["③ ดึง Public Key\nของ Wallet Provider"]:::check
        WP_ST["④ ตรวจสถานะ Wallet\nยังใช้งานได้อยู่ไหม"]:::check
        WP_VF{"⑤ ตรวจ Wallet_attestation\nใน Wallet"}:::check
        WP_CT["⑥ ตรวจประเภทบัตร\nว่าได้รับอนุมัติไว้ไหม?"]:::check
        OK1["✅ ออกบัตรได้"]:::pass
        FL1["❌ ปฏิเสธ"]:::fail
        FL2["❌ ประเภทบัตรไม่ได้รับอนุมัติ"]:::fail
        TL_D -.->|"ดึงข้อมูล"| WP_EP
        WP_ID --> WP_EP --> WP_PK & WP_ST --> WP_VF
        WP_EP -->|"ไม่ได้รับอนุมัติ"| FL2
        WP_VF -->|"ลายเซ็นถูกต้อง"| WP_CT
        WP_VF -->|"ลายเซ็นผิด"| FL1
        WP_CT -->|"ได้รับอนุมัติ"| OK1
        WP_CT -->|"ไม่ได้รับอนุมัติ"| FL2
    end

    subgraph step65["🟠 STEP 6.5 — Wallet ตรวจ Issuer (หลังรับบัตร)"]
        IS_DID["① แกะ Issuer DID\nจาก SD-JWT VC"]:::check
        IS_TL["② ตรวจ DID\nใน Local Trustlist"]:::check
        IS_PK["③ Resolve DID\n→ Public Key"]:::check
        IS_VF{"④ Verify VC signature"}:::check
        OK2["✅ บันทึกบัตร"]:::pass
        FL3["❌ ทิ้งบัตร"]:::fail
        TL_W -.->|"ดึงข้อมูล"| IS_TL
        IS_DID --> IS_TL --> IS_PK --> IS_VF
        IS_VF -->|"ลายเซ็นถูกต้อง"| OK2
        IS_VF -->|"ลายเซ็นผิด"| FL3
    end
```

---

### 3.1.1 คำอธิบายแต่ละขั้นตอน (สำหรับผู้อ่านทั่วไป)

**ภาพรวม:** เปรียบได้กับการไปทำบัตรประชาชนที่อำเภอ แต่ทำทั้งหมดผ่านมือถือ โดยมี ETDA รับประกันว่าทุกคนในระบบ (กรมการปกครอง, แอป Wallet) ผ่านการตรวจสอบมาแล้ว

**🟢 ก่อนเริ่ม — SETUP (ETDA คุม)**

Wallet และ DOPA ดึง ETDA Public Key จาก `/.well-known/trust-anchor` แล้วดึง Trustlist (พร้อม API Key) มาเก็บไว้ใน Local Storage ใช้สำหรับ verify ทุกขั้นตอนที่ต้องตรวจ trust

**🔵 STEP 1 — รับคำเชิญ (OID4VCI)**

เราเข้าเว็บไซต์บริการประชาชนของกรมการปกครอง แล้วกดขอบัตรประชาชนดิจิทัล ระบบจะแสดง QR Code บนหน้าจอ และส่ง OTP มาทาง SMS เราเปิดแอป Wallet สแกน QR Code นั้น แค่นี้แอปก็รู้แล้วว่าจะไปขอบัตรจากที่ไหน

**🔵 STEP 2 — ดูข้อมูลผู้ออกบัตร (OID4VCI)**

แอป Wallet ดึงข้อมูลเบื้องต้นจากกรมการปกครองมาก่อน เช่น บัตรแบบไหนออกได้ ใช้รูปแบบข้อมูลอะไร และต้องส่งคำขอไปที่ endpoint ไหน เปรียบเหมือนอ่านป้ายประกาศหน้าเคาน์เตอร์ก่อนกรอกแบบฟอร์ม

**[7.1] Scope Validation** — แอปตรวจว่า `credential_configurations_supported` มีประเภทบัตรที่ต้องการหรือไม่ ถ้าไม่พบ → หยุดทันที ไม่ส่งคำขอต่อ

**🔵 STEP 3 — ยืนยันตัวตนด้วย OTP (OID4VCI)**

แอปถามว่า "กรุณากรอก OTP ที่ได้รับทาง SMS" เราพิมพ์รหัส OTP เข้าไป นี่คือการยืนยันว่าเราเป็นเจ้าของเบอร์โทรนั้นจริง

**🔵 STEP 4 — แลกบัตรผ่านชั่วคราว (OID4VCI)**

แอปนำ OTP และรหัสลับจาก QR ไปยื่นให้กรมการปกครอง แล้วได้ "access_token" กลับมา เปรียบเหมือนบัตรคิวที่ใช้ได้แค่ 5 นาที สำหรับขั้นตอนถัดไป

**🔵 STEP 5 — ขอรับบัตรประชาชนดิจิทัล (OID4VCI)**

แอปสร้าง key คู่ (กุญแจส่วนตัว + กุญแจสาธารณะ) บนมือถือของเรา แล้วส่งคำขอบัตรพร้อมแนบ "Wallet Attestation" (หลักฐานว่าแอปนี้ผ่านการรับรองแล้ว) ไปให้กรมการปกครอง

**🟠 STEP 5.5 — กรมการปกครองตรวจ Wallet Provider (ETDA Trust Model)**

DOPA ตรวจ 6 ขั้นตอน: (1) แกะ WP ID จาก `wallet_attestation` → (2) หา WP endpoint จาก Trustlist → (3) ดึง WP Public Key และสถานะ Wallet → (4) ตรวจลายเซ็น WA → (5) ตรวจ aal → (6) ตรวจประเภทบัตรด้วยตัวเอง

ถ้าขั้นตอนใดล้มเหลว → ปฏิเสธทันที ไม่ออกบัตร

**🔵 STEP 6 — ออกบัตรประชาชนดิจิทัล (OID4VCI + IETF SD-JWT VC (dc+sd-jwt))**

กรมการปกครองสร้าง SD-JWT VC ตามมาตรฐาน IETF SD-JWT VC (dc+sd-jwt) มีโครงสร้าง 3 ชั้น:

- **JOSE Header:** `typ: dc+sd-jwt`, `alg: ES256`, `kid: https://issuer.dopa.go.th#key-2025-1`
- **JWT Claims:** `iss`, `sub`, `jti`, `nbf`, `exp`, `cnf.jwk`, `_sd_alg: sha-256`, `status.status_list` (IETF Token Status List)
- **VC Body (IETF SD-JWT VC (dc+sd-jwt)):** `@context`, `type: [VerifiableCredential, ThaiNationalIDCredential]`, `issuer: {id, name}`, `validFrom`, `validUntil`, `credentialSubject: {id, ชื่อ, เลขบัตร, วันเกิด}`, `credentialSchema`, `_sd: [...]`

**🟠 STEP 6.5 — Wallet ตรวจ Issuer + VC (IETF SD-JWT VC (dc+sd-jwt))**

เมื่อได้รับบัตร Wallet ตรวจ 3 กลุ่มก่อนบันทึก:
1. **ตัวตนผู้ออกบัตร** — เช็คว่าผู้ออกบัตรอยู่ใน Trustlist หรือไม่
2. **ลายเซ็น + อายุ** — เช็คว่าลายเซ็นบนบัตรถูกต้องและยังไม่หมดอายุ
3. **สถานะบัตร** — เช็คกับ statuslist ว่าบัตรยังไม่ถูกยกเลิก

ถ้าขั้นใดไม่ผ่าน → Wallet จะทิ้งบัตรและไม่บันทึกลงในแอป

**🔵 STEP 7 — แจ้งว่ารับบัตรแล้ว (OID4VCI, Optional)**

แอปแจ้งกลับไปยังกรมการปกครองว่าได้รับบัตรเรียบร้อยแล้ว เป็นขั้นตอนเสริมเพื่อให้ระบบของกรมการปกครองรู้ว่าออกบัตรสำเร็จ

---

