# TakeOnTime — Full Advanced Architecture Documentation

**Status:** Reconstructed production-target documentation  
**Audience:** Product, Flutter/FlutterFlow, Supabase, backend, QA, DevOps, security, and operations teams  
**Scope:** Vendor app, Customer app, Admin web, KDS/staff operations, reservations, meal passes, settlements, branches/tables, notifications, and platform governance

## What this package is

This documentation is a reconstruction of the supplied `docs (1).zip`, reconciled against:

- `tot-vendor (3).zip` implementation/reference code
- `docs.zip` predecessor documentation
- the current Expo/Express vendor implementation
- the mockup sandbox's customer/vendor/admin flows
- Drizzle database schema and seed behavior
- OpenAPI definitions and generated API clients

This is **not an MVP rewrite**. The canonical target describes the full advanced product that the reference UI already implies, while preserving clear separation between prototype/demo implementation and production architecture.

## Canonical architecture

```text
FlutterFlow / Flutter
├── Customer App
├── Vendor App
└── Admin Web
        │
        ▼
Supabase
├── Auth
├── Postgres + RLS
├── Storage
├── Realtime
└── Edge Functions
        │
        ├── Razorpay
        ├── FCM
        ├── Maps / routing provider (optional)
        └── Banking / settlement provider (when connected)
```

The existing Express/Drizzle service is treated as a **migration/reference adapter**, not the production source of truth.

## Document map

| Document | Purpose |
|---|---|
| 00-reconciliation | What was found, what conflicts, and the migration decisions |
| 01-product-and-scope | Full product scope and capability matrix |
| 02-advanced-architecture | Logical/physical architecture and trust boundaries |
| 03-ui-ux-and-screen-map | Reconstructed screen system from actual mockups |
| 04-backend-and-api | Supabase Edge Function and direct-query contracts |
| 05-data-model | Canonical Supabase schema and relationships |
| 06-security-rls | Authorization, RLS, storage, secrets, audit |
| 07-domain-workflows | State machines and transactional workflows |
| 08-events-notifications | Realtime, FCM, jobs, idempotency |
| 09-flutterflow-build | FlutterFlow project structure and bindings |
| 10-custom-flutter | Where exported Flutter/Dart is required |
| 11-migration-plan | Express/Drizzle → Supabase migration and compatibility |
| 12-testing-quality | Testing, security, load, UAT |
| 13-runtime-operations | Environments, release, monitoring, recovery |
| 14-source-of-truth | Governance and change control |
| 15-implementation-backlog | Production implementation sequence |

## Reading rule

The current reference repository contains working prototype behavior but also demo shortcuts, seeded identities, local persistence, and incomplete production security. Never copy those shortcuts into the production Supabase design.
