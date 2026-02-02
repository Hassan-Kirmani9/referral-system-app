/*
  Warnings:

  - You are about to drop the column `phone` on the `coverage_areas` table. All the data in the column will be lost.
  - You are about to drop the column `insurance_numbe` on the `referrals` table. All the data in the column will be lost.
  - You are about to drop the column `patient_name` on the `referrals` table. All the data in the column will be lost.
  - You are about to drop the column `recieverId` on the `referrals` table. All the data in the column will be lost.
  - You are about to drop the column `senderId` on the `referrals` table. All the data in the column will be lost.
  - Added the required column `insuranceNumber` to the `referrals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `patientName` to the `referrals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recieverOrgId` to the `referrals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderOrgId` to the `referrals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `referrals` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "coverage_areas" DROP CONSTRAINT "coverage_areas_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "referrals" DROP CONSTRAINT "referrals_recieverId_fkey";

-- DropForeignKey
ALTER TABLE "referrals" DROP CONSTRAINT "referrals_senderId_fkey";

-- AlterTable
ALTER TABLE "coverage_areas" DROP COLUMN "phone";

-- AlterTable
ALTER TABLE "referrals" DROP COLUMN "insurance_numbe",
DROP COLUMN "patient_name",
DROP COLUMN "recieverId",
DROP COLUMN "senderId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "insuranceNumber" TEXT NOT NULL,
ADD COLUMN     "patientName" TEXT NOT NULL,
ADD COLUMN     "recieverOrgId" TEXT NOT NULL,
ADD COLUMN     "senderOrgId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "coverage_areas_organizationId_idx" ON "coverage_areas"("organizationId");

-- CreateIndex
CREATE INDEX "referrals_senderOrgId_idx" ON "referrals"("senderOrgId");

-- CreateIndex
CREATE INDEX "referrals_recieverOrgId_idx" ON "referrals"("recieverOrgId");

-- AddForeignKey
ALTER TABLE "coverage_areas" ADD CONSTRAINT "coverage_areas_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_senderOrgId_fkey" FOREIGN KEY ("senderOrgId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_recieverOrgId_fkey" FOREIGN KEY ("recieverOrgId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
