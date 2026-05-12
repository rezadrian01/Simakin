import React, { useRef, useState, useEffect } from "react";
import { Form, useNavigation, useActionData, useNavigate } from "react-router";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Mic, Square, RotateCcw, Send, Loader2, AlertCircle, X, Volume2, BookOpen, Lightbulb } from "lucide-react";
import type { RecitationSessionProps } from "~/routes/app/recitation/types";

const RecitationSession: React.FC<RecitationSessionProps> = ({
    surah,
    startAyah,
    endAyah,
    type,
}) => {
    const navigation = useNavigation();
    const navigate = useNavigate();
    const actionData = useActionData<{ error?: string }>();
    const [recording, setRecording] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [recordingDuration, setRecordingDuration] = useState(0);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const audioChunks = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const isSubmitting = navigation.state === "submitting";

    // Handle server errors from action
    useEffect(() => {
        if (actionData?.error) {
            setError(actionData.error);
        }
    }, [actionData]);

    // Timer untuk recording duration
    useEffect(() => {
        if (recording) {
            timerRef.current = setInterval(() => {
                setRecordingDuration((prev) => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [recording]);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleStartRecording = async () => {
        try {
            setError(null);
            setRecordingDuration(0);
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
            setError("Akses mikrofon ditolak atau tidak tersedia. Pastikan Anda memberikan izin akses mikrofon.");
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

    const resetForm = () => {
        if (recording) {
            handleStopRecording();
        }

        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
        }

        setAudioUrl(null);
        setAudioBlob(null);
        setError(null);
        setRecordingDuration(0);
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-primary/5 to-secondary/5 relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            {/* Header - Enhanced with gradient border */}
            <div className="relative w-full px-6 py-6 flex items-center justify-between border-b border-border/50 bg-background/95 backdrop-blur-lg shadow-sm">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/app/recitation')}
                    disabled={isSubmitting || recording}
                    className="gap-2 hover:bg-primary/10 transition-colors"
                >
                    <X className="w-4 h-4" />
                    <span className="hidden sm:inline">Batal</span>
                </Button>
                <div className="text-center flex-1">
                    <h2 className="font-bold text-xl sm:text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        {surah.name}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1 flex items-center justify-center gap-2">
                        <span className="inline-flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            Ayat {startAyah}-{endAyah}
                        </span>
                        <span className="text-muted-foreground/50">•</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            type === 'ziyadah'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
                        }`}>
                            {type === 'ziyadah' ? 'Ziyadah' : 'Murojaah'}
                        </span>
                    </p>
                </div>
                <div className="w-[72px]" /> {/* Spacer for centering */}
            </div>

            {/* Main Content - Centered with focus on mic button */}
            <div className="flex-1 flex items-center justify-center px-4 py-8">
                <div className="w-full max-w-lg space-y-10">

                    {/* Recording Duration Display - Enhanced */}
                    {recording && (
                        <div className="text-center animate-in fade-in slide-in-from-top-2 duration-500">
                            <div className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-500/10 to-red-600/10 text-red-600 dark:text-red-400 rounded-full border-2 border-red-500/30 shadow-lg shadow-red-500/20">
                                <div className="relative">
                                    <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse" />
                                    <div className="absolute inset-0 w-4 h-4 bg-red-500 rounded-full animate-ping" />
                                </div>
                                <span className="font-mono text-3xl font-bold tracking-wider">
                                    {formatDuration(recordingDuration)}
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-3 animate-pulse">
                                Merekam bacaan Anda...
                            </p>
                        </div>
                    )}

                    {/* Big Round Record Button - Main Focus */}
                    <div className="flex flex-col items-center gap-8">
                        {!audioUrl ? (
                            <div className="relative group">
                                {/* Ripple effect saat recording - Enhanced */}
                                {recording && (
                                    <>
                                        <div className="absolute -inset-8 rounded-full bg-red-500/20 animate-ping" />
                                        <div className="absolute -inset-6 rounded-full bg-red-500/30 animate-pulse" style={{ animationDuration: '1.5s' }} />
                                        <div className="absolute -inset-4 rounded-full bg-red-500/40 animate-pulse" style={{ animationDuration: '2s' }} />
                                    </>
                                )}

                                {/* Glow effect when not recording */}
                                {!recording && (
                                    <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-primary to-secondary opacity-30 blur-xl group-hover:opacity-50 transition-opacity" />
                                )}

                                {/* Main Record Button - BESAR & BULAT - Enhanced */}
                                <button
                                    type="button"
                                    onClick={recording ? handleStopRecording : handleStartRecording}
                                    disabled={isSubmitting}
                                    className={`
                                        relative w-52 h-52 sm:w-64 sm:h-64 rounded-full
                                        flex items-center justify-center
                                        transition-all duration-500 shadow-2xl
                                        ${recording
                                            ? 'bg-gradient-to-br from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:to-red-800 scale-95'
                                            : 'bg-gradient-to-br from-primary via-primary to-secondary hover:from-primary/90 hover:to-secondary/90 hover:scale-110'
                                        }
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                        focus:outline-none focus:ring-8 focus:ring-primary/20
                                        active:scale-85 border-4 border-white/20
                                        backdrop-blur-sm
                                    `}
                                >
                                    <div className="relative">
                                        {recording ? (
                                            <Square className="w-24 h-24 sm:w-28 sm:h-28 text-white fill-white drop-shadow-2xl animate-pulse" />
                                        ) : (
                                            <Mic className="w-28 h-28 sm:w-32 sm:h-32 text-white drop-shadow-2xl group-hover:scale-110 transition-transform" />
                                        )}
                                    </div>
                                </button>

                                {/* Instructional text */}
                                <p className="text-center mt-6 text-sm font-medium text-muted-foreground">
                                    {recording ? '⬜ Tekan untuk berhenti' : '🎤 Tekan untuk mulai merekam'}
                                </p>
                            </div>
                        ) : (
                            /* Audio Player Card - Enhanced */
                            <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <Card className="shadow-2xl border-2 border-primary/20 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm overflow-hidden">
                                    {/* Success Badge */}
                                    <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-b border-green-500/20 px-6 py-3">
                                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                            <span className="text-sm font-medium">✓ Rekaman berhasil disimpan</span>
                                        </div>
                                    </div>

                                    <CardContent className="pt-6 space-y-5">
                                        {/* Audio Info */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-3 bg-primary/10 rounded-full">
                                                    <Volume2 className="w-5 h-5 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-foreground">Rekaman Anda</p>
                                                    <p className="text-sm text-muted-foreground">{formatDuration(recordingDuration)}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Audio Player with custom styling */}
                                        <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                                            <audio controls src={audioUrl} className="w-full h-12" />
                                        </div>

                                        {/* Action Button - Rekam Ulang */}
                                        <Button
                                            type="button"
                                            onClick={resetForm}
                                            variant="outline"
                                            size="lg"
                                            className="w-full border-2 hover:bg-muted hover:border-primary/30 transition-all"
                                            disabled={isSubmitting}
                                        >
                                            <RotateCcw className="w-4 h-4 mr-2" />
                                            Rekam Ulang
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Instruction Text */}
                        <p className="text-center text-base sm:text-lg text-muted-foreground max-w-md px-4 leading-relaxed">
                            {!audioUrl && !recording && "Tekan tombol mikrofon untuk mulai merekam bacaan Anda"}
                            {recording && "Bacakan ayat dengan tartil dan jelas, tekan tombol stop jika sudah selesai"}
                            {audioUrl && "Dengarkan rekaman Anda, lalu kirim untuk mendapatkan penilaian AI"}
                        </p>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="ml-2">
                                <p className="font-medium mb-2">{error}</p>
                                <div className="flex items-center gap-2 mt-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setError(null)}
                                        className="bg-background"
                                    >
                                        Tutup & Coba Lagi
                                    </Button>
                                    <span className="text-xs opacity-80">
                                        Audio Anda masih tersimpan
                                    </span>
                                </div>
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Submit Form */}
                    {audioBlob && (
                        <Form method="post" encType="multipart/form-data" className="w-full">
                            {/* Hidden fields */}
                            <input type="hidden" name="surat" value={surah.number} />
                            <input type="hidden" name="startAyat" value={startAyah} />
                            <input type="hidden" name="endAyat" value={endAyah} />
                            <input type="hidden" name="type" value={type} />

                            {/* Audio file input (hidden) */}
                            <input
                                type="file"
                                name="audio"
                                style={{ display: 'none' }}
                                ref={(input) => {
                                    if (input && audioBlob) {
                                        const file = new File([audioBlob], "recording.webm", { type: "audio/webm" });
                                        const dataTransfer = new DataTransfer();
                                        dataTransfer.items.add(file);
                                        input.files = dataTransfer.files;
                                    }
                                }}
                            />

                            <Button
                                type="submit"
                                size="lg"
                                className="w-full h-20 text-lg font-semibold shadow-2xl bg-gradient-to-r from-primary via-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all duration-300 hover:scale-[1.02] active:scale-95 border-2 border-white/10"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <div className="flex flex-col items-center gap-2 py-1">
                                        <div className="flex items-center">
                                            <Loader2 className="w-7 h-7 mr-3 animate-spin" />
                                            <span className="text-lg">Memproses dengan AI...</span>
                                        </div>
                                        <span className="text-xs font-normal opacity-90 bg-black/10 px-3 py-1 rounded-full">
                                            Transkripsi audio → Analisis hafalan & tajwid
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <Send className="w-6 h-6" />
                                        <span>Kirim & Dapatkan Penilaian</span>
                                        <span className="ml-2 text-sm opacity-75">✨</span>
                                    </div>
                                )}
                            </Button>
                        </Form>
                    )}
                </div>
            </div>

            {/* Footer - Tips - Enhanced */}
            {!recording && !audioUrl && (
                <div className="relative w-full px-6 py-8 border-t border-border/50 bg-gradient-to-t from-muted/50 to-background/50 backdrop-blur-sm">
                    <div className="max-w-2xl mx-auto">
                        <div className="flex items-start gap-4 p-4 rounded-lg bg-primary/5 border border-primary/10">
                            <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                                <Lightbulb className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="font-semibold text-sm text-foreground mb-1">Tips untuk hasil terbaik</p>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Pastikan Anda berada di tempat yang tenang dan bacaan terdengar jelas untuk hasil penilaian AI yang lebih akurat
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecitationSession;
