---
name: Vendor app foundation
description: Product decision for the first TakeOnTime vendor app build
---

The first vendor app milestone began as a frontend-first prototype with local persistence and now uses a server-backed demo vendor workspace for live operational data.

**Why:** The supplied product plan sequences vendor UX work before the later customer/admin apps. The current workspace has an Express/Postgres API but no connected production identity provider, so the vendor API uses an explicit demo workspace boundary until real auth is connected.

**How to apply:** Preserve the current screens and interaction model while progressively replacing demo data with real auth, approval/KYC data, menu CRUD, order state transitions, and realtime notifications. Keep server validation authoritative and do not introduce a second visual direction during that integration pass.