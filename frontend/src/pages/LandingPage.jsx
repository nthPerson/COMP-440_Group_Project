import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="page-container">
      <div className="content-wrapper" style={{ maxWidth: '600px', textAlign: 'center' }}>
        <h1> COMP 440 Online Store</h1>
        <p style={{ 
          fontSize: '1.1rem', 
          color: 'var(--gray-600)', 
          marginBottom: 'var(--spacing-xl)',
          lineHeight: '1.7'
        }}>
          Welcome to our modern marketplace where you can buy and sell items with confidence. 
          Join our community of users and discover amazing products!
        </p>
        
        <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-xl)' }}>
          <Link to="/login" className="btn btn-primary" style={{ flex: 1 }}>
            Sign In
          </Link>
          <Link to="/register" className="btn btn-secondary" style={{ flex: 1 }}>
            Create Account
          </Link>
        </div>
        
        <div style={{ 
          background: 'var(--gray-50)', 
          padding: 'var(--spacing-lg)', 
          borderRadius: 'var(--border-radius)',
          border: '1px solid var(--gray-200)',
          marginTop: 'var(--spacing-xl)'
        }}>
          <h3 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--gray-700)' }}>
             Features
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: 'var(--spacing-md)',
            textAlign: 'left'
          }}>
            <div>
              <strong style={{ color: 'var(--primary-color)' }}> Secure</strong>
              <p style={{ fontSize: '0.9rem', color: 'var(--gray-600)', margin: 0 }}>
                Protected user accounts
              </p>
            </div>
            <div>
              <strong style={{ color: 'var(--secondary-color)' }}> Search</strong>
              <p style={{ fontSize: '0.9rem', color: 'var(--gray-600)', margin: 0 }}>
                Find items by category
              </p>
            </div>
            <div>
              <strong style={{ color: 'var(--accent-color)' }}> Reviews</strong>
              <p style={{ fontSize: '0.9rem', color: 'var(--gray-600)', margin: 0 }}>
                Rate and review items
              </p>
            </div>
          </div>
        </div>
        
        <p style={{ 
          marginTop: 'var(--spacing-xl)', 
          fontSize: '0.9rem', 
          color: 'var(--gray-500)' 
        }}>
          Built for COMP 440 Database Design • Summer 2025
        </p>
      </div>
    </div>
  );
}