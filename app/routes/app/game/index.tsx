import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Gamepad2, Target, Puzzle, Brain, Zap, Star } from 'lucide-react'
import { Link, useLoaderData } from 'react-router'
import type { Route } from './+types/index'

// Loader function to fetch data from database
export async function loader({ request }: Route.LoaderArgs) {
    // TODO: Get userId from session/auth
    const userId = "temp-user-id"

    // DUMMY DATA - Replace with actual database queries
    return {
        totalAchievements: 8,
        totalScore: 1450,
        streak: 7
    }
}

export default function GamePage() {
    const data = useLoaderData<typeof loader>()

    const games = [
        {
            title: "Tebak Ayat",
            description: "Tebak ayat Al-Qur'an dari petunjuk yang diberikan",
            icon: Brain,
            color: "bg-purple-500",
            href: "/app/game/guess-ayat",
            difficulty: "Medium"
        },
        {
            title: "Quiz Hafalan",
            description: "Uji hafalan Anda dengan kuis interaktif",
            icon: Puzzle,
            color: "bg-blue-500",
            href: "/app/game/quiz",
            difficulty: "Easy"
        },
        {
            title: "Speed Challenge",
            description: "Seberapa cepat Anda bisa menghafal?",
            icon: Zap,
            color: "bg-yellow-500",
            href: "/app/game/speed-challenge",
            difficulty: "Hard"
        },
        {
            title: "Tajweed Master",
            description: "Latihan tajweed dengan game yang menyenangkan",
            icon: Target,
            color: "bg-green-500",
            href: "/app/game/tajweed-master",
            difficulty: "Medium"
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
                    <CardDescription>Selesaikan tantangan untuk bonus poin!</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                            <div>
                                <h3 className="font-semibold text-foreground text-sm mb-1">
                                    Selesaikan 3 Sesi Hafalan
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Progress: 0/3 sesi
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-simakin-primary">+100 XP</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                            <div>
                                <h3 className="font-semibold text-foreground text-sm mb-1">
                                    Raih Skor Akurasi 90%
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Dalam satu sesi hafalan
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-simakin-primary">+150 XP</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                            <div>
                                <h3 className="font-semibold text-foreground text-sm mb-1">
                                    Menangkan 2 Game
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Progress: 0/2 game
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-simakin-primary">+200 XP</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}