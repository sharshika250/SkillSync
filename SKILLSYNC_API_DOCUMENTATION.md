# SkillSync RESTful API Documentation

Base URL: `http://localhost:5000` (or configured production endpoint)

All authenticated endpoints require either:
- Header: `Authorization: Bearer <userId>`
- Header: `x-user-id: <userId>`

---

## 1. Authentication (`/api/auth`)

### `POST /api/auth/register`
Register a new member account.
- **Access:** Public
- **Request Body:**
  ```json
  {
    "name": "Alice Developer",
    "email": "alice@example.com",
    "password": "securepassword123"
  }
  ```
- **Responses:** `201 Created`, `400 Bad Request`, `409 Conflict`

### `POST /api/auth/login`
Authenticate an existing member.
- **Access:** Public
- **Request Body:**
  ```json
  {
    "email": "alice@example.com",
    "password": "securepassword123"
  }
  ```
- **Responses:** `200 OK`, `401 Unauthorized`

---

## 2. Users & Profiles (`/api/users`)

### `GET /api/users`
List explore members with optional filtering and match calculation.
- **Access:** Public / Optional Auth
- **Query Params:** `search`, `skill`, `category` (Programming, Web, Design, DataScience, Business, Communication), `verifiedOnly` (true/false), `sortBy` (matchScore, rating, recent)
- **Response:** `200 OK`

### `GET /api/users/:id`
Get detailed profile of a member with compatibility breakdown.
- **Access:** Public / Optional Auth
- **Response:** `200 OK`, `404 Not Found`

### `GET /api/users/profile`
Retrieve authenticated member's own profile.
- **Access:** Private
- **Response:** `200 OK`

### `PUT /api/users/profile`
Update authenticated member's profile (sanitizes sensitive role/score fields).
- **Access:** Private
- **Request Body:** `name`, `bio`, `role`, `location`, `avatar`, `availability`, `skillsOffered`, `skillsWanted`, `proficiency`, `portfolioLinks`, `certificates`, `teachingExperience`
- **Response:** `200 OK`

### `DELETE /api/users/profile`
Permanently delete current member account.
- **Access:** Private
- **Response:** `200 OK`

---

## 3. Skill Verification & Assessments (`/api/assessments`)

### `GET /api/assessments/skills`
List skills with available verification assessments.
- **Access:** Public

### `GET /api/assessments/skill/:skill`
Retrieve questions for selected skill and difficulty (sanitizes correct answers for security).
- **Access:** Private
- **Query Params:** `difficulty` (Basic, Intermediate, Advanced), `type` (mcq, practical)

### `POST /api/assessments/submit-mcq`
Submit multiple-choice assessment for backend evaluation.
- **Access:** Private
- **Enforces:** Maximum 3 attempts per 24 hours per skill.
- **Request Body:**
  ```json
  {
    "skill": "Python",
    "difficulty": "Intermediate",
    "answers": {
      "<questionId1>": 1,
      "<questionId2>": 2
    }
  }
  ```
- **Responses:** `200 OK` (returns score, percentage, demonstratedLevel, reviewDetails), `429 Too Many Requests`

### `POST /api/assessments/submit-practical`
Submit code challenge for isolated sandboxed execution.
- **Access:** Private
- **Request Body:**
  ```json
  {
    "questionId": "<practicalQuestionId>",
    "code": "def solution(a, b): return a + b",
    "language": "python"
  }
  ```
- **Responses:** `200 OK` (returns evaluation results, pass/fail per test case, awarded badge)

### `GET /api/assessments/history`
Retrieve past assessment attempts and score history.
- **Access:** Private

---

## 4. Matching & Synergy (`/api/matches`)

### `GET /api/matches`
Retrieve active and completed exchange partnerships.
- **Access:** Private

### `GET /api/matches/recommendations`
Retrieve top ranked skill partners based on explainable 5-factor scoring.
- **Access:** Private

---

## 5. Exchange Requests (`/api/requests`)

### `POST /api/requests`
Propose a skill exchange.
- **Access:** Private
- **Request Body:** `receiverId`, `offeredSkill`, `requestedSkill`, `message`
- **Responses:** `201 Created`, `400 Bad Request`

### `GET /api/requests`
List user's sent and received exchange requests.
- **Access:** Private
- **Query Params:** `type` (sent, received), `status` (pending, accepted, rejected, cancelled, completed)

### `PUT /api/requests/:id/accept`
Accept proposal (receiver only).
- **Access:** Private

### `PUT /api/requests/:id/reject`
Decline proposal (receiver only).
- **Access:** Private

### `PUT /api/requests/:id/cancel`
Cancel sent proposal (sender only).
- **Access:** Private

### `PUT /api/requests/:id/complete`
Confirm exchange completion (requires dual confirmation to finalize).
- **Access:** Private

---

## 6. Exchange Scheduling (`/api/sessions`)

### `POST /api/sessions/schedule`
Schedule a learning session for an accepted exchange.
- **Access:** Private
- **Request Body:** `exchangeRequestId`, `date`, `time`, `durationMinutes`, `meetingLink`, `notes`
- **Responses:** `201 Created`

### `GET /api/sessions`
Get upcoming and past sessions for current member.
- **Access:** Private

---

## 7. Reviews & Reputation (`/api/reviews`)

### `POST /api/reviews`
Submit a star rating and written review for a completed exchange.
- **Access:** Private
- **Enforces:** Must be a participant; exchange must be completed; prevents duplicate reviews.
- **Request Body:**
  ```json
  {
    "exchangeRequestId": "<id>",
    "rating": 5,
    "criteria": { "punctuality": 5, "clarity": 5, "helpfulness": 5 },
    "comment": "Excellent tutor!"
  }
  ```
- **Responses:** `201 Created`, `400 Bad Request`

### `GET /api/reviews/user/:userId`
Get all reviews and average rating for a member.
- **Access:** Public / Optional Auth

---

## 8. Learning Management (`/api/learning`)

### `GET /api/learning`
Retrieve user's learning goals, active milestones, and learning metrics.
- **Access:** Private

### `POST /api/learning/goals`
Create a personalized learning goal with milestones.
- **Access:** Private
- **Request Body:** `skill`, `currentProficiency`, `targetProficiency`, `targetDate`, `milestones`

### `PUT /api/learning/goals/:goalId/milestones/:milestoneId`
Toggle milestone completion status.
- **Access:** Private

### `POST /api/learning/goals/:goalId/journal`
Append a reflection entry to learning journal.
- **Access:** Private

---

## 9. AI Services (`/api/ai`)

### `POST /api/ai/roadmap`
Generate structured learning roadmap.
- **Access:** Private / Public
- **Request Body:** `{ "skill": "Python" }`

### `POST /api/ai/gap-analysis`
Analyze gap between claimed vs. demonstrated proficiency.
- **Access:** Private
- **Request Body:** `{ "skill": "Python" }`

### `GET /api/ai/recommendations`
Get complementary skill pairings.
- **Access:** Private

### `POST /api/ai/ask-assistant`
Q&A pedagogical assistant.
- **Access:** Private
- **Request Body:** `{ "skill": "Python", "query": "How do decorators work?" }`

---

## 10. Communication & Notifications (`/api`)

### `POST /api/messages`
Send message to partner.
- **Access:** Private
- **Request Body:** `{ "receiverId": "<id>", "content": "Hello!" }`

### `GET /api/messages`
List active conversations with unread counts.
- **Access:** Private

### `GET /api/messages/:partnerId`
Get message thread history with partner.
- **Access:** Private

### `GET /api/notifications`
Get user notifications with unread count.
- **Access:** Private

### `PUT /api/notifications/:id/read`
Mark notification read.
- **Access:** Private

### `PUT /api/notifications/read-all`
Mark all notifications read.
- **Access:** Private

---

## 11. Administration (`/api/admin`)

### `POST /api/admin/reports`
Submit a moderation report against an account.
- **Access:** Private

### `GET /api/admin/analytics`
Platform overview analytics (Admin only).
- **Access:** Admin

### `GET /api/admin/users`
List all users with suspension management (Admin only).
- **Access:** Admin

### `PUT /api/admin/users/:userId/suspend`
Toggle account suspension (Admin only).
- **Access:** Admin

### `GET /api/admin/reports`
List pending reports (Admin only).
- **Access:** Admin

### `PUT /api/admin/reports/:id`
Resolve or dismiss report (Admin only).
- **Access:** Admin

### `POST /api/admin/assessments`
Add question to verified assessment bank (Admin only).
- **Access:** Admin
