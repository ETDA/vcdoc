---
description: "6. Decentralized Identifiers Methodologies — Thai VC ARF 2.0 DRAFT 1"
---

# 6. Decentralized Identifiers Methodologies

{/* METADATA (agent-only — not rendered to readers)
> **สถานะ:** 📄 Reference — เอกสารแปลงจาก PDF ต้นฉบับของ สพธอ. (Thai VC ARF v1.1, มกราคม 2568)
> **แหล่งข้อมูล:** [Thai-VC-ARF-v1-1.pdf](https://www.etda.or.th/getattachment/Our-Service/Digital-Trusted-services-Infrastructure/VC-and-Digital-Document-Wallet/Information/รายงานทางเทคนค-Thai-VC-ARF-v1-1.pdf) — รายงานทางเทคนิค: กรอบแนวทางการทำงานร่วมกันของเอกสารรับรองดิจิทัลสำหรับประเทศไทย
> **เอกสารที่เกี่ยวข้อง:** [ดัชนีเอกสาร ARF](README.md)
*/}

---

บทนี้อธิบายวิธีการของตัวระบุแบบกระจายศูนย์ (decentralized identifier: DID) ที่รายงานฉบับนี้ใช้ ครอบคลุมรูปแบบ DID การสร้างและการลงทะเบียน DID Document และการดึงข้อมูล (resolve) DID Document

เป็นตัวระบุ (identifier) บนระบบทะเบียนเอกสารรับรอง (verifiable data registry) แบบกระจายศูนย์ที่ใช้ URL ในการเชื่อมโยงกับเอนทิตี้ โดยทั่วไป DID จะนำมาใช้ใน VC เพื่อแสดงความเชื่อมโยงไปยังเจ้าของข้อความซึ่งทำให้สามารถส่งต่อหรือโอนย้าย VC จากกระเป๋าเอกสารดิจิทัลหนึ่งไปยังกระเป๋าเอกสารดิจิทัลอีกอันหนึ่งได้โดยไม่จำเป็นต้องออก VC ชุดใหม่อย่างไรก็ตาม VC ไม่จำเป็นต้องใช้ identifier เป็น DID ก็ได้

## 6.1. รูปแบบ DID

อ้างอิงตาม W3C โครงสร้างของ DID สามารถแสดงได้ตามรูปที่ 18 ซึ่งประกอบด้วย 3 ส่วน ได้แก่ (1) scheme (2) DID method และ (3) DID method-specific string

![โครงสร้าง DID](images/p44-0.png)

**รูปที่ 18 โครงสร้าง DID**

## 6.2. การสร้างและการลงทะเบียน DID Document

ยกตัวอย่างการทำ Digital Document โครงสร้างของ DID จะเป็นตามรูปที่ 19 ในส่วนของ DID method จะระบุเป็น “tbsi” และ DID method-specific ขึ้นต้นด้วยตัวอักษร “z” และชุดข้อความสุ่ม 16 ตัวอักษร

![โครงสร้าง DID Document](images/p44-1.png)

**รูปที่ 19 ตัวอย่างโครงสร้าง DID**

จากโครงสร้าง DID ข้างต้น เมื่อทำการสร้าง DID จะมีลักษณะองค์ประกอบ ตามรูปที่ 20

{/* pdf page 45 */}

![DID ID](images/p45-0.png)

**รูปที่ 20 DID ID**

ข้อมูลที่ได้จากการสร้าง DID จะนำไปใช้ในการสร้าง DID Document เพื่อใช้ในการลงทะเบียน (Register) ในระบบ Registry ตามรูปที่ 21 การลงทะเบียนใน Registry จะทำโดยใช้โปรโตคอล OID4VP ซึ่งข้อมูลที่นำมาใช้ในการลงทะเบียน คือ DID Document ในรายงานฉบับนี้จะเป็นการลงทะเบียนแบบออฟไลน์ (Offline)

![การลงทะเบียน DID Document](images/p45-1.png)

**รูปที่ 21 การลงทะเบียน DID Document**

(1) DID Document

เป็นชุดข้อมูลที่อธิบาย DID ประกอบด้วยข้อมูลที่ใช้ในการเข้ารหัสลับ (encrypted data) และกุญแจสาธารณะ (public key) ดังแสดงตามรูปที่ 22

{/* pdf page 46 */}

![โครงสร้าง DID Document](images/p46-0.png)

**รูปที่ 22 โครงสร้าง DID Document**

## 6.3. การดึงข้อมูล (Resolve) DID Document

ระบบของประเทศไทยใช้ DID Method หลัก 3 รูปแบบ แต่ละรูปแบบมีวิธี resolve ต่างกัน ดังนี้

| DID Method | ผู้ใช้ | วิธี Resolve | ต้องติดต่อภายนอก? |
|------------|--------|-------------|:-------------------:|
| `did:web` | หน่วยงาน (Issuer, Verifier, Wallet Provider) | HTTPS GET ไปที่ `/.well-known/did.json` ของโดเมนต์นั้น | ไม่ |
| `did:jwk` | ผู้ถือเอกสาร (Holder) | กุญแจสาธารณะฝังอยู่ในสายอักขระ DID โดยตรง ไม่ต้องดึงจากที่อื่น | ไม่ |
| `did:ndid` | ระบบตัวตนของไทย (เช่น NDID) | ติดต่อ NDID โดยตรง ผ่าน resolver ของ NDID | ใช่ (NDID) |

```mermaid
flowchart LR
    USER["ผู้ตรวจสอบ/กระเป๋า"] --> CHECK{"DID Method?"}
    CHECK -->|did:web| HTTPS["HTTPS GET<br/>.well-known/did.json"]
    CHECK -->|did:jwk| SELF["แยกกุญแจจากสายอักขระ<br/>(self-contained)"]
    CHECK -->|did:ndid หรือ proprietary method| UR["resolver ของผู้ให้บริการ<br/>ของ method นั้น"]
    HTTPS --> DOC["DID Document"]
    SELF --> KEY["กุญแจสาธารณะ"]
    UR --> DOC

    style CHECK fill:#FFF3E0,stroke:#E65100
    style UR fill:#E3F2FD,stroke:#1565C0
```


DID Document ที่ได้จากการ resolve จะมีกุญแจสาธารณะที่ใช้ตรวจลายมือชื่อของเอนทิตีนั้น DID method สาธารณะที่ยังไม่จดทะเบียนใน W3C DID method registry สามารถ resolve ได้ผ่าน resolver ของ method นั้นหรือผ่าน resolver ของ สพธอ. ส่วน proprietary method ต้องติดต่อผู้ให้บริการของ method นั้น ในกรณี `did:ndid` ผู้ให้บริการคือ NDID

{/* pdf page 47 */}

![ขั้นตอน Resolve DID Document](images/p47-0.png)

**รูปที่ 23 ขั้นตอน Resolve DID Document**

![การดึงข้อมูลผ่าน http get](images/p47-1.png)

**รูปที่ 24 การดึงข้อมูลผ่าน http get**

ในตัวอย่าง จะเป็นการแสดงถึงการเรียกในรูปแบบ http get โดย Key ที่ส่งไปพร้อมกับ URL คือ DID ของ Issuer ที่ได้มาจากข้อมูลของ VC และเมื่อส่งข้อมูลในรูปแบบ URL แล้วข้อมูลถูกต้อง ทาง Registry จะตอบกลับเป็น DID Document มาให้ โดย DID Document จะเป็นของ Issuer ที่ได้ทำการลงทะเบียนไว้กับ Registry

{/* pdf page 48 */}

![ข้อมูลที่ผ่านการ resolve](images/p48-0.png)

**รูปที่ 25 ข้อมูลที่ผ่านการ resolve**

![การตั้งค่า Registry ของ DID method](images/p48-1.png)

**รูปที่ 26 การตั้งค่า Registry ของ DID method**

{/* pdf page 49 */}

---

**การนำทาง:** [⬅️ บทที่ 5 — มาตรฐานและข้อปฏิบัติสำหรับ VC และ VP](05-standards-and-compliance.md) · [⬆️ สารบัญ ARF](README.md) · [บทที่ 6.5 — กลไกการสร้างความน่าเชื่อถือ (Trust-Building Mechanism) ➡️](06.5-trust-building-mechanism.md)
