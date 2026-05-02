import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { BookOpenText, Plus, Calendar, TrendingUp, Clock, Award, Target, Loader2 } from 'lucide-react'
import { Link, useLoaderData, useFetcher } from 'react-router'
import { formatDateToIndonesian } from '~/utils/indonesian-utils'
import type { Route } from './+types/index'
import { db } from '~/lib/db.server'
import { requireUserId } from '~/services/auth/auth.server'

const ITEMS_PER_PAGE = 10;

// Loader function to fetch data from database
export async function loader({ request }: Route.LoaderArgs) {
    // Get authenticated user ID
    const userId = await requireUserId(request);

    // Get pagination params from URL
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = ITEMS_PER_PAGE;
    const skip = (page - 1) * limit;

    // Fetch total count for pagination
    const totalCount = await db.recitation.count({
        where: {
            userId: userId,
            status: 'COMPLETED',
        },
    });

    // Fetch recitations from database with pagination
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
        take: limit,
        skip: skip,
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

    // Calculate stats (for all data, not just current page)
    const allRecitations = await db.recitation.findMany({
        where: {
            userId: userId,
            status: 'COMPLETED',
        },
        include: {
            feedback: true,
        },
    });

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const weeklyRecitations = allRecitations.filter(
        r => new Date(r.createdAt) >= oneWeekAgo
    );

    const allScores = allRecitations
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

    // Calculate total time (in minutes)
    const totalMinutes = allRecitations.reduce((acc, r) => acc + (r.duration || 0), 0);
    const totalTime = Math.ceil(totalMinutes / 60);

    const hasMore = skip + recitations.length < totalCount;

    return {
        recentRecitations,
        stats: {
            total: totalCount,
            weekly: weeklyRecitations.length,
            avgAccuracy,
            totalTime,
        },
        pagination: {
            currentPage: page,
            hasMore,
            totalCount,
        }
    };
}


export default function RecitationPage() {
    const data = useLoaderData<typeof loader>()
    const fetcher = useFetcher<typeof loader>()
    const [allRecitations, setAllRecitations] = useState(data.recentRecitations)
    const [currentPage, setCurrentPage] = useState(data.pagination.currentPage)
    const [hasMore, setHasMore] = useState(data.pagination.hasMore)

    // Ref for the loader element (intersection observer target)
    const loaderRef = useRef<HTMLDivElement>(null)

    // Append new data when fetcher completes
    useEffect(() => {
        if (fetcher.data?.recentRecitations) {
            setAllRecitations(prev => [...prev, ...fetcher.data!.recentRecitations])
            setCurrentPage(fetcher.data.pagination.currentPage)
            setHasMore(fetcher.data.pagination.hasMore)
        }
    }, [fetcher.data])

    // Intersection Observer for infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const first = entries[0]
                // If the loader element is visible and we have more data and not currently loading
                if (first.isIntersecting && hasMore && fetcher.state === 'idle') {
                    const nextPage = currentPage + 1
                    fetcher.load(`/app/recitation?page=${nextPage}`)
                }
            },
            {
                threshold: 0.1, // Trigger when 10% of the element is visible
                rootMargin: '100px', // Start loading 100px before the element is visible
            }
        )

        const currentLoader = loaderRef.current
        if (currentLoader) {
            observer.observe(currentLoader)
        }

        return () => {
            if (currentLoader) {
                observer.unobserve(currentLoader)
            }
        }
    }, [hasMore, currentPage, fetcher])

    const isLoadingMore = fetcher.state === 'loading'

    return (
        <div className="container mx-auto px-6 py-8 max-w-7xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">Hafalan</h1>
                <p className="text-muted-foreground">Kelola dan pantau progres hafalan Al-Qur'an Anda</p>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card className="border-2">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-simakin-primary/10 flex items-center justify-center shrink-0">
                                <BookOpenText className="w-6 h-6 text-simakin-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-3xl font-bold text-foreground">{data.stats.total}</p>
                                <p className="text-sm text-muted-foreground">Total Sesi</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-2">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                                <Calendar className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-3xl font-bold text-foreground">{data.stats.weekly}</p>
                                <p className="text-sm text-muted-foreground">Minggu Ini</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-2">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                                <TrendingUp className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-3xl font-bold text-foreground">{data.stats.avgAccuracy}%</p>
                                <p className="text-sm text-muted-foreground">Rata-rata Skor</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-2">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                                <Clock className="w-6 h-6 text-purple-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-3xl font-bold text-foreground">{data.stats.totalTime}</p>
                                <p className="text-sm text-muted-foreground">Menit Belajar</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* CTA Button */}
            <div className="mb-8">
                <Link to="/app/recitation/new">
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
            {allRecitations.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {allRecitations.map((session) => (
                            <Link
                                key={session.id}
                                to={`/app/recitation/result/${session.id}`}
                            >
                                <Card className="group hover:shadow-lg hover:border-simakin-primary/50 transition-all cursor-pointer border-2 h-full overflow-hidden">
                                    <CardContent className="p-0">
                                        {/* Header Section with Gradient */}
                                        <div className="bg-linear-to-r from-simakin-primary/5 to-simakin-primary/10 p-5 border-b">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <Badge
                                                        variant="secondary"
                                                        className={`mb-2 ${session.mode === 'ZIYADAH'
                                                            ? 'bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900 dark:text-green-300'
                                                            : 'bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-900 dark:text-amber-300'
                                                            }`}
                                                    >
                                                        {session.mode === 'ZIYADAH' ? 'Ziyadah' : 'Murojaah'}
                                                    </Badge>
                                                    <h3 className="text-xl font-bold text-foreground mb-1 truncate group-hover:text-simakin-primary transition-colors">
                                                        {session.surah}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                        <Target className="w-3.5 h-3.5" />
                                                        Ayat {session.ayahRange}
                                                    </p>
                                                </div>
                                                <div className="flex flex-col items-center gap-1">
                                                    <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-primary to-primary/80 shadow-md">
                                                        <div className="text-center">
                                                            <p className="text-2xl font-bold text-white leading-none">{session.accuracy}</p>
                                                            <p className="text-[10px] text-white/90 font-medium">SKOR</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Bottom Section */}
                                        <div className="p-5 bg-card">
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-4">
                                                    {session.duration > 0 && (
                                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                                            <Clock className="w-4 h-4" />
                                                            <span className="font-medium">{Math.ceil(session.duration / 60)} menit</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                                        <Award className="w-4 h-4" />
                                                        <span className="font-medium">Tajwid: {Math.round(session.tajweed)}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {formatDateToIndonesian(session.date)}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>

                    {/* Infinite Scroll Trigger & Loading Indicator */}
                    {hasMore && (
                        <div
                            ref={loaderRef}
                            className="mt-8 flex justify-center items-center py-8"
                        >
                            {isLoadingMore && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span className="text-sm">Memuat lebih banyak...</span>
                                </div>
                            )}
                        </div>
                    )}
                </>
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
                            <Link to="/app/recitation/new">
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