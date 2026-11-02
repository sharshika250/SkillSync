# SkillSync Project Demonstration Guide & Defense Handbook

**Project Title:** SkillSync – Peer Skill Exchange Platform
**Academic Program:** Computer Science & Engineering (Reverse Engineering & Full-Stack Systems Enhancement)
**Deployment URL:** [https://skill-sync-five-rho.vercel.app](https://skill-sync-five-rho.vercel.app)
**Repository:** `https://github.com/sharshika250/SkillSync.git`
**Audience:** Academic Review Board, External Examiners, Project Evaluators

---

## 1. Project Introduction & Problem Statement

### 1.1 Context
In academic and collegiate environments, students often possess complementary skills: a Computer Science student may excel in Python and distributed systems but seek proficiency in UI/UX design, while a Design student may desire mentoring in web application development. Traditional commercial tutoring platforms demand monetary compensation, creating an economic barrier for students.

### 1.2 Problem Statement
Existing skill-sharing environments suffer from four critical deficiencies:
1. **Unverified Claims:** Users can self-declare mastery in complex domains without demonstrative validation.
2. **Naive Keyword Matching:** Primitive query systems fail to measure bidirectional compatibility, reciprocal availability, or proficiency level harmony.
3. **Absence of Accountability:** Lack of mutual completion confirmation enables unilateral fraud and arbitrary reputation inflation.
4. **Disjointed Learning:** Absence of progress tracking, structured milestones, and personalized gap analysis leaves learners without guidance between sessions.

---

## 2. Proposed System & Objectives

### 2.1 Proposed System
SkillSync is an intelligent peer skill exchange platform engineered to facilitate verified, reciprocal, trust-based knowledge trading. By pairing a 3-tier skill verification engine with an explainable 5-factor synergy algorithm and dual completion confirmation, SkillSync establishes an academically sound, secure, and engaging learning ecosystem.

### 2.2 Core Objectives
* **Demonstrated Credentialing:** Establish a server-side verified assessment engine with timed MCQs and sandboxed test-case evaluation.
* **Explainable Matching:** Design a transparent compatibility algorithm that quantifies mutual benefit, skill gaps, and availability overlap.
* **Integrity & Trust:** Guarantee peer review validity through dual confirmation and tamper-resistant trust scoring.
* **Pedagogical Continuity:** Provide customized learning roadmaps, interactive milestones, and resilient AI-assisted guidance.
* **Cohesive Visual Elegance:** Deliver a minimalist soft pastel pink aesthetic adhering to high standards of modern UI/UX design.

---

## 3. Technology Stack & Architectural Overview

```
   ┌───────────────────────────────────────────────────────────────┐
   │                 Client Tier (React + Vite SPA)                │
   │  - Plus Jakarta Sans & DM Sans Typography                     │
   │  - Minimalist Pastel Pink Aesthetic (#FFFBFA, #D99AAA)        │
   │  - Context API State Management & Axios HTTP Abstraction     │
   └──────────────────────────────┬────────────────────────────────┘
                                  │ HTTPS / REST (JSON)
   ┌──────────────────────────────▼────────────────────────────────┐
   │                Application Tier (Express & Node.js)           │
   │  - JWT Bearer Authentication & Role-Based Access Control      │
   │  - Explainable 5-Factor Synergy Matching Service             │
   │  - Sandboxed Code Evaluator (AST Pattern / Isolation Gate)    │
   │  - Dynamic Question Seeder & Deterministic AI Engine          │
   └──────────────────────────────┬────────────────────────────────┘
                                  │ Mongoose ODM (TLS / TCP)
   ┌──────────────────────────────▼────────────────────────────────┐
   │             Persistence Tier (MongoDB Atlas Sharded)          │
   │  - Indexed Collections: Users, Assessments, Requests, Reviews │
   │  - Sessions, LearningGoals, Messages, Notifications, Reports  │
   └───────────────────────────────────────────────────────────────┘
```

### 3.1 Technology Stack Matrix
* **Frontend:** React 18, Vite 8, React Router DOM 6, Custom SVG Icons, Vanilla CSS Design System.
* **Backend:** Node.js (v18+), Express.js (v4), ES Modules.
* **Database:** MongoDB Atlas (Cloud Database), Mongoose ODM (v9).
* **Security & Auth:** bcryptjs (password hashing with 10 salt rounds), JWT Bearer Tokens, Custom Role Guard Middleware (`requireAdmin`).

---

## 4. Key Algorithms & Systems Engineering

### 4.1 Explainable 5-Factor Synergy Algorithm
The compatibility engine evaluates two candidate profiles across five orthogonal dimensions:

$$\text{Synergy Score} = S_{\text{reciprocity}} + S_{\text{proficiency}} + S_{\text{verification}} + S_{\text{schedule}} + S_{\text{reputation}}$$

1. **Direct Bidirectional Reciprocity ($S_{\text{reciprocity}} \le 40$ pts):**
   Evaluates whether User A offers what User B wants AND User B offers what User A wants ($40$ pts for full mutual exchange; $20$ pts for single-direction match).
2. **Proficiency Harmony ($S_{\text{proficiency}} \le 20$ pts):**
   Calculates the gap between the teacher's demonstrated mastery and the student's current proficiency level. Mentor-apprentice pairings receive maximum weighting.
3. **Verification Standing Bonus ($S_{\text{verification}} \le 15$ pts):**
   Awards bonus weighting when either participant has demonstrated competence via `SKILL_VERIFIED` ($15$ pts) or `ASSESSMENT_PASSED` ($10$ pts).
4. **Availability & Schedule Alignment ($S_{\text{schedule}} \le 15$ pts):**
   Computes keyword and temporal overlap across declared schedules (e.g., "Weekday evenings", "Weekends").
5. **Trust Score & Historical Ratings ($S_{\text{reputation}} \le 10$ pts):**
   Integrates historical exchange completion rates, absence of moderation reports, and 5-star ratings.

### 4.2 3-Tier Skill Verification Architecture
* **Tier 1: `SELF_DECLARED`:** Initial status upon profile declaration.
* **Tier 2: `ASSESSMENT_PASSED`:** Conferred when an applicant achieves $\ge 60\%$ on a skill-specific MCQ assessment administered with server-side validation and anti-spam attempt limits (maximum 3 attempts per 24 hours).
* **Tier 3: `SKILL_VERIFIED`:** Highest credential tier, conferred upon passing $\ge 80\%$ of automated test cases on a practical coding challenge.

### 4.3 Code Execution Sandbox Security Architecture
* **Vulnerability Assessment of `node:vm`:** Node.js `vm` is not a cryptographic isolation boundary; keyword filters and frozen prototypes can be compromised by advanced prototype traversal.
* **Production Security Policy:** SkillSync strictly blocks arbitrary code execution in the main Express backend process during production.
* **Static Signature Verification:** In production mode, submissions are evaluated through deterministic structural AST analysis, verifying function declarations (`solution`), argument parsing, return types, and algorithmic completeness.
* **Isolated Environment Mode:** If external containerized clusters (e.g., Docker/gVisor microVMs) are connected via `ENABLE_HOST_CODE_EXECUTION=true`, execution is dispatched to isolated ephemeral sandboxes with 2000ms timeouts.

---

## 5. Live Demonstration Sequence (Step-by-Step for Examiners)

Follow this structured 8-step sequence during your project demonstration:

```
[1. Landing & Architecture] ──> [2. Registration & Auth] ──> [3. Skill Profile Setup]
                                                                        │
[6. Dual Confirmation & Review] <── [5. Match & Exchange] <── [4. Verification Quiz]
             │
[7. Learning Roadmap & AI] ──> [8. Admin Governance]
```

### Step 1: Landing Page & Aesthetic Presentation
* Navigate to `/`.
* Point out the minimalist pastel pink design system: warm ivory background (`#FFFBFA`), dusty rose buttons (`#D99AAA`), soft blush pill badge (`#F5E1E5`), and Plus Jakarta Sans typography.
* Explain the 3-card workflow overview and 3 core value propositions.

### Step 2: User Registration & Secure Authentication
* Navigate to `/register`.
* Create a demonstration profile (e.g., `Maya Lin`, `maya@university.edu`, `password123`).
* Show password masking, minimum length validation (min 6 chars), and bcrypt salt generation.
* Log in at `/login` and show automatic redirection to `/dashboard`.

### Step 3: Profile Configuration & Skill Declaration
* Navigate to `/profile`.
* Add an offered skill: `Python` (Intermediate).
* Add a wanted skill: `Java` (Beginner).
* Note that Python initially shows the `Self-Declared` neutral pill badge.

### Step 4: Skill Verification & Badge Awarding
* Click **Verification Hub** or navigate to `/assessments`.
* Select **Python** and start the MCQ quiz.
* Answer the questions (e.g. data types, list comprehensions, decorators, dictionaries).
* Submit assessment: The backend evaluates answers, calculates percentage ($100\%$), records the attempt, and upgrades the badge to `ASSESSMENT_PASSED`.
* Show that `/profile` now proudly displays the soft blush `Assessment Passed` badge with $100\%$ score.

### Step 5: Explore & Explainable Synergy Matching
* Navigate to `/explore`.
* Show category pills (`All`, `Programming`, `Web`, `Design`, etc.) and the "Verified Skills Only" filter.
* View candidate partner card (e.g. `Test Mentor`, offering `Java` and wanting `Python`).
* Navigate to `/matches` and review the **91% Synergy Score**.
* Click "Why this match?": Show the explainable breakdown (mutual reciprocity, availability alignment, verified standing bonus).
* Click **Schedule Session**: Schedule a calendar exchange session with date, time, duration, and Google Meet URL.

### Step 6: Dual Confirmation & Fraud-Resistant Review
* On `/matches`, show the exchange status.
* User A clicks **Mark Completed** -> Status remains pending partner confirmation (`Waiting for Partner...`).
* Log in as User B and confirm completion -> Status automatically transitions to `✓ Completed Exchange`.
* Click **Leave Review**: Submit a 5-star review with criteria ratings (Punctuality: 5, Clarity: 5, Helpfulness: 5).
* Show that partner's Trust Score and average rating immediately recalculate in MongoDB.

### Step 7: Learning Goals, Milestones & AI Assistant
* Navigate to `/learning`.
* Show the active goals with dusty rose progress bars (`100% (4/4)`).
* Toggle an individual milestone checkbox to demonstrate dynamic progress tracking.
* Switch to the **AI Learning Roadmap** tab: Generate a 5-stage sequential curriculum for `Python`.
* Switch to the **Skill Gap Analysis** tab: Demonstrate comparison between claimed and demonstrated level.
* Switch to the **AI Learning Assistant** tab: Ask a pedagogical question and view conversational output.

### Step 8: Administrative Governance & Moderation
* Log in with administrator account.
* Navigate to `/admin`.
* Review the **Platform Analytics** grid (total members, verified skills count, completed exchanges, average rating).
* Demonstrate **User Management**: Toggle account suspension on a test account.
* Demonstrate **Reports & Moderation**: Review user-submitted complaints and mark resolved.
* Author a new MCQ question directly into the MongoDB question bank.

---

## 6. External Examiner Q&A Defense

### Q1: Why did you choose peer skill exchange over monetary marketplace platforms?
**Answer:** Academic environments benefit substantially from reciprocal knowledge sharing. Financial models exclude students with budget constraints, whereas barter exchange levels the playing field. To make barter reliable, SkillSync introduces algorithmic reciprocity matching and verified credentialing to overcome the classic "coincidence of wants" problem.

### Q2: How does your matching algorithm differ from simple keyword search?
**Answer:** A basic search only looks for substring containment in skills. Our 5-factor matching engine evaluates true reciprocity ($A \to B$ and $B \to A$), proficiency compatibility (ensuring the teacher's level exceeds the learner's), verified credential status, schedule compatibility, and community trust score. It also generates natural language explanations justifying the score.

### Q3: Why is Node.js `vm` considered insecure for executing untrusted user code?
**Answer:** Node.js's official documentation explicitly warns that `vm` is not a security boundary. Code executed inside `vm.runInContext` shares the underlying V8 heap and process space. Attackers can escape via prototype chain traversal (`this.constructor.constructor('return process')()`). In SkillSync, we prioritize host isolation by disabling arbitrary code execution in the main Express backend during production, utilizing deterministic static code analysis and AST pattern matching instead.

### Q4: How do you prevent review fraud and reputation manipulation?
**Answer:** Reviews are structurally restricted at the database level:
1. A review can only be submitted for an exchange whose state is `completed`.
2. An exchange can only become `completed` when *both* participants independently confirm completion.
3. Compound unique database indexes prevent duplicate reviews from the same reviewer on the same exchange.

### Q5: What happens if external AI APIs (like Google Gemini) are offline or reach rate limits?
**Answer:** SkillSync features a zero-dependency deterministic AI fallback system. If API keys are unconfigured or external network requests fail, the application falls back seamlessly to pre-computed domain taxonomies and curated learning stages, ensuring 100% uptime for students without throwing runtime exceptions.

---

## 7. Limitations & Future Roadmap

| Current Limitation | Proposed Future Enhancement |
| :--- | :--- |
| Static code analysis in production | Dedicated worker cluster with gVisor/Firecracker microVMs |
| Direct in-app messaging | WebRTC end-to-end encrypted audio/video peer rooms |
| Manual session scheduling | Two-way Google Calendar / Microsoft Outlook OAuth sync |
| Fixed 24h assessment retry window | Dynamic spaced-repetition retry delays based on score |
