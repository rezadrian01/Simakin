import { useState, useEffect } from "react";
import { useLoaderData, useNavigate } from "react-router";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { QuestionCard } from "~/components/game/question-card";
import { OptionButton } from "~/components/game/option-button";
import { RoundResult } from "~/components/game/round-result";
import type { Route } from "./+types/index";
import { requireUserId } from "~/services/auth/auth.server";
import { generateQuestions } from "~/services/game/game.server";
import { logXPGain } from "~/services/xp-history/xp-history.server";
import { incrementChallengeProgress } from "~/services/daily-challenge/daily-challenge.server";
import { checkAndAwardAchievements } from "~/services/achievement/achievement.server";
import { db } from "~/lib/db.server";
import { GameType } from "@prisma/client";

const QUESTIONS_PER_ROUND = 10;
const TIME_PER_QUESTION = 15;
const PER_CORRECT_EXP = 5;
const COMPLETION_BONUS = 20;
const PERFECT_BONUS = 50;
const WIN_THRESHOLD = 7;

interface Question {
  ayahs: string[];
  surahName: string;
  options: string[];
  correctIndex: number;
}

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUserId(request);

  const questions = await generateQuestions("TEBAK_SURAH", QUESTIONS_PER_ROUND);

  return { questions, userId };
}

export async function action({ request }: Route.ActionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const answersJson = formData.get("answers") as string;

  const answers: number[] = JSON.parse(answersJson);
  const questionsJson = formData.get("questions") as string;
  const questions: Question[] = JSON.parse(questionsJson);

  const correctAnswers = answers.reduce(
    (count, answer, idx) => count + (answer === questions[idx].correctIndex ? 1 : 0),
    0
  );

  const expEarned =
    correctAnswers * PER_CORRECT_EXP +
    COMPLETION_BONUS +
    (correctAnswers === QUESTIONS_PER_ROUND ? PERFECT_BONUS : 0);

  const isWin = correctAnswers >= WIN_THRESHOLD;

  // Save game session
  const gameSession = await db.gameSession.create({
    data: {
      userId,
      gameType: GameType.TEBAK_SURAH,
      totalQuestions: QUESTIONS_PER_ROUND,
      correctAnswers,
      expEarned,
    },
  });

  // Log XP
  await logXPGain(userId, expEarned, "MINIGAME", gameSession.id);

  // Increment WIN_GAMES daily challenge if won
  if (isWin) {
    const profile = await db.userProfile.findUnique({
      where: { userId },
      select: { timezone: true },
    });
    const timezone = profile?.timezone ?? "Asia/Jakarta";
    await incrementChallengeProgress(userId, timezone, "WIN_GAMES");
  }

  // Check achievement triggers
  const totalGameSessions = await db.gameSession.count({ where: { userId } });
  const totalGameWins = await db.gameSession.count({
    where: { userId, correctAnswers: { gte: WIN_THRESHOLD } },
  });
  const updatedUser = await db.user.findUnique({
    where: { id: userId },
    select: { totalScore: true },
  });

  const newAchievements = await checkAndAwardAchievements(userId, {
    totalGameSessions,
    totalGameWins,
    totalScore: updatedUser?.totalScore ?? 0,
    lastGameCorrect: correctAnswers,
  });

  return { correctAnswers, expEarned, isWin, gameSessionId: gameSession.id, newAchievements };
}

export default function TebakSurahPage() {
  const { questions } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timer, setTimer] = useState(TIME_PER_QUESTION);
  const [answers, setAnswers] = useState<(number | null)[]>(
    new Array(questions.length).fill(null)
  );
  const [showResult, setShowResult] = useState(false);
  const [resultData, setResultData] = useState<{
    correctAnswers: number;
    expEarned: number;
    isWin: boolean;
  } | null>(null);

  const currentQuestion = questions[currentIndex];
  const isFinished = showResult || currentIndex >= questions.length;

  // Timer
  useEffect(() => {
    if (isAnswered || showResult || currentIndex >= questions.length) return;
    if (timer <= 0) {
      handleTimeUp();
      return;
    }
    const interval = setInterval(() => {
      setTimer((t) => t - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer, isAnswered, showResult, currentIndex]);

  const handleTimeUp = useCallback(() => {
    if (!isAnswered) {
      const newAnswers = [...answers];
      newAnswers[currentIndex] = -1; // -1 means timeout
      setAnswers(newAnswers);
      setIsAnswered(true);
      setTimer(TIME_PER_QUESTION);
    }
  }, [isAnswered, currentIndex, answers]);

  const handleSelect = async (optionIndex: number) => {
    if (isAnswered) return;

    const newAnswers = [...answers];
    newAnswers[currentIndex] = optionIndex;
    setAnswers(newAnswers);
    setSelectedAnswer(optionIndex);
    setIsAnswered(true);

    // Move to next after brief delay
    await new Promise((r) => setTimeout(r, 800));

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setTimer(TIME_PER_QUESTION);
    } else {
      // Submit
      submitAnswers(newAnswers);
    }
  };

  const submitAnswers = async (finalAnswers: (number | null)[]) => {
    const timeTaken = (QUESTIONS_PER_ROUND - currentIndex) * TIME_PER_QUESTION;
    const formData = new FormData();
    formData.set("answers", JSON.stringify(finalAnswers));
    formData.set("questions", JSON.stringify(questions));
    formData.set("timeTaken", timeTaken.toString());

    try {
      const res = await fetch(`/app/game/tebak-surah`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setResultData(data);
      setShowResult(true);
    } catch (e) {
      console.error(e);
    }
  };

  if (showResult && resultData) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-lg">
        <RoundResult
          correctAnswers={resultData.correctAnswers}
          totalQuestions={QUESTIONS_PER_ROUND}
          expEarned={resultData.expEarned}
          isWin={resultData.isWin}
          gameType="tebak-surah"
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/app/game")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Tebak Surah</h1>
          <p className="text-sm text-muted-foreground">Tebak surah dari ayat yang shown</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <QuestionCard
            questionNumber={currentIndex + 1}
            totalQuestions={questions.length}
            timer={timer}
          >
            {/* The 2 ayahs */}
            <div className="space-y-3 mb-6">
              {currentQuestion.ayahs.map((ayah, i) => (
                <p
                  key={i}
                  className="text-2xl font-serif text-right leading-relaxed text-foreground"
                  dir="rtl"
                >
                  {ayah}
                </p>
              ))}
            </div>

            {/* Surah name hint */}
            <p className="text-sm text-muted-foreground text-center mb-4">
              Ayat di atas berasal dari surah mana?
            </p>

            {/* Options */}
            <div className="grid grid-cols-1 gap-3">
              {currentQuestion.options.map((option, idx) => {
                let state: "idle" | "correct" | "wrong" | "selected" = "idle";
                if (isAnswered) {
                  if (idx === currentQuestion.correctIndex) state = "correct";
                  else if (idx === selectedAnswer) state = "wrong";
                } else if (idx === selectedAnswer) {
                  state = "selected";
                }

                return (
                  <OptionButton
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    state={state}
                    disabled={isAnswered}
                  >
                    {option}
                  </OptionButton>
                );
              })}
            </div>
          </QuestionCard>
        </CardContent>
      </Card>
    </div>
  );
}