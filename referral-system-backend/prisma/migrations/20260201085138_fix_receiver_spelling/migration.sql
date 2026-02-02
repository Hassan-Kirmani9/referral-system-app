/*
  Warnings:

  - You are about to drop the column `zip` on the `coverage_areas` table. All the data in the column will be lost.
  - You are about to drop the column `recieverOrgId` on the `referrals` table. All the data in the column will be lost.
  - Added the required column `zipCode` to the `coverage_areas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receiverOrgId` to the `referrals` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "referrals" DROP CONSTRAINT "referrals_recieverOrgId_fkey";

-- DropIndex
DROP INDEX "referrals_recieverOrgId_idx";

-- AlterTable
ALTER TABLE "coverage_areas" DROP COLUMN "zip",
ADD COLUMN     "zipCode" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "referrals" DROP COLUMN "recieverOrgId",
ADD COLUMN     "receiverOrgId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "referrals_receiverOrgId_idx" ON "referrals"("receiverOrgId");

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_receiverOrgId_fkey" FOREIGN KEY ("receiverOrgId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
