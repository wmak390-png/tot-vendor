# 16 — Reference Implementation Inventory

## 16.1 Source packages found

### Expo vendor

- `artifacts/takeontime-vendor`
- Expo Router.
- React Native.
- React Query.
- AsyncStorage.
- generated API client.
- seeded/demo state.

### Express API

- `artifacts/api-server`
- `src/routes/vendor.ts`
- health route.
- vendor operation routes.

### Mockup sandbox

- `artifacts/mockup-sandbox`
- React/Vite.
- customer-flow.
- vendor-flow.
- admin-flow.
- UI component library.

### Data/contracts

- `lib/db/src/schema/vendor.ts`
- `lib/api-spec/openapi.yaml`
- generated API schemas/clients.
- attached API/data design documents.

## 16.2 Vendor operation endpoint evidence

Current reference exposes:

```text
GET    /vendor/operations
PATCH  /vendor/operations/store
POST   /vendor/operations/plans
PATCH  /vendor/operations/plans/{planId}
PATCH  /vendor/operations/slots/{slotId}
POST   /vendor/operations/categories
POST   /vendor/operations/items
PATCH  /vendor/operations/items/{itemId}
PATCH  /vendor/operations/orders/{orderId}/status
PATCH  /vendor/operations/reservations/{reservationId}/status
POST   /vendor/operations/reservations/{reservationId}/cancel
```

## 16.3 Reference validation worth preserving

The reference server already demonstrates:

- vendor-scoped reads/writes.
- invalid payload checks.
- illegal order transition rejection.
- reservation state transition validation.
- no-show grace-period rule.
- cancellation window rule.
- transactional reservation cancellation with slot decrement.
- notification creation as a side effect.

These should be carried forward into the Supabase domain implementation.

## 16.4 Prototype-only behaviors not to promote

- fixed/demo vendor identity.
- `vendorId` from query/body as authority.
- default-true approval in demo seed.
- text IDs as canonical IDs.
- local AsyncStorage as durable domain state.
- UI simulation buttons.
- mock settlement/account values.
- frontend-only role simulation.
