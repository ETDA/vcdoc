# 5.3 ตัวอย่าง TL JSON — Issuer, Wallet Provider, Verifier, Multi-Role

ต่อจาก [§ 5.1–5.2 ข้อกำหนดทางเทคนิคและ Trusted List Schema](01-technical-requirements-and-schema.md) บทนี้แสดงตัวอย่าง JSON จริงของแต่ละบทบาท เพื่อให้เห็นว่า field ต่าง ๆ ถูกกรอกค่าจริงอย่างไร

## 5.3 ตัวอย่าง TL JSON — Issuer, Wallet Provider, Verifier, Multi-Role

| Field | Required | หมายเหตุ |
|-------|:--------:|---------|
| `credential_issuer` | ✅ | OID4VCI endpoint URL — ตรงกับ `credential_issuer` ใน Credential Offer (QR) ใช้สำหรับ Early Check (STEP 1.5) และ TC-3 (STEP 6.5) |
| `credential_type` | ✅ | ประเภท credential ที่ออกได้ เช่น `ThaiNationalIDCredential` |
| `signing_pubkey` | ✅ | Public key สำหรับ verify VC signature |
| `issuable_claims` | ✅ | claims ที่ Issuer สามารถออกได้ |
| `protocols` | ✅ | OID4VCI protocol versions supported |

```json
{
  "id": "org-10001",
  "name_th": "กรมการปกครอง",
  "name_en": "Department of Provincial Administration",
  "status": "active",
  "services": [
    {
      "did": "did:web:dopa.go.th",
      "type": "credential_issuer",
      "credential_issuer": "https://issuer.dopa.go.th",
      "status": "active",
      "credential_type": "ThaiNationalIDCredential",
      "signing_pubkey": "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEQ7X4...",
      "issuable_claims": ["citizen_id", "name_th", "name_en", "birth_date", "address", "photo"],
      "protocols": ["OID4VCI_1.0"],
      "valid_from": "2026-09-01T00:00:00Z",
      "valid_until": "2028-09-01T00:00:00Z"
    }
  ]
}
```

**Wallet ใช้ทำอะไร:**
- **Early Check (STEP 1.5):** ตรวจ `credential_issuer` URL จาก QR ตรงกับ `credential_issuer` ใน TL — fail fast ถ้าไม่พบ
- **TC-3 (STEP 6.5):** Verify ว่า `iss` ใน VC ตรงกับ `credential_issuer` ใน TL
- Verify signature ของ VC ด้วย `signing_pubkey`
- ตรวจสอบว่า `status` = `active` และยังไม่หมดอายุ
- ตรวจสอบว่า claims ที่รับมา อยู่ใน `issuable_claims`

### 5.3.1 TL JSON — Wallet Provider

| Field | Required | หมายเหตุ |
|-------|:--------:|---------|
| `signing_pubkey` | ✅ | Public key สำหรับ verify Wallet Instance Attestation (WIA) |
| `platforms` | ✅ | รองรับ platform อะไร (`ios`, `android`, `web`) |

```json
{
  "id": "org-10002",
  "name_th": "สำนักงานพัฒนารัฐบาลดิจิทัล (องค์การมหาชน)",
  "name_en": "Digital Government Development Agency",
  "status": "active",
  "services": [
    {
      "did": "did:web:wallet.dga.or.th",
      "type": "wallet_provider",
      "status": "active",
      "signing_pubkey": "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAExyz...",
      "platforms": ["ios", "android"],
      "valid_from": "2026-09-01T00:00:00Z",
      "valid_until": "2028-09-01T00:00:00Z"
    }
  ]
}
```

**Verifier ใช้ทำอะไร:**
- Verify Wallet Instance Attestation (WIA) ด้วย `signing_pubkey`
- ตรวจสอบว่า Wallet Provider อยู่ใน Trusted List และ `status` = `active`

### 5.3.2 TL JSON — Verifier

| Field | Required | หมายเหตุ |
|-------|:--------:|---------|
| `did` | ❓ Optional | Verifier ไม่จำเป็นต้องมี DID |
| `signing_pubkey` | ❓ Optional | ใช้ sign VP Request (ถ้ามี) |
| `client_id` | ✅ | URL/domain สำหรับ OID4VP callback |
| `credential_type` | ✅ | credential ที่ verify |
| `protocols` | ✅ | OID4VP protocol versions supported |
| `use_case[]` | ✅ | รายการ use cases ที่ได้รับอนุมัติ |
| `use_case[].use_case_id` | ✅ | รหัส use case |
| `use_case[].purpose_th` | ✅ | วัตถุประสงค์ภาษาไทย (แสดงให้ user consent) |
| `use_case[].purpose_en` | ✅ | วัตถุประสงค์ภาษาอังกฤษ |
| `use_case[].allowed_claims` | ✅ | claims ที่ Verifier มีสิทธิ์ขอ |

```json
{
  "id": "org-20001",
  "name_th": "ธนาคารกรุงเทพ จำกัด (มหาชน)",
  "name_en": "Bangkok Bank Public Company Limited",
  "status": "active",
  "services": [
    {
      "did": "did:web:bangkokbank.com:verifier",
      "type": "verifier",
      "status": "active",
      "signing_pubkey": "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEabc...",
      "client_id": "https://verify.bangkokbank.com/callback",
      "credential_type": "ThaiNationalIDCredential",
      "protocols": ["OID4VP_1.0"],
      "use_case": [
        {
          "use_case_id": "UC-BBL-AML-001",
          "purpose_th": "ยืนยันตัวตนตาม พ.ร.บ.ป้องกันฟอกเงิน",
          "purpose_en": "Identity verification per AML Act",
          "allowed_claims": ["citizen_id", "name_th", "name_en", "birth_date"]
        },
        {
          "use_case_id": "UC-BBL-LOAN-001",
          "purpose_th": "ยืนยันตัวตนเพื่อสมัครสินเชื่อ",
          "purpose_en": "Identity verification for loan application",
          "allowed_claims": ["citizen_id", "name_th", "address"]
        }
      ],
      "valid_from": "2026-09-01T00:00:00Z",
      "valid_until": "2028-09-01T00:00:00Z"
    }
  ]
}
```

**Wallet ใช้ทำอะไร:**
- ตรวจสอบว่า `client_id` ใน VP Request ตรงกับ TL
- แสดง `purpose_th` / `purpose_en` ให้ user consent
- ตรวจสอบว่า claims ที่ขอมา อยู่ใน `allowed_claims` ของ use case ที่ระบุ
- ป้องกัน Verifier ขอ claims เกินสิทธิ์

### 5.3.3 TL JSON — Multi-Role Organization (BBL = Issuer + Verifier)

1 organization สามารถมีหลาย services ได้ โดยแต่ละ service มี DID และ keypair แยกกัน:

```json
{
  "id": "org-20001",
  "name_th": "ธนาคารกรุงเทพ จำกัด (มหาชน)",
  "name_en": "Bangkok Bank Public Company Limited",
  "status": "active",
  "services": [
    {
      "did": "did:web:bangkokbank.com:issuer",
      "type": "credential_issuer",
      "status": "active",
      "credential_type": "BankAccountCredential",
      "signing_pubkey": "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEdef...",
      "issuable_claims": ["account_number", "account_type", "account_holder_name", "branch"],
      "protocols": ["OID4VCI_1.0"],
      "valid_from": "2026-10-01T00:00:00Z",
      "valid_until": "2028-10-01T00:00:00Z"
    },
    {
      "did": "did:web:bangkokbank.com:verifier",
      "type": "verifier",
      "status": "active",
      "signing_pubkey": "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEabc...",
      "client_id": "https://verify.bangkokbank.com/callback",
      "credential_type": "ThaiNationalIDCredential",
      "protocols": ["OID4VP_1.0"],
      "use_case": [
        {
          "use_case_id": "UC-BBL-AML-001",
          "purpose_th": "ยืนยันตัวตนตาม พ.ร.บ.ป้องกันฟอกเงิน",
          "purpose_en": "Identity verification per AML Act",
          "allowed_claims": ["citizen_id", "name_th", "name_en", "birth_date"]
        }
      ],
      "valid_from": "2026-09-01T00:00:00Z",
      "valid_until": "2028-09-01T00:00:00Z"
    }
  ]
}
```


ต่อไปดู [§ 5.4 Registries — Status List และ Schema](03-registries.md) สำหรับข้อมูลเสริมที่อยู่นอกขอบเขตของ trust model แต่จำเป็นสำหรับ Verifier ตรวจ credential ให้ครบถ้วน
