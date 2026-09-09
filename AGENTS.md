<!-- # TakeOnTime — AI Development Rules

## 1. Project

TakeOnTime is a multi-app Flutter platform backed by one Supabase project.

Applications:

* `apps/takeontime_vendor_app` — Vendor mobile application
* `apps/takeontime_customer_app` — Customer mobile application
* `apps/takeontime_admin_app` — Admin web application

All three applications use the same Supabase backend.

---

## 2. Backend Source of Truth

Supabase PostgreSQL is the single backend source of truth.

Database structure must be managed through:

* `supabase/migrations/`
* Supabase Edge Functions where server-side logic is required
* Supabase RLS policies

Do not create duplicate or parallel database structures inside individual Flutter apps.

Do not modify the production database manually when the change should be represented as a migration.

---

## 3. Before Making Database Changes

Always inspect the current schema and migrations before changing the database.

Required process:

1. Inspect existing tables, columns, relationships and constraints.
2. Inspect existing RLS policies.
3. Reuse existing structures where appropriate.
4. Create a new migration for structural changes.
5. Keep migrations forward-compatible.
6. Do not silently rename or remove existing database objects.

---

## 4. Security

Never put a Supabase service-role key inside any Flutter application.

Flutter client applications may use the public Supabase key.

Sensitive operations must be protected using:

* Row Level Security
* server-side Edge Functions
* database functions where appropriate

Never bypass RLS from Flutter.

---

## 5. Flutter Architecture

Each app is an independent Flutter project.

Keep responsibilities separated:

* UI
* state management
* models
* repositories
* services
* Supabase access
* navigation
* validation

Avoid placing database queries directly inside large UI widgets when a repository/service abstraction is appropriate.

---

## 6. Shared Backend

The following backend systems are shared by all applications:

* Authentication
* PostgreSQL
* Storage
* Realtime
* Edge Functions
* RLS
* configuration

Application-specific UI and permissions must remain separated.

---

## 7. Roles

The platform will support separate application roles and permissions.

Never assume that a user can access a feature merely because a Flutter screen exists.

Authorization must be enforced server-side.

---

## 8. Development Workflow

Implement features flow-by-flow.

Preferred order:

1. Database
2. Models
3. Repository/service layer
4. Business logic
5. Screens
6. Navigation
7. Validation
8. Error handling
9. Tests

Do not build large amounts of UI against fake database structures when the real schema can be implemented first.

---

## 9. Testing

After meaningful changes:

* run `flutter analyze`
* run relevant Flutter tests
* validate migrations
* validate RLS
* validate authentication/session behavior
* verify affected app flows

Fix errors rather than suppressing them.

---

## 10. Change Safety

Do not rewrite working architecture without a clear reason.

Before large changes:

* inspect existing implementation
* identify dependencies
* preserve compatible behavior where possible
* explain breaking changes in the code or commit

Prefer small, traceable changes over large unreviewed rewrites.

---

## 11. AI Behavior

When asked to implement a feature:

1. Inspect the repository first.
2. Inspect relevant Supabase schema/migrations.
3. Identify dependencies.
4. Implement the smallest complete solution.
5. Run validation/tests.
6. Fix errors found during validation.
7. Summarize files changed and database changes.

Do not invent APIs, tables, columns or relationships when the repository or Supabase project can be inspected.

---

## 12. Product Architecture
 -->
