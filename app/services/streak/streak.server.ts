import { db } from "~/lib/db.server";

/**
 * Get the start of day (00:00:00) in user's timezone
 */
function getStartOfDayInTimezone(date: Date, timezone: string): Date {
  const dateStr = date.toLocaleString("en-US", { timeZone: timezone });
  const userDate = new Date(dateStr);
  return new Date(
    userDate.getFullYear(),
    userDate.getMonth(),
    userDate.getDate()
  );
}

/**
 * Get current date in user's timezone
 */
function getCurrentDateInTimezone(timezone: string): Date {
  const now = new Date();
  const dateStr = now.toLocaleString("en-US", { timeZone: timezone });
  return new Date(dateStr);
}

/**
 * Update user streak based on their activity
 * - Increments streak if user completes a session on a new day (in their timezone)
 * - Resets streak if user hasn't been active for more than 1 day
 * - Only counts once per day (multiple sessions in same day don't increase streak)
 */
export async function updateUserStreak(userId: string): Promise<number> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      streakDays: true,
      lastActivityDate: true,
      profile: {
        select: {
          timezone: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Get user's timezone (default to Asia/Jakarta if not set)
  const userTimezone = user.profile?.timezone || "Asia/Jakarta";

  const now = new Date();
  const today = getStartOfDayInTimezone(now, userTimezone);

  // If no previous activity, start streak at 1
  if (!user.lastActivityDate) {
    await db.user.update({
      where: { id: userId },
      data: {
        streakDays: 1,
        lastActivityDate: now,
      },
    });
    return 1;
  }

  const lastActivity = new Date(user.lastActivityDate);
  const lastActivityDay = getStartOfDayInTimezone(lastActivity, userTimezone);

  // Calculate difference in days
  const diffInMs = today.getTime() - lastActivityDay.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  let newStreakDays: number;

  if (diffInDays === 0) {
    // Same day - don't increment streak, just update timestamp
    newStreakDays = user.streakDays;
  } else if (diffInDays === 1) {
    // Consecutive day - increment streak
    newStreakDays = user.streakDays + 1;
  } else {
    // More than 1 day gap - reset streak to 1
    newStreakDays = 1;
  }

  await db.user.update({
    where: { id: userId },
    data: {
      streakDays: newStreakDays,
      lastActivityDate: now,
    },
  });

  return newStreakDays;
}

/**
 * Get user's current streak
 */
export async function getUserStreak(userId: string): Promise<number> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      streakDays: true,
      lastActivityDate: true,
      profile: {
        select: {
          timezone: true,
        },
      },
    },
  });

  if (!user || !user.lastActivityDate) {
    return 0;
  }

  // Get user's timezone (default to Asia/Jakarta if not set)
  const userTimezone = user.profile?.timezone || "Asia/Jakarta";

  const now = new Date();
  const today = getStartOfDayInTimezone(now, userTimezone);
  const lastActivity = new Date(user.lastActivityDate);
  const lastActivityDay = getStartOfDayInTimezone(lastActivity, userTimezone);

  const diffInMs = today.getTime() - lastActivityDay.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  // If more than 1 day has passed, streak is broken (but we don't update DB here)
  if (diffInDays > 1) {
    return 0;
  }

  return user.streakDays;
}
