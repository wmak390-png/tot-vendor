# 12 — Testing and Quality Engineering

## 12.1 Test pyramid

```text
Pure domain tests
       ↓
Postgres constraint/RLS tests
       ↓
Edge Function integration tests
       ↓
Flutter widget/component tests
       ↓
Device/browser tests
       ↓
End-to-end business journeys
```

## 12.2 Required domain tests

- order transition matrix.
- reservation transition matrix.
- vendor effective status.
- cart vendor constraint.
- total calculation.
- pass entitlement.
- capacity atomicity.
- cancellation windows.
- no-show grace period.
- settlement calculation.

## 12.3 RLS matrix tests

For every major table:

- anonymous.
- customer A.
- customer B.
- vendor A.
- vendor B.
- vendor staff.
- admin.

Attempt:

- allowed read.
- forbidden cross-tenant read.
- forbidden write.
- role escalation.
- forged vendor ID.

## 12.4 Edge Function tests

Test:

- missing token.
- expired token.
- wrong role.
- wrong vendor membership.
- malformed body.
- duplicate idempotency key.
- duplicate webhook.
- provider timeout.
- invalid price.
- item not available.
- capacity conflict.
- illegal state transition.

## 12.5 Payment tests

- order creation.
- correct amount.
- capture.
- failed payment.
- replayed webhook.
- wrong signature.
- wrong amount.
- provider event out of order.
- refund.
- partial refund if supported.

## 12.6 Realtime tests

- vendor sees new order.
- customer sees status change.
- reconnect triggers refresh.
- stale event cannot override a newer state.
- unauthorized channel subscription is blocked.

## 12.7 UI tests

### Customer

- discover → menu → checkout.
- failed payment.
- order tracking.
- reservation.
- pass purchase.

### Vendor

- onboarding.
- store open/close/break.
- menu CRUD.
- order lifecycle.
- KDS.
- reservation cancellation.
- staff permission.
- settlement view.

### Admin

- approval.
- rejection.
- suspension.
- settlement audit.
- platform settings.

## 12.8 Load/performance tests

Target scenarios:

- lunch rush order creation.
- many simultaneous slot bookings.
- vendor queue fan-out.
- admin realtime dashboard.
- payment webhook bursts.

Measure:

- p50/p95/p99.
- DB lock wait.
- function duration.
- error rate.
- realtime propagation.
- queue/outbox lag.

## 12.9 Security testing

- privilege escalation.
- IDOR via UUID substitution.
- forged vendor_id.
- forged total.
- replayed webhook.
- private storage access.
- service-role leakage.
- excessive query exposure.
- audit bypass.

## 12.10 UAT

Use distinct roles:

- vendor owner.
- kitchen operator.
- dispatcher.
- customer.
- platform admin.
- finance operator.

Acceptance must prove a full journey from onboarding through settlement.
