---
sidebar_position: 1
---

# 3.2 Flow การออก VC — Full Flow (ภาพรวม)

หมวดนี้ (3.2) ขยายภาพจาก [3.1 Minimal Flow](../01-minimal-flow.md) ให้เห็น **ทุก STEP ของการออก VC ผ่าน OID4VCI ตั้งแต่ SETUP จนถึง STEP 7 (Notification)** อย่างละเอียด รวมผู้เกี่ยวข้องทั้งหมด (ประชาชน, Wallet, Wallet Provider, ETDA Trustlist, DOPA, DOPA Status List) และกรณีพิเศษที่ Minimal Flow ยังไม่ครอบคลุม เช่น DPoP (LoA 3+), Immediate vs. Deferred Issuance, Trustlist Freshness Check และโครงสร้าง SD-JWT VC แบบ 3 ชั้น

เลือกอ่านหัวข้อย่อยได้ตามนี้:

| หัวข้อ | เนื้อหา |
|--------|---------|
| [3.2.1 Full Flow เทคนิคโดยละเอียด](02b-full-flow-technical-detail.md) | ภาพรวมขั้นตอนทั้งหมด (STEP 1–7) + Sequence Diagram ฉบับเต็ม (field-by-field) |
| [3.2.2 SETUP & Credential Offer](03-setup-and-credential-offer.md) | SETUP, STEP 1–3: Credential Offer, Early Trust Check, Discovery, Authentication |
| [3.2.3 Token & Credential Request](04-token-and-credential-request.md) | STEP 4–5.5: Token Request, Credential Request, Trust Check: Wallet Provider |
| [3.2.4 Issue & Notify](05-issue-and-notify.md) | STEP 6–7: Issue VC, Trust Check: Issuer, Notification |
| [3.2.5 การตรวจสอบ Trustlist](06-verification-details.md) | รายละเอียดจุดตรวจ Trustlist ทุกจุด (L1–L7) |
| [3.2.6 Data Flow & Policy](07-data-flow-and-policy.md) | Data Flow และ LoA/DPoP Policy |

> **ภาพรวมขั้นตอนทั้งหมด (STEP 1–7) ฉบับเต็ม** พร้อมตารางสรุปและ Sequence Diagram อยู่ที่หน้า [3.2.1 Full Flow เทคนิคโดยละเอียด](02b-full-flow-technical-detail.md)
