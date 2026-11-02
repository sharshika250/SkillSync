import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSkillSync } from '../context/SkillSyncContext';
import { matchAPI, requestAPI } from '../services/api';
import { BrainIcon, HandshakeIcon, ShieldCheckIcon, SparklesIcon } from '../components/Icons';

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useSkillSync();

  const [receivedRequests, setReceivedRequests] = useState([]);
  const [matches, setMatches] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState(null);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [reqsRes, matchesRes, recsRes] = await Promise.allSettled([
        requestAPI.getRequests('received'),
        matchAPI.getMatches(),
        matchAPI.getRecommendations()
      ]);

      if (reqsRes.status === 'fulfilled' && reqsRes.value?.success) {
        setReceivedRequests(reqsRes.value.received || []);
      }

      if (matchesRes.status === 'fulfilled' && matchesRes.value?.success) {
        setMatches(matchesRes.value.matches || []);
      }

      if (recsRes.status === 'fulfilled' && recsRes.value?.success) {
        setRecommendations(recsRes.value.recommendations || []);
      }
    } catch (err) {
      console.warn('Dashboard data fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadDashboardData();
    }
  }, [currentUser]);

  const handleQuickAccept = async (id) => {
    try {
      setAcceptingId(id);
      const res = await requestAPI.acceptRequest(id);
      if (res?.success) {
        await loadDashboardData();
      }
    } catch (err) {
      alert(err?.message || 'Error accepting request');
    } finally {
      setAcceptingId(null);
    }
  };

  if (!currentUser) {
    return null;
  }

  const pendingReceived = receivedRequests.filter(r => r.status === 'pending');
  const skillsOfferedCount = currentUser.skillsOffered?.length || 0;
  const skillsWantedCount = currentUser.skillsWanted?.length || 0;

  return (
    <div style={{ padding: '3.5rem 6%', maxWidth: '1240px', margin: '0 auto' }}>
      
      {/* Welcome Banner */}
      <div className="card" style={{ padding: '2.25rem 2.5rem', marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', background: 'radial-gradient(circle at top right, #FDF4F6 0%, #FFFFFF 65%)' }}>
        <div>
          <span className="badge badge-blush" style={{ marginBottom: '0.65rem' }}>
            <SparklesIcon /> Member Portal
          </span>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginTop: '0.35rem', marginBottom: '0.4rem', color: '#39343A' }}>
            Welcome back, {currentUser.name}!
          </h1>
          <p style={{ color: '#89818A', fontSize: '0.98rem' }}>
            Role: <strong>{currentUser.role || 'Student'}</strong> • {currentUser.email}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/assessments')} className="btn btn-primary">
            ✓ Verify Skills
          </button>
          <button onClick={() => navigate('/learning')} className="btn btn-secondary">
            📚 Goals & AI
          </button>
          <button onClick={() => navigate('/explore')} className="btn btn-secondary">
            Explore Skills
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        
        {/* Metric 1 */}
        <div 
          onClick={() => navigate('/profile')} 
          className="metric-card"
          style={{ cursor: 'pointer' }}
        >
          <span style={{ fontSize: '0.8rem', color: '#89818A', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Skills You Offer</span>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#D99AAA', margin: '0.4rem 0' }}>
            {skillsOfferedCount}
          </div>
          <span style={{ fontSize: '0.84rem', color: '#89818A' }}>Click to manage profile &rarr;</span>
        </div>

        {/* Metric 2 */}
        <div 
          onClick={() => navigate('/profile')} 
          className="metric-card"
          style={{ cursor: 'pointer' }}
        >
          <span style={{ fontSize: '0.8rem', color: '#89818A', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Skills You Want</span>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#8E7CB3', margin: '0.4rem 0' }}>
            {skillsWantedCount}
          </div>
          <span style={{ fontSize: '0.84rem', color: '#89818A' }}>Click to manage targets &rarr;</span>
        </div>

        {/* Metric 3 */}
        <div 
          onClick={() => navigate('/requests')} 
          className="metric-card"
          style={{ cursor: 'pointer' }}
        >
          <span style={{ fontSize: '0.8rem', color: '#89818A', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Pending Proposals</span>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: pendingReceived.length > 0 ? '#C28766' : '#39343A', margin: '0.4rem 0' }}>
            {pendingReceived.length}
          </div>
          <span style={{ fontSize: '0.84rem', color: '#89818A' }}>Awaiting your decision &rarr;</span>
        </div>

        {/* Metric 4 */}
        <div 
          onClick={() => navigate('/matches')} 
          className="metric-card"
          style={{ cursor: 'pointer' }}
        >
          <span style={{ fontSize: '0.8rem', color: '#89818A', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Active Exchanges</span>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#5E9E7C', margin: '0.4rem 0' }}>
            {matches.length}
          </div>
          <span style={{ fontSize: '0.84rem', color: '#89818A' }}>View confirmed matches &rarr;</span>
        </div>

      </div>

      {/* Main 2-column Content Area */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
        
        {/* Left: Incoming Exchange Requests */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <HandshakeIcon /> Incoming Proposals
            </h3>
            <button onClick={() => navigate('/requests')} className="btn btn-ghost btn-sm">
              View All ({receivedRequests.length})
            </button>
          </div>

          {loading ? (
            <p style={{ color: '#89818A', fontSize: '0.9rem' }}>Loading proposals...</p>
          ) : pendingReceived.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', backgroundColor: '#FFFBFA', borderRadius: '0.75rem', border: '1px dashed #EFE7E9' }}>
              <p style={{ color: '#89818A', fontSize: '0.93rem', marginBottom: '1.25rem' }}>
                You have no pending requests from peers right now.
              </p>
              <button onClick={() => navigate('/explore')} className="btn btn-secondary btn-sm">
                Find Partners on Explore
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {pendingReceived.slice(0, 3).map((req) => {
                const senderName = req.sender?.name || 'Skill Partner';
                const senderRole = req.sender?.role || 'Student';

                return (
                  <div key={req._id} style={{ border: '1px solid #EFE7E9', borderRadius: '0.75rem', padding: '1.1rem', backgroundColor: '#FFFBFA' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <div>
                        <strong style={{ fontSize: '0.95rem', color: '#39343A' }}>{senderName}</strong>
                        <span style={{ fontSize: '0.8rem', color: '#89818A', marginLeft: '0.5rem' }}>({senderRole})</span>
                      </div>
                      {req.matchScore > 0 && (
                        <span className="badge badge-blush">
                          {req.matchScore}% Match
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: '0.86rem', marginBottom: '0.85rem', color: '#39343A', lineHeight: 1.5 }}>
                      <div><strong style={{ color: '#89818A' }}>Teaches:</strong> {req.offeredSkill}</div>
                      <div><strong style={{ color: '#89818A' }}>Wants:</strong> {req.requestedSkill}</div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => navigate('/requests')} 
                        className="btn btn-ghost btn-sm"
                      >
                        Details
                      </button>
                      <button 
                        onClick={() => handleQuickAccept(req._id)} 
                        disabled={acceptingId === req._id}
                        className="btn btn-primary btn-sm"
                      >
                        {acceptingId === req._id ? 'Accepting...' : 'Accept'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Recommended Skill Partners */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BrainIcon /> Recommended Partners
            </h3>
            <button onClick={() => navigate('/explore')} className="btn btn-ghost btn-sm">
              See All
            </button>
          </div>

          {loading ? (
            <p style={{ color: '#89818A', fontSize: '0.9rem' }}>Analyzing skill compatibility...</p>
          ) : recommendations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', backgroundColor: '#FFFBFA', borderRadius: '0.75rem', border: '1px dashed #EFE7E9' }}>
              <p style={{ color: '#89818A', fontSize: '0.93rem' }}>
                No recommendations yet. Add more skills to your profile to improve matches!
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recommendations.slice(0, 3).map((partner) => {
                const partnerId = partner._id || partner.id;

                return (
                  <div key={partnerId} style={{ border: '1px solid #EFE7E9', borderRadius: '0.75rem', padding: '1.1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', backgroundColor: '#FFFBFA' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <strong style={{ color: '#39343A' }}>{partner.name}</strong>
                        {partner.verification && (
                          <span style={{ color: '#88C4A6' }}><ShieldCheckIcon /></span>
                        )}
                        <span className="badge badge-lavender">
                          {partner.matchScore || 80}% Match
                        </span>
                      </div>
                      <p style={{ fontSize: '0.82rem', color: '#89818A', margin: '0.25rem 0' }}>
                        Offers: {partner.skillsOffered?.slice(0, 2).join(', ') || 'N/A'}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        onClick={() => navigate(`/partner/${partnerId}`)} 
                        className="btn btn-secondary btn-sm"
                      >
                        Profile
                      </button>
                      <button 
                        onClick={() => navigate('/request', { state: { partner } })} 
                        className="btn btn-primary btn-sm"
                      >
                        Request
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default Dashboard;