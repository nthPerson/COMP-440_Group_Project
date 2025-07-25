import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Users from '../components/Users';

export default function HomePage() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    setError('');
    setIsLoading(true);
    
    try {
      const resp = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (resp.ok) {
        navigate('/');  // Go back to the Landing Page upon logout
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
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: 'var(--spacing-xl)',
          paddingBottom: 'var(--spacing-lg)',
          borderBottom: '2px solid var(--gray-200)'
        }}>
          <div>
            <h1 style={{ margin: 0 }}>Dashboard</h1>
            <p style={{ margin: 0, color: 'var(--gray-600)' }}>
              Manage users and explore the platform
            </p>
          </div>
          
          <button 
            onClick={handleLogout} 
            className="btn btn-secondary"
            disabled={isLoading}
            style={{ minWidth: '120px' }}
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

        {error && <div className="alert alert-error">{error}</div>}
        
        <Users />
      </div>
    </div>
  );
}