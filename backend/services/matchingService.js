/**
 * SkillSync Intelligent Explainable Matching Engine
 *
 * Computes a deterministic, explainable compatibility score (0 - 100%) between two users
 * based on configurable 5-factor weighting:
 * - Skill compatibility: 35%
 * - Verified proficiency: 25%
 * - Learning preference / topic alignment: 15%
 * - Availability alignment: 10%
 * - Reputation & learner feedback: 15%
 */

export const DEFAULT_WEIGHTS = {
  skillCompatibility: 0.35,
  verifiedProficiency: 0.25,
  learningPreference: 0.15,
  availability: 0.10,
  feedbackReputation: 0.15
};

const normalizeSkill = (skill) => {
  if (!skill || typeof skill !== 'string') return '';
  return skill.toLowerCase().trim();
};

/**
 * Checks whether userA's offered skills match any of userB's wanted skills.
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
  if (!availA || !availB) return { hasOverlap: false, points: 0, commonKeywords: [] };

  const strA = availA.toLowerCase();
  const strB = availB.toLowerCase();

  const keywords = ['weekend', 'weekday', 'evening', 'morning', 'afternoon', 'flexible', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  const commonKeywords = keywords.filter(kw => strA.includes(kw) && strB.includes(kw));

  if (commonKeywords.length > 0) {
    return { hasOverlap: true, points: 100, commonKeywords };
  }

  // If both provided availability details
  if (availA.trim() && availB.trim()) {
    return { hasOverlap: false, points: 50, commonKeywords: [] };
  }

  return { hasOverlap: false, points: 20, commonKeywords: [] };
};

/**
 * Full explainable 5-factor compatibility calculation
 */
export const calculateDetailedMatchScore = (userA, userB, weights = DEFAULT_WEIGHTS) => {
  if (!userA || !userB) {
    return {
      score: 0,
      factors: {},
      explanations: [],
      isReciprocal: false
    };
  }

  const explanations = [];

  // Factor 1: Skill Compatibility (35% weight)
  // Check A offers -> B wants (A teaches B)
  const aOffersToB = checkSkillOverlap(userA.skillsOffered, userB.skillsWanted);
  // Check B offers -> A wants (B teaches A)
  const bOffersToA = checkSkillOverlap(userB.skillsOffered, userA.skillsWanted);

  let skillCompatibilityScore = 0;
  const isReciprocal = (aOffersToB.hasExactMatch || aOffersToB.hasPartialMatch) &&
                       (bOffersToA.hasExactMatch || bOffersToA.hasPartialMatch);

  if (aOffersToB.hasExactMatch) {
    explanations.push(`You can teach ${userB.name || 'this user'} ${aOffersToB.matchedSkills.join(', ')}.`);
    skillCompatibilityScore += 45;
  } else if (aOffersToB.hasPartialMatch) {
    explanations.push(`Your offered skill matches their interest (${aOffersToB.matchedSkills.join(', ')}).`);
    skillCompatibilityScore += 25;
  }

  if (bOffersToA.hasExactMatch) {
    explanations.push(`${userB.name || 'This user'} can teach you ${bOffersToA.matchedSkills.join(', ')}.`);
    skillCompatibilityScore += 45;
  } else if (bOffersToA.hasPartialMatch) {
    explanations.push(`They offer a complementary skill (${bOffersToA.matchedSkills.join(', ')}).`);
    skillCompatibilityScore += 25;
  }

  if (isReciprocal) {
    explanations.push(`Direct reciprocal exchange opportunity! Both members have mutual skills to share.`);
    skillCompatibilityScore += 10;
  }

  skillCompatibilityScore = Math.min(100, skillCompatibilityScore);

  // Factor 2: Verified Proficiency (25% weight)
  let verifiedProficiencyScore = 0;
  const partnerVerifications = userB.skillVerifications || [];

  // Check if skills offered by partner are verified
  const verifiedOffered = partnerVerifications.filter(v =>
    (v.status === 'SKILL_VERIFIED' || v.status === 'ASSESSMENT_PASSED') &&
    (userB.skillsOffered || []).some(s => s.toLowerCase() === v.skill.toLowerCase())
  );

  if (verifiedOffered.length > 0) {
    verifiedProficiencyScore = 80;
    const verifiedNames = verifiedOffered.map(v => `${v.skill} (${v.status === 'SKILL_VERIFIED' ? 'Skill Verified' : 'Assessment Passed'})`).join(', ');
    explanations.push(`${userB.name || 'Partner'} has demonstrated certified proficiency in: ${verifiedNames}.`);

    if (verifiedOffered.some(v => v.status === 'SKILL_VERIFIED')) {
      verifiedProficiencyScore = 100;
    }
  } else if (userB.verification) {
    verifiedProficiencyScore = 70;
    explanations.push(`${userB.name || 'Partner'} is a verified community contributor.`);
  } else {
    verifiedProficiencyScore = 40; // Self-declared baseline
  }

  // Factor 3: Learning Preference Compatibility (15% weight)
  let learningPreferenceScore = 50;
  // If partner teaches skill userA wants with Advanced or Intermediate level
  if (bOffersToA.hasExactMatch) {
    const prof = userB.proficiency?.[bOffersToA.matchedSkills[0]];
    if (prof === 'Advanced' || prof === 'Expert') {
      learningPreferenceScore = 100;
      explanations.push(`Advanced mentorship capability in ${bOffersToA.matchedSkills[0]}.`);
    } else {
      learningPreferenceScore = 80;
    }
  } else if (userA.role && userB.role) {
    learningPreferenceScore = 70;
  }

  // Factor 4: Availability Overlap (10% weight)
  const scheduleOverlap = checkScheduleOverlap(userA.availability, userB.availability);
  const availabilityScore = scheduleOverlap.points;
  if (scheduleOverlap.hasOverlap) {
    explanations.push(`Your availability schedules align: overlapping on ${scheduleOverlap.commonKeywords.join(', ')}.`);
  }

  // Factor 5: Previous Learner Feedback & Reputation (15% weight)
  let feedbackReputationScore = 60;
  const trust = userB.trustScore || 0;
  if (trust >= 80) {
    feedbackReputationScore = 100;
    explanations.push(`High community reputation score (${trust}% trust rating).`);
  } else if (trust > 0) {
    feedbackReputationScore = Math.max(50, trust);
  }

  if (userB.badges && userB.badges.length > 0) {
    explanations.push(`Recognized community badges: ${userB.badges.join(', ')}.`);
  }

  // Calculate Weighted Sum
  const w = weights;
  const rawScore =
    (skillCompatibilityScore * w.skillCompatibility) +
    (verifiedProficiencyScore * w.verifiedProficiency) +
    (learningPreferenceScore * w.learningPreference) +
    (availabilityScore * w.availability) +
    (feedbackReputationScore * w.feedbackReputation);

  const finalScore = Math.round(Math.min(100, Math.max(0, rawScore)));

  return {
    score: finalScore,
    factors: {
      skillCompatibility: skillCompatibilityScore,
      verifiedProficiency: verifiedProficiencyScore,
      learningPreference: learningPreferenceScore,
      availability: availabilityScore,
      feedbackReputation: feedbackReputationScore
    },
    explanations,
    isReciprocal
  };
};

/**
 * Standard calculateMatchScore preserving backward compatibility
 */
export const calculateMatchScore = (userA, userB) => {
  const detailed = calculateDetailedMatchScore(userA, userB);
  return detailed.score;
};
