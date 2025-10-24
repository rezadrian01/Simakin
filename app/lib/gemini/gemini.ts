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
  const systemInstruction = `You are a strict and detailed Qur’an memorization evaluator and tajweed expert.

  You will receive:
  1. Surah name and ayah range
  2. The original Qur’an text in Arabic (ground truth)
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
  - **Idgham Bilaghunnah** (Merge w/o nasal) → Example: "مِنْ رَبِّهِمْ"
  - **Iqlab** (Convert to meem + nasal before ب) → Example: "مِن بَعْدِ"
  - **Ikhfa’** (Hidden nasal) → Example: "مِنْ صَدْرِهِمْ"

  #### 2. **Mim Sukun**
  - **Ikhfa’ Syafawi** → Example: "تَرْمِيهِمْ بِحِجَارَةٍ"
  - **Idgham Mimi** → Example: "فَهُمْ مُّفْلِحُونَ"
  - **Idzhar Syafawi** → Example: "عَلَيْهِمْ دَائِرَةٌ"

  #### 3. **Lam Al-Ta’rif (Alif Lam Rules)**
  - **Idgham Syamsiyah** → Example: "الشَّمْسُ" → "ash-shams"
  - **Idzhar Qamariyah** → Example: "الْقَمَرُ"

  #### 4. **Madd (Prolongation)**
  - **Mad Thabi’i** (2 counts) → Example: "قَالَ"
  - **Mad Wajib Muttashil** (4–5 counts) → Example: "جَاءَ"
  - **Mad Jaiz Munfashil** (2–5 counts) → Example: "إِنَّا أَعْطَيْنَاكَ"
  - **Mad Aridh Lissukun** (2/4/6 counts) → Example: "نَسْتَعِينُ"
  - **Mad Lazim** (6 counts) → Example: "الصَّاخَّةُ"

  #### 5. **Ghunnah**
  - Nasal 2 counts → Example: "ثُمَّ", "يُنْفِقُونَ"

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

  5. **Output JSON in Indonesian**, with this structure:

  {
    "transcription": "Tulis ulang transkrip bacaan user di sini",
    "kesalahan_hafalan": [
      {"ayat": 2, "jenis": "lafal salah", "detail": "kata 'raiba' dibaca 'roiba'"},
      {"ayat": 3, "jenis": "ayat kurang", "detail": "bagian akhir ayat belum dibaca"}
    ],
    "kesalahan_tajwid": [
      {"ayat": 2, "jenis": "mad thabi’i terlalu pendek", "huruf": "لا", "saran": "panjangkan 2 harakat"}
    ],
    "kesalahan_waqaf": [
      {"ayat": 2, "jenis": "waqaf tidak sesuai mushaf", "detail": "berhenti di tengah kalimat, berpotensi mengubah arti"}
    ],
    "saran_umum": "Perhatikan idgham bighunnah, mad thabi’i, dan waqaf agar bacaan lebih sempurna.",
    "metadata_quran": {
      "surah": "Al-Baqarah",
      "ayat_dari": 1,
      "ayat_sampai": 5,
      "jumlah_ayat": 5
    }
  }
  Return only JSON, no additional commentary.
  `;
  return genAI.models.generateContent({
    model: "gemini-2.5-pro",
    contents,
    config: {
      systemInstruction,
    },
  });
};

export { modelTranscribeQuran, modelMemorizeValidation };
