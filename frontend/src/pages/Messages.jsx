import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { communicationAPI } from '../services/api';
import { useSkillSync } from '../context/SkillSyncContext';

const Messages = () => {
  const { currentUser } = useSkillSync();
  const [searchParams] = useSearchParams();
  const initialPartnerId = searchParams.get('partnerId');

  const [conversations, setConversations] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (initialPartnerId && conversations.length > 0) {
      const match = conversations.find(c => String(c.partner._id) === String(initialPartnerId));
      if (match) {
        setSelectedPartner(match.partner);
      }
    }
  }, [initialPartnerId, conversations]);

  useEffect(() => {
    if (selectedPartner) {
      loadMessages(selectedPartner._id);
      const interval = setInterval(() => loadMessages(selectedPartner._id), 8000);
      return () => clearInterval(interval);
    }
  }, [selectedPartner]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const res = await communicationAPI.getConversations();
      if (res?.success) {
        setConversations(res.conversations || []);
        if (res.conversations.length > 0 && !selectedPartner && !initialPartnerId) {
          setSelectedPartner(res.conversations[0].partner);
        }
      }
    } catch (err) {
      console.warn('Error loading conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (partnerId) => {
    try {
      const res = await communicationAPI.getMessages(partnerId);
      if (res?.success) {
        setMessages(res.messages || []);
      }
    } catch (err) {
      console.warn('Error loading messages:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedPartner || sending) return;

    const content = newMessage.trim();
    setNewMessage('');
    try {
      setSending(true);
      const res = await communicationAPI.sendMessage(selectedPartner._id, content);
      if (res?.success) {
        setMessages(prev => [...prev, res.message]);
        await loadConversations();
      }
    } catch (err) {
      alert(err.message || 'Error delivering message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ padding: '3rem 6%', maxWidth: '1240px', margin: '0 auto' }}>

      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, margin: '0 0 0.35rem 0', color: '#39343A' }}>Exchange Messages</h1>
        <p style={{ color: '#89818A', margin: 0, fontSize: '0.98rem' }}>
          Communicate with your skill exchange partners, coordinate schedules, and share learning resources.
        </p>
      </div>

      <div className="card" style={{ padding: 0, display: 'grid', gridTemplateColumns: 'minmax(280px, 340px) 1fr', minHeight: '620px', overflow: 'hidden' }}>

        {/* Left: Conversations List */}
        <div style={{ borderRight: '1px solid #EFE7E9', display: 'flex', flexDirection: 'column', backgroundColor: '#FFFFFF' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #EFE7E9', fontWeight: 800, fontSize: '0.98rem', color: '#39343A' }}>
            Conversations ({conversations.length})
          </div>

          <div style={{ overflowY: 'auto', flex: 1 }}>
            {conversations.length === 0 ? (
              <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center', color: '#89818A', fontSize: '0.88rem' }}>
                No active conversations yet. Propose or accept an exchange to connect!
              </div>
            ) : (
              conversations.map(conv => {
                const isSelected = selectedPartner?._id === conv.partner?._id;
                return (
                  <div
                    key={conv.partner?._id}
                    onClick={() => setSelectedPartner(conv.partner)}
                    style={{
                      padding: '1.1rem 1.25rem',
                      borderBottom: '1px solid #F7F1F3',
                      backgroundColor: isSelected ? '#FDF4F6' : 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      transition: 'background 0.2s ease',
                      borderLeft: isSelected ? '3px solid #D99AAA' : '3px solid transparent'
                    }}
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: isSelected ? '#F5E1E5' : '#FFFBFA',
                        color: '#7A3D4C',
                        border: '1px solid #F2CBD5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.9rem'
                      }}
                    >
                      {conv.partner?.name ? conv.partner.name[0].toUpperCase() : 'U'}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#39343A' }}>
                          {conv.partner?.name}
                        </span>
                        {conv.unreadCount > 0 && (
                          <span style={{ backgroundColor: '#D99AAA', color: 'white', borderRadius: '50%', fontSize: '0.68rem', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#89818A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                        {conv.lastMessage?.content || conv.partner?.role || 'Active partner'}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Message Stream */}
        <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#FFFBFA' }}>
          {selectedPartner ? (
            <>
              {/* Partner Header */}
              <div style={{ padding: '1.1rem 1.75rem', backgroundColor: '#FFFFFF', borderBottom: '1px solid #EFE7E9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#F5E1E5', color: '#7A3D4C', border: '1px solid #F2CBD5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                    {selectedPartner.name ? selectedPartner.name[0].toUpperCase() : 'U'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.02rem', color: '#39343A' }}>{selectedPartner.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#89818A' }}>{selectedPartner.role || 'Skill Partner'} • {selectedPartner.email}</div>
                  </div>
                </div>
              </div>

              {/* Message List */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {messages.length === 0 ? (
                  <div style={{ textAlign: 'center', margin: 'auto', color: '#89818A', fontSize: '0.92rem' }}>
                    Send a message to introduce yourself and coordinate your skill exchange!
                  </div>
                ) : (
                  messages.map(msg => {
                    const isMine = String(msg.sender?._id || msg.sender) === String(currentUser._id || currentUser.id);
                    return (
                      <div
                        key={msg._id}
                        style={{
                          alignSelf: isMine ? 'flex-end' : 'flex-start',
                          maxWidth: '70%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isMine ? 'flex-end' : 'flex-start'
                        }}
                      >
                        <div
                          style={{
                            padding: '0.75rem 1.1rem',
                            borderRadius: isMine ? '1.1rem 1.1rem 0.2rem 1.1rem' : '1.1rem 1.1rem 1.1rem 0.2rem',
                            backgroundColor: isMine ? '#D99AAA' : '#FFFFFF',
                            color: isMine ? '#FFFFFF' : '#39343A',
                            border: isMine ? 'none' : '1px solid #EFE7E9',
                            fontSize: '0.94rem',
                            lineHeight: 1.55,
                            boxShadow: isMine ? 'var(--shadow-pink)' : 'var(--shadow-sm)'
                          }}
                        >
                          {msg.content}
                        </div>
                        <span style={{ fontSize: '0.7rem', color: '#89818A', marginTop: '3px' }}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendMessage} style={{ padding: '1.1rem 1.5rem', backgroundColor: '#FFFFFF', borderTop: '1px solid #EFE7E9', display: 'flex', gap: '0.75rem' }}>
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="form-input"
                  style={{ flex: 1 }}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={sending || !newMessage.trim()}
                  style={{ padding: '0.75rem 1.5rem' }}
                >
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </form>
            </>
          ) : (
            <div style={{ textAlign: 'center', margin: 'auto', color: '#89818A', padding: '2rem' }}>
              Select a conversation from the left to start messaging.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default Messages;
