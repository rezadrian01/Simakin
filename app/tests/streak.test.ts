/**
 * Manual Test Cases for Streak Implementation
 * Run these scenarios manually to verify streak functionality
 */

import {
  updateUserStreak,
  getUserStreak,
} from "~/services/streak/streak.server";
import { db } from "~/lib/db.server";

/**
 * Test Scenario 1: First Time User
 * Expected: streak = 1
 */
export async function testFirstTimeUser(userId: string) {
  console.log("\n=== Test 1: First Time User ===");

  // Reset user streak data
  await db.user.update({
    where: { id: userId },
    data: {
      streakDays: 0,
      lastActivityDate: null,
    },
  });

  // Simulate first setoran
  const streak = await updateUserStreak(userId);
  console.log(`Result: streak = ${streak}`);
  console.log(`Expected: streak = 1`);
  console.log(`Status: ${streak === 1 ? "✅ PASS" : "❌ FAIL"}`);

  return streak === 1;
}

/**
 * Test Scenario 2: Consecutive Days
 * Expected: streak increases by 1
 */
export async function testConsecutiveDays(userId: string) {
  console.log("\n=== Test 2: Consecutive Days ===");

  // Setup: Last activity was yesterday
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(12, 0, 0, 0); // Set to noon yesterday

  await db.user.update({
    where: { id: userId },
    data: {
      streakDays: 5,
      lastActivityDate: yesterday,
    },
  });

  console.log(`Setup: Last activity = ${yesterday.toISOString()}`);
  console.log(`Setup: Initial streak = 5`);

  // Simulate setoran today
  const newStreak = await updateUserStreak(userId);
  console.log(`Result: streak = ${newStreak}`);
  console.log(`Expected: streak = 6`);
  console.log(`Status: ${newStreak === 6 ? "✅ PASS" : "❌ FAIL"}`);

  return newStreak === 6;
}

/**
 * Test Scenario 3: Multiple Sessions Same Day
 * Expected: streak stays the same
 */
export async function testMultipleSessionsSameDay(userId: string) {
  console.log("\n=== Test 3: Multiple Sessions Same Day ===");

  // Setup: Activity earlier today
  const thismorning = new Date();
  thismorning.setHours(8, 0, 0, 0); // Set to 8 AM today

  await db.user.update({
    where: { id: userId },
    data: {
      streakDays: 7,
      lastActivityDate: thismorning,
    },
  });

  console.log(`Setup: Last activity = ${thismorning.toISOString()}`);
  console.log(`Setup: Initial streak = 7`);

  // Simulate another setoran today
  const newStreak = await updateUserStreak(userId);
  console.log(`Result: streak = ${newStreak}`);
  console.log(`Expected: streak = 7 (unchanged)`);
  console.log(`Status: ${newStreak === 7 ? "✅ PASS" : "❌ FAIL"}`);

  return newStreak === 7;
}

/**
 * Test Scenario 4: Streak Broken (Gap > 1 day)
 * Expected: streak resets to 1
 */
export async function testStreakBroken(userId: string) {
  console.log("\n=== Test 4: Streak Broken ===");

  // Setup: Last activity was 3 days ago
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  threeDaysAgo.setHours(12, 0, 0, 0);

  await db.user.update({
    where: { id: userId },
    data: {
      streakDays: 10,
      lastActivityDate: threeDaysAgo,
    },
  });

  console.log(`Setup: Last activity = ${threeDaysAgo.toISOString()}`);
  console.log(`Setup: Initial streak = 10`);

  // Simulate setoran today (after 3 days gap)
  const newStreak = await updateUserStreak(userId);
  console.log(`Result: streak = ${newStreak}`);
  console.log(`Expected: streak = 1 (reset)`);
  console.log(`Status: ${newStreak === 1 ? "✅ PASS" : "❌ FAIL"}`);

  return newStreak === 1;
}

/**
 * Test Scenario 5: Get Streak After Gap (Read-Only)
 * Expected: returns 0 without updating DB
 */
export async function testGetStreakAfterGap(userId: string) {
  console.log("\n=== Test 5: Get Streak After Gap ===");

  // Setup: Last activity was 2 days ago
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  twoDaysAgo.setHours(12, 0, 0, 0);

  await db.user.update({
    where: { id: userId },
    data: {
      streakDays: 8,
      lastActivityDate: twoDaysAgo,
    },
  });

  console.log(`Setup: Last activity = ${twoDaysAgo.toISOString()}`);
  console.log(`Setup: DB streak = 8`);

  // Get current streak (should recognize it's broken)
  const currentStreak = await getUserStreak(userId);
  console.log(`Result: getUserStreak() = ${currentStreak}`);
  console.log(`Expected: 0 (streak broken but not updated in DB yet)`);
  console.log(`Status: ${currentStreak === 0 ? "✅ PASS" : "❌ FAIL"}`);

  // Verify DB was not updated
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { streakDays: true },
  });

  console.log(`DB streak still = ${user?.streakDays}`);
  console.log(
    `DB unchanged: ${user?.streakDays === 8 ? "✅ PASS" : "❌ FAIL"}`
  );

  return currentStreak === 0 && user?.streakDays === 8;
}

/**
 * Test Scenario 6: Exactly 1 Day Gap (Yesterday to Today)
 * Expected: streak increases
 */
export async function testExactlyOneDayGap(userId: string) {
  console.log("\n=== Test 6: Exactly 1 Day Gap ===");

  // Setup: Last activity was exactly yesterday at 11:59 PM
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(23, 59, 59, 0);

  await db.user.update({
    where: { id: userId },
    data: {
      streakDays: 3,
      lastActivityDate: yesterday,
    },
  });

  console.log(`Setup: Last activity = ${yesterday.toISOString()}`);
  console.log(`Setup: Initial streak = 3`);

  // Simulate setoran today at 00:01 AM
  const newStreak = await updateUserStreak(userId);
  console.log(`Result: streak = ${newStreak}`);
  console.log(`Expected: streak = 4`);
  console.log(`Status: ${newStreak === 4 ? "✅ PASS" : "❌ FAIL"}`);

  return newStreak === 4;
}

/**
 * Run all tests
 */
export async function runAllStreakTests(userId: string) {
  console.log("\n🧪 Running Streak Implementation Tests");
  console.log("=====================================\n");

  const results = {
    test1: await testFirstTimeUser(userId),
    test2: await testConsecutiveDays(userId),
    test3: await testMultipleSessionsSameDay(userId),
    test4: await testStreakBroken(userId),
    test5: await testGetStreakAfterGap(userId),
    test6: await testExactlyOneDayGap(userId),
  };

  const passCount = Object.values(results).filter((r) => r).length;
  const totalCount = Object.keys(results).length;

  console.log("\n=====================================");
  console.log(`📊 Test Results: ${passCount}/${totalCount} passed`);
  console.log("=====================================\n");

  if (passCount === totalCount) {
    console.log("✅ All tests passed!");
  } else {
    console.log("❌ Some tests failed. Please review the results above.");
  }

  return results;
}

/**
 * How to use:
 *
 * 1. In your route action or loader, import this file:
 *    import { runAllStreakTests } from "~/tests/streak.test";
 *
 * 2. Call the test function with a valid userId:
 *    const results = await runAllStreakTests("your-user-id");
 *
 * 3. Check console output for test results
 *
 * Note: These tests will modify the user's streak data.
 * Only run on test users or in development environment!
 */
