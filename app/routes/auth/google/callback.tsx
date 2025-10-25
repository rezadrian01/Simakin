import { type LoaderFunctionArgs } from "react-router";
import {
    createUserSession,
    exchangeGoogleCodeForToken,
    getGoogleUserInfo,
    handleGoogleAuth,
    getSafeRedirectUrl,
} from "~/services/auth/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const error = url.searchParams.get("error");
    const state = url.searchParams.get("state"); // Get state parameter from Google

    console.log("Google OAuth Callback - Query Params:", {
        code: code ? "exists" : "missing",
        error,
        state,
        fullUrl: url.href,
    });

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

        // Determine redirect URL:
        // 1. Check if state parameter exists (passed from Google OAuth)
        // 2. Check if redirectTo query param exists
        // 3. Fall back to getSafeRedirectUrl which validates the URL
        let redirectUrl: string;

        if (state) {
            console.log("State parameter found:", state);
            // State was passed from signin/signup page
            // Create a temporary request with the state as redirectTo
            const tempUrl = new URL(request.url);
            tempUrl.searchParams.set("redirectTo", state);
            const tempRequest = new Request(tempUrl.toString());
            redirectUrl = getSafeRedirectUrl(tempRequest);
        } else {
            console.log("No state parameter, using default redirect");
            // Use the redirectTo from query params or default
            redirectUrl = getSafeRedirectUrl(request);
        }

        console.log("Final redirect URL:", redirectUrl);

        // Create session and redirect to intended URL
        // Important: We pass the full URL directly to createUserSession
        // The redirect happens immediately, no need for auth-layout to handle it
        return createUserSession(user.id, redirectUrl);
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
