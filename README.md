# Referral Management System

A full-stack healthcare referral management application for coordinating patient care between healthcare providers.

## 🚀 Live Deployment

- **Frontend:** https://referral-system-sigma.vercel.app
- **Backend API:** https://referral-system-backend.fly.dev/api

## 📦 Project Structure

This monorepo contains two applications:
```
referral-system/
├── referral-system-backend/     # Node.js/Express API
└── referral-system-frontend/    # React/TypeScript SPA
```

## 📚 Documentation

For detailed setup instructions and API documentation, see:

- **[Backend README](./referral-system-backend/README.md)** - API endpoints, database schema, local setup
- **[Frontend README](./referral-system-frontend/README.md)** - Component structure, features, deployment

## 🛠️ Tech Stack

**Backend:** Node.js, TypeScript, Express, Prisma, PostgreSQL  
**Frontend:** React, TypeScript, Vite, Tailwind CSS, React Router  
**Deployment:** Fly.io (Backend), Vercel (Frontend)

## ✨ Key Features

- Organization management with coverage areas
- Send and manage patient referrals
- Accept/reject workflow
- Filter by location and status
- Token-based authentication
- Fully responsive design

## 🔑 Quick Start

**Login Token:** `demo-token`

Visit the [live app](https://referral-system-sigma.vercel.app) and login with `demo-token` to explore all features.

## 🚦 Local Development

### Backend
```bash
cd referral-system-backend
npm install
# See Backend README for full setup
npm run dev
```

### Frontend
```bash
cd referral-system-frontend
npm install
# See Frontend README for full setup
npm run dev
```

## 👤 Author

Hassan Kirmani - [@Hassan-Kirmani9](https://github.com/Hassan-Kirmani9)

## 📄 License

MIT