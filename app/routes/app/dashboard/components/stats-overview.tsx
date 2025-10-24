import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { BookOpenText, TrendingUp, Star, Trophy } from 'lucide-react'
import { formatNumber } from '~/utils/indonesian-utils'

interface UserStats {
    totalSurahMemorized: number
    totalJuzMemorized: number
    recitationAccuracy: number
    tajweedScore: number
    totalEXP: number
    currentStreak: number
    todaysSessions: number
    weeklyGoal: number
    weeklyProgress: number
    userRank: number
}

interface StatsOverviewProps {
    userStats: UserStats
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ userStats }) => {
    const statCards = [
        {
            title: "Total Surah",
            value: userStats.totalSurahMemorized,
            subtitle: `${userStats.totalJuzMemorized} Juz selesai`,
            icon: <BookOpenText className="w-5 h-5 text-simakin-primary" />,
            color: "text-simakin-primary"
        },
        {
            title: "Akurasi",
            value: `${userStats.recitationAccuracy}%`,
            subtitle: "+3% dari minggu lalu",
            icon: <TrendingUp className="w-5 h-5 text-green-600" />,
            color: "text-green-600"
        },
        {
            title: "Skor Tajweed",
            value: `${userStats.tajweedScore}%`,
            subtitle: "Kemajuan luar biasa!",
            icon: <Star className="w-5 h-5 text-yellow-500" />,
            color: "text-yellow-500"
        },
        {
            title: "Total EXP",
            value: formatNumber(userStats.totalEXP),
            subtitle: `Peringkat #${userStats.userRank} global`,
            icon: <Trophy className="w-5 h-5 text-simakin-primary" />,
            color: "text-simakin-primary"
        }
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat, index) => (
                <Card key={index}>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {stat.title}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            {stat.icon}
                            <span className="text-2xl font-bold text-foreground">
                                {stat.value}
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

export default StatsOverview
