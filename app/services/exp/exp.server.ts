/**
 * EXP (Experience Points) Calculation Service
 *
 * This service handles all EXP calculations for user activities.
 * EXP is awarded when users complete recitation sessions.
 *
 * The calculation uses a weighted system with multiple factors:
 * - Base score (accuracy + tajweed + fluency)
 * - Streak bonus
 * - Mode bonus (ZIYADAH vs MUROJAAH)
 * - Ayah length bonus
 */

interface CalculateExpParams {
  accuracyScore: number;
  tajweedScore: number;
  fluencyScore: number;
  mode: "ZIYADAH" | "MUROJAAH";
  startAyah: number;
  endAyah: number;
  streakDays: number;
}

/**
 * Calculate EXP earned from a recitation session
 *
 * Formula:
 * 1. Base EXP = average score * base multiplier (5)
 * 2. Apply streak bonus (3+ days: 1.25x, 7+ days: 1.5x, 14+ days: 2x)
 * 3. Apply mode bonus (ZIYADAH: 1.3x, MUROJAAH: 1.0x)
 * 4. Apply ayah length bonus (5+ ayat: 1.1x, 10+ ayat: 1.2x, 20+ ayat: 1.5x)
 *
 * @param params - Recitation session parameters
 * @returns Total EXP earned (rounded to nearest integer)
 */
export function calculateExp({
  accuracyScore,
  tajweedScore,
  fluencyScore,
  mode,
  startAyah,
  endAyah,
  streakDays,
}: CalculateExpParams): number {
  // Step 1: Calculate base score (average of all scores)
  const baseScore = (accuracyScore + tajweedScore + fluencyScore) / 3;

  // Step 2: Apply base multiplier to make EXP more rewarding
  const BASE_MULTIPLIER = 5;
  let exp = baseScore * BASE_MULTIPLIER;

  // Step 3: Apply streak bonus
  // Encourage daily consistency
  let streakMultiplier = 1.0;
  if (streakDays >= 14) {
    streakMultiplier = 2.0; // +100% for 2 weeks streak!
  } else if (streakDays >= 7) {
    streakMultiplier = 1.5; // +50% for 1 week streak
  } else if (streakDays >= 3) {
    streakMultiplier = 1.25; // +25% for 3 days streak
  }
  exp *= streakMultiplier;

  // Step 4: Apply mode bonus
  // ZIYADAH (new memorization) is harder, so it gives more EXP
  const modeMultiplier = mode === "ZIYADAH" ? 1.3 : 1.0;
  exp *= modeMultiplier;

  // Step 5: Apply ayah length bonus
  // Longer passages deserve more reward
  const ayatCount = endAyah - startAyah + 1;
  let lengthMultiplier = 1.0;
  if (ayatCount >= 20) {
    lengthMultiplier = 1.5; // +50% for 20+ ayat
  } else if (ayatCount >= 10) {
    lengthMultiplier = 1.2; // +20% for 10+ ayat
  } else if (ayatCount >= 5) {
    lengthMultiplier = 1.1; // +10% for 5+ ayat
  }
  exp *= lengthMultiplier;

  // Round to nearest integer
  return Math.round(exp);
}

/**
 * Calculate minimum and maximum possible EXP for a session
 * Useful for displaying potential rewards before starting a session
 *
 * @param params - Session parameters (without scores)
 * @returns Object with min and max EXP
 */
export function getExpRange({
  mode,
  startAyah,
  endAyah,
  streakDays,
}: Omit<
  CalculateExpParams,
  "accuracyScore" | "tajweedScore" | "fluencyScore"
>): {
  min: number;
  max: number;
} {
  // Calculate with minimum score (0)
  const minExp = calculateExp({
    accuracyScore: 0,
    tajweedScore: 0,
    fluencyScore: 0,
    mode,
    startAyah,
    endAyah,
    streakDays,
  });

  // Calculate with maximum score (100)
  const maxExp = calculateExp({
    accuracyScore: 100,
    tajweedScore: 100,
    fluencyScore: 100,
    mode,
    startAyah,
    endAyah,
    streakDays,
  });

  return { min: minExp, max: maxExp };
}

/**
 * Get breakdown of EXP calculation for display purposes
 * Shows how each factor contributes to the final EXP
 *
 * @param params - Recitation session parameters
 * @returns Breakdown object with each multiplier and final EXP
 */
export function getExpBreakdown({
  accuracyScore,
  tajweedScore,
  fluencyScore,
  mode,
  startAyah,
  endAyah,
  streakDays,
}: CalculateExpParams): {
  baseScore: number;
  baseExp: number;
  streakBonus: number;
  modeBonus: number;
  lengthBonus: number;
  totalExp: number;
} {
  const baseScore = (accuracyScore + tajweedScore + fluencyScore) / 3;
  const BASE_MULTIPLIER = 5;
  const baseExp = baseScore * BASE_MULTIPLIER;

  // Calculate multipliers
  let streakMultiplier = 1.0;
  if (streakDays >= 14) streakMultiplier = 2.0;
  else if (streakDays >= 7) streakMultiplier = 1.5;
  else if (streakDays >= 3) streakMultiplier = 1.25;

  const modeMultiplier = mode === "ZIYADAH" ? 1.3 : 1.0;

  const ayatCount = endAyah - startAyah + 1;
  let lengthMultiplier = 1.0;
  if (ayatCount >= 20) lengthMultiplier = 1.5;
  else if (ayatCount >= 10) lengthMultiplier = 1.2;
  else if (ayatCount >= 5) lengthMultiplier = 1.1;

  // Calculate bonus percentages
  const streakBonus = Math.round((streakMultiplier - 1) * 100);
  const modeBonus = Math.round((modeMultiplier - 1) * 100);
  const lengthBonus = Math.round((lengthMultiplier - 1) * 100);

  // Calculate total
  const totalExp = calculateExp({
    accuracyScore,
    tajweedScore,
    fluencyScore,
    mode,
    startAyah,
    endAyah,
    streakDays,
  });

  return {
    baseScore: Math.round(baseScore),
    baseExp: Math.round(baseExp),
    streakBonus,
    modeBonus,
    lengthBonus,
    totalExp,
  };
}
