import { useState, useEffect } from "react";
import { useLoaderData, useNavigate, useFetcher } from "react-router";
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
import { updateUserStreak } from "~/services/streak/streak.server";
import { incrementChallengeProgress } from "~/services/daily-challenge/daily-challenge.server";
import { checkAndAwardAchievements } from "~/services/achievement/achievement.server";
import { db } from "~/lib/db.server";
import { GameType } from "@prisma/client";

const QUESTIONS_PER_ROUND = 10;
const TIME_PER_QUESTION = 15;
const PER_CORRECT_EXP = 10;
const COMPLETION_BONUS = 20;
const PERFECT_BONUS = 50;
const WIN_THRESHOLD = 7;

interface Question {
  questionAyah: string;
  surahName: string;
  options: string[];
  correctIndex: number;
}

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUserId(request);
  const questions = await generateQuestions("SAMBUNG_AYAT", QUESTIONS_PER_ROUND);
  return { questions, userId };
}

export async function action({ request }: Route.ActionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const answersJson = formData.get("answers") as string;
  const questionsJson = formData.get("questions") as string;

  const answers: number[] = JSON.parse(answersJson);
  const questions: Question[] = JSON.parse(questionsJson);

  const correctAnswers = answers.reduce(
    (count, answer, idx) =>
      count + (answer === questions[idx].correctIndex ? 1 : 0),
    0
  );

  const expEarned =
    correctAnswers * PER_CORRECT_EXP +
    COMPLETION_BONUS +
    (correctAnswers === QUESTIONS_PER_ROUND ? PERFECT_BONUS : 0);

  const isWin = correctAnswers >= WIN_THRESHOLD;

  const gameSession = await db.gameSession.create({
    data: {
      userId,
      gameType: GameType.SAMBUNG_AYAT,
      totalQuestions: QUESTIONS_PER_ROUND,
      correctAnswers,
      expEarned,
    },
  });

  await logXPGain(userId, expEarned, "MINIGAME", gameSession.id);
  await updateUserStreak(userId);

  if (isWin) {
    const profile = await db.userProfile.findUnique({
      where: { userId },
      select: { timezone: true },
    });
    const timezone = profile?.timezone ?? "Asia/Jakarta";
    await incrementChallengeProgress(userId, timezone, "WIN_GAMES");
  }

  const totalGameSessions = await db.gameSession.count({ where: { userId } });
  const totalGameWins = await db.gameSession.count({
    where: { userId, correctAnswers: { gte: WIN_THRESHOLD } },
  });
  const updatedUser = await db.user.findUnique({
    where: { id: userId },
    select: { totalScore: true },
  });

  await checkAndAwardAchievements(userId, {
    totalGameSessions,
    totalGameWins,
    totalScore: updatedUser?.totalScore ?? 0,
    lastGameCorrect: correctAnswers,
  });

  return { correctAnswers, expEarned, isWin };
}

export default function SambungAyatPage() {
  const { questions } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const fetcher = useFetcher<typeof action>();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timer, setTimer] = useState(TIME_PER_QUESTION);
  const [answers, setAnswers] = useState<(number | null)[]>(
    new Array(questions.length).fill(null)
  );
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      setShowResult(true);
    }
  }, [fetcher.state, fetcher.data]);

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    if (isAnswered || showResult) return;
    if (timer <= 0) {
      const newAnswers = [...answers];
      newAnswers[currentIndex] = -1;
      setAnswers(newAnswers);
      setIsAnswered(true);
      setTimeout(() => {
        if (currentIndex < questions.length - 1) {
          setCurrentIndex((i) => i + 1);
          setSelectedAnswer(null);
          setIsAnswered(false);
          setTimer(TIME_PER_QUESTION);
        } else {
          submitAnswers(newAnswers);
        }
      }, 800);
      return;
    }
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer, isAnswered, showResult, currentIndex]);

  const handleSelect = async (optionIndex: number) => {
    if (isAnswered) return;
    const newAnswers = [...answers];
    newAnswers[currentIndex] = optionIndex;
    setAnswers(newAnswers);
    setSelectedAnswer(optionIndex);
    setIsAnswered(true);

    await new Promise((r) => setTimeout(r, 800));

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setTimer(TIME_PER_QUESTION);
    } else {
      submitAnswers(newAnswers);
    }
  };

  const submitAnswers = (finalAnswers: (number | null)[]) => {
    const formData = new FormData();
    formData.set("answers", JSON.stringify(finalAnswers));
    formData.set("questions", JSON.stringify(questions));
    fetcher.submit(formData, { method: "POST" });
  };

  if (showResult && fetcher.data) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-lg">
        <RoundResult
          correctAnswers={fetcher.data.correctAnswers}
          totalQuestions={QUESTIONS_PER_ROUND}
          expEarned={fetcher.data.expEarned}
          isWin={fetcher.data.isWin}
          gameType="sambung-ayat"
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/app/game")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Sambung Ayat</h1>
          <p className="text-sm text-muted-foreground">
            Lanjutkan ayat berikut dengan memilih ayat yang tepat
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <QuestionCard
            questionNumber={currentIndex + 1}
            totalQuestions={questions.length}
            timer={timer}
          >
            <div className="mb-6">
              <p className="text-xs text-muted-foreground mb-2">
                Setelah ayat berikut, ayat mana yang melanjutkan?
              </p>
              <p
                className="text-2xl font-serif text-right leading-relaxed text-foreground bg-muted/30 rounded-lg p-4"
                dir="rtl"
              >
                {currentQuestion.questionAyah}
              </p>
            </div>

            <p className="text-sm text-muted-foreground text-center mb-4">
              Pilih ayat yang melanjutkan:
            </p>

            <div className="grid grid-cols-1 gap-3">
              {currentQuestion.options.map((option: string, idx: number) => {
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
                    <span dir="rtl" className="text-right block">{option}</span>
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