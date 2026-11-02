import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchIcon, ShieldCheckIcon } from '../components/Icons';
import { useSkillSync } from '../context/SkillSyncContext';
import { userAPI } from '../services/api';

const CATEGORIES = [
  'All',
  'Programming',
  'Web',
  'Design',
  'DataScience',
  'Business',
  'Communication'
];

const Explore = () => {
  const navigate = useNavigate();
  const { currentUser } = useSkillSync();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('matchScore');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');

      const params = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (verifiedOnly) params.verifiedOnly = true;
      if (sortBy) params.sortBy = sortBy;

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
    fetchUsers();
  }, [selectedCategory, verifiedOnly, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setVerifiedOnly(false);
    setSortBy('matchScore');
  };

  return (
    <div style={{ padding: '3.5rem 6%', maxWidth: '1240px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.65rem', color: '#39343A' }}>
          Explore Skill Partners
        </h1>
        <p style={{ color: '#89818A', fontSize: '1.05rem', maxWidth: '650px', margin: '0 auto' }}>
          Discover verified peers to exchange knowledge, expand your skillset, and collaborate on exciting projects.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          <div style={{ flex: '2', minWidth: '260px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: '#89818A' }}>
              <SearchIcon />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, skill (e.g. React, Python, Java, Figma), or role..."
              className="form-input"
              style={{ paddingLeft: '2.8rem' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.9rem', cursor: 'pointer', fontWeight: 600, color: '#39343A' }}>
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                style={{ accentColor: '#D99AAA', cursor: 'pointer' }}
              />
              Verified Skills Only
            </label>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="form-select"
              style={{ width: 'auto', padding: '0.75rem 1rem' }}
            >
              <option value="matchScore">Sort by Synergy Score</option>
              <option value="rating">Sort by Community Rating</option>
              <option value="recent">Sort by Recently Active</option>
            </select>

            <button type="submit" className="btn btn-primary">
              Search
            </button>
          </div>
        </form>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', color: '#89818A', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Categories:</span>
          {CATEGORIES.map(cat => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '0.35rem 0.85rem',
                  borderRadius: '9999px',
                  border: isSelected ? '1px solid #F2CBD5' : '1px solid #EFE7E9',
                  backgroundColor: isSelected ? '#F5E1E5' : '#FFFBFA',
                  color: isSelected ? '#7A3D4C' : '#39343A',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {cat === 'Web' ? 'Web Dev' : (cat === 'DataScience' ? 'Data Science' : cat)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div style={{ backgroundColor: '#FDF4F6', border: '1px solid #F2CBD5', color: '#7A3D4C', padding: '1rem', borderRadius: '0.75rem', marginBottom: '2rem' }}>
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <div style={{ display: 'inline-block', width: '36px', height: '36px', border: '3px solid #F5E1E5', borderTop: '3px solid #D99AAA', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ marginTop: '1rem', color: '#89818A' }}>Discovering potential skill partners...</p>
        </div>
      )}

      {/* Users Grid */}
      {!loading && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <span style={{ color: '#89818A', fontSize: '0.93rem' }}>
              Showing <strong>{users.length}</strong> available skill exchange partners
            </span>
            {(searchQuery || selectedCategory !== 'All' || verifiedOnly) && (
              <button onClick={handleClearFilters} className="btn btn-ghost btn-sm" style={{ color: '#7A3D4C' }}>
                Reset Filters
              </button>
            )}
          </div>

          {users.length === 0 ? (
            <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#39343A' }}>No Matching Skill Partners Found</h3>
              <p style={{ color: '#89818A', maxWidth: '450px', margin: '0 auto 1.5rem' }}>
                Try adjusting your search criteria, selecting a different category, or resetting filters.
              </p>
              <button onClick={handleClearFilters} className="btn btn-secondary btn-sm">
                Clear Filters
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
              {users.map((partner) => {
                const partnerId = partner._id || partner.id;
                const initials = partner.name
                  ? partner.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                  : 'P';

                return (
                  <div
                    key={partnerId}
                    className="card"
                    style={{
                      padding: '1.75rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      {/* Top Info Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                          {partner.avatar ? (
                            <img
                              src={partner.avatar}
                              alt={partner.name}
                              style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #EFE7E9' }}
                            />
                          ) : (
                            <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#F5E1E5', color: '#7A3D4C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.95rem', border: '1px solid #F2CBD5' }}>
                              {initials}
                            </div>
                          )}
                          <div>
                            <h3 style={{ fontSize: '1.15rem', margin: 0, color: '#39343A' }}>{partner.name}</h3>
                            <span style={{ fontSize: '0.8rem', color: '#89818A' }}>
                              {partner.role || 'Student'} {partner.location ? `• ${partner.location}` : ''}
                            </span>
                          </div>
                        </div>

                        {currentUser && partner.matchScore > 0 && (
                          <div style={{ textAlign: 'right' }}>
                            <span className="badge badge-blush">
                              {partner.matchScore}% Match
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Bio snippet */}
                      <p style={{ color: '#89818A', fontSize: '0.88rem', lineHeight: 1.5, margin: '0 0 1.25rem 0', minHeight: '40px' }}>
                        {partner.bio ? (partner.bio.length > 90 ? `${partner.bio.substring(0, 90)}...` : partner.bio) : 'Enthusiastic peer ready to exchange skills!'}
                      </p>

                      {/* Skills Offered */}
                      <div style={{ marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '0.72rem', color: '#89818A', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Can Teach:</span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.35rem' }}>
                          {partner.skillsOffered?.slice(0, 4).map((skill, idx) => {
                            const isVerified = partner.skillVerifications?.some(
                              v => v.skill.toLowerCase() === skill.toLowerCase() && (v.status === 'SKILL_VERIFIED' || v.status === 'ASSESSMENT_PASSED')
                            );
                            return (
                              <span
                                key={idx}
                                className={isVerified ? "badge badge-verified" : "badge badge-blush"}
                              >
                                {isVerified ? `✓ ${skill}` : skill}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      {/* Skills Wanted */}
                      <div style={{ marginBottom: '1.25rem' }}>
                        <span style={{ fontSize: '0.72rem', color: '#89818A', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Wants to Learn:</span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.35rem' }}>
                          {partner.skillsWanted?.slice(0, 4).map((skill, idx) => (
                            <span key={idx} className="badge badge-peach">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      {/* Explanations snippet */}
                      {partner.matchDetails?.explanations && partner.matchDetails.explanations.length > 0 && (
                        <div style={{ padding: '0.6rem 0.8rem', backgroundColor: '#F6F3FA', borderRadius: '0.5rem', border: '1px solid #EAE5F4', fontSize: '0.76rem', color: '#554471', marginBottom: '0.85rem' }}>
                          💡 {partner.matchDetails.explanations[0]}
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => navigate(`/partner/${partnerId}`)}
                          className="btn btn-secondary btn-sm"
                          style={{ flex: 1 }}
                        >
                          View Profile
                        </button>
                        <button
                          onClick={() => {
                            if (!currentUser) navigate('/login');
                            else navigate('/request', { state: { partner } });
                          }}
                          className="btn btn-primary btn-sm"
                          style={{ flex: 1.2 }}
                        >
                          Propose Exchange
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

    </div>
  );
};

export default Explore;
