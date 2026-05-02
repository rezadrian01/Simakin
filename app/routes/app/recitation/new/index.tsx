import React from 'react'
import { redirect, data } from 'react-router'
import type { Route } from './+types/index'
import NewRecitationForm from './new-recitation-form'
import type { QuranSurah } from '../types'
import { db } from '~/lib/db.server'
import { requireUserId } from '~/services/auth/auth.server'

// Loader function to fetch Quran surah list
export async function loader({ request }: Route.LoaderArgs) {
    try {
        // Fetch from Quran API
        const response = await fetch('https://equran.id/api/v2/surat')
        const result = await response.json()

        if (!result.data) {
            throw new Error('Failed to fetch surah list')
        }

        const quranSurahs: QuranSurah[] = result.data.map((surah: any) => ({
            nomor: surah.nomor,
            nama: surah.nama,
            namaLatin: surah.namaLatin,
            jumlahAyat: surah.jumlahAyat,
            tempatTurun: surah.tempatTurun,
            arti: surah.arti,
        }))

        return { quranSurahs }
    } catch (error) {
        console.error('Error fetching surah list:', error)
        // Return empty array if fetch fails
        return { quranSurahs: [] }
    }
}

// Action function to handle form submission
export async function action({ request }: Route.ActionArgs) {
    // Get authenticated user
    const userId = await requireUserId(request)

    const formData = await request.formData()
    const surah = formData.get('surah') as string
    const start = formData.get('start') as string
    const end = formData.get('end') as string
    const type = formData.get('type') as string

    // Validate required fields
    if (!surah || !start || !end || !type) {
        return data(
            { error: 'Semua field harus diisi' },
            { status: 400 }
        )
    }

    // For ZIYADAH sessions, check for overlapping memorizations
    if (type === 'ziyadah') {
        const surahNum = parseInt(surah)
        const startAyah = parseInt(start)
        const endAyah = parseInt(end)

        try {
            // Find any existing memorizations for this surah that overlap with the requested range
            const overlappingMemorizations = await db.userMemorization.findMany({
                where: {
                    userId: userId,
                    surah: surahNum,
                    OR: [
                        // Requested range starts within existing range
                        {
                            AND: [
                                { startAyah: { lte: startAyah } },
                                { endAyah: { gte: startAyah } },
                            ],
                        },
                        // Requested range ends within existing range
                        {
                            AND: [
                                { startAyah: { lte: endAyah } },
                                { endAyah: { gte: endAyah } },
                            ],
                        },
                        // Requested range completely contains existing range
                        {
                            AND: [
                                { startAyah: { gte: startAyah } },
                                { endAyah: { lte: endAyah } },
                            ],
                        },
                    ],
                },
            })

            if (overlappingMemorizations.length > 0) {
                const overlap = overlappingMemorizations[0]
                return data(
                    {
                        error: `Anda sudah pernah menghafal ayat ${overlap.startAyah}-${overlap.endAyah} dari surah ini. Untuk menghafal ulang, gunakan mode Murojaah.`,
                        suggestion: 'murojaah',
                    },
                    { status: 409 }
                )
            }
        } catch (error) {
            console.error('[OVERLAP] Error checking overlaps:', error)
            // Continue if overlap check fails - not critical
        }
    }

    // Redirect to session page with query params
    const sessionUrl = `/app/recitation/session?surah=${surah}&start=${start}&end=${end}&type=${type}`

    return redirect(sessionUrl)
}

export default function NewRecitationPage({ loaderData }: Route.ComponentProps) {
    const { quranSurahs } = loaderData

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <NewRecitationForm quranSurahs={quranSurahs} />
        </div>
    )
}