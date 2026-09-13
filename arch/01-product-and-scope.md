# 01 — Full Product Scope

## 1. Product definition

TakeOnTime is a cross-platform food-service operating system for campus, office, hotel, mess, canteen, cafe, restaurant, and food-court environments.

It supports prepaid food ordering, pickup, meal passes, reservations, vendor operations, kitchen execution, staff access, branches/tables, customer communications, compliance, and admin/platform operations.

## 1.1 Product surfaces

1. Customer mobile app.
2. Vendor mobile app.
3. Vendor KDS/workstation mode.
4. Admin web console.
5. Optional operational web views for settlement/support.
6. Shared Supabase identity, data, storage, realtime, and trusted functions.

## 1.2 Customer capability set

### Discovery

- nearby/available counters.
- campus/food court filters.
- business-type filtering.
- search.
- open/on-break/closed state.
- live menu availability.

### Ordering

- single-vendor cart.
- menu item customization.
- promised pickup slot.
- prepaid checkout.
- order receipt.
- live status.
- pickup counter/directions.
- pickup OTP.
- reorder.

### Reservations

- meal-slot reservation.
- seat/table reservation.
- floorplan/table selection where supported.
- capacity-aware booking.
- no-show lifecycle.
- cancellation rules.

### Meal passes

- browse active plans.
- purchase.
- view remaining entitlements.
- calendar.
- reserve against pass.
- daily-use restrictions.

### Account and communications

- profile.
- campus/workplace details.
- dietary preferences.
- pickup preferences.
- notifications.
- saved payment methods when provider capability permits.
- pickup buddy/sub-delegate concepts, subject to authorization model.

### After-service

- rating.
- tags.
- feedback.
- issue reporting.
- refund/reconciliation status.

## 1.3 Vendor capability set

### Commerce

- vendor onboarding.
- approval/compliance.
- store state.
- menu categories.
- menu items.
- images.
- pricing.
- availability.
- preparation times.

### Kitchen

- order queue.
- KOT.
- accept/reject.
- prepare/start cooking.
- ready.
- handover.
- pickup OTP verification.
- KDS station.

### Capacity and reservations

- meal slots.
- capacity.
- table counts.
- reservations.
- reservation status.
- no-show handling.
- table occupancy.
- floor/table management.

### Commercial

- meal plans.
- subscriptions/passes.
- settlement ledger.
- payout account metadata.
- statements/invoices.
- commission visibility.

### Workforce

- vendor staff.
- RBAC.
- shift access.
- station assignments.
- KDS operator role.
- counter/dispatcher role.
- floor service role.

### Compliance/support

- business profile.
- legal/payout details.
- KYC documents.
- verification status.
- correction/appeal workflow.
- support entry points.

## 1.4 Admin capability set

- pending vendor queue.
- KYC and compliance audit.
- approve/reject/suspend.
- vendor directory.
- campus/food court directory.
- branches/facilities.
- platform taxonomy.
- commissions and tax configuration.
- maintenance mode.
- settlement audit.
- realtime operational monitoring.
- regional/operator delegation.
- support/dispute access.
- immutable audit trail.

## 1.5 Business type feature gating

```text
hotel:
  dining
  table reservations
  room/campus context where configured

restaurant/cafe:
  ordering
  pickup
  optional reservations

mess:
  meal passes
  daily slots
  tiffin/meal entitlements

canteen:
  high-throughput prepaid pickup
  KDS
  counter/collection flow

food court:
  multiple branches/counters
  campus discovery
```

Feature gates must be data-driven, not hard-coded separately in each client.

## 1.6 Product invariants

- A customer cart contains one vendor at a time.
- Vendor approval gates customer visibility.
- Postgres is authoritative.
- Payment capture is never inferred from client UI.
- Order totals are recalculated server-side.
- Capacity never becomes negative.
- Role changes require privileged authorization.
- A push notification failure cannot invalidate a completed business transaction.
- Every privileged state change is auditable.
- Every critical screen defines loading/empty/error/retry states.
- Customer, vendor, and admin data are tenant-isolated by RLS.

## 1.7 Advanced scope boundary

This reconstruction intentionally does **not** reduce KDS, staff/RBAC, settlements, branch/table operations, reservations, meal passes, or compliance to future work. They are part of the full target architecture.

Provider-specific integrations may still be staged, but the data model and authorization boundary must support the complete product.
