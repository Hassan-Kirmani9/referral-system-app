# Referral Management System - Backend

Healthcare referral management API built with Node.js, Express, Prisma, and PostgreSQL.

## Live Deployment

**API Base URL:** https://referral-system-backend.fly.dev/api

## Tech Stack

- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL
- Fly.io (Deployment)

## Local Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### Installation

1. Clone the repository
```bash
   git clone https://github.com/Hassan-Kirmani9/referral-system
   cd referral-system-backend
```

2. Install dependencies
```bash
   npm install
```

3. Setup environment variables
```bash
   cp .env.example .env
```
   
   Update `.env` with your PostgreSQL credentials:
```env
   DATABASE_URL="postgresql://username:password@localhost:5432/referral_system"
   PORT=5000
   NODE_ENV=development
```

4. Run database migrations
```bash
   npx prisma migrate dev
   npx prisma generate
```

5. Start development server
```bash
   npm run dev
```

Server runs on `http://localhost:5000`

## API Endpoints

### Authentication
All endpoints require Bearer token authentication.

**Token:** `demo-token`

**Header:**
```
Authorization: Bearer demo-token
```

### Organizations

#### Create Organization
```http
POST /api/organizations
Content-Type: application/json
Authorization: Bearer demo-token

{
  "name": "City Medical Clinic",
  "type": "CLINIC",
  "role": "SENDER",
  "contact": {
    "email": "contact@clinic.com",
    "phone": "555-0123"
  }
}
```

#### Get All Organizations
```http
GET /api/organizations?type=CLINIC&role=SENDER
Authorization: Bearer demo-token
```

#### Get Single Organization
```http
GET /api/organizations/:id
Authorization: Bearer demo-token
```

#### Update Coverage Areas
```http
PUT /api/organizations/:id/coverage
Content-Type: application/json
Authorization: Bearer demo-token

{
  "coverageAreas": [
    {
      "state": "Massachusetts",
      "county": "Suffolk",
      "city": "Boston",
      "zipCode": "02101"
    }
  ]
}
```

#### Update Organization
```http
PATCH /api/organizations/:id
Content-Type: application/json
Authorization: Bearer demo-token

{
  "name": "Updated Name"
}
```

#### Delete Organization
```http
DELETE /api/organizations/:id
Authorization: Bearer demo-token
```

### Referrals

#### Create Referral
```http
POST /api/referrals
Content-Type: application/json
Authorization: Bearer demo-token

{
  "senderOrgId": "uuid",
  "receiverOrgId": "uuid",
  "patientName": "John Smith",
  "insuranceNumber": "INS-12345",
  "notes": "Patient needs physical therapy"
}
```

#### Get All Referrals
```http
GET /api/referrals?senderOrgId=uuid&receiverOrgId=uuid&status=PENDING
Authorization: Bearer demo-token
```

#### Update Referral Status
```http
PATCH /api/referrals/:id/status
Content-Type: application/json
Authorization: Bearer demo-token

{
  "status": "ACCEPTED"
}
```

**Valid Statuses:** `PENDING`, `ACCEPTED`, `REJECTED`, `COMPLETED`

## Database Schema

### Organization
- Healthcare providers (clinics, pharmacies, home health, etc.)
- Types: `CLINIC`, `PHARMACY`, `HOME_HEALTH`, `NURSING_HOME`, `TRANSPORTATION`, `DME`
- Roles: `SENDER`, `RECEIVER`, `BOTH`

### CoverageArea
- Geographic areas each organization serves
- Linked to organizations

### Referral
- Patient referrals between organizations
- Tracks status: `PENDING`, `ACCEPTED`, `REJECTED`, `COMPLETED`

## Testing

Use the provided `.http` file or test with curl:
```bash
# Health check
curl https://referral-system-backend.fly.dev/health

# Create organization
curl -X POST https://referral-system-backend.fly.dev/api/organizations \
  -H "Authorization: Bearer demo-token" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Clinic",
    "type": "CLINIC",
    "role": "SENDER",
    "contact": {
      "email": "test@test.com",
      "phone": "1234567890"
    }
  }'
```

## Deployment

Deployed on Fly.io:
```bash
fly deploy
```

## License

MIT