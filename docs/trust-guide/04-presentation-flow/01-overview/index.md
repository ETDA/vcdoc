---
sidebar_position: 1
---

# 4.1 กระบวนการแสดงและตรวจสอบเอกสาร (OID4VP)

ต่อจาก [บทที่ 3 กระบวนการออกเอกสาร (OID4VCI)](../../03-issuance-flow/01-minimal-flow.md) ที่ Holder ได้รับ VC มาเก็บใน Wallet แล้ว บทนี้อธิบายอีกฝั่งหนึ่งของวงจรชีวิต VC — เมื่อ Holder ต้องการ **แสดง** เอกสารนั้นให้ผู้ตรวจสอบ (Verifier) ดู ระบบตรวจสอบความน่าเชื่อถืออย่างไร

## 4.1 ภาพรวมขั้นตอนการแสดงและตรวจสอบเอกสาร (OID4VP + Trustlist)

```mermaid
%%{init: {"theme":"base","themeVariables":{"fontSize":"15px"},"flowchart":{"useMaxWidth":true,"htmlLabels":true,"curve":"linear"}}}%%
sequenceDiagram
    autonumber
    participant W as Wallet
    participant V as Verifier
    participant TL as ETDA Trust List

    rect rgb(210, 240, 210)
        note over W,TL: 🟢 [ETDA คุม] SETUP — ดึง Trustlist
        W->>TL: GET /trustlist
        TL-->>W: Trustlist data 
        W->>W: เก็บ Trustlist ไว้ใน Local Storage
        V->>TL: GET /trustlist
        TL-->>V: Trustlist data 
        V->>V: เก็บ Trustlist ไว้ใน Local Storage
    end
    
    rect rgb(210, 230, 255)
    Note over W,V: 🔵 1. QR Transfer
    V->>V: Render QR
    W->>V: Scan QR
    end

    rect rgb(210, 230, 255)
    Note over W,V: 🔵 2. Fetch Request Object
    W->>V: Request the Request Object
    V-->>W: (2.5)Signed Request Object

    end

    rect rgb(255, 225, 180)
    Note over W,TL: 🟠 2.6 Trust Check 1 — Wallet check Verifier
    W->>W: Check if Verifier in TL
    end

    rect rgb(210, 230, 255)
    Note over W,V: 🔵 3. Send Response
    W->>V: ส่ง VP กลับไป
    end


    rect rgb(255, 225, 180)
    
        Note over V,TL: 4. Verifier Validation
  opt     บังคับเป็นต้องทำสำหรับ Wallet ของรัฐบาลเท่านั้น

    Note over V,TL: 🟠 4.1 Trust Check 2 — Verifier <br/>check Wallet Provider
    V->>V: Check if walllet provider's in TL
    end
        loop For each credential
        
        rect rgb(255, 225, 180)
        Note over V,TL: 🟠 4.2 Trust Check 3 — Verifier <br/>check Issuer
      
        V->>V: Check if Issuer in TL
        V->>V: Check issuer status + allowed credential types
        end
    
    end
    end

```

**สีกรอบในผังหมายถึงอะไร:**

| สี | หมายถึง | ใครกำหนด |
|----|---------|----------|
| 🟢 สีเขียว | ขั้นตอนที่ ETDA ดูแลโดยตรง (Trustlist) | ETDA |
| 🔵 สีน้ำเงิน | ขั้นตอนตามมาตรฐาน OID4VP สากล | OpenID Foundation |
| 🟠 สีส้ม | จุดตรวจสอบ trust ว่าใครน่าเชื่อถือ | Trust Framework (ETDA) |

**Trustlist Verification — จุดตรวจที่ ETDA คุม (3 จุดใน flow):**

ในการแสดงเอกสาร มีจุดตรวจ Trustlist อยู่ **3 จุด** โดยตรวจกันคนละฝั่ง คือ กระเป๋าดิจิทัลตรวจผู้ตรวจสอบก่อนส่งข้อมูล 1 จุด และผู้ตรวจสอบตรวจฝั่งกระเป๋า/ผู้ออกเอกสารอีก 2 จุด

```mermaid
%%{init: {"theme":"base","themeVariables":{"fontSize":"15px"},"flowchart":{"useMaxWidth":true,"htmlLabels":true,"curve":"linear"}}}%%
flowchart TD
    classDef store fill:#e2e3e5,stroke:#6c757d,color:#343a40
    classDef check fill:#fff3cd,stroke:#ffc107,color:#856404
    classDef pass fill:#d4edda,stroke:#28a745,color:#155724
    classDef fail fill:#f8d7da,stroke:#721c24,color:#721c24
    classDef src fill:#cce5ff,stroke:#0056b3,color:#003d80

    ETDA[("🛡️ ETDA Trustlist")]:::src
    TL_W[("📱 Wallet Local Trustlist\n• Verifier")]:::store
    TL_V[("🖥️ Verifier Local Trustlist\n• Wallet Provider\n• Issuer")]:::store
    ETDA -->|"SETUP ดึงก่อนใช้งาน (API Key required) "| TL_W & TL_V

    subgraph check1["🟠 จุดตรวจ 1 — Wallet ตรวจ Verifier (ก่อนส่งข้อมูล)"]
        V_PK["① ดึง Public Key ของ Verifier\nจาก Request Object"]:::check
        V_TL{"② ตรวจ Verifier\nอยู่ใน Trustlist ไหม"}:::check
        V_SIG["③ ตรวจลายเซ็นคำขอ\n+ ผู้รับ (audience) + อายุ"]:::check
        V_SC{"④ ตรวจขอบเขตข้อมูลที่ขอ\n+ วัตถุประสงค์"}:::check
        OK1["✅ ส่งเอกสารต่อได้"]:::pass
        FL1["❌ หยุด ไม่ส่งข้อมูล"]:::fail
        TL_W -.->|"ดึงข้อมูล"| V_TL
        V_PK --> V_TL
        V_TL -->|"พบ"| V_SIG --> V_SC
        V_TL -->|"ไม่พบ"| FL1
        V_SC -->|"อยู่ในขอบเขต"| OK1
        V_SC -->|"เกินขอบเขต"| FL1
    end

    subgraph check2["🟠 จุดตรวจ 2 — Verifier ตรวจ Wallet Provider (เฉพาะ Wallet รัฐ)"]
        WP_ID["① ดึง WP ID + Public Key\nจาก Wallet Attestation"]:::check
        WP_TL{"② ตรวจ Wallet Provider\nอยู่ใน Trustlist ไหม"}:::check
        WP_SIG{"③ ตรวจลายเซ็น WIA + WIA-PoP\n(กันปลอม/เล่นซ้ำ)"}:::check
        OK2["✅ ผ่าน"]:::pass
        FL2["❌ ปฏิเสธ"]:::fail
        TL_V -.->|"ดึงข้อมูล"| WP_TL
        WP_ID --> WP_TL
        WP_TL -->|"พบ"| WP_SIG
        WP_TL -->|"ไม่พบ"| FL2
        WP_SIG -->|"ถูกต้อง"| OK2
        WP_SIG -->|"ผิด"| FL2
    end

    subgraph check3["🟠 จุดตรวจ 3 — Verifier ตรวจ Issuer (ตรวจเอกสารแต่ละฉบับ)"]
        IS_DID["① แกะ Issuer DID จากเอกสาร\n→ Resolve เป็น Public Key"]:::check
        IS_TL{"② ตรวจ Issuer\nอยู่ใน Trustlist ไหม"}:::check
        IS_ST{"③ ตรวจสถานะ active\n+ ประเภทเอกสารที่อนุญาต"}:::check
        IS_SIG{"④ ตรวจลายเซ็นเอกสาร"}:::check
        OK3["✅ ยอมรับเอกสาร"]:::pass
        FL3["❌ ปฏิเสธ"]:::fail
        TL_V -.->|"ดึงข้อมูล"| IS_TL
        IS_DID --> IS_TL
        IS_TL -->|"พบ"| IS_ST
        IS_TL -->|"ไม่พบ"| FL3
        IS_ST -->|"อนุญาต"| IS_SIG
        IS_ST -->|"ไม่อนุญาต"| FL3
        IS_SIG -->|"ลายเซ็นถูกต้อง"| OK3
        IS_SIG -->|"ลายเซ็นผิด"| FL3
    end
```

> หมายเหตุ: หลังผ่านจุดตรวจ 3 แล้ว ผู้ตรวจสอบยังเช็ค **สถานะเอกสาร** (ถูกยกเลิก/พักใช้หรือไม่) ต่ออีกขั้นหนึ่ง แต่ขั้นนี้ดึงข้อมูลจาก Status List ของผู้ออกเอกสาร ไม่ได้ใช้ ETDA Trustlist จึงไม่นับรวมใน 3 จุดข้างต้น (ดูรายละเอียดใน [4.2.1 Full Flow](../02-full-flow/02b-full-flow-technical-detail.md))

ขั้นตอนการทำงานทั้งหมดของ flow นี้ อ่านต่อได้ในหน้าถัดไป: [4.2 SETUP, สแกน QR, คำขอฉบับสมบูรณ์, ตรวจ Verifier](02-setup-and-request.md) และรายละเอียดทางเทคนิคทุกขั้นตอนที่ [4.2.1 Full Flow เทคนิคโดยละเอียด](../02-full-flow/02b-full-flow-technical-detail.md) (ซ่อนโดยดีฟอลต์ คลิกเพื่อดู)
