import React from 'react';
import { Link } from 'react-router-dom';
// Import component-specific styles
import '../styles/global.css';
import '../styles/LandingPage.css';

export default function LandingPage() {
  return (
    <div className="landing-container">
      <div className="landing-content">
        <h1>COMP 440 Online Store</h1>
        <p style={{ 
          fontSize: '1.1rem', 
          color: 'var(--gray-600)', 
          marginBottom: 'var(--spacing-xl)',
          lineHeight: '1.7'
        }}>
          Welcome to our modern marketplace where you can buy and sell items with confidence. 
          Join our community of users and discover amazing products!
        </p>
        
        <div className="landing-buttons">
          <Link to="/login" className="landing-btn landing-btn-primary">
            Sign In
          </Link>
          <Link to="/register" className="landing-btn landing-btn-secondary">
            Create Account
          </Link>
        </div>
        
        <div className="features-showcase">
          <h3 className="features-title">
            Features (Under Construction)
          </h3>
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-title"> Secure</div>
              <p className="feature-description">
                Protected user accounts
              </p>
            </div>
            <div className="feature-item">
              <div className="feature-title"> Search</div>
              <p className="feature-description">
                Find items by category
              </p>
            </div>
            <div className="feature-item">
              <div className="feature-title"> Reviews</div>
              <p className="feature-description">
                Rate and review items
              </p>
            </div>
          </div>
        </div>
        
        <div className="landing-footer">
          Built for COMP 440 Database Design • Summer 2025
        </div>
      </div>
    </div>
  );
}