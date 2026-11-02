import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogoIcon, BellIcon, AwardIcon, BookOpenIcon, ChatIcon } from './Icons';
import { useSkillSync } from '../context/SkillSyncContext';
import { communicationAPI } from '../services/api';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useSkillSync();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);

  const fetchNotifications = async () => {
    if (!currentUser) return;
    try {
      const res = await communicationAPI.getNotifications();
      if (res?.success) {
        setNotifications(res.notifications || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch {
      // Quiet fail if offline
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 25000);
    return () => clearInterval(interval);
  }, [currentUser]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await communicationAPI.markAllNotificationsRead();
      setUnreadCount(0);
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch {
      // Ignore
    }
  };

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const initials = currentUser?.name
    ? currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U';

  const isAdmin = currentUser?.isAdmin || currentUser?.role === 'Admin';

  const linkStyle = (path) => ({
    padding: '0.45rem 0.85rem',
    borderRadius: '9999px',
    fontSize: '0.9rem',
    fontWeight: isActive(path) ? '700' : '500',
    color: isActive(path) ? '#39343A' : '#89818A',
    backgroundColor: isActive(path) ? '#F5E1E5' : 'transparent',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    transition: 'all 0.2s ease',
    textDecoration: 'none'
  });

  return (
    <nav className="navbar">
      <Link to={currentUser ? "/dashboard" : "/"} className="logo" style={{ textDecoration: 'none' }}>
        <div className="logo-icon">
          <LogoIcon />
        </div>
        <span style={{ color: '#39343A', fontWeight: 800 }}>SkillSync</span>
      </Link>

      <button
        className="mobile-menu-btn"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle navigation menu"
      >
        <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>☰</span>
      </button>

      <ul className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        {currentUser ? (
          <>
            <li>
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} style={linkStyle('/dashboard')}>
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/explore" onClick={() => setMobileMenuOpen(false)} style={linkStyle('/explore')}>
                Explore
              </Link>
            </li>
            <li>
              <Link to="/assessments" onClick={() => setMobileMenuOpen(false)} style={linkStyle('/assessments')}>
                <AwardIcon /> Verification
              </Link>
            </li>
            <li>
              <Link to="/matches" onClick={() => setMobileMenuOpen(false)} style={linkStyle('/matches')}>
                Matches
              </Link>
            </li>
            <li>
              <Link to="/requests" onClick={() => setMobileMenuOpen(false)} style={linkStyle('/requests')}>
                Requests
              </Link>
            </li>
            <li>
              <Link to="/learning" onClick={() => setMobileMenuOpen(false)} style={linkStyle('/learning')}>
                <BookOpenIcon /> Learning
              </Link>
            </li>
            <li>
              <Link to="/messages" onClick={() => setMobileMenuOpen(false)} style={linkStyle('/messages')}>
                <ChatIcon /> Messages
              </Link>
            </li>
            {isAdmin && (
              <li>
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    color: '#7A3D4C',
                    fontWeight: '700',
                    backgroundColor: '#F5E1E5',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.82rem',
                    textDecoration: 'none',
                    border: '1px solid #F2CBD5'
                  }}
                >
                  Admin
                </Link>
              </li>
            )}
          </>
        ) : (
          <>
            <li><Link to="/" onClick={() => setMobileMenuOpen(false)} style={linkStyle('/')}>Home</Link></li>
            <li><Link to="/explore" onClick={() => setMobileMenuOpen(false)} style={linkStyle('/explore')}>Explore Skills</Link></li>
            <li><a href="/#how-it-works" onClick={() => setMobileMenuOpen(false)} style={linkStyle('/#how-it-works')}>How It Works</a></li>
          </>
        )}
      </ul>

      <div className={`nav-actions ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        {currentUser ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>

            {/* Notification Bell Dropdown */}
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                style={{
                  background: notificationsOpen ? '#F5E1E5' : 'white',
                  border: '1px solid #EFE7E9',
                  borderRadius: '50%',
                  width: '38px',
                  height: '38px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  color: '#39343A',
                  boxShadow: '0 2px 6px rgba(57, 52, 58, 0.04)',
                  transition: 'all 0.2s ease'
                }}
                aria-label="View notifications"
              >
                <BellIcon />
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-2px',
                      right: '-2px',
                      backgroundColor: '#D99AAA',
                      color: 'white',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      borderRadius: '50%',
                      width: '18px',
                      height: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 4px rgba(217, 154, 170, 0.4)'
                    }}
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '46px',
                    right: 0,
                    width: '320px',
                    maxHeight: '400px',
                    overflowY: 'auto',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '1rem',
                    border: '1px solid #EFE7E9',
                    boxShadow: '0 12px 32px rgba(57, 52, 58, 0.08)',
                    zIndex: 200,
                    padding: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid #EFE7E9', paddingBottom: '0.5rem' }}>
                    <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#39343A' }}>Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        style={{ background: 'none', border: 'none', color: '#D99AAA', fontSize: '0.75rem', cursor: 'pointer', fontWeight: '600' }}
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '1.5rem', color: '#89818A', fontSize: '0.85rem' }}>
                      No notifications yet
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {notifications.map(n => (
                        <div
                          key={n._id}
                          style={{
                            padding: '0.65rem 0.75rem',
                            borderRadius: '0.75rem',
                            backgroundColor: n.read ? '#FFFBFA' : '#FDF4F6',
                            border: `1px solid ${n.read ? '#EFE7E9' : '#F2CBD5'}`,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onClick={() => {
                            if (n.link) navigate(n.link);
                            setNotificationsOpen(false);
                          }}
                        >
                          <div style={{ fontWeight: '700', color: '#39343A' }}>{n.title}</div>
                          <div style={{ color: '#89818A', marginTop: '2px', fontSize: '0.76rem' }}>{n.message}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <Link
              to="/profile"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                textDecoration: 'none',
                color: '#39343A',
                fontWeight: '600',
                fontSize: '0.9rem'
              }}
              onClick={() => setMobileMenuOpen(false)}
            >
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #EFE7E9' }}
                />
              ) : (
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    backgroundColor: '#F5E1E5',
                    color: '#7A3D4C',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    border: '1px solid #F2CBD5'
                  }}
                >
                  {initials}
                </div>
              )}
              <span className="navbar-username" style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentUser.name}
              </span>
            </Link>
            <button onClick={handleLogout} className="btn btn-secondary btn-sm">
              Logout
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <button onClick={() => { setMobileMenuOpen(false); navigate('/login'); }} className="btn btn-ghost btn-sm">Login</button>
            <button onClick={() => { setMobileMenuOpen(false); navigate('/register'); }} className="btn btn-primary btn-sm">Get Started</button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
