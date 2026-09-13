# 08 — Realtime, Events, Notifications, and Background Work

## 8.1 Realtime channels

### Customer

- current order by order id/user.
- reservation status.
- relevant vendor availability.

### Vendor

- new/updated orders for assigned vendor.
- reservation changes.
- staff/operational alerts.

### KDS

- ticket creation/update for station.
- escalation or reassignment.

### Admin

- vendor approvals.
- system order stream.
- settlement exceptions.

## 8.2 Subscription rules

Subscribe narrowly:

```text
orders where id = current_order_id
orders where vendor_id = current_vendor_id
reservations where vendor_id = current_vendor_id
```

Do not open broad unrestricted subscriptions from the client.

## 8.3 Realtime consistency rule

On event:

1. update local UI.
2. keep a refresh path.
3. periodically reconcile sensitive screens.
4. after reconnect, fetch authoritative state.

## 8.4 Outbox pattern

For important domain events, use an outbox-style table:

```text
id
event_type
aggregate_type
aggregate_id
payload
created_at
published_at
attempt_count
last_error
```

Transaction:

```text
business mutation + outbox insert = one commit
```

A dispatcher then performs FCM/email/provider work asynchronously.

## 8.5 FCM

Store:

- device token.
- platform.
- app surface.
- last-seen.
- enabled/disabled.

On repeated provider invalid-token errors, deactivate token.

## 8.6 In-app inbox

`notifications` rows are authoritative for historical alerts.

The UI can offer:

- unread count.
- event filters.
- mark read.
- deep-link to related order/reservation.

## 8.7 Event types

Recommended:

```text
vendor.submitted
vendor.approved
vendor.rejected
vendor.suspended

order.created
order.payment_confirmed
order.accepted
order.preparing
order.ready
order.completed
order.cancelled
order.refunded

reservation.created
reservation.preparing
reservation.ready
reservation.collected
reservation.cancelled
reservation.no_show

pass.purchased
pass.expiring
pass.consumed

settlement.generated
settlement.exception
settlement.paid

staff.invited
staff.accepted
staff.role_changed
```

## 8.8 Retries

External side effects use bounded exponential backoff with dead-letter inspection after repeated failure.

Do not retry a non-idempotent provider command blindly.

## 8.9 Scheduled work

Use scheduled jobs/cron for:

- upcoming reminders.
- pass expiry reminders.
- stale payment reconciliation.
- no-show eligibility.
- settlement close.
- device-token cleanup.
- operational health checks.
