import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Gamepad2, Target, Puzzle, Brain, Zap, Star } from 'lucide-react'
import { Link, useLoaderData } from 'react-router'
import type { Route } from './+types/index'
import { requireUserId } from '~/services/auth/auth.server'
import { getUserStreak } from '~/services/streak/streak.server'
import { getTodaysChallenges } from '~/services/daily-challenge/daily-challenge.server'
import { db } from '~/lib/db.server'

// Loader function to fetch data from database
export async function loader({ request }: Route.LoaderArgs) {
    const userId = await requireUserId(request);

    // Get current streak
    const streak = await getUserStreak(userId);

    // Get user stats
    const user = await db.user.findUnique({
        where: { id: userId },
        select: { totalScore: true },
    });

    // Get achievement count
    const totalAchievements = await db.userAchievement.count({
        where: { userId },
    });

    // Get user timezone for daily challenges
    const profile = await db.userProfile.findUnique({
        where: { userId },
        select: { timezone: true },
    });
    const timezone = profile?.timezone ?? "Asia/Jakarta";

    // Get today's challenge progress
    const challenges = await getTodaysChallenges(userId, timezone);

    return {
        totalScore: user?.totalScore ?? 0,
        totalAchievements,
        streak,
        challenges,
    }
}

export default function GamePage() {
    const data = useLoaderData<typeof loader>()

    const games = [
        {
            title: "Tebak Surah",
            description: "Tebak surah dari ayat yang ditampilkan",
            icon: Brain,
            color: "bg-blue-500",
            href: "/app/game/tebak-surah",
            difficulty: "Easy"
        },
        {
            title: "Sambung Ayat",
            description: "Lanjutkan ayat berikut dengan ayat yang tepat",
            icon: Puzzle,
            color: "bg-purple-500",
            href: "/app/game/sambung-ayat",
            difficulty: "Medium"
        },
        {
            title: "Urutan Ayat",
            description: "Pilih ayat yang berasal dari posisi pertama",
            icon: Zap,
            color: "bg-yellow-500",
            href: "/app/game/urutan-ayat",
            difficulty: "Medium"
        },
        {
            title: "Lengkapi Ayat",
            description: "Isi kata yang hilang dalam ayat",
            icon: Target,
            color: "bg-green-500",
            href: "/app/game/lengkapi-ayat",
            difficulty: "Hard"
        }
    ]

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Easy': return 'bg-green-100 text-green-700'
            case 'Medium': return 'bg-yellow-100 text-yellow-700'
            case 'Hard': return 'bg-red-100 text-red-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    return (
        <div className="container mx-auto px-6 py-8 max-w-7xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-2 mb-2">
                    <Gamepad2 className="w-8 h-8" />
                    Game & Tantangan
                </h1>
                <p className="text-muted-foreground">Belajar sambil bermain dengan game interaktif</p>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-4 p-4 bg-muted/30 rounded-lg mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                        <Star className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-foreground">{Math.round(data.totalScore)}</p>
                        <p className="text-xs text-muted-foreground">Total Score</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-simakin-primary/10 flex items-center justify-center">
                        <Target className="w-5 h-5 text-simakin-primary" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-foreground">{data.totalAchievements}</p>
                        <p className="text-xs text-muted-foreground">Achievement</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-foreground">{data.streak}</p>
                        <p className="text-xs text-muted-foreground">Streak</p>
                    </div>
                </div>
            </div>

            {/* Available Games */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold">Game yang Tersedia</CardTitle>
                    <CardDescription>Pilih game untuk mulai bermain</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {games.map((game, index) => (
                            <div key={index} className="p-4 rounded-lg border hover:shadow-md transition-all group cursor-pointer">
                                <div className="flex items-start gap-3 mb-3">
                                    <div className={`w-12 h-12 rounded-lg ${game.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                        <game.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-foreground mb-1">{game.title}</h3>
                                        <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(game.difficulty)}`}>
                                            {game.difficulty}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground mb-3">
                                    {game.description}
                                </p>
                                <Link to={game.href}>
                                    <Button className="w-full" size="sm">
                                        Mainkan
                                    </Button>
                                </Link>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Daily Challenge */}
            <Card className="border-2 border-simakin-primary">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold flex items-center gap-2">
                        <Zap className="w-6 h-6 text-simakin-primary" />
                        Tantangan Harian
                    </CardTitle>
                    <CardDescription>Selesaikan tantangan untuk bonus EXP!</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {data.challenges.map((challenge) => (
                            <div key={challenge.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                                <div>
                                    <h3 className="font-semibold text-foreground text-sm mb-1">
                                        {challenge.description}
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        Progress: {challenge.currentProgress}/{challenge.targetValue}{' '}
                                        {challenge.isCompleted && <span className="text-green-600 font-medium">✓ Selesai</span>}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-simakin-primary">+{challenge.expReward} EXP</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}