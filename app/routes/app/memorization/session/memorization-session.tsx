import React, { useRef, useState, useEffect } from "react";
import { Form, useNavigation, useActionData, useNavigate } from "react-router";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Mic, Square, RotateCcw, Send, Loader2, AlertCircle, X, Volume2 } from "lucide-react";
import type { MemorizationSessionProps } from "~/routes/app/memorization/types";

const MemorizationSession: React.FC<MemorizationSessionProps> = ({
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
        <div className="min-h-screen flex flex-col bg-linear-to-br from-background via-primary/5 to-background">
            {/* Header - Minimalis & Clean */}
            <div className="w-full px-6 py-6 flex items-center justify-between border-b bg-background/80 backdrop-blur-sm">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/app/memorization')}
                    disabled={isSubmitting || recording}
                    className="gap-2"
                >
                    <X className="w-4 h-4" />
                    <span className="hidden sm:inline">Batal</span>
                </Button>
                <div className="text-center flex-1">
                    <h2 className="font-bold text-xl sm:text-2xl text-foreground">{surah.name}</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Ayat {startAyah} - {endAyah} • {type === 'ziyadah' ? 'Ziyadah' : 'Murojaah'}
                    </p>
                </div>
                <div className="w-[72px]" /> {/* Spacer for centering */}
            </div>

            {/* Main Content - Centered with focus on mic button */}
            <div className="flex-1 flex items-center justify-center px-4 py-8">
                <div className="w-full max-w-lg space-y-10">

                    {/* Recording Duration Display */}
                    {recording && (
                        <div className="text-center animate-in fade-in slide-in-from-top-2">
                            <div className="inline-flex items-center gap-3 px-6 py-3 bg-destructive/10 text-destructive rounded-full border border-destructive/20">
                                <div className="w-3 h-3 bg-destructive rounded-full animate-pulse" />
                                <span className="font-mono text-2xl font-bold">
                                    {formatDuration(recordingDuration)}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Big Round Record Button - Main Focus */}
                    <div className="flex flex-col items-center gap-8">
                        {!audioUrl ? (
                            <div className="relative">
                                {/* Ripple effect saat recording */}
                                {recording && (
                                    <>
                                        <div className="absolute -inset-4 rounded-full bg-destructive/20 animate-ping" />
                                        <div className="absolute -inset-2 rounded-full bg-destructive/30 animate-pulse" />
                                    </>
                                )}

                                {/* Main Record Button - BESAR & BULAT */}
                                <button
                                    type="button"
                                    onClick={recording ? handleStopRecording : handleStartRecording}
                                    disabled={isSubmitting}
                                    className={`
                                        relative w-48 h-48 sm:w-56 sm:h-56 rounded-full 
                                        flex items-center justify-center
                                        transition-all duration-300 shadow-2xl
                                        ${recording
                                            ? 'bg-linear-to-br from-destructive to-destructive/80 hover:from-destructive/90 hover:to-destructive/70 scale-95'
                                            : 'bg-linear-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 hover:scale-105'
                                        }
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                        focus:outline-none focus:ring-4 focus:ring-primary/30
                                        active:scale-90
                                    `}
                                >
                                    {recording ? (
                                        <Square className="w-20 h-20 sm:w-24 sm:h-24 text-white fill-white" />
                                    ) : (
                                        <Mic className="w-24 h-24 sm:w-28 sm:h-28 text-white" />
                                    )}
                                </button>
                            </div>
                        ) : (
                            /* Audio Player Card */
                            <Card className="w-full shadow-2xl border-2">
                                <CardContent className="pt-6 space-y-5">
                                    <div className="flex items-center gap-3 text-base text-muted-foreground">
                                        <Volume2 className="w-5 h-5" />
                                        <span className="font-medium">Rekaman Anda ({formatDuration(recordingDuration)})</span>
                                    </div>
                                    <audio controls src={audioUrl} className="w-full h-12" />

                                    {/* Action Button - Rekam Ulang */}
                                    <Button
                                        type="button"
                                        onClick={resetForm}
                                        variant="outline"
                                        size="lg"
                                        className="w-full"
                                        disabled={isSubmitting}
                                    >
                                        <RotateCcw className="w-4 h-4 mr-2" />
                                        Rekam Ulang
                                    </Button>
                                </CardContent>
                            </Card>
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
                                {error}
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
                                className="w-full h-16 text-lg font-semibold shadow-xl"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                                        Memproses dengan AI...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5 mr-3" />
                                        Kirim & Dapatkan Penilaian
                                    </>
                                )}
                            </Button>
                        </Form>
                    )}
                </div>
            </div>

            {/* Footer - Tips */}
            {!recording && !audioUrl && (
                <div className="w-full px-6 py-6 border-t bg-muted/30">
                    <div className="max-w-2xl mx-auto">
                        <p className="text-sm text-center text-muted-foreground leading-relaxed">
                            💡 <span className="font-medium">Tips:</span> Pastikan Anda berada di tempat yang tenang dan bacaan terdengar jelas untuk hasil penilaian AI yang lebih akurat
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MemorizationSession;
