# 5.1 ข้อกำหนดทางเทคนิค และ Trusted List Schema

ต่อจาก [บทที่ 4 กระบวนการแสดงเอกสาร](../04-presentation-flow/01-overview/index.md) ที่ทั้งการออกและแสดง VC ต้องพึ่ง Trustlist ในการตรวจสอบ บทนี้อธิบายว่า Trustlist มีโครงสร้างข้อมูล (schema) อย่างไร

## 5.1 ข้อกำหนดทางเทคนิค

- **Protocol:** [เช่น protocol สำหรับ issue / present]
- **รูปแบบ credential:** [เช่น data model และวิธีเซ็น]
- **Identifier:** [เช่น DID method, registry]
- **Status และ revocation:** [ตรวจสถานะอย่างไร]

## 5.2 โครงสร้าง Trust (Trust Infrastructure)

- **Trusted List / Registry:** เก็บอะไร ใครเซ็น
- **PKI / Key:** ออก key, หมุน key, ถอน key อย่างไร
- **Discovery:** ค้นหาและตรวจสอบอีกฝ่ายอย่างไร

ตัวอย่าง Trustlist ที่ ETDA เซ็นและ Entity ดาวน์โหลดมาเก็บไว้
`trust_list_jwt` คือ trustlist ใน format JWT
`trust_anchor_key` คือ public key (JWK) ที่ใช้ตรวจลายเซ็นบน `trust_list_jwt` (token และ key ด้านล่างเป็นตัวอย่าง ไม่ใช่ของจริง)

```json
{
  "trust_list_jwt": "eyJhbGciOiJSUzI1NiIsImtpZCI6IkVUREEtdHJ1c3QtYW5jaG9yLWtleS0xIn0.eyJpc3MiOiJodHRwczovL3RydXN0LmV0ZGEub3IudGgiLCJpYXQiOjE3NTAwMDAwMDAsImV4cCI6MTc4MTUzNjAwMCwiZW50cmllcyI6WyJkaWQ6d2ViOmRvcGEuZ28udGgiXX0.NOT-REAL-SIGNATURE-DO-NOT-USE-0000000000000000000000000000000000000000",
  "trust_anchor_key": {
    "kty": "RSA",
    "n": "0EXAMPLE1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPqrstuvwxyz0123456789exampleMODULUSnotREALdoNOTuse0123456789abcdefABCDEF0123456789abcdefABCDEF0123456789abcdefABCDEF0123456789abcdefEXAMPLE",
    "e": "AQAB",
    "kid": "ETDA-trust-anchor-key-1",
    "alg": "RS256",
    "use": "sig"
  }
}
```

### 5.2.1 Trusted List Schema (Organization-Centric)

TL จัดกลุ่มข้อมูลตาม**องค์กร** — แต่ละ entry คือ 1 องค์กร ที่มี `services[]` เก็บบทบาทที่ลงทะเบียน:

| Concept | คำอธิบาย |
|---------|----------|
| **1 entity** | = 1 องค์กร (เช่น กรมการปกครอง, ธนาคารกรุงเทพ) |
| **services[]** | = รายการบทบาทที่องค์กรนั้นลงทะเบียนไว้ |
| **1 service** | = 1 บทบาท + 1 DID + 1 keypair (`signing_pubkey`) |

**ตัวอย่าง:**
- **DOPA** → 1 service: `credential_issuer` (ออกบัตรประชาชนดิจิทัล)
- **DGA** → 1 service: `wallet_provider` (ให้บริการ Wallet ทางรัฐ)
- **BBL** → 2 services: `credential_issuer` + `verifier` (ออก VC + verify ลูกค้า)

> **ทำไมต้องแยก service?** แม้เป็นองค์กรเดียวกัน แต่แต่ละบทบาทมี keypair ต่างกัน และสามารถ suspend/revoke แยกกันได้

#### TL Root Wrapper

```json
{
  "@context": "https://schemas.etda.or.th/trusted-list/v1",
  "id": "urn:etda:trusted-list:2026-v1",
  "issuer": "did:web:etda.or.th:trusted-list",
  "issued": "2026-09-01T00:00:00Z",
  "next_update": "2026-09-08T00:00:00Z",
  "entities": [
    // ... organization entries with services[]
  ]
}
```

| Field | Type | Required | หมายเหตุ |
|-------|------|:--------:|---------|
| `@context` | string | ✅ | ETDA TL schema URL — ระบุ version ของ TL format |
| `id` | string | ✅ | TL identifier (URN format) |
| `issuer` | string | ✅ | DID ของ ETDA ที่ sign TL |
| `issued` | ISO8601 | ✅ | วันที่ publish |
| `next_update` | ISO8601 | ✅ | วันที่จะ publish version ถัดไป |
| `entities` | array | ✅ | รายการ entities (organizations with services) ที่ลงทะเบียน |

#### Entity-Level Fields (ข้อมูลองค์กร — ทุก entity มีเหมือนกัน)

ข้อมูลระดับองค์กร ใช้ระบุว่า "ใคร" และ "สถานะรวม" ขององค์กรนั้น:

| Field | Required | หมายเหตุ |
|-------|:--------:|---------|
| `id` | ✅ | รหัสองค์กร เช่น `org-10001` (DOPA), `org-20001` (BBL) |
| `name_th` | ✅ | ชื่อองค์กรภาษาไทย — แสดงใน Wallet UI |
| `name_en` | ✅ | ชื่อองค์กรภาษาอังกฤษ |
| `status` | ✅ | สถานะรวมขององค์กร: `active` / `suspended` / `revoked` — ถ้า org ถูก revoke → service ทั้งหมดใช้ไม่ได้ |
| `services[]` | ✅ | รายการบทบาทที่องค์กรลงทะเบียน (ดู Service-Level ด้านล่าง) |

#### Service-Level Fields (ข้อมูลบทบาท — ทุก service มีเหมือนกัน)

ข้อมูลระดับบทบาท อยู่ภายใน `services[]` ของแต่ละองค์กร ระบุว่าองค์กรนั้น "ทำหน้าที่อะไร" และ "ใช้ key ไหน":

| Field | Required | หมายเหตุ |
|-------|:--------:|---------|
| `did` | ✅* | DID ของบทบาทนี้ เช่น `did:web:dopa.go.th` — Wallet/Verifier ใช้ตรวจลายเซ็น (**Verifier: optional** เพราะใช้ `client_id` แทนได้) |
| `type` | ✅ | ประเภทบทบาท: `credential_issuer` / `wallet_provider` / `verifier` |
| `status` | ✅ | สถานะเฉพาะบทบาทนี้: `active` / `suspended` / `revoked` — **อาจต่างจาก org-level** เช่น BBL Issuer ถูก suspend แต่ BBL Verifier ยังใช้ได้ |
| `signing_pubkey` | ✅* | Public keyของ entity ที่ ETDA ได้ตรวจ ณ ตอนลงทะเบียน — ใช้เวลา verify ลายเซ็นของ VC/WIA/VP Request Object |
| `valid_from` | ✅ | วันเริ่มใช้งาน (ISO8601) — ก่อนวันนี้ถือว่ายังไม่ active |
| `valid_until` | ✅ | วันหมดอายุ (ISO8601) — หลังวันนี้ต้องต่ออายุใหม่ |

> **การตรวจสอบ:** consumer (Wallet/Verifier/Issuer) ต้องเช็คทั้ง org `status` และ service `status` — ถ้าอย่างใดอย่างหนึ่งไม่ใช่ `active` → ปฏิเสธ

ต่อไปดู [§ 5.3 ตัวอย่าง TL JSON](02-tl-json-examples.md) เพื่อเห็นว่า schema ข้างต้นถูกใช้จริงกับแต่ละบทบาท (Issuer, Wallet Provider, Verifier) อย่างไร

