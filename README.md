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

All three apps use the same Supabase project. Pass the public project URL and publishable key at build or run time; never add credentials to source control. See [.env.example](.env.example) for the expected names:

```bash
flutter run \\
	--dart-define=SUPABASE_URL=https://your-project.supabase.co \\
	--dart-define=SUPABASE_PUBLISHABLE_KEY=your-public-publishable-key
```

The apps skip Supabase initialization when these values are absent, which keeps widget tests and offline UI work available. Client repositories use RLS-protected tables and do not contain service-role credentials.

## Release builds

Apply the database migrations and deploy the Edge Functions before publishing a client build:

```bash
supabase link --project-ref vajuafnlynkweohofvkm
supabase db push
supabase functions deploy create-order
supabase functions deploy update-order-status
supabase functions deploy approve-vendor
# Set this in Supabase, never in Flutter or source control.
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Build each app with the same public Supabase values and an explicit release version:

```bash
flutter build apk --release \\
	--build-name=1.0.0 --build-number=1 \\
	--dart-define=SUPABASE_URL=https://your-project.supabase.co \\
	--dart-define=SUPABASE_PUBLISHABLE_KEY=your-public-publishable-key

flutter build web --release \\
	--build-name=1.0.0 --build-number=1 \\
	--dart-define=SUPABASE_URL=https://your-project.supabase.co \\
	--dart-define=SUPABASE_PUBLISHABLE_KEY=your-public-publishable-key
```

Run the Android command from `apps/takeontime_vendor_app` or `apps/takeontime_customer_app`. Run the web command from `apps/takeontime_admin_app`. Configure the Supabase Auth site URL and redirect allow-list for the deployed admin web origin before enabling email confirmation.

The public publishable/anon key is safe for client distribution because table access is enforced by RLS. Never pass `SUPABASE_SERVICE_ROLE_KEY` to Flutter or commit it to this repository; it belongs only in Supabase Edge Function secrets.

## Notes

The apps are intentionally split into separate Flutter projects, matching the product requirement for independent vendor, customer, and admin surfaces that share a common backend layer.
