/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `refresherToken` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "refresherToken_token_key" ON "public"."refresherToken"("token");
