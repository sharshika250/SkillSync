import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AddIcon, SearchIcon, HandshakeIcon, BrainIcon, ShieldCheckIcon, HeartHandshakeIcon, SparklesIcon } from '../components/Icons';
import { useSkillSync } from '../context/SkillSyncContext';

const Home = () => {
  const navigate = useNavigate();
  const { currentUser } = useSkillSync();

  return (
    <>
      {/* Hero Section */}
      <section id="home" className="hero">
        <div className="hero-pill">
          <SparklesIcon />
          <span>Intelligent Peer Skill Exchange Platform</span>
        </div>
        <h1>
          Exchange Skills.<br />
          <span className="highlight">Grow Together.</span>
        </h1>
        <p>
          Connect with trusted peers for reciprocal learning. Swap Python for UI design,
          system architecture for language fluency, and verify your expertise with automated assessments.
        </p>
        <div className="hero-actions">
          {currentUser ? (
            <button onClick={() => navigate('/dashboard')} className="btn btn-primary btn-lg">
              Go to Your Dashboard &rarr;
            </button>
          ) : (
            <button onClick={() => navigate('/explore')} className="btn btn-primary btn-lg">
              Find Your Skill Match
            </button>
          )}
          <a href="#how-it-works" className="btn btn-secondary btn-lg">
            How It Works
          </a>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="how-it-works" className="workflow">
        <h2 className="section-title">How SkillSync Works</h2>
        <p className="section-subtitle">
          Three simple steps to unlock continuous peer-to-peer learning and verified credentialing.
        </p>
        <div className="steps-container">
          <div 
            className="step-card" 
            style={{ cursor: 'pointer' }}
            onClick={() => navigate(currentUser ? '/profile' : '/register')}
          >
            <div className="step-icon">
              <AddIcon />
            </div>
            <h3>1. Declare & Verify Skills</h3>
            <p>List what you offer and what you want to learn. Validate your level with automated tests.</p>
          </div>

          <div 
            className="step-card" 
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/explore')}
          >
            <div className="step-icon" style={{ backgroundColor: '#EAE5F4', color: '#554471' }}>
              <SearchIcon />
            </div>
            <h3>2. 5-Factor Synergy Match</h3>
            <p>Our explainable algorithm pairs you with partners whose mutual needs and schedules align.</p>
          </div>

          <div 
            className="step-card" 
            style={{ cursor: 'pointer' }}
            onClick={() => navigate(currentUser ? '/requests' : '/explore')}
          >
            <div className="step-icon" style={{ backgroundColor: '#F8E9DF', color: '#8C5332' }}>
              <HandshakeIcon />
            </div>
            <h3>3. Exchange & Track Growth</h3>
            <p>Schedule interactive sessions, track learning roadmaps, and build verified reputation badges.</p>
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section id="explore" className="features">
        <h2 className="section-title">Why SkillSync?</h2>
        <p className="section-subtitle">
          Engineered for academic integrity, transparent compatibility, and measurable skill mastery.
        </p>
        <div className="features-container">
          <div className="feature-item">
            <div className="feature-icon-wrapper">
              <BrainIcon />
            </div>
            <h3>Explainable AI Matching</h3>
            <p>Understand exactly why a peer is a strong match through multi-factor synergy breakdowns.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon-wrapper" style={{ backgroundColor: '#F5E1E5', color: '#7A3D4C' }}>
              <ShieldCheckIcon />
            </div>
            <h3>Automated Skill Verification</h3>
            <p>Demonstrate knowledge through timed domain MCQs and sandboxed practical code execution.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon-wrapper" style={{ backgroundColor: '#F8E9DF', color: '#8C5332' }}>
              <HeartHandshakeIcon />
            </div>
            <h3>Dual-Confirmed Exchanges</h3>
            <p>Both learners confirm session completion before trust scores and reputation badges update.</p>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;