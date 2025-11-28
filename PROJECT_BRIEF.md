# Cognitive Canvas — Project Brief

**Status:** Prototype / Demo  
**Author:** Shaman Sharma  
**Contact:** shamansharma1@gmail.com

---

## Elevator pitch
Cognitive Canvas is an AI-driven thought-mapping web app that turns quick user ideas into organized, expandable thought-cards and a visual mind-map. The prototype demonstrates fast capture, polished UX, and a mind-map proof-of-concept — the next steps are persistence, semantic clustering, and AI-driven expansion.

---

## Problem we solve
People collect fragmented notes and ideas across apps, then lose context and discoverability. Cognitive Canvas offers a fast capture surface, structured cards, and visual clustering so ideas can be surfaced, expanded, and acted upon.

---

## Key features (prototype)
- Fast thought capture — single-line input, Enter to save.
- Card list with edit & delete actions.
- Recruiter-friendly UI with animations and polished visual layers.
- Mind-map (beta) view — visual POC showing thoughts as orbital nodes.
- Persistence in-browser (localStorage) for the prototype (planned migration to backend).
- Deployed publicly on Vercel for easy sharing and interview demos.

---

## UX / Interaction notes
- Input: placeholder text + quick tip (Enter to save, Esc to clear).
- Cards: timestamped, editable inline, delete confirmation.
- Two view modes: **Cards** and **Mind Map (beta)** to show both list-first and visual-first mental models.
- Header contains badge + short tagline to signal product readiness and interest in internships/collabs.
- Footer contains contact + quick copy-to-mailto behavior.

---

## Technical stack
- Frontend: React (Vite) + Tailwind CSS + PostCSS  
- Backend skeleton: Node.js (server folder exists; endpoints to be added)  
- Dev & Deploy: GitHub (repo), Vercel (frontend hosting)  
- Local persistence: `localStorage` (prototype); planned: Express + MongoDB

---

## File overview (important files)
- `client/` — Vite + React frontend code (UI + styles)
  - `client/src/App.jsx` — main UI + mind-map POC
  - `client/src/components/ThoughtInput.jsx` — input component
  - `client/src/components/ThoughtCard.jsx` — card display + edit/delete
  - `client/src/index.css` — Tailwind + custom styles
- `server/` — backend skeleton
- `Web Project.docx` — original project brief (this document)
- `PROJECT_BRIEF.md` — Markdown version (this file)

---

## Short-term roadmap (1–2 weeks)
1. Persist thoughts to backend
   - Add Express endpoints: `POST /api/thoughts`, `GET /api/thoughts`, `PUT /api/thoughts/:id`, `DELETE /api/thoughts/:id`
   - Migrate localStorage sync to API + MongoDB (Mongoose)
2. AI Integration (prototype)
   - Add embedding endpoint and clustering job (`/api/embed`, `/api/suggest`)
   - Showcase “expand thought to 150 words” LLM demo
3. Mind-map improvements
   - Draggable nodes (React Flow or SVG + drag helpers)
   - Zoom / pan and link visualization between related nodes
4. Polish UX & accessibility
   - Mobile responsiveness tweaks
   - Keyboard accessibility (focus + Escape handling)
   - Micro-interactions and onboarding modal

---

## Mid / Long-term (high-impact)
- Google-level features: multi-user collaboration (Socket.io), knowledge graph (Neo4j), offline PWA & sync, analytics dashboard (engagement heatmaps).
- Production plan: Auth (Google OAuth), MongoDB Atlas, CI/CD, custom domain and professional email.

---

## How to run locally (developer)
```bash
# frontend
cd client
npm install
npm run dev
# open http://localhost:5173

# backend (when implemented)
cd server
npm install
node server.js
