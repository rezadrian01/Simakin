import React from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import type { Route } from './+types/index';
import MemorizationSession from './memorization-session';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { AlertCircle, ArrowLeft } from 'lucide-react';

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
        />
    );
}