# TaxFlow Platform

**Production-ready, multi-tenant SaaS platform for tax professionals** with lifecycle management, Stripe billing, file management, and chaos-proof tenant isolation.

### 🌐 Live Demo: [taxflow-platform.vercel.app](https://taxflow-platform.vercel.app)

### 🧪 Quick Test Page: [taxflow-platform.vercel.app/quick-test](https://taxflow-platform.vercel.app/quick-test)

> [!IMPORTANT]
> **Client Testing**: Use the Quick Test Page above for the easiest login experience. Click "🚀 Test Full Login Flow" then "🎯 Navigate to Portal" to access the admin dashboard.

> [!TIP]
> **Zero-Config Demo Mode**: This application features a "Demo Mode" fallback. If you deploy it to Vercel without a database or API keys, the UI will still work perfectly using the demo credentials below.

## 🎯 Quick Start for Testing

### Option 1: Quick Test Page (Recommended)
1. Visit: [taxflow-platform.vercel.app/quick-test](https://taxflow-platform.vercel.app/quick-test)
2. Click **"🚀 Test Full Login Flow"**
3. Click **"🎯 Navigate to Portal"**
4. You're now in the admin dashboard!

### Option 2: Traditional Login
1. Visit: [taxflow-platform.vercel.app/login](https://taxflow-platform.vercel.app/login)
2. Use demo credentials (see below)
3. Click **"Log In to Dashboard"**

### Demo Credentials
- **SaaS Owner**: `owner@taxflow.com` / `admin123` → Admin Portal
- **Tax Professional**: `pro@taxflow.com` / `pro123` → Pro Portal
- **Client**: `client@taxflow.com` / `client123` → Client Portal

## 🚀 Features

### MVP (Phases 1-6)
- ✅ **Multi-tenant Architecture** - Complete tenant isolation with row-level security
- ✅ **Lifecycle Management** - Automated state machine (trial → active → grace → suspended → archived)
- ✅ **Stripe Billing** - Tiered subscriptions with webhook automation
- ✅ **File Management** - AWS S3 integration with retention policies
- ✅ **Authentication** - JWT + refresh tokens + optional MFA
- ✅ **RBAC** - Role-based access control (Client, Tax Pro, Admin, SaaS Owner)
- ✅ **Automated Retention** - Cron jobs for grace period and file archival
- ✅ **Audit Logging** - Complete trail of all actions

### Coming Soon (Phases 7-14)
- 🔜 Admin dashboards with metrics (MRR, churn, usage)
- 🔜 White-label branding (logos, colors, custom domains)
- 🔜 Growth automation (onboarding, email drips, referrals)
- 🔜 Health monitoring and alerting

## 📁 Project Structure

```
/apps
  /client          → Client portal (file upload/download)
  /tax-pro         → Tax professional portal (client management)
  /saas-owner      → SaaS owner portal (tenant management)

/backend
  /api             → Next.js API routes
  /cron            → Automated jobs (grace period, retention)
  /services        → Business logic (lifecycle, billing, files)
  /utils           → Utilities (RBAC, JWT, validators, logger)
  /config          → Configuration (DB, Stripe, S3, SendGrid)
  /middleware      → Authentication middleware

/prisma            → Database schema and migrations
/scripts           → Database seeding and migration scripts
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes + AWS Lambda (cron jobs)
- **Database**: PostgreSQL (AWS RDS)
- **File Storage**: AWS S3
- **Payments**: Stripe (tiered subscriptions)
- **Email**: SendGrid
- **Auth**: JWT + refresh tokens + optional MFA
- **Deployment**: Vercel (frontend) + AWS (backend services)

## 📦 Installation

### Prerequisites
- Node.js 18+
- PostgreSQL database
- AWS account (S3, RDS, Lambda)
- Stripe account (test mode)
- SendGrid account

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/your-username/taxflow-platform.git
cd taxflow-platform
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your actual credentials
```

4. **Run database migrations**
```bash
npm run db:generate
npm run db:migrate
```

5. **Seed the database**
```bash
npm run db:seed
```

6. **Start development server**
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Schema

### Core Models
- **Tenant** - Multi-tenant isolation with lifecycle states
- **User** - RBAC with JWT authentication
- **File** - S3 file management with retention policies
- **AuditLog** - Complete audit trail

### Lifecycle States
```
TRIAL → ACTIVE → GRACE_PERIOD → SUSPENDED → ARCHIVED
```

## 🔐 Authentication

### Register
```bash
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "tenantId": "tenant-id"
}
```

### Login
```bash
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "mfaToken": "123456" // Optional if MFA enabled
}
```

### Refresh Token
```bash
POST /api/auth/refresh
{
  "refreshToken": "your-refresh-token"
}
```

## 📂 File Management

### Upload File
```bash
POST /api/files/upload
Content-Type: multipart/form-data

file: [file]
tenantId: "tenant-id"
userId: "user-id"
retentionDays: 2555 // Optional, defaults to 7 years
```

### Download File
```bash
GET /api/files/{fileId}/download?userId=user-id
```

### List Files
```bash
GET /api/files?tenantId=tenant-id&userId=user-id
```

## 💳 Stripe Integration

### Webhook Endpoint
```
POST /api/webhooks/stripe
```

Handles events:
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`
- `invoice.payment_succeeded`

## ⏰ Cron Jobs

### Grace Period Job (Daily)
```bash
npm run cron:grace-period
```
Transitions tenants from `GRACE_PERIOD` to `SUSPENDED` after 7 days.

### Retention Job (Weekly)
```bash
npm run cron:retention
```
Archives expired files and transitions suspended tenants to `ARCHIVED`.

## 🚀 Deployment

### Frontend (Vercel)
```bash
vercel --prod
```

### Backend (AWS Lambda)
Deploy cron jobs to AWS Lambda with EventBridge triggers:
- Grace period job: Daily at 2 AM UTC
- Retention job: Weekly on Sundays at 3 AM UTC

### Database (AWS RDS)
1. Create PostgreSQL instance on AWS RDS
2. Update `DATABASE_URL` in environment variables
3. Run migrations: `npm run db:migrate:prod`

### File Storage (AWS S3)
1. Create S3 bucket: `taxflow-files-prod`
2. Configure CORS and bucket policies
3. Update AWS credentials in environment variables

## 🧪 Testing

### Demo Credentials
After running `npm run db:seed`, use these credentials:

**Tax Pro (Demo Firm)**
- Email: `pro@taxflow.com`
- Password: `pro123`
- State: ACTIVE

**Client (Demo Firm)**
- Email: `client@taxflow.com`
- Password: `client123`

**SaaS Owner**
- Email: `owner@taxflow.com`
- Password: `admin123`

## 📊 Tenant States & Access Rules

| State | Upload Files | Download Files | Delete Files | Portal Access |
|-------|-------------|----------------|--------------|---------------|
| TRIAL | ✅ | ✅ | ✅ | ✅ |
| ACTIVE | ✅ | ✅ | ✅ | ✅ |
| GRACE_PERIOD | ❌ | ✅ | ❌ | ✅ |
| SUSPENDED | ❌ | ❌ | ❌ | ❌ |
| ARCHIVED | ❌ | ❌ | ❌ | ❌ |

## 🔒 Security

- **Password Hashing**: bcrypt with salt
- **JWT Tokens**: Access (15min) + Refresh (7 days)
- **MFA**: TOTP with QR codes and backup codes
- **RBAC**: Permission matrix by role
- **Tenant Isolation**: Row-level security via foreign keys
- **Audit Logging**: Complete trail of all actions
- **Stripe Webhooks**: Signature verification + idempotency

## 📝 Environment Variables

See `.env.example` for all required environment variables:
- Database connection
- JWT secrets
- Stripe keys
- AWS credentials
- SendGrid API key
- Grace period and retention settings

## 🤝 Contributing

This is a production-ready MVP. Future phases will add:
- Admin dashboards
- White-label branding
- Growth automation
- Health monitoring

## 📄 License

MIT

## 🆘 Support

For issues or questions, please open a GitHub issue.

---

**Built with precision for tax professionals** 🎯
