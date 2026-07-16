-- CreateTable
CREATE TABLE "StroopSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "round1Id" TEXT,
    "round1Title" TEXT,
    "round1Score" INTEGER,
    "round1Trials" INTEGER,
    "round1AverageResponseTimeSeconds" REAL,
    "round2Id" TEXT,
    "round2Title" TEXT,
    "round2Score" INTEGER,
    "round2Trials" INTEGER,
    "round2AverageResponseTimeSeconds" REAL,
    "overallAccuracy" REAL,
    "totalGameTimeSeconds" INTEGER
);
