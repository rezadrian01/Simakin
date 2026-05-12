import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Gamepad2, Target, Puzzle, Brain, Zap, Star, CheckCircle2, Circle, BookOpen, Trophy } from 'lucide-react'
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

    const getChallengeIcon = (type: string) => {
        switch (type) {
            case 'WIN_GAMES': return Trophy
            case 'PLAY_GAMES': return Gamepad2
            case 'REACH_ACCURACY': return Target
            default: return BookOpen
        }
    }

    const completedCount = data.challenges.filter(c => c.isCompleted).length

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
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle className="text-xl font-semibold flex items-center gap-2">
                                <Zap className="w-6 h-6 text-simakin-primary" />
                                Tantangan Harian
                            </CardTitle>
                            <CardDescription className="mt-1">
                                Selesaikan tantangan hari ini untuk mendapatkan bonus EXP. Tantangan direset setiap hari.
                            </CardDescription>
                        </div>
                        <div className="text-right shrink-0 ml-4">
                            <p className="text-2xl font-bold text-foreground">{completedCount}/{data.challenges.length}</p>
                            <p className="text-xs text-muted-foreground">selesai</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {data.challenges.map((challenge) => {
                            const Icon = getChallengeIcon(challenge.type)
                            const pct = Math.min(100, Math.round((challenge.currentProgress / challenge.targetValue) * 100))
                            return (
                                <div
                                    key={challenge.id}
                                    className={`p-4 rounded-lg border transition-colors ${
                                        challenge.isCompleted
                                            ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800'
                                            : 'bg-muted/30 border-border'
                                    }`}
                                >
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                                            challenge.isCompleted ? 'bg-green-100 dark:bg-green-900/40' : 'bg-muted'
                                        }`}>
                                            <Icon className={`w-5 h-5 ${challenge.isCompleted ? 'text-green-600' : 'text-muted-foreground'}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <h3 className="font-semibold text-foreground text-sm">{challenge.description}</h3>
                                                {challenge.isCompleted
                                                    ? <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                                                    : <Circle className="w-4 h-4 text-muted-foreground shrink-0" />
                                                }
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {challenge.currentProgress} / {challenge.targetValue}
                                                {challenge.isCompleted && <span className="ml-1 text-green-600 font-medium">· Selesai!</span>}
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className={`text-sm font-bold ${challenge.isCompleted ? 'text-green-600' : 'text-simakin-primary'}`}>
                                                +{challenge.expReward} EXP
                                            </p>
                                        </div>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all ${challenge.isCompleted ? 'bg-green-500' : 'bg-simakin-primary'}`}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}