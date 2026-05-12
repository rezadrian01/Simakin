import { PrismaClient, XPSource, GameType, ChallengeType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("[SEED] Starting gamification seed...");

  // ============================================
  // DAILY CHALLENGES (3 records)
  // ============================================

  const dailyChallenges = [
    {
      type: ChallengeType.COMPLETE_SESSIONS,
      targetValue: 3,
      expReward: 100,
      description: "Selesaikan 3 Sesi Hafalan",
    },
    {
      type: ChallengeType.REACH_ACCURACY,
      targetValue: 1,
      expReward: 150,
      description: "Raih Skor Akurasi ≥ 90% dalam satu sesi",
    },
    {
      type: ChallengeType.WIN_GAMES,
      targetValue: 2,
      expReward: 200,
      description: "Menangkan 2 Ronde Minigame (skor ≥ 70%)",
    },
  ];

  for (const challenge of dailyChallenges) {
    await prisma.dailyChallenge.upsert({
      where: { type: challenge.type },
      update: challenge,
      create: challenge,
    });
    console.log(`[SEED] Upserted DailyChallenge: ${challenge.type}`);
  }

  // ============================================
  // ACHIEVEMENTS (14 records)
  // ============================================

  const achievements = [
    {
      key: "first_recitation",
      title: "Langkah Pertama",
      description: "Selesaikan sesi hafalan pertamamu",
    },
    {
      key: "recitation_10",
      title: "Rajin Berlatih",
      description: "Selesaikan 10 sesi hafalan",
    },
    {
      key: "recitation_50",
      title: "Hafizh Sejati",
      description: "Selesaikan 50 sesi hafalan",
    },
    {
      key: "perfect_accuracy",
      title: "Sempurna!",
      description: "Raih skor akurasi 100 dalam satu sesi",
    },
    {
      key: "accuracy_90_five",
      title: "Konsisten",
      description: "Raih akurasi ≥ 90% sebanyak 5 kali",
    },
    {
      key: "streak_3",
      title: "3 Hari Berturut-turut",
      description: "Pertahankan streak 3 hari",
    },
    {
      key: "streak_7",
      title: "Hafizh Mingguan",
      description: "Pertahankan streak 7 hari",
    },
    {
      key: "streak_30",
      title: "Hafizh Sebulan",
      description: "Pertahankan streak 30 hari",
    },
    {
      key: "first_game",
      title: "Gamer Quran",
      description: "Mainkan minigame pertamamu",
    },
    {
      key: "game_win_10",
      title: "Suka Bermain",
      description: "Menangkan 10 ronde minigame",
    },
    {
      key: "perfect_game",
      title: "Jawaban Sempurna",
      description: "Jawab 10/10 benar dalam satu ronde",
    },
    {
      key: "exp_1000",
      title: "Naik Level",
      description: "Kumpulkan total 1.000 EXP",
    },
    {
      key: "exp_10000",
      title: "Master Hafizh",
      description: "Kumpulkan total 10.000 EXP",
    },
    {
      key: "daily_3",
      title: "Konsisten Harian",
      description: "Selesaikan semua tantangan harian 3 hari berturut-turut",
    },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { key: achievement.key },
      update: achievement,
      create: achievement,
    });
    console.log(`[SEED] Upserted Achievement: ${achievement.key}`);
  }

  // ============================================
  // VERIFICATION
  // ============================================

  const challengeCount = await prisma.dailyChallenge.count();
  const achievementCount = await prisma.achievement.count();

  console.log(`[SEED] ✅ DailyChallenges: ${challengeCount} (expected 3)`);
  console.log(`[SEED] ✅ Achievements: ${achievementCount} (expected 14)`);
  console.log("[SEED] Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("[SEED] ❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });