import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSkillSync } from '../context/SkillSyncContext';
import { matchAPI, requestAPI } from '../services/api';
import { BrainIcon, HandshakeIcon, ShieldCheckIcon } from '../components/Icons';

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
    <div className="page-container" style={{ padding: '3rem 5%', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Welcome Banner */}
      <div style={{ backgroundColor: 'var(--white)', borderRadius: '1rem', border: '1px solid var(--border-color)', padding: '2rem 2.5rem', marginBottom: '2.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <span style={{ fontSize: '0.85rem', color: 'var(--primary-color)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Member Dashboard
          </span>
          <h1 style={{ fontSize: '2.25rem', marginTop: '0.25rem', marginBottom: '0.5rem' }}>
            Welcome back, {currentUser.name}!
          </h1>
          <p style={{ color: 'var(--text-light)', fontSize: '1rem' }}>
            Role: <strong>{currentUser.role || 'Student'}</strong> • {currentUser.email}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/explore')} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
            Explore Skills
          </button>
          <button onClick={() => navigate('/profile')} className="btn btn-secondary" style={{ padding: '0.75rem 1.5rem' }}>
            Edit Profile
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        
        {/* Metric 1 */}
        <div 
          onClick={() => navigate('/profile')} 
          style={{ backgroundColor: 'var(--white)', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)', cursor: 'pointer', transition: 'var(--transition)' }}
          className="metric-card"
        >
          <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: '600' }}>Skills You Offer</span>
          <div style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--primary-color)', margin: '0.5rem 0' }}>
            {skillsOfferedCount}
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>Click to add or update &rarr;</span>
        </div>

        {/* Metric 2 */}
        <div 
          onClick={() => navigate('/profile')} 
          style={{ backgroundColor: 'var(--white)', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)', cursor: 'pointer', transition: 'var(--transition)' }}
          className="metric-card"
        >
          <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: '600' }}>Skills You Want</span>
          <div style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--secondary-color)', margin: '0.5rem 0' }}>
            {skillsWantedCount}
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>Click to manage targets &rarr;</span>
        </div>

        {/* Metric 3 */}
        <div 
          onClick={() => navigate('/requests')} 
          style={{ backgroundColor: 'var(--white)', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)', cursor: 'pointer', transition: 'var(--transition)' }}
          className="metric-card"
        >
          <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: '600' }}>Pending Proposals</span>
          <div style={{ fontSize: '2.25rem', fontWeight: '800', color: pendingReceived.length > 0 ? '#b45309' : 'var(--text-dark)', margin: '0.5rem 0' }}>
            {pendingReceived.length}
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>Awaiting your decision &rarr;</span>
        </div>

        {/* Metric 4 */}
        <div 
          onClick={() => navigate('/matches')} 
          style={{ backgroundColor: 'var(--white)', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)', cursor: 'pointer', transition: 'var(--transition)' }}
          className="metric-card"
        >
          <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: '600' }}>Active Exchanges</span>
          <div style={{ fontSize: '2.25rem', fontWeight: '800', color: '#047857', margin: '0.5rem 0' }}>
            {matches.length}
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>View confirmed matches &rarr;</span>
        </div>

      </div>

      {/* Main 2-column Content Area */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
        
        {/* Left: Incoming Exchange Requests */}
        <div style={{ backgroundColor: 'var(--white)', borderRadius: '1rem', border: '1px solid var(--border-color)', padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <HandshakeIcon /> Incoming Proposals
            </h3>
            <button onClick={() => navigate('/requests')} className="btn btn-ghost" style={{ fontSize: '0.85rem', padding: '0.3rem 0.6rem' }}>
              View All ({receivedRequests.length})
            </button>
          </div>

          {loading ? (
            <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>Loading proposals...</p>
          ) : pendingReceived.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
              <p style={{ color: 'var(--text-light)', fontSize: '0.95rem', marginBottom: '1rem' }}>
                You have no pending requests from peers right now.
              </p>
              <button onClick={() => navigate('/explore')} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
                Find Partners on Explore
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {pendingReceived.slice(0, 3).map((req) => {
                const senderName = req.sender?.name || 'Skill Partner';
                const senderRole = req.sender?.role || 'Student';

                return (
                  <div key={req._id} style={{ border: '1px solid var(--border-color)', borderRadius: '0.5rem', padding: '1rem', backgroundColor: '#f8fafc' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <div>
                        <strong style={{ fontSize: '0.95rem' }}>{senderName}</strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginLeft: '0.5rem' }}>({senderRole})</span>
                      </div>
                      {req.matchScore > 0 && (
                        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--primary-color)', backgroundColor: '#e0e7ff', padding: '0.15rem 0.5rem', borderRadius: '1rem' }}>
                          {req.matchScore}% Match
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                      <div><strong>Teaches:</strong> {req.offeredSkill}</div>
                      <div><strong>Wants:</strong> {req.requestedSkill}</div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => navigate('/requests')} 
                        className="btn btn-ghost" 
                        style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                      >
                        Details
                      </button>
                      <button 
                        onClick={() => handleQuickAccept(req._id)} 
                        disabled={acceptingId === req._id}
                        className="btn btn-primary" 
                        style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', backgroundColor: '#059669' }}
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
        <div style={{ backgroundColor: 'var(--white)', borderRadius: '1rem', border: '1px solid var(--border-color)', padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BrainIcon /> Recommended Partners
            </h3>
            <button onClick={() => navigate('/explore')} className="btn btn-ghost" style={{ fontSize: '0.85rem', padding: '0.3rem 0.6rem' }}>
              See All
            </button>
          </div>

          {loading ? (
            <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>Analyzing skill compatibility...</p>
          ) : recommendations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
              <p style={{ color: 'var(--text-light)', fontSize: '0.95rem' }}>No recommendations yet. Add more skills to your profile to improve matches!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recommendations.slice(0, 3).map((partner) => {
                const partnerId = partner._id || partner.id;

                return (
                  <div key={partnerId} style={{ border: '1px solid var(--border-color)', borderRadius: '0.5rem', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <strong>{partner.name}</strong>
                        {partner.verification && (
                          <span style={{ color: '#047857' }}><ShieldCheckIcon /></span>
                        )}
                        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--primary-color)', backgroundColor: '#e0e7ff', padding: '0.1rem 0.45rem', borderRadius: '1rem' }}>
                          {partner.matchScore || 80}% Match
                        </span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', margin: '0.2rem 0' }}>
                        Offers: {partner.skillsOffered?.slice(0, 2).join(', ') || 'N/A'}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        onClick={() => navigate(`/partner/${partnerId}`)} 
                        className="btn btn-secondary" 
                        style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                      >
                        Profile
                      </button>
                      <button 
                        onClick={() => navigate('/request', { state: { partner } })} 
                        className="btn btn-primary" 
                        style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
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
