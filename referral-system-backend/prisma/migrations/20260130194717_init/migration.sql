-- CreateEnum
CREATE TYPE "OrganizationType" AS ENUM ('CLINIC', 'PHARMACY', 'HOME_HEALTH', 'NURSING_HOME', 'TRANSPORTATION', 'DME');

-- CreateEnum
CREATE TYPE "OrganizationRole" AS ENUM ('SENDER', 'RECEIVER', 'BOTH');

-- CreateEnum
CREATE TYPE "ReferralStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED');

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" "OrganizationType" NOT NULL,
    "role" "OrganizationRole" NOT NULL,
    "contact" JSONB NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coverage_area" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "county" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "phone" TEXT NOT NULL,

    CONSTRAINT "coverage_area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referrals" (
    "id" TEXT NOT NULL,
    "patient_name" TEXT NOT NULL,
    "insurance_numbe" TEXT NOT NULL,
    "status" "ReferralStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "senderId" TEXT NOT NULL,
    "recieverId" TEXT NOT NULL,

    CONSTRAINT "referrals_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "coverage_area" ADD CONSTRAINT "coverage_area_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_recieverId_fkey" FOREIGN KEY ("recieverId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
