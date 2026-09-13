# 00 — Reference Reconciliation and Reconstruction Notes

## 0.1 Inputs inspected

### `docs (1).zip`

Contains a 10-document target architecture, including product scope, architecture, UI/UX, backend/API, data model, domain logic, operations, testing, governance, and a FlutterFlow/Supabase guide.

### `docs.zip`

Contains the earlier/current-state documentation. It is valuable for identifying the gap between what was actually implemented and the desired product architecture.

### `tot-vendor (3).zip`

Contains:

- Expo 57 / React Native vendor app scaffold.
- Express API server.
- Drizzle/Postgres vendor schema.
- OpenAPI specification.
- generated TypeScript API models/client.
- large React mockup sandbox.
- customer, vendor, and admin flows.
- seeded/demo data behavior.
- attached API/data design references.

## 0.2 What is actually implemented in the reference repository

### Vendor reference implementation

The Expo app currently uses:

- Expo Router.
- React Native.
- React Query.
- AsyncStorage.
- generated API client.
- an explicit demo vendor identifier.
- local state hydration followed by server hydration.

The app demonstrates real interaction patterns but is not yet a production identity/security boundary.

### Express API

The API exposes vendor operations for:

- operations snapshot.
- store open/closed/break state.
- pass plans.
- meal slots.
- categories.
- menu items.
- vendor order status.
- reservation status.
- reservation cancellation.

The server performs meaningful transition validation and some transactional side effects. This behavior should be preserved when moving into Supabase Edge Functions/Postgres transactions.

### Drizzle model

The current schema uses text IDs and vendor-specific tables such as:

- `vendors`
- `vendor_categories`
- `vendor_items`
- `vendor_orders`
- `vendor_pass_plans`
- `vendor_meal_slots`
- `vendor_reservations`
- `vendor_notifications`
- `vendor_bank_details`

This is a useful implementation snapshot, but it is not the final multi-surface schema.

## 0.3 UI surface found in the repository

### Customer

- authentication
- discovery
- vendor menu
- checkout
- orders
- live order tracking
- pickup directions
- notifications
- profile
- meal passes
- meal reservation
- seat/table reservation
- feedback and issue resolution

### Vendor

- onboarding/auth
- pending approval
- verification/compliance
- dashboard
- store controls
- menu/category management
- order queue
- order detail/KOT
- KDS
- reservations
- tables/seating
- branches/facilities
- meal plans
- settlements
- staff/RBAC
- notifications
- profile/compliance/support

### Admin

- operations console
- vendor approvals/KYC
- campus and food court management
- platform settings
- category taxonomy
- settlement audit
- operational sub-staff/delegates
- realtime order monitoring

## 0.4 Critical mismatches to resolve

| Topic | Reference implementation | Production target |
|---|---|---|
| Identity | Demo vendor ID / mock identity | Supabase Auth + JWT |
| IDs | Text IDs | UUID PKs |
| Authorization | Demo vendor assertions | RLS + server-side command authorization |
| Orders | Vendor-only view model | Customer/vendor/admin domain model |
| Payments | UI placeholder + contract | Razorpay order + verified webhook + reconciliation |
| Notifications | Local/demo rows | durable notification rows + device tokens + FCM |
| KYC | mock UI | private Storage + verification workflow |
| Settlement | mock/visual data | ledger + provider reconciliation |
| Branches/tables | mock behavior | relational entities + constraints |
| Staff | UI role simulation | persisted staff memberships + permissions |
| Realtime | not a production channel | Supabase Realtime + authoritative refresh |
| Local state | AsyncStorage | cache only; Postgres authoritative |
| Server | Express | Supabase Edge Functions and Postgres |

## 0.5 Reconstruction decision

The production system keeps the **UX intent and domain rules** from the reference implementation while replacing:

```text
demo identity
demo vendor boundary
local seeded data
direct Express CRUD
text IDs
client-trusted role/ownership
```

with:

```text
Supabase Auth
RLS
Edge Functions
transactional Postgres functions
UUID relationships
audited domain state
provider reconciliation
```

## 0.6 Design principle

The mockups are treated as a **behavioral contract**, not as a database model.

The database and server domain rules remain authoritative where the mockup uses optimistic/demo behavior.
