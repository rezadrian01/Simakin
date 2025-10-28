import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { BookOpenText, Trophy, Flame, Play } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Link, useLoaderData } from 'react-router'
import { getIndonesianGreeting } from '~/utils/indonesian-utils'
import RecentSessionsCard from './components/recent-sessions-card'
import StatsOverview from './components/stats-overview'
import TodaysProgress from './components/todays-progress'
import type { Route } from './+types/index'
import { requireUserId } from '~/services/auth/auth.server'
import { db } from '~/lib/db.server'
import { getUserStreak } from '~/services/streak/streak.server'

// Loader function to fetch data from database
export async function loader({ request }: Route.LoaderArgs) {
    const userId = await requireUserId(request);

    // Fetch user data with streak
    const user = await db.user.findUnique({
        where: { id: userId },
        select: {
            streakDays: true,
            totalSessions: true,
            totalScore: true,
            lastActivityDate: true,
        },
    });

    // Get current streak (this checks if streak is still valid)
    const currentStreak = await getUserStreak(userId);

    // DUMMY DATA - Replace with actual database queries
    return {
        userStats: {
            totalSurahMemorized: 12,
            totalJuzMemorized: 2,
            recitationAccuracy: 87,
            tajweedScore: 92,
            totalEXP: user?.totalScore || 0,
            currentStreak: currentStreak,
            todaysSessions: 2,
            weeklyGoal: 10,
            weeklyProgress: 6,
            userRank: 15
        },
        recentSessions: [
            {
                id: 1,
                surah: "Al-Fatihah",
                accuracy: 95,
                tajweed: 90,
                date: new Date().toISOString(),
                exp: 50,
                sessionType: "hafalan"
            },
            {
                id: 2,
                surah: "Al-Ikhlas",
                accuracy: 88,
                tajweed: 92,
                date: new Date(Date.now() - 86400000).toISOString(),
                exp: 45,
                sessionType: "murojaah"
            },
            {
                id: 3,
                surah: "Al-Falaq",
                accuracy: 82,
                tajweed: 85,
                date: new Date(Date.now() - 172800000).toISOString(),
                exp: 40,
                sessionType: "hafalan"
            },
            {
                id: 4,
                surah: "An-Nas",
                accuracy: 90,
                tajweed: 88,
                date: new Date(Date.now() - 259200000).toISOString(),
                exp: 48,
                sessionType: "murojaah"
            },
            {
                id: 5,
                surah: "Al-Baqarah",
                accuracy: 78,
                tajweed: 80,
                date: new Date(Date.now() - 345600000).toISOString(),
                exp: 38,
                sessionType: "hafalan"
            }
        ],
        quickActions: [
            {
                title: "Hafalan Baru",
                description: "Mulai hafalan surah baru",
                icon: "BookOpenText",
                color: "bg-simakin-primary",
                href: "/memorize/new"
            },
            {
                title: "Muroja'ah",
                description: "Review hafalan Anda",
                icon: "Play",
                color: "bg-simakin-soft-green",
                href: "/memorize/review"
            },
            {
                title: "Leaderboard",
                description: "Lihat peringkat global",
                icon: "Trophy",
                color: "bg-simakin-soft-yellow",
                href: "/leaderboard"
            }
        ]
    }
}

export default function DashboardPage() {
    const data = useLoaderData<typeof loader>()

    // Icon mapping for quick actions
    const getIcon = (iconName: string) => {
        const iconProps = { className: "w-6 h-6 text-white" }
        switch (iconName) {
            case 'BookOpenText':
                return <BookOpenText {...iconProps} />
            case 'Play':
                return <Play {...iconProps} />
            case 'Trophy':
                return <Trophy {...iconProps} />
            default:
                return <BookOpenText {...iconProps} />
        }
    }

    const { userStats, recentSessions, quickActions } = data

    return (
        <div className="p-6 space-y-6 bg-background min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                    <p className="text-muted-foreground">{getIndonesianGreeting()}! Siap untuk hafalan hari ini?</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-muted-foreground">Streak Saat Ini</p>
                    <div className="flex items-center gap-1">
                        <Flame className="w-5 h-5 text-orange-500" />
                        <span className="text-2xl font-bold text-foreground">{userStats.currentStreak} hari</span>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <StatsOverview userStats={userStats} />

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl font-semibold">Aksi Cepat</CardTitle>
                    <CardDescription>Mulai sesi hafalan Anda</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {quickActions.map((action, index) => (
                            <Link key={index} to={action.href}>
                                <div className="p-4 rounded-lg border hover:shadow-md transition-shadow cursor-pointer group">
                                    <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                                        {getIcon(action.icon)}
                                    </div>
                                    <h3 className="font-semibold text-foreground">{action.title}</h3>
                                    <p className="text-sm text-muted-foreground">{action.description}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Today's Progress */}
                <TodaysProgress userStats={userStats} />

                {/* Recent Sessions */}
                <RecentSessionsCard recentSessions={recentSessions} />
            </div>

            {/* View All Sessions Button */}
            <div className="flex justify-center">
                <Link to="/progress-report">
                    <Button variant="outline" className="px-8">
                        Lihat Semua Sesi
                    </Button>
                </Link>
            </div>

            {/* Motivational Quote */}
            <Card>
                <CardContent className="pt-6">
                    <div className="text-center space-y-2">
                        <p className="text-lg font-medium text-foreground italic">
                            {`"Dan sesungguhnya telah Kami mudahkan Al-Qur'an untuk pelajaran, maka adakah orang yang mengambil pelajaran?"`}
                        </p>
                        <p className="text-sm text-muted-foreground">— Al-Qamar: 17</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}