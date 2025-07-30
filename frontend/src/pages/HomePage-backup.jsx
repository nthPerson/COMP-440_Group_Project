import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Users from '../components/Users';
// Import optimized styles
import '../styles/global-optimized.css';
import '../styles/HomePage.css';

export default function HomePage() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ totalUsers: 0, recentActivity: 0 });
  const navigate = useNavigate();

  // // helper to redirect on 401
  const checkAuth = resp => {
      if (resp.status === 401) {
          window.location.href = '/login';
          throw new Error('Unauthorized');
      }
      return resp;
  };

  const loadStats = async () => {
    try {
      const resp = await fetch('/api/users/', { credentials: 'include' });
      await checkAuth(resp);
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

  // Hook: fetch stats on page load (TODO: Consider removing all program logic out of HomePage.jsx and into component files)
  useEffect(() => {
    loadStats();
  }, []);

  // Called after a new item is created
  const handleItemCreated = () => {
    loadStats();
  }

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
    <div className="dashboard-container">
      <div className="dashboard-content">
        {/* Enhanced Dashboard Header */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">🏪 Control Panel</h1>
            <p className="dashboard-user-info">
              Welcome back, <strong>{user?.firstName || 'Admin'}</strong>! Ready to manage your platform?
            </p>
          </div>
          
          <button 
            onClick={handleLogout} 
            className="btn-logout"
            disabled={isLoading}
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
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.totalUsers}</div>
            <div className="stat-label">Total Users</div>
          </div>

          <div className="stat-card">
            <div className="stat-value">{stats.recentActivity}</div>
            <div className="stat-label">Recent Activity</div>
          </div>
        </div>
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

        {/* New Item Creation Form and List */}
        <div style={{ margin: '2rem 0', padding: '1rem', border: '1px solid #ddd' }}>
          <NewItemForm onItemCreated={handleItemCreated} />
          <ItemList />
        </div>
        
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