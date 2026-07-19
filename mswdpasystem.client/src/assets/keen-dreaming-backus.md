# MSWDPASystem — Caba/La Union Visual Redesign + Public Site + Citizen Portal

## Context

MSWDPASystem (thesis project, MSWD Caba, La Union) is fully built as a staff-only tool: React 19 + Vite + Tailwind v4 frontend (`mswdpasystem.client`) and ASP.NET Core .NET 10 vertical-slice backend (`MSWDPASystem.Server`). The current UI uses stock Tailwind blue/gray classes, no custom fonts, no landing page, and the only public route is `/login`.

This plan delivers (user-approved scope):
1. A full **design system** inspired by the Caba + La Union seals — deep royal blue (primary), vibrant red (accent), gold, emerald, white/light-gray — with **Inter** typography, applied across the entire app.
2. A **public landing page** with all requested government sections.
3. A **redesigned login** and a **full citizen sign-up feature** (new Citizen role, backend registration slice, email verification, limited citizen portal).
4. A **redesigned authenticated shell** (collapsible sidebar, breadcrumbs, accessibility controls) and a **restyle of all ~18 existing pages**, mobile-first and WCAG-AA-minded.

## Up-front decisions

| Decision | Choice |
|---|---|
| CAPTCHA | Self-contained `MathCaptcha` component (no external service/keys — works offline for thesis defense; documented as bot-deterrent; Identity lockout covers brute force) |
| Email verification | Identity built-ins: `EmailConfirmed` + `GenerateEmailConfirmationTokenAsync` (token providers already registered — `Program.cs:38`). **No new entity/migration for tokens.** `IEmailService` with `DevEmailService` (logs link; Development responses also return `devConfirmationLink` so the UI shows a "Verify now" shortcut) and config-driven `SmtpEmailService` |
| Citizen → Beneficiary link | Nullable `Guid? LinkedBeneficiaryId` on `ApplicationUser` (one migration). Auto-link at registration on exact `Beneficiary.EmailAddress` match + staff link/unlink endpoint from BeneficiaryDetail |
| Landing content | Static config file `siteContent.js` + one anonymous `GET /api/public/stats` endpoint |
| Routes | Landing at `/`; auth pages `/login` `/register` `/verify-email` `/forgot-password`; staff app keeps existing paths under pathless layout route; citizen portal at `/portal/*` |
| Font | `@fontsource-variable/inter` (self-hosted npm pkg) via `--font-sans` in `@theme` |
| Dark mode | Skipped (not required) |

Each phase leaves both projects building and usable.

---

## Phase 0 — Design foundation (tokens, font, meta)

- **`mswdpasystem.client/src/index.css`** — replace the 5 unused `@theme` tokens (remove flat `--color-primary` etc. to avoid collisions with scales) with:
  - Full 50–950 scales: `--color-primary-*` (deep royal blue anchored ~`#1e3a8a`–`#172554` at 800/900), `--color-accent-*` (vibrant red), `--color-gold-*`; adopt Tailwind's built-in `emerald` as the success/growth color (don't redefine). Tailwind v4 auto-generates `bg-primary-600`, `text-…`, `ring-…` from these.
  - `--font-sans: "Inter Variable", ui-sans-serif, system-ui, sans-serif;` + `@import "@fontsource-variable/inter";`
  - Soft `--shadow-card` / `--shadow-card-hover` tokens.
  - Base layer: global `:focus-visible` ring (primary-600, offset 2), smooth scroll gated by `prefers-reduced-motion: no-preference`, global animation kill under `prefers-reduced-motion: reduce`, font-scaling hooks `html[data-font-scale="lg"] { font-size: 112.5% }` / `"xl" { 125% }` (powers the Phase 2 accessibility toggle).
- **`index.html`** — real title ("MSWD Caba — Profiling & Assistance System"), meta description, OG tags, `theme-color` (primary-900), new favicon.
- **Create** `public/favicon.svg` (seal-inspired mark) and `src/shared/components/ui/Logo.jsx` (mark + wordmark, reused by navbar/sidebar/login).
- **Delete** dead `src/App.css`. **Run** `npm i @fontsource-variable/inter`.

## Phase 1 — Shared UI kit (`src/shared/components/ui/`)

New primitives (build only what later phases consume): `Button.jsx` (primary/secondary/success/warning/danger/outline/ghost variants, sm/md/lg, `loading`, `as` prop for Link), `Card.jsx` (+`StatCard`), `Badge.jsx` (tone-based; `StatusBadge` becomes a thin wrapper), `Avatar.jsx`, `EmptyState.jsx`, `Skeleton.jsx` (+`SkeletonTable`/`SkeletonCard`), `Tabs.jsx`, `Accordion.jsx` (a11y: button + aria-expanded), `Breadcrumbs.jsx`, `Tooltip.jsx`, `Stepper.jsx`, `FileUpload.jsx` (drag-drop), `SlideOver.jsx`, `FormField.jsx` (react-hook-form-wired label/input/error), `MathCaptcha.jsx`, `PasswordStrength.jsx` (heuristic 4-segment meter).

Restyle in place (no API changes): `Modal.jsx`, `ConfirmDialog.jsx` (use Button), `Pagination.jsx`, `LoadingSpinner.jsx`, `StatusBadge.jsx`, `SignaturePad.jsx`.

Upgrade `DataTable.jsx` **backward-compatibly**: optional per-column `sortable`, optional column-visibility toggle, optional `onExport` hook — existing props untouched so all pages keep working pre-restyle.

## Phase 2 — Authenticated shell redesign

- **Create `src/shared/config/navigation.js`** — single nav array `{ to, icon, label, roles[], section? }` + `getNavForRole(role)`; include Citizen items now (`roles: ['Citizen']`). Move `pageTitles`/breadcrumb map here from `Layout.jsx`.
- **Rewrite `Sidebar.jsx`** — desktop collapse `w-64` ↔ icon-only (persisted in localStorage, Tooltips when collapsed), primary-950→900 gradient, gold active-indicator bar; mobile overlay drawer (backdrop, Escape closes). Deletes the 3 duplicated role arrays.
- **Rewrite `Header.jsx`** — hamburger (mobile), Breadcrumbs, scoped search (→ `/beneficiaries?search=…`; global search deferred), existing notification-bell logic kept, messages shortcut w/ unread dot, font-size toggle (A/A+/A++ cycling `data-font-scale`, persisted), profile dropdown (Avatar, name/role, sign out).
- **`Layout.jsx`** — owns collapsed/drawer state; main gets max-width container, responsive padding, gray token background.

## Phase 3 — Public landing site

- **Backend:** `Features/Public/GetPublicStats/` (Query/Handler/Response — beneficiaries served, completed assistance, active programs, barangays covered; model on `Features/Dashboard/GetStats/`), `Controllers/PublicController.cs` with `[AllowAnonymous] GET api/public/stats`.
- **Frontend `src/features/public/`:**
  - `content/siteContent.js` — mission/vision, programs (mirror the 6 seeded), services, announcements, news, FAQs, testimonials, hotlines, office hours, downloadable forms (`public/forms/*.pdf` placeholders), socials, transparency-seal link.
  - `PublicLayout.jsx` (sticky navbar: Logo, anchor links, Login/Register CTAs, mobile menu) + `PublicFooter.jsx`.
  - `LandingPage.jsx` composing `sections/`: `HeroSection` (existing `src/assets/hero.png`, primary-950 gradient overlay, gold CTA), `MissionVisionSection`, `ProgramsSection`, `ServicesSection`, `StatsSection` (query `/public/stats`, count-up, static fallback), `AnnouncementsSection`, `NewsSection`, `FaqSection` (Accordion), `TestimonialsSection`, `DownloadsSection`, `ContactSection`; plus `PrivacyPolicyPage` at `/privacy`.
- **`src/app/routes.jsx`:** `/` → PublicLayout(LandingPage, privacy); auth pages standalone; staff routes unchanged under pathless ProtectedRoute+Layout; `*` → `/`.

## Phase 4 — Login redesign (+ forgot password)

- **Rewrite `src/features/auth/LoginPage.jsx`** — react-hook-form + zod; Logo, welcome copy, username/email, password w/ eye toggle, remember-me (persist last username), `MathCaptcha`, forgot-password link, Register CTA; right panel (lg+) government illustration (gradient + seal watermark + hero.png). Post-login redirect by role: `Citizen → /portal`, else `/dashboard`.
- **Backend (deferrable):** `Features/Auth/ForgotPassword/` + `Features/Auth/ResetPassword/` (Identity reset tokens via `IEmailService`; always return success to prevent enumeration; dev link in Development). Endpoints on `Controllers/AuthController.cs`. Frontend `ForgotPasswordPage.jsx` / `ResetPasswordPage.jsx`.

## Phase 5 — Citizen backend

- **`Infrastructure/Data/SeedData.cs:9`** — add `"Citizen"` to `Roles` (seed loop is idempotent).
- **`Domain/Entities/ApplicationUser.cs`** — add `Guid? LinkedBeneficiaryId` (+ optional nav). Migration: `dotnet ef migrations add AddCitizenLinkedBeneficiary`.
- **Email:** `Common/Interfaces/IEmailService.cs`; `Infrastructure/Services/DevEmailService.cs` (ILogger) + `SmtpEmailService.cs`; DI switch on `Email:Mode` config (`Dev` in Development). Add `FrontendBaseUrl` to appsettings.
- **New slices** (Command/Handler/Validator/Response each, per existing pattern):
  - `Features/Auth/RegisterCitizen/` — validate name/email/username/contact/barangay/password (mirror Identity policy in FluentValidation for friendly errors)/terms; create user `EmailConfirmed=false`, `AddToRoleAsync("Citizen")`, auto-link on email match, generate confirmation token (`Uri.EscapeDataString`!), send link `{FrontendBaseUrl}/verify-email?userId=…&token=…`; Development response includes `DevConfirmationLink`.
  - `Features/Auth/ConfirmEmail/` — `ConfirmEmailAsync`. (`ResendConfirmation/` — deferrable.)
  - `Features/Citizen/GetMyProfile/` and `Features/Citizen/GetMyAssistanceRequests/` (empty list + `isLinked:false` when unlinked) → new `Controllers/CitizenController.cs` `[Authorize(Roles="Citizen")]`, `GET api/citizen/me`, `GET api/citizen/assistance-requests`.
  - `Features/Beneficiaries/LinkCitizenAccount/` → `POST api/beneficiaries/{id}/link-citizen` in `Controllers/BeneficiariesController.cs`.
- **Modify `Features/Auth/Login/LoginCommandHandler.cs`** — reject unverified email ("Please verify your email"). Staff unaffected: seeded/created users have `EmailConfirmed = true` (`SeedData.cs:33`, CreateUser handler).
- **`Infrastructure/Services/TokenService.cs`** — add `beneficiaryId` claim when linked.
- **Authorization sweep** — grep bare `[Authorize]` (Notifications/Messages/etc.); most are role-attributed already (verified); tighten any endpoint a Citizen shouldn't reach, keeping per-user endpoints (notifications, messages) usable if intentionally shared.

## Phase 6 — Citizen frontend

- `src/features/auth/RegisterPage.jsx` — Stepper: (1) personal info → (2) account + PasswordStrength → (3) review + terms + MathCaptcha → submit; success screen with "check your email" + "Verify now (dev)" button when `devConfirmationLink` present.
- `src/features/auth/VerifyEmailPage.jsx` — reads query params, confirms, Login CTA.
- `src/features/citizen/`: `CitizenDashboardPage.jsx` (greeting, linked-status card or "visit MSWD office to link" info, recent requests, announcements, hotlines), `CitizenRequestsPage.jsx` (DataTable + StatusBadge), `CitizenProfilePage.jsx`.
- **`routes.jsx`** — add `/register`, `/verify-email` (public); `/portal`, `/portal/requests`, `/portal/profile` under `allowedRoles={['Citizen']}` in the same Layout; **add explicit `allowedRoles={['Admin','MSWDStaff','HeadCoordinator']}` to every currently-unrestricted staff route** (`/dashboard`, `/beneficiaries*`, `/households`, `/assistance*`, `/notifications`, `/messages`).
- `AuthContext.jsx` — add `isCitizen` convenience only.
- `BeneficiaryDetailPage.jsx` — "Linked citizen account" card + link/unlink (staff).

## Phase 7 — Restyle all existing pages

Mechanical per-page pattern: (1) literal `blue-*`/gray/red classes → token classes; (2) raw buttons → `Button`, stat blocks → `StatCard`, panels → `Card`, empty text → `EmptyState`, loading spinners → `Skeleton` presets, form fields → `FormField`; (3) responsive audit (filter bars wrap, grids step at `sm:`/`lg:`; DataTable handles overflow centrally).

Pages (`src/features/`): `dashboard/DashboardPage` (recolor recharts: primary-600 bars; categorical set primary/gold/emerald/accent), `users/UsersPage`, `beneficiaries/{BeneficiariesPage, RegisterBeneficiaryPage (adopt Stepper), BeneficiaryDetailPage (adopt Tabs)}`, `households/HouseholdsPage`, `assistance/{AssistanceRequestsPage, CreateAssistanceRequestPage, AssistanceRequestDetailPage}`, `admin/AdminPage (adopt Tabs)`, `duplicates/DuplicateFlagsPage`, `audit/AuditLogsPage`, `reports/ReportsPage`, `notifications/NotificationsPage`, `qrscan/QrVerificationPage`, `messages/MessagesPage`, inline `UnauthorizedPage` in `routes.jsx`.

## Phase 8 — Polish, accessibility, config sanity

- A11y: `aria-label` on icon-only buttons, Modal/SlideOver focus trap + `aria-modal`, semantic `<section aria-labelledby>` on landing, skip-to-content links in both layouts, contrast rule: gold text on primary-950 only at large sizes; gold buttons = gold-500 bg + primary-950 text.
- Reduced motion honored by count-up/transitions (Phase 0 media query).
- CORS: `Program.cs:88` currently `WithOrigins("https://localhost:49400")` — confirm matches Vite dev URL; `FrontendBaseUrl` config for email links.

## Verification

1. `dotnet build` (Server); `npm run build` + `npm run lint` (client).
2. Run backend (`dotnet run --urls http://localhost:5199`) + `npm run dev`; migration applies, Citizen role seeds.
3. Anonymous: `/` renders all sections; `/api/public/stats` returns data; anchors + mobile menu work.
4. Staff regression: admin/Admin@123456 → dashboard; visit every sidebar page; register beneficiary; create assistance request; export report; QR page; no Citizen items in staff nav.
5. Citizen flow: register (weak password rejected, captcha) → login blocked pre-verification → dev verify link → login → `/portal`; `/dashboard` as Citizen → 403; unlinked info card; staff links account → requests visible.
6. Responsive at 375/768/1280px: landing, login, register, portal, dashboard, one table page; sidebar drawer + collapse; font-size toggle persists.
7. Keyboard-only pass: login, register stepper, one modal, FAQ accordion.

## Risks & deferrals

- **Tailwind v4 token collision** — remove old flat `--color-primary` tokens before adding scales; smoke-test one `bg-primary-600` immediately.
- **Identity confirmation token URL-safety** — `Uri.EscapeDataString` on generation.
- **Citizens reaching staff surfaces** — explicit `allowedRoles` on every route + controller attribute sweep.
- **Defer first if time-boxed (in order):** forgot/reset password, ResendConfirmation, DataTable column-visibility/export, Tooltip, SlideOver, header search, PrivacyPolicyPage, SmtpEmailService (keep Dev only).
