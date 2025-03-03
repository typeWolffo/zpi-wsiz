import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  layout("routes/Layout.tsx", [index("routes/home.tsx"), route("settings", "routes/Settings.tsx")]),
  route("login", "routes/Login.tsx"),
] satisfies RouteConfig;
