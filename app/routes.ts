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
  ]),
] satisfies RouteConfig;
