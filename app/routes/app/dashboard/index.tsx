import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { BookOpenText, Trophy, Flame, Play } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Link, useLoaderData } from 'react-router'
import { getIndonesianGreeting } from '~/utils/indonesian-utils'
import RecentSessionsCard from './components/recent-sessions-card'
import StatsOverview from './components/stats-overview'
import TodaysProgress from './components/todays-progress'
import { db } from '~/lib/db.server'
import type { Route } from './+types/index'

// Loader function to fetch data from database
export async function loader({ request }: Route.LoaderArgs) {
    // TODO: Get userId from session/auth
    const userId = "temp-user-id" // Replace with actual auth

    // Get or create user
    let user = await db.user.findUnique({
        where: { id: userId },
        include: {
            memorization: true,
            leaderboards: {
                where: { period: 'global' },
                orderBy: { rank: 'asc' },
                take: 1
            }
        }
    })

    // Create user if not exists (for testing)
    if (!user) {
        user = await db.user.create({
            data: {
                id: userId,
                email: 'test@example.com',
                username: 'testuser',
                fullName: 'Test User',
                streakDays: 7,
                totalSessions: 15,
                totalScore: 1250
            },
            include: {
                memorization: true,
                leaderboards: {
                    where: { period: 'global' },
                    orderBy: { rank: 'asc' },
                    take: 1
                }
            }
        })
    }

    // Get recent recitations with feedback
    const recentRecitations = await db.recitation.findMany({
        where: {
            userId,
            status: 'COMPLETED'
        },
        include: {
            feedback: true
        },
        orderBy: { createdAt: 'desc' },
        take: 5
    })

    // Calculate today's sessions
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todaySessions = await db.recitation.count({
        where: {
            userId,
            status: 'COMPLETED',
            createdAt: { gte: today }
        }
    })

    // Calculate weekly progress
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    weekStart.setHours(0, 0, 0, 0)

    const weeklyProgress = await db.recitation.count({
        where: {
            userId,
            status: 'COMPLETED',
            createdAt: { gte: weekStart }
        }
    })

    // Calculate average scores
    const feedbacks = await db.feedback.findMany({
        where: {
            recitation: { userId }
        },
        select: {
            accuracyScore: true,
            tajweedScore: true
        }
    })

    const avgAccuracy = feedbacks.length > 0
        ? Math.round(feedbacks.reduce((sum, f) => sum + f.accuracyScore, 0) / feedbacks.length)
        : 0

    const avgTajweed = feedbacks.length > 0
        ? Math.round(feedbacks.reduce((sum, f) => sum + f.tajweedScore, 0) / feedbacks.length)
        : 0

    // Get surah names mapping (simplified - you can expand this)
    const surahNames: { [key: number]: string } = {
        1: "Al-Fatihah",
        2: "Al-Baqarah",
        112: "Al-Ikhlas",
        113: "Al-Falaq",
        114: "An-Nas"
    }

    return {
        userStats: {
            totalSurahMemorized: user.memorization.length,
            totalJuzMemorized: Math.floor(user.memorization.length / 10), // Rough estimate
            recitationAccuracy: avgAccuracy,
            tajweedScore: avgTajweed,
            totalEXP: Math.round(user.totalScore),
            currentStreak: user.streakDays,
            todaysSessions: todaySessions,
            weeklyGoal: 10,
            weeklyProgress: weeklyProgress,
            userRank: user.leaderboards[0]?.rank || 0
        },
        recentSessions: recentRecitations.map((recitation, index) => ({
            id: index + 1,
            surah: surahNames[recitation.surah] || `Surah ${recitation.surah}`,
            accuracy: Math.round(recitation.feedback?.accuracyScore || 0),
            tajweed: Math.round(recitation.feedback?.tajweedScore || 0),
            date: recitation.createdAt.toISOString(),
            exp: Math.round((recitation.feedback?.accuracyScore || 0) / 2),
            sessionType: recitation.mode.toLowerCase()
        })),
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