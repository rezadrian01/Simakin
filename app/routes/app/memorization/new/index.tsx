import React from 'react'
import { useNavigate, data } from 'react-router'
import type { Route } from './+types/index'
import NewMemorizationForm from './new-memorization-form'
import type { QuranSurah, MemorizationType } from '../types'
import type { MemorizationFormValues } from '../utils/schema'

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
    const formData = await request.formData()
    const surah = formData.get('surah') as string
    const start = formData.get('start') as string
    const end = formData.get('end') as string
    const type = formData.get('type') as MemorizationType

    // TODO: Get userId from session/auth
    const userId = "temp-user-id"

    try {
        // TODO: Save to database using Prisma
        // const recitation = await db.recitation.create({
        //   data: {
        //     userId,
        //     surah: parseInt(surah),
        //     startAyah: parseInt(start),
        //     endAyah: parseInt(end),
        //     mode: type === 'ziyadah' ? 'HAFALAN' : 'MUROJAAH',
        //     status: 'PENDING',
        //   }
        // })

        // For now, redirect to session page with query params
        const sessionUrl = `/app/memorization/session?surah=${surah}&start=${start}&end=${end}&type=${type}`
        return data({ success: true, sessionUrl }, { status: 302 })
    } catch (error) {
        console.error('Error creating memorization session:', error)
        return data({
            success: false,
            error: 'Gagal membuat sesi memorization'
        }, { status: 400 })
    }
}

export default function NewMemorizationPage({ loaderData }: Route.ComponentProps) {
    const navigate = useNavigate()
    const { quranSurahs } = loaderData

    const handleSubmit = async (values: MemorizationFormValues & { type: MemorizationType }) => {
        const formData = new FormData()
        formData.append('surah', values.surah)
        formData.append('start', values.start)
        formData.append('end', values.end)
        formData.append('type', values.type)

        try {
            const response = await fetch('/app/memorization/new', {
                method: 'POST',
                body: formData,
            })

            const result = await response.json()

            if (result.success && result.sessionUrl) {
                navigate(result.sessionUrl)
            } else {
                console.error('Failed to create session:', result.error)
                // TODO: Show error toast/notification
            }
        } catch (error) {
            console.error('Error submitting form:', error)
            // TODO: Show error toast/notification
        }
    }

    const handleCancel = () => {
        navigate('/app/memorization')
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <NewMemorizationForm
                quranSurahs={quranSurahs}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
            />
        </div>
    )
}