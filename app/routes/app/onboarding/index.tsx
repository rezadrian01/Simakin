import React, { useState } from 'react';
import { Form, useNavigate, useActionData, redirect } from 'react-router';
import type { Route } from './+types/index';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Alert, AlertDescription } from '~/components/ui/alert';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '~/components/ui/select';
import { Textarea } from '~/components/ui/textarea';
import {
    CheckCircle2,
    AlertCircle,
    Loader2,
    BookOpen,
    Instagram,
    Youtube,
    Globe,
    Users,
    GraduationCap
} from 'lucide-react';
import { requireUserId } from '~/services/auth/auth.server';
import { saveOnboardingMemorization } from '~/services/memorization/memorization.server';
import { db } from '~/lib/db.server';

// Available referral sources
const REFERRAL_SOURCES = [
    { value: 'INSTAGRAM', label: 'Instagram', icon: Instagram },
    { value: 'TIKTOK', label: 'TikTok', icon: Globe },
    { value: 'YOUTUBE', label: 'YouTube', icon: Youtube },
    { value: 'FACEBOOK', label: 'Facebook', icon: Globe },
    { value: 'TWITTER', label: 'Twitter (X)', icon: Globe },
    { value: 'WEBSITE', label: 'Website/Blog', icon: Globe },
    { value: 'GOOGLE_SEARCH', label: 'Google Search', icon: Globe },
    { value: 'FRIEND', label: 'Teman', icon: Users },
    { value: 'FAMILY', label: 'Keluarga', icon: Users },
    { value: 'TEACHER', label: 'Guru/Ustadz', icon: GraduationCap },
    { value: 'MOSQUE', label: 'Masjid/Musholla', icon: BookOpen },
    { value: 'SCHOOL', label: 'Sekolah/Pesantren', icon: GraduationCap },
    { value: 'OTHER', label: 'Lainnya', icon: Globe },
] as const;

// Action to handle onboarding submission
export async function action({ request }: Route.ActionArgs) {
    const actionStartTime = Date.now();
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🚀 [ACTION] Onboarding form submitted");

    const userId = await requireUserId(request);
    const formData = await request.formData();

    const referralSource = formData.get('referralSource') as string;
    const referralOther = formData.get('referralOther') as string | null;
    const pageRangesRaw = formData.get('pageRanges') as string;

    console.log("📋 [ACTION] Form data received:");
    console.log("   - Referral Source:", referralSource);
    console.log("   - Referral Other:", referralOther);
    console.log("   - Page Ranges Raw:", pageRangesRaw);

    try {
        // Parse page ranges (comma or newline separated)
        const pageRanges = pageRangesRaw
            .split(/[,\n]/)
            .map(r => r.trim())
            .filter(r => r.length > 0);

        console.log("📄 [ACTION] Parsed page ranges:", pageRanges);

        // Validate at least one page range
        if (pageRanges.length === 0) {
            console.warn("⚠️  [ACTION] Validation failed: No page ranges provided");
            return {
                success: false,
                error: 'Silakan masukkan minimal 1 range halaman hafalan Anda',
            };
        }

        // Validate referral source
        if (!referralSource) {
            console.warn("⚠️  [ACTION] Validation failed: No referral source");
            return {
                success: false,
                error: 'Silakan pilih dari mana Anda mengetahui aplikasi ini',
            };
        }

        // Save referral source to user profile
        console.log("🔄 [ACTION] Saving referral source to UserProfile...");
        const profileStartTime = Date.now();

        await db.userProfile.upsert({
            where: { userId },
            create: {
                userId,
                referralSource: referralSource as any,
                referralOther: referralSource === 'OTHER' ? referralOther : null,
            },
            update: {
                referralSource: referralSource as any,
                referralOther: referralSource === 'OTHER' ? referralOther : null,
            },
        });

        const profileDuration = Date.now() - profileStartTime;
        console.log(`✅ [ACTION] UserProfile updated in ${profileDuration}ms`);

        // Save memorization data using Gemini AI
        console.log("🔄 [ACTION] Starting memorization save process...");
        const memStartTime = Date.now();

        const result = await saveOnboardingMemorization(userId, pageRanges);

        const memDuration = Date.now() - memStartTime;
        console.log(`✅ [ACTION] Memorization saved in ${memDuration}ms`);

        const totalDuration = Date.now() - actionStartTime;
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("🎉 [ACTION] Onboarding completed successfully!");
        console.log(`⏱️  [ACTION] Total action time: ${totalDuration}ms`);
        console.log("🔀 [ACTION] Redirecting to /app/dashboard");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

        // Redirect to dashboard on success
        return redirect('/app/dashboard');
    } catch (error: any) {
        const totalDuration = Date.now() - actionStartTime;
        console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.error("❌ [ACTION] Onboarding error occurred");
        console.error("⏱️  [ACTION] Failed after:", totalDuration, "ms");
        console.error("📋 [ACTION] Error details:", error);
        console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

        return {
            success: false,
            error: error.message || 'Terjadi kesalahan. Silakan coba lagi.',
        };
    }
}

// Loader to check if user already completed onboarding
export async function loader({ request }: Route.LoaderArgs) {
    const userId = await requireUserId(request);

    // Check if user already has profile with referral source
    const profile = await db.userProfile.findUnique({
        where: { userId },
        select: { referralSource: true },
    });

    // If already onboarded, redirect to dashboard
    if (profile?.referralSource) {
        return redirect('/app/dashboard');
    }

    return { userId };
}

export default function OnboardingPage() {
    const actionData = useActionData<typeof action>();
    const navigate = useNavigate();

    const [selectedSource, setSelectedSource] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    return (
        <div className="min-h-screen bg-linear-to-br from-simakin-primary/5 via-background to-simakin-primary/10 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl border-2">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-simakin-primary rounded-full flex items-center justify-center">
                            <BookOpen className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">Selamat Datang di Simakin! 🎉</CardTitle>
                    <CardDescription className="text-base mt-2">
                        Mari kita setup akun Anda agar pengalaman menghafal Al-Qur'an lebih personal
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <Form method="post" className="space-y-6">
                        {/* Error Alert */}
                        {actionData && !actionData.success && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{actionData.error}</AlertDescription>
                            </Alert>
                        )}

                        {/* Section 1: Referral Source */}
                        <div className="space-y-4">
                            <div className="bg-muted/50 p-4 rounded-lg">
                                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-simakin-primary" />
                                    1. Dari mana Anda mengetahui Simakin?
                                </h3>
                                <p className="text-sm text-muted-foreground mb-3">
                                    Informasi ini membantu kami memahami pengguna lebih baik
                                </p>

                                <Select
                                    name="referralSource"
                                    value={selectedSource}
                                    onValueChange={setSelectedSource}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih sumber..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {REFERRAL_SOURCES.map((source) => (
                                            <SelectItem key={source.value} value={source.value}>
                                                <div className="flex items-center gap-2">
                                                    <source.icon className="w-4 h-4" />
                                                    {source.label}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {/* Show text input if "Lainnya" selected */}
                                {selectedSource === 'OTHER' && (
                                    <div className="mt-3">
                                        <Label htmlFor="referralOther">Sebutkan sumbernya</Label>
                                        <Input
                                            id="referralOther"
                                            name="referralOther"
                                            placeholder="Contoh: WhatsApp Group, Telegram, dll"
                                            className="mt-1"
                                            required
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Section 2: Existing Memorization */}
                        <div className="space-y-4">
                            <div className="bg-muted/50 p-4 rounded-lg">
                                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-simakin-primary" />
                                    2. Hafalan Al-Qur'an yang Sudah Anda Miliki
                                </h3>
                                <p className="text-sm text-muted-foreground mb-3">
                                    Masukkan range halaman Al-Qur'an (Mushaf Rasm Utsmani, 604 halaman) yang sudah Anda hafal.
                                    <br />
                                    <span className="text-simakin-primary font-medium">
                                        Contoh: 1-301 atau 500-604
                                    </span>
                                </p>

                                <Label htmlFor="pageRanges">
                                    Range Halaman
                                    <span className="text-xs text-muted-foreground ml-2">
                                        (Pisahkan dengan koma jika lebih dari 1)
                                    </span>
                                </Label>
                                <Textarea
                                    id="pageRanges"
                                    name="pageRanges"
                                    placeholder="Contoh: 1-301, 500-604"
                                    rows={3}
                                    className="mt-1 font-mono"
                                    required
                                />

                                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-md border border-blue-200 dark:border-blue-800">
                                    <p className="text-sm text-blue-800 dark:text-blue-200 flex items-start gap-2">
                                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                        <span>
                                            <strong>Info:</strong> Kami menggunakan AI untuk mengkonversi range halaman
                                            menjadi data surah dan ayat. Proses ini memakan waktu beberapa detik.
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/app/dashboard')}
                                className="flex-1"
                                disabled={isSubmitting}
                            >
                                Lewati (Nanti Saja)
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1"
                                disabled={isSubmitting}
                                onClick={() => setIsSubmitting(true)}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Memproses...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                        Selesai & Mulai
                                    </>
                                )}
                            </Button>
                        </div>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
