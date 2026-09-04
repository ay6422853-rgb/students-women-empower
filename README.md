# Students and Women Empower

A MERN starter project for an India-focused direct-selling/network platform.

## Included
- React + Vite frontend
- Express backend
- MongoDB/Mongoose models
- JWT + bcrypt authentication
- Role-based authorization
- Unlimited referral tree via `referredBy`
- Admin role promotion
- Products/categories
- Inventory and stock transfers
- Orders and cash-payment workflow
- Commission engine (5%, 3%, 2%, 1%)
- Wallet and withdrawals
- Basic analytics APIs
- Separate role-aware dashboard shell

## Roles
MEMBER, TEAM_LEADER, SUPER_TEAM_LEADER, CHIEF_TEAM_OFFICER,
PRODUCT_MANAGER, CASH_MANAGER, DISTRIBUTION_MANAGER, ADMIN

Team Leader is treated as retailer and Super Team Leader as distributor in business logic,
without creating retailer/distributor roles.

## Run
### Backend
cd backend
npm install
copy .env.example .env
npm run dev

### Frontend
cd frontend
npm install
npm run dev

Set MONGO_URI and JWT_SECRET in backend/.env.

This is a development starter, not a production-ready financial/KYC system.
Before production, add secure secrets, validation hardening, audit logs, payment/reconciliation
controls, encryption/access controls for KYC data, rate limiting, HTTPS, backups, and legal review.
