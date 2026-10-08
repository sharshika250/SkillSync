import React, { useState, useEffect } from 'react';
import { useSkillSync } from '../context/SkillSyncContext';
import { userAPI } from '../services/api';
import { ShieldCheckIcon } from '../components/Icons';

const Profile = () => {
  const { currentUser, updateUser, refreshProfile } = useSkillSync();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [availability, setAvailability] = useState('');
  const [skillsOffered, setSkillsOffered] = useState([]);
  const [skillsWanted, setSkillsWanted] = useState([]);
  const [proficiency, setProficiency] = useState({});

  // Input states for adding new skills
  const [newOfferedSkill, setNewOfferedSkill] = useState('');
  const [newOfferedLevel, setNewOfferedLevel] = useState('Intermediate');
  const [newWantedSkill, setNewWantedSkill] = useState('');
  const [newWantedLevel, setNewWantedLevel] = useState('Beginner');

  useEffect(() => {
    if (currentUser) {
      populateForm(currentUser);
    }
  }, [currentUser]);

  const populateForm = (user) => {
    setName(user.name || '');
    setRole(user.role || 'Student');
    setBio(user.bio || '');
    setLocation(user.location || '');
    setAvailability(user.availability || '');
    setSkillsOffered(user.skillsOffered ? [...user.skillsOffered] : []);
    setSkillsWanted(user.skillsWanted ? [...user.skillsWanted] : []);
    
    // Normalize proficiency map
    if (user.proficiency && typeof user.proficiency === 'object') {
      setProficiency({ ...user.proficiency });
    } else {
      setProficiency({});
    }
  };

  const handleOpenEdit = () => {
    if (currentUser) {
      populateForm(currentUser);
    }
    setError('');
    setSuccess('');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (currentUser) {
      populateForm(currentUser);
    }
    setError('');
    setIsEditing(false);
  };

  // Add / Remove Skills Offered
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

  // Add / Remove Skills Wanted
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

  // Save changes to backend MongoDB
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Name is required.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: name.trim(),
        role: role.trim() || 'Student',
        bio: bio.trim(),
        location: location.trim(),
        availability: availability.trim(),
        skillsOffered,
        skillsWanted,
        proficiency
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
      setError(err?.message || 'Error updating profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="page-container" style={{ padding: '4rem 5%', textAlign: 'center' }}>
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  const initials = currentUser.name
    ? currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U';

  return (
    <div className="page-container" style={{ padding: '3rem 5%', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '0.25rem' }}>My Profile</h1>
          <p style={{ color: 'var(--text-light)', fontSize: '0.95rem' }}>Manage your skill exchange details and personal preferences</p>
        </div>
        {!isEditing && (
          <button onClick={handleOpenEdit} className="btn btn-primary" style={{ padding: '0.6rem 1.5rem' }}>
            Edit Profile
          </button>
        )}
      </div>

      {success && (
        <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{success}</span>
          <button onClick={() => setSuccess('')} style={{ background: 'none', border: 'none', color: '#047857', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
        </div>
      )}

      {error && !isEditing && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* Profile Overview (Read Mode) */}
      {!isEditing ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          
          {/* Left Column: Basic Info */}
          <div style={{ backgroundColor: 'var(--white)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
            <div style={{ width: '100px', height: '100px', backgroundColor: 'var(--primary-color)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 'bold', margin: '0 auto 1.5rem' }}>
              {initials}
            </div>
            <h2 style={{ textAlign: 'center', marginBottom: '0.25rem' }}>{currentUser.name}</h2>
            <p style={{ textAlign: 'center', color: 'var(--text-light)', marginBottom: '1rem', fontWeight: '500' }}>
              {currentUser.role || 'Student'}
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <span style={{ color: '#047857', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', backgroundColor: '#d1fae5', padding: '0.25rem 0.6rem', borderRadius: '1rem' }}>
                <ShieldCheckIcon /> Verified Student
              </span>
              <span style={{ color: '#b45309', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', backgroundColor: '#fef3c7', padding: '0.25rem 0.6rem', borderRadius: '1rem' }}>
                ★ {currentUser.trustScore || 5.0} Trust Score
              </span>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginBottom: '1.25rem' }}>
              <h4 style={{ color: 'var(--text-light)', marginBottom: '0.35rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</h4>
              <p style={{ fontSize: '0.95rem' }}>{currentUser.email}</p>
            </div>

            {currentUser.location && (
              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ color: 'var(--text-light)', marginBottom: '0.35rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Campus / Location</h4>
                <p style={{ fontSize: '0.95rem' }}>{currentUser.location}</p>
              </div>
            )}

            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ color: 'var(--text-light)', marginBottom: '0.35rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>About Me</h4>
              <p style={{ fontSize: '0.95rem', color: currentUser.bio ? 'var(--text-dark)' : 'var(--text-light)', fontStyle: currentUser.bio ? 'normal' : 'italic' }}>
                {currentUser.bio || 'No bio added yet.'}
              </p>
            </div>

            <div>
              <h4 style={{ color: 'var(--text-light)', marginBottom: '0.35rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Availability</h4>
              <p style={{ fontSize: '0.95rem', color: currentUser.availability ? 'var(--text-dark)' : 'var(--text-light)', fontStyle: currentUser.availability ? 'normal' : 'italic' }}>
                {currentUser.availability || 'Schedule not specified.'}
              </p>
            </div>
          </div>

          {/* Right Column: Skills */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Skills Offered */}
            <div style={{ backgroundColor: 'var(--white)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
              <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)' }}>
                <span>↑</span> Skills I Can Teach
              </h3>
              {(!currentUser.skillsOffered || currentUser.skillsOffered.length === 0) ? (
                <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-light)', borderRadius: '0.5rem', textAlign: 'center', color: 'var(--text-light)' }}>
                  <p>You haven't listed any skills to share yet.</p>
                  <button onClick={handleOpenEdit} className="btn btn-secondary" style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>
                    + Add Skills You Offer
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  {currentUser.skillsOffered.map((skill, index) => {
                    const level = currentUser.proficiency?.[skill] || 'Intermediate';
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
                <span>↓</span> Skills I Want to Learn
              </h3>
              {(!currentUser.skillsWanted || currentUser.skillsWanted.length === 0) ? (
                <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-light)', borderRadius: '0.5rem', textAlign: 'center', color: 'var(--text-light)' }}>
                  <p>You haven't specified any skills you wish to learn.</p>
                  <button onClick={handleOpenEdit} className="btn btn-secondary" style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>
                    + Add Skills You Want
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  {currentUser.skillsWanted.map((skill, index) => {
                    const level = currentUser.proficiency?.[skill] || 'Beginner';
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
      ) : (
        /* Edit Profile Mode */
        <div style={{ backgroundColor: 'var(--white)', padding: '2.5rem', borderRadius: '1rem', border: '1px solid var(--border-color)', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Edit Your Profile</h2>

          {error && (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSaveProfile}>
            
            {/* Basic Info Inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)', fontSize: '1rem' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>Role / Major</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Computer Science Student, UX Designer"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)', fontSize: '1rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>Location / Campus</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Main Campus, Building B"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)', fontSize: '1rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>Availability Schedule</label>
                <input
                  type="text"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  placeholder="e.g. Weekends, Tue/Thu Evenings"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)', fontSize: '1rem' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>Short Bio</label>
              <textarea
                rows="3"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share a few words about yourself, your interests, and what you enjoy learning..."
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)', fontSize: '1rem', resize: 'vertical' }}
              />
            </div>

            {/* Skills Offered Section */}
            <div style={{ padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '0.75rem', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '0.75rem', color: 'var(--primary-color)' }}>
                Skills You Can Teach
              </h3>
              
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  value={newOfferedSkill}
                  onChange={(e) => setNewOfferedSkill(e.target.value)}
                  placeholder="e.g. Python, Graphic Design, Web Development"
                  style={{ flex: '1', minWidth: '200px', padding: '0.6rem 0.75rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)', fontSize: '0.95rem' }}
                />
                <select
                  value={newOfferedLevel}
                  onChange={(e) => setNewOfferedLevel(e.target.value)}
                  style={{ padding: '0.6rem 0.75rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)', fontSize: '0.95rem', backgroundColor: 'var(--white)' }}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddOfferedSkill}
                  className="btn btn-primary"
                  style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}
                >
                  + Add Skill
                </button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {skillsOffered.length === 0 ? (
                  <span style={{ color: 'var(--text-light)', fontSize: '0.9rem', fontStyle: 'italic' }}>No skills added yet.</span>
                ) : (
                  skillsOffered.map((skill, index) => (
                    <span key={index} style={{ padding: '0.4rem 0.8rem', backgroundColor: '#e0e7ff', color: 'var(--primary-color)', borderRadius: '1.5rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {skill} ({proficiency[skill] || 'Intermediate'})
                      <button
                        type="button"
                        onClick={() => handleRemoveOfferedSkill(skill)}
                        style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', padding: '0 0.2rem' }}
                      >
                        ×
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Skills Wanted Section */}
            <div style={{ padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '0.75rem', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '0.75rem', color: '#047857' }}>
                Skills You Want to Learn
              </h3>
              
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  value={newWantedSkill}
                  onChange={(e) => setNewWantedSkill(e.target.value)}
                  placeholder="e.g. Figma, Machine Learning, Guitar"
                  style={{ flex: '1', minWidth: '200px', padding: '0.6rem 0.75rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)', fontSize: '0.95rem' }}
                />
                <select
                  value={newWantedLevel}
                  onChange={(e) => setNewWantedLevel(e.target.value)}
                  style={{ padding: '0.6rem 0.75rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)', fontSize: '0.95rem', backgroundColor: 'var(--white)' }}
                >
                  <option value="Beginner">Beginner Target</option>
                  <option value="Intermediate">Intermediate Target</option>
                  <option value="Advanced">Advanced Target</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddWantedSkill}
                  className="btn btn-secondary"
                  style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem', borderColor: '#047857', color: '#047857' }}
                >
                  + Add Skill
                </button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {skillsWanted.length === 0 ? (
                  <span style={{ color: 'var(--text-light)', fontSize: '0.9rem', fontStyle: 'italic' }}>No skills added yet.</span>
                ) : (
                  skillsWanted.map((skill, index) => (
                    <span key={index} style={{ padding: '0.4rem 0.8rem', backgroundColor: '#d1fae5', color: '#047857', borderRadius: '1.5rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {skill} ({proficiency[skill] || 'Beginner'})
                      <button
                        type="button"
                        onClick={() => handleRemoveWantedSkill(skill)}
                        style={{ background: 'none', border: 'none', color: '#047857', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', padding: '0 0.2rem' }}
                      >
                        ×
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="btn btn-ghost"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ padding: '0.75rem 2rem' }}
                disabled={loading}
              >
                {loading ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
};

export default Profile;
