import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { TrendingUp, Calendar, Award, Target } from 'lucide-react'
import { useLoaderData } from 'react-router'
import { formatDateToIndonesian } from '~/utils/indonesian-utils'
import type { Route } from './+types/index'
import { requireUserId } from '~/services/auth/auth.server'
import { getUserStreak } from '~/services/streak/streak.server'

// Loader function to fetch data from database
export async function loader({ request }: Route.LoaderArgs) {
    const userId = await requireUserId(request);

    // Get current streak
    const streak = await getUserStreak(userId);

    // DUMMY DATA - Replace with actual database queries
    return {
        recitations: [
            {
                id: "1",
                surah: "Al-Fatihah",
                mode: "ZIYADAH" as const,
                date: new Date().toISOString(),
                accuracy: 95,
                tajweed: 90,
                fluency: 88,
                duration: 15
            },
            {
                id: "2",
                surah: "Al-Ikhlas",
                mode: "MUROJAAH" as const,
                date: new Date(Date.now() - 86400000).toISOString(),
                accuracy: 88,
                tajweed: 92,
                fluency: 85,
                duration: 12
            },
            {
                id: "3",
                surah: "Al-Baqarah",
                mode: "ZIYADAH" as const,
                date: new Date(Date.now() - 172800000).toISOString(),
                accuracy: 82,
                tajweed: 85,
                fluency: 80,
                duration: 25
            },
            {
                id: "4",
                surah: "An-Nas",
                mode: "MUROJAAH" as const,
                date: new Date(Date.now() - 259200000).toISOString(),
                accuracy: 90,
                tajweed: 88,
                fluency: 92,
                duration: 10
            },
            {
                id: "5",
                surah: "Al-Falaq",
                mode: "ZIYADAH" as const,
                date: new Date(Date.now() - 345600000).toISOString(),
                accuracy: 78,
                tajweed: 80,
                fluency: 75,
                duration: 18
            },
            {
                id: "6",
                surah: "Al-Mulk",
                mode: "ZIYADAH" as const,
                date: new Date(Date.now() - 432000000).toISOString(),
                accuracy: 85,
                tajweed: 87,
                fluency: 83,
                duration: 20
            },
            {
                id: "7",
                surah: "Yasin",
                mode: "MUROJAAH" as const,
                date: new Date(Date.now() - 518400000).toISOString(),
                accuracy: 92,
                tajweed: 94,
                fluency: 90,
                duration: 22
            },
            {
                id: "8",
                surah: "Ar-Rahman",
                mode: "ZIYADAH" as const,
                date: new Date(Date.now() - 604800000).toISOString(),
                accuracy: 87,
                tajweed: 89,
                fluency: 86,
                duration: 24
            },
            {
                id: "9",
                surah: "Al-Waqiah",
                mode: "MUROJAAH" as const,
                date: new Date(Date.now() - 691200000).toISOString(),
                accuracy: 91,
                tajweed: 93,
                fluency: 89,
                duration: 19
            },
            {
                id: "10",
                surah: "Al-Kahf",
                mode: "ZIYADAH" as const,
                date: new Date(Date.now() - 777600000).toISOString(),
                accuracy: 84,
                tajweed: 86,
                fluency: 82,
                duration: 28
            }
        ],
        stats: {
            streak: streak,
            totalSessions: 23,
            weeklyCount: 5,
            avgAccuracy: 87,
            avgTajweed: 89,
            avgFluency: 85
        }
    }
}

export default function ProgressReportPage() {
    const data = useLoaderData<typeof loader>()

    return (
        <div className="container mx-auto px-6 py-8 max-w-7xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">Laporan Progres</h1>
                <p className="text-muted-foreground">Pantau perkembangan hafalan Anda</p>
            </div>

            {/* Stats Summary - Horizontal */}
            <Card className="mb-6">
                <CardContent className="pt-6">
                    <div className="flex flex-wrap gap-6">
                        <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                            <div className="w-12 h-12 rounded-full bg-simakin-primary/10 flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-simakin-primary" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">{data.stats.totalSessions}</p>
                                <p className="text-sm text-muted-foreground">Total Sesi</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                                <Target className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">{data.stats.avgAccuracy}%</p>
                                <p className="text-sm text-muted-foreground">Rata-rata Akurasi</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                            <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                                <Award className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">{data.stats.avgTajweed}%</p>
                                <p className="text-sm text-muted-foreground">Rata-rata Tajweed</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                            <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">{data.stats.streak}</p>
                                <p className="text-sm text-muted-foreground">Streak (hari)</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Sessions */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl font-semibold">Riwayat Sesi</CardTitle>
                    <CardDescription>Semua sesi hafalan Anda</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {data.recitations.length > 0 ? (
                            data.recitations.map((session) => (
                                <div
                                    key={session.id}
                                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-foreground">
                                                {session.surah}
                                            </h3>
                                            <span className={`text-xs px-2 py-1 rounded-full ${session.mode === 'ZIYADAH'
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'bg-green-100 text-green-700'
                                                }`}>
                                                {session.mode === 'ZIYADAH' ? 'Ziyadah' : 'Muroja\'ah'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {formatDateToIndonesian(session.date)}
                                        </p>
                                    </div>
                                    <div className="flex gap-4 items-center">
                                        <div className="text-center">
                                            <p className="text-xs text-muted-foreground">Akurasi</p>
                                            <p className="text-sm font-semibold text-foreground">
                                                {session.accuracy}%
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-muted-foreground">Tajweed</p>
                                            <p className="text-sm font-semibold text-foreground">
                                                {session.tajweed}%
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-muted-foreground">Kelancaran</p>
                                            <p className="text-sm font-semibold text-foreground">
                                                {session.fluency}%
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                                <p className="text-muted-foreground">Belum ada riwayat sesi</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Mulai sesi pertama Anda sekarang!
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}