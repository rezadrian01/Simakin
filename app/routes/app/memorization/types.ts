export type MemorizationType = "ziyadah" | "murojaah";

export interface QuranSurah {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: string;
  arti: string;
}

export interface MemorizationSessionProps {
  surah: {
    name: string;
    number: number;
  };
  startAyah: string;
  endAyah: string;
  type: MemorizationType;
}

export interface MemorizationError {
  ayah: number;
  type: string;
  detail: string;
}

export interface TajweedError {
  ayah: number;
  type: string;
  letter: string;
  suggestion: string;
}

export interface WaqafError {
  ayah: number;
  type: string;
  detail: string;
}

export interface QuranMetadata {
  surah: string;
  startAyah: number;
  endAyah: number;
  totalAyah: number;
}

export interface ValidationResult {
  transcription: string;
  kesalahan_hafalan: MemorizationError[];
  kesalahan_tajwid: TajweedError[];
  kesalahan_waqaf: WaqafError[];
  saran_umum: string;
  accuracy_score: number;
  tajweed_score: number;
  fluency_score: number;
  metadata_quran: QuranMetadata;
}

export interface ApiResponse {
  message: string;
  recitationId?: string;
  data?: {
    transcription: string;
    originalQuranText: string;
    validation: ValidationResult;
  };
  error?: string;
  details?: string;
}

export interface MemorizationResultData {
  id: string;
  surah: {
    name: string;
    number: number;
  };
  ayahRange: {
    start: number;
    end: number;
  };
  type: MemorizationType;
  date: string;
  duration?: number;
  score?: number;
  transcription?: string;
  originalText?: string;
  errors?: {
    memorization: number;
    tajweed: number;
    waqaf: number;
  };
  memorizationErrors?: MemorizationError[];
  tajweedErrors?: TajweedError[];
  waqafErrors?: WaqafError[];
  generalSuggestion?: string;
  scores?: {
    accuracy: number;
    tajweed: number;
    fluency: number;
  };
}
