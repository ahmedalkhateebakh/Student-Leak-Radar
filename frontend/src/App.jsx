import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { BarChart3, FileSpreadsheet, Gauge, Home, LineChart } from "lucide-react";
import { globalStyles } from "./styles";
import { appRoutes, getRouteByPath, prefetchRoute } from "./routeConfig";
import {
  AnalyticsProvider,
  Breadcrumbs,
  CommandPalette,
  DirtyProvider,
  ErrorBoundary,
  NetworkStatus,
  PerformanceMonitor,
  RouteAnalytics,
  RoutePrefetchLink,
  ScrollMemory,
  ScrollToTopButton,
  ToastProvider,
} from "./enterpriseUx";

const routeIcons = {
  home: Home,
  "prediction-console": Gauge,
  "intelligence-lab": BarChart3,
  "csv-requirements": FileSpreadsheet,
  "model-output": LineChart,
};

const routeComponents = Object.fromEntries(
  appRoutes.map((route) => [route.id, lazy(route.loader)])
);

const shellStyles = {
  page: {
    minHeight: "100vh",
    position: "relative",
    overflowX: "hidden",
    color: "#f8fafc",
    fontFamily: "Inter, ui-sans-serif, system-ui, Segoe UI, Arial, sans-serif",
    background: "#0d1b2a",
    padding: 0,
  },
  shell: {
    position: "relative",
    zIndex: 2,
    width: "100%",
    margin: "0 auto",
  },
  topBar: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    height: 80,
    display: "grid",
    gridTemplateColumns: "minmax(190px, 230px) minmax(0, 1fr)",
    alignItems: "center",
    gap: 16,
    width: "100%",
    padding: "0 clamp(16px, 3vw, 44px)",
    borderBottom: "1px solid transparent",
    background: "rgba(13, 27, 42, 0.72)",
    backdropFilter: "blur(18px)",
    transition: "height 250ms cubic-bezier(0.22,1,0.36,1), background 250ms cubic-bezier(0.22,1,0.36,1), box-shadow 250ms cubic-bezier(0.22,1,0.36,1), border-color 250ms cubic-bezier(0.22,1,0.36,1), backdrop-filter 250ms cubic-bezier(0.22,1,0.36,1)",
  },
  topLine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    background: "linear-gradient(90deg, transparent, rgba(94,234,212,0.4), rgba(56,189,248,0.4), transparent)",
  },
  navBrand: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
    minWidth: 0,
    color: "#f8fafc",
    fontWeight: 950,
    lineHeight: 1,
  },
  navBrandTitle: {
    display: "inline-flex",
    alignItems: "baseline",
    gap: 4,
    color: "#f8fafc",
    fontSize: 17,
    fontWeight: 950,
    letterSpacing: 0,
    lineHeight: 1,
    whiteSpace: "nowrap",
  },
  navBrandAccent: { color: "#38bdf8" },
  navBrandSub: {
    marginTop: 6,
    color: "rgba(255,255,255,0.3)",
    fontSize: 9,
    fontWeight: 900,
    letterSpacing: "2.5px",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  },
  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    minWidth: 0,
    overflowX: "auto",
  },
  navLink: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 36,
    border: "1px solid transparent",
    borderRadius: 8,
    padding: "8px 14px",
    color: "rgba(255,255,255,0.55)",
    background: "transparent",
    fontSize: 13,
    fontWeight: 650,
    whiteSpace: "nowrap",
    cursor: "pointer",
    textDecoration: "none",
    transition: "all 220ms cubic-bezier(0.22,1,0.36,1)",
    overflow: "hidden",
  },
  navActive: {
    color: "#eafff3",
    background: "rgba(94,234,212,0.14)",
    borderColor: "rgba(94,234,212,0.28)",
    boxShadow: "0 0 26px rgba(94,234,212,0.16)",
  },
  content: {
    width: "100%",
    maxWidth: "none",
    margin: 0,
  },
  scrollProgress: {
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 10000,
    width: "100%",
    height: 2,
    background: "rgba(94,234,212,0.16)",
    pointerEvents: "none",
  },
  scrollProgressBar: {
    height: "100%",
    width: "var(--scroll-progress)",
    background: "linear-gradient(90deg, #5eead4, #38bdf8)",
    boxShadow: "0 0 16px rgba(94,234,212,0.45)",
    transition: "width 120ms linear",
  },
};

const appCss = `
  ${globalStyles}

  :root {
    --bg: #0d1b2a;
    --card: rgba(15,23,42,.58);
    --card-border: rgba(255,255,255,.10);
    --text: #f8fafc;
    --muted: #94a3b8;
    --accent-teal: #5eead4;
    --accent-blue: #38bdf8;
    --spacing-xs: 6px;
    --spacing-sm: 10px;
    --spacing-md: 16px;
    --spacing-lg: 24px;
    --spacing-xl: 36px;
    --radius-sm: 8px;
    --radius-md: 14px;
    --radius-lg: 20px;
    --radius-xl: 28px;
    --shadow-sm: 0 10px 28px rgba(0,0,0,.18);
    --shadow-md: 0 18px 48px rgba(0,0,0,.24);
    --shadow-lg: 0 30px 100px rgba(0,0,0,.38);
    --transition-fast: 160ms cubic-bezier(0.22,1,0.36,1);
    --transition-normal: 260ms cubic-bezier(0.22,1,0.36,1);
    --transition-slow: 520ms cubic-bezier(0.22,1,0.36,1);
  }

  .app-topbar.is-scrolled {
    height: 64px !important;
    background: rgba(8,13,20,0.92) !important;
    backdrop-filter: blur(22px) saturate(135%) !important;
    border-color: rgba(255,255,255,.08) !important;
    box-shadow: 0 16px 48px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,.04) !important;
  }

  .app-nav-spacer {
    width: 100%;
    height: var(--app-nav-height, 80px);
    flex: 0 0 auto;
  }

  .app-nav-link:hover {
    color: rgba(255,255,255,0.9) !important;
    background: rgba(255,255,255,0.06) !important;
    border-color: rgba(255,255,255,0.08) !important;
  }

  .app-nav-link::after {
    content: "";
    position: absolute;
    left: 12px;
    right: 12px;
    bottom: 4px;
    height: 2px;
    border-radius: 999px;
    background: var(--accent-teal);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform var(--transition-fast);
  }

  .app-nav-link:hover::after,
  .app-nav-link.is-active::after {
    transform: scaleX(1);
  }

  .app-nav-link.is-active::before {
    content: "";
    position: absolute;
    left: 50%;
    bottom: -7px;
    width: 5px;
    height: 5px;
    border-radius: 999px;
    background: var(--accent-teal);
    box-shadow: 0 0 14px rgba(94,234,212,.78);
    transform: translateX(-50%);
  }

  .app-topbar::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(94,234,212,0.22), rgba(56,189,248,0.14), transparent);
    pointer-events: none;
  }

  .app-nav-link.is-active:hover {
    color: #ffffff !important;
    background: rgba(94,234,212,0.18) !important;
    border-color: rgba(94,234,212,0.34) !important;
  }

  .page-transition {
    animation: routeFade var(--transition-normal) both;
  }

  .page-skeleton {
    min-height: 62vh;
    display: grid;
    gap: 14px;
    align-content: start;
    padding: clamp(22px,4vw,42px);
  }

  .skeleton-line,
  .skeleton-block {
    border-radius: var(--radius-lg);
    background: linear-gradient(100deg, rgba(148,163,184,.08), rgba(148,163,184,.16), rgba(148,163,184,.08));
    background-size: 220% 100%;
    animation: skeletonShimmer 1.35s ease-in-out infinite;
  }

  .skeleton-line { height: 18px; max-width: 520px; }
  .skeleton-block { height: 260px; }

  .breadcrumbs {
    position: relative;
    z-index: 3;
    max-width: 1500px;
    margin: 0 auto;
    padding: 18px clamp(18px, 3vw, 48px) 0;
    animation: breadcrumbIn 210ms cubic-bezier(0.22,1,0.36,1) both;
  }

  .breadcrumb-list {
    display: flex;
    align-items: center;
    gap: 2px;
    min-width: 0;
    margin: 0;
    padding: 4px;
    width: fit-content;
    max-width: 100%;
    list-style: none;
    border: 1px solid rgba(255,255,255,.08);
    border-radius: 999px;
    background: rgba(8,13,20,.34);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.04);
    backdrop-filter: blur(14px);
    overflow: hidden;
  }

  .breadcrumb-item {
    display: inline-flex;
    align-items: center;
    min-width: 0;
    gap: 2px;
  }

  .breadcrumb-link,
  .breadcrumb-current {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    min-height: 28px;
    min-width: 0;
    border: 1px solid transparent;
    border-radius: 999px;
    padding: 6px 9px;
    color: rgba(226,232,240,.56);
    font-size: 12px;
    font-weight: 850;
    line-height: 1;
    text-decoration: none;
    white-space: nowrap;
    transition: color 190ms cubic-bezier(0.22,1,0.36,1), background 190ms cubic-bezier(0.22,1,0.36,1), border-color 190ms cubic-bezier(0.22,1,0.36,1), box-shadow 190ms cubic-bezier(0.22,1,0.36,1);
  }

  .breadcrumb-link:hover {
    color: rgba(248,250,252,.92);
    background: rgba(255,255,255,.06);
    box-shadow: inset 0 -1px 0 rgba(94,234,212,.34);
  }

  .breadcrumb-link:focus-visible {
    outline: 2px solid rgba(94,234,212,.76);
    outline-offset: 2px;
  }

  .breadcrumb-current {
    color: #f8fafc;
    font-weight: 950;
    background: linear-gradient(135deg, rgba(20,35,55,.95), rgba(10,22,38,.98));
    border-color: rgba(94,234,212,.22);
    box-shadow: 0 0 0 1px rgba(255,255,255,.04), 0 8px 22px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.05);
  }

  .breadcrumb-current svg {
    color: #5eead4;
  }

  .breadcrumb-separator {
    flex: 0 0 auto;
    color: rgba(148,163,184,.42);
  }

  .command-backdrop {
    position: fixed;
    inset: 0;
    z-index: 100;
    display: grid;
    place-items: start center;
    padding: 11vh 16px 16px;
    background: rgba(2,6,23,.52);
    backdrop-filter: blur(8px);
  }

  .command-palette {
    width: min(720px, 100%);
    max-height: min(680px, 78vh);
    border: 1px solid rgba(255,255,255,.12);
    border-radius: 18px;
    background: rgba(8,13,20,.96);
    box-shadow: 0 34px 120px rgba(0,0,0,.52);
    overflow: hidden;
  }

  .command-input-row {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 12px;
    padding: 16px;
    border-bottom: 1px solid rgba(255,255,255,.08);
    color: var(--accent-teal);
  }

  .command-input-row input {
    width: 100%;
    border: 0;
    outline: 0;
    background: transparent;
    color: #fff;
    font-size: 15px;
  }

  .command-input-row button,
  .command-group button {
    border: 0;
    background: transparent;
    color: inherit;
    cursor: pointer;
  }

  .command-results {
    max-height: 560px;
    overflow: auto;
    padding: 10px;
  }

  .command-group > span {
    display: block;
    padding: 12px 10px 7px;
    color: rgba(255,255,255,.34);
    font-size: 11px;
    font-weight: 950;
    letter-spacing: .14em;
    text-transform: uppercase;
  }

  .command-group button {
    width: 100%;
    display: grid;
    grid-template-columns: 24px 1fr;
    align-items: center;
    gap: 10px;
    text-align: left;
    border-radius: 12px;
    padding: 11px 12px;
    color: #dbeafe;
  }

  .command-group button.is-active,
  .command-group button:hover {
    background: rgba(94,234,212,.12);
    color: #fff;
  }

  .command-group strong,
  .command-group small {
    display: block;
  }

  .command-group small {
    margin-top: 3px;
    color: rgba(255,255,255,.42);
    font-size: 12px;
    line-height: 1.35;
  }

  .command-empty {
    padding: 28px;
    color: var(--muted);
    text-align: center;
  }

  .slr-cta-btn,
  .slr-secondary-btn {
    min-height: 52px;
    height: 52px;
    width: fit-content;
    max-width: 100%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border-radius: 16px;
    padding: 0 28px;
    font-size: 15px;
    font-weight: 800;
    letter-spacing: 0;
    white-space: nowrap;
    cursor: pointer;
  }

  .slr-cta-btn {
    border: 1px solid transparent;
    color: #03111b;
    background: linear-gradient(135deg,#5eead4,#38bdf8);
    box-shadow: 0 16px 42px rgba(94,234,212,.18), inset 0 1px 0 rgba(255,255,255,.18);
  }

  .slr-secondary-btn {
    border: 1px solid rgba(255,255,255,.12);
    color: #e2e8f0;
    background: rgba(255,255,255,.06);
    box-shadow: 0 10px 22px rgba(0,0,0,.16), inset 0 1px 0 rgba(255,255,255,.06);
  }

  .slr-cta-btn:hover:not(:disabled),
  .slr-secondary-btn:hover:not(:disabled) {
    transform: translateY(-2px);
  }

  .slr-cta-btn:focus-visible,
  .slr-secondary-btn:focus-visible {
    outline: 2px solid rgba(94,234,212,.76);
    outline-offset: 3px;
  }

  .toast-region {
    position: fixed;
    top: 24px;
    right: 24px;
    z-index: 10020;
    display: grid;
    gap: 12px;
    width: min(360px, calc(100vw - 48px));
    pointer-events: none;
  }

  .app-toast,
  .network-status,
  .recovery-card {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    border: 1px solid rgba(255,255,255,.12);
    border-radius: 16px;
    background: rgba(8,13,20,.92);
    color: #e2e8f0;
    box-shadow: var(--shadow-md);
    backdrop-filter: blur(16px);
  }

  .app-toast {
    position: relative;
    padding: 12px 12px;
    pointer-events: auto;
    animation: toastIn 220ms cubic-bezier(0.22,1,0.36,1) both;
    overflow: hidden;
  }

  .app-toast::before {
    content: "";
    position: absolute;
    left: 0;
    top: 10px;
    bottom: 10px;
    width: 3px;
    border-radius: 999px;
    background: var(--toast-accent, #38bdf8);
  }

  .app-toast.success { --toast-accent: var(--accent-teal); }
  .app-toast.error { --toast-accent: #fb7185; }
  .app-toast.warning { --toast-accent: #38bdf8; }
  .app-toast.info { --toast-accent: #60a5fa; }

  .toast-icon {
    width: 26px;
    height: 26px;
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    border-radius: 999px;
    color: var(--toast-accent);
    background: color-mix(in srgb, var(--toast-accent) 14%, transparent);
    margin-left: 2px;
  }

  .toast-copy {
    flex: 1;
    min-width: 0;
  }

  .toast-close {
    width: 28px;
    height: 28px;
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    border: 0;
    border-radius: 999px;
    color: rgba(226,232,240,.62);
    background: transparent;
    cursor: pointer;
  }

  .toast-close:hover,
  .toast-close:focus-visible {
    color: #ffffff;
    background: rgba(255,255,255,.08);
    outline: none;
  }

  .app-toast strong,
  .app-toast span,
  .network-status strong,
  .network-status span,
  .recovery-card strong,
  .recovery-card span {
    display: block;
  }

  .app-toast strong,
  .network-status strong,
  .recovery-card strong {
    color: #fff;
    font-size: 13px;
  }

  .app-toast span,
  .network-status span,
  .recovery-card span {
    margin-top: 3px;
    color: var(--muted);
    font-size: 12px;
    line-height: 1.45;
  }

  .app-toast .toast-icon {
    display: grid;
    margin-top: 0;
    color: var(--toast-accent);
  }

  .network-status {
    position: fixed;
    left: 50%;
    bottom: 18px;
    z-index: 110;
    transform: translateX(-50%);
    padding: 12px 14px;
  }

  .network-status.offline svg { color: #38bdf8; }
  .network-status.restored svg { color: var(--accent-teal); }

  .recovery-card {
    position: fixed;
    left: 50%;
    bottom: 24px;
    z-index: 10010;
    width: min(680px, calc(100vw - 32px));
    transform: translateX(-50%);
    align-items: center;
    padding: 16px;
    justify-content: space-between;
  }

  .recovery-card > div:first-child { flex: 1; min-width: 0; }
  .recovery-actions {
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    flex: 0 0 auto;
  }

  .recovery-actions .action-arrow {
    display: inline-block;
    margin-top: 0;
    color: inherit;
    font-size: inherit;
    line-height: 1;
  }

  .scroll-top-btn {
    position: fixed;
    right: 22px;
    bottom: 86px;
    z-index: 80;
    width: 46px;
    height: 46px;
    display: grid;
    place-items: center;
    border: 1px solid rgba(255,255,255,.12);
    border-radius: 999px;
    color: #eafff3;
    background: rgba(8,13,20,.72);
    box-shadow: 0 18px 46px rgba(94,234,212,.14);
    backdrop-filter: blur(14px);
    opacity: 0;
    transform: translateY(12px) scale(.86);
    pointer-events: none;
    transition: opacity var(--transition-normal), transform var(--transition-normal), border-color var(--transition-normal);
    cursor: pointer;
  }

  .scroll-top-btn.is-visible {
    opacity: 1;
    transform: translateY(0) scale(1);
    pointer-events: auto;
  }

  .scroll-top-btn:hover {
    border-color: rgba(94,234,212,.4);
    transform: translateY(-2px) scale(1.02);
  }

  .error-boundary-fallback {
    min-height: 60vh;
    display: grid;
    place-items: center;
    align-content: center;
    gap: 14px;
    margin: clamp(18px, 4vw, 42px);
    padding: clamp(28px, 5vw, 52px);
    border: 1px solid rgba(251,113,133,.24);
    border-radius: 28px;
    background: rgba(15,23,42,.72);
    text-align: center;
  }

  .error-boundary-fallback svg { color: #fb7185; }
  .error-boundary-fallback h1 { margin: 0; }
  .error-boundary-fallback p { margin: 0; color: var(--muted); }
  .error-boundary-fallback div { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }
  .error-boundary-fallback button,
  .error-boundary-fallback a {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    border: 1px solid rgba(255,255,255,.12);
    border-radius: 14px;
    padding: 11px 14px;
    color: #e2e8f0;
    background: rgba(255,255,255,.06);
    font-weight: 900;
    text-decoration: none;
    cursor: pointer;
  }

  .reveal-on-scroll {
    opacity: 0;
    transform: translateY(24px);
    transition: opacity var(--transition-slow), transform var(--transition-slow);
  }

  .reveal-on-scroll.is-visible {
    opacity: 1;
    transform: translateY(0);
  }

  @keyframes routeFade {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes toastIn {
    from { opacity: 0; transform: translateY(-8px) scale(.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  @keyframes breadcrumbIn {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes skeletonShimmer {
    0% { background-position: 220% 0; }
    100% { background-position: -220% 0; }
  }

  @media (max-width: 760px) {
    .app-topbar {
      grid-template-columns: 1fr !important;
      grid-template-areas: "brand" "nav";
      padding-top: 12px !important;
      padding-bottom: 12px !important;
      height: auto !important;
      min-height: 80px !important;
    }
    .app-brand { grid-area: brand; }
    .app-nav { grid-area: nav; justify-content: flex-start !important; width: 100% !important; }
  }

  @media (max-width: 680px) {
    .app-shell,
    .app-content { width: 100% !important; }
    .app-nav-link { padding: 8px 10px !important; }
    .app-nav-link span { display: none; }
    .breadcrumbs { padding-top: 14px; }
    .breadcrumb-list { width: 100%; }
    .breadcrumb-item:not(:first-child):not(:last-child) .breadcrumb-link,
    .breadcrumb-item:not(:first-child):not(:last-child) .breadcrumb-current {
      max-width: 42px;
      color: transparent;
      position: relative;
    }
    .breadcrumb-item:not(:first-child):not(:last-child) .breadcrumb-link::after,
    .breadcrumb-item:not(:first-child):not(:last-child) .breadcrumb-current::after {
      content: "...";
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
      color: rgba(226,232,240,.62);
    }
    .toast-region {
      top: 16px;
      left: 16px;
      right: 16px;
      width: auto;
    }
    .recovery-card { flex-wrap: wrap; align-items: flex-start; }
    .recovery-card > div:first-child { flex-basis: 100%; }
    .recovery-actions { width: 100%; justify-content: stretch; }
    .recovery-actions .slr-cta-btn,
    .recovery-actions .slr-secondary-btn { flex: 1 1 0; padding-inline: 16px; }
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      transition: none !important;
      animation: none !important;
      scroll-behavior: auto !important;
    }
  }
`;

function AppShell() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [navHeight, setNavHeight] = useState(80);
  const topBarRef = useRef(null);
  const activeRoute = useMemo(() => getRouteByPath(location.pathname), [location.pathname]);

  useEffect(() => {
    let frame = 0;
    const applyTopbarVisualState = (isScrolled) => {
      const node = topBarRef.current;
      if (!node) return;
      node.style.height = isScrolled ? "64px" : "80px";
      node.style.background = isScrolled ? "rgba(8,13,20,0.92)" : "rgba(13,27,42,0.72)";
      node.style.backdropFilter = isScrolled ? "blur(22px) saturate(135%)" : "blur(18px)";
      node.style.borderColor = isScrolled ? "rgba(255,255,255,.08)" : "transparent";
      node.style.boxShadow = isScrolled
        ? "0 16px 48px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,.04)"
        : "none";
    };
    const updateScrollState = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        const nextScrolled = scrollTop > 80;
        applyTopbarVisualState(nextScrolled);
        setScrolled(nextScrolled);
        setScrollProgress(Math.min(100, Math.max(0, (scrollTop / scrollable) * 100)));
      });
    };

    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, []);

  useEffect(() => {
    const node = topBarRef.current;
    if (!node) return undefined;
    const updateHeight = () => setNavHeight(Math.ceil(node.getBoundingClientRect().height || 80));
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(node);
    window.addEventListener("resize", updateHeight);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  return (
    <div style={shellStyles.page}>
      <style>{appCss}</style>
      <RouteAnalytics />
      <PerformanceMonitor />
      <ScrollMemory />
      <NetworkStatus />
      <ScrollToTopButton />
      <div style={shellStyles.scrollProgress} aria-hidden="true">
        <div className="app-scroll-progress-bar" style={{ ...shellStyles.scrollProgressBar, "--scroll-progress": `${scrollProgress}%` }} />
      </div>

      <main className="app-shell" style={shellStyles.shell}>
        <div
          ref={topBarRef}
          className={`app-topbar${scrolled ? " is-scrolled" : ""}`}
          style={{
            ...shellStyles.topBar,
            ...(scrolled
              ? {
                  height: 64,
                  background: "rgba(8,13,20,0.92)",
                  backdropFilter: "blur(22px) saturate(135%)",
                  borderColor: "rgba(255,255,255,.08)",
                  boxShadow: "0 16px 48px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,.04)",
                }
              : {}),
          }}
        >
          <div style={shellStyles.topLine} />
          <RoutePrefetchLink className="app-brand" to="/" style={{ ...shellStyles.navBrand, textDecoration: "none" }} aria-label="Student Leak Radar home">
            <span style={shellStyles.navBrandTitle}>
              <span>Student</span>
              <span style={shellStyles.navBrandAccent}>Leak</span>
              <span>Radar</span>
            </span>
            <span style={shellStyles.navBrandSub}>EARLY WARNING DASHBOARD</span>
          </RoutePrefetchLink>
          <nav className="app-nav" style={shellStyles.nav} aria-label="Primary workspace">
            {appRoutes.map((item) => {
              const Icon = routeIcons[item.id];
              const active = activeRoute.id === item.id;
              return (
                <RoutePrefetchLink
                  key={item.id}
                  className={`app-nav-link${active ? " is-active" : ""}`}
                  to={item.path}
                  title={item.summary}
                  style={{ ...shellStyles.navLink, ...(active ? shellStyles.navActive : {}) }}
                  aria-current={active ? "page" : undefined}
                  onMouseEnter={() => prefetchRoute(item.path)}
                  onFocus={() => prefetchRoute(item.path)}
                >
                  <Icon size={17} strokeWidth={2.6} />
                  <span>{item.label}</span>
                </RoutePrefetchLink>
              );
            })}
          </nav>
          <CommandPalette />
        </div>

        <div className="app-nav-spacer" style={{ "--app-nav-height": `${navHeight}px` }} aria-hidden="true" />
        <Breadcrumbs />
        <div className="app-content page-transition" style={shellStyles.content} key={location.pathname}>
          <ErrorBoundary>
            <Suspense fallback={<PageSkeleton />}>
              <Routes>
                {appRoutes.map((route) => {
                  const Component = routeComponents[route.id];
                  return <Route key={route.id} path={route.path} element={<Component />} />;
                })}
                <Route path="/home" element={<Navigate to="/" replace />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="page-skeleton" aria-label="Loading dashboard page">
      <div className="skeleton-line" />
      <div className="skeleton-line" style={{ width: "42%" }} />
      <div className="skeleton-block" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AnalyticsProvider>
        <ToastProvider>
          <DirtyProvider>
            <AppShell />
          </DirtyProvider>
        </ToastProvider>
      </AnalyticsProvider>
    </BrowserRouter>
  );
}
