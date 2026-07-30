// Central API base URL
// Dev: Vite proxy (/api → http://127.0.0.1:8000) — no CORS issues locally
// Production (Vercel): VITE_API_URL env var points to Render backend URL
const API = import.meta.env.VITE_API_URL || "/api";

export default API;
