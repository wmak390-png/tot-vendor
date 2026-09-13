# 09 — FlutterFlow Production Build Specification

## 9.1 Project strategy

Maintain three separate FlutterFlow projects:

```text
TT Customer
TT Vendor
TT Admin
```

They share:

- Supabase project/environment.
- design tokens.
- database naming.
- API/function contracts.
- event nomenclature.

They do not share unsafe role-switched navigation by default.

## 9.2 Global theme

Create shared design tokens:

```text
Brand colors
Surface colors
Text hierarchy
Success / warning / danger
Spacing scale
Corner radius
Elevation
Typography
Icon sizing
```

Build a reusable component library in each project.

## 9.3 Page naming

Use:

```text
CustomerDiscoverPage
CustomerVendorDetailPage
CustomerCheckoutPage
CustomerOrderTrackingPage

VendorStorePage
VendorOrdersPage
VendorMenuPage
VendorKdsPage
VendorStaffPage
VendorSettlementsPage

AdminDashboardPage
AdminVendorApprovalPage
AdminSettlementAuditPage
AdminPlatformSettingsPage
```

## 9.4 Backend query rules

Direct FlutterFlow Supabase queries are allowed for:

- RLS-protected lists.
- detail pages.
- user preference reads.
- simple profile edits.
- notification read state.

Use Custom Actions/API calls for:

- payment commands.
- order creation.
- state transitions.
- capacity mutations.
- approval.
- settlement actions.
- privileged staff changes.

## 9.5 Authentication routing

```text
startup
 → supabase session?
   ├── no → auth
   └── yes
        → load users row
        → resolve role
        → load required profile state
        → route
```

Add route guards for:

- authenticated.
- vendor approved/under-review.
- admin.
- required vendor membership.

## 9.6 State management

Use:

- local page state for ephemeral UI state.
- app state for small cross-page client state.
- query/cache state for remote data.
- Postgres as authority.

Do not mirror every database field indefinitely in App State.

## 9.7 Realtime implementation

For key pages:

```text
Page enters
 → subscribe
 → initial query
 → render
 → realtime event
 → invalidate/refetch affected query
Page leaves
 → unsubscribe
```

Prefer invalidation/refetch over manually reconstructing complicated joins in local state.

## 9.8 Forms

Every form defines:

- field validation.
- submit disabled state.
- server error mapping.
- duplicate/conflict handling.
- success behavior.
- draft/cancel behavior.

## 9.9 Critical components

### Vendor order card

Must display:

- order identifier.
- customer.
- item summary.
- promised pickup.
- status.
- elapsed time.
- action availability based on current server status.

### KDS ticket

Must display:

- queue age.
- station.
- items.
- modifiers.
- pickup time.
- escalation marker.
- single next-action control.

### Settlement card

Must display:

- period.
- gross.
- deductions.
- net.
- status.
- reconciliation issue if present.

## 9.10 Environment values

Each project gets environment-specific:

- Supabase URL.
- anon/public key.
- Edge Function base path.
- analytics identifiers.
- FCM configuration.
- provider public identifiers.

Never put service role keys or provider secrets in FlutterFlow environment values.

## 9.11 Export and source control

Use code export for:

- custom Dart actions.
- complex custom widgets.
- deep-link integrations.
- payment UI integrations where native setup is necessary.

Keep exported code in a controlled repository and document which pieces remain managed in FlutterFlow.
