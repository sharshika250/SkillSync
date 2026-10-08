# SkillSync API Documentation

All API endpoints are hosted under the `/api` prefix and return standard JSON responses.

### Common Response Schema
```json
{
  "success": true,
  "message": "Optional descriptive message",
  "data": {}
}
```

---

## 1. Authentication Endpoints (`/api/auth`)

### 1.1 Register User
- **Method:** `POST`
- **Endpoint:** `/api/auth/register`
- **Access:** Public
- **Request Body:**
```json
{
  "name": "Alex Chen",
  "email": "alex@university.edu",
  "password": "Password123"
}
```
- **Success Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "67...abc",
    "name": "Alex Chen",
    "email": "alex@university.edu",
    "role": "Student",
    "location": "",
    "bio": "",
    "skillsOffered": [],
    "skillsWanted": [],
    "proficiency": {},
    "availability": "",
    "verification": false,
    "trustScore": 5.0,
    "createdAt": "2026-10-08T...",
    "updatedAt": "2026-10-08T..."
  }
}
```
- **Error Responses:**
  - `400 Bad Request`: Missing fields, password too short (<6 characters), invalid email format.
  - `409 Conflict`: Email already registered.

### 1.2 Login User
- **Method:** `POST`
- **Endpoint:** `/api/auth/login`
- **Access:** Public
- **Request Body:**
```json
{
  "email": "alex@university.edu",
  "password": "Password123"
}
```
- **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": { ... }
}
```
- **Error Response:** `401 Unauthorized`: Invalid email or password.

---

## 2. User & Profile Endpoints (`/api/users`)

### 2.1 Get All Users (Explore)
- **Method:** `GET`
- **Endpoint:** `/api/users`
- **Access:** Public / Optional Auth (when authenticated, excludes current user and calculates dynamic match scores)
- **Query Parameters:**
  - `search`: Keyword search matching name, role, bio, or skills.
  - `skill`: Filter by specific skill.
  - `offeredSkill`: Filter by skills offered.
  - `wantedSkill`: Filter by skills wanted.
- **Success Response (200 OK):**
```json
{
  "success": true,
  "count": 5,
  "users": [
    {
      "_id": "67...def",
      "name": "Priya Sharma",
      "role": "Software Engineering Major",
      "skillsOffered": ["React", "UI/UX Design"],
      "skillsWanted": ["Python"],
      "availability": "Weekends",
      "trustScore": 5.0,
      "verification": true,
      "matchScore": 100
    }
  ]
}
```

### 2.2 Get User by ID (Partner Profile)
- **Method:** `GET`
- **Endpoint:** `/api/users/:id`
- **Access:** Public / Optional Auth
- **Success Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "_id": "67...def",
    "name": "Priya Sharma",
    "role": "Software Engineering Major",
    "bio": "Frontend enthusiast...",
    "skillsOffered": ["React", "UI/UX Design"],
    "skillsWanted": ["Python"],
    "availability": "Weekends",
    "trustScore": 5.0,
    "verification": true,
    "matchScore": 100
  }
}
```

### 2.3 Get Current User Profile
- **Method:** `GET`
- **Endpoint:** `/api/users/profile`
- **Headers:** `x-user-id: <userId>` or `Authorization: Bearer <userId>`
- **Access:** Private
- **Success Response (200 OK):** Returns current user document.

### 2.4 Update Current User Profile
- **Method:** `PUT`
- **Endpoint:** `/api/users/profile`
- **Headers:** `x-user-id: <userId>` or `Authorization: Bearer <userId>`
- **Access:** Private
- **Request Body:**
```json
{
  "name": "Alex Chen",
  "role": "Computer Science Senior",
  "bio": "Building web apps and exploring cloud architectures.",
  "location": "Engineering Hall",
  "skillsOffered": ["Node.js", "Express", "Docker"],
  "skillsWanted": ["React Native", "Swift"],
  "proficiency": {
    "Node.js": "Advanced",
    "Express": "Advanced",
    "Docker": "Intermediate"
  },
  "availability": "Tue/Thu Afternoons"
}
```
- **Success Response (200 OK):** Returns updated user document and success message.

---

## 3. Exchange Requests (`/api/requests`)

### 3.1 Create Exchange Request
- **Method:** `POST`
- **Endpoint:** `/api/requests`
- **Headers:** `x-user-id: <userId>`
- **Access:** Private
- **Request Body:**
```json
{
  "receiverId": "67...def",
  "offeredSkill": "Node.js",
  "requestedSkill": "React Native",
  "message": "Hi Priya, would love to exchange Node.js mentoring for React Native guidance!"
}
```
- **Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Exchange request sent successfully",
  "request": {
    "_id": "67...xyz",
    "sender": { "name": "Alex Chen", ... },
    "receiver": { "name": "Priya Sharma", ... },
    "offeredSkill": "Node.js",
    "requestedSkill": "React Native",
    "message": "...",
    "matchScore": 85,
    "status": "pending",
    "createdAt": "2026-10-08T..."
  }
}
```
- **Error Responses:**
  - `400 Bad Request`: Missing fields, self-request attempt, or duplicate pending request.
  - `404 Not Found`: Receiver not found.

### 3.2 Get User's Exchange Requests
- **Method:** `GET`
- **Endpoint:** `/api/requests`
- **Headers:** `x-user-id: <userId>`
- **Query Parameters:** `type=sent` | `type=received`
- **Success Response (200 OK):**
```json
{
  "success": true,
  "count": 3,
  "requests": [ ... ],
  "sent": [ ... ],
  "received": [ ... ]
}
```

### 3.3 Accept Exchange Request
- **Method:** `PUT`
- **Endpoint:** `/api/requests/:id/accept`
- **Headers:** `x-user-id: <userId>`
- **Access:** Private (must be the recipient)
- **Success Response (200 OK):** Transitions request status to `"accepted"`.

### 3.4 Decline Exchange Request
- **Method:** `PUT`
- **Endpoint:** `/api/requests/:id/reject`
- **Headers:** `x-user-id: <userId>`
- **Access:** Private (must be the recipient)
- **Success Response (200 OK):** Transitions request status to `"rejected"`.

### 3.5 Cancel Sent Exchange Request
- **Method:** `PUT`
- **Endpoint:** `/api/requests/:id/cancel`
- **Headers:** `x-user-id: <userId>`
- **Access:** Private (must be the sender)
- **Success Response (200 OK):** Transitions pending request status to `"cancelled"`.

---

## 4. Matches & Recommendations (`/api/matches`)

### 4.1 Get Active Matches
- **Method:** `GET`
- **Endpoint:** `/api/matches`
- **Headers:** `x-user-id: <userId>`
- **Access:** Private
- **Success Response (200 OK):** Returns all accepted exchange relationships with partner details, mutual skills, and contact information.

### 4.2 Get AI Compatibility Recommendations
- **Method:** `GET`
- **Endpoint:** `/api/matches/recommendations`
- **Headers:** `x-user-id: <userId>`
- **Access:** Private
- **Success Response (200 OK):** Returns all community members sorted by calculated compatibility match score descending.
