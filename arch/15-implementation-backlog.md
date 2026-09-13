# 15 — Full Advanced Implementation Backlog

## Phase A — Platform foundation

- Supabase projects.
- Auth.
- user trigger/profile.
- base roles.
- base RLS helpers.
- migrations.
- audit log.
- environments.
- Storage buckets.
- device token model.

**Exit:** identity and authorization can be tested independently.

## Phase B — Organization/vendor domain

- campuses.
- facilities.
- vendors.
- branches.
- vendor documents.
- approval states.
- vendor profile.
- operating hours.
- store breaks.

**Exit:** admin can approve a vendor and vendor can see an authorized workspace.

## Phase C — Menu and store operations

- categories.
- items.
- image upload.
- availability.
- store state.
- vendor dashboard.
- vendor menu screens.

**Exit:** vendor can operate the public menu safely.

## Phase D — Orders/payments

- order schema.
- create-order function.
- Razorpay order creation.
- webhook.
- order state machine.
- history.
- pickup slot.
- OTP.
- customer checkout.
- vendor queue.

**Exit:** prepaid order can complete end-to-end.

## Phase E — KDS and staff

- staff invitations.
- roles.
- permissions.
- stations.
- KDS tickets.
- station routing.
- dispatcher/waiter views.
- handover verification.

**Exit:** vendor can execute kitchen operations with separate staff permissions.

## Phase F — Reservations/capacity

- meal slots.
- capacity locking.
- reservations.
- cancellations.
- no-show.
- table model.
- floorplan.
- customer reservation UI.

**Exit:** concurrent booking cannot oversell.

## Phase G — Meal passes

- plan catalog.
- purchase.
- entitlement ledger.
- usage calendar.
- slot reservation.
- consumption.

**Exit:** pass lifecycle is financially and operationally reconciled.

## Phase H — Finance/settlements

- settlement batches.
- line ledger.
- commissions.
- taxes.
- adjustments.
- payouts.
- reconciliation.
- statements.

**Exit:** vendor settlement totals can be traced to captured/refunded order events.

## Phase I — Admin/platform operations

- realtime order monitor.
- vendor KYC.
- suspension.
- campus.
- taxonomy.
- settings.
- maintenance mode.
- support.
- admin RBAC.

## Phase J — Customer experience hardening

- discovery ranking.
- notifications.
- saved preferences.
- feedback.
- issue/refund flow.
- pickup directions.
- delegates/buddies where approved.

## Phase K — Hardening

- RLS penetration tests.
- webhook replay tests.
- load tests.
- backup restore.
- crash/error reporting.
- device matrix.
- accessibility.
- UAT.
- app store / web release.

## Final production journey

```text
Customer:
discover
 → vendor/menu
 → cart
 → payment
 → confirmed
 → track
 → pickup OTP
 → completed
 → feedback

Vendor:
apply
 → KYC
 → approval
 → store open
 → menu
 → order
 → KDS
 → ready
 → handover
 → settlement

Admin:
review
 → approve
 → monitor
 → audit
 → reconcile
 → configure
```
