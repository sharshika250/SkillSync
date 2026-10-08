import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AddIcon, SearchIcon, HandshakeIcon, BrainIcon, ShieldCheckIcon, HeartHandshakeIcon } from '../components/Icons';
import { useSkillSync } from '../context/SkillSyncContext';

const Home = () => {
  const navigate = useNavigate();
  const { currentUser } = useSkillSync();

  return (
    <>
      {/* Hero Section */}
      <section id="home" className="hero">
        <h1>Exchange Skills.<br />Grow Together.</h1>
        <p>
          SkillSync connects people who can teach each other skills.
          Whether you want to learn programming in exchange for design lessons,
          or guitar for a new language, find your perfect learning partner here.
        </p>
        <div className="hero-actions">
          {currentUser ? (
            <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
              Go to Your Dashboard &rarr;
            </button>
          ) : (
            <button onClick={() => navigate('/explore')} className="btn btn-primary">
              Find Your Skill Match
            </button>
          )}
          <a href="#how-it-works" className="btn btn-secondary">How It Works</a>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="how-it-works" className="workflow">
        <h2 className="section-title">How It Works</h2>
        <div className="steps-container">
          <div 
            className="step-card" 
            style={{ cursor: 'pointer' }}
            onClick={() => navigate(currentUser ? '/profile' : '/register')}
          >
            <div className="step-icon">
              <AddIcon />
            </div>
            <h3>1. Add Your Skills</h3>
            <p>List the skills you want to learn and the skills you can offer to others.</p>
          </div>

          <div 
            className="step-card" 
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/explore')}
          >
            <div className="step-icon">
              <SearchIcon />
            </div>
            <h3>2. Find Your Match</h3>
            <p>Our intelligent system pairs you with users whose needs align perfectly with yours.</p>
          </div>

          <div 
            className="step-card" 
            style={{ cursor: 'pointer' }}
            onClick={() => navigate(currentUser ? '/requests' : '/explore')}
          >
            <div className="step-icon">
              <HandshakeIcon />
            </div>
            <h3>3. Exchange & Learn</h3>
            <p>Connect, collaborate, and grow together through mutually beneficial skill exchanges.</p>
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section id="explore" className="features">
        <h2 className="section-title">Why SkillSync?</h2>
        <div className="features-container">
          <div className="feature-item">
            <BrainIcon />
            <h3>Smart Skill Matching</h3>
            <p>Advanced semantic matching ensures you find the most relevant learning partners based on your specific goals.</p>
          </div>
          <div className="feature-item">
            <ShieldCheckIcon />
            <h3>Verified Skills</h3>
            <p>Build trust within the community through our robust peer-review and skill verification system.</p>
          </div>
          <div className="feature-item">
            <HeartHandshakeIcon />
            <h3>Trust-Based Connections</h3>
            <p>Fostering a supportive academic environment where students learn from and empower one another.</p>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
