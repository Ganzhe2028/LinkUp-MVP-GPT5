-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "bio" TEXT NOT NULL DEFAULT '',
    "avatarUrl" TEXT,
    "skills" JSONB NOT NULL,
    "contactType" TEXT,
    "contactValue" TEXT,
    "contactQr" TEXT,
    "lookingForTeammates" BOOLEAN NOT NULL DEFAULT true,
    "needsOnboarding" BOOLEAN NOT NULL DEFAULT true,
    "socialLinks" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_lookingForTeammates_idx" ON "User"("lookingForTeammates");

-- CreateIndex
CREATE INDEX "User_updatedAt_idx" ON "User"("updatedAt");
