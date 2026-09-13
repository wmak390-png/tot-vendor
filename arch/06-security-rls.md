# 06 — Security, RLS, and Authorization

## 6.1 Security objectives

- zero client-trusted authorization.
- tenant isolation.
- least privilege.
- service keys never exposed to apps.
- payment webhooks cryptographically verified.
- KYC documents private.
- auditability of privileged actions.

## 6.2 RLS matrix

| Resource | Customer | Vendor owner/staff | Admin |
|---|---|---|---|
| own profile | RW own safe fields | RW own safe fields | R |
| approved vendor directory | R | R | RW |
| own vendor | — | R/W by permission | RW |
| vendor menu | R approved/public | RW by menu permission | RW |
| own orders | R | R for assigned vendor | R/W controlled |
| payments | R related order | R related vendor | RW/reconcile |
| reservations | RW own | RW related vendor by permission | RW |
| staff | — | owner/manager only | RW |
| KYC docs | own submission status only | own vendor docs | full controlled read |
| settlements | own vendor | finance permission | full |
| platform settings | — | — | RW |

## 6.3 Helper functions

Examples:

```sql
public.is_admin()
public.is_vendor_member(vendor_id uuid)
public.has_vendor_permission(vendor_id uuid, permission text)
public.is_order_customer(order_id uuid)
```

Avoid recursive RLS helper queries. Where necessary, use `security definer` functions that are narrowly scoped, immutable/volatile as appropriate, and protected from arbitrary invocation.

## 6.4 Role hierarchy

Platform:

```text
super_admin
regional_admin
operations_admin
finance_admin
support_admin
```

Vendor:

```text
owner
manager
kitchen
kds_operator
dispatcher
waiter
finance
```

Roles are persisted but permission evaluation is centralized.

## 6.5 Sensitive fields

Do not expose:

- full bank account number.
- payment secrets.
- provider API keys.
- raw auth tokens.
- KYC documents to unrelated clients.
- internal fraud/risk notes.

## 6.6 Storage security

Public bucket:

- approved menu media.
- logos.

Private bucket:

- KYC/legal documents.
- settlement documents.
- internal evidence.

Private object access should use signed URLs generated only for authorized actors.

## 6.7 Edge Function authentication

- extract bearer token.
- validate Supabase user/session.
- resolve application user.
- resolve vendor membership when needed.
- enforce command-specific permissions.
- reject role spoofing.

## 6.8 Webhook security

Webhook request processing:

```text
receive raw body
  → verify signature
  → identify provider event
  → validate event type
  → deduplicate event
  → validate referenced order/payment
  → transactionally reconcile
```

## 6.9 Audit policy

Audit:

- vendor approval decisions.
- vendor suspension/reactivation.
- staff role changes.
- payout account changes.
- settlement adjustments.
- refunds.
- order cancellation by staff/admin.
- reservation overrides.
- platform setting changes.

The audit log is append-only to application actors.

## 6.10 Client security rule

FlutterFlow custom actions may help with UX, but they must never be the final authorization mechanism.

