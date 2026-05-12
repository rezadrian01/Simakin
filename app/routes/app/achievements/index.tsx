import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Trophy } from 'lucide-react'
import { useLoaderData } from 'react-router'
import type { Route } from './+types/index'
import { requireUserId } from '~/services/auth/auth.server'
import { db } from '~/lib/db.server'

export async function loader({ request }: Route.LoaderArgs) {
    const userId = await requireUserId(request);

    const allAchievements = await db.achievement.findMany({
        orderBy: { key: 'asc' },
    });

    const userAchievements = await db.userAchievement.findMany({
        where: { userId },
        include: { achievement: true },
    });

    const earnedKeys = new Set(userAchievements.map(ua => ua.achievement.key));

    const achievements = allAchievements.map(a => ({
        key: a.key,
        title: a.title,
        description: a.description ?? '',
        earned: earnedKeys.has(a.key),
        awardedAt: userAchievements.find(ua => ua.achievement.key === a.key)?.awardedAt ?? null,
    }));

    return { achievements, earnedCount: earnedKeys.size, totalCount: allAchievements.length };
}

export default function AchievementsPage() {
    const { achievements, earnedCount, totalCount } = useLoaderData<typeof loader>();

    return (
        <div className="container mx-auto px-6 py-8 max-w-4xl">
            {/* Header */}
            <div className="mb-8 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">Pencapaian</h1>
                    <p className="text-muted-foreground">
                        {earnedCount} / {totalCount} achievement terbuka
                    </p>
                </div>
            </div>

            {/* Achievement Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement) => (
                    <Card
                        key={achievement.key}
                        className={`transition-all ${
                            achievement.earned
                                ? 'border-yellow-300 bg-yellow-50/50'
                                : 'opacity-50 grayscale'
                        }`}
                    >
                        <CardHeader className="pb-2">
                            <div className="flex items-start justify-between">
                                <div className="text-3xl">
                                    {achievement.earned ? '🏆' : '🔒'}
                                </div>
                                {achievement.earned && (
                                    <span className="text-xs text-green-600 font-medium">
                                        ✓ Terbuka
                                    </span>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <h3 className="font-semibold text-foreground mb-1">
                                {achievement.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-2">
                                {achievement.description}
                            </p>
                            {achievement.earned && achievement.awardedAt && (
                                <p className="text-xs text-muted-foreground">
                                    Diraih pada {new Date(achievement.awardedAt).toLocaleDateString('id-ID')}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}