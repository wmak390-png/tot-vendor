# 03 — UI/UX and Screen Map Reconstructed from Reference UI

## 3.1 Design principles

- Operational clarity over decorative density.
- Strong status hierarchy.
- Every mutation provides pending/success/error feedback.
- Loading, empty, error, and conflict states are explicit.
- Mobile-first vendor/customer experience.
- Desktop-first admin experience.
- KDS has glanceable, low-interaction presentation.
- Financial and compliance surfaces expose source/status, not only labels.

## 3.2 Customer route map

```text
Auth
 ├── Sign in
 └── Registration

Discover
 ├── Vendor list
 ├── Search/filter
 └── Vendor details
      └── Menu
           ├── Item/customization
           ├── Cart
           ├── Seat reservation
           └── Meal pass reservation

Checkout
 ├── Pickup slot
 ├── Order summary
 └── Razorpay checkout

Orders
 ├── History
 ├── Detail
 ├── Live tracking
 └── Pickup directions / OTP

Reservations
 ├── Meal reservation
 ├── Seat/table reservation
 └── Reservation detail/cancellation

Passes
 ├── My passes
 ├── Plan catalog
 ├── Purchase
 └── Usage calendar

Profile
 ├── Personal/campus details
 ├── preferences
 ├── notifications
 ├── saved payment methods
 └── pickup delegates
```

## 3.3 Vendor route map

```text
Onboarding
 ├── Sign in
 ├── Register business
 ├── payout/legal
 ├── KYC
 ├── pending approval
 └── correction/appeal

Dashboard
 ├── Store
 ├── Orders
 ├── Menu
 ├── Stats
 └── More

Store
 ├── open/closed
 ├── break
 ├── schedule
 ├── shortcuts
 └── notifications

Orders
 ├── queue
 ├── order detail
 ├── accept/reject
 ├── KOT
 ├── ready
 └── handover OTP

KDS
 ├── station filter
 ├── start cooking
 ├── ready
 └── customer verification

Menu
 ├── categories
 ├── item list
 ├── add/edit item
 └── availability

Reservations
 ├── slot capacity
 ├── reservation queue
 ├── cancellation
 └── no-show/collection

Tables/branches
 ├── floorplan
 ├── tables
 ├── reservations
 └── facility/branch management

Meal plans
 ├── plan catalog
 ├── active plans
 └── subscribers

People
 ├── staff roster
 ├── roles
 ├── station access
 └── shift status

Finance
 ├── settlement batches
 ├── ledger
 ├── payout account
 └── statements

Compliance
 ├── profile
 ├── documents
 ├── verification status
 └── support/appeal
```

## 3.4 Admin route map

```text
Dashboard
 ├── realtime order stream
 ├── vendor summary
 └── settlement summary

Vendor operations
 ├── approvals
 ├── KYC
 ├── vendor directory
 └── suspension/reactivation

Campus
 ├── campus directory
 ├── food courts
 └── peak scheduling

Finance
 ├── settlement batches
 ├── vendor ledger
 └── audit

Platform settings
 ├── maintenance mode
 ├── commissions
 ├── tax
 ├── taxonomy
 └── helpdesk contacts

People
 └── admin/operator delegation
```

## 3.5 State patterns

Every page must define:

### Loading

- skeleton for list pages.
- disabled mutation controls during mutation.
- preserved last-known state for operational queues where safe.

### Empty

Explain why it is empty and what action creates data.

### Error

Show safe message + retry. Never show database stack trace.

### Conflict

For state transitions, explain the current authoritative state and offer refresh.

### Offline/reconnect

- show network state.
- avoid promising an optimistic mutation unless the domain supports reconciliation.
- refresh authoritative data after reconnect.

## 3.6 FlutterFlow component library

Recommended components:

- `AppScaffold`.
- `StatusPill`.
- `PrimaryActionButton`.
- `SecondaryActionButton`.
- `ErrorState`.
- `EmptyState`.
- `LoadingSkeleton`.
- `VendorCard`.
- `MenuItemCard`.
- `OrderStatusTimeline`.
- `OrderRow`.
- `KdsTicket`.
- `CapacityMeter`.
- `ReservationCard`.
- `StaffRoleChip`.
- `SettlementSummaryCard`.
- `ComplianceDocumentRow`.
- `ConfirmationSheet`.
- `ConflictDialog`.

## 3.7 UI-to-data rule

A widget may display a domain status but must never invent it.

Example:

```text
Vendor:
  effective_status = derived from persisted fields

Order:
  status = persisted authoritative state

Payment:
  payment_status = provider-reconciled state

Reservation:
  availability = transactionally calculated capacity
```
