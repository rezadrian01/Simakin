import { db } from "~/lib/db.server";
import type { Achievement } from "@prisma/client";

interface AchievementContext {
  totalSessions?: number;
  streakDays?: number;
  totalScore?: number;
  lastAccuracyScore?: number;
  lastGameCorrect?: number;
  totalGameSessions?: number;
  totalGameWins?: number;
  consecutiveDailyCompletions?: number;
}

/**
 * Check all achievement conditions and award any newly earned achievements.
 * Returns the list of newly awarded Achievement objects.
 */
export async function checkAndAwardAchievements(
  userId: string,
  context: AchievementContext
): Promise<Achievement[]> {
  const allAchievements = await db.achievement.findMany({});
  const earned = await db.userAchievement.findMany({
    where: { userId },
    include: { achievement: true },
  });

  const earnedKeys = new Set(earned.map((ua) => ua.achievement.key));

  const newlyEarned: Achievement[] = [];

  for (const achievement of allAchievements) {
    if (earnedKeys.has(achievement.key)) continue;

    let awarded = false;

    switch (achievement.key) {
      case "first_recitation":
        awarded = (context.totalSessions ?? 0) >= 1;
        break;

      case "recitation_10":
        awarded = (context.totalSessions ?? 0) >= 10;
        break;

      case "recitation_50":
        awarded = (context.totalSessions ?? 0) >= 50;
        break;

      case "perfect_accuracy":
        awarded = context.lastAccuracyScore === 100;
        break;

      case "accuracy_90_five": {
        if (!context.lastAccuracyScore || context.lastAccuracyScore < 90) break;
        const count = await db.feedback.count({
          where: {
            recitation: { userId },
            accuracyScore: { gte: 90 },
          },
        });
        awarded = count === 5;
        break;
      }

      case "streak_3":
        awarded = context.streakDays === 3;
        break;

      case "streak_7":
        awarded = context.streakDays === 7;
        break;

      case "streak_30":
        awarded = context.streakDays === 30;
        break;

      case "first_game":
        awarded = (context.totalGameSessions ?? 0) >= 1;
        break;

      case "perfect_game":
        awarded = (context.lastGameCorrect ?? 0) === 10;
        break;

      case "game_win_10":
        awarded = (context.totalGameWins ?? 0) >= 10;
        break;

      case "exp_1000":
        awarded = (context.totalScore ?? 0) >= 1000;
        break;

      case "exp_10000":
        awarded = (context.totalScore ?? 0) >= 10000;
        break;

      case "daily_3":
        if (!context.consecutiveDailyCompletions) break;
        awarded = context.consecutiveDailyCompletions >= 3;
        break;
    }

    if (awarded) {
      await db.userAchievement.create({
        data: {
          userId,
          achievementId: achievement.id,
        },
      });
      newlyEarned.push(achievement);
    }
  }

  return newlyEarned;
}