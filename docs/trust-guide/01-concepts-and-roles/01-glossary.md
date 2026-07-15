# 1.1 คำศัพท์และนิยาม

## 1.1 คำศัพท์และนิยาม

ก่อนอ่านเนื้อหาทางเทคนิคในบทถัดไป ควรทำความรู้จักคำศัพท์หลักที่ใช้ตลอดทั้งคู่มือนี้ก่อน ตารางด้านล่างรวมคำศัพท์ที่พบบ่อยที่สุด เรียงตามลำดับที่ผู้อ่านจะเจอในเนื้อหา

| คำศัพท์ | ความหมาย |
|---------|----------|
| **EUDI** | กระเป๋าเอกสารดิจิทัลของสหภาพยุโรป (European Digital Identity) ใช้เก็บและแสดงเอกสารดิจิทัล |
| **EUDI ARF** | เอกสารกรอบสถาปัตยกรรมของ EUDI (Architecture and Reference Framework) บอกว่าระบบต้องทำงานอย่างไร |
| **OID4VCI** | protocol สำหรับ "ออก" credential จาก Issuer ไปยัง Wallet (OpenID for Verifiable Credential Issuance) |
| **OID4VP** | protocol สำหรับ "แสดง" credential จาก Wallet ไปยัง Verifier (OpenID for Verifiable Presentations) |
| **Issuer** | ผู้ออก credential เซ็นและส่งให้ Holder — **หน่วยงานรัฐและองค์กรเอกชนที่ผ่านเกณฑ์การตรวจสอบของ ETDA สมัครเป็น Issuer ได้ทั้งคู่** เช่น หน่วยงานรัฐที่ออกบัตรประชาชนดิจิทัล หรือธนาคารเอกชนที่ออก credential ยืนยันบัญชี (ดูตัวอย่าง BBL ใน `05-trust-infrastructure/02-tl-json-examples.md`) — ดูขั้นตอนสมัครที่ [§ 7.5](../07-governance-and-conformance/01-conformance-governance-versioning.md#75-ขั้นตอนสมัครเป็น-issuer) |
| **Holder** | เจ้าของ credential เก็บไว้ใน Wallet และเป็นคนเลือกแสดง |
| **Wallet** | แอปที่ Holder ใช้เก็บ credential และแสดงให้ Verifier |
| **Verifier** | ผู้ตรวจ credential หรือเรียกว่า Relying Party คนที่ขอดูและเชื่อข้อมูล |
| **Credential / VC** | เอกสารดิจิทัลที่ Issuer เซ็น (Verifiable Credential) พิสูจน์ได้ว่าจริงและไม่ถูกแก้ |
| **Status List** | รายการสถานะของ credential บอกว่ายังใช้ได้ ถูกเพิกถอน หรือถูกระงับ (Token Status List, `statuslist+jwt`) |
| **Schema** | แบบโครงสร้างของ credential บอกว่ามี field อะไรบ้างและความหมายคืออะไร |
| **Metadata** | ข้อมูลกำกับ เช่น Issuer เป็นใคร, credential แบบไหน, ใช้ key อะไรเซ็น |
| **Trustlist** | รายชื่อผู้เข้าร่วมที่ได้รับอนุมัติ เซ็นโดย Governance Authority ใช้บอกว่าใครเชื่อถือได้ |
| **Gateway** | ตัวกลางที่เชื่อมระบบหรือช่วยตรวจ trust ก่อนส่งต่อ request |
| **ETDA** | สพธอ. (Electronic Transactions Development Agency) หน่วยงานกำกับดูแลของไทย วางกฎและอนุมัติผู้เข้าร่วม |
| **Governance Authority** | ผู้วางกฎของ trust framework อนุมัติและถอนสิทธิ์ผู้เข้าร่วม |
| **SD-JWT VC** | รูปแบบ credential ที่เปิดเผยข้อมูลแบบเลือกได้ (selective disclosure) แสดงเฉพาะ field ที่จำเป็น (dc+sd-jwt) |
| **DID** | ตัวระบุแบบกระจายศูนย์ (Decentralized Identifier) ใช้ชี้ตัวตนและหา key สำหรับตรวจลายเซ็น |
| **PKI** | ระบบจัดการ key และใบรับรอง (Public Key Infrastructure) ใช้ออกและตรวจ key |
| **LoA** | ระดับความเชื่อมั่น (Level of Assurance) บอกว่าพิสูจน์ตัวตนเข้มแค่ไหน |
| **TTL** | อายุของข้อมูลใน cache (Time-to-Live) บอกว่าเก็บใช้ได้นานแค่ไหนก่อนต้องดึงใหม่ เช่น Trustlist ที่ดึงมามี TTL 24 ชม. เมื่อหมดอายุต้องดึงฉบับใหม่จาก ETDA |
| **aal** (Authenticator Assurance Level) | ระดับความเข้มของการยืนยันตัวตนผู้ใช้ปลายทาง (ไม่ใช่ระดับความน่าเชื่อถือของ credential แบบ LoA) ใช้ในขั้นตอนตรวจ trust เพื่อยืนยันว่าผู้ใช้ authen ตัวเองเข้มแค่ไหนก่อนดำเนินการ เช่น `"aal": "high"` หมายถึงยืนยันตัวตนแบบ multi-factor ค่าที่พบในเอกสารนี้มี `high` และ `low` **ความสัมพันธ์กับ LoA:** LoA บอกความน่าเชื่อถือของ *credential ที่ออก* ส่วน aal บอกความเข้มของการยืนยันตัวตน *ผู้ใช้ ณ ขณะทำธุรกรรม* — LoA สูง (เช่น 3-4) มักกำหนดให้ต้องมี aal สูง (`high`) ควบคู่กัน แต่ทั้งสองเป็นคนละมิติกัน |

เมื่อคุ้นกับคำศัพท์ข้างต้นแล้ว บทถัดไป ([1.2 บทบาทและผู้เกี่ยวข้อง](02-roles-and-trust-model.md)) จะอธิบายว่าแต่ละฝ่าย (Issuer, Holder, Wallet, Verifier, ETDA) ใช้คำเหล่านี้ทำหน้าที่อะไรบ้าง

