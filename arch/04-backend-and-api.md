# 04 — Backend and API

## 4.1 API strategy

The production backend has two read/write paths:

1. **Direct RLS-protected PostgREST/Supabase queries** for safe reads and simple user-owned updates.
2. **Edge Functions / RPC** for privileged, transactional, third-party, or state-machine operations.

The previous Express endpoints remain useful as a compatibility reference.

## 4.2 Function catalog

### Authentication / profile

- `complete-profile`
- `register-device`
- `remove-device`
- `update-notification-preferences`

### Vendor

- `submit-vendor`
- `approve-vendor`
- `reject-vendor`
- `update-vendor-store`
- `upload-vendor-document`
- `manage-vendor-staff`
- `manage-branch`
- `manage-table`

### Menu

- direct RLS CRUD where safe
- `publish-menu`
- `bulk-update-availability`

### Orders

- `create-order`
- `create-payment-order`
- `razorpay-webhook`
- `update-order-status`
- `verify-pickup-otp`
- `cancel-order`
- `refund-order`

### Reservations

- `create-meal-slot`
- `reserve-meal-slot`
- `reserve-table`
- `update-reservation-status`
- `cancel-reservation`
- `mark-no-show`

### Meal passes

- `create-pass-plan`
- `purchase-pass`
- `reserve-pass-meal`
- `consume-pass-entitlement`
- `pause-pass` where business rules permit

### Finance

- `settlement-close`
- `settlement-reconcile`
- `generate-vendor-statement`

### Platform

- `update-platform-setting`
- `set-maintenance-mode`
- `broadcast-campus-message`

## 4.3 Common response contract

```json
{
  "ok": true,
  "data": {},
  "request_id": "uuid"
}
```

Error:

```json
{
  "ok": false,
  "error": {
    "code": "ILLEGAL_ORDER_TRANSITION",
    "message": "The order has already moved to the next stage.",
    "status": 409
  },
  "request_id": "uuid"
}
```

## 4.4 Rules for Edge Functions

Every function must:

1. validate request shape;
2. identify caller;
3. resolve actor role/membership;
4. validate resource ownership;
5. validate business preconditions;
6. execute one transaction where state must change atomically;
7. insert history/audit/event records;
8. commit;
9. trigger best-effort external notification/outbox processing;
10. return an idempotent result when replayed.

## 4.5 `create-order`

### Request

```json
{
  "vendor_id": "uuid",
  "items": [
    {"menu_item_id": "uuid", "quantity": 2}
  ],
  "pickup_slot_id": "uuid",
  "notes": "less spicy"
}
```

### Server checks

- caller is customer.
- vendor approved and orderable.
- all items belong to vendor.
- items are active/available.
- quantity is bounded.
- pickup slot is valid.
- vendor business rules allow the order.
- price is read from Postgres, never from client total.

### Transaction

```text
BEGIN
  lock/read items
  calculate subtotal
  calculate fees/taxes
  create order
  create order_items with snapshots
  create payment intent/order reference
  create order history
COMMIT
```

## 4.6 `razorpay-webhook`

- read raw request body exactly.
- verify signature with secret.
- derive provider event identity.
- insert provider event if unseen.
- transactionally reconcile payment.
- verify amount and currency.
- match the provider order to internal order.
- transition `pending_payment` → `confirmed` only when capture criteria are satisfied.
- replayed event returns success without duplicating side effects.

## 4.7 `update-order-status`

Allowed vendor lifecycle:

```text
confirmed → accepted
accepted → preparing
preparing → ready
ready → completed
confirmed → rejected
accepted/preparing → cancelled (policy controlled)
```

Only a matching vendor staff member or admin may move vendor-controlled stages.

## 4.8 Reservation APIs

Capacity changes must use a transaction:

```sql
select ... for update;
check open;
check booked < capacity;
insert reservation;
increment booked;
insert history;
commit;
```

Cancellation reverses capacity only once.

## 4.9 Idempotency

Use:

- `idempotency_keys` table.
- provider event IDs.
- client mutation UUIDs for critical commands.

Unique key:

```text
(actor_id, command_type, idempotency_key)
```

A replay returns the original response when safe.

## 4.10 Compatibility with previous Express API

Map legacy routes:

| Express | Production |
|---|---|
| GET `/vendor/operations` | RLS queries / `vendor-dashboard-snapshot` |
| PATCH `/vendor/operations/store` | `update-vendor-store` |
| POST `/vendor/operations/plans` | `create-pass-plan` |
| PATCH `/vendor/operations/plans/:id` | `update-pass-plan` |
| PATCH `/vendor/operations/slots/:id` | `update-meal-slot` |
| POST `/vendor/operations/categories` | RLS insert or command |
| POST `/vendor/operations/items` | RLS insert or command |
| PATCH `/vendor/operations/items/:id` | RLS update or command |
| PATCH `/vendor/operations/orders/:id/status` | `update-order-status` |
| PATCH `/vendor/operations/reservations/:id/status` | `update-reservation-status` |
| POST `/vendor/operations/reservations/:id/cancel` | `cancel-reservation` |

The legacy `vendorId` query/body boundary must not survive into production.

## 4.11 OpenAPI and generated clients

OpenAPI may remain useful for external integration contracts. For internal FlutterFlow/Supabase access, the schema itself plus typed DTO/custom actions is sufficient.

Where OpenAPI is retained:

- generate stable DTOs.
- version breaking changes.
- test Edge Functions against contract fixtures.
