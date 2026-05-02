-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(191) NULL,
    `passwordHash` VARCHAR(191) NULL,
    `avatarUrl` VARCHAR(191) NULL,
    `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    `totalSessions` INTEGER NOT NULL DEFAULT 0,
    `totalScore` DOUBLE NOT NULL DEFAULT 0,
    `streakDays` INTEGER NOT NULL DEFAULT 0,
    `lastActivityDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_username_key`(`username`),
    INDEX `User_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserProfile` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `preferredLang` VARCHAR(191) NOT NULL DEFAULT 'id',
    `theme` VARCHAR(191) NOT NULL DEFAULT 'light',
    `timezone` VARCHAR(191) NOT NULL DEFAULT 'Asia/Jakarta',
    `bio` VARCHAR(191) NULL,
    `referralSource` ENUM('INSTAGRAM', 'TIKTOK', 'YOUTUBE', 'FACEBOOK', 'TWITTER', 'WEBSITE', 'GOOGLE_SEARCH', 'FRIEND', 'FAMILY', 'TEACHER', 'MOSQUE', 'SCHOOL', 'OTHER') NULL,
    `referralOther` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `UserProfile_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Recitation` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `surah` INTEGER NOT NULL,
    `startAyah` INTEGER NOT NULL,
    `endAyah` INTEGER NOT NULL,
    `mode` ENUM('MUROJAAH', 'ZIYADAH') NOT NULL,
    `status` ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `duration` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `memorizationId` VARCHAR(191) NULL,

    INDEX `Recitation_userId_idx`(`userId`),
    INDEX `Recitation_userId_mode_idx`(`userId`, `mode`),
    INDEX `Recitation_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Feedback` (
    `id` VARCHAR(191) NOT NULL,
    `recitationId` VARCHAR(191) NOT NULL,
    `transcription` TEXT NULL,
    `memorizationErrs` JSON NULL,
    `tajweedErrs` JSON NULL,
    `waqfErrs` JSON NULL,
    `generalAdvice` TEXT NULL,
    `accuracyScore` DOUBLE NOT NULL,
    `tajweedScore` DOUBLE NOT NULL,
    `fluencyScore` DOUBLE NOT NULL,
    `metadataQuran` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Feedback_recitationId_key`(`recitationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserMemorization` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `surah` INTEGER NOT NULL,
    `startAyah` INTEGER NOT NULL,
    `endAyah` INTEGER NOT NULL,
    `status` ENUM('PLANNED', 'IN_PROGRESS', 'COMPLETED') NOT NULL DEFAULT 'COMPLETED',
    `source` ENUM('SIMAKIN', 'ONBOARDING', 'MANUAL') NOT NULL DEFAULT 'SIMAKIN',
    `completedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `UserMemorization_userId_status_idx`(`userId`, `status`),
    INDEX `UserMemorization_userId_surah_idx`(`userId`, `surah`),
    INDEX `UserMemorization_userId_source_idx`(`userId`, `source`),
    UNIQUE INDEX `UserMemorization_userId_surah_startAyah_endAyah_key`(`userId`, `surah`, `startAyah`, `endAyah`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Leaderboard` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `period` VARCHAR(191) NOT NULL,
    `score` DOUBLE NOT NULL,
    `rank` INTEGER NULL,
    `category` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Leaderboard_period_score_idx`(`period`, `score`),
    INDEX `Leaderboard_userId_period_idx`(`userId`, `period`),
    UNIQUE INDEX `Leaderboard_userId_period_category_key`(`userId`, `period`, `category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Achievement` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `iconUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Achievement_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserAchievement` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `achievementId` VARCHAR(191) NOT NULL,
    `awardedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `UserAchievement_userId_idx`(`userId`),
    UNIQUE INDEX `UserAchievement_userId_achievementId_key`(`userId`, `achievementId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserProfile` ADD CONSTRAINT `UserProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Recitation` ADD CONSTRAINT `Recitation_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Recitation` ADD CONSTRAINT `Recitation_memorizationId_fkey` FOREIGN KEY (`memorizationId`) REFERENCES `UserMemorization`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Feedback` ADD CONSTRAINT `Feedback_recitationId_fkey` FOREIGN KEY (`recitationId`) REFERENCES `Recitation`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserMemorization` ADD CONSTRAINT `UserMemorization_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Leaderboard` ADD CONSTRAINT `Leaderboard_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserAchievement` ADD CONSTRAINT `UserAchievement_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserAchievement` ADD CONSTRAINT `UserAchievement_achievementId_fkey` FOREIGN KEY (`achievementId`) REFERENCES `Achievement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
