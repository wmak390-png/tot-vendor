# 07 — Domain Workflows and State Machines

## 7.1 Vendor status

Derived:

```text
closed
open
on_break
```

Effective status is computed from approval + operational state + business schedule.

A vendor that is not approved can never become customer-orderable.

## 7.2 Order lifecycle

```text
pending_payment
    ├── payment_failed
    └── confirmed
          ├── rejected
          └── accepted
                └── preparing
                      └── ready
                            └── completed

confirmed/accepted/preparing
    └── cancelled (policy controlled)
```

The client cannot directly set arbitrary status.

## 7.3 Order transition guards

Examples:

- only verified payment can confirm.
- only vendor staff with order permission can accept/prep/ready.
- only customer/vendor/admin according to cancellation policy.
- completed is terminal.
- rejected is terminal.
- completed/rejected/refunded state changes require explicit financial policy.

## 7.4 Reservation lifecycle

```text
reserved
  → preparing
  → ready
  → collected

reserved/preparing
  → cancelled

ready/reserved
  → no_show (only after grace period)
```

The exact transition set is domain-configurable by reservation type.

## 7.5 Reservation booking transaction

```text
BEGIN
  lock slot
  verify slot.open
  verify service window
  verify booked < capacity
  verify customer eligibility
  verify duplicate booking rules
  insert reservation
  increment booked
  insert history
COMMIT
```

## 7.6 Cancellation

Cancellation must check:

- terminal status.
- cancellation window.
- actor permission.
- pass/paid entitlement implications.

Only the transaction may decrement booked capacity.

## 7.7 Meal pass workflow

```text
plan published
  → customer purchases
      → payment confirmed
          → pass active
              → reserve entitlement
                  → consume on collection
```

Use a ledger to prevent negative balances.

## 7.8 Pickup OTP

- generate short-lived random secret.
- store hash, not plaintext.
- show OTP only to authorized customer surface.
- vendor staff verifies entered code server-side.
- successful verification marks handover/collection.
- rate-limit failed attempts.

## 7.9 Table reservation

Required checks:

- table exists and is active.
- capacity fits party size.
- table is not overlapping an incompatible reservation.
- branch is open for the service period.
- cancellation/no-show policy applies.

Use unique/exclusion-style constraints where supported and practical.

## 7.10 Staff onboarding

```text
invite
 → pending
 → accepted
 → active
 → suspended/removed
```

Role changes are audited.

## 7.11 Settlement

At close:

```text
orders/payment events
 → validated capture set
 → gross sales
 → refunds
 → commissions
 → taxes/fees
 → manual adjustments
 → net payable
 → batch
 → provider payout
 → reconciliation
```

Do not recalculate historical settlement figures from mutable menu/order labels; settlement lines capture financial snapshots.

## 7.12 Notifications

Business event:

```text
domain mutation
 → durable notification event/outbox
 → in-app notification
 → FCM attempts
```

Push is a delivery channel, not the source of truth.
