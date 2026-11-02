# SkillSync Production Deployment Guide

This guide details the deployment procedure for SkillSync to cloud environments (e.g., Vercel for frontend, Render/Railway/Heroku/AWS for backend, and MongoDB Atlas for database).

---

## 1. Environment Configurations

### Backend Environment Variables (`backend/.env`):
```env
PORT=5000
NODE_ENV=production
CLIENT_URL=https://skill-sync-five-rho.vercel.app
FRONTEND_URL=https://skill-sync-five-rho.vercel.app
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.dxfgcgh.mongodb.net/skillsync?retryWrites=true&w=majority

# Optional: External AI Provider (SkillSync includes automated zero-dependency fallback)
GEMINI_API_KEY=
OPENAI_API_KEY=
```

### Frontend Environment Variables (`frontend/.env`):
```env
VITE_API_URL=https://your-backend-domain.com
```

---

## 2. Backend Deployment Checklist

1. **DNS Resolution Configuration:**
   SkillSync includes built-in fallback DNS resolution (`dns.setServers(["1.1.1.1", "8.8.8.8"])`) in `server.js` to ensure reliable Atlas SRV lookups on restrictive cloud hosts.
2. **CORS Policy:**
   `server.js` automatically permits requests from `FRONTEND_URL`, localhost development ports, and any `*.vercel.app` preview or production deployment.
3. **Database Pre-Seeding:**
   On startup, `server.js` automatically executes `seedAssessmentQuestions()` to seed question banks for Python, Java, React, JavaScript, Data Science, and UI/UX Design if the database is unpopulated.
4. **Isolated Code Runner:**
   Subprocess execution in `services/codeRunnerService.js` safely operates in standard Linux containers (Render, Railway, Ubuntu EC2, or Docker). If `python` or `javac` is not installed on the server container, the fallback structural evaluator handles submissions safely without throwing fatal errors.

---

## 3. Frontend Deployment (Vercel)

1. Connect repository root or set root directory to `frontend/`.
2. Framework preset: **Vite**.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Environment variables:
   - `VITE_API_URL`: Backend API URL (e.g. `https://skillsync-api.onrender.com`).
6. Configure SPA client routing rewrite in `frontend/vercel.json`:
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```

---

## 4. Verification Post-Deployment

Run the following smoke tests:
1. `GET /api/health` -> Returns `{ "success": true, "message": "SkillSync backend is running" }`.
2. Register a new test user and log in.
3. Visit `/assessments`, select Python, and submit an MCQ assessment. Check that the badge updates to `ASSESSMENT_PASSED`.
4. Run a practical coding challenge in the sandbox. Check that the badge updates to `SKILL_VERIFIED`.
5. Visit `/explore` to test category filters, synergy sorting, and proposing an exchange.
6. Test session scheduling on an accepted exchange in `/matches`.
