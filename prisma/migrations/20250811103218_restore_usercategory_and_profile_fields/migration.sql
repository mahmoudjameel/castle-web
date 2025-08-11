/*
  Warnings:

  - You are about to drop the column `categoryId` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_categoryId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "categoryId",
ADD COLUMN     "accent" TEXT,
ADD COLUMN     "eyeColor" TEXT,
ADD COLUMN     "features" TEXT,
ADD COLUMN     "hairColor" TEXT,
ADD COLUMN     "hairStyle" TEXT,
ADD COLUMN     "height" INTEGER,
ADD COLUMN     "language" TEXT,
ADD COLUMN     "skinColor" TEXT,
ADD COLUMN     "weight" INTEGER;

-- CreateTable
CREATE TABLE "UserCategory" (
    "userId" INTEGER NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "UserCategory_pkey" PRIMARY KEY ("userId","categoryId")
);

-- AddForeignKey
ALTER TABLE "UserCategory" ADD CONSTRAINT "UserCategory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCategory" ADD CONSTRAINT "UserCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
