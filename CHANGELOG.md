# Changelog

## [0.3.0] — Phase 1 · Part 2: vehicle catalog admin (2026-11-20)

### Added
- **Catalog admin pages** on the super-admin and admin dashboards:
  - `vehicle-types`, `vehicle-types/[id]`, `create-vehicle-type`
  - `brands`, `brands/[id]`, `create-brand`
  - `vehicle-models`, `vehicle-models/[id]`, `create-vehicle-model`
  - A new "Catalog" sidebar group.
- **AttributeSchemaBuilder** for the dynamic spec schema:
  - Add, edit, remove and reorder attributes, with fields that change per type (options editor, unit and range).
  - The key follows the label until saved, then locks.
  - Validation before saving, an unsaved-changes bar, and a live **listing-form preview** with test validation.
  - Schema conflicts from the server are shown in a dialog.
- **Brand form**: logo upload, vehicle-type checkboxes, popular and active toggles. **Brand table**: vehicle-type, popular and status filters, and a model count that links to the filtered model list.
- **Model form**: pick the vehicle type, then a brand linked to it, then fill default specs rendered from that type's schema. Changing the type asks first and clears the specs. Specs are validated on the client before submit.
- **Model table**: a "key specs" column built from the show-on-card attributes, plus vehicle-type, brand and status filters.
- **`components/dynamicForm/`** (listings will reuse these):
  - `DynamicSpecFields` renders grouped inputs for every attribute type.
  - `buildSpecSchema` / `validateSpecValues` is the client copy of the backend validator.
  - `specsToFormValues` converts stored specs into form values.
  - `formatSpecValue` / `SpecValue` formats a value for display.
- **Shared components**: `ImageUploadField`, `UrlFilterSelect`, `ActiveBadge`, `CatalogDelete`, `CatalogThumb`, and the `CatalogError` / `CatalogLoadingTable` states.
- **Data layer**: `vehicleTypeActions`, `brandActions`, `vehicleModelActions`, with types, validations and `lib/toMultipart.ts`.

### Changed
- Catalog reads are cached under the tags `vehicle-types`, `brands` and `vehicle-models`. Mutations call `updateTag(...)` **after** success. This is Next 16's read-your-own-writes form of the reference's `revalidateTag(tag, { expire: 0 })`, and it fixes CONVENTIONS Part D #18.
- Each catalog entity has one `<Entity>Form` for both create and edit, instead of separate `<Entity>Create` and `<Entity>Update` components.

## [0.2.0] — Phase 1 · Part 1: auth + user (2026-11-20)

### Added
- **Auth pages** (`(authGroup)`): login, register, verify-email, verify-phone, forgot-password and reset-password, with a shared auth layout.
  - Login has two tabs, Password and Phone OTP, plus a working `redirectTo`.
  - Register lets the user pick Buyer, Seller or Dealer.
  - After a successful sign-in the user lands on their role's dashboard. Accounts with a temporary password go to profile → security first.
- **`authActions.ts`**: login, register, verify email, resend code, phone OTP send/verify, forgot/reset password and logout. All use TanStack Form + Zod and `useActionState`.
- **Shared auth UI**: `OtpInput` (6 boxes, paste and keyboard support), `PasswordInput` (show/hide), `ResendCodeButton` (countdown) and `AuthCard`.
- **Profile** at `/<role>-dashboard/profile` for all 8 roles. Tabs:
  - Profile: avatar upload with preview, name, gender, date of birth, location and bio.
  - Security: change or set a password, plus verification status with inline phone verification.
  - Account: member details and account deletion.
- **User management** on the super-admin, admin and moderator dashboards:
  - Users table with search, role/status/deleted filters and pagination.
  - User details page with block/unblock (reason required), delete/restore, and role change for super admin only.
  - Create-user page for super admin and admin.
  - Loading, empty and error states throughout.
- **Shared components**: `UserAvatar`, `RoleBadge`, `StatusBadge`, `VerifiedBadge` and `FieldErrorText`.
- **Shared lib helpers**:
  - `lib/permissions.ts`: a display-only mirror of the backend guards.
  - `lib/enum.ts`: role, status and gender labels, self-register roles, BD divisions.
  - `resolvePostLoginPath`: blocks open redirects and checks that the path belongs to the user's role.
- **Service helpers**: `service/authCookies.ts` (`setAuthCookies`, `clearAuthCookies`).
- **Sidebar**: "My Profile" for every role; "Users" and "Create User" for super admin and admin; "Users" for moderator.
- **Navbar**: Login and Sign up buttons, the user's avatar in the menu, and a "My Profile" link.

### Changed
- Auth forms use TanStack Form everywhere. The reference used React Hook Form for its 3 auth forms (CONVENTIONS Part D #21).
- `next.config.ts`: allows Google avatar images.

## [0.1.0] — Foundation (2026-11-20)

### Added
- Project setup from the reference frontend: Next.js 16 App Router, React 19, Tailwind v4, shadcn/ui (`base-nova`), TanStack Form, sonner, sweetalert2, framer-motion, React Three Fiber.
- Route groups `(publicGroup)`, `(authGroup)` and `(dashboardGroup)`, with one placeholder overview page per role dashboard (8 roles).
- `lib/siteConfig.ts`: the one place for the brand name, currency and locales.
- `lib/dashboardPath.ts`: one role → dashboard map, shared by the proxy, sidebar and navbar.
- `components/routes/<role>.routes.ts` ×8 plus a `roleRoutes` map. `DashboardSidebar` reads it instead of an if/else chain.
- `service/baseApi.ts`: server-only fetch wrapper that returns the reference's normalized `{ success, message, statusCode, data, meta }`.
- Theme: `next-themes` dark/light/system toggle. RideX design tokens (color, radius, shadow, easing) in `app/globals.css`. Global focus ring and `prefers-reduced-motion` support.
- RideX Navbar, Footer, loading and 404 pages.
- Documented `.env.example`. `typecheck` script.

### Changed vs reference (approved fixes, CONVENTIONS.md Part D)
- `proxy.ts`: protects every role dashboard from one map. Stores the rotated refresh token after a refresh. Cookies are `secure` in production with `path: /`.
- `getMe`: `no-store` instead of a 1-day cache, and never throws.
- Root layout: no forced `dark` class. Metadata comes from `siteConfig`.
- Sidebar uses `render={<Link/>}` instead of a link nested inside a button.
- `hooks/use-mobile.ts` uses `useSyncExternalStore` (fixes a React Compiler lint error).
- `.gitignore`: keeps `.env.example` tracked.

### Added package
- `next-themes`: dark/light mode toggle (the reference hard-coded dark mode).
- `@types/three` (dev): types for the existing `three` dependency.
