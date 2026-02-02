# Use Node.js LTS
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Set placeholder DATABASE_URL for prisma generate (won't actually connect)
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 8080

# Run migrations and start app (real DATABASE_URL will be injected here)
CMD npx prisma migrate deploy && node dist/index.js