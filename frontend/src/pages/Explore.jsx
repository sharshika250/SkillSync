import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchIcon, ShieldCheckIcon } from '../components/Icons';
import { useSkillSync } from '../context/SkillSyncContext';
import { userAPI } from '../services/api';

const Explore = () => {
  const navigate = useNavigate();
  const { currentUser } = useSkillSync();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const fetchUsers = async (query = '', filter = 'all') => {
    try {
      setLoading(true);
      setError('');

      const params = {};
      if (query.trim()) {
        params.search = query.trim();
      }

      if (filter !== 'all') {
        params.skill = filter;
      }

      const res = await userAPI.getAllUsers(params);
      if (res?.success && Array.isArray(res.users)) {
        setUsers(res.users);
      } else {
        setUsers([]);
      }
    } catch (err) {
      setError(err?.message || 'Failed to fetch skill partners from the database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(searchQuery, selectedFilter);
  }, [selectedFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers(searchQuery, selectedFilter);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedFilter('all');
    fetchUsers('', 'all');
  };

  return (
    <div className="page-container" style={{ padding: '3.5rem 5%', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>Explore Skill Partners</h1>
        <p style={{ color: 'var(--text-light)', fontSize: '1.125rem', maxWidth: '650px', margin: '0 auto' }}>
          Connect with peers to exchange knowledge, expand your skillset, and collaborate on exciting projects.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div style={{ backgroundColor: 'var(--white)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-color)', marginBottom: '2.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '2', minWidth: '260px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--text-light)' }}>
              <SearchIcon />
            </div>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, skill (e.g. React, Python, Figma), or major..." 
              style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.8rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', fontSize: '0.95rem' }}
            />
          </div>

          <select 
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            style={{ flex: '1', minWidth: '180px', padding: '0.85rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', fontSize: '0.95rem', backgroundColor: 'var(--white)' }}
          >
            <option value="all">All Disciplines</option>
            <option value="React">React / Web Dev</option>
            <option value="Python">Python / Data</option>
            <option value="Figma">UI/UX / Figma</option>
            <option value="Node">Node.js / Backend</option>
            <option value="Design">Design & Art</option>
            <option value="Language">Languages</option>
          </select>

          <button type="submit" className="btn btn-primary" style={{ padding: '0.85rem 2rem' }}>
            Search
          </button>

          {(searchQuery || selectedFilter !== 'all') && (
            <button 
              type="button" 
              onClick={handleClearFilters}
              className="btn btn-ghost"
              style={{ padding: '0.85rem 1.25rem' }}
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '3px solid #e0e7ff', borderTop: '3px solid var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ marginTop: '1rem', color: 'var(--text-light)' }}>Searching MongoDB for skill partners...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '1.5rem', borderRadius: '0.75rem', textAlign: 'center', margin: '2rem 0' }}>
          <p style={{ marginBottom: '1rem', fontWeight: '500' }}>{error}</p>
          <button onClick={() => fetchUsers(searchQuery, selectedFilter)} className="btn btn-secondary" style={{ fontSize: '0.9rem' }}>
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && users.length === 0 && (
        <div style={{ backgroundColor: 'var(--white)', border: '1px solid var(--border-color)', borderRadius: '1rem', padding: '4rem 2rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No Skill Partners Found</h3>
          <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem' }}>
            We couldn't find any partners matching your query. Try broadening your keywords or clearing the category filter.
          </p>
          <button onClick={handleClearFilters} className="btn btn-primary">
            View All Members
          </button>
        </div>
      )}

      {/* Results Grid */}
      {!loading && !error && users.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
          {users.map((partner) => {
            const partnerId = partner._id || partner.id;
            const initials = partner.name
              ? partner.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
              : 'P';

            const offeredList = Array.isArray(partner.skillsOffered) && partner.skillsOffered.length > 0
              ? partner.skillsOffered
              : ['Open to share skills'];

            const wantedList = Array.isArray(partner.skillsWanted) && partner.skillsWanted.length > 0
              ? partner.skillsWanted
              : ['Exploring new topics'];

            return (
              <div 
                key={partnerId} 
                className="step-card" 
                style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: 'var(--white)' }}
              >
                <div>
                  {/* Partner Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '48px', height: '48px', backgroundColor: 'var(--primary-color)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 'bold' }}>
                        {initials}
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.15rem' }}>{partner.name}</h3>
                        <span style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>{partner.role || 'Student'}</span>
                      </div>
                    </div>

                    {partner.matchScore > 0 && currentUser && (
                      <div style={{ backgroundColor: '#e0e7ff', color: 'var(--primary-color)', padding: '0.35rem 0.75rem', borderRadius: '1rem', fontWeight: '700', fontSize: '0.85rem' }}>
                        {partner.matchScore}% Match
                      </div>
                    )}
                  </div>

                  {/* Trust & Verification Badges */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    {partner.verification && (
                      <span style={{ color: '#047857', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.75rem', backgroundColor: '#d1fae5', padding: '0.2rem 0.5rem', borderRadius: '1rem' }}>
                        <ShieldCheckIcon /> Verified
                      </span>
                    )}
                    <span style={{ color: '#b45309', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.75rem', backgroundColor: '#fef3c7', padding: '0.2rem 0.5rem', borderRadius: '1rem' }}>
                      ★ {partner.trustScore || 5.0} Trust
                    </span>
                  </div>

                  {/* Skills Offered */}
                  <div style={{ marginBottom: '1rem' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                      Can Teach:
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {offeredList.map((skill, idx) => (
                        <span key={idx} style={{ padding: '0.25rem 0.6rem', backgroundColor: '#e0e7ff', color: 'var(--primary-color)', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: '500' }}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Skills Wanted */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                      Wants to Learn:
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {wantedList.map((skill, idx) => (
                        <span key={idx} style={{ padding: '0.25rem 0.6rem', backgroundColor: '#d1fae5', color: '#047857', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: '500' }}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {partner.availability && (
                    <div style={{ marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--text-light)' }}>
                      <strong>Available:</strong> {partner.availability}
                    </div>
                  )}
                </div>

                {/* Card Action Buttons */}
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                  <button 
                    onClick={() => navigate(`/partner/${partnerId}`)} 
                    className="btn btn-secondary" 
                    style={{ flex: 1, padding: '0.6rem 0.5rem', fontSize: '0.875rem' }}
                  >
                    View Profile
                  </button>
                  <button 
                    onClick={() => {
                      if (!currentUser) {
                        navigate('/login');
                      } else {
                        navigate('/request', { state: { partner } });
                      }
                    }} 
                    className="btn btn-primary" 
                    style={{ flex: 1.2, padding: '0.6rem 0.5rem', fontSize: '0.875rem' }}
                  >
                    Request Exchange
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default Explore;
