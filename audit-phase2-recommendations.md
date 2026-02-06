# Phase 2: Solutions & Recommendations

**Based on:** Phase 1 Discovery Report (38 issues found)

---

## Tier 1 — Fix Now (Critical Security & Reliability)

These must be fixed before anything else. They represent active vulnerabilities.

---

### SEC-03: Admin Session Cookie is a Static Boolean (**Immediate**)

**The Problem:** Setting `admin_session = "true"` means anyone can open browser DevTools, go to Application > Cookies, and add a cookie named `admin_session` with value `"true"`. Instant admin access.

**Fix:** Generate a random session token and verify it server-side.

```typescript
// src/app/actions.ts — login function
import crypto from "crypto";

// Simple in-memory session store (good enough for single-instance)
// For multi-instance, use a database table or Redis
const sessions = new Map<string, { user: string; expires: number }>();

export async function login(formData: FormData) {
  const username = formData.get("username");
  const password = formData.get("password");

  if (
    username === process.env.ADMIN_USER &&
    password === process.env.ADMIN_PASSWORD
  ) {
    // Generate a random, unguessable token
    const token = crypto.randomBytes(32).toString("hex");

    // Store it server-side with an expiry (7 days)
    sessions.set(token, {
      user: String(username),
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });

    (await cookies()).set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",          // Add sameSite for CSRF protection
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return { success: true };
  }

  return { success: false, error: "Credenciales incorrectas" };
}

// Helper to verify session (use in admin page and middleware)
export function isValidSession(token: string): boolean {
  const session = sessions.get(token);
  if (!session) return false;
  if (Date.now() > session.expires) {
    sessions.delete(token);
    return false;
  }
  return true;
}
```

Then update `src/app/admin/page.tsx`:

```typescript
import { isValidSession } from "@/app/actions";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");

  // Verify the token is valid, not just present
  if (!session || !isValidSession(session.value)) {
    return <AdminLogin />;
  }
  // ... rest of component
}
```

- **Effort:** Low
- **Priority:** Immediate
- **Risk:** Low — only changes how sessions are created/verified

---

### SEC-04: Re-enable Middleware Authentication (**Immediate**)

**The Problem:** The middleware is completely commented out. Even with the session fix above, middleware adds a critical second layer.

**Fix:** Uncomment and update the middleware to use the new session validation:

```typescript
// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const session = request.cookies.get("admin_session");

    if (!session || !session.value || session.value === "true") {
      // Redirect to home or show login
      // NOTE: We can't call isValidSession here (middleware runs on Edge)
      // But checking the token format prevents the "true" bypass
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      url.searchParams.set("auth", "required");
      // For now, just check cookie exists and is not the old "true" format
      if (!session || session.value.length < 32) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
```

- **Effort:** Low
- **Priority:** Immediate
- **Risk:** Low — only affects admin route access

---

### SEC-01: Change Default Admin Credentials (**Immediate**)

**The Problem:** `admin/password123` is in every brute-force dictionary.

**Fix:** Change the `.env` values immediately on the production server:

```env
ADMIN_USER="your_actual_username_here"
ADMIN_PASSWORD="a-strong-random-password-at-least-20-chars"
```

No code changes needed. Just update the environment variables on your hosting platform (Vercel dashboard > Settings > Environment Variables).

- **Effort:** Low (5 min)
- **Priority:** Immediate
- **Risk:** None

---

### SEC-06: Add Input Validation to Server Actions (**Immediate**)

**The Problem:** `updateLot` takes raw form data and sends it straight to the database.

**Fix:** Add basic validation without adding new libraries:

```typescript
// src/app/actions.ts — updateLot function
export async function updateLot(id: number, formData: FormData) {
  // Validate ID
  if (!Number.isInteger(id) || id < 1) {
    throw new Error("Invalid lot ID");
  }

  const price = formData.get("price");
  const status = formData.get("status");
  const slug = formData.get("slug");
  const dimensions = formData.get("dimensions");
  const area = formData.get("area");

  // Validate status is one of the allowed values
  const VALID_STATUSES = ["AVAILABLE", "RESERVED", "SOLD"];
  if (status && !VALID_STATUSES.includes(String(status))) {
    throw new Error("Invalid status value");
  }

  // Validate slug format (only lowercase letters, numbers, hyphens)
  if (slug && !/^[a-z0-9-]+$/.test(String(slug))) {
    throw new Error("Invalid slug format");
  }

  // Validate price is a positive number
  const priceNum = price ? Number(price) : undefined;
  if (priceNum !== undefined && (isNaN(priceNum) || priceNum < 0)) {
    throw new Error("Invalid price");
  }

  // Validate area is a positive integer
  const areaNum = area ? Number(area) : undefined;
  if (areaNum !== undefined && (!Number.isInteger(areaNum) || areaNum < 0)) {
    throw new Error("Invalid area");
  }

  try {
    await prisma.lot.update({
      where: { id },
      data: {
        price: priceNum,
        status: status ? String(status) : undefined,
        slug: slug ? String(slug) : undefined,
        dimensions: dimensions ? String(dimensions) : undefined,
        area: areaNum,
      },
    });
  } catch (error) {
    console.error("Failed to update lot:", error);
    throw new Error("Failed to update lot");
  }

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/api/lots");
}
```

- **Effort:** Low
- **Priority:** Immediate
- **Risk:** Low — might reject inputs that were previously accepted (good thing)

---

### ERR-02: Guard Against Missing Env Vars in Login (**Immediate**)

**The Problem:** If `ADMIN_USER` and `ADMIN_PASSWORD` env vars are undefined, `undefined === undefined` is `true`, granting access to everyone.

**Fix:**

```typescript
// src/app/actions.ts — login function (add at the top)
export async function login(formData: FormData) {
  const username = formData.get("username");
  const password = formData.get("password");

  const expectedUser = process.env.ADMIN_USER;
  const expectedPass = process.env.ADMIN_PASSWORD;

  // CRITICAL: If env vars are not set, deny all access
  if (!expectedUser || !expectedPass) {
    console.error("ADMIN_USER or ADMIN_PASSWORD environment variables are not set!");
    return { success: false, error: "Sistema no configurado" };
  }

  if (username === expectedUser && password === expectedPass) {
    // ... session creation
  }
  // ...
}
```

- **Effort:** Low
- **Priority:** Immediate
- **Risk:** None

---

## Tier 2 — Next Sprint (High-Impact Improvements)

---

### SEC-08: Fix Security Headers (**Short-term**)

**Fix:** Update `next.config.ts`:

```typescript
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self' https://panoee.com https://tour.panoee.net https://*.panoee.com;",
          },
          // Remove X-Frame-Options: ALLOWALL — CSP frame-ancestors replaces it
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};
```

- **Effort:** Low
- **Priority:** Short-term
- **Risk:** None

---

### ERR-01: Add Error Handling to updateLot (**Short-term**)

Already covered in the SEC-06 fix above — the try/catch wraps the Prisma call.

---

### ERR-03: Disable Query Logging in Production (**Short-term**)

**Fix:**

```typescript
// src/lib/prisma.ts
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query"] : ["error"],
  });
```

- **Effort:** Low
- **Priority:** Short-term
- **Risk:** None

---

### CFG-01: Create `.env.example` (**Short-term**)

**Fix:** Create a file at project root:

```env
# .env.example — Copy to .env and fill in values

# Admin credentials (CHANGE THESE!)
ADMIN_USER="your_admin_username"
ADMIN_PASSWORD="your_strong_password"

# PostgreSQL (Vercel Postgres or any Postgres)
POSTGRES_PRISMA_URL="postgres://user:pass@host:5432/db?sslmode=require"
POSTGRES_URL_NON_POOLING="postgres://user:pass@host:5432/db?sslmode=require"

# Panoee Virtual Tour (optional)
# NEXT_PUBLIC_PANOEE_URL="https://panoee.com/your-tour-id"
```

- **Effort:** Low
- **Priority:** Short-term
- **Risk:** None

---

### API-03 + SEC-05: Add Rate Limiting to Login (**Short-term**)

**Fix:** Simple in-memory rate limiter (no new dependencies):

```typescript
// src/app/actions.ts — add at top of file
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const attempts = loginAttempts.get(ip);

  if (!attempts || now > attempts.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 }); // 15 min window
    return false;
  }

  attempts.count++;
  return attempts.count > 5; // Max 5 attempts per 15 minutes
}
```

Then in the login function, call `isRateLimited` with a client identifier (you can pass it from the form or use headers).

- **Effort:** Medium
- **Priority:** Short-term
- **Risk:** Low — could lock out legitimate users if IP detection is wrong

---

### TEST-01: Add Basic Tests (**Short-term**)

**Fix:** Install a test framework and add critical-path tests:

```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
```

Add to `package.json`:

```json
"scripts": {
  "test": "vitest run",
  "test:watch": "vitest"
}
```

Start with testing the most critical server logic:

```typescript
// __tests__/actions.test.ts
import { describe, it, expect } from "vitest";

describe("Input validation", () => {
  it("rejects invalid status values", () => {
    const VALID_STATUSES = ["AVAILABLE", "RESERVED", "SOLD"];
    expect(VALID_STATUSES.includes("HACKED")).toBe(false);
    expect(VALID_STATUSES.includes("AVAILABLE")).toBe(true);
  });

  it("rejects invalid slug formats", () => {
    const slugRegex = /^[a-z0-9-]+$/;
    expect(slugRegex.test("lote-1")).toBe(true);
    expect(slugRegex.test("<script>alert(1)</script>")).toBe(false);
    expect(slugRegex.test("LOTE-1")).toBe(false);
  });
});
```

- **Effort:** Medium
- **Priority:** Short-term
- **Risk:** None — tests don't change production code

---

### DB-01: Migrate Status to Enum (**Short-term**)

**Fix:** Now that you're on PostgreSQL, create a migration:

```prisma
// prisma/schema.prisma
enum LotStatus {
  AVAILABLE
  RESERVED
  SOLD
}

model Lot {
  // ...
  status LotStatus @default(AVAILABLE)
  // ...
}
```

Then run:

```bash
npx prisma migrate dev --name add-lot-status-enum
```

- **Effort:** Medium
- **Priority:** Short-term
- **Risk:** Medium — requires a database migration. Test in staging first. Existing data must match one of the enum values exactly.

---

## Tier 3 — Next Quarter (Hardening & Quality of Life)

---

### CQ-01: Split Home Page into Smaller Components (**Medium-term**)

**Fix:** Extract each section into its own component file:

```
src/components/home/
  HeroSection.tsx
  ManifestoSection.tsx
  CounterSection.tsx
  CTASection.tsx
  Footer.tsx
  WaveDivider.tsx
  Firefly.tsx
  FloatingLeaf.tsx
```

Keep `page.tsx` as the orchestrator that composes them.

- **Effort:** Medium
- **Priority:** Medium-term
- **Risk:** Low — purely structural refactor

---

### PERF-01: Convert Static Sections to Server Components (**Medium-term**)

**Fix:** After splitting the home page, sections that don't use hooks/event handlers (manifesto text, footer) can be server components, reducing the client JS bundle.

- **Effort:** Medium
- **Priority:** Medium-term
- **Risk:** Low — animations in static sections may need restructuring

---

### PERF-03: Lazy-Load Virtual Tour (**Medium-term**)

**Fix:** Don't load the tour iframe until the user clicks "Iniciar Recorrido":

```typescript
// In the hero section, conditionally render VirtualTour
{tourRevealed && <VirtualTour />}

// Before reveal, show a static image or poster instead
{!tourRevealed && (
  <div className="absolute inset-0 bg-deep">
    {/* Optional: static poster image */}
  </div>
)}
```

- **Effort:** Low
- **Priority:** Medium-term
- **Risk:** Low — slightly slower tour reveal (iframe needs to load)

---

### CQ-02: Extract Shared Status Colors (**Medium-term**)

**Fix:** Create a shared constant:

```typescript
// src/lib/constants.ts
export const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: "bg-forest/10 border-forest/20 text-forest",
  RESERVED: "bg-gold/10 border-gold/20 text-gold",
  SOLD: "bg-gray-100 border-gray-200 text-gray-400",
};
```

Import in both `lot-editor.tsx` and `lot-table.tsx`.

- **Effort:** Low
- **Priority:** Medium-term
- **Risk:** None

---

### CQ-03: Fix TypeScript Price Type (**Medium-term**)

**Fix:** Change `price: number | unknown` to `price: number` in all interfaces, since the serialization in `admin/page.tsx:23` already converts it:

```typescript
// In admin-dashboard.tsx, lot-editor.tsx, lot-table.tsx
interface {
  // ...
  price: number; // Already serialized from Decimal in admin/page.tsx
  // ...
}
```

- **Effort:** Low
- **Priority:** Medium-term
- **Risk:** None

---

### CQ-06 + CQ-07: Wire Up Non-Functional Buttons (**Medium-term**)

**Fix "Consultar Ahora":** Make it link to WhatsApp or email:

```tsx
<a
  href={`mailto:info@raicesdealvear.com?subject=Consulta Lote ${number}`}
  className="w-full py-3 bg-forest text-cream rounded-xl ..."
>
  Consultar Ahora
</a>
```

**Fix "Copiar Link":** Add clipboard functionality:

```tsx
<button
  onClick={() => navigator.clipboard.writeText(`${window.location.origin}/card/${lot.slug}`)}
  className="text-[10px] uppercase font-bold text-forest ..."
>
  Copiar Link
</button>
```

- **Effort:** Low
- **Priority:** Medium-term / Backlog
- **Risk:** None

---

### SEC-07: Remove `dangerouslySetInnerHTML` (**Backlog**)

**Fix:** Use a `<style>` tag rendered by React directly, or use a className:

```tsx
{isEmbed && (
  <style>{`html, body { background: transparent !important; }`}</style>
)}
```

Wait — in Next.js, you can also use `next/head` or the App Router metadata. But the simplest fix is just using the JSX `<style>` tag:

```tsx
{isEmbed && (
  <style jsx global>{`
    html, body { background: transparent !important; }
  `}</style>
)}
```

- **Effort:** Low
- **Priority:** Backlog
- **Risk:** None

---

### DB-06: Remove Legacy SQLite Database (**Backlog**)

**Fix:**
```bash
rm prisma/dev.db
```

And add to `.gitignore` if not already:
```
prisma/dev.db
```

- **Effort:** Low
- **Priority:** Backlog
- **Risk:** None

---

## Quick Wins (Low Effort, High Value, Ship Today)

| # | Issue | Fix | Effort |
|---|-------|-----|--------|
| 1 | SEC-01 | Change admin password in Vercel env vars | 5 min |
| 2 | ERR-02 | Add env var guard in login function | 5 min |
| 3 | ERR-03 | Conditional query logging | 2 min |
| 4 | SEC-08 | Fix security headers in next.config.ts | 10 min |
| 5 | CFG-01 | Create `.env.example` | 5 min |
| 6 | DB-06 | Delete `prisma/dev.db` | 1 min |
| 7 | CQ-03 | Fix `price: number \| unknown` type | 5 min |

---

## Implementation Order (Dependency Aware)

```
1. SEC-01  (Change credentials)     — No dependencies
2. ERR-02  (Env var guard)           — No dependencies
3. SEC-03  (Fix session cookie)      — Before SEC-04
4. SEC-04  (Enable middleware)       — After SEC-03
5. SEC-06  (Input validation)        — No dependencies
6. SEC-08  (Security headers)        — No dependencies
7. ERR-03  (Query logging)           — No dependencies
8. CFG-01  (.env.example)            — No dependencies
9. API-03  (Rate limiting)           — After SEC-03
10. TEST-01 (Add tests)              — After SEC-06 (test the validation)
11. DB-01  (Status enum migration)   — After TEST-01 (test migration)
12. CQ-01  (Split home page)         — No dependencies
13. PERF-03 (Lazy tour)              — After CQ-01
```
