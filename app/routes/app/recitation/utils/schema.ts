import { z } from "zod";

export const RecitationSchema = z
  .object({
    surah: z.string().min(1, "Surah harus dipilih"),
    start: z.string().min(1, "Ayat mulai harus diisi"),
    end: z.string().min(1, "Ayat akhir harus diisi"),
  })
  .refine(
    (data) => {
      const start = parseInt(data.start);
      const end = parseInt(data.end);
      return start <= end;
    },
    {
      message: "Ayat mulai harus lebih kecil atau sama dengan ayat akhir",
      path: ["end"],
    }
  );

export type RecitationFormValues = z.infer<typeof RecitationSchema>;
