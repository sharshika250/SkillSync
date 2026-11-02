import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { useSkillSync } from '../context/SkillSyncContext';
import { ShieldCheckIcon } from '../components/Icons';

const Admin = () => {
  const { currentUser } = useSkillSync();
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'users' | 'reports' | 'question'

  // Question creator form state
  const [newSkill, setNewSkill] = useState('Python');
  const [newDifficulty, setNewDifficulty] = useState('Intermediate');
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newOptions, setNewOptions] = useState(['', '', '', '']);
  const [correctOptionIndex, setCorrectOptionIndex] = useState(0);
  const [newExplanation, setNewExplanation] = useState('');
  const [savingQuestion, setSavingQuestion] = useState(false);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      setError('');
      const [analyticsRes, usersRes, reportsRes] = await Promise.allSettled([
        adminAPI.getAnalytics(),
        adminAPI.getUsers(),
        adminAPI.getReports()
      ]);

      if (analyticsRes.status === 'fulfilled' && analyticsRes.value?.success) {
        setAnalytics(analyticsRes.value.analytics);
      }
      if (usersRes.status === 'fulfilled' && usersRes.value?.success) {
        setUsers(usersRes.value.users || []);
      }
      if (reportsRes.status === 'fulfilled' && reportsRes.value?.success) {
        setReports(reportsRes.value.reports || []);
      }
    } catch (err) {
      setError(err.message || 'Error fetching admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSuspension = async (userId) => {
    try {
      const res = await adminAPI.toggleSuspension(userId);
      if (res?.success) {
        setUsers(users.map(u => u._id === userId ? { ...u, isSuspended: res.isSuspended } : u));
      }
    } catch (err) {
      alert(err.message || 'Error updating suspension status');
    }
  };

  const handleResolveReport = async (reportId, status) => {
    try {
      const res = await adminAPI.resolveReport(reportId, status, `Reviewed and marked ${status} by admin.`);
      if (res?.success) {
        setReports(reports.map(r => r._id === reportId ? { ...r, status } : r));
      }
    } catch (err) {
      alert(err.message || 'Error resolving report');
    }
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    if (!newSkill || !newQuestionText.trim()) return;

    try {
      setSavingQuestion(true);
      const res = await adminAPI.createAssessment({
        skill: newSkill,
        difficulty: newDifficulty,
        type: 'mcq',
        question: newQuestionText.trim(),
        options: newOptions.filter(o => o.trim()),
        correctOptionIndex: Number(correctOptionIndex),
        explanation: newExplanation.trim()
      });

      if (res?.success) {
        alert('Assessment question created successfully!');
        setNewQuestionText('');
        setNewOptions(['', '', '', '']);
        setNewExplanation('');
        await loadAdminData();
      }
    } catch (err) {
      alert(err.message || 'Failed to create assessment question');
    } finally {
      setSavingQuestion(false);
    }
  };

  if (!currentUser?.isAdmin && currentUser?.role !== 'Admin') {
    return (
      <div style={{ padding: '4rem 6%', textAlign: 'center' }}>
        <h2 style={{ color: '#7A3D4C', fontWeight: 800 }}>Access Restricted</h2>
        <p style={{ color: '#89818A' }}>Administrator credentials required to access this portal.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '3.5rem 6%', maxWidth: '1240px', margin: '0 auto' }}>

      {/* Banner */}
      <div style={{ background: 'linear-gradient(135deg, #2D2830 0%, #3D3540 100%)', color: 'white', borderRadius: '1.25rem', padding: '2.25rem 2.5rem', marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', boxShadow: 'var(--shadow-md)' }}>
        <div>
          <span style={{ fontSize: '0.8rem', color: '#D99AAA', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Administrator Command Center
          </span>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginTop: '0.35rem', marginBottom: '0.4rem', color: '#FFFFFF' }}>
            Platform Governance & Analytics
          </h1>
          <p style={{ color: '#C8BFC7', margin: 0, fontSize: '0.96rem' }}>
            Monitor platform metrics, moderate accounts, evaluate user reports, and manage verified assessment questions.
          </p>
        </div>
      </div>

      {error && (
        <div style={{ padding: '1rem 1.25rem', backgroundColor: '#FDF4F6', border: '1px solid #F2CBD5', color: '#7A3D4C', borderRadius: '0.75rem', marginBottom: '1.5rem', fontSize: '0.92rem' }}>
          {error}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid #EFE7E9', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {[
          { key: 'analytics', label: 'Overview Analytics' },
          { key: 'users', label: `User Management (${users.length})` },
          { key: 'reports', label: `Reports & Moderation (${reports.length})` },
          { key: 'question', label: '+ Add Assessment Question' }
        ].map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '0.75rem 1.25rem',
                background: 'none',
                border: 'none',
                borderBottom: isActive ? '3px solid #D99AAA' : '3px solid transparent',
                color: isActive ? '#39343A' : '#89818A',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                fontSize: '0.96rem',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: ANALYTICS */}
      {activeTab === 'analytics' && analytics && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <div className="metric-card">
              <div style={{ fontSize: '0.78rem', color: '#89818A', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Total Registered Members</div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#D99AAA', marginTop: '0.35rem' }}>
                {analytics.totalUsers}
              </div>
            </div>
            <div className="metric-card">
              <div style={{ fontSize: '0.78rem', color: '#89818A', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Verified Skills Conferred</div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#5E9E7C', marginTop: '0.35rem' }}>
                {analytics.verifiedSkillsCount}
              </div>
            </div>
            <div className="metric-card">
              <div style={{ fontSize: '0.78rem', color: '#89818A', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Completed Peer Exchanges</div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#8E7CB3', marginTop: '0.35rem' }}>
                {analytics.completedExchanges}
              </div>
            </div>
            <div className="metric-card">
              <div style={{ fontSize: '0.78rem', color: '#89818A', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Avg Platform Rating</div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#C28766', marginTop: '0.35rem' }}>
                ★ {analytics.averagePlatformRating}
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: 800, color: '#39343A' }}>Most Popular Skills Offered Across Community</h3>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {analytics.popularSkills?.map((s, idx) => (
                <div key={idx} className="badge badge-blush" style={{ padding: '0.55rem 1rem', fontSize: '0.88rem' }}>
                  {s.skill}: <strong style={{ marginLeft: '0.35rem' }}>{s.count} members</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#FFFBFA', borderBottom: '1px solid #EFE7E9', color: '#89818A' }}>
                <th style={{ padding: '1rem 1.25rem' }}>Member</th>
                <th style={{ padding: '1rem 1.25rem' }}>Role</th>
                <th style={{ padding: '1rem 1.25rem' }}>Skills Offered</th>
                <th style={{ padding: '1rem 1.25rem' }}>Trust Score</th>
                <th style={{ padding: '1rem 1.25rem' }}>Status</th>
                <th style={{ padding: '1rem 1.25rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} style={{ borderBottom: '1px solid #F7F1F3' }}>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ fontWeight: 700, color: '#39343A' }}>{u.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#89818A' }}>{u.email}</div>
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>{u.isAdmin ? 'Admin' : (u.role || 'Student')}</td>
                  <td style={{ padding: '1rem 1.25rem' }}>{u.skillsOffered?.slice(0, 3).join(', ') || 'None'}</td>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 800, color: '#D99AAA' }}>{u.trustScore}%</td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span className={u.isSuspended ? 'badge badge-blush' : 'badge badge-success'}>
                      {u.isSuspended ? 'Suspended' : 'Active'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <button
                      onClick={() => handleToggleSuspension(u._id)}
                      disabled={u._id === currentUser._id}
                      className="btn btn-secondary btn-sm"
                      style={{
                        cursor: u._id === currentUser._id ? 'not-allowed' : 'pointer',
                        color: u.isSuspended ? '#2F6C4C' : '#7A3D4C'
                      }}
                    >
                      {u.isSuspended ? 'Reactivate' : 'Suspend'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: REPORTS & MODERATION */}
      {activeTab === 'reports' && (
        <div className="card" style={{ padding: '2rem' }}>
          {reports.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#89818A' }}>
              No user reports pending review.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {reports.map(r => (
                <div key={r._id} style={{ padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #EFE7E9', backgroundColor: '#FFFBFA' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '1rem', color: '#39343A' }}>Reason: {r.reason}</span>
                    <span className="badge badge-lavender">
                      Status: {r.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#89818A', marginBottom: '0.5rem' }}>
                    Reported Member: <strong>{r.reportedUser?.name} ({r.reportedUser?.email})</strong> • Reported by: {r.reporter?.name}
                  </div>
                  <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#39343A' }}>
                    {r.details || 'No additional details provided.'}
                  </p>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                      onClick={() => handleResolveReport(r._id, 'resolved')}
                      className="btn btn-primary btn-sm"
                    >
                      Mark Resolved
                    </button>
                    <button
                      onClick={() => handleResolveReport(r._id, 'dismissed')}
                      className="btn btn-secondary btn-sm"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ADD ASSESSMENT QUESTION */}
      {activeTab === 'question' && (
        <div className="card" style={{ padding: '2.5rem', borderRadius: '1.25rem' }}>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: 0, marginBottom: '1.5rem', color: '#39343A' }}>Add Verified Assessment Question</h3>

          <form onSubmit={handleCreateQuestion} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '700px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Skill *</label>
                <input
                  type="text"
                  placeholder="e.g. Python, Java, React"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Difficulty</label>
                <select
                  value={newDifficulty}
                  onChange={(e) => setNewDifficulty(e.target.value)}
                  className="form-select"
                >
                  <option value="Basic">Basic</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Question Text *</label>
              <textarea
                placeholder="Enter question statement..."
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                required
                rows={3}
                className="form-textarea"
              />
            </div>

            <div>
              <label className="form-label">Multiple Choice Options</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {newOptions.map((opt, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <input
                      type="radio"
                      name="correctOption"
                      checked={correctOptionIndex === i}
                      onChange={() => setCorrectOptionIndex(i)}
                      title="Select as correct option"
                      style={{ accentColor: '#D99AAA', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      placeholder={`Option ${i + 1}`}
                      value={opt}
                      onChange={(e) => {
                        const copy = [...newOptions];
                        copy[i] = e.target.value;
                        setNewOptions(copy);
                      }}
                      className="form-input"
                      required
                    />
                  </div>
                ))}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#89818A', marginTop: '0.35rem' }}>
                Select the radio button corresponding to the correct answer.
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Explanation</label>
              <textarea
                placeholder="Explain why this option is correct..."
                value={newExplanation}
                onChange={(e) => setNewExplanation(e.target.value)}
                rows={2}
                className="form-textarea"
              />
            </div>

            <div>
              <button type="submit" className="btn btn-primary" disabled={savingQuestion} style={{ padding: '0.75rem 2rem' }}>
                {savingQuestion ? 'Saving Question...' : 'Save Question to Bank'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default Admin;
