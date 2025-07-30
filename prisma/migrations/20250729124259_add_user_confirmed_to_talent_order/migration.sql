-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Settings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Settings" ("id", "key", "updatedAt", "value") SELECT "id", "key", "updatedAt", "value" FROM "Settings";
DROP TABLE "Settings";
ALTER TABLE "new_Settings" RENAME TO "Settings";
CREATE UNIQUE INDEX "Settings_key_key" ON "Settings"("key");
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
    "userConfirmed" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "TalentOrder_talentId_fkey" FOREIGN KEY ("talentId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TalentOrder_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TalentOrder" ("address", "clientId", "createdAt", "date", "id", "message", "phone", "services", "status", "talentId") SELECT "address", "clientId", "createdAt", "date", "id", "message", "phone", "services", "status", "talentId" FROM "TalentOrder";
DROP TABLE "TalentOrder";
ALTER TABLE "new_TalentOrder" RENAME TO "TalentOrder";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
