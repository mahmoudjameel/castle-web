/*
  Warnings:

  - You are about to drop the `Transaction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Wallet` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Withdrawal` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `amount` on the `TalentOrder` table. All the data in the column will be lost.
  - You are about to drop the column `paymentStatus` on the `TalentOrder` table. All the data in the column will be lost.
  - You are about to drop the column `platformFee` on the `TalentOrder` table. All the data in the column will be lost.
  - You are about to drop the column `talentAmount` on the `TalentOrder` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Wallet_userId_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Transaction";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Wallet";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Withdrawal";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TalentOrder" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "talentId" INTEGER NOT NULL,
    "clientId" INTEGER NOT NULL,
    "services" TEXT NOT NULL,
    "message" TEXT,
    "date" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "phone" TEXT,
    "address" TEXT,
    CONSTRAINT "TalentOrder_talentId_fkey" FOREIGN KEY ("talentId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TalentOrder_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TalentOrder" ("address", "clientId", "createdAt", "date", "id", "message", "phone", "services", "status", "talentId") SELECT "address", "clientId", "createdAt", "date", "id", "message", "phone", "services", "status", "talentId" FROM "TalentOrder";
DROP TABLE "TalentOrder";
ALTER TABLE "new_TalentOrder" RENAME TO "TalentOrder";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
