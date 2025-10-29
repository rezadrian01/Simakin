import React, { useState } from 'react';
import { Form, useActionData, redirect } from 'react-router';
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
import {
    CheckCircle2,
    AlertCircle,
    Loader2,
    BookOpen,
    Instagram,
    Youtube,
    Globe,
    Users,
    GraduationCap,
    Plus,
    Trash2,
    ArrowRight
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

interface PageRange {
    id: string;
    startPage: string;
    endPage: string;
}

// Action to handle onboarding submission
export async function action({ request }: Route.ActionArgs) {
    const userId = await requireUserId(request);
    const formData = await request.formData();

    const referralSource = formData.get('referralSource') as string;
    const referralOther = formData.get('referralOther') as string | null;
    const pageRangesRaw = formData.get('pageRanges') as string;

    try {
        // Parse page ranges (comma or newline separated)
        const pageRanges = pageRangesRaw
            .split(/[,\n]/)
            .map(r => r.trim())
            .filter(r => r.length > 0);

        // Validate at least one page range
        if (pageRanges.length === 0) {
            return {
                success: false,
                error: 'Silakan masukkan minimal 1 range halaman hafalan Anda',
            };
        }

        // Validate referral source
        if (!referralSource) {
            return {
                success: false,
                error: 'Silakan pilih dari mana Anda mengetahui aplikasi ini',
            };
        }

        // Save referral source to user profile
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

        // Save memorization data
        await saveOnboardingMemorization(userId, pageRanges);

        // Redirect to dashboard on success
        return redirect('/app/dashboard');
    } catch (error: any) {
        console.error('[ONBOARD] Error:', error.message);
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

    const [selectedSource, setSelectedSource] = useState('');
    const [referralOther, setReferralOther] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [pageRanges, setPageRanges] = useState<PageRange[]>([
        { id: '1', startPage: '', endPage: '' }
    ]);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    const handleSubmit = () => {
        setIsSubmitting(true);
    };

    const addRange = () => {
        setPageRanges([...pageRanges, {
            id: Date.now().toString(),
            startPage: '',
            endPage: ''
        }]);
    };

    const removeRange = (id: string) => {
        if (pageRanges.length > 1) {
            setPageRanges(pageRanges.filter(r => r.id !== id));
            // Clear validation errors for this range
            const newErrors = { ...validationErrors };
            delete newErrors[`start-${id}`];
            delete newErrors[`end-${id}`];
            setValidationErrors(newErrors);
        }
    };

    const updateRange = (id: string, field: 'startPage' | 'endPage', value: string) => {
        // Only allow numbers
        if (value && !/^\d*$/.test(value)) return;

        const updatedRanges = pageRanges.map(r =>
            r.id === id ? { ...r, [field]: value } : r
        );
        setPageRanges(updatedRanges);

        // Validate current range
        validateRange(id, field, value, updatedRanges);

        // Re-validate all other ranges to check for overlaps
        updatedRanges.forEach(range => {
            if (range.id !== id && range.startPage && range.endPage) {
                validateRange(range.id, 'endPage', range.endPage, updatedRanges);
            }
        });
    };

    const validateRange = (
        id: string,
        field: 'startPage' | 'endPage',
        value: string,
        ranges: PageRange[] = pageRanges
    ) => {
        const newErrors = { ...validationErrors };
        const range = ranges.find(r => r.id === id);

        if (!range) return;

        const num = parseInt(value);
        const otherField = field === 'startPage' ? 'endPage' : 'startPage';
        const otherValue = range[otherField];

        // Clear previous errors for this field and overlap errors
        delete newErrors[`${field === 'startPage' ? 'start' : 'end'}-${id}`];
        delete newErrors[`overlap-${id}`];

        if (value) {
            // Validate range (1-604)
            if (num < 1) {
                newErrors[`${field === 'startPage' ? 'start' : 'end'}-${id}`] =
                    'Minimal halaman 1';
            } else if (num > 604) {
                newErrors[`${field === 'startPage' ? 'start' : 'end'}-${id}`] =
                    'Maksimal halaman 604';
            }

            // Validate start < end
            if (otherValue) {
                const otherNum = parseInt(otherValue);
                if (field === 'startPage' && num > otherNum) {
                    newErrors[`start-${id}`] = 'Harus lebih kecil dari halaman akhir';
                } else if (field === 'endPage' && num < parseInt(range.startPage)) {
                    newErrors[`end-${id}`] = 'Harus lebih besar dari halaman awal';
                }
            }

            // Check for overlaps with other ranges
            if (range.startPage && range.endPage) {
                const currentStart = parseInt(range.startPage);
                const currentEnd = parseInt(range.endPage);

                // Only validate if both start and end are valid
                if (currentStart >= 1 && currentEnd <= 604 && currentStart <= currentEnd) {
                    ranges.forEach(otherRange => {
                        if (otherRange.id !== id && otherRange.startPage && otherRange.endPage) {
                            const otherStart = parseInt(otherRange.startPage);
                            const otherEnd = parseInt(otherRange.endPage);

                            // Check if ranges overlap
                            const overlaps =
                                (currentStart >= otherStart && currentStart <= otherEnd) ||
                                (currentEnd >= otherStart && currentEnd <= otherEnd) ||
                                (currentStart <= otherStart && currentEnd >= otherEnd);

                            if (overlaps) {
                                newErrors[`overlap-${id}`] =
                                    `Range ini overlap dengan ${otherStart}-${otherEnd}`;
                            }
                        }
                    });
                }
            }
        }

        setValidationErrors(newErrors);
    };

    // Convert page ranges to form data format
    const formatPageRanges = () => {
        return pageRanges
            .filter(r => r.startPage && r.endPage)
            .map(r => `${r.startPage}-${r.endPage}`)
            .join(', ');
    };

    // Check if there are any filled ranges
    const hasFilledRanges = pageRanges.some(r => r.startPage || r.endPage);

    // Check if all filled ranges are complete (both start and end filled)
    const allFilledRangesComplete = pageRanges.every(r => {
        const hasStart = r.startPage.trim() !== '';
        const hasEnd = r.endPage.trim() !== '';
        // If one field is filled, both must be filled
        if (hasStart || hasEnd) {
            return hasStart && hasEnd;
        }
        return true; // Empty ranges are okay
    });

    const hasErrors = Object.keys(validationErrors).length > 0;

    // Check if referral source is selected and valid
    const isReferralSourceValid = selectedSource !== '' &&
        (selectedSource !== 'OTHER' || referralOther.trim() !== '');

    return (
        <div className="min-h-screen bg-linear-to-br from-simakin-primary/5 via-background to-simakin-primary/10 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl border-2">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                            <BookOpen className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">Selamat Datang di Simakin!</CardTitle>
                    <CardDescription className="text-base mt-2">
                        Mari kita setup akun Anda agar pengalaman menghafal Al-Qur'an lebih personal
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <Form method="post" className="space-y-6" onSubmit={handleSubmit}>
                        {/* Error Alert */}
                        {actionData && !actionData.success && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{actionData.error}</AlertDescription>
                            </Alert>
                        )}

                        {/* Section 1: Referral Source */}
                        <div className="space-y-4">
                            <div className="bg-muted/50 p-4 rounded-lg border-2 border-muted">
                                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                                    <span>
                                        <CheckCircle2 className="w-5 h-5 text-simakin-primary" />
                                    </span>
                                    1. Dari mana Anda mengetahui Simakin?
                                </h3>
                                <p className="text-sm text-muted-foreground mb-3">
                                    Informasi ini membantu kami memahami pengguna lebih baik
                                </p>

                                {/* Hidden input to ensure value is submitted */}
                                <input type="hidden" name="referralSource" value={selectedSource} />

                                <Select
                                    value={selectedSource}
                                    onValueChange={setSelectedSource}
                                    required
                                >
                                    <SelectTrigger className='w-full h-12 border-2 bg-background text-base'>
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
                                        <Label htmlFor="referralOther" className="text-sm font-medium">
                                            Sebutkan sumbernya
                                        </Label>
                                        <Input
                                            id="referralOther"
                                            name="referralOther"
                                            value={referralOther}
                                            onChange={(e) => setReferralOther(e.target.value)}
                                            placeholder="Contoh: WhatsApp Group, Telegram, dll"
                                            className="mt-2 h-11 border-2 bg-background"
                                            required
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Section 2: Existing Memorization */}
                        <div className="space-y-4">
                            <div className="bg-muted/50 p-4 rounded-lg border-2 border-muted">
                                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                                    <span>
                                        <CheckCircle2 className="w-5 h-5 text-simakin-primary" />
                                    </span>
                                    2. Hafalan Al-Qur'an yang Sudah Anda Miliki
                                </h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Masukkan range halaman Al-Qur'an (Mushaf Rasm Utsmani, 604 halaman) yang sudah Anda hafal.
                                    <br />
                                    <span className="text-xs italic">
                                        *Bisa dikosongkan jika belum memiliki hafalan sama sekali
                                    </span>
                                </p>

                                {/* Example Card */}
                                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950 border-2 border-blue-200 dark:border-blue-800 rounded-lg">
                                    <div className="flex items-start gap-2">
                                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                            <span className="text-white text-xs font-bold">i</span>
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                                                Contoh Pengisian:
                                            </p>
                                            <div className="space-y-1 text-xs text-blue-700 dark:text-blue-300">
                                                <p>• <strong>Juz 30 (halaman 582-604):</strong> Isi 582 s/d 604</p>
                                                <p>• <strong>Juz 1-2 (halaman 1-40):</strong> Isi 1 s/d 40</p>
                                                <p>• <strong>Beberapa halaman terpisah:</strong> Tambahkan range baru untuk setiap segmen</p>
                                                <p>• <strong>Belum punya hafalan:</strong> Kosongkan saja dan klik "Selesai & Mulai"</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <Label>Rentang Halaman yang Sudah Dihafal (Opsional)</Label>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Tambahkan rentang halaman Al-Qur'an yang sudah kamu hafal, atau kosongkan jika belum punya
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        {pageRanges.map((range, index) => (
                                            <div
                                                key={range.id}
                                                className="p-4 border-2 border-muted rounded-lg bg-background space-y-3"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium text-muted-foreground">
                                                        Range #{index + 1}
                                                    </span>
                                                    {pageRanges.length > 1 && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeRange(range.id)}
                                                            className="h-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="w-4 h-4 mr-1" />
                                                            Hapus
                                                        </Button>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor={`start-${range.id}`} className="text-sm font-semibold">
                                                            Halaman Awal
                                                        </Label>
                                                        <Input
                                                            id={`start-${range.id}`}
                                                            type="number"
                                                            min="1"
                                                            max="604"
                                                            value={range.startPage}
                                                            onChange={(e) => updateRange(range.id, 'startPage', e.target.value)}
                                                            placeholder="Contoh: 1"
                                                            className={`h-12 text-base border-2 ${validationErrors[`start-${range.id}`] || validationErrors[`overlap-${range.id}`]
                                                                ? 'border-red-500 focus-visible:ring-red-500'
                                                                : 'border-border'
                                                                }`}
                                                        />
                                                        {validationErrors[`start-${range.id}`] && (
                                                            <p className="text-xs text-red-500 flex items-start gap-1">
                                                                <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                                                                {validationErrors[`start-${range.id}`]}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor={`end-${range.id}`} className="text-sm font-semibold">
                                                            Halaman Akhir
                                                        </Label>
                                                        <Input
                                                            id={`end-${range.id}`}
                                                            type="number"
                                                            min="1"
                                                            max="604"
                                                            value={range.endPage}
                                                            onChange={(e) => updateRange(range.id, 'endPage', e.target.value)}
                                                            placeholder="Contoh: 604"
                                                            className={`h-12 text-base border-2 ${validationErrors[`end-${range.id}`] || validationErrors[`overlap-${range.id}`]
                                                                ? 'border-red-500 focus-visible:ring-red-500'
                                                                : 'border-border'
                                                                }`}
                                                        />
                                                        {validationErrors[`end-${range.id}`] && (
                                                            <p className="text-xs text-red-500 flex items-start gap-1">
                                                                <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                                                                {validationErrors[`end-${range.id}`]}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                {validationErrors[`overlap-${range.id}`] && (
                                                    <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md">
                                                        <p className="text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
                                                            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                                            <span className="font-medium">{validationErrors[`overlap-${range.id}`]}</span>
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}

                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={addRange}
                                            className="w-full h-11 border-2"
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Tambah Range Halaman
                                        </Button>
                                    </div>

                                    {/* Hidden input to submit formatted ranges */}
                                    <input
                                        type="hidden"
                                        name="pageRanges"
                                        value={formatPageRanges()}
                                    />

                                    {/* Incomplete range warning */}
                                    {hasFilledRanges && !allFilledRangesComplete && (
                                        <div className="p-3 bg-amber-50 dark:bg-amber-950 border-2 border-amber-200 dark:border-amber-800 rounded-lg">
                                            <p className="text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
                                                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                                <span>
                                                    <strong>Perhatian:</strong> Jika mengisi salah satu field (Halaman Awal atau Akhir),
                                                    pastikan kedua field terisi lengkap.
                                                </span>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end pt-4">
                            <Button
                                type="submit"
                                className="w-full w-full h-12 text-base"
                                disabled={isSubmitting || !isReferralSourceValid || !allFilledRangesComplete || hasErrors}
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
