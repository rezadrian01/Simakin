import React, { useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Mic, Square, RotateCcw, Send, Loader2 } from "lucide-react";
import type { MemorizationSessionProps, ApiResponse } from "~/routes/app/memorization/types";

const MemorizationSession: React.FC<MemorizationSessionProps> = ({
    surah,
    startAyah,
    endAyah,
}) => {
    const [recording, setRecording] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const audioChunks = useRef<Blob[]>([]);

    const handleStartRecording = async () => {
        try {
            setError(null);
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunks.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunks.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(audioChunks.current, { type: "audio/webm" });
                setAudioBlob(blob);
                setAudioUrl(URL.createObjectURL(blob));

                if (mediaStreamRef.current) {
                    mediaStreamRef.current.getTracks().forEach((track) => {
                        track.stop();
                    });
                    mediaStreamRef.current = null;
                }
            };

            mediaRecorder.start();
            setRecording(true);
        } catch (err) {
            setError("Akses mikrofon ditolak atau tidak tersedia.");
        }
    };

    const handleStopRecording = () => {
        if (mediaRecorderRef.current && recording) {
            mediaRecorderRef.current.stop();
            setRecording(false);

            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach((track) => {
                    track.stop();
                });
                mediaStreamRef.current = null;
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!audioBlob) {
            setError("Belum ada audio yang direkam.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setApiResponse(null);

        const formData = new FormData();
        formData.append("audio", audioBlob, "recording.webm");
        formData.append("surat", surah.number.toString());
        formData.append("startAyat", startAyah);
        formData.append("endAyat", endAyah);

        try {
            const response = await fetch("/api/memorization", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result: ApiResponse = await response.json();
            setApiResponse(result);

            // Reset form
            setAudioUrl(null);
            setAudioBlob(null);
        } catch (error) {
            console.error("Error submitting session:", error);
            setError("Terjadi kesalahan saat mengirim audio.");
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        if (recording) {
            handleStopRecording();
        }

        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
        }

        setAudioUrl(null);
        setAudioBlob(null);
        setApiResponse(null);
        setError(null);
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>
                        Sesi Hafalan - {surah.name} ({startAyah} - {endAyah})
                    </CardTitle>
                    <CardDescription>
                        Rekam bacaan hafalan Anda untuk mendapatkan evaluasi
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Recording Controls */}
                        <div className="flex gap-3">
                            {recording ? (
                                <Button
                                    type="button"
                                    onClick={handleStopRecording}
                                    variant="destructive"
                                    size="lg"
                                    disabled={isLoading}
                                >
                                    <Square className="w-5 h-5 mr-2" />
                                    Stop Recording
                                </Button>
                            ) : (
                                <Button
                                    type="button"
                                    onClick={handleStartRecording}
                                    size="lg"
                                    disabled={isLoading}
                                >
                                    <Mic className="w-5 h-5 mr-2" />
                                    Mulai Rekam
                                </Button>
                            )}

                            {audioUrl && (
                                <Button
                                    type="button"
                                    onClick={resetForm}
                                    variant="outline"
                                    size="lg"
                                    disabled={isLoading}
                                >
                                    <RotateCcw className="w-5 h-5 mr-2" />
                                    Reset
                                </Button>
                            )}
                        </div>

                        {/* Audio Player */}
                        {audioUrl && (
                            <Card>
                                <CardContent className="pt-4">
                                    <p className="text-sm text-muted-foreground mb-2">Audio Rekaman:</p>
                                    <audio controls src={audioUrl} className="w-full" />
                                </CardContent>
                            </Card>
                        )}

                        {/* Error Message */}
                        {error && (
                            <Card className="border-destructive">
                                <CardContent className="pt-4 text-destructive">
                                    {error}
                                </CardContent>
                            </Card>
                        )}

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            size="lg"
                            className="w-full"
                            disabled={!audioBlob || isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Memproses...
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5 mr-2" />
                                    Kirim Rekaman
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* API Response Display */}
            {apiResponse && (
                <Card>
                    <CardHeader>
                        <CardTitle>📊 Hasil Analisis</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Transcription Comparison */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">🎯 Bacaan Anda:</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-right text-lg leading-relaxed" dir="rtl">
                                        {apiResponse.data.cleanedTranscribedAudio}
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">📖 Teks Al-Quran:</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-right text-lg leading-relaxed" dir="rtl">
                                        {apiResponse.data.originalQuranText}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Metadata */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">📋 Info Sesi:</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium">Surah:</span>{" "}
                                        {apiResponse.data.cleanedMemorizeValidationResult.quranMetadata.surah}
                                    </div>
                                    <div>
                                        <span className="font-medium">Dari Ayat:</span>{" "}
                                        {apiResponse.data.cleanedMemorizeValidationResult.quranMetadata.startAyah}
                                    </div>
                                    <div>
                                        <span className="font-medium">Sampai Ayat:</span>{" "}
                                        {apiResponse.data.cleanedMemorizeValidationResult.quranMetadata.endAyah}
                                    </div>
                                    <div>
                                        <span className="font-medium">Total Ayat:</span>{" "}
                                        {apiResponse.data.cleanedMemorizeValidationResult.quranMetadata.totalAyah}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Kesalahan Hafalan */}
                        {apiResponse.data.cleanedMemorizeValidationResult.memorizationErrors.length > 0 && (
                            <Card className="border-destructive">
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center justify-between">
                                        <span>❌ Kesalahan Hafalan</span>
                                        <Badge variant="destructive">
                                            {apiResponse.data.cleanedMemorizeValidationResult.memorizationErrors.length}
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {apiResponse.data.cleanedMemorizeValidationResult.memorizationErrors.map(
                                        (error, index) => (
                                            <Card key={index} className="border-l-4 border-l-destructive">
                                                <CardContent className="pt-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="font-medium">Ayat {error.ayah}</span>
                                                        <Badge variant="outline">{error.type}</Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">{error.detail}</p>
                                                </CardContent>
                                            </Card>
                                        )
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Kesalahan Tajwid */}
                        {apiResponse.data.cleanedMemorizeValidationResult.tajweedErrors.length > 0 && (
                            <Card className="border-orange-500">
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center justify-between">
                                        <span>🔤 Kesalahan Tajwid</span>
                                        <Badge className="bg-orange-500">
                                            {apiResponse.data.cleanedMemorizeValidationResult.tajweedErrors.length}
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {apiResponse.data.cleanedMemorizeValidationResult.tajweedErrors.map(
                                        (error, index) => (
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
                                        )
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Kesalahan Waqaf */}
                        {apiResponse.data.cleanedMemorizeValidationResult.waqafErrors.length > 0 && (
                            <Card className="border-yellow-500">
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center justify-between">
                                        <span>⏸️ Kesalahan Waqaf</span>
                                        <Badge className="bg-yellow-500">
                                            {apiResponse.data.cleanedMemorizeValidationResult.waqafErrors.length}
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {apiResponse.data.cleanedMemorizeValidationResult.waqafErrors.map(
                                        (error, index) => (
                                            <Card key={index} className="border-l-4 border-l-yellow-500">
                                                <CardContent className="pt-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="font-medium">Ayat {error.ayah}</span>
                                                        <Badge variant="outline">{error.type}</Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">{error.detail}</p>
                                                </CardContent>
                                            </Card>
                                        )
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Saran Umum */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">💡 Saran Umum</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="leading-relaxed">
                                    {apiResponse.data.cleanedMemorizeValidationResult.generalSuggestion}
                                </p>
                            </CardContent>
                        </Card>

                        {/* Success Message */}
                        <Card className="border-green-500">
                            <CardContent className="pt-4 text-center text-green-600 font-medium">
                                ✅ {apiResponse.message}
                            </CardContent>
                        </Card>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default MemorizationSession;
