export const transcribePrompt = () => {
  return `
  Please transcribe the following Quranic recitation audio input strictly based on what is heard.

  Ensure all hijaiyah letters and harakat (vowel markings) are included exactly as pronounced — including any mispronunciations, mistakes, unusual pauses, or incorrect vowel lengths.

  Do not correct or infer anything based on external references, known Quranic verses, or tajwid rules. Just transcribe exactly what is heard.

  Return only the following JSON structure with no additional comments or explanation and dont return in markdown format, only return the result in this exact JSON structure:

  {
    "result": "<full transcribed text with harakat>"
  }

    `;
};

export const memorizeValidationPrompt = ({
  surah,
  startAyah,
  endAyah,
  transcriptedAudio,
  originalQuranText,
}: {
  surah: string;
  startAyah: string;
  endAyah: string;
  transcriptedAudio: string;
  originalQuranText: string;
}) => {
  return `Evaluate the following memorized recitation:

Surah: ${surah}
Ayat range: ${startAyah} to ${endAyah}

Ground truth: ${originalQuranText}

User transcription: ${transcriptedAudio}

Please return your assessment following the instruction given.

  `;
};
