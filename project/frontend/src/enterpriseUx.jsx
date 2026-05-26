/* eslint-disable react-refresh/only-export-components, react-hooks/set-state-in-effect, react-hooks/refs */
import { Component, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link, useBeforeUnload, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowUp,
  Bell,
  CheckCircle2,
  ChevronRight,
  Command,
  FileDown,
  Gauge,
  Home,
  Info,
  LayoutDashboard,
  RefreshCcw,
  WifiOff,
  X,
} from "lucide-react";
import { appRoutes, getBreadcrumbItems, getRouteByPath, prefetchRoute } from "./routeConfig";

const ToastContext = createContext(null);
const DirtyContext = createContext(null);
const AnalyticsContext = createContext(null);

const storage = {
  get(key, fallback = null) {
    try {
      const value = window.localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // localStorage can be unavailable in privacy modes; failing silently keeps the UI usable.
    }
  },
  remove(key) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // noop
    }
  },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((items) => items.filter((item) => item.id !== id));
  }, []);

  const notify = useCallback((toast) => {
    const id = toast.id || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((items) => [{ id, tone: "info", duration: 4200, ...toast }, ...items].slice(0, 5));
    return id;
  }, []);

  const value = useMemo(() => ({ notify, dismiss }), [notify, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-region" aria-label="Notifications" aria-relevant="additions">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext) || { notify: () => {} };
}

function ToastItem({ toast, onDismiss }) {
  const timerRef = useRef(null);
  const remainingRef = useRef(toast.duration || 4200);
  const startedAtRef = useRef(0);
  const tone = toast.tone || "info";
  const Icon = tone === "error" ? AlertTriangle : tone === "warning" ? Bell : tone === "info" ? Info : CheckCircle2;

  const startTimer = useCallback(() => {
    window.clearTimeout(timerRef.current);
    startedAtRef.current = Date.now();
    timerRef.current = window.setTimeout(() => onDismiss(toast.id), remainingRef.current);
  }, [onDismiss, toast.id]);

  useEffect(() => {
    startTimer();
    return () => window.clearTimeout(timerRef.current);
  }, [startTimer]);

  const pauseTimer = () => {
    window.clearTimeout(timerRef.current);
    remainingRef.current = Math.max(800, remainingRef.current - (Date.now() - startedAtRef.current));
  };

  const resumeTimer = () => startTimer();

  return (
    <div
      className={`app-toast ${tone}`}
      role={tone === "error" ? "alert" : "status"}
      aria-live={tone === "error" ? "assertive" : "polite"}
      onMouseEnter={pauseTimer}
      onMouseLeave={resumeTimer}
      onFocus={pauseTimer}
      onBlur={resumeTimer}
    >
      <span className="toast-icon" aria-hidden="true"><Icon size={17} /></span>
      <div className="toast-copy">
        <strong>{toast.title}</strong>
        {toast.message && <span>{toast.message}</span>}
      </div>
      <button type="button" className="toast-close" aria-label={`Dismiss ${toast.title || "notification"}`} onClick={() => onDismiss(toast.id)}>
        <X size={15} />
      </button>
    </div>
  );
}

export function AnalyticsProvider({ children }) {
  const track = useCallback((eventName, payload = {}) => {
    const event = {
      eventName,
      payload,
      path: window.location.pathname,
      search: window.location.search,
      ts: new Date().toISOString(),
    };
    window.dispatchEvent(new CustomEvent("student-leak-radar:analytics", { detail: event }));
    if (import.meta.env.DEV) console.info("[analytics]", event);
  }, []);

  return <AnalyticsContext.Provider value={{ track }}>{children}</AnalyticsContext.Provider>;
}

export function useAnalytics() {
  return useContext(AnalyticsContext) || { track: () => {} };
}

export function RouteAnalytics() {
  const location = useLocation();
  const { track } = useAnalytics();

  useEffect(() => {
    const route = getRouteByPath(location.pathname);
    track("Page Viewed", { page: route.label, path: location.pathname, query: location.search });
    storage.set("slr:last-route", `${location.pathname}${location.search}`);
  }, [location.pathname, location.search, track]);

  return null;
}

export function PerformanceMonitor() {
  const { track } = useAnalytics();

  useEffect(() => {
    if (!("PerformanceObserver" in window)) return undefined;
    const observers = [];
    const observe = (type, handler) => {
      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach(handler);
        });
        observer.observe({ type, buffered: true });
        observers.push(observer);
      } catch {
        // Some browsers do not expose every metric yet.
      }
    };

    observe("largest-contentful-paint", (entry) => track("Performance Metric", { metric: "LCP", value: Math.round(entry.startTime) }));
    observe("layout-shift", (entry) => {
      if (!entry.hadRecentInput) track("Performance Metric", { metric: "CLS", value: Number(entry.value.toFixed(4)) });
    });
    observe("event", (entry) => {
      if (entry.duration) track("Performance Metric", { metric: "INP", value: Math.round(entry.duration) });
    });

    const nav = performance.getEntriesByType("navigation")[0];
    if (nav) track("Performance Metric", { metric: "TTFB", value: Math.round(nav.responseStart) });

    return () => observers.forEach((observer) => observer.disconnect());
  }, [track]);

  return null;
}

export function DirtyProvider({ children }) {
  const [dirtyReasons, setDirtyReasons] = useState({});
  const isDirty = Object.values(dirtyReasons).some(Boolean);

  useBeforeUnload(
    useCallback(
      (event) => {
        if (!isDirty) return;
        event.preventDefault();
        event.returnValue = "You have unsaved changes.\nLeave this page anyway?";
      },
      [isDirty]
    )
  );

  useEffect(() => {
    if (!isDirty) return undefined;
    const handleClick = (event) => {
      const anchor = event.target.closest?.("a[href]");
      if (!anchor || anchor.target || anchor.hasAttribute("download")) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (`${url.pathname}${url.search}${url.hash}` === `${window.location.pathname}${window.location.search}${window.location.hash}`) return;
      const leave = window.confirm("You have unsaved changes.\nLeave this page anyway?");
      if (!leave) {
        event.preventDefault();
        event.stopPropagation();
      } else {
        setDirtyReasons({});
      }
    };
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [isDirty]);

  const setDirty = useCallback((key, value) => {
    setDirtyReasons((current) => {
      const nextValue = Boolean(value);
      return current[key] === nextValue ? current : { ...current, [key]: nextValue };
    });
  }, []);

  const contextValue = useMemo(() => ({ isDirty, setDirty }), [isDirty, setDirty]);

  return <DirtyContext.Provider value={contextValue}>{children}</DirtyContext.Provider>;
}

export function useUnsavedChanges(key, isDirty) {
  const context = useContext(DirtyContext);
  useEffect(() => {
    context?.setDirty(key, isDirty);
    return () => context?.setDirty(key, false);
  }, [context, isDirty, key]);
}

export function useUrlState(defaults = {}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultsRef = useRef(defaults);

  const state = useMemo(() => {
    const next = { ...defaultsRef.current };
    searchParams.forEach((value, key) => {
      next[key] = value;
    });
    return next;
  }, [searchParams]);

  const setUrlState = useCallback(
    (patch, options = { replace: true }) => {
      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        Object.entries(patch).forEach(([key, value]) => {
          if (value === undefined || value === null || value === "") next.delete(key);
          else next.set(key, String(value));
        });
        return next;
      }, options);
    },
    [setSearchParams]
  );

  return [state, setUrlState];
}

export function usePersistentDraft(key, snapshot, { enabled = true, onRestore } = {}) {
  const [candidate, setCandidate] = useState(null);

  useEffect(() => {
    const saved = storage.get(key);
    if (saved?.snapshot) setCandidate(saved);
  }, [key]);

  useEffect(() => {
    if (!enabled) return;
    storage.set(key, { snapshot, updatedAt: Date.now() });
  }, [enabled, key, snapshot]);

  const restore = useCallback(() => {
    if (candidate?.snapshot) onRestore?.(candidate.snapshot);
    setCandidate(null);
  }, [candidate, onRestore]);

  const discard = useCallback(() => {
    storage.remove(key);
    setCandidate(null);
  }, [key]);

  return { candidate, restore, discard, clear: discard };
}

export function RecoveryPrompt({ candidate, onRestore, onDiscard }) {
  if (!candidate) return null;
  const when = candidate.updatedAt ? new Date(candidate.updatedAt).toLocaleString() : "recently";
  return (
    <div className="recovery-card" role="dialog" aria-modal="false" aria-label="Restore previous session">
      <div>
        <strong>Restore previous session?</strong>
        <span>Saved {when}. You can safely continue where you left off.</span>
      </div>
      <div className="recovery-actions">
        <button type="button" className="slr-cta-btn recovery-primary" onClick={onRestore}>
          Continue Session
        </button>
        <button type="button" className="slr-secondary-btn" onClick={onDiscard}>Discard</button>
      </div>
    </div>
  );
}

export function NetworkStatus() {
  const [online, setOnline] = useState(() => navigator.onLine);
  const [restored, setRestored] = useState(false);
  const { notify } = useToast();

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      setRestored(true);
      notify({ title: "Connection restored", tone: "success" });
      window.setTimeout(() => setRestored(false), 3200);
    };
    const handleOffline = () => setOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [notify]);

  if (online && !restored) return null;
  return (
    <div className={`network-status ${online ? "restored" : "offline"}`} role="status" aria-live="polite">
      {online ? <CheckCircle2 size={16} /> : <WifiOff size={16} />}
      <div>
        <strong>{online ? "Connection restored" : "Offline"}</strong>
        {!online && <span>Trying to reconnect...</span>}
      </div>
    </div>
  );
}

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Dashboard error boundary", error, info);
    window.dispatchEvent(new CustomEvent("student-leak-radar:error", { detail: { error, info } }));
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <section className="error-boundary-fallback" role="alert">
        <AlertTriangle size={28} />
        <h1>Something went wrong.</h1>
        <p>The dashboard kept your browser context. Reload or return home to continue.</p>
        <div>
          <button type="button" onClick={() => window.location.reload()}>
            <RefreshCcw size={16} />
            Reload Dashboard
          </button>
          <Link to="/">
            <Home size={16} />
            Return Home
          </Link>
        </div>
      </section>
    );
  }
}

export function Breadcrumbs() {
  const location = useLocation();
  const items = getBreadcrumbItems(location.pathname, location.search);

  if (items.length <= 1 && items[0]?.path === "/") return null;

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol className="breadcrumb-list">
        {items.map((item, index) => (
          <li className="breadcrumb-item" key={`${item.path}-${index}`}>
            {index > 0 && <ChevronRight className="breadcrumb-separator" size={14} strokeWidth={2.5} aria-hidden="true" />}
            {item.current ? (
              <span className="breadcrumb-current" aria-current="page">
                {index === 0 && <Home size={14} strokeWidth={2.4} aria-hidden="true" />}
                {item.label}
              </span>
            ) : (
              <Link className="breadcrumb-link" to={item.path}>
                {index === 0 && <Home size={14} strokeWidth={2.4} aria-hidden="true" />}
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function ScrollMemory() {
  const location = useLocation();
  const keyRef = useRef("");

  useEffect(() => {
    const key = `slr:scroll:${location.pathname}${location.search}`;
    keyRef.current = key;
    const saved = Number(sessionStorage.getItem(key) || 0);
    let frame = 0;
    if (saved > 0) {
      frame = requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo({ top: saved, behavior: "auto" })));
    } else {
      frame = requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "auto" }));
    }
    return () => {
      cancelAnimationFrame(frame);
      sessionStorage.setItem(keyRef.current, String(window.scrollY || 0));
    };
  }, [location.pathname, location.search]);

  useEffect(() => {
    const save = () => sessionStorage.setItem(keyRef.current, String(window.scrollY || 0));
    window.addEventListener("pagehide", save);
    return () => window.removeEventListener("pagehide", save);
  }, []);

  return null;
}

export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setVisible(window.scrollY > 420));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
    };
  }, []);

  return (
    <button
      className={`scroll-top-btn${visible ? " is-visible" : ""}`}
      type="button"
      aria-label="Scroll to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <ArrowUp size={18} />
    </button>
  );
}

const extraSearchItems = [
  { category: "Students", label: "High-risk students", path: "/model-output?dataset=latest&risk=high", description: "Open latest high-risk output view" },
  { category: "Risk drivers", label: "Risk drivers", path: "/prediction-console?tab=drivers", description: "Review model driver context" },
  { category: "Datasets", label: "Batch dataset", path: "/model-output?dataset=batch1", description: "Open batch model output" },
  { category: "Exports", label: "Export predictions", path: "/model-output?dataset=latest&action=export", description: "Jump to export-ready output" },
  { category: "Predictions", label: "Run prediction", path: "/prediction-console?tab=data", description: "Start or continue scoring" },
  { category: "Dashboard sections", label: "Scatter view", path: "/intelligence-lab?view=scatter", description: "Open Intelligence Lab scatter view" },
  { category: "Dashboard sections", label: "High risk sorted by score", path: "/intelligence-lab?risk=high&sort=score", description: "Focus the intelligence view" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();
  const { track } = useAnalytics();
  const inputRef = useRef(null);
  const chordRef = useRef("");

  const items = useMemo(
    () => [
      ...appRoutes.map((route) => ({ category: route.category, label: route.label, path: route.path, description: route.summary })),
      ...extraSearchItems,
    ],
    []
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((item) => `${item.category} ${item.label} ${item.description}`.toLowerCase().includes(needle));
  }, [items, query]);

  const openItem = useCallback((item) => {
    track("Search Used", { query, destination: item.path, label: item.label });
    setOpen(false);
    setQuery("");
    navigate(item.path);
  }, [navigate, query, track]);

  useEffect(() => {
    if (activeIndex >= filtered.length) setActiveIndex(0);
  }, [activeIndex, filtered.length]);

  useEffect(() => {
    const onKeyDown = (event) => {
      const key = event.key.toLowerCase();
      if ((event.ctrlKey || event.metaKey) && key === "k") {
        event.preventDefault();
        setOpen(true);
        return;
      }
      if (!open && key === "g") {
        chordRef.current = "g";
        window.setTimeout(() => {
          chordRef.current = "";
        }, 900);
        return;
      }
      if (!open && chordRef.current === "g") {
        const route = appRoutes.find((item) => item.shortcut === key);
        if (route) {
          event.preventDefault();
          navigate(route.path);
        }
      }
      if (!open) return;
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((index) => Math.min(index + 1, filtered.length - 1));
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((index) => Math.max(index - 1, 0));
      }
      if (event.key === "Enter" && filtered[activeIndex]) {
        event.preventDefault();
        openItem(filtered[activeIndex]);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, filtered, navigate, open, openItem]);

  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  const grouped = filtered.reduce((acc, item) => {
    acc[item.category] = acc[item.category] || [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <>
      {open && (
        <div className="command-backdrop" role="presentation" onMouseDown={() => setOpen(false)}>
          <section className="command-palette" role="dialog" aria-modal="true" aria-label="Global dashboard search" onMouseDown={(event) => event.stopPropagation()}>
            <div className="command-input-row">
              <Command size={18} />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActiveIndex(0);
                }}
                placeholder="Search students, pages, predictions, datasets..."
                aria-label="Search dashboard"
              />
              <button type="button" onClick={() => setOpen(false)} aria-label="Close search"><X size={16} /></button>
            </div>
            <div className="command-results" role="listbox" aria-label="Search results">
              {!filtered.length && <div className="command-empty">No results found.</div>}
              {Object.entries(grouped).map(([category, group]) => (
                <div className="command-group" key={category}>
                  <span>{category}</span>
                  {group.map((item) => {
                    const flatIndex = filtered.indexOf(item);
                    return (
                      <button
                        key={`${item.category}-${item.label}`}
                        type="button"
                        role="option"
                        aria-selected={flatIndex === activeIndex}
                        className={flatIndex === activeIndex ? "is-active" : ""}
                        onMouseEnter={() => setActiveIndex(flatIndex)}
                        onClick={() => openItem(item)}
                      >
                        {item.category === "Pages" ? <LayoutDashboard size={16} /> : item.category === "Exports" ? <FileDown size={16} /> : <Gauge size={16} />}
                        <span>
                          <strong>{item.label}</strong>
                          <small>{item.description}</small>
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </>
  );
}

export function RoutePrefetchLink({ to, children, ...props }) {
  const handlePrefetch = () => prefetchRoute(typeof to === "string" ? to.split("?")[0] : to.pathname);
  return (
    <Link to={to} onMouseEnter={handlePrefetch} onFocus={handlePrefetch} {...props}>
      {children}
    </Link>
  );
}
