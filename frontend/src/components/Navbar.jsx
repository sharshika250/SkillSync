import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogoIcon } from './Icons';
import { useSkillSync } from '../context/SkillSyncContext';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useSkillSync();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const initials = currentUser?.name
    ? currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U';

  return (
    <nav className="navbar">
      <Link to={currentUser ? "/dashboard" : "/"} className="logo" style={{ textDecoration: 'none' }}>
        <LogoIcon />
        <span>SkillSync</span>
      </Link>

      <button
        className="mobile-menu-btn"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle navigation menu"
      >
        <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>☰</span>
      </button>

      <ul className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        {currentUser ? (
          <>
            <li>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                style={{ color: isActive('/dashboard') ? 'var(--primary-color)' : undefined, fontWeight: isActive('/dashboard') ? '700' : undefined }}
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/explore"
                onClick={() => setMobileMenuOpen(false)}
                style={{ color: isActive('/explore') ? 'var(--primary-color)' : undefined, fontWeight: isActive('/explore') ? '700' : undefined }}
              >
                Explore Skills
              </Link>
            </li>
            <li>
              <Link
                to="/matches"
                onClick={() => setMobileMenuOpen(false)}
                style={{ color: isActive('/matches') ? 'var(--primary-color)' : undefined, fontWeight: isActive('/matches') ? '700' : undefined }}
              >
                Matches
              </Link>
            </li>
            <li>
              <Link
                to="/requests"
                onClick={() => setMobileMenuOpen(false)}
                style={{ color: isActive('/requests') ? 'var(--primary-color)' : undefined, fontWeight: isActive('/requests') ? '700' : undefined }}
              >
                Requests
              </Link>
            </li>
            <li>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                style={{ color: isActive('/profile') ? 'var(--primary-color)' : undefined, fontWeight: isActive('/profile') ? '700' : undefined }}
              >
                My Profile
              </Link>
            </li>
          </>
        ) : (
          <>
            <li><Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link></li>
            <li><Link to="/explore" onClick={() => setMobileMenuOpen(false)}>Explore Skills</Link></li>
            <li><a href="/#how-it-works" onClick={() => setMobileMenuOpen(false)}>How It Works</a></li>
          </>
        )}
      </ul>

      <div className={`nav-actions ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        {currentUser ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link
              to="/profile"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                textDecoration: 'none',
                color: 'var(--text-dark)',
                fontWeight: '600',
                fontSize: '0.9rem'
              }}
              onClick={() => setMobileMenuOpen(false)}
            >
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-color)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                  fontWeight: 'bold'
                }}
              >
                {initials}
              </div>
              <span className="navbar-username" style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentUser.name}
              </span>
            </Link>
            <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}>
              Logout
            </button>
          </div>
        ) : (
          <>
            <button onClick={() => { setMobileMenuOpen(false); navigate('/login'); }} className="btn btn-ghost">Login</button>
            <button onClick={() => { setMobileMenuOpen(false); navigate('/register'); }} className="btn btn-primary">Get Started</button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
