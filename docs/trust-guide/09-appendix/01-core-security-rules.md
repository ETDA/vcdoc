# ภาคผนวก ก — Trust List ถูกใช้ที่ไหนบ้าง และหลักการตรวจสอบความปลอดภัยพื้นฐาน (Core Security Rules)

ภาคผนวกนี้รวม **แผนที่จุดตรวจ Trust List ทั้งหมด** และ **ลำดับการตรวจสอบความปลอดภัยพื้นฐาน (Core Security Rules)** ที่ทุก flow ในคู่มือใช้ร่วมกัน แยกมาไว้ท้ายเล่มเพื่อให้ใช้เป็นแผ่นสรุป (cheat sheet) ที่เปิดดูได้เร็ว โดยไม่ต้องไล่อ่านทีละบท

เนื้อหาส่วนนี้เคยอยู่ในเนื้อบทหลัก ก่อนถูกย้ายมารวมไว้เป็นภาคผนวก ดูรายละเอียดของแต่ละจุดในบริบทจริงได้ที่ [บทที่ 3 การออกเอกสาร (OID4VCI)](../03-issuance-flow/01-minimal-flow.md) และ [บทที่ 4 การแสดงเอกสาร (OID4VP)](../04-presentation-flow/01-overview/index.md)

## ก.1 ภาพรวม — Trust List ถูกใช้ทุกครั้งที่ต้องตัดสินใจเรื่อง trust (จุดตรวจที่ 1–6)

แต่ละ Entity นำ Trust List ที่ cache ไว้ ไปใช้ตรวจสอบคู่สื่อสาร — แบ่งเป็น 2 flow รวม **จุดตรวจที่ 1–6** เรียงตามลำดับเวลา (เลขในวงเล็บคือ step ใน flow เต็มของ [บทที่ 3](../03-issuance-flow/02-full-flow/02b-full-flow-technical-detail.md) และ [บทที่ 4](../04-presentation-flow/02-full-flow/02b-full-flow-technical-detail.md))

**Flow ออก VC (OID4VCI) — จุดตรวจที่ 1–3:**

```mermaid
%%{init: {"theme":"base","themeVariables":{"fontSize":"15px"},"flowchart":{"useMaxWidth":true,"htmlLabels":true,"curve":"linear"}}}%%
flowchart TB
    subgraph S0["🟡 จุดตรวจที่ 1 — Wallet ตรวจ Issuer ก่อนขอบัตร (STEP 3.1)"]
        direction LR
        WAL0["📱 Wallet"] -->|"① รับ Credential Offer\n(สแกน QR)"| CHK0
        CHK0{"② เช็คว่า Issuer\nอยู่ใน Trust List"}
        CHK0 -->|"✅ อยู่"| OK0["③ ให้ User กรอก\nTransaction Code ต่อ"]
        CHK0 -->|"❌ ไม่อยู่"| NO0["③ หยุด ไม่ส่ง\nTransaction Code"]
    end

    subgraph S1["🟠 จุดตรวจที่ 2 — Issuer ตรวจ Wallet Provider (STEP 5.5)"]
        direction LR
        ISS1["🏛️ Issuer"] -->|"① Wallet ส่ง\nWallet Attestation"| CHK1
        CHK1{"② เช็คว่า Wallet Provider\nอยู่ใน Trust List"}
        CHK1 -->|"✅ อยู่"| OK1["③ ออก VC ให้"]
        CHK1 -->|"❌ ไม่อยู่"| NO1["③ ปฏิเสธ"]
    end

    subgraph S2["🔵 จุดตรวจที่ 3 — Wallet ตรวจ Issuer ก่อนบันทึก (STEP 6.5)"]
        direction LR
        WAL2["📱 Wallet"] -->|"① รับ VC จาก Issuer"| CHK2
        CHK2{"② เช็คว่า Issuer\nอยู่ใน Trust List"}
        CHK2 -->|"✅ อยู่"| OK2["③ บันทึก VC"]
        CHK2 -->|"❌ ไม่อยู่"| NO2["③ ทิ้ง VC"]
    end

    S0 ~~~ S1 ~~~ S2

    style CHK0 fill:#FFFDE7,stroke:#F9A825
    style CHK1 fill:#FFF3E0,stroke:#E65100
    style CHK2 fill:#E3F2FD,stroke:#1565C0
    style OK0 fill:#C8E6C9,stroke:#2E7D32
    style OK1 fill:#C8E6C9,stroke:#2E7D32
    style OK2 fill:#C8E6C9,stroke:#2E7D32
    style NO0 fill:#FFCDD2,stroke:#C62828
    style NO1 fill:#FFCDD2,stroke:#C62828
    style NO2 fill:#FFCDD2,stroke:#C62828
```

**Flow แสดง VP (OID4VP) — จุดตรวจที่ 4–6:**

```mermaid
%%{init: {"theme":"base","themeVariables":{"fontSize":"15px"},"flowchart":{"useMaxWidth":true,"htmlLabels":true,"curve":"linear"}}}%%
flowchart TB
    subgraph S3["🟣 จุดตรวจที่ 4 — Wallet ตรวจ Verifier ก่อนส่งข้อมูล (STEP 2.6)"]
        direction LR
        WAL3["📱 Wallet"] -->|"① Verifier ส่งคำขอ VP"| CHK3
        CHK3{"② เช็คว่า Verifier\nอยู่ใน Trust List"}
        CHK3 -->|"✅ อยู่"| OK3["③ ขอ consent User\nแล้วส่ง VP"]
        CHK3 -->|"❌ ไม่อยู่"| NO3["③ ไม่ส่งข้อมูล"]
    end

    subgraph S5["🟤 จุดตรวจที่ 5 — Verifier ตรวจ Wallet Provider (STEP 4.1, บังคับเฉพาะ Wallet ของรัฐ)"]
        direction LR
        VER5["🔍 Verifier"] -->|"① รับ VP + ตรวจที่มา\nของ Wallet"| CHK5
        CHK5{"② เช็คว่า Wallet Provider\nอยู่ใน Trust List"}
        CHK5 -->|"✅ อยู่"| OK5["③ ตรวจขั้นถัดไป"]
        CHK5 -->|"❌ ไม่อยู่"| NO5["③ ปฏิเสธ"]
    end

    subgraph S4["🟢 จุดตรวจที่ 6 — Verifier ตรวจ Issuer (STEP 4.2)"]
        direction LR
        VER4["🔍 Verifier"] -->|"① ตรวจ VC ที่อยู่ใน VP"| CHK4
        CHK4{"② เช็คว่า Issuer ที่ออก VC\nอยู่ใน Trust List\n+ status + สิทธิ์ออกบัตรชนิดนี้"}
        CHK4 -->|"✅ ผ่าน"| OK4["③ เชื่อถือข้อมูล"]
        CHK4 -->|"❌ ไม่ผ่าน"| NO4["③ ปฏิเสธ"]
    end

    S3 ~~~ S5 ~~~ S4

    style CHK3 fill:#F3E5F5,stroke:#7B1FA2
    style CHK5 fill:#EFEBE9,stroke:#5D4037
    style CHK4 fill:#E8F5E9,stroke:#2E7D32
    style OK3 fill:#C8E6C9,stroke:#2E7D32
    style OK5 fill:#C8E6C9,stroke:#2E7D32
    style OK4 fill:#C8E6C9,stroke:#2E7D32
    style NO3 fill:#FFCDD2,stroke:#C62828
    style NO5 fill:#FFCDD2,stroke:#C62828
    style NO4 fill:#FFCDD2,stroke:#C62828
```

**สรุป: Trust List ถูกใช้ทุกครั้งที่ Entity ต้องตัดสินใจเรื่อง trust**

| จุดตรวจที่ | Flow | Step ใน flow เต็ม | ใครเช็ค | เช็คอะไร | ถ้าไม่ผ่าน |
|:---------:|------|:-----------------:|---------|---------|-----------|
| **1** | ออก VC | 3.1 (บทที่ 3) | Wallet | Issuer ใน Credential Offer อยู่ใน Trust List? | หยุด ไม่ส่ง Transaction Code |
| **2** | ออก VC | 5.5 (บทที่ 3) | Issuer | Wallet Provider อยู่ใน Trust List? | ไม่ออก VC |
| **3** | ออก VC | 6.5 (บทที่ 3) | Wallet | Issuer อยู่ใน Trust List? | ทิ้ง VC ไม่บันทึก |
| **4** | แสดง VP | 2.6 (บทที่ 4) | Wallet | Verifier อยู่ใน Trust List? | ไม่ส่งข้อมูลให้ (จุดที่สำคัญที่สุดฝั่ง Wallet) |
| **5** | แสดง VP | 4.1 (บทที่ 4) | Verifier | Wallet Provider อยู่ใน Trust List? (บังคับเฉพาะ Wallet ของรัฐ) | ปฏิเสธ |
| **6** | แสดง VP | 4.2 (บทที่ 4) | Verifier | Issuer ของ VC อยู่ใน Trust List + status + สิทธิ์ออกบัตร? | ไม่เชื่อถือข้อมูล |

## ก.2 Core Security Rules — ลำดับการตรวจโดยละเอียดของแต่ละฝ่าย

ตารางนี้แบ่งประเภทของการตรวจแต่ละขั้นด้วยสี เพื่อให้เห็นว่าขั้นไหนเป็นแค่การเทียบข้อมูลในเครื่อง (ถูก/เร็ว) และขั้นไหนต้องเรียกออกไปนอกเครื่อง (ช้า/มีค่าใช้จ่าย)

| สี | ประเภทเช็ค | ตัวอย่าง |
|------|-----------|---------|
| 🟢 | parse field, lookup ใน Trustlist local cache, เทียบ status/scope/เวลา | WP/Issuer/Verifier active?, type อนุญาต?, iat/exp |
| 🔵 | verify signature (crypto) | RO sig, WIA sig, KB-JWT, VC sig |
| 🟠 | network call | Resolve DID → PK, Fetch Status List |

> **หลักสำคัญ:** ถ้าขั้น 🟢 (lookup Trustlist) ไม่ผ่าน ให้ **ปฏิเสธทันที ไม่ต้องเรียก network (🟠) ต่อ** เพื่อไม่ให้เปลืองทรัพยากรและไม่เสี่ยงถูกหลอกให้ยิงคำขอไปยังปลายทางที่ไม่น่าเชื่อถือ

### ก.2.1 Issuer — ตรวจก่อนออก VC

1. 🟢 Parse `wallet_attestation` → ดึง WP id (iss)
2. 🟢 Lookup: WP อยู่ใน Trustlist และ status = active?
3. 🟢 Credential type ที่จะออก อยู่ในที่อนุมัติไว้?
4. 🟢 สถานะ/ช่วงเวลา attestation (iat/exp) ยังใช้ได้?
5. 🔵 Verify `wallet_attestation` signature

```mermaid
%%{init: {"theme":"base","themeVariables":{"fontSize":"15px"},"flowchart":{"useMaxWidth":true,"htmlLabels":true,"curve":"linear"}}}%%
flowchart LR
    S(["▶ Issuer"]) --> P["🟢 Parse wallet_attestation\nextract WP id (iss)"]
    P --> L{"🟢 WP active\nin Trustlist?"}
    L -->|yes| T{"🟢 Credential type\napproved?"}
    T -->|yes| St{"🟢 Attestation window\n(iat/exp) valid?"}
    St -->|yes| Sig{"🔵 Verify attestation\nsignature (crypto)"}
    Sig -->|ok| OK(["✅ Issue VC"])
    L -->|no| Rej(["❌ Reject"])
    T -->|no| Rej
    St -->|no| Rej
    Sig -->|fail| Rej

    style S fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    style P fill:#dcfce7,stroke:#16a34a,color:#14532d
    style L fill:#dcfce7,stroke:#16a34a,color:#14532d
    style T fill:#dcfce7,stroke:#16a34a,color:#14532d
    style St fill:#dcfce7,stroke:#16a34a,color:#14532d
    style Sig fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    style OK fill:#16a34a,stroke:#15803d,color:#ffffff
    style Rej fill:#fee2e2,stroke:#dc2626,color:#7f1d1d
```

### ก.2.2 Wallet / Holder — 2 บริบท

**A) หลังรับ VC — ตรวจ Issuer**

1. 🟢 Lookup Issuer host name ใน `issuer_entries`?
2. 🟢 Parse SD-JWT → ดึง Issuer DID
3. 🟢 Lookup: Issuer active + credential type อนุญาต ใน `issuer_entries`?
4. 🟠 Resolve DID → PK (network)
5. 🔵 Verify VC signature

```mermaid
%%{init: {"theme":"base","themeVariables":{"fontSize":"15px"},"flowchart":{"useMaxWidth":true,"htmlLabels":true,"curve":"linear"}}}%%
flowchart LR
    subgraph VCI["A) หลังรับ VC — ตรวจ Issuer"]
      direction LR
      S2(["▶ wallet"]) --> P1{"🟢 Issuer host name in Trustlist?"}
      P1 --> |yes| P2["🟢 Parse SD-JWT\nextract Issuer DID"]
      P1 --> |no| R2
      P2 --> L2{"🟢 Issuer active + type\nin Trustlist?"}
      L2 -->|yes| Re2["🟠 Resolve DID → PK\n(network)"]
      Re2 --> V2{"🔵 Verify VC sig"}
      V2 -->|ok| OK2(["✅ Store"])
      L2 -->|no| R2(["❌ Reject\nไม่ต้อง resolve"])
      V2 -->|fail| R2
    end

    style S2 fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    style P1 fill:#dcfce7,stroke:#16a34a,color:#14532d
    style P2 fill:#dcfce7,stroke:#16a34a,color:#14532d
    style L2 fill:#dcfce7,stroke:#16a34a,color:#14532d
    style Re2 fill:#ffedd5,stroke:#ea580c,color:#7c2d12
    style V2 fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    style OK2 fill:#16a34a,stroke:#15803d,color:#ffffff
    style R2 fill:#fee2e2,stroke:#dc2626,color:#7f1d1d
```

**B) ก่อนแสดง VP — ตรวจ Verifier**

1. 🟢 Parse Request Object → ดึง PK_v
2. 🟢 Lookup: Verifier active ใน `verifier_entries`?
3. 🟢 Scope: claims ที่ขอ ⊆ allowed_attributes, purpose ∈ allowed_purposes?
4. 🔵 Verify RO signature + aud/exp/nonce

```mermaid
%%{init: {"theme":"base","themeVariables":{"fontSize":"15px"},"flowchart":{"useMaxWidth":true,"htmlLabels":true,"curve":"linear"}}}%%
flowchart LR
    subgraph VP["B) ก่อนแสดง VP — ตรวจ Verifier"]
      direction LR
      S1(["▶ wallet"]) --> P1["🟢 Parse RO\nextract PK_v"]
      P1 --> L1{"🟢 Verifier active\nin Trustlist?"}
      L1 -->|yes| Sc1{"🟢 Scope: claims ⊆ allowed\npurpose allowed?"}
      Sc1 -->|yes| V1{"🔵 Verify RO sig"}
      V1 -->|ok| OK1(["✅ Present"])
      L1 -->|no| R1(["❌ Reject"])
      Sc1 -->|no| R1
      V1 -->|fail| R1
    end

    style S1 fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    style P1 fill:#dcfce7,stroke:#16a34a,color:#14532d
    style L1 fill:#dcfce7,stroke:#16a34a,color:#14532d
    style Sc1 fill:#dcfce7,stroke:#16a34a,color:#14532d
    style V1 fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    style OK1 fill:#16a34a,stroke:#15803d,color:#ffffff
    style R1 fill:#fee2e2,stroke:#dc2626,color:#7f1d1d
```

### ก.2.3 Verifier — ตรวจ VP

1. 🟢 Parse WIA → WP iss + PK_wp
2. 🟢 Lookup L3: WP active ใน Trustlist?
3. 🔵 Verify WIA + WIA-PoP signature
4. 🟢 Parse issuer_jwt
5. 🟢 **Check temporal: VC `nbf ≤ now ≤ exp` + VP(KB-JWT) `iat` ใหม่ / `exp` ยังไม่หมด** — ถ้าหมดอายุ/ยังไม่ถึงกำหนด → **ปฏิเสธ**
6. 🔵 Verify KB-JWT (holder binding)
7. 🟢 Lookup L4: Issuer DID active + credential type อนุญาต?
8. 🟠 Resolve DID → PK_iss
9. 🔵 Verify issuer_jwt signature + disclosures
10. 🟢 DCQL match
11. 🟠 Fetch + decode Status List
12. 🟢 Credential status = valid? (ไม่ revoked / suspended) — ถ้าไม่ valid → **ปฏิเสธ**

```mermaid
%%{init: {"theme":"base","themeVariables":{"fontSize":"15px"},"flowchart":{"useMaxWidth":true,"htmlLabels":true,"curve":"linear"}}}%%
flowchart LR
    S(["▶ verifier — received VP"]) --> P1["🟢 Parse WIA → WP iss + PK_wp"]
    P1 --> L3{"🟢 WP active in TL?\n(allowed_aal)"}
    L3 -->|no| R(["❌ Reject"])
    L3 -->|yes| V1{"🔵 Verify WIA + WIA-PoP sig"}
    V1 -->|fail| R
    V1 -->|ok| P2["🟢 Parse issuer_jwt + KB-JWT\n→ Issuer DID"]
    P2 --> T{"🟢 VC nbf/exp + VP(KB-JWT) iat/exp\nยังอยู่ในช่วงใช้งาน?"}
    T -->|expired / not yet valid| R
    T -->|valid| V2{"🔵 Verify KB-JWT\nholder binding"}
    V2 -->|fail| R
    V2 -->|ok| L4{"🟢 Issuer DID active + type\nin TL?"}
    L4 -->|no| R
    L4 -->|yes| Re["🟠 Resolve DID → PK_iss (network)"]
    Re --> V3{"🔵 Verify issuer_jwt sig\n+ disclosures"}
    V3 -->|fail| R
    V3 -->|ok| DQ{"🟢 DCQL match"}
    DQ -->|no| R
    DQ -->|yes| St["🟠 Fetch + decode Status List (network)"]
    St --> Stat{"🟢 Status = valid?\n(not revoked/suspended)"}
    Stat -->|revoked/suspended| R
    Stat -->|valid| OK(["✅ Grant service"])

    style S fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    style P1 fill:#dcfce7,stroke:#16a34a,color:#14532d
    style L3 fill:#dcfce7,stroke:#16a34a,color:#14532d
    style V1 fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    style P2 fill:#dcfce7,stroke:#16a34a,color:#14532d
    style T fill:#dcfce7,stroke:#16a34a,color:#14532d
    style V2 fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    style L4 fill:#dcfce7,stroke:#16a34a,color:#14532d
    style Re fill:#ffedd5,stroke:#ea580c,color:#7c2d12
    style V3 fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    style DQ fill:#dcfce7,stroke:#16a34a,color:#14532d
    style St fill:#ffedd5,stroke:#ea580c,color:#7c2d12
    style Stat fill:#dcfce7,stroke:#16a34a,color:#14532d
    style OK fill:#16a34a,stroke:#15803d,color:#ffffff
    style R fill:#fee2e2,stroke:#dc2626,color:#7f1d1d
```

## ก.3 หลักการนี้ถูกใช้จริงที่ไหน

| Flow | จุดที่ใช้หลักการนี้ | อ่านรายละเอียดที่ |
|------|---------------------|--------------------|
| การออกเอกสาร (OID4VCI) | Issuer ตรวจ Wallet Provider ก่อนออกบัตร | [3.2.5 การตรวจสอบ Trustlist](../03-issuance-flow/02-full-flow/06-verification-details.md) |
| การแสดงเอกสาร (OID4VP) | Wallet ตรวจ Verifier + Verifier ตรวจ Wallet Provider/Issuer | [4.1 ภาพรวมการแสดงเอกสาร](../04-presentation-flow/01-overview/index.md) |
| ภาพรวม "ใครตรวจใคร" | ตารางสรุปทุกฝ่าย | [1.4 หลักการตรวจสอบ](../01-concepts-and-roles/03-common-verification-pattern.md) |
