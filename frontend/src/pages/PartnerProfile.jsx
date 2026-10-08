import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import { useSkillSync } from '../context/SkillSyncContext';
import { ShieldCheckIcon, HandshakeIcon } from '../components/Icons';

const PartnerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useSkillSync();

  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPartner = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await userAPI.getUserById(id);
        if (res?.success && res.user) {
          setPartner(res.user);
        } else {
          setError('User profile not found');
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

  if (loading) {
    return (
      <div className="page-container" style={{ padding: '4rem 5%', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '3px solid #e0e7ff', borderTop: '3px solid var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ marginTop: '1rem', color: 'var(--text-light)' }}>Loading partner profile...</p>
      </div>
    );
  }

  if (error || !partner) {
    return (
      <div className="page-container" style={{ padding: '4rem 5%', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '1rem', color: '#b91c1c' }}>Profile Not Found</h2>
        <p style={{ color: 'var(--text-light)', marginBottom: '2rem' }}>{error || 'The requested skill partner does not exist.'}</p>
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

  return (
    <div className="page-container" style={{ padding: '3.5rem 5%', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Back button & Action Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <button onClick={() => navigate(-1)} className="btn btn-ghost" style={{ padding: '0.5rem 1rem' }}>
          &larr; Back
        </button>

        {!isSelf && (
          <button 
            onClick={() => {
              if (!currentUser) {
                navigate('/login');
              } else {
                navigate('/request', { state: { partner } });
              }
            }} 
            className="btn btn-primary"
            style={{ padding: '0.75rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <HandshakeIcon /> Send Exchange Request
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* Left Card: Partner Overview */}
        <div style={{ backgroundColor: 'var(--white)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
          <div style={{ width: '96px', height: '96px', backgroundColor: 'var(--primary-color)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.25rem', fontWeight: 'bold', margin: '0 auto 1.5rem' }}>
            {initials}
          </div>
          
          <h2 style={{ textAlign: 'center', marginBottom: '0.25rem' }}>{partner.name}</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-light)', marginBottom: '1rem' }}>{partner.role || 'Student'}</p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {partner.verification && (
              <span style={{ color: '#047857', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', backgroundColor: '#d1fae5', padding: '0.25rem 0.6rem', borderRadius: '1rem' }}>
                <ShieldCheckIcon /> Verified
              </span>
            )}
            <span style={{ color: '#b45309', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', backgroundColor: '#fef3c7', padding: '0.25rem 0.6rem', borderRadius: '1rem' }}>
              ★ {partner.trustScore || 5.0} Trust Score
            </span>
          </div>

          {partner.matchScore > 0 && currentUser && (
            <div style={{ backgroundColor: '#e0e7ff', color: 'var(--primary-color)', padding: '0.75rem 1rem', borderRadius: '0.5rem', textAlign: 'center', marginBottom: '1.5rem', fontWeight: '600' }}>
              Compatibility Score: {partner.matchScore}%
            </div>
          )}

          {partner.location && (
            <div style={{ marginBottom: '1.25rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
              <h4 style={{ color: 'var(--text-light)', marginBottom: '0.25rem', fontSize: '0.8rem', textTransform: 'uppercase' }}>Campus / Location</h4>
              <p style={{ fontSize: '0.95rem' }}>{partner.location}</p>
            </div>
          )}

          <div style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ color: 'var(--text-light)', marginBottom: '0.25rem', fontSize: '0.8rem', textTransform: 'uppercase' }}>About</h4>
            <p style={{ fontSize: '0.95rem', color: partner.bio ? 'var(--text-dark)' : 'var(--text-light)' }}>
              {partner.bio || 'This partner hasn\'t written a bio yet.'}
            </p>
          </div>

          <div>
            <h4 style={{ color: 'var(--text-light)', marginBottom: '0.25rem', fontSize: '0.8rem', textTransform: 'uppercase' }}>Availability</h4>
            <p style={{ fontSize: '0.95rem', color: partner.availability ? 'var(--text-dark)' : 'var(--text-light)' }}>
              {partner.availability || 'Schedule flexible.'}
            </p>
          </div>
        </div>

        {/* Right Cards: Skills */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Skills Offered */}
          <div style={{ backgroundColor: 'var(--white)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
            <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)' }}>
              <span>↑</span> Skills {partner.name.split(' ')[0]} Offers to Teach
            </h3>
            {(!partner.skillsOffered || partner.skillsOffered.length === 0) ? (
              <p style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>No skills listed yet.</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {partner.skillsOffered.map((skill, index) => {
                  const level = partner.proficiency?.[skill] || 'Intermediate';
                  return (
                    <div key={index} style={{ padding: '0.6rem 1.1rem', backgroundColor: '#e0e7ff', color: 'var(--primary-color)', borderRadius: '2rem', fontWeight: '500', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>{skill}</span>
                      <span style={{ fontSize: '0.75rem', backgroundColor: 'rgba(79, 70, 229, 0.15)', padding: '0.15rem 0.5rem', borderRadius: '1rem' }}>
                        {level}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Skills Wanted */}
          <div style={{ backgroundColor: 'var(--white)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
            <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--secondary-color)' }}>
              <span>↓</span> Skills {partner.name.split(' ')[0]} Wants to Learn
            </h3>
            {(!partner.skillsWanted || partner.skillsWanted.length === 0) ? (
              <p style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>No learning interests listed yet.</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {partner.skillsWanted.map((skill, index) => {
                  const level = partner.proficiency?.[skill] || 'Beginner';
                  return (
                    <div key={index} style={{ padding: '0.6rem 1.1rem', backgroundColor: '#d1fae5', color: '#047857', borderRadius: '2rem', fontWeight: '500', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>{skill}</span>
                      <span style={{ fontSize: '0.75rem', backgroundColor: 'rgba(4, 120, 87, 0.15)', padding: '0.15rem 0.5rem', borderRadius: '1rem' }}>
                        {level}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default PartnerProfile;
