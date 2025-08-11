/*
  Warnings:

  - You are about to drop the column `accent` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `eyeColor` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `features` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `hairColor` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `hairStyle` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `height` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `language` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `skinColor` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `weight` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `UserCategory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserCategory" DROP CONSTRAINT "UserCategory_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "UserCategory" DROP CONSTRAINT "UserCategory_userId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "accent",
DROP COLUMN "eyeColor",
DROP COLUMN "features",
DROP COLUMN "hairColor",
DROP COLUMN "hairStyle",
DROP COLUMN "height",
DROP COLUMN "language",
DROP COLUMN "skinColor",
DROP COLUMN "weight",
ADD COLUMN     "categoryId" TEXT;

-- DropTable
DROP TABLE "UserCategory";

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
