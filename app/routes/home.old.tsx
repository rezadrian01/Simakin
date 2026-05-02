import type { Route } from "./+types/home";
import { Link } from "react-router";
import { 
  BookOpenText, 
  Brain, 
  Trophy, 
  Flame, 
  Target, 
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Mic,
  LineChart
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Simakin - Penyimak Cerdas Al-Qur'an Berbasis AI" },
    { name: "description", content: "Platform gamifikasi hafalan Al-Qur'an dengan analisis bacaan berbasis AI. Tingkatkan kualitas hafalan dengan feedback tajwid real-time, sistem EXP, dan tracking streak." },
  ];
}

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-b from-background via-background to-sidebar/5">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border/40 backdrop-blur-xl bg-background/80">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="bg-primary p-2 rounded-lg">
                <BookOpenText className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold">Simakin</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/auth/signin">
                <Button variant="ghost" className="cursor-pointer">
                  Masuk
                </Button>
              </Link>
              <Link to="/auth/signup">
                <Button className="cursor-pointer">
                  Daftar Gratis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Asymmetric Layout */}
      <section className="container mx-auto px-4 lg:px-8 pt-20 pb-32 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        
        <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
          {/* Left: Content */}
          <div className="space-y-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Powered by AI</span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
              Hafalan Al-Qur'an<br />
              <span className="text-primary">Lebih Cerdas</span> dengan AI
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
              Platform gamifikasi hafalan Al-Qur'an dengan analisis bacaan berbasis AI. 
              Dapatkan feedback tajwid real-time, tracking progress, dan sistem reward yang memotivasi.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/auth/signup">
                <Button size="lg" className="cursor-pointer text-lg px-8 h-14 shadow-lg hover:shadow-xl transition-all">
                  Mulai Sekarang
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/auth/signin">
                <Button size="lg" variant="outline" className="cursor-pointer text-lg px-8 h-14">
                  Lihat Demo
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-8 border-t border-border/40">
              <div>
                <div className="text-3xl font-bold text-primary">98%</div>
                <div className="text-sm text-muted-foreground">Akurasi AI</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">10K+</div>
                <div className="text-sm text-muted-foreground">Sesi Simak</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">Pengguna Aktif</div>
              </div>
            </div>
          </div>

          {/* Right: Visual Element - Overlapping Cards */}
          <div className="relative h-150 animate-fade-in-left">
            {/* Card 1 - Accuracy Score */}
            <Card className="absolute top-0 right-0 w-64 shadow-2xl border-primary/20 transform hover:-translate-y-2 transition-all duration-300 cursor-pointer">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Target className="h-8 w-8 text-chart-1" />
                  <span className="text-sm font-medium text-muted-foreground">Akurasi</span>
                </div>
                <div className="text-4xl font-bold text-chart-1">94.5%</div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full w-[94.5%] bg-chart-1 rounded-full" />
                </div>
              </CardContent>
            </Card>

            {/* Card 2 - Streak */}
            <Card className="absolute top-32 left-0 w-72 shadow-2xl border-chart-4/20 transform hover:-translate-y-2 transition-all duration-300 cursor-pointer">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Flame className="h-8 w-8 text-chart-4" />
                  <span className="text-sm font-medium text-muted-foreground">Streak</span>
                </div>
                <div className="flex items-end gap-2">
                  <div className="text-5xl font-bold text-chart-4">14</div>
                  <div className="text-lg text-muted-foreground mb-2">hari</div>
                </div>
                <p className="text-sm text-muted-foreground">Konsistensi membawa berkah! 🔥</p>
              </CardContent>
            </Card>

            {/* Card 3 - Achievement */}
            <Card className="absolute bottom-32 right-8 w-80 shadow-2xl border-accent/20 transform hover:-translate-y-2 transition-all duration-300 cursor-pointer">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Trophy className="h-8 w-8 text-accent" />
                  <span className="text-sm font-medium text-muted-foreground">Achievement</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-accent" />
                    <span className="text-sm">Juz 30 Completed</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-accent" />
                    <span className="text-sm">100 Sessions Milestone</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-accent" />
                    <span className="text-sm">Tajweed Master</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card 4 - EXP Progress */}
            <Card className="absolute bottom-0 left-8 w-64 shadow-2xl border-primary/20 transform hover:-translate-y-2 transition-all duration-300 cursor-pointer">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <LineChart className="h-8 w-8 text-primary" />
                  <span className="text-sm font-medium text-muted-foreground">EXP</span>
                </div>
                <div className="text-3xl font-bold text-primary">12,450</div>
                <p className="text-xs text-muted-foreground">Level 24 • 550 EXP to next level</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section - Diagonal Grid */}
      <section className="bg-sidebar/5 py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="text-center mb-16 space-y-4 animate-fade-in-up">
            <h2 className="text-4xl lg:text-5xl font-bold">
              Kenapa Memilih <span className="text-primary">Simakin</span>?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Teknologi AI terkini untuk membantu Anda menghafal Al-Qur'an dengan lebih efektif
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-primary/10 cursor-pointer animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-8 space-y-4">
                  <div className="p-3 bg-primary/10 rounded-xl w-fit group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold">
              Cara <span className="text-primary">Kerja</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Proses sederhana, hasil maksimal
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connection Lines - Hidden on mobile */}
            <div className="hidden lg:block absolute top-20 left-0 right-0 h-0.5 bg-linear-to-r from-primary via-accent to-primary opacity-20" />
            
            {steps.map((step, index) => (
              <div 
                key={index}
                className="relative animate-fade-in-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="text-center space-y-4">
                  {/* Step Number */}
                  <div className="relative mx-auto w-16 h-16 rounded-full bg-primary flex items-center justify-center text-2xl font-bold text-primary-foreground shadow-lg">
                    {index + 1}
                    {index < steps.length - 1 && (
                      <ArrowRight className="hidden lg:block absolute -right-12 top-1/2 -translate-y-1/2 h-6 w-6 text-primary/40" />
                    )}
                  </div>
                  
                  {/* Icon */}
                  <div className="flex justify-center">
                    <div className="p-4 bg-primary/10 rounded-2xl">
                      {step.icon}
                    </div>
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-bold">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Bold & Centered */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-primary via-accent to-primary opacity-90" />
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8 text-primary-foreground">
            <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
              Mulai Perjalanan Hafalan<br />Al-Qur'an Anda Hari Ini
            </h2>
            
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Bergabunglah dengan ribuan penghafal Al-Qur'an yang telah merasakan manfaat teknologi AI dalam meningkatkan kualitas hafalan mereka.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/auth/signup">
                <Button 
                  size="lg" 
                  variant="secondary"
                  className="cursor-pointer text-lg px-8 h-14 shadow-2xl hover:shadow-xl transition-all"
                >
                  Daftar Gratis Sekarang
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>

            <p className="text-sm opacity-75 pt-4">
              ✓ Gratis untuk selamanya • ✓ Tanpa kartu kredit • ✓ Mulai dalam 2 menit
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 bg-sidebar/5">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-primary p-2 rounded-lg">
                <BookOpenText className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">Simakin</span>
            </div>
            
            <p className="text-sm text-muted-foreground">
              © 2026 Simakin. Membantu Anda menghafal Al-Qur'an dengan teknologi AI.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: <Brain className="h-8 w-8 text-primary" />,
    title: "Analisis AI Real-time",
    description: "Teknologi Google Gemini 2.0 menganalisis bacaan Anda secara detail, memberikan feedback akurat tentang tajwid, makhroj, dan kelancaran.",
  },
  {
    icon: <Target className="h-8 w-8 text-primary" />,
    title: "3 Skor Komprehensif",
    description: "Dapatkan skor terpisah untuk akurasi hafalan, kualitas tajwid, dan kelancaran bacaan. Ketahui area yang perlu diperbaiki.",
  },
  {
    icon: <Flame className="h-8 w-8 text-primary" />,
    title: "Sistem Streak & EXP",
    description: "Bangun konsistensi dengan tracking streak harian. Kumpulkan EXP untuk unlock achievement dan naik level.",
  },
  {
    icon: <Trophy className="h-8 w-8 text-primary" />,
    title: "Gamifikasi Motivatif",
    description: "Raih achievement, bersaing di leaderboard, dan lacak progress dengan visualisasi yang memotivasi.",
  },
  {
    icon: <CheckCircle2 className="h-8 w-8 text-primary" />,
    title: "Feedback Tajwid Detail",
    description: "Identifikasi kesalahan tajwid spesifik dengan penjelasan dan saran perbaikan dalam Bahasa Indonesia.",
  },
  {
    icon: <LineChart className="h-8 w-8 text-primary" />,
    title: "Progress Tracking",
    description: "Visualisasi progress hafalan Anda dengan grafik dan statistik lengkap. Ketahui perkembangan dari waktu ke waktu.",
  },
];

const steps = [
  {
    icon: <BookOpenText className="h-8 w-8 text-primary" />,
    title: "Pilih Ayat",
    description: "Pilih surah dan rentang ayat yang ingin Anda simak atau hafalkan.",
  },
  {
    icon: <Mic className="h-8 w-8 text-primary" />,
    title: "Rekam Bacaan",
    description: "Rekam bacaan Al-Qur'an Anda melalui microphone dengan kualitas audio terbaik.",
  },
  {
    icon: <Brain className="h-8 w-8 text-primary" />,
    title: "Analisis AI",
    description: "AI menganalisis bacaan Anda dan memberikan feedback detail tentang tajwid dan akurasi.",
  },
  {
    icon: <Trophy className="h-8 w-8 text-primary" />,
    title: "Dapatkan Reward",
    description: "Raih EXP, tingkatkan streak, dan unlock achievement berdasarkan performa Anda.",
  },
];
