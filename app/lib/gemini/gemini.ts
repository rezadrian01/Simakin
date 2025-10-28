import { GoogleGenAI } from "@google/genai";
import type { ContentListUnion } from "@google/genai";

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Model to transcribe Quranic recitation
const modelTranscribeQuran = {
  transcribe: (contents: ContentListUnion) => {
    const systemInstruction = `
    You are tasked with transcribing a Quranic recitation from an audio file.
    Your output must be in Hijaiyah script with complete diacritics (harakat).
    Do not refer to the official Quranic text or any external references. Your job is to transcribe exactly what is heard in the audio, even if it contains recitation errors.

    # Instructions:
      Transcribe exactly what is pronounced, including harakat.

      If the reciter mispronounces a vowel (e.g., says kasrah where it should be fathah), you must transcribe what is actually said (in this case, use kasrah).

      Do not attempt to correct or "snap to" the original verse from the Quran.

      Include all recited content, even if incomplete or incorrect.

      Do not omit or auto-correct anything based on prior knowledge of the verse.

      ## Output Format:
      Provide the transcript as plain text in Hijaiyah, including harakat.

      ## Example:
      If the reciter says:
      ٱلْـحَمْدِ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ
      But mispronounces it as:
      ٱلْـحِمْدُ لِلّٰهِ رِبِّ ٱلْعَـٰلِمِينَ
      Then the output must be:
      ٱلْـحِمْدُ لِلّٰهِ رِبِّ ٱلْعَـٰلِمِينَ

      Return only the result in the following JSON format:
      {
        "result": "ٱلْـحِمْدُ لِلّٰهِ رِبِّ ٱلْعَـٰلِمِينَ"
      }
    `;

    return genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents,
      config: {
        systemInstruction,
      },
    });
  },
};

// Model to validate memorization and tajweed
const modelMemorizeValidation = (contents: ContentListUnion) => {
  const systemInstruction = `You are a strict and detailed Qur'an memorization evaluator and tajweed expert.

  You will receive:
  1. Surah name and ayah range
  2. The original Qur'an text in Arabic (ground truth)
  3. A transcription of the user's recitation (from audio)
  4. Metadata: audio file for verification

  Your tasks:

  1. **Transcribe** the recitation audio exactly as the user pronounces it.
    - Be **critical and honest**: Do not automatically align the transcription to the ground truth.
    - If the user pronounces a fatḥah where the ground truth has kasrah, transcribe fatḥah.
    - Your evaluation must reflect the actual audio, not assumptions.

  2. **Evaluate Memorization Accuracy**:
    - Compare transcription vs ground truth.
    - Identify:
      - Wrong words or letters
      - Missing ayah or part of ayah
      - Extra or reordered ayah
    - Mark the exact ayah and type of mistake.

  3. **Evaluate Tajweed Application** using these categories:

  #### 1. **Nun Sukun & Tanwin**
  - **Idzhar Halqi** (Clear) → Example: "مِنْ عِلْمٍ"
  - **Idgham Bighunnah** (Merge + nasal) → Example: "مِنْ وَرَائِهِمْ"
  - **Idgham Bilaghunnah** (Merge w/o nasal) → Example: "مِنْ رَبِّهِمْ"
  - **Iqlab** (Convert to meem + nasal before ب) → Example: "مِن بَعْدِ"
  - **Ikhfa'** (Hidden nasal) → Example: "مِنْ صَدْرِهِمْ"

  #### 2. **Mim Sukun**
  - **Ikhfa' Syafawi** → Example: "تَرْمِيهِمْ بِحِجَارَةٍ"
  - **Idgham Mimi** → Example: "فَهُمْ مُّفْلِحُونَ"
  - **Idzhar Syafawi** → Example: "عَلَيْهِمْ دَائِرَةٌ"

  #### 3. **Lam Al-Ta'rif (Alif Lam Rules)**
  - **Idgham Syamsiyah** → Example: "الشَّمْسُ" → "ash-shams"
  - **Idzhar Qamariyah** → Example: "الْقَمَرُ"

  #### 4. **Madd (Prolongation)**
  - **Mad Thabi'i** (2 counts) → Example: "قَالَ"
  - **Mad Wajib Muttashil** (4–5 counts) → Example: "جَاءَ"
  - **Mad Jaiz Munfashil** (2–5 counts) → Example: "إِنَّا أَعْطَيْنَاكَ"
  - **Mad Aridh Lissukun** (2/4/6 counts) → Example: "نَسْتَعِينُ"
  - **Mad Lazim** (6 counts) → Example: "الصَّاخَّةُ"

  #### 5. **Ghunnah**
  - Nasal 2 counts → Example: "ثُمَّ", "يُنْفِقُونَ"

  #### 6. **Qalqalah**
  - **Sughra** → Example: "يَقْطَعُ"
  - **Kubra** → Example: "الْفَلَقْ"

  #### 7. **Tafkhim vs Tarqiq**
  - **Tafkhim (Heavy)** → Example: "خَلَقَ"
  - **Tarqiq (Light)** → Example: "فِي"

  4. **Evaluate Waqaf (Pauses)**:
    - Identify if the user stops (waqaf) according to standard mushaf symbols.
    - If the user creates a **personal waqaf**, check:
      - Does it change the meaning?  
      - If it risks altering meaning, mark it as a mistake.

  5. **Calculate Scores (0-100)**:
    - **accuracy_score**: Based on memorization accuracy (how correct the words and letters are compared to ground truth). 
      Perfect recitation = 100, minor mistakes = 80-95, major mistakes = below 80.
    - **tajweed_score**: Based on tajweed rules application (nun sukun, mim sukun, madd, qalqalah, etc.). 
      All rules applied correctly = 100, minor errors = 80-95, major errors = below 80.
    - **fluency_score**: Based on smoothness, pace, hesitation, and overall recitation flow. 
      Very smooth and confident = 100, some hesitation = 80-95, many pauses/struggles = below 80.

  6. **Output JSON in Indonesian**, with this exact structure (use English field names):

  {
    "transcription": "Tulis ulang transkrip bacaan user di sini",
    "kesalahan_hafalan": [
      {"ayah": 2, "type": "lafal salah", "detail": "kata 'raiba' dibaca 'roiba'"},
      {"ayah": 3, "type": "ayat kurang", "detail": "bagian akhir ayat belum dibaca"}
    ],
    "kesalahan_tajwid": [
      {"ayah": 2, "type": "mad thabi'i terlalu pendek", "letter": "لا", "suggestion": "panjangkan 2 harakat"}
    ],
    "kesalahan_waqaf": [
      {"ayah": 2, "type": "waqaf tidak sesuai mushaf", "detail": "berhenti di tengah kalimat, berpotensi mengubah arti"}
    ],
    "saran_umum": "Perhatikan idgham bighunnah, mad thabi'i, dan waqaf agar bacaan lebih sempurna.",
    "accuracy_score": 85.5,
    "tajweed_score": 78.0,
    "fluency_score": 90.0,
    "metadata_quran": {
      "surah": "Al-Baqarah",
      "ayat_dari": 1,
      "ayat_sampai": 5,
      "jumlah_ayat": 5
    }
  }
  
  IMPORTANT: Use exact field names as shown:
  - "ayah" (not "ayat")
  - "type" (not "jenis")
  - "letter" (not "huruf")
  - "suggestion" (not "saran")
  
  Return only JSON, no additional commentary.
  `;
  return genAI.models.generateContent({
    // model: "gemini-2.5-pro",
    model: "gemini-2.0-flash",
    contents,
    config: {
      systemInstruction,
    },
  });
};

// Model to parse page ranges into structured memorization data
const modelParsePageRanges = (contents: ContentListUnion) => {
  const systemInstruction = `You are an expert in Qur'an structure and page mapping using Mushaf Rasm Utsmani standard.

  You will receive:
  - One or more page ranges from the Qur'an that a user has memorized
  - Format example: "1-301" or "500-604" or multiple ranges like "1-50, 100-150"

  Your task:
  1. **Convert page ranges to structured surah and ayah ranges**
  2. Use **Mushaf Rasm Utsmani** as the standard reference for page-to-ayah mapping
  3. Break down the pages into individual surah segments
  4. For each segment, provide:
     - Surah number (1-114)
     - Starting ayah number
     - Ending ayah number

  ## Important Rules:
  - If a page range spans multiple surahs, split them into separate records
  - Each record should contain only ONE surah (do not mix surahs)
  - Be precise with ayah numbers based on Mushaf Rasm Utsmani
  - If a surah is complete within the range, use 1 as start and total ayah count as end
  - Output must be in JSON array format
  - BE FAST: This is a time-sensitive operation, prioritize speed while maintaining accuracy

  ## Example Input:
  "Page 1-10"

  ## Example Output:
  {
    "memorizations": [
      {
        "surah": 1,
        "surah_name": "Al-Fatihah",
        "start_ayah": 1,
        "end_ayah": 7,
        "total_ayah": 7,
        "is_complete": true
      },
      {
        "surah": 2,
        "surah_name": "Al-Baqarah",
        "start_ayah": 1,
        "end_ayah": 74,
        "total_ayah": 286,
        "is_complete": false
      }
    ],
    "summary": {
      "total_surahs": 2,
      "total_ayahs": 81,
      "complete_surahs": 1,
      "partial_surahs": 1,
      "page_range": "1-10"
    }
  }

  ## Output Format:
  Return ONLY valid JSON with the exact structure shown above. Do not include markdown formatting or additional text.

  ## Field Descriptions:
  - surah: Surah number (1-114)
  - surah_name: Arabic/Latin name of the surah
  - start_ayah: First ayah number in this range
  - end_ayah: Last ayah number in this range
  - total_ayah: Total ayahs in the complete surah (for reference)
  - is_complete: true if entire surah is memorized, false if partial

  Be extremely accurate with page-to-ayah mapping based on Mushaf Rasm Utsmani.
  `;

  return genAI.models.generateContent({
    model: "gemini-2.0-flash-exp", // Using experimental model for better performance
    contents,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      temperature: 0.1, // Lower temperature for more consistent/faster results
    },
  });
};

export { modelTranscribeQuran, modelMemorizeValidation, modelParsePageRanges };
