import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Trophy, RotateCcw, Home, Zap } from "lucide-react";
import { Link } from "react-router";

interface RoundResultProps {
  correctAnswers: number;
  totalQuestions: number;
  expEarned: number;
  isWin: boolean;
  gameType: string;
}

export function RoundResult({
  correctAnswers,
  totalQuestions,
  expEarned,
  isWin,
  gameType,
}: RoundResultProps) {
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto py-8">
      {/* Result icon */}
      <div
        className={`w-20 h-20 rounded-full flex items-center justify-center ${
          isWin ? "bg-yellow-100" : "bg-muted"
        }`}
      >
        <Trophy className={`w-10 h-10 ${isWin ? "text-yellow-500" : "text-muted-foreground"}`} />
      </div>

      {/* Result text */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold">
          {isWin ? "Selamat!" : "Coba Lagi!"}
        </h2>
        <p className="text-muted-foreground">
          {isWin
            ? `Skor sempurna: ${correctAnswers}/${totalQuestions}`
            : `Kamu mendapat ${correctAnswers} dari ${totalQuestions}`}
        </p>
      </div>

      {/* Score card */}
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-simakin-primary">
                {percentage}%
              </p>
              <p className="text-sm text-muted-foreground">Akurasi</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-yellow-500 flex items-center justify-center gap-1">
                <Zap className="w-5 h-5" />
                {expEarned}
              </p>
              <p className="text-sm text-muted-foreground">EXP Earned</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col gap-3 w-full">
        <Link to={`/app/game/${gameType}`} className="w-full">
          <Button className="w-full gap-2">
            <RotateCcw className="w-4 h-4" />
            Main Lagi
          </Button>
        </Link>
        <Link to="/app/game" className="w-full">
          <Button variant="outline" className="w-full gap-2">
            <Home className="w-4 h-4" />
            Kembali ke Game
          </Button>
        </Link>
      </div>
    </div>
  );
}