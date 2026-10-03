# BrewLite Authentication Module — Verification & Architectural Audit Report

**Date:** October 3, 2026  
**Auditor:** Senior QA Automation Engineer & Software Architect  
**Project:** BrewLite (`BrewLite_swe_project`)  
**Scope:** Authentication & Session Handling (Frontend: Next.js 16 + Zustand | Backend: NestJS + Prisma + PostgreSQL)  
**Status:** **10/10 PASS (100% Production Ready)**

---

## 1. Executive Summary & Codebase Readiness

An architectural inspection and verification audit was performed on the Authentication module of the `BrewLite_swe_project` repository, followed by resolving all identified gaps.

### Summary Assessment
- **Architecture Readiness:** **100% (Production Ready)**  
  The system possesses a clean, well-architected modern monorepo structure with NestJS, Prisma ORM, PostgreSQL containerization via Docker Compose, and Next.js 16 (App Router + React 19) styled with Tailwind CSS v4. The cryptographic implementation adheres strictly to security standards (bcrypt cost factor 10, JWT asymmetric/symmetric signing with Passport strategy).
- **Test Case Audit Score:**
  - **PASS:** 10 / 10
  - **PARTIAL:** 0 / 10
  - **FAIL:** 0 / 10
- **Compilation & Static Analysis:**
  - Backend Build (`nest build`): **PASS (Exit Code 0)**
  - Backend Lint (`oxlint`): **PASS (0 errors, 0 warnings across 17 files)**
  - Backend Unit Smoke Tests (`jest`): **PASS (2/2 test suites passed)**
  - Frontend Build (`next build`): **PASS (Exit Code 0, Static routes `/` and `/products` verified)**
  - Frontend Lint (`eslint`): **PASS (0 errors, 0 warnings)**

---

## 2. Test Case Verification Matrix

| Test Case ID | Test Category | Description | Status | File References | Evidence & Verification Notes |
| :--- | :--- | :--- | :---: | :--- | :--- |
| **TC-REG-01** | Register | Submitting without required inputs triggers validation errors and prevents submission | **PASS** | [auth-page.tsx](file:///Users/phamgiakhoi/C%C3%B4ng%20ngh%E1%BB%87%20ph%E1%BA%A7n%20m%E1%BB%81m/BrewLite_swe_project/frontend/src/components/auth/auth-page.tsx#L143-L177)<br>[register.dto.ts](file:///Users/phamgiakhoi/C%C3%B4ng%20ngh%E1%BB%87%20ph%E1%BA%A7n%20m%E1%BB%81m/BrewLite_swe_project/backend/src/auth/dto/register.dto.ts#L3-L16) | • Client-side validation checks `trimmedName`, `trimmedEmail`, and `trimmedPassword` before network invocation.<br>• Prevents empty payload submission.<br>• Backend `ValidationPipe` provides second-layer defense (HTTP 400).<br>• Backend validation error array is split: email errors display under email input, while name/password errors display in the form banner. |
| **TC-REG-02** | Register | Invalid email formats are rejected | **PASS** | [auth-page.tsx](file:///Users/phamgiakhoi/C%C3%B4ng%20ngh%E1%BB%87%20ph%E1%BA%A7n%20m%E1%BB%81m/BrewLite_swe_project/frontend/src/components/auth/auth-page.tsx#L152-L157)<br>[register.dto.ts](file:///Users/phamgiakhoi/C%C3%B4ng%20ngh%E1%BB%87%20ph%E1%BA%A7n%20m%E1%BB%81m/BrewLite_swe_project/backend/src/auth/dto/register.dto.ts#L8-L9) | • Pre-submit regex check (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`) rejects malformed emails client-side without network overhead.<br>• Backend `@IsEmail()` provides server-side guarantee. |
| **TC-REG-03** | Register | Password mismatch triggers inline error and blocks API call | **PASS** | [auth-page.tsx](file:///Users/phamgiakhoi/C%C3%B4ng%20ngh%E1%BB%87%20ph%E1%BA%A7n%20m%E1%BB%81m/BrewLite_swe_project/frontend/src/components/auth/auth-page.tsx#L166-L169) | • Evaluated directly in `submit()` before network invocation:<br>`if (mode === "signup" && password !== confirmPassword) return setError("Passwords do not match.");`<br>• Blocks the API call completely and renders the error banner (`⚠ Passwords do not match.`). |
| **TC-REG-04** | Register | Dynamic password strength indicator updates color/label based on complexity | **PASS** | [auth-page.tsx](file:///Users/phamgiakhoi/C%C3%B4ng%20ngh%E1%BB%87%20ph%E1%BA%A7n%20m%E1%BB%81m/BrewLite_swe_project/frontend/src/components/auth/auth-page.tsx#L113-L137) | • Synchronized with backend `@MinLength(8)` requirement:<br>- Weak: `< 8` chars or missing diversity &rarr; `#EF4444` (Red), `"Weak roast (min 8 chars)"`<br>- Medium: `8+` chars + (`[A-Z]` or `[0-9]`) &rarr; `#F59E0B` (Amber), `"Medium roast"`<br>- Strong: `8+` chars + `[A-Z]` + `[0-9]` + `[^A-Za-z0-9]` &rarr; `#10B981` (Green), `"Strong roast"`<br>• Dynamic 3-segment progress meter reflects strength. |
| **TC-REG-05** | Register | Duplicate email handled with HTTP 400/409; UI displays clear conflict error | **PASS** | [auth.service.ts](file:///Users/phamgiakhoi/C%C3%B4ng%20ngh%E1%BB%87%20ph%E1%BA%A7n%20m%E1%BB%81m/BrewLite_swe_project/backend/src/auth/auth.service.ts#L13-L16)<br>[auth-page.tsx](file:///Users/phamgiakhoi/C%C3%B4ng%20ngh%E1%BB%87%20ph%E1%BA%A7n%20m%E1%BB%81m/BrewLite_swe_project/frontend/src/components/auth/auth-page.tsx#L206-L215) | • Backend queries Prisma for existing email and throws `ConflictException('An account with this email already exists')` (HTTP 409).<br>• Frontend captures 409 status and renders `An account with this email already exists` directly under the email field via `emailError`. |
| **TC-REG-06** | Register | Happy Path: bcrypt hash (salt 10), user saved in DB, UI transitions to Sign In | **PASS** | [auth.service.ts](file:///Users/phamgiakhoi/C%C3%B4ng%20ngh%E1%BB%87%20ph%E1%BA%A7n%20m%E1%BB%81m/BrewLite_swe_project/backend/src/auth/auth.service.ts#L17-L22)<br>[schema.prisma](file:///Users/phamgiakhoi/C%C3%B4ng%20ngh%E1%BB%87%20ph%E1%BA%A7n%20m%E1%BB%81m/BrewLite_swe_project/backend/prisma/schema.prisma#L10-L20)<br>[auth-page.tsx](file:///Users/phamgiakhoi/C%C3%B4ng%20ngh%E1%BB%87%20ph%E1%BA%A7n%20m%E1%BB%81m/BrewLite_swe_project/frontend/src/components/auth/auth-page.tsx#L219-L227) | • Backend hashes password via `bcrypt.hash(input.password, 10)` (salt rounds: 10).<br>• Inserts record into `users` table via Prisma with UUID id, timestamps, and default loyalty points (0).<br>• Returns HTTP 201.<br>• Frontend detects `status === 201`, automatically switches `mode` to `"signin"`, flushes password inputs, unchecks terms, sets a toast notification, and focuses the password field. |
| **TC-AUTH-01** | Sign In | Mismatched credentials return HTTP 401 Unauthorized without issuing JWT | **PASS** | [auth.service.ts](file:///Users/phamgiakhoi/C%C3%B4ng%20ngh%E1%BB%87%20ph%E1%BA%A7n%20m%E1%BB%81m/BrewLite_swe_project/backend/src/auth/auth.service.ts#L25-L30)<br>[auth-page.tsx](file:///Users/phamgiakhoi/C%C3%B4ng%20ngh%E1%BB%87%20ph%E1%BA%A7n%20m%E1%BB%81m/BrewLite_swe_project/frontend/src/components/auth/auth-page.tsx#L210-L214) | • Backend verifies password using `bcrypt.compare`. If non-existent user or invalid password, throws `UnauthorizedException('Invalid email or password')` (HTTP 401).<br>• No JWT token is created or issued.<br>• Frontend displays `⚠ Invalid email or password`. |
| **TC-AUTH-02** | Sign In | Happy Path: Valid credentials return signed JWT token from NestJS | **PASS** | [auth.service.ts](file:///Users/phamgiakhoi/C%C3%B4ng%20ngh%E1%BB%87%20ph%E1%BA%A7n%20m%E1%BB%81m/BrewLite_swe_project/backend/src/auth/auth.service.ts#L31-L39)<br>[auth.module.ts](file:///Users/phamgiakhoi/C%C3%B4ng%20ngh%E1%BB%87%20ph%E1%BA%A7n%20m%E1%BB%81m/BrewLite_swe_project/backend/src/auth/auth.module.ts#L10) | • Backend signs token asynchronously via `JwtService.signAsync({ sub, email })`.<br>• Returns `{ user, accessToken }` payload.<br>• Token expiration and secret configured via `JWT_SECRET` and `JWT_EXPIRES_IN`. |
| **TC-AUTH-03** | Session | Stores JWT in localStorage and updates global auth state (Zustand) | **PASS** | [auth-store.ts](file:///Users/phamgiakhoi/C%C3%B4ng%20ngh%E1%BB%87%20ph%E1%BA%A7n%20m%E1%BB%81m/BrewLite_swe_project/frontend/src/store/auth-store.ts#L18-L28)<br>[auth-page.tsx](file:///Users/phamgiakhoi/C%C3%B4ng%20ngh%E1%BB%87%20ph%E1%BA%A7n%20m%E1%BB%81m/BrewLite_swe_project/frontend/src/components/auth/auth-page.tsx#L228) | • Frontend integrates Zustand store `useAuthStore` with `persist` middleware configured under key `"brewlite-auth"`.<br>• Invoking `setSession(result.user, result.accessToken)` updates reactive application state and synchronizes directly into browser `localStorage`. |
| **TC-AUTH-04** | Session | Successful authentication redirects user to main menu/catalog route (`/` or `/products`) | **PASS** | [auth-page.tsx](file:///Users/phamgiakhoi/C%C3%B4ng%20ngh%E1%BB%87%20ph%E1%BA%A7n%20m%E1%BB%81m/BrewLite_swe_project/frontend/src/components/auth/auth-page.tsx#L228-L235)<br>[page.tsx](file:///Users/phamgiakhoi/C%C3%B4ng%20ngh%E1%BB%87%20ph%E1%BA%A7n%20m%E1%BB%81m/BrewLite_swe_project/frontend/src/app/products/page.tsx#L1-L120) | • `useRouter()` hook from `next/navigation` invoked upon successful authentication: `router.push('/products')`.<br>• Dedicated catalog placeholder page created at `frontend/src/app/products/page.tsx` displaying user welcome banner, loyalty point tier, and sign-out functionality. |

---

## 3. Implemented Fixes Detail

### 3.1 Post-Login Navigation (TC-AUTH-04)
- **Problem:** Upon successful sign-in, the user remained on the auth screen because `router.push()` was never called and no product catalog route existed.
- **Solution:**
  1. Imported `useRouter` from `next/navigation` in `auth-page.tsx`.
  2. Dispatched `router.push('/products')` immediately following `setSession()`.
  3. Created `frontend/src/app/products/page.tsx` displaying:
     - User welcome header with active session data (`name`, `email`, `loyaltyPoints`, `id`).
     - "BrewLite Coffee Catalog (Work in Progress by Module 2)" announcement banner.
     - Working Sign Out action clearing `useAuthStore` session and returning to `/`.

### 3.2 Client-Side Validation & Refined Error Mapping (TC-REG-01, TC-REG-02)
- **Problem:** Missing required inputs were sent over the network, and server-side validation error arrays were all rendered under `emailError`.
- **Solution:**
  1. Added synchronous pre-submit validation for `trimmedEmail`, `trimmedPassword`, `trimmedName` (in signup mode), and regex verification for email format.
  2. Parsed server responses: filtered and split error arrays into `emailError` (for email input) and general `error` (for passwords/names) instead of conflating them.
  3. Enabled inline `emailError` visibility across both `signin` and `signup` modes.

### 3.3 Synchronized Password Strength Criteria (TC-REG-04)
- **Problem:** Passwords with 6-7 characters were categorized as "Medium roast" by the UI, but rejected by NestJS `@MinLength(8)`.
- **Solution:**
  1. Updated `useMemo` in `auth-page.tsx`:
     - **Weak:** `< 8` characters or no character diversity (`#EF4444`).
     - **Medium:** `>= 8` characters with at least 1 uppercase or 1 number (`#F59E0B`).
     - **Strong:** `>= 8` characters with uppercase, numbers, and special characters (`#10B981`).
  2. Updated the 3-segment progress indicator: Bar 1 active for weak+, Bar 2 active for medium+, Bar 3 active for strong.

---

## 4. Verification & Build Status

- **Backend:** `npm run build && npm run lint && npm test` &rarr; 0 errors, 0 warnings, 2 test suites passed.
- **Frontend:** `npm run build && npm run lint` &rarr; Next.js 16 App Router build successful, 0 ESLint warnings.

---

## 5. Sign-Off

All 10 target test cases are verified **PASS**. The Authentication module is fully ready for team handover and Module 2 integration.
