# 02 — Advanced System Architecture

## 2.1 Architecture

```text
                         ┌───────────────────────┐
                         │   Supabase Auth       │
                         │ JWT / session / MFA   │
                         └───────────┬───────────┘
                                     │
┌──────────────────┐                 ▼
│ Customer Flutter │      ┌───────────────────────┐
│ / FlutterFlow    │─────▶│ Postgres + RLS        │
└──────────────────┘     │ authoritative state   │
                         └───────┬───────┬───────┘
┌──────────────────┐             │       │
│ Vendor Flutter   │─────────────┘       ├── Storage
│ / FlutterFlow    │                     ├── Realtime
└──────────────────┘                     └── SQL functions
                                              │
┌──────────────────┐                          ▼
│ Admin Flutter Web│──────────────────▶ Edge Functions
└──────────────────┘                     │      │
                                         │      ├── Razorpay
                                         │      ├── FCM
                                         │      └── provider APIs
                                         ▼
                                  transactional commands
```

## 2.2 Architectural layers

### Experience layer

FlutterFlow pages/components plus exported Flutter code where visual configuration is insufficient.

Responsibilities:

- composition.
- navigation.
- presentation.
- client validation.
- cache/loading states.
- realtime subscription lifecycle.
- accessibility.

### Application layer

Supabase Edge Functions and database functions.

Responsibilities:

- authenticated commands.
- ownership verification.
- transaction boundaries.
- integration credentials.
- idempotency.
- state transitions.
- external webhooks.

### Domain layer

Pure business invariants:

- status transitions.
- price calculation.
- reservation eligibility.
- slot capacity.
- pass entitlement.
- cancellation windows.
- settlement calculations.

### Persistence layer

Postgres:

- tables.
- constraints.
- indexes.
- RLS.
- audit tables.
- triggers.
- transaction-safe updates.

## 2.3 Command/query split

### Queries

Simple, read-only, RLS-protected reads may come directly from FlutterFlow/Supabase:

- approved vendor directory.
- vendor menu.
- customer order history.
- vendor order queue.
- notification inbox.
- profile.
- read-only settlement summaries.

### Commands

Use Edge Functions or transaction-backed RPC for operations such as:

- create order.
- initiate payment.
- payment reconciliation.
- change order status.
- reserve seat/slot.
- cancel reservation.
- consume pass entitlement.
- approve vendor.
- add/remove staff.
- issue payout adjustment.

## 2.4 Multi-tenant boundaries

Tenant hierarchy:

```text
platform
 ├── campuses
 │    └── facilities / food courts
 │         └── vendors
 │              ├── branches
 │              ├── staff
 │              ├── menus
 │              ├── slots
 │              ├── tables
 │              ├── orders
 │              └── settlements
 └── customers
```

A vendor staff member is authorized through membership and permissions, not by trusting a vendor ID sent from the client.

## 2.5 Trust boundaries

1. Client → Supabase API: untrusted input.
2. Client → Edge Function: authenticated but untrusted command.
3. Payment provider → webhook: unauthenticated transport, trusted only after signature verification.
4. Edge Function → Postgres service role: trusted server path.
5. Supabase Storage upload: trusted only through policy.
6. Admin UI: privileged client, still untrusted; server rechecks role.

## 2.6 Failure model

The system is designed around partial failure.

Example:

```text
Order database transaction succeeds
       │
       ├── Realtime succeeds/fails → refresh is fallback
       └── Push succeeds/fails → inbox remains authoritative
```

Never make the order transaction depend on successful push delivery.

## 2.7 Concurrency model

All capacity and payment-sensitive mutations must be transactionally protected.

Use:

- row-level locks for a slot/table capacity row.
- unique constraints for duplicate entitlement/booking conditions.
- idempotency keys.
- immutable event/history rows.
- compare-and-update when appropriate.
- serializable transaction only where necessary.

## 2.8 Advanced architecture decisions

- Separate apps remain separate deployable surfaces.
- FlutterFlow is the experience builder, not the authorization layer.
- Supabase Postgres is the canonical state store.
- Edge Functions own third-party secrets.
- RLS protects all browser-exposed tables.
- Service-role access is server-only.
- Realtime accelerates freshness but is not authoritative.
- The old Express API is migration-compatible but not normative.
