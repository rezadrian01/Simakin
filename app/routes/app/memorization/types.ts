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
  memorizationErrors: MemorizationError[];
  tajweedErrors: TajweedError[];
  waqafErrors: WaqafError[];
  generalSuggestion: string;
  quranMetadata: QuranMetadata;
}

export interface ApiResponse {
  message: string;
  data: {
    cleanedTranscribedAudio: string;
    originalQuranText: string;
    cleanedMemorizeValidationResult: ValidationResult;
  };
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
}
