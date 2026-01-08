import React from 'react';
import { useNavigate } from 'react-router';
import type { Route } from './+types/index';
import RecitationResult from './recitation-result';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { db } from '~/lib/db.server';

// Loader function to fetch memorization result
export async function loader({ params }: Route.LoaderArgs) {
    const recitationId = params.id;

    if (!recitationId) {
        return {
            error: 'ID tidak valid',
            result: null,
        };
    }

    try {
        // Fetch from database using Prisma
        const recitation = await db.recitation.findUnique({
            where: { id: recitationId },
            include: {
                feedback: true,
            },
        });

        if (!recitation || !recitation.feedback) {
            return {
                error: 'Data hasil tidak ditemukan',
                result: null,
            };
        }

        // Fetch surah data
        const surahResponse = await fetch(
            `https://equran.id/api/v2/surat/${recitation.surah}`
        );
        const surahData = await surahResponse.json();

        // Extract original Quran text
        const ayatArr = surahData.data?.ayat || [];
        const start = recitation.startAyah - 1;
        const end = recitation.endAyah;
        const originalQuranText = ayatArr
            .slice(start, end)
            .map((ayat: { teksArab: string }) => ayat.teksArab)
            .join(' ');

        const feedback = recitation.feedback;
        const metadataQuran = feedback.metadataQuran as any;

        // Calculate average score
        const avgScore =
            (feedback.accuracyScore + feedback.tajweedScore + feedback.fluencyScore) / 3;

        const result = {
            id: recitation.id,
            surah: {
                name: surahData.data?.namaLatin || 'Unknown',
                number: recitation.surah,
            },
            ayahRange: {
                start: recitation.startAyah,
                end: recitation.endAyah,
            },
            type: recitation.mode === 'ZIYADAH' ? ('ziyadah' as const) : ('murojaah' as const),
            date: recitation.createdAt.toISOString(),
            duration: recitation.duration || 0,
            score: Math.round(avgScore),
            transcription: feedback.transcription || '',
            originalText: originalQuranText,
            errors: {
                memorization: Array.isArray(feedback.memorizationErrs)
                    ? (feedback.memorizationErrs as any[]).length
                    : 0,
                tajweed: Array.isArray(feedback.tajweedErrs)
                    ? (feedback.tajweedErrs as any[]).length
                    : 0,
                waqaf: Array.isArray(feedback.waqfErrs)
                    ? (feedback.waqfErrs as any[]).length
                    : 0,
            },
            memorizationErrors: (feedback.memorizationErrs as any[]) || [],
            tajweedErrors: (feedback.tajweedErrs as any[]) || [],
            waqafErrors: (feedback.waqfErrs as any[]) || [],
            generalSuggestion: feedback.generalAdvice || '',
            scores: {
                accuracy: feedback.accuracyScore,
                tajweed: feedback.tajweedScore,
                fluency: feedback.fluencyScore,
            },
        };

        return {
            error: null,
            result,
        };
    } catch (error) {
        console.error('Error fetching result:', error);
        return {
            error: 'Gagal memuat data hasil memorization',
            result: null,
        };
    }
}

export default function RecitationResultPage({ loaderData }: Route.ComponentProps) {
    const navigate = useNavigate();
    const { error, result } = loaderData;

    // Error state
    if (error || !result) {
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
                            {error || 'Data hasil tidak ditemukan.'}
                        </p>
                        <Button onClick={() => navigate('/app/recitation')}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Kembali ke Halaman Memorization
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return <RecitationResult result={result} />;
}
