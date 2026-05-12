import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Trophy, Medal, Award, Crown } from 'lucide-react'
import { useLoaderData } from 'react-router'
import { formatNumber } from '~/utils/indonesian-utils'
import type { Route } from './+types/index'
import { requireUserId } from '~/services/auth/auth.server'
import { db } from '~/lib/db.server'

// Helper to get start of week (Monday) in a given timezone
function getStartOfWeek(timezone: string = "Asia/Jakarta"): Date {
    const now = new Date()
    // Get the date in the target timezone
    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    })
    const parts = formatter.formatToParts(now)
    const getPart = (type: string) => parseInt(parts.find(p => p.type === type)?.value || "1")

    const year = getPart("year")
    const month = getPart("month")
    const day = getPart("day")

    const localDate = new Date(year, month - 1, day)
    const dayOfWeek = localDate.getDay() // 0 = Sunday, 1 = Monday, etc.
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    localDate.setDate(localDate.getDate() - daysToMonday)

    // Start of day in local timezone
    localDate.setHours(0, 0, 0, 0)

    // Convert back to UTC for database query
    const utcDate = new Date(localDate.toLocaleString("en-US", { timeZone: timezone }))
    return utcDate
}

// Loader function to fetch data from database
export async function loader({ request }: Route.LoaderArgs) {
    const userId = await requireUserId(request)
    const timezone = "Asia/Jakarta" // Default, could be fetched from user profile

    // Get current user's data for rank
    const currentUser = await db.user.findUnique({
        where: { id: userId },
        select: { username: true, totalScore: true, streakDays: true },
    })

    // Get top 50 users by totalScore (global leaderboard)
    const globalTop = await db.user.findMany({
        where: { totalScore: { gt: 0 } },
        orderBy: { totalScore: "desc" },
        take: 50,
        select: {
            username: true,
            fullName: true,
            totalScore: true,
            streakDays: true,
        },
    })

    // Find current user's rank
    const userRank = await db.user.count({
        where: { totalScore: { gt: currentUser?.totalScore ?? 0 } },
    })

    // Weekly leaderboard: sum XP gains since start of week
    const startOfWeek = getStartOfWeek(timezone)

    const weeklyXP = await db.xPHistory.groupBy({
        by: ["userId"],
        where: {
            createdAt: { gte: startOfWeek },
        },
        _sum: { amount: true },
        orderBy: { _sum: { amount: "desc" } },
        take: 10,
    })

    // Fetch usernames for weekly leaders
    const weeklyUserIds = weeklyXP.map(w => w.userId)
    const weeklyUsers = await db.user.findMany({
        where: { id: { in: weeklyUserIds } },
        select: { id: true, username: true, fullName: true },
    })
    const weeklyUserMap = new Map(weeklyUsers.map(u => [u.id, u]))

    const weeklyLeaderboard = weeklyXP.map((entry, index) => {
        const user = weeklyUserMap.get(entry.userId)
        return {
            rank: index + 1,
            username: user?.username ?? "unknown",
            fullName: user?.fullName ?? user?.username ?? "Unknown",
            score: entry._sum.amount ?? 0,
            isCurrentUser: entry.userId === userId,
        }
    })

    const globalLeaderboard = globalTop.map((user, index) => ({
        rank: index + 1,
        username: user.username,
        fullName: user.fullName ?? user.username,
        score: user.totalScore,
        streak: user.streakDays,
        isCurrentUser: user.username === currentUser?.username,
    }))

    return {
        globalLeaderboard,
        weeklyLeaderboard,
        userRank: {
            rank: userRank + 1,
            score: currentUser?.totalScore ?? 0,
        },
    }
}

export default function LeaderboardPage() {
    const data = useLoaderData<typeof loader>()

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />
        if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />
        if (rank === 3) return <Award className="w-6 h-6 text-orange-600" />
        return null
    }

    const getRankBadgeColor = (rank: number) => {
        if (rank === 1) return 'bg-yellow-100 text-yellow-700 border-yellow-300'
        if (rank === 2) return 'bg-gray-100 text-gray-700 border-gray-300'
        if (rank === 3) return 'bg-orange-100 text-orange-700 border-orange-300'
        return 'bg-muted text-muted-foreground'
    }

    return (
        <div className="container mx-auto px-6 py-8 max-w-7xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">Leaderboard</h1>
                <p className="text-muted-foreground">Kompetisi hafalan Al-Qur'an global</p>
            </div>

            {/* User Rank Card */}
            <Card className="border-2 border-simakin-primary mb-6">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-simakin-primary flex items-center justify-center">
                                <Trophy className="w-8 h-8 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Peringkat Global Anda</p>
                                <p className="text-3xl font-bold text-foreground">
                                    #{data.userRank.rank}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">Total Score</p>
                            <p className="text-2xl font-bold text-simakin-primary">
                                {formatNumber(data.userRank.score)}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Global Leaderboard */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl font-semibold flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-simakin-primary" />
                        Top Pengguna Global
                    </CardTitle>
                    <CardDescription>50 pengguna dengan score tertinggi</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                        {data.globalLeaderboard.map((entry) => (
                            <div
                                key={entry.username}
                                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${entry.isCurrentUser
                                    ? 'bg-simakin-primary/10 border-simakin-primary'
                                    : 'hover:bg-muted/50'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 ${getRankBadgeColor(entry.rank)
                                        }`}>
                                        {entry.rank <= 3 ? (
                                            getRankIcon(entry.rank)
                                        ) : (
                                            <span>{entry.rank}</span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-foreground">
                                            {entry.fullName}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            @{entry.username}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-simakin-primary">
                                        {formatNumber(entry.score)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        🔥 {entry.streak} hari
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}