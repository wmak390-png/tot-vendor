# 18 — API ↔ Screen ↔ Data Contract Matrix

## 18.1 Customer

| Screen | Read | Command | Realtime |
|---|---|---|---|
| Discover | vendors/facilities/menu summary | filters are local | optional vendor status |
| Vendor Menu | categories/items/vendor | cart local | item/store availability optional |
| Checkout | cart/menu/pickup slots | `create-order`, payment | payment/order state |
| Orders | own orders | reorder/cancel where allowed | order updates |
| Tracking | order + history | pickup verification result is vendor-side | order |
| Meal Passes | plans/passes/entitlements | purchase/reserve/consume | pass/reservation |
| Seat Reservation | tables/slots | `reserve-table`, cancel | reservation |
| Notifications | own notifications | mark read | notification insert |

## 18.2 Vendor

| Screen | Read | Command | Realtime |
|---|---|---|---|
| Store | vendor + hours | update store/break | vendor status |
| Menu | categories/items | CRUD/publish | optional menu update |
| Orders | vendor orders/history | `update-order-status` | order insert/update |
| KDS | station tickets | start/ready/reassign | ticket events |
| Reservations | vendor reservations/slots | status/cancel/no-show | reservation updates |
| Tables | branches/tables/reservations | table/branch commands | reservation/table state |
| Meal Plans | plans/subscribers | create/update plan | purchase/subscriber |
| Staff | members/roles | invite/change/suspend | staff events |
| Settlements | batches/ledger | reconcile/acknowledge | settlement status |
| Notifications | vendor inbox | mark read | notification insert |
| Verification | vendor/docs/status | upload/submit/appeal | verification events |

## 18.3 Admin

| Screen | Read | Command |
|---|---|---|
| Dashboard | platform summaries, order stream | operational actions |
| Vendor Approval | pending vendors/docs | approve/reject/suspend |
| Campus | campuses/facilities | create/update |
| Settlement Audit | batches/ledger/exceptions | reconcile/adjust with permissions |
| Platform Settings | settings | update config |
| Taxonomy | categories | controlled changes |
| Operator management | admin/operator roles | invite/change/revoke |

## 18.4 Contract rule

A screen should identify:

- source query/function.
- exact RLS actor.
- fields displayed.
- mutation function.
- optimistic vs authoritative behavior.
- realtime source.
- fallback refresh.
- error codes.

## 18.5 Example: Vendor Orders

```text
Page:
  VendorOrdersPage

Initial query:
  orders where vendor_id = currentVendor

Subscription:
  orders vendor_id = currentVendor

Mutation:
  update-order-status

On 409:
  invalidate order query
  show "Order changed elsewhere"

On success:
  invalidate order query
  allow realtime to update KDS/customer

On reconnect:
  refetch current queue
```
