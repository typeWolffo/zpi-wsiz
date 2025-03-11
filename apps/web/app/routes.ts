import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  layout("routes/Layout.tsx", [
    index("routes/home.tsx"),
    route("settings", "routes/Settings.tsx"),
    route("vehicles", "routes/Vehicles.tsx"),
    route("mechanics", "routes/Mechanics.tsx"),
    route("clients", "routes/Clients.tsx"),
  ]),
  route("login", "routes/Login.tsx"),
] satisfies RouteConfig;
