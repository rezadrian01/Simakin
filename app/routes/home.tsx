import type { Route } from "./+types/home";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { BookOpen, Mic, Target, TrendingUp, Zap, Users, ChevronRight, Flame, ArrowRight } from "lucide-react";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Simakin - Your AI Quran Companion" },
    { name: "description", content: "Master Quran recitation with AI-powered feedback. Get instant tajweed analysis, track your progress, and build consistent habits." },
  ];
}

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Simple Nav */}
      <nav className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-14">
            <Link to="/" className="flex items-center gap-2.5 group cursor-pointer">
              <div className="w-7 h-7 bg-primary rounded flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-lg">Simakin</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link to="/auth/signin">
                <Button variant="ghost" size="sm" className="cursor-pointer text-sm">
                  Sign in
                </Button>
              </Link>
              <Link to="/auth/signup">
                <Button size="sm" className="cursor-pointer text-sm">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero - Asymmetric Editorial Layout */}
      <section className="pt-16 pb-24 sm:pt-24 sm:pb-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
            {/* Left: 3 columns */}
            <div className="lg:col-span-3 space-y-7">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-primary/5 border border-primary/20">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-medium text-primary">AI-Powered Analysis</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
                Quran memorization{" "}
                <span className="text-primary">with personal AI coach</span>
              </h1>

              <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                Get instant feedback on tajweed, makhroj, and fluency.
                Track your progress with streaks and XP. Like having an ustadz in your pocket.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link to="/auth/signup">
                  <Button size="lg" className="w-full sm:w-auto cursor-pointer group">
                    Start learning free
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </Link>
                <Link to="/auth/signin">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto cursor-pointer">
                    I have an account
                  </Button>
                </Link>
              </div>

              {/* Social proof - Not a grid */}
              <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-6 text-sm">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">99%</span>
                  <span className="text-muted-foreground">accurate</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">2.5k+</span>
                  <span className="text-muted-foreground">active users</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">24/7</span>
                  <span className="text-muted-foreground">available</span>
                </div>
              </div>
            </div>

            {/* Right: 2 columns - Stacked cards with natural offset */}
            <div className="lg:col-span-2 relative space-y-4 lg:mt-12">
              {/* Score Card */}
              <div className="bg-card border border-border rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow cursor-default">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-chart-1/10 flex items-center justify-center">
                    <Target className="w-5 h-5 text-chart-1" />
                  </div>
                  <div className="text-sm text-muted-foreground">Recent session</div>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span>Accuracy</span>
                      <span className="font-semibold">94%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-chart-1" style={{ width: '94%' }} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span>Tajweed</span>
                      <span className="font-semibold">88%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-chart-2" style={{ width: '88%' }} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span>Fluency</span>
                      <span className="font-semibold">91%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-chart-3" style={{ width: '91%' }} />
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Al-Fatihah 1-7</span>
                  <span className="text-lg font-bold text-primary">+1,245 XP</span>
                </div>
              </div>

              {/* Streak Card */}
              <div className="bg-card border border-border rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow cursor-default lg:-mt-2 lg:ml-8">
                <div className="flex items-center gap-3 mb-3">
                  <Flame className="w-7 h-7 text-chart-4" />
                  <div>
                    <div className="text-2xl font-bold">14 days</div>
                    <div className="text-xs text-muted-foreground">Current streak</div>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-1.5">
                  {Array.from({ length: 14 }).map((_, i) => (
                    <div key={i} className="aspect-square rounded bg-primary/20 border border-primary" />
                  ))}
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square rounded bg-muted border border-border" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features - Magazine 2-column layout */}
      <section className="py-20 sm:py-28 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-start">
            {/* Feature 1 */}
            <div className="space-y-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Mic className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold">
                Real-time AI analysis
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Record your recitation and get instant feedback powered by Google Gemini.
                Our AI identifies mistakes in tajweed, makhroj, and pronunciation with 99% accuracy.
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  </div>
                  <span>Identifies specific errors per ayah</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  </div>
                  <span>Evaluates 7+ tajweed categories</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  </div>
                  <span>Provides actionable improvement tips</span>
                </li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="space-y-6 lg:mt-16">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold">
                Build habits with gamification
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Stay motivated with streaks, XP points, and leaderboards.
                Our system adapts to your progress and rewards consistent practice.
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  </div>
                  <span>Streak multipliers up to 2x XP</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  </div>
                  <span>Bonus XP for new memorization</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  </div>
                  <span>Visual progress tracking</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How it works - Linear flow */}
      <section className="py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="mb-16 max-w-2xl">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Three simple steps
            </h2>
            <p className="text-lg text-muted-foreground">
              Start improving your Quran recitation in minutes.
            </p>
          </div>

          <div className="space-y-12 sm:space-y-16">
            {/* Step 1 */}
            <div className="grid sm:grid-cols-12 gap-6 items-start">
              <div className="sm:col-span-3">
                <div className="inline-block text-6xl font-bold text-primary/20">01</div>
              </div>
              <div className="sm:col-span-9 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Choose your surah</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Select any surah from Al-Fatihah to An-Nas. Pick the ayah range you want to practice.
                  Choose between memorization (ziyadah) or review (murojaah).
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="grid sm:grid-cols-12 gap-6 items-start">
              <div className="sm:col-span-3">
                <div className="inline-block text-6xl font-bold text-accent/20">02</div>
              </div>
              <div className="sm:col-span-9 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Mic className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold">Record your recitation</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Recite with tartil. Our system captures your audio automatically.
                  You can re-record if needed before submission.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="grid sm:grid-cols-12 gap-6 items-start">
              <div className="sm:col-span-3">
                <div className="inline-block text-6xl font-bold text-chart-1/20">03</div>
              </div>
              <div className="sm:col-span-9 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-chart-1/10 flex items-center justify-center">
                    <Target className="w-5 h-5 text-chart-1" />
                  </div>
                  <h3 className="text-xl font-semibold">Get detailed feedback</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  AI analyzes your tajweed, makhroj, and fluency in seconds.
                  Get a breakdown of errors with specific suggestions for improvement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-3 gap-8 sm:gap-12">
            <div className="text-center sm:text-left">
              <div className="text-4xl font-bold mb-2">2,500+</div>
              <div className="text-muted-foreground">Active learners</div>
            </div>
            <div className="text-center sm:text-left">
              <div className="text-4xl font-bold mb-2">45,000+</div>
              <div className="text-muted-foreground">Sessions recorded</div>
            </div>
            <div className="text-center sm:text-left">
              <div className="text-4xl font-bold mb-2">4.8/5</div>
              <div className="text-muted-foreground">User rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA - Bold but simple */}
      <section className="py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="space-y-6">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              Start your memorization journey today
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Free to start. No credit card required. Full AI features included.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link to="/auth/signup">
                <Button size="lg" className="w-full sm:w-auto cursor-pointer">
                  Create free account
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/auth/signin">
                <Button size="lg" variant="outline" className="w-full sm:w-auto cursor-pointer">
                  Sign in instead
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Minimal */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <BookOpen className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <span className="font-semibold">Simakin</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2026 Simakin. AI-powered Quran memorization.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
