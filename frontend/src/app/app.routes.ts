import { Routes } from "@angular/router";
import { authGuard } from "./core/auth-guard";

export const routes: Routes = [
  {
    path: "login",
    loadComponent: () =>
      import("./pages/login/login").then((route) => route.Login),
  },
  {
    path: "",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./layout/main-layout/main-layout").then(
        (route) => route.MainLayout,
      ),
    children: [
      { path: "", pathMatch: "full", redirectTo: "portfolio/dashboard" },
      {
        path: "portfolio/dashboard",
        loadComponent: () =>
          import("./pages/dashboard/dashboard").then(
            (route) => route.Dashboard,
          ),
      },
      {
        path: "portfolio/search",
        loadComponent: () =>
          import("./pages/search/search").then((route) => route.Search),
      },
      {
        path: "instructions/add",
        loadComponent: () =>
          import("./pages/about/about").then((route) => route.About),
      },
      {
        path: "analytics",
        loadComponent: () =>
          import("./pages/coming-soon/coming-soon").then(
            (route) => route.ComingSoon,
          ),
      },
      { path: "**", redirectTo: "portfolio/dashboard" },
    ],
  },
  { path: "**", redirectTo: "" },
];
