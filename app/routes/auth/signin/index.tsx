import { useState } from "react";
import { Form, Link, redirect, useNavigation } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { AlertCircle, Book, Loader2, Eye, EyeOff } from "lucide-react";
import type { Route } from "./+types";
import { createUserSession, getUserId, signin, getGoogleAuthUrl, getSafeRedirectUrl } from "~/services/auth/auth.server";

export async function loader({ request }: Route.LoaderArgs) {
    const userId = await getUserId(request);
    if (userId) return redirect("/app/dashboard");

    const url = new URL(request.url);
    const error = url.searchParams.get("error");

    let errorMessage = "";
    if (error === "google_auth_failed") {
        errorMessage = "Autentikasi Google dibatalkan atau gagal";
    } else if (error === "google_auth_error") {
        errorMessage = "Terjadi kesalahan saat masuk dengan Google";
    }

    return { error: errorMessage };
}

export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();
    const intent = formData.get("intent");

    // Get safe redirect URL from query params
    const safeRedirectUrl = getSafeRedirectUrl(request);

    // Handle Google OAuth
    if (intent === "google") {
        const url = new URL(request.url);
        const redirectUri = process.env.GOOGLE_CALLBACK_URL || `${url.origin}/auth/google/callback`;

        // Get redirectTo from query params
        const redirectTo = url.searchParams.get("redirectTo");

        // Pass redirectTo via Google OAuth state parameter
        const googleAuthUrl = await getGoogleAuthUrl(redirectUri, redirectTo || undefined);

        return redirect(googleAuthUrl);
    }    // Handle regular signin
    const emailOrUsername = formData.get("emailOrUsername");
    const password = formData.get("password");

    if (
        typeof emailOrUsername !== "string" ||
        typeof password !== "string"
    ) {
        return { error: "Form submitted incorrectly" };
    }

    if (!emailOrUsername || !password) {
        return { error: "Email and password are required" };
    }

    const user = await signin({ emailOrUsername, password });

    if (!user) {
        return { error: "Invalid email or password" };
    }

    return createUserSession(user.id, safeRedirectUrl);
}

export default function SigninPage({ loaderData, actionData }: Route.ComponentProps) {
    const [emailOrUsername, setEmailOrUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigation = useNavigation();

    const error = actionData?.error || loaderData?.error || "";
    const isLoading = navigation.state === "submitting" && navigation.formData?.get("intent") !== "google";
    const isGoogleLoading = navigation.state === "submitting" && navigation.formData?.get("intent") === "google";

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo & Brand */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-4">
                        <div className="bg-primary p-3 rounded-full shadow-lg">
                            <Book className="h-8 w-8 text-primary-foreground" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold mb-2">Simakin</h1>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        Penyimak Cerdas Al-Qur&apos;an Berbasis AI
                    </p>
                </div>

                <Card className="border-0 shadow-2xl backdrop-blur-sm">
                    <CardHeader className="space-y-1 pb-6">
                        <CardTitle className="text-2xl font-semibold text-center">
                            Masuk ke Akun Anda
                        </CardTitle>
                        <CardDescription className="text-center">
                            Lanjutkan perjalanan menghafal Al-Qur&apos;an Anda
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Form method="post" className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="emailOrUsername" className="font-medium">Email atau Username</Label>
                                <Input
                                    id="emailOrUsername"
                                    type="text"
                                    placeholder="nama@email.com atau username"
                                    name="emailOrUsername"
                                    value={emailOrUsername}
                                    onChange={(e) => setEmailOrUsername(e.target.value)}
                                    required
                                    className="h-11"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="font-medium">Kata Sandi</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Masukkan kata sandi Anda"
                                        name="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="h-11 pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                                    <AlertCircle className="h-4 w-4" />
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full h-11 font-medium shadow-lg transition-all duration-200"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Memverifikasi...
                                    </>
                                ) : (
                                    "Masuk"
                                )}
                            </Button>
                        </Form>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">Atau</span>
                            </div>
                        </div>

                        <Form method="post">
                            <input type="hidden" name="intent" value="google" />
                            <Button
                                type="submit"
                                variant="outline"
                                className="w-full h-11 transition-colors"
                                disabled={isGoogleLoading}
                            >
                                {isGoogleLoading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                                        <path
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            fill="#4285F4"
                                        />
                                        <path
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            fill="#34A853"
                                        />
                                        <path
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                            fill="#FBBC05"
                                        />
                                        <path
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            fill="#EA4335"
                                        />
                                    </svg>
                                )}
                                Masuk dengan Google
                            </Button>
                        </Form>

                        <div className="text-center text-sm text-muted-foreground">
                            Belum punya akun?{" "}
                            <Link
                                to="/auth/signup"
                                className="text-primary hover:text-primary/80 font-medium transition-colors"
                            >
                                Daftar sekarang
                            </Link>
                        </div>

                        <div className="text-center">
                            <Link
                                to="/auth/forgot-password"
                                className="text-sm text-primary hover:text-primary/80 transition-colors"
                            >
                                Lupa kata sandi?
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Tagline */}
                <div className="text-center mt-8">
                    <p className="text-sm font-medium italic">
                        &ldquo;Smart Murojaah, Quality Memorization&rdquo;
                    </p>
                    <p className="text-muted-foreground text-xs mt-1">
                        Dengan AI, sempurnakan bacaan Al-Qur&apos;an Anda
                    </p>
                </div>
            </div>
        </div>
    );
}