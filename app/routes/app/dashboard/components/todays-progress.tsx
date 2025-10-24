import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '~/components/ui/card'
import { CheckCircle, Clock } from 'lucide-react'

interface UserStats {
    todaysSessions: number
    weeklyGoal: number
    weeklyProgress: number
}

interface TodaysProgressProps {
    userStats: UserStats
}

export const TodaysProgress: React.FC<TodaysProgressProps> = ({ userStats }) => {
    const progressPercentage = Math.round((userStats.weeklyProgress / userStats.weeklyGoal) * 100)

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl font-semibold">Progres Hari Ini</CardTitle>
                <CardDescription>Aktivitas Anda hari ini</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-simakin-soft-green flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="font-medium text-foreground">Sesi Selesai</p>
                            <p className="text-sm text-muted-foreground">
                                {userStats.todaysSessions} sesi hari ini
                            </p>
                        </div>
                    </div>
                    <span className="text-2xl font-bold text-foreground">
                        {userStats.todaysSessions}
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-simakin-soft-yellow flex items-center justify-center">
                            <Clock className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="font-medium text-foreground">Target Mingguan</p>
                            <p className="text-sm text-muted-foreground">
                                {userStats.weeklyProgress}/{userStats.weeklyGoal} sesi
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-2xl font-bold text-foreground">
                            {progressPercentage}%
                        </span>
                    </div>
                </div>

                <div className="w-full bg-secondary rounded-full h-2">
                    <div
                        className="bg-simakin-primary h-2 rounded-full transition-all duration-300"
                        style={{
                            width: `${Math.min(progressPercentage, 100)}%`
                        }}
                    ></div>
                </div>

                {progressPercentage >= 100 && (
                    <div className="text-center p-2 bg-green-50 rounded-lg">
                        <p className="text-sm font-medium text-green-700">
                            🎉 Selamat! Target mingguan tercapai!
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export default TodaysProgress
