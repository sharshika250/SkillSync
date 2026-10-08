import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestAPI } from '../services/api';
import { useSkillSync } from '../context/SkillSyncContext';
import { HandshakeIcon } from '../components/Icons';

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
        return (
          <span style={{ backgroundColor: '#d1fae5', color: '#047857', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: '600', textTransform: 'capitalize' }}>
            Accepted
          </span>
        );
      case 'rejected':
        return (
          <span style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: '600', textTransform: 'capitalize' }}>
            Declined
          </span>
        );
      case 'cancelled':
        return (
          <span style={{ backgroundColor: '#f3f4f6', color: '#6b7280', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: '600', textTransform: 'capitalize' }}>
            Cancelled
          </span>
        );
      default:
        return (
          <span style={{ backgroundColor: '#fef3c7', color: '#b45309', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: '600', textTransform: 'capitalize' }}>
            Pending
          </span>
        );
    }
  };

  return (
    <div className="page-container" style={{ padding: '3.5rem 5%', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '0.25rem' }}>Exchange Requests</h1>
          <p style={{ color: 'var(--text-light)', fontSize: '1rem' }}>
            Manage incoming proposals and track requests you've sent to peers
          </p>
        </div>
        <button onClick={() => navigate('/explore')} className="btn btn-primary" style={{ padding: '0.6rem 1.25rem' }}>
          + Propose New Exchange
        </button>
      </div>

      {actionSuccess && (
        <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess('')} style={{ background: 'none', border: 'none', color: '#047857', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
        </div>
      )}

      {error && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid var(--border-color)', marginBottom: '2rem' }}>
        <button
          onClick={() => setActiveTab('received')}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'received' ? '3px solid var(--primary-color)' : '3px solid transparent',
            color: activeTab === 'received' ? 'var(--primary-color)' : 'var(--text-light)',
            fontWeight: activeTab === 'received' ? '700' : '500',
            fontSize: '1rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          Received Requests
          <span style={{ backgroundColor: activeTab === 'received' ? 'var(--primary-color)' : 'var(--border-color)', color: activeTab === 'received' ? 'white' : 'var(--text-dark)', padding: '0.1rem 0.5rem', borderRadius: '1rem', fontSize: '0.75rem' }}>
            {receivedRequests.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('sent')}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'sent' ? '3px solid var(--primary-color)' : '3px solid transparent',
            color: activeTab === 'sent' ? 'var(--primary-color)' : 'var(--text-light)',
            fontWeight: activeTab === 'sent' ? '700' : '500',
            fontSize: '1rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          Sent Requests
          <span style={{ backgroundColor: activeTab === 'sent' ? 'var(--primary-color)' : 'var(--border-color)', color: activeTab === 'sent' ? 'white' : 'var(--text-dark)', padding: '0.1rem 0.5rem', borderRadius: '1rem', fontSize: '0.75rem' }}>
            {sentRequests.length}
          </span>
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <div style={{ display: 'inline-block', width: '36px', height: '36px', border: '3px solid #e0e7ff', borderTop: '3px solid var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ marginTop: '1rem', color: 'var(--text-light)' }}>Fetching exchange requests...</p>
        </div>
      )}

      {/* Tab 1: Received Requests */}
      {!loading && activeTab === 'received' && (
        <div>
          {receivedRequests.length === 0 ? (
            <div style={{ backgroundColor: 'var(--white)', border: '1px solid var(--border-color)', borderRadius: '1rem', padding: '3.5rem 2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📬</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Received Requests</h3>
              <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem' }}>
                When other students request to learn from you or propose a skill exchange, their proposals will appear here.
              </p>
              <button onClick={() => navigate('/profile')} className="btn btn-secondary">
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
                  <div key={req._id} style={{ backgroundColor: 'var(--white)', borderRadius: '1rem', border: '1px solid var(--border-color)', padding: '1.75rem', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                    
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                          {initials}
                        </div>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '1.15rem' }}>{senderName}</h3>
                          <span style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>{senderRole}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {req.matchScore > 0 && (
                          <span style={{ backgroundColor: '#e0e7ff', color: 'var(--primary-color)', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: '700' }}>
                            {req.matchScore}% Match
                          </span>
                        )}
                        {getStatusBadge(req.status)}
                      </div>
                    </div>

                    {/* Skill Exchange Details */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '0.5rem', marginBottom: '1.25rem' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-light)', fontWeight: '600' }}>They Offer To Teach:</span>
                        <p style={{ fontWeight: '600', color: 'var(--primary-color)', marginTop: '0.2rem', fontSize: '0.95rem' }}>
                          {req.offeredSkill}
                        </p>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-light)', fontWeight: '600' }}>They Want To Learn:</span>
                        <p style={{ fontWeight: '600', color: 'var(--secondary-color)', marginTop: '0.2rem', fontSize: '0.95rem' }}>
                          {req.requestedSkill}
                        </p>
                      </div>
                    </div>

                    {/* Message */}
                    {req.message && (
                      <div style={{ marginBottom: '1.5rem', padding: '0.75rem 1rem', backgroundColor: 'var(--white)', borderLeft: '3px solid var(--primary-color)', fontSize: '0.9rem', color: 'var(--text-dark)' }}>
                        "{req.message}"
                      </div>
                    )}

                    {/* Footer / Actions */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                        Received on {new Date(req.createdAt).toLocaleDateString()}
                      </span>

                      {req.status === 'pending' ? (
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                          <button
                            onClick={() => handleReject(req._id)}
                            disabled={processingId === req._id}
                            className="btn btn-secondary"
                            style={{ borderColor: '#ef4444', color: '#ef4444', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => handleAccept(req._id)}
                            disabled={processingId === req._id}
                            className="btn btn-primary"
                            style={{ backgroundColor: '#059669', borderColor: '#059669', padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}
                          >
                            {processingId === req._id ? 'Accepting...' : 'Accept Exchange'}
                          </button>
                        </div>
                      ) : req.status === 'accepted' ? (
                        <button onClick={() => navigate('/matches')} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
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
            <div style={{ backgroundColor: 'var(--white)', border: '1px solid var(--border-color)', borderRadius: '1rem', padding: '3.5rem 2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🚀</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Sent Requests</h3>
              <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem' }}>
                You haven't sent any skill exchange proposals yet. Explore community profiles to find partners!
              </p>
              <button onClick={() => navigate('/explore')} className="btn btn-primary">
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
                  <div key={req._id} style={{ backgroundColor: 'var(--white)', borderRadius: '1rem', border: '1px solid var(--border-color)', padding: '1.75rem', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                    
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: 'var(--secondary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                          {initials}
                        </div>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Sent to {receiverName}</h3>
                          <span style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>{receiverRole}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {req.matchScore > 0 && (
                          <span style={{ backgroundColor: '#e0e7ff', color: 'var(--primary-color)', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: '700' }}>
                            {req.matchScore}% Match
                          </span>
                        )}
                        {getStatusBadge(req.status)}
                      </div>
                    </div>

                    {/* Skill Details */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '0.5rem', marginBottom: '1.25rem' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-light)', fontWeight: '600' }}>You Offered To Teach:</span>
                        <p style={{ fontWeight: '600', color: 'var(--primary-color)', marginTop: '0.2rem', fontSize: '0.95rem' }}>
                          {req.offeredSkill}
                        </p>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-light)', fontWeight: '600' }}>You Requested To Learn:</span>
                        <p style={{ fontWeight: '600', color: 'var(--secondary-color)', marginTop: '0.2rem', fontSize: '0.95rem' }}>
                          {req.requestedSkill}
                        </p>
                      </div>
                    </div>

                    {/* Message */}
                    {req.message && (
                      <div style={{ marginBottom: '1.5rem', padding: '0.75rem 1rem', backgroundColor: 'var(--white)', borderLeft: '3px solid var(--secondary-color)', fontSize: '0.9rem', color: 'var(--text-dark)' }}>
                        "{req.message}"
                      </div>
                    )}

                    {/* Footer / Cancel Action */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                        Sent on {new Date(req.createdAt).toLocaleDateString()}
                      </span>

                      {req.status === 'pending' && (
                        <button
                          onClick={() => handleCancel(req._id)}
                          disabled={processingId === req._id}
                          className="btn btn-ghost"
                          style={{ color: '#ef4444', fontSize: '0.85rem' }}
                        >
                          {processingId === req._id ? 'Cancelling...' : 'Cancel Request'}
                        </button>
                      )}

                      {req.status === 'accepted' && (
                        <button onClick={() => navigate('/matches')} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
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
