import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrainIcon, ShieldCheckIcon, HandshakeIcon } from '../components/Icons';
import { useSkillSync } from '../context/SkillSyncContext';
import { matchAPI } from '../services/api';

const Matches = () => {
  const navigate = useNavigate();
  const { currentUser } = useSkillSync();

  const [matches, setMatches] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  return (
    <div className="page-container" style={{ padding: '3.5rem 5%', maxWidth: '1050px', margin: '0 auto' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '0.25rem' }}>Active Skill Exchanges</h1>
          <p style={{ color: 'var(--text-light)', fontSize: '1rem' }}>
            Your accepted peer collaborations and mutual learning partnerships
          </p>
        </div>
        <div style={{ backgroundColor: '#ecfdf5', color: '#047857', padding: '0.6rem 1.25rem', borderRadius: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>
          <BrainIcon /> AI Match Engine Active
        </div>
      </div>

      {error && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <div style={{ display: 'inline-block', width: '36px', height: '36px', border: '3px solid #e0e7ff', borderTop: '3px solid var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ marginTop: '1rem', color: 'var(--text-light)' }}>Loading your confirmed exchanges...</p>
        </div>
      )}

      {/* Active Matches List */}
      {!loading && (
        <div style={{ marginBottom: '3.5rem' }}>
          {matches.length === 0 ? (
            <div style={{ backgroundColor: 'var(--white)', border: '1px solid var(--border-color)', borderRadius: '1rem', padding: '3.5rem 2rem', textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🤝</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Active Exchanges Yet</h3>
              <p style={{ color: 'var(--text-light)', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
                When you or another student accepts a skill exchange proposal, your active partnership will appear here.
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

                return (
                  <div key={item.id} style={{ display: 'flex', backgroundColor: 'var(--white)', borderRadius: '1rem', border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', flexWrap: 'wrap' }}>
                    
                    {/* Left Score Column */}
                    <div style={{ width: '140px', minWidth: '120px', backgroundColor: 'var(--primary-color)', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '1.5rem' }}>
                      <div style={{ fontSize: '2.25rem', fontWeight: '800' }}>{item.matchScore || 90}%</div>
                      <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Compatibility</div>
                    </div>

                    {/* Middle Info Column */}
                    <div style={{ flex: 1, minWidth: '260px', padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--bg-light)', border: '1px solid var(--border-color)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem' }}>
                          {initials}
                        </div>
                        <h3 style={{ fontSize: '1.35rem', margin: 0 }}>{partnerName}</h3>
                        <span style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>({partner.role || 'Student'})</span>
                        
                        <span style={{ color: '#047857', backgroundColor: '#d1fae5', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: '600' }}>
                          Active Exchange
                        </span>
                      </div>

                      {/* Exchange Skills Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '0.5rem', marginBottom: '0.75rem' }}>
                        <div>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: '600', marginBottom: '0.2rem' }}>You Are Teaching:</p>
                          <p style={{ fontWeight: '600', color: 'var(--primary-color)', fontSize: '1rem' }}>{item.mySkill}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: '600', marginBottom: '0.2rem' }}>Partner Is Teaching:</p>
                          <p style={{ fontWeight: '600', color: 'var(--secondary-color)', fontSize: '1rem' }}>{item.partnerSkill}</p>
                        </div>
                      </div>

                      <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                        Connected since {new Date(item.updatedAt || item.createdAt).toLocaleDateString()}
                        {partner.email && ` • Contact: ${partner.email}`}
                      </div>
                    </div>

                    {/* Right Action Column */}
                    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.75rem', borderLeft: '1px solid var(--border-color)' }}>
                      <button 
                        onClick={() => navigate(`/partner/${partnerId}`)} 
                        className="btn btn-secondary" 
                        style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                      >
                        Partner Profile
                      </button>
                      {partner.email && (
                        <a 
                          href={`mailto:${partner.email}?subject=SkillSync Exchange Collaboration`} 
                          className="btn btn-primary" 
                          style={{ fontSize: '0.875rem', padding: '0.5rem 1rem', textDecoration: 'none' }}
                        >
                          Email Partner
                        </a>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Recommended Matches Section */}
      {!loading && recommendations.length > 0 && (
        <div style={{ borderTop: '2px solid var(--border-color)', paddingTop: '2.5rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Recommended Learning Partners</h2>
            <p style={{ color: 'var(--text-light)', fontSize: '0.95rem' }}>
              Ranked by mutual skill alignment with what you offer and want to learn
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {recommendations.slice(0, 3).map((rec) => {
              const recId = rec._id || rec.id;
              const initials = rec.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

              return (
                <div key={recId} style={{ backgroundColor: 'var(--white)', borderRadius: '1rem', border: '1px solid var(--border-color)', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                          {initials}
                        </div>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '1.05rem' }}>{rec.name}</h4>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{rec.role || 'Student'}</span>
                        </div>
                      </div>
                      <span style={{ backgroundColor: '#e0e7ff', color: 'var(--primary-color)', padding: '0.2rem 0.5rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: '700' }}>
                        {rec.matchScore}% Match
                      </span>
                    </div>

                    <div style={{ marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: '600' }}>Offers:</span>
                      <p style={{ color: 'var(--primary-color)', fontWeight: '500', fontSize: '0.9rem', marginTop: '0.1rem' }}>
                        {rec.skillsOffered?.join(', ') || 'N/A'}
                      </p>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: '600' }}>Wants:</span>
                      <p style={{ color: 'var(--secondary-color)', fontWeight: '500', fontSize: '0.9rem', marginTop: '0.1rem' }}>
                        {rec.skillsWanted?.join(', ') || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <button 
                      onClick={() => navigate(`/partner/${recId}`)} 
                      className="btn btn-secondary" 
                      style={{ flex: 1, fontSize: '0.8rem', padding: '0.4rem' }}
                    >
                      Profile
                    </button>
                    <button 
                      onClick={() => navigate('/request', { state: { partner: rec } })} 
                      className="btn btn-primary" 
                      style={{ flex: 1.2, fontSize: '0.8rem', padding: '0.4rem' }}
                    >
                      Request
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};

export default Matches;
