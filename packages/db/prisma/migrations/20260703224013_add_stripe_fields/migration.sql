/*
  Warnings:

  - A unique constraint covering the columns `[stripeCustomerId]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "stripeCustomerId" TEXT;

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "stripePriceId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Customer_stripeCustomerId_key" ON "Customer"("stripeCustomerId");
