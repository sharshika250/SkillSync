import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userAPI, reviewAPI, adminAPI } from '../services/api';
import { useSkillSync } from '../context/SkillSyncContext';
import { HandshakeIcon, StarIcon, ChatIcon } from '../components/Icons';

const PartnerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useSkillSync();

  const [partner, setPartner] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Report modal state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('fake_skill');
  const [reportDetails, setReportDetails] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  useEffect(() => {
    const fetchPartner = async () => {
      try {
        setLoading(true);
        setError('');
        const [userRes, reviewsRes] = await Promise.allSettled([
          userAPI.getUserById(id),
          reviewAPI.getUserReviews(id)
        ]);

        if (userRes.status === 'fulfilled' && userRes.value?.success && userRes.value.user) {
          setPartner(userRes.value.user);
        } else {
          setError('User profile not found');
        }

        if (reviewsRes.status === 'fulfilled' && reviewsRes.value?.success) {
          setReviews(reviewsRes.value.reviews || []);
          setAvgRating(reviewsRes.value.averageRating || 0);
        }
      } catch (err) {
        setError(err?.message || 'Could not load partner profile');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPartner();
    }
  }, [id]);

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      setSubmittingReport(true);
      const res = await adminAPI.createReport(partner._id || partner.id, reportReason, reportDetails);
      if (res?.success) {
        alert('Report submitted for administrator review. Thank you for keeping SkillSync safe.');
        setShowReportModal(false);
        setReportDetails('');
      }
    } catch (err) {
      alert(err.message || 'Error submitting report');
    } finally {
      setSubmittingReport(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '4rem 6%', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', width: '36px', height: '36px', border: '3px solid #F5E1E5', borderTop: '3px solid #D99AAA', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ marginTop: '1rem', color: '#89818A' }}>Loading partner profile...</p>
      </div>
    );
  }

  if (error || !partner) {
    return (
      <div style={{ padding: '4rem 6%', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '1rem', color: '#7A3D4C', fontWeight: 800 }}>Profile Not Found</h2>
        <p style={{ color: '#89818A', marginBottom: '2rem' }}>{error || 'The requested skill partner does not exist.'}</p>
        <button onClick={() => navigate('/explore')} className="btn btn-primary">
          Back to Explore
        </button>
      </div>
    );
  }

  const initials = partner.name
    ? partner.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'P';

  const isSelf = currentUser && String(currentUser.id || currentUser._id) === String(partner._id || partner.id);

  const getVerificationBadge = (skillName) => {
    const verif = partner.skillVerifications?.find(
      v => v.skill.toLowerCase() === skillName.toLowerCase()
    );
    if (!verif) return { label: 'Self-Declared', className: 'badge', customStyle: { backgroundColor: '#FFFBFA', color: '#89818A', border: '1px solid #EFE7E9' }, demonstrated: 'Not Demonstrated' };
    if (verif.status === 'SKILL_VERIFIED') return { label: 'Skill Verified', className: 'badge badge-verified', customStyle: {}, demonstrated: verif.demonstratedProficiency };
    if (verif.status === 'ASSESSMENT_PASSED') return { label: 'Assessment Passed', className: 'badge badge-blush', customStyle: {}, demonstrated: verif.demonstratedProficiency };
    return { label: 'Self-Declared', className: 'badge', customStyle: { backgroundColor: '#FFFBFA', color: '#89818A', border: '1px solid #EFE7E9' }, demonstrated: 'Not Demonstrated' };
  };

  return (
    <div style={{ padding: '3.5rem 6%', maxWidth: '1100px', margin: '0 auto' }}>

      {/* Action Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm">
          &larr; Back
        </button>

        {!isSelf && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => {
                if (!currentUser) navigate('/login');
                else navigate(`/messages?partnerId=${partner._id || partner.id}`);
              }}
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <ChatIcon /> Chat
            </button>
            <button
              onClick={() => {
                if (!currentUser) navigate('/login');
                else navigate('/request', { state: { partner } });
              }}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <HandshakeIcon /> Propose Exchange
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>

        {/* Left Card: Partner Overview */}
        <div className="card" style={{ padding: '2rem', height: 'fit-content' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            {partner.avatar ? (
              <img
                src={partner.avatar}
                alt={partner.name}
                style={{ width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 1rem', border: '2px solid #EFE7E9' }}
              />
            ) : (
              <div style={{ width: '96px', height: '96px', backgroundColor: '#F5E1E5', color: '#7A3D4C', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.25rem', fontWeight: 800, margin: '0 auto 1.25rem', border: '1px solid #F2CBD5' }}>
                {initials}
              </div>
            )}

            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.2rem', color: '#39343A' }}>{partner.name}</h2>
            <p style={{ color: '#89818A', margin: '0 0 0.5rem 0', fontSize: '0.92rem' }}>{partner.role || 'Student'}</p>

            {/* Badges */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', flexWrap: 'wrap', margin: '0.5rem 0' }}>
              {partner.badges?.map((badge, idx) => (
                <span key={idx} className="badge badge-lavender">
                  ★ {badge}
                </span>
              ))}
            </div>

            <div className="badge badge-peach" style={{ padding: '0.35rem 0.85rem', fontSize: '0.82rem' }}>
              <StarIcon filled={true} size={15} /> {avgRating > 0 ? avgRating : '5.0'} Rating ({reviews.length} reviews)
            </div>
          </div>

          <div style={{ borderTop: '1px solid #EFE7E9', paddingTop: '1.25rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            <div style={{ marginBottom: '0.75rem' }}>
              <span style={{ color: '#89818A', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Location</span>
              <span style={{ color: '#39343A' }}>{partner.location || 'Not specified'}</span>
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
              <span style={{ color: '#89818A', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Availability</span>
              <span style={{ color: '#39343A' }}>{partner.availability || 'Flexible'}</span>
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
              <span style={{ color: '#89818A', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Trust Score</span>
              <span style={{ fontWeight: 800, color: '#D99AAA' }}>{partner.trustScore || 50}%</span>
            </div>
          </div>

          {!isSelf && (
            <button
              onClick={() => setShowReportModal(true)}
              className="btn btn-ghost btn-sm"
              style={{ width: '100%', border: '1px solid #EFE7E9', color: '#89818A', fontSize: '0.78rem' }}
            >
              🚩 Report Member Profile
            </button>
          )}
        </div>

        {/* Right Content: Bio, Skills & Verified Badges, Reviews */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '0.65rem', fontSize: '1.25rem', fontWeight: 800, color: '#39343A' }}>About {partner.name}</h3>
            <p style={{ color: '#89818A', lineHeight: 1.6, margin: 0 }}>
              {partner.bio || 'This student has not yet added a biography.'}
            </p>
          </div>

          {/* Skills Offered with Badges */}
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.25rem', color: '#39343A', fontSize: '1.25rem', fontWeight: 800 }}>
              Skills Offered & Verified Badges
            </h3>

            {(!partner.skillsOffered || partner.skillsOffered.length === 0) ? (
              <p style={{ color: '#89818A' }}>No skills listed yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {partner.skillsOffered.map((skill, index) => {
                  const claimed = partner.proficiency?.[skill] || 'Intermediate';
                  const badge = getVerificationBadge(skill);

                  return (
                    <div
                      key={index}
                      style={{
                        padding: '1rem 1.25rem',
                        backgroundColor: '#FFFBFA',
                        borderRadius: '0.75rem',
                        border: '1px solid #EFE7E9',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '0.5rem'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#39343A' }}>{skill}</div>
                        <div style={{ fontSize: '0.8rem', color: '#89818A', marginTop: '2px' }}>
                          Claimed: <strong>{claimed}</strong> • Demonstrated: <strong>{badge.demonstrated}</strong>
                        </div>
                      </div>

                      <span className={badge.className} style={badge.customStyle}>
                        {badge.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Skills Wanted */}
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.25rem', color: '#39343A', fontSize: '1.25rem', fontWeight: 800 }}>
              Skills {partner.name} Wants to Learn
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
              {partner.skillsWanted?.map((skill, index) => (
                <span key={index} className="badge badge-peach" style={{ padding: '0.45rem 0.9rem', fontSize: '0.86rem' }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Learner Reviews */}
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.25rem', fontSize: '1.25rem', fontWeight: 800, color: '#39343A' }}>
              Learner Reviews ({reviews.length})
            </h3>
            {reviews.length === 0 ? (
              <p style={{ color: '#89818A', margin: 0 }}>No reviews received yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {reviews.map(rev => (
                  <div key={rev._id} style={{ padding: '1rem 1.25rem', backgroundColor: '#FFFBFA', borderRadius: '0.75rem', border: '1px solid #EFE7E9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 700, color: '#39343A' }}>{rev.reviewer?.name || 'Peer'}</span>
                      <div style={{ display: 'flex' }}>
                        {[1, 2, 3, 4, 5].map(s => (
                          <StarIcon key={s} filled={s <= rev.rating} size={14} />
                        ))}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#89818A', marginBottom: '0.5rem' }}>
                      Taught {rev.skillTaught} • {new Date(rev.createdAt).toLocaleDateString()}
                    </div>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#39343A' }}>{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* REPORT MODAL */}
      {showReportModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(57, 52, 58, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '2rem', borderRadius: '1.25rem', boxShadow: 'var(--shadow-lg)' }}>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: 0, marginBottom: '0.35rem', color: '#39343A' }}>Report Member Profile</h3>
            <p style={{ color: '#89818A', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
              Your report will be reviewed by platform administrators. Moderation is conducted impartially.
            </p>

            <form onSubmit={handleReportSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Reason for Report</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="form-select"
                >
                  <option value="fake_skill">Fake / Misleading Skill Claims</option>
                  <option value="inappropriate_behavior">Inappropriate Behavior or Language</option>
                  <option value="no_show">Repeated No-Show on Scheduled Sessions</option>
                  <option value="spam">Spam or Solicitation</option>
                  <option value="other">Other Violation</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Details & Context</label>
                <textarea
                  placeholder="Describe the issue with specific details..."
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  rows={3}
                  required
                  className="form-textarea"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowReportModal(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={submittingReport}>
                  {submittingReport ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default PartnerProfile;
