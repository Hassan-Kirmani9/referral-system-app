# Referral Management System - Frontend

Healthcare referral management web application built with React, TypeScript, and Tailwind CSS.

## Live Deployment

**Web App:** https://referral-system-sigma.vercel.app

**Backend API:** https://referral-system-backend.fly.dev/api

## Tech Stack

- React 18
- TypeScript
- Vite
- React Router
- Axios
- Tailwind CSS
- Lucide React (icons)
- Vercel (Deployment)

## Features

- 🔐 Token-based authentication
- 🏥 Organization management (create, view, delete)
- 📍 Coverage area management
- 📤 Send referrals between organizations
- 📥 Manage incoming referrals (accept/reject)
- 🗺️ View coverage areas by location
- 📱 Fully responsive design

## Local Setup

### Prerequisites
- Node.js 18+

### Installation

1. Clone the repository
```bash
   git clone https://github.com/Hassan-Kirmani9/referral-system
   cd referral-system-frontend
```

2. Install dependencies
```bash
   npm install
```

3. Setup environment variables
   
   Create `.env` file:
```env
   VITE_API_URL=http://localhost:5000/api
```
   
   For production, use:
```env
   VITE_API_URL=https://referral-system-backend.fly.dev/api
```

4. Start development server
```bash
   npm run dev
```

App runs on `http://localhost:5173`

## Authentication

The app uses a simple token-based authentication:

**Demo Token:** `demo-token`

On the login screen, enter `demo-token` to access the application.

## Application Screens

### 1. Login
- Token-based authentication
- Demo token: `demo-token`

### 2. Organizations
- Create new healthcare organizations
- Add multiple coverage areas
- View all organizations in a table
- Delete organizations (if no referrals exist)

### 3. Send Referral
- Select sender organization
- Select receiver organization
- Enter patient information
- Add optional notes
- View receiver's coverage areas

### 4. Manage Referrals
- Select organization to view its inbox
- Filter by status (All, Pending, Accepted, Rejected)
- Accept or reject pending referrals
- View referral details (patient info, sender, notes)

### 5. Coverage Areas
- View all organizations with their service areas
- Filter by state, city, or zip code
- See organization types and roles
- View contact information

## Project Structure
```
src/
├── components/
│   ├── Layout.tsx           # Main layout with navbar
│   ├── Navbar.tsx           # Navigation component
│   ├── Toast.tsx            # Success/error notifications
│   ├── ConfirmDialog.tsx    # Confirmation dialogs
│   └── Loading.tsx          # Loading spinner
├── pages/
│   ├── Login.tsx            # Login screen
│   ├── Organizations.tsx    # Organization management
│   ├── SendReferral.tsx     # Create referrals
│   ├── ManageReferrals.tsx  # View/manage referrals
│   └── CoverageAreas.tsx    # View coverage areas
├── services/
│   └── api.ts               # API service layer
├── types/
│   └── index.ts             # TypeScript types
├── context/
│   └── AuthContext.tsx      # Authentication context
├── App.tsx                  # Main app component
└── main.tsx                 # Entry point
```

## API Integration

The frontend communicates with the backend API using Axios. All requests include the authentication token in headers.

Example API calls:
```typescript
// Get all organizations
const orgs = await get('/organizations');

// Create referral
const referral = await post('/referrals', {
  senderOrgId: '...',
  receiverOrgId: '...',
  patientName: 'John Smith',
  insuranceNumber: 'INS-12345'
});

// Update referral status
await patch(`/referrals/${id}/status`, { status: 'ACCEPTED' });
```

## Build for Production
```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

## Deployment

Deployed on Vercel:
```bash
vercel --prod
```

Or push to GitHub and connect to Vercel for automatic deployments.

### Vercel Configuration

The project includes `vercel.json` for SPA routing:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

## Environment Variables (Vercel)

Add these in Vercel Dashboard → Settings → Environment Variables:

- `VITE_API_URL`: `https://referral-system-backend.fly.dev/api`

## Color Scheme

- Primary: `#0066CC` (Healthcare Blue)
- Secondary: `#059669` (Medical Green)
- Success: `#10B981` (Green)
- Warning: `#F59E0B` (Orange)
- Error: `#EF4444` (Red)

**Role Colors:**
- Sender: Green
- Receiver: Blue
- Both: Purple

**Status Colors:**
- Pending: Orange
- Accepted: Green
- Rejected: Red
- Completed: Blue

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT