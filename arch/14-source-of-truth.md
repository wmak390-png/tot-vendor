# 14 — Source of Truth and Governance

## 14.1 Authority order

1. approved product decision record.
2. Supabase migration/schema.
3. RLS policies and Edge Functions.
4. domain/state-machine tests.
5. API/event contracts.
6. FlutterFlow implementation.
7. mockups and visual references.

Security and data integrity rules override UI convenience.

## 14.2 Reference artifact roles

### `tot-vendor (3).zip`

Implementation/reference source.

### `docs.zip`

Prior/current-state explanation.

### `docs (1).zip`

Target architecture baseline being reconstructed.

### This package

Reconciled production-target specification.

## 14.3 Change record

Every meaningful change records:

- decision.
- scope.
- affected entities.
- authorization impact.
- API impact.
- UI impact.
- event impact.
- tests.
- migration.
- rollback.

## 14.4 Naming

### Database

```text
snake_case
plural table names
uuid PKs
*_paise
*_at
is_*
```

### Functions

```text
verb-noun
create-order
approve-vendor
update-order-status
```

### FlutterFlow

```text
PascalCasePage
PascalCaseComponent
verb-based Action names
```

## 14.5 Definition of done

A feature is complete only when:

- UX exists.
- loading/empty/error/conflict states exist.
- data model exists.
- RLS exists.
- privileged command is server-enforced.
- audit/event behavior is defined.
- notifications are defined if needed.
- automated tests exist.
- migration exists.
- operational metrics exist.

## 14.6 Architecture decision records

At minimum document:

- separate apps.
- Supabase as canonical platform.
- RLS strategy.
- Edge Function boundary.
- payment webhook authority.
- single-vendor cart.
- capacity locking.
- event/outbox pattern.
- settlement ledger model.
- KDS/staff model.
- migration from Express.
