# 11 — Express/Drizzle → Supabase Migration

## 11.1 Migration principle

Migrate **domain behavior first, storage second, UI third**, so production clients do not inherit prototype shortcuts.

## 11.2 Legacy-to-canonical mapping

| Legacy | Canonical |
|---|---|
| `vendors` | `vendors` |
| `vendor_categories` | `menu_categories` |
| `vendor_items` | `menu_items` |
| `vendor_orders` | `orders` + `order_items` |
| `vendor_pass_plans` | `meal_pass_plans` |
| `vendor_meal_slots` | `meal_slots` |
| `vendor_reservations` | `reservations` |
| `vendor_notifications` | `notifications` |
| `vendor_bank_details` | `vendor_payout_accounts` |

## 11.3 ID migration

Legacy text IDs must not be reused as production primary keys.

Create a mapping table during import:

```text
legacy_entity
legacy_id
canonical_id
migrated_at
```

Preserve legacy identifiers in a non-authoritative reference column only when needed for support/debugging.

## 11.4 Data enrichment

### Legacy vendor order

The prototype stores flattened fields such as customer name and item text.

Production should reconstruct:

```text
orders.customer_id
orders.vendor_id
order_items.menu_item_id
order_items.item_name_snapshot
order_items.unit_price_paise
```

## 11.5 Seed/demo data

Demo seed data must be separated from:

- production fixtures.
- test fixtures.
- staging demo tenant.

Create a dedicated staging tenant/campus and synthetic accounts.

## 11.6 Compatibility adapter

During migration, an adapter can expose the legacy API shape:

```text
FlutterFlow
  → compatibility Edge Function
       → canonical Supabase tables
```

This allows gradual page migration without maintaining Express indefinitely.

## 11.7 Express shutdown criteria

Remove the Express API only after:

- all required commands exist in Edge Functions/RPC.
- OpenAPI contract tests pass against production target.
- RLS tests pass.
- realtime paths are stable.
- payment webhook is production-ready.
- vendor app no longer depends on demo vendor ID.
- no screen reads `vendor_*` legacy entities directly.

## 11.8 Local persistence migration

The Expo app's AsyncStorage state should become:

```text
remote query cache
+ secure auth/session state
+ explicitly local UI preferences
```

Never use local storage as authority for:

- order status.
- payment status.
- inventory/menu availability.
- reservation count.
- staff role.
- settlement amount.

## 11.9 Mockup reconciliation

The web mockup remains a UX reference. Its stateful interactions are converted into real commands:

```text
mockup action
 → FlutterFlow action
 → Edge Function/RLS query
 → Postgres transaction
 → Realtime/in-app event
 → UI refresh
```
