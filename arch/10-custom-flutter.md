# 10 — Custom Flutter/Dart and Native Integration

## 10.1 Why custom code still matters

FlutterFlow should remain the dominant UI construction tool, but the full product needs a controlled custom-code layer for operations that are awkward or unsafe to implement as visual actions.

## 10.2 Recommended custom actions

- strongly typed function invocation wrappers.
- idempotency-key generation.
- secure local cache helpers.
- OTP formatting/validation UI.
- advanced order timeline logic.
- payment checkout bridge where required.
- map/floorplan interactions.
- file compression before upload.
- deep-link parsing.
- device token registration.

## 10.3 Recommended custom widgets

### KDS board

Purpose:

- dense landscape layout.
- large touch targets.
- station columns.
- timed tickets.
- auto-refresh.

### Table floorplan

Purpose:

- visual table map.
- status colors.
- selectable table.
- reservation overlay.

### Settlement ledger

Purpose:

- expandable batch → order lines.
- filtering.
- export control.

## 10.4 Native capabilities

Potentially required:

- push notifications.
- biometric/device security.
- deep links.
- background notification handling.
- camera/document capture.
- location and maps.
- haptics/audio for KDS.
- printer integration if later supported.

## 10.5 Security rule

Native/custom code must never embed:

- Supabase service role.
- Razorpay secret.
- FCM server credential.
- bank credentials.

## 10.6 Offline behavior

Vendor/KDS can cache the most recent queue view.

Critical commands remain server-authoritative. Offline queue mutations require explicit reconciliation design and should not silently imply success.

## 10.7 Android/iOS release checklist

- push entitlements.
- notification permission.
- deep-link scheme.
- secure storage.
- background behavior.
- image/file permissions.
- minimum OS support.
- release signing.
- crash reporting.
