import React, { useState, useEffect } from 'react';
import { learningAPI, aiAPI } from '../services/api';
import { useSkillSync } from '../context/SkillSyncContext';
import { BookOpenIcon, SparklesIcon } from '../components/Icons';

const Learning = () => {
  const { currentUser } = useSkillSync();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals & Panels
  const [activeTab, setActiveTab] = useState('goals'); // 'goals' | 'roadmap' | 'gap' | 'assistant'
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [newCurrentProf, setNewCurrentProf] = useState('Beginner');
  const [newTargetProf, setNewTargetProf] = useState('Advanced');
  const [newTargetDate, setNewTargetDate] = useState('');
  const [newMilestonesText, setNewMilestonesText] = useState('');

  // Journal form state
  const [selectedGoalForJournal, setSelectedGoalForJournal] = useState(null);
  const [journalNote, setJournalNote] = useState('');

  // AI Roadmap state
  const [roadmapSkill, setRoadmapSkill] = useState('Python');
  const [roadmapData, setRoadmapData] = useState(null);
  const [loadingRoadmap, setLoadingRoadmap] = useState(false);

  // AI Gap Analysis state
  const [gapSkill, setGapSkill] = useState('Python');
  const [gapData, setGapData] = useState(null);
  const [loadingGap, setLoadingGap] = useState(false);

  // AI Assistant state
  const [assistantQuery, setAssistantQuery] = useState('');
  const [assistantHistory, setAssistantHistory] = useState([]);
  const [loadingAssistant, setLoadingAssistant] = useState(false);

  useEffect(() => {
    loadLearningData();
  }, []);

  const loadLearningData = async () => {
    try {
      setLoading(true);
      const res = await learningAPI.getSummary();
      if (res?.success) {
        setSummary(res);
        if (res.skillsWanted && res.skillsWanted.length > 0) {
          setRoadmapSkill(res.skillsWanted[0]);
          setGapSkill(res.skillsWanted[0]);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load learning data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;

    const milestones = newMilestonesText
      .split('\n')
      .map(m => m.trim())
      .filter(Boolean);

    try {
      const res = await learningAPI.createGoal({
        skill: newSkill.trim(),
        currentProficiency: newCurrentProf,
        targetProficiency: newTargetProf,
        targetDate: newTargetDate,
        milestones
      });
      if (res?.success) {
        setShowGoalModal(false);
        setNewSkill('');
        setNewMilestonesText('');
        await loadLearningData();
      }
    } catch (err) {
      alert(err.message || 'Error creating goal');
    }
  };

  const handleToggleMilestone = async (goalId, milestoneId) => {
    try {
      await learningAPI.toggleMilestone(goalId, milestoneId);
      await loadLearningData();
    } catch (err) {
      alert(err.message || 'Error toggling milestone');
    }
  };

  const handleAddJournal = async (e) => {
    e.preventDefault();
    if (!journalNote.trim() || !selectedGoalForJournal) return;

    try {
      await learningAPI.addJournalEntry(selectedGoalForJournal, journalNote);
      setJournalNote('');
      setSelectedGoalForJournal(null);
      await loadLearningData();
    } catch (err) {
      alert(err.message || 'Error adding journal note');
    }
  };

  const handleGenerateRoadmap = async () => {
    if (!roadmapSkill) return;
    try {
      setLoadingRoadmap(true);
      const res = await aiAPI.getRoadmap(roadmapSkill);
      if (res?.success) {
        setRoadmapData(res);
      }
    } catch (err) {
      alert(err.message || 'Error generating roadmap');
    } finally {
      setLoadingRoadmap(false);
    }
  };

  const handleAnalyzeGap = async () => {
    if (!gapSkill) return;
    try {
      setLoadingGap(true);
      const res = await aiAPI.analyzeGap(gapSkill);
      if (res?.success) {
        setGapData(res);
      }
    } catch (err) {
      alert(err.message || 'Error analyzing gap');
    } finally {
      setLoadingGap(false);
    }
  };

  const handleAskAssistant = async (e) => {
    e.preventDefault();
    if (!assistantQuery.trim()) return;

    const queryText = assistantQuery.trim();
    setAssistantQuery('');
    try {
      setLoadingAssistant(true);
      const res = await aiAPI.askAssistant(roadmapSkill || 'General', queryText);
      if (res?.success) {
        setAssistantHistory(prev => [...prev, { query: queryText, answer: res.answer }]);
      }
    } catch (err) {
      alert(err.message || 'Assistant response failed');
    } finally {
      setLoadingAssistant(false);
    }
  };

  return (
    <div style={{ padding: '3.5rem 6%', maxWidth: '1240px', margin: '0 auto' }}>

      {/* Header Banner */}
      <div className="card" style={{ padding: '2.25rem 2.5rem', marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', background: 'radial-gradient(circle at top right, #FDF4F6 0%, #FFFFFF 65%)' }}>
        <div>
          <span className="badge badge-blush" style={{ marginBottom: '0.65rem' }}>
            <BookOpenIcon /> Learning Management & AI
          </span>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginTop: '0.35rem', marginBottom: '0.4rem', color: '#39343A' }}>
            Track Your Learning Journey & Milestones
          </h1>
          <p style={{ color: '#89818A', fontSize: '0.98rem', margin: 0, maxWidth: '750px' }}>
            Set structured goals, record reflective journal entries, visualize AI curricula, and address skill gaps with precision.
          </p>
        </div>

        <button
          onClick={() => setShowGoalModal(true)}
          className="btn btn-primary"
        >
          + Set New Learning Goal
        </button>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <div className="metric-card">
          <div style={{ fontSize: '0.78rem', color: '#89818A', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Skills to Learn</div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#D99AAA', marginTop: '0.25rem' }}>
            {summary?.skillsWanted?.length || 0}
          </div>
        </div>
        <div className="metric-card">
          <div style={{ fontSize: '0.78rem', color: '#89818A', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Active Goals</div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#8E7CB3', marginTop: '0.25rem' }}>
            {summary?.goals?.filter(g => g.status === 'in_progress').length || 0}
          </div>
        </div>
        <div className="metric-card">
          <div style={{ fontSize: '0.78rem', color: '#89818A', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Completed Exchanges</div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#5E9E7C', marginTop: '0.25rem' }}>
            {summary?.completedExchangesCount || 0}
          </div>
        </div>
        <div className="metric-card">
          <div style={{ fontSize: '0.78rem', color: '#89818A', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Upcoming Sessions</div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#C28766', marginTop: '0.25rem' }}>
            {summary?.upcomingSessions?.length || 0}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid #EFE7E9', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {[
          { key: 'goals', label: 'My Goals & Journal' },
          { key: 'roadmap', label: 'AI Learning Roadmap', icon: <SparklesIcon /> },
          { key: 'gap', label: 'Skill Gap Analysis' },
          { key: 'assistant', label: 'AI Learning Assistant' }
        ].map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                if (tab.key === 'roadmap' && !roadmapData) handleGenerateRoadmap();
                if (tab.key === 'gap' && !gapData) handleAnalyzeGap();
              }}
              style={{
                padding: '0.75rem 1.25rem',
                background: 'none',
                border: 'none',
                borderBottom: isActive ? '3px solid #D99AAA' : '3px solid transparent',
                color: isActive ? '#39343A' : '#89818A',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                fontSize: '0.96rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: GOALS & JOURNAL */}
      {activeTab === 'goals' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
          {summary?.goals?.length === 0 ? (
            <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3.5rem 2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.4rem', color: '#39343A' }}>No Learning Goals Set Yet</h3>
              <p style={{ color: '#89818A', marginBottom: '1.5rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
                Create structured milestones to guide your progress and peer exchanges.
              </p>
              <button onClick={() => setShowGoalModal(true)} className="btn btn-primary btn-sm">
                Create First Goal
              </button>
            </div>
          ) : (
            summary?.goals?.map(goal => {
              const completedCount = goal.milestones?.filter(m => m.completed).length || 0;
              const totalMilestones = goal.milestones?.length || 0;
              const progressPct = totalMilestones > 0 ? Math.round((completedCount / totalMilestones) * 100) : 0;

              return (
                <div
                  key={goal._id}
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
                      <div>
                        <h3 style={{ fontSize: '1.3rem', margin: 0, color: '#39343A', fontWeight: 800 }}>{goal.skill}</h3>
                        <div style={{ fontSize: '0.82rem', color: '#89818A', marginTop: '0.25rem' }}>
                          {goal.currentProficiency} → {goal.targetProficiency} {goal.targetDate ? `• By ${goal.targetDate}` : ''}
                        </div>
                      </div>
                      <span className={goal.status === 'completed' ? 'badge badge-success' : 'badge badge-lavender'}>
                        {goal.status === 'completed' ? 'Completed' : 'In Progress'}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#89818A', marginBottom: '0.35rem', fontWeight: 600 }}>
                        <span>Progress</span>
                        <span>{progressPct}% ({completedCount}/{totalMilestones})</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', backgroundColor: '#F5E1E5', borderRadius: '9999px', overflow: 'hidden' }}>
                        <div style={{ width: `${progressPct}%`, height: '100%', backgroundColor: '#D99AAA', transition: 'width 0.3s ease', borderRadius: '9999px' }} />
                      </div>
                    </div>

                    {/* Milestones Checklist */}
                    <div style={{ marginBottom: '1.5rem' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.86rem', marginBottom: '0.6rem', color: '#39343A' }}>Milestones:</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {goal.milestones?.map(m => (
                          <label
                            key={m._id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.6rem',
                              fontSize: '0.86rem',
                              cursor: 'pointer',
                              color: m.completed ? '#89818A' : '#39343A',
                              textDecoration: m.completed ? 'line-through' : 'none'
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={m.completed}
                              onChange={() => handleToggleMilestone(goal._id, m._id)}
                              style={{ accentColor: '#D99AAA', cursor: 'pointer' }}
                            />
                            <span>{m.title}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Learning Journal */}
                  <div style={{ borderTop: '1px solid #EFE7E9', paddingTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#39343A' }}>Journal Entries ({goal.journal?.length || 0})</span>
                      <button
                        onClick={() => setSelectedGoalForJournal(selectedGoalForJournal === goal._id ? null : goal._id)}
                        style={{ background: 'none', border: 'none', color: '#D99AAA', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        {selectedGoalForJournal === goal._id ? 'Cancel' : '+ Add Note'}
                      </button>
                    </div>

                    {selectedGoalForJournal === goal._id && (
                      <form onSubmit={handleAddJournal} style={{ marginBottom: '1rem' }}>
                        <textarea
                          placeholder="What did you learn or practice today?"
                          value={journalNote}
                          onChange={(e) => setJournalNote(e.target.value)}
                          rows={2}
                          className="form-textarea"
                          style={{ marginBottom: '0.5rem', minHeight: '60px' }}
                        />
                        <button type="submit" className="btn btn-primary btn-sm">
                          Save Reflection
                        </button>
                      </form>
                    )}

                    <div style={{ maxHeight: '120px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {goal.journal?.slice(0, 3).map((j, idx) => (
                        <div key={idx} style={{ padding: '0.5rem 0.75rem', backgroundColor: '#FDF4F6', borderRadius: '0.5rem', fontSize: '0.8rem', borderLeft: '3px solid #D99AAA' }}>
                          <div style={{ color: '#39343A' }}>{j.note}</div>
                          <div style={{ fontSize: '0.7rem', color: '#89818A', marginTop: '2px' }}>
                            {new Date(j.date).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: AI LEARNING ROADMAP */}
      {activeTab === 'roadmap' && (
        <div className="card" style={{ padding: '2rem 2.5rem', borderRadius: '1.25rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#39343A' }}>Select Skill:</span>
            <select
              value={roadmapSkill}
              onChange={(e) => setRoadmapSkill(e.target.value)}
              className="form-select"
              style={{ width: 'auto' }}
            >
              {['Python', 'Java', 'React', 'JavaScript', 'Data Science', 'UI/UX Design'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button
              onClick={handleGenerateRoadmap}
              className="btn btn-primary btn-sm"
              disabled={loadingRoadmap}
            >
              {loadingRoadmap ? 'Generating...' : 'Generate Roadmap'}
            </button>
          </div>

          {roadmapData && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '0 0 0.25rem 0', color: '#39343A' }}>
                  {roadmapData.skill} Complete Mastery Roadmap
                </h3>
                <span style={{ fontSize: '0.82rem', color: '#89818A' }}>
                  {roadmapData.generatedBy}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {roadmapData.roadmap?.map((stage, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '1.5rem',
                      borderRadius: '0.75rem',
                      border: '1px solid #EFE7E9',
                      backgroundColor: '#FFFBFA',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <span style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#D99AAA', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.82rem' }}>
                        {stage.stage}
                      </span>
                      <h4 style={{ margin: 0, fontSize: '1.15rem', color: '#39343A' }}>{stage.title}</h4>
                    </div>

                    <ul style={{ margin: 0, paddingLeft: '2.5rem', color: '#89818A', fontSize: '0.92rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      {stage.topics?.map((topic, i) => (
                        <li key={i}>{topic}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SKILL GAP ANALYSIS */}
      {activeTab === 'gap' && (
        <div className="card" style={{ padding: '2rem 2.5rem', borderRadius: '1.25rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#39343A' }}>Select Skill for Analysis:</span>
            <select
              value={gapSkill}
              onChange={(e) => setGapSkill(e.target.value)}
              className="form-select"
              style={{ width: 'auto' }}
            >
              {(currentUser?.skillsOffered || ['Python', 'Java', 'React']).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button
              onClick={handleAnalyzeGap}
              className="btn btn-primary btn-sm"
              disabled={loadingGap}
            >
              {loadingGap ? 'Analyzing...' : 'Run Gap Analysis'}
            </button>
          </div>

          {gapData && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ padding: '1.25rem', backgroundColor: '#FFFBFA', borderRadius: '0.75rem', border: '1px solid #EFE7E9' }}>
                  <div style={{ fontSize: '0.78rem', color: '#89818A', textTransform: 'uppercase', fontWeight: 700 }}>Claimed Proficiency</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.25rem', color: '#39343A' }}>{gapData.claimedProficiency}</div>
                </div>
                <div style={{ padding: '1.25rem', backgroundColor: '#FFFBFA', borderRadius: '0.75rem', border: '1px solid #EFE7E9' }}>
                  <div style={{ fontSize: '0.78rem', color: '#89818A', textTransform: 'uppercase', fontWeight: 700 }}>Demonstrated Proficiency</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: gapData.isVerified ? '#2F6C4C' : '#D99AAA', marginTop: '0.25rem' }}>
                    {gapData.demonstratedProficiency}
                  </div>
                </div>
                <div style={{ padding: '1.25rem', backgroundColor: '#FFFBFA', borderRadius: '0.75rem', border: '1px solid #EFE7E9' }}>
                  <div style={{ fontSize: '0.78rem', color: '#89818A', textTransform: 'uppercase', fontWeight: 700 }}>Verified Assessment Score</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.25rem', color: '#39343A' }}>
                    {gapData.assessmentScore > 0 ? `${gapData.assessmentScore}%` : 'Not Taken'}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem', color: '#7A3D4C' }}>Identified Skill Gaps</h4>
                <ul style={{ paddingLeft: '1.5rem', color: '#7A3D4C' }}>
                  {gapData.gaps?.map((gap, i) => (
                    <li key={i} style={{ marginBottom: '0.4rem' }}>{gap}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem', color: '#2F6C4C' }}>Recommended Action Steps</h4>
                <ul style={{ paddingLeft: '1.5rem', color: '#2F6C4C' }}>
                  {gapData.recommendations?.map((rec, i) => (
                    <li key={i} style={{ marginBottom: '0.4rem' }}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: AI LEARNING ASSISTANT */}
      {activeTab === 'assistant' && (
        <div className="card" style={{ padding: '2rem 2.5rem', borderRadius: '1.25rem' }}>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.35rem', color: '#39343A' }}>SkillSync Learning Assistant</h3>
          <p style={{ color: '#89818A', marginBottom: '1.5rem', fontSize: '0.92rem' }}>
            Ask pedagogical questions about concepts, practice advice, or assessment prep.
          </p>

          <div style={{ minHeight: '220px', maxHeight: '380px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem', padding: '1.25rem', backgroundColor: '#FFFBFA', borderRadius: '0.75rem', border: '1px solid #EFE7E9' }}>
            {assistantHistory.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#89818A', margin: 'auto', fontSize: '0.92rem' }}>
                Ask a question like "How can I prepare for the Python assessment?" or "What is the difference between synchronous and asynchronous code?"
              </div>
            ) : (
              assistantHistory.map((h, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ alignSelf: 'flex-end', backgroundColor: '#D99AAA', color: 'white', padding: '0.65rem 1rem', borderRadius: '1rem 1rem 0 1rem', maxWidth: '75%', fontSize: '0.9rem', fontWeight: 600 }}>
                    {h.query}
                  </div>
                  <div style={{ alignSelf: 'flex-start', backgroundColor: '#FFFFFF', border: '1px solid #EFE7E9', color: '#39343A', padding: '0.75rem 1rem', borderRadius: '1rem 1rem 1rem 0', maxWidth: '80%', fontSize: '0.9rem', lineHeight: 1.55 }}>
                    {h.answer}
                  </div>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleAskAssistant} style={{ display: 'flex', gap: '0.75rem' }}>
            <input
              type="text"
              placeholder="Ask the learning assistant anything..."
              value={assistantQuery}
              onChange={(e) => setAssistantQuery(e.target.value)}
              className="form-input"
              style={{ flex: 1 }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loadingAssistant || !assistantQuery.trim()}
              style={{ padding: '0.75rem 1.75rem' }}
            >
              {loadingAssistant ? 'Thinking...' : 'Send'}
            </button>
          </form>
        </div>
      )}

      {/* CREATE GOAL MODAL */}
      {showGoalModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(57, 52, 58, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '500px', width: '100%', padding: '2rem', borderRadius: '1.25rem', boxShadow: 'var(--shadow-lg)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: 0, marginBottom: '1.25rem', color: '#39343A' }}>Create Learning Goal</h3>
            <form onSubmit={handleCreateGoal} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Target Skill *</label>
                <input
                  type="text"
                  placeholder="e.g. Java, Python, React, UI/UX"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  required
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Current Level</label>
                  <select
                    value={newCurrentProf}
                    onChange={(e) => setNewCurrentProf(e.target.value)}
                    className="form-select"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Target Level</label>
                  <select
                    value={newTargetProf}
                    onChange={(e) => setNewTargetProf(e.target.value)}
                    className="form-select"
                  >
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Target Completion Date</label>
                <input
                  type="date"
                  value={newTargetDate}
                  onChange={(e) => setNewTargetDate(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  Custom Milestones (1 per line, optional)
                </label>
                <textarea
                  placeholder="Master core syntax&#10;Build practice project&#10;Complete peer exchange&#10;Pass skill verification"
                  value={newMilestonesText}
                  onChange={(e) => setNewMilestonesText(e.target.value)}
                  rows={4}
                  className="form-textarea"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowGoalModal(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Learning;
