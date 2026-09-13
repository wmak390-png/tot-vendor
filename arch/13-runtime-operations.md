# 13 — Runtime, Environments, and Operations

## 13.1 Environments

```text
local
dev
staging
production
```

Each environment has isolated:

- Supabase project/database.
- Storage buckets.
- Auth configuration.
- Edge Function secrets.
- provider credentials.
- analytics identifiers.

## 13.2 Branching

Suggested:

```text
main
develop
feature/*
release/*
hotfix/*
```

Database migrations are versioned with application releases.

## 13.3 Supabase release pipeline

```text
migration
 → static review
 → local DB tests
 → staging migration
 → RLS/security tests
 → Edge Function deploy
 → FlutterFlow staging
 → E2E
 → production migration
 → production function deploy
 → app release
```

For destructive schema changes use expand/contract:

```text
add new field
 → dual-write/backfill
 → migrate readers
 → verify
 → remove old field later
```

## 13.4 Secrets

Keep in server-side secret management:

- Supabase service role.
- Razorpay secret.
- webhook secret.
- FCM server credential.
- maps private key.
- banking provider secret.

## 13.5 Observability

Track:

### Business

- order success rate.
- payment capture rate.
- reservation success rate.
- no-show rate.
- vendor acceptance time.
- pickup time.

### Technical

- Edge Function error rate.
- DB latency.
- lock waits.
- webhook delay.
- outbox lag.
- push delivery error.
- realtime reconnect rate.

## 13.6 Alerts

Critical:

- payment webhook failures.
- function error spikes.
- DB unavailable.
- replication/backups issue.
- abnormal reservation capacity errors.
- settlement mismatch.
- KYC provider failure.

## 13.7 Incident workflow

```text
detect
 → classify
 → contain
 → diagnose
 → correct
 → reconcile business state
 → communicate
 → postmortem
```

Business reconciliation is mandatory for payment/order incidents.

## 13.8 Backup/recovery

- scheduled database backups.
- point-in-time recovery where plan supports.
- Storage retention policy.
- tested restore process.
- backup verification.

## 13.9 Operational runbooks

Maintain runbooks for:

- duplicate payment.
- stale order.
- stuck reservation.
- missing notification.
- incorrect settlement.
- vendor accidentally closed.
- KYC document issue.
- staff permission incident.
- database migration rollback.

## 13.10 Production readiness gate

No launch until:

- RLS matrix green.
- payment webhook replay test green.
- backups tested.
- audit coverage confirmed.
- error monitoring live.
- incident owner assigned.
