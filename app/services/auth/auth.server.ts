import "dotenv/config";

import bcrypt from "bcryptjs";
import { createCookieSessionStorage, redirect } from "react-router";
import { db } from "~/lib/db.server";

type User = {
  id: string;
  email: string;
  fullName: string;
  role: "USER" | "ADMIN";
  avatarUrl?: string;
  token: string;
};

const sessionSecret = process.env.SESSION_SECRET || "default-secret-change-me";

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [sessionSecret],
    secure: process.env.NODE_ENV === "production",
  },
});

// Valid app routes that users can be redirected to
const VALID_APP_ROUTES = [
  "/app/dashboard",
  "/app/game",
  "/app/leaderboard",
  "/app/recitation",
  "/app/progress-report",
  "/app/onboarding", // Special route for new users
];

// Helper to validate and get safe redirect URL
export function getSafeRedirectUrl(
  request: Request,
  fallbackPath: string = "/app/dashboard"
): string {
  const url = new URL(request.url);
  const redirectTo = url.searchParams.get("redirectTo");

  // If no redirectTo param, use fallback
  if (!redirectTo) {
    return `${url.origin}${fallbackPath}`;
  }

  try {
    // Try to parse as full URL
    const redirectUrl = new URL(redirectTo);

    // Only allow same origin redirects for security
    if (redirectUrl.origin !== url.origin) {
      return `${url.origin}${fallbackPath}`;
    }

    // Check if the path is in valid routes
    if (VALID_APP_ROUTES.includes(redirectUrl.pathname)) {
      return redirectUrl.href;
    }

    // If path not in valid routes, use fallback
    return `${url.origin}${fallbackPath}`;
  } catch {
    // If redirectTo is not a full URL, treat it as pathname
    if (VALID_APP_ROUTES.includes(redirectTo)) {
      return `${url.origin}${redirectTo}`;
    }

    // Invalid path, use fallback
    return `${url.origin}${fallbackPath}`;
  }
}

// Session helpers
export async function createUserSession(userId: string, redirectTo: string) {
  const session = await sessionStorage.getSession();
  session.set("userId", userId);

  // Check if user has completed onboarding
  const userProfile = await db.userProfile.findUnique({
    where: { userId },
    select: { referralSource: true },
  });

  // If no referral source, user hasn't completed onboarding
  if (!userProfile?.referralSource) {
    // Redirect to onboarding instead
    return redirect("/app/onboarding", {
      headers: {
        "Set-Cookie": await sessionStorage.commitSession(session),
      },
    });
  }

  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session),
    },
  });
}
export async function getUserSession(request: Request) {
  return sessionStorage.getSession(request.headers.get("Cookie"));
}

export async function getUserId(request: Request): Promise<string | null> {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") return null;
  return userId;
}

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const userId = await getUserId(request);
  if (!userId) {
    const url = new URL(request.url);
    const fullRedirectUrl = `${url.origin}${redirectTo}`;
    const searchParams = new URLSearchParams([["redirectTo", fullRedirectUrl]]);
    throw redirect(`/auth/signin?${searchParams}`);
  }
  return userId;
}

export async function getUser(request: Request) {
  const userId = await getUserId(request);
  if (!userId) return null;

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, fullName: true },
    });
    return user;
  } catch {
    throw signout(request);
  }
}

export async function signout(request: Request) {
  const session = await getUserSession(request);
  return redirect("/auth/signin", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}

// Auth helpers
export async function signup({
  email,
  password,
  username,
  fullName,
}: {
  email: string;
  password: string;
  username: string;
  fullName: string;
}) {
  try {
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await db.user.create({
      data: {
        email,
        passwordHash: passwordHash,
        username,
        fullName,
      },
    });

    return { id: user.id, email: user.email };
  } catch (error: any) {
    console.error("Registration error:", error);
    // Check if it's a unique constraint violation (email already exists)
    if (error.code === "P2002") {
      throw new Error("EMAIL_EXISTS");
    }
    // Re-throw other errors
    throw error;
  }
}

export async function signin({
  emailOrUsername,
  password,
}: {
  emailOrUsername: string;
  password: string;
}) {
  const user = await db.user.findFirst({
    where: { OR: [{ email: emailOrUsername }, { username: emailOrUsername }] },
  });

  if (!user) return null;

  const isCorrectPassword = await bcrypt.compare(
    password,
    user.passwordHash ?? ""
  );
  if (!isCorrectPassword) return null;

  return { id: user.id, email: user.email };
}

// Google OAuth helpers
export async function getGoogleAuthUrl(redirectUri: string, state?: string) {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  if (!googleClientId) {
    throw new Error("GOOGLE_CLIENT_ID is not configured");
  }

  const params = new URLSearchParams({
    client_id: googleClientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
  });

  // Add state parameter if provided
  if (state) {
    params.set("state", state);
  }

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleCodeForToken(
  code: string,
  redirectUri: string
) {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!googleClientId || !googleClientSecret) {
    throw new Error("Google OAuth credentials are not configured");
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: googleClientId,
      client_secret: googleClientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to exchange code for token");
  }

  return response.json();
}

export async function getGoogleUserInfo(accessToken: string) {
  const response = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to get user info from Google");
  }

  return response.json();
}

export async function handleGoogleAuth({
  email,
  fullName,
  avatarUrl,
}: {
  email: string;
  fullName: string;
  avatarUrl?: string;
}) {
  // Check if user exists
  let user = await db.user.findUnique({
    where: { email },
  });

  // If user doesn't exist, create new account
  if (!user) {
    // Generate username from email
    const baseUsername = email.split("@")[0];
    let username = baseUsername;
    let counter = 1;

    // Make sure username is unique
    while (await db.user.findUnique({ where: { username } })) {
      username = `${baseUsername}${counter}`;
      counter++;
    }

    user = await db.user.create({
      data: {
        email,
        username,
        fullName,
        avatarUrl,
        // No password hash for OAuth users
        passwordHash: null,
      },
    });
  } else {
    // Update avatar if changed
    if (avatarUrl && user.avatarUrl !== avatarUrl) {
      user = await db.user.update({
        where: { id: user.id },
        data: { avatarUrl },
      });
    }
  }

  return { id: user.id, email: user.email };
}
