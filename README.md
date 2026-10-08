# SkillSync - Peer Skill Exchange Platform

**SkillSync** is a full-stack web application designed for students and community members to exchange skills collaboratively (e.g., trading Python programming mentorship for UI/UX Figma design lessons).

---

## 🚀 Key Features

- **Authentication & Profiles:** Secure registration and login with bcrypt password hashing; comprehensive profile management for skills offered, skills wanted, proficiency levels, and availability schedules.
- **Explainable Skill Matching Engine:** Deterministic algorithm that computes mutual skill synergy, schedule alignment, and reciprocity scores (0–100%).
- **Interactive Discovery (Explore):** Multi-factor search across names, majors, and skills with category filtering and partner cards.
- **Exchange Proposal System:** Propose skill exchanges with custom introduction messages, automatic validation against self-requests, and duplicate prevention.
- **Request Management:** Dual-tab inbox to accept or decline received proposals, and track or cancel sent proposals.
- **Active Matches:** Real-time visibility into active exchange partnerships with partner contact details and exchanged skill sets.
- **Live Member Dashboard:** Real-time metrics overview, quick action shortcuts, pending proposal notifications, and top recommended skill partners.
- **Responsive Modern UI:** Polished interface adhering to the SkillSync indigo/emerald visual identity across desktop, tablet, and mobile.

---

## 🛠️ Technology Stack

- **Frontend:** React 19, Vite, React Router v7, Modern CSS Design System
- **Backend:** Node.js (ES Modules), Express.js
- **Database:** MongoDB Atlas via Mongoose ODM
- **Security:** bcryptjs password hashing, dual-header session verification, strict CORS policy

---

## 📁 Repository Structure

```
SkillSync/
├── backend/
│   ├── config/db.js              # MongoDB Atlas connection with DNS resolution
│   ├── controllers/              # Auth, User, Request, and Match controllers
│   ├── middleware/               # Auth verification middleware
│   ├── models/                   # User & ExchangeRequest Mongoose schemas
│   ├── routes/                   # RESTful API route definitions
│   ├── services/                 # Explainable skill matching engine
│   ├── test-registration.js      # Unit & schema test suite (25 assertions)
│   ├── test-suite.js             # Comprehensive backend test suite (43 assertions)
│   ├── test-e2e-scenario.js      # Live User A & User B end-to-end scenario
│   ├── server.js                 # Express server entry point
│   ├── .env                      # Environment configuration (ignored in git)
│   ├── .env.example              # Sample environment template
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/           # Navbar, Footer, Icons, ProtectedRoute
│   │   ├── context/              # Centralized SkillSyncContext (session & auth)
│   │   ├── pages/                # Home, Login, Register, Dashboard, Profile,
│   │   │                         # Explore, PartnerProfile, Request, Requests, Matches
│   │   ├── services/api.js       # Centralized API service client
│   │   ├── App.jsx               # Router & route configuration
│   │   └── App.css               # Design system & responsive styles
│   ├── vite.config.js            # Vite configuration with /api proxy
│   └── package.json
│
├── docs/                         # Detailed architecture, API, and matching docs
│   ├── ARCHITECTURE.md
│   ├── API_DOCUMENTATION.md
│   ├── MATCHING_ALGORITHM.md
│   ├── USER_WORKFLOW.md
│   └── TESTING_REPORT.md
│
├── .gitignore
└── README.md
```

---

## ⚙️ Prerequisites

- **Node.js** v18+ (tested on Node.js v20+)
- **npm** v9+
- An active **MongoDB Atlas** database connection string (or local MongoDB daemon)

---

## 🔧 Environment Configuration

1. In `backend/`, copy `.env.example` to `.env`:
   ```powershell
   cd D:\cluster\SkillSync\backend
   Copy-Item .env.example .env
   ```
2. Configure `.env` with your settings:
   ```env
   PORT=5000
   CLIENT_URL=http://localhost:5173
   FRONTEND_URL=http://localhost:5173
   NODE_ENV=development
   MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/skillsync?retryWrites=true&w=majority
   ```

---

## 💻 Installation & Running the Application

### 1. Backend Setup & Startup

Open a PowerShell terminal:
```powershell
# Navigate to backend directory
cd D:\cluster\SkillSync\backend

# Install dependencies (if not already installed)
npm install

# Start the backend server
npm start
```
*The server will start on `http://localhost:5000` and establish a live connection to MongoDB Atlas.*

### 2. Frontend Setup & Startup

Open a second PowerShell terminal:
```powershell
# Navigate to frontend directory
cd D:\cluster\SkillSync\frontend

# Install dependencies (if not already installed)
npm install

# Start Vite development server
npm run dev
```
*The client application will be accessible at `http://localhost:5173`.*

---

## 🧪 Running Automated Tests

SkillSync includes comprehensive test suites testing all operations against MongoDB Atlas.

Open a PowerShell terminal in `backend/`:

```powershell
cd D:\cluster\SkillSync\backend

# Run the 43-point core test suite
npm test

# Run the registration & schema unit tests
node test-registration.js

# Run the live User A & User B End-to-End demonstration scenario
npm run test:scenario

# Run all test suites in sequence
npm run test:all
```

### Production Build Verification
To verify the frontend production build:
```powershell
cd D:\cluster\SkillSync\frontend
npm run build
```

---

## 🔌 API Overview

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user account | Public |
| `POST` | `/api/auth/login` | Log into existing user account | Public |
| `GET` | `/api/users` | Explore users with search & filters | Public / Optional Auth |
| `GET` | `/api/users/:id` | View detailed skill partner profile | Public / Optional Auth |
| `GET` | `/api/users/profile` | Retrieve authenticated user profile | Private |
| `PUT` | `/api/users/profile` | Update profile, bio, skills, and schedule | Private |
| `POST` | `/api/requests` | Propose a skill exchange to a peer | Private |
| `GET` | `/api/requests` | Retrieve sent and received requests | Private |
| `PUT` | `/api/requests/:id/accept` | Accept an incoming exchange proposal | Private |
| `PUT` | `/api/requests/:id/reject` | Decline an incoming exchange proposal | Private |
| `PUT` | `/api/requests/:id/cancel` | Cancel a pending sent proposal | Private |
| `GET` | `/api/matches` | View active confirmed exchanges | Private |
| `GET` | `/api/matches/recommendations` | Get partners ranked by match score | Private |

---

## 🧠 Explainable Matching Algorithm

Compatibility scores are computed deterministically out of 100%:
- **40 points:** You offer a skill the partner wants.
- **40 points:** The partner offers a skill you want.
- **10 points:** Mutual trade bonus (both directions match).
- **10 points:** Overlapping availability schedules (e.g. weekends, evenings).

For full formula details and mathematical proofs, see [docs/MATCHING_ALGORITHM.md](file:///D:/cluster/SkillSync/docs/MATCHING_ALGORITHM.md).

---

## 🎓 College Demonstration Walkthrough

1. **User A Registration:** Register an account (e.g., *Aarav Patel*). Go to **My Profile** \(\to\) **Edit Profile**, add skills offered (*Python*, *Machine Learning*) and skills wanted (*React*).
2. **User B Registration:** In an incognito window or after logging out, register a second account (e.g., *Priya Sharma*). Add skills offered (*React*, *UI/UX Design*) and skills wanted (*Python*).
3. **Explore & Match Score:** User A navigates to **Explore Skills** and searches for *"React"*. Priya appears ranked at the top with a **100% Compatibility Match**.
4. **Send Exchange Request:** User A clicks **"Request Exchange"**, selects Python as the offered skill and React as the requested skill, and submits a proposal.
5. **Accept Proposal:** User B logs in, visits the **Requests** tab, sees User A's proposal under **Received Requests**, and clicks **"Accept Exchange"**.
6. **Active Exchange:** Both users navigate to **Matches** and see the active exchange partnership with mutual skills and contact information!
