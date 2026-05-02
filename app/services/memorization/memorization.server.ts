/**
 * Memorization Service
 *
 * Handles all memorization-related operations:
 * - Parse page ranges using AlQuran Cloud API
 * - Save memorization records to database
 * - Validate ziyadah/murojaah eligibility
 * - Query memorization history
 */

import { db } from "~/lib/db.server";
import { parsePageRanges } from "~/lib/quran-page-mapping";

/**
 * Type definitions for API response
 */
interface MemorizationRecord {
  surah: number;
  surah_name: string;
  start_ayah: number;
  end_ayah: number;
  total_ayah: number;
  is_complete: boolean;
}

interface ParsePageRangesResponse {
  memorizations: MemorizationRecord[];
  summary: {
    total_surahs: number;
    total_ayahs: number;
    complete_surahs: number;
    partial_surahs: number;
    page_range: string;
  };
}

/**
 * Save initial memorization data during onboarding
 *
 * @param userId - User ID
 * @param pageRanges - Array of page range strings
 */
export async function saveOnboardingMemorization(
  userId: string,
  pageRanges: string[]
): Promise<{
  success: boolean;
  count: number;
  summary: ParsePageRangesResponse["summary"];
}> {
  console.log("[ONBOARD] Starting memorization save for user:", userId);
  console.log("[ONBOARD] Page ranges:", pageRanges);

  const parseStartTime = Date.now();

  // Parse page ranges using AlQuran Cloud API
  const parsedData = await parsePageRanges(pageRanges);

  const parseDuration = Date.now() - parseStartTime;
  console.log(
    `[ONBOARD] Parsed ${parsedData.memorizations.length} surahs in ${parseDuration}ms`
  );

  // Save to database
  const dbStartTime = Date.now();

  await db.userMemorization.createMany({
    data: parsedData.memorizations.map((mem) => ({
      userId,
      surah: mem.surah,
      startAyah: mem.start_ayah,
      endAyah: mem.end_ayah,
      status: "COMPLETED",
      source: "ONBOARDING",
      completedAt: new Date(),
    })),
  });

  const dbDuration = Date.now() - dbStartTime;
  console.log(
    `[ONBOARD] Saved ${parsedData.memorizations.length} records to DB in ${dbDuration}ms`
  );

  return {
    success: true,
    count: parsedData.memorizations.length,
    summary: parsedData.summary,
  };
}

/**
 * Check if user can start a new ziyadah session
 *
 * User can do ziyadah if there's no overlap with existing memorizations
 *
 * @param userId - User ID
 * @param surah - Surah number
 * @param startAyah - Starting ayah
 * @param endAyah - Ending ayah
 */
export async function canUserDoZiyadah(
  userId: string,
  surah: number,
  startAyah: number,
  endAyah: number
): Promise<{ canDo: boolean; reason?: string }> {
  // Check for overlapping memorizations
  const existingMemorizations = await db.userMemorization.findMany({
    where: {
      userId,
      surah,
    },
  });

  for (const existing of existingMemorizations) {
    // Check if ranges overlap
    const hasOverlap =
      (startAyah >= existing.startAyah && startAyah <= existing.endAyah) ||
      (endAyah >= existing.startAyah && endAyah <= existing.endAyah) ||
      (startAyah <= existing.startAyah && endAyah >= existing.endAyah);

    if (hasOverlap) {
      return {
        canDo: false,
        reason: `Overlap detected with existing memorization (Ayah ${existing.startAyah}-${existing.endAyah})`,
      };
    }
  }

  return { canDo: true };
}

/**
 * Get user's memorization history
 *
 * @param userId - User ID
 */
export async function getUserMemorizations(userId: string) {
  return await db.userMemorization.findMany({
    where: { userId },
    orderBy: [{ surah: "asc" }, { startAyah: "asc" }],
  });
}

/**
 * Get user's memorization statistics
 *
 * @param userId - User ID
 */
export async function getUserMemorizationStats(userId: string) {
  const memorizations = await getUserMemorizations(userId);

  const totalSurahs = new Set(memorizations.map((m) => m.surah)).size;

  // Calculate complete surahs based on ayah coverage
  // A surah is complete if start=1 and end=total ayahs in that surah
  // We need to check against actual surah ayah counts
  const SURAH_AYAH_COUNTS: Record<number, number> = {
    1: 7,
    2: 286,
    3: 200,
    4: 176,
    5: 120,
    6: 165,
    7: 206,
    8: 75,
    9: 129,
    10: 109,
    // Add more as needed - this is simplified
  };

  const completeSurahs = memorizations.filter((m) => {
    const totalAyahs = SURAH_AYAH_COUNTS[m.surah] || 0;
    return m.startAyah === 1 && m.endAyah === totalAyahs;
  }).length;

  const totalAyahs = memorizations.reduce(
    (sum, m) => sum + (m.endAyah - m.startAyah + 1),
    0
  );

  return {
    totalSurahs,
    completeSurahs,
    partialSurahs: totalSurahs - completeSurahs,
    totalAyahs,
    memorizations,
  };
}
