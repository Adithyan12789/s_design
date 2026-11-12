# Admin Panel 6-Digit Secret Code Authentication

The `/admin` CMS dashboard is protected exclusively by a server-side 6-digit numeric access code (`ADMIN_ACCESS_CODE`). Email/password login and public registration are disabled.

## Local Configuration (`.env.local`)

1. Copy `.env.example` to `.env.local` (never commit `.env.local` to Git).
2. Set your 6-digit secret code:

```env
ADMIN_ACCESS_CODE=YOUR_SIX_DIGIT_SECRET
ADMIN_SESSION_SECRET=a-long-random-string-for-cookie-signing
```

3. Restart `npm run dev` or rebuild the production server.

## Vercel Production Configuration

1. Open your Vercel Dashboard &rarr; **Project Settings &rarr; Environment Variables**.
2. Add `ADMIN_ACCESS_CODE` with your 6-digit numeric secret (mark it for Production / Preview as needed).
3. Add `ADMIN_SESSION_SECRET` with a random 32+ character secret.
4. Redeploy the project so the serverless functions and proxy middleware pick up the environment variables.

## Changing / Rotating the Secret Code Later

1. Update `ADMIN_ACCESS_CODE` in Vercel Environment Variables (or `.env.local`).
2. To immediately sign out any active browser sessions, also rotate `ADMIN_SESSION_SECRET`.
3. Redeploy on Vercel (or restart your local server).

## Security Controls

- **Constant-Time Verification**: Submitted codes are hashed with SHA-256 and compared in constant time exclusively on the server.
- **No Secret Exposure**: `ADMIN_ACCESS_CODE` is never sent to the browser, bundled into client JavaScript, stored in `localStorage`/`sessionStorage`, logged, or saved in the database.
- **Rate Limiting**: Up to `ADMIN_MAX_ATTEMPTS` (default `5`) failed attempts trigger a temporary `ADMIN_LOCKOUT_MINUTES` (default `15` minutes) lockout.
- **HTTP-Only Signed Session Cookie**: Successful login issues an HMAC-SHA256 signed `sd_admin_session` cookie (`HttpOnly`, `SameSite=Lax`, `Secure` in production) with `ADMIN_SESSION_TTL_HOURS` (default `12` hours) expiration.
- **Fail-Closed**: If `ADMIN_ACCESS_CODE` is missing or not 6 digits, all `/admin` and `/api/admin/*` endpoints deny access.

