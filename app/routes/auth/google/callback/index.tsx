import { type LoaderFunctionArgs } from "react-router";
import {
    createUserSession,
    exchangeGoogleCodeForToken,
    getGoogleUserInfo,
    handleGoogleAuth,
} from "~/services/auth/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const error = url.searchParams.get("error");

    if (error) {
        // User cancelled or error occurred
        return new Response(null, {
            status: 302,
            headers: {
                Location: "/auth/signin?error=google_auth_failed",
            },
        });
    }

    if (!code) {
        return new Response(null, {
            status: 302,
            headers: {
                Location: "/auth/signin?error=missing_code",
            },
        });
    }

    try {
        const redirectUri =
            process.env.GOOGLE_CALLBACK_URL ||
            `${url.origin}/auth/google/callback`;

        // Exchange code for token
        const tokenData = await exchangeGoogleCodeForToken(code, redirectUri);

        // Get user info from Google
        const googleUser = await getGoogleUserInfo(tokenData.access_token);

        // Handle authentication (signin or signup)
        const user = await handleGoogleAuth({
            email: googleUser.email,
            fullName: googleUser.name,
            avatarUrl: googleUser.picture,
        });

        // Create session and redirect
        return createUserSession(user.id, "/app/dashboard");
    } catch (error) {
        console.error("Google OAuth error:", error);
        return new Response(null, {
            status: 302,
            headers: {
                Location: "/auth/signin?error=google_auth_error",
            },
        });
    }
}
