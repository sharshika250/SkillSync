import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSkillSync } from '../context/SkillSyncContext';
import { userAPI, reviewAPI } from '../services/api';
import { StarIcon, AwardIcon } from '../components/Icons';

const Profile = () => {
  const navigate = useNavigate();
  const { currentUser, updateUser, logout } = useSkillSync();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [avatar, setAvatar] = useState('');
  const [availability, setAvailability] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [website, setWebsite] = useState('');
  const [teachingExperience, setTeachingExperience] = useState('');
  const [skillsOffered, setSkillsOffered] = useState([]);
  const [skillsWanted, setSkillsWanted] = useState([]);
  const [proficiency, setProficiency] = useState({});

  // Input states for adding new skills
  const [newOfferedSkill, setNewOfferedSkill] = useState('');
  const [newOfferedLevel, setNewOfferedLevel] = useState('Intermediate');
  const [newWantedSkill, setNewWantedSkill] = useState('');
  const [newWantedLevel, setNewWantedLevel] = useState('Beginner');

  // Reviews state
  const [userReviews, setUserReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);

  useEffect(() => {
    if (currentUser) {
      populateForm(currentUser);
      loadReviews(currentUser._id || currentUser.id);
    }
  }, [currentUser]);

  const loadReviews = async (userId) => {
    try {
      const res = await reviewAPI.getUserReviews(userId);
      if (res?.success) {
        setUserReviews(res.reviews || []);
        setAvgRating(res.averageRating || 0);
      }
    } catch {
      // Ignore
    }
  };

  const populateForm = (user) => {
    setName(user.name || '');
    setRole(user.role || 'Student');
    setBio(user.bio || '');
    setLocation(user.location || '');
    setAvatar(user.avatar || '');
    setAvailability(user.availability || '');
    setGithub(user.portfolioLinks?.github || '');
    setLinkedin(user.portfolioLinks?.linkedin || '');
    setWebsite(user.portfolioLinks?.website || '');
    setTeachingExperience(user.teachingExperience || '');
    setSkillsOffered(user.skillsOffered ? [...user.skillsOffered] : []);
    setSkillsWanted(user.skillsWanted ? [...user.skillsWanted] : []);

    if (user.proficiency && typeof user.proficiency === 'object') {
      setProficiency({ ...user.proficiency });
    } else {
      setProficiency({});
    }
  };

  const handleOpenEdit = () => {
    if (currentUser) populateForm(currentUser);
    setError('');
    setSuccess('');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (currentUser) populateForm(currentUser);
    setError('');
    setIsEditing(false);
  };

  const handleAddOfferedSkill = (e) => {
    e.preventDefault();
    const trimmed = newOfferedSkill.trim();
    if (!trimmed) return;
    if (skillsOffered.includes(trimmed)) {
      setError(`Skill "${trimmed}" is already in your offered skills list.`);
      return;
    }
    setSkillsOffered([...skillsOffered, trimmed]);
    setProficiency({ ...proficiency, [trimmed]: newOfferedLevel });
    setNewOfferedSkill('');
    setError('');
  };

  const handleRemoveOfferedSkill = (skillToRemove) => {
    setSkillsOffered(skillsOffered.filter(s => s !== skillToRemove));
    const nextProf = { ...proficiency };
    delete nextProf[skillToRemove];
    setProficiency(nextProf);
  };

  const handleAddWantedSkill = (e) => {
    e.preventDefault();
    const trimmed = newWantedSkill.trim();
    if (!trimmed) return;
    if (skillsWanted.includes(trimmed)) {
      setError(`Skill "${trimmed}" is already in your wanted skills list.`);
      return;
    }
    setSkillsWanted([...skillsWanted, trimmed]);
    setProficiency({ ...proficiency, [trimmed]: newWantedLevel });
    setNewWantedSkill('');
    setError('');
  };

  const handleRemoveWantedSkill = (skillToRemove) => {
    setSkillsWanted(skillsWanted.filter(s => s !== skillToRemove));
    const nextProf = { ...proficiency };
    delete nextProf[skillToRemove];
    setProficiency(nextProf);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        name,
        role,
        bio,
        location,
        avatar,
        availability,
        skillsOffered,
        skillsWanted,
        proficiency,
        teachingExperience,
        portfolioLinks: {
          github,
          linkedin,
          website
        }
      };

      const res = await userAPI.updateProfile(payload);
      if (res?.success && res.user) {
        updateUser(res.user);
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
      } else {
        setError(res?.message || 'Failed to update profile.');
      }
    } catch (err) {
      setError(err?.message || 'Network error occurred while updating profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you ABSOLUTELY certain you want to delete your SkillSync account? All profile records and exchange history will be permanently deleted.')) {
      return;
    }
    try {
      await userAPI.deleteAccount();
      logout();
      navigate('/register');
    } catch (err) {
      alert(err.message || 'Error deleting account');
    }
  };

  const getSkillVerificationDetails = (skillName) => {
    const verif = currentUser?.skillVerifications?.find(
      v => v.skill.toLowerCase() === skillName.toLowerCase()
    );
    if (!verif) {
      return {
        status: 'SELF_DECLARED',
        label: 'Self-Declared',
        score: 0,
        className: 'badge',
        customStyle: { backgroundColor: '#FFFBFA', color: '#89818A', border: '1px solid #EFE7E9' },
        demonstrated: 'Not Demonstrated'
      };
    }
    if (verif.status === 'SKILL_VERIFIED') {
      return {
        status: 'SKILL_VERIFIED',
        label: 'Skill Verified',
        score: verif.score,
        className: 'badge badge-verified',
        customStyle: {},
        demonstrated: verif.demonstratedProficiency
      };
    }
    if (verif.status === 'ASSESSMENT_PASSED') {
      return {
        status: 'ASSESSMENT_PASSED',
        label: 'Assessment Passed',
        score: verif.score,
        className: 'badge badge-blush',
        customStyle: {},
        demonstrated: verif.demonstratedProficiency
      };
    }
    return {
      status: 'SELF_DECLARED',
      label: 'Self-Declared',
      score: 0,
      className: 'badge',
      customStyle: { backgroundColor: '#FFFBFA', color: '#89818A', border: '1px solid #EFE7E9' },
      demonstrated: 'Not Demonstrated'
    };
  };

  if (!currentUser) return null;

  return (
    <div style={{ padding: '3.5rem 6%', maxWidth: '1200px', margin: '0 auto' }}>

      {/* Alert Banners */}
      {success && (
        <div style={{ backgroundColor: '#EBF7F1', border: '1px solid #B8E4CF', color: '#2F6C4C', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.5rem', fontWeight: 600 }}>
          ✓ {success}
        </div>
      )}

      {error && (
        <div style={{ backgroundColor: '#FDF4F6', border: '1px solid #F2CBD5', color: '#7A3D4C', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.5rem', fontWeight: 600 }}>
          ✕ {error}
        </div>
      )}

      {!isEditing ? (
        /* View Profile Mode */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>

          {/* Left Column: Avatar & Meta */}
          <div className="card" style={{ padding: '2rem', height: 'fit-content' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  style={{ width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 1rem', border: '2px solid #EFE7E9' }}
                />
              ) : (
                <div style={{ width: '88px', height: '88px', borderRadius: '50%', backgroundColor: '#F5E1E5', color: '#7A3D4C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800, margin: '0 auto 1rem', border: '1px solid #F2CBD5' }}>
                  {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
                </div>
              )}

              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, marginBottom: '0.2rem', color: '#39343A' }}>{currentUser.name}</h2>
              <p style={{ color: '#89818A', fontSize: '0.92rem', margin: '0 0 0.5rem 0' }}>
                {currentUser.role || 'Student'}
              </p>

              {/* Community Badges */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', flexWrap: 'wrap', margin: '0.75rem 0' }}>
                {currentUser.badges?.map((badge, idx) => (
                  <span key={idx} className="badge badge-lavender">
                    ★ {badge}
                  </span>
                ))}
              </div>

              <div className="badge badge-peach" style={{ padding: '0.35rem 0.85rem', fontSize: '0.82rem' }}>
                <StarIcon filled={true} size={15} /> {avgRating > 0 ? avgRating : '5.0'} Rating ({userReviews.length} reviews)
              </div>
            </div>

            <div style={{ borderTop: '1px solid #EFE7E9', paddingTop: '1.25rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              <div style={{ marginBottom: '0.75rem' }}>
                <span style={{ color: '#89818A', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Email</span>
                <span style={{ color: '#39343A' }}>{currentUser.email}</span>
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <span style={{ color: '#89818A', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Location</span>
                <span style={{ color: '#39343A' }}>{currentUser.location || 'Not specified'}</span>
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <span style={{ color: '#89818A', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Availability</span>
                <span style={{ color: '#39343A' }}>{currentUser.availability || 'Flexible'}</span>
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <span style={{ color: '#89818A', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Trust Score</span>
                <span style={{ fontWeight: 800, color: '#D99AAA' }}>{currentUser.trustScore || 50}%</span>
              </div>

              {/* Social / Portfolio Links */}
              {currentUser.portfolioLinks && (
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {currentUser.portfolioLinks.github && (
                    <a href={currentUser.portfolioLinks.github} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: '#D99AAA', textDecoration: 'none', fontWeight: 700 }}>
                      GitHub ↗
                    </a>
                  )}
                  {currentUser.portfolioLinks.linkedin && (
                    <a href={currentUser.portfolioLinks.linkedin} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: '#D99AAA', textDecoration: 'none', fontWeight: 700 }}>
                      LinkedIn ↗
                    </a>
                  )}
                  {currentUser.portfolioLinks.website && (
                    <a href={currentUser.portfolioLinks.website} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: '#D99AAA', textDecoration: 'none', fontWeight: 700 }}>
                      Portfolio ↗
                    </a>
                  )}
                </div>
              )}
            </div>

            <button onClick={handleOpenEdit} className="btn btn-primary" style={{ width: '100%', marginBottom: '0.75rem' }}>
              Edit Profile
            </button>
            <button onClick={handleDeleteAccount} className="btn btn-ghost btn-sm" style={{ width: '100%', color: '#7A3D4C' }}>
              Delete Account
            </button>
          </div>

          {/* Right Column: Bio, Skills & Verifications, Reviews */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

            {/* Bio */}
            <div className="card" style={{ padding: '2rem' }}>
              <h3 style={{ marginBottom: '0.65rem', fontSize: '1.25rem', fontWeight: 800, color: '#39343A' }}>About Me</h3>
              <p style={{ color: '#89818A', lineHeight: 1.6, margin: 0 }}>
                {currentUser.bio || 'No bio provided yet. Click "Edit Profile" to tell other students what you are passionate about!'}
              </p>
              {currentUser.teachingExperience && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #EFE7E9' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.75rem', color: '#89818A', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>TEACHING EXPERIENCE</div>
                  <p style={{ color: '#39343A', margin: 0, fontSize: '0.9rem' }}>{currentUser.teachingExperience}</p>
                </div>
              )}
            </div>

            {/* Skills Offered with Verification Badges */}
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h3 style={{ margin: 0, color: '#39343A', fontSize: '1.25rem', fontWeight: 800 }}>
                  Skills I Can Teach & Verified Badges
                </h3>
                <button
                  onClick={() => navigate('/assessments')}
                  className="btn btn-secondary btn-sm"
                >
                  <AwardIcon /> Verification Hub
                </button>
              </div>

              {(!currentUser.skillsOffered || currentUser.skillsOffered.length === 0) ? (
                <div style={{ padding: '1.75rem', backgroundColor: '#FFFBFA', borderRadius: '0.75rem', textAlign: 'center', color: '#89818A', border: '1px dashed #EFE7E9' }}>
                  <p>You haven't listed any skills to share yet.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {currentUser.skillsOffered.map((skill, index) => {
                    const claimedLevel = currentUser.proficiency?.[skill] || 'Intermediate';
                    const verif = getSkillVerificationDetails(skill);

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
                          gap: '0.75rem'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#39343A' }}>
                            {skill}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#89818A', marginTop: '2px' }}>
                            Claimed: <strong>{claimedLevel}</strong> • Demonstrated: <strong>{verif.demonstrated}</strong> {verif.score > 0 ? `(${verif.score}%)` : ''}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span className={verif.className} style={verif.customStyle}>
                            {verif.label}
                          </span>

                          {verif.status !== 'SKILL_VERIFIED' && (
                            <button
                              onClick={() => navigate('/assessments')}
                              style={{ background: 'none', border: 'none', color: '#D99AAA', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                            >
                              Verify ↗
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Skills Wanted */}
            <div className="card" style={{ padding: '2rem' }}>
              <h3 style={{ marginBottom: '1.25rem', color: '#39343A', fontSize: '1.25rem', fontWeight: 800 }}>
                Skills I Want to Learn
              </h3>
              {(!currentUser.skillsWanted || currentUser.skillsWanted.length === 0) ? (
                <div style={{ padding: '1.75rem', backgroundColor: '#FFFBFA', borderRadius: '0.75rem', textAlign: 'center', color: '#89818A', border: '1px dashed #EFE7E9' }}>
                  <p>You haven't specified any skills you wish to learn.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
                  {currentUser.skillsWanted.map((skill, index) => {
                    const level = currentUser.proficiency?.[skill] || 'Beginner';
                    return (
                      <span key={index} className="badge badge-peach" style={{ padding: '0.45rem 0.85rem', fontSize: '0.86rem' }}>
                        <span>{skill}</span>
                        <span style={{ fontSize: '0.72rem', opacity: 0.75, marginLeft: '0.35rem' }}>({level})</span>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Reviews Received */}
            <div className="card" style={{ padding: '2rem' }}>
              <h3 style={{ marginBottom: '1.25rem', fontSize: '1.25rem', fontWeight: 800, color: '#39343A' }}>
                Learner Reviews & Feedback ({userReviews.length})
              </h3>
              {userReviews.length === 0 ? (
                <div style={{ color: '#89818A', fontSize: '0.9rem' }}>
                  No reviews yet. Complete your first peer exchange session to earn learner feedback!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {userReviews.map((rev) => (
                    <div key={rev._id} style={{ padding: '1rem 1.25rem', backgroundColor: '#FFFBFA', borderRadius: '0.75rem', border: '1px solid #EFE7E9' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                        <span style={{ fontWeight: 700, color: '#39343A' }}>{rev.reviewer?.name || 'Peer Learner'}</span>
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
      ) : (
        /* Edit Profile Mode */
        <div className="card" style={{ padding: '2.5rem', borderRadius: '1.25rem' }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.6rem', fontWeight: 800, color: '#39343A' }}>Edit Your Profile</h2>

          <form onSubmit={handleSaveProfile}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Role / Major</label>
                <input
                  type="text"
                  className="form-input"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Computer Science Student, UX Designer"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Avatar Image URL</label>
                <input
                  type="url"
                  className="form-input"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Location / Campus</label>
                <input
                  type="text"
                  className="form-input"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. North Campus, Library"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Availability Schedule</label>
                <input
                  type="text"
                  className="form-input"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  placeholder="e.g. Weekdays 6-8pm, Weekends"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea
                className="form-textarea"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="Tell other students about your interests, study habits, and skill passions..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Teaching Experience & Style</label>
              <textarea
                className="form-textarea"
                value={teachingExperience}
                onChange={(e) => setTeachingExperience(e.target.value)}
                rows={2}
                placeholder="Mention past peer tutoring, study groups led, or your preferred mentorship cadence..."
              />
            </div>

            {/* Portfolio Links */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>GitHub URL</label>
                <input type="url" className="form-input" value={github} onChange={(e) => setGithub(e.target.value)} placeholder="https://github.com/..." />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>LinkedIn URL</label>
                <input type="url" className="form-input" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/..." />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Portfolio Website</label>
                <input type="url" className="form-input" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." />
              </div>
            </div>

            {/* Skills Offered Manager */}
            <div style={{ borderTop: '1px solid #EFE7E9', paddingTop: '1.5rem', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.15rem', color: '#D99AAA', marginBottom: '1rem', fontWeight: 800 }}>
                Skills You Can Teach
              </h3>

              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="e.g. Python, Java, React, Figma"
                  value={newOfferedSkill}
                  onChange={(e) => setNewOfferedSkill(e.target.value)}
                  className="form-input"
                  style={{ flex: 1, minWidth: '180px' }}
                />
                <select
                  value={newOfferedLevel}
                  onChange={(e) => setNewOfferedLevel(e.target.value)}
                  className="form-select"
                  style={{ width: 'auto' }}
                >
                  <option value="Basic">Basic</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
                <button type="button" onClick={handleAddOfferedSkill} className="btn btn-secondary btn-sm">
                  Add Skill
                </button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {skillsOffered.map((skill, idx) => (
                  <span key={idx} className="badge badge-blush" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                    {skill} ({proficiency[skill] || 'Intermediate'})
                    <button type="button" onClick={() => handleRemoveOfferedSkill(skill)} style={{ background: 'none', border: 'none', color: '#7A3D4C', fontWeight: 700, cursor: 'pointer', marginLeft: '0.3rem' }}>×</button>
                  </span>
                ))}
              </div>
            </div>

            {/* Skills Wanted Manager */}
            <div style={{ borderTop: '1px solid #EFE7E9', paddingTop: '1.5rem', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.15rem', color: '#8E7CB3', marginBottom: '1rem', fontWeight: 800 }}>
                Skills You Want to Learn
              </h3>

              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="e.g. Data Structures, UI/UX, Public Speaking"
                  value={newWantedSkill}
                  onChange={(e) => setNewWantedSkill(e.target.value)}
                  className="form-input"
                  style={{ flex: 1, minWidth: '180px' }}
                />
                <select
                  value={newWantedLevel}
                  onChange={(e) => setNewWantedLevel(e.target.value)}
                  className="form-select"
                  style={{ width: 'auto' }}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
                <button type="button" onClick={handleAddWantedSkill} className="btn btn-secondary btn-sm">
                  Add Skill
                </button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {skillsWanted.map((skill, idx) => (
                  <span key={idx} className="badge badge-peach" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                    {skill} ({proficiency[skill] || 'Beginner'})
                    <button type="button" onClick={() => handleRemoveWantedSkill(skill)} style={{ background: 'none', border: 'none', color: '#8C5332', fontWeight: 700, cursor: 'pointer', marginLeft: '0.3rem' }}>×</button>
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button type="button" onClick={handleCancelEdit} className="btn btn-secondary btn-sm" disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default Profile;
