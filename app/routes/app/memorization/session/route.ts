import { NextRequest, NextResponse } from "next/server";
import {
  modelMemorizeValidation,
  modelTranscribeQuran,
} from "@/lib/gemini/gemini";
import {
  memorizeValidationPrompt,
  transcribePrompt,
} from "@/app/api/memorization/prompts";

export async function GET(req: NextRequest) {
  return NextResponse.json({ message: "Hitted" });
}

export async function POST(request: Request) {
  try {
    // 1. Ambil semua data dari FormData yang dikirim oleh frontend
    const formData = await request.formData();
    const audioFile = formData.get("audio") as Blob | null;
    const surat = formData.get("surat") as string | null;
    const startAyat = formData.get("startAyat") as string | null;
    const endAyat = formData.get("endAyat") as string | null;

    // 2. Lakukan validasi input dari frontend
    if (!audioFile || !surat || !startAyat || !endAyat) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: audio, surat, startAyat, or endAyat.",
        },
        { status: 400 }
      );
    }

    // 1. Fetch the quran surah data for ground truth
    const response = await fetch(`https://equran.id/api/v2/surat/${surat}`);
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch Quran data" },
        { status: 500 }
      );
    }
    const quranData = await response.json();
    const ayatArr = quranData.data?.ayat || [];
    const start = parseInt(startAyat) - 1;
    const end = parseInt(endAyat); // slice end is exclusive
    const originalQuranText = ayatArr
      .slice(start, end)
      .map((ayat: { teksArab: string }) => ayat.teksArab)
      .join(" ");

    // 2. Transcribe audio
    // Convert audio buffer to base64 for Gemini
    const transcribePromptResult = transcribePrompt();
    const audioArrayBuffer = await audioFile.arrayBuffer();
    const audioBuffer = Buffer.from(audioArrayBuffer);
    const audioBase64 = audioBuffer.toString("base64");
    const result = await modelTranscribeQuran.transcribe([
      transcribePromptResult,
      {
        inlineData: {
          data: audioBase64,
          mimeType: audioFile.type,
        },
      },
    ]);
    const transcribedAudio =
      result?.candidates &&
      result.candidates[0]?.content &&
      result.candidates[0].content.parts &&
      result.candidates[0].content.parts[0]?.text
        ? result.candidates[0].content.parts[0].text
        : "";
    const cleaned = transcribedAudio
      .replace(/```json\n?/, "")
      .replace(/\n?```/, "");
    const parsed = JSON.parse(cleaned);
    const cleanedTranscribedAudio = parsed.result;
    console.log("Start to validation memorization");
    // 3. Validate the memorization
    const memorizeValidationPromptResult = memorizeValidationPrompt({
      surah: surat,
      startAyah: startAyat,
      endAyah: endAyat,
      originalQuranText,
      transcriptedAudio: cleanedTranscribedAudio,
    });
    const memorizeValidationResult = await modelMemorizeValidation([
      memorizeValidationPromptResult,
      {
        inlineData: {
          data: audioBase64,
          mimeType: audioFile.type,
        },
      },
    ]);
    const memorizeValResult =
      memorizeValidationResult?.candidates &&
      memorizeValidationResult.candidates[0]?.content &&
      memorizeValidationResult.candidates[0].content.parts &&
      memorizeValidationResult.candidates[0].content.parts[0]?.text
        ? memorizeValidationResult.candidates[0].content.parts[0].text
        : "";
    const cleanedMemorizeValidation = memorizeValResult
      .replace(/```json\n?/, "")
      .replace(/\n?```/, "");
    const parsedMemorizeValidation = JSON.parse(cleanedMemorizeValidation);
    const cleanedMemorizeValidationResult = parsedMemorizeValidation;

    return NextResponse.json({
      message: "Memorization validation successful",
      data: {
        cleanedTranscribedAudio,
        originalQuranText,
        cleanedMemorizeValidationResult,
      },
    });
  } catch (error) {
    console.error("Terjadi error di server:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
