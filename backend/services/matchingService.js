/**
 * SkillSync Matching Algorithm Service
 * 
 * Computes a deterministic, explainable compatibility score (0 - 100%) between two users
 * based on mutual skill exchange opportunities, proficiency, and schedule alignment.
 */

const normalizeSkill = (skill) => {
  if (!skill || typeof skill !== 'string') return '';
  return skill.toLowerCase().trim();
};

/**
 * Checks whether userA's offered skills match any of userB's wanted skills.
 * Returns an object with { hasExactMatch, hasPartialMatch, matchedSkills }
 */
export const checkSkillOverlap = (offeredSkills = [], wantedSkills = []) => {
  const normalizedOffered = (offeredSkills || []).map(normalizeSkill).filter(Boolean);
  const normalizedWanted = (wantedSkills || []).map(normalizeSkill).filter(Boolean);

  const matched = [];
  let hasExact = false;
  let hasPartial = false;

  for (const offered of normalizedOffered) {
    for (const wanted of normalizedWanted) {
      if (offered === wanted) {
        hasExact = true;
        matched.push(offered);
      } else if (offered.includes(wanted) || wanted.includes(offered)) {
        hasPartial = true;
        matched.push(`${offered} ~ ${wanted}`);
      }
    }
  }

  return {
    hasExactMatch: hasExact,
    hasPartialMatch: hasPartial,
    matchedCount: matched.length,
    matchedSkills: matched
  };
};

/**
 * Checks schedule compatibility by tokenizing availability strings.
 */
export const checkScheduleOverlap = (availA = '', availB = '') => {
  if (!availA || !availB) return { hasOverlap: false, points: 0 };

  const strA = availA.toLowerCase();
  const strB = availB.toLowerCase();

  const keywords = ['weekend', 'weekday', 'evening', 'morning', 'afternoon', 'flexible', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  const commonKeywords = keywords.filter(kw => strA.includes(kw) && strB.includes(kw));

  if (commonKeywords.length > 0) {
    return { hasOverlap: true, points: 10, commonKeywords };
  }

  // Both provided availability information
  return { hasOverlap: false, points: 5, commonKeywords: [] };
};

/**
 * Calculates a match score (0 - 100) between User A and User B.
 * 
 * Scoring breakdown:
 * - Direct Need Match (A offers what B wants): up to 40%
 * - Reciprocal Need Match (B offers what A wants): up to 40%
 * - Mutual Exchange Bonus (both directions match): +10%
 * - Availability Alignment: up to 10%
 */
export const calculateMatchScore = (userA, userB) => {
  if (!userA || !userB) return 0;

  // 1. A offers -> B wants
  const aOffersToB = checkSkillOverlap(userA.skillsOffered, userB.skillsWanted);
  let scoreAtoB = 0;
  if (aOffersToB.hasExactMatch) {
    scoreAtoB = 40;
  } else if (aOffersToB.hasPartialMatch) {
    scoreAtoB = 25;
  }

  // 2. B offers -> A wants
  const bOffersToA = checkSkillOverlap(userB.skillsOffered, userA.skillsWanted);
  let scoreBtoA = 0;
  if (bOffersToA.hasExactMatch) {
    scoreBtoA = 40;
  } else if (bOffersToA.hasPartialMatch) {
    scoreBtoA = 25;
  }

  // 3. Mutual Trade Bonus
  let mutualBonus = 0;
  if ((aOffersToB.hasExactMatch || aOffersToB.hasPartialMatch) &&
      (bOffersToA.hasExactMatch || bOffersToA.hasPartialMatch)) {
    mutualBonus = 10;
  }

  // 4. Availability alignment
  const scheduleMatch = checkScheduleOverlap(userA.availability, userB.availability);
  const schedulePoints = scheduleMatch.points;

  let totalScore = scoreAtoB + scoreBtoA + mutualBonus + schedulePoints;

  // If there is no skill match at all, provide a baseline if complementary categories exist
  if (scoreAtoB === 0 && scoreBtoA === 0) {
    totalScore = Math.min(totalScore, 20); // cap baseline without skills
  }

  return Math.min(100, Math.max(0, Math.round(totalScore)));
};
