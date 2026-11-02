import React, { useState, useEffect } from 'react';
import { assessmentAPI } from '../services/api';
import { useSkillSync } from '../context/SkillSyncContext';
import { AwardIcon } from '../components/Icons';

const Assessments = () => {
  const { currentUser, refreshProfile } = useSkillSync();
  const [availableSkills, setAvailableSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [mode, setMode] = useState('browse'); // 'browse' | 'mcq' | 'practical' | 'history'

  // MCQ state
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [mcqQuestions, setMcqQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submittingMcq, setSubmittingMcq] = useState(false);
  const [mcqResult, setMcqResult] = useState(null);

  // Practical state
  const [practicalChallenge, setPracticalChallenge] = useState(null);
  const [code, setCode] = useState('');
  const [submittingCode, setSubmittingCode] = useState(false);
  const [codeResult, setCodeResult] = useState(null);

  // History state
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSkills();
    loadHistory();
  }, []);

  const loadSkills = async () => {
    try {
      setLoading(true);
      const res = await assessmentAPI.getAvailableSkills();
      if (res?.success) {
        setAvailableSkills(res.skills || []);
        if (res.skills && res.skills.length > 0) {
          setSelectedSkill(res.skills[0]);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load skills');
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const res = await assessmentAPI.getHistory();
      if (res?.success) {
        setHistory(res.history || []);
      }
    } catch {
      // Ignore
    }
  };

  const startMCQ = async (skillToStart) => {
    const targetSkill = skillToStart || selectedSkill;
    setSelectedSkill(targetSkill);
    setError('');
    setMcqResult(null);
    setAnswers({});
    try {
      setLoading(true);
      const res = await assessmentAPI.getQuestions(targetSkill, { type: 'mcq', difficulty });
      if (res?.success) {
        setMcqQuestions(res.questions || []);
        setMode('mcq');
      }
    } catch (err) {
      setError(err.message || 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const startPractical = async (skillToStart) => {
    const targetSkill = skillToStart || selectedSkill;
    setSelectedSkill(targetSkill);
    setError('');
    setCodeResult(null);
    try {
      setLoading(true);
      const res = await assessmentAPI.getQuestions(targetSkill, { type: 'practical' });
      if (res?.success && res.questions && res.questions.length > 0) {
        const challenge = res.questions[0];
        setPracticalChallenge(challenge);
        setCode(challenge.practicalDetails?.starterCode || '');
        setMode('practical');
      } else {
        setError(`Practical coding challenge for ${targetSkill} is currently being prepared.`);
      }
    } catch (err) {
      setError(err.message || 'Failed to load practical challenge');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId, optionIndex) => {
    setAnswers({
      ...answers,
      [questionId]: optionIndex
    });
  };

  const submitMCQ = async () => {
    if (Object.keys(answers).length < mcqQuestions.length) {
      if (!window.confirm('You have unanswered questions. Are you sure you want to submit?')) {
        return;
      }
    }

    try {
      setSubmittingMcq(true);
      setError('');
      const res = await assessmentAPI.submitMCQ({
        skill: selectedSkill,
        difficulty,
        answers
      });
      if (res?.success) {
        setMcqResult(res);
        await refreshProfile();
        await loadHistory();
      }
    } catch (err) {
      setError(err.message || 'Error submitting assessment');
    } finally {
      setSubmittingMcq(false);
    }
  };

  const submitCode = async () => {
    if (!code.trim()) {
      setError('Code submission cannot be empty');
      return;
    }

    try {
      setSubmittingCode(true);
      setError('');
      const res = await assessmentAPI.submitPractical({
        questionId: practicalChallenge._id,
        code,
        language: practicalChallenge.practicalDetails?.language || 'javascript'
      });
      if (res?.success) {
        setCodeResult(res);
        await refreshProfile();
        await loadHistory();
      }
    } catch (err) {
      setError(err.message || 'Error evaluating code submission');
    } finally {
      setSubmittingCode(false);
    }
  };

  const getVerificationBadge = (skillName) => {
    const verif = currentUser?.skillVerifications?.find(
      v => v.skill.toLowerCase() === skillName.toLowerCase()
    );
    if (!verif) return { status: 'SELF_DECLARED', label: 'Self-Declared', className: 'badge', customStyle: { backgroundColor: '#FFFBFA', color: '#89818A', border: '1px solid #EFE7E9' } };
    if (verif.status === 'SKILL_VERIFIED') return { status: 'SKILL_VERIFIED', label: 'Skill Verified', className: 'badge badge-verified', customStyle: {} };
    if (verif.status === 'ASSESSMENT_PASSED') return { status: 'ASSESSMENT_PASSED', label: 'Assessment Passed', className: 'badge badge-blush', customStyle: {} };
    return { status: 'SELF_DECLARED', label: 'Self-Declared', className: 'badge', customStyle: { backgroundColor: '#FFFBFA', color: '#89818A', border: '1px solid #EFE7E9' } };
  };

  return (
    <div style={{ padding: '3.5rem 6%', maxWidth: '1240px', margin: '0 auto' }}>

      {/* Header Banner */}
      <div className="card" style={{ padding: '2.25rem 2.5rem', marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', background: 'radial-gradient(circle at top right, #FDF4F6 0%, #FFFFFF 65%)' }}>
        <div>
          <span className="badge badge-blush" style={{ marginBottom: '0.65rem' }}>
            <AwardIcon /> Skill Verification Center
          </span>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginTop: '0.35rem', marginBottom: '0.4rem', color: '#39343A' }}>
            Validate Your Knowledge & Earn Badges
          </h1>
          <p style={{ color: '#89818A', fontSize: '0.98rem', maxWidth: '750px' }}>
            SkillSync distinguishes self-declared claims from demonstrated mastery. Pass domain MCQs and evaluate sandboxed code to achieve verified credentials.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => { setMode('browse'); setMcqResult(null); setCodeResult(null); }}
            className={`btn ${mode === 'browse' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          >
            Browse Skills
          </button>
          <button
            onClick={() => { setMode('history'); loadHistory(); }}
            className={`btn ${mode === 'history' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          >
            Assessment History
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '1rem 1.25rem', backgroundColor: '#FDF4F6', border: '1px solid #F2CBD5', color: '#7A3D4C', borderRadius: '0.75rem', marginBottom: '1.5rem', fontSize: '0.92rem' }}>
          {error}
        </div>
      )}

      {/* MODE: BROWSE AVAILABLE SKILLS */}
      {mode === 'browse' && (
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.25rem', color: '#39343A' }}>Select a Skill to Verify</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {availableSkills.map(skill => {
              const badge = getVerificationBadge(skill);
              const userOffers = currentUser?.skillsOffered?.some(s => s.toLowerCase() === skill.toLowerCase());

              return (
                <div
                  key={skill}
                  className="card"
                  style={{
                    padding: '1.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <h3 style={{ fontSize: '1.3rem', margin: 0, color: '#39343A' }}>{skill}</h3>
                      <span className={badge.className} style={badge.customStyle}>
                        {badge.label}
                      </span>
                    </div>

                    <p style={{ color: '#89818A', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
                      {userOffers ? '✓ You offer this skill on your profile.' : 'Explore this skill assessment and demonstrate your proficiency.'}
                    </p>

                    <div style={{ fontSize: '0.82rem', color: '#89818A', marginBottom: '1.5rem' }}>
                      Thresholds: <strong style={{ color: '#39343A' }}>60%+</strong> (Assessment Passed) • <strong style={{ color: '#39343A' }}>80%+ Practical</strong> (Skill Verified)
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => startMCQ(skill)}
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1 }}
                    >
                      Take MCQ Quiz
                    </button>
                    <button
                      onClick={() => startPractical(skill)}
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1 }}
                    >
                      Practical Challenge
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODE: MCQ ASSESSMENT */}
      {mode === 'mcq' && (
        <div className="card" style={{ padding: '2rem 2.5rem', borderRadius: '1.25rem' }}>
          {!mcqResult ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.82rem', color: '#D99AAA', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>ASSESSMENT IN PROGRESS</span>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.25rem 0', color: '#39343A' }}>{selectedSkill} Knowledge Evaluation</h2>
                  <p style={{ color: '#89818A', margin: 0, fontSize: '0.95rem' }}>
                    Difficulty: <strong>{difficulty}</strong> • {mcqQuestions.length} Questions • Server-side verification
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {['Basic', 'Intermediate', 'Advanced'].map(diff => (
                    <button
                      key={diff}
                      onClick={() => { setDifficulty(diff); startMCQ(selectedSkill); }}
                      style={{
                        padding: '0.4rem 0.85rem',
                        fontSize: '0.82rem',
                        borderRadius: '9999px',
                        border: difficulty === diff ? '1px solid #F2CBD5' : '1px solid #EFE7E9',
                        backgroundColor: difficulty === diff ? '#F5E1E5' : '#FFFBFA',
                        color: difficulty === diff ? '#7A3D4C' : '#39343A',
                        fontWeight: difficulty === diff ? 700 : 500,
                        cursor: 'pointer'
                      }}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              {/* Questions List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', margin: '2rem 0' }}>
                {mcqQuestions.map((q, qIndex) => (
                  <div key={q._id} style={{ padding: '1.5rem', borderRadius: '0.75rem', backgroundColor: '#FFFBFA', border: '1px solid #EFE7E9' }}>
                    <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '1rem', color: '#39343A' }}>
                      {qIndex + 1}. {q.question}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {q.options?.map((opt, optIndex) => {
                        const isSelected = answers[q._id] === optIndex;
                        return (
                          <label
                            key={optIndex}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.75rem',
                              padding: '0.75rem 1rem',
                              borderRadius: '0.5rem',
                              border: isSelected ? '2px solid #D99AAA' : '1px solid #EFE7E9',
                              backgroundColor: isSelected ? '#FDF4F6' : '#FFFFFF',
                              cursor: 'pointer',
                              fontSize: '0.95rem',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <input
                              type="radio"
                              name={`question_${q._id}`}
                              checked={isSelected}
                              onChange={() => handleSelectOption(q._id, optIndex)}
                              style={{ accentColor: '#D99AAA', cursor: 'pointer' }}
                            />
                            <span style={{ color: isSelected ? '#39343A' : '#89818A', fontWeight: isSelected ? 600 : 400 }}>{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button
                  onClick={() => setMode('browse')}
                  className="btn btn-secondary btn-sm"
                  disabled={submittingMcq}
                >
                  Cancel
                </button>
                <button
                  onClick={submitMCQ}
                  className="btn btn-primary"
                  disabled={submittingMcq || mcqQuestions.length === 0}
                  style={{ padding: '0.75rem 2rem' }}
                >
                  {submittingMcq ? 'Evaluating on Backend...' : 'Submit Assessment'}
                </button>
              </div>
            </div>
          ) : (
            /* MCQ RESULTS VIEW */
            <div>
              <div style={{ textAlign: 'center', padding: '2.5rem 2rem', backgroundColor: mcqResult.passed ? '#EBF7F1' : '#FDF4F6', borderRadius: '1rem', border: `1px solid ${mcqResult.passed ? '#B8E4CF' : '#F2CBD5'}`, marginBottom: '2.5rem' }}>
                <span style={{ fontSize: '3rem' }}>{mcqResult.passed ? '🎉' : '📚'}</span>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem', marginBottom: '0.4rem', color: '#39343A' }}>
                  {mcqResult.passed ? 'Assessment Passed!' : 'Assessment Completed'}
                </h2>
                <div style={{ fontSize: '2.6rem', fontWeight: 800, color: mcqResult.passed ? '#2F6C4C' : '#7A3D4C', margin: '0.4rem 0' }}>
                  {mcqResult.percentage}%
                </div>
                <p style={{ fontSize: '1.05rem', color: '#89818A', margin: '0.5rem 0' }}>
                  Score: <strong>{mcqResult.score} / {mcqResult.totalPossible}</strong> • Demonstrated Level: <strong>{mcqResult.demonstratedLevel}</strong>
                </p>
                <div style={{ display: 'inline-block', marginTop: '1rem' }}>
                  <span className={mcqResult.passed ? 'badge badge-verified' : 'badge badge-blush'}>
                    Status Awarded: {mcqResult.verificationStatusAwarded}
                  </span>
                </div>
              </div>

              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '1rem', color: '#39343A' }}>Question Review & Explanations</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                {mcqResult.reviewDetails?.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '1.25rem',
                      borderRadius: '0.75rem',
                      border: `1px solid ${item.isCorrect ? '#B8E4CF' : '#F2CBD5'}`,
                      backgroundColor: item.isCorrect ? '#EBF7F1' : '#FDF4F6'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 700, color: '#39343A' }}>Question {idx + 1}: {item.question}</span>
                      <span style={{ fontWeight: 700, color: item.isCorrect ? '#2F6C4C' : '#7A3D4C' }}>
                        {item.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.88rem', color: '#39343A', marginTop: '0.5rem', padding: '0.75rem', backgroundColor: '#FFFFFF', borderRadius: '0.5rem', border: '1px solid #EFE7E9' }}>
                      <strong style={{ color: '#89818A' }}>Explanation:</strong> {item.explanation}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                <button onClick={() => { setMode('browse'); setMcqResult(null); }} className="btn btn-primary">
                  Return to Skills
                </button>
                <button onClick={() => startPractical(selectedSkill)} className="btn btn-secondary">
                  Take Practical Challenge
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE: PRACTICAL CODING CHALLENGE */}
      {mode === 'practical' && practicalChallenge && (
        <div className="card" style={{ padding: '2rem 2.5rem', borderRadius: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.82rem', color: '#D99AAA', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>PRACTICAL EVALUATION</span>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.25rem 0', color: '#39343A' }}>{practicalChallenge.question}</h2>
              <p style={{ color: '#89818A', margin: 0 }}>
                Language: <strong>{practicalChallenge.practicalDetails?.language?.toUpperCase()}</strong> • Isolated Sandboxed Runner
              </p>
            </div>
            <button onClick={() => setMode('browse')} className="btn btn-secondary btn-sm">
              Back
            </button>
          </div>

          <div style={{ padding: '1.25rem', backgroundColor: '#FFFBFA', borderRadius: '0.75rem', border: '1px solid #EFE7E9', marginBottom: '1.5rem' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#39343A', fontWeight: 700 }}>Problem Statement</h4>
            <p style={{ margin: 0, color: '#89818A', lineHeight: 1.6 }}>
              {practicalChallenge.practicalDetails?.problemStatement}
            </p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">
              Solution Code Editor
            </label>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={14}
              style={{
                width: '100%',
                fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                fontSize: '0.95rem',
                padding: '1rem',
                backgroundColor: '#2D2830',
                color: '#FAF4F6',
                borderRadius: '0.75rem',
                border: '1px solid #4A4050',
                lineHeight: 1.5,
                resize: 'vertical'
              }}
              spellCheck="false"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ fontSize: '0.85rem', color: '#89818A' }}>
              Pass 80%+ test cases to unlock the <strong style={{ color: '#39343A' }}>Skill Verified</strong> badge.
            </div>
            <button
              onClick={submitCode}
              className="btn btn-primary"
              disabled={submittingCode}
              style={{ padding: '0.75rem 2rem' }}
            >
              {submittingCode ? 'Executing in Sandbox...' : 'Run & Verify Code'}
            </button>
          </div>

          {/* Practical Execution Results */}
          {codeResult && (
            <div style={{ marginTop: '2rem', padding: '1.5rem', borderRadius: '0.75rem', border: `1px solid ${codeResult.passed ? '#B8E4CF' : '#F2CBD5'}`, backgroundColor: codeResult.passed ? '#EBF7F1' : '#FDF4F6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, color: codeResult.passed ? '#2F6C4C' : '#7A3D4C', fontWeight: 800 }}>
                  {codeResult.passed ? '✓ Practical Challenge Passed! (Skill Verified)' : 'Challenge Evaluation Complete'}
                </h3>
                <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#39343A' }}>
                  {codeResult.evaluation?.percentage}%
                </span>
              </div>

              <div style={{ fontSize: '0.9rem', marginBottom: '1rem', color: '#89818A' }}>
                Passed {codeResult.evaluation?.score} of {codeResult.evaluation?.total} test cases.
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {codeResult.evaluation?.results?.map((res, i) => (
                  <div key={i} style={{ padding: '0.75rem 1rem', backgroundColor: '#FFFFFF', borderRadius: '0.5rem', border: '1px solid #EFE7E9', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong style={{ color: '#39343A' }}>Test Case #{res.testCaseIndex}</strong>
                      <span style={{ color: res.passed ? '#2F6C4C' : '#7A3D4C', fontWeight: 700 }}>
                        {res.passed ? 'PASSED' : 'FAILED'}
                      </span>
                    </div>
                    {!res.isHidden && (
                      <div style={{ color: '#89818A', marginTop: '0.25rem', fontSize: '0.82rem' }}>
                        Input: <code>{res.input}</code> | Expected: <code>{res.expected}</code> | Output: <code>{res.actual}</code>
                      </div>
                    )}
                    {res.error && (
                      <div style={{ color: '#7A3D4C', marginTop: '0.25rem', fontSize: '0.82rem' }}>
                        Error: {res.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE: ASSESSMENT HISTORY */}
      {mode === 'history' && (
        <div className="card" style={{ padding: '2rem 2.5rem', borderRadius: '1.25rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.25rem', color: '#39343A' }}>Your Assessment Records</h2>

          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#89818A' }}>
              No assessment attempts recorded yet. Select a skill to begin verification!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {history.map(item => (
                <div
                  key={item._id}
                  style={{
                    padding: '1.25rem',
                    borderRadius: '0.75rem',
                    border: '1px solid #EFE7E9',
                    backgroundColor: '#FFFBFA',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#39343A' }}>{item.skill}</span>
                      <span className="badge badge-lavender" style={{ textTransform: 'uppercase' }}>
                        {item.type}
                      </span>
                    </div>
                    <div style={{ color: '#89818A', fontSize: '0.82rem', marginTop: '0.25rem' }}>
                      {new Date(item.createdAt).toLocaleString()} • Demonstrated Level: {item.demonstratedLevel}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: item.passed ? '#2F6C4C' : '#7A3D4C' }}>
                        {item.percentage}%
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#89818A' }}>
                        {item.score} / {item.totalPossible} pts
                      </div>
                    </div>

                    <span className={item.verificationStatusAwarded === 'SKILL_VERIFIED' ? 'badge badge-verified' : 'badge badge-blush'}>
                      {item.verificationStatusAwarded}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default Assessments;
