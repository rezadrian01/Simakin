import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { BookOpenText, Plus, Calendar, TrendingUp, Clock } from 'lucide-react'
import { Link, useLoaderData } from 'react-router'
import { formatDateToIndonesian } from '~/utils/indonesian-utils'
import type { Route } from './+types/index'
import { db } from '~/lib/db.server'
import { requireUserId } from '~/services/auth/auth.server'

// Loader function to fetch data from database
export async function loader({ request }: Route.LoaderArgs) {
    // Get authenticated user ID
    const userId = await requireUserId(request);

    // Fetch recitations from database
    const recitations = await db.recitation.findMany({
        where: {
            userId: userId,
            status: 'COMPLETED',
        },
        include: {
            feedback: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
        take: 20, // Limit to 20 most recent
    });

    // Fetch surah names from Equran API for each unique surah
    const surahNumbers = [...new Set(recitations.map(r => r.surah))];
    const surahDataMap = new Map();

    await Promise.all(
        surahNumbers.map(async (surahNum) => {
            try {
                const response = await fetch(`https://equran.id/api/v2/surat/${surahNum}`);
                const data = await response.json();
                surahDataMap.set(surahNum, data.data?.namaLatin || `Surah ${surahNum}`);
            } catch (error) {
                surahDataMap.set(surahNum, `Surah ${surahNum}`);
            }
        })
    );

    // Map to display format
    const recentRecitations = recitations.map(recitation => {
        const avgScore = recitation.feedback
            ? Math.round(
                (recitation.feedback.accuracyScore +
                    recitation.feedback.tajweedScore +
                    recitation.feedback.fluencyScore) / 3
            )
            : 0;

        return {
            id: recitation.id,
            surah: surahDataMap.get(recitation.surah) || `Surah ${recitation.surah}`,
            surahNumber: recitation.surah,
            ayahRange: `${recitation.startAyah}-${recitation.endAyah}`,
            mode: recitation.mode,
            date: recitation.createdAt.toISOString(),
            accuracy: avgScore,
            tajweed: recitation.feedback?.tajweedScore || 0,
            duration: recitation.duration || 0,
        };
    });

    // Calculate stats
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const weeklyRecitations = recitations.filter(
        r => new Date(r.createdAt) >= oneWeekAgo
    );

    const allScores = recitations
        .filter(r => r.feedback)
        .map(r => {
            if (!r.feedback) return 0;
            return (
                r.feedback.accuracyScore +
                r.feedback.tajweedScore +
                r.feedback.fluencyScore
            ) / 3;
        });

    const avgAccuracy = allScores.length > 0
        ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
        : 0;

    return {
        recentRecitations,
        stats: {
            total: recitations.length,
            weekly: weeklyRecitations.length,
            avgAccuracy,
        }
    };
}


export default function MemorizationPage() {
    const data = useLoaderData<typeof loader>()

    return (
        <div className="container mx-auto px-6 py-8 max-w-7xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">Hafalan</h1>
                <p className="text-muted-foreground">Kelola dan pantau progres hafalan Al-Qur'an Anda</p>
            </div>

            {/* Stats Bar */}
            <div className="bg-card rounded-lg border p-6 mb-6">
                <div className="flex flex-wrap gap-8">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-simakin-primary/10 flex items-center justify-center">
                            <BookOpenText className="w-6 h-6 text-simakin-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{data.stats.total}</p>
                            <p className="text-sm text-muted-foreground">Total Sesi</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{data.stats.weekly}</p>
                            <p className="text-sm text-muted-foreground">Minggu Ini</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{data.stats.avgAccuracy}%</p>
                            <p className="text-sm text-muted-foreground">Rata-rata Akurasi</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Button */}
            <div className="mb-8">
                <Link to="/app/memorization/new">
                    <Button size="lg" className="w-full h-14 text-base">
                        <Plus className="w-5 h-5 mr-2" />
                        Buat Sesi Hafalan Baru
                    </Button>
                </Link>
            </div>

            {/* Recent Sessions Title */}
            <div className="mb-4">
                <h2 className="text-xl font-semibold text-foreground">Sebelumnya</h2>
            </div>

            {/* Sessions Grid */}
            {data.recentRecitations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.recentRecitations.map((session) => (
                        <Link
                            key={session.id}
                            to={`/app/memorization/result/${session.id}`}
                        >
                            <Card className="hover:shadow-md transition-all cursor-pointer border-2 h-full">
                                <CardContent className="p-5">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${session.mode === 'HAFALAN'
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
                                                    }`}>
                                                    {session.mode === 'HAFALAN' ? 'Ziyadah' : 'Murojaah'}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-semibold text-foreground mb-1">
                                                {session.surah}
                                            </h3>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                                <span>Ayat {session.ayahRange}</span>
                                                {session.duration > 0 && (
                                                    <>
                                                        <span>•</span>
                                                        <Clock className="w-3 h-3" />
                                                        <span>{Math.ceil(session.duration / 60)} menit</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-simakin-primary/10">
                                            <div className="text-center">
                                                <p className="text-2xl font-bold text-simakin-primary">{session.accuracy}</p>
                                                <p className="text-[10px] text-muted-foreground">%</p>
                                            </div>
                                        </div>
                                    </div>


                                    <p className="text-xs text-muted-foreground">
                                        {formatDateToIndonesian(session.date)}
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="py-12">
                        <div className="text-center">
                            <BookOpenText className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-semibold text-foreground mb-2">
                                Belum Ada Riwayat
                            </h3>
                            <p className="text-muted-foreground mb-4">
                                Mulai sesi hafalan pertama Anda sekarang
                            </p>
                            <Link to="/app/memorization/new">
                                <Button>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Mulai Sekarang
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}