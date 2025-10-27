import React, { useRef, useState, useEffect } from "react";
import { Form, useNavigation, useActionData } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Mic, Square, RotateCcw, Send, Loader2, AlertCircle } from "lucide-react";
import type { MemorizationSessionProps } from "~/routes/app/memorization/types";

const MemorizationSession: React.FC<MemorizationSessionProps> = ({
    surah,
    startAyah,
    endAyah,
    type,
}) => {
    const navigation = useNavigation();
    const actionData = useActionData<{ error?: string }>();
    const [recording, setRecording] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [error, setError] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const audioChunks = useRef<Blob[]>([]);

    const isSubmitting = navigation.state === "submitting";

    // Handle server errors from action
    useEffect(() => {
        if (actionData?.error) {
            setError(actionData.error);
        }
    }, [actionData]);

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
                    <Form method="post" encType="multipart/form-data" className="space-y-4">
                        {/* Hidden fields */}
                        <input type="hidden" name="surat" value={surah.number} />
                        <input type="hidden" name="startAyat" value={startAyah} />
                        <input type="hidden" name="endAyat" value={endAyah} />
                        <input type="hidden" name="type" value={type} />

                        {/* Audio file input (hidden) */}
                        {audioBlob && (
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
                        )}

                        {/* Recording Controls */}
                        <div className="flex gap-3">
                            {recording ? (
                                <Button
                                    type="button"
                                    onClick={handleStopRecording}
                                    variant="destructive"
                                    size="lg"
                                    disabled={isSubmitting}
                                >
                                    <Square className="w-5 h-5 mr-2" />
                                    Stop Recording
                                </Button>
                            ) : (
                                <Button
                                    type="button"
                                    onClick={handleStartRecording}
                                    size="lg"
                                    disabled={isSubmitting}
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
                                    disabled={isSubmitting}
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
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription className="ml-2">
                                    {error}
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            size="lg"
                            className="w-full"
                            disabled={!audioBlob || isSubmitting}
                        >
                            {isSubmitting ? (
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
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
};

export default MemorizationSession;
