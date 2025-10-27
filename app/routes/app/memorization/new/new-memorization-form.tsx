import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form';
import { Badge } from '~/components/ui/badge';
import { BookOpen, Plus } from 'lucide-react';
import type { QuranSurah, MemorizationType } from '~/routes/app/memorization/types';
import { MemorizationSchema, type MemorizationFormValues } from '~/routes/app/memorization/utils/schema';

interface NewMemorizationFormProps {
    quranSurahs: QuranSurah[];
    onSubmit: (values: MemorizationFormValues & { type: MemorizationType }) => void;
    onCancel: () => void;
}

const NewMemorizationForm: React.FC<NewMemorizationFormProps> = ({
    quranSurahs,
    onSubmit,
    onCancel
}) => {
    const [memorizationType, setMemorizationType] = useState<MemorizationType>('ziyadah');

    const defaultSurah = quranSurahs.length > 0 ? quranSurahs[0].nomor.toString() : "";
    const defaultAyat = quranSurahs.length > 0 ? quranSurahs[0].jumlahAyat : 1;

    const form = useForm<MemorizationFormValues>({
        resolver: zodResolver(MemorizationSchema),
        defaultValues: {
            surah: defaultSurah,
            start: "1",
            end: defaultAyat.toString(),
        },
        mode: "onChange",
    });

    // Update ayat range when surah changes
    const selectedSurah = form.watch("surah") || defaultSurah;
    useEffect(() => {
        if (quranSurahs.length > 0 && selectedSurah) {
            const surah = quranSurahs.find(
                (s) => s.nomor.toString() === selectedSurah
            );
            if (surah) {
                form.setValue("start", "1");
                form.setValue("end", surah.jumlahAyat.toString());
            }
        }
    }, [selectedSurah, quranSurahs, form]);

    const handleSubmit = (values: MemorizationFormValues) => {
        onSubmit({ ...values, type: memorizationType });
    };

    const surahOptions = quranSurahs.map((surah) => ({
        value: surah.nomor.toString(),
        label: `${surah.namaLatin} (${surah.nama})`,
        jumlahAyat: surah.jumlahAyat,
    }));

    const currentSurah = quranSurahs.find(
        (s) => s.nomor.toString() === selectedSurah
    );
    const maxAyat = currentSurah ? currentSurah.jumlahAyat : 1;

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Mulai Sesi Memorization
                </CardTitle>
                <CardDescription>
                    Pilih surah, range ayat, dan tipe memorization yang ingin Anda setor
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        {/* Memorization Type Selection */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-foreground">Tipe Memorization</label>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant={memorizationType === 'ziyadah' ? 'default' : 'outline'}
                                    onClick={() => setMemorizationType('ziyadah')}
                                >
                                    Ziyadah
                                </Button>
                                <Button
                                    type="button"
                                    variant={memorizationType === 'murojaah' ? 'default' : 'outline'}
                                    onClick={() => setMemorizationType('murojaah')}
                                >
                                    Murojaah
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {memorizationType === 'ziyadah'
                                    ? 'Ziyadah: Menambah hafalan baru'
                                    : 'Murojaah: Mengulang hafalan yang sudah ada'
                                }
                            </p>
                        </div>

                        {/* Surah Selection */}
                        <FormField
                            control={form.control}
                            name="surah"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Surah</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih Surah" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {surahOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    <div className="flex items-center justify-between w-full">
                                                        <span>{option.label}</span>
                                                        <Badge variant="outline" className="ml-2">
                                                            {option.jumlahAyat} ayat
                                                        </Badge>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        Pilih surah yang ingin disetor. Range ayat akan otomatis disesuaikan.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Ayat Range */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="start"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Ayat Mulai</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={1}
                                                max={maxAyat}
                                                placeholder="1"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Ayat pertama yang akan disetor
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="end"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Ayat Akhir</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={parseInt(form.getValues("start")) || 1}
                                                max={maxAyat}
                                                placeholder="1"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Ayat terakhir yang akan disetor
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Summary */}
                        {currentSurah && (
                            <Card>
                                <CardContent className="pt-4">
                                    <h4 className="font-medium text-foreground mb-2">Ringkasan Sesi</h4>
                                    <div className="text-sm text-muted-foreground space-y-1">
                                        <p><span className="font-medium">Surah:</span> {currentSurah.namaLatin} ({currentSurah.nama})</p>
                                        <p><span className="font-medium">Range:</span> Ayat {form.watch("start")} - {form.watch("end")}</p>
                                        <p><span className="font-medium">Tipe:</span> {memorizationType === 'ziyadah' ? 'Ziyadah' : 'Murojaah'}</p>
                                        <p><span className="font-medium">Total Ayat:</span> {Math.max(0, parseInt(form.watch("end") || "1") - parseInt(form.watch("start") || "1") + 1)} ayat</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3 pt-6">
                            <Button
                                type="submit"
                                size="lg"
                                className="font-semibold py-4 shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                <Plus className="w-5 h-5 mr-3" />
                                Mulai Memorization
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={onCancel}
                            >
                                Batal
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};

export default NewMemorizationForm;
