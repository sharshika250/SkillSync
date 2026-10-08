# SkillSync System Architecture & Reverse-Engineering Overview

SkillSync is a full-stack peer-to-peer Skill Exchange Platform created for students and community members to teach and learn skills collaboratively.

---

## 1. High-Level Architecture

The platform follows a modern decoupled Client-Server architecture:

```
┌────────────────────────────────────────────────────────┐
│                   Frontend (React 19)                  │
│  - Vite Bundler & Dev Server (Port 5173)               │
│  - React Router v7 Navigation & Protected Routes       │
│  - Centralized SkillSyncContext & State Management     │
│  - Modular API Service Client (src/services/api.js)   │
└───────────────────────────┬────────────────────────────┘
                            │
               HTTP JSON via Vite Proxy / CORS
                            │
┌───────────────────────────▼────────────────────────────┐
│                  Backend (Express.js)                  │
│  - Node.js ESM Architecture (Port 5000)                │
│  - Authentication & Session Verification Middleware    │
│  - Controllers: Auth, Users, Requests, Matches         │
│  - Deterministic Skill Matching Service Engine        │
│  - Robust CORS Configuration with Allowed Origins      │
└───────────────────────────┬────────────────────────────┘
                            │
                   Mongoose ODM Driver
                            │
┌───────────────────────────▼────────────────────────────┐
│                 Database (MongoDB Atlas)               │
│  - Users Collection (with password hashing & indexing) │
│  - ExchangeRequests Collection (with status tracking)  │
└────────────────────────────────────────────────────────┘
```

---

## 2. Reverse-Engineered Foundation & Enhancements

### Original State
- **Backend:** Basic Express scaffolding with `User` model, user registration, and login. No request handling, no user discovery, no match calculation, and no update capabilities.
- **Frontend:** Static UI views referencing placeholder mock data (`mockData.js`). The logged-in user state fell back to hardcoded "Jane Doe". Buttons such as "Edit Profile", "View Profile", and "Send Request" were disconnected or non-functional.

### Completed & Added System Components
1. **User Model Harmonization:**
   - Extended `User` model to support `role`, `location`, `bio`, `skillsOffered`, `skillsWanted`, `proficiency` (per-skill Map/Object support), `availability`, `verification`, and `trustScore`.
   - Guaranteed that passwords are never returned across any response through Mongoose schema `toJSON` transforms.

2. **Exchange Request Subsystem:**
   - Designed `ExchangeRequest` Mongoose schema with `sender`, `receiver`, `offeredSkill`, `requestedSkill`, `message`, `matchScore`, and `status` (`pending`, `accepted`, `rejected`, `cancelled`).
   - Implemented compound database indexes for high-speed queries on user inboxes and sent items.

3. **Explainable Skill Matching Service:**
   - Deterministic matching engine (`backend/services/matchingService.js`) evaluating mutual complementarity between User A's offered skills and User B's desired skills, with schedule compatibility scoring.

4. **Full CRUD & Exchange Workflow:**
   - Profile update with validation and state persistence without browser refresh.
   - User exploration with multi-field search and category filtering.
   - Interactive proposal sending, inbox management, proposal acceptance/rejection, and active match tracking.

5. **Security & Session Layer:**
   - Dual-header authentication verification (`x-user-id` and `Authorization: Bearer <userId>`).
   - Protected routes in frontend redirecting unauthenticated visitors to login.
   - Clean logout functionality clearing session cache.
   - Strict CORS policy allowing `http://localhost:5173`.

---

## 3. Directory Structure

```
SkillSync/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection using Mongoose & DNS setup
│   ├── controllers/
│   │   ├── authController.js     # Register & Login controllers
│   │   ├── userController.js     # Explore users, partner profiles, profile updates
│   │   ├── requestController.js  # Exchange request CRUD, status updates
│   │   └── matchController.js    # Active matches and AI recommendations
│   ├── middleware/
│   │   └── authMiddleware.js     # Protected route authentication validation
│   ├── models/
│   │   ├── User.js               # User schema with bcrypt password hashing
│   │   └── ExchangeRequest.js    # Exchange request schema with status enum
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth routes
│   │   ├── userRoutes.js         # /api/users routes
│   │   ├── requestRoutes.js      # /api/requests routes
│   │   └── matchRoutes.js        # /api/matches routes
│   ├── services/
│   │   └── matchingService.js    # Explainable skill matching engine
│   ├── test-registration.js      # Baseline auth verification
│   ├── test-suite.js             # 43-point comprehensive backend test suite
│   ├── test-e2e-scenario.js      # Full User A & User B live demonstration
│   ├── server.js                 # Express application entry point
│   ├── .env                      # Environment configuration (ignored by git)
│   ├── .env.example              # Sample environment template
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── assets/               # SVG & image assets
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Dynamic responsive navbar with user avatar & logout
│   │   │   ├── Footer.jsx        # Application footer
│   │   │   ├── Icons.jsx         # SVG icon library
│   │   │   └── ProtectedRoute.jsx# Auth route guard
│   │   ├── context/
│   │   │   └── SkillSyncContext.jsx # Centralized auth & session context
│   │   ├── pages/
│   │   │   ├── Home.jsx          # Public landing page with interactive workflow
│   │   │   ├── Login.jsx         # Authentication login with inline validation
│   │   │   ├── Register.jsx      # User registration form
│   │   │   ├── Dashboard.jsx     # Authenticated member dashboard with metrics
│   │   │   ├── Profile.jsx       # Interactive profile & skills management
│   │   │   ├── Explore.jsx       # Real-time MongoDB user discovery & filters
│   │   │   ├── PartnerProfile.jsx# Detailed peer profile view
│   │   │   ├── Request.jsx       # Exchange proposal creation form
│   │   │   ├── Requests.jsx      # Received & Sent request management hub
│   │   │   └── Matches.jsx       # Active exchange relationships & recommendations
│   │   ├── services/
│   │   │   └── api.js            # Centralized API service client
│   │   ├── data/
│   │   │   └── mockData.js       # Preserved prototype data reference
│   │   ├── App.jsx               # Route definitions
│   │   ├── App.css               # Design system & responsive layout styles
│   │   ├── index.css
│   │   └── main.jsx
│   ├── vite.config.js            # Vite build configuration with /api proxy
│   └── package.json
│
├── docs/
│   ├── ARCHITECTURE.md           # This document
│   ├── API_DOCUMENTATION.md      # Complete REST API specifications
│   ├── MATCHING_ALGORITHM.md     # Matching algorithm details
│   ├── USER_WORKFLOW.md          # User journey documentation
│   └── TESTING_REPORT.md         # Full testing summary
│
├── .gitignore                    # Git exclusions (.env, node_modules, dist)
└── README.md                     # Main project guide
```
