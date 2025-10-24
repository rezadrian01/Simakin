import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { BookOpenText, Plus, Calendar, TrendingUp, Clock } from 'lucide-react'
import { Link, useLoaderData } from 'react-router'
import { formatDateToIndonesian } from '~/utils/indonesian-utils'
import type { Route } from './+types/index'

// Loader function to fetch data from database
export async function loader({ request }: Route.LoaderArgs) {
    // TODO: Get userId from session/auth
    const userId = "temp-user-id"

    // DUMMY DATA - Replace with actual database queries
    return {
        recentRecitations: [
            {
                id: "1",
                surah: "Al-Fatihah",
                mode: "HAFALAN" as const,
                date: new Date().toISOString(),
                accuracy: 95,
                tajweed: 90,
            },
            {
                id: "2",
                surah: "Al-Ikhlas",
                mode: "MUROJAAH" as const,
                date: new Date(Date.now() - 86400000).toISOString(),
                accuracy: 88,
                tajweed: 92,
            },
            {
                id: "3",
                surah: "Al-Baqarah",
                mode: "HAFALAN" as const,
                date: new Date(Date.now() - 172800000).toISOString(),
                accuracy: 82,
                tajweed: 85,
            },
            {
                id: "4",
                surah: "An-Nas",
                mode: "MUROJAAH" as const,
                date: new Date(Date.now() - 259200000).toISOString(),
                accuracy: 90,
                tajweed: 88,
            },
            {
                id: "5",
                surah: "Al-Falaq",
                mode: "HAFALAN" as const,
                date: new Date(Date.now() - 345600000).toISOString(),
                accuracy: 78,
                tajweed: 80,
            },
            {
                id: "6",
                surah: "Al-Mulk",
                mode: "HAFALAN" as const,
                date: new Date(Date.now() - 432000000).toISOString(),
                accuracy: 85,
                tajweed: 87,
            },
            {
                id: "7",
                surah: "Yasin",
                mode: "MUROJAAH" as const,
                date: new Date(Date.now() - 518400000).toISOString(),
                accuracy: 92,
                tajweed: 94,
            },
            {
                id: "8",
                surah: "Ar-Rahman",
                mode: "HAFALAN" as const,
                date: new Date(Date.now() - 604800000).toISOString(),
                accuracy: 87,
                tajweed: 89,
            }
        ],
        stats: {
            total: 23,
            weekly: 5,
            avgAccuracy: 87
        }
    }
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
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-amber-100 text-amber-700'
                                                    }`}>
                                                    {session.mode === 'HAFALAN' ? '✓ Selesai' : 'Sedang Berlangsung'}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-semibold text-foreground mb-1">
                                                {session.surah}
                                            </h3>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                                <span>{session.mode === 'HAFALAN' ? 'Ziyadah' : 'Muroja\'ah'}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-simakin-primary/10">
                                            <div className="text-center">
                                                <p className="text-2xl font-bold text-simakin-primary">{session.accuracy}</p>
                                                <p className="text-[10px] text-muted-foreground">/10</p>
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