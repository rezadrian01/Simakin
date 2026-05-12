-- AlterTable
ALTER TABLE `recitation` ADD COLUMN `expEarned` INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `XPHistory` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `amount` INTEGER NOT NULL,
    `source` ENUM('RECITATION', 'MINIGAME', 'DAILY_CHALLENGE') NOT NULL,
    `sourceId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `XPHistory_userId_idx`(`userId`),
    INDEX `XPHistory_userId_createdAt_idx`(`userId`, `createdAt`),
    INDEX `XPHistory_userId_source_idx`(`userId`, `source`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GameSession` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `gameType` ENUM('SAMBUNG_AYAT', 'TEBAK_SURAH', 'LENGKAPI_AYAT', 'URUTAN_AYAT') NOT NULL,
    `totalQuestions` INTEGER NOT NULL,
    `correctAnswers` INTEGER NOT NULL,
    `expEarned` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `GameSession_userId_idx`(`userId`),
    INDEX `GameSession_userId_gameType_idx`(`userId`, `gameType`),
    INDEX `GameSession_userId_createdAt_idx`(`userId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DailyChallenge` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('COMPLETE_SESSIONS', 'REACH_ACCURACY', 'WIN_GAMES') NOT NULL,
    `targetValue` INTEGER NOT NULL,
    `expReward` INTEGER NOT NULL,
    `description` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `DailyChallenge_type_key`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserDailyChallenge` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `challengeId` VARCHAR(191) NOT NULL,
    `date` VARCHAR(191) NOT NULL,
    `currentProgress` INTEGER NOT NULL DEFAULT 0,
    `isCompleted` BOOLEAN NOT NULL DEFAULT false,
    `completedAt` DATETIME(3) NULL,
    `expAwarded` BOOLEAN NOT NULL DEFAULT false,

    INDEX `UserDailyChallenge_userId_date_idx`(`userId`, `date`),
    UNIQUE INDEX `UserDailyChallenge_userId_challengeId_date_key`(`userId`, `challengeId`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `XPHistory` ADD CONSTRAINT `XPHistory_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GameSession` ADD CONSTRAINT `GameSession_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserDailyChallenge` ADD CONSTRAINT `UserDailyChallenge_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserDailyChallenge` ADD CONSTRAINT `UserDailyChallenge_challengeId_fkey` FOREIGN KEY (`challengeId`) REFERENCES `DailyChallenge`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
