# TakeOnTime Flutter Workspace

This workspace contains three independent Flutter apps for the TakeOnTime platform:

- Vendor app: mobile app for restaurant/kitchen operators
- Customer app: mobile app for browsing vendors and placing orders
- Admin app: web dashboard for approval and operations

## Structure

- `apps/takeontime_vendor_app` — Vendor mobile app
- `apps/takeontime_customer_app` — Customer mobile app
- `apps/takeontime_admin_app` — Admin web app

## Run the apps

```bash
cd /workspaces/tot-vendor/apps/takeontime_vendor_app && flutter run
cd /workspaces/tot-vendor/apps/takeontime_customer_app && flutter run
cd /workspaces/tot-vendor/apps/takeontime_admin_app && flutter run
```

## Validate

```bash
cd /workspaces/tot-vendor
/workspaces/flutter_sdk/bin/flutter test apps/takeontime_vendor_app
/workspaces/flutter_sdk/bin/flutter test apps/takeontime_customer_app
/workspaces/flutter_sdk/bin/flutter test apps/takeontime_admin_app
```

## Supabase configuration

All three apps use the same Supabase project. Pass the public project URL and anon key at run time; never add them to source control:

```bash
flutter run \\
	--dart-define=SUPABASE_URL=https://your-project.supabase.co \\
	--dart-define=SUPABASE_ANON_KEY=your-public-anon-key
```

The apps skip Supabase initialization when these values are absent, which keeps widget tests and offline UI work available. Client repositories use RLS-protected tables and do not contain service-role credentials.

## Notes

The apps are intentionally split into separate Flutter projects, matching the product requirement for independent vendor, customer, and admin surfaces that share a common backend layer.
