/**
 * Memorization Service
 *
 * Handles all memorization-related operations:
 * - Parse page ranges using Gemini AI
 * - Save memorization records to database
 * - Validate ziyadah/murojaah eligibility
 * - Query memorization history
 */

import { db } from "~/lib/db.server";
import { modelParsePageRanges } from "~/lib/gemini/gemini";

/**
 * Type definitions for Gemini AI response
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
 * Parse page ranges into structured memorization data using Gemini AI
 *
 * @param pageRanges - Array of page range strings (e.g., ["1-301", "500-604"])
 * @returns Parsed memorization data from Gemini
 */
export async function parsePageRanges(
  pageRanges: string[]
): Promise<ParsePageRangesResponse> {
  const startTime = Date.now();
  console.log("🚀 [PARSE] Starting page range parsing...");
  console.log("📄 [PARSE] Input ranges:", pageRanges);

  try {
    // Combine all page ranges into a single prompt
    const rangesText = pageRanges.join(", ");

    const prompt = `
Please parse the following Qur'an page ranges based on Mushaf Rasm Utsmani:

Page Ranges: ${rangesText}

Convert these page ranges into structured surah and ayah data. Remember to:
1. Split different surahs into separate records
2. Use accurate page-to-ayah mapping for Mushaf Rasm Utsmani
3. Mark whether each surah is completely or partially memorized
4. Return the exact JSON structure specified in the system instruction
        `.trim();

    console.log(
      "🤖 [PARSE] Calling Gemini AI (model: gemini-2.0-flash-exp)..."
    );
    const aiStartTime = Date.now();

    const result = await modelParsePageRanges([{ text: prompt }]);

    const aiDuration = Date.now() - aiStartTime;
    console.log(`⚡ [PARSE] Gemini AI responded in ${aiDuration}ms`);

    // Extract JSON from response
    const responseText =
      result?.candidates &&
      result.candidates[0]?.content &&
      result.candidates[0].content.parts &&
      result.candidates[0].content.parts[0]?.text
        ? result.candidates[0].content.parts[0].text
        : "";

    if (!responseText) {
      console.error("❌ [PARSE] No response text from Gemini AI");
      throw new Error("No response from Gemini AI");
    }

    console.log(
      "📦 [PARSE] Response length:",
      responseText.length,
      "characters"
    );

    // Parse JSON response
    const parsedData: ParsePageRangesResponse = JSON.parse(responseText);

    const totalDuration = Date.now() - startTime;
    console.log("✅ [PARSE] Parsing successful!");
    console.log(
      `📊 [PARSE] Result: ${parsedData.memorizations.length} memorization records`
    );
    console.log(`⏱️  [PARSE] Total duration: ${totalDuration}ms`);

    return parsedData;
  } catch (error) {
    const totalDuration = Date.now() - startTime;
    console.error("❌ [PARSE] Error parsing page ranges with Gemini:", error);
    console.error(`⏱️  [PARSE] Failed after ${totalDuration}ms`);

    if (error instanceof Error) {
      throw new Error(`Failed to parse page ranges: ${error.message}`);
    }
    throw new Error("Failed to parse page ranges. Please try again.");
  }
}

/**
 * Save memorization records from onboarding to database
 *
 * @param userId - User ID
 * @param pageRanges - Array of page range strings
 * @returns Array of created memorization records
 */
export async function saveOnboardingMemorization(
  userId: string,
  pageRanges: string[]
) {
  const startTime = Date.now();
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🎯 [ONBOARD] Starting onboarding memorization save");
  console.log("👤 [ONBOARD] User ID:", userId);
  console.log("📄 [ONBOARD] Page ranges:", pageRanges);

  try {
    // Step 1: Parse page ranges using Gemini AI
    console.log("🔄 [ONBOARD] Step 1: Parsing page ranges with Gemini AI...");
    const parseStartTime = Date.now();

    const parsedData = await parsePageRanges(pageRanges);

    const parseDuration = Date.now() - parseStartTime;
    console.log(`✅ [ONBOARD] Step 1 completed in ${parseDuration}ms`);

    // Step 2: Save each memorization record to database
    console.log(
      `🔄 [ONBOARD] Step 2: Creating ${parsedData.memorizations.length} database records...`
    );
    const dbStartTime = Date.now();

    const createdRecords = await Promise.all(
      parsedData.memorizations.map(async (record, index) => {
        console.log(
          `  📝 [ONBOARD] Creating record ${index + 1}/${
            parsedData.memorizations.length
          }: Surah ${record.surah} (${record.surah_name}), Ayah ${
            record.start_ayah
          }-${record.end_ayah}`
        );
        return await db.userMemorization.create({
          data: {
            userId,
            surah: record.surah,
            startAyah: record.start_ayah,
            endAyah: record.end_ayah,
            status: "COMPLETED",
            source: "ONBOARDING",
            completedAt: new Date(),
          },
        });
      })
    );

    const dbDuration = Date.now() - dbStartTime;
    console.log(`✅ [ONBOARD] Step 2 completed in ${dbDuration}ms`);

    const totalDuration = Date.now() - startTime;
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🎉 [ONBOARD] Onboarding memorization save successful!");
    console.log(`📊 [ONBOARD] Summary:`);
    console.log(`   - Total records: ${createdRecords.length}`);
    console.log(`   - Total surahs: ${parsedData.summary.total_surahs}`);
    console.log(`   - Total ayahs: ${parsedData.summary.total_ayahs}`);
    console.log(`   - Parse time: ${parseDuration}ms`);
    console.log(`   - DB time: ${dbDuration}ms`);
    console.log(`   - Total time: ${totalDuration}ms`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return {
      success: true,
      records: createdRecords,
      summary: parsedData.summary,
    };
  } catch (error) {
    const totalDuration = Date.now() - startTime;
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.error("❌ [ONBOARD] Error saving onboarding memorization");
    console.error("⏱️  [ONBOARD] Failed after:", totalDuration, "ms");
    console.error("📋 [ONBOARD] Error details:", error);
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    throw error;
  }
}

/**
 * Check if user can do ZIYADAH for a specific range
 *
 * @param userId - User ID
 * @param surah - Surah number
 * @param startAyah - Starting ayah
 * @param endAyah - Ending ayah
 * @returns Object with allowed status and reason
 */
export async function canUserDoZiyadah({
  userId,
  surah,
  startAyah,
  endAyah,
}: {
  userId: string;
  surah: number;
  startAyah: number;
  endAyah: number;
}): Promise<{
  allowed: boolean;
  reason?: string;
  suggestion?: string;
  existingRecord?: any;
}> {
  try {
    // Check for exact match or overlapping ranges
    const existingMemorization = await db.userMemorization.findFirst({
      where: {
        userId,
        surah,
        OR: [
          // Exact match
          {
            startAyah: startAyah,
            endAyah: endAyah,
          },
          // User's range overlaps with existing memorization
          {
            AND: [
              { startAyah: { lte: endAyah } },
              { endAyah: { gte: startAyah } },
            ],
          },
        ],
      },
    });

    if (existingMemorization) {
      const isFromOnboarding = existingMemorization.source === "ONBOARDING";
      const isFromSimakin = existingMemorization.source === "SIMAKIN";

      return {
        allowed: false,
        reason: isFromOnboarding
          ? "Anda sudah memiliki hafalan untuk range ayat ini (dari data awal)"
          : "Anda sudah pernah melakukan ziyadah untuk range ayat ini",
        suggestion:
          "Silakan pilih range ayat yang berbeda atau lakukan murojaah untuk range ini",
        existingRecord: {
          surah: existingMemorization.surah,
          startAyah: existingMemorization.startAyah,
          endAyah: existingMemorization.endAyah,
          source: existingMemorization.source,
        },
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error("Error checking ziyadah eligibility:", error);
    throw error;
  }
}

/**
 * Get all memorization records for a user
 *
 * @param userId - User ID
 * @param filters - Optional filters (source, status)
 * @returns Array of memorization records
 */
export async function getUserMemorizations(
  userId: string,
  filters?: {
    source?: "SIMAKIN" | "ONBOARDING" | "MANUAL";
    status?: "PLANNED" | "IN_PROGRESS" | "COMPLETED";
  }
) {
  return await db.userMemorization.findMany({
    where: {
      userId,
      ...(filters?.source && { source: filters.source }),
      ...(filters?.status && { status: filters.status }),
    },
    orderBy: [{ surah: "asc" }, { startAyah: "asc" }],
  });
}

/**
 * Get memorization statistics for a user
 *
 * @param userId - User ID
 * @returns Statistics object
 */
export async function getMemorizationStats(userId: string) {
  const allMemorizations = await db.userMemorization.findMany({
    where: { userId },
  });

  // Calculate statistics
  const totalSurahs = new Set(allMemorizations.map((m) => m.surah)).size;
  const totalAyahs = allMemorizations.reduce(
    (sum, m) => sum + (m.endAyah - m.startAyah + 1),
    0
  );

  const fromOnboarding = allMemorizations.filter(
    (m) => m.source === "ONBOARDING"
  ).length;
  const fromSimakin = allMemorizations.filter(
    (m) => m.source === "SIMAKIN"
  ).length;

  return {
    totalSurahs,
    totalAyahs,
    totalRecords: allMemorizations.length,
    fromOnboarding,
    fromSimakin,
    completedMemorizations: allMemorizations.filter(
      (m) => m.status === "COMPLETED"
    ).length,
  };
}

/**
 * Delete a memorization record (only ONBOARDING or MANUAL sources)
 *
 * @param userId - User ID
 * @param memorizationId - Memorization record ID
 * @returns Deleted record or null
 */
export async function deleteMemorization(
  userId: string,
  memorizationId: string
) {
  // Check if the memorization belongs to user and is deletable
  const memorization = await db.userMemorization.findFirst({
    where: {
      id: memorizationId,
      userId,
      source: { in: ["ONBOARDING", "MANUAL"] }, // Only these can be deleted
    },
  });

  if (!memorization) {
    throw new Error(
      "Memorization not found or cannot be deleted (SIMAKIN records are immutable)"
    );
  }

  return await db.userMemorization.delete({
    where: { id: memorizationId },
  });
}
