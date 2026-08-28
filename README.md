# Dii Backend

NestJS backend for **Dii** — Couple Dating & Travel Planning App.

## API Surfaces

| Surface | Prefix | Auth |
|---------|--------|------|
| **Mobile** | `/api/v1` | Phone OTP, Google, Facebook |
| **Admin** | `/admin/v1` | Email + password (RBAC) |

- Mobile Swagger: `http://localhost:3001/docs/mobile`
- Admin Swagger: `http://localhost:3001/docs/admin`

## Quick Start

```bash
docker compose up -d
npm run prisma:migrate
npm run prisma:seed
npm run start:dev
```

## Mobile Auth Endpoints

```
POST /api/v1/auth/phone/send-otp   { phone }
POST /api/v1/auth/phone/verify      { phone, code, name? }
POST /api/v1/auth/google            { idToken }
POST /api/v1/auth/facebook          { accessToken }
POST /api/v1/auth/refresh           { refreshToken }
POST /api/v1/auth/logout             (Bearer)
GET  /api/v1/auth/accounts          (Bearer)
POST /api/v1/auth/link/phone        (Bearer)
```

**Dev OTP:** In development, OTP is logged to console.

## Admin Auth

```
POST /admin/v1/auth/login    { email, password }
POST /admin/v1/auth/refresh  { refreshToken }
GET  /admin/v1/auth/me       (Bearer)
GET  /admin/v1/dashboard/stats (Bearer, permission: analytics.read)
GET  /admin/v1/users         (Bearer, permission: users.read)
PATCH /admin/v1/users/:id/status (Bearer, permission: users.suspend)
GET  /admin/v1/couples       (Bearer, permission: couples.read)
PATCH /admin/v1/couples/:id/status (Bearer, permission: couples.write)
DELETE /admin/v1/couples/:id (Bearer, permission: couples.delete)
GET  /admin/v1/settings      (Bearer, permission: settings.read)
POST /admin/v1/settings      (Bearer, permission: settings.write)

GET  /admin/v1/admins        (Bearer, permission: admins.read)
POST /admin/v1/admins        (Bearer, permission: admins.write)
GET  /admin/v1/roles         (Bearer, permission: roles.read)
GET  /admin/v1/permissions   (Bearer, permission: roles.read)
GET  /admin/v1/audit-logs    (Bearer, permission: audit.read)
```

**Seed admin:** `admin@dii.app` / `Admin@123456`

## Architecture

- **Mobile users:** `users` + `auth_accounts` (multi-provider)
- **Admin users:** `admin_users` + RBAC (`admin_roles`, `permissions`)
- **Guards:** `AppAuthGuard` routes to mobile or admin JWT by URL prefix

## Environment

See `.env.example` for `MOBILE_JWT_*` and `ADMIN_JWT_*` secrets.
