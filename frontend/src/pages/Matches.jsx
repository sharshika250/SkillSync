import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrainIcon, StarIcon, ChatIcon, SparklesIcon } from '../components/Icons';
import { useSkillSync } from '../context/SkillSyncContext';
import { matchAPI, requestAPI, sessionAPI, reviewAPI } from '../services/api';

const Matches = () => {
  const navigate = useNavigate();
  const { currentUser } = useSkillSync();

  const [matches, setMatches] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedExplanationId, setExpandedExplanationId] = useState(null);

  // Scheduling Modal State
  const [schedulingMatch, setSchedulingMatch] = useState(null);
  const [sessionDate, setSessionDate] = useState('');
  const [sessionTime, setSessionTime] = useState('');
  const [sessionDuration, setSessionDuration] = useState(60);
  const [meetingLink, setMeetingLink] = useState('');
  const [sessionNotes, setSessionNotes] = useState('');
  const [savingSession, setSavingSession] = useState(false);

  // Review Modal State
  const [reviewingMatch, setReviewingMatch] = useState(null);
  const [rating, setRating] = useState(5);
  const [punctuality, setPunctuality] = useState(5);
  const [clarity, setClarity] = useState(5);
  const [helpfulness, setHelpfulness] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [savingReview, setSavingReview] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [matchesRes, recsRes] = await Promise.allSettled([
        matchAPI.getMatches(),
        matchAPI.getRecommendations()
      ]);

      if (matchesRes.status === 'fulfilled' && matchesRes.value?.success) {
        setMatches(matchesRes.value.matches || []);
      }

      if (recsRes.status === 'fulfilled' && recsRes.value?.success) {
        setRecommendations(recsRes.value.recommendations || []);
      }
    } catch (err) {
      setError(err?.message || 'Could not load matches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleConfirmCompletion = async (matchId) => {
    try {
      const res = await requestAPI.confirmCompletion(matchId);
      if (res?.success) {
        alert(res.message);
        await loadData();
      }
    } catch (err) {
      alert(err.message || 'Error confirming completion');
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!schedulingMatch || !sessionDate || !sessionTime) return;

    try {
      setSavingSession(true);
      const res = await sessionAPI.schedule({
        exchangeRequestId: schedulingMatch.requestId,
        date: sessionDate,
        time: sessionTime,
        durationMinutes: sessionDuration,
        meetingLink,
        notes: sessionNotes
      });
      if (res?.success) {
        alert('Exchange session scheduled successfully!');
        setSchedulingMatch(null);
        setSessionDate('');
        setSessionTime('');
        setMeetingLink('');
        setSessionNotes('');
      }
    } catch (err) {
      alert(err.message || 'Error scheduling session');
    } finally {
      setSavingSession(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewingMatch) return;

    try {
      setSavingReview(true);
      const res = await reviewAPI.createReview({
        exchangeRequestId: reviewingMatch.requestId,
        rating: Number(rating),
        criteria: {
          punctuality: Number(punctuality),
          clarity: Number(clarity),
          helpfulness: Number(helpfulness)
        },
        comment: reviewComment
      });
      if (res?.success) {
        alert('Review submitted! Thank you for fostering a trusted learning community.');
        setReviewingMatch(null);
        setReviewComment('');
        await loadData();
      }
    } catch (err) {
      alert(err.message || 'Error submitting review');
    } finally {
      setSavingReview(false);
    }
  };

  return (
    <div style={{ padding: '3.5rem 6%', maxWidth: '1200px', margin: '0 auto' }}>

      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.35rem', color: '#39343A' }}>
            Active Skill Exchanges
          </h1>
          <p style={{ color: '#89818A', fontSize: '1rem' }}>
            Your accepted peer collaborations, schedules, and verified learning partnerships.
          </p>
        </div>
        <div className="badge badge-lavender" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
          <BrainIcon /> Explainable 5-Factor Synergy Engine
        </div>
      </div>

      {error && (
        <div style={{ backgroundColor: '#FDF4F6', border: '1px solid #F2CBD5', color: '#7A3D4C', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <div style={{ display: 'inline-block', width: '36px', height: '36px', border: '3px solid #F5E1E5', borderTop: '3px solid #D99AAA', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ marginTop: '1rem', color: '#89818A' }}>Loading confirmed exchanges...</p>
        </div>
      )}

      {/* Active Matches List */}
      {!loading && (
        <div style={{ marginBottom: '3.5rem' }}>
          {matches.length === 0 ? (
            <div className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🤝</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#39343A' }}>No Active Exchanges Yet</h3>
              <p style={{ color: '#89818A', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
                When you or another member accepts a skill exchange proposal, your confirmed partnership will appear here.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button onClick={() => navigate('/explore')} className="btn btn-primary">
                  Explore Partners
                </button>
                <button onClick={() => navigate('/requests')} className="btn btn-secondary">
                  Check Incoming Requests
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {matches.map((item) => {
                const partner = item.partner || {};
                const partnerName = partner.name || 'Partner';
                const partnerId = partner._id || partner.id;
                const initials = partnerName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

                const isSender = String(partner._id) !== String(currentUser._id || currentUser.id);
                const hasMyConfirmation = isSender ? item.senderConfirmedCompleted : item.receiverConfirmedCompleted;

                return (
                  <div key={item.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>

                    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                      {/* Left Score Column */}
                      <div style={{ width: '130px', minWidth: '120px', background: 'linear-gradient(135deg, #D99AAA, #C68293)', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '1.5rem' }}>
                        <div style={{ fontSize: '2.25rem', fontWeight: 800 }}>{item.matchScore || 85}%</div>
                        <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Synergy</div>
                      </div>

                      {/* Middle Info Column */}
                      <div style={{ flex: 1, minWidth: '260px', padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#F5E1E5', border: '1px solid #F2CBD5', color: '#7A3D4C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                            {initials}
                          </div>
                          <h3 style={{ fontSize: '1.3rem', margin: 0, color: '#39343A' }}>{partnerName}</h3>
                          <span style={{ color: '#89818A', fontSize: '0.85rem' }}>({partner.role || 'Student'})</span>

                          <span className={item.status === 'completed' ? 'badge badge-success' : 'badge badge-lavender'}>
                            {item.status === 'completed' ? '✓ Completed Exchange' : 'Active Exchange'}
                          </span>
                        </div>

                        {/* Exchange Skills Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '0.5rem', marginBottom: '0.75rem' }}>
                          <div>
                            <p style={{ fontSize: '0.75rem', color: '#89818A', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em', marginBottom: '0.2rem' }}>You Are Teaching:</p>
                            <p style={{ fontWeight: 700, color: '#D99AAA', fontSize: '1.05rem', margin: 0 }}>{item.mySkill}</p>
                          </div>
                          <div>
                            <p style={{ fontSize: '0.75rem', color: '#89818A', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em', marginBottom: '0.2rem' }}>Partner Is Teaching:</p>
                            <p style={{ fontWeight: 700, color: '#8E7CB3', fontSize: '1.05rem', margin: 0 }}>{item.partnerSkill}</p>
                          </div>
                        </div>

                        <div style={{ fontSize: '0.8rem', color: '#89818A' }}>
                          Connected since {new Date(item.updatedAt || item.createdAt).toLocaleDateString()}
                          {partner.email && ` • Contact: ${partner.email}`}
                        </div>
                      </div>

                      {/* Right Action Column */}
                      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.6rem', borderLeft: '1px solid #EFE7E9', minWidth: '180px' }}>
                        <button
                          onClick={() => setSchedulingMatch(item)}
                          className="btn btn-secondary btn-sm"
                        >
                          📅 Schedule Session
                        </button>

                        <button
                          onClick={() => navigate(`/messages?partnerId=${partnerId}`)}
                          className="btn btn-ghost btn-sm"
                          style={{ border: '1px solid #EFE7E9' }}
                        >
                          <ChatIcon /> Chat
                        </button>

                        {/* Completion / Review Buttons */}
                        {item.status !== 'completed' ? (
                          <button
                            onClick={() => handleConfirmCompletion(item.requestId)}
                            className="btn btn-primary btn-sm"
                          >
                            {hasMyConfirmation ? 'Waiting for Partner...' : 'Mark Completed'}
                          </button>
                        ) : (
                          <button
                            onClick={() => setReviewingMatch(item)}
                            className="btn btn-primary btn-sm"
                            style={{ backgroundColor: '#E8B878', borderColor: '#E8B878', color: '#39343A' }}
                          >
                            ⭐ Leave Review
                          </button>
                        )}

                        <button
                          onClick={() => setExpandedExplanationId(expandedExplanationId === item.id ? null : item.id)}
                          style={{ background: 'none', border: 'none', color: '#D99AAA', fontSize: '0.75rem', cursor: 'pointer', textAlign: 'center', fontWeight: 700, marginTop: '0.25rem' }}
                        >
                          {expandedExplanationId === item.id ? 'Hide Details ▲' : 'Why this match? ▼'}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Explainable Match Breakdown */}
                    {expandedExplanationId === item.id && (
                      <div style={{ borderTop: '1px solid #EFE7E9', padding: '1.25rem 2rem', backgroundColor: '#FDF4F6', fontSize: '0.85rem' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#39343A', fontWeight: 700 }}>Algorithmic Synergy Factors:</h4>
                        <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#89818A', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                          <li><strong style={{ color: '#39343A' }}>Mutual Reciprocity:</strong> Direct reciprocal exchange opportunity ({item.mySkill} ⇄ {item.partnerSkill}).</li>
                          <li><strong style={{ color: '#39343A' }}>Availability Alignment:</strong> Both members have active flexible schedules.</li>
                          <li><strong style={{ color: '#39343A' }}>Verified Standing:</strong> Partner reputation and verified skill credentials applied to score.</li>
                        </ul>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Recommended Matches Section */}
      {!loading && recommendations.length > 0 && (
        <div style={{ borderTop: '1px solid #EFE7E9', paddingTop: '2.5rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem', color: '#39343A' }}>Recommended Learning Partners</h2>
            <p style={{ color: '#89818A', fontSize: '0.95rem' }}>
              Ranked dynamically by the SkillSync 5-factor compatibility engine
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {recommendations.slice(0, 3).map((rec) => {
              const recId = rec._id || rec.id;
              const initials = rec.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

              return (
                <div key={recId} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#F5E1E5', color: '#7A3D4C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                          {initials}
                        </div>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#39343A' }}>{rec.name}</h4>
                          <span style={{ fontSize: '0.8rem', color: '#89818A' }}>{rec.role || 'Student'}</span>
                        </div>
                      </div>
                      <span className="badge badge-blush">
                        {rec.matchScore}% Synergy
                      </span>
                    </div>

                    {/* Explanations bullets */}
                    {rec.matchDetails?.explanations && rec.matchDetails.explanations.length > 0 && (
                      <div style={{ padding: '0.5rem 0.75rem', backgroundColor: '#F6F3FA', borderRadius: '0.5rem', border: '1px solid #EAE5F4', fontSize: '0.76rem', color: '#554471', marginBottom: '0.75rem' }}>
                        {rec.matchDetails.explanations[0]}
                      </div>
                    )}

                    <div style={{ marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.72rem', color: '#89818A', textTransform: 'uppercase', fontWeight: 700 }}>Offers:</span>
                      <p style={{ color: '#D99AAA', fontWeight: 600, fontSize: '0.9rem', margin: '0.1rem 0 0 0' }}>
                        {rec.skillsOffered?.join(', ') || 'N/A'}
                      </p>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <span style={{ fontSize: '0.72rem', color: '#89818A', textTransform: 'uppercase', fontWeight: 700 }}>Wants:</span>
                      <p style={{ color: '#8E7CB3', fontWeight: 600, fontSize: '0.9rem', margin: '0.1rem 0 0 0' }}>
                        {rec.skillsWanted?.join(', ') || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <button
                      onClick={() => navigate(`/partner/${recId}`)}
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1 }}
                    >
                      Profile
                    </button>
                    <button
                      onClick={() => navigate('/request', { state: { partner: rec } })}
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1.2 }}
                    >
                      Propose Exchange
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SCHEDULING MODAL */}
      {schedulingMatch && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(57, 52, 58, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '2rem', borderRadius: '1.25rem', boxShadow: 'var(--shadow-lg)' }}>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: 0, marginBottom: '0.35rem', color: '#39343A' }}>Schedule Exchange Session</h3>
            <p style={{ color: '#89818A', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
              Partner: <strong>{schedulingMatch.partner?.name}</strong> • Trading {schedulingMatch.mySkill} for {schedulingMatch.partnerSkill}
            </p>

            <form onSubmit={handleScheduleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Date *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Time *</label>
                  <input
                    type="time"
                    className="form-input"
                    value={sessionTime}
                    onChange={(e) => setSessionTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Duration</label>
                <select
                  value={sessionDuration}
                  onChange={(e) => setSessionDuration(Number(e.target.value))}
                  className="form-select"
                >
                  <option value={30}>30 Minutes</option>
                  <option value={45}>45 Minutes</option>
                  <option value={60}>60 Minutes (Standard)</option>
                  <option value={90}>90 Minutes</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Meeting Link</label>
                <input
                  type="url"
                  placeholder="e.g. Google Meet or Zoom URL"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Agenda / Notes</label>
                <textarea
                  placeholder="Topics to cover during this exchange..."
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  className="form-textarea"
                  rows={2}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setSchedulingMatch(null)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={savingSession}>
                  {savingSession ? 'Scheduling...' : 'Confirm Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REVIEW MODAL */}
      {reviewingMatch && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(57, 52, 58, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '2rem', borderRadius: '1.25rem', boxShadow: 'var(--shadow-lg)' }}>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: 0, marginBottom: '0.35rem', color: '#39343A' }}>Review Exchange Partner</h3>
            <p style={{ color: '#89818A', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
              Partner: <strong>{reviewingMatch.partner?.name}</strong> • Taught: {reviewingMatch.partnerSkill}
            </p>

            <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="form-label">Overall Star Rating</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem' }}
                    >
                      <StarIcon filled={star <= rating} size={28} />
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Punctuality</label>
                  <select value={punctuality} onChange={(e) => setPunctuality(e.target.value)} className="form-select" style={{ padding: '0.4rem 0.6rem', fontSize: '0.82rem' }}>
                    <option value={5}>5 - Excellent</option>
                    <option value={4}>4 - Good</option>
                    <option value={3}>3 - Average</option>
                    <option value={2}>2 - Late</option>
                    <option value={1}>1 - Poor</option>
                  </select>
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Clarity</label>
                  <select value={clarity} onChange={(e) => setClarity(e.target.value)} className="form-select" style={{ padding: '0.4rem 0.6rem', fontSize: '0.82rem' }}>
                    <option value={5}>5 - Clear</option>
                    <option value={4}>4 - Good</option>
                    <option value={3}>3 - Average</option>
                    <option value={2}>2 - Confusing</option>
                    <option value={1}>1 - Poor</option>
                  </select>
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Helpfulness</label>
                  <select value={helpfulness} onChange={(e) => setHelpfulness(e.target.value)} className="form-select" style={{ padding: '0.4rem 0.6rem', fontSize: '0.82rem' }}>
                    <option value={5}>5 - Super</option>
                    <option value={4}>4 - Helpful</option>
                    <option value={3}>3 - Average</option>
                    <option value={2}>2 - Little</option>
                    <option value={1}>1 - None</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Written Feedback</label>
                <textarea
                  placeholder="Share details about their teaching style and mentorship..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="form-textarea"
                  rows={3}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setReviewingMatch(null)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={savingReview}>
                  {savingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Matches;
