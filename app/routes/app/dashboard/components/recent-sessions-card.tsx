import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { formatDateToIndonesian } from '~/utils/indonesian-utils'

interface RecentSession {
    id: number
    surah: string
    accuracy: number
    tajweed: number
    date: string
    exp: number
    sessionType: string
}

interface RecentSessionItemProps {
    session: RecentSession
}

const RecentSessionItem: React.FC<RecentSessionItemProps> = ({ session }) => {
    return (
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div>
                <p className="font-medium text-foreground">{session.surah}</p>
                <p className="text-sm text-muted-foreground">{formatDateToIndonesian(session.date)}</p>
                <p className="text-xs text-muted-foreground capitalize">
                    {session.sessionType}
                </p>
            </div>
            <div className="text-right">
                <div className="flex gap-2 text-xs mb-1">
                    <span className="px-2 py-1 rounded-full bg-simakin-soft-green text-white">
                        Acc: {session.accuracy}%
                    </span>
                    <span className="px-2 py-1 rounded-full bg-simakin-soft-yellow text-white">
                        Taj: {session.tajweed}%
                    </span>
                </div>
                <p className="text-sm font-medium text-foreground">+{session.exp} EXP</p>
            </div>
        </div>
    )
}

interface RecentSessionsCardProps {
    recentSessions: RecentSession[]
}

export const RecentSessionsCard: React.FC<RecentSessionsCardProps> = ({ recentSessions }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl font-semibold">Sesi Terakhir</CardTitle>
                <CardDescription>Aktivitas hafalan terbaru Anda</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {recentSessions.length > 0 ? (
                        recentSessions.map((session) => (
                            <RecentSessionItem key={session.id} session={session} />
                        ))
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">Belum ada sesi hafalan</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Mulai sesi pertama Anda sekarang!
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

export default RecentSessionsCard
