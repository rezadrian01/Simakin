import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog';
import { Clock, BookOpen, ArrowLeft, Calendar, Target, Award, Zap, AlertCircle, BookMarked, Lightbulb, Maximize2 } from 'lucide-react';
import { Link } from 'react-router';
import type { MemorizationResultData } from '~/routes/app/memorization/types';

interface MemorizationResultProps {
    result: MemorizationResultData;
}

// Helper component for truncated text with read more
const TruncatedArabicText: React.FC<{ text: string; title: string; maxLength?: number }> = ({
    text,
    title,
    maxLength = 200
}) => {
    const isTruncated = text.length > maxLength;
    const displayText = isTruncated ? text.substring(0, maxLength) + '...' : text;

    return (
        <div className="space-y-3">
            <p className="arabic-text-lg">
                {displayText}
            </p>
            {isTruncated && (
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full">
                            <Maximize2 className="w-3 h-3 mr-2" />
                            Lihat Selengkapnya
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-6xl lg:max-w-7xl max-h-[85vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4" />
                                {title}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="mt-4 px-2 sm:px-4">
                            <p className="text-xl leading-[2.5] sm:text-2xl sm:leading-[2.75] md:text-3xl md:leading-[3] font-['Amiri'] text-right" dir="rtl" lang="ar">
                                {text}
                            </p>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
};

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

            {/* Detailed Scores from AI */}
            {result.scores && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            Skor Detail
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center p-6 border rounded-lg bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                                <Award className="w-6 h-6 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                                <p className="text-sm text-muted-foreground mb-2">Akurasi Hafalan</p>
                                <p className={`text-4xl font-bold ${getScoreColor(result.scores.accuracy)}`}>
                                    {result.scores.accuracy.toFixed(1)}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Kebenaran lafal & kata
                                </p>
                            </div>
                            <div className="text-center p-6 border rounded-lg bg-linear-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                                <BookMarked className="w-6 h-6 mx-auto mb-2 text-green-600 dark:text-green-400" />
                                <p className="text-sm text-muted-foreground mb-2">Skor Tajwid</p>
                                <p className={`text-4xl font-bold ${getScoreColor(result.scores.tajweed)}`}>
                                    {result.scores.tajweed.toFixed(1)}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Penerapan hukum tajwid
                                </p>
                            </div>
                            <div className="text-center p-6 border rounded-lg bg-linear-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
                                <Zap className="w-6 h-6 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
                                <p className="text-sm text-muted-foreground mb-2">Kelancaran</p>
                                <p className={`text-4xl font-bold ${getScoreColor(result.scores.fluency)}`}>
                                    {result.scores.fluency.toFixed(1)}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Kecepatan & kepercayaan diri
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* General Suggestion - Moved to top */}
            {result.generalSuggestion && (
                <Card className="border-amber-500">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Lightbulb className="w-4 h-4" />
                            Saran Umum
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="leading-relaxed">{result.generalSuggestion}</p>
                    </CardContent>
                </Card>
            )}

            {/* Transcription Comparison */}
            {result.transcription && result.originalText && (
                <div className="grid md:grid-cols-2 gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <BookOpen className="w-4 h-4" />
                                Bacaan Anda
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <TruncatedArabicText
                                text={result.transcription}
                                title="Bacaan Anda - Lengkap"
                                maxLength={200}
                            />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <BookOpen className="w-4 h-4" />
                                Teks Al-Quran
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <TruncatedArabicText
                                text={result.originalText}
                                title="Teks Al-Quran - Lengkap"
                                maxLength={200}
                            />
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Error Summary */}
            {result.errors && (result.errors.memorization > 0 || result.errors.tajweed > 0 || result.errors.waqaf > 0) && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            Ringkasan Kesalahan
                        </CardTitle>
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
                            <span className="flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                Kesalahan Hafalan
                            </span>
                            <Badge variant="destructive">{result.memorizationErrors.length}</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {result.memorizationErrors.map((error, index) => (
                            <Card key={index} className="border-l-4 border-l-destructive">
                                <CardContent className="pt-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-medium">Ayat</span>
                                        {error.ayah && <span className="text-sm text-muted-foreground">Ayat {error.ayah}</span>}
                                    </div>
                                    {error.detail && (
                                        <p className="text-sm mb-2 leading-relaxed">
                                            {error.detail}
                                        </p>
                                    )}
                                    {error.type && (
                                        <Badge variant="outline" className="mt-2">{error.type}</Badge>
                                    )}
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
                            <span className="flex items-center gap-2">
                                <BookMarked className="w-4 h-4" />
                                Kesalahan Tajwid
                            </span>
                            <Badge className="bg-orange-500">{result.tajweedErrors.length}</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {result.tajweedErrors.map((error, index) => (
                            <Card key={index} className="border-l-4 border-l-orange-500">
                                <CardContent className="pt-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-medium">Ayat</span>
                                        {error.ayah && <span className="text-sm text-muted-foreground">Ayat {error.ayah}</span>}
                                    </div>
                                    {error.letter && (
                                        <p className="arabic-text-lg mb-3">
                                            {error.letter}
                                        </p>
                                    )}
                                    {error.suggestion && (
                                        <p className="text-sm text-muted-foreground mb-2">{error.suggestion}</p>
                                    )}
                                    {error.type && (
                                        <Badge variant="outline">{error.type}</Badge>
                                    )}
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
                            <span className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Kesalahan Waqaf
                            </span>
                            <Badge className="bg-yellow-500">{result.waqafErrors.length}</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {result.waqafErrors.map((error, index) => (
                            <Card key={index} className="border-l-4 border-l-yellow-500">
                                <CardContent className="pt-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-medium">Ayat</span>
                                        {error.ayah && <span className="text-sm text-muted-foreground">Ayat {error.ayah}</span>}
                                    </div>
                                    {error.detail && (
                                        <p className="text-sm text-muted-foreground mb-2">{error.detail}</p>
                                    )}
                                    {error.type && (
                                        <Badge variant="outline">{error.type}</Badge>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
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
