# SkillSync System Architecture Specification

## 1. High-Level Architecture

SkillSync is an enterprise-grade peer-to-peer Skill Exchange Platform designed for collaborative learning, verified skill sharing, and structured mentorship. The application is built upon a modern decoupled Client-Server architecture with strict separation of concerns, deterministic business rules, and isolated evaluation pipelines.

```
┌─────────────────────────────────────────────────────────────────┐
│                 Client Layer: React 19 + Vite                   │
│  - SPA Routing via React Router v7                              │
│  - Reactive Global Session & State Context                      │
│  - Verification Quiz & Practical Code Challenge Runner          │
│  - Real-Time In-App Notification Polling & Message Stream       │
│  - Responsive Indigo/Emerald Design System                      │
└───────────────────────────────┬─────────────────────────────────┘
                                │ HTTP REST / JSON
                                │ Authorization: Bearer <id> / x-user-id
┌───────────────────────────────▼─────────────────────────────────┐
│              Application Backend: Node.js / Express             │
│  - ESM Modular Routing Pipeline                                 │
│  - Security & Rate-Limiting Middleware                          │
│  - Role-Based Access Control (requireAuth, requireAdmin)        │
│  - Controllers: Auth, Users, Requests, Matches, Assessments,   │
│    Sessions, Reviews, Learning, AI, Communication, Admin        │
│  - Safe Sandboxed Code Runner (VM / Subprocess Execution)       │
│  - Explainable 5-Factor Deterministic Compatibility Engine      │
│  - Resilient Zero-Dependency Fallback AI Service                │
└───────────────────────────────┬─────────────────────────────────┘
                                │ Mongoose ODM
                                │ SSL Connection
┌───────────────────────────────▼─────────────────────────────────┐
│                 Persistence Layer: MongoDB Atlas                │
│  - Indexed collections: users, exchangerequests, assessments,   │
│    assessmentattempts, exchangesessions, reviews, learninggoals,│
│    messages, notifications, reports                             │
│  - Atomic updates and validation rules                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Subsystems

### 2.1 Skill Verification & Code Evaluation Subsystem
- **MCQ Assessment Engine:** Fetches skill-specific questions tailored to claimed proficiency levels (`Basic`, `Intermediate`, `Advanced`). Evaluates candidate responses server-side to prevent client tampering. Imforces a 3-attempts-per-24-hour limit.
- **Isolated Code Runner (`services/codeRunnerService.js`):**
  - Evaluates user submissions for Python, Java, and JavaScript challenges against public and hidden test cases.
  - Enforces blacklisted system primitives (disallowing `process`, `child_process`, `fs`, `os`, `eval`, `Runtime`, socket calls).
  - Imposes strict 2000ms wall-clock execution deadlines to prevent infinite loops or denial-of-service.
- **Verification Hierarchy:**
  - `SELF_DECLARED`: Default tier upon profile declaration.
  - `ASSESSMENT_PASSED`: Awarded upon achieving >= 60% on MCQ evaluation.
  - `SKILL_VERIFIED`: Awarded upon completing >= 80% test cases on practical coding challenges.

### 2.2 Explainable 5-Factor Compatibility Engine (`services/matchingService.js`)
Instead of opaque black-box recommendations, the platform calculates deterministic compatibility (0–100%) through weighted vectors:
1. **Skill Compatibility (35%):** Bidirectional exact and partial token overlap between offered and wanted skills.
2. **Verified Proficiency (25%):** Algorithmic bonus awarded when a partner has earned `SKILL_VERIFIED` or `ASSESSMENT_PASSED` status.
3. **Learning Preference Compatibility (15%):** Mentor level vs. learner target level synergy.
4. **Availability Alignment (10%):** Keyword tokenizer matching weekday/weekend and time slots.
5. **Community Reputation & Feedback (15%):** Trust score derived from verified learner reviews.

Each match produces human-readable explanations (e.g. *"You can teach Bob Python"*, *"Their Java proficiency is verified"*).

### 2.3 Exchange Lifecycle & Session Scheduling
Requests follow a strict state transition machine:
```
[PENDING] ──► [REJECTED] / [CANCELLED]
    │
    ▼ (Accepted by Receiver)
[ACCEPTED]
    ├──► Schedule Sessions (Date, Time, Duration, Meet Link)
    ├──► Peer Messaging & Coordination
    ▼ (Both participants click "Confirm Completion")
[COMPLETED]
    └──► Unlocks 1-5 Star Review and Feedback Rating
```

### 2.4 Trust, Reputation & Badging Pipeline
- Reviews require active participation in a completed exchange; duplicate reviews are prevented by a compound unique index.
- Trust scores dynamically recompute based on average review ratings and exchange milestones.
- Earnable Badges: `Verified Teacher`, `Reliable Partner`, `Top Rated`.

### 2.5 Resilient AI Architecture
- Provides automated learning roadmaps, skill gap analysis, complementary skill recommendations, and pedagogical assistance.
- **Zero-Dependency Fallback:** If external LLM API keys are absent, built-in deterministic curriculum matrices and rule engines generate instant, accurate responses without platform degradation.
- Verification badges and assessment scores remain authoritative and cannot be awarded directly by AI.

---

## 3. Security & Access Boundaries

1. **Authentication:** Headers-based session authorization (`x-user-id` and `Authorization: Bearer <userId>`) verified against MongoDB user documents.
2. **Authorization Guards:**
   - Users can only modify their own profile data, requests, and milestones.
   - Non-admin users are strictly blocked from elevating their role to `Admin`, modifying `isAdmin`, updating `verification` flags directly, or altering assessment scores.
   - Admin routes are protected by `requireAdmin` middleware.
3. **Data Sanitization:** Passwords encrypted using bcrypt (10 rounds); password hashes excluded from API serialization via `toJSON()` overrides.
