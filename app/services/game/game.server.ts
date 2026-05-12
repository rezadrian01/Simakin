/**
 * Game Service — Shared helpers for minigame question generation.
 * All 4 minigames use these utilities to fetch Quran data and build questions.
 */

interface SurahData {
  nomor: number;
  namaLatin: string;
  nama: string;
  jumlahAyat: number;
}

interface AyahData {
  nomor: number;
  teksArab: string;
  teksLatin?: string;
}

interface ShuffledOptions<T> {
  options: T[];
  correctIndex: number;
}

// ============================================
// External API
// ============================================

const EQURAN_BASE = "https://equran.id/api/v2";

export async function fetchSurahList(): Promise<SurahData[]> {
  const res = await fetch(`${EQURAN_BASE}/surat`);
  const data = await res.json();
  return data.data as SurahData[];
}

export async function fetchSurah(surahNumber: number): Promise<{
  namaLatin: string;
  ayat: AyahData[];
}> {
  const res = await fetch(`${EQURAN_BASE}/surat/${surahNumber}`);
  const data = await res.json();
  return {
    namaLatin: data.data.namaLatin,
    ayat: data.data.ayat as AyahData[],
  };
}

// ============================================
// Core helpers
// ============================================

/**
 * Pick a random surah, optionally requiring a minimum number of ayahs.
 */
export async function getRandomSurah(minAyahs = 1): Promise<SurahData> {
  const surahs = await fetchSurahList();
  const valid = surahs.filter((s) => s.jumlahAyat >= minAyahs);
  return valid[Math.floor(Math.random() * valid.length)];
}

/**
 * Pick a random ayah from a surah, optionally excluding first/last.
 */
export function getRandomAyah(
  ayat: AyahData[],
  exclude?: "first" | "last"
): AyahData {
  let pool = ayat;
  if (exclude === "first") pool = ayat.slice(1);
  if (exclude === "last") pool = ayat.slice(0, -1);
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Get N random surah Latin names excluding the given surah number.
 */
export async function getDistractorSurahNames(
  excludeNumber: number,
  count: number
): Promise<string[]> {
  const surahs = await fetchSurahList();
  const others = surahs.filter((s) => s.nomor !== excludeNumber);
  const shuffled = others.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((s) => s.namaLatin);
}

/**
 * Get N random words from a list of ayahs (excluding a specific word).
 */
export function getDistractorWords(
  allWords: string[],
  correctWord: string,
  count: number
): string[] {
  const pool = allWords.filter((w) => w !== correctWord && w.length > 2);
  const shuffled = pool.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Shuffle 4 options and track which index is correct.
 */
export function shuffleOptions<T>(correct: T, distractors: T[]): ShuffledOptions<T> {
  const options = [correct, ...distractors];
  // Fisher-Yates shuffle
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return {
    options,
    correctIndex: options.indexOf(correct),
  };
}

// ============================================
// Question generators (one per game)
// ============================================

/**
 * TEBAK SURAH — show 2 consecutive ayahs, pick the correct surah name.
 */
export async function generateTebakSurahQuestion() {
  const surah = await getRandomSurah(2);
  const { namaLatin, ayat } = await fetchSurah(surah.nomor);

  // Pick 2 consecutive ayahs
  const startIdx = Math.floor(Math.random() * (ayat.length - 1));
  const selectedAyahs = [ayat[startIdx], ayat[startIdx + 1]];

  const distractorNames = await getDistractorSurahNames(surah.nomor, 3);
  const { options, correctIndex } = shuffleOptions(namaLatin, distractorNames);

  return {
    ayahs: selectedAyahs.map((a) => a.teksArab),
    surahName: namaLatin,
    options,
    correctIndex,
  };
}

/**
 * SAMBUNG AYAT — show ayah N, pick which is ayah N+1.
 */
export async function generateSambungAyatQuestion() {
  // Need a surah with at least 2 ayahs, pick a non-last ayah
  const surah = await getRandomSurah(2);
  const { namaLatin, ayat } = await fetchSurah(surah.nomor);

  // Pick a random ayah (not the last one)
  const currentIdx = Math.floor(Math.random() * (ayat.length - 1));
  const currentAyah = ayat[currentIdx];
  const nextAyah = ayat[currentIdx + 1];

  // Distractors: random ayahs from other surahs
  const otherSurahs = await Promise.all(
    Array.from({ length: 3 }, () => getRandomSurah(1))
  );
  const distractorAyahs = await Promise.all(
    otherSurahs.map(async (s) => {
      const data = await fetchSurah(s.nomor);
      return data.ayat[Math.floor(Math.random() * data.ayat.length)].teksArab;
    })
  );

  const { options, correctIndex } = shuffleOptions(nextAyah.teksArab, distractorAyahs);

  return {
    questionAyah: currentAyah.teksArab,
    surahName: namaLatin,
    options,
    correctIndex,
  };
}

/**
 * URUTAN AYAT — show 4 consecutive shuffled ayahs, pick which comes first.
 */
export async function generateUrutanAyatQuestion() {
  // Need at least 4 ayahs
  const surah = await getRandomSurah(5);
  const { namaLatin, ayat } = await fetchSurah(surah.nomor);

  // Pick 4 consecutive ayahs
  const startIdx = Math.floor(Math.random() * (ayat.length - 3));
  const selected = ayat.slice(startIdx, startIdx + 4).map((a) => ({
    teksArab: a.teksArab,
    nomor: a.nomor,
  }));

  // Shuffle
  const shuffled = [...selected].sort(() => Math.random() - 0.5);

  return {
    options: shuffled.map((a) => ({ text: a.teksArab, ayahNumber: a.nomor })),
    correctIndex: shuffled.findIndex((a) => a.nomor === selected[0].nomor),
  };
}

/**
 * LENGKAPI AYAT — show ayah with one word blanked, pick the missing word.
 */
export async function generateLengkapiAyatQuestion() {
  const surah = await getRandomSurah(3);
  const { namaLatin, ayat } = await fetchSurah(surah.nomor);

  // Pick a random ayah (not first or last, must have enough words)
  const validIndices: number[] = [];
  for (let i = 1; i < ayat.length - 1; i++) {
    const words = ayat[i].teksArab.trim().split(/\s+/);
    if (words.length >= 4) validIndices.push(i);
  }

  if (validIndices.length === 0) {
    // Fallback: try another surah recursively
    return generateLengkapiAyatQuestion();
  }

  const ayahIdx = validIndices[Math.floor(Math.random() * validIndices.length)];
  const ayah = ayat[ayahIdx];
  const words = ayah.teksArab.trim().split(/\s+/);

  // Blank out a middle word (not first or last)
  const wordIdx = Math.floor(1 + Math.random() * (words.length - 2));
  const correctWord = words[wordIdx];
  words[wordIdx] = "___";

  // Collect all words from all ayahs in this surah for distractors
  const allWords: string[] = [];
  for (const a of ayat) {
    allWords.push(...a.teksArab.trim().split(/\s+/).filter((w) => w.length > 2 && w !== correctWord));
  }

  const distractorWords = getDistractorWords(allWords, correctWord, 3);
  const { options, correctIndex } = shuffleOptions(correctWord, distractorWords);

  return {
    ayahWithBlank: words.join(" "),
    surahName: namaLatin,
    ayahNumber: ayah.nomor,
    options,
    correctIndex,
  };
}

/**
 * Generate 10 questions for a given game type.
 */
export async function generateQuestions(gameType: string, count = 10) {
  const generators: Record<string, () => Promise<any>> = {
    TEBAK_SURAH: generateTebakSurahQuestion,
    SAMBUNG_AYAT: generateSambungAyatQuestion,
    URUTAN_AYAT: generateUrutanAyatQuestion,
    LENGKAPI_AYAT: generateLengkapiAyatQuestion,
  };

  const gen = generators[gameType];
  if (!gen) throw new Error(`Unknown game type: ${gameType}`);

  return Promise.all(Array.from({ length: count }, () => gen()));
}