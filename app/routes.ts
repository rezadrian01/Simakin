import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),

  route("auth", "routes/auth/auth-layout.tsx", [
    route("signin", "routes/auth/signin/index.tsx"),
    route("signup", "routes/auth/signup/index.tsx"),
    route("signout", "routes/auth/signout/index.tsx"),
    route("google/callback", "routes/auth/google/callback/index.tsx"),
    // route("forgot-password", "routes/auth/forgot-password/index.tsx"),
    // route("reset-password", "routes/auth/reset-password/index.tsx"),
  ]),

  // Memorization session route - NO SIDEBAR (fullscreen focus)
  route(
    "app/memorization/session",
    "routes/app/memorization/session/index.tsx"
  ),

  // Onboarding route - NO SIDEBAR (fullscreen focus)
  route("app/onboarding", "routes/app/onboarding/index.tsx"),

  route("app", "routes/app/app-layout.tsx", [
    route("dashboard", "routes/app/dashboard/index.tsx"),

    ...prefix("memorization", [
      index("routes/app/memorization/index.tsx"),
      route("new", "routes/app/memorization/new/index.tsx"),
      route("result/:id", "routes/app/memorization/result/[id]/index.tsx"),
    ]),
    route("progress-report", "routes/app/progress-report/index.tsx"),
    route("game", "routes/app/game/index.tsx"),
    route("leaderboard", "routes/app/leaderboard/index.tsx"),
  ]),
] satisfies RouteConfig;
