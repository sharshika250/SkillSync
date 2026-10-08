import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HandshakeIcon } from '../components/Icons';
import { useSkillSync } from '../context/SkillSyncContext';
import { requestAPI, userAPI } from '../services/api';

const RequestExchange = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useSkillSync();

  const [partner, setPartner] = useState(location.state?.partner || null);
  const [allPartners, setAllPartners] = useState([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState(location.state?.partner?._id || location.state?.partner?.id || '');

  const [offeredSkill, setOfferedSkill] = useState('');
  const [customOfferedSkill, setCustomOfferedSkill] = useState('');
  const [requestedSkill, setRequestedSkill] = useState('');
  const [customRequestedSkill, setCustomRequestedSkill] = useState('');
  const [message, setMessage] = useState('');

  const [loadingPartners, setLoadingPartners] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // If no partner was passed via state, fetch available users
  useEffect(() => {
    if (!partner) {
      const loadPartners = async () => {
        try {
          setLoadingPartners(true);
          const res = await userAPI.getAllUsers();
          if (res?.success && res.users) {
            setAllPartners(res.users);
            if (res.users.length > 0) {
              const first = res.users[0];
              setSelectedPartnerId(first._id || first.id);
              setPartner(first);
            }
          }
        } catch (err) {
          setError(err?.message || 'Could not load skill partners');
        } finally {
          setLoadingPartners(false);
        }
      };
      loadPartners();
    }
  }, [partner]);

  // When partner changes, update default skills and message
  useEffect(() => {
    if (partner) {
      const partnerOffered = partner.skillsOffered && partner.skillsOffered.length > 0
        ? partner.skillsOffered[0]
        : '';
      const myOffered = currentUser?.skillsOffered && currentUser.skillsOffered.length > 0
        ? currentUser.skillsOffered[0]
        : '';

      setOfferedSkill(myOffered);
      setRequestedSkill(partnerOffered);

      const pName = partner.name || 'there';
      const toLearn = partnerOffered || 'your skills';
      const toTeach = myOffered || 'collaborative learning';
      setMessage(
        `Hi ${pName.split(' ')[0]}! I saw that you're offering guidance in ${toLearn} and I'd love to exchange that for ${toTeach}. Let me know if you would like to connect!`
      );
    }
  }, [partner, currentUser]);

  const handlePartnerSelect = (e) => {
    const pId = e.target.value;
    setSelectedPartnerId(pId);
    const found = allPartners.find(p => String(p._id || p.id) === String(pId));
    if (found) {
      setPartner(found);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const partnerId = partner?._id || partner?.id || selectedPartnerId;
    if (!partnerId) {
      setError('Please select a valid skill partner.');
      return;
    }

    if (currentUser && String(currentUser.id || currentUser._id) === String(partnerId)) {
      setError('You cannot send an exchange request to yourself.');
      return;
    }

    const finalOffered = offeredSkill === '__custom__' ? customOfferedSkill.trim() : offeredSkill.trim();
    const finalRequested = requestedSkill === '__custom__' ? customRequestedSkill.trim() : requestedSkill.trim();

    if (!finalOffered) {
      setError('Please specify the skill you are offering to teach.');
      return;
    }

    if (!finalRequested) {
      setError('Please specify the skill you wish to learn.');
      return;
    }

    if (!message.trim()) {
      setError('Please write a brief introduction message.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await requestAPI.createRequest({
        receiverId: partnerId,
        offeredSkill: finalOffered,
        requestedSkill: finalRequested,
        message: message.trim()
      });

      if (res?.success) {
        setSuccess('Exchange request sent successfully!');
        setTimeout(() => {
          navigate('/requests');
        }, 1200);
      } else {
        setError(res?.message || 'Failed to send request.');
      }
    } catch (err) {
      setError(err?.message || 'Error communicating with server.');
    } finally {
      setSubmitting(false);
    }
  };

  const partnerName = partner?.name || 'Skill Partner';
  const matchScore = partner?.matchScore ?? 85;

  return (
    <div className="page-container" style={{ padding: '3.5rem 5%', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ backgroundColor: 'var(--white)', borderRadius: '1rem', border: '1px solid var(--border-color)', padding: '2.5rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '64px', height: '64px', backgroundColor: 'var(--primary-color)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <HandshakeIcon />
          </div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Propose Skill Exchange</h1>
          <p style={{ color: 'var(--text-light)', fontSize: '1rem' }}>
            Initiate a collaborative learning exchange with <strong>{partnerName}</strong>
          </p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            {success}
          </div>
        )}

        {/* Partner Selection (if loaded from all users) */}
        {allPartners.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>Select Partner</label>
            <select
              value={selectedPartnerId}
              onChange={handlePartnerSelect}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)', fontSize: '1rem', backgroundColor: 'var(--white)' }}
            >
              {allPartners.map(p => (
                <option key={p._id || p.id} value={p._id || p.id}>
                  {p.name} ({p.role || 'Student'}) - Offers: {p.skillsOffered?.join(', ') || 'N/A'}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Overview Box */}
        {partner && (
          <div style={{ display: 'flex', backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '0.75rem', marginBottom: '2rem', border: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ flex: '1', minWidth: '180px' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginBottom: '0.25rem', textTransform: 'uppercase', fontWeight: '600' }}>They Offer:</p>
              <p style={{ fontWeight: '600', color: 'var(--secondary-color)', fontSize: '1rem' }}>
                {partner.skillsOffered?.join(', ') || 'Various skills'}
              </p>
            </div>
            <div style={{ flex: '1', minWidth: '180px' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginBottom: '0.25rem', textTransform: 'uppercase', fontWeight: '600' }}>They Want To Learn:</p>
              <p style={{ fontWeight: '600', color: 'var(--primary-color)', fontSize: '1rem' }}>
                {partner.skillsWanted?.join(', ') || 'Open to proposals'}
              </p>
            </div>
            {matchScore > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', paddingLeft: '1rem', borderLeft: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-dark)' }}>{matchScore}%</span>
                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-light)' }}>Match</span>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          
          {/* Skill offered selector */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>
              Skill You Will Teach (Offered Skill) *
            </label>
            <select
              value={offeredSkill}
              onChange={(e) => setOfferedSkill(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)', fontSize: '1rem', backgroundColor: 'var(--white)' }}
            >
              {currentUser?.skillsOffered?.map((sk, idx) => (
                <option key={idx} value={sk}>{sk}</option>
              ))}
              <option value="__custom__">+ Enter custom skill</option>
            </select>

            {offeredSkill === '__custom__' && (
              <input
                type="text"
                placeholder="Enter skill name you will teach..."
                value={customOfferedSkill}
                onChange={(e) => setCustomOfferedSkill(e.target.value)}
                style={{ marginTop: '0.75rem', width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)', fontSize: '1rem' }}
                required
              />
            )}
          </div>

          {/* Skill requested selector */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>
              Skill You Want to Learn (Requested Skill) *
            </label>
            <select
              value={requestedSkill}
              onChange={(e) => setRequestedSkill(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)', fontSize: '1rem', backgroundColor: 'var(--white)' }}
            >
              {partner?.skillsOffered?.map((sk, idx) => (
                <option key={idx} value={sk}>{sk}</option>
              ))}
              <option value="__custom__">+ Enter custom skill</option>
            </select>

            {requestedSkill === '__custom__' && (
              <input
                type="text"
                placeholder="Enter skill name you want to learn..."
                value={customRequestedSkill}
                onChange={(e) => setCustomRequestedSkill(e.target.value)}
                style={{ marginTop: '0.75rem', width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)', fontSize: '1rem' }}
                required
              />
            )}
          </div>

          {/* Introduction Message */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>
              Introduction Message *
            </label>
            <textarea 
              rows="4"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)', fontSize: '1rem', resize: 'vertical' }}
              required
            ></textarea>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginTop: '0.4rem' }}>
              Explain how you'd like to structure the exchange, preferred meeting times, and learning goals.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button 
              type="button" 
              onClick={() => navigate(-1)} 
              className="btn btn-ghost"
              disabled={submitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ padding: '0.75rem 2rem' }}
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Send Request'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default RequestExchange;
