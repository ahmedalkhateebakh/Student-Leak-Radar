export const appRoutes = [
  {
    id: "home",
    path: "/",
    label: "Home",
    summary: "Project story, goals, effectiveness, and team context.",
    shortcut: "h",
    category: "Pages",
    loader: () => import("./HomePage.jsx"),
  },
  {
    id: "prediction-console",
    path: "/prediction-console",
    label: "Prediction Console",
    summary: "Run single-student or batch scoring through the trained model workflow.",
    shortcut: "p",
    category: "Pages",
    loader: () => import("./PredictWizard.jsx"),
  },
  {
    id: "intelligence-lab",
    path: "/intelligence-lab",
    label: "Intelligence Lab",
    summary: "Inspect risk, behavior, readiness, and intervention signals.",
    shortcut: "i",
    category: "Pages",
    loader: () => import("./EdaPage.jsx"),
  },
  {
    id: "csv-requirements",
    path: "/csv-requirements",
    label: "CSV Requirements",
    summary: "Column contracts for prediction and intelligence datasets.",
    shortcut: "c",
    category: "Pages",
    loader: () => import("./CsvRequirementsPage.jsx"),
  },
  {
    id: "model-output",
    path: "/model-output",
    label: "Model Output",
    summary: "Review the latest prediction outputs and export-ready dataset state.",
    shortcut: "o",
    category: "Pages",
    loader: () => import("./ModelOutputPage.jsx"),
  },
];

export const routeByPath = appRoutes.reduce((acc, route) => {
  acc[route.path] = route;
  return acc;
}, {});

const routeTree = appRoutes.map((route) => ({ ...route, children: route.children || [] }));

function normalizePath(pathname = "/") {
  if (!pathname || pathname === "/home") return "/";
  const clean = pathname.split("?")[0].split("#")[0].replace(/\/+$/, "");
  return clean || "/";
}

function humanizeSegment(value) {
  return String(value || "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function flattenRoutes(routes = routeTree, parentPath = "") {
  return routes.flatMap((route) => {
    const ownPath = route.path.startsWith("/")
      ? route.path
      : `${parentPath.replace(/\/$/, "")}/${route.path}`.replace(/\/+/g, "/");
    const current = { ...route, path: ownPath };
    return [current, ...flattenRoutes(route.children || [], ownPath)];
  });
}

export function getRouteByPath(pathname) {
  const normalized = normalizePath(pathname);
  return routeByPath[normalized] || routeByPath["/"];
}

export function prefetchRoute(pathname) {
  const route = getRouteByPath(pathname);
  route?.loader?.();
}

export function getBreadcrumbItems(pathname, search = "") {
  const normalized = normalizePath(pathname);
  const allRoutes = flattenRoutes();
  const exactRoute = allRoutes.find((route) => normalizePath(route.path) === normalized);
  const items = [{ label: routeByPath["/"].label, path: "/" }];

  if (normalized !== "/") {
    const segments = normalized.split("/").filter(Boolean);
    let currentPath = "";
    segments.forEach((segment) => {
      currentPath = `${currentPath}/${segment}`;
      const matched = allRoutes.find((route) => normalizePath(route.path) === currentPath);
      items.push({
        label: matched?.label || humanizeSegment(segment),
        path: matched?.path || currentPath,
      });
    });
  } else if (exactRoute?.path === "/") {
    items[0] = { label: exactRoute.label, path: "/" };
  }

  const params = new URLSearchParams(search);
  const detailValue = ["tab", "view", "dataset", "student", "detail"].map((key) => params.get(key)).find(Boolean);
  if (detailValue) {
    items.push({
      label: humanizeSegment(detailValue),
      path: `${normalized}${search}`,
    });
  }

  return items.map((item, index) => ({ ...item, current: index === items.length - 1 }));
}
