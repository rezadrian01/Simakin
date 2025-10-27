import React from 'react';
import { useNavigate } from 'react-router';
import type { Route } from './+types/index';
import MemorizationResult from './memorization-result';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { AlertCircle, ArrowLeft } from 'lucide-react';

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
        // TODO: Fetch from database using Prisma
        // const result = await db.recitation.findUnique({
        //   where: { id: recitationId },
        //   include: { feedback: true }
        // })

        // DUMMY DATA - Replace with actual database query
        const dummyResult = {
            id: recitationId,
            surah: {
                name: 'Al-Fatihah',
                number: 1,
            },
            ayahRange: {
                start: 1,
                end: 7,
            },
            type: 'ziyadah' as const,
            date: new Date().toISOString(),
            duration: 180,
            score: 85,
            transcription: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
            originalText: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
            errors: {
                memorization: 2,
                tajweed: 1,
                waqaf: 0,
            },
            memorizationErrors: [
                {
                    ayah: 1,
                    type: 'Kata Terlewat',
                    detail: 'Kata "ٱلرَّحْمَٰنِ" terlewat dalam bacaan',
                },
                {
                    ayah: 3,
                    type: 'Urutan Salah',
                    detail: 'Urutan kata tidak sesuai dengan teks asli',
                },
            ],
            tajweedErrors: [
                {
                    ayah: 1,
                    type: 'Mad',
                    letter: 'اللَّهِ',
                    suggestion: 'Perpanjang bacaan mad pada huruf "ا"',
                },
            ],
            waqafErrors: [],
            generalSuggestion: 'Bacaan sudah cukup baik, namun perlu lebih memperhatikan tajwid pada huruf mad dan ghunnah. Ulangi bacaan beberapa kali untuk memperkuat hafalan.',
        };

        return {
            error: null,
            result: dummyResult,
        };
    } catch (error) {
        console.error('Error fetching result:', error);
        return {
            error: 'Gagal memuat data hasil memorization',
            result: null,
        };
    }
}

export default function MemorizationResultPage({ loaderData }: Route.ComponentProps) {
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
                        <Button onClick={() => navigate('/app/memorization')}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Kembali ke Halaman Memorization
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return <MemorizationResult result={result} />;
}
