# SkillSync Explainable Skill Matching Algorithm

A core feature of the SkillSync platform is its deterministic, transparent peer compatibility matching engine implemented in `backend/services/matchingService.js`.

---

## 1. Design Rationale

Unlike non-explainable "black-box" models, this college project implements an explainable algorithm with measurable scoring factors:
1. **Direct Alignment**: Does User A have what User B is looking for?
2. **Reciprocal Alignment**: Does User B have what User A is looking for?
3. **Mutual Trade Synergy**: Is there a two-way exchange opportunity?
4. **Schedule Compatibility**: Can their schedules align?

---

## 2. Mathematical Scoring Model

The compatibility score \( S \in [0, 100] \) between User A and User B is computed as:

\[
S = \min\left(100, S_{A \to B} + S_{B \to A} + B_{mutual} + S_{schedule}\right)
\]

### Scoring Components:

| Factor | Description | Points |
| :--- | :--- | :--- |
| **\( S_{A \to B} \)** | User A offers a skill User B wants | **40 points** (Exact match) / **25 points** (Substring match) |
| **\( S_{B \to A} \)** | User B offers a skill User A wants | **40 points** (Exact match) / **25 points** (Substring match) |
| **\( B_{mutual} \)** | Mutual Trade Bonus (Both A \(\to\) B and B \(\to\) A match) | **+10 points** |
| **\( S_{schedule} \)** | Schedule Overlap (Shared availability keywords e.g. "weekend", "evening") | **+10 points** (matching days/times) / **+5 points** (both stated availability) |

### Baseline Adjustment
If neither user's skills intersect, a baseline compatibility of up to 20% is assigned to encourage exploratory proposals across complementary academic fields.

---

## 3. Algorithm Step-by-Step Walkthrough

```javascript
// Step 1: Normalize all skills (lowercase, whitespace trimmed)
const normalizedAOffers = userA.skillsOffered.map(s => s.toLowerCase().trim());
const normalizedBWants = userB.skillsWanted.map(s => s.toLowerCase().trim());

// Step 2: Test Direct Match (A -> B)
let scoreAtoB = 0;
if (hasExactMatch(normalizedAOffers, normalizedBWants)) {
  scoreAtoB = 40;
} else if (hasPartialMatch(normalizedAOffers, normalizedBWants)) {
  scoreAtoB = 25;
}

// Step 3: Test Reciprocal Match (B -> A)
let scoreBtoA = 0;
if (hasExactMatch(normalizedBOffers, normalizedAWants)) {
  scoreBtoA = 40;
} else if (hasPartialMatch(normalizedBOffers, normalizedAWants)) {
  scoreBtoA = 25;
}

// Step 4: Add Mutual Synergy Bonus
let mutualBonus = 0;
if (scoreAtoB > 0 && scoreBtoA > 0) {
  mutualBonus = 10;
}

// Step 5: Check Schedule Overlap
let schedulePoints = checkScheduleOverlap(userA.availability, userB.availability); // 5 or 10 points

// Step 6: Compute Total Bounded Score
let totalScore = Math.min(100, scoreAtoB + scoreBtoA + mutualBonus + schedulePoints);
```

---

## 4. Example Demonstration Calculation

### Scenario: Aarav Patel & Priya Sharma
- **Aarav offers:** `['Python', 'Machine Learning', 'Django']`
- **Aarav wants:** `['React', 'UI/UX Design']`
- **Aarav availability:** `"Weekends and weekday evenings"`

- **Priya offers:** `['React', 'UI/UX Design', 'Figma']`
- **Priya wants:** `['Python', 'Django']`
- **Priya availability:** `"Weekends and flexible evenings"`

### Calculation:
1. **Aarav \(\to\) Priya:** Aarav offers 'Python', which Priya wants. **Exact Match \(\to\) 40 points**.
2. **Priya \(\to\) Aarav:** Priya offers 'React', which Aarav wants. **Exact Match \(\to\) 40 points**.
3. **Mutual Trade Bonus:** Both directions match. **Bonus \(\to\) 10 points**.
4. **Schedule Overlap:** Both have 'weekends' and 'evenings'. **Overlap \(\to\) 10 points**.

\[
\text{Total Score} = 40 + 40 + 10 + 10 = \mathbf{100\%}
\]

Result: **100% Perfect Match** displayed at the top of recommendations.
