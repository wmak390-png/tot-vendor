# TakeOnTime — Testing & Evaluation Plan

**Version:** 1.0
**Companion to:** `07-Engineering-Plan.md`

---

## 1. Test Strategy

Testing happens at three points for every feature, matching the existing per-page build pattern already in use (categories/items):
1. **RLS test** (SQL, immediately after writing policies, before any client code touches the table).
2. **Page-level manual test checklist** (per FlutterFlow page — already the established pattern; every day's deliverables includes a testing checklist).
3. **Cross-app integration test** (once a flow spans more than one app, e.g., vendor accepts an order the customer placed).

No page or Edge Function is marked "done" without its checklist fully checked off — this mirrors the project's existing day-by-day discipline and should not be relaxed for speed.

## 2. Unit Tests

| Target | What to test |
|---|---|
| Edge Function: `create-order` | Rejects orders for non-approved/closed vendors; rejects items not belonging to the vendor; correctly sums `total_paise`. |
| Edge Function: `update-order-status` | Rejects illegal transitions (table-driven test over the full state machine matrix); allows all legal transitions; enforces caller-owns-vendor check. |
| Edge Function: `razorpay-webhook` | Rejects bad signatures; is idempotent when the same `razorpay_payment_id` is delivered twice; correctly flips order to `confirmed` only on `payment.captured`. |
| DB triggers | `set_updated_at()` fires on every relevant table update; `auth.users → users` signup trigger creates exactly one row per signup. |

## 3. Integration Tests

| Scenario | Steps | Expected result |
|---|---|---|
| Vendor RLS isolation | Log in as Vendor A, query `menu_categories`/`menu_items`/`orders`; repeat as Vendor B | Each vendor sees only their own rows — already the established pattern from the Day 3 categories test ("as vendor A's JWT, should only see A's categories"); repeat this exact check for every new vendor-scoped table. |
| End-to-end order flow | Customer places order → pays (Razorpay test mode) → vendor sees it live → vendor accepts → status progresses to ready → customer sees each transition live | Order lands in `orders` with `pending_payment`, flips to `confirmed` only after webhook fires, Realtime pushes update to both apps within ~3s, FCM push received at each transition. |
| Vendor approval flow | Admin rejects a vendor with a reason → vendor app | Vendor routed to `AccountIssuePage` showing the exact reason text; admin approves same vendor → vendor routed to `MainNavPage` on next app load. |
| Temporary break expiry | Vendor sets a 30-min break → wait/simulate `break_until` passing | Effective status flips from "On Break" back to whatever `accepting_orders` currently is, without any client-side manual refresh logic — verifies the cron/derived-status design actually holds. |

## 4. End-to-End (E2E) Tests

- Full vendor onboarding → menu build → go live (manual/scripted walkthrough per milestone M1).
- Full customer purchase journey (discovery → cart → payment → tracking) per milestone M3.
- Full admin operational loop (approve vendor → monitor its first order) per milestone M4.
- Run E2E pass before each milestone sign-off in `07-Engineering-Plan.md`, not just before final launch.

## 5. User Acceptance Testing (UAT)

- Recruit 2–3 real prospective vendors to complete real onboarding + menu build on a staging vendor app; capture friction points (this is a solo/small-team MVP — even 2–3 real users surfaces most UX gaps).
- Recruit 3–5 test customers to complete a real (test-mode) purchase; verify they understand order status wording without explanation.
- Admin UAT: have the actual person who will do approvals in production walk through the approval queue UI once it's built, before relying on it (currently approvals are done manually via SQL per the Engineering Plan — UAT gates the cutover).

## 6. Security Testing

- Attempt direct table writes to `orders`/`payments`/`order_items` as an authenticated non-service-role user — must fail (client is select-only per RLS design in `06-API-Data-Design.md`).
- Attempt to call `approve-vendor` and `update-order-status` as a non-admin/non-owning vendor — must return `403`.
- Send a forged/unsigned request to `razorpay-webhook` — must return `400` and must not mutate any order.
- Verify no service-role key or Razorpay secret is present in any client bundle (FlutterFlow app export) or in client-visible network requests.
- Verify Storage bucket write policies block uploading to another vendor's `item-images` path.

## 7. Performance Testing

- Load-test `create-order` and `update-order-status` Edge Functions at a modest concurrency (e.g., 50 concurrent requests) to confirm no obvious lock contention on `orders`/`menu_items` at MVP scale.
- Confirm indexed columns (`vendor_id`, `category_id`, `status`) actually get used via `EXPLAIN ANALYZE` on the categories/items/orders list queries before considering a page "done."
- Confirm Realtime update latency stays under the 3-second target from `01-PRD.md §10` under normal test conditions.

## 8. Regression Testing

- Every new table/RLS policy added must re-run the RLS isolation test pattern (§3) for that table — not just the new feature's happy path — since a missed RLS policy is a silent data-leak risk, not just a broken feature.
- Maintain a running manual regression checklist per app (Vendor/Customer/Admin) covering all previously-shipped pages; re-walk it before each milestone, not just before final launch.

## 9. AI Evaluation

Not applicable for MVP — see `04-AI-Spec.md`. Revisit this section if any AI feature is approved for build.

## 10. Acceptance Criteria (Platform-Level, ties to `01-PRD.md §10`)

| Criterion | Threshold |
|---|---|
| RLS isolation | 100% — zero cross-vendor/cross-customer data leakage across all tested tables |
| Payment integrity | 0 orders reach `confirmed` without a verified webhook in any test run |
| Order status latency | < 3s from vendor/webhook action to customer-visible update in test environment |
| Push delivery | > 90% delivered in test runs with valid device tokens |
| Illegal state transition attempts | 100% rejected by `update-order-status` |
