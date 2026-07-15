# 5.4 Registries — Status List และ Schema (นอกขอบเขต)

ต่อจาก [§ 5.3 ตัวอย่าง TL JSON](02-tl-json-examples.md) บทสั้นนี้ปิดท้ายบทที่ 5 ด้วยข้อมูลเสริม 2 เรื่องที่อยู่นอกขอบเขตของ trust model โดยตรง แต่จำเป็นต้องมีเพื่อให้ Verifier ตรวจ credential ได้ครบ

## 5.4 Registries — Status List และ Schema (นอกขอบเขต)

> **หมายเหตุ:** ส่วนนี้ *ไม่อยู่* ในขอบเขตของ trust model แต่ใส่ไว้เพื่อให้ diagram มีข้อมูลครบถ้วน
> อ้างอิงแนวทาง EUDI ARF

Issuer ต้องเก็บและ publish ข้อมูล 2 ชุด เพื่อให้ Verifier ตรวจ credential ได้:

| Registry | เก็บอะไร | ใครใช้ | มาตรฐาน |
|----------|---------|--------|---------|
| **Status List** | สถานะของ credential (ใช้ได้ / เพิกถอน / ระงับ) | Verifier ดึงไปเช็คตอน verify VC| Token Status List (`statuslist+jwt`) |
| **Schema / Type Metadata** | โครงสร้างและความหมายของ claim ใน credential | Verifier ใช้ตรวจรูปแบบ, Wallet ใช้แสดงผล | SD-JWT VC Type Metadata (`vct`), JSON Schema |

- **Status List:** Issuer เซ็นและ publish ไว้ที่ .well-known/statuslist.json ตอน verify Verifier ดึง list มาเช็คว่า credential ยังใช้ได้หรือไม่
- **Schema / Type Metadata:** Issuer publish โครงสร้างของ credential ผ่าน JSON Schema Verifier ใช้ตรวจว่า claim ตรงตามแบบหรือไม่ Wallet ใช้ดูว่าจะแสดงผลอย่างไร

> **ทำไมถึงนอกขอบเขต:** registry ทั้ง 2 อย่างนี้เกี่ยวกับ data integrity และ interoperability ระหว่าง Issuer กับ Verifier ไม่ใช่เรื่องการสร้างหรือถอน trust ระหว่างผู้เข้าร่วม จึงไม่นับเป็นส่วนของ trust model แต่ต้องแสดงไว้ใน diagram ของระบบ

จบเนื้อหาบทที่ 5 (โครงสร้างพื้นฐานความน่าเชื่อถือ) — บทถัดไปคือ [บทที่ 6 ความปลอดภัยและความเป็นส่วนตัว](../06-security-and-privacy/01-verifier-confidence-and-registration.md) อธิบายมาตรการป้องกันที่ระบบนี้ใช้ควบคู่กับ Trustlist
