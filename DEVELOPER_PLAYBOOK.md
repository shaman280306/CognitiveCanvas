# Cognitive Canvas — Developer Playbook (snapshot)

Project root: C:\Projects\CognitiveCanvas
Frontend: client (Vite + React) -> dev URL: http://localhost:5173 (or 5174/517X if used)
Backend: server (Node/Express + Mongoose) -> port: 3000 (server.js)
MongoDB: Atlas or local (MONGO_URI in server/.env, DO NOT COMMIT secrets)
GitHub repo: https://github.com/shaman280306/CognitiveCanvas

What is DONE:
- React + Vite client with Tailwind UI (client/src/App.jsx and components)
- Node backend server.js with CRUD for /api/thoughts
- Local dev verified: client runs on 5173, server on 3000; offline cache in localStorage works
- .gitignore and .env.example present; .env (with secrets) is local only

Important files (path from project root):
- client/src/App.jsx
- client/src/components/ThoughtInput.jsx
- client/src/components/ThoughtCard.jsx
- client/src/components/* (other UI components)
- client/index.css, client/tailwind.config.js, client/postcss.config.js
- server/server.js
- server/package.json
- .env.example (in root)

How to run locally:
1) Start backend:
   cd C:\Projects\CognitiveCanvas\server
   npm install
   node server.js   (or npm run dev if using nodemon)

2) Start frontend:
   cd C:\Projects\CognitiveCanvas\client
   npm install
   npm run dev
   open http://localhost:5173

Key credentials:
- DO NOT paste MONGO_URI or passwords into any chat. Keep those in server/.env.

Short-term next steps (priority order):
1. Make persistence robust (MongoDB Atlas + confirm server routes).
2. Add Auth (Firebase quick path) so thoughts map to users.
3. Implement offline-to-server sync for client-only items (cid-... optimistic ids).
4. Mind-map POC (use React Flow or react-draggable).
5. Add embeddings & clustering (server /api/embed) using OpenAI or similar.

When switching to a new chat, paste the header + this file content (or the first 8 lines + link to repo) to restore context quickly.
