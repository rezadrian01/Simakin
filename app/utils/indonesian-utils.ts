/**
 * Format date to Indonesian relative time
 */
export const formatDateToIndonesian = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Hari ini";
  } else if (diffDays === 1) {
    return "Kemarin";
  } else if (diffDays < 7) {
    return `${diffDays} hari lalu`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} minggu lalu`;
  } else {
    const months = Math.floor(diffDays / 30);
    return `${months} bulan lalu`;
  }
};

/**
 * Format number with Indonesian locale
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString("id-ID");
};

/**
 * Get greeting based on time of day in Indonesian
 */
export const getIndonesianGreeting = (): string => {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Selamat pagi";
  } else if (hour < 15) {
    return "Selamat siang";
  } else if (hour < 18) {
    return "Selamat sore";
  } else {
    return "Selamat malam";
  }
};
