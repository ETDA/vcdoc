# 8.1 คำถามที่พบบ่อย (FAQ) — Trust Framework

ต่อจาก [บทที่ 7 ธรรมาภิบาลและการรับรอง](../07-governance-and-conformance/01-conformance-governance-versioning.md) นี่คือบทสุดท้ายของคู่มือ รวมคำถามที่ผู้อ่านมักสงสัยหลังอ่านเนื้อหาทางเทคนิคมาจนถึงจุดนี้ พร้อมลิงก์กลับไปยังหัวข้อที่เกี่ยวข้องในบทก่อนหน้า

## 8.1 คำถามที่พบบ่อย (FAQ)

**Q: ใครต้องทำตาม framework นี้?**
A: ทุก Entity ที่เข้าร่วม ecosystem ได้แก่ Issuer, Wallet และ Verifier โดยมี ETDA เป็นผู้กำกับดูแล

**Q: ถ้าไม่ทำตามจะเกิดอะไรขึ้น?**
A: อาจไม่ได้รับอนุมัติให้เข้าร่วม หรือถูกถอดออกจาก Trustlist ทำให้คนอื่นไม่เชื่อ credential ที่เกี่ยวข้องอีกต่อไป

**Q: Verifier รู้ได้อย่างไรว่า credential ถูกเพิกถอนแล้ว?**
A: Verifier ดึง Status List ที่ Issuer publish ไว้มาเช็ค ถ้าสถานะคือเพิกถอน ก็จะไม่รับ credential นั้น

**Q: Registries (Status List, Schema) อยู่ในขอบเขตของ trust model หรือไม่?**
A: ไม่อยู่ เพราะเป็นเรื่อง data integrity และ interoperability ระหว่าง Issuer กับ Verifier ใส่ไว้เพียงเพื่อให้ diagram ครบเท่านั้น

**Q: framework นี้ใช้ร่วมกับ EUDI ได้เลยหรือไม่?**
A: ใช้มาตรฐานเดียวกัน (OID4VCI, OID4VP, SD-JWT VC) แต่การข้ามพรมแดนต้องมีข้อตกลง trust ระหว่างกันก่อน

**Q: อยากเข้าร่วมต้องทำอย่างไร?**
A: ลงทะเบียนกับ ETDA เพื่อรับ API key (ดูขั้นตอนการลงทะเบียนที่ [§ 6.1.1](../06-security-and-privacy/01-verifier-confidence-and-registration.md#611-การลงทะเบียน-registration)) ผ่านการตรวจ conformance (ดู [§ 7.4 Conformance Testing](../07-governance-and-conformance/01-conformance-governance-versioning.md#74-conformance-testing)) แล้วจะถูกเพิ่มเข้า Trustlist สำหรับขั้นตอนสมัครเป็น Issuer แบบละเอียด (เอกสารที่ต้องยื่น, เกณฑ์ตรวจสอบ, timeline) ดูที่ [§ 7.5 ขั้นตอนสมัครเป็น Issuer](../07-governance-and-conformance/01-conformance-governance-versioning.md#75-ขั้นตอนสมัครเป็น-issuer)

**Q: ติดต่อ ETDA เพื่อสอบถามเรื่องการสมัครได้ทางไหน?**
A: ดูช่องทางติดต่ออย่างเป็นทางการที่ [§ 7.5.4 ช่องทางติดต่อ](../07-governance-and-conformance/01-conformance-governance-versioning.md#754-ช่องทางติดต่อ) — หากยังไม่มีช่องทางที่ระบุไว้ ให้ถือว่า **อยู่ระหว่างการพิจารณาของ ETDA จะประกาศในเวอร์ชันถัดไป**

---

**Q: ถ้าเพิ่งเป็นเอกชนอยากสมัครเป็น Issuer ทำได้ไหม ไม่ใช่แค่หน่วยงานรัฐ?**
A: ได้ — ทั้งหน่วยงานรัฐและองค์กรเอกชนที่ผ่านเกณฑ์การตรวจสอบของ ETDA สมัครเป็น Issuer ได้ทั้งคู่ (ดูตัวอย่างธนาคารเอกชนที่เป็น Issuer ที่ [§ 5.3.3](../05-trust-infrastructure/02-tl-json-examples.md#533-tl-json--multi-role-organization-bbl--issuer--verifier) และนิยาม Issuer ที่ [§ 1.1 คำศัพท์และนิยาม](../01-concepts-and-roles/01-glossary.md))

---

> **เอกสารที่เกี่ยวข้อง:**
> - [OpenID4VCI 1.0 — OpenID for Verifiable Credential Issuance](https://openid.github.io/OpenID4VCI/openid-4-verifiable-credential-issuance-1_0-wg-draft.html)
> - [OpenID4VP 1.0 — OpenID for Verifiable Presentations](https://openid.github.io/OpenID4VP/openid-4-verifiable-presentations-1_0-wg-draft.html)
> - [OpenID4VC HAIP 1.1 — High Assurance Interoperability Profile](https://openid.github.io/OpenID4VC-HAIP/openid4vc-high-assurance-interoperability-profile-1_1-wg-draft.html)
> - [EUDI ARF 2.9.0 — Architecture and Reference Framework](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework)
> - [EUDI — Wallet Unit Attestation (discussion topic)](https://eudi.dev/latest/discussion-topics/c-wallet-unit-attestation/)
> - [EUDI TS3 — Wallet Unit Attestation (technical specification)](https://github.com/eu-digital-identity-wallet/eudi-doc-standards-and-technical-specifications/blob/main/docs/technical-specifications/ts3-wallet-unit-attestation.md#2-solution-description)
