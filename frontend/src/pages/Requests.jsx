import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestAPI } from '../services/api';
import { useSkillSync } from '../context/SkillSyncContext';

const Requests = () => {
  const navigate = useNavigate();
  const { currentUser } = useSkillSync();

  const [activeTab, setActiveTab] = useState('received'); // 'received' | 'sent'
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await requestAPI.getRequests();
      if (res?.success) {
        setReceivedRequests(res.received || []);
        setSentRequests(res.sent || []);
      }
    } catch (err) {
      setError(err?.message || 'Could not load requests from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAccept = async (id) => {
    try {
      setProcessingId(id);
      setError('');
      const res = await requestAPI.acceptRequest(id);
      if (res?.success) {
        setActionSuccess('Exchange request accepted! The match is now active.');
        await fetchRequests();
      } else {
        setError(res?.message || 'Failed to accept request.');
      }
    } catch (err) {
      setError(err?.message || 'Error accepting request.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    try {
      setProcessingId(id);
      setError('');
      const res = await requestAPI.rejectRequest(id);
      if (res?.success) {
        setActionSuccess('Exchange request declined.');
        await fetchRequests();
      } else {
        setError(res?.message || 'Failed to decline request.');
      }
    } catch (err) {
      setError(err?.message || 'Error declining request.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancel = async (id) => {
    try {
      setProcessingId(id);
      setError('');
      const res = await requestAPI.cancelRequest(id);
      if (res?.success) {
        setActionSuccess('Sent request cancelled.');
        await fetchRequests();
      } else {
        setError(res?.message || 'Failed to cancel request.');
      }
    } catch (err) {
      setError(err?.message || 'Error cancelling request.');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted':
        return <span className="badge badge-success">Accepted</span>;
      case 'rejected':
        return <span className="badge badge-blush" style={{ color: '#7A3D4C' }}>Declined</span>;
      case 'cancelled':
        return <span className="badge" style={{ backgroundColor: '#EFE7E9', color: '#89818A' }}>Cancelled</span>;
      default:
        return <span className="badge badge-peach">Pending</span>;
    }
  };

  return (
    <div style={{ padding: '3.5rem 6%', maxWidth: '1040px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.35rem', color: '#39343A' }}>Exchange Requests</h1>
          <p style={{ color: '#89818A', fontSize: '1rem' }}>
            Manage incoming proposals and track requests you've sent to peers
          </p>
        </div>
        <button onClick={() => navigate('/explore')} className="btn btn-primary">
          + Propose New Exchange
        </button>
      </div>

      {actionSuccess && (
        <div style={{ backgroundColor: '#EBF7F1', border: '1px solid #B8E4CF', color: '#2F6C4C', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess('')} style={{ background: 'none', border: 'none', color: '#2F6C4C', cursor: 'pointer', fontWeight: 700 }}>✕</button>
        </div>
      )}

      {error && (
        <div style={{ backgroundColor: '#FDF4F6', border: '1px solid #F2CBD5', color: '#7A3D4C', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #EFE7E9', marginBottom: '2rem' }}>
        <button
          onClick={() => setActiveTab('received')}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'received' ? '3px solid #D99AAA' : '3px solid transparent',
            color: activeTab === 'received' ? '#39343A' : '#89818A',
            fontWeight: activeTab === 'received' ? 700 : 500,
            fontSize: '1rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.15s ease'
          }}
        >
          Received Requests
          <span style={{ backgroundColor: activeTab === 'received' ? '#D99AAA' : '#EFE7E9', color: activeTab === 'received' ? 'white' : '#89818A', padding: '0.1rem 0.55rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }}>
            {receivedRequests.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('sent')}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'sent' ? '3px solid #D99AAA' : '3px solid transparent',
            color: activeTab === 'sent' ? '#39343A' : '#89818A',
            fontWeight: activeTab === 'sent' ? 700 : 500,
            fontSize: '1rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.15s ease'
          }}
        >
          Sent Requests
          <span style={{ backgroundColor: activeTab === 'sent' ? '#D99AAA' : '#EFE7E9', color: activeTab === 'sent' ? 'white' : '#89818A', padding: '0.1rem 0.55rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }}>
            {sentRequests.length}
          </span>
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <div style={{ display: 'inline-block', width: '36px', height: '36px', border: '3px solid #F5E1E5', borderTop: '3px solid #D99AAA', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ marginTop: '1rem', color: '#89818A' }}>Fetching exchange requests...</p>
        </div>
      )}

      {/* Tab 1: Received Requests */}
      {!loading && activeTab === 'received' && (
        <div>
          {receivedRequests.length === 0 ? (
            <div className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📬</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#39343A' }}>No Received Requests</h3>
              <p style={{ color: '#89818A', marginBottom: '1.5rem' }}>
                When other students request to learn from you or propose a skill exchange, their proposals will appear here.
              </p>
              <button onClick={() => navigate('/profile')} className="btn btn-secondary btn-sm">
                Update Your Offered Skills
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {receivedRequests.map((req) => {
                const sender = req.sender || {};
                const senderName = sender.name || 'Anonymous User';
                const senderRole = sender.role || 'Student';
                const initials = senderName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

                return (
                  <div key={req._id} className="card" style={{ padding: '1.75rem' }}>
                    
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#F5E1E5', color: '#7A3D4C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, border: '1px solid #F2CBD5' }}>
                          {initials}
                        </div>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#39343A' }}>{senderName}</h3>
                          <span style={{ color: '#89818A', fontSize: '0.85rem' }}>{senderRole}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {req.matchScore > 0 && (
                          <span className="badge badge-blush">
                            {req.matchScore}% Match
                          </span>
                        )}
                        {getStatusBadge(req.status)}
                      </div>
                    </div>

                    {/* Skill Exchange Details */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', backgroundColor: '#FFFBFA', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #EFE7E9', marginBottom: '1.25rem' }}>
                      <div>
                        <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#89818A', fontWeight: 700, letterSpacing: '0.04em' }}>They Offer To Teach:</span>
                        <p style={{ fontWeight: 700, color: '#D99AAA', marginTop: '0.2rem', fontSize: '0.98rem' }}>
                          {req.offeredSkill}
                        </p>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#89818A', fontWeight: 700, letterSpacing: '0.04em' }}>They Want To Learn:</span>
                        <p style={{ fontWeight: 700, color: '#8E7CB3', marginTop: '0.2rem', fontSize: '0.98rem' }}>
                          {req.requestedSkill}
                        </p>
                      </div>
                    </div>

                    {/* Message */}
                    {req.message && (
                      <div style={{ marginBottom: '1.5rem', padding: '0.85rem 1.1rem', backgroundColor: '#FDF4F6', borderLeft: '3px solid #D99AAA', borderRadius: '0 0.5rem 0.5rem 0', fontSize: '0.9rem', color: '#39343A', fontStyle: 'italic' }}>
                        "{req.message}"
                      </div>
                    )}

                    {/* Footer / Actions */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #EFE7E9', paddingTop: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <span style={{ fontSize: '0.8rem', color: '#89818A' }}>
                        Received on {new Date(req.createdAt).toLocaleDateString()}
                      </span>

                      {req.status === 'pending' ? (
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                          <button
                            onClick={() => handleReject(req._id)}
                            disabled={processingId === req._id}
                            className="btn btn-secondary btn-sm"
                            style={{ borderColor: '#F2CBD5', color: '#7A3D4C' }}
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => handleAccept(req._id)}
                            disabled={processingId === req._id}
                            className="btn btn-primary btn-sm"
                          >
                            {processingId === req._id ? 'Accepting...' : 'Accept Exchange'}
                          </button>
                        </div>
                      ) : req.status === 'accepted' ? (
                        <button onClick={() => navigate('/matches')} className="btn btn-primary btn-sm">
                          View Active Match &rarr;
                        </button>
                      ) : null}
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Sent Requests */}
      {!loading && activeTab === 'sent' && (
        <div>
          {sentRequests.length === 0 ? (
            <div className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🚀</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#39343A' }}>No Sent Requests</h3>
              <p style={{ color: '#89818A', marginBottom: '1.5rem' }}>
                You haven't sent any skill exchange proposals yet. Explore community profiles to find partners!
              </p>
              <button onClick={() => navigate('/explore')} className="btn btn-primary btn-sm">
                Explore Skills Now
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {sentRequests.map((req) => {
                const receiver = req.receiver || {};
                const receiverName = receiver.name || 'Skill Partner';
                const receiverRole = receiver.role || 'Student';
                const initials = receiverName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

                return (
                  <div key={req._id} className="card" style={{ padding: '1.75rem' }}>
                    
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#EAE5F4', color: '#554471', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, border: '1px solid #D7CEE9' }}>
                          {initials}
                        </div>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#39343A' }}>Sent to {receiverName}</h3>
                          <span style={{ color: '#89818A', fontSize: '0.85rem' }}>{receiverRole}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {req.matchScore > 0 && (
                          <span className="badge badge-blush">
                            {req.matchScore}% Match
                          </span>
                        )}
                        {getStatusBadge(req.status)}
                      </div>
                    </div>

                    {/* Skill Details */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', backgroundColor: '#FFFBFA', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #EFE7E9', marginBottom: '1.25rem' }}>
                      <div>
                        <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#89818A', fontWeight: 700, letterSpacing: '0.04em' }}>You Offered To Teach:</span>
                        <p style={{ fontWeight: 700, color: '#D99AAA', marginTop: '0.2rem', fontSize: '0.98rem' }}>
                          {req.offeredSkill}
                        </p>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#89818A', fontWeight: 700, letterSpacing: '0.04em' }}>You Requested To Learn:</span>
                        <p style={{ fontWeight: 700, color: '#8E7CB3', marginTop: '0.2rem', fontSize: '0.98rem' }}>
                          {req.requestedSkill}
                        </p>
                      </div>
                    </div>

                    {/* Message */}
                    {req.message && (
                      <div style={{ marginBottom: '1.5rem', padding: '0.85rem 1.1rem', backgroundColor: '#FDF4F6', borderLeft: '3px solid #D99AAA', borderRadius: '0 0.5rem 0.5rem 0', fontSize: '0.9rem', color: '#39343A', fontStyle: 'italic' }}>
                        "{req.message}"
                      </div>
                    )}

                    {/* Footer / Cancel Action */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #EFE7E9', paddingTop: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <span style={{ fontSize: '0.8rem', color: '#89818A' }}>
                        Sent on {new Date(req.createdAt).toLocaleDateString()}
                      </span>

                      {req.status === 'pending' && (
                        <button
                          onClick={() => handleCancel(req._id)}
                          disabled={processingId === req._id}
                          className="btn btn-ghost btn-sm"
                          style={{ color: '#7A3D4C' }}
                        >
                          {processingId === req._id ? 'Cancelling...' : 'Cancel Request'}
                        </button>
                      )}

                      {req.status === 'accepted' && (
                        <button onClick={() => navigate('/matches')} className="btn btn-primary btn-sm">
                          View Active Match &rarr;
                        </button>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default Requests;