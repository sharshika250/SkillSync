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
    <div style={{ padding: '3.5rem 6%', maxWidth: '800px', margin: '0 auto' }}>
      <div className="card" style={{ padding: '2.5rem', borderRadius: '1.25rem' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '56px', height: '56px', backgroundColor: '#F5E1E5', color: '#7A3D4C', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', border: '1px solid #F2CBD5' }}>
            <HandshakeIcon />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.4rem', color: '#39343A' }}>Propose Skill Exchange</h1>
          <p style={{ color: '#89818A', fontSize: '1rem' }}>
            Initiate a collaborative learning exchange with <strong>{partnerName}</strong>
          </p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#FDF4F6', border: '1px solid #F2CBD5', color: '#7A3D4C', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ backgroundColor: '#EBF7F1', border: '1px solid #B8E4CF', color: '#2F6C4C', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            {success}
          </div>
        )}

        {/* Partner Selection (if loaded from all users) */}
        {allPartners.length > 0 && (
          <div className="form-group">
            <label className="form-label">Select Partner</label>
            <select
              value={selectedPartnerId}
              onChange={handlePartnerSelect}
              className="form-select"
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
          <div style={{ display: 'flex', backgroundColor: '#FFFBFA', padding: '1.5rem', borderRadius: '0.75rem', marginBottom: '2rem', border: '1px solid #EFE7E9', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ flex: '1', minWidth: '180px' }}>
              <p style={{ fontSize: '0.72rem', color: '#89818A', marginBottom: '0.25rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>They Offer:</p>
              <p style={{ fontWeight: 700, color: '#D99AAA', fontSize: '1.05rem', margin: 0 }}>
                {partner.skillsOffered?.join(', ') || 'Various skills'}
              </p>
            </div>
            <div style={{ flex: '1', minWidth: '180px' }}>
              <p style={{ fontSize: '0.72rem', color: '#89818A', marginBottom: '0.25rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>They Want To Learn:</p>
              <p style={{ fontWeight: 700, color: '#8E7CB3', fontSize: '1.05rem', margin: 0 }}>
                {partner.skillsWanted?.join(', ') || 'Open to proposals'}
              </p>
            </div>
            {matchScore > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', paddingLeft: '1rem', borderLeft: '1px solid #EFE7E9' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#39343A' }}>{matchScore}%</span>
                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#89818A', fontWeight: 700 }}>Match</span>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          
          {/* Skill offered selector */}
          <div className="form-group">
            <label className="form-label">
              Skill You Will Teach (Offered Skill) *
            </label>
            <select
              value={offeredSkill}
              onChange={(e) => setOfferedSkill(e.target.value)}
              className="form-select"
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
                className="form-input"
                style={{ marginTop: '0.75rem' }}
                required
              />
            )}
          </div>

          {/* Skill requested selector */}
          <div className="form-group">
            <label className="form-label">
              Skill You Want to Learn (Requested Skill) *
            </label>
            <select
              value={requestedSkill}
              onChange={(e) => setRequestedSkill(e.target.value)}
              className="form-select"
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
                className="form-input"
                style={{ marginTop: '0.75rem' }}
                required
              />
            )}
          </div>

          {/* Introduction Message */}
          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label">
              Introduction Message *
            </label>
            <textarea 
              rows="4"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="form-textarea"
              required
            ></textarea>
            <p style={{ fontSize: '0.8rem', color: '#89818A', marginTop: '0.4rem' }}>
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