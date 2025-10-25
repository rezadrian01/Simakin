import { type RouteConfig, index, route } from "@react-router/dev/routes";

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

  route("app", "routes/app/app-layout.tsx", [
    route("dashboard", "routes/app/dashboard/index.tsx"),
    route("memorization", "routes/app/memorization/index.tsx"),
    route("progress-report", "routes/app/progress-report/index.tsx"),
    route("game", "routes/app/game/index.tsx"),
    route("leaderboard", "routes/app/leaderboard/index.tsx"),
  ]),
] satisfies RouteConfig;
