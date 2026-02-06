# Phase 1: Discovery Report — Code Audit

**Project:** Raices de Alvear — Real Estate Lot Management
**Stack:** Next.js 16, React 19, Prisma 5, PostgreSQL, Tailwind CSS 4
**Date:** 2026-02-02
**Files Reviewed:** 21 source files, 6 config files, 1 schema, 1 seed, 1 CSS

---

## Architecture Note

The PROMPT described "Node.js, Express, Prisma, AWS S3" — the actual stack is **Next.js 16 App Router** (no Express, no S3). This is a full-stack monolithic Next.js app with server actions and one API route.

---

## Issue Catalog

### 1. SECURITY

#### SEC-01 🔴 Critical — Hardcoded Weak Admin Credentials in `.env`
- **File:** `.env:7-8`
- **What:** `ADMIN_USER="admin"` and `ADMIN_PASSWORD="password123"` — trivially guessable credentials.
- **Why it matters:** Anyone who guesses these credentials gains full admin access to modify lot prices, statuses, and data. "admin/password123" is one of the most common credential pairs in brute-force dictionaries.

#### SEC-02 🔴 Critical — Database Credentials Exposed in `.env` (Local File)
- **File:** `.env:12-13`
- **What:** Full Postgres connection strings with username, password, and host are present in the local `.env`. While `.gitignore` correctly excludes `.env*`, the credentials are `sk__e_eqGDuLnPJXpR2nsjBS` on `db.prisma.io` — if this file is ever leaked or the project is shared, the database is fully compromised.
- **Why it matters:** Direct database access allows reading/modifying/deleting all data.

#### SEC-03 🔴 Critical — Admin Session Cookie is a Static Boolean String
- **File:** `src/app/actions.ts:39`
- **What:** The session cookie is set to `admin_session = "true"` — a static, predictable value. Any user can manually set this cookie in their browser to `"true"` and gain admin access without knowing the password.
- **Why it matters:** Complete authentication bypass. Anyone with browser dev tools can become admin.

#### SEC-04 🔴 Critical — Middleware Authentication is Entirely Disabled
- **File:** `src/middleware.ts:5-24`
- **What:** The entire authentication block in middleware is commented out. The middleware returns `NextResponse.next()` unconditionally.
- **Why it matters:** Even if cookie auth were strong, there's no middleware-level protection for `/admin` routes. The only check is the cookie existence in `admin/page.tsx`, which is bypassable per SEC-03.

#### SEC-05 🟠 High — No CSRF Protection on Server Actions
- **File:** `src/app/actions.ts:8-29` (updateLot), `src/app/actions.ts:31-48` (login)
- **What:** Server actions (updateLot, login) accept form data without CSRF tokens. While Next.js App Router has some built-in CSRF protection for server actions, the `login` action is called from a client component with `form action={handleSubmit}` which bypasses the built-in protection.
- **Why it matters:** A malicious website could potentially submit forms to these endpoints on behalf of an authenticated user.

#### SEC-06 🟠 High — No Input Validation on Server Actions
- **File:** `src/app/actions.ts:8-29`
- **What:** `updateLot` directly passes user input to Prisma without validation. `price` is converted with `Number()` (could be NaN/Infinity), `status` has no enum check (could be any string), `slug` has no format validation (could contain XSS payloads stored in DB).
- **Why it matters:** Data integrity issues, potential stored XSS if slug is rendered unsanitized, ability to set invalid statuses.

#### SEC-07 🟠 High — `dangerouslySetInnerHTML` with Inline CSS
- **File:** `src/app/card/[slug]/page.tsx:42-44`
- **What:** `dangerouslySetInnerHTML={{ __html: \`html, body { background: transparent !important; }\` }}` — While the content here is hardcoded (not user-supplied), using `dangerouslySetInnerHTML` sets a dangerous precedent and could be expanded unsafely by junior developers.
- **Why it matters:** Pattern that can lead to XSS if copy-pasted with dynamic content.

#### SEC-08 🟠 High — X-Frame-Options Set to `ALLOWALL`
- **File:** `next.config.ts:16`
- **What:** `X-Frame-Options: ALLOWALL` — this is not a standard value (standard values are `DENY`, `SAMEORIGIN`, or `ALLOW-FROM`). This effectively allows any site to embed the app in an iframe.
- **Why it matters:** Clickjacking attacks — a malicious site could overlay invisible frames on top of the admin panel to trick users into performing actions.

#### SEC-09 🟡 Medium — `postMessage` with Wildcard Origin
- **File:** `src/components/tour-embed.tsx:45`
- **What:** `iframe.contentWindow.postMessage({...}, "*")` — messages are sent to any origin.
- **Why it matters:** If the iframe loads a malicious page, it receives device motion data. Low risk in this context but bad practice.

#### SEC-10 🟡 Medium — Missing Security Headers
- **File:** `next.config.ts`
- **What:** No `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy`, or `Permissions-Policy` headers are set.
- **Why it matters:** Missing defense-in-depth headers that protect against various attack vectors.

---

### 2. ERROR HANDLING

#### ERR-01 🟠 High — No Error Handling in updateLot Server Action
- **File:** `src/app/actions.ts:8-29`
- **What:** `updateLot` has no try/catch. If Prisma throws (e.g., unique constraint on slug, invalid data), the error propagates unhandled to the client as a generic server error.
- **Why it matters:** Users see cryptic errors. No ability to show meaningful feedback. Server logs may not capture context.

#### ERR-02 🟠 High — No Error Handling in Login Action
- **File:** `src/app/actions.ts:31-48`
- **What:** If `cookies()` or env vars fail, the function throws without a catch. The `login` function doesn't handle the case where env vars are undefined.
- **Why it matters:** If `ADMIN_USER` or `ADMIN_PASSWORD` env vars are missing, `undefined === undefined` would be true, granting access to anyone.

#### ERR-03 🟡 Medium — Prisma Client Logs Queries in Production
- **File:** `src/lib/prisma.ts:8`
- **What:** `log: ["query"]` is set unconditionally, not just in development.
- **Why it matters:** In production, logging every SQL query to stdout impacts performance and could leak sensitive data in logs.

#### ERR-04 🟡 Medium — Silent catch in EmbedBackButton
- **File:** `src/components/embed-back-button.tsx:11`
- **What:** `catch (_) { }` — silently swallows cross-origin errors. While intentional for cross-origin detection, it catches all errors including unexpected ones.
- **Why it matters:** Debugging becomes harder if unexpected errors are silently swallowed.

---

### 3. API DESIGN

#### API-01 🟡 Medium — Only One API Route, No Pagination
- **File:** `src/app/api/lots/route.ts:8`
- **What:** `prisma.lot.findMany()` returns all lots with no pagination, filtering, or limit.
- **Why it matters:** If the dataset grows, this becomes a performance and memory issue. Currently small (3 seed records), but no guard against growth.

#### API-02 🟡 Medium — API Route Lacks Authentication
- **File:** `src/app/api/lots/route.ts`
- **What:** The GET `/api/lots` endpoint is completely public. Any client can fetch all lot data including prices.
- **Why it matters:** Depends on business requirements — if prices should be public this is fine, but the route has no rate limiting.

#### API-03 🟡 Medium — No Rate Limiting
- **Files:** `src/app/api/lots/route.ts`, `src/app/actions.ts`
- **What:** No rate limiting on the API endpoint or login action.
- **Why it matters:** The login endpoint is vulnerable to brute-force attacks (especially with the weak credentials in SEC-01).

#### API-04 🔵 Low — Revalidation Path for Dynamic Routes Uses Literal Brackets
- **File:** `src/app/actions.ts:27`
- **What:** `revalidatePath("/card/[slug]")` — this literally revalidates the path string `"/card/[slug]"`, not all dynamic card pages.
- **Why it matters:** After updating a lot, the individual lot card pages may serve stale cached data.

---

### 4. DATABASE

#### DB-01 🟡 Medium — Status Field is String Instead of Enum
- **File:** `prisma/schema.prisma:20`
- **What:** `status String @default("AVAILABLE")` with comment "SQLite doesn't support enums natively" — but the app now uses PostgreSQL, which does support enums.
- **Why it matters:** No database-level validation that status is one of AVAILABLE/RESERVED/SOLD. Any string can be stored.

#### DB-02 🟡 Medium — No Indexes Beyond Primary Key and Unique
- **File:** `prisma/schema.prisma`
- **What:** The `Lot` model only has `id` (PK) and `slug` (unique) indexes. No index on `status` or `number`.
- **Why it matters:** If filtering by status or sorting by number becomes common, queries will do full table scans. Minor with small data but becomes relevant at scale.

#### DB-03 🟡 Medium — Price is Decimal but Often Cast to Number
- **Files:** `src/app/admin/page.tsx:23`, `src/app/card/[slug]/page.tsx:62`, `src/components/lot-editor.tsx:99`, `src/components/lot-view.tsx:40`, `src/components/lot-table.tsx:66`
- **What:** Prisma's Decimal type is repeatedly cast to `Number()` in multiple places. This loses precision for very large numbers.
- **Why it matters:** Decimal was chosen for precision, but the repeated `Number()` casts negate this. Should either use Decimal consistently or switch to Float.

#### DB-04 🔵 Low — Seed Script Uses `as any` Type Cast
- **File:** `prisma/seed.ts:50`
- **What:** `status: lot.status as any` — bypasses TypeScript type checking.
- **Why it matters:** Minor; the seed would fail silently with an invalid status.

#### DB-05 🔵 Low — Seed Script Variable Name Mismatch
- **File:** `prisma/seed.ts:42`
- **What:** `const user = await prisma.lot.upsert(...)` — variable named `user` for a Lot entity.
- **Why it matters:** Confusing naming, likely copy-pasted from another project.

#### DB-06 🔵 Low — Legacy SQLite Database File in Repository
- **File:** `prisma/dev.db`
- **What:** A SQLite `dev.db` file exists but the app uses PostgreSQL.
- **Why it matters:** Confusing for developers, may contain stale data.

---

### 5. CODE QUALITY

#### CQ-01 🟡 Medium — Home Page is 689 Lines in a Single Component
- **File:** `src/app/page.tsx`
- **What:** The entire home page (hero, manifesto, counters, CTA, footer) is a single 689-line client component with multiple inline sub-components.
- **Why it matters:** Hard to maintain, test, or modify individual sections. Any change requires understanding the entire file.

#### CQ-02 🟡 Medium — Duplicated Status Color Definitions
- **Files:** `src/components/lot-editor.tsx:25-29`, `src/components/lot-table.tsx:24-28`
- **What:** The `statusColors` mapping is copy-pasted identically in two components.
- **Why it matters:** If a new status is added or colors change, both files must be updated in sync.

#### CQ-03 🟡 Medium — TypeScript `price: number | unknown` Type
- **Files:** `src/components/admin-dashboard.tsx:16`, `src/components/lot-editor.tsx:13`, `src/components/lot-table.tsx:13`
- **What:** `price: number | unknown` — the `| unknown` makes the entire type effectively `unknown`, defeating TypeScript's purpose.
- **Why it matters:** No type safety on price. `Number(lot.price)` is needed everywhere because TypeScript can't guarantee it's a number.

#### CQ-04 🔵 Low — Artificial Delay in Login UX
- **File:** `src/components/admin-login.tsx:17`
- **What:** `await new Promise(r => setTimeout(r, 800))` — artificial 800ms delay before login.
- **Why it matters:** Minor, but adds unnecessary latency. If intent is UX feedback, the spinner handles that.

#### CQ-05 🔵 Low — `window.location.reload()` After Login
- **File:** `src/components/admin-login.tsx:28`
- **What:** Uses `window.location.reload()` instead of router refresh.
- **Why it matters:** Full page reload is heavier than a router refresh. Works, but not idiomatic Next.js.

#### CQ-06 ⚪ Info — "Consultar Ahora" Buttons Do Nothing
- **Files:** `src/components/lot-card.tsx:132-133`, `src/components/lot-card.tsx:209-211`
- **What:** Two "Consultar Ahora" buttons have no `onClick` handler and no `href`.
- **Why it matters:** Users click a CTA button and nothing happens.

#### CQ-07 ⚪ Info — "Copiar Link" Button Does Nothing
- **File:** `src/components/lot-editor.tsx:81`
- **What:** "Copiar Link" label appears on hover but has no click handler.
- **Why it matters:** UI promises functionality that doesn't exist.

---

### 6. PERFORMANCE

#### PERF-01 🟡 Medium — Home Page is Fully Client-Rendered
- **File:** `src/app/page.tsx:1`
- **What:** `"use client"` at the top means the entire 689-line home page (including static content) is shipped as JavaScript and rendered client-side.
- **Why it matters:** Larger JS bundle, slower First Contentful Paint (FCP), worse SEO. Static sections (manifesto text, footer, counter labels) don't need client rendering.

#### PERF-02 🟡 Medium — Multiple Heavy Animation Libraries on Every Page Load
- **File:** `src/app/page.tsx:6`
- **What:** framer-motion is imported in every page/component that uses any animation. The home page alone has dozens of motion elements.
- **Why it matters:** framer-motion adds ~30-50KB to the JS bundle. CSS animations (already used in globals.css) could replace many of these.

#### PERF-03 🟡 Medium — VirtualTour iframe Loads on Home Page Immediately
- **File:** `src/app/page.tsx:254`
- **What:** `<VirtualTour />` loads in the hero section immediately on page load, loading the full Panoee tour as a background.
- **Why it matters:** The tour iframe loads heavy 3D panorama assets on every home page visit, even though users may not interact with it. This slows down initial page load significantly.

#### PERF-04 🔵 Low — No Image Optimization
- **File:** `prisma/schema.prisma:24`
- **What:** `imageUrl` field exists but no images are used yet. When they are, there's no next/image usage pattern established.
- **Why it matters:** When images are added, using raw `<img>` tags instead of Next.js `<Image>` loses automatic optimization.

---

### 7. DEPENDENCIES

#### DEP-01 🟡 Medium — `prisma` in `dependencies` Instead of `devDependencies`
- **File:** `package.json:16`
- **What:** `"prisma": "^5.22.0"` is listed in `dependencies`. The Prisma CLI is a dev tool; only `@prisma/client` is needed at runtime.
- **Why it matters:** Increases production deployment size unnecessarily.

#### DEP-02 🔵 Low — Wide Version Ranges with `^`
- **File:** `package.json`
- **What:** Most dependencies use `^` ranges (e.g., `"^5.22.0"`, `"^12.29.2"`).
- **Why it matters:** Without a lockfile check, different installs could get different versions. Minor since `package-lock.json` exists.

#### DEP-03 ⚪ Info — No Security Audit Automation
- **File:** N/A
- **What:** No `npm audit` in CI/CD or pre-commit hooks.
- **Why it matters:** Vulnerable dependencies could go unnoticed.

---

### 8. CONFIGURATION

#### CFG-01 🟠 High — Missing `.env.example` File
- **File:** N/A (missing)
- **What:** No `.env.example` to document required environment variables. New developers must guess what vars are needed.
- **Why it matters:** Deployment failures, misconfigured instances.

#### CFG-02 🟡 Medium — No Environment Variable Validation
- **Files:** `src/app/actions.ts:36-37`, `src/lib/prisma.ts`, `prisma/schema.prisma`
- **What:** Environment variables are used directly without checking they exist. `process.env.ADMIN_USER` could be `undefined`.
- **Why it matters:** See ERR-02 — undefined env vars could cause auth bypass or runtime crashes.

#### CFG-03 🔵 Low — Disabled Prisma Config File
- **File:** `prisma.config.ts.disabled`
- **What:** A disabled config file sits in the root.
- **Why it matters:** Confusing; should be deleted or documented.

---

### 9. TESTING

#### TEST-01 🟠 High — Zero Tests
- **Files:** N/A
- **What:** No test files, no test framework, no test scripts in `package.json`.
- **Why it matters:** No way to verify correctness before deployment. Any change could break production with no safety net.

---

### 10. DOCUMENTATION

#### DOC-01 🟡 Medium — Default/Minimal README
- **File:** `README.md`
- **What:** Likely default Next.js README. No project-specific documentation, no deployment instructions, no architecture overview.
- **Why it matters:** New developers have no guidance for setup, deployment, or architecture decisions.

#### DOC-02 🔵 Low — Stale Integration Docs
- **Files:** `integration_analysis.md`, `integration_guide.md`
- **What:** Integration documents exist but may not reflect current state.
- **Why it matters:** Misleading docs are worse than no docs.

---

## Summary by Severity

| Severity | Count | Items |
|----------|-------|-------|
| 🔴 Critical | 4 | SEC-01, SEC-02, SEC-03, SEC-04 |
| 🟠 High | 7 | SEC-05, SEC-06, SEC-07, SEC-08, ERR-01, ERR-02, CFG-01, TEST-01 |
| 🟡 Medium | 16 | SEC-09, SEC-10, ERR-03, ERR-04, API-01, API-02, API-03, API-04, DB-01, DB-02, DB-03, CQ-01, CQ-02, CQ-03, PERF-01, PERF-02, PERF-03, DEP-01, CFG-02, DOC-01 |
| 🔵 Low | 8 | DB-04, DB-05, DB-06, CQ-04, CQ-05, PERF-04, DEP-02, CFG-03, DOC-02 |
| ⚪ Info | 3 | CQ-06, CQ-07, DEP-03 |

**Total Issues Found: 38**
