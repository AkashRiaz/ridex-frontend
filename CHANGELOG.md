# Changelog

## [0.12.0] — Phase 2 · Part 2b: saved searches and alerts (2026-11-22)

### Added
- **"Save search" on the listings page:**
  - `SavedSearchCreate` sits next to sort.
  - It opens a dialog with an optional name (the server names the search from its filters when empty), the alert frequency (Instantly, Daily digest, No alerts) and "Price drops too".
  - It is disabled until at least one filter is set. Visitors are sent to log in and come back to the same search.
  - When the current search is already saved (looked up server-side), it becomes a "Saved search" link to that search.
  - Staff roles don't see it.
- **Saved Searches pages** (`/saved-searches` and `/saved-searches/[savedSearchId]`) in the buyer, seller, dealer, dealer staff and inspector dashboards, with a sidebar entry under Activity.
  - **List (`SavedSearchTable`):**
    - The name with a "N new" badge, and the filter chips.
    - Alert settings, live matches and last alert.
    - Search by name and pagination.
    - Results link, edit and delete for each row.
    - A `SavedSearchLoadingTable` skeleton, plus empty and error states.
  - **Detail:**
    - All filter chips and the alert settings.
    - "All results", "Edit alerts" and "Delete" buttons.
    - The 20 latest matches as listing cards, labelled "New match" or "Price drop: ~~old~~ new", with a "New" tag for matches since the last visit.
    - `MarkSavedSearchSeen` clears the badge after the page has shown which matches were new.
  - **Components:** `SavedSearchUpdate` (rename and alerts) and `SavedSearchCreate` both wrap one `SavedSearchForm` (TanStack Form + zod, calling its action directly; CONVENTIONS Part G). `SavedSearchDelete` follows the Swal-confirm pattern.
- **Data:**
  - `_actions/savedSearchActions.ts` (every read is `no-store`).
  - `types/saved-search.type.ts`.
  - `components/validations/saved-search.validation.ts` (`buildSavedSearchSettingsZodSchema`, where the name is optional when saving).
  - Frequency labels in `lib/enum.ts`.

### Changed
- Notifications: new `SAVED_SEARCH_MATCH` and `SAVED_SEARCH_PRICE_DROP` types with their own icons. The `PRICE_ALERTS` category is now labelled "Price drops & saved searches".

## [0.11.0] — Phase 2 · Part 2a: price insight and compare (2026-11-22)

### Added
- **Price insight:**
  - `listing/PriceInsight` contains `PriceInsightBadge` (Good deal, Fair price, Priced high, Not rated), `PriceInsightCard` and `PriceInsightSkeleton`.
  - The card has a sentence for screen readers ("14% below the typical price of BDT 4,95,000"), a range bar (typical p25–p75 band, a median tick and a marker for this listing's price), and the basis ("Based on 7 similar listings (Yamaha R15 V4 · 2022–2023 · used), including recent sales").
  - `listing/PriceInsightPanel` is the async server loader used inside `<Suspense>`. A failed request renders nothing.
  - **Where it appears:**
    - The public listing page, under the price box. Buyers see it only when there is a rating; the owner also sees "not enough data".
    - The owner's edit page, above the wizard.
    - The staff review page, where a price far below the market is a scam signal.
- **Compare:**
  - **The list:** `hooks/useCompare` keeps it in localStorage, with key `<app name>:compare`, up to 4 listings of one vehicle type. It syncs across tabs and components with `useSyncExternalStore`, and blocked storage falls back to an empty list.
  - **CompareButton:** an icon on `ListingCard` (live listings on public pages, Saved and Recently Viewed) and a labelled button on the listing page. A full list or a different vehicle type shows a toast.
  - **CompareTray:** a floating bar in the public layout, above the mobile bottom nav. It has thumbnails, remove, Clear, and "Compare N", which needs at least 2 listings. It's hidden on `/compare` and when the list is empty, and respects reduced motion.
  - **`/compare?ids=`:** a shareable page that isn't indexed. Without ids it opens this browser's list.
  - **CompareTable:**
    - A sticky label column and sticky photo headers, with horizontal scroll on phones.
    - Fixed rows: price, price insight, year, mileage, condition, colour, location and seller. Then spec rows grouped by attribute group.
    - The best value in a row is tinted and marked "Best".
    - A "Show differences only" toggle, a remove button per column, and an "Add a listing" column on desktop.
  - **States:** `CompareLoading` skeleton, empty, error, and "no longer for sale". `CompareStorageSync` also removes gone listings from the stored list.
- **Data:**
  - `_actions/priceInsightActions.ts`: not cached in Next, because the backend caches each rating.
  - `_actions/compareActions.ts`: revalidates every 60s, tag `listings`.
  - `lib/compare.ts`: `MAX_COMPARE_LISTINGS`, `parseCompareIds`, `compareHref`.
  - Types: `price-insight.type.ts` and `compare.type.ts`.

### Changed
- `ListingCard` has a new `showCompare` prop. By default it is on for live listings that link to their public page, and off for dashboard cards that pass `href`.

## [0.10.0] — Phase 2 · Part 1: offers and test rides (2026-11-22)

### Added
- **Chat cards:**
  - `Chat/OfferCard` shows the amount, how far it is below the asking price, the note, the status and a countdown. Accept, Counter, Decline and Withdraw appear when allowed.
  - `Chat/TestRideCard` shows the time in the marketplace zone, the buyer's note, the seller's meeting note and the status. Confirm, Decline, Cancel, Completed and No-show appear when allowed.
  - Both update live from the `offer:updated` and `testRide:updated` socket events. Without a socket, the thread reloads its newest messages after an offer or booking.
- **Composer:** buyers get "Make an offer" (negotiable listings only) and "Book a test ride" buttons while the listing is live.
- **Listing page:** "Make an offer" and "Book a test ride" sit under "Chat with seller" in the seller card. Visitors are sent to log in, and staff and the owner don't see them. After sending, the buyer lands in the chat thread.
- **Dialogs:**
  - `offer/OfferDialog` makes or counters an offer, with suggested amounts and the bounds the form knows.
  - `testRide/BookTestRideDialog` is a day and time slot picker. Slots are fetched fresh each time it opens; when a slot was just taken, it shows fresh times.
  - `shared/ReasonDialog` is the one-field confirm dialog for reasons and notes.
  - All three use TanStack Form with zod and call their server action directly (CONVENTIONS Part G).
- **Dashboard pages:**
  - Offers (`/offers`) and Test Rides (`/test-rides`) in the buyer, seller, dealer, dealer staff and inspector dashboards.
  - Test Ride Hours (`/test-ride-availability`) for sellers and dealers.
  - Offers has Received/Sent tabs plus a status filter and search. Test Rides has Upcoming/Past tabs plus side and status filters. Every row has its actions and a link to the chat.
  - Each page has its own `…LoadingTable` skeleton, plus error and empty states.
- **Test ride hours:**
  - `AvailabilityEditor` is the weekly editor (Saturday first): several ranges per day, slot length, capacity and "Copy to all days". The "Hours for" picker edits the default hours or a listing's own hours. The whole week is saved at once.
  - `BlockedDates` adds and removes days off.
- **Data layer:**
  - `_actions/offerActions.ts` and `_actions/testRideActions.ts` (all reads no-store).
  - `types/offer.type.ts` and `types/test-ride.type.ts`.
  - `components/validations/offer.validation.ts` and `test-ride.validation.ts`.
- **Other:**
  - Sidebar entries for the new pages.
  - Notification icons for the 14 new types.
  - The Offers and Test rides categories on the notification settings page.
- `lib/formatRideTime.ts` shows test-ride times in `siteConfig.timezone` (new `NEXT_PUBLIC_TIMEZONE`, default Asia/Dhaka), so buyer and seller see the same time.

### Changed
- `types/chat.type.ts`: messages can carry `offer` / `testRide`, the message types gain `OFFER` and `TEST_RIDE`, and the conversation listing gains `isNegotiable`.
- The "new message" toast shows the conversation preview for offer and test-ride cards.

## [0.9.0] — Phase 1 review: conventions (2026-11-21)

### Changed
- **Validation:** the phone-login and verify-phone form schemas moved into `components/validations/auth.validation.ts` (`PhoneOtpCodeZodSchema`, `VerifyPhoneFormZodSchema`).
- **Catalog components (CONVENTIONS §B6):** `BrandCreate`, `BrandUpdate`, `BrandDelete` and `BrandLoadingTable`, plus the same four for VehicleType and VehicleModel. They wrap the shared `<Entity>Form`, `CatalogDelete` and `CatalogLoadingTable`; behaviour is unchanged.
- **Queue tables:** moved out of the `*Pages.tsx` files into `ListingTable`, `ReportTable`, `MyReportTable` and `VerificationTable`, each with a table-shaped `…LoadingTable` skeleton instead of a plain block. Shared badges moved to `ReportBits.tsx` and `VerificationBits.tsx`.

## [0.8.0] — Phase 1 · Part 7: public homepage + main layout (2026-11-21)

### Added
- **Homepage** (`app/(publicGroup)/page.tsx` + `_components/HomePage/`):
  - `hero/Hero` + `hero/HeroBackdrop`: headline, search, popular searches and safety points. The background moves slower than the page (parallax) with glows, a road grid and speed lines. An optional looping ride video (`NEXT_PUBLIC_HERO_VIDEO_URL`, `NEXT_PUBLIC_HERO_POSTER_URL`) loads only on screens 768px and wider, and never with reduced motion.
  - `StatsSection`: live listings, verified sellers, districts and bikes sold in the last 30 days, counting up as they scroll into view.
  - `FeaturedListings` + `FeaturedCarousel`: a swipeable scroll-snap row with arrow buttons on desktop and wishlist hearts.
  - `BrowseByCategory`: tiles with an icon and live count for each bike category, linking to the filtered search.
  - `BrowseByBrand`: logo (or monogram) cards with counts, linking to `/listings?brand=…`.
  - `HowItWorks`: buying and selling steps in keyboard-accessible tabs.
  - `LatestListings` (moved out of `page.tsx`), `TrustSection` and a role-aware `SellCTA` (visitor, buyer, seller or dealer; hidden for staff).
  - One `/search/home` request (`_actions/homeActions.ts`, revalidated every 60s) feeds stats, featured, categories and brands. Each section streams in behind its own skeleton (`HomeLoading.tsx`) and shows its own error or empty message.
- **Main layout**:
  - `MobileBottomNav`: Home, Search, a raised Sell button, Chats with the live unread badge, and Account or Log in. Shown below `lg`, with iPhone safe-area padding; the page gets matching bottom padding.
  - `(publicGroup)/template.tsx`: a fade-and-rise page transition between public pages.
  - `(publicGroup)/loading.tsx`: a skeleton page inside the real navbar and footer.
  - A "Skip to content" link.
- **Motion helpers** (`components/motion/`): `Reveal`, `Stagger`/`StaggerItem` and `CountUp`. All render in place with `prefers-reduced-motion`.
- **Design tokens** (`globals.css`): hero glows, a glass surface, motion durations, the bottom-nav height, `marquee`/`speed-line`/`float` animations, and `glass`, `pb-bottom-nav` and `no-scrollbar` utilities, each defined for light and dark.
- `lib/navigation.ts`: public nav items, `getSellHref` and active-link matching, shared by the navbar, bottom nav and footer.
- `types/home.type.ts`.

### Changed
- `Navbar`: see-through over the homepage hero, frosted once you scroll and on every other page. New Categories and Brands links.
- `Footer`: Explore, Categories and Buy & sell columns, plus the support email. Social links show only once real URLs are set in `siteConfig.social`.
- `siteConfig`: `heroVideoUrl`, `heroPosterUrl`.

## [0.7.0] — Phase 1 · Part 6: role dashboards + audit log (2026-11-21)

### Added
- **Charts**: `recharts` through the shadcn `chart` component (`components/ui/chart.tsx`). The colours come from the existing `--chart-N` tokens, so light and dark mode both work.
- **Overview pages** for all 8 roles (`/<role>-dashboard`) replace the placeholder. Each one has 7, 30 and 90 day tabs (`?range=`), stat cards with change vs the previous period, a loading skeleton, and empty and error states.
  - Super admin and admin:
    - Users, live listings, open reports and conversations, plus marketplace activity, listings by status, top brands, listings by division, and trust and chats.
    - A moderation snapshot and accounts by role (super admin) or by status (admin).
    - Recent activity linking to the audit log, and alerts like "Review 12 pending listings →".
  - Moderator: queue sizes, my decisions per day, open reports by reason and type, and the items waiting longest.
  - Seller and dealer: views, saves, chats, buyer interest per day, listings by status, top listings, chat-to-sale rate, trust (rating and verification), listings expiring this week, and the latest reviews. Shows a "List your first bike" card when empty.
  - Buyer, dealer staff and inspector: saved listings, recently viewed, chats, reports, activity per day, saved listings by brand, recently saved, and account verification. The buyer keeps the Start selling card.
- **Audit log** (`/admin-dashboard/audit-logs` and `/super-admin-dashboard/audit-logs`):
  - Table with search, action, entity and date filters, and pagination.
  - Detail page with the acting user, the request IP and user agent, before and after values side by side, a link to the record, "Full history" and "More by this user".
- **Sidebar badges for staff**: Listings, Reports and Verifications show live queue counts (`hooks/useQueueCounts.ts`). They refresh every minute while the tab is visible, and after every navigation.
- Admin and super admin sidebars gain an Audit Log item.

### Removed
- `components/dashboard/DashboardOverviewPlaceholder.tsx`, replaced by the real overviews.

## [0.6.0] — Phase 1 · Part 5: real-time chat + notifications (2026-11-21)

### Added
- **Realtime layer**:
  - `components/shared/RealtimeProvider.tsx` (mounted in the public and dashboard layouts) keeps one Socket.io connection per signed-in tab.
  - The handshake token comes from the `service/getSocketToken.ts` server action and is fetched again on every reconnect, so the httpOnly access token never reaches the browser.
  - `hooks/useSocket.ts` provides `useRealtime()` (connection, live chat and notification counts, the open thread) and `useSocketEvent()`.
  - Toasts for new messages (not for the thread you have open) and for new notifications.
- **Messages** (`/<role>-dashboard/messages` and `/messages/[conversationId]`, for buyer, seller, dealer, dealer staff and inspector):
  - Layout: two panes on desktop, one at a time on mobile.
  - Inbox:
    - Tabs: All, Buying, Selling and Archived (buyers see Inbox and Archived).
    - Search and pagination.
    - Live reordering, unread badges, online dots and "typing…" previews.
  - Thread messages:
    - Optimistic send over the socket with an ack, falling back to REST. Pending, sent, seen and failed states, with a retry button.
    - Photo messages: up to 4, compressed in the browser, previewed while uploading.
    - Typing indicator, read receipts, date separators and a "New messages" divider.
    - Older messages load on scroll-up without losing your place.
  - Thread header:
    - The listing strip, with price and status.
    - A menu with Archive, Block/Unblock (with a confirmation) and Report user.
    - Each message has a report action.
  - Thread banners and composer:
    - Banners for sold, expired or in-review listings, and a read-only footer with the reason (blocked, account gone, listing removed). Unblock is one click.
    - Quick-reply chips (built-in buyer or seller replies plus your own), with a Manage dialog to add or delete your own (up to 10).
- **Chat with seller** on listing detail: a dialog with quick questions or a first message. It opens the existing thread if there is one. Signed-out visitors go to login and come back. Staff accounts don't see it.
- **Notification bell** in the navbar and the dashboard header:
  - Live unread count.
  - Opening it shows the latest 8; clicking one marks it read and follows its link.
  - Mark all read, a settings link and View all.
- **Chat badge** in the navbar and dashboard header, plus unread counts on the sidebar's Messages and Notifications items (`ISidebarItem.badge`).
- **Notifications page** (`/<role>-dashboard/notifications`, all 8 roles):
  - All and Unread tabs, a category filter and pagination.
  - Live arrivals, mark read on open, delete, and mark all read.
- **Notification settings** (`/notifications/settings`):
  - A category × channel switch grid that saves on change.
  - Locked channels show a lock.
  - A hint appears if your email is not verified.
- **Blocked users** page (`/<role>-dashboard/blocked-users`) with Unblock.
- **`/unsubscribe`** public page for email footer links. Unsubscribing takes an explicit click, so mail scanners can't trigger it.
- **Staff report detail for messages**: the reported message plus the 5 messages before it, with the reported one highlighted. Admins can resolve with "Block user".
- **Data layer**: `chatActions`, `quickReplyActions`, `userBlockActions` and `notificationActions`. Types: `chat.type.ts` and `notification.type.ts`. Helpers: `lib/formatChatTime.ts`, plus `CHAT_ROLES`, `isChatRole` and the notification category labels in `lib/enum.ts`.
- **Sidebars**:
  - Chat roles get Messages (with a badge) and Blocked Users.
  - Every role gets Notifications (with a badge).
- **Env**: `NEXT_PUBLIC_SOCKET_URL` (the backend origin), exposed as `siteConfig.socketUrl`.

### Changed
- The seller card on listing detail replaces the "chat coming soon" note with the Chat with seller button and a safety tip.
- Report types gain `message` / `messageContext`, and "My reports" shows message reports.

## [0.5.0] — Phase 1 · Part 4: wishlist, reviews, reports, verification (2026-11-21)

### Added
- **Wishlist**:
  - A heart button with optimistic updates on listing cards (home, search, similar listings, seller profile) and a Save button on listing detail.
  - Signed-out visitors are sent to login and brought back.
  - Saved IDs come from `service/getWishlistState.ts`.
- **Dashboard pages** (buyer, seller, dealer, dealer staff, inspector):
  - Saved (unavailable listings are dimmed) and Recently viewed (remove one or clear all).
  - My reports, with the status of each report.
- **Seller ratings**:
  - "Rate this seller" on listing detail, shown only to eligible signed-in buyers.
  - Viewers who already reviewed see their own review instead.
  - Unverified accounts see a prompt to verify.
  - Reviews page: Received, Awaiting reply (a one-time public reply) and Given (edit within 30 days, or delete). Buyers see Given only.
- **Public seller profile `/sellers/[sellerId]`**:
  - Badges, rating, bio, location, member since, active and sold counts, and listings.
  - Reviews with a 1–5 distribution summary (plain CSS bars) and pagination.
  - Report seller and report review.
- **SellerCard** on listing detail: rating, verified badges and a profile link. Listing cards show the seller name, their strongest badge and their rating.
- **ReportDialog**: reports a listing, seller or review. It offers reasons that fit the target, plus optional details (required for "Something else").
- **Staff report queue** (moderator, admin, super admin):
  - Tabs for open & in review, resolved, dismissed and all; a target filter; priority or newest sort; open-report counts per target.
  - Detail page: a snapshot of the target, the reporter's details and other reports on the same target.
  - Resolve panel: take down listing, hide review, block user (admins only), or dismiss, with a note.
- **Verification**:
  - Badge cards for phone, NID and dealership.
  - ID and dealer forms with a document checklist, per-slot previews, rejection feedback and history.
  - Photos are compressed in the browser before upload (`lib/compressImage.ts`).
- **Admin verification queue**: status tabs with counts, a type filter, and search.
  - Detail page: documents through short-lived signed links (plain `<img>` and PDF links, not next/image), the submitted details (only the last 4 NID digits) and the account.
  - Approve, or reject with a reason.
- **Dealer banner**: shown in the dashboard layout while a dealer account is PENDING, with a link to verification.
- **Sidebars**:
  - Buyer, seller, dealer, dealer staff and inspector get an Activity group.
  - Buyer, seller and dealer also get Verification.
  - Staff get Reports, and admins also get Verifications.
- **Types** for seller, wishlist, review, report and verification; labels in `lib/enum.ts`; validations for review and verification.

### Changed
- `IListingCard.seller` is now always present (a public summary with badges and rating). `IListingSeller` gains a rating and badges.
- `serverActions.bodySizeLimit` raised from 5mb to 20mb, because a verification upload sends every document in one request.

## [0.4.0] — Phase 1 · Part 3: listings, search and detail (2026-11-20)

### Added
- **Search page `/listings`**:
  - The filter sidebar (a sheet on mobile) covers vehicle type, brands with counts, price, year, mileage, condition, negotiable, division and district or "near me" with a radius, plus **dynamic spec filters rendered from the vehicle-type schema**.
  - Sort options, a grid/list toggle, removable active-filter chips, pagination, and skeleton, empty and error states.
  - Every filter lives in the URL, so searches are shareable.
- **Listing detail `/listings/[slug]`**:
  - Gallery with arrows, keyboard and swipe navigation, and thumbnails.
  - Price and key facts, a specs table grouped like the schema, the description as plain text, and a video (YouTube embed, otherwise a link).
  - Seller card, views, share/copy link, similar listings and breadcrumbs.
  - Status notice for owners and staff, plus Open Graph metadata and noindex for unapproved listings.
- **Listing wizard** (seller and dealer dashboards), 5 steps:
  1. Vehicle: creates the draft and auto-fills specs.
  2. Specs: dynamic fields; save a draft or continue.
  3. Price & details: location selects and optional exact location.
  4. Photos: multi-upload with progress, drag-and-drop or arrow reordering, set cover, delete, and a video link.
  5. Review: checklist, then submit, resubmit or renew.
  The step lives in the URL, so a draft can be resumed later.
- **My listings**: status tabs with counts, cards showing status, rejection reason and views, and actions (edit/continue, submit, mark sold, renew, delete).
- **Moderation** (super admin, admin, moderator): a queue with status tabs and counts (oldest first), and a review page with approve, reject or take down with a reason, and delete for admins.
- **Buyers**: a "Start selling" card on the dashboard switches the account to seller and opens the wizard.
- **Home**: hero search box, popular searches and the latest listings.
- **Navbar**: a Browse link and a role-aware "Sell your bike" button.
- **Shared code**:
  - `ListingCard` (grid and list variants) with its skeleton.
  - `ListingBits`: status badge, price tag, placeholder image and formatting helpers.
  - `useUrlParams` hook and `lib/bdLocations.ts`.
- **Data layer**: `searchActions` (cached for 60 seconds; "near me" searches are never cached) and `listingActions` (mutations call `updateTag("listings")`).

### Changed
- `baseApi` supports `auth: "optional"`, which sends the token only when signed in.
- Role sidebars gain a Listings group for sellers and dealers, and Listings for moderation staff.

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
