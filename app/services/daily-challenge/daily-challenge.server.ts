import { db } from "~/lib/db.server";
import { logXPGain } from "~/services/xp-history/xp-history.server";
import type { ChallengeType } from "@prisma/client";

/**
 * Get today's date string in user's local timezone.
 * e.g. "2026-05-12"
 */
function getTodayDate(timezone: string): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: timezone });
}

interface ChallengeWithProgress {
  id: string;
  type: ChallengeType;
  targetValue: number;
  expReward: number;
  description: string;
  currentProgress: number;
  isCompleted: boolean;
}

/**
 * Get or create today's challenge progress records for a user.
 * Always returns exactly 3 records (one per challenge type).
 */
export async function getTodaysChallenges(
  userId: string,
  timezone: string
): Promise<ChallengeWithProgress[]> {
  const today = getTodayDate(timezone);

  const challenges = await db.dailyChallenge.findMany({
    orderBy: { id: "asc" },
  });

  const results: ChallengeWithProgress[] = [];

  for (const challenge of challenges) {
    const progress = await db.userDailyChallenge.upsert({
      where: {
        userId_challengeId_date: {
          userId,
          challengeId: challenge.id,
          date: today,
        },
      },
      update: {},
      create: {
        userId,
        challengeId: challenge.id,
        date: today,
        currentProgress: 0,
        isCompleted: false,
      },
      include: {
        challenge: true,
      },
    });

    results.push({
      id: challenge.id,
      type: challenge.type,
      targetValue: challenge.targetValue,
      expReward: challenge.expReward,
      description: challenge.description,
      currentProgress: progress.currentProgress,
      isCompleted: progress.isCompleted,
    });
  }

  return results;
}

/**
 * Increment progress for a specific challenge type.
 * Awards EXP and marks complete when target is reached.
 *
 * Returns { justCompleted, expAwarded }
 */
export async function incrementChallengeProgress(
  userId: string,
  timezone: string,
  type: ChallengeType,
  value = 1
): Promise<{ justCompleted: boolean; expAwarded: number }> {
  const today = getTodayDate(timezone);

  const challenge = await db.dailyChallenge.findUnique({
    where: { type },
  });

  if (!challenge) {
    console.error(`[DAILY_CHALLENGE] Challenge type not found: ${type}`);
    return { justCompleted: false, expAwarded: 0 };
  }

  const progress = await db.userDailyChallenge.findUnique({
    where: {
      userId_challengeId_date: {
        userId,
        challengeId: challenge.id,
        date: today,
      },
    },
  });

  if (!progress) {
    // Shouldn't happen but handle gracefully
    return { justCompleted: false, expAwarded: 0 };
  }

  if (progress.isCompleted) {
    // Already completed — no double reward
    return { justCompleted: false, expAwarded: 0 };
  }

  const newProgress = progress.currentProgress + value;

  if (newProgress >= challenge.targetValue) {
    // Mark as completed and award EXP
    await db.userDailyChallenge.update({
      where: { id: progress.id },
      data: {
        currentProgress: newProgress,
        isCompleted: true,
        completedAt: new Date(),
        expAwarded: true,
      },
    });

    await logXPGain(
      userId,
      challenge.expReward,
      "DAILY_CHALLENGE",
      progress.id
    );

    return { justCompleted: true, expAwarded: challenge.expReward };
  }

  // Just increment progress
  await db.userDailyChallenge.update({
    where: { id: progress.id },
    data: { currentProgress: newProgress },
  });

  return { justCompleted: false, expAwarded: 0 };
}