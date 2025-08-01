import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NewItemForm from '../components/NewItemForm';
import ItemList from '../components/ItemList';
import SearchInterface from '../components/SearchInterface';
// Import organized styles - separated for better maintainability
import '../styles/global.css';
import '../styles/layout/HomePage.css';
import '../styles/components/SearchInterface.css';
import '../styles/components/ItemManagement.css';

export default function HomePage() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Helper to redirect on 401
  const checkAuth = resp => {
    if (resp.status === 401) {
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }
    return resp;
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
        {/* CENTERED HEADER - As Requested */}
        <div className="page-header">
          <h1 className="page-title">Item Management</h1>
          <p className="page-subtitle">
            Welcome back, <span className="user-name">{user?.firstName || 'Sara'}</span>! Manage your inventory below.
          </p>
        </div>

        {/* Error Message Display */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* PHASE 2: Search Interface - Optimized for Performance */}
        <div className="content-section">
          <SearchInterface />
        </div>

        {/* Section Divider for Visual Separation */}
        <div className="section-divider"></div>

        {/* ITEM MANAGEMENT: Vertical Layout (Form Above, List Below) */}
        <div className="item-management">
          <div className="item-management-layout">
            {/* New Item Form Section */}
            <div className="item-form-section">
              <NewItemForm />
            </div>
            
            {/* Item List Section - Enhanced with Collapse Feature */}
            <div className="item-list-section">
              <ItemList />
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM NAVIGATION - Sign Out Button Moved to Bottom as Requested */}
      <div className="bottom-navigation">
        <div className="bottom-nav-content">
          <div className="user-info">
            <div className="user-avatar">
              {(user?.firstName || 'S').charAt(0).toUpperCase()}
            </div>
            <span>Logged in as <strong>{user?.firstName || 'Sara'}</strong></span>
          </div>
          
          <button 
            onClick={handleLogout} 
            className="btn-logout"
            disabled={isLoading}
            title="Sign out of your account"
          >
            {isLoading ? (
              <>
                <span className="loading"></span>
                Signing out...
              </>
            ) : (
              <>
                {/* Logout Icon with improved sizing */}
                <svg className="logout-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                </svg>
                Sign Out
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
