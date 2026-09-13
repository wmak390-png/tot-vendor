# 05 — Canonical Supabase Postgres Data Model

## 5.1 Conventions

- UUID primary keys.
- snake_case.
- plural table names.
- `timestamptz`.
- integer minor-unit money (`*_paise`).
- `created_at` / `updated_at`.
- immutable history/event tables where auditability matters.
- explicit foreign keys.
- RLS on every API-exposed table.

## 5.2 Identity

### `users`

```text
id uuid PK = auth.users.id
full_name text
email text
phone text
role text
status text
created_at
updated_at
```

### `device_tokens`

```text
id uuid PK
user_id FK
platform
token
app_surface
last_seen_at
is_active
created_at
updated_at
```

Unique active token constraint should prevent duplicate device registrations.

### `user_notification_preferences`

Channels and event types are explicit and configurable.

## 5.3 Organization

### `campuses`

- id
- name
- timezone
- address
- active

### `facilities`

- id
- campus_id
- name
- type
- active

### `vendors`

- id
- owner_id
- facility_id
- business_name
- business_type
- merchant_id
- approval_status
- approval_note
- accepting_orders
- break_until
- effective feature flags
- contact/profile fields
- created_at
- updated_at

### `vendor_branches`

For multi-location vendors.

### `vendor_staff`

```text
id
vendor_id
user_id
status
display_name
employee_code
created_at
updated_at
```

### `vendor_staff_roles`

Role membership with permissions.

Suggested roles:

- owner
- manager
- kitchen
- kds_operator
- dispatcher
- waiter
- finance
- support

### `vendor_documents`

Private compliance document metadata.

## 5.4 Menu

### `menu_categories`

- vendor_id
- name
- sort_order
- active

### `menu_items`

- vendor_id
- category_id
- name
- description
- price_paise
- prep_minutes
- image_path
- is_available
- sort_order

The vendor_id is intentionally denormalized for efficient RLS and index use, but a constraint/trigger must prevent category/vendor mismatch.

## 5.5 Operations

### `operating_hours`

Weekly schedule.

### `store_breaks`

Optional historical break records rather than only the current timestamp.

### `meal_pass_plans`

- vendor_id
- name
- cadence
- price_paise
- total_meals
- validity_days
- daily_limit
- meal_description
- active

### `customer_passes`

Purchased entitlement.

### `pass_entitlements`

Immutable/use-oriented ledger of remaining or consumed meals.

### `meal_slots`

- vendor_id
- branch_id
- service_date or weekday rule
- meal
- start_at
- end_at
- capacity
- booked
- open

For date-specific capacity, prefer one row per concrete service slot.

### `tables`

- branch_id
- table_number
- seats
- zone
- status

### `seat_reservations`

- customer_id
- vendor_id
- branch_id
- table_id
- slot_id
- start/end
- party_size
- status

## 5.6 Orders

### `orders`

```text
id uuid PK
customer_id
vendor_id
branch_id
status
subtotal_paise
tax_paise
service_fee_paise
discount_paise
total_paise
currency
payment_status
payment_provider
provider_order_id
provider_payment_id
pickup_slot_id
pickup_otp_hash
notes
created_at
updated_at
```

### `order_items`

Frozen item snapshots:

- menu_item_id
- item_name_snapshot
- unit_price_paise
- quantity
- customization_jsonb

### `order_status_history`

Append-only transition log:

- order_id
- from_status
- to_status
- actor_type
- actor_id
- reason
- metadata
- created_at

## 5.7 Payments

### `payments`

One or more payment attempts per order.

### `payment_events`

Raw/provider event metadata and deduplication key.

### `refunds`

Refund request/result ledger.

Raw payloads should be retained according to privacy/retention policy, with secrets/payment credentials excluded.

## 5.8 Reservations

### `reservations`

Generic meal-slot reservation.

### `reservation_history`

Append-only state events.

### `reservation_attendees`

Optional group/delegate membership.

## 5.9 Notifications

### `notifications`

In-app durable inbox.

### `notification_deliveries`

Tracks channel attempts and outcome.

## 5.10 Staff/KDS

### `kitchen_stations`

- vendor/branch
- name
- station type
- active

### `kds_tickets`

Derived operational ticket state.

### `kds_ticket_items`

Items routed to stations.

## 5.11 Finance

### `settlement_batches`

- vendor
- period
- gross
- commission
- taxes
- adjustments
- net
- status

### `settlement_lines`

Order/payment level ledger rows.

### `vendor_payout_accounts`

Masked account metadata only.

### `payout_events`

Provider reconciliation.

## 5.12 Platform administration

### `platform_settings`

Key/value or typed configuration with version/audit fields.

### `audit_log`

Append-only:

```text
actor_id
actor_role
action
entity_type
entity_id
before_json
after_json
request_id
ip_metadata (only where policy permits)
created_at
```

## 5.13 Critical constraints and indexes

Recommended indexes:

```text
vendors(facility_id, approval_status)
menu_items(vendor_id, is_available, sort_order)
orders(customer_id, created_at desc)
orders(vendor_id, created_at desc)
orders(status, updated_at desc)
order_items(order_id)
payments(provider_payment_id unique)
payment_events(provider_event_id unique)
meal_slots(vendor_id, service_date, open)
reservations(slot_id, status)
vendor_staff(vendor_id, user_id)
notifications(user_id, created_at desc)
settlement_lines(vendor_id, created_at desc)
```

## 5.14 Current-reference mapping

The legacy schema's `vendor_*` tables map into canonical shared entities; do not create permanent duplicated `vendor_orders`, `vendor_items`, etc. merely because the prototype used them.
