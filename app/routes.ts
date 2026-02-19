import type { unstable_RSCRouteConfigEntry } from "react-router";

export const routes: unstable_RSCRouteConfigEntry[] = [
  {
    id: "root",
    path: "",
    lazy: () => import("./root"),
    children: [
      {
        id: "home",
        index: true,
        lazy: () => import("./routes/home"),
      },
      {
        id: "yards",
        path: "yard",
        lazy: () => import("./routes/yard"),
      },
      {
        id: "yard-editor",
        path: "yard/:id",
        lazy: () => import("./routes/yard.$id"),
      },
      {
        id: "plants",
        path: "plants",
        lazy: () => import("./routes/plants"),
      },
      {
        id: "calendar",
        path: "calendar",
        lazy: () => import("./routes/calendar"),
      },
      {
        id: "log",
        path: "log",
        lazy: () => import("./routes/log"),
      },
      {
        id: "tasks",
        path: "tasks",
        lazy: () => import("./routes/tasks"),
      },
      {
        id: "pests",
        path: "pests",
        lazy: () => import("./routes/pests"),
      },
      {
        id: "seeds",
        path: "seeds",
        lazy: () => import("./routes/seeds"),
      },
      {
        id: "soil",
        path: "soil",
        lazy: () => import("./routes/soil"),
      },
      {
        id: "docs",
        path: "docs",
        lazy: () => import("./routes/docs"),
      },
      {
        id: "settings",
        path: "settings",
        lazy: () => import("./routes/settings"),
      },
    ],
  },
];
