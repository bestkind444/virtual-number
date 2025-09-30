-- CreateTable
CREATE TABLE "public"."refresherToken" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refresherToken_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."refresherToken" ADD CONSTRAINT "refresherToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
