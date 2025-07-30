import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Users from '../components/Users';
import NewItemForm from '../components/NewItemForm';
import ItemList from '../components/ItemList';
// Import optimized styles
import '../styles/global.css';
import '../styles/HomePage.css';

export default function HomePage() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ totalUsers: 0, recentActivity: 0 });
  const navigate = useNavigate();

  // Helper to redirect on 401
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

  const loadUser = async () => {
    try {
      const resp = await fetch('/api/auth/status', { credentials: 'include' });
      await checkAuth(resp);
      if (resp.ok) {
        const userData = await resp.json();
        setUser(userData);
      }
    } catch (err) {
      console.log('User loading failed:', err);
    }
  };

  useEffect(() => {
    loadStats();
    loadUser();
  }, []);

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
        const data = await resp.json();
        setError(data.message || 'Logout failed. Please try again.');
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
            <h1 className="dashboard-title"> Control Panel</h1>
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

        {/* Error Message */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* User Management Section */}
        <div className="user-management">
          <h3 className="section-title"> User Management</h3>
          <Users onStatsUpdate={loadStats} />
        </div>

        {/* Item Management Section */}
        <div className="item-management">
          <h3 className="section-title"> Item Management</h3>
          <div className="item-management-grid">
            <div className="item-form-section">
              <NewItemForm />
            </div>
            <div className="item-list-section">
              <ItemList />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
