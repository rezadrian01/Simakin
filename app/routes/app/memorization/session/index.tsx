import React from 'react';
import { useSearchParams, useNavigate, redirect } from 'react-router';
import type { Route } from './+types/index';
import MemorizationSession from './memorization-session';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import {
    modelMemorizeValidation,
    modelTranscribeQuran,
} from "~/lib/gemini/gemini";
import {
    memorizeValidationPrompt,
    transcribePrompt,
} from "./prompts";
import { db } from "~/lib/db.server";
import { requireUserId } from "~/services/auth/auth.server";

// Loader function to fetch surah data
export async function loader({ request }: Route.LoaderArgs) {
    const url = new URL(request.url);
    const surahNumber = url.searchParams.get('surah');
    const startAyat = url.searchParams.get('start');
    const endAyat = url.searchParams.get('end');
    const type = url.searchParams.get('type');

    if (!surahNumber || !startAyat || !endAyat) {
        return {
            error: 'Parameter tidak lengkap. Silakan kembali dan mulai sesi baru.',
            surahData: null,
        };
    }

    try {
        // Fetch surah data from API
        const response = await fetch(`https://equran.id/api/v2/surat/${surahNumber}`);
        const result = await response.json();

        if (!result.data) {
            throw new Error('Failed to fetch surah data');
        }

        return {
            error: null,
            surahData: {
                surah: {
                    name: result.data.namaLatin,
                    number: result.data.nomor,
                },
                startAyah: startAyat,
                endAyah: endAyat,
                type,
            },
        };
    } catch (error) {
        console.error('Error fetching surah data:', error);
        return {
            error: 'Gagal memuat data surah. Silakan coba lagi.',
            surahData: null,
        };
    }
}

// Action function to handle audio submission
export async function action({ request }: Route.ActionArgs) {
    // Only allow POST requests
    if (request.method !== "POST") {
        throw new Error("Method not allowed");
    }

    try {
        // Get authenticated user ID
        const userId = await requireUserId(request);

        // Get all data from FormData sent by frontend
        const formData = await request.formData();
        const audioFile = formData.get("audio") as File | null;
        const surat = formData.get("surat") as string | null;
        const startAyat = formData.get("startAyat") as string | null;
        const endAyat = formData.get("endAyat") as string | null;
        const type = formData.get("type") as string | null;

        // Validate input from frontend
        if (!audioFile || !surat || !startAyat || !endAyat || !type) {
            throw new Error("Missing required fields: audio, surat, startAyat, endAyat, or type.");
        }

        // Fetch the quran surah data for ground truth
        const response = await fetch(`https://equran.id/api/v2/surat/${surat}`);
        if (!response.ok) {
            throw new Error("Failed to fetch Quran data");
        }

        const quranData = await response.json();
        const ayatArr = quranData.data?.ayat || [];
        const start = parseInt(startAyat) - 1;
        const end = parseInt(endAyat);
        const originalQuranText = ayatArr
            .slice(start, end)
            .map((ayat: { teksArab: string }) => ayat.teksArab)
            .join(" ");

        // Transcribe audio
        const transcribePromptResult = transcribePrompt();
        const audioArrayBuffer = await audioFile.arrayBuffer();
        const audioBuffer = Buffer.from(audioArrayBuffer);
        const audioBase64 = audioBuffer.toString("base64");

        console.log("Starting transcription...");
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

        console.log("Transcription completed successfully");
        console.log("Starting memorization validation...");

        // Validate the memorization
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

        console.log("Memorization validation successful");

        // Calculate duration from audio file (in seconds)
        const duration = Math.round(audioFile.size / 16000);

        // Save to database using Prisma
        const recitation = await db.recitation.create({
            data: {
                userId: userId,
                surah: parseInt(surat),
                startAyah: parseInt(startAyat),
                endAyah: parseInt(endAyat),
                mode: type === "ziyadah" ? "HAFALAN" : "MUROJAAH",
                status: "COMPLETED",
                duration: duration,
                feedback: {
                    create: {
                        transcription: cleanedTranscribedAudio,
                        memorizationErrs: cleanedMemorizeValidationResult.kesalahan_hafalan,
                        tajweedErrs: cleanedMemorizeValidationResult.kesalahan_tajwid,
                        waqfErrs: cleanedMemorizeValidationResult.kesalahan_waqaf,
                        generalAdvice: cleanedMemorizeValidationResult.saran_umum,
                        accuracyScore: cleanedMemorizeValidationResult.accuracy_score,
                        tajweedScore: cleanedMemorizeValidationResult.tajweed_score,
                        fluencyScore: cleanedMemorizeValidationResult.fluency_score,
                        metadataQuran: cleanedMemorizeValidationResult.metadata_quran,
                    },
                },
            },
            include: {
                feedback: true,
            },
        });

        // Update user stats
        const avgScore =
            (cleanedMemorizeValidationResult.accuracy_score +
                cleanedMemorizeValidationResult.tajweed_score +
                cleanedMemorizeValidationResult.fluency_score) /
            3;

        await db.user.update({
            where: { id: userId },
            data: {
                totalSessions: { increment: 1 },
                totalScore: { increment: avgScore },
            },
        });

        console.log("Saved to database successfully with ID:", recitation.id);

        // Redirect to result page
        return redirect(`/app/memorization/result/${recitation.id}`);
    } catch (error) {
        console.error("Error occurred in server:", error);
        throw error;
    }
}

export default function MemorizationSessionPage({ loaderData }: Route.ComponentProps) {
    const navigate = useNavigate();
    const { error, surahData } = loaderData;

    // Error state
    if (error || !surahData) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <Card className="border-destructive">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <AlertCircle className="w-5 h-5" />
                            Terjadi Kesalahan
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground">
                            {error || 'Data sesi tidak ditemukan.'}
                        </p>
                        <Button onClick={() => navigate('/app/memorization/new')}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Kembali ke Halaman Memorization
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <MemorizationSession
            surah={surahData.surah}
            startAyah={surahData.startAyah}
            endAyah={surahData.endAyah}
            type={surahData.type as 'ziyadah' | 'murojaah'}
        />
    );
}