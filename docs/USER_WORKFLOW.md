# SkillSync User Workflow & Demonstration Guide

This guide details the complete end-to-end user journey across the SkillSync platform.

---

## The Core User Journey

```
┌─────────────────┐
│  1. REGISTER    │  Create account with name, email, password
└────────┬────────┘
         │
┌────────▼────────┐
│   2. LOGIN      │  Authenticate and receive active session
└────────┬────────┘
         │
┌────────▼────────┐
│  3. DASHBOARD   │  View personalized overview, metrics, and incoming requests
└────────┬────────┘
         │
┌────────▼────────┐
│ 4. EDIT PROFILE │  Add skills you offer, skills you want, and set schedule
└────────┬────────┘
         │
┌────────▼────────┐
│ 5. EXPLORE PEERS│  Search members by skill or name, view match scores
└────────┬────────┘
         │
┌────────▼────────┐
│ 6. VIEW PARTNER │  Inspect partner's bio, skills, trust score, and availability
└────────┬────────┘
         │
┌────────▼────────┐
│ 7. SEND REQUEST │  Select skills to exchange, write proposal message, and send
└────────┬────────┘
         │
┌────────▼────────┐
│8. RECEIVER INBOX│  Recipient views incoming proposal under Requests tab
└────────┬────────┘
         │
┌────────▼────────┐
│9. ACCEPT REQUEST│  Recipient accepts proposal; status transitions to 'accepted'
└────────┬────────┘
         │
┌────────▼────────┐
│10. ACTIVE MATCH │  Both users see the active exchange under Matches page
└─────────────────┘
```

---

## Step-by-Step Walkthrough

### Step 1: Registration
- Navigate to `/register`.
- Enter Full Name, Email, Password, and Confirm Password.
- Client validates inputs; on submit, MongoDB persists the account with bcrypt-hashed credentials.
- Automatic redirect to `/login` with success banner.

### Step 2: Login
- Navigate to `/login`.
- Enter registered email and password.
- Server validates credentials; client saves user session to `localStorage` under `skillsync_user`.
- Redirects to `/dashboard`.

### Step 3: Member Dashboard
- Displays greeting with the user's name: *"Welcome back, [Name]!"*.
- Summary metric cards displaying:
  - Total skills offered
  - Total skills desired
  - Pending proposals awaiting review
  - Active confirmed matches
- Direct shortcuts to Explore, Profile, and Requests.

### Step 4: Profile Management
- Navigate to `/profile`.
- Click **"Edit Profile"** to enter editing mode.
- Add skills you can teach with proficiency levels (*Beginner*, *Intermediate*, *Advanced*).
- Add skills you want to learn with target proficiency.
- Update bio, college major/role, campus location, and availability schedule.
- Click **"Save Profile Changes"**.
- Data updates immediately in MongoDB Atlas and reflects in the UI without browser reload.

### Step 5: Explore Skill Partners
- Navigate to `/explore`.
- Live search bar searches names, roles, or skills in real time.
- Filter by discipline (*React / Web Dev*, *Python / Data*, *UI/UX / Figma*, *Node.js*, etc.).
- Cards highlight compatibility match scores, verification badges, and skills offered/sought.
- Click **"View Profile"** to inspect a partner's detailed page.

### Step 6: Propose Skill Exchange
- Click **"Request Exchange"** on a partner card or profile.
- Select which of your skills you will teach and which of their skills you want to learn.
- Compose a personal introductory message.
- Submit the proposal; backend validates against duplicate requests or self-requests.

### Step 7: Request Management
- Navigate to `/requests`.
- **Received Requests tab**: Shows proposals sent to you with sender details and exchange terms. Click **"Accept Exchange"** or **"Decline"**.
- **Sent Requests tab**: Tracks the status of proposals you've submitted (*Pending*, *Accepted*, *Declined*), with the ability to cancel pending ones.

### Step 8: Active Matches
- Navigate to `/matches`.
- Confirmed exchanges appear as active partnerships.
- Displays partner details, contact options, mutual skills, and compatibility metrics.

### Step 9: Logout & Access Control
- Click **"Logout"** in the top navigation bar.
- Client clears `localStorage` and resets authenticated state.
- Attempting to visit `/dashboard`, `/profile`, `/matches`, or `/requests` automatically redirects to `/login`.
