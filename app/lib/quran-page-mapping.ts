/**
 * Qur'an Page Mapping using AlQuran Cloud API
 *
 * This module fetches accurate page-to-surah-ayah conversion
 * from AlQuran Cloud API for all 604 pages of Mushaf Rasm Utsmani.
 *
 * API Source: https://alquran.cloud/api
 */

interface AlQuranApiAyah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean | { id: number; recommended: boolean; obligatory: boolean };
  surah: {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    revelationType: string;
    numberOfAyahs: number;
  };
}

interface AlQuranApiResponse {
  code: number;
  status: string;
  data: {
    number: number;
    ayahs: AlQuranApiAyah[];
    surahs: {
      [key: string]: {
        number: number;
        name: string;
        englishName: string;
        englishNameTranslation: string;
        revelationType: string;
        numberOfAyahs: number;
      };
    };
  };
}

interface AlQuranSurahListResponse {
  code: number;
  status: string;
  data: Array<{
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    numberOfAyahs: number;
    revelationType: string;
  }>;
}

/**
 * Fetch page data from AlQuran Cloud API
 */
async function fetchPageData(pageNumber: number): Promise<AlQuranApiResponse> {
  const url = `https://api.alquran.cloud/v1/page/${pageNumber}/quran-uthmani`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch page ${pageNumber}: ${response.statusText}`
    );
  }

  return response.json();
}

/**
 * Fetch ALL surah metadata from AlQuran Cloud API (single request)
 */
async function fetchAllSurahMetadata(): Promise<
  Map<number, { englishName: string; numberOfAyahs: number }>
> {
  const url = `https://api.alquran.cloud/v1/surah`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch surah list: ${response.statusText}`);
  }

  const data: AlQuranSurahListResponse = await response.json();

  // Convert to Map for fast lookup
  const surahMap = new Map<
    number,
    { englishName: string; numberOfAyahs: number }
  >();

  data.data.forEach((surah) => {
    surahMap.set(surah.number, {
      englishName: surah.englishName,
      numberOfAyahs: surah.numberOfAyahs,
    });
  });

  return surahMap;
}

/**
 * Parse discontinuous page ranges (e.g., "1-201, 542-604")
 * Handles gaps by processing each continuous segment separately
 */
async function parseDiscontinuousRanges(
  pageRanges: string[],
  allPages: number[]
): Promise<{
  memorizations: Array<{
    surah: number;
    surah_name: string;
    start_ayah: number;
    end_ayah: number;
    total_ayah: number;
    is_complete: boolean;
  }>;
  summary: {
    total_surahs: number;
    total_ayahs: number;
    complete_surahs: number;
    partial_surahs: number;
    page_range: string;
  };
}> {
  console.log("[PARSE] Processing discontinuous page ranges");

  // Fetch all surah metadata once
  const allSurahMetadata = await fetchAllSurahMetadata();

  // Group pages into continuous segments
  const segments: number[][] = [];
  let currentSegment: number[] = [allPages[0]];

  for (let i = 1; i < allPages.length; i++) {
    if (allPages[i] === allPages[i - 1] + 1) {
      currentSegment.push(allPages[i]);
    } else {
      segments.push(currentSegment);
      currentSegment = [allPages[i]];
    }
  }
  segments.push(currentSegment);

  console.log(
    `[PARSE] Found ${segments.length} continuous segments:`,
    segments.map((s) => `${s[0]}-${s[s.length - 1]}`).join(", ")
  );

  // Process each segment
  const allMemorizations: Array<{
    surah: number;
    surah_name: string;
    start_ayah: number;
    end_ayah: number;
    total_ayah: number;
    is_complete: boolean;
  }> = [];

  for (const segment of segments) {
    const segmentStart = segment[0];
    const segmentEnd = segment[segment.length - 1];

    // Fetch start and end page data for this segment
    const [startPageData, endPageData] = await Promise.all([
      fetchPageData(segmentStart),
      fetchPageData(segmentEnd),
    ]);

    const startAyahs = startPageData.data.ayahs;
    const endAyahs = endPageData.data.ayahs;

    const firstAyah = startAyahs[0];
    const lastAyah = endAyahs[endAyahs.length - 1];

    // Build memorization records for this segment
    let currentSurah = firstAyah.surah.number;
    let currentStartAyah = firstAyah.numberInSurah;

    while (currentSurah <= lastAyah.surah.number) {
      let currentEndAyah: number;
      let surahInfo: {
        englishName: string;
        numberOfAyahs: number;
      };

      if (currentSurah === firstAyah.surah.number) {
        surahInfo = {
          englishName: firstAyah.surah.englishName,
          numberOfAyahs: firstAyah.surah.numberOfAyahs,
        };
      } else if (currentSurah === lastAyah.surah.number) {
        surahInfo = {
          englishName: lastAyah.surah.englishName,
          numberOfAyahs: lastAyah.surah.numberOfAyahs,
        };
      } else {
        const metadata = allSurahMetadata.get(currentSurah);
        if (!metadata) {
          throw new Error(`Surah ${currentSurah} not found in metadata.`);
        }
        surahInfo = metadata;
      }

      if (currentSurah === lastAyah.surah.number) {
        currentEndAyah = lastAyah.numberInSurah;
      } else {
        currentEndAyah = surahInfo.numberOfAyahs;
      }

      // Check if this surah already exists in allMemorizations
      const existingIndex = allMemorizations.findIndex(
        (m) => m.surah === currentSurah
      );

      if (existingIndex !== -1) {
        // Merge with existing record
        const existing = allMemorizations[existingIndex];
        const newStart = Math.min(existing.start_ayah, currentStartAyah);
        const newEnd = Math.max(existing.end_ayah, currentEndAyah);

        allMemorizations[existingIndex] = {
          surah: currentSurah,
          surah_name: surahInfo.englishName,
          start_ayah: newStart,
          end_ayah: newEnd,
          total_ayah: surahInfo.numberOfAyahs,
          is_complete: newStart === 1 && newEnd === surahInfo.numberOfAyahs,
        };
      } else {
        // Add new record
        const isComplete =
          currentStartAyah === 1 && currentEndAyah === surahInfo.numberOfAyahs;

        allMemorizations.push({
          surah: currentSurah,
          surah_name: surahInfo.englishName,
          start_ayah: currentStartAyah,
          end_ayah: currentEndAyah,
          total_ayah: surahInfo.numberOfAyahs,
          is_complete: isComplete,
        });
      }

      currentSurah++;
      currentStartAyah = 1;
    }
  }

  // Sort by surah number
  allMemorizations.sort((a, b) => a.surah - b.surah);

  // Calculate summary
  const totalAyahs = allMemorizations.reduce(
    (sum, m) => sum + (m.end_ayah - m.start_ayah + 1),
    0
  );
  const completeSurahs = allMemorizations.filter((m) => m.is_complete).length;

  return {
    memorizations: allMemorizations,
    summary: {
      total_surahs: allMemorizations.length,
      total_ayahs: totalAyahs,
      complete_surahs: completeSurahs,
      partial_surahs: allMemorizations.length - completeSurahs,
      page_range: pageRanges.join(", "),
    },
  };
}

/**
 * Parse page ranges into surah and ayah ranges using AlQuran Cloud API
 *
 * @param pageRanges - Array of page range strings (e.g., ["1-10", "500-604"])
 * @returns Structured memorization data
 */
export async function parsePageRanges(pageRanges: string[]): Promise<{
  memorizations: Array<{
    surah: number;
    surah_name: string;
    start_ayah: number;
    end_ayah: number;
    total_ayah: number;
    is_complete: boolean;
  }>;
  summary: {
    total_surahs: number;
    total_ayahs: number;
    complete_surahs: number;
    partial_surahs: number;
    page_range: string;
  };
}> {
  const startTime = performance.now();

  const allPages: number[] = [];

  // Parse all page ranges into individual page numbers
  for (const range of pageRanges) {
    const [start, end] = range.split("-").map(Number);
    if (isNaN(start) || isNaN(end)) {
      throw new Error(`Invalid page range: ${range}`);
    }

    if (start < 1 || end > 604) {
      throw new Error(
        `Page range out of bounds: ${range}. Valid pages are 1-604.`
      );
    }

    for (let page = start; page <= end; page++) {
      if (!allPages.includes(page)) {
        allPages.push(page);
      }
    }
  }

  // Sort pages
  allPages.sort((a, b) => a - b);

  if (allPages.length === 0) {
    throw new Error("No valid pages found in ranges");
  }

  const minPage = Math.min(...allPages);
  const maxPage = Math.max(...allPages);

  // Detect if we have gaps (discontinuous ranges)
  const hasGaps = allPages.length !== maxPage - minPage + 1;

  if (hasGaps) {
    console.log("[PARSE] Detected discontinuous ranges");
    return await parseDiscontinuousRanges(pageRanges, allPages);
  }

  // Simple case: continuous range (e.g., "1-201" only)
  console.log(`[PARSE] Fetching page data for ${minPage}-${maxPage}`);

  const [startPageData, endPageData, allSurahMetadata] = await Promise.all([
    fetchPageData(minPage),
    fetchPageData(maxPage),
    fetchAllSurahMetadata(),
  ]);

  // Extract ayahs from both pages
  const startAyahs = startPageData.data.ayahs;
  const endAyahs = endPageData.data.ayahs;

  const firstAyah = startAyahs[0];
  const lastAyah = endAyahs[endAyahs.length - 1];

  // Build memorization records by grouping consecutive ayahs by surah
  const surahRanges = new Map<
    number,
    {
      surahName: string;
      startAyah: number;
      endAyah: number;
      totalAyahs: number;
    }
  >();

  let currentSurah = firstAyah.surah.number;
  let currentStartAyah = firstAyah.numberInSurah;

  while (currentSurah <= lastAyah.surah.number) {
    let currentEndAyah: number;
    let surahInfo: {
      englishName: string;
      numberOfAyahs: number;
    };

    if (currentSurah === firstAyah.surah.number) {
      surahInfo = {
        englishName: firstAyah.surah.englishName,
        numberOfAyahs: firstAyah.surah.numberOfAyahs,
      };
    } else if (currentSurah === lastAyah.surah.number) {
      surahInfo = {
        englishName: lastAyah.surah.englishName,
        numberOfAyahs: lastAyah.surah.numberOfAyahs,
      };
    } else {
      const metadata = allSurahMetadata.get(currentSurah);
      if (!metadata) {
        throw new Error(
          `Surah ${currentSurah} not found in metadata. This should not happen.`
        );
      }
      surahInfo = metadata;
    }

    if (currentSurah === lastAyah.surah.number) {
      currentEndAyah = lastAyah.numberInSurah;
    } else {
      currentEndAyah = surahInfo.numberOfAyahs;
    }

    surahRanges.set(currentSurah, {
      surahName: surahInfo.englishName,
      startAyah: currentStartAyah,
      endAyah: currentEndAyah,
      totalAyahs: surahInfo.numberOfAyahs,
    });

    currentSurah++;
    currentStartAyah = 1;
  }

  // Convert to memorizations array
  const memorizations = Array.from(surahRanges.entries()).map(
    ([surah, range]) => {
      const isComplete =
        range.startAyah === 1 && range.endAyah === range.totalAyahs;

      return {
        surah,
        surah_name: range.surahName,
        start_ayah: range.startAyah,
        end_ayah: range.endAyah,
        total_ayah: range.totalAyahs,
        is_complete: isComplete,
      };
    }
  );

  // Calculate summary
  const totalAyahs = memorizations.reduce(
    (sum, m) => sum + (m.end_ayah - m.start_ayah + 1),
    0
  );
  const completeSurahs = memorizations.filter((m) => m.is_complete).length;

  const duration = Math.round(performance.now() - startTime);
  console.log(
    `[PARSE] Completed in ${duration}ms - ${memorizations.length} surahs`
  );

  return {
    memorizations,
    summary: {
      total_surahs: memorizations.length,
      total_ayahs: totalAyahs,
      complete_surahs: completeSurahs,
      partial_surahs: memorizations.length - completeSurahs,
      page_range: pageRanges.join(", "),
    },
  };
}
