import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Trophy, Medal, Award, Crown } from 'lucide-react'
import { useLoaderData } from 'react-router'
import { formatNumber } from '~/utils/indonesian-utils'
import type { Route } from './+types/index'

// Loader function to fetch data from database
export async function loader({ request }: Route.LoaderArgs) {
    // TODO: Get userId from session/auth
    const userId = "temp-user-id"

    // DUMMY DATA - Replace with actual database queries
    const dummyUsers = [
        { username: "ahmad_hafidz", fullName: "Ahmad Hafidz", score: 2450, streak: 15 },
        { username: "fatimah_zahra", fullName: "Fatimah Zahra", score: 2380, streak: 12 },
        { username: "umar_faruq", fullName: "Umar Faruq", score: 2310, streak: 18 },
        { username: "aisyah_siddiq", fullName: "Aisyah Siddiq", score: 2200, streak: 10 },
        { username: "ali_murtadha", fullName: "Ali Murtadha", score: 2150, streak: 14 },
        { username: "khadijah_binti", fullName: "Khadijah Binti", score: 2080, streak: 9 },
        { username: "salman_farisi", fullName: "Salman Farisi", score: 1990, streak: 11 },
        { username: "hafshah_ummi", fullName: "Hafshah Ummi", score: 1920, streak: 8 },
        { username: "bilal_habsyi", fullName: "Bilal Habsyi", score: 1850, streak: 13 },
        { username: "zaynab_maryam", fullName: "Zaynab Maryam", score: 1780, streak: 7 },
        { username: "abdullah_ibn", fullName: "Abdullah Ibn", score: 1720, streak: 10 },
        { username: "ruqayyah_nur", fullName: "Ruqayyah Nur", score: 1650, streak: 6 },
        { username: "hasan_basri", fullName: "Hasan Basri", score: 1580, streak: 9 },
        { username: "zainab_fathia", fullName: "Zainab Fathia", score: 1510, streak: 5 },
        { username: "ibrahim_khalil", fullName: "Ibrahim Khalil", score: 1450, streak: 8 },
        { username: "maryam_azizah", fullName: "Maryam Azizah", score: 1390, streak: 7 },
        { username: "yusuf_qardhawi", fullName: "Yusuf Qardhawi", score: 1320, streak: 6 },
        { username: "sofia_rabbani", fullName: "Sofia Rabbani", score: 1250, streak: 5 },
        { username: "hamzah_asad", fullName: "Hamzah Asad", score: 1180, streak: 4 },
        { username: "laila_munira", fullName: "Laila Munira", score: 1110, streak: 3 }
    ]

    return {
        globalLeaderboard: dummyUsers.map((user, index) => ({
            rank: index + 1,
            username: user.username,
            fullName: user.fullName,
            score: user.score,
            streak: user.streak,
            isCurrentUser: index === 14 // User is at rank 15
        })),
        weeklyLeaderboard: dummyUsers.slice(0, 10).map((user, index) => ({
            rank: index + 1,
            username: user.username,
            fullName: user.fullName,
            score: Math.round(user.score * 0.3), // Weekly score is lower
            isCurrentUser: false
        })),
        userRank: {
            rank: 15,
            score: 1450
        }
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