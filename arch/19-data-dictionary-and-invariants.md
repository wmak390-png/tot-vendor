# 19 — Data Dictionary and Non-Negotiable Invariants

## Money

All money is integer paise.

```text
₹125.50 → 12550
```

No floating-point financial totals.

## Time

Use:

- `timestamptz` for instants.
- explicit vendor/campus timezone.
- date + local time only where the business concept is a local schedule.

Never compare local strings for operational windows.

## Statuses

Avoid UI-specific capitalization in persisted values. Use stable machine values:

```text
pending_payment
payment_failed
confirmed
accepted
preparing
ready
completed
rejected
cancelled
```

Map machine values to localized UI labels.

## Vendor approval

```text
pending
approved
rejected
suspended
```

Only approved vendors enter public discovery.

## Reservation

```text
reserved
preparing
ready
collected
cancelled
no_show
```

## Pass

```text
pending_payment
active
paused
expired
cancelled
exhausted
```

## Settlement

```text
open
calculated
pending_payout
paid
failed
reconciled
```

## Invariants

### Cart

```text
all cart items.vendor_id == cart.vendor_id
```

### Order total

```text
total =
  subtotal
  + tax
  + service_fee
  - discount
```

Server-calculated.

### Reservation capacity

```text
0 <= booked <= capacity
```

### Payment

Captured provider payment amount must equal the expected internal amount unless an explicit reconciliation policy handles the discrepancy.

### Role

A user cannot self-elevate role through client data.

### Staff membership

A staff role only applies while the membership is active.

### Menu category

`menu_item.vendor_id == menu_category.vendor_id`.

### Settlement

Settlement lines must reconcile to immutable payment/refund events.

### Audit

Privileged mutations create an audit record in the same transaction where practical.
