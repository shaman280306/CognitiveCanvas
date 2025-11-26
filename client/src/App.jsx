// client/src/App.jsx
import "./index.css";
import React, { useState } from "react";
import ThoughtInput from "./components/ThoughtInput";
import ThoughtCard from "./components/ThoughtCard";

export default function App() {
  // recruiter-friendly demo thoughts (product thinking + metrics + tech)
  const [thoughts, setThoughts] = useState([
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
  ]);

  const addThought = (text) => {
    const newThought = {
      _id: Date.now().toString(),
      text,
      createdAt: new Date().toISOString(),
    };
    setThoughts((prev) => [newThought, ...prev]);
  };

  const handleUpdate = (id, newText) => {
    setThoughts((prev) => prev.map(t => (t._id === id ? { ...t, text: newText } : t)));
  };

  const handleDelete = (id) => {
    setThoughts((prev) => prev.filter(t => t._id !== id));
  };

  return (
    <div className="app-root min-h-screen relative overflow-hidden bg-[#060718] text-white">
      <div className="holo-wrap pointer-events-none">
        <div className="holo-rings" />
        {/* brain SVG kept as decorative background */}
        <svg className="brain-svg" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid meet" aria-hidden>
          <defs>
            <linearGradient id="g1" x1="0" x2="1">
              <stop offset="0%" stopColor="#6ee7b7" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.85" />
            </linearGradient>
            <filter id="blurGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <g filter="url(#blurGlow)">
            <path d="M60 40c-8 0-18 6-20 18-2 12 4 20 4 20s-10 8-6 22c4 14 18 18 26 18h44c8 0 22-6 26-18 4-12-6-22-6-22s6-8 4-20c-2-12-14-18-22-18-9 0-14 6-22 8-8-2-12-8-22-8z" fill="url(#g1)" opacity="0.16" />
            <path d="M64 48c-6 0-14 5-16 14-1 9 3 16 3 16s-8 6-5 16c3 10 14 14 20 14h36c6 0 18-5 20-14 2-9-5-16-5-16s5-6 4-16c-1-9-10-14-16-14-6 0-10 4-16 6-6-2-9-6-16-6z" fill="none" stroke="rgba(96,165,250,0.85)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </g>
          <g className="particles" opacity="0.9">
            <circle cx="160" cy="70" r="1.6" fill="#7c3aed" />
            <circle cx="35" cy="120" r="1.4" fill="#60a5fa" />
            <circle cx="120" cy="150" r="1.2" fill="#6ee7b7" />
            <circle cx="95" cy="35" r="1.8" fill="#7c3aed" />
          </g>
        </svg>
      </div>

      <div className="relative z-20">
        {/* Header with tagline + pulse badge */}
        <header className="app-header px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="logo-dot" aria-hidden />
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-4xl font-extrabold tracking-tight">Cognitive Canvas</h1>
                  <span className="pulse-badge" aria-hidden>
                    <span className="pulse-dot" />
                    Prototype • Demo
                  </span>
                </div>
                <p className="text-sm text-gray-300 mt-1 tagline">
                  Built with React, Tailwind, and AI prototypes — open to internships & collaborations
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="px-3 py-1 rounded-lg bg-transparent border border-white/6 text-sm text-gray-200 hover:bg-white/3 transition">Sign in</button>
            <button className="px-3 py-1 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 text-white text-sm shadow-lg hover:scale-105 transform transition">Try demo</button>
          </div>
        </header>

        <main className="p-8 lg:px-16 lg:py-10">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <ThoughtInput onAddThought={addThought} />
            </div>

            <section className="mt-6">
              {thoughts.length === 0 ? (
                <div className="intro-card p-8 rounded-2xl">
                  <h2 className="text-2xl font-semibold">Capture a thought — watch it glow.</h2>
                  <p className="text-gray-300 mt-2">Each idea becomes a card. We'll use AI later to cluster and visualize them.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {thoughts.map((t, i) => (
                    <div
                      key={t._id}
                      className="card-appear"
                      style={{ animationDelay: `${i * 90}ms` }}
                    >
                      <ThoughtCard key={t._id} thought={t} onUpdate={handleUpdate} onDelete={handleDelete} />
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
        <div className="max-w-5xl mx-auto px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="text-sm text-gray-300">Built with React • Tailwind • Node.js — Prototype demo</div>
          <div className="text-sm text-gray-400">Open to internships & collaborations — <span className="font-medium text-indigo-200">shamansharma1@gmail.com</span></div>
        </div>
      </footer>

      <div className="bottom-vignette pointer-events-none" />
    </div>
  );
}