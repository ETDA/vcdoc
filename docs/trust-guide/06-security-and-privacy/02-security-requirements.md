# 6.2 ข้อกำหนดด้านความปลอดภัย

ต่อจาก [§ 6.1 ระดับความเชื่อมั่นของ Verifier และการลงทะเบียน](01-verifier-confidence-and-registration.md) บทนี้อธิบายมาตรการความปลอดภัยที่ระบบใช้จริง ตั้งแต่การเก็บ key ไปจนถึงนโยบายรับมือเมื่อระบบล่ม

## 6.2 ข้อกำหนดด้านความปลอดภัย

ETDA ยังไม่ได้ออกมาตรฐานความปลอดภัยฉบับเต็ม ให้ยึดตามที่ OID4VCI และ OID4VP แนะนำเป็นหลัก ด้านล่างคือมาตรการที่ระบบนี้ใช้อยู่แล้ว (ดึงจาก flow ใน § 3 และ schema ใน § 5.2)

### 6.2.1 มาตรฐาน Cryptographic

ETDA ยังไม่ได้ออกมาตรฐานความปลอดภัยฉบับเต็ม ให้ยึดตามที่ OID4VCI และ OID4VP แนะนำเป็นหลัก

| ใช้ที่ไหน | Algorithm | Key |
|-----------|-----------|-----|
| Digest(Hash) ของ selective disclosure | SHA-256 | — |
| ช่องทางเชื่อมต่อ Gateway | TLS 1.3 | — |

### 6.2.2 การจัดการและเก็บ Key

- Private key ของ Wallet (DPoP key, Holder key) MUST เก็บใน Trusted Execution Environment (TEE เช่น Strongbox หรือ Secure Enclave) ห้ามส่งออกจากเครื่อง
- Issuer / Wallet Provider / Verifier ส่ง `signing_pubkey` ให้ ETDA ตรวจตอนลงทะเบียน ETDA เก็บไว้ใน Trusted List
- แต่ละ service มี keypair แยกกัน (ดู § 5.2.1) ถ้า key ใดมีปัญหา จะ suspend หรือ revoke เฉพาะ service นั้นได้ โดยไม่กระทบ service อื่น
- ETDA หมุน trust anchor key ได้โดยไม่ต้อง redeploy app Entity ดึง key ใหม่จาก `/.well-known`
- แต่ละ key มี `valid_from` / `valid_until` หลัง `valid_until` ต้องต่ออายุก่อนใช้ต่อ

**Policy — Verifier ไม่ต้องเก็บ key ใน HSM:**

- Verifier เก็บ private key แบบ softkey ก็พอ **ไม่บังคับ** ให้เก็บใน HSM
- softkey คือ key ที่เก็บเป็นไฟล์ในเครื่อง ไม่ต้องมีฮาร์ดแวร์พิเศษ
- HSM (Hardware Security Module) คือกล่องฮาร์ดแวร์ที่เก็บ key ให้ปลอดภัยสูง แต่ราคาแพง
- key ของ Verifier ใช้แค่เซ็นคำขอ (VP request) ตอนขอดูบัตร ถ้า key หลุด ETDA แค่ revoke key เก่า แล้วให้ Verifier ทำ key ใหม่
- ใครอยากใช้ HSM เพื่อความปลอดภัยเพิ่มขึ้นก็ทำได้ แต่ไม่ใช่ข้อบังคับ

**Policy — ข้อกำหนดการเก็บ signing key สำหรับ Issuer:**

Issuer เป็นผู้เซ็น VC โดยตรง จึงเป็นจุดที่มีความอ่อนไหวสูงสุดในระบบ (ต่างจาก Verifier ที่เซ็นแค่คำขอดูบัตร) ข้อกำหนดการเก็บ Issuer signing key จึงเข้มงวดกว่า Verifier ตามระดับ LoA ของ credential ที่ออก (อ้างอิงตาราง LoA ที่ [§ 3.2.6.1.1](../03-issuance-flow/02-full-flow/07-data-flow-and-policy.md#32611-loa-แต่ละระดับหมายถึงอะไร)):

| LoA ของ credential ที่ออก | ข้อกำหนดการเก็บ Issuer signing key |
|---------------------------|-------------------------------------|
| LoA 1–2 | softkey (เก็บเป็นไฟล์ในเครื่อง) ยอมรับได้ แต่ **SHOULD** มีการควบคุมการเข้าถึงที่เหมาะสม (เช่น encrypted at rest, จำกัดสิทธิ์ผู้เข้าถึง) |
| LoA 3–4 (เช่น บัตรประชาชนดิจิทัล) | **MUST** เก็บ signing key ใน HSM |

- ระดับการรับรอง HSM ที่ ETDA บังคับ (เช่น FIPS 140-2 Level 2 หรือ Level 3) **อยู่ระหว่างการพิจารณาของ ETDA จะประกาศในเวอร์ชันถัดไป** — Issuer ที่ออก credential ระดับ LoA 3–4 ควรวางแผนงบประมาณสำหรับ HSM ไว้ล่วงหน้า และติดตามประกาศฉบับเต็มก่อนขึ้นระบบจริง
- แนวทางการจัดการ key อื่น ๆ (การหมุน key, `valid_from`/`valid_until`, การ revoke เฉพาะ service) ใช้หลักการเดียวกับที่ระบุไว้ข้างต้นสำหรับทุก Entity

### 6.2.3 Threat Model และการควบคุม

| ภัย | การควบคุมในระบบ |
|-----|------------------|
| ปลอม Trustlist | Detached JWS เซ็นด้วย ETDA key, entity verify ก่อนใช้ |
| ใช้ Trustlist เก่า | Freshness check ทุกครั้ง — หมดอายุ (`exp`) แล้วดึงใหม่ |
| ใช้บัตรที่ถูกเพิกถอน | ตรวจ IETF Token Status List ก่อนเชื่อ |
| DoS (Denial of Service) | ใช้ API key ในการทำ rate limit — ตัวเลข quota ที่แน่นอนดู § 6.2.3.1 |

#### 6.2.3.1 Rate Limit / Quota ของ API Gateway

> **[ยังไม่ได้กำหนดค่ามาตรฐานอย่างเป็นทางการ]** ETDA ยังไม่ได้ประกาศตัวเลข rate limit/quota ที่แน่นอนสำหรับ API Gateway (เช่น request/นาที ต่อ API key)

- ระหว่างนี้ให้ถือว่า rate limit ขึ้นอยู่กับ **tier ของ Entity** ที่ ETDA จัดสรร Entity ที่คาดว่าจะมี throughput สูง (เช่น ออก credential พร้อมกันหลักหมื่นใบ/วัน) **SHOULD** ติดต่อ ETDA ผ่านช่องทางใน [§ 7.5.4](../07-governance-and-conformance/01-conformance-governance-versioning.md#754-ช่องทางติดต่อ) ล่วงหน้าเพื่อขอ quota เฉพาะ (dedicated tier) ก่อนขึ้นระบบจริง
- ดูสรุปหัวข้อ SLA/ค่าใช้จ่ายที่เกี่ยวข้องที่ [§ 7.6](../07-governance-and-conformance/01-conformance-governance-versioning.md#76-sla-และค่าใช้จ่ายในการเข้าร่วมระบบ)

- API key MUST เก็บเป็นความลับ ใช้ยืนยันตัวตน entity ตอนเรียก Trust Gateway (ดู § 6.1.1)

### 6.2.4 Audit Log


ETDA ยังไม่ได้ออกมาตรฐาน Audit Log ฉบับเต็ม จะถูกเพิ่มเติมในเวอร์ชันหน้า

- STEP 7 Notification — Wallet แจ้ง Issuer ว่ารับบัตรแล้ว (`event: credential_accepted`) Issuer เก็บไว้เป็น audit log และ analytics
- Entity SHOULD เก็บ log ของทุกจุดตรวจ trust (pass / fail) ไว้ตรวจย้อนหลัง

### 6.2.5 Policy: เมื่อ Wallet ตรวจ Issuer หรือ Verifier ไม่ได้

บางครั้ง Wallet ตรวจ Issuer หรือ Verifier ไม่ได้ เช่น เปิดเน็ตไม่ได้ ดึง Trustlist ไม่ทัน หรือหา key มาตรวจไม่เจอ Policy นี้บอกว่าต้องทำอย่างไร

**Policy (default = ทิ้ง):**

- ถ้า Wallet ตรวจ trust ไม่ได้ → **ทิ้งทันที ไม่เตือน** นี่คือค่า default (แบบนี้เรียกว่า fail-closed — ไม่ชัวร์ ก็ไม่เชื่อ)
- ตัวเลือกนี้ตั้งค่า (config) ได้ 2 แบบ:
  - `drop` (ค่า default) — ทิ้งเงียบ ๆ ไม่แจ้งผู้ใช้
  - `warn` — เตือนผู้ใช้ก่อน แล้วให้ผู้ใช้เลือกเองว่าจะไปต่อหรือไม่
- ถ้าไม่ได้ตั้งค่าอะไรเลย → ใช้ `drop` เสมอ

**ทำไม default เป็นทิ้ง:** เพื่อความปลอดภัยไว้ก่อน ถ้าตรวจไม่ได้ แปลว่าเราไม่รู้ว่าอีกฝ่ายเชื่อถือได้จริงหรือไม่ การทิ้งดีกว่าการเสี่ยงเชื่อคนปลอม

### 6.2.6 Scenario: ถ้าระบบกลางล่ม จะทำยังไง

ถ้า ETDA หรือ Issuer ล่ม (เปิดใช้งานไม่ได้ชั่วคราว) Wallet ก็ยังต้องใช้งานต่อได้ ไม่ค้าง

**วิธีแก้: Wallet เก็บ cache ไว้ล่วงหน้า** Wallet เก็บ 2 อย่างนี้ไว้ในเครื่อง:

1. **Public key** ของ Issuer และ Verifier (ได้จาก Trustlist ที่ดึงมาก่อนหน้า)
2. **Status list** ล่าสุด (บอกว่าบัตรใบไหนยังใช้ได้ ใบไหนถูกยกเลิก)

**ตอนระบบล่ม:**

- Wallet ใช้ public key จาก cache ตรวจลายเซ็นได้เลย ไม่ต้องต่อเน็ต
- Wallet ใช้ status list จาก cache เช็คสถานะบัตรได้
- ทุก cache มีวันหมดอายุ (TTL) ถ้ายังไม่หมดอายุ ใช้ได้

**ข้อควรระวัง:** ตอนใช้ cache Wallet จะไม่เห็นการเปลี่ยนแปลงใหม่ ๆ เช่น บัตรที่เพิ่งถูกยกเลิกหลังจากดึง cache เมื่อ cache หมดอายุแล้วยังต่อเน็ตไม่ได้ → ใช้ Policy ตาม § 6.2.5 (default = ทิ้ง)

ต่อไปดู [§ 6.3 ความเป็นส่วนตัวและการคุ้มครองข้อมูล](03-privacy-and-data-protection.md) สำหรับมาตรการปกป้องความเป็นส่วนตัวของผู้ถือ VC
