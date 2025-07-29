import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Users from '../components/Users';

export default function HomePage() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ totalUsers: 0, recentActivity: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication and load user data
    // checkAuth();
    loadStats();
  }, []);

  const checkAuth = async () => {
    try {
      const resp = await fetch('/api/auth/status', { credentials: 'include' });
      if (resp.ok) {
        const userData = await resp.json();
        setUser(userData);
      } else {
        navigate('/login');
      }
    } catch (err) {
      navigate('/login');
    }
  };

  const loadStats = async () => {
    try {
      const resp = await fetch('/api/users/', { credentials: 'include' });
      if (resp.ok) {
        const users = await resp.json();
        setStats({
          totalUsers: users.length,
          recentActivity: users.filter(u => {
            const created = new Date(u.created_at || Date.now());
            const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            return created > dayAgo;
          }).length
        });
      }
    } catch (err) {
      console.log('Stats loading failed:', err);
    }
  };

  const handleLogout = async () => {
    setError('');
    setIsLoading(true);
    
    try {
      const resp = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (resp.ok) {
        navigate('/');
      } else {
        const { message } = await resp.json();
        setError(message || 'Logout failed');
      }
    } catch (err) {
      setError('Logout failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="wide-content-wrapper">
        {/* Enhanced Dashboard Header */}
        <div className="dashboard-header">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: 'var(--spacing-lg)'
          }}>
            <div style={{ flex: 1 }}>
              <h1 style={{ 
                margin: 0, 
                background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontSize: '2.5rem',
                fontWeight: '700'
              }}>
              Control Panel
              </h1>
              <p style={{ 
                margin: '8px 0 0 0', 
                color: 'var(--gray-600)', 
                fontSize: '1.1rem' 
              }}>
                Welcome back, <strong>{user?.firstName || 'Admin'}</strong>! Ready to manage your platform?
              </p>
            </div>
            
            <button 
              onClick={handleLogout} 
              className="btn btn-secondary"
              disabled={isLoading}
              style={{ 
                minWidth: '140px',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: 'white',
                border: 'none'
              }}
            >
              {isLoading ? (
                <>
                  <span className="loading"></span>
                  Signing out...
                </>
              ) : (
                'Sign Out'
              )}
            </button>
          </div>

          {/* Stats Cards */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: 'var(--spacing-lg)',
            marginTop: 'var(--spacing-lg)'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(99, 102, 241, 0.05))',
              padding: 'var(--spacing-lg)',
              borderRadius: 'var(--border-radius-lg)',
              border: '2px solid rgba(99, 102, 241, 0.1)',
              textAlign: 'center',
              animation: 'fadeInUp 0.6s ease-out 0.4s both'
            }}>
              <div style={{ 
                fontSize: '2rem', 
                fontWeight: '700', 
                color: 'var(--primary-color)',
                marginBottom: 'var(--spacing-xs)'
              }}>
                {stats.totalUsers}
              </div>
              <div style={{ color: 'var(--gray-600)', fontSize: '0.9rem' }}>
                Total Users
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))',
              padding: 'var(--spacing-lg)',
              borderRadius: 'var(--border-radius-lg)',
              border: '2px solid rgba(16, 185, 129, 0.1)',
              textAlign: 'center',
              animation: 'fadeInUp 0.6s ease-out 0.5s both'
            }}>
              <div style={{ 
                fontSize: '2rem', 
                fontWeight: '700', 
                color: 'var(--secondary-color)',
                marginBottom: 'var(--spacing-xs)'
              }}>
                {stats.recentActivity}
              </div>
              <div style={{ color: 'var(--gray-600)', fontSize: '0.9rem' }}>
                New Today
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.05))',
              padding: 'var(--spacing-lg)',
              borderRadius: 'var(--border-radius-lg)',
              border: '2px solid rgba(245, 158, 11, 0.1)',
              textAlign: 'center',
              animation: 'fadeInUp 0.6s ease-out 0.6s both'
            }}>
              <div style={{ 
                fontSize: '2rem', 
                fontWeight: '700', 
                color: 'var(--accent-color)',
                marginBottom: 'var(--spacing-xs)'
              }}>
                System
              </div>
              <div style={{ color: 'var(--gray-600)', fontSize: '0.9rem' }}>
                System Active
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-error" style={{ animation: 'shakeError 0.5s ease-in-out' }}>
             {error}
          </div>
        )}
        
        {/* Enhanced User Management Section */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: 'var(--border-radius-xl)',
          padding: 'var(--spacing-xl)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          animation: 'slideUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, var(--primary-color), var(--accent-color), var(--secondary-color))',
            backgroundSize: '200% 100%',
            animation: 'gradientShift 3s ease infinite'
          }} />
          
          <Users onStatsUpdate={loadStats} />
        </div>
      </div>
    </div>
  );
}