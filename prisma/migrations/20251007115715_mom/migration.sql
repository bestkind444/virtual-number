/*
  Warnings:

  - You are about to drop the column `paystackAccountNumber` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `paystackBankName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `paystackCustomerCode` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "paystackAccountNumber",
DROP COLUMN "paystackBankName",
DROP COLUMN "paystackCustomerCode",
ADD COLUMN     "accountNumber" TEXT,
ADD COLUMN     "bankCode" TEXT,
ADD COLUMN     "bankName" TEXT,
ADD COLUMN     "customerCode" TEXT;
