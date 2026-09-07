# TakeOnTime — Remaining Build Roadmap

**Purpose:** Concrete answer to "what more is needed" — a day-by-day punch list from where you are now to MVP launch. Update the checkboxes as you go; this is the living tracker.

---

## VENDOR APP (finish this entirely first)

### Menu Module (in progress)
- [x] Day 1 — Auth, `users` table, router shell
- [x] Day 2 — Store tab (header, toggle, break, quick actions)
- [x] Day 3, Page 1 — Categories CRUD
- [ ] Day 3, Page 2 — Items List Page build (spec exists, confirm implementation) — `menu_items` table, RLS, search/filter UI
- [ ] Day 3, Page 3 — Item Form Page (create/edit): name, description, price (paise), image upload to `item-images` bucket, sold-out toggle

### Orders Module
- [ ] Day 4 — `orders` + `order_items` tables + RLS (client select-only)
- [ ] Day 4 — Orders tab UI: live list, status chips, pull-to-refresh
- [ ] Day 5 — Realtime subscription wiring (new order appears live)
- [ ] Day 5 — Order Detail Page (line items, customer note, total)
- [ ] Day 6 — `update-order-status` Edge Function (state machine enforcement)
- [ ] Day 6 — Accept / Reject actions wired to the Edge Function
- [ ] Day 6 — Status progression UI (accepted → preparing → ready → completed)

### Notifications Module
- [ ] Day 7 — Firebase project setup + FlutterFlow FCM integration
- [ ] Day 7 — `device_tokens` table (or column on `users`) to store push tokens
- [ ] Day 7 — `send-fcm-notification` Edge Function
- [ ] Day 7 — Trigger push on new order + on approval decision

### Vendor Profile & Settings
- [ ] Day 8 — Profile tab (business details edit, logo upload)
- [ ] Day 8 — Account Issue / Pending Approval pages (build for real, not stubs)
- [ ] Day 8 — Logout, basic settings

### Vendor App Hardening
- [ ] Day 9 — Full RLS isolation re-test across every vendor table (categories, items, orders, order_items)
- [ ] Day 9 — Loading/Empty/Error state audit across every page (per UX Spec §4 — no page ships without all 5 states)
- [ ] Day 9 — Manual regression pass on Store + Menu + Orders together

**Milestone M1/M2 reached here** (per `07-Engineering-Plan.md`) — Vendor app functionally complete for a manually-seeded test order.

---

## CUSTOMER APP (start only after Vendor app above is fully done)

- [ ] Day 10 — Customer auth + `users` row reuse (same shared table) + app shell/nav
- [ ] Day 11 — Vendor Discovery page: list of approved vendors, status-aware badges (Open/Closed/On Break), search
- [ ] Day 12 — Vendor Detail page: categories → items browse (read-only, RLS allows public read where `is_approved = true`)
- [ ] Day 13 — Cart (single-vendor constraint), item quantity controls
- [ ] Day 14 — Checkout page, order summary, `create-order` Edge Function
- [ ] Day 15 — Razorpay integration (checkout SDK/webview), test-mode keys
- [ ] Day 15 — `razorpay-webhook` Edge Function (signature verify, idempotent, flips `pending_payment → confirmed`)
- [ ] Day 16 — Order Tracking page: Realtime status updates, visual timeline (confirmed → accepted → preparing → ready → completed)
- [ ] Day 16 — Customer push notifications on each status change
- [ ] Day 17 — Order History page
- [ ] Day 17 — Customer Profile/Settings
- [ ] Day 18 — Customer app hardening: RLS re-test, state audit, full purchase-flow regression

**Milestone M3 reached here** — a customer can discover, order, pay, and track end-to-end.

---

## ADMIN WEB PANEL (start only after Customer app is done)

- [ ] Day 19 — Admin auth (invite-only, `role = 'admin'` check), admin shell (web layout)
- [ ] Day 20 — Vendor Approval Queue page: pending vendors list, detail view
- [ ] Day 20 — `approve-vendor` Edge Function (approve/reject with reason)
- [ ] Day 21 — Vendor Directory (search/filter all vendors, suspend action)
- [ ] Day 22 — Orders Monitor dashboard (live order volume, filters by vendor/status/date)
- [ ] Day 23 — Basic analytics: orders/day, GMV/day, active vendor count, approval funnel (per `10-Operations.md §10`)
- [ ] Day 24 — Platform Settings page (category taxonomy, support contact info)
- [ ] Day 25 — Admin panel hardening: admin-only Edge Function auth re-test, RLS re-test on admin-read policies

**Milestone M4 reached here** — admin can operate the platform without manual SQL.

---

## PRE-LAUNCH (all three apps done)

- [ ] Full E2E pass per `08-Testing-Evaluation.md §4` (vendor onboarding → menu → order → payment → tracking → admin monitoring), run on Staging
- [ ] Security pass per `08-Testing-Evaluation.md §6` (RLS bypass attempts, forged webhook, non-admin Edge Function calls)
- [ ] UAT with 2-3 real vendors + 3-5 real test customers per `08-Testing-Evaluation.md §5`
- [ ] Switch Razorpay Staging → Production live keys, confirm webhook URL points to Production
- [ ] Confirm Supabase Production project secrets are set (service role, Razorpay live secret, FCM) per `09-Deployment.md §5`
- [ ] App Store / Play Store submission (Vendor app, Customer app)
- [ ] Admin panel deployed to production domain
- [ ] Ops monitoring/alerts live per `10-Operations.md §1–4` before first real vendor onboards

**Milestone M5 — MVP Launch Candidate.**

---

## Things Deliberately Deferred (don't build unless explicitly requested)

- Cash on Delivery/Pickup
- Delivery/rider logistics
- Multi-vendor cart
- Coupons/promotions (Quick Actions placeholder only)
- Real inventory/stock tracking ("Low Stock" stays a stub)
- Any AI feature (see `04-AI-Spec.md`)
- Dark mode
- Multi-language

---

## How to use this with the Master Prompt

1. Start a new conversation.
2. Paste `11-Master-AI-Prompt.md`.
3. Attach the other 10 docs + this roadmap.
4. Say: **"Continue from Day 3, Page 2 — Items List Page build."** (or wherever you actually left off)
5. I'll build that one unit, give you the testing/deliverables checklist, and wait for "Next Day."
