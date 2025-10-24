import "dotenv/config";

import { FormStrategy } from "remix-auth-form";
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
    secrets: [process.env.SESSION_SECRET || "supersecret"], // replace this with an actual secret
    secure: process.env.NODE_ENV === "production",
  },
});

// Session helpers
export async function createUserSession(userId: string, redirectTo: string) {
  const session = await sessionStorage.getSession();
  session.set("userId", userId);
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
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
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
