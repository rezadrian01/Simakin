import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { Clock, BookOpen, ArrowLeft, Calendar } from 'lucide-react';
import { Link } from 'react-router';
import type { MemorizationResultData } from '~/routes/app/memorization/types';

interface MemorizationResultProps {
    result: MemorizationResultData;
}

const MemorizationResult: React.FC<MemorizationResultProps> = ({ result }) => {
    const getTypeLabel = (type: string) => {
        return type === 'ziyadah' ? 'Ziyadah' : 'Murojaah';
    };

    const getScoreColor = (score?: number) => {
        if (!score) return 'text-muted-foreground';
        if (score >= 90) return 'text-green-600';
        if (score >= 75) return 'text-yellow-600';
        return 'text-red-600';
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link to="/app/memorization">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Detail Hasil Memorization</h1>
                    <p className="text-muted-foreground">Lihat hasil dan evaluasi bacaan Anda</p>
                </div>
            </div>

            {/* Summary Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="w-5 h-5" />
                                {result.surah.name}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Ayat {result.ayahRange.start} - {result.ayahRange.end}
                            </p>
                        </div>
                        <Badge>{getTypeLabel(result.type)}</Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Tanggal</p>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm font-medium">
                                    {new Date(result.date).toLocaleDateString('id-ID')}
                                </span>
                            </div>
                        </div>
                        {result.duration && (
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Durasi</p>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">
                                        {Math.ceil(result.duration / 60)} menit
                                    </span>
                                </div>
                            </div>
                        )}
                        {result.score !== undefined && (
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Skor</p>
                                <span className={`text-2xl font-bold ${getScoreColor(result.score)}`}>
                                    {result.score}%
                                </span>
                            </div>
                        )}
                        {result.errors && (
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Total Kesalahan</p>
                                <span className="text-2xl font-bold text-destructive">
                                    {result.errors.memorization + result.errors.tajweed + result.errors.waqaf}
                                </span>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Transcription Comparison */}
            {result.transcription && result.originalText && (
                <div className="grid md:grid-cols-2 gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">🎯 Bacaan Anda</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-right text-lg leading-relaxed" dir="rtl">
                                {result.transcription}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">📖 Teks Al-Quran</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-right text-lg leading-relaxed" dir="rtl">
                                {result.originalText}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Error Summary */}
            {result.errors && (result.errors.memorization > 0 || result.errors.tajweed > 0 || result.errors.waqaf > 0) && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">📊 Ringkasan Kesalahan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-4 border rounded-lg">
                                <p className="text-sm text-muted-foreground mb-1">Hafalan</p>
                                <p className="text-2xl font-bold text-destructive">{result.errors.memorization}</p>
                            </div>
                            <div className="text-center p-4 border rounded-lg">
                                <p className="text-sm text-muted-foreground mb-1">Tajwid</p>
                                <p className="text-2xl font-bold text-orange-500">{result.errors.tajweed}</p>
                            </div>
                            <div className="text-center p-4 border rounded-lg">
                                <p className="text-sm text-muted-foreground mb-1">Waqaf</p>
                                <p className="text-2xl font-bold text-yellow-500">{result.errors.waqaf}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Memorization Errors */}
            {result.memorizationErrors && result.memorizationErrors.length > 0 && (
                <Card className="border-destructive">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center justify-between">
                            <span>❌ Kesalahan Hafalan</span>
                            <Badge variant="destructive">{result.memorizationErrors.length}</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {result.memorizationErrors.map((error, index) => (
                            <Card key={index} className="border-l-4 border-l-destructive">
                                <CardContent className="pt-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-medium">Ayat {error.ayah}</span>
                                        <Badge variant="outline">{error.type}</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{error.detail}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Tajweed Errors */}
            {result.tajweedErrors && result.tajweedErrors.length > 0 && (
                <Card className="border-orange-500">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center justify-between">
                            <span>🔤 Kesalahan Tajwid</span>
                            <Badge className="bg-orange-500">{result.tajweedErrors.length}</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {result.tajweedErrors.map((error, index) => (
                            <Card key={index} className="border-l-4 border-l-orange-500">
                                <CardContent className="pt-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-medium">Ayat {error.ayah}</span>
                                        <Badge variant="outline">{error.type}</Badge>
                                    </div>
                                    <p className="text-right text-lg mb-2" dir="rtl">
                                        {error.letter}
                                    </p>
                                    <p className="text-sm text-muted-foreground">{error.suggestion}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Waqaf Errors */}
            {result.waqafErrors && result.waqafErrors.length > 0 && (
                <Card className="border-yellow-500">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center justify-between">
                            <span>⏸️ Kesalahan Waqaf</span>
                            <Badge className="bg-yellow-500">{result.waqafErrors.length}</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {result.waqafErrors.map((error, index) => (
                            <Card key={index} className="border-l-4 border-l-yellow-500">
                                <CardContent className="pt-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-medium">Ayat {error.ayah}</span>
                                        <Badge variant="outline">{error.type}</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{error.detail}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* General Suggestion */}
            {result.generalSuggestion && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">💡 Saran Umum</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="leading-relaxed">{result.generalSuggestion}</p>
                    </CardContent>
                </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
                <Link to="/app/memorization/new" className="flex-1">
                    <Button className="w-full" size="lg">
                        Mulai Sesi Baru
                    </Button>
                </Link>
                <Link to="/app/memorization" className="flex-1">
                    <Button variant="outline" className="w-full" size="lg">
                        Lihat Riwayat
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default MemorizationResult;
