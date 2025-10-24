import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("app", "routes/app/app-layout.tsx", [
    route("dashboard", "routes/app/dashboard/index.tsx"),
    route("memorization", "routes/app/memorization/index.tsx"),
    route("progress-report", "routes/app/progress-report/index.tsx"),
    route("game", "routes/app/game/index.tsx"),
    route("leaderboard", "routes/app/leaderboard/index.tsx"),
  ]),
] satisfies RouteConfig;
