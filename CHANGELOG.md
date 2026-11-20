# Changelog

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
