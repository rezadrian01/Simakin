import React from 'react'
import { redirect } from 'react-router'
import type { Route } from './+types/index'
import NewRecitationForm from './new-recitation-form'
import type { QuranSurah } from '../types'

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
    const type = formData.get('type') as string

    // Validate required fields
    if (!surah || !start || !end || !type) {
        throw new Error('Missing required fields')
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