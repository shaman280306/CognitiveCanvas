// client/src/App.jsx
const API_BASE = "http://127.0.0.1:3000";
import "./index.css";
import React, { useState, useEffect, useRef } from "react";
import ThoughtInput from "./components/ThoughtInput";
import ThoughtCard from "./components/ThoughtCard";

const STORAGE_KEY = "cognitive_canvas_thoughts_v1";

// default demo thoughts (used only the first time)
const SEED_THOUGHTS = [
  {
    _id: "demo-1",
    text: "Reduced note lookup time by 43% by auto-clustering user thoughts with semantic embeddings.",
    createdAt: new Date().toISOString(),
  },
  {
    _id: "demo-2",
    text: "Productize idea clustering: auto-group notes into themes, surface trending topics.",
    createdAt: new Date().toISOString(),
  },
  {
    _id: "demo-3",
    text: "Built a mind-map POC with draggable nodes (React + SVG) — UX-first interactions.",
    createdAt: new Date().toISOString(),
  },
  {
    _id: "demo-4",
    text: "Tech stack: React (Vite), Tailwind CSS, Node.js backend — prototyping embeddings + LLM suggestions.",
    createdAt: new Date().toISOString(),
  },
];

const API = `${API_BASE}/api/thoughts`;

/**
 * App: main UI
 * - preserves all original visuals and features
 * - adds server-sync, connection indicator, refresh, toast, and keyboard shortcut
 */
export default function App() {
  const [thoughts, setThoughts] = useState([]);
  const [viewMode, setViewMode] = useState("list"); // "list" | "map"
  const [offlineMode, setOfflineMode] = useState(false); // true if server unreachable
  const [status, setStatus] = useState("connecting"); // 'online'|'offline'|'connecting'
  const [toast, setToast] = useState(null); // {type: 'success'|'error', msg}
  const inputRef = useRef(null); // used by Ctrl+K focus

  // --- helper: show a short toast ---
  function showToast(type, msg, ms = 2500) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), ms);
  }

  // --- load on mount: try server, fallback to localStorage or seed ---
  useEffect(() => {
    let mounted = true;
    async function load() {
      setStatus("connecting");
      // Try server first
      try {
        const res = await fetch(API, { cache: "no-store" });
        if (!res.ok) throw new Error("Server returned " + res.status);
        const data = await res.json();
        if (mounted) {
          setThoughts(Array.isArray(data) ? data : []);
          setOfflineMode(false);
          setStatus("online");
          // persist to localStorage as a cache
          try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.isArray(data) ? data : []));
          } catch {}
          return;
        }
      } catch (err) {
        // server failed — continue to localStorage fallback
        console.warn("Could not reach server, falling back to localStorage/seed", err);
      }

      // fallback to localStorage
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            if (mounted) setThoughts(parsed);
            setOfflineMode(true);
            setStatus("offline");
            return;
          }
        }
      } catch (err) {
        console.error("Failed to read localStorage", err);
      }

      // fallback to seeds
      if (mounted) {
        setThoughts(SEED_THOUGHTS);
        setOfflineMode(true);
        setStatus("offline");
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Persist to localStorage whenever thoughts change (cache)
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(thoughts));
    } catch (err) {
      console.error("Failed to save thoughts", err);
    }
  }, [thoughts]);

  // Periodic server health check (every 30s)
  useEffect(() => {
    let mounted = true;
    let timer = null;

    async function checkServer() {
      try {
        setStatus("connecting");
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(API, { signal: controller.signal, cache: "no-store" });
        clearTimeout(timeout);
        if (!res.ok) throw new Error("Ping failed " + res.status);
        if (!mounted) return;
        setStatus("online");
        setOfflineMode(false);
      } catch (err) {
        if (!mounted) return;
        console.warn("Health check failed", err);
        setStatus("offline");
        setOfflineMode(true);
      }
    }

    // run immediately and schedule interval
    checkServer();
    timer = setInterval(checkServer, 30000);

    return () => {
      mounted = false;
      if (timer) clearInterval(timer);
    };
  }, []);

  // Helper: create a client-side id for optimistic items if server is offline
  function makeClientId() {
    return `cid-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  // Fetch list from server (manual refresh)
  async function fetchList() {
    try {
      const res = await fetch(API, { cache: "no-store" });
      if (!res.ok) throw new Error("Fetch failed " + res.status);
      const data = await res.json();
      setThoughts(Array.isArray(data) ? data : []);
      setOfflineMode(false);
      setStatus("online");
      showToast("success", "Loaded from server");
    } catch (err) {
      console.warn("fetchList failed", err);
      setOfflineMode(true);
      setStatus("offline");
      showToast("error", "Could not contact server — offline mode");
    }
  }

  // Add thought: attempt to save to server, otherwise save locally
  const addThought = async (text) => {
    const createdAt = new Date().toISOString();

    // optimistic UI item (if server is slow)
    const optimistic = {
      _id: makeClientId(),
      text,
      createdAt,
    };
    setThoughts((prev) => [optimistic, ...prev]);

    // Try server POST
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("Server returned " + res.status);
      const saved = await res.json();
      // replace optimistic item with real server item
      setThoughts((prev) => {
        const filtered = prev.filter((t) => !(t._id === optimistic._id));
        return [saved, ...filtered];
      });
      setOfflineMode(false);
      setStatus("online");
      showToast("success", "Saved");
    } catch (err) {
      console.warn("POST failed, staying offline and keeping optimistic item", err);
      setOfflineMode(true);
      setStatus("offline");
      showToast("error", "Save failed — offline, saved locally");
    }
  };

  // Update thought: optimistic update locally, attempt server update
  const handleUpdate = async (id, newText) => {
    setThoughts((prev) => prev.map((t) => (t._id === id ? { ...t, text: newText } : t)));

    // attempt server update (if id looks like server id)
    if (!id.startsWith("cid-")) {
      try {
        const res = await fetch(`${API}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: newText }),
        });
        if (!res.ok) throw new Error("Server update failed " + res.status);
        setOfflineMode(false);
        setStatus("online");
        showToast("success", "Updated");
      } catch (err) {
        console.warn("Update failed — offline or server error", err);
        setOfflineMode(true);
        setStatus("offline");
        showToast("error", "Update failed — offline");
      }
    } else {
      // client-id item; will be synced later if you implement a sync job
      setOfflineMode(true);
      setStatus("offline");
    }
  };

  // Delete thought
  const handleDelete = async (id) => {
    // remove locally first
    setThoughts((prev) => prev.filter((t) => t._id !== id));

    // attempt server delete if server id
    if (!id.startsWith("cid-")) {
      try {
        const res = await fetch(`${API}/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Server delete failed " + res.status);
        setOfflineMode(false);
        setStatus("online");
        showToast("success", "Deleted");
      } catch (err) {
        console.warn("Delete failed — offline or server error", err);
        setOfflineMode(true);
        setStatus("offline");
        showToast("error", "Delete failed — offline");
      }
    } else {
      // removed local optimistic item already
      setOfflineMode(true);
      setStatus("offline");
      showToast("success", "Removed locally");
    }
  };

  // Keyboard shortcut: Ctrl+K focuses the ThoughtInput (best-effort)
  useEffect(() => {
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        // try to find the input in ThoughtInput by placeholder
        const el = document.querySelector('input[placeholder*="Type a thought"], input[placeholder*="Write a thought"], textarea');
        if (el) el.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="app-root min-h-screen relative overflow-hidden bg-[#060718] text-white">
      {/* hologram + SVG background */}
      <div className="holo-wrap pointer-events-none">
        <div className="holo-rings" />
        <svg
          className="brain-svg"
          viewBox="0 0 200 200"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden
        >
          <defs>
            <linearGradient id="g1" x1="0" x2="1">
              <stop offset="0%" stopColor="#6ee7b7" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.85" />
            </linearGradient>
            <filter id="blurGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <g filter="url(#blurGlow)">
            <path
              d="M60 40c-8 0-18 6-20 18-2 12 4 20 4 20s-10 8-6 22c4 14 18 18 26 18h44c8 0 22-6 26-18 4-12-6-22-6-22s6-8 4-20c-2-12-14-18-22-18-9 0-14 6-22 8-8-2-12-8-22-8z"
              fill="url(#g1)"
              opacity="0.16"
            />
            <path
              d="M64 48c-6 0-14 5-16 14-1 9 3 16 3 16s-8 6-5 16c3 10 14 14 20 14h36c6 0 18-5 20-14 2-9-5-16-5-16s5-6 4-16c-1-9-10-14-16-14-6 0-10 4-16 6-6-2-9-6-16-6z"
              fill="none"
              stroke="rgba(96,165,250,0.85)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
          <g className="particles" opacity="0.9">
            <circle cx="160" cy="70" r="1.6" fill="#7c3aed" />
            <circle cx="35" cy="120" r="1.4" fill="#60a5fa" />
            <circle cx="120" cy="150" r="1.2" fill="#6ee7b7" />
            <circle cx="95" cy="35" r="1.8" fill="#7c3aed" />
          </g>
        </svg>
      </div>

      {/* foreground UI */}
      <div className="relative z-20">
        {/* Header */}
        <header className="app-header px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="logo-dot" aria-hidden />
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  Cognitive Canvas
                </h1>
                <span className="pulse-badge" aria-hidden>
                  <span className="pulse-dot" />
                  Prototype • Demo
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-300 mt-1 tagline">
                Built with React, Tailwind, and AI prototypes — open to
                internships & collaborations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Connection status indicator */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/30 border border-white/6">
              <span
                className={`h-2 w-2 rounded-full ${
                  status === "online" ? "bg-green-400" : status === "connecting" ? "bg-yellow-300 animate-pulse" : "bg-red-400"
                }`}
                aria-hidden
              />
              <span className="text-xs sm:text-sm text-gray-200">
                {status === "online" ? "Online" : status === "connecting" ? "Connecting…" : "Offline"}
              </span>
            </div>

            <button
              onClick={() => fetchList()}
              className="hidden sm:inline-flex px-3 py-1 rounded-lg bg-transparent border border-white/8 text-xs sm:text-sm text-gray-200 hover:bg-white/5 transition"
            >
              Refresh
            </button>

            <a
              href="https://github.com/shaman280306/CognitiveCanvas"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-block px-3 py-1 rounded-lg bg-transparent border border-white/8 text-xs sm:text-sm text-gray-200 hover:bg-white/5 transition"
            >
              View code
            </a>

            <button className="px-3 py-1 rounded-lg bg-transparent border border-white/6 text-xs sm:text-sm text-gray-200 hover:bg-white/3 transition">
              Sign in
            </button>
            <button className="px-3 py-1 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 text-white text-xs sm:text-sm shadow-lg hover:scale-105 transform transition">
              Try demo
            </button>
          </div>
        </header>

        {/* Main */}
        <main className="p-4 sm:p-6 lg:px-16 lg:py-10">
          <div className="max-w-5xl mx-auto">
            {/* view toggle + hint */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <p className="text-xs sm:text-sm text-gray-400">
                Capture thoughts as cards, then switch to{" "}
                <span className="font-semibold text-indigo-200">
                  Mind Map (beta)
                </span>{" "}
                to see the bigger picture.
              </p>
              <div className="inline-flex bg-black/30 border border-white/10 rounded-full p-1">
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-1 rounded-full text-xs sm:text-sm transition ${
                    viewMode === "list"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-gray-200 hover:bg-white/5"
                  }`}
                >
                  Cards
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("map")}
                  className={`px-3 py-1 rounded-full text-xs sm:text-sm transition ${
                    viewMode === "map"
                      ? "bg-indigo-500 text-white shadow-sm"
                      : "text-gray-200 hover:bg-white/5"
                  }`}
                >
                  Mind map (beta)
                </button>
              </div>
            </div>

            {/* input */}
            <div className="mb-8">
              {/* pass addThought which now syncs with server */}
              <ThoughtInput onAddThought={addThought} />
              {/* show offline badge if server unreachable */}
              {offlineMode && (
                <div className="mt-2 text-xs text-yellow-300">
                  Offline mode — changes are stored locally and will sync when server is reachable.
                </div>
              )}
            </div>

            {/* content area */}
            <section className="mt-6">
              {thoughts.length === 0 ? (
                <div className="intro-card p-6 sm:p-8 rounded-2xl">
                  <h2 className="text-2xl font-semibold">
                    Capture a thought — watch it glow.
                  </h2>
                  <p className="text-gray-300 mt-2">
                    Each idea becomes a card. We’ll use AI later to cluster and
                    visualize them into a living mind map.
                  </p>
                </div>
              ) : viewMode === "list" ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {thoughts.map((t, i) => (
                    <div
                      key={t._id}
                      className="card-appear"
                      style={{ animationDelay: `${i * 90}ms` }}
                    >
                      <ThoughtCard
                        thought={t}
                        onUpdate={handleUpdate}
                        onDelete={handleDelete}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                // mind map view
                <div className="mindmap-container">
                  {thoughts.map((t, i) => (
                    <div
                      key={t._id}
                      className={`mindmap-node mindmap-node-${(i % 6) + 1}`}
                    >
                      <p className="mindmap-text">{t.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      {/* footer */}
      <footer className="built-footer z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="text-xs sm:text-sm text-gray-300">
            Built with React • Tailwind • Node.js — Prototype demo
          </div>
          <div className="text-xs sm:text-sm text-gray-400">
            Open to internships & collaborations —{" "}
            <a
              href="mailto:shamansharma1@gmail.com"
              className="font-medium text-indigo-200 hover:underline"
            >
              shamansharma1@gmail.com
            </a>
          </div>
        </div>
      </footer>

      {/* Toast */}
      {toast && (
        <div className="fixed right-4 bottom-6 z-50">
          <div
            className={`px-4 py-2 rounded-md shadow-md ${
              toast.type === "success" ? "bg-green-600" : "bg-red-600"
            } text-white`}
          >
            {toast.msg}
          </div>
        </div>
      )}

      <div className="bottom-vignette pointer-events-none" />
    </div>
  );
}