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

    // Fetch recent recitations (last 5 sessions)
    const recentRecitations = await db.recitation.findMany({
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
        take: 5,
    });

    // Fetch surah names for recent sessions
    const surahNumbers = [...new Set(recentRecitations.map(r => r.surah))];
    const surahDataMap = new Map<number, string>();

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

    // Get historical streak for each session to calculate correct EXP
    const recentSessions = recentRecitations
        .filter(recitation => recitation.feedback !== null)
        .map(recitation => {
            const avgScore = Math.round(
                (recitation.feedback!.accuracyScore +
                    recitation.feedback!.tajweedScore +
                    recitation.feedback!.fluencyScore) / 3
            );

            return {
                id: recitation.id,
                surah: surahDataMap.get(recitation.surah) || `Surah ${recitation.surah}`,
                accuracy: avgScore,
                tajweed: Math.round(recitation.feedback!.tajweedScore),
                date: recitation.createdAt.toISOString(),
                exp: recitation.expEarned,
                sessionType: recitation.mode.toLowerCase() as 'ziyadah' | 'murojaah',
            };
        });

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
        recentSessions: recentSessions,
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